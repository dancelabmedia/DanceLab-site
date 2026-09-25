import { NextRequest, NextResponse } from 'next/server'
import { LOCALE_COOKIE, localizedHref, safeLanguageTarget } from '@/lib/i18n/routing'

export async function POST(request: NextRequest) {
  const origin = `${request.nextUrl.protocol}//${request.headers.get('host')}`
  if (request.headers.get('origin') !== origin) return NextResponse.json({ error: 'Invalid origin' }, { status: 403 })
  const raw = await request.text()
  if (raw.length > 4096) return NextResponse.json({ error: 'Invalid request' }, { status: 413 })
  let data
  try { data = JSON.parse(raw) } catch { return NextResponse.json({ error: 'Invalid request' }, { status: 400 }) }
  const target = safeLanguageTarget(data?.href)
  if (!target || (data?.locale !== 'fr' && data?.locale !== 'en')) return NextResponse.json({ error: 'Invalid language or target' }, { status: 400 })
  // Both locales render the same route component; only the public locale URL changes.
  const href = localizedHref(target, data.locale)
  const response = NextResponse.json({ href }, { headers: { 'Cache-Control': 'private, no-store' } })
  response.cookies.set(LOCALE_COOKIE, data.locale, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 365 })
  return response
}
