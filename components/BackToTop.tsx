'use client'

import { useEffect, useState } from 'react'
import type { Locale } from '@/lib/i18n/routing'
import { uiText } from '@/data/i18n/messages'
import { useLocale } from './LocaleProvider'

export default function BackToTop({ locale: _initialLocale = 'fr' }: { locale?: Locale }) {
  const locale = useLocale()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const updateVisibility = () => {
      setVisible(window.scrollY > 120)
    }

    updateVisibility()
    window.addEventListener('scroll', updateVisibility, { passive: true })

    return () => {
      window.removeEventListener('scroll', updateVisibility)
    }
  }, [])

  const handleClick = () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    })
  }

  return (
    <button
      type="button"
      className={`back-to-top${visible ? ' is-visible' : ''}`}
      onClick={handleClick}
      aria-label={uiText(locale, 'Retour en haut de la page')}
      title={uiText(locale, 'Retour en haut')}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        focusable="false"
      >
        <path d="M12 19V5" />
        <path d="M6.5 10.5 12 5l5.5 5.5" />
      </svg>
    </button>
  )
}
