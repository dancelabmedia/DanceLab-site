/**
 * lib/collecte/image-pipeline.ts
 * Étape « visuels » de la collecte, exécutée à chaque collecte du lundi et
 * chaque jour (cron /api/cron/images-danse) pour vider la file d'attente.
 *
 * Pour chaque fiche à venir sans visuel, dans cet ordre :
 *   1. autre fiche du même spectacle déjà illustrée ;
 *   2. même événement dans l'open data de la Ville de Paris ;
 *   3. page officielle à partir des liens de la fiche ou du site du lieu ;
 *   4. recherche web de la page officielle (API Claude), puis vérification ;
 *   5. sinon : nouvel essai programmé (délais progressifs), historique noté.
 * Chaque image reçoit un score de confiance : publiée au-dessus du seuil,
 * « À vérifier » (non affichée) en dessous.
 *
 * Également : contrôle des images déjà publiées (liens cassés) et passage en
 * « Non confirmé » des fiches vagues qu'aucune programmation ne confirme.
 */

import {
  F,
  NotionClient,
  appendHistory,
  noImageProperties,
  officialImageProperties,
  props,
  reviewImageProperties,
  sameEventImageProperties,
  sourceImageProperties,
  updatePageProperties,
  type AgendaPage,
} from "./notion"
import {
  IMAGE_STATUS,
  eventDirectories,
  findOfficialImage,
  findSharedImages,
  hostIsTripped,
  imageStillResponds,
  lookupContext,
  matchesOpenDataEvent,
  requiredParts,
  sameProduction,
  type ScoredImage,
} from "./images"
import { resolveOfficialPage, resolverAvailable } from "./resolver"
import { searchQfapByTitle } from "./sources/que-faire-a-paris"
import { VENUE_SITES } from "./venues"
import { sameEvent } from "./rules"
import { PUBLICATION, type CollectedEvent, type RunReport } from "./types"

export type ImageStepOptions = {
  client: NotionClient
  today: string
  dryRun: boolean
  report: RunReport
  deadline: number
  /** Nombre maximal de recherches web (API Claude) pour cette exécution. */
  resolverBudget: number
  /** Nombre d'images publiées à revérifier (liens cassés). */
  brokenChecks: number
  /** Nombre d'images anciennes à renoter avec le score de confiance. */
  rescoreLimit?: number
}

const CONCURRENCY = 5

/** Fiche vague : intitulé approximatif, sans œuvre identifiable. */
export function isVagueTitle(title: string): boolean {
  return /ou similaire|\bà confirmer\b|création tournée|^création\b|— tournée\b|\btournée paris\b|\(ballet en tournée\)|tournée france/i.test(title)
}

/** Délai avant le prochain essai, selon le nombre de tentatives et la raison. */
export function nextAttemptDate(today: string, attempts: number, reason: string): string {
  const days = /inaccessible/i.test(reason) ? 2 : [3, 7, 14, 28][Math.min(attempts, 3)]
  return new Date(Date.parse(`${today}T00:00:00Z`) + days * 86_400_000).toISOString().slice(0, 10)
}

function upcoming(page: AgendaPage, today: string): boolean {
  return !((page.endDate ?? page.startDate ?? "9999").slice(0, 10) < today)
}

/** Fiches à traiter maintenant (file d'attente). */
export function dueForImage(page: AgendaPage, today: string): boolean {
  if (page.locked || page.imageUrl || page.hasManualImage) return false
  if (!upcoming(page, today)) return false
  if (page.publication === PUBLICATION.archived || page.publication === PUBLICATION.unconfirmed) return false
  if (page.imageStatus === IMAGE_STATUS.refused || page.imageStatus === IMAGE_STATUS.manual) return false
  return !page.imageNext || page.imageNext <= today
}

export async function findOpenDataTwin(page: AgendaPage): Promise<CollectedEvent | null> {
  const [work] = requiredParts(page.title)
  if (!work?.length) return null
  const records = await searchQfapByTitle(work.join(" "))
  return records.find((r) => matchesOpenDataEvent(page, r, Object.keys(VENUE_SITES))) ?? null
}

type Outcome =
  | { kind: "image"; image: ScoredImage; via: string; linkFix?: Record<string, unknown>; titleFix?: string }
  | { kind: "openData"; event: CollectedEvent }
  | { kind: "review"; image: ScoredImage; reason: string; linkFix?: Record<string, unknown> }
  | { kind: "unconfirmed"; reason: string }
  | { kind: "none"; reason: string; linkFix?: Record<string, unknown> }

