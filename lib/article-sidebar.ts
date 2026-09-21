/**
 * lib/article-sidebar.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Logique de construction automatique de la colonne éditoriale latérale
 * des pages Article du magazine Dance Lab.
 *
 * Un "frame" correspond à une section de l'article. Il contient le contenu
 * à afficher dans la colonne au moment où cette section est visible à l'écran.
 *
 * Priorité de remplissage :
 *   1. Épisodes cités (episodeLinks) — répartis équitablement entre sections
 *   2. Citation forte (article.quote) — dans la première section vide
 *   3. Notion clé (article.aside) — dans la section vide suivante
 *
 * Si plusieurs cases restent vides : la colonne s'affiche vide,
 * jamais avec un contenu inventé.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { MagazineArticle, EpisodeLink } from '@/app/decouvrir/articles-data'

export type { EpisodeLink }

/** Contenu d'une case de la colonne éditoriale (une par section). */
export type SidebarFrame = {
  /** Un ou deux épisodes Dance Lab à mettre en avant */
  episodes?: EpisodeLink[]
  /** Phrase forte ou citation tirée de l'article */
  quote?: string
  /** Idée clé / point à retenir */
  notion?: {
    label: string
    content: string
  }
}

/**
 * Construit l'image d'épisode depuis le slug et le numéro.
 * Convention de nommage : /episodes/{nomNormalisé}{numéro}.png
 * ex : "Rose Otentick" + "114" → /episodes/roseotentick114.png
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
 * @returns tableau de N frames (N = nombre de sections), chaque frame
 *          pouvant être null si aucun contenu n'est disponible.
 */
export function buildSidebarFrames(
  article: MagazineArticle
): (SidebarFrame | null)[] {
  const N = article.sections.length
  if (N === 0) return []

  const frames: (SidebarFrame | null)[] = new Array(N).fill(null)

  // ── 1. Répartition des épisodes ─────────────────────────────────────────────
  const epLinks: EpisodeLink[] = article.episodeLinks?.length
    ? article.episodeLinks
    : [makeEpisodeLinkFromArticle(article)].filter(
        (e): e is EpisodeLink => e !== null
      )

  if (epLinks.length > 0) {
    if (epLinks.length <= N) {
      // Un épisode par section (dans l'ordre)
      epLinks.forEach((ep, i) => {
        frames[i] = { episodes: [ep] }
      })
    } else {
      // Plus d'épisodes que de sections → regroupement par chunks
      const chunkSize = Math.ceil(epLinks.length / N)
      for (let i = 0; i < N; i++) {
        const chunk = epLinks.slice(i * chunkSize, (i + 1) * chunkSize)
        if (chunk.length > 0) {
          frames[i] = { episodes: chunk }
        }
      }
    }
  }

  // ── 2. Citation forte → première section vide ────────────────────────────────
  if (article.quote) {
    const emptyIdx = frames.findIndex((f) => f === null)
    const target = emptyIdx >= 0 ? emptyIdx : N - 1
    frames[target] = { ...(frames[target] ?? {}), quote: article.quote }
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
