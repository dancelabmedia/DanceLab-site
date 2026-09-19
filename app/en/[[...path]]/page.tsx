import { redirect } from 'next/navigation'

type Props = { params: Promise<{ path?: string[] }> }
export const dynamic = 'force-dynamic'

/**
 * Locale is now cookie-based: all pages render in FR or EN depending on the
 * `dancelab_locale` cookie, without a separate /en/ URL tree.
 *
 * Direct access to /en/[anything] (e.g. bookmarks, external links) is gracefully
 * handled by redirecting to the canonical French-URL path. The cookie already set
 * in the browser will make the page render in English.
 *
 * /en/explorer and /en/acces-prive have their own dedicated files and are not
 * caught here.
 */
export default async function EnglishCatchAll({ params }: Props) {
  const segments = (await params).path ?? []
  redirect(segments.length > 0 ? '/' + segments.join('/') : '/')
}
