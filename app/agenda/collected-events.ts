import collectedEvents from "../../collecte/dance_lab_tous_evenements.json"
import type { AgendaCategory, AgendaEvent, AgendaStatus } from "./agenda-data"
import { resolveAgendaImage } from "../../data/agenda-image-overrides"

type CollectedEvent = (typeof collectedEvents)[number]

const EMPTY_VALUES = new Set(["", "non renseigné", "non renseigne", "null", "undefined"])

const CATEGORY_MAP: Record<string, AgendaCategory> = {
  "Spectacle / représentation": "Spectacle",
  "Cours / atelier": "Cours / atelier",
  "Festival": "Festival",
  "Conférence / rencontre": "Conférence / rencontre",
  "Stage / workshop / masterclass": "Stage / workshop",
  "Bal / soirée dansante": "Bal / soirée",
  "Battle / compétition": "Battle",
  "Exposition": "Exposition",
}

function normalizeDashes(value: string) {
  // Remplace les tirets longs (—) et demi-longs (–) par un tiret simple " - "
  // Ne touche pas aux traits d'union dans les mots composés (sans espace autour)
  return value.replace(/\s*[—–]\s*/g, " - ").replace(/\s{2,}/g, " ")
}

function clean(value?: string) {
  const trimmed = normalizeDashes(value?.trim() ?? "")
  return EMPTY_VALUES.has(trimmed.toLocaleLowerCase("fr")) ? undefined : trimmed
}

function isoDate(value?: string) {
  const normalized = clean(value)?.slice(0, 10)
  return normalized && /^\d{4}-\d{2}-\d{2}$/.test(normalized) ? normalized : undefined
}

function numberValue(value?: string) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function statusAt(startDate: string, endDate: string | undefined, asOf: string): AgendaStatus {
  if (startDate <= asOf && (endDate ?? startDate) >= asOf) return "En cours"
  return "À venir"
}

function priceLabel(item: CollectedEvent) {
  const detail = clean(item.tarif_detail)
  if (detail) return detail
  if (item.tarif_type === "gratuit") return "Gratuit"
  if (item.tarif_type === "gratuit sous condition") return "Gratuit sous condition"
  return "Payant - détails sur la page officielle"
}

function formatProchainSeance(value?: string): string | undefined {
  const cleaned = clean(value)
  if (!cleaned) return undefined
  // Extract HH:MM from ISO datetime e.g. "2026-10-12T09:00:00+02:00"
  const match = cleaned.match(/T(\d{2}):(\d{2})/)
  if (!match) return undefined
  const h = match[1]
  const m = match[2]
  return m === "00" ? `${h}h` : `${h}h${m}`
}

function cleanHoraires(value?: string): string | undefined {
  const cleaned = clean(value)
  if (!cleaned) return undefined
  // Remove trailing colons that sometimes appear in source data
  return cleaned.replace(/\s*:\s*$/, "").trim() || undefined
}

function splitValues(value?: string, separator = "|") {
  const cleaned = clean(value)
  if (!cleaned) return []
  return cleaned.split(separator).map(part => part.trim()).filter(Boolean)
}

function optionalInfo(label: string, value?: string) {
  const cleaned = clean(value)
  return cleaned ? { label, value: cleaned } : null
}

