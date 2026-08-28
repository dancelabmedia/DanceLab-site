"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useState } from "react"

function AccesPriveForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get("redirect") || "/"

  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch("/api/acces-prive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })

      if (response.ok) {
        router.push(redirect)
        router.refresh()
      } else {
        setError("Mot de passe incorrect.")
        setPassword("")
      }
    } catch {
      setError("Une erreur est survenue. Réessaie.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="acces-prive-page">
      <div className="acces-prive-card">
        <Link href="/" className="acces-prive-logo">
          <img src="/logo.png" alt="Dance Lab" />
        </Link>

        <h1>Cette rubrique est actuellement en cours de construction.</h1>
        <p>
          Cette partie du site est encore en développement et n'est pas encore accessible au public.
        </p>

        <form onSubmit={handleSubmit} className="acces-prive-form">
          <label htmlFor="preview-password">Mot de passe</label>

          <div className="acces-prive-input-wrap">
            <input
              id="preview-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Entrer le mot de passe"
              autoComplete="current-password"
              required
              disabled={loading}
            />
            <button
              type="button"
              className="acces-prive-toggle"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              tabIndex={0}
            >
              {showPassword ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>

          {error && (
            <p className="acces-prive-error" role="alert">
              {error}
            </p>
          )}

          <button type="submit" className="acces-prive-submit" disabled={loading || !password}>
            {loading ? "Vérification…" : "Accéder"}
          </button>
        </form>
      </div>

      <style>{`

        /* ── Arrière-plan ────────────────────────────────────────── */
        .acces-prive-page {
          min-height: 100vh;
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }

        /* ── Carte principale ────────────────────────────────────── */
        .acces-prive-card {
          background: #ffffff;
          border: 1px solid rgba(193, 208, 223, 0.65);
          border-radius: 24px;
          padding: clamp(2.5rem, 6vw, 4rem);
          max-width: 520px;
          width: 100%;
          display: flex;
          flex-direction: column;
          box-shadow:
            0 2px 4px  rgba(35, 48, 51, 0.03),
            0 10px 36px rgba(35, 48, 51, 0.08),
            0 36px 88px rgba(35, 48, 51, 0.06);
        }

        /* ── Logo ────────────────────────────────────────────────── */
        .acces-prive-logo {
          display: block;
          margin-bottom: 2.75rem;
        }

        .acces-prive-logo img {
          height: 64px;
          width: auto;
          display: block;
        }

        /* Trait éditorial sous le logo */
        .acces-prive-logo::after {
          content: "";
          display: block;
          width: 32px;
          height: 2px;
          background: var(--color-primary-light, #C1D0DF);
          margin-top: 1.75rem;
          border-radius: 1px;
        }

        /* ── Titre ───────────────────────────────────────────────── */
        .acces-prive-card h1 {
          font-family: var(--font-display, 'Aileron', sans-serif);
          font-size: clamp(1.3rem, 3vw, 1.65rem);
          font-weight: 700;
          color: var(--color-text-dark, #233033);
          line-height: 1.28;
          margin: 0 0 1rem;
          letter-spacing: -0.02em;
        }

        /* ── Texte descriptif ────────────────────────────────────── */
        .acces-prive-card > p {
          font-size: clamp(0.88rem, 1.15vw, 0.95rem);
          color: var(--color-text-secondary, #5B7377);
          margin: 0;
          line-height: 1.72;
        }

        /* ── Formulaire ──────────────────────────────────────────── */
        .acces-prive-form {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-top: 2.25rem;
          padding-top: 2.25rem;
          border-top: 1px solid var(--color-border, #D8E0E2);
        }

        .acces-prive-form label {
          font-family: var(--font-body, 'DM Sans', sans-serif);
          font-size: 0.70rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--color-text-muted, #7F9195);
        }

        /* Wrapper champ + bouton œil */
        .acces-prive-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }

        .acces-prive-input-wrap input {
          width: 100%;
          padding: 0.92rem 3.2rem 0.92rem 1.1rem;
          border: 1.5px solid var(--color-border, #D8E0E2);
          border-radius: 10px;
          font-size: 1rem;
          font-family: inherit;
          background: var(--color-background-soft, #F6F8F9);
          color: var(--color-text-dark, #233033);
          caret-color: var(--color-primary, #5B7377);
          outline: none;
          transition: border-color 0.18s, box-shadow 0.18s, background 0.18s;
          box-sizing: border-box;
        }

        .acces-prive-input-wrap input::placeholder {
          color: var(--color-text-muted, #7F9195);
          opacity: 1;
        }

        .acces-prive-input-wrap input:focus {
          border-color: var(--color-primary, #5B7377);
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(91, 115, 119, 0.12);
        }

        /* Bouton afficher / masquer */
        .acces-prive-toggle {
          position: absolute;
          right: 0.85rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          padding: 4px;
          cursor: pointer;
          color: var(--color-text-muted, #7F9195);
          display: flex;
          align-items: center;
          transition: color 0.18s;
          line-height: 0;
        }

        .acces-prive-toggle:hover {
          color: var(--color-text-dark, #233033);
        }

        .acces-prive-toggle:focus-visible {
          outline: 2px solid var(--color-primary, #5B7377);
          border-radius: 4px;
        }

        /* Message d'erreur */
        .acces-prive-error {
          font-size: 0.84rem;
          color: #b91c1c;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .acces-prive-error::before {
          content: "✕";
          font-size: 0.68rem;
          font-weight: 700;
          width: 18px;
          height: 18px;
          background: #fee2e2;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        /* Bouton Accéder */
        .acces-prive-submit {
          width: 100%;
          padding: 1rem 1.5rem;
          background: var(--color-primary, #5B7377);
          color: #ffffff;
          border: none;
          border-radius: 10px;
          font-size: 0.95rem;
          font-weight: 600;
          font-family: var(--font-body, 'DM Sans', sans-serif);
          cursor: pointer;
          margin-top: 0.5rem;
          letter-spacing: 0.03em;
          transition: background 0.2s, box-shadow 0.2s, transform 0.12s;
        }

        .acces-prive-submit:hover:not(:disabled) {
          background: var(--color-primary-dark, #425659);
          box-shadow: 0 6px 22px rgba(91, 115, 119, 0.30);
          transform: translateY(-1px);
        }

        .acces-prive-submit:active:not(:disabled) {
          transform: translateY(0);
          box-shadow: 0 2px 8px rgba(91, 115, 119, 0.18);
        }

        .acces-prive-submit:disabled {
          opacity: 0.38;
          cursor: not-allowed;
        }

        /* ── Mobile ──────────────────────────────────────────────── */
        @media (max-width: 540px) {
          .acces-prive-page {
            padding: 1.25rem;
            align-items: flex-start;
            padding-top: clamp(3rem, 12vh, 6rem);
          }
          .acces-prive-card {
            border-radius: 18px;
          }
          .acces-prive-logo img {
            height: 52px;
          }
        }
      `}</style>
    </main>
  )
}

export default function AccesPrivePage() {
  return (
    <Suspense>
      <AccesPriveForm />
    </Suspense>
  )
}
