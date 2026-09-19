export type Locale = 'fr' | 'en'
export const LOCALE_COOKIE = 'dancelab_locale'
export const LOCALE_HEADER = 'x-dancelab-locale'
export const PATH_HEADER = 'x-dancelab-path'

export function localeFromPath(path: string): Locale {
  return path === '/en' || path.startsWith('/en/') ? 'en' : 'fr'
}

export function sourcePath(path: string) {
  return localeFromPath(path) === 'en' ? path.slice(3) || '/' : path
}

/** Stable French slugs are deliberately retained. Queries, fragments and proper names are never translated. */
export function localizedHref(href: string, locale: Locale): string {
  if (!href.startsWith('/') || href.startsWith('//') || /[\\\u0000-\u001f]/.test(href)) return href
  const url = new URL(href, 'https://dancelab.invalid')
  const path = sourcePath(url.pathname)
  if (/^\/(?:api|admin|_next)(?:\/|$)/.test(path) || /\.[a-z0-9]+$/i.test(path)) return href
  return (locale === 'en' ? '/en' + (path === '/' ? '' : path) : path) + url.search + url.hash
}

export function safeLanguageTarget(value: unknown): string | null {
  if (typeof value !== 'string' || value.length > 2048 || !value.startsWith('/') || value.startsWith('//') || /[\\\u0000-\u001f]/.test(value)) return null
  try {
    const url = new URL(value, 'https://dancelab.invalid')
    const path = decodeURIComponent(sourcePath(url.pathname))
    if (url.origin !== 'https://dancelab.invalid' || /[\\\u0000-\u001f]/.test(path) || path.startsWith('//') || /^\/(?:api|admin|_next)(?:\/|$)/.test(path)) return null
    return url.pathname + url.search + url.hash
  } catch { return null }
}

// Publish only complete, reviewed page templates. A URL alone is not a translation.
export const publishedEnglishPaths: readonly string[] = ['/explorer']
export const hasPublishedEnglish = (path: string) => publishedEnglishPaths.includes(sourcePath(path))
