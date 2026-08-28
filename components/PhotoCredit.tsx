'use client'

/**
 * PhotoCredit — Crédit photographe sur image
 *
 * Usage : placer <PhotoCredit credit={article.imageCredit} /> à l'intérieur
 * de n'importe quel conteneur position:relative (ou absolute/fixed).
 *
 * • Desktop  : le crédit apparaît au survol du conteneur parent (mouseenter/leave)
 * • Mobile   : un petit bouton © permet d'afficher/masquer le crédit au tap
 * • Si credit est vide/undefined, le composant ne rend rien
 */

import { useState, useEffect, useRef } from 'react'

interface Props {
  credit?: string
}

export default function PhotoCredit({ credit }: Props) {
  const [hovered, setHovered]       = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Attache les écouteurs hover sur le conteneur parent (image wrapper)
  useEffect(() => {
    const parent = ref.current?.parentElement
    if (!parent) return

    const onEnter = () => setHovered(true)
    const onLeave = () => {
      setHovered(false)
      setMobileOpen(false)
    }

    parent.addEventListener('mouseenter', onEnter)
    parent.addEventListener('mouseleave', onLeave)
    return () => {
      parent.removeEventListener('mouseenter', onEnter)
      parent.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  if (!credit) return null

  const labelVisible = hovered || mobileOpen

  return (
    <div ref={ref} className="photo-credit" aria-hidden="true">
      {/* Texte du crédit — visible au hover (desktop) ou après tap (mobile) */}
      <span
        className={`photo-credit-label${labelVisible ? ' photo-credit-label--visible' : ''}`}
      >
        {credit}
      </span>

      {/* Bouton © — visible uniquement sur appareils tactiles */}
      <button
        className={`photo-credit-icon${mobileOpen ? ' photo-credit-icon--open' : ''}`}
        type="button"
        aria-label={`Crédit photo : ${credit}`}
        aria-expanded={mobileOpen}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setMobileOpen(o => !o)
        }}
      >
        ©
      </button>
    </div>
  )
}
