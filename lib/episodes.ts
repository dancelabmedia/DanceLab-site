/**
 * lib/episodes.ts
 * Source de données unifiée pour les épisodes Dance Lab.
 *
 * Stratégie :
 *   • Épisodes 1–121 → données historiques depuis data/episodes-list.ts
 *     (slugs, citations et images personnalisés, parfaitement synchronisés
 *      avec les pages individuelles existantes)
 *   • Épisodes ≥ 122  → données en direct depuis le flux RSS Ausha
 *     (automatiques, mis à jour toutes les heures via ISR)
 *
 * Les extras manuels (citations, images) pour les nouveaux épisodes
 * sont gérés dans data/episode-extras.ts.
 *
 * Appel typique (Server Component) :
 *   import { getEpisodes, getLatestEpisode } from '@/lib/episodes'
 *   const episodes = await getEpisodes()
 */

import { episodesList, type EpisodeListItem } from '@/data/episodes-list'
import { episodeExtras } from '@/data/episode-extras'
import { getEpisodesFromRSS, type RssEpisode } from '@/lib/ausha-rss'

// ─── Type unifié ──────────────────────────────────────────────────────────────

export type UnifiedEpisode = {
  number: number
  slug: string
  title: string
  guest: string
  duration: string
  /** Chemin image local (/public/…) ou URL CDN Ausha */
  image: string
  /** URL CDN Ausha — utilisée comme fallback côté client si image locale absente */
  aushaImage: string
  excerpt: string
  quote: string
  /** URL de l'épisode sur Ausha (lien d'écoute) */
  link: string
  /** Date ISO */
  pubDate: string
  /** true si l'épisode vient du RSS live (≥ 122) */
  fromRSS: boolean
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Génère un slug URL-friendly à partir du titre et du numéro */
function toSlug(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * Construit l'image locale à partir du numéro d'épisode.
 * Convention : public/episodes/{number}.jpg (ou .png en fallback).
 * Les extras peuvent surcharger ce chemin.
 */
function resolveLocalImage(number: number, extras?: { image?: string }): string {
  if (extras?.image) return extras.image
  // Convention par défaut — le fallback CDN Ausha est géré côté client via onError
  return `/episodes/${number}.jpg`
}

/** Formate la durée RSS pour la cohérence avec les données historiques */
function normalizeRssDuration(d: string): string {
  // Déjà formaté par lib/ausha-rss.ts (ex : "1 h 20", "15 min")
  return d
}

// ─── Conversion ───────────────────────────────────────────────────────────────

function fromLegacy(ep: EpisodeListItem): UnifiedEpisode {
  return {
    number: ep.number,
    slug: ep.slug,
    title: ep.title,
    guest: ep.guest,
    duration: ep.duration,
    image: ep.image,
    aushaImage: ep.image, // pas de CDN Ausha pour les anciens — image locale only
    excerpt: ep.excerpt,
    quote: ep.quote,
    link: `https://podcast.ausha.co/dance-lab/${ep.slug}`,
    pubDate: '',
    fromRSS: false,
  }
}

function fromRss(ep: RssEpisode): UnifiedEpisode {
  const extras = episodeExtras[ep.number]
  const guest = ep.guest || 'Invité·e'
  const guestSlug = toSlug(guest)
  const slug = `${ep.number}-${guestSlug}`
  const image = resolveLocalImage(ep.number, extras)

  return {
    number: ep.number,
    slug,
    title: ep.title,
    guest,
    duration: normalizeRssDuration(ep.duration),
    image,
    aushaImage: ep.aushaImage,
    excerpt: ep.subtitle || ep.description.slice(0, 200),
    quote: extras?.quote ?? '',
    link: ep.link,
    pubDate: ep.pubDate,
    fromRSS: true,
  }
}

// ─── API publique ─────────────────────────────────────────────────────────────

/**
 * Retourne tous les épisodes, du plus récent au plus ancien.
 * Les nouveaux épisodes (≥ 122) sont récupérés depuis le RSS Ausha (ISR 1h).
 * Les anciens (≤ 121) viennent du fichier statique historique.
 */
export async function getEpisodes(): Promise<UnifiedEpisode[]> {
  // Numéro maximal dans les données statiques
  const maxLegacyNumber = Math.max(...episodesList.map((e) => e.number))

  // Récupération RSS (filtre automatique des EXTRAITs)
  let rssEpisodes: RssEpisode[] = []
  try {
    const all = await getEpisodesFromRSS(false)
    // Seulement les épisodes plus récents que les données statiques
    rssEpisodes = all.filter((e) => e.number > maxLegacyNumber)
  } catch (err) {
    console.error('[getEpisodes] Échec RSS, fallback sur données statiques uniquement :', err)
  }

  const legacy = episodesList.map(fromLegacy)
  const rss = rssEpisodes.map(fromRss)

  // Fusion, tri décroissant par numéro
  return [...rss, ...legacy].sort((a, b) => b.number - a.number)
}

/**
 * Retourne uniquement le dernier épisode publié (pour le bloc home).
 * Gérée séparément pour minimiser les données chargées sur la home.
 */
export async function getLatestEpisode(): Promise<UnifiedEpisode> {
  const episodes = await getEpisodes()
  return episodes[0]
}

/**
 * Retourne N épisodes récents (pour le carousel Interviews).
 * Par défaut : les 12 plus récents.
 */
export async function getRecentEpisodes(limit = 12): Promise<UnifiedEpisode[]> {
  const episodes = await getEpisodes()
  return episodes.slice(0, limit)
}
