/**
 * lib/collecte/sources/que-faire-a-paris.ts
 * Source « Que faire à Paris » — agenda officiel de la Ville de Paris,
 * publié en open data sous licence ODbL (attribution obligatoire).
 *
 * API documentée : https://opendata.paris.fr (jeu de données « que-faire-a-paris- »).
 * Deux requêtes : les événements tagués « Danse » par la Ville, puis un
 * repêchage par mots-clés (ces derniers passent en validation manuelle).
 */

import type { CollectedEvent } from "../types"
import { classifyType, detectDisciplines, looksLikeDance, stripHtml } from "../rules"
import { fetchWithRetry } from "../http"

const DATASET = "https://opendata.paris.fr/api/explore/v2.1/catalog/datasets/que-faire-a-paris-/exports/json"

export const QFAP_SOURCE_NAME = "Que faire à Paris"
export const QFAP_SOURCE_LABEL = "Ville de Paris – Que faire à Paris (licence ODbL)"

type QfapRecord = {
  id: string
  url?: string | null
  title?: string | null
  lead_text?: string | null
  description?: string | null
  date_start?: string | null
  date_end?: string | null
  date_description?: string | null
  occurrences?: string | null
  address_name?: string | null
  address_street?: string | null
  address_zipcode?: string | null
  address_city?: string | null
  lat_lon?: { lat?: number | null; lon?: number | null } | null
  price_type?: string | null
  price_detail?: string | null
  access_link?: string | null
  contact_url?: string | null
  contact_url_text?: string | null
  contact_organisation_name?: string | null
  qfap_tags?: string | null
  updated_at?: string | null
}

const KEYWORD_QUERY = [
  'title like "danse"',
  'lead_text like "danse"',
  'title like "ballet"',
  'lead_text like "chorégraph"',
  'title like "hip-hop"',
  'title like "battle"',
  'title like "bal "',
  'lead_text like "danseur"',
  'lead_text like "danseuse"',
].join(" or ")

async function fetchRecords(where: string): Promise<QfapRecord[]> {
  const url = `${DATASET}?where=${encodeURIComponent(where)}`
  const response = await fetchWithRetry(url, { headers: { Accept: "application/json" } }, { attempts: 3, timeoutMs: 60_000 })
  if (!response.ok) throw new Error(`Que faire à Paris : HTTP ${response.status}`)
  const data = (await response.json()) as unknown
  if (!Array.isArray(data)) throw new Error("Que faire à Paris : réponse inattendue")
  return data as QfapRecord[]
}

function cleanUrl(value: string | null | undefined): string {
  const v = (value ?? "").trim()
  return /^https?:\/\//i.test(v) ? v : ""
}

function formatPrice(record: QfapRecord): string {
  const detail = stripHtml(record.price_detail)
  if (detail) return detail
  if (record.price_type === "gratuit") return "Gratuit"
  if (record.price_type === "payant") return "Payant (tarif non précisé)"
  return ""
}

export function normalizeQfapRecord(record: QfapRecord, taggedDance: boolean): CollectedEvent | null {
  const title = (record.title ?? "").trim()
  if (!title || !record.id) return null

  const summary = stripHtml(record.lead_text)
  const longText = stripHtml(record.description)
  const tags = record.qfap_tags ?? ""

  const lat = record.lat_lon?.lat ?? null
  const lon = record.lat_lon?.lon ?? null
  const hasCoords = typeof lat === "number" && typeof lon === "number" && !(lat === 0 && lon === 0)

  const start = record.date_start ?? null
  const end = record.date_end ?? null
  const hasTime = Boolean(start && !/T00:00:00/.test(start))

  return {
    sourceId: `qfap:${record.id}`,
    sourceName: QFAP_SOURCE_NAME,
    sourceLabel: QFAP_SOURCE_LABEL,
    sourceUrl: cleanUrl(record.url),
    title,
    description: summary,
    type: classifyType(title, summary, tags),
    disciplines: detectDisciplines(`${title} ${summary}`, longText),
    startDate: start,
    endDate: end,
    hasTime,
    schedule: stripHtml(record.date_description),
    venue: (record.address_name ?? "").trim(),
    address: (record.address_street ?? "").trim(),
    postalCode: (record.address_zipcode ?? "").trim(),
    city: (record.address_city ?? "").trim(),
    latitude: hasCoords ? lat : null,
    longitude: hasCoords ? lon : null,
    price: formatPrice(record),
    ticketUrl: cleanUrl(record.access_link),
    officialUrl: cleanUrl(record.contact_url),
    organizer: (record.contact_organisation_name || record.contact_url_text || "").trim(),
    taggedDance,
    sourceUpdatedAt: record.updated_at ?? null,
  }
}

/**
 * Récupère les événements danse de Que faire à Paris.
 * Les entrées repêchées par mot-clé sont filtrées une seconde fois
 * (titre + résumé) pour écarter les faux positifs.
 */
export async function collectQueFaireAParis(): Promise<CollectedEvent[]> {
  const [tagged, keyword] = await Promise.all([
    fetchRecords('qfap_tags like "Danse"'),
    fetchRecords(KEYWORD_QUERY),
  ])

  const seen = new Set<string>()
  const events: CollectedEvent[] = []

  for (const record of tagged) {
    const event = normalizeQfapRecord(record, true)
    if (!event || seen.has(event.sourceId)) continue
    seen.add(event.sourceId)
    events.push(event)
  }

  for (const record of keyword) {
    if (seen.has(`qfap:${record.id}`)) continue
    const event = normalizeQfapRecord(record, false)
    if (!event) continue
    if (!looksLikeDance(`${event.title} ${event.description}`)) continue
    seen.add(event.sourceId)
    events.push(event)
  }

  return events
}
