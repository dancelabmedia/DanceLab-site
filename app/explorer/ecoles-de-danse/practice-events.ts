import type { AgendaEvent } from '@/app/agenda/agenda-data'
import { getInitialPracticeEvents } from '@/app/agenda/initial-events'
import { getEventInfo, getPracticeEventKind } from '@/lib/event-routing'
import { ecolesDanse, normalizeEcoleSearch } from './ecoles-data'

export type SchoolPracticeEvent = AgendaEvent & {
  practiceKind: ReturnType<typeof getPracticeEventKind>
  schoolId?: string
  level?: string
  instructor?: string
}

function eventOrganizationText(event: AgendaEvent) {
  return normalizeEcoleSearch([
    event.venue,
    getEventInfo(event, ['Organisateur']),
    event.address,
  ].filter(Boolean).join(' '))
}

/** Associe uniquement les lieux/organisateurs explicitement présents dans l'annuaire. */
export function findEventSchoolId(event: AgendaEvent) {
  const eventText = eventOrganizationText(event)
  if (!eventText) return undefined

  const matches = ecolesDanse.filter(school => {
    const schoolName = normalizeEcoleSearch(school.nom)
    const baseName = normalizeEcoleSearch(school.nom.split(/\s[-–—]\s|\s\(/)[0])
    const schoolAddress = normalizeEcoleSearch(school.adresse ?? '')
    return (schoolName.length >= 6 && eventText.includes(schoolName))
      || (baseName.length >= 8 && eventText.includes(baseName))
      || (schoolAddress.length >= 10 && eventText.includes(schoolAddress))
  })

  return matches.length === 1 ? matches[0].id : undefined
}

export function enrichPracticeEvent(event: AgendaEvent): SchoolPracticeEvent {
  return {
    ...event,
    practiceKind: getPracticeEventKind(event),
    schoolId: findEventSchoolId(event),
    level: getEventInfo(event, ['Niveau', 'Niveaux', 'Public']),
    instructor: getEventInfo(event, ['Intervenant', 'Intervenant.e', 'Professeur', 'Artiste']),
  }
}

export function getPracticeEvents(asOf?: string) {
  return getInitialPracticeEvents(asOf).map(enrichPracticeEvent)
}

export function getPracticeEventsForSchool(schoolId: string, asOf?: string) {
  return getPracticeEvents(asOf).filter(event => event.schoolId === schoolId)
}
