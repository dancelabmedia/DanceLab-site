import { headers } from "next/headers"
import Link from "next/link"
import { notFound } from "next/navigation"
import type { AgendaEvent } from "../../agenda/agenda-data"
import { formatAgendaDateRange, resolveAgendaEventLocation } from "../../agenda/agenda-data"

export const dynamic = "force-dynamic"

async function getAgendaEvents() {
  const headersList = await headers()
  const host = headersList.get("host")
  const protocol = host?.includes("localhost") ? "http" : "https"
  const baseUrl = host ? `${protocol}://${host}` : "http://localhost:3010"

  const response = await fetch(`${baseUrl}/api/agenda`, { cache: "no-store" })

  if (!response.ok) return []

  const data = await response.json()
  return Array.isArray(data.events) ? (data.events as AgendaEvent[]) : []
}

export default async function SortirEventPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const events = await getAgendaEvents()
  const event = events.find((item) => item.slug === slug)

  if (!event) {
    notFound()
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
              <span>Type</span>
              <strong>{event.category}</strong>
            </div>
            <div>
              <span>Dates</span>
              <strong>{formatAgendaDateRange(event)}</strong>
            </div>
            <div>
              <span>Horaires</span>
              <strong>{event.time || "À compléter"}</strong>
            </div>
            <div>
              <span>Lieu</span>
              <strong>{event.venue}</strong>
            </div>
            <div>
              <span>Adresse</span>
              <strong>{location.label || "Adresse à compléter"}</strong>
            </div>
            <div>
              <span>Ville</span>
              <strong>{event.city}</strong>
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

          {event.additionalInfo && event.additionalInfo.length > 0 ? (
            <div className="agenda-detail-extra">
              <h2>Informations complémentaires</h2>
              <div className="agenda-detail-info-grid">
                {event.additionalInfo.map((item) => (
                  <div key={`${item.label}-${item.value}`}>
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </article>

        <aside className="agenda-detail-side">
          <h2>Réservation</h2>
          <p>{event.venue}</p>
          <p>{location.label || "Adresse à compléter"}</p>
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
