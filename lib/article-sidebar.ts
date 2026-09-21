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
 *   §1+ → citation forte (article.quote) dans la première section vide
 *   §2+ → notion clé (article.aside) dans la section vide suivante
 *
 * Si des sections restent vides, la colonne s'affiche vide — jamais de
 * contenu inventé.
 *
 * Attribution des citations :
 *   - Utilise article.quoteAuthor si renseigné explicitement.
 *   - Sinon, auto-attribue à article.guest uniquement si l'article n'a qu'un
 *     seul invité·e répertorié dans episodeLinks (évite les attributions fausses
 *     sur les articles multi-invités).
 *   - Reste vide si l'attribution ne peut pas être déterminée avec certitude.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { MagazineArticle, EpisodeLink } from '@/app/decouvrir/articles-data'

export type { EpisodeLink }

/** Nombre maximum d'épisodes affichés dans la colonne.
 *  Au-delà, la liste serait trop longue et perdrait son caractère éditorial. */
const MAX_EPISODES = 5

/** Contenu d'une case de la colonne éditoriale (une par section). */
export type SidebarFrame = {
  /** Tous les épisodes Dance Lab liés à l'article (section §0 uniquement) */
  episodes?: EpisodeLink[]
  /** Citation forte tirée de l'article */
  quote?: string
  /**
   * Auteur·rice de la citation — affiché sous la citation sous la forme « — Nom ».
   * Jamais inventé : uniquement renseigné quand l'attribution est certaine.
   */
  quoteAuthor?: string
  /** Idée clé / point à retenir */
  notion?: {
    label: string
    content: string
  }
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
 * Détermine l'auteur·rice de la citation.
 * Retourne undefined si l'attribution ne peut pas être déterminée avec certitude.
 */
function resolveQuoteAuthor(article: MagazineArticle): string | undefined {
  // 1. Attribution explicite dans les données → prioritaire, toujours fiable
  if (article.quoteAuthor) return article.quoteAuthor

  // 2. Article avec un seul invité·e listé → la citation vient vraisemblablement de lui/elle
  const epLinks = article.episodeLinks
  if (epLinks && epLinks.length === 1) return epLinks[0].name

  // 3. Article sans episodeLinks mais avec un unique guest (non-éditorial)
  //    On n'auto-attribue que si le guest n'est pas l'hôte "Dance Lab" lui-même.
  //    La convention dans le projet : le guest est l'hôte/éditorial quand episodeSlug est vide.
  if (!epLinks && article.guest && article.episodeSlug) return article.guest

  // Attribution incertaine — on préfère ne rien afficher plutôt qu'inventer
  return undefined
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
  // Logique : les épisodes sont le premier repère éditorial du lecteur.
  // On les groupe TOUS dans le frame d'entrée plutôt que de les répartir —
  // l'utilisateur voit immédiatement l'ensemble des ressources liées à l'article.
  //
  const epLinks: EpisodeLink[] = article.episodeLinks?.length
    ? article.episodeLinks.slice(0, MAX_EPISODES)
    : [makeEpisodeLinkFromArticle(article)].filter(
        (e): e is EpisodeLink => e !== null
      )

  if (epLinks.length > 0) {
    frames[0] = { episodes: epLinks }
  }

  // ── 2. Citation forte → première section vide (§1 ou suivante) ───────────────
  if (article.quote) {
    const emptyIdx = frames.findIndex((f) => f === null)
    // S'il n'y a aucune section vide, on ajoute la citation à la dernière section
    const target = emptyIdx >= 0 ? emptyIdx : N - 1
    const author = resolveQuoteAuthor(article)
    frames[target] = {
      ...(frames[target] ?? {}),
      quote: article.quote,
      ...(author ? { quoteAuthor: author } : {}),
    }
  }

  // ── 3. Notion / aside → section vide suivante ────────────────────────────────
  if (article.aside && article.aside.items.length > 0) {
    const emptyIdx = frames.findIndex((f) => f === null)
    if (emptyIdx >= 0) {
      frames[emptyIdx] = {
        notion: {
          label: article.aside.title,
          content: article.aside.items[0],
        },
      }
    }
  }

  return frames
}
