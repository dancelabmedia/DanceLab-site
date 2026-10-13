/**
 * lib/collecte/notion.ts
 * Accès Notion pour la collecte : base « Agenda Danse Paris & France »
 * (celle qu'affiche déjà /sortir via /api/agenda) et base « Journal des
 * collectes » (historique et rapports).
 *
 * Variables d'environnement :
 *   NOTION_TOKEN (ou NOTION_API_KEY)       — déjà utilisée par /api/agenda
 *   NOTION_AGENDA_DATABASE_ID             — optionnelle (valeur par défaut ci-dessous)
 *   NOTION_COLLECTE_LOG_DATABASE_ID       — optionnelle (valeur par défaut ci-dessous)
 *
 * Toutes les colonnes ajoutées par la collecte sont créées automatiquement
 * au premier passage (ensureAgendaSchema) : aucune colonne existante n'est
 * modifiée ni supprimée.
 */

import { fetchWithRetry, sleep } from "./http"
import type { CollectedEvent, PublicationDecision, RunReport, RunStatus } from "./types"
import { PUBLICATION } from "./types"
import { dayOf, seasonOf } from "./rules"
import { IMAGE_RIGHTS, IMAGE_STATUS, type FoundImage } from "./images"
import { VENUE_SITES } from "./venues"

const NOTION_VERSION = "2025-09-03"
export const DEFAULT_AGENDA_DATABASE_ID = "c06a1552cfcc4522ae68d32f833b3cf3"
/** Base Notion « 📋 Journal des collectes Dance Lab » (page « Bases de données »). */
export const DEFAULT_LOG_DATABASE_ID = "50f59f082efe4f5bb35ea5d3e6228b39"

/** Noms des colonnes Notion utilisées par la collecte. */
export const F = {
  title: "Événement",
  date: "Date",
  type: "Type",
  season: "Saison",
  statusInfo: "Statut info",
  ticket: "Lien billetterie",
  origin: "Origine",
  price: "Tarif",
  // Colonnes ajoutées par la collecte
  sourceId: "ID source",
  source: "Source",
  sourceUrl: "URL source",
  officialUrl: "Lien officiel",
  venue: "Salle",
  address: "Adresse",
  postalCode: "Code postal",
  city: "Ville",
  latitude: "Latitude",
  longitude: "Longitude",
  description: "Description",
  schedule: "Horaires",
  organizer: "Organisateur",
  disciplines: "Disciplines",
  publication: "Publication",
  pendingReason: "Raison de l'attente",
  locked: "Ne pas mettre à jour",
  fingerprint: "Empreinte collecte",
  lastChecked: "Dernière vérification",
  missingSince: "Absente de la source depuis",
  lastChange: "Dernière modification auto",
  // Visuel de l'événement
  imageUrl: "Image URL",
  imageSource: "Source image",
  imageCredit: "Crédit image",
  imageAlt: "Texte alternatif image",
  imageStatus: "Statut image",
  imageRights: "Droits image",
  imageChecked: "Image vérifiée le",
} as const

export const ORIGIN_AUTO = "🆕 Nouvel ajout (veille auto)"

const DISCIPLINE_OPTIONS = [
  "Hip-hop / Breaking",
  "Contemporain",
  "Classique / Ballet",
  "Jazz",
  "Danses de couple",
  "Danses du monde / traditionnelles",
  "Voguing / Ballroom",
  "Claquettes",
  "Pole dance",
]

// ─── Client ───────────────────────────────────────────────────────────────────

type NotionPage = {
  id: string
  url?: string
  in_trash?: boolean
  archived?: boolean
  cover?: unknown
  properties: Record<string, any>
}

export class NotionClient {
  private lastCall = 0
  constructor(private token: string) {}

  /** Notion limite à ~3 requêtes/s : on espace les appels. */
  async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const wait = 340 - (Date.now() - this.lastCall)
    if (wait > 0) await sleep(wait)
    this.lastCall = Date.now()

