"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import AgendaMap from "./AgendaMap"
import type { AgendaEvent } from "./agenda-data"
import { formatAgendaDateRange, resolveAgendaEventLocation } from "./agenda-data"

type AgendaExperienceProps = {
  events: AgendaEvent[]
}

const ALL = "Tous"
const EVENTS_PER_PAGE = 12

function getEventLink(event: AgendaEvent) {
  return event.ticketUrl || event.officialUrl || ""
}

function isFreeEvent(event: AgendaEvent) {
  return event.price.toLowerCase().includes("gratuit") || event.price.includes("0€")
}

function getDateBucket(event: AgendaEvent) {
  if (event.status === "En cours") return "En cours"
  if (event.startDate < "2027-01-01") return "À venir"
  return "2027"
}

export default function AgendaExperience({ events }: AgendaExperienceProps) {
  const [agendaEvents, setAgendaEvents] = useState(events)
  const [category, setCategory] = useState(ALL)
  const [city, setCity] = useState(ALL)
  const [date, setDate] = useState(ALL)
  const [price, setPrice] = useState(ALL)
  const [activeSlug, setActiveSlug] = useState(events[0]?.slug)
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [hasNotionError, setHasNotionError] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function loadAgenda() {
      try {
        const response = await fetch("/api/agenda", { cache: "no-store" })
        if (!response.ok) throw new Error("Agenda unavailable")

        const data = await response.json()
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

    return () => {
      cancelled = true
    }
  }, [])

  const categories = useMemo(
    () => [ALL, ...Array.from(new Set(agendaEvents.map((event) => event.category)))],
    [agendaEvents]
  )
  const cities = useMemo(
    () => [ALL, ...Array.from(new Set(agendaEvents.map((event) => event.city)))],
    [agendaEvents]
  )
  const dateBuckets = [ALL, "En cours", "À venir", "2027"]
  const priceBuckets = [ALL, "Gratuit", "Payant / à compléter"]

  const filteredEvents = useMemo(
    () =>
      agendaEvents.filter((event) => {
        if (category !== ALL && event.category !== category) return false
        if (city !== ALL && event.city !== city) return false
        if (date !== ALL && getDateBucket(event) !== date) return false
        if (price === "Gratuit" && !isFreeEvent(event)) return false
        if (price === "Payant / à compléter" && isFreeEvent(event)) return false
        return true
      }),
    [agendaEvents, category, city, date, price]
  )

  useEffect(() => {
    setPage(1)
  }, [category, city, date, price])

  useEffect(() => {
    if (filteredEvents.some((event) => event.slug === activeSlug)) return
    setActiveSlug(filteredEvents[0]?.slug)
  }, [activeSlug, filteredEvents])

  const handleSelectEvent = useCallback((event: AgendaEvent) => {
    setActiveSlug(event.slug)
  }, [])

  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / EVENTS_PER_PAGE))
  const visibleEvents = filteredEvents.slice((page - 1) * EVENTS_PER_PAGE, page * EVENTS_PER_PAGE)
  const currentEvents = visibleEvents.filter((event) => event.status === "En cours")
  const upcomingEvents = visibleEvents.filter((event) => event.status !== "En cours")

  const focusEvent = (slug: string) => {
    setActiveSlug(slug)
    document.getElementById("agenda-map")?.scrollIntoView({ behavior: "smooth", block: "center" })
  }

  return (
    <>
      <section className="agenda-index">
        <div className="container">
          <div className="agenda-toolbar">
            <div>
              <span className="section-label">Sélection</span>
              <h2>À venir ou en cours</h2>
              {hasNotionError ? (
                <p className="agenda-sync-note">
                  Agenda Notion momentanément indisponible. Les événements seront affichés dès que la connexion sera rétablie.
                </p>
              ) : null}
            </div>
            <div className="agenda-filters" aria-label="Filtres de l'agenda culturel">
              <AgendaSelect label="Type" value={category} options={categories} onChange={setCategory} />
              <AgendaSelect label="Ville" value={city} options={cities} onChange={setCity} />
              <AgendaSelect label="Date" value={date} options={dateBuckets} onChange={setDate} />
              <AgendaSelect label="Prix" value={price} options={priceBuckets} onChange={setPrice} />
            </div>
          </div>

          {filteredEvents.length === 0 ? (
            <div className="agenda-empty-state">
              <span>Agenda</span>
              <p>
                {isLoading
                  ? "Chargement des événements..."
                  : hasNotionError
                    ? "Impossible de récupérer les événements Notion pour le moment."
                    : "Aucun événement ne correspond à ces filtres pour le moment."}
              </p>
            </div>
          ) : null}

          {currentEvents.length > 0 ? (
            <section className="agenda-cluster">
              <div className="agenda-cluster-heading">
                <h3>En cours</h3>
                <p>Des rendez-vous déjà ouverts au public ou actuellement actifs.</p>
              </div>
              <div className="agenda-premium-grid">
                {currentEvents.map((event) => (
                  <AgendaCard
                    key={event.slug}
                    event={event}
                    isActive={event.slug === activeSlug}
                    onFocus={() => focusEvent(event.slug)}
                  />
                ))}
              </div>
            </section>
          ) : null}

          {upcomingEvents.length > 0 ? (
            <section className="agenda-cluster">
              <div className="agenda-cluster-heading">
                <h3>Prochains rendez-vous</h3>
                <p>Les événements à surveiller pour organiser ses sorties danse.</p>
              </div>
              <div className="agenda-premium-grid">
                {upcomingEvents.map((event) => (
                  <AgendaCard
                    key={event.slug}
                    event={event}
                    isActive={event.slug === activeSlug}
                    onFocus={() => focusEvent(event.slug)}
                  />
                ))}
              </div>
            </section>
          ) : null}

          {filteredEvents.length > EVENTS_PER_PAGE ? (
            <AgendaPagination currentPage={page} totalPages={totalPages} onChange={setPage} />
          ) : null}
        </div>
      </section>

      <AgendaMap
        events={filteredEvents}
        activeSlug={activeSlug}
        onSelectEvent={handleSelectEvent}
      />
    </>
  )
}

