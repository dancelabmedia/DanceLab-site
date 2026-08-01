'use client'

/**
 * IvwCarousel — carrousel "Interviews" à boucle infinie
 *
 * Technique des 3 jeux ("infinite clone trick") :
 *   [clones gauche = tout le pool]
 *   [jeu réel      = tout le pool]   ← scrollLeft initial pointe ici
 *   [clones droite = tout le pool]
 *
 * Quand scrollLeft glisse en zone clone, on téléporte silencieusement
 * (sans animation) vers la position équivalente dans le jeu réel.
 * La pré-téléportation (avant le smooth-scroll) évite qu'une animation
 * traverse la frontière clone/réel et provoque un flash.
 *
 * Mélange :
 *   - état initial vide (SSR) → pas de mismatch d'hydratation
 *   - useEffect after hydration : filtre + mélange → setEpisodes
 *   - l'ordre est figé jusqu'à la prochaine actualisation
 */

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { type Episode } from '../../data/episodes'

/* ── Constantes ──────────────────────────────────────────────────── */
const VISIBLE        = 3    // cartes simultanément visibles
const MIN_INFINITE   = 4    // nb minimum d'épisodes pour activer la boucle
const ROTATION_SIZE  = 18   // sélection aléatoire par chargement (54 cartes avec clones)
const LOCK_DURATION  = 460  // ms pendant lesquelles les flèches sont verrouillées
const AUTOPLAY_SPEED = 20   // px/s — lent, mais perceptible sur tous les écrans

/* ── Helpers ─────────────────────────────────────────────────────── */
const IconArrowL = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"
    strokeLinejoin="round" aria-hidden="true">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
)
const IconArrowR = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"
    strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
)

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function isMultiGuestEpisode(ep: Episode): boolean {
  return /\s&\s|,|\/|\b(?:et|avec|twins?)\b/i.test(ep.guest)
}

function getMultiGuestImage(ep: Episode): string | null {
  if (!isMultiGuestEpisode(ep)) return null

  const filename = (ep.image !== '/logo.png' ? ep.image : ep.sourceImage)
    .split('/')
    .pop()
    ?.replace(/\.png\.png$/i, '.png')

  return filename ? `/images/les-invites-header/${filename}` : null
}

/* ── Types ───────────────────────────────────────────────────────── */
interface Props {
  /** Tous les épisodes éligibles (non filtrés, non mélangés) */
  pool: Episode[]
  /** Slug du dernier épisode — exclu de la sélection */
  latestSlug: string
  /** Fonction de page.tsx pour obtenir l'image optimisée d'un invité */
  getGuestImage: (ep: Episode) => string
}

