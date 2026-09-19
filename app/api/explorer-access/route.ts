import { NextRequest, NextResponse } from 'next/server'
import { safeExplorerReturnTo } from '@/data/section-visibility'
import { createExplorerSession, EXPLORER_COOKIE, EXPLORER_SESSION_SECONDS, explorerSecret, matchesExplorerCode, validExplorerSession } from '@/lib/explorer-session'
import { limitExplorerAttempt } from '@/lib/explorer-rate-limit'
import { PREVIEW_COOKIE, validPreviewSession } from '@/lib/preview-session'
import { isLocalEditorAccess } from '@/lib/local-editor-access'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
const headers = { 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex, nofollow, noarchive' }
const json = (body: object, status = 200) => NextResponse.json(body, { status, headers })
function sameOrigin(request: NextRequest) {
  // Next peut normaliser request.nextUrl.hostname en « localhost » même quand
  // le navigateur utilise 127.0.0.1. Comparer l'origine à l'hôte réellement reçu,
  // sans utiliser un X-Forwarded-Host fourni par le client.
  const host = request.headers.get('host') || request.nextUrl.host
  return request.headers.get('origin') === `${request.nextUrl.protocol}//${host}` && request.headers.get('sec-fetch-site') !== 'cross-site'
}

/** Le menu reçoit uniquement des booléens ; les cookies restent HttpOnly. */
export async function GET(request: NextRequest) {
  const localEditor = isLocalEditorAccess(request.headers)
  return json({
    authorized: localEditor || await validExplorerSession(request.cookies.get(EXPLORER_COOKIE)?.value),
    previewAuthorized: localEditor || await validPreviewSession(request.cookies.get(PREVIEW_COOKIE)?.value),
    localEditor,
  })
}

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return json({ error: 'Requête non autorisée.' }, 403)
  if (!request.headers.get('content-type')?.startsWith('application/json')) return json({ error: 'Format non accepté.' }, 415)
  // Vercel remplace X-Forwarded-For. Hors Vercel, ne pas faire confiance à un
  // en-tête fourni par le visiteur : un seul quota conservateur pour l'instance.
  const ip = process.env.VERCEL === '1' ? request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown' : 'local'
  const retryAfter = limitExplorerAttempt(ip)
  if (retryAfter) {
    const response = json({ error: 'Trop de tentatives. Réessayez dans 15 minutes.' }, 429)
    response.headers.set('Retry-After', String(retryAfter))
    return response
  }
  const secret = explorerSecret()
  if (!secret) return json({ error: "L'accès privé n'est pas encore configuré. La rubrique reste protégée." }, 503)
  let body: { code?: unknown; returnTo?: unknown }
  try {
    const reader = request.body?.getReader()
    if (!reader) return json({ error: 'Requête invalide.' }, 400)
    const chunks: Uint8Array[] = []
    let size = 0
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      size += value.length
      if (size > 4096) { await reader.cancel(); return json({ error: 'Requête trop volumineuse.' }, 413) }
      chunks.push(value)
    }
    body = JSON.parse(Buffer.concat(chunks).toString('utf8'))
    if (!body || typeof body !== 'object' || typeof body.code !== 'string' || body.code.length > 512) throw new Error('invalid')
  } catch { return json({ error: 'Requête invalide.' }, 400) }
  if (!await matchesExplorerCode(body.code as string, secret)) return json({ error: 'Code incorrect. Veuillez réessayer.' }, 401)
  const response = json({ returnTo: safeExplorerReturnTo(body.returnTo) })
  response.cookies.set(EXPLORER_COOKIE, await createExplorerSession(secret), {
    httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax',
    path: '/', maxAge: EXPLORER_SESSION_SECONDS,
  })
  return response
}

export async function DELETE(request: NextRequest) {
  if (!sameOrigin(request)) return json({ error: 'Requête non autorisée.' }, 403)
  const response = json({ ok: true })
  response.cookies.set(EXPLORER_COOKIE, '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 0 })
  return response
}
