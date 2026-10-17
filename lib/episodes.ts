/**
 * lib/episodes.ts
 * Source de données unifiée pour les épisodes Dance Lab.
 *
 * Sources :
 *   • Tous les épisodes → flux RSS Ausha (ISR 1h) — source de vérité pour les métadonnées
 *   • Épisodes 1–121   → data/episodes-list.ts comme fallback (slug permanent, image locale)
 *                         Les métadonnées Ausha (titre, invité, durée, citation) écrasent
 *                         les données statiques dès que l'épisode est présent dans le RSS.
 *   • YouTube          → flux Atom YouTube (15 dernières vidéos, ISR 1h)
 *
 * Identification stable : le GUID Ausha est stocké sur chaque UnifiedEpisode.
 *   Un changement de titre dans Ausha met à jour la fiche existante sans jamais
 *   créer de doublon ni modifier le slug (URL permanente).
 *
 * Images des encarts :
 *   Source exclusive : public/images/les-invites/{guest}{number}.png
 *   Convention de nommage : le fichier doit se terminer par {number}.png/.jpg
 *   Ex : bertrandexertier123.png  →  épisode 123
 *
 * Extras manuels (citation, image, youtubeId) → data/episode-extras.ts
 */

import { readdirSync }                                          from 'node:fs'
import path                                                    from 'node:path'
import { episodesList, type EpisodeListItem }                  from '@/data/episodes-list'
import { episodes as legacyEpisodeDetails }                    from '@/data/episodes'
import { episodeExtras }                                       from '@/data/episode-extras'
import { AUSHA_GUID_BY_EPISODE_NUMBER }                        from '@/data/episode-ausha-guids'
import { episodeTranslationsEN, type EpisodeTranslationEN }   from '@/data/episode-translations-en'
import { episodeNumberFromImageName }                          from '@/lib/episode-image-presentation'
import { getEpisodesFromRSS, isGenericGuestLabel, isRediffusion, type EpisodePlatformLinks, type RssEpisode } from '@/lib/ausha-rss'
import { cleanEpisodeTitle }                                   from '@/lib/episode-title'
import { getYoutubeEpisodeMap, youtubeUrl, youtubeVideoMatchesEpisode, type YoutubeVideo } from '@/lib/youtube-rss'
import {
  getRecentInstagramReels,
  matchReelToEpisode,
  type InstagramReel,
}                                                              from '@/lib/instagram-api'
import { getResolvedTeaser }                                   from '@/lib/teaser-resolved'
import { getEpisodeMediaOverride }                             from '@/lib/episode-media-overrides'
import { buildEpisodeSearchTags }                              from '@/lib/episode-search-tags'

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
  /** URL CDN Ausha conservée comme métadonnée, jamais utilisée par les cartes Écouter. */
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
   * URL de l'embed Spotify prête à l'emploi.
   * Vide pour les épisodes legacy (qui utilisent episode.spotifyEmbedUrl de data/episodes.ts).
   */
  spotifyEmbedUrl: string
  /** Liens d'écoute officiels détectés sur la smartlink Ausha. */
  platformLinks: EpisodePlatformLinks
  /** URL du fichier audio original publiée par Ausha. */
  audioUrl: string
  /** Chapitres fournis par Ausha ou par les données historiques. */
  chapters: { time: string; title: string; url?: string }[]
  /** true si l'épisode provient du flux RSS Ausha live (≥ 122) */
  fromRSS: boolean
  /**
   * Identifiant Ausha stable (tag <guid> du RSS).
   * Reste constant même si le titre change — utilisé pour l'identification
   * sans ambiguïté. Vide pour les épisodes legacy sans correspondance RSS.
   */
  aushaGuid: string
  /**
   * URL du Reel Instagram correspondant à cet épisode.
   * Undefined si aucun Reel n'a été associé → la section n'est pas affichée.
   */
  instagramReelUrl?: string
  /**
   * true si la vidéo YouTube associée est un Short (format vertical 9:16).
   * Modifie l'affichage de la vignette dans le header et le lien généré.
   */
  isYoutubeShort?: boolean
  /**
   * Métier / rôle explicite de l'invité.e (source de vérité unique).
   * Vide pour la plupart des épisodes legacy ; renseigné manuellement dans
   * data/episodes.ts. Utilisé comme badge sur les cards et pour la rotation
   * du carrousel Métiers.
   */
  role?: string
  /** Tags sémantiques non visuels utilisés par le moteur de recherche. */
  searchTags: string[]
  /**
   * Traductions EN du contenu éditorial.
   * Undefined si aucune traduction n'est encore disponible pour cet épisode.
   * La page épisode utilise ces champs quand locale = 'en', avec fallback FR.
   */
  en?: EpisodeTranslationEN
}

