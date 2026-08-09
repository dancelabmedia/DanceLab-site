/**
 * lib/ausha-rss.ts
 * Fetcher + parser du flux RSS Ausha de Dance Lab.
 *
 * Source : https://feed.ausha.co/yvVqGgCrEkqK
 *
 * Aucune dépendance externe — le parsing XML est fait manuellement
 * pour rester compatible avec l'environnement Edge / Node.js de Next.js
 * sans alourdir le bundle.
 *
 * Utilisation (Server Component) :
 *   import { getEpisodes } from '@/lib/ausha-rss'
 *   const episodes = await getEpisodes()
 */

export type RssEpisode = {
  /** Numéro de l'épisode extrait du titre (ex : 122) */
  number: number
  /** Titre de l'épisode sans le préfixe numéroté (ex : "Peut-on réussir…") */
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
  /** Description complète (description, texte uniquement) */
  description: string
  /** true si c'est un EXTRAIT (court clip promotionnel) */
  isExtrait: boolean
}

// ─── Constantes ───────────────────────────────────────────────────────────────

const RSS_URL = 'https://feed.ausha.co/yvVqGgCrEkqK'

/** Revalidation ISR : les données sont rafraîchies au plus toutes les heures */
export const RSS_REVALIDATE = 3600

// ─── Helpers XML ──────────────────────────────────────────────────────────────

/** Extrait le contenu d'un tag XML simple (non-CDATA, premier match) */
function extractTag(xml: string, tag: string): string {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i')
  return xml.match(re)?.[1]?.trim() ?? ''
}

/** Extrait la valeur d'un attribut nommé dans un tag auto-fermant */
function extractAttr(xml: string, tag: string, attr: string): string {
  const re = new RegExp(`<${tag}[^>]*\\s${attr}="([^"]*)"`, 'i')
  return xml.match(re)?.[1]?.trim() ?? ''
}

/** Supprime les balises HTML/XML d'une chaîne */
function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s{2,}/g, ' ').trim()
}

// ─── Formatage de la durée ─────────────────────────────────────────────────

/**
 * Convertit "1:20:06" → "1 h 20"  |  "15:03" → "15 min"
 * Garde les secondes significatives si < 1 min (rare).
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

/**
 * Extrait le numéro, le titre propre, l'indicateur EXTRAIT et l'invité.
 *
 * Formats rencontrés :
 *   "122. Peut-on réussir dans la danse sans sacrifier sa santé mentale, avec Mylène Amboka"
 *   "123. EXTRAIT - \"Arrêtons de toujours se comparer...\", avec Bertrand Exertier"
 */
function parseTitle(raw: string): {
  number: number
  title: string
  guest: string
  isExtrait: boolean
} {
  // Numéro : premier entier avant le point
  const numMatch = raw.match(/^(\d+)\.\s*/)
  const number = numMatch ? parseInt(numMatch[1], 10) : 0
  let rest = numMatch ? raw.slice(numMatch[0].length) : raw

  // EXTRAIT ?
  const isExtrait = /^EXTRAIT\b/i.test(rest)

  // Invité : tout ce qui suit ", avec " (insensible à la casse)
  const guestMatch = rest.match(/,\s*avec\s+(.+)$/i)
  const guest = guestMatch ? guestMatch[1].trim() : ''
  if (guestMatch) {
    rest = rest.slice(0, rest.length - guestMatch[0].length)
  }

  // Nettoyer le titre : enlever EXTRAIT - "..." si présent, guillemets résiduels
  let title = rest
    .replace(/^EXTRAIT\s*[-–]\s*/i, '')
    .replace(/^["«"]|["»"]$/g, '')
    .trim()

  // Supprimer la virgule finale si l'invité a été retiré
  title = title.replace(/,\s*$/, '').trim()

  return { number, title, guest, isExtrait }
}

// ─── Fetcher principal ────────────────────────────────────────────────────────

/**
 * Récupère et parse le flux RSS Ausha.
 *
 * @param includeExtraits  Si false (défaut), filtre les courts extraits promotionnels.
 */
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

  // Découpe en items individuels
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

      // Description : préférer le texte brut (sans balises HTML)
      const descRaw = extractTag(item, 'description')
      const description = stripHtml(descRaw).slice(0, 800)

      const pubDate = extractTag(item, 'pubDate')

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
        isExtrait,
      } satisfies RssEpisode
    })
    .filter((ep) => ep.number > 0 && (includeExtraits || !ep.isExtrait))
    // Du plus récent au plus ancien
    .sort((a, b) => b.number - a.number)

  return episodes
}

// ─── Type enrichi (RSS + extras locaux) ───────────────────────────────────────

export type Episode = RssEpisode & {
  /** Chemin local de l'image dans /public/episodes/ (ou CDN si absent) */
  image: string
  /** Citation mise en avant (ajoutée manuellement dans episode-extras.ts) */
  quote: string
  /** Slug utilisé dans les URL du site Dance Lab */
  slug: string
}
