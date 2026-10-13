/**
 * lib/collecte/run.ts
 * Orchestration d'une collecte :
 *   sources autorisées → normalisation → dédoublonnage → comparaison avec
 *   l'agenda Notion → écriture (ou simulation) → rapport dans le journal.
 *
 * Garanties :
 *   - une seule collecte à la fois (verrou via le journal) ;
 *   - si une source est indisponible, rien n'est archivé ni retiré pour elle ;
 *   - les fiches manuelles et les fiches cochées « Ne pas mettre à jour »
 *     ne sont jamais modifiées ;
 *   - au-delà du temps imparti, la collecte s'arrête proprement (statut
 *     « Partielle ») et la suivante reprend là où elle s'est arrêtée.
 */

import { collectQueFaireAParis, searchQfapByTitle } from "./sources/que-faire-a-paris"
import { VENUE_SITES } from "./venues"
import {
  F,
  NotionClient,
  createAgendaPage,
  createRunEntry,
  ensureAgendaSchema,
  listAgendaPages,
  listRuns,
  logDatabaseId,
  notionToken,
  props,
  sourceProperties,
  sourceImageProperties,
  officialImageProperties,
  noImageProperties,
  sameEventImageProperties,
  imageIsAutoManaged,
  type AgendaPage,
  updatePageProperties,
  updateRunEntry,
  DEFAULT_AGENDA_DATABASE_ID,
} from "./notion"
import { pendingAfter, planActions, type PlannedAction } from "./plan"
import { eventDirectories, findOfficialImage, matchesOpenDataEvent, requiredParts, sameProduction, findSharedImages, IMAGE_STATUS, type FoundImage } from "./images"
import { dedupeWithinSource, parisToday, sameEvent } from "./rules"
import { PUBLICATION, emptyCounters, type CollectedEvent, type RunReport, type RunTrigger } from "./types"

type SourceDefinition = { prefix: string; name: string; collect: () => Promise<CollectedEvent[]> }

/** Sources branchées. Pour en ajouter une : un module dans ./sources + une ligne ici. */
export const SOURCES: SourceDefinition[] = [
  { prefix: "qfap:", name: "Que faire à Paris (Ville de Paris)", collect: collectQueFaireAParis },
]

export type RunOptions = {
  trigger: RunTrigger
  dryRun: boolean
  /** Temps maximal consacré aux écritures (ms). */
  budgetMs?: number
  now?: Date
}

const LOCK_MINUTES = 15

