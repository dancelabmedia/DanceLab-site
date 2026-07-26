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
        .acces-prive-page {
          min-height: 100vh;
          background: var(--color-background, #fafafa);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }

        .acces-prive-card {
          background: #ffffff;
          border: 1px solid rgba(0, 0, 0, 0.10);
          border-radius: 16px;
          padding: clamp(2rem, 5vw, 3.5rem);
          max-width: 420px;
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.09);
        }

        .acces-prive-logo {
          display: block;
          margin-bottom: 0.5rem;
        }

        .acces-prive-logo img {
          height: 32px;
          width: auto;
        }

        .acces-prive-card h1 {
          font-family: var(--font-display, 'Aileron', sans-serif);
          font-size: clamp(1.1rem, 2.5vw, 1.3rem);
          font-weight: 700;
          color: #1a1a1a;
          line-height: 1.35;
          margin: 0;
          letter-spacing: -0.01em;
        }

        .acces-prive-card > p {
          font-size: 0.9rem;
          color: #6b7280;
          margin: 0;
          line-height: 1.65;
        }

        .acces-prive-form {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-top: 0.5rem;
        }

        .acces-prive-form label {
          font-size: 0.85rem;
          font-weight: 600;
          color: #1a1a1a;
          letter-spacing: 0.01em;
        }

        /* Wrapper champ + bouton œil */
        .acces-prive-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }

        .acces-prive-input-wrap input {
          width: 100%;
          padding: 0.78rem 3rem 0.78rem 1rem;
          border: 1.5px solid #c4c9cc;
          border-radius: 8px;
          font-size: 0.95rem;
          font-family: inherit;
          background: #ffffff;
          color: #1a1a1a;
          caret-color: #5B7377;
          outline: none;
          transition: border-color 0.18s, box-shadow 0.18s;
          box-sizing: border-box;
          -webkit-text-fill-color: #1a1a1a;
        }

        .acces-prive-input-wrap input::placeholder {
          color: #9ca3af;
          opacity: 1;
          -webkit-text-fill-color: #9ca3af;
        }

        .acces-prive-input-wrap input:focus {
          border-color: #5B7377;
          box-shadow: 0 0 0 3px rgba(91, 115, 119, 0.14);
        }

        /* Bouton afficher / masquer */
        .acces-prive-toggle {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          padding: 4px;
          cursor: pointer;
          color: #6b7280;
          display: flex;
          align-items: center;
          transition: color 0.18s;
          line-height: 0;
        }

        .acces-prive-toggle:hover {
          color: #1a1a1a;
        }

        .acces-prive-toggle:focus-visible {
          outline: 2px solid #5B7377;
          border-radius: 4px;
        }

        /* Message d'erreur */
        .acces-prive-error {
          font-size: 0.84rem;
          color: #b91c1c;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .acces-prive-error::before {
          content: "✕";
          font-size: 0.75rem;
          font-weight: 700;
          width: 16px;
          height: 16px;
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
          padding: 0.88rem 1rem;
          background: #5B7377;
          color: #ffffff;
          border: none;
          border-radius: 8px;
          font-size: 0.95rem;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          margin-top: 0.25rem;
          letter-spacing: 0.01em;
          transition: background 0.2s, box-shadow 0.2s, transform 0.1s;
        }

        .acces-prive-submit:hover:not(:disabled) {
          background: #4a6165;
          box-shadow: 0 4px 14px rgba(91, 115, 119, 0.28);
          transform: translateY(-1px);
        }

        .acces-prive-submit:active:not(:disabled) {
          transform: translateY(0);
          box-shadow: none;
        }

        .acces-prive-submit:disabled {
          opacity: 0.45;
          cursor: not-allowed;
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
