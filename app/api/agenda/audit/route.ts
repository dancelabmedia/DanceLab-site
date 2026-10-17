/**
 * GET /api/agenda/audit
 *
 * Rapport de complétude de l'agenda Sortir.
 * Retourne les statistiques et la liste des événements incomplets.
 * Non visible par les visiteurs (usage interne).
 */
import { NextResponse } from "next/server"
import { agendaEvents, type AgendaEvent } from "../../../agenda/agenda-data"
import { collectedAgendaEvents, collectedAgendaAudit } from "../../../agenda/collected-events"

export const dynamic = "force-dynamic"

const NOTION_VERSION = "2025-09-03"
const DEFAULT_DATABASE_ID = "c06a1552cfcc4522ae68d32f833b3cf3"
const NOTION_TOKEN = process.env.NOTION_TOKEN || process.env.NOTION_API_KEY
const NOTION_DATABASE_ID = process.env.NOTION_AGENDA_DATABASE_ID || DEFAULT_DATABASE_ID

type NotionProperty = {
  type: string
  title?: Array<{ plain_text?: string }>
  rich_text?: Array<{ plain_text?: string }>
  url?: string | null
  date?: { start?: string; end?: string | null } | null
  select?: { name?: string } | null
  status?: { name?: string } | null
}
type NotionPage = {
  id: string
  cover?: { type: "external" | "file"; external?: { url?: string }; file?: { url?: string } } | null
  properties: Record<string, NotionProperty>
}

function getText(prop?: NotionProperty) {
  if (!prop) return ""
  if (prop.type === "title") return prop.title?.map(t => t.plain_text || "").join("").trim() || ""
  if (prop.type === "rich_text") return prop.rich_text?.map(t => t.plain_text || "").join("").trim() || ""
  if (prop.type === "url") return prop.url || ""
  if (prop.type === "select") return prop.select?.name || ""
  if (prop.type === "status") return prop.status?.name || ""
  return ""
}

function normKey(name: string) {
  return name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
}

function findProp(props: Record<string, NotionProperty>, aliases: string[]) {
  const normed = aliases.map(normKey)
  return Object.entries(props).find(([k]) => normed.includes(normKey(k)))?.[1]
}

function hasCoverImage(page: NotionPage) {
  if (page.cover) {
    const url = page.cover.type === "external" ? page.cover.external?.url : page.cover.file?.url
    if (url) return true
  }
  for (const prop of Object.values(page.properties)) {
    if (prop.type === "files") {
      const f = (prop as { files?: Array<{ type: string; external?: { url?: string }; file?: { url?: string } }> }).files?.[0]
      if (f) return true
    }
  }
  return false
}

function scoreEvent(event: AgendaEvent) {
  const fields = {
    title: Boolean(event.title),
    description: Boolean(event.description && event.description.length > 20),
    image: Boolean(event.image),
    dates: Boolean(event.startDate && event.startDate !== "9999-12-31"),
    venue: Boolean(event.venue),
    city: Boolean(event.city),
    price: Boolean(event.price && !["À compléter", "Payant - détails sur la page officielle"].includes(event.price)),
    category: Boolean(event.category),
    disciplines: Boolean(event.disciplines?.length),
    officialUrl: Boolean(event.officialUrl),
    coordinates: Boolean(event.latitude && event.longitude),
  }
  const total = Object.keys(fields).length
  const filled = Object.values(fields).filter(Boolean).length
  const missing = Object.entries(fields).filter(([, v]) => !v).map(([k]) => k)
  return { score: Math.round((filled / total) * 100), missing, filled, total }
}

