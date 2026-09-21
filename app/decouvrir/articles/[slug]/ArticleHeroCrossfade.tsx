'use client'

/**
 * ArticleHeroCrossfade
 * Remplace l'image fixe du hero par une rotation automatique
 * en fondu enchaîné (crossfade) entre plusieurs photos.
 *
 * Usage : déclenché quand l'article possède un champ `heroImages`
 * dans articles-data.ts (tableau de 2+ images).
 *
 * Technique :
 *   - Toutes les images sont empilées (position: absolute; inset: 0)
 *     et préchargées dans le DOM dès le montage.
 *   - L'image active passe à opacity: 1, les autres restent à opacity: 0.
 *   - La transition CSS (ease-in-out) garantit un fondu propre sans flash.
 *   - prefers-reduced-motion : l'animation est désactivée, seule la
 *     première image reste visible.
 */

import { useEffect, useRef, useState } from 'react'

// ─── Types ─────────────────────────────────────────────────────────────────────

export type HeroImage = {
  /** Chemin vers l'image (ex : "/images/les-invites-header/yasminehabib118.png") */
  src: string
  /** object-position CSS — défaut : "right center" pour les portraits */
  objectPosition?: string
}

interface Props {
  images: HeroImage[]
  /** Durée d'affichage de chaque image, en millisecondes (défaut : 2600) */
  interval?: number
  /** Durée du fondu enchaîné, en millisecondes (défaut : 900) */
  fadeDuration?: number
}

// ─── Composant ─────────────────────────────────────────────────────────────────

export default function ArticleHeroCrossfade({
  images,
  interval = 2600,
  fadeDuration = 900,
}: Props) {
  const [activeIndex, setActiveIndex] = useState(0)
  // Etat reducedMotion : false au SSR (pour éviter un mismatch d'hydratation),
  // mis à jour au montage côté client.
  const [reducedMotion, setReducedMotion] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    // ── Détection prefers-reduced-motion ───────────────────────────────────────
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)

    // Pas d'animation si l'utilisateur l'a désactivée ou si une seule image
    if (mq.matches || images.length <= 1) return

    // ── Lancement du cycle ─────────────────────────────────────────────────────
    timerRef.current = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % images.length)
    }, interval)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [images.length, interval])

  // ── Rendu statique (reduced-motion ou image unique) ────────────────────────
  if (reducedMotion || images.length <= 1) {
    const img = images[0]
    return (
      <img
        src={img.src}
        alt=""
        style={img.objectPosition ? { objectPosition: img.objectPosition } : undefined}
      />
    )
  }

  // ── Rendu crossfade ────────────────────────────────────────────────────────
  return (
    <div
      className="article-hero-crossfade"
      role="img"
      aria-hidden="true"
    >
      {images.map((img, i) => (
        <img
          key={img.src}
          src={img.src}
          alt=""
          className={[
            'article-hero-crossfade-slide',
            i === activeIndex ? 'article-hero-crossfade-slide--active' : '',
          ].join(' ').trim()}
          style={{
            objectPosition: img.objectPosition ?? 'right center',
            transitionDuration: `${fadeDuration}ms`,
          }}
        />
      ))}
    </div>
  )
}