    const response = await fetchWithRetry(
      `https://api.notion.com/v1/${path}`,
      {
        ...init,
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
          "Notion-Version": NOTION_VERSION,
          ...(init.headers || {}),
        },
      },
      { attempts: 4, timeoutMs: 30_000 }
    )

    if (!response.ok) {
      const body = (await response.json().catch(() => ({}))) as { message?: string; code?: string }
      throw new Error(`Notion ${response.status} ${body.code ?? ""} : ${body.message ?? "erreur inconnue"}`.trim())
    }
    return (await response.json()) as T
  }

  async dataSourceId(databaseId: string): Promise<string> {
    const db = await this.request<{ data_sources?: Array<{ id: string }> }>(`databases/${databaseId}`)
    return db.data_sources?.[0]?.id || databaseId
  }

  async queryAll(dataSourceId: string, filter?: unknown): Promise<NotionPage[]> {
    const pages: NotionPage[] = []
    let cursor: string | undefined
    do {
      const data = await this.request<{ results: NotionPage[]; has_more: boolean; next_cursor?: string | null }>(
        `data_sources/${dataSourceId}/query`,
        { method: "POST", body: JSON.stringify({ page_size: 100, start_cursor: cursor, ...(filter ? { filter } : {}) }) }
      )
      pages.push(...data.results)
      cursor = data.has_more ? data.next_cursor || undefined : undefined
    } while (cursor)
    return pages
  }
}

export function notionToken(): string | undefined {
  return process.env.NOTION_TOKEN || process.env.NOTION_API_KEY
}

// ─── Lecture / écriture de propriétés ─────────────────────────────────────────

const text = (value: string) => ({ rich_text: value ? [{ type: "text", text: { content: value.slice(0, 1990) } }] : [] })
const url = (value: string) => ({ url: value || null })
const num = (value: number | null) => ({ number: value })
const select = (value: string | null) => ({ select: value ? { name: value } : null })

export function readText(prop: any): string {
  if (!prop) return ""
  const parts = prop.title ?? prop.rich_text
  if (Array.isArray(parts)) return parts.map((p: any) => p.plain_text ?? p.text?.content ?? "").join("").trim()
  if (prop.type === "select") return prop.select?.name ?? ""
  if (prop.type === "url") return prop.url ?? ""
  if (prop.type === "date") return prop.date?.start ?? ""
  if (prop.type === "checkbox") return prop.checkbox ? "true" : ""
  if (prop.type === "number") return prop.number === null || prop.number === undefined ? "" : String(prop.number)
  return ""
}

// ─── Schéma de l'agenda ───────────────────────────────────────────────────────

/** Ajoute les colonnes manquantes (jamais de suppression ni de renommage). */
export async function ensureAgendaSchema(client: NotionClient, dataSourceId: string): Promise<string[]> {
  const ds = await client.request<{ properties: Record<string, { type: string; select?: { options: Array<{ name: string }> } }> }>(
    `data_sources/${dataSourceId}`
  )
  const existing = ds.properties || {}
  const wanted: Record<string, unknown> = {
    [F.sourceId]: { rich_text: {} },
    [F.source]: { rich_text: {} },
    [F.sourceUrl]: { url: {} },
    [F.officialUrl]: { url: {} },
    [F.venue]: { rich_text: {} },
    [F.address]: { rich_text: {} },
    [F.postalCode]: { rich_text: {} },
    [F.city]: { rich_text: {} },
    [F.latitude]: { number: {} },
    [F.longitude]: { number: {} },
    [F.description]: { rich_text: {} },
    [F.schedule]: { rich_text: {} },
    [F.organizer]: { rich_text: {} },
    [F.disciplines]: { multi_select: { options: DISCIPLINE_OPTIONS.map((name) => ({ name })) } },
    [F.publication]: {
      select: {
        options: [
          { name: PUBLICATION.auto, color: "green" },
          { name: PUBLICATION.validated, color: "blue" },
          { name: PUBLICATION.pending, color: "orange" },
          { name: PUBLICATION.archived, color: "gray" },
        ],
      },
    },
    [F.pendingReason]: { rich_text: {} },
    [F.locked]: { checkbox: {} },
    [F.fingerprint]: { rich_text: {} },
    [F.lastChecked]: { date: {} },
    [F.missingSince]: { date: {} },
    [F.lastChange]: { rich_text: {} },
    [F.imageUrl]: { url: {} },
    [F.imageSource]: { url: {} },
    [F.imageCredit]: { rich_text: {} },
    [F.imageAlt]: { rich_text: {} },
    [F.imageStatus]: {
      select: {
        options: [
          { name: IMAGE_STATUS.openData, color: "green" },
          { name: IMAGE_STATUS.official, color: "blue" },
          { name: IMAGE_STATUS.manual, color: "purple" },
          { name: IMAGE_STATUS.refused, color: "red" },
          { name: IMAGE_STATUS.none, color: "gray" },
        ],
      },
    },
    [F.imageRights]: { rich_text: {} },
    [F.imageChecked]: { date: {} },
  }

  const missing = Object.fromEntries(Object.entries(wanted).filter(([name]) => !existing[name]))
  if (Object.keys(missing).length) {
    await client.request(`data_sources/${dataSourceId}`, { method: "PATCH", body: JSON.stringify({ properties: missing }) })
  }
  return Object.keys(missing)
}

