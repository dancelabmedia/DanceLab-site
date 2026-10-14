/**
 * Relations éditoriales explicites entre les fiches métiers et les épisodes.
 *
 * Un épisode ne doit être ajouté ici que si l'invité.e exerce réellement le
 * métier ou si l'épisode est directement consacré à cette pratique. L'absence
 * d'entrée signifie volontairement qu'aucun épisode n'est assez pertinent.
 * Ajouter un nouvel épisode consiste uniquement à ajouter son numéro au métier
 * (ou aux métiers) précisément concerné(s).
 */
export const METIER_RELATED_EPISODE_NUMBERS: Readonly<Record<string, readonly number[]>> = {
  // Interpréter
  danseur: [121, 118, 116, 113, 107, 106],
  performeur: [99],
  acrobate: [96, 80],

  // Créer
  choregraphe: [117, 113, 111, 106, 105, 104],
  scenographe: [110],
  compositeur: [52],

  // Transmettre
  professeur: [121, 119, 118, 102, 83, 64],
  repetiteur: [116],
  formateur: [46],

  // Produire & diffuser
  'directeur-compagnie-ecole': [111],
  'charge-production': [55, 1],
  'agent-artistique': [114],

  // Accompagner — aucune porosité automatique entre santé et bien-être
  kine: [115],
  coach: [46],
  'professeur-pilates': [16],
  naturopathe: [3],
  photographe: [120, 14],
  magnetiseur: [18],
  'directeur-casting': [12],

  // Image & scène
  regisseur: [9],
  costumier: [47],
  styliste: [21],
  videaste: [31],
}

export function getRelatedEpisodeNumbersForMetier(metierId: string): readonly number[] {
  return METIER_RELATED_EPISODE_NUMBERS[metierId] ?? []
}