function getPaginationItems(currentPage: number, totalPages: number) {
  const items: Array<number | "..."> = []

  for (let page = 1; page <= totalPages; page += 1) {
    const isEdge = page === 1 || page === totalPages
    const isNearCurrent = Math.abs(page - currentPage) <= 1

    if (isEdge || isNearCurrent) {
      items.push(page)
      continue
    }

    if (items[items.length - 1] !== "...") items.push("...")
  }

  return items
}

function AgendaPagination({
  currentPage,
  totalPages,
  onChange,
}: {
  currentPage: number
  totalPages: number
  onChange: (page: number) => void
}) {
  return (
    <nav className="agenda-pagination" aria-label="Pagination des événements">
      <button type="button" disabled={currentPage === 1} onClick={() => onChange(currentPage - 1)}>
        Précédent
      </button>
      {getPaginationItems(currentPage, totalPages).map((item, index) =>
        item === "..." ? (
          <span key={`ellipsis-${index}`}>...</span>
        ) : (
          <button
            key={item}
            type="button"
            className={item === currentPage ? "is-active" : ""}
            onClick={() => onChange(item)}
            aria-current={item === currentPage ? "page" : undefined}
          >
            {item}
          </button>
        )
      )}
      <button type="button" disabled={currentPage === totalPages} onClick={() => onChange(currentPage + 1)}>
        Suivant
      </button>
    </nav>
  )
}

function AgendaSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: string[]
  onChange: (value: string) => void
}) {
  return (
    <label className="agenda-filter-field">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  )
}

function AgendaCard({
  event,
  isActive,
  onFocus,
}: {
  event: AgendaEvent
  isActive: boolean
  onFocus: () => void
}) {
  const location = resolveAgendaEventLocation(event)
  const eventLink = getEventLink(event)

  return (
    <article className={`agenda-premium-card${isActive ? " is-active" : ""}`}>
      <div className="agenda-card-media">
        {event.image ? (
          <img src={event.image} alt={event.title} />
        ) : (
          <div className="agenda-image-placeholder">
            <span>Image officielle</span>
            <strong>À compléter</strong>
          </div>
        )}
      </div>

      <div className="agenda-card-body">
        <div className="agenda-card-topline">
          <span>{event.category}</span>
          <small>{event.status}</small>
        </div>

        <h3>{event.title}</h3>
        <p>{event.description}</p>

        <div className="agenda-card-meta-line" aria-label="Informations de l'événement">
          <span>{event.category}</span>
          <span>{event.city}</span>
          <span>{formatAgendaDateRange(event)}</span>
          <span>{event.price}</span>
        </div>

        <div className="agenda-card-footer">
          <small>Source : {event.sourceLabel}</small>
          <div className="agenda-card-actions">
            <button type="button" onClick={onFocus}>
              Voir sur la carte
            </button>
            {eventLink ? (
              <a href={eventLink} target="_blank" rel="noopener noreferrer">
                {event.ticketUrl ? "Réserver" : "Voir l'événement"}
              </a>
            ) : (
              <span className="agenda-card-missing-link">À compléter</span>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
