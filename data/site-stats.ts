/** Source unique des chiffres affichés sur les écrans « Bientôt sur Dance Lab ». */
export const COMING_SOON_FIXED_STATS = {
  cumulativeListens: '+400 000',
  cumulativeViews: '+2 MILLIONS',
} as const

/** Dizaine complète inférieure atteinte : 128 → +120, 130 → +130. */
export function conversationMilestone(publishedEpisodeCount: number): string {
  const safeCount = Math.max(0, Math.floor(publishedEpisodeCount))
  return `+${Math.floor(safeCount / 10) * 10}`
}

export type ComingSoonStats = {
  conversations: string
  cumulativeListens: string
  cumulativeViews: string
}
