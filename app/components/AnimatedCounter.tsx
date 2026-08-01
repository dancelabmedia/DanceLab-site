'use client'

/**
 * AnimatedCounter — chiffre qui s'anime de 0 à sa valeur cible
 * lorsqu'il entre dans le viewport.
 *
 * Props :
 *   value    — valeur numérique finale (ex : 121)
 *   prefix   — préfixe textuel (ex : "+")
 *   suffix   — suffixe textuel (ex : " 000")
 *   duration — durée de l'animation en ms (défaut : 1400)
 *
 * Exemple : <AnimatedCounter value={121} suffix=" épisodes" />
 */

import { useEffect, useRef, useState } from 'react'

interface AnimatedCounterProps {
  value: number
  prefix?: string
  suffix?: string
  duration?: number
  className?: string
}

// Easing exponentiel décéléré — identique à cubic-bezier(0.22, 1, 0.36, 1)
function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

export default function AnimatedCounter({
  value,
  prefix = '',
  suffix = '',
  duration = 1400,
  className,
}: AnimatedCounterProps) {
  const [display, setDisplay] = useState(0)
  const rafRef = useRef<number | null>(null)
  const startRef = useRef<number | null>(null)
  const containerRef = useRef<HTMLSpanElement>(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReduced) {
      setDisplay(value)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true
          observer.disconnect()

          const animate = (timestamp: number) => {
            if (startRef.current === null) startRef.current = timestamp
            const elapsed = timestamp - startRef.current
            const progress = Math.min(elapsed / duration, 1)
            const current = Math.round(easeOut(progress) * value)
            setDisplay(current)

            if (progress < 1) {
              rafRef.current = requestAnimationFrame(animate)
            } else {
              setDisplay(value)
            }
          }

          rafRef.current = requestAnimationFrame(animate)
        }
      },
      { threshold: 0.3 }
    )

    if (containerRef.current) observer.observe(containerRef.current)

    return () => {
      observer.disconnect()
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [value, duration])

  return (
    <span ref={containerRef} className={className}>
      {prefix}{display.toLocaleString('fr-FR')}{suffix}
    </span>
  )
}
