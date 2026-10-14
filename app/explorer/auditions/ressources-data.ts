/**
 * app/explorer/auditions/ressources-data.ts
 *
 * Plateformes et sites externes permettant de trouver des auditions.
 * Ajouter ici chaque nouvelle source — ne jamais écrire les ressources
 * directement dans le JSX.
 *
 * Chaque ressource est associée à une ou plusieurs catégories qui correspondent
 * aux filtres de la page. Les ressources s'affichent automatiquement dans la
 * section « Où trouver d'autres auditions ? » selon le filtre actif.
 * Quand aucun filtre n'est sélectionné (filtreCat === ''), toutes les ressources
 * sont affichées.
 */

import type { TypeProjet } from './auditions-data'

export interface RessourceAudition {
  /** Nom de la plateforme affiché dans la carte */
  name: string
  /** Description courte (1 phrase maximum) */
  description: string
  /**
   * Catégories auxquelles cette ressource est associée.
   * Doit correspondre aux valeurs de TypeProjet utilisées dans les filtres.
   * Une ressource peut appartenir à plusieurs catégories.
   */
  categories: TypeProjet[]
  /** URL complète — s'ouvre dans un nouvel onglet */
  url: string
}

// ── Liste des ressources ──────────────────────────────────────────────────────
// Ordre d'affichage quand "Toutes" est sélectionné.
// Ajouter les nouvelles sources à la suite.

export const ressources: RessourceAudition[] = [

  // ── Danse / secteur chorégraphique ───────────────────────────────────────
  {
    name:        'CN D',
    description: 'Auditions et offres d\'emploi dans le secteur chorégraphique.',
    categories:  ['compagnie-choregraphique', 'ccn-structure-choregraphique'],
    url:         'https://www.cnd.fr/fr/auditions-offres-emploi',
  },
  // ── Comédie musicale / Spectacle ─────────────────────────────────────────
  {
    name:        'La Newsletter de l\'Acteur',
    description: 'Castings et opportunités pour artistes-interprètes.',
    categories:  ['audiovisuel', 'production-commerciale', 'comedie-musicale'],
    url:         'https://www.lanewsletterdelacteur.com',
  },

  // ── Audiovisuel & clips ──────────────────────────────────────────────────
  {
    name:        'Cineaste.org',
    description: 'Castings et annonces pour le cinéma et l\'audiovisuel.',
    categories:  ['audiovisuel', 'production-commerciale'],
    url:         'https://www.cineaste.org',
  },
  {
    name:        'Figudata',
    description: 'Annonces de figuration, silhouettes et doublures pour les tournages.',
    categories:  ['audiovisuel'],
    url:         'https://www.figudata.com/annonces',
  },

  // ── Parcs & événementiel ─────────────────────────────────────────────────
  {
    name:        'Disney Auditions',
    description: 'Auditions officielles Disney, notamment pour Disneyland Paris.',
    categories:  ['parc-evenementiel'],
    url:         'https://emplois.disneycareers.com/auditions',
  },

  // ── Projets internationaux ───────────────────────────────────────────────
  {
    name:        'Dance Europe',
    description: 'Auditions et opportunités internationales.',
    categories:  ['international', 'compagnie-choregraphique', 'opera-ballet'],
    url:         'https://danceeurope.net/auditions/',
  },
  {
    name:        'au-di-tions.com',
    description: 'Auditions et open calls en Europe et à l\'international.',
    categories:  ['international', 'compagnie-choregraphique'],
    url:         'https://www.au-di-tions.com/',
  },

]

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Retourne les ressources correspondant au filtre actif.
 * Si filtreCat est vide (= "Toutes"), retourne toutes les ressources.
 */
export function getRessourcesFiltrees(
  list: RessourceAudition[],
  filtreCat: TypeProjet | '',
): RessourceAudition[] {
  if (!filtreCat) return list
  return list.filter(r => r.categories.includes(filtreCat))
}
