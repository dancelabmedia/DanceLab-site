"use client"

import { useCallback, useEffect, useRef, useState } from "react"

const STORAGE_KEY = "dl_newsletter_dismissed"
const DELAY_MS = 5_000           // 5 secondes avant apparition
const SUPPRESS_DAYS = 30         // ne pas réafficher pendant 30 jours

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

export default function NewsletterModal() {
  const [visible, setVisible] = useState(false)
  const [animating, setAnimating] = useState(false) // true = fade-out en cours
  const [status, setStatus] = useState<Status>("idle")

  const inputRef = useRef<HTMLInputElement>(null)
  const submittedRef = useRef(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const frameRef = useRef<HTMLIFrameElement>(null)

  // Déclenchement après délai
  useEffect(() => {
    if (wasRecentlyDismissed()) return

    const timer = setTimeout(() => {
      setVisible(true)
    }, DELAY_MS)

    return () => clearTimeout(timer)
  }, [])

  // Touche Échap
  useEffect(() => {
    if (!visible) return

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close()
    }

    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [visible])

  const close = useCallback(() => {
    setAnimating(true)
    markDismissed()
    setTimeout(() => {
      setVisible(false)
      setAnimating(false)
    }, 320)
  }, [])

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

  const handleFrameLoad = () => {
    if (!submittedRef.current) return
    submittedRef.current = false
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (inputRef.current) inputRef.current.value = ""
    setStatus("success")
    markDismissed()
    // fermer automatiquement 3 s après succès
    setTimeout(() => close(), 3_000)
  }

  if (!visible) return null

  const isClosing = animating

  return (
    <>
      {/* Overlay */}
      <div
        className={`nl-modal-overlay${isClosing ? " nl-modal-closing" : ""}`}
        onClick={close}
        aria-hidden="true"
      />

      {/* Carte */}
      <div
        className={`nl-modal-card${isClosing ? " nl-modal-closing" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="nl-modal-title"
      >
        {/* Bouton fermer */}
        <button
          type="button"
          className="nl-modal-close"
          onClick={close}
          aria-label="Fermer"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Décoratif */}
        <div className="nl-modal-deco" aria-hidden="true">
          <img src="/logo.png" alt="" />
        </div>

        <div className="nl-modal-body">
          <span className="nl-modal-eyebrow">Newsletter hebdomadaire</span>

          <h2 id="nl-modal-title" className="nl-modal-title">
            Le meilleur de la danse
          </h2>

          <p className="nl-modal-text">
            Chaque semaine, reçois gratuitement les nouveaux épisodes du podcast, les meilleurs articles,
            les événements à ne pas manquer et une sélection de ressources pour aller plus loin.
          </p>

          {status === "success" ? (
            <div className="nl-modal-success">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <p>Bienvenue dans la communauté Dance Lab ✨</p>
            </div>
          ) : (
            <form
              className="nl-modal-form"
              action="https://dancelablemedia.substack.com/api/v1/free?nojs=true"
              method="post"
              target="nl-modal-frame"
              onSubmit={handleSubmit}
              noValidate
            >
              <input type="hidden" name="source" value="dance-lab-modal" />
              <input type="hidden" name="current_url" value="https://dancelablemedia.substack.com/" />
              <input type="hidden" name="current_referrer" value="" />
              <input type="hidden" name="first_url" value="" />
              <input type="hidden" name="first_referrer" value="" />
              <input type="hidden" name="first_session_url" value="" />
              <input type="hidden" name="first_session_referrer" value="" />
              <input type="hidden" name="referral_code" value="" />

              <div className="nl-modal-field">
                <input
                  ref={inputRef}
                  type="email"
                  name="email"
                  placeholder="Adresse e-mail"
                  aria-label="Adresse e-mail"
                  aria-invalid={status === "invalid"}
                  required
                  disabled={status === "loading"}
                />
              </div>

              {status === "invalid" && (
                <p className="nl-modal-hint-error" role="alert">Adresse e-mail invalide.</p>
              )}
              {status === "error" && (
                <p className="nl-modal-hint-error" role="alert">Une erreur est survenue. Réessaie.</p>
              )}

              <button
                type="submit"
                className="nl-modal-btn"
                disabled={status === "loading"}
              >
                {status === "loading" ? "Envoi en cours…" : "Je m'abonne gratuitement"}
              </button>

              <p className="nl-modal-legal">
                Aucun spam. Tu peux te désinscrire à tout moment.
              </p>
            </form>
          )}
        </div>

        {/* iframe Substack silencieuse */}
        <iframe
          ref={frameRef}
          title="Inscription newsletter"
          name="nl-modal-frame"
          className="nl-modal-iframe"
          onLoad={handleFrameLoad}
          aria-hidden="true"
        />
      </div>

      <style>{`
        /* ── Overlay ───────────────────────────────────── */
        .nl-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 10000;
          background: rgba(10, 12, 14, 0.28);
          backdrop-filter: blur(2px);
          -webkit-backdrop-filter: blur(2px);
          animation: nlFadeIn 0.35s ease forwards;
        }

        /* ── Carte ─────────────────────────────────────── */
        .nl-modal-card {
          position: fixed;
          z-index: 10001;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: min(500px, calc(100vw - 2rem));
          background: #ffffff;
          border-radius: 18px;
          box-shadow:
            0 12px 48px rgba(0, 0, 0, 0.12),
            0 2px 8px rgba(0, 0, 0, 0.06);
          overflow: hidden;
          animation: nlSlideIn 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        /* ── Animations entrée ─────────────────────────── */
        @keyframes nlFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        @keyframes nlSlideIn {
          from {
            opacity: 0;
            transform: translate(-50%, calc(-50% + 14px));
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%);
          }
        }

        /* ── Animations sortie ─────────────────────────── */
        .nl-modal-overlay.nl-modal-closing {
          animation: nlFadeOut 0.3s ease forwards;
        }

        .nl-modal-card.nl-modal-closing {
          animation: nlSlideOut 0.3s ease forwards;
        }

        @keyframes nlFadeOut {
          from { opacity: 1; }
          to   { opacity: 0; }
        }

        @keyframes nlSlideOut {
          from {
            opacity: 1;
            transform: translate(-50%, -50%);
          }
          to {
            opacity: 0;
            transform: translate(-50%, calc(-50% + 10px));
          }
        }

        /* ── Bouton fermer ─────────────────────────────── */
        .nl-modal-close {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: none;
          border: none;
          cursor: pointer;
          color: #9ca3af;
          padding: 6px;
          border-radius: 6px;
          line-height: 0;
          transition: color 0.15s, background 0.15s;
          z-index: 1;
        }

        .nl-modal-close:hover {
          color: #1a1a1a;
          background: rgba(0, 0, 0, 0.05);
        }

        /* ── Bande décorative avec logo ────────────────── */
        .nl-modal-deco {
          background: var(--color-primary, #5B7377);
          padding: 1.4rem 2rem;
          display: flex;
          align-items: center;
        }

        .nl-modal-deco img {
          height: 44px;
          width: auto;
          filter: brightness(0) invert(1);
          opacity: 0.95;
        }

        /* ── Corps ─────────────────────────────────────── */
        .nl-modal-body {
          padding: clamp(1.5rem, 4vw, 2.2rem);
          display: flex;
          flex-direction: column;
          gap: 0.9rem;
        }

        .nl-modal-eyebrow {
          font-family: var(--font-body, 'DM Sans', sans-serif);
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--color-primary, #5B7377);
        }

        .nl-modal-title {
          font-family: var(--font-display, 'Aileron', sans-serif);
          font-size: clamp(1.45rem, 3.5vw, 1.85rem);
          font-weight: 800;
          color: #0f1117;
          line-height: 1.2;
          letter-spacing: -0.02em;
          margin: 0;
        }

        .nl-modal-text {
          font-size: 0.9rem;
          color: #4b5563;
          line-height: 1.7;
          margin: 0;
        }

        /* ── Formulaire ────────────────────────────────── */
        .nl-modal-form {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
          margin-top: 0.3rem;
        }

        .nl-modal-field input {
          width: 100%;
          padding: 0.8rem 1rem;
          border: 1.5px solid #d1d5db;
          border-radius: 9px;
          font-size: 0.9rem;
          font-family: inherit;
          background: #f9fafb;
          color: #1a1a1a;
          caret-color: var(--color-primary, #5B7377);
          outline: none;
          transition: border-color 0.18s, box-shadow 0.18s, background 0.18s;
          box-sizing: border-box;
          -webkit-text-fill-color: #1a1a1a;
        }

        .nl-modal-field input::placeholder {
          color: #9ca3af;
          -webkit-text-fill-color: #9ca3af;
        }

        .nl-modal-field input:focus {
          border-color: var(--color-primary, #5B7377);
          background: #fff;
          box-shadow: 0 0 0 3px rgba(91, 115, 119, 0.13);
        }

        .nl-modal-hint-error {
          font-size: 0.82rem;
          color: #b91c1c;
          margin: 0;
        }

        .nl-modal-btn {
          width: 100%;
          padding: 0.9rem 1rem;
          background: var(--color-primary, #5B7377);
          color: #fff;
          border: none;
          border-radius: 9px;
          font-size: 0.92rem;
          font-weight: 700;
          font-family: inherit;
          letter-spacing: 0.01em;
          cursor: pointer;
          transition: background 0.2s, box-shadow 0.2s, transform 0.1s;
          margin-top: 0.2rem;
        }

        .nl-modal-btn:hover:not(:disabled) {
          background: #4a6165;
          box-shadow: 0 4px 16px rgba(91, 115, 119, 0.28);
          transform: translateY(-1px);
        }

        .nl-modal-btn:active:not(:disabled) {
          transform: translateY(0);
          box-shadow: none;
        }

        .nl-modal-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .nl-modal-legal {
          font-size: 0.75rem;
          color: #9ca3af;
          text-align: center;
          margin: 0;
          line-height: 1.5;
        }

        /* ── Succès ────────────────────────────────────── */
        .nl-modal-success {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1.1rem 1.2rem;
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 10px;
          color: #166534;
          margin-top: 0.3rem;
        }

        .nl-modal-success svg {
          flex-shrink: 0;
          stroke: #16a34a;
        }

        .nl-modal-success p {
          margin: 0;
          font-size: 0.9rem;
          font-weight: 500;
          line-height: 1.5;
        }

        /* ── iframe cachée ─────────────────────────────── */
        .nl-modal-iframe {
          display: none;
          width: 0;
          height: 0;
          border: none;
        }

        /* ── Responsive mobile ─────────────────────────── */
        @media (max-width: 480px) {
          .nl-modal-card {
            top: auto;
            bottom: 0;
            left: 0;
            right: 0;
            transform: none;
            width: 100%;
            border-radius: 18px 18px 0 0;
            max-height: 92dvh;
            overflow-y: auto;
            animation: nlSlideUp 0.38s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          }

          .nl-modal-card.nl-modal-closing {
            animation: nlSlideDown 0.3s ease forwards;
          }

          @keyframes nlSlideUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes nlSlideDown {
            from {
              opacity: 1;
              transform: translateY(0);
            }
            to {
              opacity: 0;
              transform: translateY(30px);
            }
          }
        }
      `}</style>
    </>
  )
}
