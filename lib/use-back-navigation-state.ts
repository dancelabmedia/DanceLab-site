'use client'

import { useEffect, useRef } from 'react'
import { currentNavigationKey, isHistoryRestoreTarget, listingStateStorageKey } from './navigation-memory'

/** Sauvegarde un état de listing et ne le restaure que lors d'un vrai retour historique. */
export function useBackNavigationState<T>(namespace: string, state: T, restore: (saved: T) => void) {
  const stateRef = useRef(state)
  const restoreRef = useRef(restore)
  stateRef.current = state
  restoreRef.current = restore

  useEffect(() => {
    const url = currentNavigationKey()
    if (!isHistoryRestoreTarget(url)) return
    try {
      const saved = sessionStorage.getItem(listingStateStorageKey(namespace, url))
      if (saved) restoreRef.current(JSON.parse(saved) as T)
    } catch {}
  }, [namespace])

  useEffect(() => {
    const url = currentNavigationKey()
    const save = () => {
      try { sessionStorage.setItem(listingStateStorageKey(namespace, url), JSON.stringify(stateRef.current)) } catch {}
    }
    // Ne jamais écraser l'état mémorisé par les valeurs initiales du premier rendu.
    if (!isHistoryRestoreTarget(url)) save()
    window.addEventListener('pagehide', save)
    return () => { save(); window.removeEventListener('pagehide', save) }
  }, [namespace, state])
}
