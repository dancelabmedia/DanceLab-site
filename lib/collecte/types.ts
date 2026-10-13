/**
 * lib/collecte/types.ts
 * Types partagés par la collecte automatique de l'agenda Dance Lab.
 */

/** Valeurs du champ Notion « Publication » de l'agenda. */
export const PUBLICATION = {
  auto: "Publiée (auto)",
  validated: "Validée",
  pending: "En attente de validation",
  archived: "Archivée",
} as const

export type PublicationStatus = (typeof PUBLICATION)[keyof typeof PUBLICATION]

/** Événement normalisé, tel qu'il sort d'une source avant écriture dans Notion. */
export type CollectedEvent = {
  /** Identifiant stable : "<source>:<id dans la source>" (ex. "qfap:12345"). */
  sourceId: string
  sourceName: string
  /** Mention d'attribution à afficher sur le site (exigée par la licence). */
  sourceLabel: string
  sourceUrl: string
  title: string
  description: string
  /** Option du champ Notion « Type ». */
  type: string
  disciplines: string[]
  /** "YYYY-MM-DD" ou datetime ISO. */
  startDate: string | null
  endDate: string | null
  hasTime: boolean
  schedule: string
  venue: string
  address: string
  postalCode: string
  city: string
  latitude: number | null
  longitude: number | null
  price: string
  ticketUrl: string
  officialUrl: string
  organizer: string
  /** true si la source classe elle-même l'entrée en « danse » (tag officiel). */
  taggedDance: boolean
  /** Date de dernière mise à jour annoncée par la source. */
  sourceUpdatedAt: string | null
  /** Visuel fourni par la source (vide si aucun). */
  imageUrl: string
  imageCredit: string
  imageAlt: string
}

export type PublicationDecision = {
  status: PublicationStatus
  reasons: string[]
}

export type RunCounters = {
  sourcesConsulted: number
  received: number
  created: number
  createdPending: number
  updated: number
  unchanged: number
  duplicates: number
  archived: number
  missingFromSource: number
  pendingTotal: number
  skippedLocked: number
  imagesAdded: number
  imagesMissing: number
}

export type RunStatus = "En cours" | "Réussie" | "Partielle" | "Échec" | "Ignorée"
export type RunTrigger = "Automatique" | "Manuel"

export type RunReport = {
  startedAt: string
  finishedAt: string
  trigger: RunTrigger
  dryRun: boolean
  status: RunStatus
  counters: RunCounters
  errors: string[]
  /** Détail lisible des actions (créations, mises à jour…). */
  actions: string[]
}

export function emptyCounters(): RunCounters {
  return {
    sourcesConsulted: 0,
    received: 0,
    created: 0,
    createdPending: 0,
    updated: 0,
    unchanged: 0,
    duplicates: 0,
    archived: 0,
    missingFromSource: 0,
    pendingTotal: 0,
    skippedLocked: 0,
    imagesAdded: 0,
    imagesMissing: 0,
  }
}
