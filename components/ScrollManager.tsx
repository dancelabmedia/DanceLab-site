'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: 'auto',
  })
}

export default function ScrollManager() {
  const pathname = usePathname()

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }

    const handlePageShow = () => {
      if (window.location.hash) return
      window.requestAnimationFrame(scrollToTop)
    }

    window.addEventListener('pageshow', handlePageShow)

    return () => {
      window.removeEventListener('pageshow', handlePageShow)
    }
  }, [])

  useEffect(() => {
    if (window.location.hash) return
    window.requestAnimationFrame(scrollToTop)
  }, [pathname])

  return null
}
