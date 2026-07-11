"use client"

import { useMemo, useState } from "react"
import type { AgendaEvent } from "./agenda-data"

type AgendaMapProps = {
  events: AgendaEvent[]
}

const FRANCE_BOUNDS = {
  minLat: 42.2,
  maxLat: 51.2,
  minLng: -5.2,
  maxLng: 8.3,
}

function getMarkerPosition(event: AgendaEvent) {
  const x = ((event.lng - FRANCE_BOUNDS.minLng) / (FRANCE_BOUNDS.maxLng - FRANCE_BOUNDS.minLng)) * 100
  const y = 100 - ((event.lat - FRANCE_BOUNDS.minLat) / (FRANCE_BOUNDS.maxLat - FRANCE_BOUNDS.minLat)) * 100

  return {
    left: `${Math.min(94, Math.max(6, x))}%`,
    top: `${Math.min(90, Math.max(10, y))}%`,
  }
}

export default function AgendaMap({ events }: AgendaMapProps) {
  const [activeSlug, setActiveSlug] = useState(events[0]?.slug)
  const activeEvent = useMemo(
    () => events.find((event) => event.slug === activeSlug) ?? events[0],
    [activeSlug, events]
  )

  return (
    <section className="agenda-map-section">
      <div className="container">
        <div className="agenda-map-grid">
          <div className="agenda-map-copy">
            <span className="section-label">Cartographie</span>
            <h2>Voir les événements sur la carte</h2>
            <p>
              Une lecture plus visuelle de l'agenda pour repérer rapidement les
              villes, les festivals et les grands rendez-vous à venir.
            </p>
          </div>

          <div className="agenda-map-shell" aria-label="Carte des événements danse">
            <div className="agenda-map-canvas">
              <div className="agenda-map-shape" aria-hidden="true" />
              {events.map((event) => (
                <button
                  key={event.slug}
                  type="button"
                  className={`agenda-map-marker${activeEvent?.slug === event.slug ? " is-active" : ""}`}
                  style={getMarkerPosition(event)}
                  onClick={() => setActiveSlug(event.slug)}
                  aria-label={`Voir ${event.title}`}
                >
                  <span />
                </button>
              ))}
            </div>

            {activeEvent ? (
              <article className="agenda-map-card">
                <span>{activeEvent.category}</span>
                <h3>{activeEvent.title}</h3>
                <p>{activeEvent.city} · {activeEvent.dates}</p>
                <a href={activeEvent.href} target="_blank" rel="noopener noreferrer">
                  Voir l'événement
                </a>
              </article>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}
