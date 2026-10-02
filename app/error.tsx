'use client'

import { useEffect } from 'react'

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('[Dance Lab] Erreur de rendu récupérée', error)
  }, [error])

  return (
    <main style={{ minHeight: '70vh', display: 'grid', placeItems: 'center', padding: '120px 24px', textAlign: 'center' }}>
      <div>
        <p style={{ textTransform: 'uppercase', letterSpacing: '.2em', fontSize: 12 }}>Dance Lab</p>
        <h1>Une erreur est survenue.</h1>
        <p>Le reste du site reste accessible. Tu peux réessayer cette page.</p>
        <button type="button" onClick={reset}>Réessayer</button>
      </div>
    </main>
  )
}
