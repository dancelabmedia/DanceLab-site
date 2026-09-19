import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { isPrivateSectionPath } from "./data/section-visibility"
import { EXPLORER_COOKIE, validExplorerSession } from "./lib/explorer-session"
import { previewPaths } from './data/private-navigation'
import { hashPreviewPassword as hashPassword } from './lib/preview-session'
import { isLocalEditorAccess } from './lib/local-editor-access'
import { LOCALE_COOKIE, LOCALE_HEADER, PATH_HEADER, localeFromPath, sourcePath, localizedHref } from './lib/i18n/routing'

const PROTECTED_PATHS = previewPaths
const ADMIN_PATHS     = ["/admin"]
const COOKIE_NAME = "preview_access"

export async function middleware(request: NextRequest) {
  const originalPath = request.nextUrl.pathname
  const urlLocale = localeFromPath(originalPath)
  const pathname = sourcePath(originalPath)
  // Cookie-based language preference: respected on all non-/en/ paths.
  // /en/* paths always resolve to English regardless of cookie.
  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value
  const locale = urlLocale === 'fr' && cookieLocale === 'en' ? 'en' : urlLocale
  const forwardedHeaders = new Headers(request.headers)
  // Never trust a client-supplied locale/path header. They are derived from the actual URL + cookie.
  forwardedHeaders.set(LOCALE_HEADER, locale)
  forwardedHeaders.set(PATH_HEADER, originalPath)
  const next = () => NextResponse.next({ request: { headers: forwardedHeaders } })
  if (urlLocale === 'en' && /^\/(?:api|admin|_next)(?:\/|$)/.test(pathname)) return new NextResponse(null, { status: 404 })

  // Toutes les sous-routes, requêtes RSC et préchargements sont contrôlés.
  // Fermé par défaut, y compris si EXPLORER_ACCESS_CODE n'est pas configuré.
  if (isPrivateSectionPath(pathname)) {
    let response: NextResponse
    if (isLocalEditorAccess(request.headers) || await validExplorerSession(request.cookies.get(EXPLORER_COOKIE)?.value)) {
      response = next()
    } else {
      const loginUrl = new URL(localizedHref('/explorer/acces-prive', locale), request.url)
      loginUrl.searchParams.set('returnTo', pathname + request.nextUrl.search)
      response = NextResponse.redirect(loginUrl)
    }
    response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive')
    response.headers.set('Cache-Control', 'private, no-store, max-age=0')
    return response
  }

  // ── Pages admin : protégées par ADMIN_PASSWORD (ou PREVIEW_PASSWORD en fallback)
  const isAdmin = ADMIN_PATHS.some(
    (path) => pathname === path || pathname.startsWith(path + "/")
  )

  if (isAdmin) {
    const adminPassword = process.env.ADMIN_PASSWORD ?? process.env.PREVIEW_PASSWORD
    if (adminPassword) {
      const expected     = await hashPassword(adminPassword)
      const accessCookie = request.cookies.get(COOKIE_NAME)
      if (accessCookie?.value !== expected) {
        const loginUrl = new URL("/acces-prive", request.url)
        loginUrl.searchParams.set("redirect", pathname)
        return NextResponse.redirect(loginUrl)
      }
    }
    return next()
  }

  // ── Pages preview classiques
  const isProtected = PROTECTED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(path + "/")
  )

  if (!isProtected) return next()

  if (isLocalEditorAccess(request.headers)) {
    const response = next()
    response.headers.set('Cache-Control', 'private, no-store')
    response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive')
    return response
  }

  const password = process.env.PREVIEW_PASSWORD

  const expectedToken = password ? await hashPassword(password) : null
  const accessCookie = request.cookies.get(COOKIE_NAME)

  if (expectedToken && accessCookie?.value === expectedToken) {
    const response = next()
    response.headers.set('Cache-Control', 'private, no-store')
    response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive')
    return response
  }

  const loginUrl = new URL(localizedHref('/acces-prive', locale), request.url)
  loginUrl.searchParams.set("redirect", pathname)
  const response = NextResponse.redirect(loginUrl)
  response.headers.set('Cache-Control', 'private, no-store')
  response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive')
  return response
}

export const config = {
  matcher: [
    '/en/:path*',
    '/explorer/styles-de-danse/:path*', '/explorer/metiers-de-la-danse/:path*', '/explorer/ecoles-de-danse/:path*',
    '/explorer/artistes/:path*', '/explorer/choregraphes/:path*', '/explorer/compagnies/:path*',
    '/sortir/:path*', '/apprendre/:path*', '/admin/:path*',
    '/((?!api(?:/|$)|_next(?:/|$)|.*\\.[^/]+$).*)',
  ],
}
