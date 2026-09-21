/**
 * lib/article-sidebar.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Logique de construction automatique de la colonne éditoriale latérale
 * des pages Article du magazine Dance Lab.
 *
 * Renvoie un tableau PLAT de frames (non indexé par sections) :
 *   frames[0]   → bloc épisodes (toujours en premier)
 *   frames[1..N] → une citation par épisode associé, dans l'ordre des episodeLinks
 *
 * Le composant client ArticleSidebar distribue ces frames en fonction
 * de la progression du scroll dans la zone de contenu de l'article —
 * indépendamment du nombre de sections HTML.
 *
 * Source de vérité pour les citations :
 *   Les citations proviennent EXCLUSIVEMENT des données épisodes existantes
 *   (mêmes sources que les pages Écouter). Priorité : episodeExtras > episodesList.
 *   Aucune citation n'est inventée, reformulée ou stockée dans les données articles.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { MagazineArticle, EpisodeLink } from '@/app/decouvrir/articles-data'
import { episodesList } from '@/data/episodes-list'
import { episodeExtras } from '@/data/episode-extras'

export type { EpisodeLink }

/** Nombre maximum d'épisodes dans le bloc "À écouter". */
const MAX_EPISODES = 5

/** Contenu d'un frame de la colonne éditoriale. */
export type SidebarFrame = {
  /** Bloc épisodes (frame[0] uniquement) */
  episodes?: EpisodeLink[]
  /**
   * Citation tirée des données épisode — jamais inventée.
   * Source : episodeExtras[n].quote ?? episodesList[n].quote
   */
  quote?: string
  /**
   * Nom de l'invité·e propriétaire de la citation.
   * Dérivé du champ `guest` de l'épisode source.
   */
  quoteAuthor?: string
  /** Idée clé / notion à retenir */
  notion?: { label: string; content: string }
}

/**
 * Recherche la citation et le nom de l'invité·e depuis les données épisodes
 * synchrones (même source que les pages Écouter).
 * Priorité : episodeExtras[number].quote > episodesList[number].quote
 */
function getEpisodeQuoteData(
  episodeNumber: number
): { quote: string; guest: string } | null {
  const extra = episodeExtras[episodeNumber]
  const base  = episodesList.find((ep) => ep.number === episodeNumber)
  const quote = extra?.quote ?? base?.quote ?? ''
  const guest = base?.guest ?? ''
  return quote ? { quote, guest } : null
}

/**
 * Construit l'EpisodeLink de fallback depuis les champs principaux de l'article.
 * Utilisé pour les articles sans episodeLinks explicite.
 */
function makeEpisodeLinkFromArticle(article: MagazineArticle): EpisodeLink | null {
  if (!article.episodeSlug || !article.guest || !article.episodeNumber) return null
  const nameNorm = article.guest
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '')
  return {
    name:   article.guest,
    slug:   article.episodeSlug,
    number: article.episodeNumber,
    image:  `/episodes/${nameNorm}${article.episodeNumber}.png`,
  }
}

/**
 * Construit le tableau PLAT de frames pour la colonne éditoriale.
 *
 * Structure garantie :
 *   frames[0]   → épisodes (si disponibles)
 *   frames[1..N] → citations des épisodes liés (une par épisode avec citation)
 *   (optionnel) → notion / aside si une section vide reste
 *   (fallback)  → article.quote si aucun épisode n'est associé
 *
 * Pas de null, pas de dépendance au nombre de sections HTML.
 * Le mappage scroll → frame est géré dans ArticleSidebar.tsx.
 */
export function buildSidebarFrames(article: MagazineArticle): SidebarFrame[] {
  const frames: SidebarFrame[] = []

  // ── 1. Épisodes → frame[0] ───────────────────────────────────────────────────
  const epLinks: EpisodeLink[] = article.episodeLinks?.length
    ? article.episodeLinks.slice(0, MAX_EPISODES)
    : [makeEpisodeLinkFromArticle(article)].filter(
        (e): e is EpisodeLink => e !== null
      )

  if (epLinks.length > 0) {
    frames.push({ episodes: epLinks })
  }

  // ── 2. Citations des épisodes → frames[1..N] ─────────────────────────────────
  //
  // Une citation par épisode associé, dans l'ordre des episodeLinks.
  // Tous les épisodes sont traités — pas de limite liée au nombre de sections.
  //
  for (const ep of epLinks) {
    const epNum = parseInt(ep.number, 10)
    if (isNaN(epNum)) continue
    const quoteData = getEpisodeQuoteData(epNum)
    if (!quoteData) continue
    frames.push({
      quote:       quoteData.quote,
      quoteAuthor: quoteData.guest || ep.name,
    })
  }

  // ── 3. Notion / aside (optionnel) ────────────────────────────────────────────
  if (article.aside && article.aside.items.length > 0) {
    frames.push({
      notion: {
        label:   article.aside.title,
        content: article.aside.items[0],
      },
    })
  }

  // ── 4. Fallback : article.quote (articles sans épisodes associés) ─────────────
  if (epLinks.length === 0 && article.quote) {
    frames.push({
      quote:       article.quote,
      quoteAuthor: article.quoteAuthor,
    })
  }

  return frames
}
