/**
 * lib/instagram-api.ts
 *
 * Récupère les Reels Instagram récents via l'API Graph de Meta,
 * et les associe automatiquement aux épisodes Dance Lab.
 *
 * ──────────────────────────────────────────────────────────────
 * CONFIGURATION REQUISE (une seule fois) :
 * ──────────────────────────────────────────────────────────────
 *  1. Créer une app Facebook : https://developers.facebook.com/apps/
 *  2. Ajouter le produit « Instagram Graph API »
 *  3. Connecter le compte Instagram (Business ou Creator)
 *  4. Générer un token court (User Access Token) via Graph API Explorer
 *  5. Convertir en token long (60 jours) :
 *       GET https://graph.instagram.com/access_token
 *         ?grant_type=ig_exchange_token
 *         &client_id={APP_ID}
 *         &client_secret={APP_SECRET}
 *         &access_token={SHORT_TOKEN}
 *  6. Ajouter en variable d'environnement Vercel :
 *       INSTAGRAM_ACCESS_TOKEN = {valeur du token long}
 *  7. Renouveler avant expiration (60 jours) avec :
 *       node scripts/refresh-instagram-token.mjs
 *
 * Si INSTAGRAM_ACCESS_TOKEN est absent, le module se désactive
 * silencieusement — les Reels restent gérables via add-reel.mjs.
 * ──────────────────────────────────────────────────────────────
 *
 * LOGIQUE DE CORRESPONDANCE :
 *   1. Le caption du Reel contient le numéro d'épisode
 *      (ex : "#126", "épisode 126", "ep. 126", "Ep126"…)
 *   2. + au moins un des : prénom de l'invité·e OU hashtag #DanceLab
 *      → confiance HAUTE → association automatique
 *   3. Numéro seul dans le caption (sans guest ni hashtag) :
 *      → confiance MOYENNE → association quand même (faux positifs rares)
 *
 * Note : on ne cherche que dans les 50 médias les plus récents.
 * Les Reels d'épisodes très anciens doivent être ajoutés manuellement
 * via `node scripts/add-reel.mjs`.
 */

const GRAPH_BASE = 'https://graph.instagram.com/v21.0'
const MEDIA_FIELDS = 'id,caption,media_type,permalink,timestamp'
const MEDIA_LIMIT = 50

// ─── Types ────────────────────────────────────────────────────────────────────

export type InstagramReel = {
  id: string
  permalink: string
  caption: string
  timestamp: string
  media_type: string // "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM"
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Normalise un texte : minuscules + suppression des diacritiques */
function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
}

/**
 * Renvoie true si `caption` contient une référence explicite au numéro d'épisode.
 * Formats reconnus : #126 · épisode 126 · episode 126 · ep. 126 · ep 126 · Ep126
 */
function captionContainsEpisodeNumber(caption: string, episodeNumber: number): boolean {
  const n = String(episodeNumber)
  const c = normalize(caption)

  // Référence explicite (hashtag ou mot-clé)
  if (
    c.includes(`#${n}`) ||
    c.includes(`episode ${n}`) ||
    c.includes(`ep. ${n}`) ||
    c.includes(`ep ${n}`) ||
    c.includes(`ep${n}`)
  ) {
    return true
  }

  // Nombre isolé (bordé par des non-chiffres ou en début/fin de chaîne)
  const wordBoundary = new RegExp(`(?<![0-9])${n}(?![0-9])`)
  return wordBoundary.test(c)
}

/**
 * Renvoie true si `caption` contient le prénom de l'invité·e (≥ 3 caractères).
 */
function captionContainsGuest(caption: string, guestName: string): boolean {
  if (!guestName || guestName === 'Invité·e') return false
  const c = normalize(caption)
  // Essaie le prénom, puis le nom de famille
  const parts = normalize(guestName).split(/\s+/).filter((p) => p.length >= 3)
  return parts.some((part) => c.includes(part))
}

// ─── Fetch ────────────────────────────────────────────────────────────────────

/**
 * Récupère les médias récents du compte Instagram.
 * Filtre pour ne garder que les Reels (VIDEO + permalink /reel/).
 *
 * Cache ISR : 1 h (partagé avec le cycle de revalidation du site).
 * Renvoie [] si INSTAGRAM_ACCESS_TOKEN est absent ou si l'API échoue.
 */
export async function getRecentInstagramReels(): Promise<InstagramReel[]> {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN
  if (!token) return []

  try {
    const url =
      `${GRAPH_BASE}/me/media` +
      `?fields=${MEDIA_FIELDS}` +
      `&limit=${MEDIA_LIMIT}` +
      `&access_token=${token}`

    const res = await fetch(url, {
      // ISR Next.js : revalidation 1h
      next: { revalidate: 3600 },
    })

    if (!res.ok) {
      const body = await res.text().catch(() => '')
      console.warn(`[instagram-api] Réponse ${res.status} :`, body.slice(0, 200))
      return []
    }

    const data = (await res.json()) as { data?: InstagramReel[]; error?: { message: string } }

    if (data.error) {
      console.warn('[instagram-api] Erreur API :', data.error.message)
      return []
    }

    // Garde uniquement les Reels (VIDEO dont le permalink contient /reel/)
    return (data.data ?? []).filter(
      (item) =>
        item.media_type === 'VIDEO' &&
        typeof item.permalink === 'string' &&
        item.permalink.includes('/reel/'),
    )
  } catch (err) {
    console.warn('[instagram-api] Erreur réseau :', (err as Error).message)
    return []
  }
}

// ─── Matching ─────────────────────────────────────────────────────────────────

/**
 * Cherche parmi les Reels récents celui qui correspond à un épisode.
 *
 * Renvoie le `permalink` du Reel correspondant, ou `null` si aucun match.
 *
 * Règles (du plus fiable au moins fiable) :
 *   1. Caption contient le numéro ET le prénom de l'invité·e → HAUTE confiance ✅
 *   2. Caption contient le numéro ET #DanceLab ou #dancelab → HAUTE confiance ✅
 *   3. Caption contient le numéro seul → MOYENNE confiance ✅
 *      (acceptable car les numéros d'épisode sont des entiers spécifiques)
 */
export function matchReelToEpisode(
  reels: InstagramReel[],
  episodeNumber: number,
  guestName: string,
): string | null {
  for (const reel of reels) {
    const caption = reel.caption ?? ''

    if (!captionContainsEpisodeNumber(caption, episodeNumber)) continue

    // Haute confiance : numéro + guest ou hashtag dancelab
    const hasGuest   = captionContainsGuest(caption, guestName)
    const hasBranding = normalize(caption).includes('dancelab') ||
                        normalize(caption).includes('dance lab')

    if (hasGuest || hasBranding) {
      return reel.permalink
    }

    // Confiance moyenne : numéro seul (on l'accepte tout de même)
    return reel.permalink
  }

  return null
}
