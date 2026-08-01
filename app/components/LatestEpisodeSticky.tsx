'use client'

/**
 * LatestEpisodeSticky — section "Dernier épisode + Interviews"
 *
 * La section reste sticky pendant le scroll.
 * Les éléments entrent dans la composition progressivement :
 *
 *   1. Fond sombre visible dès l'entrée dans la section
 *   2. Carte "Dernier épisode" (gauche) — translateY + scale + opacity [0 → 30%]
 *   3. Titre "Interviews" (droite)      — translateY + opacity          [25% → 44%]
 *   4. Carrousel interviews              — translateX + opacity          [40% → 60%]
 *   5. Cascade sur les 3 premières cartes visibles (130 ms de décalage)
 *
 * Hauteur section : 105 vh (≈ 5 vh de scroll sticky utile).
 * Mobile : sticky désactivé, tout visible, layout empilé verticalement.
 */

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { type Episode } from '../../data/episodes'
import IvwCarousel from './IvwCarousel'

/* ── Icônes SVG ───────────────────────────────────────────────────── */
const IconClock = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)
const IconArrow = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"
    strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
)

/* ── Helpers ──────────────────────────────────────────────────────── */
function formatDate(iso: string) {
  const [y, m, d] = iso.split('-')
  return `${d}.${m}.${y}`
}
function clamp(v: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, v))
}
/** Smoothstep : retourne 0 → 1 entre e0 et e1 */
function ss(e0: number, e1: number, x: number) {
  const t = clamp((x - e0) / (e1 - e0), 0, 1)
  return t * t * (3 - 2 * t)
}
function lerp(a: number, b: number, t: number) { return a + (b - a) * t }

/* ── Types ────────────────────────────────────────────────────────── */
interface Props {
  episode: Episode
  /** Image optimisée pour la carte épisode (gauche) */
  fallbackImage: string
  /** Pool complet d'épisodes éligibles — IvwCarousel gère le mélange */
  interviewPool: Episode[]
  /** Fonction de page.tsx pour l'image optimisée d'un invité */
  getGuestImage: (ep: Episode) => string
}

