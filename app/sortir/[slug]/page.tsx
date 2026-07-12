"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import type { AgendaEvent } from "../../agenda/agenda-data"
import { formatAgendaDateRange, resolveAgendaEventLocation } from "../../agenda/agenda-data"

export default function SortirEventPage() {
  const params = useParams<{ slug: string }>()
  const [events, setEvents] = useState<AgendaEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function loadEvent() {
      try {
        const response = await fetch("/api/agenda", { cache: "no-store" })
        if (!response.ok) throw new Error("Agenda unavailable")
        const data = await response.json()

        if (!cancelled) {
          setEvents(Array.isArray(data.events) ? data.events : [])
          setHasError(Boolean(data.error))
        }
      } catch {
        if (!cancelled) setHasError(true)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    loadEvent()

    return () => {
      cancelled = true
    }
  }, [])

  const event = useMemo(
    () => events.find((item) => item.slug === params.slug),
    [events, params.slug]
  )

  if (isLoading) {
    return (
      <main className="agenda-detail-page">
        <section className="agenda-detail-empty">
          <span className="section-label">Sortir</span>
          <p>Chargement de l'événement...</p>
        </section>
      </main>
    )
  }

  if (!event || hasError) {
    return (
      <main className="agenda-detail-page">
        <section className="agenda-detail-empty">
          <span className="section-label">Sortir</span>
          <h1>Événement introuvable</h1>
          <p>Les informations de cet événement ne sont pas disponibles pour le moment.</p>
          <Link href="/agenda">Retour à l'agenda</Link>
        </section>
      </main>
    )
  }

  const location = resolveAgendaEventLocation(event)
  const reservationUrl = event.ticketUrl || event.officialUrl

  return (
    <main className="agenda-detail-page">
      <section className="agenda-detail-hero">
        {event.image ? <img src={event.image} alt={event.title} /> : null}
        <div className="agenda-detail-hero-shade" />
        <div className="container agenda-detail-hero-content">
          <Link href="/agenda" className="agenda-detail-back">
            Retour à l'agenda
          </Link>
          <span className="section-label">{event.category}</span>
          <h1>{event.title}</h1>
          <p>{event.description}</p>
          <div className="agenda-detail-meta">
            <span>{event.category}</span>
            <span>{event.city}</span>
            <span>{formatAgendaDateRange(event)}</span>
            <span>{event.price}</span>
          </div>
        </div>
      </section>

      <section className="agenda-detail-body">
        <article className="agenda-detail-main">
          <h2>À propos de l'événement</h2>
          <p>{event.description}</p>

          <div className="agenda-detail-info-grid">
            <div>
              <span>Dates</span>
              <strong>{formatAgendaDateRange(event)}</strong>
            </div>
            <div>
              <span>Lieu</span>
              <strong>{location.isComplete ? `${event.venue} - ${event.city}` : "Adresse à compléter"}</strong>
            </div>
            <div>
              <span>Prix</span>
              <strong>{event.price}</strong>
            </div>
            <div>
              <span>Statut</span>
              <strong>{event.status}</strong>
            </div>
          </div>
        </article>

        <aside className="agenda-detail-side">
          <h2>Informations</h2>
          <p>{event.venue}</p>
          <p>{location.label}</p>
          {reservationUrl ? (
            <a href={reservationUrl} target="_blank" rel="noopener noreferrer">
              Réserver
            </a>
          ) : (
            <span>Billetterie à compléter</span>
          )}
        </aside>
      </section>
    </main>
  )
}
