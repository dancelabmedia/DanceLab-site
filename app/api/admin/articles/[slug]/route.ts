/**
 * app/api/admin/articles/[slug]/route.ts
 * API Route — Gestion d'un article individuel.
 *
 * GET    /api/admin/articles/[slug]  → Retourne l'article complet
 * PATCH  /api/admin/articles/[slug]  → Met à jour statut / contenu / notes
 * DELETE /api/admin/articles/[slug]  → Supprime l'article
 *
 * Le [slug] correspond au slug de l'article (pas au numéro d'épisode).
 */

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import {
  getPodcastArticleBySlug,
  updatePodcastArticleStatus,
  updatePodcastArticleContent,
  updateEditorNotes,
  deletePodcastArticle,
  getNextTuesdayPublishDate,
  type PodcastArticleStatus,
} from '@/lib/podcast-articles'
import type { MagazineArticle } from '@/app/decouvrir/articles-data'
import { regenerateArticleAssociations } from '@/lib/article-episode-associations'
import { getEpisodeRecommendationCatalog } from '@/lib/episode-recommendations.server'
import {
  findNotionPageByEpisode,
  updateNotionArticleStatus,
  syncArticleToNotion,
  archiveNotionArticlePage,
} from '@/lib/notion-articles'

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

type RouteParams = { params: Promise<{ slug: string }> }

// ─── GET ──────────────────────────────────────────────────────────────────────

export async function GET(_req: NextRequest, { params }: RouteParams) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const { slug } = await params
  const podcastArticle = getPodcastArticleBySlug(slug)

  if (!podcastArticle) {
    return NextResponse.json({ error: 'Article introuvable' }, { status: 404 })
  }

  return NextResponse.json(podcastArticle)
}

// ─── PATCH ────────────────────────────────────────────────────────────────────

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const { slug } = await params
  const podcastArticle = getPodcastArticleBySlug(slug)

  if (!podcastArticle) {
    return NextResponse.json({ error: 'Article introuvable' }, { status: 404 })
  }

  let body: {
    status?: PodcastArticleStatus
    scheduledFor?: string
    editorNotes?: string
    article?: Partial<MagazineArticle>
  } = {}

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Corps JSON invalide' }, { status: 400 })
  }

  const episodeNumber = podcastArticle.episodeNumber

  // Met à jour le statut
  if (body.status) {
    const validStatuses: PodcastArticleStatus[] = [
      'brouillon', 'a_valider', 'valide', 'programme', 'publie',
    ]
    if (!validStatuses.includes(body.status)) {
      return NextResponse.json(
        { error: `Statut invalide. Valeurs acceptées : ${validStatuses.join(', ')}` },
        { status: 400 }
      )
    }

    // Si on programme : calcule le prochain mardi si pas de date fournie
    let scheduledFor = body.scheduledFor
    if (body.status === 'valide' && !scheduledFor) {
      scheduledFor = getNextTuesdayPublishDate()
    }

    updatePodcastArticleStatus(episodeNumber, body.status, scheduledFor)

    // Sync statut dans Notion (best-effort)
    if (process.env.NOTION_TOKEN) {
      try {
        const notionPageId = await findNotionPageByEpisode(episodeNumber)
        if (notionPageId) {
          await updateNotionArticleStatus(notionPageId, body.status)
        }
      } catch (err) {
        console.error('[Notion] Erreur mise à jour statut :', err)
      }
    }
  }

  // Met à jour les notes éditoriales
  if (body.editorNotes !== undefined) {
    updateEditorNotes(episodeNumber, body.editorNotes)
  }

  // Une modification manuelle des épisodes prime sur les suggestions futures.
  if (body.article?.episodeLinks !== undefined) body.article.episodeLinksMode = 'manual'

  // Met à jour le contenu de l'article
  if (body.article) {
    updatePodcastArticleContent(episodeNumber, body.article)

    // Sync contenu dans Notion (best-effort)
    if (process.env.NOTION_TOKEN) {
      try {
        const refreshed = getPodcastArticleBySlug(slug)
        if (refreshed) await syncArticleToNotion(refreshed)
      } catch (err) {
        console.error('[Notion] Erreur sync contenu :', err)
      }
    }
  }

  // Un brouillon historique sans sélection reçoit sa liste à la publication.
  // Les choix manuels, y compris une liste vide, ne sont jamais remplacés.
  if (body.status === 'programme' || body.status === 'publie') {
    const refreshed = getPodcastArticleBySlug(slug)
    if (refreshed && refreshed.article.episodeLinks === undefined) {
      const { inputs, catalog } = await getEpisodeRecommendationCatalog()
      const cards = new Map(catalog.map(ep => [ep.number, ep]))
      const article = regenerateArticleAssociations({ ...refreshed.article, sourceEpisodeNumber: episodeNumber }, inputs.map(input => ({
        ...input, guest: cards.get(input.number)?.guest, image: cards.get(input.number)?.image,
      })))
      updatePodcastArticleContent(episodeNumber, article)
    }
  }

  // Retourne l'article mis à jour
  const updated = getPodcastArticleBySlug(slug)
  return NextResponse.json({ success: true, article: updated })
}

// ─── DELETE ───────────────────────────────────────────────────────────────────

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const { slug } = await params
  const podcastArticle = getPodcastArticleBySlug(slug)

  if (!podcastArticle) {
    return NextResponse.json({ error: 'Article introuvable' }, { status: 404 })
  }

  const episodeNum = podcastArticle.episodeNumber
  const deleted = deletePodcastArticle(episodeNum)

  if (!deleted) {
    return NextResponse.json(
      { error: 'Impossible de supprimer l\'article' },
      { status: 500 }
    )
  }

  // Archive la page Notion correspondante (best-effort)
  if (process.env.NOTION_TOKEN) {
    try {
      const notionPageId = await findNotionPageByEpisode(episodeNum)
      if (notionPageId) await archiveNotionArticlePage(notionPageId)
    } catch (err) {
      console.error('[Notion] Erreur archivage :', err)
    }
  }

  return NextResponse.json({ success: true })
}
