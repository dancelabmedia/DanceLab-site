/**
 * app/api/cron/images-danse/route.ts
 * Passage quotidien de l'étape « visuels » (vercel.json) : file d'attente des
 * fiches sans image, recherche web des pages officielles, liens cassés.
 * Les fonctions Vercel du plan Hobby sont limitées à 5 minutes : la file est
 * donc traitée par petits lots, chaque jour.
 */

import { NextRequest, NextResponse } from "next/server"
import { runCollecte } from "@/lib/collecte/run"

export const dynamic = "force-dynamic"
export const maxDuration = 300

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret || request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }
  const report = await runCollecte({
    trigger: "Automatique",
    dryRun: false,
    imagesOnly: true,
    resolverBudget: Number(process.env.COLLECTE_RESOLVER_DAILY) || 15,
    brokenChecks: 40,
    budgetMs: 270_000,
  })
  return NextResponse.json(report, { status: report.status === "Échec" ? 500 : 200 })
}
