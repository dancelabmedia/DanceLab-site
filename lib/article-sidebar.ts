/**
 * lib/article-sidebar.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Logique de construction automatique de la colonne éditoriale latérale
 * des pages Article du magazine Dance Lab.
 *
 * Un "frame" correspond à une section de l'article. Il contient le contenu
 * à afficher dans la colonne au moment où cette section est visible à l'écran.
 *
 * Principe de remplissage :
 *   §0 → TOUS les épisodes associés à l'article (dans la limite de MAX_EPISODES)
 *   §1+ → citations des épisodes liés (source = data/episodes-list.ts +
 *          data/episode-extras.ts), une par section vide, dans l'ordre des
 *          episodeLinks
 *   §n+ → notion clé (article.aside) dans la section vide suivante
 *   §n+ → article.quote en dernier recours (articles sans épisodes liés)
 *
 * Source de vérité pour les citations :
 *   Les citations proviennent EXCLUSIVEMENT des données existantes des épisodes
 *   (mêmes données que les pages Écouter). Aucune citation n'est inventée,
 *   reformulée ou dupliquée dans les données articles.
 *   Priorité : episodeExtras[n].quote > episodesList[n].quote
 *
 * Si des sections restent vides, la colonne s'affiche vide — jamais de
 * contenu inventé.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { MagazineArticle, EpisodeLink } from '@/app/decouvrir/articles-data'
import { episodesList } from '@/data/episodes-list'
import { episodeExtras } from '@/data/episode-extras'

export type { EpisodeLink }

/** Nombre maximum d'épisodes affichés dans la colonne.
 *  Au-delà, la liste serait trop longue et perdrait son caractère éditorial. */
const MAX_EPISODES = 5

/** Contenu d'une case de la colonne éditoriale (une par section). */
export type SidebarFrame = {
  /** Tous les épisodes Dance Lab liés à l'article (section §0 uniquement) */
  episodes?: EpisodeLink[]
  /**
   * Citation tirée des données épisode (source : pages Écouter).
   * Jamais inventée — uniquement récupérée depuis episodesList / episodeExtras.
   */
  quote?: string
  /**
   * Nom de l'invité·e propriétaire de la citation.
   * Toujours dérivé du champ `guest` de l'épisode source — jamais deviné.
   */
  quoteAuthor?: string
  /** Idée clé / point à retenir */
  notion?: {
    label: string
    content: string
  }
}

/**
 * Recherche la citation et le nom de l'invité·e d'un épisode dans les
 * données synchrones existantes (même source que les pages Écouter).
 *
 * Priorité : episodeExtras[number].quote > episodesList[number].quote
 *
 * Retourne null si l'épisode est introuvable ou sa citation vide.
 */
function getEpisodeQuoteData(
  episodeNumber: number
): { quote: string; guest: string } | null {
  // 1. Override manuel → episodeExtras (couvre les épisodes RSS 122+ avec extra)
  const extra = episodeExtras[episodeNumber]
  // 2. Données de base → episodesList (épisodes legacy 1–121)
  const base = episodesList.find((ep) => ep.number === episodeNumber)

  const quote = extra?.quote ?? base?.quote ?? ''
  const guest = base?.guest ?? ''

  if (!quote) return null
  return { quote, guest }
}

/**
 * Construit un EpisodeLink à partir des champs principaux de l'article
 * (pour les articles à un seul épisode source, sans episodeLinks explicite).
 * Convention de nommage image : /episodes/{nomNormalisé}{numéro}.png
 */
function makeEpisodeLinkFromArticle(article: MagazineArticle): EpisodeLink | null {
  if (!article.episodeSlug || !article.guest || !article.episodeNumber) return null

  const nameNorm = article.guest
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // supprime les accents
    .replace(/[^a-z0-9]/g, '')       // garde uniquement lettres et chiffres

  return {
    name: article.guest,
    slug: article.episodeSlug,
    number: article.episodeNumber,
    image: `/episodes/${nameNorm}${article.episodeNumber}.png`,
  }
}

/**
 * Construit le tableau de frames (une par section) à partir des données
 * de l'article. Renvoie `null` pour les sections sans contenu associé.
 *
 * @param article — article complet (MagazineArticle)
 * @returns tableau de N frames (N = nombre de sections)
 */
export function buildSidebarFrames(
  article: MagazineArticle
): (SidebarFrame | null)[] {
  const N = article.sections.length
  if (N === 0) return []

  const frames: (SidebarFrame | null)[] = new Array(N).fill(null)

  // ── 1. Tous les épisodes dans la section §0 ───────────────────────────────────
  //
  // Les épisodes sont le premier repère du lecteur : ils apparaissent tous
  // immédiatement dès l'entrée dans l'article.
  //
  const epLinks: EpisodeLink[] = article.episodeLinks?.length
    ? article.episodeLinks.slice(0, MAX_EPISODES)
    : [makeEpisodeLinkFromArticle(article)].filter(
        (e): e is EpisodeLink => e !== null
      )

  if (epLinks.length > 0) {
    frames[0] = { episodes: epLinks }
  }

  // ── 2. Citations des épisodes liés → sections §1, §2, … ──────────────────────
  //
  // Source de vérité : données épisodes (pages Écouter).
  // On récupère la citation de chaque épisode dans l'ordre des episodeLinks.
  // Chaque citation va dans la première section vide disponible (§1 ou suivante).
  // Pas de copie dans les données article : changement côté épisode = MAJ auto.
  //
  for (const ep of epLinks) {
    // Trouver la prochaine section vide (§1 minimum, jamais §0)
    const emptyIdx = frames.findIndex((f, i) => i > 0 && f === null)
    if (emptyIdx < 0) break // toutes les sections sont remplies

    const epNum = parseInt(ep.number, 10)
    const quoteData = getEpisodeQuoteData(epNum)
    if (!quoteData) continue // pas de citation pour cet épisode → on passe

    frames[emptyIdx] = {
      quote: quoteData.quote,
      quoteAuthor: quoteData.guest || ep.name,
    }
  }

  // ── 3. Notion / aside → section vide suivante ────────────────────────────────
  if (article.aside && article.aside.items.length > 0) {
    const emptyIdx = frames.findIndex((f, i) => i > 0 && f === null)
    if (emptyIdx >= 0) {
      frames[emptyIdx] = {
        notion: {
          label: article.aside.title,
          content: article.aside.items[0],
        },
      }
    }
  }

  // ── 4. Fallback : article.quote (articles sans épisodes liés) ────────────────
  //
  // Utilisé uniquement quand aucun épisode n'est associé (ex : article
  // éditorial sans invité). Pour les articles avec episodeLinks, les citations
  // viennent des données épisodes (étape 2 ci-dessus).
  //
  if (article.quote && epLinks.length === 0) {
    const emptyIdx = frames.findIndex((f) => f === null)
    const target = emptyIdx >= 0 ? emptyIdx : N - 1
    frames[target] = {
      ...(frames[target] ?? {}),
      quote: article.quote,
      ...(article.quoteAuthor ? { quoteAuthor: article.quoteAuthor } : {}),
    }
  }

  return frames
}
