import type { Metadata } from "next"
import AgendaExperience from "./AgendaExperience"
import { upcomingAgendaEvents } from "./agenda-data"

export const metadata: Metadata = {
  title: "Agenda culturel | Dance Lab",
  description:
    "Spectacles, festivals, battles et événements danse à venir en France, sélectionnés par Dance Lab.",
}

export default function AgendaPage() {
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

      <AgendaExperience events={upcomingAgendaEvents} />
    </main>
  )
}
