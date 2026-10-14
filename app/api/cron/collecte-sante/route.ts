/**
 * app/api/cron/collecte-sante/route.ts
 * État de la configuration de la collecte (aucun secret renvoyé).
 * Protégé par CRON_SECRET, comme les tâches planifiées.
 */

import { NextRequest, NextResponse } from "next/server"
import { claudeAvailable } from "@/lib/claude-api"
import { logDatabaseId, notionToken } from "@/lib/collecte/notion"
import { nextWeeklyRun } from "@/lib/collecte/rules"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret || request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }
  return NextResponse.json({
    notion: Boolean(notionToken()),
    journal: Boolean(logDatabaseId()),
    cronSecret: true,
    rechercheWeb: claudeAvailable(),
    prochaineCollecte: nextWeeklyRun(),
  })
}
