'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { currentNavigationKey, HISTORY_RESTORE_TARGET, scrollStorageKey } from '@/lib/navigation-memory'

const MAX_RESTORE_WAIT_MS = 4000

export default function ScrollManager() {
  const pathname = usePathname()
  const scrollFrame = useRef<number | null>(null)
  const [historyTick, setHistoryTick] = useState(0)

  useLayoutEffect(() => {
    if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual'
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined
    if (navigation?.type === 'back_forward') sessionStorage.setItem(HISTORY_RESTORE_TARGET, currentNavigationKey())
    return () => { if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'auto' }
  }, [])

  useEffect(() => {
    const save = () => {
      try { sessionStorage.setItem(scrollStorageKey(currentNavigationKey()), String(window.scrollY)) } catch {}
    }
    const onScroll = () => {
      if (sessionStorage.getItem(HISTORY_RESTORE_TARGET) === currentNavigationKey()) return
      if (scrollFrame.current !== null) return
      scrollFrame.current = requestAnimationFrame(() => { scrollFrame.current = null; save() })
    }
    const onPopState = () => {
      sessionStorage.setItem(HISTORY_RESTORE_TARGET, currentNavigationKey())
      setHistoryTick(tick => tick + 1)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('pagehide', save)
    window.addEventListener('popstate', onPopState)
    return () => {
      save()
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('pagehide', save)
      window.removeEventListener('popstate', onPopState)
      if (scrollFrame.current !== null) cancelAnimationFrame(scrollFrame.current)
    }
  }, [])

  useLayoutEffect(() => {
    const url = currentNavigationKey()
    if (sessionStorage.getItem(HISTORY_RESTORE_TARGET) !== url) return
    const target = Number(sessionStorage.getItem(scrollStorageKey(url)) ?? 0)
    if (!Number.isFinite(target)) return

    const started = performance.now()
    let stableFrames = 0
    let frame = 0
    const restoreWhenReady = () => {
      const ready = document.documentElement.scrollHeight >= target + window.innerHeight
      if (ready || performance.now() - started >= MAX_RESTORE_WAIT_MS) {
        window.scrollTo({ top: target, left: 0, behavior: 'auto' })
        stableFrames++
        if (stableFrames >= 3) {
          sessionStorage.removeItem(HISTORY_RESTORE_TARGET)
          return
        }
      } else stableFrames = 0
      frame = requestAnimationFrame(restoreWhenReady)
    }
    frame = requestAnimationFrame(restoreWhenReady)
    return () => cancelAnimationFrame(frame)
  }, [pathname, historyTick])

  return null
}
