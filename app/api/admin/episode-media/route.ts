import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getEpisodesFromRSS } from '@/lib/ausha-rss'
import { episodeMediaOverrides, type EpisodeMediaOverrideMap } from '@/lib/episode-media-overrides'
import { episodeSyncReport } from '@/lib/episode-sync-report'
import { commitFileToGitHub, readFileFromGitHub } from '@/lib/github-commit'

const OVERRIDES_PATH = 'data/episode-media-overrides.json'

async function hashPassword(password: string): Promise<string> {
  const bytes = new TextEncoder().encode(`${password}dancelab-salt`)
  const hash = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(hash)).map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

async function isAuthenticated() {
  const password = process.env.ADMIN_PASSWORD ?? process.env.PREVIEW_PASSWORD
  if (!password) return process.env.NODE_ENV !== 'production'
  const token = (await cookies()).get('preview_access')?.value
  return token === await hashPassword(password)
}

function youtubeIdFromInput(value: string): string | undefined {
  const trimmed = value.trim()
  if (!trimmed) return undefined
  const match = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/))([\w-]{11})/i)
  const id = match?.[1] ?? (/^[\w-]{11}$/.test(trimmed) ? trimmed : '')
  return id || undefined
}

function validInstagramUrl(value: string): string | undefined {
  const trimmed = value.trim()
  if (!trimmed) return undefined
  try {
    const url = new URL(trimmed)
    if (!/(^|\.)instagram\.com$/i.test(url.hostname) || !/^\/(?:reel|p)\//.test(url.pathname)) return undefined
    return url.toString()
  } catch {
    return undefined
  }
}

export async function GET() {
  if (!(await isAuthenticated())) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const episodes = await getEpisodesFromRSS(false)
  return NextResponse.json({
    report: episodeSyncReport,
    episodes: episodes.slice(0, 40).map((episode) => ({
      number: episode.number,
      title: episode.title,
      guest: episode.guest,
      aushaGuid: episode.guid,
      image: episode.aushaImage,
      override: episodeMediaOverrides[episode.guid] ?? null,
    })),
  })
}

export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const body = await request.json() as {
    episodeNumber?: number
    youtube?: string
    instagram?: string
    isYoutubeShort?: boolean
  }
  const episodes = await getEpisodesFromRSS(false)
  const episode = episodes.find((item) => item.number === Number(body.episodeNumber))
  if (!episode?.guid) return NextResponse.json({ error: 'Épisode ou GUID Ausha introuvable.' }, { status: 400 })

  const youtubeId = youtubeIdFromInput(body.youtube ?? '')
  const instagramReelUrl = validInstagramUrl(body.instagram ?? '')
  if (body.youtube?.trim() && !youtubeId) return NextResponse.json({ error: 'Lien ou ID YouTube invalide.' }, { status: 400 })
  if (body.instagram?.trim() && !instagramReelUrl) return NextResponse.json({ error: 'Lien Instagram invalide.' }, { status: 400 })

  const githubContents = await readFileFromGitHub(OVERRIDES_PATH)
  let current: EpisodeMediaOverrideMap = { ...episodeMediaOverrides }
  if (githubContents) {
    try { current = JSON.parse(githubContents) as EpisodeMediaOverrideMap } catch { /* repli bundle */ }
  }

  if (!youtubeId && !instagramReelUrl) {
    delete current[episode.guid]
  } else {
    current[episode.guid] = {
      episodeNumber: episode.number,
      aushaGuid: episode.guid,
      ...(youtubeId ? { youtubeId, isYoutubeShort: Boolean(body.isYoutubeShort) } : {}),
      ...(instagramReelUrl ? { instagramReelUrl } : {}),
      updatedAt: new Date().toISOString(),
      validatedBy: 'admin',
    }
  }

  const result = await commitFileToGitHub({
    path: OVERRIDES_PATH,
    content: `${JSON.stringify(current, null, 2)}\n`,
    message: `chore: validate media for episode #${episode.number}`,
  })
  if (!result.ok) return NextResponse.json({ error: 'error' in result ? result.error : 'Échec GitHub.' }, { status: 502 })
  return NextResponse.json({ ok: true, commitUrl: result.url, override: current[episode.guid] ?? null })
}
