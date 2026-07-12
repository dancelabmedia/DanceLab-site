import { NextResponse } from "next/server"
import type { AgendaCategory, AgendaEvent, AgendaStatus } from "../../agenda/agenda-data"

export const dynamic = "force-dynamic"

const NOTION_VERSION = "2025-09-03"
const DEFAULT_DATABASE_ID = "c06a1552cfcc4522ae68d32f833b3cf3"
const NOTION_TOKEN = process.env.NOTION_TOKEN || process.env.NOTION_API_KEY
const NOTION_DATABASE_ID = process.env.NOTION_AGENDA_DATABASE_ID || DEFAULT_DATABASE_ID

type NotionProperty = {
  type: string
  title?: Array<{ plain_text?: string }>
  rich_text?: Array<{ plain_text?: string }>
  select?: { name?: string } | null
  status?: { name?: string } | null
  multi_select?: Array<{ name?: string }>
  date?: { start?: string; end?: string | null } | null
  url?: string | null
  number?: number | null
  checkbox?: boolean
  files?: Array<{ type: "external" | "file"; name?: string; external?: { url?: string }; file?: { url?: string } }>
  formula?: {
    type: string
    string?: string | null
    number?: number | null
    boolean?: boolean | null
    date?: { start?: string; end?: string | null } | null
  }
}

type NotionPage = {
  id: string
  cover?: { type: "external" | "file"; external?: { url?: string }; file?: { url?: string } } | null
  properties: Record<string, NotionProperty>
}

type NotionApiError = {
  code?: string
  message?: string
}

type NotionDatabaseResponse = {
  data_sources?: Array<{ id: string; name?: string }>
}

class NotionRequestError extends Error {
  status: number
  code?: string

  constructor(status: number, code: string | undefined, message: string) {
    super(message)
    this.status = status
    this.code = code
  }
}

const GEOCODE_CACHE = new Map<string, { latitude: number; longitude: number } | null>()

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

function normalizeName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
}

function findProperty(properties: Record<string, NotionProperty>, aliases: string[]) {
  const normalizedAliases = aliases.map(normalizeName)
  const entry = Object.entries(properties).find(([name]) => normalizedAliases.includes(normalizeName(name)))

  if (entry) return entry[1]

  return Object.values(properties).find((property) => {
    if (normalizedAliases.includes("title") && property.type === "title") return true
    if (normalizedAliases.includes("date") && property.type === "date") return true
    return false
  })
}

function getText(property?: NotionProperty) {
  if (!property) return ""

  if (property.type === "title") return property.title?.map((item) => item.plain_text || "").join("").trim() || ""
  if (property.type === "rich_text") return property.rich_text?.map((item) => item.plain_text || "").join("").trim() || ""
  if (property.type === "select") return property.select?.name || ""
  if (property.type === "status") return property.status?.name || ""
  if (property.type === "multi_select") return property.multi_select?.map((item) => item.name).filter(Boolean).join(", ") || ""
  if (property.type === "url") return property.url || ""
  if (property.type === "number") return typeof property.number === "number" ? String(property.number) : ""
  if (property.type === "checkbox") return property.checkbox ? "Oui" : "Non"
  if (property.type === "formula") {
    if (typeof property.formula?.string === "string") return property.formula.string
    if (typeof property.formula?.number === "number") return String(property.formula.number)
    if (typeof property.formula?.boolean === "boolean") return property.formula.boolean ? "Oui" : "Non"
  }

  return ""
}

function getNumber(property?: NotionProperty) {
  const parsed = Number(getText(property).replace(",", "."))
  return Number.isFinite(parsed) ? parsed : undefined
}

function getDate(property?: NotionProperty) {
  if (!property) return null
  if (property.type === "date") return property.date ?? null
  if (property.type === "formula" && property.formula?.type === "date") return property.formula.date ?? null
  return null
}

function getFileUrl(property?: NotionProperty) {
  const file = property?.files?.[0]
  if (!file) return ""
  return file.type === "external" ? file.external?.url || "" : file.file?.url || ""
}

function getCoverUrl(page: NotionPage, imageProperty?: NotionProperty) {
  const imageFromProperty = getFileUrl(imageProperty)
  if (imageFromProperty) return imageFromProperty
  if (!page.cover) return ""
  return page.cover.type === "external" ? page.cover.external?.url || "" : page.cover.file?.url || ""
}

function normalizeCategory(value: string): AgendaCategory {
  const normalized = normalizeName(value)
  if (normalized.includes("festival")) return "Festival"
  if (normalized.includes("battle")) return "Battle"
  if (normalized.includes("atelier") || normalized.includes("stage")) return "Atelier"
  if (normalized.includes("rue")) return "Arts de rue"
  if (normalized.includes("ballet")) return "Ballet"
  if (normalized.includes("performance")) return "Performance"
  if (normalized.includes("rencontre")) return "Rencontre"
  return "Spectacle"
}

