"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { Locale } from '@/lib/i18n/routing'
import { uiText } from '@/data/i18n/messages'
import { useLocale } from './LocaleProvider'

// ── Logique d'affichage (inchangée) ────────────────────────────────────────────
const STORAGE_KEY         = "dl_newsletter_dismissed"
const SESSION_STARTED_KEY = "dl_newsletter_session_started"
const DELAY_MS            = 10_000
const SUPPRESS_DAYS       = 30

function getRemainingDelay(): number {
  try {
    const now       = Date.now()
    const stored    = sessionStorage.getItem(SESSION_STARTED_KEY)
    const startedAt = stored ? parseInt(stored, 10) : now
    if (!stored || isNaN(startedAt)) {
      sessionStorage.setItem(SESSION_STARTED_KEY, String(now))
      return DELAY_MS
    }
    return Math.max(0, DELAY_MS - (now - startedAt))
  } catch { return DELAY_MS }
}

function wasRecentlyDismissed(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return false
    const ts = parseInt(raw, 10)
    if (isNaN(ts)) return false
    return Date.now() - ts < SUPPRESS_DAYS * 24 * 60 * 60 * 1000
  } catch { return false }
}

function markDismissed() {
  try { localStorage.setItem(STORAGE_KEY, String(Date.now())) } catch {}
}

type Status = "idle" | "loading" | "success" | "invalid" | "error"