export async function runCollecte(options: RunOptions): Promise<RunReport> {
  const startedAt = (options.now ?? new Date()).toISOString()
  const deadline = Date.now() + (options.budgetMs ?? 240_000)
  const today = parisToday(options.now)
  const report: RunReport = {
    startedAt,
    finishedAt: "",
    trigger: options.trigger,
    dryRun: options.dryRun,
    status: "En cours",
    counters: emptyCounters(),
    errors: [],
    actions: [],
  }

  const token = notionToken()
  if (!token) {
    report.status = "Échec"
    report.errors.push("NOTION_TOKEN absent : impossible de lire ou d'écrire l'agenda")
    report.finishedAt = new Date().toISOString()
    return report
  }

  const client = new NotionClient(token)
  const agendaDsId = await client.dataSourceId(process.env.NOTION_AGENDA_DATABASE_ID || DEFAULT_AGENDA_DATABASE_ID)

  // ── Journal + verrou ────────────────────────────────────────────────────────
  let logDsId: string | null = null
  let logPageId: string | null = null
  const logDbId = logDatabaseId()
  if (logDbId) {
    try {
      logDsId = await client.dataSourceId(logDbId)
      const recent = await listRuns(client, logDsId, 5)
      const running = recent.find(
        (r) => r.status === "En cours" && Date.now() - Date.parse(r.startedAt) < LOCK_MINUTES * 60_000
      )
      if (running) {
        report.status = "Ignorée"
        report.errors.push(`Une collecte est déjà en cours (démarrée à ${running.startedAt})`)
        report.finishedAt = new Date().toISOString()
        return report
      }
      if (!options.dryRun) logPageId = (await createRunEntry(client, logDsId, report)).id
    } catch (error) {
      report.errors.push(`Journal des collectes inaccessible : ${message(error)}`)
      logDsId = null
    }
  } else {
    report.errors.push("NOTION_COLLECTE_LOG_DATABASE_ID non configurée : historique non enregistré")
  }

  try {
    // ── 1. Collecte ───────────────────────────────────────────────────────────
    const collected: CollectedEvent[] = []
    const okPrefixes: string[] = []
    for (const source of SOURCES) {
      report.counters.sourcesConsulted++
      try {
        const events = await source.collect()
        collected.push(...events)
        okPrefixes.push(source.prefix)
      } catch (error) {
        report.errors.push(`Source indisponible — ${source.name} : ${message(error)} (données existantes conservées)`)
      }
    }
    report.counters.received = collected.length

    const { kept, removed } = dedupeWithinSource(collected)
    report.counters.duplicates += removed

    // ── 2. Comparaison ────────────────────────────────────────────────────────
    if (!options.dryRun) {
      const added = await ensureAgendaSchema(client, agendaDsId)
      if (added.length) report.actions.push(`Colonnes ajoutées à l'agenda Notion : ${added.join(", ")}`)
    }
    const pages = await listAgendaPages(client, agendaDsId)
    const plan = planActions(kept, pages, today, okPrefixes)
    report.counters.pendingTotal = pendingAfter(pages, plan)

    // ── 3. Application ────────────────────────────────────────────────────────
    let interrupted = false
    for (const action of plan) {
      if (Date.now() > deadline) {
        interrupted = true
        break
      }
      try {
        await apply(action, { client, agendaDsId, today, dryRun: options.dryRun, report })
      } catch (error) {
        report.errors.push(`${describe(action)} : ${message(error)}`)
      }
    }

    // ── 4. Visuels des fiches qui n'en ont pas ───────────────────────────────
    if (!interrupted) {
      interrupted = await enrichImages(pages, { client, agendaDsId, today, dryRun: options.dryRun, report }, deadline)
    }

    if (interrupted) {
      report.status = "Partielle"
      report.errors.push("Temps imparti atteint : la prochaine collecte terminera le travail")
    } else {
      report.status = report.errors.some((e) => !e.startsWith("NOTION_COLLECTE_LOG")) ? "Partielle" : "Réussie"
    }
    if (okPrefixes.length === 0) report.status = "Échec"
  } catch (error) {
    report.status = "Échec"
    report.errors.push(message(error))
  }

  report.finishedAt = new Date().toISOString()
  if (logPageId) {
    try {
      await updateRunEntry(client, logPageId, report)
    } catch (error) {
      report.errors.push(`Rapport non enregistré : ${message(error)}`)
    }
  }
  return report
}

type ApplyContext = { client: NotionClient; agendaDsId: string; today: string; dryRun: boolean; report: RunReport }

