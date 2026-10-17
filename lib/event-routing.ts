import type { AgendaEvent } from '@/app/agenda/agenda-data'

export type EventDestination = 'sortir' | 'ecoles'
export type PracticeEventKind = 'Cours régulier' | 'Stage / workshop' | 'Masterclass' | 'Formation'

const PRACTICE_CATEGORIES = new Set(['Cours / atelier', 'Stage / workshop'])

/**
 * Catégories qui vont systématiquement dans Sortir (vue culturelle).
 * Inclut les comédies musicales, cabarets et spectacles pluridisciplinaires
 * à dimension chorégraphique.
 */
const CULTURAL_CATEGORIES = new Set([
  'Spectacle',
  'Festival',
  'Ballet',
  'Performance',
  'Arts de rue',
  'Rencontre',
  'Exposition',
  'Bal / soirée',
  'Conférence / rencontre',
  'Battle',
  'Cabaret & dîner-spectacle',
  'Comédie musicale',
])
const FESTIVAL_PATTERN = /\bfestival\b/i
const MASTERCLASS_PATTERN = /\bmaster[ -]?class\b/i
const TRAINING_PATTERN = /\bformation\b|\bprogramme intensif\b|\bcursus\b/i
const WORKSHOP_PATTERN = /\bworkshop\b|\bstage\b|\bintensif\b/i

/**
 * Source de vérité du routage éditorial des événements.
 * Les festivals restent dans Sortir même lorsqu'ils mentionnent des ateliers :
 * leurs ateliers ne basculent dans Écoles que lorsqu'ils existent comme entrées dédiées.
 */
const DRAG_PATTERN = /\bdrag\b/i
const MUSICAL_PATTERN = /\bmusical\b|\bcomédie musicale\b|\bcomédie chantée\b/i
const CHOREOGRAPHIC_DISCIPLINES = new Set([
  'danse', 'dance', 'hip-hop', 'hip hop', 'contemporain', 'classique', 'jazz', 'ballet',
  'chorégraphie', 'choreography', 'drag', 'revue', 'cabaret',
])

function hasChoreographicDimension(event: AgendaEvent): boolean {
  if (DRAG_PATTERN.test(event.title) || DRAG_PATTERN.test(event.description ?? '')) return true
  if (MUSICAL_PATTERN.test(event.title)) return true
  if (event.category === 'Comédie musicale' || event.category === 'Cabaret & dîner-spectacle') return true
  if (event.disciplines?.some(d => CHOREOGRAPHIC_DISCIPLINES.has(d.toLowerCase()))) return true
  return false
}

export function getEventDestination(event: AgendaEvent): EventDestination {
  if (event.category === 'Festival' || FESTIVAL_PATTERN.test(event.title)) return 'sortir'
  if (CULTURAL_CATEGORIES.has(event.category)) return 'sortir'
  if (PRACTICE_CATEGORIES.has(event.category) && !hasChoreographicDimension(event)) return 'ecoles'
  return 'sortir'
}

export function isPracticeEvent(event: AgendaEvent) {
  return getEventDestination(event) === 'ecoles'
}

export function isCulturalEvent(event: AgendaEvent) {
  return getEventDestination(event) === 'sortir'
}

/** Corrige uniquement le libellé d'affichage des festivals mal typés à la source. */
export function normalizeEventForDestination(event: AgendaEvent): AgendaEvent {
  if (getEventDestination(event) === 'sortir' && FESTIVAL_PATTERN.test(event.title) && PRACTICE_CATEGORIES.has(event.category)) {
    return { ...event, category: 'Festival' }
  }
  return event
}

export function getPracticeEventKind(event: AgendaEvent): PracticeEventKind {
  const text = `${event.title} ${event.description}`
  if (MASTERCLASS_PATTERN.test(text)) return 'Masterclass'
  if (TRAINING_PATTERN.test(text)) return 'Formation'
  if (event.category === 'Stage / workshop' || WORKSHOP_PATTERN.test(text)) return 'Stage / workshop'
  return 'Cours régulier'
}

export function getEventInfo(event: AgendaEvent, labels: string[]) {
  const normalizedLabels = new Set(labels.map(label => label.toLocaleLowerCase('fr')))
  return event.additionalInfo?.find(item => normalizedLabels.has(item.label.toLocaleLowerCase('fr')))?.value?.trim()
}

export function googleMapsUrl(event: AgendaEvent) {
  const query = [event.venue, event.address, event.postalCode, event.city].filter(Boolean).join(', ')
  return query ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}` : undefined
}