/* ── Composant ───────────────────────────────────────────────────── */
export default function IvwCarousel({ pool, latestSlug, getGuestImage }: Props) {
  const wrapRef  = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const lockRef  = useRef(false)   // verrouillage flèches pendant transition
  const jumpRef  = useRef(false)   // marque les téléportations internes
  const setWidthRef = useRef(0)
  const pauseReasonsRef = useRef(new Set<string>(['offscreen']))
  const autoplaySpeedRef = useRef(0)
  const autoplayPositionRef = useRef(0)
  const autoplayWasMovingRef = useRef(false)
  const dragStartScrollRef = useRef(0)
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  /* État vide au SSR → hydratation propre, sans mismatch */
  const [episodes, setEpisodes] = useState<Episode[]>([])

  const setAutoplayPaused = (reason: string, paused: boolean) => {
    if (paused) {
      pauseReasonsRef.current.add(reason)
      autoplaySpeedRef.current = 0
      autoplayWasMovingRef.current = false
    } else {
      pauseReasonsRef.current.delete(reason)
    }
  }

  const pauseAfterManualInteraction = (delay = 1100) => {
    setAutoplayPaused('manual', true)
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current)
    resumeTimerRef.current = setTimeout(() => {
      setAutoplayPaused('manual', false)
      resumeTimerRef.current = null
    }, delay)
  }

  /* ── Mélange après hydratation ──────────────────────────────────── */
  useEffect(() => {
    const eligible = pool.filter(ep => ep.slug !== latestSlug)
    /* Trois copies sont nécessaires à la boucle infinie. Limiter la rotation
       évite de monter plusieurs centaines de cartes et d'images hors écran. */
    setEpisodes(shuffleArray(eligible).slice(0, ROTATION_SIZE))
  }, [pool, latestSlug])

  /* ── Positionnement initial : scrollLeft → début du jeu réel ────── */
  useEffect(() => {
    if (episodes.length < MIN_INFINITE) return
    const track = trackRef.current
    if (!track) return

    /* Attendre que le layout soit calculé (cartes dans le DOM) */
    const rAF = requestAnimationFrame(() => {
      const card = track.querySelector<HTMLElement>('.les-ivw-card')
      if (!card) return
      const gap = parseFloat(getComputedStyle(track).columnGap || '18')
      setWidthRef.current = episodes.length * (card.offsetWidth + gap)
      /* Jeu réel = set du milieu (index 1) → commence après N cartes */
      track.scrollLeft = setWidthRef.current
      autoplayPositionRef.current = track.scrollLeft
    })
    return () => cancelAnimationFrame(rAF)
  }, [episodes])

  /* ── Autoplay lent, continu et limité à la zone visible ─────────── */
  useEffect(() => {
    const wrap = wrapRef.current
    const track = trackRef.current
    if (!wrap || !track || episodes.length < MIN_INFINITE) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const syncReducedMotion = () => {
      setAutoplayPaused('reduced-motion', reducedMotion.matches)
    }
    syncReducedMotion()
    reducedMotion.addEventListener('change', syncReducedMotion)

    const observer = new IntersectionObserver(
      entries => {
        setAutoplayPaused('offscreen', !entries[0]?.isIntersecting)
      },
      { threshold: 0.15, rootMargin: '0px 0px 8% 0px' }
    )
    observer.observe(wrap)

    const onVisibilityChange = () => {
      setAutoplayPaused('hidden', document.hidden)
    }
    document.addEventListener('visibilitychange', onVisibilityChange)
    onVisibilityChange()

    let animationFrame = 0
    let previousTime = performance.now()
    const animate = (time: number) => {
      const elapsed = Math.min(time - previousTime, 40)
      previousTime = time
      const canMove = pauseReasonsRef.current.size === 0
      const targetSpeed = canMove ? AUTOPLAY_SPEED : 0

      if (canMove) {
        if (!autoplayWasMovingRef.current) {
          autoplayPositionRef.current = track.scrollLeft
          autoplayWasMovingRef.current = true
        }
        const ramp = Math.min(1, elapsed / 900)
        autoplaySpeedRef.current +=
          (targetSpeed - autoplaySpeedRef.current) * ramp
      } else {
        autoplaySpeedRef.current = 0
        autoplayWasMovingRef.current = false
        autoplayPositionRef.current = track.scrollLeft
      }

      if (autoplaySpeedRef.current > 0.01) {
        /* Position absolue subpixel : une mise à jour à chaque frame, sans
           attendre le pixel entier et sans accumulation d'erreur. */
        autoplayPositionRef.current += autoplaySpeedRef.current * (elapsed / 1000)
        track.scrollLeft = autoplayPositionRef.current
      }
      animationFrame = requestAnimationFrame(animate)
    }
    animationFrame = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationFrame)
      observer.disconnect()
      reducedMotion.removeEventListener('change', syncReducedMotion)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [episodes])

  /* ── Hover, drag souris/tactile et trackpad ─────────────────────── */
  useEffect(() => {
    const track = trackRef.current
    if (!track || episodes.length === 0) return

    let pointerId: number | null = null
    let startX = 0
    let startY = 0
    let horizontalDrag = false
    let draggedRecently = false

    const onPointerOver = (event: PointerEvent) => {
      const card = (event.target as Element).closest('.les-ivw-card')
      if (card) setAutoplayPaused('hover', true)
    }
    const onPointerOut = (event: PointerEvent) => {
      const nextCard = (event.relatedTarget as Element | null)?.closest?.('.les-ivw-card')
      if (!nextCard) setAutoplayPaused('hover', false)
    }
    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return
      pointerId = event.pointerId
      startX = event.clientX
      startY = event.clientY
      dragStartScrollRef.current = track.scrollLeft
      horizontalDrag = false
      setAutoplayPaused('drag', true)
    }
    const onPointerMove = (event: PointerEvent) => {
      if (pointerId !== event.pointerId) return
      const deltaX = event.clientX - startX
      const deltaY = event.clientY - startY

      if (!horizontalDrag && Math.abs(deltaY) > Math.abs(deltaX) + 5) {
        pointerId = null
        setAutoplayPaused('drag', false)
        pauseAfterManualInteraction(700)
        return
      }
      if (!horizontalDrag && Math.abs(deltaX) > 5) {
        horizontalDrag = true
        draggedRecently = true
        track.setPointerCapture(event.pointerId)
      }
      if (!horizontalDrag) return

      event.preventDefault()
      track.scrollLeft = dragStartScrollRef.current - deltaX * 1.15
    }
    const finishDrag = (event: PointerEvent) => {
      if (pointerId !== event.pointerId) return
      if (track.hasPointerCapture(event.pointerId)) {
        track.releasePointerCapture(event.pointerId)
      }
      pointerId = null
      setAutoplayPaused('drag', false)
      pauseAfterManualInteraction(horizontalDrag ? 1200 : 500)
      horizontalDrag = false
    }
    const onClick = (event: MouseEvent) => {
      if (!draggedRecently) return
      event.preventDefault()
      event.stopPropagation()
      draggedRecently = false
    }
    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaX) > 0.5 || event.shiftKey) {
        pauseAfterManualInteraction(900)
      }
    }

    track.addEventListener('pointerover', onPointerOver)
    track.addEventListener('pointerout', onPointerOut)
    track.addEventListener('pointerdown', onPointerDown)
    track.addEventListener('pointermove', onPointerMove, { passive: false })
    track.addEventListener('pointerup', finishDrag)
    track.addEventListener('pointercancel', finishDrag)
    track.addEventListener('click', onClick, true)
    track.addEventListener('wheel', onWheel, { passive: true })

    return () => {
      track.removeEventListener('pointerover', onPointerOver)
      track.removeEventListener('pointerout', onPointerOut)
      track.removeEventListener('pointerdown', onPointerDown)
      track.removeEventListener('pointermove', onPointerMove)
      track.removeEventListener('pointerup', finishDrag)
      track.removeEventListener('pointercancel', finishDrag)
      track.removeEventListener('click', onClick, true)
      track.removeEventListener('wheel', onWheel)
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current)
    }
  }, [episodes])

  /* ── Boucle infinie : téléportation silencieuse ─────────────────── */
  useEffect(() => {
    if (episodes.length < MIN_INFINITE) return
    const track = trackRef.current
    if (!track) return

    const updateSetWidth = () => {
      const card = track.querySelector<HTMLElement>('.les-ivw-card')
      if (!card) return
      const gap = parseFloat(getComputedStyle(track).columnGap || '18')
      setWidthRef.current = episodes.length * (card.offsetWidth + gap)
    }
    updateSetWidth()

    const resizeObserver = new ResizeObserver(updateSetWidth)
    resizeObserver.observe(track)

    const handleScroll = () => {
      if (jumpRef.current) return
      const sw = setWidthRef.current
      if (sw === 0) return

      if (track.scrollLeft < sw * 0.5) {
        jumpRef.current = true
        track.scrollLeft += sw
        autoplayPositionRef.current = track.scrollLeft
        dragStartScrollRef.current += sw
        jumpRef.current = false
      } else if (track.scrollLeft > sw * 1.5) {
        jumpRef.current = true
        track.scrollLeft -= sw
        autoplayPositionRef.current = track.scrollLeft
        dragStartScrollRef.current -= sw
        jumpRef.current = false
      }
    }

    track.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      resizeObserver.disconnect()
      track.removeEventListener('scroll', handleScroll)
    }
  }, [episodes])

  /* ── Navigation ─────────────────────────────────────────────────── */
  const navigate = (dir: 1 | -1) => {
    if (lockRef.current) return
    const track = trackRef.current
    if (!track || episodes.length === 0) return

    const card = track.querySelector<HTMLElement>('.les-ivw-card')
    if (!card) return

    const gap  = parseFloat(getComputedStyle(track).columnGap || '18')
    const step = card.offsetWidth + gap
    const sw   = episodes.length * step
    const tgt  = track.scrollLeft + dir * step

    /* Pré-téléportation : évite que le smooth-scroll traverse la frontière */
    if (episodes.length >= MIN_INFINITE) {
      if (dir === -1 && tgt < sw * 0.5) {
        jumpRef.current = true
        track.scrollLeft += sw
        jumpRef.current = false
      } else if (dir === 1 && tgt > sw * 1.5) {
        jumpRef.current = true
        track.scrollLeft -= sw
        jumpRef.current = false
      }
    }

    lockRef.current = true
    pauseAfterManualInteraction(LOCK_DURATION + 900)
    track.scrollBy({ left: dir * step, behavior: 'smooth' })
    setTimeout(() => { lockRef.current = false }, LOCK_DURATION)
  }

  /* ── Rendu ───────────────────────────────────────────────────────── */
  const infinite  = episodes.length >= MIN_INFINITE
  const renderSets = infinite ? [0, 1, 2] : [1]

  /* Avant l'hydratation : skeleton léger pour réserver la hauteur */
  if (episodes.length === 0) {
    return (
      <div className="les-ivw-wrap">
        <div className="les-ivw-track les-ivw-track--loading">
          {Array.from({ length: VISIBLE }).map((_, i) => (
            <div key={i} className="les-ivw-card les-ivw-card--skeleton" aria-hidden="true">
              <div className="les-ivw-img-wrap les-ivw-img-wrap--skeleton" />
              <div className="les-ivw-skel-line les-ivw-skel-line--name" />
              <div className="les-ivw-skel-line les-ivw-skel-line--meta" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="les-ivw-wrap" ref={wrapRef}>
      {/* Piste scrollable — pas de scroll-snap pour ne pas interférer
          avec la gestion manuelle du scrollLeft */}
      <div className="les-ivw-track" ref={trackRef}>
        {renderSets.flatMap(setIdx =>
          episodes.map(ep => {
            const isReal = setIdx === 1
            const isMultiGuest = isMultiGuestEpisode(ep)
            const dedicatedGroupImage = getMultiGuestImage(ep)
            const isJuristsEpisode = ep.guest.includes('Samuela Berdah')
            return (
              <Link
                key={`${setIdx}-${ep.slug}`}
                href={`/episodes/${ep.slug}`}
                className="les-ivw-card"
                data-multi-guest={isMultiGuest || undefined}
                data-jurists={isJuristsEpisode || undefined}
                aria-hidden={!isReal || undefined}
                tabIndex={!isReal ? -1 : undefined}
              >
                <div className="les-ivw-img-wrap">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={dedicatedGroupImage ?? getGuestImage(ep)}
                    alt={isReal ? `${ep.guest}, épisode ${ep.number}` : ''}
                    className="les-ivw-img"
                    draggable={false}
                    decoding="async"
                    loading={isReal ? 'lazy' : 'lazy'}
                    onError={e => {
                      const img = e.currentTarget as HTMLImageElement & { fb?: number }
                      const fallbackStep = img.fb ?? 0
                      if (fallbackStep === 0 && dedicatedGroupImage) {
                        img.fb = 1
                        img.src = getGuestImage(ep)
                      } else if (fallbackStep <= 1) {
                        img.fb = 2
                        img.src = ep.image !== '/logo.png' ? ep.image : ep.sourceImage
                      }
                    }}
                  />
                  {/* Overlay citation — visible au survol */}
                  {ep.quote && (
                    <div className="les-ivw-overlay" aria-hidden="true">
                      <p className="les-ivw-quote">&ldquo;{ep.quote}&rdquo;</p>
                      <span className="les-ivw-see">Voir l&apos;épisode →</span>
                    </div>
                  )}
                </div>
                <div className="les-ivw-copy">
                  <p className="les-ivw-name">{ep.guest}</p>
                  <p className="les-ivw-meta">
                    Ép.&nbsp;{ep.number}&nbsp;·&nbsp;{ep.duration}
                  </p>
                </div>
              </Link>
            )
          })
        )}
      </div>

      {/* Flèches */}
      <button
        className="les-ivw-arrow les-ivw-arrow--left"
        onClick={() => navigate(-1)}
        aria-label="Interviews précédentes"
      >
        <IconArrowL />
      </button>
      <button
        className="les-ivw-arrow les-ivw-arrow--right"
        onClick={() => navigate(1)}
        aria-label="Interviews suivantes"
      >
        <IconArrowR />
      </button>
    </div>
  )
}
