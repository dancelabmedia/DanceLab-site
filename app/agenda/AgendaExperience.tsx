"use client"

import Link from "next/link"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import AgendaMap from "./AgendaMap"
import type { AgendaEvent } from "./agenda-data"
import { formatAgendaDateRange } from "./agenda-data"

// ─── Constantes ───────────────────────────────────────────────────────────────

const ALL_TYPES   = "Tous les types"
const ALL_CITIES  = "Toutes les villes"
const ALL_DATES   = "Toutes les dates"
const ALL_PRICES  = "Tous les tarifs"
const SORT_RECENT = "Les plus récents"
const SORT_OLD    = "Les plus anciens"

const DATE_OPTIONS = [
  ALL_DATES,
  "Aujourd'hui",
  "Ce week-end",
  "Cette semaine",
  "Ce mois-ci",
  "En cours",
  "À venir",
]

const PRICE_OPTIONS = [
  ALL_PRICES,
  "Gratuit",
  "Moins de 15 €",
  "15 – 30 €",
  "Plus de 30 €",
  "Non renseigné",
]

const SORT_OPTIONS = [SORT_RECENT, SORT_OLD]

// ─── Helpers visuels ──────────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  Festival:     "#5B7377",
  Spectacle:    "#7B6B8A",
  Battle:       "#8A6B5B",
  Ballet:       "#6B7B8A",
  Atelier:      "#6B8A7B",
  "Arts de rue":"#8A7B6B",
  Performance:  "#7B8A6B",
  Rencontre:    "#8A6B7B",
}

function isFree(event: AgendaEvent) {
  const p = event.price.toLowerCase()
  return p.includes("gratuit") || p === "0€" || p === "0 €"
}

function getEventPageUrl(event: AgendaEvent) {
  return `/sortir/${event.slug}`
}

// ─── Filtrage par date ────────────────────────────────────────────────────────

/**
 * Retourne la plage de dates correspondant au filtre sélectionné.
 * null = pas de plage applicable (filtres de statut ou "Toutes").
 */
function getDateRange(filter: string): { start: Date; end: Date } | null {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (filter === "Aujourd'hui") {
    const end = new Date(today)
    end.setHours(23, 59, 59, 999)
    return { start: today, end }
  }

  if (filter === "Ce week-end") {
    const day = today.getDay() // 0=dim … 6=sam
    const sat = new Date(today)
    if (day === 0) {
      // Dimanche → on inclut sam (hier) + dim (aujourd'hui)
      sat.setDate(today.getDate() - 1)
    } else if (day === 6) {
      // Samedi → ok, on reste sur aujourd'hui
    } else {
      // Lun–Ven → prochain samedi
      sat.setDate(today.getDate() + (6 - day))
    }
    const sun = new Date(sat)
    sun.setDate(sat.getDate() + (day === 6 ? 1 : day === 0 ? 0 : 1))
    sun.setHours(23, 59, 59, 999)
    sat.setHours(0, 0, 0, 0)
    return { start: sat, end: sun }
  }

  if (filter === "Cette semaine") {
    const end = new Date(today)
    end.setDate(today.getDate() + 6)
    end.setHours(23, 59, 59, 999)
    return { start: today, end }
  }

  if (filter === "Ce mois-ci") {
    const end = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    end.setHours(23, 59, 59, 999)
    return { start: today, end }
  }

  return null
}

function eventMatchesDate(event: AgendaEvent, filter: string): boolean {
  if (filter === ALL_DATES)  return true
  if (filter === "En cours") return event.status === "En cours"
  if (filter === "À venir")  return event.status !== "En cours"

  const range = getDateRange(filter)
  if (!range) return true

  // Un événement correspond si sa plage chevauche la plage du filtre
  const evStart = new Date(event.startDate)
  evStart.setHours(0, 0, 0, 0)
  const evEnd = event.endDate ? new Date(event.endDate) : new Date(event.startDate)
  evEnd.setHours(23, 59, 59, 999)

  return evStart <= range.end && evEnd >= range.start
}

// ─── Filtrage par prix ────────────────────────────────────────────────────────

