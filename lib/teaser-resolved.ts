/**
 * lib/teaser-resolved.ts
 * Accesseur typé pour data/teaser-resolved.json
 *
 * Ce fichier JSON est mis à jour automatiquement par le cron /api/cron/match-teasers
 * via l'API GitHub à chaque fois qu'un nouveau teaser est détecté pour un épisode.
 *
 * Structure :
 *   {
 *     "128": {
 *       "youtubeId": "abc123XYZ",
 *       "isYoutubeShort": true,
 *       "instagramReelUrl": "https://www.instagram.com/reel/...",
 *       "resolvedAt": "2025-06-01T00:05:23.000Z"
 *     }
 *   }
 *
 * Priorité dans lib/episodes.ts :
 *   episode-extras.ts (manuel) > teaser-resolved.json (auto) > détection temps réel
 */

import resolvedRaw from '@/data/teaser-resolved.json'

// ─── Types ────────────────────────────────────────────────────────────────────

export type ResolvedTeaser = {
  /** ID YouTube (11 chars) — absent si seul l'Instagram a été trouvé */
  youtubeId?: string
  /** true si la vidéo YouTube est un Short (format 9:16) */
  isYoutubeShort?: boolean
  /** URL du Reel Instagram — absent si seul le YouTube a été trouvé */
  instagramReelUrl?: string
  /** ISO 8601 — date à laquelle le teaser a été résolu */
  resolvedAt: string
}

export type TeaserResolvedMap = Record<string, ResolvedTeaser>

// ─── Accesseur ────────────────────────────────────────────────────────────────

/** Map complète telle qu'elle existe dans le fichier JSON */
export const teaserResolved: TeaserResolvedMap = resolvedRaw as TeaserResolvedMap

/**
 * Retourne le teaser résolu pour un numéro d'épisode donné.
 * null = pas encore résolu (le cron n'a pas encore trouvé de teaser).
 */
export function getResolvedTeaser(episodeNumber: number): ResolvedTeaser | null {
  return teaserResolved[String(episodeNumber)] ?? null
}

/**
 * Retourne true si cet épisode a déjà un teaser résolu et enregistré.
 * Utilisé par le cron pour sauter les épisodes déjà traités.
 */
export function isTeaserResolved(episodeNumber: number): boolean {
  return String(episodeNumber) in teaserResolved
}
