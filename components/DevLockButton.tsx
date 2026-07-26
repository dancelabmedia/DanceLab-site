"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

/**
 * Bouton "Verrouiller à nouveau" — visible uniquement sur localhost.
 * Supprime le cookie preview_access et redirige vers la page en cours,
 * ce qui déclenche immédiatement la page de mot de passe.
 * En production ce composant ne rend rien.
 */
export default function DevLockButton() {
  const router = useRouter()
  const [isLocal, setIsLocal] = useState(false)

  useEffect(() => {
    setIsLocal(
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1"
    )
  }, [])

  if (!isLocal) return null

  async function handleLock() {
    await fetch("/api/acces-prive", { method: "DELETE" })
    router.refresh()
  }

  return (
    <>
      <button
        type="button"
        onClick={handleLock}
        className="dev-lock-btn"
        title="Supprimer le cookie et revoir la page de mot de passe"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        Verrouiller
      </button>

      <style>{`
        .dev-lock-btn {
          position: fixed;
          bottom: 1.25rem;
          right: 1.25rem;
          z-index: 9999;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 7px 13px 7px 10px;
          background: rgba(30, 30, 30, 0.88);
          color: #e5e7eb;
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 500;
          font-family: inherit;
          cursor: pointer;
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          transition: background 0.18s, color 0.18s;
          letter-spacing: 0.01em;
          box-shadow: 0 2px 10px rgba(0,0,0,0.25);
        }

        .dev-lock-btn:hover {
          background: rgba(180, 30, 30, 0.9);
          color: #fff;
          border-color: rgba(255,255,255,0.18);
        }
      `}</style>
    </>
  )
}