async function fetchNotionPages() {
  if (!NOTION_TOKEN) return []
  try {
    const dbRes = await fetch(`https://api.notion.com/v1/databases/${NOTION_DATABASE_ID}`, {
      headers: { Authorization: `Bearer ${NOTION_TOKEN}`, "Notion-Version": NOTION_VERSION },
    })
    const db = await dbRes.json() as { data_sources?: Array<{ id: string }> }
    const dataSourceId = db.data_sources?.[0]?.id || NOTION_DATABASE_ID

    const pages: NotionPage[] = []
    let cursor: string | undefined
    do {
      const res = await fetch(`https://api.notion.com/v1/data_sources/${dataSourceId}/query`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${NOTION_TOKEN}`,
          "Content-Type": "application/json",
          "Notion-Version": NOTION_VERSION,
        },
        body: JSON.stringify({ page_size: 100, start_cursor: cursor }),
      })
      const data = await res.json() as { results: NotionPage[]; has_more: boolean; next_cursor?: string | null }
      pages.push(...data.results)
      cursor = data.has_more ? data.next_cursor || undefined : undefined
    } while (cursor)
    return pages
  } catch { return [] }
}

export async function GET() {
  const today = new Date().toISOString().slice(0, 10)

  // 1. Événements hardcodés
  const hardcodedScores = agendaEvents.map((e) => ({ ...scoreEvent(e), source: "hardcoded", title: e.title, slug: e.slug }))

  // 2. Événements JSON collectés
  const jsonScores = collectedAgendaEvents.map((e) => ({ ...scoreEvent(e), source: "json", title: e.title, slug: e.slug }))

  // 3. Événements Notion
  const pages = await fetchNotionPages()
  const futurePages = pages.filter((p) => {
    const dateProp = findProp(p.properties, ["date", "Date", "Dates", "Période", "Quand"])
    const start = dateProp?.date?.start?.slice(0, 10)
    const end = dateProp?.date?.end?.slice(0, 10)
    if (!start) return false
    return (end ?? start) >= today
  })

  const notionScores = futurePages.map((p) => {
    const title = getText(findProp(p.properties, ["title", "Titre", "Nom", "Name"])) || "(sans titre)"
    const hasUrl = Boolean(getText(findProp(p.properties, ["Lien", "URL", "Lien officiel", "Site"])))
    const hasImage = hasCoverImage(p)
    const hasDesc = Boolean(getText(findProp(p.properties, ["Description", "Résumé", "Notes"])))
    const hasPrice = Boolean(getText(findProp(p.properties, ["Prix", "Tarif", "Tarifs"])))
    const hasDisciplines = Boolean(getText(findProp(p.properties, ["Disciplines", "Style", "Tags", "Étiquettes"])))
    const hasDates = Boolean(findProp(p.properties, ["date", "Date", "Dates"])?.date?.start)
    const hasVenue = Boolean(getText(findProp(p.properties, ["Lieu", "Salle", "Venue"])))
    const hasCity = Boolean(getText(findProp(p.properties, ["Ville", "City"])))

    const fields = { title: true, image: hasImage, description: hasDesc, dates: hasDates, venue: hasVenue, city: hasCity, price: hasPrice, disciplines: hasDisciplines, officialUrl: hasUrl }
    const filled = Object.values(fields).filter(Boolean).length
    const total = Object.keys(fields).length
    const missing = Object.entries(fields).filter(([, v]) => !v).map(([k]) => k)

    return {
      title,
      source: "notion",
      score: Math.round((filled / total) * 100),
      filled,
      total,
      missing,
      notionId: p.id,
    }
  })

  // Agréger
  const all = [...hardcodedScores, ...jsonScores, ...notionScores]
  const avgScore = all.length ? Math.round(all.reduce((s, e) => s + e.score, 0) / all.length) : 0

  const bySource = {
    hardcoded: hardcodedScores,
    json: jsonScores,
    notion: notionScores,
  }

  const missingByField: Record<string, number> = {}
  for (const e of all) {
    for (const field of e.missing) {
      missingByField[field] = (missingByField[field] || 0) + 1
    }
  }

  const incomplete = all
    .filter((e) => e.score < 70)
    .sort((a, b) => a.score - b.score)
    .slice(0, 50)

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    summary: {
      totalEvents: all.length,
      averageCompleteness: `${avgScore}%`,
      fullyComplete: all.filter((e) => e.score === 100).length,
      incomplete: all.filter((e) => e.score < 70).length,
      bySource: {
        hardcoded: { count: hardcodedScores.length, avg: `${Math.round(hardcodedScores.reduce((s, e) => s + e.score, 0) / (hardcodedScores.length || 1))}%` },
        json: { count: jsonScores.length, avg: `${Math.round(jsonScores.reduce((s, e) => s + e.score, 0) / (jsonScores.length || 1))}%` },
        notion: { count: notionScores.length, avg: `${Math.round(notionScores.reduce((s, e) => s + e.score, 0) / (notionScores.length || 1))}%` },
      },
    },
    missingByField: Object.entries(missingByField)
      .sort(([, a], [, b]) => b - a)
      .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {}),
    collectedEventsAudit: collectedAgendaAudit,
    incompleteEvents: incomplete,
    bySource,
  })
}
