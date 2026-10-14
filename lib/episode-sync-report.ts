import report from '@/data/episode-sync-report.json'

export type EpisodeSyncIssue = {
  episodeNumber: number
  aushaGuid: string
  title: string
  missing: string[]
  warnings: string[]
}

export type EpisodeSyncReport = {
  generatedAt: string | null
  totalEpisodes: number
  latestEpisode: number | null
  issues: EpisodeSyncIssue[]
}

export const episodeSyncReport = report as EpisodeSyncReport
