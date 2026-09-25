import type { MagazineArticle, EpisodeLink } from '@/app/decouvrir/articles-data'
import type { RecommendationInput } from '@/lib/episode-recommendations'
import { analyzeEpisode, createRecommendationIndex } from '@/lib/episode-recommendations'
import { episodes } from '@/data/episodes'
import { episodesList } from '@/data/episodes-list'
import savedAssociations from '@/data/article-episode-associations.json'

export const PROTECTED_ARTICLE = 'construire-carriere-danseur-durable'
export type AssociationEpisodeInput = RecommendationInput & { guest?: string; image?: string }

export function episodeLink(number: number, catalog: AssociationEpisodeInput[] = episodes): EpisodeLink | null {
  const source = catalog.find(ep => ep.number === number)
  const card = episodesList.find(ep => ep.number === number)
  if (!source) return null
  return {
    number: String(number), slug: source.slug,
    name: source.guest ?? card?.guest ?? '',
    image: source.image ?? card?.image ?? '',
  }
}

/** Strict offline selection. A broad career/style match alone never qualifies. */
export function selectArticleEpisodes(article: MagazineArticle, catalog: RecommendationInput[] = episodes): number[] {
  if (article.slug === PROTECTED_ARTICLE) return article.episodeLinks?.map(link => Number(link.number)) ?? []
  const body = article.sections.flatMap(section => [section.heading, ...section.paragraphs, ...(section.items ?? [])]).join('\n')
  const profile = analyzeEpisode({
    number: 0, slug: article.slug, title: article.title, excerpt: article.chapo,
    description: body, editorial: [Array.isArray(article.conclusion) ? article.conclusion.join(' ') : article.conclusion],
  })
  const index = createRecommendationIndex(catalog)
  const generic = new Set(['carriere', 'corps', 'identite', 'reussite', 'international', 'scene'])
  const ownNumber = article.sourceEpisodeNumber ?? 0
  const scored = catalog.flatMap(ep => {
    const candidate = index.profiles.get(ep.number)
    if (!candidate) return []
    const shared = profile.themes.filter(theme => candidate.themes.some(other => other.key === theme.key))
    const strong = shared.filter(theme => !generic.has(theme.key) &&
      theme.strength >= 8 && candidate.themes.some(other => other.key === theme.key && other.strength >= 5 &&
        other.evidence.some(e => e.source === 'title' || e.source === 'excerpt' || e.source === 'chapter')))
    const isOwnInterview = ep.number === ownNumber && ownNumber > 0
    // The source interview is verified provenance, not a generic keyword match.
    if (!isOwnInterview && !strong.length) return []
    const titleEvidence = strong.filter(theme => theme.evidence.some(e => e.source === 'title' || e.source === 'excerpt'))
    const score = (isOwnInterview ? 100 : 0) + strong.reduce((sum, theme) => {
      const other = candidate.themes.find(t => t.key === theme.key)!
      const rarity = 1 + Math.log(1 + catalog.length / (index.frequency.get(theme.key) ?? 1))
      return sum + Math.min(theme.strength, other.strength) * rarity
    }, 0) + titleEvidence.length * 12 + Math.min(shared.length, 3) * 2
    return [{ number: ep.number, score }]
  })
  // Never infer a recommendation from an incidental word in a long article:
  // it needs a central topic, or two independently evidenced specific topics.
  return scored.sort((a, b) => b.score - a.score || a.number - b.number)
    .filter(item => item.score >= 24 || item.number === ownNumber)
    .slice(0, 4).map(item => item.number)
}

/** The persisted list is the only rendered source; [] means intentionally no match. */
export function getArticleEpisodeLinks(article: MagazineArticle): EpisodeLink[] {
  const saved = savedAssociations[article.slug as keyof typeof savedAssociations]
  if (saved) return saved.numbers.flatMap(number => {
    const link = episodeLink(number)
    return link ? [link] : []
  })
  if (article.episodeLinks) return article.episodeLinks
  return []
}

/** Explicit editorial overrides survive regeneration unless force is requested. */
export function regenerateArticleAssociations(article: MagazineArticle, catalog: AssociationEpisodeInput[], force = false): MagazineArticle {
  if (article.slug === PROTECTED_ARTICLE || (article.episodeLinksMode === 'manual' && !force)) return article
  const numbers = selectArticleEpisodes(article, catalog)
  return {
    ...article, episodeLinks: numbers.flatMap(number => {
      const link = episodeLink(number, catalog)
      return link ? [link] : []
    }), episodeLinksMode: 'auto',
  }
}
