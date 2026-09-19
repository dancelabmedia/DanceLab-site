import 'server-only'
import { headers } from 'next/headers'
import type { Metadata } from 'next'
import { SITE_URL } from '@/data/site'
import { privateAccessScope } from '@/data/private-navigation'
import { LOCALE_HEADER, PATH_HEADER, localizedHref, sourcePath, hasPublishedEnglish, type Locale } from './routing'

export async function requestLocale(): Promise<Locale> {
  return (await headers()).get(LOCALE_HEADER) === 'en' ? 'en' : 'fr'
}
export async function requestPath() { return (await headers()).get(PATH_HEADER) || '/' }
export function languageAlternates(path: string, locale: Locale): Metadata['alternates'] {
  const original = sourcePath(path)
  const translated = hasPublishedEnglish(original) && !privateAccessScope(original)
  return {
    canonical: `${SITE_URL}${localizedHref(original, locale)}`,
    ...(translated ? { languages: { fr: `${SITE_URL}${original}`, en: `${SITE_URL}${localizedHref(original, 'en')}`, 'x-default': `${SITE_URL}${original}` } } : {}),
  }
}