function normalizeStatus(value: string, startDate: string, endDate?: string): AgendaStatus {
  const normalized = normalizeName(value)
  if (normalized.includes("annul")) return "Annulé"
  if (normalized.includes("report")) return "Reporté"
  if (normalized.includes("complet")) return "Complet"

  const today = todayIso()
  if (endDate && endDate >= today && startDate <= today) return "En cours"
  if (startDate <= today && (!endDate || endDate >= today)) return "En cours"
  return "À venir"
}

function isPastEvent(event: AgendaEvent) {
  const today = todayIso()
  return Boolean(event.endDate ? event.endDate < today : event.startDate < today)
}

function getCoordinatesFromProperties(properties: Record<string, NotionProperty>) {
  const latitude = getNumber(findProperty(properties, ["Latitude", "lat"]))
  const longitude = getNumber(findProperty(properties, ["Longitude", "lng", "lon"]))
  const combined = getText(findProperty(properties, ["Coordonnées", "Coordonnees", "Coordinates", "GPS", "Géolocalisation", "Geolocalisation"]))

  if (typeof latitude === "number" && typeof longitude === "number") {
    return { latitude, longitude }
  }

  const match = combined.match(/(-?\d+(?:[.,]\d+)?)\s*[,;]\s*(-?\d+(?:[.,]\d+)?)/)
  if (!match) return {}

  const parsedLatitude = Number(match[1].replace(",", "."))
  const parsedLongitude = Number(match[2].replace(",", "."))

  if (!Number.isFinite(parsedLatitude) || !Number.isFinite(parsedLongitude)) return {}
  return { latitude: parsedLatitude, longitude: parsedLongitude }
}

function getAdditionalInfo(properties: Record<string, NotionProperty>) {
  const aliases = new Set([
    "informations complementaires",
    "information complementaire",
    "infos",
    "infos pratiques",
    "public",
    "duree",
    "durée",
    "accessibilite",
    "accessibilité",
    "compagnie",
    "artiste",
    "organisateur",
  ])

  return Object.entries(properties)
    .map(([label, property]) => ({ label, value: getText(property) }))
    .filter((item) => item.value && aliases.has(normalizeName(item.label)))
}

function normalizeNotionPage(page: NotionPage): AgendaEvent | null {
  const properties = page.properties
  const title = getText(findProperty(properties, ["title", "Titre", "Nom", "Name", "Événement", "Evenement", "Event", "Nom de l'événement", "Nom de l’événement"]))

  if (!title) return null

  const date = getDate(findProperty(properties, ["date", "Date", "Dates", "Période", "Periode", "Quand", "Début", "Debut"]))
  const startDate = date?.start?.slice(0, 10) || "9999-12-31"
  const endDate = date?.end?.slice(0, 10) || undefined
  const address = getText(findProperty(properties, ["Adresse", "Address", "Adresse complète", "Adresse complete"])) || undefined
  const city = getText(findProperty(properties, ["Ville", "City", "Commune"])) || "À compléter"
  const postalCode = getText(findProperty(properties, ["Code postal", "CP", "PostalCode"])) || undefined
  const venue = getText(findProperty(properties, ["Lieu", "Salle", "Venue", "Théâtre", "Theatre"])) || "À compléter"
  const coordinates = getCoordinatesFromProperties(properties)
  const source = getText(findProperty(properties, ["Source", "Organisateur", "Organizer"])) || "Notion"
  const ticketUrl = getText(findProperty(properties, ["Billetterie", "Réservation", "Reservation", "Ticket", "Tickets"]))
  const officialUrl = getText(findProperty(properties, ["Lien", "URL", "Lien officiel", "Site", "OfficialUrl", "Page officielle"])) || ""
  const image = getCoverUrl(page, findProperty(properties, ["Image", "Photo", "Affiche", "Visuel", "Cover"]))

  return {
    slug: slugify(`${title}-${startDate}`),
    title,
    description: getText(findProperty(properties, ["Description", "Résumé", "Resume", "Texte", "Notes"])) || "À compléter",
    image: image || undefined,
    dates: date?.start ? "Date renseignée" : "À compléter",
    startDate,
    endDate,
    venue,
    address,
    city,
    postalCode,
    latitude: coordinates.latitude,
    longitude: coordinates.longitude,
    price: getText(findProperty(properties, ["Prix", "Tarif", "Tarifs", "Price"])) || "À compléter",
    time: getText(findProperty(properties, ["Horaires", "Horaire", "Heure", "Heures", "Time"])) || undefined,
    category: normalizeCategory(getText(findProperty(properties, ["Type", "Catégorie", "Categorie", "Category"]))),
    officialUrl,
    ticketUrl: ticketUrl || undefined,
    additionalInfo: getAdditionalInfo(properties),
    source,
    sourceLabel: source,
    lastVerifiedAt: getText(findProperty(properties, ["Dernière vérification", "Derniere verification", "Vérifié le", "Verifie le"])) || todayIso(),
    status: normalizeStatus(getText(findProperty(properties, ["Statut", "Status", "État", "Etat"])), startDate, endDate),
  }
}

