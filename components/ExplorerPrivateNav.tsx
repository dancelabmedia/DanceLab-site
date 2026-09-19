'use client'

import { useState } from 'react'
import { explorerAccessSections } from '@/data/section-visibility'
import css from './ExplorerPrivateNav.module.css'

export default function ExplorerPrivateNav({ localEditor = false }: { localEditor?: boolean }) {
  const [error, setError] = useState(false)
  async function logout() {
    setError(false)
    try {
      const response = await fetch('/api/explorer-access', { method: 'DELETE' })
      if (!response.ok) throw new Error('logout')
      window.location.assign('/explorer')
    } catch { setError(true) }
  }
  return <nav className={css.nav} aria-label="Rubriques en accès privé">
    <span>{localEditor ? 'Édition locale · rubriques non publiques' : 'Accès privé · vérification éditoriale'}</span>
    {explorerAccessSections.map(section => <a key={section.key} href={section.path}>{section.label}</a>)}
    {!localEditor && <button type="button" onClick={logout}>Fermer l’accès privé</button>}
    {error && <span role="alert">Impossible de fermer l’accès. Réessayez.</span>}
  </nav>
}
