import { NextRequest, NextResponse } from 'next/server'
import { getEpisodesFromRSS, isGenericGuestLabel } from '@/lib/ausha-rss'
import { getYoutubeEpisodeMap, youtubeVideoMatchesEpisode } from '@/lib/youtube-rss'
import { getRecentInstagramReels, matchReelToEpisode } from '@/lib/instagram-api'
import { episodeExtras } from '@/data/episode-extras'
import { getEpisodeMediaOverride } from '@/lib/episode-media-overrides'
import { getResolvedTeaser } from '@/lib/teaser-resolved'
import { episodeSyncReport, type EpisodeSyncReport } from '@/lib/episode-sync-report'
import { commitFileToGitHub } from '@/lib/github-commit'
import { isOfficialAushaCoverUrl } from '@/lib/episode-cover'
import { revalidateEpisodeContent } from '@/lib/revalidate-episode-content'

export const maxDuration = 120
const REPORT_PATH = 'data/episode-sync-report.json'

function reportSignature(report: EpisodeSyncReport): string {
  return JSON.stringify({
    totalEpisodes: report.totalEpisodes,
    latestEpisode: report.latestEpisode,
    issues: report.issues,
  })
}

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  revalidateEpisodeContent()

  try {
    const [episodes, youtubeMap, reels] = await Promise.all([
      getEpisodesFromRSS(false),
      getYoutubeEpisodeMap(),
      getRecentInstagramReels(),
    ])

    const seenNumbers = new Set<number>()
    const seenGuids = new Set<string>()
    const coverOwners = new Map<string, string>()
    const issues: EpisodeSyncReport['issues'] = []

    for (const episode of episodes) {
      const missing: string[] = []
      const warnings: string[] = []
      const extra = episodeExtras[episode.number]
      const manual = getEpisodeMediaOverride(episode.guid)
      const resolved = getResolvedTeaser(episode.number, episode.guid)
      const youtubeCandidate = youtubeMap.get(episode.number)
      const youtubeId = manual?.youtubeId
        ?? extra?.youtubeId
        ?? resolved?.youtubeId
        ?? (youtubeCandidate && youtubeVideoMatchesEpisode(youtubeCandidate, episode)
          ? youtubeCandidate.videoId
          : undefined)
      const instagram = manual?.instagramReelUrl
        ?? extra?.instagramReelUrl
        ?? resolved?.instagramReelUrl
        ?? matchReelToEpisode(reels, episode.number, episode.guest)

      if (!episode.guid) missing.push('GUID Ausha')
      if (!episode.title) missing.push('titre')
      if (isGenericGuestLabel(episode.guest)) missing.push('invité.e à identifier')
      if (!episode.aushaImage) {
        missing.push('couverture Ausha')
      } else if (!isOfficialAushaCoverUrl(episode.aushaImage)) {
        missing.push('URL de couverture Ausha invalide')
      } else {
        const previousOwner = coverOwners.get(episode.aushaImage)
        if (previousOwner && previousOwner !== episode.guid) {
          warnings.push('couverture partagée avec un autre GUID')
        }
        coverOwners.set(episode.aushaImage, episode.guid)
      }
      if (!episode.audioUrl) missing.push('audio')
      if (!episode.link) missing.push('lien Ausha')
      if (!episode.platformLinks.spotify) warnings.push('Spotify')
      if (!episode.platformLinks.apple) warnings.push('Apple Podcasts')
      if (!youtubeId) warnings.push('YouTube')
      if (!instagram) warnings.push('Instagram')
      if (seenNumbers.has(episode.number)) warnings.push('numéro dupliqué')
      if (episode.guid && seenGuids.has(episode.guid)) warnings.push('GUID dupliqué')
      seenNumbers.add(episode.number)
      if (episode.guid) seenGuids.add(episode.guid)

      if (missing.length || warnings.length) {
        issues.push({
          episodeNumber: episode.number,
          aushaGuid: episode.guid,
          title: episode.title,
          officialCoverUrl: episode.aushaImage || undefined,
          missing,
          warnings,
        })
      }
    }

    const report: EpisodeSyncReport = {
      generatedAt: new Date().toISOString(),
      totalEpisodes: episodes.length,
      latestEpisode: episodes[0]?.number ?? null,
      issues,
    }

    let persisted = false
    let commitUrl: string | undefined
    if (reportSignature(report) !== reportSignature(episodeSyncReport)) {
      const result = await commitFileToGitHub({
        path: REPORT_PATH,
        content: `${JSON.stringify(report, null, 2)}\n`,
        message: `chore: update episode sync report through #${report.latestEpisode ?? 'unknown'} [skip ci]`,
      })
      persisted = result.ok
      if (result.ok) commitUrl = result.url
    }

    return NextResponse.json({ ok: true, ...report, persisted, commitUrl })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 502 })
  }
}
