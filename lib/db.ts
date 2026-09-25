/**
 * lib/db.ts — Base de données SQLite pour les commentaires Dance Lab
 *
 * Utilise better-sqlite3 (synchrone, zero-config).
 * Le fichier DB est créé automatiquement au premier démarrage.
 *
 * Pour déploiement Vercel / edge : remplacer par Turso (libsql) ou Neon (PG).
 * La variable d'environnement DB_PATH permet de changer l'emplacement du fichier.
 */

import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

export type CommentStatus = 'approved' | 'hidden' | 'deleted'

export type Comment = {
  id: number
  article_slug: string
  parent_id: number | null
  author: string
  body: string
  created_at: string
  status: CommentStatus
  ip_hash: string | null
  replies?: Comment[]
}

// ── Singleton DB ────────────────────────────────────────────────────────────

let _db: Database.Database | null = null

function getDb(): Database.Database {
  if (_db) return _db

  const dbPath =
    process.env.DB_PATH ?? path.join(process.cwd(), 'dancelab.db')

  // Crée le dossier parent si nécessaire
  const dir = path.dirname(dbPath)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

  _db = new Database(dbPath)
  _db.pragma('journal_mode = WAL')  // meilleures perfs en lecture concurrente
  _db.pragma('foreign_keys = ON')

  // ── Schéma ───────────────────────────────────────────────────────────────
  _db.exec(`
    CREATE TABLE IF NOT EXISTS comments (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      article_slug TEXT    NOT NULL,
      parent_id   INTEGER REFERENCES comments(id) ON DELETE CASCADE,
      author      TEXT    NOT NULL,
      body        TEXT    NOT NULL,
      created_at  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
      status      TEXT    NOT NULL DEFAULT 'approved'
                          CHECK(status IN ('approved','hidden','deleted')),
      ip_hash     TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_comments_slug
      ON comments(article_slug, status, created_at);

    CREATE INDEX IF NOT EXISTS idx_comments_parent
      ON comments(parent_id);

    CREATE TABLE IF NOT EXISTS search_stats (
      query            TEXT PRIMARY KEY,  -- clé normalisée (lowercase + trim)
      display_query    TEXT NOT NULL,     -- forme d'affichage (première occurrence)
      count            INTEGER NOT NULL DEFAULT 1,
      last_searched_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
    );
  `)

  // ── Données de démarrage (seed) ──────────────────────────────────────────
  // Insérées une seule fois grâce à INSERT OR IGNORE ; les vraies recherches
  // incrémenteront le compteur et prendront naturellement la place des seeds
  // si elles deviennent plus populaires.
  const seedSearches = [
    'Waacking',
    'Break',
    'Intermittence',
    'Chorégraphes',
    'Danse contemporaine',
  ]
  const seedStmt = _db.prepare(`
    INSERT OR IGNORE INTO search_stats (query, display_query, count)
    VALUES (?, ?, 5)
  `)
  for (const term of seedSearches) {
    seedStmt.run(_normalizeQuery(term), term)
  }

  return _db
}

// ── Requêtes publiques ──────────────────────────────────────────────────────

/** Retourne les commentaires approuvés d'un article, avec leurs réponses imbriquées. */
export function getCommentsBySlug(slug: string): Comment[] {
  const db = getDb()

  const rows = db
    .prepare(
      `SELECT id, article_slug, parent_id, author, body, created_at, status
       FROM comments
       WHERE article_slug = ? AND status = 'approved'
       ORDER BY created_at ASC`
    )
    .all(slug) as Comment[]

  // Imbriquer les réponses dans les commentaires parents
  const byId = new Map<number, Comment>()
  const roots: Comment[] = []

  for (const row of rows) {
    row.replies = []
    byId.set(row.id, row)
  }

  for (const row of rows) {
    if (row.parent_id && byId.has(row.parent_id)) {
      byId.get(row.parent_id)!.replies!.push(row)
    } else {
      roots.push(row)
    }
  }

  return roots
}

/** Retourne le nombre de commentaires approuvés pour un article. */
export function getCommentCount(slug: string): number {
  const db = getDb()
  const row = db
    .prepare(
      `SELECT COUNT(*) as cnt FROM comments
       WHERE article_slug = ? AND status = 'approved'`
    )
    .get(slug) as { cnt: number }
  return row.cnt
}

