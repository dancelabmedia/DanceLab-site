/**
 * lib/all-articles.ts
 * Source de données unifiée pour TOUS les articles du magazine.
 *
 * Fusionne :
 *   • Articles statiques  → app/decouvrir/articles-data.ts
 *   • Articles podcast générés → data/podcast-articles/*.json
 *
 * À utiliser dans les Server Components et les routes API qui ont besoin
 * de l'ensemble des articles (listing, recherche, génération statique).
 *
 * ⚠️  Ce module utilise `fs` (Node.js) — à importer côté serveur uniquement.
 */

import {
  magazineArticles,
  isArticlePublished,
  type MagazineArticle,
} from '@/app/decouvrir/articles-data'
import { getPublishedPodcastArticles, getPodcastArticleBySlug } from '@/lib/podcast-articles'
import { getArticleEpisodeLinks } from '@/lib/article-episode-associations'

function withAssociatedEpisodes(article: MagazineArticle): MagazineArticle {
  return { ...article, episodeLinks: getArticleEpisodeLinks(article) }
}

/**
 * Retourne tous les articles publiés (statiques + podcast générés),
 * triés du plus récent au plus ancien.
 *
 * Les articles statiques ont priorité en cas de slug dupliqué.
 */
export function getAllPublishedArticles(): MagazineArticle[] {
  const staticArticles = magazineArticles.filter(isArticlePublished)
  const podcastArticles = getPublishedPodcastArticles().filter(isArticlePublished)

  // Déduplique par slug (statiques en priorité)
  const seenSlugs = new Set(staticArticles.map(a => a.slug))
  const uniquePodcast = podcastArticles.filter(a => !seenSlugs.has(a.slug))

  return [...staticArticles, ...uniquePodcast].map(withAssociatedEpisodes).sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  )
}

/**
 * Recherche un article par slug dans toutes les sources.
 * Cherche d'abord dans les articles statiques, puis dans les articles podcast.
 */
export function getArticleBySlug(slug: string): MagazineArticle | undefined {
  // Articles statiques en priorité
  const staticMatch = magazineArticles.find(a => a.slug === slug)
  if (staticMatch) return withAssociatedEpisodes(staticMatch)

  // Articles podcast générés
  const podcastMatch = getPodcastArticleBySlug(slug)
  if (podcastMatch) return withAssociatedEpisodes(podcastMatch.article)

  return undefined
}

/**
 * Retourne les slugs de tous les articles publiés.
 * Utilisé pour generateStaticParams dans Next.js.
 */
export function getAllPublishedSlugs(): string[] {
  return getAllPublishedArticles().map(a => a.slug)
}
