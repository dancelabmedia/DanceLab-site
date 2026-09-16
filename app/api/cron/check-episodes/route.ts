/**
 * app/api/cron/check-episodes/route.ts
 * Cron Job Vercel — Vérification et génération automatique des articles.
 *
 * Déclenché automatiquement chaque lundi à 7h UTC (vercel.json).
 * Peut aussi être appelé manuellement depuis le dashboard Vercel.
 *
 * Fonctionnement :
 *   1. Vérifie la signature CRON_SECRET (sécurité)
 *   2. Récupère les épisodes Ausha RSS
 *   3. Pour chaque épisode sans article → génère via Claude API
 *   4. Sauvegarde les brouillons en JSON
 *
 * Note : Sur Vercel, les fichiers écrits en production ne persistent pas
 * entre les invocations (filesystem éphémère). Ce cron est donc conçu pour
 * être utilisé en complément du workflow GitHub Actions qui lui committe
 * les fichiers dans le dépôt (approche recommandée).
 *
 * En production sur Vercel :
 *   → Utiliser le GitHub Actions workflow de préférence
 *   → Ce cron peut envoyer une notification ou créer un PR via GitHub API
 *
 * CRON_SECRET : Définis cette variable dans Vercel Dashboard → Environment Variables
 * pour sécuriser l'endpoint (Vercel l'injecte automatiquement dans ses crons).
 */

import { NextRequest, NextResponse } from 'next/server'
import { getEpisodesFromRSS } from '@/lib/ausha-rss'
import {
  getPodcastArticleByEpisode,
  savePodcastArticle,
  getNextTuesdayPublishDate,
} from '@/lib/podcast-articles'
import { generateArticleFromEpisode } from '@/lib/article-generator'

export const maxDuration = 300 // 5 minutes max (Vercel Pro)

export async function GET(request: NextRequest) {
  // Vérification de la signature Vercel Cron
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  // Ne jamais ouvrir la génération payante si le secret n'est pas configuré.
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const results: {
    checked: number
    generated: number
    skipped: number
    errors: { episodeNumber: number; error: string }[]
    articles: { episodeNumber: number; slug: string }[]
  } = {
    checked: 0,
    generated: 0,
    skipped: 0,
    errors: [],
    articles: [],
  }

  try {
    // Récupère les épisodes depuis Ausha
    const episodes = await getEpisodesFromRSS()
    const fullEpisodes = episodes.filter(ep => !ep.isExtrait)
    results.checked = fullEpisodes.length

    // Identifie les épisodes sans article (les 10 plus récents seulement pour le cron)
    const recentEpisodes = fullEpisodes.slice(0, 10)
    const toGenerate = recentEpisodes.filter(ep => !getPodcastArticleByEpisode(ep.number))

    if (toGenerate.length === 0) {
      return NextResponse.json({
        ...results,
        message: 'Tous les épisodes récents ont déjà un article.',
      })
    }

    // Génère les articles manquants
    for (const ep of toGenerate) {
      try {
        const article = await generateArticleFromEpisode(ep)
        const scheduledFor = getNextTuesdayPublishDate()

        savePodcastArticle({
          episodeNumber: ep.number,
          episodeSlug: ep.aushaSlug,
          status: 'brouillon',
          generatedAt: new Date().toISOString(),
          scheduledFor,
          article,
        })

        results.generated++
        results.articles.push({ episodeNumber: ep.number, slug: article.slug })

        // Pause entre les appels API
        await new Promise(resolve => setTimeout(resolve, 2000))
      } catch (err) {
        results.errors.push({
          episodeNumber: ep.number,
          error: String(err),
        })
      }
    }
  } catch (err) {
    return NextResponse.json(
      { error: `Erreur cron : ${err}`, results },
      { status: 500 }
    )
  }

  return NextResponse.json({
    ...results,
    message: `${results.generated} article(s) généré(s), ${results.errors.length} erreur(s).`,
    timestamp: new Date().toISOString(),
  })
}
