'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useLocale } from '@/components/LocaleProvider'
import { uiText } from '@/data/i18n/messages'

// ── Types ────────────────────────────────────────────────────────────────────

type Comment = {
  id: number
  author: string
  body: string
  created_at: string
  parent_id: number | null
  replies?: Comment[]
}

type CommentData = {
  comments: Comment[]
  count: number
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string, locale: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleDateString(locale === 'en' ? 'en-GB' : 'fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return iso
  }
}

// ── Composant CommentItem ────────────────────────────────────────────────────

function CommentItem({
  comment,
  slug,
  depth = 0,
  onReplyPosted,
}: {
  comment: Comment
  slug: string
  depth?: number
  onReplyPosted: () => void
}) {
  const locale = useLocale()
  const t = (text: string) => uiText(locale, text)

  const [replying, setReplying] = useState(false)
  const [replyAuthor, setReplyAuthor] = useState('')
  const [replyBody, setReplyBody] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  async function handleReply(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          author: replyAuthor,
          body: replyBody,
          parent_id: comment.id,
          _hp: honeypot,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? t('Une erreur est survenue.'))
      } else {
        setReplyAuthor('')
        setReplyBody('')
        setReplying(false)
        onReplyPosted()
      }
    } catch {
      setError(t("Impossible d'envoyer la réponse."))
    } finally {
      setSubmitting(false)
    }
  }

  const isReply = depth > 0

  return (
    <div className={`cmt-item ${isReply ? 'cmt-item--reply' : ''}`}>
      <div className="cmt-avatar" aria-hidden="true">
        {comment.author.charAt(0).toUpperCase()}
      </div>

      <div className="cmt-bubble">
        <div className="cmt-meta">
          <span className="cmt-author">{comment.author}</span>
          <span className="cmt-date">{formatDate(comment.created_at, locale)}</span>
        </div>
        <p className="cmt-body">{comment.body}</p>

        {depth === 0 && (
          <button
            className="cmt-reply-btn"
            onClick={() => {
              setReplying((v) => !v)
              setTimeout(() => textareaRef.current?.focus(), 50)
            }}
            aria-expanded={replying}
          >
            {replying ? t('Annuler') : t('Répondre')}
          </button>
        )}

        {replying && (
          <form className="cmt-reply-form" onSubmit={handleReply} noValidate>
            {/* Honeypot — caché des humains, visible des bots */}
            <input
              type="text"
              name="_hp"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              tabIndex={-1}
              aria-hidden="true"
              autoComplete="off"
              style={{ display: 'none' }}
            />
            <input
              className="cmt-input"
              type="text"
              placeholder={t('Prénom ou pseudo')}
              value={replyAuthor}
              onChange={(e) => setReplyAuthor(e.target.value)}
              maxLength={60}
              required
              disabled={submitting}
            />
            <textarea
              ref={textareaRef}
              className="cmt-textarea"
              placeholder={locale === 'en' ? `Reply to ${comment.author}…` : `Répondre à ${comment.author}…`}
              value={replyBody}
              onChange={(e) => setReplyBody(e.target.value)}
              rows={3}
              maxLength={2000}
              required
              disabled={submitting}
            />
            {error && <p className="cmt-error">{error}</p>}
            <button
              className="cmt-submit cmt-submit--small"
              type="submit"
              disabled={submitting || !replyAuthor.trim() || !replyBody.trim()}
            >
              {submitting ? t('Envoi…') : t('Publier la réponse')}
            </button>
          </form>
        )}
      </div>

      {/* Réponses imbriquées */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="cmt-replies">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              slug={slug}
              depth={depth + 1}
              onReplyPosted={onReplyPosted}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ── Composant principal CommentsSection ──────────────────────────────────────

export default function CommentsSection({ slug }: { slug: string }) {
  const locale = useLocale()
  const t = (text: string) => uiText(locale, text)

  const [data, setData] = useState<CommentData | null>(null)
  const [loading, setLoading] = useState(true)

  // Formulaire
  const [author, setAuthor] = useState('')
  const [body, setBody] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/comments?slug=${encodeURIComponent(slug)}`, {
        cache: 'no-store',
      })
      if (res.ok) setData(await res.json())
    } catch {
      // silencieux
    } finally {
      setLoading(false)
    }
  }, [slug])

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setSubmitting(true)

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, author, body, _hp: honeypot }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? t('Une erreur est survenue.'))
      } else {
        setAuthor('')
        setBody('')
        setSuccess(true)
        await fetchComments()
        setTimeout(() => setSuccess(false), 4000)
      }
    } catch {
      setError(t('Impossible de publier le commentaire.'))
    } finally {
      setSubmitting(false)
    }
  }

  const count = data?.count ?? 0

  return (
    <section className="cmt-section" aria-label={t('Commentaires')}>
      <div className="container">
      {/* En-tête */}
      <div className="cmt-header">
        <h2 className="cmt-heading">{t('Rejoindre la discussion')}</h2>
        {count > 0 && (
          <span className="cmt-count" aria-live="polite">
            {count} {t(count === 1 ? 'commentaire' : 'commentaires')}
          </span>
        )}
      </div>

      {/* Invitation */}
      <p className="cmt-invite">{t("Et toi, qu'est-ce que tu en penses ?")}</p>

      {/* Formulaire */}
      <form className="cmt-form" onSubmit={handleSubmit} noValidate>
        {/* Honeypot invisible */}
        <input
          type="text"
          name="_hp"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          tabIndex={-1}
          aria-hidden="true"
          autoComplete="off"
          style={{ display: 'none' }}
        />

        <div className="cmt-fields">
          <div className="cmt-field-group">
            <label className="cmt-label" htmlFor="cmt-author">{t('Prénom ou pseudo')}</label>
            <input
              id="cmt-author"
              className="cmt-input"
              type="text"
              placeholder={locale === 'en' ? 'E.g. Marie' : 'Ex : Marie'}
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              maxLength={60}
              required
              disabled={submitting}
            />
          </div>

          <div className="cmt-field-group cmt-field-group--full">
            <label className="cmt-label" htmlFor="cmt-body">{t('Votre commentaire')}</label>
            <textarea
              id="cmt-body"
              className="cmt-textarea"
              placeholder={t('Partage ton avis, une recommandation, une réaction…')}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              maxLength={2000}
              required
              disabled={submitting}
            />
          </div>
        </div>

        {error && (
          <p className="cmt-error" role="alert">{error}</p>
        )}
        {success && (
          <p className="cmt-success" role="status">
            {t('Commentaire publié — merci pour ta participation !')}
          </p>
        )}

        <button
          className="cmt-submit"
          type="submit"
          disabled={submitting || !author.trim() || !body.trim()}
        >
          {submitting ? t('Publication…') : t('Publier')}
        </button>
      </form>

      {/* Liste des commentaires */}
      {loading ? (
        <div className="cmt-loading" aria-busy="true">{t('Chargement…')}</div>
      ) : data && data.comments.length > 0 ? (
        <div className="cmt-list" aria-label={`${count} ${t(count === 1 ? 'commentaire' : 'commentaires')}`}>
          {data.comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              slug={slug}
              depth={0}
              onReplyPosted={fetchComments}
            />
          ))}
        </div>
      ) : (
        <p className="cmt-empty">{t('Sois le premier à laisser un commentaire.')}</p>
      )}
      </div>
    </section>
  )
}
