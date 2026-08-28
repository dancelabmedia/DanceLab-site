'use client'

/**
 * MagHeroSlider — Slider éditorial du hero Magazine
 *
 * • Sélectionne 5 articles aléatoires côté client à chaque chargement
 * • Avance automatiquement toutes les ~1,7 s avec un slide droite → gauche
 * • Chaque image est cliquable vers son article
 * • Les indicateurs (traits) sont cliquables pour navigation manuelle
 * • Navigation manuelle : réinitialise le timer automatique
 * • Précharge l'image suivante avant la transition
 * • Respecte prefers-reduced-motion (cross-fade à la place du slide)
 * • Se met en pause au survol pour le confort de lecture
 * • Expose goTo via ref (forwardRef) pour permettre au parent de naviguer
 * • Notifie le parent des slides initialisés (onSlidesReady) et du slide courant (onCurrentChange)
 */

import Link from 'next/link'
import { useState, useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react'
import PhotoCredit from '@/components/PhotoCredit'

export interface SlideArticle {
  slug: string
  title: string
  image: string
  imageCredit?: string
}

/** Handle exposé au parent via ref */
export interface MagHeroSliderHandle {
  goTo: (index: number) => void
}

interface Props {
  articles: SlideArticle[]
  /** Appelé une fois quand les slides sont sélectionnés côté client */
  onSlidesReady?: (slides: SlideArticle[]) => void
  /** Appelé à chaque changement de slide avec l'index courant */
  onCurrentChange?: (index: number) => void
}

// ── Constantes ──────────────────────────────────────────────────────────────

const SLIDE_COUNT = 5      // articles sélectionnés par session
const INTERVAL_MS = 3700   // durée entre deux slides (ms)

// ── Helpers ─────────────────────────────────────────────────────────────────

function shuffleAndPick<T>(arr: T[], n: number): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy.slice(0, Math.min(n, copy.length))
}

// ── Composant ────────────────────────────────────────────────────────────────

const MagHeroSlider = forwardRef<MagHeroSliderHandle, Props>(
  function MagHeroSlider({ articles, onSlidesReady, onCurrentChange }, ref) {
    const [slides, setSlides]   = useState<SlideArticle[]>([])
    const [current, setCurrent] = useState(0)
    const [prev, setPrev]       = useState(-1)
    const [paused, setPaused]   = useState(false)
    // Incrémenter pour forcer le reset du timer auto (ex : navigation manuelle)
    const [timerKey, setTimerKey] = useState(0)

    const pausedRef = useRef(false) // ref synchrone pour le callback d'interval

    // ── 1. Sélection aléatoire côté client (évite le mismatch SSR) ──────────
    useEffect(() => {
      const picked = shuffleAndPick(articles, SLIDE_COUNT)
      setSlides(picked)
      setCurrent(0)
      setPrev(-1)
      onSlidesReady?.(picked)
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    // ── 2. Notifier le parent du slide courant ───────────────────────────────
    useEffect(() => {
      onCurrentChange?.(current)
    }, [current]) // eslint-disable-line react-hooks/exhaustive-deps

    // ── 3. Préchargement de l'image suivante ─────────────────────────────────
    useEffect(() => {
      if (slides.length < 2) return
      const nextIdx = (current + 1) % slides.length
      const img = new window.Image()
      img.src = slides[nextIdx].image
    }, [current, slides])

    // ── 4. Avance automatique — redémarre quand timerKey change ──────────────
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
    }, [slides.length, timerKey]) // timerKey force le redémarrage après nav manuelle

    // ── 5. Navigation manuelle (clic sur un indicateur ou un titre) ──────────
    const goTo = useCallback((targetIndex: number) => {
      setCurrent(c => {
        if (targetIndex === c) return c  // déjà sur ce slide
        setPrev(c)
        return targetIndex
      })
      // Réinitialiser le timer pour repartir proprement depuis la nouvelle slide
      setTimerKey(k => k + 1)
    }, [])

    // ── Expose goTo via ref ──────────────────────────────────────────────────
    useImperativeHandle(ref, () => ({ goTo }), [goTo])

    // ── Pause au survol ───────────────────────────────────────────────────────
    const handleMouseEnter = useCallback(() => {
      pausedRef.current = true
      setPaused(true)
    }, [])
    const handleMouseLeave = useCallback(() => {
      pausedRef.current = false
      setPaused(false)
    }, [])

    // ── Rendu ─────────────────────────────────────────────────────────────────
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
            <Link
              key={slide.slug}
              href={`/decouvrir/articles/${slide.slug}`}
              className={cls}
              tabIndex={-1}
              aria-hidden={true}
            >
              <img
                src={slide.image}
                alt=""
                className="mag-slide-img"
                draggable={false}
              />
              <PhotoCredit credit={slide.imageCredit} />
            </Link>
          )
        })}

        {/* ── Titre de l'article actif ──
             key={current} → React remonte le div à chaque changement de slide
             → l'animation CSS mag-title-in se rejoue, garantissant la sync contenu/image */}
        {slides.length > 0 && (
          <div className="mag-slide-caption" key={current} aria-hidden="true">
            <span className="mag-slide-title">{slides[current].title}</span>
          </div>
        )}

        {/* ── Indicateurs cliquables ── */}
        <div className="mag-slider-dots">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              className={`mag-slider-dot${i === current ? ' mag-slider-dot--active' : ''}`}
              onClick={(e) => {
                e.stopPropagation()  // empêche tout click parasite sur le Link parent
                goTo(i)
              }}
              aria-label={`Aller à la couverture ${i + 1}`}
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
)

export default MagHeroSlider
