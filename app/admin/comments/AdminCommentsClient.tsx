'use client'

import { useState } from 'react'

type Comment = {
  id: number
  article_slug: string
  parent_id: number | null
  author: string
  body: string
  created_at: string
  status: 'approved' | 'hidden' | 'deleted'
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  } catch { return iso }
}

export default function AdminCommentsClient({
  initialComments,
  total,
}: {
  initialComments: Comment[]
  total: number
}) {
  const [comments, setComments] = useState(initialComments)
  const [filter, setFilter] = useState<'all' | 'approved' | 'hidden'>('all')
  const [search, setSearch] = useState('')
  const [pending, setPending] = useState<number | null>(null)

  // ── Filtres locaux ────────────────────────────────────────────────────────
  const displayed = comments.filter((c) => {
    if (filter !== 'all' && c.status !== filter) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        c.author.toLowerCase().includes(q) ||
        c.body.toLowerCase().includes(q) ||
        c.article_slug.toLowerCase().includes(q)
      )
    }
    return true
  })

  // ── Actions ───────────────────────────────────────────────────────────────
  async function updateStatus(id: number, status: 'approved' | 'hidden') {
    setPending(id)
    try {
      const res = await fetch(`/api/comments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        setComments((prev) => prev.map((c) => c.id === id ? { ...c, status } : c))
      }
    } finally {
      setPending(null)
    }
  }

  async function deleteComment(id: number) {
    if (!confirm('Supprimer définitivement ce commentaire ?')) return
    setPending(id)
    try {
      const res = await fetch(`/api/comments/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setComments((prev) => prev.filter((c) => c.id !== id))
      }
    } finally {
      setPending(null)
    }
  }

  const approved = comments.filter((c) => c.status === 'approved').length
  const hidden    = comments.filter((c) => c.status === 'hidden').length

  return (
    <div className="adm-wrap">
      {/* En-tête */}
      <div className="adm-header">
        <div>
          <h1 className="adm-title">Modération des commentaires</h1>
          <p className="adm-subtitle">
            {total} commentaire{total !== 1 ? 's' : ''} au total ·{' '}
            <span className="adm-pill adm-pill--green">{approved} publiés</span>{' '}
            <span className="adm-pill adm-pill--gray">{hidden} masqués</span>
          </p>
        </div>
        <a href="/" className="adm-back">← Retour au site</a>
      </div>

      {/* Filtres */}
      <div className="adm-filters">
        <div className="adm-tabs">
          {(['all', 'approved', 'hidden'] as const).map((f) => (
            <button
              key={f}
              className={`adm-tab ${filter === f ? 'adm-tab--active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'Tous' : f === 'approved' ? 'Publiés' : 'Masqués'}
            </button>
          ))}
        </div>
        <input
          className="adm-search"
          type="search"
          placeholder="Rechercher…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      {displayed.length === 0 ? (
        <p className="adm-empty">Aucun commentaire trouvé.</p>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Auteur</th>
                <th>Commentaire</th>
                <th>Article</th>
                <th>Date</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayed.map((c) => (
                <tr key={c.id} className={c.status === 'hidden' ? 'adm-row--hidden' : ''}>
                  <td>
                    <strong>{c.author}</strong>
                    {c.parent_id ? <span className="adm-reply-badge">↩ réponse</span> : null}
                  </td>
                  <td className="adm-body-cell">
                    <span title={c.body}>{c.body.length > 120 ? c.body.slice(0, 120) + '…' : c.body}</span>
                  </td>
                  <td>
                    <a
                      href={`/decouvrir/articles/${c.article_slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="adm-slug-link"
                    >
                      {c.article_slug}
                    </a>
                  </td>
                  <td className="adm-date">{formatDate(c.created_at)}</td>
                  <td>
                    <span className={`adm-status adm-status--${c.status}`}>
                      {c.status === 'approved' ? 'Publié' : 'Masqué'}
                    </span>
                  </td>
                  <td>
                    <div className="adm-actions">
                      {c.status === 'hidden' ? (
                        <button
                          className="adm-btn adm-btn--approve"
                          onClick={() => updateStatus(c.id, 'approved')}
                          disabled={pending === c.id}
                          title="Publier"
                        >
                          ✓ Publier
                        </button>
                      ) : (
                        <button
                          className="adm-btn adm-btn--hide"
                          onClick={() => updateStatus(c.id, 'hidden')}
                          disabled={pending === c.id}
                          title="Masquer"
                        >
                          ✕ Masquer
                        </button>
                      )}
                      <button
                        className="adm-btn adm-btn--delete"
                        onClick={() => deleteComment(c.id)}
                        disabled={pending === c.id}
                        title="Supprimer définitivement"
                      >
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style>{`
        *, *::before, *::after { box-sizing: border-box; }

        body { margin: 0; font-family: var(--font-body, system-ui, sans-serif); background: #f5f7f8; color: #233033; }

        .adm-wrap {
          max-width: 1280px;
          margin: 0 auto;
          padding: clamp(24px, 5vw, 64px) clamp(16px, 4vw, 48px);
        }

        .adm-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 36px;
          flex-wrap: wrap;
        }

        .adm-title {
          font-size: clamp(1.4rem, 3vw, 2rem);
          font-weight: 700;
          color: #425659;
          margin: 0 0 8px;
        }

        .adm-subtitle {
          font-size: 0.9rem;
          color: #7F9195;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .adm-pill {
          display: inline-block;
          padding: 2px 10px;
          border-radius: 20px;
          font-size: 0.78rem;
          font-weight: 700;
        }
        .adm-pill--green { background: #d1fae5; color: #065f46; }
        .adm-pill--gray  { background: #e5e7eb; color: #374151; }

        .adm-back {
          font-size: 0.86rem;
          font-weight: 600;
          color: #5B7377;
          text-decoration: none;
          padding: 8px 16px;
          border: 1.5px solid rgba(91,115,119,0.3);
          border-radius: 8px;
          transition: background 0.18s;
          white-space: nowrap;
        }
        .adm-back:hover { background: rgba(91,115,119,0.08); }

        .adm-filters {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }

        .adm-tabs {
          display: flex;
          background: #fff;
          border: 1px solid rgba(35,48,51,0.12);
          border-radius: 8px;
          overflow: hidden;
        }

        .adm-tab {
          padding: 8px 18px;
          border: none;
          background: transparent;
          font-size: 0.86rem;
          font-weight: 600;
          color: #7F9195;
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
        }
        .adm-tab:hover { background: #f0f4f5; }
        .adm-tab--active { background: #5B7377 !important; color: #fff !important; }

        .adm-search {
          flex: 1;
          min-width: 180px;
          max-width: 320px;
          padding: 8px 14px;
          border: 1.5px solid rgba(35,48,51,0.16);
          border-radius: 8px;
          font-size: 0.9rem;
          outline: none;
          background: #fff;
        }
        .adm-search:focus { border-color: #5B7377; }

        .adm-empty {
          text-align: center;
          padding: 56px 24px;
          color: #7F9195;
          font-style: italic;
        }

        .adm-table-wrap {
          overflow-x: auto;
          border-radius: 12px;
          border: 1px solid rgba(35,48,51,0.10);
          background: #fff;
          box-shadow: 0 2px 12px rgba(35,48,51,0.06);
        }

        .adm-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.88rem;
        }

        .adm-table th {
          padding: 14px 16px;
          background: rgba(193,208,223,0.15);
          border-bottom: 1px solid rgba(35,48,51,0.10);
          text-align: left;
          font-size: 0.74rem;
          font-weight: 800;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #7F9195;
          white-space: nowrap;
        }

        .adm-table td {
          padding: 14px 16px;
          border-bottom: 1px solid rgba(35,48,51,0.06);
          vertical-align: top;
          line-height: 1.5;
        }

        .adm-table tr:last-child td { border-bottom: none; }
        .adm-table tr:hover td { background: rgba(193,208,223,0.07); }

        .adm-row--hidden td { opacity: 0.55; }

        .adm-body-cell { max-width: 340px; color: rgba(35,48,51,0.75); }

        .adm-reply-badge {
          display: inline-block;
          margin-left: 6px;
          font-size: 0.7rem;
          font-weight: 700;
          color: #5B7377;
          background: rgba(193,208,223,0.25);
          padding: 1px 6px;
          border-radius: 4px;
        }

        .adm-slug-link {
          color: #5B7377;
          text-decoration: none;
          font-size: 0.82rem;
          word-break: break-all;
        }
        .adm-slug-link:hover { text-decoration: underline; }

        .adm-date { color: #7F9195; white-space: nowrap; font-size: 0.82rem; }

        .adm-status {
          display: inline-block;
          padding: 3px 10px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 700;
        }
        .adm-status--approved { background: #d1fae5; color: #065f46; }
        .adm-status--hidden   { background: #e5e7eb; color: #374151; }

        .adm-actions { display: flex; gap: 8px; flex-wrap: wrap; }

        .adm-btn {
          padding: 5px 12px;
          border: none;
          border-radius: 6px;
          font-size: 0.78rem;
          font-weight: 700;
          cursor: pointer;
          transition: opacity 0.15s, transform 0.1s;
          white-space: nowrap;
        }
        .adm-btn:disabled { opacity: 0.45; cursor: not-allowed; }
        .adm-btn:not(:disabled):hover { transform: translateY(-1px); }

        .adm-btn--approve { background: #d1fae5; color: #065f46; }
        .adm-btn--approve:hover:not(:disabled) { background: #a7f3d0; }

        .adm-btn--hide { background: #e5e7eb; color: #374151; }
        .adm-btn--hide:hover:not(:disabled) { background: #d1d5db; }

        .adm-btn--delete { background: #fee2e2; color: #b91c1c; }
        .adm-btn--delete:hover:not(:disabled) { background: #fecaca; }

        @media (max-width: 640px) {
          .adm-table th:nth-child(3),
          .adm-table td:nth-child(3),
          .adm-table th:nth-child(4),
          .adm-table td:nth-child(4) { display: none; }
        }
      `}</style>
    </div>
  )
}