// ─── Fiches de l'agenda ───────────────────────────────────────────────────────

export type AgendaPage = {
  id: string
  url: string
  title: string
  startDate: string | null
  endDate: string | null
  sourceId: string
  publication: string
  locked: boolean
  fingerprint: string
  missingSince: string | null
  imageUrl: string
  imageSource: string
  imageCredit: string
  /** Raison notée quand aucun visuel n'a été trouvé. */
  imageRightsNote: string
  imageStatus: string
  imageChecked: string | null
  /** Liens vers la page de l'événement, du plus précis au plus général. */
  eventLinks: string[]
  /** Une image a déjà été déposée à la main (fichier ou couverture Notion). */
  hasManualImage: boolean
}

export async function listAgendaPages(client: NotionClient, dataSourceId: string): Promise<AgendaPage[]> {
  const pages = await client.queryAll(dataSourceId)
  return pages
    .filter((p) => !p.in_trash && !p.archived)
    .map((p) => {
      const props = p.properties || {}
      const titleProp = props[F.title] ?? Object.values(props).find((v: any) => v?.type === "title")
      return {
        id: p.id,
        url: p.url ?? "",
        title: readText(titleProp),
        startDate: props[F.date]?.date?.start ?? null,
        endDate: props[F.date]?.date?.end ?? null,
        sourceId: readText(props[F.sourceId]),
        publication: readText(props[F.publication]),
        locked: Boolean(props[F.locked]?.checkbox),
        fingerprint: readText(props[F.fingerprint]),
        missingSince: props[F.missingSince]?.date?.start ?? null,
        imageUrl: readText(props[F.imageUrl]),
        imageSource: readText(props[F.imageSource]),
        imageCredit: readText(props[F.imageCredit]),
        imageRightsNote: readText(props[F.imageRights]),
        imageStatus: readText(props[F.imageStatus]),
        imageChecked: props[F.imageChecked]?.date?.start ?? null,
        eventLinks: Array.from(
          new Set([readText(props[F.ticket]), readText(props[F.officialUrl]), VENUE_SITES[readText(props["Lieu"])] ?? ""].filter(Boolean))
        ),
        hasManualImage:
          Boolean(p.cover) ||
          ["Image", "Photo", "Affiche", "Visuel", "Cover"].some((name) => props[name]?.files?.length),
      }
    })
}

/** Propriétés issues de la source (écrites à la création et à chaque mise à jour). */
export function sourceProperties(event: CollectedEvent, fp: string, today: string) {
  const start = event.startDate ? (event.hasTime ? event.startDate : dayOf(event.startDate)) : null
  const endDay = dayOf(event.endDate)
  const end = endDay && endDay !== dayOf(event.startDate) ? endDay : null

  return {
    [F.title]: { title: [{ type: "text", text: { content: event.title.slice(0, 1990) } }] },
    [F.date]: { date: start ? { start, end } : null },
    [F.sourceId]: text(event.sourceId),
    [F.source]: text(event.sourceLabel),
    [F.sourceUrl]: url(event.sourceUrl),
    [F.officialUrl]: url(event.officialUrl),
    [F.ticket]: url(event.ticketUrl),
    [F.venue]: text(event.venue),
    [F.address]: text(event.address),
    [F.postalCode]: text(event.postalCode),
    [F.city]: text(event.city),
    [F.latitude]: num(event.latitude),
    [F.longitude]: num(event.longitude),
    [F.description]: text(event.description),
    [F.schedule]: text(event.schedule),
    [F.organizer]: text(event.organizer),
    [F.price]: text(event.price),
    [F.disciplines]: { multi_select: event.disciplines.map((name) => ({ name })) },
    [F.fingerprint]: text(fp),
    [F.lastChecked]: { date: { start: today } },
    [F.missingSince]: { date: null },
  }
}