/* ── Composant ────────────────────────────────────────────────────── */
export default function LatestEpisodeSticky({
  episode,
  fallbackImage,
  interviewPool,
  getGuestImage,
}: Props) {
  const sectionRef   = useRef<HTMLDivElement>(null)
  const leftColRef   = useRef<HTMLDivElement>(null)
  const ivwHeaderRef = useRef<HTMLDivElement>(null)
  const ivwRevealRef = useRef<HTMLDivElement>(null)
  const seeAllRef    = useRef<HTMLAnchorElement>(null)
  const staggerDone  = useRef(false)

  /* ── Scroll handler ───────────────────────────────────────────────── */
  useEffect(() => {
    const section   = sectionRef.current
    const leftCol   = leftColRef.current
    const ivwHeader = ivwHeaderRef.current
    const ivwReveal = ivwRevealRef.current
    const seeAll    = seeAllRef.current
    if (!section || !leftCol || !ivwHeader || !ivwReveal || !seeAll) return

    const isMobile = window.innerWidth < 768

    if (isMobile) {
      /* Mobile : tout visible, aucune animation JS */
      leftCol.style.cssText  = 'opacity:1;transform:none'
      ivwHeader.style.cssText = 'opacity:1;transform:none'
      ivwReveal.style.cssText = 'opacity:1;transform:none;pointer-events:auto'
      seeAll.style.cssText = 'opacity:1;pointer-events:auto'
      return
    }

    /* ── will-change pour la couche de compositing ── */
    leftCol.style.willChange   = 'opacity, transform'
    ivwHeader.style.willChange = 'opacity, transform'
    ivwReveal.style.willChange = 'opacity, transform'

    function tick() {
      const rect    = section!.getBoundingClientRect()
      const vh      = window.innerHeight
      const sectionH = section!.offsetHeight    // 105vh (CSS)
      if (sectionH <= vh) return

      // ── Progression unifiée ─────────────────────────────────────────
      // Même formule que MediaReveal : couvre l'approche + le scroll sticky.
      //   p = 0   → section.bottom vient d'entrer dans le viewport
      //   p ≈ .45 → section.top touche le viewport.top (sticking commence)
      //   p = 1   → section entièrement scrollée
      //
      // L'avance contrôlée rapproche les épisodes de la sortie de MediaReveal ;
      // les seuils conservent une entrée progressive sous l'encart Sortir.
      const p = clamp((vh - rect.top) / sectionH, 0, 1)

      /* ① Carte Dernier épisode — léger temps de respiration après MediaReveal. */
      const lp = ss(0.05, 0.22, p)
      leftCol!.style.opacity   = lp.toFixed(3)
      leftCol!.style.transform =
        `translateY(${lerp(44, 0, lp).toFixed(1)}px) scale(${lerp(0.97, 1, lp).toFixed(3)})`

      /* ② Titre Interviews — suit presque immédiatement la carte gauche. */
      const hp = ss(0.08, 0.22, p)
      ivwHeader!.style.opacity   = hp.toFixed(3)
      ivwHeader!.style.transform = `translateY(${lerp(20, 0, hp).toFixed(1)}px)`

      /* ③ Cartes du carrousel — entrent ensuite depuis la droite. */
      const cp = ss(0.16, 0.32, p)
      ivwReveal!.style.opacity       = cp.toFixed(3)
      ivwReveal!.style.transform     = `translateX(${lerp(28, 0, cp).toFixed(1)}px)`
      ivwReveal!.style.pointerEvents = cp > 0.35 ? 'auto' : 'none'

      /* ④ Contrôles — lien et flèches terminent la séquence. */
      const controlsP = ss(0.28, 0.38, p)
      seeAll!.style.opacity = controlsP.toFixed(3)
      seeAll!.style.pointerEvents = controlsP > 0.5 ? 'auto' : 'none'
      ivwReveal!.style.setProperty('--les-controls-opacity', controlsP.toFixed(3))

      /* Cascade sur les 3 premières cartes réelles — déclenchée une seule fois */
      if (!staggerDone.current && cp > 0.55) {
        staggerDone.current = true
        const realCards = Array.from(
          ivwReveal!.querySelectorAll<HTMLElement>('.les-ivw-card:not([aria-hidden="true"])')
        ).slice(0, 3)

        realCards.forEach((card, i) => {
          /* Démarre depuis un état légèrement en bas */
          card.style.opacity   = '0'
          card.style.transform = 'translateY(16px)'
          /* Double-RAF : garantit que l'état initial est peint avant la transition */
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              card.style.transition =
                `opacity 650ms ${i * 130}ms cubic-bezier(0.22,1,0.36,1),` +
                `transform 650ms ${i * 130}ms cubic-bezier(0.22,1,0.36,1)`
              card.style.opacity   = '1'
              card.style.transform = 'none'
            })
          })
        })
      }
    }

    window.addEventListener('scroll', tick, { passive: true })
    tick()   // position initiale au montage
    return () => window.removeEventListener('scroll', tick)
  }, [])

  /* ── Rendu ────────────────────────────────────────────────────────── */
  return (
    <div ref={sectionRef} className="les-section" id="ecouter">
      <div className="les-sticky">

        {/* Fond sombre + composition — visible dès l'entrée dans la section */}
        <div className="les-scene-b">
          <div className="les-comp">

            {/* ════════════════════════════
                Colonne gauche — Dernier épisode
            ════════════════════════════ */}
            <div
              ref={leftColRef}
              className="les-comp-left"
              style={{ opacity: 0, willChange: 'opacity, transform' }}
            >
              <span className="les-comp-label">Dernier épisode</span>

              <Link
                href={`/episodes/${episode.slug}`}
                className="les-ep-card"
                aria-label={`Écouter l'épisode avec ${episode.guest}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={fallbackImage}
                  alt={`${episode.guest}, épisode ${episode.number}`}
                  className="les-ep-card-img"
                  onError={e => {
                    if (!(e.currentTarget as HTMLImageElement & { fb?: boolean }).fb) {
                      (e.currentTarget as HTMLImageElement & { fb?: boolean }).fb = true
                      e.currentTarget.src = episode.image
                    }
                  }}
                />

                {/* Badge + durée */}
                <div className="les-ep-card-top">
                  <span className="tag tag-accent">Nouveau</span>
                  <span className="les-ep-card-dur">
                    <IconClock />&nbsp;{episode.duration}
                  </span>
                </div>

                {/* Titre + invité */}
                <div className="les-ep-card-overlay">
                  <h3 className="les-ep-card-title">{episode.title}</h3>
                  <p className="les-ep-card-guest">
                    Avec <strong>{episode.guest}</strong>
                  </p>
                </div>
              </Link>

              {/* CTA sous la carte */}
              <Link href={`/episodes/${episode.slug}`} className="les-ep-card-cta">
                Écouter l&apos;épisode <IconArrow />
              </Link>
            </div>

            {/* ════════════════════════════
                Colonne droite — Interviews
            ════════════════════════════ */}
            <div className="les-comp-right">

              {/* En-tête : titre + lien "Voir toutes" */}
              <div
                ref={ivwHeaderRef}
                className="les-ivw-header"
                style={{ opacity: 0, willChange: 'opacity, transform' }}
              >
                <span className="les-comp-label">Interviews</span>
                <a
                  ref={seeAllRef}
                  href="/ecouter"
                  className="les-ivw-seeall"
                  style={{ opacity: 0, pointerEvents: 'none' }}
                >
                  Voir toutes les interviews →
                </a>
              </div>

              {/* Carrousel infini */}
              <div
                ref={ivwRevealRef}
                style={{ opacity: 0, pointerEvents: 'none', willChange: 'opacity, transform' }}
              >
                <IvwCarousel
                  pool={interviewPool}
                  latestSlug={episode.slug}
                  getGuestImage={getGuestImage}
                />
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
