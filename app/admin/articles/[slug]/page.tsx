"use client"

/**
 * app/admin/articles/[slug]/page.tsx
 * Prévisualisation et édition d'un article généré.
 *
 * Permet de relire l'article complet avant validation,
 * de modifier le titre/chapô/slug si nécessaire,
 * et de gérer son statut éditorial.
 */

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'

type ArticleFull = {
  episodeNumber: number
  episodeSlug: string
  status: string
  generatedAt: string
  scheduledFor?: string
  publishedAt?: string
  editorNotes?: string
  article: {
    slug: string
    title: string
    chapo: string
    category: string
    tags: string[]
    image: string
    guest: string
    episodeNumber: string
    episodeSlug: string
    quote?: string
    readTime: string
    publishedDate: string
    sections: { heading: string; paragraphs: string[] }[]
    conclusion: string | string[]
  }
}

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

function formatDate(iso?: string) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function ArticlePreviewPage() {
  const router = useRouter()
  const { slug } = useParams<{ slug: string }>()

  const [data, setData] = useState<ArticleFull | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Champs éditables
  const [editTitle, setEditTitle] = useState('')
  const [editChapo, setEditChapo] = useState('')
  const [editSlug, setEditSlug] = useState('')
  const [editNotes, setEditNotes] = useState('')
  const [scheduledFor, setScheduledFor] = useState('')
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const res = await fetch(`/api/admin/articles/${slug}`)
        if (res.status === 401) {
          router.push(`/acces-prive?redirect=/admin/articles/${slug}`)
          return
        }
        if (!res.ok) {
          setError('Article introuvable.')
          return
        }
        const json = await res.json() as ArticleFull
        setData(json)
        setEditTitle(json.article.title)
        setEditChapo(json.article.chapo)
        setEditSlug(json.article.slug)
        setEditNotes(json.editorNotes ?? '')
        if (json.scheduledFor) {
          // Convertit ISO UTC en format datetime-local (heure locale)
          const d = new Date(json.scheduledFor)
          const pad = (n: number) => String(n).padStart(2, '0')
          setScheduledFor(
            `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
          )
        }
      } catch {
        setError('Erreur de chargement.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [slug, router])

  const saveChanges = async () => {
    if (!data) return
    setSaving(true)
    setError('')
    try {
      const body: Record<string, unknown> = {
        editorNotes: editNotes,
        article: {
          title: editTitle,
          chapo: editChapo,
          slug: editSlug,
        },
      }
      if (scheduledFor) {
        body.scheduledFor = new Date(scheduledFor).toISOString()
      }

      const res = await fetch(`/api/admin/articles/${data.article.slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const err = await res.json() as { error?: string }
        setError(err.error ?? 'Erreur de sauvegarde')
        return
      }

      setSuccess('Modifications sauvegardées')
      setEditing(false)

      // Recharge si le slug a changé
      if (editSlug !== data.article.slug) {
        router.push(`/admin/articles/${editSlug}`)
        return
      }

      const updated = await res.json() as { article: ArticleFull }
      if (updated.article) setData(updated.article)
    } catch {
      setError('Erreur réseau.')
    } finally {
      setSaving(false)
    }
  }

  const updateStatus = async (newStatus: string) => {
    if (!data) return
    setSaving(true)
    setError('')
    try {
      const body: Record<string, unknown> = { status: newStatus }
      if (scheduledFor && newStatus === 'programme') {
        body.scheduledFor = new Date(scheduledFor).toISOString()
      }
      const res = await fetch(`/api/admin/articles/${data.article.slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const err = await res.json() as { error?: string }
        setError(err.error ?? 'Erreur')
        return
      }

      setSuccess(`Statut mis à jour : ${STATUS_LABELS[newStatus] ?? newStatus}`)
      setData(prev => prev ? { ...prev, status: newStatus } : prev)
    } catch {
      setError('Erreur réseau.')
    } finally {
      setSaving(false)
    }
  }

  const deleteArticle = async () => {
    if (!data || !confirm(`Supprimer l'article pour l'épisode #${data.episodeNumber} ? Cette action est irréversible.`)) return
    const res = await fetch(`/api/admin/articles/${data.article.slug}`, { method: 'DELETE' })
    if (res.ok) {
      router.push('/admin/articles')
    } else {
      setError('Impossible de supprimer.')
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f4f6f8', fontFamily: 'system-ui, sans-serif', color: '#8a9ba8', fontSize: 15 }}>
        Chargement de l&apos;article…
      </div>
    )
  }

  if (!data) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f4f6f8', fontFamily: 'system-ui, sans-serif', gap: 16 }}>
        <p style={{ color: '#b91c1c', fontSize: 15 }}>{error || 'Article introuvable.'}</p>
        <Link href="/admin/articles" style={{ color: '#2563eb', fontSize: 13 }}>← Retour aux articles</Link>
      </div>
    )
  }

  const article = data.article
  const nextStatuses: Record<string, string[]> = {
    brouillon: ['a_valider'],
    a_valider: ['valide', 'brouillon'],
    valide: ['programme'],
    programme: ['publie', 'valide'],
    publie: [],
  }
  const available = nextStatuses[data.status] ?? []

  return (
    <div style={{ minHeight: '100vh', background: '#f4f6f8', fontFamily: 'var(--font-body, system-ui, sans-serif)' }}>

      {/* Header */}
      <header style={{
        background: '#101719', color: '#e8edf0',
        padding: '0 clamp(20px, 4vw, 60px)',
        display: 'flex', alignItems: 'center', gap: 16,
        height: 64, position: 'sticky', top: 0, zIndex: 100,
        borderBottom: '1px solid rgba(255,255,255,.08)',
        flexWrap: 'wrap',
      }}>
        <Link href="/admin/articles" style={{ color: '#c3d2dc', textDecoration: 'none', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' }}>
          ← Articles
        </Link>
        <span style={{ color: 'rgba(255,255,255,.2)' }}>|</span>
        <span style={{ fontSize: 12, color: '#8a9ba8' }}>Ép. #{data.episodeNumber}</span>
        <span style={{
          padding: '3px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700,
          background: `${STATUS_COLORS[data.status] ?? '#8a9ba8'}25`,
          color: STATUS_COLORS[data.status] ?? '#8a9ba8',
          border: `1px solid ${STATUS_COLORS[data.status] ?? '#8a9ba8'}40`,
        }}>
          {STATUS_LABELS[data.status] ?? data.status}
        </span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid rgba(195,210,220,.3)', background: 'rgba(195,210,220,.08)', color: '#c3d2dc', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
            >
              ✏️ Modifier
            </button>
          )}
          {editing && (
            <>
              <button
                onClick={saveChanges}
                disabled={saving}
                style={{ padding: '7px 14px', borderRadius: 8, border: 'none', background: '#16a34a', color: '#fff', fontSize: 12, fontWeight: 600, cursor: saving ? 'wait' : 'pointer' }}
              >
                {saving ? 'Sauvegarde…' : '💾 Sauvegarder'}
              </button>
              <button
                onClick={() => { setEditing(false); setEditTitle(article.title); setEditChapo(article.chapo); setEditSlug(article.slug) }}
                style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid rgba(195,210,220,.3)', background: 'transparent', color: '#c3d2dc', fontSize: 12, cursor: 'pointer' }}
              >
                Annuler
              </button>
            </>
          )}
          <button
            onClick={deleteArticle}
            style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid rgba(255,100,100,.3)', background: 'rgba(255,100,100,.08)', color: '#fca5a5', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
          >
            🗑 Supprimer
          </button>
        </div>
      </header>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: 'clamp(24px, 4vw, 48px) clamp(20px, 4vw, 48px)' }}>

        {/* Messages */}
        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10, padding: '12px 16px', marginBottom: 20, color: '#b91c1c', fontSize: 13 }}>
            ⚠️ {error}
          </div>
        )}
        {success && (
          <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 10, padding: '12px 16px', marginBottom: 20, color: '#16a34a', fontSize: 13, display: 'flex', justifyContent: 'space-between' }}>
            <span>✅ {success}</span>
            <button onClick={() => setSuccess('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#16a34a' }}>×</button>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 28, alignItems: 'start' }}>

          {/* Article preview */}
          <div style={{ background: '#fff', borderRadius: 16, padding: '32px 36px', border: '1px solid #dde3e8' }}>

            {/* Image hero */}
            {article.image && (
              <div style={{ margin: '-32px -36px 28px', borderRadius: '16px 16px 0 0', overflow: 'hidden', height: 240 }}>
                <img src={article.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}

            {/* Catégorie */}
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase', color: '#2563eb', marginBottom: 12 }}>
              {article.category}
            </div>

            {/* Titre */}
            {editing ? (
              <input
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                style={{ width: '100%', fontSize: 22, fontWeight: 700, padding: '8px 12px', borderRadius: 8, border: '2px solid #2563eb', marginBottom: 16, boxSizing: 'border-box', lineHeight: 1.3 }}
              />
            ) : (
              <h1 style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.3, color: '#101719', marginBottom: 16 }}>
                {article.title}
              </h1>
            )}

            {/* Chapô */}
            {editing ? (
              <textarea
                value={editChapo}
                onChange={e => setEditChapo(e.target.value)}
                rows={3}
                style={{ width: '100%', fontSize: 15, padding: '8px 12px', borderRadius: 8, border: '2px solid #2563eb', marginBottom: 20, boxSizing: 'border-box', resize: 'vertical', lineHeight: 1.6 }}
              />
            ) : (
              <p style={{ fontSize: 16, lineHeight: 1.6, color: '#3b5462', marginBottom: 20, fontStyle: 'italic' }}>
                {article.chapo}
              </p>
            )}

            <div style={{ borderBottom: '1px solid #dde3e8', marginBottom: 24 }} />

            {/* Citation */}
            {article.quote && (
              <blockquote style={{ borderLeft: '3px solid #101719', paddingLeft: 20, margin: '0 0 24px', color: '#3b5462', fontSize: 15, fontStyle: 'italic', lineHeight: 1.65 }}>
                «&nbsp;{article.quote}&nbsp;»
              </blockquote>
            )}

            {/* Sections */}
            {article.sections.map((section, i) => (
              <div key={i} style={{ marginBottom: 28 }}>
                {section.heading && (
                  <h2 style={{ fontSize: 17, fontWeight: 700, color: '#101719', marginBottom: 14 }}>
                    {section.heading}
                  </h2>
                )}
                {section.paragraphs.map((p, j) => (
                  <p key={j} style={{ fontSize: 14, lineHeight: 1.75, color: '#3b5462', marginBottom: 14 }}
                    dangerouslySetInnerHTML={{ __html: p }}
                  />
                ))}
              </div>
            ))}

            {/* Conclusion */}
            <div style={{ borderTop: '1px solid #dde3e8', paddingTop: 24, marginTop: 8 }}>
              {(Array.isArray(article.conclusion) ? article.conclusion : [article.conclusion]).map((p, i) => (
                <p key={i} style={{ fontSize: 14, lineHeight: 1.75, color: '#3b5462', marginBottom: 14 }}>{p}</p>
              ))}
            </div>

            {/* Tags */}
            <div style={{ marginTop: 24, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {article.tags.map(tag => (
                <span key={tag} style={{ padding: '4px 12px', borderRadius: 20, background: '#f4f6f8', border: '1px solid #dde3e8', fontSize: 11, color: '#6b7c87', fontWeight: 600 }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Métadonnées */}
            <div style={{ background: '#fff', borderRadius: 14, padding: '20px', border: '1px solid #dde3e8' }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#8a9ba8', marginBottom: 16 }}>
                Métadonnées
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <MetaRow label="Slug" value={editing ? undefined : `/${article.slug}`}>
                  {editing && (
                    <input
                      value={editSlug}
                      onChange={e => setEditSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))}
                      style={{ width: '100%', fontSize: 12, padding: '5px 8px', borderRadius: 6, border: '1px solid #dde3e8' }}
                    />
                  )}
                </MetaRow>
                <MetaRow label="Invité(e)" value={article.guest} />
                <MetaRow label="Épisode" value={article.episodeNumber} />
                <MetaRow label="Temps de lecture" value={article.readTime} />
                <MetaRow label="Généré le" value={formatDate(data.generatedAt)} />
              </div>
            </div>

            {/* Programmation */}
            <div style={{ background: '#fff', borderRadius: 14, padding: '20px', border: '1px solid #dde3e8' }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#8a9ba8', marginBottom: 16 }}>
                Publication
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#6b7c87', display: 'block', marginBottom: 6 }}>
                  Date programmée
                </label>
                <input
                  type="datetime-local"
                  value={scheduledFor}
                  onChange={e => setScheduledFor(e.target.value)}
                  style={{ width: '100%', fontSize: 12, padding: '7px 10px', borderRadius: 8, border: '1px solid #dde3e8', boxSizing: 'border-box' }}
                />
                <p style={{ fontSize: 10, color: '#8a9ba8', marginTop: 5 }}>
                  Heure locale — sera convertie en UTC
                </p>
              </div>

              {/* Transitions de statut */}
              {available.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {available.map(s => (
                    <button
                      key={s}
                      onClick={() => updateStatus(s)}
                      disabled={saving}
                      style={{
                        width: '100%', padding: '10px 16px', borderRadius: 10, border: 'none',
                        background: STATUS_COLORS[s] ?? '#101719',
                        color: '#fff', cursor: saving ? 'wait' : 'pointer',
                        fontSize: 12, fontWeight: 700, letterSpacing: '.04em',
                        textTransform: 'uppercase',
                      }}
                    >
                      Passer à : {STATUS_LABELS[s] ?? s}
                    </button>
                  ))}
                </div>
              )}

              {data.status === 'publie' && (
                <div style={{ padding: '10px 16px', borderRadius: 10, background: '#f0fdf4', border: '1px solid #86efac', fontSize: 12, color: '#16a34a', fontWeight: 600, textAlign: 'center' }}>
                  ✅ Article publié
                  {data.publishedAt && <div style={{ fontWeight: 400, marginTop: 4 }}>{formatDate(data.publishedAt)}</div>}
                </div>
              )}
            </div>

            {/* Notes éditoriales */}
            <div style={{ background: '#fff', borderRadius: 14, padding: '20px', border: '1px solid #dde3e8' }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#8a9ba8', marginBottom: 12 }}>
                Notes éditoriales
              </div>
              <textarea
                value={editNotes}
                onChange={e => setEditNotes(e.target.value)}
                placeholder="Corrections à faire, retours, remarques…"
                rows={4}
                style={{ width: '100%', fontSize: 12, padding: '8px 10px', borderRadius: 8, border: '1px solid #dde3e8', resize: 'vertical', lineHeight: 1.6, boxSizing: 'border-box', color: '#3b5462' }}
              />
              <button
                onClick={saveChanges}
                disabled={saving}
                style={{ width: '100%', marginTop: 8, padding: '8px', borderRadius: 8, border: 'none', background: '#101719', color: '#fff', fontSize: 12, fontWeight: 600, cursor: saving ? 'wait' : 'pointer' }}
              >
                {saving ? 'Sauvegarde…' : 'Enregistrer les notes'}
              </button>
            </div>

            {/* Épisode source */}
            <div style={{ background: '#fff', borderRadius: 14, padding: '20px', border: '1px solid #dde3e8' }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#8a9ba8', marginBottom: 12 }}>
                Épisode source
              </div>
              <Link
                href={`/episodes/${article.episodeSlug}`}
                target="_blank"
                style={{ display: 'block', padding: '10px 14px', borderRadius: 10, background: '#f4f6f8', border: '1px solid #dde3e8', textDecoration: 'none', color: '#101719', fontSize: 12, fontWeight: 600 }}
              >
                🎙 Écouter l&apos;épisode {article.episodeNumber} →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function MetaRow({ label, value, children }: { label: string; value?: string; children?: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 600, color: '#8a9ba8', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 3 }}>{label}</div>
      {children ?? (
        <div style={{ fontSize: 12, color: '#3b5462', wordBreak: 'break-all' }}>{value ?? '—'}</div>
      )}
    </div>
  )
}
