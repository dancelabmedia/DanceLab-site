/**
 * lib/youtube-rss.ts
 * Récupère les dernières vidéos de la chaîne YouTube Dance Lab
 * via le flux Atom natif de YouTube (gratuit, sans clé API).
 *
 * ⚠️ Limitation : YouTube ne retourne que les 15 dernières vidéos dans ce flux.
 * Pour les épisodes plus anciens, utilise le champ `youtubeId` dans
 * data/episode-extras.ts pour renseigner l'ID manuellement.
 *
 * Chaîne : @maiwennbramoulle
 * Channel ID : UCzTqgBJF9aI66DxFyhPLdTA
 * Flux Atom  : https://www.youtube.com/feeds/videos.xml?channel_id=UCzTqgBJF9aI66DxFyhPLdTA
 *
 * Revalidation ISR : même cadence que les épisodes (1 heure).
 */

// ─── Constantes ───────────────────────────────────────────────────────────────

export const YOUTUBE_CHANNEL_ID = 'UCzTqgBJF9aI66DxFyhPLdTA'
const YOUTUBE_FEED_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${YOUTUBE_CHANNEL_ID}`

// ─── Types ────────────────────────────────────────────────────────────────────

export type YoutubeVideo = {
  videoId: string
  title: string
  published: string
  /** Numéro d'épisode extrait du titre (null si non détectable) */
  episodeNumber: number | null
  /** true = Short ou extrait promotionnel ; false = épisode complet */
  isShort: boolean
}

/** Map indexée par numéro d'épisode → vidéo préférée (complète > Short) */
export type YoutubeEpisodeMap = Map<number, YoutubeVideo>

// ─── Helpers XML ──────────────────────────────────────────────────────────────

function extractTag(xml: string, tag: string): string {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i')
  return xml.match(re)?.[1]?.trim() ?? ''
}

function extractAttr(xml: string, tag: string, attr: string): string {
  const re = new RegExp(`<${tag}[^>]*\\s${attr}="([^"]*)"`, 'i')
  return xml.match(re)?.[1]?.trim() ?? ''
}

// ─── Parsing du numéro d'épisode depuis le titre ──────────────────────────────

/**
 * Détecte le numéro d'épisode et le type (complet vs Short/extrait).
 *
 * Patterns reconnus :
 *   "122. Peut-on réussir..."   → { number: 122, isShort: false }  ← épisode complet
 *   "Ep. 122 - ..."             → { number: 122, isShort: true }   ← Short
 *   "Ep.122 - ..."              → { number: 122, isShort: true }   ← Short
 *   "#122 - ..."                → { number: 122, isShort: true }   ← autre format
 */
function parseYoutubeTitle(title: string): { episodeNumber: number | null; isShort: boolean } {
  // Format épisode complet : "122. Titre" (nombre suivi d'un point + espace)
  const fullMatch = title.match(/^(\d+)\.\s+/)
  if (fullMatch) {
    return { episodeNumber: parseInt(fullMatch[1], 10), isShort: false }
  }

  // Format Short : "Ep. 122", "Ep.122", "#122"
  const shortMatch = title.match(/(?:Ep\.?\s*|#)(\d+)/i)
  if (shortMatch) {
    return { episodeNumber: parseInt(shortMatch[1], 10), isShort: true }
  }

  return { episodeNumber: null, isShort: false }
}

// ─── Fetcher ──────────────────────────────────────────────────────────────────

/**
 * Récupère les dernières vidéos YouTube et retourne une map
 * numéro d'épisode → vidéo la plus adaptée.
 *
 * Règle de préférence : épisode complet > Short si les deux sont présents.
 * Les vidéos sans numéro reconnaissable sont ignorées.
 */
export async function getYoutubeEpisodeMap(): Promise<YoutubeEpisodeMap> {
  const map: YoutubeEpisodeMap = new Map()

  try {
    const res = await fetch(YOUTUBE_FEED_URL, {
      next: { revalidate: 3600 },
    })

    if (!res.ok) {
      console.warn(`[youtube-rss] Flux inaccessible (${res.status})`)
      return map
    }

    const xml = await res.text()

    // Le flux Atom YouTube utilise des balises <entry> pour chaque vidéo
    const entries = xml.match(/<entry>[\s\S]*?<\/entry>/g) ?? []

    for (const entry of entries) {
      const videoId = extractTag(entry, 'yt:videoId')
      const title   = extractTag(entry, 'title')
      const published = extractTag(entry, 'published')

      if (!videoId || !title) continue

      const { episodeNumber, isShort } = parseYoutubeTitle(title)
      if (episodeNumber === null) continue

      const video: YoutubeVideo = { videoId, title, published, episodeNumber, isShort }

      const existing = map.get(episodeNumber)
      if (!existing) {
        // Première vidéo trouvée pour cet épisode
        map.set(episodeNumber, video)
      } else if (existing.isShort && !isShort) {
        // On remplace un Short par la version complète
        map.set(episodeNumber, video)
      }
      // Si l'existant est déjà complet, on garde l'existant
    }
  } catch (err) {
    console.warn('[youtube-rss] Erreur lors du fetch :', err)
  }

  return map
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Construit l'URL YouTube complète depuis un ID vidéo */
export function youtubeUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`
}

/** URL de la miniature haute résolution (1280×720 si disponible, sinon 640×480) */
export function youtubeThumbnail(videoId: string, quality: 'max' | 'hq' = 'max'): string {
  return quality === 'max'
    ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    : `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
}
