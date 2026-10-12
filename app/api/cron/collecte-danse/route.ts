/**
 * app/api/cron/collecte-danse/route.ts
 * Cron Vercel — collecte hebdomadaire de l'agenda danse.
 *
 * Programmé dans vercel.json le lundi à 3 h et 4 h UTC : seul le passage qui
 * tombe à 5 h, heure de Paris, lance la collecte (gère l'heure d'été/hiver).
 * `?force=1` ignore ce créneau (lancement manuel depuis le tableau de bord Vercel).
 *
 * Sécurité : CRON_SECRET obligatoire (Vercel l'envoie automatiquement).
 */

import { NextRequest, NextResponse } from "next/server"
import { runCollecte } from "@/lib/collecte/run"
import { isWeeklySlot } from "@/lib/collecte/rules"

export const dynamic = "force-dynamic"
export const maxDuration = 300

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret || request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const force = request.nextUrl.searchParams.get("force") === "1"
  if (!force && !isWeeklySlot()) {
    return NextResponse.json({ skipped: true, reason: "Hors du créneau du lundi 5 h (heure de Paris)" })
  }

  const report = await runCollecte({ trigger: "Automatique", dryRun: false, budgetMs: 250_000 })
  return NextResponse.json(report, { status: report.status === "Échec" ? 500 : 200 })
}
