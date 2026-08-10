/**
 * lib/episodes.ts
 * Source de données unifiée pour les épisodes Dance Lab.
 *
 * Sources :
 *   • Épisodes 1–121 → données historiques depuis data/episodes-list.ts
 *   • Épisodes ≥ 122  → flux RSS Ausha (ISR 1h)
 *   • YouTube         → flux Atom YouTube (15 dernières vidéos, ISR 1h)
 *
 * Images des encarts :
 *   Priorité : public/images/les-invites/{guest}{number}.png
 *   Fallback : URL CDN Ausha (épisodes RSS) ou chemin hérité (épisodes legacy)
 *   Convention de nommage : le fichier doit se terminer par {number}.png/.jpg
 *   Ex : bertrandexertier123.png  →  épisode 123
 *
 * Extras manuels (citation, image, youtubeId) → data/episode-extras.ts
 */

import { readdirSync }                                          from 'node:fs'
import path                                                    from 'node:path'
import { episodesList, type EpisodeListItem }                  from '@/data/episodes-list'
import { episodeExtras }                                       from '@/data/episode-extras'
import { getEpisodesFromRSS, type RssEpisode, aushaEmbedUrl } from '@/lib/ausha-rss'
import { getYoutubeEpisodeMap, youtubeUrl }                    from '@/lib/youtube-rss'

// ─── Type unifié ──────────────────────────────────────────────────────────────

export type UnifiedEpisode = {
  number: number
  slug: string
  title: string
  guest: string
  duration: string
  /**
   * Chemin image résolu pour les encarts :
   *   1. public/images/les-invites/{guest}{number}.png  (scan automatique)
   *   2. override manuel dans episode-extras.ts
   *   3. Fallback : URL CDN Ausha (RSS) ou chemin hérité (legacy)
   */
  image: string
  /** URL CDN Ausha — fallback réseau si image locale absente */
  aushaImage: string
  /** Résumé court (pour les cards et l'og:description) */
  excerpt: string
  /**
   * Description complète (texte brut, paragraphes séparés par \n\n).
   * Vide pour les épisodes legacy (utiliser episode.description directement).
   */
  description: string
  /** Citation mise en valeur (question d'accroche ou phrase forte) */
  quote: string
  /** Lien d'écoute Ausha */
  link: string
  /** Date de publication ISO (vide pour les épisodes pré-RSS) */
  pubDate: string
  /**
   * ID de la vidéo YouTube correspondante (11 caractères).
   * null = pas de vidéo YouTube associée (ni auto ni manuel).
   */
  youtubeId: string | null
  /**
   * URL de l'embed player Ausha (construit depuis le guid RSS).
   * Vide pour les épisodes legacy.
   */
  aushaEmbedUrl: string
  /** true si l'épisode provient du flux RSS Ausha live (≥ 122) */
  fromRSS: boolean
}

// ─── Résolution d'image centralisée ───────────────────────────────────────────

/**
 * Scanne public/images/les-invites/ et construit une map :
 *   numéro d'épisode → chemin web (/images/les-invites/…)
 *
 * Convention : le fichier doit se terminer par {number}.{ext}
 *   ex: bertrandexertier123.png  →  episode 123
 *
 * Appelé à chaque cycle ISR (dans getEpisodes) pour détecter automatiquement
 * les nouvelles images sans redéploiement.
 */
function buildInviteImageMap(): Map<number, string> {
  const map = new Map<number, string>()
  try {
    const dir   = path.join(process.cwd(), 'public', 'images', 'les-invites')
    const files = readdirSync(dir)
    for (const file of files) {
      // Extrait le numéro à la fin du nom (avant l'extension)
      const match = file.match(/(\d+)\.(png|jpg|jpeg|webp|avif)$/i)
      if (!match) continue
      const num = parseInt(match[1], 10)
      if (!map.has(num)) {
        // Premier fichier trouvé pour ce numéro = prioritaire
        map.set(num, `/images/les-invites/${file}`)
      }
    }
  } catch {
    // Dossier absent (CI, preview) → dégradation silencieuse
  }
  return map
}

/**
 * Résout l'image d'encart d'un épisode selon la priorité :
 *   1. Override manuel dans episode-extras.ts
 *   2. Fichier dans public/images/les-invites/ correspondant au numéro
 *   3. Fallback fourni (CDN Ausha ou chemin hérité)
 */
