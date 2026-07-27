'use client'

import { useEffect, useRef, type ReactNode } from 'react'

/**
 * MissionReveal
 * Wrapper des cartes mission. Déclenche une animation séquentielle
 * (fade-in + translation verticale) lorsque la section entre dans le viewport.
 * Rend un <div className="about-mission-cards"> — remplace le div statique.
 */
export default function MissionReveal({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = ref.current
    if (!container) return

    const cards = Array.from(
      container.querySelectorAll<HTMLElement>('.mission-card')
    )

    // État initial : cartes cachées avant l'animation
    cards.forEach((card) => {
      card.style.opacity = '0'
      card.style.transform = 'translateY(26px)'
    })

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return

        // Déclenchement séquentiel avec un délai de 180 ms entre chaque carte
        cards.forEach((card, i) => {
          setTimeout(() => {
            // Transition fluide ease-out — 600 ms
            card.style.transition =
              'opacity 600ms ease-out, transform 600ms ease-out'
            card.style.opacity = '1'
            card.style.transform = 'translateY(0)'

            // Une fois la transition terminée, on nettoie les styles inline
            // afin que le hover CSS (translateY(-7px)) puisse s'appliquer librement
            setTimeout(() => {
              card.style.transition = ''
              card.style.transform = ''
              card.style.opacity = ''
            }, 620)
          }, i * 180)
        })

        observer.disconnect()
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -48px 0px',
      }
    )

    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className="about-mission-cards">
      {children}
    </div>
  )
}
