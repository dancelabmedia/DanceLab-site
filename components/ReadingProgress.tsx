'use client'

/**
 * ReadingProgress — Barre de progression de lecture
 *
 * • Position fixed, top: 0, z-index: 901 (au-dessus du header à 900)
 * • Calcule la progression depuis le début jusqu'à la fin de [data-article-content]
 * • Sections hors contenu éditorial (footer, recommandations…) exclues du calcul
 * • Mise à jour via requestAnimationFrame — aucun re-render React, aucun state
 * • ResizeObserver pour recalculer quand les images chargent et décalent la mise en page
 * • Listeners nettoyés au démontage
 *
 * Formule de progression :
 *   scrolled  = scrollY - absTopOfContent
 *   scrollable = contentHeight - viewportHeight
 *   progress  = clamp(0, scrolled / scrollable, 1)   → 0 % → 100 %
 */

import { useEffect, useRef } from 'react'

export default function ReadingProgress() {
  const barRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const bar = barRef.current
    if (!bar) return

    // ── Calcul de progression ────────────────────────────────────────────
    const update = () => {
      const content = document.querySelector<HTMLElement>('[data-article-content]')

      if (!content) {
        bar.style.transform = 'scaleX(0)'
        return
      }

      const rect       = content.getBoundingClientRect()
      const absTop     = rect.top + window.scrollY
      const absBottom  = absTop + rect.height
      const vh         = window.innerHeight

      const scrolled   = window.scrollY - absTop
      const scrollable = rect.height - vh

      let progress: number

      if (scrollable <= 0) {
        // Contenu plus court que la fenêtre : 100 % dès que la fin est visible
        progress = window.scrollY + vh >= absBottom ? 1 : 0
      } else {
        progress = Math.min(1, Math.max(0, scrolled / scrollable))
      }

      bar.style.transform = `scaleX(${progress})`
    }

    // ── Scroll handler via RAF (une frame maxi par scroll) ───────────────
    const onScroll = () => {
      if (rafRef.current !== null) return
      rafRef.current = requestAnimationFrame(() => {
        update()
        rafRef.current = null
      })
    }

    // ── Recalcul quand la mise en page change (images qui chargent, etc.) ─
    const onResize = () => {
      if (rafRef.current !== null) return
      rafRef.current = requestAnimationFrame(() => {
        update()
        rafRef.current = null
      })
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize, { passive: true })

    // Premier calcul : immédiat pour restaurer la position en cas de rechargement,
    // puis re-vérification après 400 ms quand les images ont fini de charger
    update()
    const timer = window.setTimeout(update, 400)

    // ResizeObserver sur le contenu : recalcule quand la hauteur change
    let ro: ResizeObserver | null = null
    const content = document.querySelector<HTMLElement>('[data-article-content]')
    if (content && typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => {
        if (rafRef.current !== null) return
        rafRef.current = requestAnimationFrame(() => {
          update()
          rafRef.current = null
        })
      })
      ro.observe(content)
    }

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      window.clearTimeout(timer)
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
      ro?.disconnect()
    }
  }, [])

  return (
    <div className="reading-progress-track" aria-hidden="true" role="none">
      <div ref={barRef} className="reading-progress-bar" />
    </div>
  )
}
