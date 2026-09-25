/**
 * Référentiel de travail des sous-rubriques temporairement non exposées.
 *
 * Ce fichier n'est pas importé par le Header public : ses libellés ne sont donc
 * ni rendus dans le DOM de navigation, ni envoyés avec son bundle client.
 */
export const internalExploreLinks = [
  { label: 'Styles', href: '/explorer/styles-de-danse' },
  { label: 'Artistes', href: '/explorer/artistes' },
  { label: 'Chorégraphes', href: '/explorer/choregraphes' },
  { label: 'Compagnies', href: '/explorer/compagnies' },
  { label: 'Métiers', href: '/explorer/metiers-de-la-danse' },
  { label: 'Écoles', href: '/explorer/ecoles-de-danse' },
] as const

export const internalLearnLinks = [
  { label: 'Guides', href: '/apprendre/guides' },
  { label: 'Conseils', href: '/apprendre/conseils' },
  { label: 'Formations', href: '/apprendre/formations' },
  { label: 'Outils', href: '/apprendre/outils' },
] as const
