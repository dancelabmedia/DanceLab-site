import 'server-only'
import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { privateAccessScope, privateAccessHref } from '@/data/private-navigation'
import { EXPLORER_COOKIE, validExplorerSession } from '@/lib/explorer-session'
import { PREVIEW_COOKIE, validPreviewSession } from '@/lib/preview-session'
import { isLocalEditorAccess } from '@/lib/local-editor-access'
import { getEpisodeBySlug } from '@/lib/episodes'
import { getArticleBySlug } from '@/lib/all-articles'
import { isArticlePublished } from '@/app/decouvrir/articles-data'
import { danceStyles } from '@/app/explorer/styles-de-danse/styles-data'
import { TAG_LABEL, slugToKey } from '@/lib/episode-themes'
import { localizedHref } from './routing'

/** Defence in depth: a new language must never become a second entrance to private content. */
export async function requireSourceAccess(path: string) {
  const scope = privateAccessScope(path)
  if (!scope || isLocalEditorAccess(await headers())) return
  const jar = await cookies()
  const authorized = scope === 'explorer'
    ? await validExplorerSession(jar.get(EXPLORER_COOKIE)?.value)
    : await validPreviewSession(jar.get(PREVIEW_COOKIE)?.value)
  if (!authorized) redirect(localizedHref(privateAccessHref(path), 'en'))
}

const pages: Record<string, string> = {
  '/': 'Dance Lab', '/a-propos': 'About Dance Lab', '/decouvrir': 'Magazine', '/ecouter': 'Podcast', '/agenda': 'Events',
  '/recherche': 'Search', '/mentions-legales': 'Legal notice', '/politique-de-confidentialite': 'Privacy policy', '/gestion-cookies': 'Cookie settings',
  '/decouvrir/articles-culture': 'Articles', '/decouvrir/artistes-a-suivre': 'Artist portraits', '/decouvrir/decryptages': 'Analysis', '/decouvrir/tendances': 'Trends', '/decouvrir/histoire-des-styles': 'Dance history',
  '/ecouter/derniers-episodes': 'Latest episodes', '/ecouter/incontournables': 'Essential listening', '/ecouter/playlists-thematiques': 'Themed playlists',
  '/sortir': 'Events', '/apprendre': 'Learn', '/apprendre/guides': 'Guides', '/apprendre/conseils': 'Advice', '/apprendre/formations': 'Training', '/apprendre/outils': 'Tools',
  '/explorer/styles-de-danse': 'Dance styles', '/explorer/metiers-de-la-danse': 'Careers in dance', '/explorer/ecoles-de-danse': 'Dance schools', '/explorer/artistes': 'Artists', '/explorer/choregraphes': 'Choreographers', '/explorer/compagnies': 'Companies',
}
export async function sourcePage(path: string): Promise<{ title: string; originalTitle?: boolean } | null> {
  await requireSourceAccess(path)
  if (pages[path]) return { title: pages[path] }
  let match = path.match(/^\/episodes\/([^/]+)$/)
  if (match) { const ep = await getEpisodeBySlug(match[1]); return ep ? { title: ep.title, originalTitle: true } : null }
  match = path.match(/^\/decouvrir\/articles\/([^/]+)$/)
  if (match) { const article = getArticleBySlug(match[1]); return article && isArticlePublished(article) ? { title: article.title, originalTitle: true } : null }
  match = path.match(/^\/explorer\/styles-de-danse\/([^/]+)$/)
  if (match) { const style = danceStyles.find(style => style.slug === match![1]); return style ? { title: style.name, originalTitle: true } : null }
  match = path.match(/^\/themes\/([^/]+)$/)
  if (match && TAG_LABEL[slugToKey(match[1])]) return { title: TAG_LABEL[slugToKey(match[1])], originalTitle: true }
  return null
}
