/**
 * lib/ausha-rss.ts
 * Fetcher + parser du flux RSS Ausha de Dance Lab.
 *
 * Source : https://feed.ausha.co/yvVqGgCrEkqK
 *
 * Aucune dépendance externe — le parsing XML est fait manuellement
 * pour rester compatible avec l'environnement Edge / Node.js de Next.js
 * sans alourdir le bundle.
 */

export type RssEpisode = {
  /** Numéro de l'épisode extrait du titre (ex : 122) */
  number: number
  /** Titre de l'épisode sans le préfixe numéroté */
  title: string
  /** Nom de l'invité extrait de "avec Prénom Nom" dans le titre */
  guest: string
  /** Durée au format lisible (ex : "1 h 20" ou "15 min") */
  duration: string
  /** Date de publication ISO 8601 */
  pubDate: string
  /** URL de l'épisode sur Ausha */
  link: string
  /** Slug extrait du lien Ausha (ex : "122-avec-mylene-amboka") */
  aushaSlug: string
  /** URL de l'image épisode sur le CDN Ausha */
  aushaImage: string
  /** Description courte (itunes:subtitle) */
  subtitle: string
  /** Description complète (description, texte brut sans HTML) */
  description: string
  /**
   * Citation mise en valeur : première phrase en <b>…</b> de la description.
   * C'est la question d'accroche éditoriale placée en tête de chaque épisode.
   */
  quote: string
  /** URL du fichier audio MP3 direct (tag <enclosure>) */
  audioUrl: string
  /**
   * Identifiant interne Ausha de l'épisode (tag <guid>).
   */
  guid: string
  /**
   * Identifiant Spotify de l'épisode (ex : "1aHJlEfCHVamG7Y62uEuhb").
   * Récupéré automatiquement depuis la smartlink Ausha. null si absent/indisponible.
   */
  spotifyId: string | null
  /**
   * URL de l'embed Spotify prête à l'emploi.
   * Format : https://open.spotify.com/embed/episode/{spotifyId}?utm_source=generator
   * Vide si spotifyId est null.
   */
  spotifyEmbedUrl: string
  /** Liens d'écoute détectés sur la smartlink Ausha. */
  platformLinks: EpisodePlatformLinks
  /** Chapitres Podcasting 2.0 fournis par Ausha, lorsqu'ils existent. */
  chapters: EpisodeChapter[]
  /** true si c'est un EXTRAIT (court clip promotionnel) */
  isExtrait: boolean
}

export type EpisodeChapter = { time: string; title: string; url?: string }

export type EpisodePlatformLinks = {
  spotify?: string
  apple?: string
  deezer?: string
  amazonMusic?: string
  podcastAddict?: string
  pocketCasts?: string
  castro?: string
}

// ─── Constantes ───────────────────────────────────────────────────────────────

const RSS_URL   = 'https://feed.ausha.co/yvVqGgCrEkqK'
/** ID Ausha du podcast (extrait de l'URL du flux RSS) */
export const AUSHA_PODCAST_ID = 'yvVqGgCrEkqK'

/** Revalidation ISR : les données sont rafraîchies au plus toutes les heures */
export const RSS_REVALIDATE = 3600

// ─── Helpers date ─────────────────────────────────────────────────────────────

/**
 * Normalise n'importe quel format de date en YYYY-MM-DD.
 *
 * Formats pris en charge :
 *   - RFC 2822 RSS  : "Mon, 03 Aug 2026 22:26:50 +0000"  → "2026-08-03"
 *   - ISO 8601 full : "2026-08-03T22:26:50Z"              → "2026-08-03"
 *   - ISO date seule: "2026-08-03"                        → "2026-08-03"
 *
 * Utilise les valeurs UTC pour éviter tout décalage de fuseau horaire.
 * Retourne une chaîne vide si la date est non parseable.
 */
