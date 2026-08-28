"use client"

import { useMemo, useState, useRef, useEffect, useLayoutEffect, useCallback } from "react"
import { createPortal } from "react-dom"
import { STYLE_FAMILIES, type DanceStyle, type DanceStyleFamily } from "./styles-data"
import StylesStats from "./StylesStats"
import StylesAutocomplete from "./StylesAutocomplete"
import StylesCarousel from "./StylesCarousel"

const ALL = "Tous les styles"

/** Type minimal commun aux fiches complètes (DanceStyle) et aux stubs (UpcomingStyle) */
type AnyStyle = {
  slug: string
  name: string
  family: DanceStyleFamily
  aliases?: string[]
  summary?: string
  image?: string
  available?: boolean
}

type Props = {
  /** Styles disponibles (fiches complètes) — pour la recherche et les filtres */
  availableStyles: DanceStyle[]
  /** Tous les styles y compris "à venir" — passés au carrousel */
  allStyles: AnyStyle[]
  stylesCount: number
  episodesCount: number
}

export default function StylesHeroFeatured({
  availableStyles,
  allStyles,
  stylesCount,
  episodesCount,
}: Props) {
  const [activeFamily, setActiveFamily] = useState<string>(ALL)
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [menuPos, setMenuPos] = useState<React.CSSProperties>({})
  const btnRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLUListElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  /* ── Hydratation côté client ─────────────────────────────────── */
  useEffect(() => { setMounted(true) }, [])

  /* ── Calcul de la position du menu (portal, position: fixed) ─── */
  const calcPos = useCallback(() => {
    if (!btnRef.current) return
    const r = btnRef.current.getBoundingClientRect()
    const vw = window.innerWidth
    const menuW = menuRef.current?.offsetWidth ?? 220
    let left = r.left
    left = Math.max(8, Math.min(left, vw - Math.max(menuW, r.width) - 8))
    setMenuPos({
      position: 'fixed',
      top: r.bottom + 6,
      left,
      minWidth: Math.max(r.width, 200),
      zIndex: 9999,
    })
  }, [])

  useLayoutEffect(() => { if (isOpen) calcPos() }, [isOpen, calcPos])

  useEffect(() => {
    if (!isOpen) return
    window.addEventListener('scroll', calcPos, { passive: true, capture: true })
    window.addEventListener('resize', calcPos, { passive: true })
    return () => {
      window.removeEventListener('scroll', calcPos, { capture: true })
      window.removeEventListener('resize', calcPos)
    }
  }, [isOpen, calcPos])

  /* ── Fermeture sur clic extérieur ou touche Échap ────────────── */
  useEffect(() => {
    if (!isOpen) return
    function handleOutside(e: MouseEvent) {
      if (
        !btnRef.current?.contains(e.target as Node) &&
        !menuRef.current?.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('mousedown', handleOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  /* ── Familles présentes dans les styles disponibles ──────────── */
  const families = useMemo(() => {
    const present = Array.from(new Set(availableStyles.map((s) => s.family)))
    return [ALL, ...STYLE_FAMILIES.filter((f) => present.includes(f as DanceStyleFamily))]
  }, [availableStyles])

  /* ── Filtrage du carrousel ────────────────────────────────────── */
  const filteredStyles = useMemo(() => {
    if (activeFamily === ALL) return allStyles
    return allStyles.filter((s) => s.family === activeFamily)
  }, [allStyles, activeFamily])

  return (
    <>
      {/* ════════════════════════════════════════
          HERO — plein écran, image de fond éditoriale
      ════════════════════════════════════════ */}
      <section className="sty-hero">

        {/* Image de fond plein cadre */}
        <div className="sty-hero-bg" aria-hidden="true">
          <img
            src="/images/styles-de-danse/break.png"
            alt=""
            className="sty-hero-bg-img"
          />
        </div>

        {/* Voile dégradé sombre */}
        <div className="sty-hero-fade" aria-hidden="true" />

        <div className="sty-hero-left">
          <span className="sty-kicker">Explorer · Styles de danse</span>

          <h1 className="sty-hero-title">
            Comprendre les styles de danse.
          </h1>

          <p className="sty-hero-desc">
            Les cultures, les histoires et les codes qui ont fait naître le Hip-hop,
            le contemporain, le classique, l&apos;afro, le waacking, le krump ou encore
            le heels. Bienvenue dans l&apos;encyclopédie de référence pour découvrir,
            comprendre et vivre la danse.
          </p>

          <StylesStats
            stylesCount={stylesCount}
            episodesCount={episodesCount}
          />

          {/* ── Recherche + filtres — intégrés dans le header ──────── */}
          <div className="sty-hero-search">
            {/* Barre de recherche avec autocomplétion */}
            <StylesAutocomplete styles={availableStyles} />

            {/* Filtre par famille — bouton déroulant (menu via portal) */}
            <div
              className="sty-filter-dropdown"
              ref={dropdownRef}
            >
              <button
                ref={btnRef}
                type="button"
                className={`sty-filter-btn${isOpen ? ' sty-filter-btn--open' : ''}${activeFamily !== ALL ? ' sty-filter-btn--has-value' : ''}`}
                onClick={() => setIsOpen(o => !o)}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                aria-label="Filtrer par famille de danse"
              >
                <span className="sty-filter-btn-label">{activeFamily}</span>
                <svg
                  className="sty-filter-chevron"
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  aria-hidden="true"
                >
                  <path d="M2 4.5L6 8.5L10 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              {isOpen && mounted && createPortal(
                <ul
                  ref={menuRef}
                  className="sty-filter-menu"
                  role="listbox"
                  aria-label="Famille de danse"
                  style={menuPos}
                >
                  {families.map((family) => (
                    <li
                      key={family}
                      role="option"
                      aria-selected={activeFamily === family}
                      className={`sty-filter-option${activeFamily === family ? ' sty-filter-option--active' : ''}`}
                      onClick={() => {
                        setActiveFamily(family)
                        setIsOpen(false)
                      }}
                    >
                      {activeFamily === family && (
                        <svg
                          className="sty-filter-option-check"
                          width="12"
                          height="12"
                          viewBox="0 0 12 12"
                          fill="none"
                          aria-hidden="true"
                        >
                          <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                      {family}
                    </li>
                  ))}
                </ul>,
                document.body
              )}
            </div>
          </div>
        </div>

      </section>

      {/* ════════════════════════════════════════
          CARROUSEL — filtré par la famille active
      ════════════════════════════════════════ */}
      <section className="sty-featured">

        <StylesCarousel styles={filteredStyles} />

        <div className="sty-viewall" id="sty-explorer">
          <a href="#sty-explorer" className="sty-viewall-link">
            Voir tous les styles <span aria-hidden="true">→</span>
          </a>
        </div>

      </section>
    </>
  )
}