export default function NewsletterModal({ locale: _initialLocale = 'fr' }: { locale?: Locale }) {
  const locale = useLocale()
  const t = (text: string) => uiText(locale, text)

  const [visible,   setVisible]   = useState(false)
  const [animating, setAnimating] = useState(false)
  const [status,    setStatus]    = useState<Status>("idle")

  const inputRef     = useRef<HTMLInputElement>(null)
  const submittedRef = useRef(false)
  const timeoutRef   = useRef<ReturnType<typeof setTimeout> | null>(null)
  const frameRef     = useRef<HTMLIFrameElement>(null)

  // Déclenchement après délai (inchangé)
  useEffect(() => {
    if (wasRecentlyDismissed()) return
    const timer = setTimeout(() => setVisible(true), getRemainingDelay())
    return () => clearTimeout(timer)
  }, [])

  // Touche Échap (inchangée)
  useEffect(() => {
    if (!visible) return
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close() }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [visible])

  const close = useCallback(() => {
    setAnimating(true)
    markDismissed()
    setTimeout(() => { setVisible(false); setAnimating(false) }, 320)
  }, [])

  // Soumission formulaire (inchangée)
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const email = inputRef.current?.value.trim() ?? ""
    if (!inputRef.current?.checkValidity() || !email) {
      e.preventDefault()
      setStatus("invalid")
      return
    }
    setStatus("loading")
    submittedRef.current = true
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      if (!submittedRef.current) return
      submittedRef.current = false
      setStatus("error")
    }, 12_000)
  }

  // Callback iframe Substack (inchangée)
  const handleFrameLoad = () => {
    if (!submittedRef.current) return
    submittedRef.current = false
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (inputRef.current) inputRef.current.value = ""
    setStatus("success")
    markDismissed()
    setTimeout(() => close(), 3_000)
  }

  if (!visible) return null
  const isClosing = animating

  // ── Rubriques éditoriales ───────────────────────────────────────────────────
  const rubriques = locale === 'en'
    ? [
        { label: 'Listen',    desc: 'New episodes',           icon: 'headphones' },
        { label: 'Read',      desc: 'Our best articles',      icon: 'article'    },
        { label: 'Discover',  desc: 'Events and performances',icon: 'compass'    },
      ]
    : [
        { label: 'À écouter',  desc: 'Les nouveaux épisodes',         icon: 'headphones' },
        { label: 'À lire',     desc: 'Nos meilleurs articles',        icon: 'article'    },
        { label: 'À découvrir',desc: 'Les événements et sorties',     icon: 'compass'    },
      ]

  const rubriqueLabels = locale === 'en'
    ? ['Podcast', 'Culture', 'Career', 'Events']
    : ['Podcast', 'Culture', 'Carrière', 'Sorties']

  return (
    <>
      {/* ── Overlay ──────────────────────────────────────────────────────── */}
      <div
        className={`nl-overlay${isClosing ? " nl-closing" : ""}`}
        onClick={close}
        aria-hidden="true"
      />

      {/* ── Popup mini-magazine ───────────────────────────────────────────── */}
      <div
        className={`nl-card${isClosing ? " nl-closing" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="nl-title"
      >

        {/* ════ GAUCHE — couverture éditoriale ════ */}
        <div className="nl-left" aria-hidden="true">

          {/* Repères graphiques discrets */}
          <div className="nl-left-deco" aria-hidden="true">
            <span className="nl-deco-line nl-deco-line--h" />
            <span className="nl-deco-dot" />
            <span className="nl-deco-line nl-deco-line--v" />
          </div>

          {/* Masthead */}
          <div className="nl-masthead">
            <span className="nl-masthead-brand">Dance Lab</span>
            <span className="nl-masthead-rule" />
            <span className="nl-masthead-sub">
              {locale === 'en' ? 'The dance media' : 'Le média de la danse'}
            </span>
          </div>

          {/* Espace central */}
          <div className="nl-left-mid" aria-hidden="true">
            <span className="nl-mid-rule" />
          </div>

          {/* Labels rubriques empilés */}
          <div className="nl-cover-labels">
            {rubriqueLabels.map((label) => (
              <span key={label} className="nl-cover-label">{label}</span>
            ))}
          </div>
        </div>

        {/* ════ DROITE — contenu newsletter ════ */}
        <div className="nl-right">

          {/* Bouton fermer */}
          <button type="button" className="nl-close" onClick={close} aria-label={t('Fermer')}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          <div className="nl-right-inner">

            {/* Eyebrow */}
            <span className="nl-eyebrow">
              {locale === 'en' ? 'The Newsletter' : 'La Newsletter'}
            </span>

            {/* Titre éditorial */}
            <div className="nl-title-block">
              <h2 id="nl-title" className="nl-title">
                <span className="nl-title-big">
                  {locale === 'en' ? 'To read' : 'À lire'}
                </span>
                <em className="nl-title-sub">
                  {locale === 'en' ? 'this week' : 'cette semaine'}
                </em>
              </h2>
            </div>

            {/* Rubriques */}
            <div className="nl-rubriques">
              {rubriques.map((r) => (
                <div key={r.label} className="nl-rubrique">
                  <span className="nl-rubrique-icon" aria-hidden="true">
                    {r.icon === 'headphones' && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                        <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
                      </svg>
                    )}
                    {r.icon === 'article' && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="9" y1="13" x2="15" y2="13" />
                        <line x1="9" y1="17" x2="15" y2="17" />
                      </svg>
                    )}
                    {r.icon === 'compass' && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
                      </svg>
                    )}
                  </span>
                  <span className="nl-rubrique-text">
                    <strong className="nl-rubrique-label">{r.label}</strong>
                    <span className="nl-rubrique-desc">{r.desc}</span>
                  </span>
                </div>
              ))}
            </div>

            {/* Séparateur */}
            <div className="nl-sep" />

            {/* Formulaire */}
            {status === "success" ? (
              <div className="nl-success">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>{t('Bienvenue dans la communauté Dance Lab')}</span>
              </div>
            ) : (
              <form
                className="nl-form"
                action="https://dancelablemedia.substack.com/api/v1/free?nojs=true"
                method="post"
                target="nl-frame"
                onSubmit={handleSubmit}
                noValidate
              >
                {/* Champs Substack (inchangés) */}
                <input type="hidden" name="source"                    value="dance-lab-modal" />
                <input type="hidden" name="current_url"               value="https://dancelablemedia.substack.com/" />
                <input type="hidden" name="current_referrer"          value="" />
                <input type="hidden" name="first_url"                 value="" />
                <input type="hidden" name="first_referrer"            value="" />
                <input type="hidden" name="first_session_url"         value="" />
                <input type="hidden" name="first_session_referrer"    value="" />
                <input type="hidden" name="referral_code"             value="" />

                <div className="nl-form-row">
                  <input
                    ref={inputRef}
                    type="email"
                    name="email"
                    placeholder={t('Ton adresse e-mail')}
                    aria-label={t('Ton adresse e-mail')}
                    aria-invalid={status === "invalid"}
                    required
                    disabled={status === "loading"}
                    className="nl-input"
                  />
                  <button
                    type="submit"
                    className="nl-btn"
                    disabled={status === "loading"}
                  >
                    <span>{t(status === "loading" ? "Envoi…" : "Je m'inscris")}</span>
                    {status !== "loading" && (
                      <svg className="nl-btn-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    )}
                  </button>
                </div>

                {status === "invalid" && (
                  <p className="nl-hint-error" role="alert">{t('Adresse e-mail invalide.')}</p>
                )}
                {status === "error" && (
                  <p className="nl-hint-error" role="alert">{t('Une erreur est survenue. Réessaie.')}</p>
                )}
              </form>
            )}

            {/* Méta légale */}
            <p className="nl-legal">
              {locale === 'en'
                ? '1× per week · Free · Unsubscribe at any time.'
                : '1× par semaine · Gratuit · Désinscription à tout moment.'}
            </p>

          </div>
        </div>

        {/* iframe Substack silencieuse (inchangée) */}
        <iframe
          ref={frameRef}
          title={t('Inscription newsletter')}
          name="nl-frame"
          className="nl-iframe"
          onLoad={handleFrameLoad}
          aria-hidden="true"
        />
      </div>

      <style>{`
        /* ═══════════════════════════════════════════════
           OVERLAY
        ═══════════════════════════════════════════════ */
        .nl-overlay {
          position: fixed;
          inset: 0;
          z-index: 10000;
          background: rgba(8, 15, 18, 0.56);
          backdrop-filter: blur(3px);
          -webkit-backdrop-filter: blur(3px);
          animation: nlFadeIn 0.32s ease forwards;
        }

        /* ═══════════════════════════════════════════════
           CARD — mini-magazine éditorial
        ═══════════════════════════════════════════════ */
        .nl-card {
          position: fixed;
          z-index: 10001;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: min(900px, 92vw);
          height: min(520px, 88vh);
          display: grid;
          grid-template-columns: 35fr 65fr;
          border-radius: 12px;
          overflow: hidden;
          box-shadow:
            0 28px 80px rgba(0, 0, 0, 0.26),
            0 4px 18px rgba(0, 0, 0, 0.10);
          animation: nlSlideIn 0.40s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        /* ═══════════════════════════════════════════════
           GAUCHE — couverture éditoriale
        ═══════════════════════════════════════════════ */
        .nl-left {
          background: #1a2a2d;
          color: #e8e4de;
          padding: 36px 28px 32px;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
        }

        /* Repères graphiques discrets */
        .nl-left-deco {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }
        .nl-deco-line--h {
          position: absolute;
          top: 90px;
          left: 0; right: 0;
          height: 1px;
          background: rgba(255,255,255,.055);
          display: block;
        }
        .nl-deco-line--v {
          position: absolute;
          right: 28px;
          top: 0; bottom: 0;
          width: 1px;
          background: rgba(255,255,255,.04);
          display: block;
        }
        .nl-deco-dot {
          position: absolute;
          top: 89px;
          right: 27px;
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: rgba(193,208,223,.28);
          transform: translate(50%, -50%);
          display: block;
        }

        /* Masthead */
        .nl-masthead {
          position: relative;
          z-index: 1;
        }
        .nl-masthead-brand {
          display: block;
          font-family: var(--font-body, sans-serif);
          font-size: 8.5px;
          font-weight: 700;
          letter-spacing: 0.38em;
          text-transform: uppercase;
          color: rgba(232, 228, 222, 0.90);
        }
        .nl-masthead-rule {
          display: block;
          width: 100%;
          height: 1px;
          background: rgba(255,255,255,.12);
          margin: 10px 0 8px;
        }
        .nl-masthead-sub {
          display: block;
          font-family: var(--font-body, sans-serif);
          font-size: 8px;
          font-weight: 400;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(232, 228, 222, 0.28);
        }

        /* Zone centrale */
        .nl-left-mid {
          flex: 1;
          display: flex;
          align-items: center;
          position: relative;
          z-index: 1;
        }
        .nl-mid-rule {
          display: block;
          width: 22px;
          height: 1px;
          background: rgba(193,208,223,.2);
        }

        /* Labels rubriques empilés en bas */
        .nl-cover-labels {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .nl-cover-label {
          display: block;
          font-family: var(--font-body, sans-serif);
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 0.42em;
          text-transform: uppercase;
          color: rgba(193, 208, 223, 0.35);
          line-height: 1;
        }

        /* ═══════════════════════════════════════════════
           DROITE — contenu newsletter
        ═══════════════════════════════════════════════ */
        .nl-right {
          background: #fafaf9;
          display: flex;
          flex-direction: column;
          position: relative;
        }

        /* Bouton fermer */
        .nl-close {
          position: absolute;
          top: 16px;
          right: 16px;
          background: none;
          border: none;
          cursor: pointer;
          color: #a8b5bc;
          padding: 6px;
          line-height: 0;
          z-index: 2;
          border-radius: 4px;
          transition: color 0.14s, background 0.14s;
        }
        .nl-close:hover { color: #233033; background: rgba(0,0,0,.05); }
        .nl-close:focus-visible { outline: 2px solid #5B7377; outline-offset: 2px; }

        /* Zone principale */
        .nl-right-inner {
          flex: 1;
          padding: 40px 44px 32px;
          display: flex;
          flex-direction: column;
          gap: 18px;
          overflow: hidden;
        }

        /* Eyebrow */
        .nl-eyebrow {
          display: block;
          font-family: var(--font-body, sans-serif);
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 0.30em;
          text-transform: uppercase;
          color: #5B7377;
        }

        /* Titre éditorial */
        .nl-title-block { margin: 0; }
        .nl-title { margin: 0; line-height: 1; }
        .nl-title-big {
          display: block;
          font-family: var(--font-display, sans-serif);
          font-size: clamp(30px, 3.4vw, 44px);
          font-weight: 600;
          letter-spacing: -0.04em;
          color: #1a2a2d;
          line-height: 0.95;
        }
        .nl-title-sub {
          display: block;
          font-family: var(--font-display, sans-serif);
          font-size: clamp(22px, 2.4vw, 30px);
          font-weight: 300;
          font-style: italic;
          letter-spacing: -0.025em;
          color: #5B7377;
          line-height: 1.1;
          margin-top: 4px;
        }

        /* Rubriques */
        .nl-rubriques {
          display: flex;
          flex-direction: column;
          gap: 9px;
        }
        .nl-rubrique {
          display: flex;
          align-items: center;
          gap: 11px;
        }
        .nl-rubrique-icon {
          flex-shrink: 0;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(91,115,119,.20);
          border-radius: 6px;
          color: #5B7377;
        }
        .nl-rubrique-text {
          display: flex;
          align-items: baseline;
          gap: 8px;
          min-width: 0;
        }
        .nl-rubrique-label {
          font-family: var(--font-body, sans-serif);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #1a2a2d;
          white-space: nowrap;
        }
        .nl-rubrique-desc {
          font-family: var(--font-body, sans-serif);
          font-size: 11.5px;
          color: #7F9195;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* Séparateur */
        .nl-sep {
          width: 100%;
          height: 1px;
          background: #e4e8ea;
          margin: 0;
        }

        /* Formulaire */
        .nl-form { display: flex; flex-direction: column; gap: 0; }

        .nl-form-row {
          display: flex;
          height: 48px;
          border: 1px solid #d0d9dd;
          border-radius: 6px;
          overflow: hidden;
          background: #fff;
          transition: border-color 0.16s, box-shadow 0.16s;
        }
        .nl-form-row:focus-within {
          border-color: #5B7377;
          box-shadow: 0 0 0 3px rgba(91,115,119,.10);
        }

        .nl-input {
          flex: 1;
          border: none;
          outline: none;
          padding: 0 14px;
          font-size: 13px;
          font-family: var(--font-body, sans-serif);
          color: #233033;
          background: transparent;
          min-width: 0;
        }
        .nl-input::placeholder { color: #9aadb5; }
        .nl-input[aria-invalid="true"] { background: #fff9f9; }
        .nl-input:disabled { opacity: 0.6; cursor: not-allowed; }

        .nl-btn {
          flex-shrink: 0;
          padding: 0 20px;
          background: #233033;
          color: #e8e4de;
          border: none;
          cursor: pointer;
          font-family: var(--font-body, sans-serif);
          font-size: 8.5px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 7px;
          transition: background 0.16s;
          white-space: nowrap;
        }
        .nl-btn:hover:not(:disabled) { background: #1a2a2d; }
        .nl-btn:hover:not(:disabled) .nl-btn-arrow { transform: translateX(3px); }
        .nl-btn-arrow { transition: transform 0.18s ease; flex-shrink: 0; }
        .nl-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .nl-hint-error {
          font-size: 11px;
          color: #b91c1c;
          margin: 5px 0 0;
          font-family: var(--font-body, sans-serif);
        }

        /* Méta */
        .nl-legal {
          font-family: var(--font-body, sans-serif);
          font-size: 10px;
          color: #9ca3af;
          margin: 0;
        }

        /* Succès */
        .nl-success {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 14px;
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 6px;
          color: #166534;
        }
        .nl-success svg { flex-shrink: 0; stroke: #16a34a; }
        .nl-success span {
          font-family: var(--font-body, sans-serif);
          font-size: 13px;
          font-weight: 500;
        }

        /* iframe cachée */
        .nl-iframe { display: none; width: 0; height: 0; border: none; }

        /* ═══════════════════════════════════════════════
           ANIMATIONS
        ═══════════════════════════════════════════════ */
        @keyframes nlFadeIn {
          from { opacity: 0; } to { opacity: 1; }
        }
        @keyframes nlSlideIn {
          from { opacity: 0; transform: translate(-50%, calc(-50% + 18px)); }
          to   { opacity: 1; transform: translate(-50%, -50%); }
        }
        .nl-overlay.nl-closing { animation: nlFadeOut  0.28s ease forwards; }
        .nl-card.nl-closing    { animation: nlSlideOut 0.28s ease forwards; }
        @keyframes nlFadeOut {
          from { opacity: 1; } to { opacity: 0; }
        }
        @keyframes nlSlideOut {
          from { opacity: 1; transform: translate(-50%, -50%); }
          to   { opacity: 0; transform: translate(-50%, calc(-50% + 10px)); }
        }

        /* ═══════════════════════════════════════════════
           TABLETTE (641–860 px)
        ═══════════════════════════════════════════════ */
        @media (min-width: 641px) and (max-width: 860px) {
          .nl-card {
            grid-template-columns: 32fr 68fr;
            height: min(500px, 88vh);
          }
          .nl-right-inner { padding: 32px 32px 26px; gap: 14px; }
          .nl-title-big   { font-size: clamp(26px, 3.2vw, 38px); }
          .nl-title-sub   { font-size: clamp(18px, 2.2vw, 26px); }
        }

        /* ═══════════════════════════════════════════════
           MOBILE (≤ 640 px)
        ═══════════════════════════════════════════════ */
        @media (max-width: 640px) {
          .nl-card {
            top: auto; bottom: 0; left: 0; right: 0;
            width: 100%;
            height: auto;
            transform: none;
            border-radius: 16px 16px 0 0;
            grid-template-columns: 1fr;
            max-height: 92dvh;
            overflow-y: auto;
            animation: nlSlideUp 0.36s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          }
          .nl-card.nl-closing { animation: nlSlideDown 0.28s ease forwards; }

          /* Gauche : compacte sur mobile */
          .nl-left {
            padding: 22px 24px 18px;
            flex-direction: row;
            align-items: center;
            gap: 0;
          }
          .nl-left-mid { display: none; }
          .nl-masthead { flex: 1; }
          .nl-cover-labels {
            flex-direction: row;
            gap: 14px;
            align-items: center;
          }
          .nl-cover-label { font-size: 7px; letter-spacing: 0.28em; }
          .nl-deco-line--v { display: none; }
          .nl-deco-line--h { top: 100%; }

          /* Droite */
          .nl-right-inner { padding: 24px 22px 18px; gap: 13px; }
          .nl-title-big { font-size: clamp(28px, 8vw, 36px); }
          .nl-title-sub { font-size: clamp(20px, 6vw, 26px); }
          .nl-rubrique-desc { display: none; }
          .nl-btn { padding: 0 16px; }

          @keyframes nlSlideUp {
            from { opacity: 0; transform: translateY(24px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          @keyframes nlSlideDown {
            from { opacity: 1; transform: translateY(0); }
            to   { opacity: 0; transform: translateY(24px); }
          }
        }

        /* Réduit-motion */
        @media (prefers-reduced-motion: reduce) {
          .nl-card, .nl-overlay,
          .nl-card.nl-closing, .nl-overlay.nl-closing { animation: none !important; }
          .nl-btn-arrow { transition: none; }
        }
      `}</style>
    </>
  )
}
