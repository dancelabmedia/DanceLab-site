/**
 * app/api/admin/collecte/route.ts
 * Tableau de bord « Collecte automatique » (/admin/collecte).
 *
 * GET  → dernière collecte, prochaine date prévue, historique, fiches en attente
 * POST → lance une collecte maintenant ({ "dryRun": true } pour une collecte à blanc)
 *
 * Accès : même cookie que les autres pages /admin (ADMIN_PASSWORD ou PREVIEW_PASSWORD).
 */

import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { hashPreviewPassword, PREVIEW_COOKIE } from "@/lib/preview-session"
import { runCollecte, SOURCES } from "@/lib/collecte/run"
import { nextWeeklyRun } from "@/lib/collecte/rules"
import {
  DEFAULT_AGENDA_DATABASE_ID,
  NotionClient,
  listAgendaPages,
  listRuns,
  logDatabaseId,
  notionToken,
} from "@/lib/collecte/notion"
import { PUBLICATION } from "@/lib/collecte/types"

export const dynamic = "force-dynamic"
export const maxDuration = 300

async function isAdmin(): Promise<boolean> {
  const password = process.env.ADMIN_PASSWORD ?? process.env.PREVIEW_PASSWORD
  if (!password) return false
  const token = (await cookies()).get(PREVIEW_COOKIE)?.value
  return Boolean(token) && token === (await hashPreviewPassword(password))
}

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const token = notionToken()
  const base = {
    nextRun: nextWeeklyRun(),
    sources: SOURCES.map((s) => s.name),
    configuration: {
      notion: Boolean(token),
      journal: Boolean(logDatabaseId()),
      cronSecret: Boolean(process.env.CRON_SECRET),
    },
  }
  if (!token) return NextResponse.json({ ...base, runs: [], pending: [], totals: null })

  const client = new NotionClient(token)
  const problems: string[] = []

  let runs: Awaited<ReturnType<typeof listRuns>> = []
  if (logDatabaseId()) {
    try {
      runs = await listRuns(client, await client.dataSourceId(logDatabaseId()), 20)
    } catch (error) {
      problems.push(`Journal inaccessible : ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  let pending: Array<{ title: string; url: string; startDate: string | null }> = []
  let totals: Record<string, number> | null = null
  try {
    const dsId = await client.dataSourceId(process.env.NOTION_AGENDA_DATABASE_ID || DEFAULT_AGENDA_DATABASE_ID)
    const pages = await listAgendaPages(client, dsId)
    pending = pages
      .filter((p) => p.publication === PUBLICATION.pending)
      .sort((a, b) => (a.startDate ?? "").localeCompare(b.startDate ?? ""))
      .map((p) => ({ title: p.title, url: p.url, startDate: p.startDate }))
    totals = {
      fiches: pages.length,
      collectees: pages.filter((p) => p.sourceId).length,
      publieesAuto: pages.filter((p) => p.publication === PUBLICATION.auto).length,
      validees: pages.filter((p) => p.publication === PUBLICATION.validated).length,
      enAttente: pending.length,
      archivees: pages.filter((p) => p.publication === PUBLICATION.archived).length,
    }
  } catch (error) {
    problems.push(`Agenda inaccessible : ${error instanceof Error ? error.message : String(error)}`)
  }

  return NextResponse.json({ ...base, runs, pending, totals, problems })
}

export async function POST(request: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  const body = (await request.json().catch(() => ({}))) as { dryRun?: boolean }
  const report = await runCollecte({ trigger: "Manuel", dryRun: Boolean(body.dryRun), budgetMs: 250_000 })
  return NextResponse.json(report)
}
