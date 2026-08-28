/**
 * /api/comments/[id]
 *
 * PATCH  { status: 'approved' | 'hidden' }  → modère un commentaire (admin)
 * DELETE                                      → suppression douce (admin)
 *
 * Protégé par le cookie preview_access (même mécanisme que les zones protégées).
 */

import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { updateCommentStatus, softDeleteComment, CommentStatus } from '@/lib/db'

// ── Auth admin ──────────────────────────────────────────────────────────────

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password + 'dancelab-salt')
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

async function isAdmin(req: NextRequest): Promise<boolean> {
  const adminPassword = process.env.ADMIN_PASSWORD ?? process.env.PREVIEW_PASSWORD
  if (!adminPassword) return true  // si pas de mdp configuré, accès libre (dev)

  const expected = await hashPassword(adminPassword)
  const cookie   = req.cookies.get('preview_access')
  return cookie?.value === expected
}

// ── PATCH ────────────────────────────────────────────────────────────────────

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const { id } = await params
  const numId = parseInt(id, 10)
  if (isNaN(numId)) {
    return NextResponse.json({ error: 'ID invalide' }, { status: 400 })
  }

  let body: { status?: CommentStatus }
  try { body = await req.json() } catch { body = {} }

  const { status } = body
  if (!status || !['approved', 'hidden'].includes(status)) {
    return NextResponse.json({ error: 'Statut invalide' }, { status: 400 })
  }

  const ok = updateCommentStatus(numId, status)
  return ok
    ? NextResponse.json({ ok: true })
    : NextResponse.json({ error: 'Commentaire introuvable' }, { status: 404 })
}

// ── DELETE ───────────────────────────────────────────────────────────────────

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const { id } = await params
  const numId = parseInt(id, 10)
  if (isNaN(numId)) {
    return NextResponse.json({ error: 'ID invalide' }, { status: 400 })
  }

  const ok = softDeleteComment(numId)
  return ok
    ? NextResponse.json({ ok: true })
    : NextResponse.json({ error: 'Commentaire introuvable' }, { status: 404 })
}
