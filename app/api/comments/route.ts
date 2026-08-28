/**
 * /api/comments
 *
 * GET  ?slug=xxx          → liste les commentaires approuvés d'un article
 * POST { slug, author, body, parent_id?, _hp? }
 *                         → crée un commentaire (avec protections anti-spam)
 */

import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import {
  getCommentsBySlug,
  getCommentCount,
  createComment,
  isRateLimited,
} from '@/lib/db'

// ── GET ─────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug')
  if (!slug) {
    return NextResponse.json({ error: 'slug requis' }, { status: 400 })
  }

  const comments = getCommentsBySlug(slug)
  const count    = getCommentCount(slug)

  return NextResponse.json({ comments, count }, {
    headers: {
      // Pas de cache pour toujours voir les derniers commentaires
      'Cache-Control': 'no-store',
    },
  })
}

// ── POST ────────────────────────────────────────────────────────────────────

const AUTHOR_MIN = 2
const AUTHOR_MAX = 60
const BODY_MIN   = 3
const BODY_MAX   = 2000

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Corps invalide' }, { status: 400 })
  }

  const { slug, author, body: text, parent_id, _hp } = body as {
    slug: string
    author: string
    body: string
    parent_id?: number | null
    _hp?: string
  }

  // ── 1. Honeypot : si rempli, c'est un bot ──────────────────────────────
  if (_hp && String(_hp).trim().length > 0) {
    // On répond 201 pour ne pas alerter le bot
    return NextResponse.json({ id: 0 }, { status: 201 })
  }

  // ── 2. Validation basique ───────────────────────────────────────────────
  if (!slug || typeof slug !== 'string') {
    return NextResponse.json({ error: 'Article manquant' }, { status: 400 })
  }
  if (!author || typeof author !== 'string' ||
      author.trim().length < AUTHOR_MIN || author.trim().length > AUTHOR_MAX) {
    return NextResponse.json(
      { error: `Le prénom doit faire entre ${AUTHOR_MIN} et ${AUTHOR_MAX} caractères` },
      { status: 400 }
    )
  }
  if (!text || typeof text !== 'string' ||
      text.trim().length < BODY_MIN || text.trim().length > BODY_MAX) {
    return NextResponse.json(
      { error: `Le commentaire doit faire entre ${BODY_MIN} et ${BODY_MAX} caractères` },
      { status: 400 }
    )
  }

  // ── 3. Rate-limit par IP (hash anonymisé) ──────────────────────────────
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
           ?? req.headers.get('x-real-ip')
           ?? '0.0.0.0'
  const ipHash = crypto.createHash('sha256').update(ip + 'dancelab-salt').digest('hex')

  if (isRateLimited(ipHash)) {
    return NextResponse.json(
      { error: 'Trop de commentaires, réessaie dans une heure.' },
      { status: 429 }
    )
  }

  // ── 4. Insertion ────────────────────────────────────────────────────────
  const id = createComment({
    article_slug: String(slug),
    parent_id: typeof parent_id === 'number' ? parent_id : null,
    author: String(author),
    body: String(text),
    ip_hash: ipHash,
  })

  return NextResponse.json({ id }, { status: 201 })
}
