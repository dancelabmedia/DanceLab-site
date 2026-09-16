"use client"

/**
 * app/admin/articles/page.tsx
 * Interface d'administration — Gestion des articles podcast générés.
 *
 * Accès : réservé aux utilisateurs authentifiés (cookie preview_access).
 * Route : /admin/articles
 *
 * Fonctionnalités :
 *   - Vue d'ensemble de tous les articles générés avec leurs statuts
 *   - Détection des épisodes sans articles (via Ausha RSS)
 *   - Génération d'un article en un clic
 *   - Gestion des statuts : Brouillon → À valider → Validé → Programmé → Publié
 *   - Lien vers la prévisualisation de chaque article
 */

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// ─── Types ────────────────────────────────────────────────────────────────────

type ArticleSummary = {
  episodeNumber: number
  episodeSlug: string
  status: string
  generatedAt: string
  scheduledFor?: string
  publishedAt?: string
  slug: string
  title: string
  guest: string
  chapo: string
  category: string
  tags: string[]
  image: string
}

type MissingEpisode = {
  number: number
  title: string
  guest: string
  pubDate: string
  aushaSlug: string
  image: string
}

// ─── Constantes ───────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<string, string> = {
  brouillon: 'Brouillon',
  a_valider: 'À valider',
  valide: 'Validé',
  programme: 'Programmé',
  publie: 'Publié',
}

const STATUS_COLORS: Record<string, string> = {
  brouillon: '#8a9ba8',
  a_valider: '#d97706',
  valide: '#2563eb',
  programme: '#7c3aed',
  publie: '#16a34a',
}

const STATUS_ORDER = ['brouillon', 'a_valider', 'valide', 'programme', 'publie']

function formatDate(iso?: string): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'short', year: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}