/** Statuts d'image que la collecte a le droit de remplacer. */
export function imageIsAutoManaged(status: string): boolean {
  return status === "" || status === IMAGE_STATUS.openData || status === IMAGE_STATUS.none
}

/** Propriétés du visuel fourni par la source (vide = rien à écrire). */
export function sourceImageProperties(event: CollectedEvent, today: string): Record<string, unknown> {
  if (!event.imageUrl) return {}
  return {
    [F.imageUrl]: url(event.imageUrl),
    [F.imageSource]: url(event.sourceUrl),
    [F.imageCredit]: text(event.imageCredit),
    [F.imageAlt]: text(event.imageAlt),
    [F.imageStatus]: select(IMAGE_STATUS.openData),
    [F.imageRights]: text(IMAGE_RIGHTS.openData),
    [F.imageChecked]: { date: { start: today } },
  }
}

export function officialImageProperties(image: FoundImage, today: string): Record<string, unknown> {
  return {
    [F.imageUrl]: url(image.url),
    [F.imageSource]: url(image.sourceUrl),
    [F.imageCredit]: text(image.credit),
    [F.imageAlt]: text(image.alt),
    [F.imageStatus]: select(IMAGE_STATUS.official),
    [F.imageRights]: text(IMAGE_RIGHTS.official),
    [F.imageChecked]: { date: { start: today } },
  }
}

/** Visuel repris d'une autre fiche décrivant le même spectacle. */
export function sameEventImageProperties(twin: AgendaPage, today: string): Record<string, unknown> {
  return {
    [F.imageUrl]: url(twin.imageUrl),
    [F.imageSource]: url(twin.imageSource),
    [F.imageCredit]: text(twin.imageCredit),
    [F.imageAlt]: text(twin.title),
    [F.imageStatus]: select(twin.imageStatus || IMAGE_STATUS.official),
    [F.imageRights]: text(`Repris de la fiche « ${twin.title} » (même spectacle)`),
    [F.imageChecked]: { date: { start: today } },
  }
}

export function noImageProperties(reason: string, today: string): Record<string, unknown> {
  return {
    [F.imageStatus]: select(IMAGE_STATUS.none),
    [F.imageRights]: text(reason),
    [F.imageChecked]: { date: { start: today } },
  }
}

export async function createAgendaPage(
  client: NotionClient,
  dataSourceId: string,
  event: CollectedEvent,
  decision: PublicationDecision,
  fp: string,
  today: string
) {
  return client.request<NotionPage>("pages", {
    method: "POST",
    body: JSON.stringify({
      parent: { type: "data_source_id", data_source_id: dataSourceId },
      properties: {
        ...sourceProperties(event, fp, today),
        [F.type]: select(event.type),
        [F.season]: select(seasonOf(dayOf(event.startDate))),
        [F.statusInfo]: select("Programmation confirmée"),
        [F.origin]: select(ORIGIN_AUTO),
        [F.publication]: select(decision.status),
        [F.pendingReason]: text(decision.reasons.join(" · ")),
        [F.lastChange]: text(`${today} : fiche créée par la collecte`),
        ...sourceImageProperties(event, today),
      },
    }),
  })
}

export async function updatePageProperties(client: NotionClient, pageId: string, properties: Record<string, unknown>) {
  return client.request<NotionPage>(`pages/${pageId}`, { method: "PATCH", body: JSON.stringify({ properties }) })
}

export const props = { text, url, num, select }

// ─── Journal des collectes ────────────────────────────────────────────────────

export const L = {
  title: "Collecte",
  started: "Début",
  finished: "Fin",
  trigger: "Déclenchement",
  mode: "Mode",
  status: "Statut",
  sources: "Sources consultées",
  received: "Entrées reçues",
  created: "Nouvelles publiées",
  createdPending: "Nouvelles en attente",
  updated: "Mises à jour",
  unchanged: "Inchangées",
  duplicates: "Doublons",
  archived: "Archivées",
  missing: "Disparues de la source",
  pendingTotal: "En attente (total)",
  imagesAdded: "Images ajoutées",
  imagesMissing: "Sans image",
  errors: "Erreurs",
} as const