function normalizeRssDate(raw: string): string {
  if (!raw) return ''
  // Déjà au format YYYY-MM-DD (avec ou sans suffixe heure)
  const isoMatch = raw.match(/^(\d{4}-\d{2}-\d{2})/)
  if (isoMatch) return isoMatch[1]
  // Tout autre format (RFC 2822, etc.) : déléguer au moteur JS
  try {
    const d = new Date(raw)
    if (isNaN(d.getTime())) return ''
    const y = d.getUTCFullYear()
    const m = String(d.getUTCMonth() + 1).padStart(2, '0')
    const day = String(d.getUTCDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  } catch {
    return ''
  }
}

// ─── Helpers XML ──────────────────────────────────────────────────────────────

/** Extrait le contenu d'un tag XML simple (non-CDATA, premier match) */
function extractTag(xml: string, tag: string): string {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i')
  return xml.match(re)?.[1]?.trim() ?? ''
}

/** Extrait la valeur d'un attribut nommé dans un tag */
function extractAttr(xml: string, tag: string, attr: string): string {
  const re = new RegExp(`<${tag}[^>]*\\s${attr}="([^"]*)"`, 'i')
  return xml.match(re)?.[1]?.trim() ?? ''
}

/** Supprime les balises HTML/XML d'une chaîne */
function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/**
 * Supprime le boilerplate récurrent en fin de description Ausha :
 *   • Blocs 👉🏽 (liens réseaux sociaux, épisodes mentionnés…)
 *   • CTA "Si cet épisode t'a plu…"
 *   • Date d'enregistrement [Cet épisode a été enregistré…]
 *   • Mention d'hébergement "Hébergé par Ausha…"
 *   • Artefact XML résiduel ]]>
 */
function cleanDescription(text: string): string {
  // Tout ce qui suit le premier 👉 est du boilerplate
  const cutIndex = text.indexOf('👉')
  const body = cutIndex > 0 ? text.slice(0, cutIndex) : text

  return body
    .replace(/^\s*\]\]>\s*$/gm, '')          // artefact XML
    .replace(/\[Cet épisode[^\]]*\]/gi, '')              // date d'enregistrement
    .replace(/Hébergé par Ausha\.[^\n]*/gi, '')          // mention hébergeur
    .replace(/Si cet épisode[^\n]*/gi, '')               // CTA partage
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/**
 * Extrait la première phrase en <b>…</b> de la description HTML.
 * C'est la question d'accroche éditoriale (ex : "Comment est-ce qu'on parvient…").
 * Retourne une chaîne vide si absent.
 */
function extractBoldQuote(html: string): string {
  const match = html.match(/<b>([\s\S]*?)<\/b>/i)
  if (!match) return ''
  return stripHtml(match[1]).trim()
}

// ─── Formatage de la durée ─────────────────────────────────────────────────

/**
 * Convertit "1:20:06" → "1 h 20"  |  "15:03" → "15 min"
 */
function formatDuration(raw: string): string {
  const parts = raw.split(':').map(Number)
  if (parts.length === 3) {
    const [h, m] = parts
    if (h > 0) return `${h} h ${m > 0 ? String(m).padStart(2, '0') : ''}`.trim()
    return `${m} min`
  }
  if (parts.length === 2) {
    const [m, s] = parts
    if (m === 0) return `${s} s`
    return `${m} min`
  }
  return raw
}