// ─── Composants ───────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '3px 10px',
      borderRadius: 20,
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: '.06em',
      textTransform: 'uppercase',
      background: `${STATUS_COLORS[status] ?? '#8a9ba8'}18`,
      color: STATUS_COLORS[status] ?? '#8a9ba8',
      border: `1px solid ${STATUS_COLORS[status] ?? '#8a9ba8'}30`,
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: '50%',
        background: STATUS_COLORS[status] ?? '#8a9ba8',
        flexShrink: 0,
      }} />
      {STATUS_LABELS[status] ?? status}
    </span>
  )
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function AdminArticlesPage() {
  const router = useRouter()
  const [articles, setArticles] = useState<ArticleSummary[]>([])
  const [missingEpisodes, setMissingEpisodes] = useState<MissingEpisode[]>([])
  const [loading, setLoading] = useState(true)
  const [checkingMissing, setCheckingMissing] = useState(false)
  const [generatingFor, setGeneratingFor] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<'articles' | 'episodes'>('articles')
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Charge les articles
  const loadArticles = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/articles')
      if (res.status === 401) {
        router.push('/acces-prive?redirect=/admin/articles')
        return
      }
      const data = await res.json() as { articles: ArticleSummary[] }
      setArticles(data.articles ?? [])
    } catch {
      setError('Impossible de charger les articles.')
    } finally {
      setLoading(false)
    }
  }, [router])

  // Vérifie les épisodes sans articles
  const checkMissingEpisodes = async () => {
    setCheckingMissing(true)
    setError('')
    try {
      const res = await fetch('/api/admin/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'check-new-episodes' }),
      })
      const data = await res.json() as { missing: MissingEpisode[]; missingCount: number }
      setMissingEpisodes(data.missing ?? [])
      setActiveTab('episodes')
    } catch {
      setError('Impossible de vérifier les épisodes Ausha.')
    } finally {
      setCheckingMissing(false)
    }
  }

  // Génère un article pour un épisode
  const generateArticle = async (episodeNumber: number) => {
    setGeneratingFor(episodeNumber)
    setError('')
    setSuccessMsg('')
    try {
      const res = await fetch('/api/admin/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ episodeNumber }),
      })
      const data = await res.json() as { success?: boolean; error?: string; slug?: string }

      if (!res.ok) {
        setError(data.error ?? 'Erreur de génération')
        return
      }

      setSuccessMsg(`Article #${episodeNumber} généré avec succès — slug : ${data.slug}`)
      setMissingEpisodes(prev => prev.filter(ep => ep.number !== episodeNumber))
      await loadArticles()
      setActiveTab('articles')
    } catch {
      setError('Erreur réseau lors de la génération.')
    } finally {
      setGeneratingFor(null)
    }
  }

  // Met à jour le statut d'un article
  const updateStatus = async (slug: string, status: string, scheduledFor?: string) => {
    setError('')
    try {
      const body: Record<string, string> = { status }
      if (scheduledFor) body.scheduledFor = scheduledFor

      const res = await fetch(`/api/admin/articles/${slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json() as { error?: string }
        setError(data.error ?? 'Erreur de mise à jour')
        return
      }

      await loadArticles()
      setSuccessMsg('Statut mis à jour')
    } catch {
      setError('Erreur lors de la mise à jour du statut.')
    }
  }

  useEffect(() => {
    loadArticles()
  }, [loadArticles])

  // Filtre les articles
  const filteredArticles = statusFilter === 'all'
    ? articles
    : articles.filter(a => a.status === statusFilter)

  // Résumé par statut
  const statusCounts = articles.reduce<Record<string, number>>((acc, a) => {
    acc[a.status] = (acc[a.status] ?? 0) + 1
    return acc
  }, {})

  return (
    <div style={{ minHeight: '100vh', background: '#f4f6f8', fontFamily: 'var(--font-body, system-ui, sans-serif)' }}>

      {/* En-tête */}
      <header style={{
        background: '#101719', color: '#e8edf0',
        padding: '0 clamp(20px, 4vw, 60px)',
        display: 'flex', alignItems: 'center', gap: 24,
        height: 64, position: 'sticky', top: 0, zIndex: 100,
        borderBottom: '1px solid rgba(255,255,255,.08)',
      }}>
        <Link href="/" style={{ color: '#c3d2dc', textDecoration: 'none', fontSize: 13, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase' }}>
          ← Dance Lab
        </Link>
        <span style={{ color: 'rgba(255,255,255,.2)' }}>|</span>
        <span style={{ fontSize: 13, fontWeight: 500, color: '#e8edf0' }}>Articles Podcast — Administration</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button
            onClick={checkMissingEpisodes}
            disabled={checkingMissing}
            style={{
              padding: '7px 16px', borderRadius: 8, border: '1px solid rgba(195,210,220,.3)',
              background: 'rgba(195,210,220,.08)', color: '#c3d2dc',
              fontSize: 12, fontWeight: 600, cursor: checkingMissing ? 'wait' : 'pointer',
              letterSpacing: '.04em', display: 'flex', alignItems: 'center', gap: 8,
            }}
          >
            {checkingMissing ? '⏳ Vérification…' : '🔍 Épisodes sans articles'}
          </button>
        </div>
      </header>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'clamp(24px, 4vw, 48px) clamp(20px, 4vw, 60px)' }}>

        {/* Messages */}
        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10, padding: '12px 16px', marginBottom: 20, color: '#b91c1c', fontSize: 13, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>⚠️ {error}</span>
            <button onClick={() => setError('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#b91c1c', fontSize: 16 }}>×</button>
          </div>
        )}
        {successMsg && (
          <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 10, padding: '12px 16px', marginBottom: 20, color: '#16a34a', fontSize: 13, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>✅ {successMsg}</span>
            <button onClick={() => setSuccessMsg('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#16a34a', fontSize: 16 }}>×</button>
          </div>
        )}

        {/* Compteurs statuts */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 28 }}>
          {STATUS_ORDER.filter(s => statusCounts[s]).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(statusFilter === s ? 'all' : s)}
              style={{
                padding: '8px 16px', borderRadius: 10,
                background: statusFilter === s ? STATUS_COLORS[s] : '#fff',
                color: statusFilter === s ? '#fff' : STATUS_COLORS[s],
                border: `1.5px solid ${STATUS_COLORS[s]}`,
                cursor: 'pointer', fontSize: 12, fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              <span>{STATUS_LABELS[s]}</span>
              <span style={{
                background: statusFilter === s ? 'rgba(255,255,255,.25)' : `${STATUS_COLORS[s]}18`,
                borderRadius: 20, padding: '1px 7px', fontWeight: 700,
              }}>{statusCounts[s]}</span>
            </button>
          ))}
          {articles.length > 0 && (
            <button
              onClick={() => setStatusFilter('all')}
              style={{
                padding: '8px 16px', borderRadius: 10,
                background: statusFilter === 'all' ? '#101719' : '#fff',
                color: statusFilter === 'all' ? '#fff' : '#101719',
                border: '1.5px solid #101719',
                cursor: 'pointer', fontSize: 12, fontWeight: 600,
              }}
            >
              Tous ({articles.length})
            </button>
          )}
        </div>

        {/* Onglets */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid #dde3e8' }}>
          {(['articles', 'episodes'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '10px 20px', border: 'none', background: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: 600, letterSpacing: '.03em',
                borderBottom: activeTab === tab ? '2px solid #101719' : '2px solid transparent',
                color: activeTab === tab ? '#101719' : '#6b7c87',
                marginBottom: -1,
              }}
            >
              {tab === 'articles'
                ? `Articles générés (${articles.length})`
                : `Épisodes sans article (${missingEpisodes.length})`}
            </button>
          ))}
        </div>

        {/* Tab : Articles */}
        {activeTab === 'articles' && (
          <>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#8a9ba8', fontSize: 14 }}>
                Chargement des articles…
              </div>
            ) : filteredArticles.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#8a9ba8' }}>
                <p style={{ fontSize: 15, margin: '0 0 16px' }}>
                  {statusFilter === 'all' ? 'Aucun article généré pour l\'instant.' : `Aucun article au statut "${STATUS_LABELS[statusFilter] ?? statusFilter}".`}
                </p>
                {statusFilter === 'all' && (
                  <button
                    onClick={checkMissingEpisodes}
                    disabled={checkingMissing}
                    style={{ padding: '10px 20px', borderRadius: 10, background: '#101719', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
                  >
                    Vérifier les épisodes Ausha
                  </button>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {filteredArticles.map(article => (
                  <ArticleCard
                    key={article.slug}
                    article={article}
                    onUpdateStatus={updateStatus}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* Tab : Épisodes sans articles */}
        {activeTab === 'episodes' && (
          <>
            {missingEpisodes.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#8a9ba8' }}>
                <p style={{ fontSize: 15, margin: '0 0 12px' }}>
                  {checkingMissing
                    ? 'Vérification en cours…'
                    : 'Tous les épisodes ont un article, ou la vérification n\'a pas encore été lancée.'}
                </p>
                {!checkingMissing && (
                  <button
                    onClick={checkMissingEpisodes}
                    style={{ padding: '10px 20px', borderRadius: 10, background: '#101719', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
                  >
                    Vérifier maintenant
                  </button>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {missingEpisodes.map(ep => (
                  <div key={ep.number} style={{
                    background: '#fff', borderRadius: 12, padding: '16px 20px',
                    border: '1px solid #dde3e8', display: 'flex', alignItems: 'center', gap: 16,
                  }}>
                    {ep.image && (
                      <img src={ep.image} alt="" style={{ width: 56, height: 56, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, color: '#8a9ba8', marginBottom: 4 }}>
                        Épisode #{ep.number} · {ep.pubDate || 'date inconnue'}
                      </div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: '#101719', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {ep.guest && <span style={{ color: '#2563eb' }}>{ep.guest} — </span>}
                        {ep.title}
                      </div>
                    </div>
                    <button
                      onClick={() => generateArticle(ep.number)}
                      disabled={generatingFor !== null}
                      style={{
                        padding: '8px 18px', borderRadius: 8,
                        background: generatingFor === ep.number ? '#f4f6f8' : '#101719',
                        color: generatingFor === ep.number ? '#6b7c87' : '#fff',
                        border: 'none', cursor: generatingFor !== null ? 'wait' : 'pointer',
                        fontSize: 12, fontWeight: 600, flexShrink: 0, whiteSpace: 'nowrap',
                        display: 'flex', alignItems: 'center', gap: 8,
                      }}
                    >
                      {generatingFor === ep.number ? '⏳ Génération…' : '✨ Générer l\'article'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// ─── Carte article ────────────────────────────────────────────────────────────

function ArticleCard({
  article,
  onUpdateStatus,
}: {
  article: ArticleSummary
  onUpdateStatus: (slug: string, status: string, scheduledFor?: string) => Promise<void>
}) {
  const [updating, setUpdating] = useState(false)
  const [showScheduler, setShowScheduler] = useState(false)
  const [scheduledDate, setScheduledDate] = useState('')

  const handleStatusChange = async (newStatus: string) => {
    setUpdating(true)
    if (newStatus === 'programme' && !scheduledDate) {
      setShowScheduler(true)
      setUpdating(false)
      return
    }
    await onUpdateStatus(article.slug, newStatus, scheduledDate || undefined)
    setUpdating(false)
    setShowScheduler(false)
  }

  const nextStatuses: Record<string, string[]> = {
    brouillon: ['a_valider'],
    a_valider: ['valide', 'brouillon'],
    valide: ['programme'],
    programme: ['publie', 'valide'],
    publie: [],
  }

  const available = nextStatuses[article.status] ?? []

  return (
    <div style={{
      background: '#fff', borderRadius: 14, padding: '18px 22px',
      border: '1px solid #dde3e8', display: 'grid',
      gridTemplateColumns: '56px 1fr auto', gap: 16, alignItems: 'start',
    }}>
      {/* Miniature */}
      <div>
        {article.image ? (
          <img src={article.image} alt="" style={{ width: 56, height: 56, borderRadius: 8, objectFit: 'cover' }} />
        ) : (
          <div style={{ width: 56, height: 56, borderRadius: 8, background: '#f4f6f8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>📄</div>
        )}
      </div>

      {/* Infos */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
          <StatusBadge status={article.status} />
          <span style={{ fontSize: 11, color: '#8a9ba8', fontWeight: 500 }}>
            Ép. #{article.episodeNumber} · {article.category}
          </span>
        </div>
        <div style={{ fontWeight: 700, fontSize: 15, color: '#101719', marginBottom: 6, lineHeight: 1.35 }}>
          {article.title}
        </div>
        <div style={{ fontSize: 13, color: '#6b7c87', lineHeight: 1.5, marginBottom: 10, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {article.chapo}
        </div>
        <div style={{ display: 'flex', gap: 16, fontSize: 11, color: '#8a9ba8' }}>
          <span>Généré : {formatDate(article.generatedAt)}</span>
          {article.scheduledFor && <span>Prévu : {formatDate(article.scheduledFor)}</span>}
          {article.publishedAt && <span>Publié : {formatDate(article.publishedAt)}</span>}
        </div>

        {/* Scheduler */}
        {showScheduler && (
          <div style={{ marginTop: 12, padding: '12px 16px', background: '#f8fafc', borderRadius: 10, border: '1px solid #dde3e8', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#101719' }}>
              Date de publication :
            </label>
            <input
              type="datetime-local"
              value={scheduledDate}
              onChange={e => setScheduledDate(e.target.value)}
              style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #dde3e8', fontSize: 12 }}
            />
            <button
              onClick={() => handleStatusChange('programme')}
              disabled={!scheduledDate || updating}
              style={{ padding: '6px 14px', borderRadius: 8, background: '#7c3aed', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
            >
              Programmer
            </button>
            <button
              onClick={() => setShowScheduler(false)}
              style={{ padding: '6px 14px', borderRadius: 8, background: '#f4f6f8', color: '#6b7c87', border: 'none', cursor: 'pointer', fontSize: 12 }}
            >
              Annuler
            </button>
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end', minWidth: 160 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link
            href={`/admin/articles/${article.slug}`}
            style={{
              padding: '7px 14px', borderRadius: 8, background: '#f4f6f8', color: '#101719',
              border: '1px solid #dde3e8', textDecoration: 'none', fontSize: 12, fontWeight: 600,
              whiteSpace: 'nowrap',
            }}
          >
            👁 Prévisualiser
          </Link>
        </div>

        {/* Boutons de transition de statut */}
        {available.length > 0 && !showScheduler && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {available.map(s => (
              <button
                key={s}
                onClick={() => handleStatusChange(s)}
                disabled={updating}
                style={{
                  padding: '6px 14px', borderRadius: 8, border: 'none',
                  background: STATUS_COLORS[s] ?? '#101719',
                  color: '#fff', cursor: updating ? 'wait' : 'pointer',
                  fontSize: 11, fontWeight: 600, letterSpacing: '.04em',
                  textTransform: 'uppercase', whiteSpace: 'nowrap',
                }}
              >
                → {STATUS_LABELS[s] ?? s}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
