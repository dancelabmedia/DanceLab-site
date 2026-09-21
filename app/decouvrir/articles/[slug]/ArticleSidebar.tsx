'use client'

/**
 * ArticleSidebar
 * ─────────────────────────────────────────────────────────────────────────────
 * Colonne éditoriale dynamique — compagnon de lecture de l'article.
 *
 * Comportement desktop :
 *   Position sticky (top: 96px).
 *
 *   Détection de la progression de lecture :
 *   Le scroll est mesuré par rapport à la zone [data-article-content]
 *   (et non à la hauteur totale de la page). Le hero, les commentaires,
 *   le footer, etc. sont exclus du calcul.
 *
 *   Distribution des frames :
 *   - frame[0]   → bloc épisodes, affiché tant que le lecteur est en haut
 *                  (avant d'avoir significativement scrollé dans le contenu)
 *   - frame[1..N] → citations des épisodes, réparties à égalité sur la
 *                  progression restante dans la zone de contenu
 *
 *   Exemple avec 4 citations :
 *     0 %–25 %  du contenu → citation 1 (Yasmine Habib)
 *     25 %–50 % du contenu → citation 2 (Tatiana Seguin)
 *     50 %–75 % du contenu → citation 3 (Julien Ramade)
 *     75 %–100 %           → citation 4 (Rose Otentick)
 *
 *   Transition : fondu de 120 ms (opacity + légère dérive verticale).
 *   prefers-reduced-motion : transition instantanée.
 *
 * Mobile (≤ 980px) :
 *   Ce composant est masqué via CSS.
 *   Les frames sont rendus statiquement entre les sections dans page.tsx.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import type { SidebarFrame } from '@/lib/article-sidebar'

interface Props {
  frames: SidebarFrame[]
}

export default function ArticleSidebar({ frames }: Props) {
  const [displayIndex, setDisplayIndex]   = useState(0)
  const [isFading, setIsFading]           = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)

  const pendingIndexRef = useRef(0)
  const fadeTimerRef    = useRef<ReturnType<typeof setTimeout> | null>(null)

  const FADE_MS = 120
  // Pixels de contenu scrollés avant de basculer du bloc "épisodes" vers les citations
  const EPISODES_HOLD_PX = 60

  // ── Détection prefers-reduced-motion ─────────────────────────────────────
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)
  }, [])

  // ── Scroll listener — progression dans le contenu de l'article ───────────
  useEffect(() => {
    if (!frames || frames.length === 0) return

    const quoteFrameCount = frames.length - 1 // frames[0] = épisodes, reste = citations

    const update = () => {
      const contentEl = document.querySelector<HTMLElement>('[data-article-content]')
      if (!contentEl) return

      const rect = contentEl.getBoundingClientRect()

      // Pixels de contenu article qui ont défilé au-dessus du haut du viewport.
      // 0 = haut du contenu encore visible ; positif = du contenu a disparu vers le haut.
      const consumed = Math.max(0, -rect.top)
      const contentH = contentEl.offsetHeight

      let target = 0

      if (consumed > EPISODES_HOLD_PX && quoteFrameCount > 0) {
        // Progression normalisée [0, 1] sur la hauteur totale du contenu.
        // On commence à compter après EPISODES_HOLD_PX pour que les épisodes
        // restent visibles quelques instants au début du scroll.
        const progress    = Math.min(1, consumed / contentH)
        const quoteIdx    = Math.min(
          Math.floor(progress * quoteFrameCount),
          quoteFrameCount - 1
        )
        target = quoteIdx + 1
      }

      if (target === pendingIndexRef.current) return
      pendingIndexRef.current = target

      if (reducedMotion) {
        setDisplayIndex(target)
        return
      }

      // Fondu : fade-out → met à jour avec le dernier pending → fade-in.
      // clearTimeout annule une transition en cours si le scroll est rapide.
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
        requestAnimationFrame(() => { update(); ticking = false })
        ticking = true
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    update() // passe initial

    return () => {
      window.removeEventListener('scroll', onScroll)
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current)
    }
  }, [reducedMotion, frames])

  // ── Rendu ─────────────────────────────────────────────────────────────────
  if (!frames || frames.length === 0) return null

  const frame = frames[displayIndex] ?? frames[0]

  return (
    <div className="asb" aria-label="Lecture complémentaire" role="complementary">
      <div
        className={`asb-frame${isFading ? ' asb-frame--out' : ''}`}
        aria-live="polite"
        aria-atomic="true"
      >
        <SidebarFrameContent frame={frame} />
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────────────────────
   SidebarFrameContent
   Rendu pur d'un frame — aucun hook, utilisable en contexte serveur (mobile slots).
   ────────────────────────────────────────────────────────────────────────────── */
export function SidebarFrameContent({ frame }: { frame: SidebarFrame }) {
  return (
    <div className="asb-content">

      {/* ── Épisodes ──────────────────────────────────────────────────── */}
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
                  <img src={ep.image} alt="" loading="lazy" width={72} height={72} />
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

      {/* ── Citation ──────────────────────────────────────────────────── */}
      {frame.quote && (
        <blockquote className="asb-quote">
          <p>{frame.quote}</p>
          {frame.quoteAuthor && (
            <footer className="asb-quote-author">
              {frame.quoteAuthor}
            </footer>
          )}
        </blockquote>
      )}

      {/* ── Notion / idée clé ─────────────────────────────────────────── */}
      {frame.notion && (
        <div className="asb-notion">
          <span className="asb-label">{frame.notion.label}</span>
          <p className="asb-notion-text">{frame.notion.content}</p>
        </div>
      )}

    </div>
  )
}
