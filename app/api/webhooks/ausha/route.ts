import { NextRequest, NextResponse } from 'next/server'
import { getEpisodesFromRSS } from '@/lib/ausha-rss'
import { revalidateEpisodeContent } from '@/lib/revalidate-episode-content'

/** Point d'entrée optionnel pour un webhook Ausha ou un automatisme autorisé. */
export async function POST(request: NextRequest) {
  const configuredSecret = process.env.AUSHA_WEBHOOK_SECRET
  const providedSecret = request.headers.get('x-dancelab-webhook-secret')
    ?? request.nextUrl.searchParams.get('secret')

  if (!configuredSecret || providedSecret !== configuredSecret) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  revalidateEpisodeContent()

  try {
    const episodes = await getEpisodesFromRSS(false)
    return NextResponse.json({
      ok: true,
      latestEpisode: episodes[0]?.number ?? null,
      message: 'Cache Ausha actualisé. Le cron média complètera YouTube et Instagram.',
    })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 502 })
  }
}
