import { agendaEvents, type AgendaEvent } from "./agenda-data"
import { getCollectedAgendaEvents } from "./collected-events"
import { cabaretEvents } from "./cabaret-events"
import { showsEvents } from "./shows-events"
import { isCulturalEvent, isPracticeEvent, normalizeEventForDestination } from "@/lib/event-routing"
import { consolidateAgendaEvents } from "@/lib/event-catalogue"

/**
 * Catalogue local validé, disponible sans requête réseau.
 * Il sert au premier rendu SSR pendant que Notion est actualisé en arrière-plan.
 */
export function getInitialAgendaEvents(asOf = new Date().toISOString().slice(0, 10)) {
  return consolidateAgendaEvents([...agendaEvents, ...getCollectedAgendaEvents(asOf), ...cabaretEvents, ...showsEvents])
    .filter((event) => (event.endDate ?? event.startDate) >= asOf || event.isRecurring)
}

export function getInitialCulturalEvents(asOf = new Date().toISOString().slice(0, 10)) {
  return getInitialAgendaEvents(asOf).filter(isCulturalEvent).map(normalizeEventForDestination)
}

export function getInitialPracticeEvents(asOf = new Date().toISOString().slice(0, 10)) {
  return getInitialAgendaEvents(asOf).filter(isPracticeEvent)
}
