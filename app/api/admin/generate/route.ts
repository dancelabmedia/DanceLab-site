/**
 * app/api/admin/generate/route.ts
 * API Route — Génération d'un article à partir d'un épisode Ausha.
 *
 * POST /api/admin/generate
 * Body : { episodeNumber: number }
 *
 * Authentification : cookie preview_access requis (même système que l'accès privé).
 *
 * Fonctionnement :
 *   1. Vérifie l'authentification
 *   2. Récupère les données de l'épisode depuis le flux RSS Ausha
 *   3. Génère l'article via Claude API
 *   4. Sauvegarde en JSON dans data/podcast-articles/ep-{number}.json
 *   5. Retourne l'article généré
 */

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getEpisodesFromRSS } from '@/lib/ausha-rss'
import { generateArticleFromEpisode } from '@/lib/article-generator'
import {
  savePodcastArticle,
  getPodcastArticleByEpisode,
  getNextTuesdayPublishDate,
  type PodcastArticleFile,
} from '@/lib/podcast-articles'
import { syncArticleToNotion } from '@/lib/notion-articles'

// ─── Vérification du cookie d'authentification ───────────────────────────────

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password + 'dancelab-salt')
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  const token = cookieStore.get('preview_access')?.value
  if (!token) return false

  const envPassword = process.env.PREVIEW_PASSWORD
  if (!envPassword) return false

  const expected = await hashPassword(envPassword)
  return token === expected
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  // Auth
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  let episodeNumber: number

  try {
    const body = await request.json() as { episodeNumber?: number }
    if (!body.episodeNumber || typeof body.episodeNumber !== 'number') {
      return NextResponse.json(
        { error: 'episodeNumber requis (number)' },
        { status: 400 }
      )
    }
    episodeNumber = body.episodeNumber
  } catch {
    return NextResponse.json({ error: 'Corps JSON invalide' }, { status: 400 })
  }

  // Vérifie si un article existe déjà (protection anti-doublon)
  const existing = getPodcastArticleByEpisode(episodeNumber)
  if (existing) {
    return NextResponse.json(
      {
        error: `Un article existe déjà pour l'épisode #${episodeNumber}`,
        existing: { status: existing.status, slug: existing.article.slug },
      },
      { status: 409 }
    )
  }

  // Récupère les épisodes RSS et trouve l'épisode cible
  let episodes
  try {
    episodes = await getEpisodesFromRSS()
  } catch (err) {
    return NextResponse.json(
      { error: `Impossible de récupérer le flux RSS Ausha : ${err}` },
      { status: 502 }
    )
  }

  const episode = episodes.find(ep => ep.number === episodeNumber)
  if (!episode) {
    return NextResponse.json(
      {
        error: `Épisode #${episodeNumber} introuvable dans le flux RSS Ausha. ` +
               `Vérifiez que l'épisode est bien publié et que le numéro est correct.`,
      },
      { status: 404 }
    )
  }

  // Génère l'article via Claude API
  let article
  try {
    article = await generateArticleFromEpisode(episode)
  } catch (err) {
    const message = String(err)
    if (message.includes('ANTHROPIC_API_KEY')) {
      return NextResponse.json(
        {
          error: 'ANTHROPIC_API_KEY non configurée. Ajoute-la dans .env.local.',
          hint: 'ANTHROPIC_API_KEY=sk-ant-...',
        },
        { status: 503 }
      )
    }
    return NextResponse.json(
      { error: `Erreur de génération : ${message}` },
      { status: 500 }
    )
  }

  // Sauvegarde le fichier JSON
  const scheduledFor = getNextTuesdayPublishDate()
  const podcastArticle: PodcastArticleFile = {
    episodeNumber,
    episodeSlug: episode.aushaSlug,
    status: 'brouillon',
    generatedAt: new Date().toISOString(),
    scheduledFor,
    article,
  }

  try {
    savePodcastArticle(podcastArticle)
  } catch (err) {
    return NextResponse.json(
      { error: `Impossible de sauvegarder l'article : ${err}` },
      { status: 500 }
    )
  }

  // Sync vers Notion (best-effort — n'empêche pas la réponse si ça échoue)
  let notionPageId: string | undefined
  if (process.env.NOTION_TOKEN) {
    try {
      notionPageId = await syncArticleToNotion(podcastArticle)
    } catch (notionErr) {
      console.error('[Notion] Erreur de synchronisation :', notionErr)
    }
  }

  return NextResponse.json({
    success: true,
    episodeNumber,
    slug: article.slug,
    status: 'brouillon',
    scheduledFor,
    notionPageId,
    article,
  })
}
