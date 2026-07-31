'use client'

import { episodes } from "../../data/episodes"
import Link from "next/link"
import { useState, useMemo, useRef, useEffect, useLayoutEffect, useCallback } from "react"
import { createPortal } from "react-dom"

const EPISODES_PAGE_SIZE = 12

const POPULAR_TAGS = [
  "Santé mentale",
  "Carrière",
  "Heels",
  "Chorégraphie",
  "Opéra de Paris",
  "Comédie musicale",
  "Réseaux sociaux",
  "Blessures",
  "Hip-hop",
  "Contemporain",
]

function getGuestCardImage(episode: (typeof episodes)[number]) {
  const episodeImageName = episode.image
    .split("/")
    .pop()
    ?.replace(/\.png\.png$/i, ".png")
  const sourceImageName = episode.sourceImage
    .split("/")
    .pop()
    ?.replace(/\.png\.png$/i, ".png")
  const optimizedImageName =
    episodeImageName && episodeImageName !== "logo.png"
      ? episodeImageName
      : sourceImageName

  return optimizedImageName
    ? `/images/les-invites/${optimizedImageName}`
    : episode.image
}

function getThematique(episode: (typeof episodes)[number]): string {
  const t = (episode.title + " " + episode.excerpt).toLowerCase()
  if (/santé|kiné|bless|corps|physique|douleur|bienêtre|bien-être|médecin|préserv/.test(t))
    return "Santé & Corps"
  if (/identité|confiance|liberté|affirm|accepta|image de soi/.test(t))
    return "Identité & Confiance"
  if (/chorégraph|création|scène|spectacle|compagnie|diriger une|artistique/.test(t))
    return "Création & Scène"
  if (/réseau|médias?|communic|instagram|social|visibil/.test(t))
    return "Médias & Communication"
  if (/parcours|école|formation|enseign|transmett|pédagog|apprend|jeun|rue/.test(t))
    return "Parcours & Formation"
  return "Carrière & Vie pro"
}

const THEMATIQUES = [
  "Toutes",
  "Carrière & Vie pro",
  "Création & Scène",
  "Santé & Corps",
  "Identité & Confiance",
  "Médias & Communication",
  "Parcours & Formation",
]

function parseDurationMinutes(duration: string): number {
  const hourMatch = duration.match(/(\d+)\s*h\s*(\d*)/)
  const minOnlyMatch = duration.match(/^(\d+)\s*min/)
  if (hourMatch) {
    const h = parseInt(hourMatch[1], 10)
    const m = parseInt(hourMatch[2] || "0", 10)
    return h * 60 + m
  }
  if (minOnlyMatch) return parseInt(minOnlyMatch[1], 10)
  return 0
}

interface DropdownProps {
  label: string
  value: string
  options: { label: string; value: string }[]
  onChange: (v: string) => void
  align?: "left" | "right"
}

