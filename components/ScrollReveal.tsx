'use client'

import { useEffect } from 'react'

/**
 * ScrollReveal
 * Reproduit exactement le comportement d'AboutReveal :
 * - ajoute .fu sur les éléments ciblés au montage
 * - observe leur entrée/sortie du viewport avec IntersectionObserver
 * - bascule .vis pour déclencher l'animation fade-up définie en CSS (.fu / .fu.vis)
 *
 * Usage :
 *   <ScrollReveal selector=".ma-page p, .ma-page h2" />
 */
export default function ScrollReveal({ selector }: { selector: string }) {
  useEffect(() => {
    const elements = Array.from(
      document.querySelectorAll<HTMLElement>(selector)
    )

    elements.forEach((el) => el.classList.add('fu'))

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('vis')
          } else {
            entry.target.classList.remove('vis')
          }
        })
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    )

    elements.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [selector])

  return null
}
