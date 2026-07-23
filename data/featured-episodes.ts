import { episodes, type Episode } from './episodes'

/**
 * Ordre éditorial des épisodes mis en avant sur la page d'accueil.
 *
 * Pour modifier la sélection, il suffit de remplacer les slugs ci-dessous.
 * Toutes les informations affichées restent automatiquement synchronisées
 * avec la source de vérité `data/episodes.ts`.
 */
export const FEATURED_EPISODE_SLUGS = [
  '78-nicolas-huchard',
  '72-ines-vandamme',
  '89-soprano',
] as const

function resolveFeaturedEpisodes(slugs: readonly string[]): Episode[] {
  if (new Set(slugs).size !== slugs.length) {
    throw new Error('La sélection des épisodes en vedette contient un doublon.')
  }

  return slugs.map((slug) => {
    const episode = episodes.find((item) => item.slug === slug)

    if (!episode) {
      throw new Error(`Épisode en vedette introuvable : ${slug}`)
    }

    return episode
  })
}

export const featuredEpisodes = resolveFeaturedEpisodes(FEATURED_EPISODE_SLUGS)