/**
 * Extrait le prix minimum d'une chaîne de caractères.
 * Gère : "15 €", "À partir de 10 €", "10 - 30 €", "6 € / 4 € tarif réduit", etc.
 */
function extractMinPrice(priceStr: string): number | null {
  const p = priceStr.toLowerCase().trim()
  if (!p || p === "à compléter") return null
  if (p.includes("gratuit") || p === "0€" || p === "0 €") return 0
  const numbers = priceStr.match(/\d+(?:[.,]\d+)?/g)
  if (!numbers?.length) return null
  return Math.min(...numbers.map((n) => parseFloat(n.replace(",", "."))))
}

function eventMatchesPrice(event: AgendaEvent, filter: string): boolean {
  if (filter === ALL_PRICES) return true
  if (filter === "Non renseigné") {
    return event.price === "À compléter" || !event.price.trim()
  }
  if (filter === "Gratuit") return isFree(event)

  // Pour les filtres numériques, les événements gratuits comptent comme 0 €
  if (isFree(event)) return filter === "Moins de 15 €"

  const min = extractMinPrice(event.price)
  if (min === null) return false   // prix inconnu → exclu des filtres numériques

  switch (filter) {
    case "Moins de 15 €": return min < 15
    case "15 – 30 €":     return min >= 15 && min <= 30
    case "Plus de 30 €":  return min > 30
    default:              return true
  }
}

// ─── Dropdown générique ───────────────────────────────────────────────────────

interface DropdownProps {
  label: string
  value: string
  options: string[]
  onChange: (v: string) => void
  align?: "left" | "right"
}