function resolveCardImage(
  number: number,
  extras: { image?: string } | undefined,
  inviteImages: Map<number, string>,
  fallback: string,
): string {
  if (extras?.image)          return extras.image
  if (inviteImages.has(number)) return inviteImages.get(number)!
  return fallback
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toSlug(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

// ─── Conversion ───────────────────────────────────────────────────────────────

function fromLegacy(
  ep: EpisodeListItem,
  youtubeMap: Map<number, { videoId: string }>,
  inviteImages: Map<number, string>,
): UnifiedEpisode {
  const extras    = episodeExtras[ep.number]
  const youtubeId = extras?.youtubeId ?? youtubeMap.get(ep.number)?.videoId ?? null
  // ep.image = chemin hérité (/episodes/… ou /images/les-invites/…) comme dernier fallback
  const image     = resolveCardImage(ep.number, extras, inviteImages, ep.image)

  return {
    number:       ep.number,
    slug:         ep.slug,
    title:        ep.title,
    guest:        ep.guest,
    duration:     ep.duration,
    image,
    aushaImage:   ep.image,
    excerpt:      ep.excerpt,
    description:  '',          // legacy : la description complète est dans data/episodes.ts
    quote:        extras?.quote ?? ep.quote,
    link:         `https://podcast.ausha.co/dance-lab/${ep.slug}`,
    pubDate:      '',
    youtubeId,
    aushaEmbedUrl: '',         // legacy : lecteur Spotify géré séparément
    fromRSS:      false,
  }
}

function fromRss(
  ep: RssEpisode,
  youtubeMap: Map<number, { videoId: string }>,
  inviteImages: Map<number, string>,
): UnifiedEpisode {
  const extras    = episodeExtras[ep.number]
  const guest     = ep.guest || 'Invité·e'
  const guestSlug = toSlug(guest)
  const slug      = `${ep.number}-${guestSlug}`
  const youtubeId = extras?.youtubeId ?? youtubeMap.get(ep.number)?.videoId ?? null
  // Fallback = CDN Ausha si aucune image locale trouvée
  const image     = resolveCardImage(ep.number, extras, inviteImages, ep.aushaImage)

  return {
    number:       ep.number,
    slug,
    // Override manuel du titre si renseigné (ex : ajout "?" manquant)
    title:        extras?.title ?? ep.title,
    guest,
    duration:     ep.duration,
    image,
    aushaImage:   ep.aushaImage,
    // Résumé court : subtitle Ausha ou début de description (≤ 220 chars)
    excerpt:      ep.subtitle
                    ? ep.subtitle.split('\n')[0].trim().slice(0, 220)
                    : ep.description.slice(0, 220),
    // Description complète (texte brut, pas de troncature)
    description:  ep.description,
    // Citation : override manuel > question d'accroche en gras > vide
    quote:        extras?.quote ?? ep.quote,
    link:         ep.link,
    pubDate:      ep.pubDate,
    youtubeId,
    // Embed player Ausha construit depuis le guid RSS
    aushaEmbedUrl: ep.guid ? aushaEmbedUrl(ep.guid) : '',
    fromRSS:      true,
  }
}

// ─── Fonction utilitaire ───────────────────────────────────────────────────────

/** Construit l'URL YouTube complète depuis un épisode (null si pas de vidéo) */
export function getEpisodeYoutubeUrl(ep: UnifiedEpisode): string | null {
  return ep.youtubeId ? youtubeUrl(ep.youtubeId) : null
}

// ─── API publique ─────────────────────────────────────────────────────────────

/**
 * Retourne tous les épisodes, du plus récent au plus ancien.
 *
 * À chaque appel (cycle ISR ~1h) :
 *   • Re-scanne public/images/les-invites/ → détecte les nouvelles images sans redéploiement
 *   • Fetch Ausha RSS + YouTube en parallèle
 */
export async function getEpisodes(): Promise<UnifiedEpisode[]> {
  const maxLegacyNumber = Math.max(...episodesList.map((e) => e.number))

  // Fetch parallèle : scan images + Ausha RSS + YouTube RSS
  const [inviteImages, rssAll, youtubeMap] = await Promise.all([
    Promise.resolve(buildInviteImageMap()),
    getEpisodesFromRSS(false).catch((err) => {
      console.error('[getEpisodes] Échec RSS Ausha :', err)
      return [] as RssEpisode[]
    }),
    getYoutubeEpisodeMap(),
  ])

  const rssEpisodes = rssAll.filter((e) => e.number > maxLegacyNumber)
  const legacy      = episodesList.map((ep) => fromLegacy(ep, youtubeMap, inviteImages))
  const rss         = rssEpisodes.map((ep) => fromRss(ep, youtubeMap, inviteImages))

  return [...rss, ...legacy].sort((a, b) => b.number - a.number)
}

/** Dernier épisode publié (pour le bloc home et le carrousel). */
export async function getLatestEpisode(): Promise<UnifiedEpisode> {
  const eps = await getEpisodes()
  return eps[0]
}

/** N épisodes les plus récents (carrousel Interviews). */
export async function getRecentEpisodes(limit = 12): Promise<UnifiedEpisode[]> {
  const eps = await getEpisodes()
  return eps.slice(0, limit)
}

/**
 * Récupère un épisode par son slug.
 * Cherche d'abord dans les données statiques, puis dans le RSS Ausha.
 */
export async function getEpisodeBySlug(slug: string): Promise<UnifiedEpisode | null> {
  const eps = await getEpisodes()
  return eps.find((e) => e.slug === slug) ?? null
}