function normalizeCollectedEvent(item: CollectedEvent, asOf: string): AgendaEvent | null {
  // Rejeter les événements sans titre — ils ne peuvent pas être affichés
  const title = clean(item.nom)
  if (!title) return null

  const startDate = isoDate(item.date_debut)
  if (!startDate) return null
  const endDate = isoDate(item.date_fin)
  if ((endDate ?? startDate) < asOf) return null

  // Rejeter les événements avec date de début-placeholder (1er janvier d'une année passée)
  // qui n'ont pas de date de fin connue — signe d'une donnée de collecte invalide
  if (startDate.endsWith("-01-01") && startDate < asOf && !endDate) return null

  const disciplines = splitValues(item.disciplines)
  const officialUrl = clean(item.site_officiel) ?? item.url_source
  const ticketUrl = clean(item.lien_reservation)
  const category = CATEGORY_MAP[item.categorie] ?? "Spectacle"
  const additionalInfo = [
    disciplines.length ? { label: "Disciplines", value: disciplines.join(" · ") } : null,
    optionalInfo("Public", item.public),
    clean(item.jeune_public) === "oui" ? { label: "Jeune public", value: "Oui" } : null,
    optionalInfo("Nombre de séances", String(item.nb_seances)),
    optionalInfo("Horaires détaillés", item.horaires_texte),
    optionalInfo("Réservation", item.reservation),
    optionalInfo("Thématiques source", splitValues(item.tags_source, ";").join(" · ")),
    optionalInfo("Transports", item.transport),
    optionalInfo("Organisateur", item.organisateur),
    optionalInfo("E-mail", item.email),
    optionalInfo("Téléphone", item.telephone),
    optionalInfo("Instagram", item.instagram),
    optionalInfo("Facebook", item.facebook),
    clean(item.accessible_pmr) === "oui" ? { label: "Accessibilité", value: "Accessible aux personnes à mobilité réduite" } : null,
    optionalInfo("Crédit image", item.image_credit),
    item.statut !== "vérifiée" ? { label: "État de vérification", value: item.statut } : null,
    { label: "Source des données", value: "Ville de Paris - Que faire à Paris (licence ODbL)" },
  ].filter((entry): entry is { label: string; value: string } => Boolean(entry))

  return {
    slug: `${item.id.toLowerCase()}-${slugify(title)}`,
    sourceIds: [`${item.source}:${item.id}`],
    title,
    description: item.resume,
    image: resolveAgendaImage(item.id, clean(item.image_url)),
    dates: clean(item.horaires_texte) ?? "Date renseignée",
    startDate,
    endDate,
    venue: clean(item.lieu) ?? "",
    address: clean(item.adresse),
    city: clean(item.ville) ?? "",
    postalCode: clean(item.code_postal),
    latitude: numberValue(item.latitude),
    longitude: numberValue(item.longitude),
    price: priceLabel(item),
    time: formatProchainSeance(item.prochaine_seance) ?? cleanHoraires(item.horaires_texte),
    category,
    disciplines,
    officialUrl,
    ticketUrl,
    additionalInfo,
    source: item.source,
    sourceLabel: "Ville de Paris - Que faire à Paris",
    lastVerifiedAt: isoDate(item.date_derniere_maj_source) ?? isoDate(item.date_collecte) ?? asOf,
    status: statusAt(startDate, endDate, asOf),
  }
}

export function getCollectedAgendaEvents(asOf = new Date().toISOString().slice(0, 10)) {
  const unique = new Map<string, AgendaEvent>()

  collectedEvents.forEach(item => {
    const event = normalizeCollectedEvent(item, asOf)
    if (!event) return
    unique.set(item.id, event)
  })

  return [...unique.values()]
}

export const collectedAgendaEvents = getCollectedAgendaEvents()

export const collectedAgendaAudit = {
  sourceRows: collectedEvents.length,
  importedRows: collectedAgendaEvents.length,
  withheldRows: collectedEvents.length - collectedAgendaEvents.length,
  undatedRows: collectedEvents.filter(item => !isoDate(item.date_debut)).length,
  duplicateIds: collectedEvents.length - new Set(collectedEvents.map(item => item.id)).size,
  statuses: collectedEvents.reduce<Record<string, number>>((counts, item) => {
    counts[item.statut] = (counts[item.statut] ?? 0) + 1
    return counts
  }, {}),
  categories: collectedEvents.reduce<Record<string, number>>((counts, item) => {
    counts[item.categorie] = (counts[item.categorie] ?? 0) + 1
    return counts
  }, {}),
}
