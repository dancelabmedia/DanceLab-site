/**
 * app/api/admin/articles/route.ts
 * API Route — Liste et gestion des articles podcast générés.
 *
 * GET  /api/admin/articles           → Liste tous les articles générés
 * POST /api/admin/articles/check     → Vérifie les épisodes sans articles
 */

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getAllPodcastArticles } from '@/lib/podcast-articles'
import { getEpisodesFromRSS } from '@/lib/ausha-rss'
import { getEpisodesWithArticles } from '@/lib/podcast-articles'

// ─── Auth helper ──────────────────────────────────────────────────────────────

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

// ─── GET /api/admin/articles ──────────────────────────────────────────────────

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const articles = getAllPodcastArticles()

  return NextResponse.json({
    total: articles.length,
    articles: articles
      .sort((a, b) => b.episodeNumber - a.episodeNumber)
      .map(pa => ({
        episodeNumber: pa.episodeNumber,
        episodeSlug: pa.episodeSlug,
        status: pa.status,
        generatedAt: pa.generatedAt,
        scheduledFor: pa.scheduledFor,
        publishedAt: pa.publishedAt,
        editorNotes: pa.editorNotes,
        slug: pa.article.slug,
        title: pa.article.title,
        guest: pa.article.guest,
        chapo: pa.article.chapo,
        category: pa.article.category,
        tags: pa.article.tags,
        image: pa.article.image,
      })),
  })
}

// ─── POST /api/admin/articles (action: check-new-episodes) ───────────────────

export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  let body: { action?: string } = {}
  try {
    body = await request.json()
  } catch {
    // Pas de body — on retourne la liste des épisodes sans article
  }

  if (body.action === 'check-new-episodes') {
    // Récupère les épisodes RSS et identifie ceux sans articles
    let rssEpisodes
    try {
      rssEpisodes = await getEpisodesFromRSS()
    } catch (err) {
      return NextResponse.json(
        { error: `Impossible de récupérer le flux RSS : ${err}` },
        { status: 502 }
      )
    }

    const episodesWithArticles = getEpisodesWithArticles()

    const missingArticles = rssEpisodes
      .filter(ep => !ep.isExtrait && !episodesWithArticles.has(ep.number))
      .map(ep => ({
        number: ep.number,
        title: ep.title,
        guest: ep.guest,
        pubDate: ep.pubDate,
        aushaSlug: ep.aushaSlug,
        image: ep.aushaImage,
      }))
      .sort((a, b) => b.number - a.number)

    return NextResponse.json({
      totalRssEpisodes: rssEpisodes.filter(ep => !ep.isExtrait).length,
      totalWithArticles: episodesWithArticles.size,
      missingCount: missingArticles.length,
      missing: missingArticles,
    })
  }

  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 })
}
