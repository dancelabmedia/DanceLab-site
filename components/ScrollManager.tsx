'use client'

import { useLayoutEffect } from 'react'

export default function ScrollManager() {
  useLayoutEffect(() => {
    const navigationEntry = performance.getEntriesByType('navigation')[0] as
      | PerformanceNavigationTiming
      | undefined
    const legacyNavigation = performance as Performance & {
      navigation?: { type: number }
    }
    const isReload = navigationEntry
      ? navigationEntry.type === 'reload'
      : legacyNavigation.navigation?.type === 1

    if (!isReload) {
      /* Navigation normale ou back/forward : restauration native conservée. */
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'auto'
      }
      return
    }

    /* Uniquement lors d'un rechargement : neutralise temporairement la
       restauration du navigateur et replace la page en haut sans animation. */
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }

    const resetReloadScroll = () => window.scrollTo(0, 0)
    resetReloadScroll()

    const frame = window.requestAnimationFrame(() => {
      resetReloadScroll()
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'auto'
      }
    })

    return () => window.cancelAnimationFrame(frame)
  }, [])

  return null
}
