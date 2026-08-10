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
   * Utilisé pour construire l'URL de l'embed player Ausha.
   */
  guid: string
  /** true si c'est un EXTRAIT (court clip promotionnel) */
  isExtrait: boolean
}

// ─── Constantes ───────────────────────────────────────────────────────────────

const RSS_URL   = 'https://feed.ausha.co/yvVqGgCrEkqK'
/** ID Ausha du podcast (extrait de l'URL du flux RSS) */
export const AUSHA_PODCAST_ID = 'yvVqGgCrEkqK'

/** Revalidation ISR : les données sont rafraîchies au plus toutes les heures */
export const RSS_REVALIDATE = 3600

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

  const guestMatch = rest.match(/,\s*avec\s+(.+)$/i)
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

// ─── Fetcher principal ────────────────────────────────────────────────────────

export async function getEpisodesFromRSS(
  includeExtraits = false,
): Promise<RssEpisode[]> {
  const res = await fetch(RSS_URL, {
    next: { revalidate: RSS_REVALIDATE },
  })

  if (!res.ok) {
    throw new Error(`Impossible de récupérer le flux RSS Ausha (${res.status})`)
  }

  const xml = await res.text()
  const itemMatches = xml.match(/<item>[\s\S]*?<\/item>/g) ?? []

  const episodes: RssEpisode[] = itemMatches
    .map((item) => {
      const rawTitle = extractTag(item, 'title')
      const { number, title, guest, isExtrait } = parseTitle(rawTitle)

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

      const pubDate = extractTag(item, 'pubDate')

      // Fichier audio direct (tag <enclosure>)
      const audioUrl = extractAttr(item, 'enclosure', 'url')

      // Identifiant interne Ausha (tag <guid>)
      const guid = extractTag(item, 'guid')

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
        isExtrait,
      } satisfies RssEpisode
    })
    .filter((ep) => ep.number > 0 && (includeExtraits || !ep.isExtrait))
    .sort((a, b) => b.number - a.number)

  return episodes
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
