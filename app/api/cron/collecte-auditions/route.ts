/**
 * app/api/cron/collecte-auditions/route.ts
 * Cron Vercel — collecte quotidienne des nouvelles annonces d'auditions et
 * offres d'emploi dans le secteur chorégraphique.
 *
 * Planification (vercel.json) : tous les jours à 6 h UTC.
 * `?force=1` ignore la sécurité de créneau (lancement manuel depuis Vercel).
 *
 * Ce cron ne modifie AUCUN fichier source automatiquement.
 * Il journalise les nouvelles annonces détectées (visibles dans les logs Vercel)
 * pour que l'équipe puisse les valider et les ajouter à auditions-data.ts.
 *
 * Sécurité : CRON_SECRET obligatoire (Vercel l'envoie automatiquement).
 */

import { NextRequest, NextResponse } from "next/server"
import { runCollecteAuditions } from "@/lib/auditions/collecte"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"
export const maxDuration = 60

export async function GET(request: NextRequest) {
  // ── Authentification ────────────────────────────────────────────────────────
  const cronSecret = process.env.CRON_SECRET
  const authHeader = request.headers.get("authorization")

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  // ── Collecte ────────────────────────────────────────────────────────────────
  try {
    const rapport = await runCollecteAuditions()

    // Logguer un résumé lisible dans les logs Vercel
    const emoji = rapport.erreurs.length > 0 ? "⚠️" : "✅"
    console.log(`${emoji} [collecte-auditions] ${rapport.runAt}`)
    console.log(`  Sources consultées : ${rapport.sourcesConsulted}`)
    console.log(`  Auditions actives connues : ${rapport.actives}`)
    console.log(`  Nouvelles annonces détectées : ${rapport.nouvelles.length}`)
    console.log(`  Annonces expirées dans le fichier : ${rapport.expirees.length}`)

    if (rapport.nouvelles.length > 0) {
      console.log("\n📋 NOUVELLES ANNONCES À VALIDER :")
      for (const n of rapport.nouvelles) {
        console.log(`  • [${n.source}] ${n.titre}`)
        console.log(`    Deadline : ${n.deadline ?? "non précisée"}`)
        console.log(`    Lien     : ${n.url}`)
      }
    }

    if (rapport.expirees.length > 0) {
      console.log("\n🗂️ ANNONCES EXPIRÉES À ARCHIVER dans auditions-data.ts :")
      for (const e of rapport.expirees) {
        console.log(`  • id="${e.id}" — ${e.structure} — deadline: ${e.deadline}`)
      }
    }

    if (rapport.erreurs.length > 0) {
      console.error("\n❌ ERREURS :")
      for (const err of rapport.erreurs) {
        console.error(`  • ${err}`)
      }
    }

    return NextResponse.json(rapport, { status: 200 })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error("[collecte-auditions] Erreur fatale :", message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
