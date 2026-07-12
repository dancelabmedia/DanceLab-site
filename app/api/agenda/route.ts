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
type VenueFallback = {
  venue: string
  address: string
  city: string
  postalCode: string
  latitude: number
  longitude: number
  officialUrl?: string
}

const VENUE_DIRECTORY: Record<string, VenueFallback> = {
  "crazy horse": {
    venue: "Crazy Horse",
    address: "12 avenue George V",
    city: "Paris",
    postalCode: "75008",
    latitude: 48.865833,
    longitude: 2.301667,
    officialUrl: "https://www.lecrazyhorseparis.com/",
  },
  "moulin rouge": {
    venue: "Moulin Rouge",
    address: "82 boulevard de Clichy",
    city: "Paris",
    postalCode: "75018",
    latitude: 48.88413,
    longitude: 2.33228,
    officialUrl: "https://www.moulinrouge.fr/",
  },
  "theatre mogador": {
    venue: "Théâtre Mogador",
    address: "25 rue de Mogador",
    city: "Paris",
    postalCode: "75009",
    latitude: 48.87519,
    longitude: 2.33159,
    officialUrl: "https://www.theatremogador.com/",
  },
  "mogador": {
    venue: "Théâtre Mogador",
    address: "25 rue de Mogador",
    city: "Paris",
    postalCode: "75009",
    latitude: 48.87519,
    longitude: 2.33159,
    officialUrl: "https://www.theatremogador.com/",
  },
  "paradis latin": {
    venue: "Paradis Latin",
    address: "28 rue du Cardinal Lemoine",
    city: "Paris",
    postalCode: "75005",
    latitude: 48.848055,
    longitude: 2.352973,
    officialUrl: "https://www.paradislatin.com/",
  },
  "palais garnier": {
    venue: "Palais Garnier",
    address: "Place de l'Opéra",
    city: "Paris",
    postalCode: "75009",
    latitude: 48.87197,
    longitude: 2.3316,
    officialUrl: "https://www.operadeparis.fr/",
  },
  "opera bastille": {
    venue: "Opéra Bastille",
    address: "Place de la Bastille",
    city: "Paris",
    postalCode: "75012",
    latitude: 48.85299,
    longitude: 2.36992,
    officialUrl: "https://www.operadeparis.fr/",
  },
  "atelier de paris cdcn": {
    venue: "Atelier de Paris CDCN",
    address: "2 route du Champ de Manoeuvre",
    city: "Paris",
    postalCode: "75012",
    latitude: 48.83392,
    longitude: 2.45548,
    officialUrl: "https://www.atelierdeparis.org/",
  },
  "theatre de la ville": {
    venue: "Théâtre de la Ville",
    address: "2 place du Châtelet",
    city: "Paris",
    postalCode: "75004",
    latitude: 48.8575,
    longitude: 2.3471,
    officialUrl: "https://www.theatredelaville-paris.com/",
  },
  "theatre des abbesses": {
    venue: "Théâtre des Abbesses",
    address: "31 rue des Abbesses",
    city: "Paris",
    postalCode: "75018",
    latitude: 48.88458,
    longitude: 2.3387,
    officialUrl: "https://www.theatredelaville-paris.com/",
  },
  "chaillot": {
    venue: "Chaillot - Théâtre national de la Danse",
    address: "1 place du Trocadéro",
    city: "Paris",
    postalCode: "75116",
    latitude: 48.86286,
    longitude: 2.28828,
    officialUrl: "https://www.theatre-chaillot.fr/",
  },
  "cnd pantin": {
    venue: "Centre national de la danse",
    address: "1 rue Victor Hugo",
    city: "Pantin",
    postalCode: "93500",
    latitude: 48.89376,
    longitude: 2.40398,
    officialUrl: "https://www.cnd.fr/",
  },
  "centquatre": {
    venue: "CENTQUATRE-PARIS",
    address: "5 rue Curial",
    city: "Paris",
    postalCode: "75019",
    latitude: 48.89068,
    longitude: 2.37076,
    officialUrl: "https://www.104.fr/",
  },
  "carreau du temple": {
    venue: "Carreau du Temple",
    address: "4 rue Eugène Spuller",
    city: "Paris",
    postalCode: "75003",
    latitude: 48.86496,
    longitude: 2.36056,
    officialUrl: "https://www.carreaudutemple.eu/",
  },
  "la cigale": {
    venue: "La Cigale",
    address: "120 boulevard de Rochechouart",
    city: "Paris",
    postalCode: "75018",
    latitude: 48.8823,
    longitude: 2.34037,
    officialUrl: "https://www.lacigale.fr/",
  },
  "theatre des champs-elysees": {
    venue: "Théâtre des Champs-Élysées",
    address: "15 avenue Montaigne",
    city: "Paris",
    postalCode: "75008",
    latitude: 48.86572,
    longitude: 2.30261,
    officialUrl: "https://www.theatrechampselysees.fr/",
  },
  "mac creteil": {
    venue: "MAC Créteil",
    address: "1 place Salvador Allende",
    city: "Créteil",
    postalCode: "94000",
    latitude: 48.77972,
    longitude: 2.45495,
    officialUrl: "https://www.maccreteil.com/",
  },
  "theatre de la bastille": {
    venue: "Théâtre de la Bastille",
    address: "76 rue de la Roquette",
    city: "Paris",
    postalCode: "75011",
    latitude: 48.85508,
    longitude: 2.37387,
    officialUrl: "https://www.theatre-bastille.com/",
  },
  "palais des congres": {
    venue: "Palais des Congrès de Paris",
    address: "2 place de la Porte Maillot",
    city: "Paris",
    postalCode: "75017",
    latitude: 48.87817,
    longitude: 2.28328,
    officialUrl: "https://www.viparis.com/",
  },
  "la briqueterie cdcn": {
    venue: "La Briqueterie CDCN",
    address: "17 rue Robert Degert",
    city: "Vitry-sur-Seine",
    postalCode: "94400",
    latitude: 48.79382,
    longitude: 2.39246,
    officialUrl: "https://www.alabriqueterie.com/",
  },
  "casino de paris": {
    venue: "Casino de Paris",
    address: "16 rue de Clichy",
    city: "Paris",
    postalCode: "75009",
    latitude: 48.87818,
    longitude: 2.33023,
    officialUrl: "https://www.casinodeparis.fr/",
  },
  "theatre du chatelet": {
    venue: "Théâtre du Châtelet",
    address: "2 rue Edouard Colonne",
    city: "Paris",
    postalCode: "75001",
    latitude: 48.85778,
    longitude: 2.34695,
    officialUrl: "https://www.chatelet.com/",
  },
  "la seine musicale": {
    venue: "La Seine Musicale",
    address: "Île Seguin",
    city: "Boulogne-Billancourt",
    postalCode: "92100",
    latitude: 48.82798,
    longitude: 2.23051,
    officialUrl: "https://www.laseinemusicale.com/",
  },
  "cinematheque francaise": {
    venue: "Cinémathèque française",
    address: "51 rue de Bercy",
    city: "Paris",
    postalCode: "75012",
    latitude: 48.83702,
    longitude: 2.38296,
    officialUrl: "https://www.cinematheque.fr/",
  },
  "theatre du rond-point": {
    venue: "Théâtre du Rond-Point",
    address: "2 bis avenue Franklin D. Roosevelt",
    city: "Paris",
    postalCode: "75008",
    latitude: 48.86637,
    longitude: 2.31019,
    officialUrl: "https://www.theatredurondpoint.fr/",
  },
  "grande halle de la villette": {
    venue: "Grande Halle de la Villette",
    address: "211 avenue Jean Jaurès",
    city: "Paris",
    postalCode: "75019",
    latitude: 48.88953,
    longitude: 2.39378,
    officialUrl: "https://lavillette.com/",
  },
  "le trianon": {
    venue: "Le Trianon",
    address: "80 boulevard de Rochechouart",
    city: "Paris",
    postalCode: "75018",
    latitude: 48.88248,
    longitude: 2.34311,
    officialUrl: "https://www.letrianon.fr/",
  },
  "folies bergere": {
    venue: "Folies Bergère",
    address: "32 rue Richer",
    city: "Paris",
    postalCode: "75009",
    latitude: 48.87455,
    longitude: 2.34444,
    officialUrl: "https://www.foliesbergere.com/",
  },
  "accor arena": {
    venue: "Accor Arena",
    address: "8 boulevard de Bercy",
    city: "Paris",
    postalCode: "75012",
    latitude: 48.83869,
    longitude: 2.37861,
    officialUrl: "https://www.accorarena.com/",
  },
  "palais de tokyo": {
    venue: "Palais de Tokyo",
    address: "13 avenue du Président Wilson",
    city: "Paris",
    postalCode: "75116",
    latitude: 48.86408,
    longitude: 2.29764,
    officialUrl: "https://www.palaisdetokyo.com/",
  },
  "micadanses": {
    venue: "Micadanses",
    address: "15 rue Geoffroy l'Asnier",
    city: "Paris",
    postalCode: "75004",
    latitude: 48.85519,
    longitude: 2.35659,
    officialUrl: "https://www.micadanses.com/",
  },
  "theatre de vanves": {
    venue: "Théâtre de Vanves",
    address: "12 rue Sadi Carnot",
    city: "Vanves",
    postalCode: "92170",
    latitude: 48.82078,
    longitude: 2.28948,
    officialUrl: "https://www.theatre-vanves.fr/",
  },
  "theatre suresnes jean vilar": {
    venue: "Théâtre de Suresnes Jean Vilar",
    address: "16 place Stalingrad",
    city: "Suresnes",
    postalCode: "92150",
    latitude: 48.87069,
    longitude: 2.22971,
    officialUrl: "https://www.theatre-suresnes.fr/",
  },
  "musee d'orsay": {
    venue: "Musée d'Orsay",
    address: "1 rue de la Légion d'Honneur",
    city: "Paris",
    postalCode: "75007",
    latitude: 48.86,
    longitude: 2.32658,
    officialUrl: "https://www.musee-orsay.fr/",
  },
  "fondation cartier": {
    venue: "Fondation Cartier pour l'art contemporain",
    address: "261 boulevard Raspail",
    city: "Paris",
    postalCode: "75014",
    latitude: 48.83773,
    longitude: 2.33187,
    officialUrl: "https://www.fondationcartier.com/",
  },
  "bibliotheque-musee de l'opera": {
    venue: "Bibliothèque-musée de l'Opéra",
    address: "Place de l'Opéra",
    city: "Paris",
    postalCode: "75009",
    latitude: 48.87197,
    longitude: 2.3316,
    officialUrl: "https://www.bnf.fr/",
  },
  "cn costume et scene moulins": {
    venue: "Centre national du costume et de la scène",
    address: "Quartier Villars, route de Montilly",
    city: "Moulins",
    postalCode: "03000",
    latitude: 46.56453,
    longitude: 3.32168,
    officialUrl: "https://www.cncs.fr/",
  }
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


function getVenueFallback(title: string, venue: string) {
  const haystack = normalizeName(`${venue} ${title}`)

  return Object.entries(VENUE_DIRECTORY).find(([key]) => haystack.includes(key))?.[1]
}

function applyVenueFallback(event: AgendaEvent) {
  const fallback = getVenueFallback(event.title, event.venue)

  if (!fallback) return event

  return {
    ...event,
    venue: event.venue === "À compléter" || event.venue === "À confirmer" ? fallback.venue : event.venue,
    address: event.address || fallback.address,
    city: event.city === "À compléter" ? fallback.city : event.city,
    postalCode: event.postalCode || fallback.postalCode,
    latitude: typeof event.latitude === "number" ? event.latitude : fallback.latitude,
    longitude: typeof event.longitude === "number" ? event.longitude : fallback.longitude,
    officialUrl: event.officialUrl || fallback.officialUrl || "",
  }
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

  const event: AgendaEvent = {
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

  return applyVenueFallback(event)
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
