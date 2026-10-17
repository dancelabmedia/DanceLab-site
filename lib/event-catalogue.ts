import type { AgendaEvent } from '@/app/agenda/agenda-data'
import rules from '@/data/event-canonicalizations.json'
import { deduplicateEvents } from './event-deduplication.mjs'
import { applyEventDisciplines } from './event-disciplines.mjs'

export function consolidateAgendaEvents(events: AgendaEvent[]) {
  // Original source records remain in the source database/files and audit backups;
  // do not ship their repeated text inside every public card's JSON payload.
  return deduplicateEvents([...events, ...rules.map(rule => rule.event)], { rules }).events.map(({ sourceRecords, ...event }) => applyEventDisciplines(event)) as AgendaEvent[]
}

export function resolveCanonicalEventSlug(slug: string) {
  return rules.find(rule => rule.event.aliasSlugs.includes(slug))?.event.slug ?? slug
}
