import { getEpisodes } from '@/lib/episodes'
import { COMING_SOON_FIXED_STATS, conversationMilestone, type ComingSoonStats } from '@/data/site-stats'

/** Statistiques communes, calculées depuis le même catalogue que la page Écouter. */
export async function getComingSoonStats(): Promise<ComingSoonStats> {
  const publishedEpisodes = await getEpisodes()
  return {
    conversations: conversationMilestone(publishedEpisodes.length),
    ...COMING_SOON_FIXED_STATS,
  }
}
