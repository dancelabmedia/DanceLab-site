"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { Locale } from '@/lib/i18n/routing'
import { uiText } from '@/data/i18n/messages'
import { useLocale } from './LocaleProvider'

// ── Logique d'affichage (inchangée) ────────────────────────────────────────────
const STORAGE_KEY   = "dl_newsletter_dismissed"
const DELAY_MS      = 5_000
const SUPPRESS_DAYS = 30

function wasRecentlyDismissed(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return false
    const ts = parseInt(raw, 10)
    if (isNaN(ts)) return false
    return Date.now() - ts < SUPPRESS_DAYS * 24 * 60 * 60 * 1000
  } catch {
    return false
  }
}

function markDismissed() {
  try {
    localStorage.setItem(STORAGE_KEY, String(Date.now()))
  } catch {}
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

  // Déclenchement après délai
  useEffect(() => {
    if (wasRecentlyDismissed()) return
    const timer = setTimeout(() => setVisible(true), DELAY_MS)
    return () => clearTimeout(timer)
  }, [])

  // Touche Échap
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

  // Callback iframe Substack (inchangé)
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

  return (
    <>
      {/* ── Overlay ───────────────────────────────────────────────── */}
      <div
        className={`nl-overlay${isClosing ? " nl-closing" : ""}`}
        onClick={close}
        aria-hidden="true"
      />

      {/* ── Modal ─────────────────────────────────────────────────── */}
      <div
        className={`nl-card${isClosing ? " nl-closing" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="nl-title"
      >

        {/* ════ GAUCHE — couverture éditoriale ════ */}
        <div className="nl-left" aria-hidden="true">

          <div className="nl-left-top">
            <span className="nl-brand">Dance Lab</span>
            <span className="nl-brand-rule" />
          </div>

          <div className="nl-headline">
            <p className="nl-hl nl-hl-sm nl-hl-reg">{t('La newsletter')}</p>
            <p className="nl-hl nl-hl-md nl-hl-reg">{t('qui garde')}</p>
            <p className="nl-hl nl-hl-lg nl-hl-accent">{t('la danse')}</p>
            <p className="nl-hl nl-hl-sm nl-hl-reg">{t('en mouvement.')}</p>
          </div>

          <div className="nl-left-foot">
            <span className="nl-foot-rule" />
            <span className="nl-foot-tags">{locale === 'en' ? 'Podcast · Culture · Careers · Events' : 'Podcast · Culture · Carrière · Sorties'}</span>
          </div>
        </div>

        {/* ════ DROITE — contenu newsletter ════ */}
        <div className="nl-right">

          {/* Fermer */}
          <button type="button" className="nl-close" onClick={close} aria-label={t('Fermer')}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6"  x2="6"  y2="18" />
              <line x1="6"  y1="6"  x2="18" y2="18" />
            </svg>
          </button>

          <div className="nl-right-inner">

            <span className="nl-eyebrow">{t('Newsletter hebdomadaire')}</span>

            <h2 id="nl-title" className="nl-title">
              <span className="nl-title-bold">{t('Le meilleur de la danse,')}</span>
              <em className="nl-title-italic">{t('directement dans ta boîte mail.')}</em>
            </h2>

            <p className="nl-desc">
              {t('Chaque semaine, les nouveaux épisodes, nos meilleurs articles, les événements à ne pas manquer et les ressources qui valent vraiment le détour.')}
            </p>

            <p className="nl-meta">{locale === 'en' ? '5-minute read · Once a week · Free' : '5 min de lecture · 1× par semaine · Gratuit'}</p>

            {status === "success" ? (
              <div className="nl-success">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
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
                <input type="hidden" name="source"               value="dance-lab-modal" />
                <input type="hidden" name="current_url"          value="https://dancelablemedia.substack.com/" />
                <input type="hidden" name="current_referrer"     value="" />
                <input type="hidden" name="first_url"            value="" />
                <input type="hidden" name="first_referrer"       value="" />
                <input type="hidden" name="first_session_url"    value="" />
                <input type="hidden" name="first_session_referrer" value="" />
                <input type="hidden" name="referral_code"        value="" />

                {/* Formulaire horizontal */}
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
                    <span>{t(status === "loading" ? "Envoi…" : "S'abonner")}</span>
                    {status !== "loading" && (
                      <svg className="nl-btn-arrow" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
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

                <p className="nl-legal">{t('Aucun spam. Désinscription à tout moment.')}</p>
              </form>
            )}
          </div>

          {/* Signature bas */}
          <div className="nl-signature">
            <span className="nl-sig-rule" />
            <span className="nl-sig-text">{locale === 'en' ? 'Dance Lab — A media platform reference for dance' : 'Dance Lab - Le média référence de la danse'}</span>
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
        /* ═══════════════════════════════════════
           OVERLAY
        ═══════════════════════════════════════ */
        .nl-overlay {
          position: fixed;
          inset: 0;
          z-index: 10000;
          background: rgba(8, 15, 18, 0.54);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          animation: nlFadeIn 0.35s ease forwards;
        }

        /* ═══════════════════════════════════════
           CARD — 940 × 560 px éditorial
        ═══════════════════════════════════════ */
        .nl-card {
          position: fixed;
          z-index: 10001;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: min(950px, 92vw);
          height: min(560px, 88vh);
          display: grid;
          grid-template-columns: 42fr 58fr;
          border-radius: 14px;
          overflow: hidden;
          box-shadow:
            0 32px 90px rgba(0, 0, 0, 0.28),
            0 4px 20px rgba(0, 0, 0, 0.12);
          animation: nlSlideIn 0.42s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        /* ═══════════════════════════════════════
           PARTIE GAUCHE — couverture éditoriale
        ═══════════════════════════════════════ */
        .nl-left {
          background-color: var(--color-primary-dark, #425659);
          background-image:
            linear-gradient(180deg, rgba(35,48,51,.50) 0%, rgba(35,48,51,.72) 100%),
            url('/images/les-invites-header/imagetest.png');
          background-size: cover;
          background-position: center;
          color: #f0ede8;
          padding: clamp(32px, 4vw, 48px) clamp(26px, 3.4vw, 42px);
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
        }

        /* Marque */
        .nl-left-top {
          position: relative;
          z-index: 1;
        }
        .nl-brand {
          display: block;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.36em;
          text-transform: uppercase;
          color: rgba(240, 237, 232, 0.55);
          font-family: var(--font-body, sans-serif);
        }
        .nl-brand-rule {
          display: block;
          width: 32px;
          height: 1px;
          background: rgba(240, 237, 232, 0.24);
          margin-top: 11px;
        }

        /* ── Titre éditorial ── */
        .nl-headline {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          margin: 28px 0 22px;
          position: relative;
          z-index: 1;
          gap: 0;
        }

        /* Ligne standard : Aileron light uppercase */
        .nl-hl {
          margin: 0;
          font-family: var(--font-display, sans-serif);
          font-weight: 300;
          line-height: 0.96;
          letter-spacing: -0.042em;
          text-transform: uppercase;
        }
        /* Taille différenciée par ligne pour créer du rythme */
        .nl-hl-sm { font-size: clamp(22px, 2.8vw, 36px); }   /* La newsletter / En mouvement. */
        .nl-hl-md { font-size: clamp(26px, 3.2vw, 42px); }   /* Qui garde */
        .nl-hl-lg { font-size: clamp(28px, 3.6vw, 48px); }   /* La danse */

        .nl-hl-reg   { color: #f0ede8; }

        /* "LA DANSE" — Aileron italic, bleu-clair, légèrement plus grand */
        .nl-hl-accent {
          font-family: var(--font-display, sans-serif);
          font-weight: 400;
          font-style: italic;
          color: #C1D0DF;
          letter-spacing: -0.048em;
          line-height: 0.96;
        }

        /* Bas de page */
        .nl-left-foot {
          position: relative;
          z-index: 1;
        }
        .nl-foot-rule {
          display: block;
          width: 100%;
          height: 1px;
          background: rgba(255, 255, 255, 0.10);
          margin-bottom: 10px;
        }
        .nl-foot-tags {
          font-size: 7px;
          font-weight: 700;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: rgba(240, 237, 232, 0.32);
          font-family: var(--font-body, sans-serif);
        }

        /* ═══════════════════════════════════════
           PARTIE DROITE — contenu newsletter
        ═══════════════════════════════════════ */
        .nl-right {
          background: #ffffff;
          display: flex;
          flex-direction: column;
          position: relative;
        }

        /* Croix fine */
        .nl-close {
          position: absolute;
          top: 18px;
          right: 18px;
          background: none;
          border: none;
          cursor: pointer;
          color: #a8b5bc;
          padding: 5px;
          line-height: 0;
          z-index: 2;
          transition: color 0.14s;
        }
        .nl-close:hover { color: #1a2f34; }
        .nl-close:focus-visible { outline: 2px solid #5B7377; outline-offset: 3px; }

        /* Contenu principal — flex avec gap régulier */
        .nl-right-inner {
          flex: 1;
          padding: clamp(40px, 5vw, 54px) clamp(44px, 5.5vw, 58px) clamp(24px, 3vw, 32px);
          display: flex;
          flex-direction: column;
          gap: clamp(14px, 2vw, 22px);
        }

        /* Eyebrow */
        .nl-eyebrow {
          display: block;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: #5B7377;
          font-family: var(--font-body, sans-serif);
        }

        /* Titre — deux registres typographiques distincts */
        .nl-title {
          font-family: var(--font-display, sans-serif);
          margin: 0;
          line-height: 1.06;
        }
        /* Première ligne : gras, contemporain */
        .nl-title-bold {
          display: block;
          font-size: clamp(22px, 2.6vw, 32px);
          font-weight: 700;
          color: var(--color-text-dark, #233033);
          letter-spacing: -0.035em;
        }
        /* Deuxième ligne : italique éditorial — Aileron 400-italic (fichier réel chargé) */
        .nl-title-italic {
          display: block;
          font-size: clamp(20px, 2.4vw, 29px);
          font-weight: 400;
          font-style: italic;
          color: var(--color-primary-dark, #425659);
          letter-spacing: -0.03em;
          margin-top: 3px;
        }

        /* Description */
        .nl-desc {
          font-size: clamp(13px, 1.2vw, 14.5px);
          color: var(--color-primary, #5B7377);
          line-height: 1.7;
          margin: 0;
          max-width: 40ch;
        }

        /* Méta */
        .nl-meta {
          font-size: 8.5px;
          font-weight: 700;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #94a3b8;
          margin: 0;
          font-family: var(--font-body, sans-serif);
        }

        /* ── Formulaire : pousse vers le bas avec flex-grow ── */
        .nl-form {
          display: flex;
          flex-direction: column;
          gap: 0;
          flex-grow: 1;
          justify-content: flex-end;
        }
        .nl-success {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
        }

        .nl-form-row {
          display: flex;
          height: 54px;
          border: 1px solid #d4dde1;
          border-radius: 6px;
          overflow: hidden;
          transition: border-color 0.18s, box-shadow 0.18s;
        }
        .nl-form-row:focus-within {
          border-color: #5B7377;
          box-shadow: 0 0 0 3px rgba(91, 115, 119, 0.10);
        }

        .nl-input {
          flex: 1;
          border: none;
          outline: none;
          padding: 0 16px;
          font-size: 13.5px;
          font-family: inherit;
          color: var(--color-text-dark, #233033);
          background: #fff;
          min-width: 0;
        }
        .nl-input::placeholder { color: #9aadb5; }
        .nl-input[aria-invalid="true"] { background: #fff9f9; }
        .nl-input:disabled { opacity: 0.6; cursor: not-allowed; }

        .nl-btn {
          flex-shrink: 0;
          padding: 0 clamp(16px, 2.2vw, 26px);
          background: var(--color-primary-dark, #425659);
          color: #f0ede8;
          border: none;
          cursor: pointer;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.20em;
          text-transform: uppercase;
          font-family: var(--font-body, sans-serif);
          display: flex;
          align-items: center;
          gap: 8px;
          transition: background 0.18s;
          white-space: nowrap;
        }
        .nl-btn:hover:not(:disabled) { background: var(--color-text-dark, #233033); }
        .nl-btn:hover:not(:disabled) .nl-btn-arrow { transform: translateX(3px); }
        .nl-btn-arrow { transition: transform 0.20s ease; flex-shrink: 0; }
        .nl-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .nl-hint-error {
          font-size: 11px;
          color: #b91c1c;
          margin: 6px 0 0;
        }

        .nl-legal {
          font-size: 10.5px;
          color: #9ca3af;
          margin: 9px 0 0;
          font-family: var(--font-body, sans-serif);
        }

        /* État succès */
        .nl-success {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 16px;
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 6px;
          color: #166534;
        }
        .nl-success svg { flex-shrink: 0; stroke: #16a34a; }
        .nl-success span { font-size: 13.5px; font-weight: 500; }

        /* Signature */
        .nl-signature {
          padding: 0 clamp(44px, 5.5vw, 58px) 20px;
        }
        .nl-sig-rule {
          display: block;
          width: 100%;
          height: 1px;
          background: #e8ecee;
          margin-bottom: 10px;
        }
        .nl-sig-text {
          font-size: 8.5px;
          font-weight: 600;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #a0acb5;
          font-family: var(--font-body, sans-serif);
        }

        /* iframe cachée */
        .nl-iframe { display: none; width: 0; height: 0; border: none; }

        /* ═══════════════════════════════════════
           ANIMATIONS
        ═══════════════════════════════════════ */
        @keyframes nlFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes nlSlideIn {
          from { opacity: 0; transform: translate(-50%, calc(-50% + 20px)); }
          to   { opacity: 1; transform: translate(-50%, -50%); }
        }

        .nl-overlay.nl-closing { animation: nlFadeOut  0.3s ease forwards; }
        .nl-card.nl-closing    { animation: nlSlideOut 0.3s ease forwards; }

        @keyframes nlFadeOut {
          from { opacity: 1; } to { opacity: 0; }
        }
        @keyframes nlSlideOut {
          from { opacity: 1; transform: translate(-50%, -50%); }
          to   { opacity: 0; transform: translate(-50%, calc(-50% + 12px)); }
        }

        /* ═══════════════════════════════════════
           TABLETTE (641–900 px)
        ═══════════════════════════════════════ */
        @media (min-width: 641px) and (max-width: 900px) {
          .nl-card { grid-template-columns: 40fr 60fr; height: min(520px, 88vh); }
          .nl-hl-sm { font-size: clamp(20px, 2.6vw, 30px); }
          .nl-hl-md { font-size: clamp(24px, 3vw, 36px); }
          .nl-hl-lg { font-size: clamp(26px, 3.3vw, 42px); }
          .nl-right-inner { padding: 36px 36px 24px; gap: 16px; }
          .nl-signature { padding: 0 36px 18px; }
        }

        /* ═══════════════════════════════════════
           MOBILE (≤ 640 px)
        ═══════════════════════════════════════ */
        @media (max-width: 640px) {
          .nl-card {
            top: 50%; bottom: auto; left: 50%; right: auto;
            width: calc(100% - 32px); height: auto;
            max-width: 430px;
            transform: translate(-50%, -50%);
            border-radius: 14px;
            grid-template-columns: 1fr;
            max-height: calc(100dvh - 32px);
            overflow-y: auto;
            animation: nlMobileIn 0.38s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          }
          .nl-card.nl-closing { animation: nlMobileOut 0.3s ease forwards; }

          .nl-left { padding: 14px 18px 12px; }
          .nl-brand { font-size: 7px; }
          .nl-brand-rule { margin-top: 7px; }
          .nl-headline { margin: 9px 0 0; flex: none; }
          .nl-hl { line-height: .92; }
          .nl-hl-sm { font-size: clamp(17px, 5.2vw, 22px); }
          .nl-hl-md { font-size: clamp(19px, 5.8vw, 24px); }
          .nl-hl-lg { font-size: clamp(21px, 6.4vw, 27px); }
          .nl-left-foot { margin-top: 9px; }
          .nl-foot-rule { margin-bottom: 7px; }
          .nl-foot-tags { font-size: 6px; }

          .nl-close { top: 10px; right: 10px; padding: 8px; }
          .nl-right-inner { padding: 20px 18px 10px; gap: 8px; }
          .nl-eyebrow { font-size: 7.5px; }
          .nl-title { line-height: 1.02; }
          .nl-title-bold { font-size: clamp(20px, 5.6vw, 24px); }
          .nl-title-italic { font-size: clamp(18px, 5.1vw, 22px); margin-top: 1px; }
          .nl-desc { font-size: 12.5px; line-height: 1.5; max-width: none; }
          .nl-meta { font-size: 7.5px; letter-spacing: .16em; }
          .nl-form { flex-grow: 0; justify-content: flex-start; }
          .nl-form-row { height: 46px; }
          .nl-input { padding: 0 12px; font-size: 12.5px; }
          .nl-btn { padding: 0 13px; font-size: 8px; gap: 5px; }
          .nl-legal { margin-top: 6px; font-size: 9px; }
          .nl-signature { padding: 0 18px 12px; }
          .nl-sig-rule { margin-bottom: 7px; }
          .nl-sig-text { font-size: 7px; }

          @keyframes nlMobileIn {
            from { opacity: 0; transform: translate(-50%, calc(-50% + 18px)); }
            to   { opacity: 1; transform: translate(-50%, -50%); }
          }
          @keyframes nlMobileOut {
            from { opacity: 1; transform: translate(-50%, -50%); }
            to   { opacity: 0; transform: translate(-50%, calc(-50% + 18px)); }
          }
        }

        /* Préférence réduit-motion */
        @media (prefers-reduced-motion: reduce) {
          .nl-card, .nl-overlay,
          .nl-card.nl-closing, .nl-overlay.nl-closing { animation: none !important; }
          .nl-btn-arrow { transition: none; }
        }
      `}</style>
    </>
  )
}