function Dropdown({ label, value, options, onChange, align = "left" }: DropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClickOut(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onClickOut)
    return () => document.removeEventListener("mousedown", onClickOut)
  }, [])

  const isActive = value !== options[0]

  return (
    <div className="srt-dd" ref={ref}>
      <button
        type="button"
        className={[
          "srt-dd-btn",
          open     ? "srt-dd-btn--open"   : "",
          isActive ? "srt-dd-btn--active" : "",
        ].filter(Boolean).join(" ")}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span>{isActive ? value : label}</span>
        <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path d="M2 4.5l4 4 4-4" stroke="currentColor" strokeWidth="1.7"
                strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className={`srt-dd-menu srt-dd-menu--${align}`} role="listbox">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              role="option"
              aria-selected={opt === value}
              className={`srt-dd-item${opt === value ? " srt-dd-item--active" : ""}`}
              onClick={() => { onChange(opt); setOpen(false) }}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Carte événement ──────────────────────────────────────────────────────────

function EventCard({
  event,
  onMap,
  animDelay = 0,
}: {
  event: AgendaEvent
  onMap: (slug: string) => void
  animDelay?: number
}) {
  const isOngoing = event.status === "En cours"
  const color = CATEGORY_COLORS[event.category] ?? "#5B7377"
  const priceDisplay = isFree(event)
    ? "Gratuit"
    : event.price === "À compléter"
    ? "À compléter"
    : event.price

  return (
    <article className="srt-card" style={{ animationDelay: `${animDelay}ms` }}>
      <div className="srt-card-media">
        {event.image ? (
          <img src={event.image} alt={event.title} className="srt-card-img" />
        ) : (
          <div
            className="srt-card-placeholder"
            style={{ background: `linear-gradient(135deg, ${color}20 0%, ${color}50 100%)` }}
          >
            <span className="srt-placeholder-cat" style={{ color }}>{event.category}</span>
          </div>
        )}
        <span className="srt-badge srt-badge--cat">{event.category}</span>
        <span className={`srt-badge srt-badge--status${isOngoing ? " srt-badge--on" : " srt-badge--soon"}`}>
          {isOngoing ? "EN COURS" : "À VENIR"}
        </span>
      </div>

      <div className="srt-card-body">
        <h3 className="srt-card-title">{event.title}</h3>
        <p className="srt-card-desc">{event.description}</p>

        <div className="srt-card-meta">
          <span>
            <svg width="11" height="11" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M7 1C4.79 1 3 2.79 3 5c0 3 4 8 4 8s4-5 4-8c0-2.21-1.79-4-4-4z"
                stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
              <circle cx="7" cy="5" r="1.2" fill="currentColor" />
            </svg>
            {event.city}
          </span>
          <span>
            <svg width="11" height="11" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <rect x="2" y="3" width="10" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
              <path d="M5 2v2M9 2v2M2 6h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
            {formatAgendaDateRange(event)}
          </span>
          <span className={isFree(event) ? "srt-meta-free" : ""}>
            <svg width="11" height="11" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.3" />
              <path d="M7 4v6M5 5.5h2.5a1.5 1.5 0 0 1 0 3H5"
                stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
            {priceDisplay}
          </span>
        </div>

        <div className="srt-card-actions">
          <Link href={getEventPageUrl(event)} className="srt-btn-primary">
            Voir l'événement
          </Link>
          <button
            type="button"
            className="srt-btn-map"
            onClick={() => onMap(event.slug)}
            aria-label="Voir sur la carte"
          >
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M7 1C4.79 1 3 2.79 3 5c0 3 4 8 4 8s4-5 4-8c0-2.21-1.79-4-4-4z"
                stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
              <circle cx="7" cy="5" r="1.2" fill="currentColor" />
            </svg>
            Carte
          </button>
        </div>
      </div>
    </article>
  )
}

// ─── Cluster ──────────────────────────────────────────────────────────────────

const CLUSTER_INITIAL = 8

function EventCluster({
  title,
  subtitle,
  events,
  onMap,
}: {
  title: string
  subtitle: string
  events: AgendaEvent[]
  onMap: (slug: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const visible = expanded ? events : events.slice(0, CLUSTER_INITIAL)
  const hasMore = events.length > CLUSTER_INITIAL

  if (events.length === 0) return null

  return (
    <div className="srt-cluster">
      <div className="srt-cluster-head">
        <div className="srt-cluster-headtext">
          <h2 className="srt-cluster-title">{title}</h2>
          <p className="srt-cluster-sub">{subtitle}</p>
        </div>
        {hasMore && !expanded && (
          <button type="button" className="srt-see-all" onClick={() => setExpanded(true)}>
            Voir tous ({events.length})
          </button>
        )}
        {hasMore && expanded && (
          <button type="button" className="srt-see-all" onClick={() => setExpanded(false)}>
            Réduire
          </button>
        )}
        {!hasMore && (
          <span className="srt-count-tag">
            {events.length} événement{events.length > 1 ? "s" : ""}
          </span>
        )}
      </div>

      <div className="srt-grid">
        {visible.map((ev, i) => (
          <EventCard key={ev.slug} event={ev} onMap={onMap} animDelay={i * 45} />
        ))}
      </div>
    </div>
  )
}

// ─── Composant principal ──────────────────────────────────────────────────────

type AgendaExperienceProps = { events: AgendaEvent[] }

export default function AgendaExperience({ events }: AgendaExperienceProps) {

  // ── Données live ──
  const [agendaEvents, setAgendaEvents] = useState<AgendaEvent[]>(events)
  const [isLoading, setIsLoading]       = useState(true)
  const [hasNotionError, setHasNotionError] = useState(false)
  const [activeSlug, setActiveSlug]     = useState<string | undefined>(events[0]?.slug)

  useEffect(() => {
    let cancelled = false
    async function loadAgenda() {
      try {
        const res = await fetch("/api/agenda", { cache: "no-store" })
        if (!res.ok) throw new Error("Agenda unavailable")
        const data = await res.json()
        if (cancelled) return
        if (Array.isArray(data.events)) {
          setAgendaEvents(data.events)
          setActiveSlug(data.events[0]?.slug)
        }
        setHasNotionError(Boolean(data.error))
      } catch {
        if (!cancelled) setHasNotionError(true)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    loadAgenda()
    return () => { cancelled = true }
  }, [])

  // ── États des filtres ──
  const [search,      setSearch]      = useState("")
  const [typeFilter,  setTypeFilter]  = useState(ALL_TYPES)
  const [cityFilter,  setCityFilter]  = useState(ALL_CITIES)
  const [dateFilter,  setDateFilter]  = useState(ALL_DATES)
  const [priceFilter, setPriceFilter] = useState(ALL_PRICES)
  const [sortValue,   setSortValue]   = useState(SORT_RECENT)

  // ── Mobile : panneau filtres ──
  const [filtersOpen, setFiltersOpen] = useState(false)

  // ── Options dynamiques ──
  const typeOptions = useMemo(
    () => [ALL_TYPES, ...Array.from(new Set(agendaEvents.map((e) => e.category))).sort()],
    [agendaEvents]
  )
  const cityOptions = useMemo(
    () => [
      ALL_CITIES,
      ...Array.from(new Set(agendaEvents.map((e) => e.city))).sort((a, b) =>
        a.localeCompare(b, "fr")
      ),
    ],
    [agendaEvents]
  )

  // ── Filtrage + tri ──
  const filtered = useMemo(() => {
    let r = [...agendaEvents]

    if (search.trim()) {
      const q = search.trim().toLowerCase()
      r = r.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.city.toLowerCase().includes(q) ||
          e.venue.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q)
      )
    }

    if (typeFilter  !== ALL_TYPES)  r = r.filter((e) => e.category === typeFilter)
    if (cityFilter  !== ALL_CITIES) r = r.filter((e) => e.city === cityFilter)
    if (dateFilter  !== ALL_DATES)  r = r.filter((e) => eventMatchesDate(e, dateFilter))
    if (priceFilter !== ALL_PRICES) r = r.filter((e) => eventMatchesPrice(e, priceFilter))

    r.sort((a, b) =>
      sortValue === SORT_OLD
        ? a.startDate.localeCompare(b.startDate)
        : b.startDate.localeCompare(a.startDate)
    )

    return r
  }, [agendaEvents, search, typeFilter, cityFilter, dateFilter, priceFilter, sortValue])

  const ongoingEvents  = useMemo(() => filtered.filter((e) => e.status === "En cours"), [filtered])
  const upcomingEvents = useMemo(() => filtered.filter((e) => e.status !== "En cours"),  [filtered])

  // ── Filtres actifs ──
  const hasActiveFilter =
    search.trim() !== "" ||
    typeFilter  !== ALL_TYPES  ||
    cityFilter  !== ALL_CITIES ||
    dateFilter  !== ALL_DATES  ||
    priceFilter !== ALL_PRICES

  const activeFilterCount = [
    search.trim() !== "",
    typeFilter  !== ALL_TYPES,
    cityFilter  !== ALL_CITIES,
    dateFilter  !== ALL_DATES,
    priceFilter !== ALL_PRICES,
  ].filter(Boolean).length

  function clearFilters() {
    setSearch("")
    setTypeFilter(ALL_TYPES)
    setCityFilter(ALL_CITIES)
    setDateFilter(ALL_DATES)
    setPriceFilter(ALL_PRICES)
    setSortValue(SORT_RECENT)
  }

  const handleMap = useCallback((slug: string) => {
    setActiveSlug(slug)
    document.getElementById("srt-map")?.scrollIntoView({ behavior: "smooth", block: "start" })
  }, [])

  const handleSelectEvent = useCallback((event: AgendaEvent) => {
    setActiveSlug(event.slug)
  }, [])

  // ── Suggestion pour l'état vide ──
  function getEmptySuggestions() {
    const suggestions: { label: string; action: () => void }[] = []
    if (dateFilter !== ALL_DATES) {
      if (dateFilter === "Aujourd'hui") suggestions.push({ label: "Voir ce week-end", action: () => setDateFilter("Ce week-end") })
      else if (dateFilter === "Ce week-end") suggestions.push({ label: "Voir cette semaine", action: () => setDateFilter("Cette semaine") })
      else if (dateFilter === "Cette semaine") suggestions.push({ label: "Voir ce mois-ci", action: () => setDateFilter("Ce mois-ci") })
      else suggestions.push({ label: "Toutes les dates", action: () => setDateFilter(ALL_DATES) })
    }
    if (cityFilter !== ALL_CITIES) {
      suggestions.push({ label: "Toutes les villes", action: () => setCityFilter(ALL_CITIES) })
    }
    if (priceFilter !== ALL_PRICES && priceFilter !== "Gratuit") {
      suggestions.push({ label: "Tous les tarifs", action: () => setPriceFilter(ALL_PRICES) })
    }
    return suggestions
  }

  return (
    <>
      {/* ════════════════════════════════════════════════
          Barre de contrôles sticky
      ════════════════════════════════════════════════ */}
      <section className="srt-controls-section">
        <div className="container">

          {/* Recherche */}
          <div className="srt-search-row">
            <label className="srt-search-wrap" htmlFor="srt-search">
              <svg className="srt-search-icon" width="17" height="17" viewBox="0 0 18 18"
                   fill="none" aria-hidden="true">
                <circle cx="7.5" cy="7.5" r="5.5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M13 13l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <input
                id="srt-search"
                type="search"
                className="srt-search"
                placeholder="Rechercher une ville, un spectacle, un festival…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoComplete="off"
              />
              {search && (
                <button
                  type="button"
                  className="srt-search-clear"
                  onClick={() => setSearch("")}
                  aria-label="Effacer la recherche"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </label>
          </div>

          {/* ── Mobile : bouton toggle + tri ── */}
          <div className="srt-mobile-controls">
            <button
              type="button"
              className={`srt-filter-toggle${activeFilterCount > 0 ? " srt-filter-toggle--active" : ""}`}
              onClick={() => setFiltersOpen((v) => !v)}
              aria-expanded={filtersOpen}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M2 4h12M4 8h8M6 12h4" stroke="currentColor" strokeWidth="1.6"
                      strokeLinecap="round" />
              </svg>
              Filtres
              {activeFilterCount > 0 && (
                <span className="srt-filter-count">{activeFilterCount}</span>
              )}
            </button>
            <div className="srt-mobile-sort">
              <Dropdown label={SORT_RECENT} value={sortValue} options={SORT_OPTIONS}
                        onChange={setSortValue} align="right" />
            </div>
          </div>

          {/* ── Desktop + mobile (ouvert) : ligne filtres ── */}
          <div className={`srt-filter-row${filtersOpen ? " srt-filter-row--open" : ""}`}>
            <div className="srt-filters">
              <Dropdown label="Type"  value={typeFilter}  options={typeOptions}  onChange={setTypeFilter} />
              <Dropdown label="Ville" value={cityFilter}  options={cityOptions}  onChange={setCityFilter} />
              <Dropdown label="Date"  value={dateFilter}  options={DATE_OPTIONS} onChange={setDateFilter} />
              <Dropdown label="Prix"  value={priceFilter} options={PRICE_OPTIONS} onChange={setPriceFilter} />
              {hasActiveFilter && (
                <button type="button" className="srt-clear-btn" onClick={clearFilters}>
                  ✕ Réinitialiser
                </button>
              )}
            </div>
            {/* Tri — visible uniquement en desktop (caché sur mobile via CSS) */}
            <div className="srt-desktop-sort">
              <Dropdown label={SORT_RECENT} value={sortValue} options={SORT_OPTIONS}
                        onChange={setSortValue} align="right" />
            </div>
          </div>

          {/* ── Chips filtres actifs ── */}
          {hasActiveFilter && (
            <div className="srt-chips-row" role="group" aria-label="Filtres actifs">
              {search.trim() && (
                <button className="srt-chip" type="button" onClick={() => setSearch("")}>
                  <svg width="10" height="10" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                    <circle cx="7.5" cy="7.5" r="5.5" stroke="currentColor" strokeWidth="1.6" />
                    <path d="M13 13l3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                  {`"${search.trim().slice(0, 22)}${search.trim().length > 22 ? "…" : ""}"`}
                  <span className="srt-chip-x" aria-hidden="true">×</span>
                </button>
              )}
              {typeFilter !== ALL_TYPES && (
                <button className="srt-chip" type="button" onClick={() => setTypeFilter(ALL_TYPES)}>
                  {typeFilter}
                  <span className="srt-chip-x" aria-hidden="true">×</span>
                </button>
              )}
              {cityFilter !== ALL_CITIES && (
                <button className="srt-chip" type="button" onClick={() => setCityFilter(ALL_CITIES)}>
                  {cityFilter}
                  <span className="srt-chip-x" aria-hidden="true">×</span>
                </button>
              )}
              {dateFilter !== ALL_DATES && (
                <button className="srt-chip" type="button" onClick={() => setDateFilter(ALL_DATES)}>
                  {dateFilter}
                  <span className="srt-chip-x" aria-hidden="true">×</span>
                </button>
              )}
              {priceFilter !== ALL_PRICES && (
                <button className="srt-chip" type="button" onClick={() => setPriceFilter(ALL_PRICES)}>
                  {priceFilter}
                  <span className="srt-chip-x" aria-hidden="true">×</span>
                </button>
              )}
              {activeFilterCount > 1 && (
                <button className="srt-chips-clear" type="button" onClick={clearFilters}>
                  Tout effacer
                </button>
              )}
            </div>
          )}

        </div>
      </section>

      {/* ════════════════════════════════════════════════
          Corps — liste événements
      ════════════════════════════════════════════════ */}
      <section className="srt-body">
        <div className="container">

          {isLoading && (
            <div className="srt-state-msg">Chargement des événements…</div>
          )}

          {!isLoading && hasNotionError && (
            <p className="srt-sync-note">
              Agenda momentanément indisponible. Les événements seront affichés dès que la connexion sera rétablie.
            </p>
          )}

          {/* ── État vide contextuel ── */}
          {!isLoading && filtered.length === 0 && (
            <div className="srt-empty">
              <div className="srt-empty-icon" aria-hidden="true">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <rect x="6" y="12" width="36" height="32" rx="4"
                        stroke="currentColor" strokeWidth="2" />
                  <path d="M16 8v8M32 8v8M6 22h36"
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M18 30l12 0M24 24v12"
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                        strokeOpacity=".4" />
                </svg>
              </div>
              <p className="srt-empty-title">Aucun événement trouvé</p>
              <p className="srt-empty-desc">
                {dateFilter !== ALL_DATES && dateFilter !== "En cours" && dateFilter !== "À venir"
                  ? `Aucun événement ne correspond à « ${dateFilter} » avec ces critères.`
                  : hasActiveFilter
                  ? "Aucun événement ne correspond à votre sélection."
                  : "Aucun événement n'est disponible pour le moment."}
              </p>
              {getEmptySuggestions().length > 0 && (
                <div className="srt-empty-actions">
                  {getEmptySuggestions().map((s) => (
                    <button
                      key={s.label}
                      type="button"
                      className="srt-empty-suggest"
                      onClick={s.action}
                    >
                      {s.label} →
                    </button>
                  ))}
                </div>
              )}
              {hasActiveFilter && (
                <button type="button" className="srt-clear-btn" style={{ marginTop: 8 }}
                        onClick={clearFilters}>
                  Réinitialiser tous les filtres
                </button>
              )}
            </div>
          )}

          {/* ── Compteur de résultats ── */}
          {!isLoading && filtered.length > 0 && (
            <p className="srt-results-count">
              {filtered.length} événement{filtered.length > 1 ? "s" : ""}
              {hasActiveFilter ? ` trouvé${filtered.length > 1 ? "s" : ""}` : ""}
            </p>
          )}

          <EventCluster
            title="En cours"
            subtitle="Des rendez-vous déjà ouverts au public ou actuellement actifs."
            events={ongoingEvents}
            onMap={handleMap}
          />

          <EventCluster
            title="À venir"
            subtitle="Les événements à ne pas manquer prochainement."
            events={upcomingEvents}
            onMap={handleMap}
          />

        </div>
      </section>

      {/* ════ Carte ════ */}
      <AgendaMap
        events={filtered}
        activeSlug={activeSlug}
        onSelectEvent={handleSelectEvent}
      />
    </>
  )
}
