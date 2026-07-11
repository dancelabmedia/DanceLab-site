import { NextResponse } from "next/server"
import type { AgendaCategory, AgendaEvent, AgendaStatus } from "../../agenda/agenda-data"
import { agendaEvents } from "../../agenda/agenda-data"

export const dynamic = "force-dynamic"

const NOTION_VERSION = "2022-06-28"
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
  email?: string | null
  phone_number?: string | null
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
  url?: string
  properties: Record<string, NotionProperty>
}

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

function findProperty(properties: Record<string, NotionProperty>, aliases: string[]) {
  const normalizedAliases = aliases.map((alias) => alias.toLowerCase())
  const entry = Object.entries(properties).find(([name]) => normalizedAliases.includes(name.toLowerCase()))

  if (entry) return entry[1]

  return Object.values(properties).find((property) => {
    if (aliases.includes("title") && property.type === "title") return true
    if (aliases.includes("date") && property.type === "date") return true
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
  if (property.type === "email") return property.email || ""
  if (property.type === "phone_number") return property.phone_number || ""
  if (property.type === "number") return typeof property.number === "number" ? String(property.number) : ""
  if (property.type === "checkbox") return property.checkbox ? "Oui" : "Non"
  if (property.type === "formula") {
    if (typeof property.formula?.string === "string") return property.formula.string
    if (typeof property.formula?.number === "number") return String(property.formula.number)
    if (typeof property.formula?.boolean === "boolean") return property.formula.boolean ? "Oui" : "Non"
  }

  return ""
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
  const normalized = value.toLowerCase()
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
  const normalized = value.toLowerCase()
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

function normalizeNotionPage(page: NotionPage): AgendaEvent | null {
  const properties = page.properties
  const title = getText(findProperty(properties, ["title", "Titre", "Nom", "Name", "Événement", "Evenement", "Event"]))

  if (!title) return null

  const date = getDate(findProperty(properties, ["date", "Date", "Dates", "Période", "Periode", "Quand"]))
  const startDate = date?.start?.slice(0, 10) || "9999-12-31"
  const endDate = date?.end?.slice(0, 10) || undefined

  const category = normalizeCategory(getText(findProperty(properties, ["Type", "Catégorie", "Categorie", "Category"])))
  const status = normalizeStatus(
    getText(findProperty(properties, ["Statut", "Status", "État", "Etat"])),
    startDate,
    endDate
  )
  const officialUrl =
    getText(findProperty(properties, ["Lien", "URL", "Lien officiel", "Site", "OfficialUrl"])) || page.url || ""
  const ticketUrl = getText(findProperty(properties, ["Billetterie", "Réservation", "Reservation", "Ticket", "Tickets"]))
  const source = getText(findProperty(properties, ["Source", "Organisateur", "Organizer"])) || "Notion"
  const latitude = Number(getText(findProperty(properties, ["Latitude", "lat"])))
  const longitude = Number(getText(findProperty(properties, ["Longitude", "lng", "lon"])))
  const image = getCoverUrl(page, findProperty(properties, ["Image", "Photo", "Affiche", "Visuel", "Cover"]))

  const event: AgendaEvent = {
    slug: slugify(`${title}-${startDate}`),
    title,
    description:
      getText(findProperty(properties, ["Description", "Résumé", "Resume", "Texte", "Notes"])) || "À compléter",
    image: image || undefined,
    dates: date?.start ? "Date renseignée" : "À compléter",
    startDate,
    endDate,
    venue: getText(findProperty(properties, ["Lieu", "Salle", "Venue", "Théâtre", "Theatre"])) || "À compléter",
    address: getText(findProperty(properties, ["Adresse", "Address"])) || undefined,
    city: getText(findProperty(properties, ["Ville", "City", "Commune"])) || "À compléter",
    postalCode: getText(findProperty(properties, ["Code postal", "CP", "PostalCode"])) || undefined,
    latitude: Number.isFinite(latitude) ? latitude : undefined,
    longitude: Number.isFinite(longitude) ? longitude : undefined,
    price: getText(findProperty(properties, ["Prix", "Tarif", "Tarifs", "Price"])) || "À compléter",
    category,
    officialUrl,
    ticketUrl: ticketUrl || undefined,
    source,
    sourceLabel: source,
    lastVerifiedAt:
      getText(findProperty(properties, ["Dernière vérification", "Derniere verification", "Vérifié le", "Verifie le"])) ||
      todayIso(),
    status,
  }

  return event
}

async function fetchAllNotionPages() {
  if (!NOTION_TOKEN) return null

  const pages: NotionPage[] = []
  let startCursor: string | undefined

  do {
    const response = await fetch(`https://api.notion.com/v1/databases/${NOTION_DATABASE_ID}/query`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${NOTION_TOKEN}`,
        "Content-Type": "application/json",
        "Notion-Version": NOTION_VERSION,
      },
      body: JSON.stringify({
        page_size: 100,
        start_cursor: startCursor,
      }),
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`Notion API error: ${response.status}`)
    }

    const data = await response.json()
    pages.push(...(data.results as NotionPage[]))
    startCursor = data.has_more ? data.next_cursor : undefined
  } while (startCursor)

  return pages
}

function sortEvents(events: AgendaEvent[]) {
  return [...events].sort((a, b) => a.startDate.localeCompare(b.startDate))
}

export async function GET() {
  try {
    const notionPages = await fetchAllNotionPages()
    const events = notionPages
      ? notionPages
          .map(normalizeNotionPage)
          .filter((event): event is AgendaEvent => Boolean(event))
          .filter((event) => !isPastEvent(event))
      : agendaEvents.filter((event) => !isPastEvent(event))

    return NextResponse.json({
      source: notionPages ? "notion" : "fallback",
      events: sortEvents(events),
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({
      source: "fallback",
      error: "notion_unavailable",
      events: sortEvents(agendaEvents.filter((event) => !isPastEvent(event))),
    })
  }
}
