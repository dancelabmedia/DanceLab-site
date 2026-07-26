import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const COOKIE_NAME = "preview_access"
const COOKIE_MAX_AGE_PROD = 60 * 60 * 24 * 30 // 30 jours en production
const COOKIE_MAX_AGE_DEV = 30                   // 30 secondes en local (mode test)

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password + "dancelab-salt")
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

function isLocalhost(request: NextRequest): boolean {
  const host = request.headers.get("host") ?? ""
  return host.startsWith("localhost") || host.startsWith("127.0.0.1")
}

// POST : valide le mot de passe et pose le cookie
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  const { password } = body as { password?: string }

  const envPassword = process.env.PREVIEW_PASSWORD
  if (!envPassword || !password || password !== envPassword) {
    return NextResponse.json({ error: "Mot de passe incorrect." }, { status: 401 })
  }

  const token = await hashPassword(envPassword)
  const maxAge = isLocalhost(request) ? COOKIE_MAX_AGE_DEV : COOKIE_MAX_AGE_PROD

  const response = NextResponse.json({ ok: true, dev: isLocalhost(request) })
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    maxAge,
    path: "/",
  })

  return response
}

// DELETE : supprime le cookie (réservé à localhost — ignoré en production)
export async function DELETE(request: NextRequest) {
  if (!isLocalhost(request)) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 403 })
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  })

  return response
}