/**
 * Conserve le premier vrai nom disponible et ignore les libellés génériques.
 * L'ordre des arguments exprime la priorité des sources : correction locale,
 * métadonnée Ausha, puis donnée historique vérifiée.
 */
export function resolveEpisodeGuest(...candidates: Array<string | null | undefined>): string {
  for (const candidate of candidates) {
    const value = candidate?.trim()
    if (!value) continue

    if (!isGenericGuestLabel(value)) return value
  }

  return 'Invité.e'
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
      .filter(file => !file.startsWith('.'))
      .sort((a, b) => {
        const cleanliness = Number(a.trim() !== a) - Number(b.trim() !== b)
        return cleanliness || a.localeCompare(b, 'fr')
      })
    for (const file of files) {
      // Both guest128.png and 128guest.png are valid; exact episode number.
      const num = episodeNumberFromImageName(file)
      if (num === undefined) continue
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
 *   1. Override manuel local dans episode-extras.ts
 *   2. Fichier dans public/images/les-invites/ correspondant au numéro
 *   3. Ancien chemin local valide
 *
 * Les URL CDN et les images de header sont volontairement refusées ici.
 */
function resolveCardImage(
  number: number,
  extras: { image?: string } | undefined,
  inviteImages: Map<number, string>,
  fallback: string | undefined,
): string {
  if (extras?.image?.startsWith('/images/les-invites/') && !extras.image.includes('/les-invites-header/')) return extras.image
  if (inviteImages.has(number)) return inviteImages.get(number)!
  if (fallback?.startsWith('/images/les-invites/') && !fallback.includes('/les-invites-header/')) return fallback
  return ''
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

/**
 * Valide une association Instagram manuelle avec le GUID Ausha stable.
 * Une association historique sans GUID reste acceptée pour compatibilité.
 */
function resolveManualInstagramUrl(
  episodeNumber: number,
  instagramReelUrl: string | undefined,
  configuredAushaGuid: string | undefined,
  actualAushaGuid: string,
): string | undefined {
  if (!instagramReelUrl) return undefined
  if (configuredAushaGuid && actualAushaGuid && configuredAushaGuid !== actualAushaGuid) {
    console.warn(
      `[episodes] Reel Instagram ignoré pour l'épisode ${episodeNumber}: GUID Ausha incohérent.`,
    )
    return undefined
  }
  return instagramReelUrl
}

// ─── Extraction de l'extrait éditorial ────────────────────────────────────────

/**
 * Détecte une ligne d'introduction biographique — typiquement en tête de
 * certaines descriptions Ausha :
 *   "✨ Prénom Nom – Artiste interprète, directeur artistique…"
 *   "🎤 Invité – rôle, rôle"
 *
 * Ces lignes ne constituent pas une accroche éditoriale et doivent être
 * ignorées lors de l'extraction de l'extrait affiché dans le chatbot.
 */
function isBioIntroLine(line: string): boolean {
  // Commence par un ou plusieurs emoji décoratifs
  if (/^[\p{Emoji_Presentation}\p{Extended_Pictographic}✨]{1,3}\s+\S/u.test(line)) return true
  // "Prénom Nom – rôle, rôle…" (nom propre suivi d'un tiret/em-dash)
  if (/^[A-ZÁÀÂÄÉÈÊËÎÏÔÙÛÜÇ][a-záàâäéèêëîïôùûüç]+(?:\s[A-ZÁÀÂÄÉÈÊËÎÏÔÙÛÜÇ][a-záàâäéèêëîïôùûüç]+)+\s*[–—-]/u.test(line)) return true
  return false
}

/**
 * Détecte les lignes structurelles qui ne forment pas une phrase éditoriale :
 * en-têtes de résumé, items de liste avec puce/flèche, etc.
 */
function isStructuralLine(line: string): boolean {
  return (
    /^En résumé\s*[:：]/i.test(line) ||
    /^[➜➔→•►▸▶*]\s/.test(line) ||
    /^[-–—]\s+/.test(line) ||
    /^\d+\.\s+/.test(line) ||
    line.length < 24
  )
}

/**
 * Tronque proprement `text` à `maxLen` caractères.
 * La coupure se fait à la dernière espace disponible pour ne pas couper un mot,
 * puis ajoute le caractère ellipse «…».
 */
function truncateExcerpt(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text
  const cut = text.slice(0, maxLen).lastIndexOf(' ')
  const boundary = cut > maxLen * 0.75 ? cut : maxLen
  return text.slice(0, boundary).trimEnd() + '\u2026'
}

/**
 * Extrait le premier extrait éditorial pertinent d'une description Ausha.
 *
 * Ordre de priorité :
 *   1. `subtitle` (itunes:subtitle) si présent et non bio-intro
 *   2. Première ligne non-bio, non-structurelle de `description` (≥ 24 chars)
 *   3. Troncature brute de `description` en dernier recours
 *
 * Le résultat est tronqué à `maxLen` caractères (défaut : 180) avec «…».
 *
 * @param description  Texte brut de la description complète (déjà nettoyé par cleanDescription)
 * @param subtitle     Contenu de l'itunes:subtitle Ausha (optionnel)
 * @param maxLen       Longueur maximale de l'extrait retourné
 */
function extractEditorialExcerpt(
  description: string,
  subtitle?: string,
  maxLen = 180,
): string {
  // 1. Subtitle prioritaire s'il n'est pas une intro bio
  if (subtitle) {
    const sub = subtitle.split('\n')[0].trim()
    if (sub && !isBioIntroLine(sub) && !isStructuralLine(sub)) {
      return truncateExcerpt(sub, maxLen)
    }
  }

  // 2. Première ligne éditoriale de la description
  const lines = description.split('\n').map(l => l.trim()).filter(Boolean)
  for (const line of lines) {
    if (!isBioIntroLine(line) && !isStructuralLine(line)) {
      return truncateExcerpt(line, maxLen)
    }
  }

  // 3. Repli : tronquer la description brute
  return truncateExcerpt(description.trim(), maxLen)
}

// ─── Conversion ───────────────────────────────────────────────────────────────

function fromLegacy(
  ep: EpisodeListItem,
  youtubeMap: Map<number, YoutubeVideo>,
  inviteImages: Map<number, string>,
  recentReels: InstagramReel[],
): UnifiedEpisode {
  const extras   = episodeExtras[ep.number]
  const details  = legacyEpisodeDetails.find(item => item.number === ep.number)
  const aushaGuid = AUSHA_GUID_BY_EPISODE_NUMBER[ep.number] ?? ''
  const resolved = getResolvedTeaser(ep.number, aushaGuid)
  const mediaOverride = getEpisodeMediaOverride(aushaGuid)
  const ytVideo  = youtubeMap.get(ep.number)
  const verifiedYtVideo = ytVideo && youtubeVideoMatchesEpisode(ytVideo, ep) ? ytVideo : undefined

  // Priorité : extras manuel > cache résolu (cron) > détection temps réel
  const youtubeId =
    mediaOverride?.youtubeId ??
    extras?.youtubeId ??
    resolved?.youtubeId ??
    verifiedYtVideo?.videoId ??
    null

  const isYoutubeShort: boolean | undefined =
    mediaOverride?.isYoutubeShort ??
    extras?.isYoutubeShort ??
    resolved?.isYoutubeShort ??
    verifiedYtVideo?.isShort ??
    undefined

  // ep.image = chemin hérité (/episodes/… ou /images/les-invites/…) comme dernier fallback
  const image = resolveCardImage(ep.number, extras, inviteImages, ep.image)

  // Reel Instagram : extras manuel > cache résolu (cron) > détection auto via Graph API
  const instagramReelUrl =
    mediaOverride?.instagramReelUrl ??
    resolveManualInstagramUrl(
      ep.number,
      extras?.instagramReelUrl,
      extras?.aushaGuid,
      aushaGuid,
    ) ??
    resolved?.instagramReelUrl ??
    matchReelToEpisode(recentReels, ep.number, ep.guest) ??
    undefined

  return {
    number:       ep.number,
    slug:         ep.slug,
    // Filet de sécurité : si un titre legacy contient encore ", avec Invité",
    // cleanEpisodeTitle le retire sans toucher aux titres où "avec" est dans le sujet.
    title:        cleanEpisodeTitle(ep.title, ep.guest),
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
    spotifyEmbedUrl: '',       // legacy : lecteur Spotify géré séparément
    platformLinks: {
      spotify: details?.spotify || undefined,
      apple: details?.apple || undefined,
      deezer: details?.deezer || undefined,
    },
    audioUrl: '',
    chapters: details?.chapters ?? [],
    fromRSS:      false,
    aushaGuid, // sera remplacé par le GUID live du RSS quand il est disponible
    instagramReelUrl,
    isYoutubeShort,
    role:         details?.role || undefined,
    searchTags: buildEpisodeSearchTags({
      ...ep,
      role: details?.role,
      category: details?.category,
      description: details?.description,
      tags: details?.tags,
      chapters: details?.chapters,
    }, extras?.searchTags),
    en:           episodeTranslationsEN[ep.number],
  }
}

function fromRss(
  ep: RssEpisode,
  youtubeMap: Map<number, YoutubeVideo>,
  inviteImages: Map<number, string>,
  recentReels: InstagramReel[],
): UnifiedEpisode {
  const extras   = episodeExtras[ep.number]
  const resolved = getResolvedTeaser(ep.number, ep.guid)
  const mediaOverride = getEpisodeMediaOverride(ep.guid)
  const guest    = resolveEpisodeGuest(extras?.guest, ep.guest)
  const guestSlug = toSlug(guest)
  const slug     = `${ep.number}-${guestSlug}`
  const ytVideo  = youtubeMap.get(ep.number)
  const verifiedYtVideo = ytVideo && youtubeVideoMatchesEpisode(ytVideo, ep) ? ytVideo : undefined

  // Priorité : extras manuel > cache résolu (cron) > détection temps réel
  const youtubeId =
    mediaOverride?.youtubeId ??
    extras?.youtubeId ??
    resolved?.youtubeId ??
    verifiedYtVideo?.videoId ??
    null

  const isYoutubeShort: boolean | undefined =
    mediaOverride?.isYoutubeShort ??
    extras?.isYoutubeShort ??
    resolved?.isYoutubeShort ??
    verifiedYtVideo?.isShort ??
    undefined

  // Les cartes utilisent exclusivement le fichier local validé du dossier
  // public/images/les-invites. L'URL Ausha reste stockée séparément.
  const image = resolveCardImage(ep.number, extras, inviteImages, undefined)

  // Reel Instagram : extras manuel > cache résolu (cron) > détection auto via Graph API
  const instagramReelUrl =
    mediaOverride?.instagramReelUrl ??
    resolveManualInstagramUrl(
      ep.number,
      extras?.instagramReelUrl,
      extras?.aushaGuid,
      ep.guid,
    ) ??
    resolved?.instagramReelUrl ??
    matchReelToEpisode(recentReels, ep.number, guest) ??
    undefined

  return {
    number:       ep.number,
    slug,
    // Ausha est l'unique source éditoriale du titre. Les données locales ne
    // peuvent plus masquer une correction publiée dans le flux.
    title:        cleanEpisodeTitle(ep.title, guest),
    guest,
    duration:     ep.duration,
    image,
    aushaImage:   ep.aushaImage,
    // Résumé court : première phrase éditoriale (hors intro biographique)
    excerpt:      extractEditorialExcerpt(ep.description, ep.subtitle || undefined),
    // Description complète (texte brut, pas de troncature)
    description:  ep.description,
    // Citation : override manuel > question d'accroche en gras > vide
    quote:        extras?.quote ?? ep.quote,
    // Smartlink Ausha : permet à l'utilisateur de choisir sa plateforme d'écoute.
    // Le flux RSS retourne podcast.ausha.co (player direct) — on convertit en smartlink.ausha.co
    link:         `https://smartlink.ausha.co/dance-lab/${ep.aushaSlug}`,
    pubDate:      ep.pubDate,
    youtubeId,
    // Embed Spotify : override manuel (episode-extras) > détection auto (smartlink Ausha)
    spotifyEmbedUrl: extras?.spotifyId
      ? `https://open.spotify.com/embed/episode/${extras.spotifyId}?utm_source=generator`
      : ep.spotifyEmbedUrl,
    platformLinks: ep.platformLinks,
    audioUrl: ep.audioUrl,
    chapters: ep.chapters,
    fromRSS:      true,
    aushaGuid:    ep.guid,
    instagramReelUrl,
    isYoutubeShort,
    searchTags: buildEpisodeSearchTags({
      title: ep.title,
      guest,
      excerpt: ep.subtitle,
      description: ep.description,
      quote: extras?.quote ?? ep.quote,
    }, extras?.searchTags),
    // Traductions EN : depuis episode-translations-en.ts (épisodes ≥ 122 peuvent
    // y être ajoutés au fur et à mesure — même mécanique que les épisodes legacy)
    en:           episodeTranslationsEN[ep.number],
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

  // Fetch parallèle : scan images + Ausha RSS + YouTube RSS + Instagram Reels
  const [inviteImages, rssAll, youtubeMap, recentReels] = await Promise.all([
    Promise.resolve(buildInviteImageMap()),
    getEpisodesFromRSS(false).catch((err) => {
      console.error('[getEpisodes] Échec RSS Ausha :', err)
      return [] as RssEpisode[]
    }),
    getYoutubeEpisodeMap(),
    // Silencieusement désactivé si INSTAGRAM_ACCESS_TOKEN absent
    getRecentInstagramReels(),
  ])

  // ── Index RSS par numéro d'épisode ──────────────────────────────────────────
  // Ausha est la source de vérité pour les métadonnées mutables.
  // On filtre les rediffusions une seule fois ici.
  const currentRss = rssAll.filter((e) => !isRediffusion(e.title))
  const rssByGuid = new Map<string, RssEpisode>(
    currentRss.filter((episode) => episode.guid).map((episode) => [episode.guid, episode]),
  )
  // Compatibilité uniquement pour un ancien épisode qui n'aurait pas encore
  // été inscrit dans le registre GUID. Le titre n'est jamais utilisé comme clé.
  const rssByNumber = new Map<number, RssEpisode>(
    currentRss.map((episode) => [episode.number, episode]),
  )

  // ── Épisodes legacy (1-121) avec surcharge RSS ──────────────────────────────
  // Pour chaque épisode legacy, si Ausha RSS contient cet épisode, on écrase
  // les champs mutables (titre, invité, durée, citation, extrait) avec les
  // données Ausha, tout en conservant le slug et l'image locale (URLs stables).
  const legacy = episodesList.map((ep) => {
    const stableGuid = AUSHA_GUID_BY_EPISODE_NUMBER[ep.number]
    const rss = stableGuid ? rssByGuid.get(stableGuid) : rssByNumber.get(ep.number)
    if (!rss) {
      const unified = fromLegacy(ep, youtubeMap, inviteImages, recentReels)
      return { ...unified, aushaGuid: stableGuid ?? '' }
    }

    // Fusion : slug/number/image viennent du statique, contenu vient d'Ausha
    const merged: EpisodeListItem = {
      ...ep,
      title:    rss.title    || ep.title,
      guest:    resolveEpisodeGuest(rss.guest, ep.guest),
      duration: rss.duration || ep.duration,
      quote:    rss.quote    || ep.quote,
      // Extrait éditorial : priorité à l'extrait statique pour les épisodes
      // legacy (rédigé manuellement, plus soigné). Si Ausha fournit un subtitle
      // propre, on l'utilise à la place. En dernier recours, description Ausha.
      excerpt:  ep.excerpt ||
        (rss.subtitle || rss.description
          ? extractEditorialExcerpt(rss.description || '', rss.subtitle || undefined)
          : ''),
    }
    const unified = fromLegacy(merged, youtubeMap, inviteImages, recentReels)
    // Stocker le GUID Ausha pour identification stable future
    return {
      ...unified,
      aushaGuid: rss.guid,
      aushaImage: rss.aushaImage || unified.aushaImage,
      description: rss.description || unified.description,
      pubDate: rss.pubDate || unified.pubDate,
      link: rss.aushaSlug ? `https://smartlink.ausha.co/dance-lab/${rss.aushaSlug}` : unified.link,
      spotifyEmbedUrl: rss.spotifyEmbedUrl || unified.spotifyEmbedUrl,
      platformLinks: { ...unified.platformLinks, ...rss.platformLinks },
      audioUrl: rss.audioUrl || unified.audioUrl,
      chapters: rss.chapters.length > 0 ? rss.chapters : unified.chapters,
    }
  })

  // ── Nouveaux épisodes RSS (> seuil legacy) ──────────────────────────────────
  const rssNew = currentRss.filter((e) => e.number > maxLegacyNumber)
  const rss    = rssNew.map((ep) => fromRss(ep, youtubeMap, inviteImages, recentReels))

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
