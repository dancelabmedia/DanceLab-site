/**
 * /api/cron/check-agenda — Vérification quotidienne du cycle de vie des événements
 *
 * Planification : tous les jours à 4h UTC (= 5h heure d'hiver, 6h heure d'été Paris)
 * Déclenché automatiquement par Vercel Crons (vercel.json).
 *
 * Ce cron ne supprime rien : il journalise les événements expirés et ceux en
 * "dernières dates" afin de faciliter la supervision et les alertes manuelles.
 * Les événements expirés sont exclus dynamiquement de l'API /api/agenda côté
 * route (isPastEvent) — aucune donnée statique n'est modifiée ici.
 */

import { NextResponse } from "next/server"
import { agendaEvents, upcomingAgendaEvents, todayIso, isLastChance, getUrgencyBadge } from "@/app/agenda/agenda-data"
import { getInitialAgendaEvents } from "@/app/agenda/initial-events"

export const runtime = "nodejs"

/** Vérifie le header d'autorisation Vercel Cron (protection contre les appels externes) */
function isAuthorized(request: Request): boolean {
  const auth = request.headers.get("authorization")
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) return false
  return true
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const today = todayIso()

  // agendaEvents = catalogue brut statique (agenda-data.ts uniquement, sans Notion)
  // Événements expirés encore présents dans le fichier source (à nettoyer manuellement)
  const expired = agendaEvents.filter((event) => {
    if (event.isRecurring) return false
    const end = event.endDate ?? event.startDate
    return end < today
  })

  // Événements actifs consolidés (inclut shows-events + collected + cabarets)
  const active = getInitialAgendaEvents(today)

  // Événements en "dernières dates" (≤ 7 jours)
  const lastChance = active.filter((event) => isLastChance(event))

  // Urgence par niveau
  const byLevel = {
    "derniere-repr": lastChance.filter((e) => getUrgencyBadge(e)?.level === "derniere-repr"),
    "dernier-jour": lastChance.filter((e) => getUrgencyBadge(e)?.level === "dernier-jour"),
    "dernieres-dates": lastChance.filter((e) => getUrgencyBadge(e)?.level === "dernieres-dates"),
  }

  const report = {
    generatedAt: new Date().toISOString(),
    today,
    summary: {
      total: agendaEvents.length,
      active: active.length,
      expired: expired.length,
      lastChance: lastChance.length,
      byLevel: {
        "derniere-repr": byLevel["derniere-repr"].length,
        "dernier-jour": byLevel["dernier-jour"].length,
        "dernieres-dates": byLevel["dernieres-dates"].length,
      },
    },
    expired: expired.map((e) => ({
      slug: e.slug,
      title: e.title,
      endDate: e.endDate ?? e.startDate,
      venue: e.venue,
      city: e.city,
    })),
    lastChance: lastChance.map((e) => ({
      slug: e.slug,
      title: e.title,
      endDate: e.endDate ?? e.startDate,
      level: getUrgencyBadge(e)?.level,
      daysLeft: Math.ceil(
        (new Date(e.endDate ?? e.startDate).getTime() - new Date(today).getTime()) / 86_400_000
      ),
    })),
  }

  // Journalisation structurée pour les logs Vercel
  console.log("[check-agenda]", JSON.stringify(report))

  if (expired.length > 0) {
    console.warn(
      `[check-agenda] ⚠️  ${expired.length} événement(s) expiré(s) encore présent(s) dans le catalogue :`,
      expired.map((e) => `${e.slug} (fin: ${e.endDate ?? e.startDate})`).join(", ")
    )
  }

  if (byLevel["derniere-repr"].length > 0) {
    console.info(
      `[check-agenda] 🔴 DERNIÈRE REPR. :`,
      byLevel["derniere-repr"].map((e) => e.slug).join(", ")
    )
  }
  if (byLevel["dernier-jour"].length > 0) {
    console.info(
      `[check-agenda] 🟠 DERNIER JOUR :`,
      byLevel["dernier-jour"].map((e) => e.slug).join(", ")
    )
  }

  return NextResponse.json(report)
}
