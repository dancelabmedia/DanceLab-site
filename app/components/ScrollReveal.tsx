'use client'

/**
 * ScrollReveal — révélation progressive au scroll
 *
 * Usage : ajouter data-reveal (ou data-reveal="delay-N") sur n'importe quel élément.
 * Ce composant monte un IntersectionObserver global qui ajoute .dl-revealed
 * dès que l'élément entre dans le viewport.
 *
 * Variantes de délai :
 *   data-reveal="delay-1"  → 80ms
 *   data-reveal="delay-2"  → 160ms
 *   data-reveal="delay-3"  → 240ms
 *   data-reveal="delay-4"  → 320ms
 *
 * Variantes d'animation :
 *   data-reveal-type="fade-up"    → montée + fondu (défaut)
 *   data-reveal-type="fade-in"    → fondu seul
 *   data-reveal-type="slide-left" → glissement depuis la droite
 *   data-reveal-type="scale-in"   → zoom léger
 *
 * Respecte prefers-reduced-motion : si activé, tous les éléments
 * sont immédiatement visibles sans animation.
 *
 * NOTE : usePathname() est utilisé en dépendance pour re-observer les éléments
 * à chaque navigation client-side (Next.js App Router). Sans cela, les sections
 * des fiches métiers (et toute page avec data-reveal) resteraient invisibles
 * après une navigation soft.
 */

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function ScrollReveal() {
  const pathname = usePathname()

  useEffect(() => {
    // Respect prefers-reduced-motion
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReduced) {
      // Rendre tous les éléments immédiatement visibles
      document.querySelectorAll('[data-reveal]').forEach(el => {
        el.classList.add('dl-revealed')
      })
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('dl-revealed')
            // Ne joue l'animation qu'une seule fois
            observer.unobserve(entry.target)
          }
        })
      },
      {
        threshold: 0.08,
        rootMargin: '0px 0px -40px 0px',
      }
    )

    // Légère attente pour laisser React finir le rendu DOM après la navigation
    const raf = requestAnimationFrame(() => {
      const targets = document.querySelectorAll<Element>('[data-reveal]:not(.dl-revealed)')
      targets.forEach(el => observer.observe(el))
    })

    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
    }
  }, [pathname]) // ← se re-déclenche à chaque changement de route

  return null
}
