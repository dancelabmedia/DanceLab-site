/** Configuration publique (aucun secret). Ouvrir chaque rubrique séparément ici. */
export type SectionKey = 'danceStyles' | 'jobs' | 'schools'
export type Visibility = 'private' | 'public'

/** Page d'accueil Explorer — contrôle l'indexation sitemap et le generateStaticParams. */
export const explorerHomeVisibility: Visibility = 'private'

export const sectionVisibility: Record<SectionKey, Visibility> = {
  danceStyles: 'private',
  jobs: 'private',
  schools: 'private',
}

export const explorerAccessSections = [
  { key: 'danceStyles', path: '/explorer/styles-de-danse', label: 'Styles de danse' },
  { key: 'jobs', path: '/explorer/metiers-de-la-danse', label: 'Métiers' },
  { key: 'schools', path: '/explorer/ecoles-de-danse', label: 'Écoles de danse' },
] as const

export function sectionForPath(value: string) {
  if (!value.startsWith('/') || value.startsWith('//') || /[\\\u0000-\u001f]/.test(value)) return undefined
  try {
    const url = new URL(value, 'https://dancelab.invalid')
    if (url.origin !== 'https://dancelab.invalid') return undefined
    const pathname = decodeURIComponent(url.pathname).replace(/\/+$/, '')
    return explorerAccessSections.find(({ path }) => pathname === path || pathname.startsWith(`${path}/`))
  } catch { return undefined }
}

export function isPrivateSectionPath(path: string) {
  const section = sectionForPath(path)
  return !!section && sectionVisibility[section.key] === 'private'
}

export function safeExplorerReturnTo(value: unknown): string {
  return typeof value === 'string' && value.length <= 2048 && sectionForPath(value)
    ? value
    : explorerAccessSections[0].path
}
