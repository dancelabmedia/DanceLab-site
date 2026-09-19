import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/data/site'
import { explorerAccessSections, sectionVisibility } from '@/data/section-visibility'
import { danceStyles } from './explorer/styles-de-danse/styles-data'
import { getEpisodes } from '@/lib/episodes'
import { getAllPublishedArticles } from '@/lib/all-articles'
import { hasPublishedEnglish, localizedHref } from '@/lib/i18n/routing'

export const revalidate = 3600
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const paths = ['/', '/a-propos', '/ecouter', '/ecouter/incontournables', '/ecouter/playlists-thematiques', '/decouvrir', '/decouvrir/articles-culture', '/explorer']
  for (const section of explorerAccessSections) {
    if (sectionVisibility[section.key] === 'public') paths.push(section.path)
  }
  if (sectionVisibility.danceStyles === 'public') {
    paths.push(...danceStyles.map(style => `/explorer/styles-de-danse/${style.slug}`))
  }
  paths.push(...(await getEpisodes()).map(episode => `/episodes/${episode.slug}`))
  paths.push(...getAllPublishedArticles().map(article => `/decouvrir/articles/${article.slug}`))
  return [...new Set(paths)].flatMap(path => {
    if (!hasPublishedEnglish(path)) return [{ url: `${SITE_URL}${path}` }]
    const languages = { fr: `${SITE_URL}${path}`, en: `${SITE_URL}${localizedHref(path, 'en')}`, 'x-default': `${SITE_URL}${path}` }
    return [{ url: languages.fr, alternates: { languages } }, { url: languages.en, alternates: { languages } }]
  })
}