/** Crée un nouveau commentaire. Retourne l'id inséré. */
export function createComment(params: {
  article_slug: string
  parent_id?: number | null
  author: string
  body: string
  ip_hash?: string | null
}): number {
  const db = getDb()
  const result = db
    .prepare(
      `INSERT INTO comments (article_slug, parent_id, author, body, ip_hash)
       VALUES (?, ?, ?, ?, ?)`
    )
    .run(
      params.article_slug,
      params.parent_id ?? null,
      params.author.trim().slice(0, 60),
      params.body.trim().slice(0, 2000),
      params.ip_hash ?? null
    )
  return result.lastInsertRowid as number
}

/**
 * Anti-spam : vérifie si une IP a déjà posté plus de N commentaires
 * dans la dernière heure.
 */
export function isRateLimited(ip_hash: string, maxPerHour = 8): boolean {
  const db = getDb()
  const row = db
    .prepare(
      `SELECT COUNT(*) as cnt FROM comments
       WHERE ip_hash = ?
         AND created_at > strftime('%Y-%m-%dT%H:%M:%SZ', datetime('now', '-1 hour'))`
    )
    .get(ip_hash) as { cnt: number }
  return row.cnt >= maxPerHour
}

// ── Requêtes admin ──────────────────────────────────────────────────────────

/** Tous les commentaires pour l'interface admin (tous statuts). */
export function getAllCommentsForAdmin(limit = 200, offset = 0): Comment[] {
  const db = getDb()
  return db
    .prepare(
      `SELECT id, article_slug, parent_id, author, body, created_at, status
       FROM comments
       WHERE status != 'deleted'
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`
    )
    .all(limit, offset) as Comment[]
}

/** Compte total pour la pagination admin. */
export function getTotalCommentsAdmin(): number {
  const db = getDb()
  const row = db
    .prepare(`SELECT COUNT(*) as cnt FROM comments WHERE status != 'deleted'`)
    .get() as { cnt: number }
  return row.cnt
}

/** Met à jour le statut d'un commentaire. */
export function updateCommentStatus(id: number, status: CommentStatus): boolean {
  const db = getDb()
  const result = db
    .prepare(`UPDATE comments SET status = ? WHERE id = ?`)
    .run(status, id)
  return result.changes > 0
}

/** Suppression définitive (soft-delete → status = 'deleted'). */
export function softDeleteComment(id: number): boolean {
  return updateCommentStatus(id, 'deleted')
}

// ── Statistiques de recherche ───────────────────────────────────────────────

/**
 * Normalise une requête pour le stockage :
 * - trim des espaces en début/fin
 * - lowercase
 * - collapse des espaces multiples
 */
function _normalizeQuery(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s+/g, ' ')
}

/**
 * Enregistre une recherche effectuée par un visiteur.
 * - La requête est normalisée pour éviter les doublons majuscules/minuscules.
 * - Si la requête existe déjà, incrémente son compteur.
 * - Si c'est une première occurrence, stocke la forme d'affichage telle que saisie.
 */
export function recordSearch(rawQuery: string): void {
  const normalized = _normalizeQuery(rawQuery)
  if (!normalized) return

  // Forme d'affichage : première lettre en majuscule, reste intact
  const display = rawQuery.trim().replace(/^\S/, (c) => c.toUpperCase())

  const db = getDb()
  db.prepare(`
    INSERT INTO search_stats (query, display_query, count)
    VALUES (?, ?, 1)
    ON CONFLICT(query) DO UPDATE SET
      count = count + 1,
      last_searched_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
  `).run(normalized, display)
}

/**
 * Retourne les N recherches les plus populaires, triées par popularité décroissante.
 * Renvoie la forme d'affichage (display_query) pour chaque terme.
 */
export function getPopularSearches(limit = 10): string[] {
  const db = getDb()
  const rows = db.prepare(`
    SELECT display_query
    FROM search_stats
    ORDER BY count DESC, last_searched_at DESC
    LIMIT ?
  `).all(limit) as { display_query: string }[]
  return rows.map((r) => r.display_query)
}
