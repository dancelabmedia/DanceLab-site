import rawOverrides from '@/data/episode-media-overrides.json'

export type EpisodeMediaOverride = {
  episodeNumber: number
  aushaGuid: string
  youtubeId?: string
  isYoutubeShort?: boolean
  instagramReelUrl?: string
  updatedAt: string
  validatedBy: 'admin'
}

export type EpisodeMediaOverrideMap = Record<string, EpisodeMediaOverride>

export const episodeMediaOverrides = rawOverrides as EpisodeMediaOverrideMap

export function getEpisodeMediaOverride(aushaGuid: string): EpisodeMediaOverride | null {
  return aushaGuid ? episodeMediaOverrides[aushaGuid] ?? null : null
}