async function notionRequest<T>(path: string, init?: RequestInit) {
  const response = await fetch(`https://api.notion.com/v1/${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${NOTION_TOKEN}`,
      "Content-Type": "application/json",
      "Notion-Version": NOTION_VERSION,
      ...(init?.headers || {}),
    },
    cache: "no-store",
  })

  if (!response.ok) {
    const error = (await response.json().catch(() => ({}))) as NotionApiError
    throw new NotionRequestError(response.status, error.code, error.message || `Notion API error: ${response.status}`)
  }

  return (await response.json()) as T
}

async function resolveDataSourceId() {
  const database = await notionRequest<NotionDatabaseResponse>(`databases/${NOTION_DATABASE_ID}`, { method: "GET" })
  return database.data_sources?.[0]?.id || NOTION_DATABASE_ID
}

async function fetchAllNotionPages() {
  if (!NOTION_TOKEN) throw new Error("Missing NOTION_TOKEN")

  const dataSourceId = await resolveDataSourceId()
  const pages: NotionPage[] = []
  let startCursor: string | undefined

  do {
    const data = await notionRequest<{ results: NotionPage[]; has_more: boolean; next_cursor?: string | null }>(
      `data_sources/${dataSourceId}/query`,
      {
        method: "POST",
        body: JSON.stringify({
          page_size: 100,
          start_cursor: startCursor,
        }),
      }
    )

    pages.push(...data.results)
    startCursor = data.has_more ? data.next_cursor || undefined : undefined
  } while (startCursor)

  return pages
}

function sortEvents(events: AgendaEvent[]) {
  return [...events].sort((a, b) => a.startDate.localeCompare(b.startDate))
}

function getGeocodeQuery(event: AgendaEvent) {
  if (!event.city || event.city === "À compléter") return ""
  return [event.address, event.postalCode, event.city, "France"].filter(Boolean).join(", ")
}

async function geocodeEvent(event: AgendaEvent) {
  if (typeof event.latitude === "number" && typeof event.longitude === "number") return event

  const query = getGeocodeQuery(event)
  if (!query) return event

  if (GEOCODE_CACHE.has(query)) {
    const cached = GEOCODE_CACHE.get(query)
    return cached ? { ...event, latitude: cached.latitude, longitude: cached.longitude } : event
  }

  try {
    const params = new URLSearchParams({
      q: query,
      format: "json",
      limit: "1",
      countrycodes: "fr",
    })

    const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
      headers: {
        Accept: "application/json",
        "Accept-Language": "fr",
        "User-Agent": "DanceLabAgenda/1.0",
      },
      cache: "no-store",
    })

    if (!response.ok) throw new Error("Geocoding unavailable")

    const results = (await response.json()) as Array<{ lat?: string; lon?: string }>
    const latitude = Number(results[0]?.lat)
    const longitude = Number(results[0]?.lon)

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      GEOCODE_CACHE.set(query, null)
      return event
    }

    GEOCODE_CACHE.set(query, { latitude, longitude })
    return { ...event, latitude, longitude }
  } catch {
    GEOCODE_CACHE.set(query, null)
    return event
  }
}

async function enrichEventsWithCoordinates(events: AgendaEvent[]) {
  const enriched: AgendaEvent[] = []

  for (const event of events) {
    enriched.push(await geocodeEvent(event))
  }

  return enriched
}

export async function GET() {
  try {
    const notionPages = await fetchAllNotionPages()
    const events = notionPages
      .map(normalizeNotionPage)
      .filter((event): event is AgendaEvent => Boolean(event))
      .filter((event) => !isPastEvent(event))

    return NextResponse.json({
      source: "notion",
      events: sortEvents(await enrichEventsWithCoordinates(events)),
    })
  } catch (error) {
    console.error(error)
    const detail =
      error instanceof NotionRequestError
        ? { status: error.status, code: error.code, message: error.message }
        : { message: error instanceof Error ? error.message : "Unknown Notion error" }

    return NextResponse.json({
      source: "notion",
      error: "notion_unavailable",
      detail,
      events: [],
    })
  }
}
