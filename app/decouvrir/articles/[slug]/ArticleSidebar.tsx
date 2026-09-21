'use client'

/**
 * ArticleSidebar
 * ─────────────────────────────────────────────────────────────────────────────
 * Colonne éditoriale dynamique — compagnon de lecture de l'article.
 *
 * Comportement desktop :
 *   - Positionnée en sticky (top: 96px, alignée sur le haut du premier paragraphe)
 *   - Détecte la section en cours de lecture via un scroll listener (rAF-throttlé)
 *   - Lorsque la section active change, le contenu s'estompe (200 ms) puis
 *     le nouveau contenu apparaît
 *   - prefers-reduced-motion : transitions désactivées
 *
 * Mobile (≤ 980px) :
 *   - Ce composant est masqué via CSS (display: none)
 *   - Les mêmes contenus sont rendus statiquement entre les sections
 *     dans page.tsx (.asb-mobile-slot, visible uniquement sur mobile)
 *
 * Contenu affiché (via SidebarFrame de lib/article-sidebar.ts) :
 *   - Épisodes Dance Lab liés à la section courante
 *   - Citation forte tirée de l'article
 *   - Notion clé / point à retenir
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import type { SidebarFrame } from '@/lib/article-sidebar'

interface Props {
  frames: (SidebarFrame | null)[]
}

export default function ArticleSidebar({ frames }: Props) {
  // displayIndex = index du frame actuellement rendu
  // activeIndex  = index détecté via scroll (peut différer pendant la transition)
  const [displayIndex, setDisplayIndex] = useState(0)
  const [isFading, setIsFading] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)

  const pendingIndexRef = useRef(0)
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Détection prefers-reduced-motion ──────────────────────────────────────
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)
  }, [])

  // ── Scroll listener — détection de la section active ─────────────────────
  useEffect(() => {
    const TRIGGER_Y_RATIO = 0.38 // la section est "active" quand son top < 38% de la hauteur viewport
    const FADE_MS = 200

    const getSections = () =>
      Array.from(
        document.querySelectorAll<HTMLElement>('[data-article-section]')
      )

    const update = () => {
      const sections = getSections()
      if (!sections.length) return

      const triggerY = window.innerHeight * TRIGGER_Y_RATIO
      let current = 0

      sections.forEach((el) => {
        const rect = el.getBoundingClientRect()
        if (rect.top <= triggerY) {
          const idx = parseInt(
            el.getAttribute('data-section-index') ?? '0',
            10
          )
          current = idx
        }
      })

      if (current === pendingIndexRef.current) return
      pendingIndexRef.current = current

      if (reducedMotion) {
        // Pas d'animation — mise à jour directe
        setDisplayIndex(current)
        return
      }

      // Fondu : fade-out → swap → fade-in
      setIsFading(true)
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current)
      fadeTimerRef.current = setTimeout(() => {
        setDisplayIndex(pendingIndexRef.current)
        setIsFading(false)
      }, FADE_MS)
    }

    let ticking = false
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          update()
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    // Passe initial (sans attendre le premier scroll)
    update()

    return () => {
      window.removeEventListener('scroll', onScroll)
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current)
    }
  }, [reducedMotion])

  // ── Rendu ─────────────────────────────────────────────────────────────────
  const frame = frames[displayIndex] ?? null

  return (
    <div
      className="asb"
      aria-label="Lecture complémentaire"
      role="complementary"
    >
      <div
        className={`asb-frame${isFading ? ' asb-frame--out' : ''}`}
        aria-live="polite"
        aria-atomic="true"
      >
        {frame && <SidebarFrameContent frame={frame} />}
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────────────────────
   SidebarFrameContent
   Rendu pur du contenu d'un frame — sans hooks, utilisable côté serveur aussi.
   ────────────────────────────────────────────────────────────────────────────── */
export function SidebarFrameContent({ frame }: { frame: SidebarFrame }) {
  return (
    <div className="asb-content">

      {/* ── Épisodes ────────────────────────────────────────────────── */}
      {frame.episodes && frame.episodes.length > 0 && (
        <div className="asb-episodes">
          <p className="asb-label">À écouter</p>
          <div className="asb-ep-list">
            {frame.episodes.map((ep) => (
              <Link
                key={ep.slug}
                href={`/episodes/${ep.slug}`}
                className="asb-ep"
                aria-label={`Écouter l'épisode ${ep.number} avec ${ep.name}`}
              >
                <div className="asb-ep-img" aria-hidden="true">
                  <img
                    src={ep.image}
                    alt=""
                    loading="lazy"
                    width={80}
                    height={80}
                  />
                </div>
                <div className="asb-ep-caption">
                  <span className="asb-ep-number">Ép. {ep.number}</span>
                  <strong className="asb-ep-name">{ep.name}</strong>
                </div>
                <svg
                  className="asb-ep-arrow"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  width="14"
                  height="14"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── Citation forte ──────────────────────────────────────────── */}
      {frame.quote && (
        <blockquote className="asb-quote">
          <p>{frame.quote}</p>
        </blockquote>
      )}

      {/* ── Notion / idée clé ───────────────────────────────────────── */}
      {frame.notion && (
        <div className="asb-notion">
          <span className="asb-label">{frame.notion.label}</span>
          <p className="asb-notion-text">{frame.notion.content}</p>
        </div>
      )}

    </div>
  )
}
