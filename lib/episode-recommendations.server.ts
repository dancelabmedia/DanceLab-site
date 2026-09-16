import { cache } from 'react'
import { episodes as legacyEpisodes, type Episode } from '../data/episodes'
import { getEpisodes, type UnifiedEpisode } from './episodes'
import { getAllPublishedArticles } from './all-articles'
import { isArticlePublished, type MagazineArticle } from '../app/decouvrir/articles-data'
import { createRecommendationIndex, recommendEpisodes, type RecommendationInput } from './episode-recommendations'

/** Hydrate historical summaries with their full interview, without changing cards. */
export function buildRecommendationInputs(
  catalog: UnifiedEpisode[],
  legacy: Episode[],
  articles: MagazineArticle[],
): RecommendationInput[] {
  const historical = new Map(legacy.map(episode => [episode.number, episode]))
  return catalog.map(episode => {
    const full = historical.get(episode.number)
    const description = full?.description || episode.description
    // RSS chapters, when embedded in the description, are editorial signals too.
    const rssChapters = [...description.matchAll(/(?:^|\n)\s*(\d{1,2}:\d{2}(?::\d{2})?)\s*[-–—:.)]?\s+([^\n]+)/g)]
      .map(([, time, title]) => ({ time, title }))
    const editorial = articles.filter(article => isArticlePublished(article) &&
      (article.episodeSlug === episode.slug || Number(article.episodeNumber.replace(/^#/, '')) === episode.number))
      // Only the primary episode; related-episode links are NOT interview evidence.
      .map(article => [article.title, article.chapo, article.quote ?? '',
        ...article.sections.flatMap(section => [section.heading, ...section.paragraphs, ...(section.items ?? [])]),
        ...[article.conclusion].flat(),
      ].join('\n'))
    return {
      number: episode.number,
      slug: episode.slug,
      title: episode.title,
      excerpt: full?.excerpt || episode.excerpt,
      description,
      quote: episode.quote || full?.quote,
      tags: full?.tags ?? [],
      chapters: [...(full?.chapters ?? []), ...rssChapters],
      role: full?.role,
      editorial,
    }
  })
}

/** One shared catalogue/index per server render. RSS and page ISR refresh hourly. */
export const getEpisodeRecommendationCatalog = cache(async () => {
  const catalog = await getEpisodes()
  const inputs = buildRecommendationInputs(catalog, legacyEpisodes, getAllPublishedArticles())
  return { catalog, inputs, index: createRecommendationIndex(inputs) }
})

/** Reuse the same RSS snapshot for metadata, the current page and its cards. */
export async function getRecommendationEpisodeBySlug(slug: string): Promise<UnifiedEpisode | null> {
  const { catalog } = await getEpisodeRecommendationCatalog()
  return catalog.find(episode => episode.slug === slug) ?? null
}

export async function getRecommendedEpisodes(number: number): Promise<UnifiedEpisode[]> {
  const { catalog, index } = await getEpisodeRecommendationCatalog()
  const byNumber = new Map(catalog.map(episode => [episode.number, episode]))
  return recommendEpisodes(number, index).flatMap(result => {
    const episode = byNumber.get(result.number)
    return episode ? [episode] : []
  })
}
