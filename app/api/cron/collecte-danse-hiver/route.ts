/**
 * app/api/cron/collecte-danse-hiver/route.ts
 * Second déclenchement du lundi (4 h UTC = 5 h à Paris en heure d'hiver).
 * Même traitement que /api/cron/collecte-danse : seul le passage qui tombe
 * à 5 h, heure de Paris, lance réellement la collecte.
 */

import { GET as collecte } from "../collecte-danse/route"
import type { NextRequest } from "next/server"

export const dynamic = "force-dynamic"
export const maxDuration = 300

export function GET(request: NextRequest) {
  return collecte(request)
}