export async function runImageStep(pages: AgendaPage[], opts: ImageStepOptions): Promise<boolean> {
  const { client, today, dryRun, report } = opts
  const c = report.counters
  const write = async (page: AgendaPage, properties: Record<string, unknown>) => {
    if (!dryRun) await updatePageProperties(client, page.id, properties)
  }
  const safe = async (label: string, fn: () => Promise<void>) => {
    try {
      await fn()
    } catch (error) {
      report.errors.push(`Visuel « ${label} » : ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  // ── 1. Images publiées devenues inaccessibles ──────────────────────────────
  const published = pages
    .filter((p) => p.imageUrl && upcoming(p, today) && [IMAGE_STATUS.official, IMAGE_STATUS.openData, ""].includes(p.imageStatus as never) && !p.hasManualImage)
    .sort((a, b) => (a.imageChecked ?? "").localeCompare(b.imageChecked ?? ""))
    .slice(0, opts.brokenChecks)
  for (const page of published) {
    if (Date.now() > opts.deadline - 60_000) return true
    if (await imageStillResponds(page.imageUrl)) {
      await safe(page.title, () => write(page, { [F.imageChecked]: { date: { start: today } } }))
      continue
    }
    if (await imageStillResponds(page.imageUrl)) continue // second essai avant de conclure
    c.brokenImages++
    report.actions.push(`Image cassée retirée (nouvelle recherche programmée) : ${page.title}`)
    await safe(page.title, () =>
      write(page, {
        [F.imageUrl]: props.url(""),
        [F.imageStatus]: props.select(IMAGE_STATUS.broken),
        [F.imageNext]: { date: { start: today } },
        ...appendHistory(page.imageHistory, `${today} : image ${page.imageUrl} inaccessible, retirée`),
      })
    )
    page.imageUrl = ""
    page.imageStatus = IMAGE_STATUS.broken
    page.imageNext = today
  }

  // ── 1 bis. Images publiées avant le score de confiance : revérification ──
  const legacy = pages
    .filter((p) => p.imageStatus === IMAGE_STATUS.official && p.imageUrl && !p.imageScore && p.imageSource && upcoming(p, today) && !p.hasManualImage && !p.locked)
    .slice(0, opts.rescoreLimit ?? 30)
  const legacyDirs = eventDirectories(pages.filter((p) => p.imageStatus === IMAGE_STATUS.official).map((p) => p.imageSource))
  for (const page of legacy) {
    if (Date.now() > opts.deadline - 90_000) return true
    const ctx = lookupContext(page, legacyDirs, [page.imageSource], VENUE_SITES)
    const result = await findOfficialImage(ctx, page.imageSource)
    await safe(page.title, async () => {
      if (result.image) {
        await write(page, officialImageProperties(result.image, today))
        return
      }
      if (/inaccessible/i.test(result.reason)) return // on garde l'image, nouvel essai plus tard
      c.imagesToReview++
      report.actions.push(`Image retirée à la revérification : ${page.title} — ${result.reason}`)
      await write(page, {
        ...(result.best ? reviewImageProperties(result.best, result.reason, today) : { [F.imageUrl]: props.url(""), ...noImageProperties(result.reason, today) }),
        [F.imageNext]: { date: { start: nextAttemptDate(today, 0, result.reason) } },
        ...appendHistory(page.imageHistory, `${today} : revérification — ${result.reason}`),
      })
      page.imageUrl = ""
    })
  }

  // ── 2. File d'attente ──────────────────────────────────────────────────────
  const queue = pages.filter((p) => dueForImage(p, today))
  const illustrated = pages.filter((p) => p.imageUrl && [IMAGE_STATUS.official, IMAGE_STATUS.openData].includes(p.imageStatus as never))
  const directories = eventDirectories(pages.filter((p) => p.imageStatus === IMAGE_STATUS.official).map((p) => p.imageSource))
  let budget = resolverAvailable() ? opts.resolverBudget : 0

  // 2a. Même spectacle déjà illustré.
  for (const page of [...queue]) {
    const twin = illustrated.find((o) => o.id !== page.id && (sameEvent(o, page) || sameProduction(o, page)))
    if (!twin) continue
    queue.splice(queue.indexOf(page), 1)
    c.imagesAdded++
    report.actions.push(`Visuel ajouté : ${page.title} (repris de « ${twin.title} »)`)
    await safe(page.title, () =>
      write(page, { ...sameEventImageProperties(twin, today), ...appendHistory(page.imageHistory, `${today} : visuel repris de « ${twin.title} »`) })
    )
    page.imageUrl = twin.imageUrl
  }

  // 2b. Recherches (en parallèle, une requête à la fois par site).
  const outcomes: Array<{ page: AgendaPage; outcome: Outcome }> = []
  let index = 0
  let interrupted = false

  const search = async (page: AgendaPage): Promise<Outcome> => {
    const openData = await findOpenDataTwin(page)
    if (openData) return { kind: "openData", event: openData }

    const links = page.eventLinks.filter((l) => !hostIsTripped(l))
    const ctx = lookupContext(page, directories, [], VENUE_SITES)
    let best: ScoredImage | null = null
    let reason = links.length ? "" : "Pas de lien vers la page de l'événement"
    for (const link of links) {
      const result = await findOfficialImage(ctx, link)
      if (result.image) return { kind: "image", image: result.image, via: "liens de la fiche" }
      if (result.best && (!best || result.best.score.total > best.score.total)) best = result.best
      reason = result.reason
    }

    // Recherche web de la page officielle.
    if (budget > 0 && Date.now() < opts.deadline - 90_000) {
      budget--
      const resolution = await resolveOfficialPage({
        title: page.title,
        venue: page.venue,
        city: page.city,
        startDate: page.startDate,
        endDate: page.endDate,
        company: page.company,
        links: page.eventLinks,
      }).catch((error) => {
        report.errors.push(`Recherche web « ${page.title} » : ${error instanceof Error ? error.message : String(error)}`)
        return null
      })
      if (resolution) {
        c.webSearches += resolution.searches
        if (resolution.status === "unconfirmed") {
          return { kind: "unconfirmed", reason: resolution.explanation || "Aucune programmation officielle ne correspond" }
        }
        if (resolution.status === "confirmed" && resolution.officialUrl) {
          const linkFix: Record<string, unknown> = { [F.officialUrl]: props.url(resolution.officialUrl) }
          if (!page.ticketUrl && resolution.ticketUrl) linkFix[F.ticket] = props.url(resolution.ticketUrl)
          // Fiche vague : on cherche avec le titre officiel, corrigé seulement si la page le confirme.
          const vague = isVagueTitle(page.title)
          const title = vague && resolution.exactTitle ? resolution.exactTitle : page.title
          const ctx2 = lookupContext({ ...page, title }, directories, [resolution.officialUrl], VENUE_SITES)
          const result = await findOfficialImage(ctx2, resolution.officialUrl)
          // La page a été vérifiée avec le titre officiel : la correction est confirmée.
          const titleFix = vague && resolution.exactTitle && result.image ? resolution.exactTitle : undefined
          if (result.image) return { kind: "image", image: result.image, via: "recherche web", linkFix, titleFix }
          if (result.best) return { kind: "review", image: result.best, reason: result.reason, linkFix }
          return { kind: "none", reason: `Page officielle trouvée (${resolution.officialUrl}) mais ${result.reason.toLowerCase()}`, linkFix }
        }
        reason = `Recherche web : ${resolution.explanation || "aucune page officielle trouvée"}`
      }
    }
    if (best) return { kind: "review", image: best, reason: reason || "Correspondance insuffisante" }
    return { kind: "none", reason: reason || "Aucun visuel fiable trouvé" }
  }

  const worker = async () => {
    while (index < queue.length) {
      if (Date.now() > opts.deadline - 45_000) {
        interrupted = true
        return
      }
      const page = queue[index++]
      try {
        outcomes.push({ page, outcome: await search(page) })
      } catch (error) {
        outcomes.push({ page, outcome: { kind: "none", reason: error instanceof Error ? error.message : String(error) } })
      }
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker))

  // Un même visuel pour plusieurs spectacles différents = bannière générique.
  const shared = findSharedImages([
    ...outcomes.map((o) => ({ title: o.page.title, imageUrl: o.outcome.kind === "image" ? o.outcome.image.url : "" })),
    ...illustrated.map((p) => ({ title: p.title, imageUrl: p.imageUrl })),
  ])

  // ── 3. Écriture des résultats ──────────────────────────────────────────────
  for (const { page, outcome: raw } of outcomes) {
    if (Date.now() > opts.deadline - 5_000) {
      interrupted = true
      break
    }
    let outcome = raw
    if (outcome.kind === "image" && outcome.image.fit !== "logo" && shared.has(outcome.image.url)) {
      outcome = { kind: "review", image: outcome.image, reason: "Visuel générique utilisé pour plusieurs spectacles", linkFix: outcome.linkFix }
    }
    const attempts = page.imageAttempts + 1
    const base = { [F.imageAttempts]: props.num(attempts) }

    await safe(page.title, async () => {
      switch (outcome.kind) {
        case "openData":
          c.imagesAdded++
          report.actions.push(`Visuel ajouté : ${page.title} (Ville de Paris – Que faire à Paris)`)
          await write(page, {
            ...base,
            ...sourceImageProperties(outcome.event, today),
            [F.imageScore]: props.num(100),
            [F.imageNext]: { date: null },
            ...appendHistory(page.imageHistory, `${today} : visuel open data (${outcome.event.sourceUrl})`),
          })
          return
        case "image": {
          c.imagesAdded++
          if (outcome.linkFix) c.linksCorrected++
          const extra: Record<string, unknown> = { ...(outcome.linkFix ?? {}) }
          if (outcome.titleFix && outcome.titleFix !== page.title) {
            c.titlesCorrected++
            extra[F.title] = { title: [{ type: "text", text: { content: outcome.titleFix.slice(0, 1990) } }] }
            extra[F.originalTitle] = props.text(page.title)
            report.actions.push(`Titre corrigé : « ${page.title} » → « ${outcome.titleFix} »`)
          }
          report.actions.push(`Visuel ajouté : ${page.title} (${outcome.image.credit}, score ${outcome.image.score.total}, ${outcome.via})`)
          await write(page, {
            ...base,
            ...extra,
            ...officialImageProperties(outcome.image, today),
            ...appendHistory(page.imageHistory, `${today} : visuel ${outcome.image.url} (score ${outcome.image.score.total}, ${outcome.via})`),
          })
          return
        }
        case "review":
          c.imagesToReview++
          if (outcome.linkFix) c.linksCorrected++
          report.actions.push(`Visuel à vérifier (non affiché) : ${page.title} — ${outcome.reason}`)
          await write(page, {
            ...base,
            ...(outcome.linkFix ?? {}),
            ...reviewImageProperties(outcome.image, outcome.reason, today),
            [F.imageNext]: { date: { start: nextAttemptDate(today, attempts, outcome.reason) } },
            ...appendHistory(page.imageHistory, `${today} : à vérifier — ${outcome.reason}`),
          })
          return
        case "unconfirmed": {
          // Fiche vague, ou deuxième recherche sans résultat : masquée jusqu'à confirmation.
          const already = /non confirmé/i.test(page.imageHistory)
          if (isVagueTitle(page.title) || already) {
            c.unconfirmed++
            report.actions.push(`Fiche masquée (non confirmée) : ${page.title} — ${outcome.reason}`)
            await write(page, {
              ...base,
              [F.publication]: props.select(PUBLICATION.unconfirmed),
              [F.pendingReason]: props.text(`Non confirmé : ${outcome.reason}`),
              [F.imageNext]: { date: { start: nextAttemptDate(today, 3, "") } },
              ...appendHistory(page.imageHistory, `${today} : non confirmé — ${outcome.reason}`),
            })
          } else {
            c.imagesMissing++
            await write(page, {
              ...base,
              ...noImageProperties(`Non confirmé à la première recherche : ${outcome.reason}`, today),
              [F.imageNext]: { date: { start: nextAttemptDate(today, attempts, "") } },
              ...appendHistory(page.imageHistory, `${today} : non confirmé (1re fois) — ${outcome.reason}`),
            })
          }
          return
        }
        case "none":
          c.imagesMissing++
          if (outcome.linkFix) c.linksCorrected++
          await write(page, {
            ...base,
            ...(outcome.linkFix ?? {}),
            ...noImageProperties(outcome.reason, today),
            [F.imageNext]: { date: { start: nextAttemptDate(today, attempts, outcome.reason) } },
            ...appendHistory(page.imageHistory, `${today} : ${outcome.reason}`),
          })
          return
      }
    })
  }
  return interrupted
}