async function apply(action: PlannedAction, ctx: ApplyContext) {
  const { client, today, dryRun, report } = ctx
  const c = report.counters
  const write = async (fn: () => Promise<unknown>) => {
    if (!dryRun) await fn()
  }

  switch (action.kind) {
    case "create": {
      await write(() => createAgendaPage(client, ctx.agendaDsId, action.event, action.decision, action.fp, today))
      if (action.decision.status === PUBLICATION.auto) c.created++
      else c.createdPending++
      report.actions.push(
        action.decision.status === PUBLICATION.auto
          ? `Publiée : ${action.event.title}`
          : `En attente : ${action.event.title} (${action.decision.reasons.join(", ")})`
      )
      return
    }
    case "update": {
      const changes: Record<string, unknown> = {}
      const notes: string[] = []
      if (action.contentChanged) {
        Object.assign(changes, sourceProperties(action.event, action.fp, today))
        notes.push("informations mises à jour depuis la source")
        // Le visuel de la source remplace l'ancien seulement s'il n'a été ni
        // ajouté ni refusé à la main.
        if (
          action.event.imageUrl &&
          action.event.imageUrl !== action.page.imageUrl &&
          imageIsAutoManaged(action.page.imageStatus) &&
          !action.page.hasManualImage
        ) {
          Object.assign(changes, sourceImageProperties(action.event, today))
          if (!action.page.imageUrl) c.imagesAdded++
          notes.push("visuel mis à jour")
        }
      }
      if (action.publication) {
        changes[F.publication] = props.select(action.publication.status)
        changes[F.pendingReason] = props.text(action.publication.reasons.join(" · "))
        notes.push(`publication : ${action.publication.status}`)
        if (action.publication.status === PUBLICATION.archived) c.archived++
      }
      changes[F.lastChange] = props.text(`${today} : ${notes.join(", ")}`)
      await write(() => updatePageProperties(client, action.page.id, changes))
      if (action.contentChanged) c.updated++
      report.actions.push(`Mise à jour : ${action.event.title} (${notes.join(", ")})`)
      return
    }
    case "unchanged":
      c.unchanged++
      return
    case "locked":
      c.skippedLocked++
      return
    case "duplicate": {
      c.duplicates++
      report.actions.push(`Doublon ignoré : ${action.event.title} (déjà présent : ${action.page.title})`)
      // La fiche existante reprend le visuel open data du même événement.
      const page = action.page
      if (
        action.event.imageUrl &&
        !page.imageUrl &&
        !page.locked &&
        !page.hasManualImage &&
        imageIsAutoManaged(page.imageStatus)
      ) {
        await write(() => updatePageProperties(client, page.id, sourceImageProperties(action.event, today)))
        page.imageUrl = action.event.imageUrl
        page.imageStatus = IMAGE_STATUS.openData
        c.imagesAdded++
        report.actions.push(`Visuel ajouté : ${page.title} (Ville de Paris – Que faire à Paris)`)
      }
      return
    }
    case "archive":
      await write(() =>
        updatePageProperties(client, action.page.id, {
          [F.publication]: props.select(PUBLICATION.archived),
          [F.lastChange]: props.text(`${today} : archivée (événement terminé)`),
        })
      )
      c.archived++
      report.actions.push(`Archivée : ${action.page.title}`)
      return
    case "missing-mark":
      await write(() =>
        updatePageProperties(client, action.page.id, { [F.missingSince]: { date: { start: today } } })
      )
      c.missingFromSource++
      report.actions.push(`Absente de la source (surveillée) : ${action.page.title}`)
      return
    case "missing-pending":
      await write(() =>
        updatePageProperties(client, action.page.id, {
          [F.publication]: props.select(PUBLICATION.pending),
          [F.pendingReason]: props.text(
            `Disparue de la source depuis ${action.days} jours : vérifier une éventuelle annulation`
          ),
          [F.lastChange]: props.text(`${today} : mise en attente (disparue de la source)`),
        })
      )
      c.missingFromSource++
      report.actions.push(`Mise en attente (disparue depuis ${action.days} j) : ${action.page.title}`)
      return
  }
}

/** Événement open data de la Ville de Paris correspondant à la fiche (ou null). */
export async function findOpenDataTwin(page: AgendaPage): Promise<CollectedEvent | null> {
  const [work] = requiredParts(page.title)
  if (!work?.length) return null
  const records = await searchQfapByTitle(work.join(" "))
  return records.find((r) => matchesOpenDataEvent(page, r, Object.keys(VENUE_SITES))) ?? null
}

/** Nombre de jours avant de chercher à nouveau un visuel introuvable. */
const IMAGE_RETRY_DAYS = 28
const IMAGE_CONCURRENCY = 6

/**
 * Cherche le visuel officiel des fiches qui n'en ont pas, sur la page de
 * l'événement (billetterie ou lien officiel). N'écrit que les colonnes image.
 * Renvoie true si le temps imparti a été atteint avant la fin.
 */
