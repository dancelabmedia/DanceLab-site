import collectedEvents from "../../Collecte/dance_lab_tous_evenements.json"
import type { AgendaCategory, AgendaEvent, AgendaStatus } from "./agenda-data"

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

function clean(value?: string) {
  const trimmed = value?.trim() ?? ""
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
  const startDate = isoDate(item.date_debut)
  if (!startDate) return null
  const endDate = isoDate(item.date_fin)
  if ((endDate ?? startDate) < asOf) return null

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
    slug: `${item.id.toLowerCase()}-${slugify(item.nom)}`,
    title: item.nom,
    description: item.resume,
    image: clean(item.image_url),
    dates: clean(item.horaires_texte) ?? "Date renseignée",
    startDate,
    endDate,
    venue: clean(item.lieu) ?? "Lieu à préciser",
    address: clean(item.adresse),
    city: clean(item.ville) ?? "Localisation à préciser",
    postalCode: clean(item.code_postal),
    latitude: numberValue(item.latitude),
    longitude: numberValue(item.longitude),
    price: priceLabel(item),
    time: clean(item.prochaine_seance) ?? clean(item.horaires_texte),
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