function formatChapterTime(raw: string): string {
  if (!raw) return ''
  if (/^\d{1,2}:\d{2}(?::\d{2})?$/.test(raw)) return raw
  const seconds = Number(raw)
  if (!Number.isFinite(seconds)) return raw
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const rest = Math.floor(seconds % 60)
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`
    : `${minutes}:${String(rest).padStart(2, '0')}`
}

/** Parse les chapitres intégrés au RSS (Podcasting 2.0 / PSC). */
export function parseRssChapters(itemXml: string): EpisodeChapter[] {
  const container = extractTag(itemXml, 'psc:chapters') || extractTag(itemXml, 'podcast:chapters')
  const source = container || itemXml
  const chapterTags = source.match(/<(?:psc:chapter|podcast:chapter)\b[^>]*\/?\s*>/gi) ?? []
  return chapterTags.flatMap((tag) => {
    const start = tag.match(/\b(?:start|startTime)="([^"]+)"/i)?.[1] ?? ''
    const title = tag.match(/\btitle="([^"]+)"/i)?.[1] ?? ''
    const url = tag.match(/\b(?:href|url)="([^"]+)"/i)?.[1]
    if (!start || !title) return []
    return [{ time: formatChapterTime(start), title: stripHtml(title), ...(url ? { url } : {}) }]
  })
}

// ─── Parsing du titre ─────────────────────────────────────────────────────────

function parseTitle(raw: string): {
  number: number
  title: string
  guest: string
  isExtrait: boolean
} {
  const numMatch = raw.match(/^(\d+)\.\s*/)
  const number = numMatch ? parseInt(numMatch[1], 10) : 0
  let rest = numMatch ? raw.slice(numMatch[0].length) : raw

  const isExtrait = /^EXTRAIT\b/i.test(rest)

  // Cas 1 : ", avec Prénom Nom" (virgule — format standard Ausha)
  // Cas 2 : " avec DANC.R" (sans virgule — nom commence par une majuscule)
  //         La majuscule distingue le suffixe invité ("avec DANC.R")
  //         du sujet du titre ("avec le coeur", "avec ses jambes"…)
  const guestMatch =
    rest.match(/,\s*avec\s+(.+)$/i) ??
    rest.match(/\s+avec\s+([A-ZÀÂÄÉÈÊËÎÏÔÙÛÜÆŒ].+)$/)
  const guest = guestMatch ? guestMatch[1].trim() : ''
  if (guestMatch) {
    rest = rest.slice(0, rest.length - guestMatch[0].length)
  }

  let title = rest
    .replace(/^EXTRAIT\s*[-–]\s*/i, '')
    .replace(/^["«"]|["»"]$/g, '')
    .trim()
  title = title.replace(/,\s*$/, '').trim()

  return { number, title, guest, isExtrait }
}

/** Reconnaît uniquement les libellés de secours, jamais un vrai nom. */
export function isGenericGuestLabel(value: string | null | undefined): boolean {
  if (!value) return true
  const normalized = value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('fr')
    .replace(/[^a-z]/g, '')
  return ['invite', 'invitee', 'invites', 'invitees'].includes(normalized)
}

function normalizeGuestCandidate(value: string): string {
  return stripHtml(value)
    .replace(/^[\s:,-]+|[\s:,-]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function isReliableGuestCandidate(value: string): boolean {
  if (!value || isGenericGuestLabel(value) || value.length > 100) return false
  const words = value.split(/\s+/)
  if (words.length > 10) return false
  // Au moins un nom propre, sigle ou nom artistique identifiable.
  return words.some((word) => /^\p{Lu}[\p{L}'’.-]{1,}$/u.test(word) || /^\p{Lu}{2,}$/u.test(word))
}

/**
 * Recherche prudente d'un nom dans les formulations éditoriales habituelles
 * d'Ausha. Cette fonction n'est appelée que lorsque le titre ne fournit aucun
 * invité et refuse les phrases longues ou sans nom propre.
 */
export function extractGuestFromDescription(description: string): string {
  if (!description) return ''
  const intro = description.slice(0, 1800)
  const patterns = [
    /(?:je\s+reçois|j['’]accueille|nous\s+recevons|nous\s+accueillons)\s+(.+?)(?=,|\n|\.\s)/iu,
    /(?:conversation|épisode|entretien)\s+avec\s+(.+?)(?=,|\n|\.\s|\s+pour\s|\s+qui\s)/iu,
    /^[\p{Emoji_Presentation}\p{Extended_Pictographic}✨🎤]*\s*([^\n–—|]{3,100})\s*[–—|]/mu,
  ]

  for (const pattern of patterns) {
    const raw = intro.match(pattern)?.[1] ?? ''
    // Certaines introductions placent une qualification avant les noms :
    // "mes invitées : Prénom Nom et Prénom Nom".
    const candidate = normalizeGuestCandidate(raw.split(/\s*:\s*/).pop() ?? raw)
    if (isReliableGuestCandidate(candidate)) return candidate
  }
  return ''
}

// ─── Détection automatique du lien Spotify ────────────────────────────────────

/**
 * Récupère l'identifiant Spotify d'un épisode depuis sa page smartlink Ausha.
 *
 * La page smartlink contient un bouton "Écouter sur Spotify" dont le lien
 * pointe vers `open.spotify.com/episode/{id}`. On le distingue des simples
 * liens en texte (épisodes mentionnés dans la description) grâce à la classe
 * CSS "ListeningLink" présente dans son contenu immédiat.
 *
 * Timeout : 5 s — retourne null silencieusement en cas d'erreur réseau.
 * Cache Next.js : 24 h (l'ID Spotify d'un épisode ne change jamais).
 */
async function fetchPlatformLinks(aushaSlug: string): Promise<EpisodePlatformLinks> {
  try {
    const controller = new AbortController()
    const timerId    = setTimeout(() => controller.abort(), 5000)

    const res = await fetch(
      `https://smartlink.ausha.co/dance-lab/${aushaSlug}`,
      {
        signal: controller.signal,
        // L'ID Spotify d'un épisode est permanent → cache long
        next: { revalidate: 86400, tags: ['ausha-episodes'] },
      },
    )
    clearTimeout(timerId)

    if (!res.ok) return {}
    const html = await res.text()
    const links = [...html.matchAll(/href="(https?:\/\/[^"#]+)"/gi)]
      .map((match) => match[1].replace(/&amp;/g, '&'))
    const find = (pattern: RegExp) => links.find((link) => pattern.test(link))
    return {
      spotify: find(/open\.spotify\.com\/episode\//i),
      apple: find(/podcasts\.apple\.com\//i),
      deezer: find(/(?:www\.)?deezer\.com\//i),
      amazonMusic: find(/music\.amazon\.[^/]+\/podcasts\//i),
      podcastAddict: find(/podcastaddict\.com\//i),
      pocketCasts: find(/pocketcasts\.com\//i),
      castro: find(/castro\.fm\//i),
    }
  } catch {
    return {}
  }
}

// ─── Détection des rediffusions ───────────────────────────────────────────────

/**
 * Indique si un titre d'épisode (brut ou nettoyé) est une rediffusion.
 *
 * Règle : le titre commence par le mot exact "REDIFFUSION" (insensible à la
 * casse, tolérant aux espaces en début de chaîne), suivi d'une limite de mot
 * (\b) — ce qui exclut "REDIFFUSIONS".
 *
 * Exemples EXCLUS (retourne true) :
 *   "REDIFFUSION - 45. Titre"   → true
 *   "Rediffusion : Titre"        → true
 *   "rediffusion Titre"          → true
 *   "  REDIFFUSION - Titre"      → true   (espaces en tête tolérés)
 *
 * Exemples NON exclus (retourne false) :
 *   "REDIFFUSIONS Titre"         → false  (mot différent : "REDIFFUSIONS")
 *   "45. REDIFFUSION - Titre"    → false  (ne commence pas par "REDIFFUSION")
 *   "Nouvel épisode - Titre"     → false
 *   ""                           → false
 */
export function isRediffusion(title: string): boolean {
  return /^\s*REDIFFUSION\b/i.test(title)
}

// ─── Fetcher principal ────────────────────────────────────────────────────────

export async function getEpisodesFromRSS(
  includeExtraits = false,
): Promise<RssEpisode[]> {
  const res = await fetch(RSS_URL, {
    next: { revalidate: RSS_REVALIDATE, tags: ['ausha-episodes'] },
  })

  if (!res.ok) {
    throw new Error(`Impossible de récupérer le flux RSS Ausha (${res.status})`)
  }

  const xml = await res.text()
  const itemMatches = xml.match(/<item>[\s\S]*?<\/item>/g) ?? []

  // ── Filtre rediffusions (sur le titre brut, avant tout parsing) ─────────────
  // Un titre commençant par "REDIFFUSION" correspond à un épisode déjà publié
  // sur le site. On l'élimine ici — le plus tôt possible — pour qu'il ne
  // pénètre dans aucun composant du site (liste, carrousel, dernier épisode…).
  const nonRediffusionItems = itemMatches.filter((item) => {
    const rawTitle = extractTag(item, 'title')
    return !isRediffusion(rawTitle)
  })

  // Parse tous les items restants (épisodes complets + extraits) pour pouvoir
  // utiliser le titre de l'extrait comme citation de fallback.
  const allParsed = nonRediffusionItems.map((item) => {
    const rawTitle = extractTag(item, 'title')
    const parsedTitle = parseTitle(rawTitle)
    const { number, title, isExtrait } = parsedTitle

    const rawDuration = extractTag(item, 'itunes:duration')
    const duration = formatDuration(rawDuration)

    const link = extractTag(item, 'link') || extractAttr(item, 'link', 'href')
    const aushaSlug = link.split('/').filter(Boolean).pop() ?? ''

    const aushaImage =
      extractAttr(item, 'itunes:image', 'href') ||
      extractAttr(item, 'googleplay:image', 'href')

    const subtitle = extractTag(item, 'itunes:subtitle')

    // Description complète — préférer content:encoded, fallback description
    const descRaw =
      extractTag(item, 'content:encoded') ||
      extractTag(item, 'description')

    // Citation = première phrase en <b>…</b> (question d'accroche)
    const quote = extractBoldQuote(descRaw)

    // Texte brut complet, sans boilerplate Ausha
    const description = cleanDescription(stripHtml(descRaw))
    const guest = isGenericGuestLabel(parsedTitle.guest)
      ? extractGuestFromDescription(description)
      : parsedTitle.guest

    // pubDate normalisé en YYYY-MM-DD dès le parsing RSS
    const pubDate = normalizeRssDate(extractTag(item, 'pubDate'))

    // Fichier audio direct (tag <enclosure>)
    const audioUrl = extractAttr(item, 'enclosure', 'url')

    // Identifiant interne Ausha (tag <guid>)
    const guid = extractTag(item, 'guid')
    const chapters = parseRssChapters(item)

    return {
      number,
      title,
      guest,
      duration,
      pubDate,
      link,
      aushaSlug,
      aushaImage,
      subtitle,
      description,
      quote,
      audioUrl,
      guid,
      spotifyId:       null,
      spotifyEmbedUrl: '',
      platformLinks:   {},
      chapters,
      isExtrait,
    } satisfies RssEpisode
  })

  // Construit une map numéro d'épisode → citation extraite du titre de l'extrait.
  // Format extrait : "126. EXTRAIT - "La citation ici", avec Invité"
  // → après parseTitle, le champ `title` de l'extrait contient directement la citation.
  const extraitQuoteMap = new Map<number, string>()
  for (const ep of allParsed) {
    if (ep.isExtrait && ep.number > 0 && ep.title) {
      extraitQuoteMap.set(ep.number, ep.title)
    }
  }

  const episodes: RssEpisode[] = allParsed
    .filter((ep) => ep.number > 0 && (includeExtraits || !ep.isExtrait) && !isRediffusion(ep.title))
    .map((ep) => ({
      ...ep,
      // Si la description n'a pas de <b>…</b>, on utilise le titre de l'extrait
      // correspondant comme citation — c'est la phrase clé prononcée dans l'épisode.
      quote: ep.quote || extraitQuoteMap.get(ep.number) || '',
    }))
    .sort((a, b) => b.number - a.number)

  // ── Détection Spotify en parallèle ──────────────────────────────────────────
  // On récupère l'ID Spotify de chaque épisode depuis sa smartlink Ausha.
  // Promise.allSettled garantit qu'une erreur sur un épisode ne bloque pas les autres.
  const spotifyResults = await Promise.allSettled(
    episodes.map((ep) => fetchPlatformLinks(ep.aushaSlug)),
  )

  return episodes.map((ep, i) => {
    const result    = spotifyResults[i]
    const platformLinks = result.status === 'fulfilled' ? result.value : {}
    const spotifyId = platformLinks.spotify?.match(/\/episode\/([A-Za-z0-9]+)/i)?.[1] ?? null
    return {
      ...ep,
      spotifyId,
      platformLinks,
      spotifyEmbedUrl: spotifyId
        ? `https://open.spotify.com/embed/episode/${spotifyId}?utm_source=generator`
        : '',
    }
  })
}

// ─── Helpers publics ──────────────────────────────────────────────────────────

/**
 * Construit l'URL de l'embed player Ausha pour un épisode.
 *
 * Le paramètre `podcastId` de l'embed n'est PAS l'ID du podcast Ausha,
 * mais l'identifiant du fichier audio, extrait de l'URL `<enclosure>` :
 *   https://audio.ausha.co/D3EkKCMdrrDp.mp3?t=… → D3EkKCMdrrDp
 *
 * Format : https://player.ausha.co?podcastId={audioFileId}&v=2
 */
export function aushaEmbedUrl(audioUrl: string): string {
  const match = audioUrl.match(/\/([A-Za-z0-9]+)\.mp3/)
  const fileId = match?.[1] ?? ''
  if (!fileId) return ''
  return `https://player.ausha.co?podcastId=${fileId}&v=2`
}

export type Episode = RssEpisode & {
  image: string
  slug: string
}