async function enrichImages(pages: AgendaPage[], ctx: ApplyContext, deadline: number): Promise<boolean> {
  const { client, today, dryRun, report } = ctx
  const c = report.counters
  // Page inaccessible (site lent ou bloqué) : nouvel essai la semaine suivante.
  const retryInaccessibleBefore = new Date(Date.parse(`${today}T00:00:00Z`) - 6 * 86_400_000).toISOString().slice(0, 10)
  const retryBefore = new Date(Date.parse(`${today}T00:00:00Z`) - IMAGE_RETRY_DAYS * 86_400_000).toISOString().slice(0, 10)

  const candidates = pages.filter(
    (p) =>
      !p.locked &&
      // Inutile de chercher le visuel d'un événement terminé ou non publié.
      !((p.endDate ?? p.startDate ?? "9999").slice(0, 10) < today) &&
      p.publication !== PUBLICATION.archived &&
      !p.sourceId && // les fiches collectées reçoivent le visuel de leur source
      !p.imageUrl &&
      !p.hasManualImage &&
      p.imageStatus !== IMAGE_STATUS.refused &&
      p.imageStatus !== IMAGE_STATUS.manual &&
      !(p.imageStatus === IMAGE_STATUS.none && (p.imageChecked ?? "") > (p.imageRightsNote.includes("inaccessible") ? retryInaccessibleBefore : retryBefore))
  )

  // Même spectacle déjà illustré dans une autre fiche : on reprend son visuel.
  const illustrated = pages.filter((p) => p.imageUrl && p.imageStatus !== IMAGE_STATUS.refused)
  for (const page of [...candidates]) {
    const twin = illustrated.find((other) => other.id !== page.id && (sameEvent(other, page) || sameProduction(other, page)))
    if (!twin) continue
    candidates.splice(candidates.indexOf(page), 1)
    try {
      if (!dryRun) await updatePageProperties(client, page.id, sameEventImageProperties(twin, today))
      page.imageUrl = twin.imageUrl
      c.imagesAdded++
      report.actions.push(`Visuel ajouté : ${page.title} (repris de « ${twin.title} »)`)
    } catch (error) {
      report.errors.push(`Visuel « ${page.title} » : ${message(error)}`)
    }
  }

  const directories = eventDirectories(pages.filter((p) => p.imageStatus === IMAGE_STATUS.official).map((p) => p.imageSource))
  const found: Array<{ page: AgendaPage; image: FoundImage | null; reason: string }> = []
  let index = 0
  let interrupted = false
  const worker = async () => {
    while (index < candidates.length) {
      if (Date.now() > deadline - 20_000) {
        interrupted = true
        return
      }
      const page = candidates[index++]
      // 1. Le même événement dans l'agenda open data de la Ville de Paris.
      const openData = await findOpenDataTwin(page)
      if (openData) {
        try {
          if (!dryRun) await updatePageProperties(client, page.id, sourceImageProperties(openData, today))
          c.imagesAdded++
          report.actions.push(`Visuel ajouté : ${page.title} (Ville de Paris – Que faire à Paris)`)
        } catch (error) {
          report.errors.push(`Visuel « ${page.title} » : ${message(error)}`)
        }
        continue
      }
      // 2. Le visuel officiel sur la page de l'événement.
      let result = { image: null as FoundImage | null, reason: "Pas de lien vers la page de l'événement" }
      for (const link of page.eventLinks) {
        result = await findOfficialImage(page.title, link, page.startDate, directories)
        if (result.image) break
      }
      found.push({ page, ...result })
    }
  }
  await Promise.all(Array.from({ length: IMAGE_CONCURRENCY }, worker))

  // Un même visuel pour plusieurs événements différents = bannière générique.
  const shared = findSharedImages([
    ...found.map((f) => ({ title: f.page.title, imageUrl: f.image?.url ?? "" })),
    ...pages.filter((p) => p.imageStatus === IMAGE_STATUS.official).map((p) => ({ title: p.title, imageUrl: p.imageUrl })),
  ])

  for (const entry of found) {
    if (Date.now() > deadline) {
      interrupted = true
      break
    }
    let { image, reason } = entry
    if (image && shared.has(image.url)) {
      image = null
      reason = "Visuel générique utilisé pour plusieurs événements"
    }
    try {
      if (image) {
        if (!dryRun) await updatePageProperties(client, entry.page.id, officialImageProperties(image, today))
        c.imagesAdded++
        report.actions.push(`Visuel ajouté : ${entry.page.title} (${image.credit})`)
      } else {
        if (!dryRun) await updatePageProperties(client, entry.page.id, noImageProperties(reason, today))
        c.imagesMissing++
        report.actions.push(`Sans visuel : ${entry.page.title} (${reason})`)
      }
    } catch (error) {
      report.errors.push(`Visuel « ${entry.page.title} » : ${message(error)}`)
    }
  }
  return interrupted
}

function describe(action: PlannedAction): string {
  if ("event" in action) return `${action.kind} « ${action.event.title} »`
  return `${action.kind} « ${action.page.title} »`
}

function message(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}