function Dropdown({ label: _label, value, options, onChange, align = "left" }: DropdownProps) {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [pos, setPos] = useState<React.CSSProperties>({})
  const btnRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // Attend l'hydratation avant d'activer le portal
  useEffect(() => { setMounted(true) }, [])

  // Calcule la position du menu depuis les coordonnées du bouton
  const calcPos = useCallback(() => {
    if (!btnRef.current) return
    const r  = btnRef.current.getBoundingClientRect()
    const vw = window.innerWidth
    const vh = window.innerHeight

    const menuH = menuRef.current?.offsetHeight ?? 0
    const menuW = menuRef.current?.offsetWidth  ?? 220

    const spaceBelow = vh - r.bottom - 8
    const spaceAbove = r.top - 8

    // Ouvre vers le haut si le menu ne tient pas en bas mais tient au-dessus
    const flipUp = menuH > 0 && spaceBelow < menuH && spaceAbove > spaceBelow

    // Position horizontale (calée sur le bord gauche ou droit du bouton)
    let left = align === "right"
      ? r.right - Math.max(menuW, r.width)
      : r.left
    // Empêche de sortir de l'écran
    left = Math.max(8, Math.min(left, vw - Math.max(menuW, 200) - 8))

    const next: React.CSSProperties = {
      position : "fixed",
      left,
      minWidth : Math.max(r.width, 200),
      zIndex   : 9999,
    }

    if (flipUp) {
      next.bottom    = vh - r.top + 4
      next.top       = undefined
      next.maxHeight = Math.min(spaceAbove, 320)
    } else {
      next.top       = r.bottom + 4
      next.bottom    = undefined
      next.maxHeight = Math.min(spaceBelow, 320)
    }

    setPos(next)
  }, [align])

  // Repositionne dès que le menu s'ouvre (dimensions réelles disponibles)
  useLayoutEffect(() => {
    if (open) calcPos()
  }, [open, calcPos])

  // Repositionne lors du scroll ou du redimensionnement
  useEffect(() => {
    if (!open) return
    window.addEventListener("scroll", calcPos, { passive: true, capture: true })
    window.addEventListener("resize", calcPos, { passive: true })
    return () => {
      window.removeEventListener("scroll", calcPos, { capture: true })
      window.removeEventListener("resize", calcPos)
    }
  }, [open, calcPos])

  // Ferme si clic en dehors du bouton ET du menu
  useEffect(() => {
    if (!open) return
    function onDown(e: MouseEvent) {
      if (
        !btnRef.current?.contains(e.target as Node) &&
        !menuRef.current?.contains(e.target as Node)
      ) setOpen(false)
    }
    document.addEventListener("mousedown", onDown)
    return () => document.removeEventListener("mousedown", onDown)
  }, [open])

  const activeLabel = options.find(o => o.value === value)?.label ?? _label
  const isActive    = value !== options[0]?.value

  return (
    <div className="ep2-dropdown">
      <button
        ref={btnRef}
        className={`ep2-dropdown-btn${open ? " ep2-dropdown-btn--open" : ""}${isActive ? " ep2-dropdown-btn--active" : ""}`}
        onClick={() => setOpen(v => !v)}
        type="button"
      >
        <span>{activeLabel}</span>
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path d="M2 4.5l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Portal : rendu directement dans document.body, hors de tout contexte d'empilement */}
      {open && mounted && createPortal(
        <div ref={menuRef} className="ep2-dropdown-menu" style={pos}>
          {options.map(opt => (
            <button
              key={opt.value}
              className={`ep2-dropdown-item${opt.value === value ? " ep2-dropdown-item--active" : ""}`}
              onClick={() => { onChange(opt.value); setOpen(false) }}
              type="button"
            >
              {opt.label}
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  )
}

export default function EcouterPage() {
  const [search, setSearch] = useState("")
  const [thematique, setThematique] = useState("Toutes")
  const [duree, setDuree] = useState("Toutes")
  const [sort, setSort] = useState("recent")
  const [inviteFilter, setInviteFilter] = useState("Tous")
  const [page, setPage] = useState(1)

  /* ── Entrée du hero ─────────────────────────────────────────────── */
  const heroRef = useRef<HTMLElement>(null)
  const heroImgRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const t = setTimeout(() => heroRef.current?.classList.add("el-hero--ready"), 40)
    return () => clearTimeout(t)
  }, [])

  /* ── Parallax léger sur l'image hero ────────────────────────────── */
  useEffect(() => {
    const onScroll = () => {
      if (!heroImgRef.current) return
      const y = Math.min(window.scrollY * 0.18, 40)
      heroImgRef.current.style.transform = `translateY(${y}px) scale(1.04)`
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  /* ── Données ────────────────────────────────────────────────────── */
  const latestEpisode = episodes[0]
  const heroImage = getGuestCardImage(latestEpisode)

  const guestOptions = useMemo(() => {
    const all = [...new Set(episodes.map(e => e.guest))].sort((a, b) =>
      a.localeCompare(b, "fr")
    )
    return [
      { label: "Tous les invités", value: "Tous" },
      ...all.map(g => ({ label: g, value: g })),
    ]
  }, [])

  const filtered = useMemo(() => {
    let result = [...episodes]

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        e =>
          e.title.toLowerCase().includes(q) ||
          e.guest.toLowerCase().includes(q) ||
          String(e.number).includes(q) ||
          e.excerpt.toLowerCase().includes(q)
      )
    }

    if (inviteFilter !== "Tous") {
      result = result.filter(e => e.guest === inviteFilter)
    }

    if (thematique !== "Toutes") {
      result = result.filter(e => getThematique(e) === thematique)
    }

    if (duree !== "Toutes") {
      result = result.filter(e => {
        const mins = parseDurationMinutes(e.duration)
        if (duree === "court") return mins > 0 && mins < 30
        if (duree === "moyen") return mins >= 30 && mins < 60
        if (duree === "long") return mins >= 60
        return true
      })
    }

    if (sort === "ancien") result.reverse()
    else if (sort === "az") result.sort((a, b) => a.guest.localeCompare(b.guest, "fr"))

    return result
  }, [search, thematique, duree, sort, inviteFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / EPISODES_PAGE_SIZE))
  const safeCurrentPage = Math.min(page, totalPages)
  const startIndex = (safeCurrentPage - 1) * EPISODES_PAGE_SIZE
  const visibleEpisodes = filtered.slice(startIndex, startIndex + EPISODES_PAGE_SIZE)

  const filtersRef = useRef({ search, thematique, duree, sort, inviteFilter })
  useEffect(() => {
    const prev = filtersRef.current
    if (
      prev.search !== search ||
      prev.thematique !== thematique ||
      prev.duree !== duree ||
      prev.sort !== sort ||
      prev.inviteFilter !== inviteFilter
    ) {
      setPage(1)
      filtersRef.current = { search, thematique, duree, sort, inviteFilter }
    }
  }, [search, thematique, duree, sort, inviteFilter])

  function buildPageRange(current: number, total: number): (number | "...")[] {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
    if (current <= 4) return [1, 2, 3, 4, 5, "...", total]
    if (current >= total - 3) return [1, "...", total - 4, total - 3, total - 2, total - 1, total]
    return [1, "...", current - 1, current, current + 1, "...", total]
  }

  const pageRange = buildPageRange(safeCurrentPage, totalPages)

  const hasActiveFilters =
    search.trim() !== "" ||
    thematique !== "Toutes" ||
    duree !== "Toutes" ||
    inviteFilter !== "Tous"

  function clearFilters() {
    setSearch("")
    setThematique("Toutes")
    setDuree("Toutes")
    setInviteFilter("Tous")
    setSort("recent")
  }

  function goToPage(p: number) {
    setPage(p)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <main id="episodes" className="episodes-page ep2">

      {/* ══════════════════════════════════════════════════════════════
          HERO IMMERSIF — deux colonnes
      ══════════════════════════════════════════════════════════════ */}
      <section className="el-hero" ref={heroRef} aria-label="En-tête — Tous les épisodes">

        {/* ── Colonne gauche : texte + recherche ── */}
        <div className="el-hero-left">

          <span
            className="el-kicker el-anim"
            style={{ "--el-delay": "0ms" } as React.CSSProperties}
          >
            Podcast Dance Lab
          </span>

          <h1
            className="el-hero-title el-anim"
            style={{ "--el-delay": "70ms" } as React.CSSProperties}
          >
            Tous les épisodes
          </h1>

          {/* Statistiques */}
          <div
            className="el-stats el-anim"
            style={{ "--el-delay": "140ms" } as React.CSSProperties}
          >
            <div className="el-stat">
              <strong>121</strong>
              <span>conversations</span>
            </div>
            <div className="el-stat-sep" aria-hidden="true" />
            <div className="el-stat">
              <strong>+100&nbsp;000</strong>
              <span>écoutes</span>
            </div>
            <div className="el-stat-sep" aria-hidden="true" />
            <div className="el-stat">
              <strong>Depuis 2024</strong>
            </div>
          </div>

          {/* Accroche */}
          <p
            className="el-hero-desc el-anim"
            style={{ "--el-delay": "200ms" } as React.CSSProperties}
          >
            Conversations avec celles et ceux qui façonnent la danse d&apos;aujourd&apos;hui.
            Parcours, création, carrière, santé, transmission et coulisses du métier d&apos;artiste.
          </p>

          {/* Barre de recherche */}
          <label
            className="el-search-wrap el-anim"
            style={{ "--el-delay": "260ms" } as React.CSSProperties}
          >
            <svg className="el-search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="7.5" />
              <line x1="18.5" y1="18.5" x2="22" y2="22" />
            </svg>
            <input
              className="el-search"
              type="search"
              placeholder="Rechercher un épisode, un invité, un métier, un thème…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoComplete="off"
            />
            {search && (
              <button
                className="el-search-clear"
                type="button"
                onClick={() => setSearch("")}
                aria-label="Effacer la recherche"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </label>

          {/* Tags populaires */}
          <div
            className="el-tags el-anim"
            style={{ "--el-delay": "320ms" } as React.CSSProperties}
          >
            {POPULAR_TAGS.map(tag => (
              <button
                key={tag}
                type="button"
                className={`el-tag${search === tag ? " el-tag--active" : ""}`}
                onClick={() => setSearch(search === tag ? "" : tag)}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Filtres compacts */}
          <div
            className="el-chips el-anim"
            style={{ "--el-delay": "380ms" } as React.CSSProperties}
          >
            <Dropdown
              label="Tous les invités"
              value={inviteFilter}
              options={guestOptions}
              onChange={setInviteFilter}
            />
            <Dropdown
              label="Tous les thèmes"
              value={thematique}
              options={THEMATIQUES.map(t => ({ label: t, value: t }))}
              onChange={setThematique}
            />
            <Dropdown
              label="Toutes les durées"
              value={duree}
              options={[
                { label: "Toutes les durées", value: "Toutes" },
                { label: "Moins de 30 min", value: "court" },
                { label: "30 min – 1 h", value: "moyen" },
                { label: "Plus d'1 heure", value: "long" },
              ]}
              onChange={setDuree}
            />
            <Dropdown
              label="Les plus récents"
              value={sort}
              options={[
                { label: "Les plus récents", value: "recent" },
                { label: "Les plus anciens", value: "ancien" },
                { label: "A → Z", value: "az" },
              ]}
              onChange={setSort}
              align="right"
            />
            {hasActiveFilters && (
              <button className="el-chip-clear" type="button" onClick={clearFilters}>
                ✕ Réinitialiser
              </button>
            )}
          </div>

        </div>

        {/* ── Colonne droite : photo du dernier invité ── */}
        <div className="el-hero-right" aria-hidden="true">
          <div className="el-hero-img-wrap" ref={heroImgRef}>
            <img
              src={heroImage}
              alt={latestEpisode.guest}
              className="el-hero-img"
              onError={e => {
                const fallback = latestEpisode.image
                if (fallback && !e.currentTarget.src.endsWith(fallback)) {
                  e.currentTarget.src = fallback
                }
              }}
            />
          </div>
          {/* Dégradé gauche pour la lisibilité du texte */}
          <div className="el-hero-fade" />
          {/* Légende discrète */}
          <div className="el-hero-caption">
            <span className="el-hero-caption-ep">Épisode {latestEpisode.number}</span>
            <span className="el-hero-caption-guest">{latestEpisode.guest}</span>
          </div>
        </div>

      </section>

      {/* Transition douce vers la grille */}
      <div className="el-hero-transition" aria-hidden="true" />

      {/* ─── Grid ─── */}
      <section className="ep2-list">
        <div className="container">

          {visibleEpisodes.length === 0 ? (
            <div className="ep2-empty">
              <p>Aucun épisode ne correspond à votre recherche.</p>
              <button className="ep2-clear-btn" onClick={clearFilters} type="button">
                Réinitialiser les filtres
              </button>
            </div>
          ) : (
            <div className="ep2-grid">
              {visibleEpisodes.map((episode, idx) => (
                <Link
                  key={episode.number}
                  href={`/episodes/${episode.slug}`}
                  className="ep2-card"
                  style={{ animationDelay: `${idx * 35}ms` }}
                  data-duo={episode.guest.includes("&") ? "true" : undefined}
                >
                  <div className="ep2-card-img-wrap">
                    <img
                      src={getGuestCardImage(episode)}
                      alt={episode.guest}
                      className="ep2-card-img"
                      style={episode.guest.includes("&")
                        ? { objectPosition: "center 40%" }
                        : undefined}
                      onError={event => {
                        const fallback = episode.image || episode.sourceImage
                        if (fallback && !event.currentTarget.src.endsWith(fallback)) {
                          event.currentTarget.src = fallback
                        }
                      }}
                    />
                  </div>
                  <div className="ep2-card-content">
                    <span className="ep2-card-number">Épisode {episode.number}</span>
                    <p className="ep2-card-title">{episode.title}</p>
                    <p className="ep2-card-guest">Avec {episode.guest}</p>
                    <p className="ep2-card-duration">
                      <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true" style={{ verticalAlign: "middle", marginRight: 4 }}>
                        <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.3"/>
                        <path d="M7 4v3.2l2 1.4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                      </svg>
                      {episode.duration}
                    </p>
                    <span className="ep2-card-btn">
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true" style={{ marginRight: 5 }}>
                        <polygon points="2,1 11,6 2,11"/>
                      </svg>
                      Écouter l&apos;épisode
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* ─── Pagination ─── */}
          {totalPages > 1 && (
            <nav className="ep2-pagination" aria-label="Pagination">
              <button
                className="ep2-page-btn ep2-page-arrow"
                onClick={() => goToPage(Math.max(1, safeCurrentPage - 1))}
                disabled={safeCurrentPage === 1}
                aria-label="Page précédente"
              >←</button>

              {pageRange.map((p, i) =>
                p === "..." ? (
                  <span key={`dots-${i}`} className="ep2-page-dots">…</span>
                ) : (
                  <button
                    key={p}
                    className={`ep2-page-btn${p === safeCurrentPage ? " ep2-page-btn--active" : ""}`}
                    onClick={() => goToPage(p as number)}
                    aria-label={`Page ${p}`}
                    aria-current={p === safeCurrentPage ? "page" : undefined}
                  >
                    {p}
                  </button>
                )
              )}

              <button
                className="ep2-page-btn ep2-page-arrow"
                onClick={() => goToPage(Math.min(totalPages, safeCurrentPage + 1))}
                disabled={safeCurrentPage === totalPages}
                aria-label="Page suivante"
              >→</button>
            </nav>
          )}

          <p className="ep2-count">
            {filtered.length === 0
              ? "Aucun résultat"
              : `${startIndex + 1}–${Math.min(
                  startIndex + EPISODES_PAGE_SIZE,
                  filtered.length
                )} sur ${filtered.length} épisode${filtered.length > 1 ? "s" : ""}`}
          </p>

        </div>
      </section>

    </main>
  )
}
