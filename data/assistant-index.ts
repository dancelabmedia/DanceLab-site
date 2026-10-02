import { unstable_cache } from 'next/cache'
import { getEpisodes } from '../lib/episodes'
import { magazineArticles } from '../app/decouvrir/articles-data'
import { privateAccessScope } from './private-navigation'
import { normalizeSearchText } from './search'

export type AssistantItem = {
  id: string
  type: 'episode' | 'article'
  title: string
  guest?: string
  episodeNumber?: number
  href: string
  image?: string
  category?: string
  excerpt: string
  /** Full normalized text for fallback text matching */
  searchText: string
  /**
   * Semantic tags: styles, métiers, thématiques.
   * For episodes, populated from buildEpisodeSearchTags (auto) + episode-extras searchTags (manual).
   * For articles, populated from article.tags + article.themes.
   */
  tags: string[]
}

async function buildAssistantIndex(): Promise<AssistantItem[]> {
  // Use getEpisodes() so we get UnifiedEpisode with searchTags
  // (auto-generated from content + manual extras)
  const episodesData = await getEpisodes()

  const episodeItems: AssistantItem[] = episodesData.map(episode => ({
    id: `episode-${episode.number}`,
    type: 'episode',
    title: episode.title,
    guest: episode.guest,
    episodeNumber: episode.number,
    href: `/episodes/${episode.slug}`,
    image: episode.image,
    excerpt: episode.excerpt,
    searchText: normalizeSearchText([
      episode.title,
      episode.guest,
      episode.excerpt,
      episode.description,
      ...episode.searchTags,
    ].filter(Boolean).join(' ')),
    tags: episode.searchTags,
  }))

  const articleItems: AssistantItem[] = magazineArticles
    .filter(article => article.status === 'published')
    .map(article => ({
      id: `article-${article.slug}`,
      type: 'article',
      title: article.title,
      guest: article.guest,
      href: `/decouvrir/articles/${article.slug}`,
      image: article.image,
      category: article.category,
      excerpt: article.chapo,
      searchText: normalizeSearchText([
        article.title,
        article.guest,
        article.chapo,
        article.tags.join(' '),
        article.themes?.join(' ') ?? '',
      ].filter(Boolean).join(' ')),
      tags: [...article.tags, ...(article.themes ?? [])],
    }))

  const items = [...episodeItems, ...articleItems]
  // L'assistant local peut indexer les contenus en cours de travail. Cette
  // exception n'existe jamais dans un build public ou sur Vercel.
  if (process.env.NODE_ENV === 'development' && !process.env.VERCEL) return items
  return items.filter(item => !privateAccessScope(item.href))
}

/**
 * Cached assistant index — rebuilt every hour (same cadence as RSS feed).
 */
export const getAssistantIndex = unstable_cache(
  buildAssistantIndex,
  ['dance-lab-assistant-index-v2'],
  { revalidate: 3600 },
)
