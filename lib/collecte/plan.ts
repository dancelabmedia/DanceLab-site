/**
 * lib/collecte/plan.ts
 * Compare les entrées collectées avec l'agenda Notion et décide, sans rien
 * écrire, de ce qu'il faut faire : créer, mettre à jour, laisser tel quel,
 * signaler un doublon, archiver, ou surveiller une fiche disparue.
 *
 * Fonction pure : testée dans tests/collecte.test.ts.
 */

import type { AgendaPage } from "./notion"
import { PUBLICATION, type CollectedEvent, type PublicationDecision, type PublicationStatus } from "./types"
import { MISSING_GRACE_DAYS, daysBetween, decidePublication, fingerprint, isExpired, sameEvent } from "./rules"

export type PlannedAction =
  | { kind: "create"; event: CollectedEvent; decision: PublicationDecision; fp: string }
  | {
      kind: "update"
      page: AgendaPage
      event: CollectedEvent
      fp: string
      contentChanged: boolean
      publication: PublicationDecision | null
    }
  | { kind: "unchanged"; page: AgendaPage }
  | { kind: "duplicate"; event: CollectedEvent; page: AgendaPage }
  | { kind: "locked"; page: AgendaPage }
  | { kind: "archive"; page: AgendaPage }
  | { kind: "missing-mark"; page: AgendaPage }
  | { kind: "missing-pending"; page: AgendaPage; days: number }

/** Statuts que la collecte a le droit de changer d'elle-même. */
const AUTO_MANAGED: string[] = [PUBLICATION.auto, PUBLICATION.pending, PUBLICATION.archived, ""]

function nextPublication(current: string, decision: PublicationDecision): PublicationDecision | null {
  if (current === PUBLICATION.validated) {
    // Une validation manuelle n'est remise en cause que par la fin de l'événement.
    return decision.status === PUBLICATION.archived ? decision : null
  }
  if (!AUTO_MANAGED.includes(current)) return null
  return current === decision.status ? null : decision
}

/**
 * @param sourcePrefixes préfixes des sources consultées avec succès (ex. ["qfap:"]).
 *   Les fiches d'une source en panne ne sont jamais marquées « disparues ».
 */
export function planActions(
  events: CollectedEvent[],
  pages: AgendaPage[],
  today: string,
  sourcePrefixes: string[]
): PlannedAction[] {
  const actions: PlannedAction[] = []
  const bySourceId = new Map(pages.filter((p) => p.sourceId).map((p) => [p.sourceId, p]))
  const seenIds = new Set<string>()
  const planned: CollectedEvent[] = []

  for (const event of events) {
    seenIds.add(event.sourceId)
    const decision = decidePublication(event, today)
    const fp = fingerprint(event)
    const page = bySourceId.get(event.sourceId)

    if (page) {
      if (page.locked) {
        actions.push({ kind: "locked", page })
        continue
      }
      const contentChanged = page.fingerprint !== fp || Boolean(page.missingSince)
      const publication = nextPublication(page.publication, decision)
      if (!contentChanged && !publication) {
        actions.push({ kind: "unchanged", page })
      } else if (!contentChanged && publication?.status === PUBLICATION.archived) {
        actions.push({ kind: "archive", page })
      } else {
        actions.push({ kind: "update", page, event, fp, contentChanged, publication })
      }
      continue
    }

    // Événement déjà terminé et jamais importé : inutile de le créer.
    if (decision.status === PUBLICATION.archived) continue

    const duplicate =
      pages.find((p) => p.sourceId !== event.sourceId && sameEvent(p, event)) ??
      undefined
    if (duplicate) {
      actions.push({ kind: "duplicate", event, page: duplicate })
      continue
    }
    if (planned.some((other) => sameEvent(other, event))) continue

    planned.push(event)
    actions.push({ kind: "create", event, decision, fp })
  }

  // Fiches d'une source consultée qui n'apparaissent plus dans ses résultats.
  for (const page of pages) {
    if (!page.sourceId || seenIds.has(page.sourceId)) continue
    if (!sourcePrefixes.some((prefix) => page.sourceId.startsWith(prefix))) continue
    if (page.locked || page.publication === PUBLICATION.archived) continue

    if (isExpired(page, today)) {
      actions.push({ kind: "archive", page })
    } else if (!page.missingSince) {
      actions.push({ kind: "missing-mark", page })
    } else {
      const days = daysBetween(page.missingSince.slice(0, 10), today)
      if (days >= MISSING_GRACE_DAYS && page.publication !== PUBLICATION.pending) {
        actions.push({ kind: "missing-pending", page, days })
      }
    }
  }

  return actions
}

/** Nombre de fiches qui seront en attente de validation après application du plan. */
export function pendingAfter(pages: AgendaPage[], actions: PlannedAction[]): number {
  const state = new Map<string, string>(pages.map((p) => [p.id, p.publication]))
  let created = 0
  for (const a of actions) {
    if (a.kind === "create" && a.decision.status === PUBLICATION.pending) created++
    if (a.kind === "update" && a.publication) state.set(a.page.id, a.publication.status)
    if (a.kind === "archive") state.set(a.page.id, PUBLICATION.archived)
    if (a.kind === "missing-pending") state.set(a.page.id, PUBLICATION.pending)
  }
  return created + Array.from(state.values()).filter((s) => s === (PUBLICATION.pending as PublicationStatus)).length
}
