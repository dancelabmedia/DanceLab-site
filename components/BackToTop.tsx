'use client'

import { useEffect, useState } from 'react'

export default function BackToTop() {
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
      aria-label="Retour en haut de la page"
      title="Retour en haut"
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
