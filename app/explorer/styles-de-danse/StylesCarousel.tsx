"use client"

import Link from "next/link"
import { useCallback, useEffect, useRef, useState } from "react"
import type { DanceStyleFamily } from "./styles-data"

/* ── Type minimal pour le carrousel — couvre fiches complètes et stubs ── */
type CarouselStyle = {
  slug: string
  name: string
  family: DanceStyleFamily
  aliases?: string[]
  summary?: string
  image?: string
  available?: boolean
}

/* ── Dégradés par famille (pour les styles sans photo) ─────────── */
const FAMILY_GRADIENTS: Record<string, string> = {
  "Danses urbaines":
    "linear-gradient(145deg, #050505 0%, #233033 45%, #425659 100%)",
  "Danses académiques":
    "linear-gradient(145deg, #233033 0%, #425659 50%, #5B7377 100%)",
  "Danses contemporaines et expérimentales":
    "linear-gradient(145deg, #425659 0%, #5B7377 50%, #233033 100%)",
  "Danses scéniques":
    "linear-gradient(145deg, #050505 0%, #233033 55%, #5B7377 100%)",
  "Danses sociales":
    "linear-gradient(145deg, #233033 0%, #5B7377 48%, #425659 100%)",
  "Danses traditionnelles":
    "linear-gradient(145deg, #425659 0%, #233033 55%, #050505 100%)",
  "Danses de club":
    "linear-gradient(145deg, #050505 0%, #425659 52%, #233033 100%)",
  "Danses issues des cultures afro-descendantes":
    "linear-gradient(145deg, #233033 0%, #425659 50%, #050505 100%)",
}

type Props = {
  styles: CarouselStyle[]
}

export default function StylesCarousel({ styles }: Props) {
  const trackRef = useRef<HTMLDivElement>(null)
  const drag = useRef({ active: false, moved: false, startX: 0, scrollLeft: 0 })
  const [showLeft, setShowLeft] = useState(false)
  const [showRight, setShowRight] = useState(true)

  /* ── Mise à jour de la visibilité des flèches ──────────────────── */
  const updateArrows = useCallback(() => {
    const t = trackRef.current
    if (!t) return
    setShowLeft(t.scrollLeft > 8)
    // Masquer la droite quand on atteint (presque) la fin
    setShowRight(t.scrollLeft + t.clientWidth < t.scrollWidth - 8)
  }, [])

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    updateArrows()
    track.addEventListener("scroll", updateArrows, { passive: true })
    window.addEventListener("resize", updateArrows)
    return () => {
      track.removeEventListener("scroll", updateArrows)
      window.removeEventListener("resize", updateArrows)
    }
  }, [updateArrows])

  /* ── Défilement au clic sur flèche ────────────────────────────── */
  const scrollBy = (dir: 1 | -1) => {
    const t = trackRef.current
    if (!t) return
    const card = t.querySelector<HTMLElement>(".sty-fcard")
    const cardW = card ? card.offsetWidth + 20 /* gap */ : Math.round(t.clientWidth / 5)
    t.scrollBy({ left: dir * cardW, behavior: "smooth" })
  }

  /* ── Drag (souris / trackpad / touch via pointer events) ───────── */
  const startDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    const t = trackRef.current
    if (!t) return
    drag.current = {
      active: true,
      moved: false,
      startX: e.clientX,
      scrollLeft: t.scrollLeft,
    }
    t.setPointerCapture(e.pointerId)
    t.style.cursor = "grabbing"
    t.style.userSelect = "none"
  }

  const moveDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current.active) return
    const t = trackRef.current
    if (!t) return
    const dx = e.clientX - drag.current.startX
    if (Math.abs(dx) > 4) drag.current.moved = true
    t.scrollLeft = drag.current.scrollLeft - dx
  }

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    const t = trackRef.current
    if (t) {
      t.releasePointerCapture(e.pointerId)
      t.style.cursor = ""
      t.style.userSelect = ""
    }
    drag.current.active = false
  }

  /* Annule le clic si c'était un glissement */
  const stopClickAfterDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if (drag.current.moved) {
      e.preventDefault()
      drag.current.moved = false
    }
  }

  return (
    <div className="sty-carousel-wrap">
      {/* ── Piste scrollable ────────────────────────────────────── */}
      <div
        className="sty-featured-row"
        ref={trackRef}
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={stopClickAfterDrag}
      >
        {styles.map((style, i) => {
          const isAvailable = style.available !== false
          const cardClass = `sty-fcard${isAvailable ? "" : " sty-fcard--upcoming"}`
          const cardStyle = { "--card-delay": `${Math.min(i, 4) * 100}ms` } as React.CSSProperties
          const inner = (
            <>
              {/* Fond */}
              {style.image ? (
                <img
                  src={style.image}
                  alt={style.name}
                  className="sty-fcard-bg"
                  draggable={false}
                />
              ) : (
                <div
                  className="sty-fcard-bg sty-fcard-bg--gradient"
                  style={{
                    background:
                      FAMILY_GRADIENTS[style.family] ??
                      FAMILY_GRADIENTS["Danses urbaines"],
                  }}
                />
              )}
              <div className="sty-fcard-shade" />

              {/* Contenu overlay */}
              <div className="sty-fcard-content">
                <div className="sty-fcard-top">
                  <span className="sty-fcard-family">{style.family}</span>
                  <h3 className="sty-fcard-title">{style.name}</h3>
                  {style.aliases && style.aliases.length > 0 && (
                    <p className="sty-fcard-aliases">
                      {style.aliases.slice(0, 3).join(" · ")}
                    </p>
                  )}
                  <p className="sty-fcard-summary">
                    {style.summary
                      ? style.summary.slice(0, 130) + "…"
                      : "Contenu à venir"}
                  </p>
                </div>
                <div className="sty-fcard-bottom">
                  {isAvailable ? (
                    <div className="sty-fcard-arrow" aria-hidden="true">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path
                          d="M3 8h10M9 4l4 4-4 4"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  ) : (
                    <span className="sty-fcard-coming">À venir</span>
                  )}
                </div>
              </div>
            </>
          )

          return isAvailable ? (
            <Link
              key={style.slug}
              href={`/explorer/styles-de-danse/${style.slug}`}
              className={cardClass}
              data-reveal
              style={cardStyle}
            >
              {inner}
            </Link>
          ) : (
            <div
              key={style.slug}
              className={cardClass}
              data-reveal
              style={cardStyle}
              aria-label={`${style.name} — contenu à venir`}
            >
              {inner}
            </div>
          )
        })}
      </div>

      {/* ── Flèche gauche — masquée au départ ──────────────────── */}
      <button
        className={`sty-nav-arrow sty-nav-arrow--left${showLeft ? "" : " sty-nav-arrow--hidden"}`}
        onClick={() => scrollBy(-1)}
        aria-label="Styles précédents"
        tabIndex={showLeft ? 0 : -1}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
      </button>

      {/* ── Flèche droite — masquée en fin de liste ─────────────── */}
      <button
        className={`sty-nav-arrow sty-nav-arrow--right${showRight ? "" : " sty-nav-arrow--hidden"}`}
        onClick={() => scrollBy(1)}
        aria-label="Styles suivants"
        tabIndex={showRight ? 0 : -1}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  )
}