export function logDatabaseId(): string {
  return process.env.NOTION_COLLECTE_LOG_DATABASE_ID || DEFAULT_LOG_DATABASE_ID
}

export async function createRunEntry(client: NotionClient, logDsId: string, report: RunReport) {
  return client.request<NotionPage>("pages", {
    method: "POST",
    body: JSON.stringify({
      parent: { type: "data_source_id", data_source_id: logDsId },
      properties: runProperties(report),
    }),
  })
}

export async function updateRunEntry(client: NotionClient, pageId: string, report: RunReport) {
  await updatePageProperties(client, pageId, runProperties(report))
  if (report.actions.length) {
    const lines = report.actions.slice(0, 90)
    if (report.actions.length > lines.length) lines.push(`… et ${report.actions.length - lines.length} autres actions`)
    await client.request(`blocks/${pageId}/children`, {
      method: "PATCH",
      body: JSON.stringify({
        children: lines.map((line) => ({
          object: "block",
          type: "bulleted_list_item",
          bulleted_list_item: { rich_text: [{ type: "text", text: { content: line.slice(0, 1990) } }] },
        })),
      }),
    })
  }
}

function runProperties(report: RunReport) {
  const c = report.counters
  const label = new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris",
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(report.startedAt))
  return {
    [L.title]: { title: [{ type: "text", text: { content: `Collecte du ${label}${report.dryRun ? " (à blanc)" : ""}` } }] },
    [L.started]: { date: { start: report.startedAt } },
    [L.finished]: { date: report.finishedAt ? { start: report.finishedAt } : null },
    [L.trigger]: select(report.trigger),
    [L.mode]: select(report.dryRun ? "À blanc" : "Réelle"),
    [L.status]: select(report.status),
    [L.sources]: num(c.sourcesConsulted),
    [L.received]: num(c.received),
    [L.created]: num(c.created),
    [L.createdPending]: num(c.createdPending),
    [L.updated]: num(c.updated),
    [L.unchanged]: num(c.unchanged),
    [L.duplicates]: num(c.duplicates),
    [L.archived]: num(c.archived),
    [L.missing]: num(c.missingFromSource),
    [L.pendingTotal]: num(c.pendingTotal),
    [L.imagesAdded]: num(c.imagesAdded),
    [L.imagesMissing]: num(c.imagesMissing),
    [L.errors]: text(report.errors.join(" · ")),
  }
}

export type RunSummary = {
  id: string
  url: string
  title: string
  startedAt: string
  finishedAt: string
  trigger: string
  mode: string
  status: RunStatus | string
  counters: Record<string, number>
  errors: string
}

export async function listRuns(client: NotionClient, logDsId: string, limit = 20): Promise<RunSummary[]> {
  const data = await client.request<{ results: NotionPage[] }>(`data_sources/${logDsId}/query`, {
    method: "POST",
    body: JSON.stringify({ page_size: limit, sorts: [{ property: L.started, direction: "descending" }] }),
  })
  return data.results.map((p) => {
    const pr = p.properties || {}
    const n = (name: string) => (typeof pr[name]?.number === "number" ? pr[name].number : 0)
    return {
      id: p.id,
      url: p.url ?? "",
      title: readText(pr[L.title]),
      startedAt: pr[L.started]?.date?.start ?? "",
      finishedAt: pr[L.finished]?.date?.start ?? "",
      trigger: readText(pr[L.trigger]),
      mode: readText(pr[L.mode]),
      status: readText(pr[L.status]),
      counters: {
        sources: n(L.sources),
        received: n(L.received),
        created: n(L.created),
        createdPending: n(L.createdPending),
        updated: n(L.updated),
        unchanged: n(L.unchanged),
        duplicates: n(L.duplicates),
        archived: n(L.archived),
        missing: n(L.missing),
        pendingTotal: n(L.pendingTotal),
        imagesAdded: n(L.imagesAdded),
        imagesMissing: n(L.imagesMissing),
      },
      errors: readText(pr[L.errors]),
    }
  })
}
