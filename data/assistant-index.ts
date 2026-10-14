import { unstable_cache } from 'next/cache'
import { getEpisodes } from '../lib/episodes'
import { magazineArticles } from '../app/decouvrir/articles-data'
import { danceStyles } from '../app/explorer/styles-de-danse/styles-data'
import { metiers, UNIVERS } from '../app/explorer/metiers-de-la-danse/metiers-data'
import { privateAccessScope } from './private-navigation'
import { normalizeSearchText } from './search'

export type AssistantItem = {
  id: string
  type: 'episode' | 'article' | 'style' | 'metier'
  title: string
  guest?: string
  episodeNumber?: number
  href: string
  image?: string
  category?: string
  excerpt: string
  /** Full editorial evidence used server-side to validate a recommendation. */
  recommendationEvidence?: string
  /** Server-only editorial details used to answer before recommending content. */
  answerDetails?: {
    definition?: string
    formation?: string
    environment?: string
    status?: string
  }
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
    recommendationEvidence: normalizeSearchText([
      episode.title,
      episode.guest,
      episode.excerpt,
      episode.description,
    ].filter(Boolean).join(' ')),
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

  const styleItems: AssistantItem[] = danceStyles.map(style => ({
    id: `style-${style.slug}`,
    type: 'style',
    title: style.name,
    href: `/explorer/styles-de-danse/${style.slug}`,
    image: style.image,
    category: style.family,
    excerpt: style.summary,
    searchText: normalizeSearchText([
      style.name,
      ...(style.aliases ?? []),
      style.family,
      style.summary,
      style.introduction,
      style.origins,
      style.characteristics.movements,
      style.characteristics.musicRelationship,
      style.characteristics.improvisation,
      ...style.keywords,
      ...(style.commonConfusions?.flatMap(item => [item.styles, item.explanation]) ?? []),
    ].join(' ')),
    tags: [style.name, ...(style.aliases ?? []), style.family, ...style.keywords],
  }))

  const metierItems: AssistantItem[] = metiers.map(metier => ({
    id: `metier-${metier.id}`,
    type: 'metier',
    title: metier.nom,
    href: `/explorer/metiers-de-la-danse/${UNIVERS[metier.univers].slug}/${metier.id}`,
    category: UNIVERS[metier.univers].label,
    excerpt: metier.description,
    answerDetails: {
      definition: metier.definition,
      formation: metier.formation,
      environment: metier.environnement,
      status: metier.statut,
    },
    searchText: normalizeSearchText([
      metier.nom,
      metier.description,
      metier.definition,
      metier.environnement,
      metier.formation,
      metier.statut,
      ...(metier.tags ?? []),
      ...(metier.missions ?? []),
      ...(metier.competences ?? []),
    ].filter(Boolean).join(' ')),
    tags: [UNIVERS[metier.univers].label, ...(metier.tags ?? [])],
  }))

  const items = [...episodeItems, ...articleItems, ...styleItems, ...metierItems]
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
  ['dance-lab-assistant-index-v5'],
  { revalidate: 3600, tags: ['ausha-derived-content'] },
)
