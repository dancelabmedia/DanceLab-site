'use client'

/**
 * ArticleHeroSlider — Slider de couvertures dans le hero d'un article
 *
 * Réutilise exactement les mêmes classes CSS et animations que MagHeroSlider :
 *   .mag-slider / .mag-slide / .mag-slide--active / .mag-slide--prev
 *   .mag-slider-dots / .mag-slider-dot / .mag-slider-progress
 *
 * Différences par rapport au slider Magazine :
 * • Ordre fixe (pas de shuffle) — les slides correspondent aux sections de l'article
 * • Cliquer sur une image fait défiler jusqu'à la section correspondante
 * • Cliquer sur un indicateur navigue vers le slide correspondant
 * • Boucle infinie, avance automatique toutes les ~2,8 s
 * • Pause au survol
 * • Précharge l'image suivante
 * • Respecte prefers-reduced-motion
 */

import { useState, useEffect, useRef, useCallback } from 'react'

export interface ArticleSlide {
  thumbnail: string   // URL de la miniature
  heading: string     // Titre de la section (pour aria-label)
  sectionId: string   // id HTML de la section cible pour le scroll
}

interface Props {
  slides: ArticleSlide[]
}

const INTERVAL_MS = 2800

export default function ArticleHeroSlider({ slides }: Props) {
  const [current, setCurrent] = useState(0)
  const [prev, setPrev]       = useState(-1)
  const [paused, setPaused]   = useState(false)
  const [timerKey, setTimerKey] = useState(0)

  const pausedRef = useRef(false)

  // ── 1. Préchargement de l'image suivante ─────────────────────────────────
  useEffect(() => {
    if (slides.length < 2) return
    const nextIdx = (current + 1) % slides.length
    const img = new window.Image()
    img.src = slides[nextIdx].thumbnail
  }, [current, slides])

  // ── 2. Avance automatique — redémarre quand timerKey change ──────────────
  useEffect(() => {
    if (slides.length < 2) return
    const id = setInterval(() => {
      if (pausedRef.current) return
      setCurrent(c => {
        const next = (c + 1) % slides.length
        setPrev(c)
        return next
      })
    }, INTERVAL_MS)
    return () => clearInterval(id)
  }, [slides.length, timerKey])

  // ── 3. Navigation manuelle (indicateurs) ─────────────────────────────────
  const goTo = useCallback((targetIndex: number) => {
    setCurrent(c => {
      if (targetIndex === c) return c
      setPrev(c)
      return targetIndex
    })
    setTimerKey(k => k + 1)
  }, [])

  // ── 4. Clic sur l'image → scroll vers la section ─────────────────────────
  const handleImageClick = useCallback((sectionId: string) => {
    const el = document.getElementById(sectionId)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [])

  // ── Pause au survol ───────────────────────────────────────────────────────
  const handleMouseEnter = useCallback(() => {
    pausedRef.current = true
    setPaused(true)
  }, [])
  const handleMouseLeave = useCallback(() => {
    pausedRef.current = false
    setPaused(false)
  }, [])

  if (slides.length === 0) return null

  return (
    <div
      className="mag-slider"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      aria-hidden="true"
    >
      {/* ── Slides ── */}
      {slides.map((slide, i) => {
        const isActive = i === current
        const isPrev   = i === prev

        let cls = 'mag-slide'
        if (isActive) cls += ' mag-slide--active'
        else if (isPrev) cls += ' mag-slide--prev'

        return (
          <div
            key={slide.sectionId}
            className={cls}
            onClick={() => handleImageClick(slide.sectionId)}
            style={{ cursor: 'pointer' }}
          >
            <img
              src={slide.thumbnail}
              alt=""
              className="mag-slide-img"
              draggable={false}
            />
          </div>
        )
      })}

      {/* ── Indicateurs cliquables ── */}
      <div className="mag-slider-dots">
        {slides.map((slide, i) => (
          <button
            key={i}
            type="button"
            className={`mag-slider-dot${i === current ? ' mag-slider-dot--active' : ''}`}
            onClick={(e) => {
              e.stopPropagation()
              goTo(i)
            }}
            aria-label={`Aller au documentaire ${i + 1}`}
          />
        ))}
      </div>

      {/* ── Barre de progression ── */}
      <div
        className={`mag-slider-progress${paused ? ' mag-slider-progress--paused' : ''}`}
        aria-hidden="true"
        key={`progress-${current}-${timerKey}`}
        style={{ '--slider-duration': `${INTERVAL_MS}ms` } as React.CSSProperties}
      />
    </div>
  )
}
