import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const PROTECTED_PATHS = ["/sortir", "/apprendre", "/explorer/artistes", "/explorer/choregraphes", "/explorer/compagnies"]
const ADMIN_PATHS     = ["/admin"]
const COOKIE_NAME = "preview_access"

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password + "dancelab-salt")
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

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
    return NextResponse.next()
  }

  // ── Pages preview classiques
  const isProtected = PROTECTED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(path + "/")
  )

  if (!isProtected) return NextResponse.next()

  const password = process.env.PREVIEW_PASSWORD
  if (!password) return NextResponse.next() // protection désactivée si pas de mot de passe

  const expectedToken = await hashPassword(password)
  const accessCookie = request.cookies.get(COOKIE_NAME)

  if (accessCookie?.value === expectedToken) {
    return NextResponse.next()
  }

  const loginUrl = new URL("/acces-prive", request.url)
  loginUrl.searchParams.set("redirect", pathname)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: [
    "/sortir/:path*",
    "/apprendre/:path*",
    "/admin/:path*",
    "/admin",
    "/explorer/artistes/:path*",
    "/explorer/artistes",
    "/explorer/choregraphes/:path*",
    "/explorer/choregraphes",
    "/explorer/compagnies/:path*",
    "/explorer/compagnies",
  ],
}
