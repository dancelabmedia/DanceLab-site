import type { Metadata } from "next"
import AgendaMap from "./AgendaMap"
import { agendaEvents } from "./agenda-data"

export const metadata: Metadata = {
  title: "Agenda culturel | Dance Lab",
  description:
    "Spectacles, festivals, battles et événements danse à venir en France, sélectionnés par Dance Lab.",
}

const categories = ["Tous", ...Array.from(new Set(agendaEvents.map((event) => event.category)))]

export default function AgendaPage() {
  const currentEvents = agendaEvents.filter((event) => event.status === "En cours")
  const upcomingEvents = agendaEvents.filter((event) => event.status === "À venir")

  return (
    <main className="agenda-page">
      <section className="agenda-hero">
        <div className="container">
          <span className="section-label">Agenda culturel</span>
          <h1>Les événements danse à suivre maintenant.</h1>
          <p>
            Une sélection évolutive de spectacles, festivals, battles, ateliers et
            rendez-vous chorégraphiques pour découvrir la danse en France.
          </p>
        </div>
      </section>

      <section className="agenda-index">
        <div className="container">
          <div className="agenda-toolbar">
            <div>
              <span className="section-label">Sélection</span>
              <h2>À venir ou en cours</h2>
            </div>
            <div className="agenda-filters" aria-label="Catégories d'événements">
              {categories.map((category) => (
                <span key={category}>{category}</span>
              ))}
            </div>
          </div>

          {currentEvents.length > 0 ? (
            <section className="agenda-cluster">
              <div className="agenda-cluster-heading">
                <h3>En cours</h3>
                <p>Des rendez-vous déjà ouverts au public ou actuellement actifs.</p>
              </div>
              <div className="agenda-premium-grid">
                {currentEvents.map((event) => (
                  <AgendaCard key={event.slug} event={event} />
                ))}
              </div>
            </section>
          ) : null}

          <section className="agenda-cluster">
            <div className="agenda-cluster-heading">
              <h3>Prochains rendez-vous</h3>
              <p>Les événements à surveiller pour organiser ses sorties danse.</p>
            </div>
            <div className="agenda-premium-grid">
              {upcomingEvents.map((event) => (
                <AgendaCard key={event.slug} event={event} />
              ))}
            </div>
          </section>
        </div>
      </section>

      <AgendaMap events={agendaEvents} />
    </main>
  )
}

function AgendaCard({ event }: { event: (typeof agendaEvents)[number] }) {
  return (
    <article className="agenda-premium-card">
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

        <dl className="agenda-details">
          <div>
            <dt>Dates</dt>
            <dd>{event.dates}</dd>
          </div>
          <div>
            <dt>Lieu</dt>
            <dd>{event.venue} · {event.city}</dd>
          </div>
          <div>
            <dt>Prix</dt>
            <dd>{event.price}</dd>
          </div>
        </dl>

        <div className="agenda-card-footer">
          <small>Source : {event.sourceLabel}</small>
          <a href={event.href} target="_blank" rel="noopener noreferrer">
            Voir l'événement
          </a>
        </div>
      </div>
    </article>
  )
}
