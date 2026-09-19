import { explorerCopy } from '@/data/i18n/explorer'
import { explorerSections } from '@/app/explorer/explorer-data'
import { episodes } from '@/data/episodes'
import { danceStyles } from '@/app/explorer/styles-de-danse/styles-data'
import { metiers } from '@/app/explorer/metiers-de-la-danse/metiers-data'
import { ecolesDanse } from '@/app/explorer/ecoles-de-danse/ecoles-data'
import { getAllPublishedArticles } from '@/lib/all-articles'
import type { UnifiedEpisode } from '@/lib/episodes'
import type { TranslationSource } from './translations'

/** Whitelists only: IDs, URLs, proper names, official titles and coordinates never enter the translation queue. */
function fields(value: unknown, prefix = ''): Record<string, string> {
  if (typeof value === 'string') return value.trim() ? { [prefix]: value } : {}
  if (!value || typeof value !== 'object') return {}
  return Object.assign({}, ...Object.entries(value).map(([key, item]) => fields(item, prefix ? `${prefix}.${key}` : key)))
}
export function explorerSource(): TranslationSource {
  return { id: 'page-explorer', protectedTerms: ['Dance Lab', 'Paris'], fields: {
    ...explorerCopy,
    ...Object.fromEntries(explorerSections.flatMap(section => ['label', 'kicker', 'intro'].map(key => [`section.${section.slug}.${key}`, section[key as 'label' | 'kicker' | 'intro']]))),
  } }
}
export function translationSources(liveEpisodes: UnifiedEpisode[] = []): TranslationSource[] {
  const episodeMap = new Map(episodes.map(ep => [ep.number, {
    id: `episode-${ep.number}`, protectedTerms: [ep.guest, ep.title].filter(Boolean),
    fields: fields({ excerpt: ep.excerpt, description: ep.description, quote: ep.quote, role: ep.role, chapters: ep.chapters.map(chapter => ({ title: chapter.title })) }),
  }]))
  for (const ep of liveEpisodes) {
    const previous = episodeMap.get(ep.number)
    episodeMap.set(ep.number, { id: `episode-${ep.number}`, protectedTerms: [ep.guest, ep.title].filter(Boolean), fields: { ...previous?.fields, ...fields({ excerpt: ep.excerpt, description: ep.description, quote: ep.quote }) } })
  }
  return [explorerSource(), ...episodeMap.values(),
    ...getAllPublishedArticles().map(article => ({ id: `article-${article.slug}`, protectedTerms: [article.guest, ...article.sections.flatMap(section => section.docLink ? [section.docLink.title, section.docLink.platform] : [])].filter(Boolean), fields: fields({ title: article.title, chapo: article.chapo, metaDescription: article.metaDescription, sections: article.sections.map(({ heading, paragraphs, items, itemConclusion, sectionImageAlt }) => ({ heading, paragraphs, items, itemConclusion, sectionImageAlt })), conclusion: article.conclusion, aside: article.aside }) })),
    ...danceStyles.map(style => ({ id: `style-${style.slug}`, protectedTerms: [style.name, ...style.keyFigures.flatMap(group => group.figures.map(figure => figure.name)), ...style.resources.flatMap(resource => [resource.title, resource.author])].filter(Boolean), fields: fields({ summary: style.summary, introduction: style.introduction, origins: style.origins, timeline: style.timeline.map(event => ({ event: event.event })), characteristics: style.characteristics, music: { description: style.music.description }, franceHistory: style.franceHistory, commonConfusions: style.commonConfusions?.map(item => ({ explanation: item.explanation })), resources: style.resources.map(item => ({ description: item.description })) }) })),
    ...metiers.map(job => ({ id: `job-${job.id}`, protectedTerms: ['Dance Lab'], fields: { name: job.nom, description: job.description } })),
    ...ecolesDanse.map(school => ({ id: `school-${school.id}`, protectedTerms: [school.nom, school.ville ?? ''].filter(Boolean), fields: fields({ description: school.description }) })),
  ]
}
