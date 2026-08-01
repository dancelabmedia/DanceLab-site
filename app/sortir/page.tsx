import type { Metadata } from "next"
import AgendaExperience from "../agenda/AgendaExperience"

export const metadata: Metadata = {
  title: "Sortir | Dance Lab",
  description:
    "Spectacles, festivals, performances et événements danse à ne pas manquer en France, sélectionnés par Dance Lab.",
}

export default function SortirPage() {
  return (
    <main className="srt-page">
      <section className="srt-hero">
        <div className="container srt-hero-inner">
          <span className="section-label">Sortir</span>
          <h1>
            Les rendez-vous danse<br />
            à ne pas manquer.
          </h1>
          <p className="srt-hero-sub">
            Spectacles, festivals, performances et événements partout en France.
          </p>
        </div>
      </section>

      <AgendaExperience events={[]} />
    </main>
  )
}
