import type { Metadata } from "next"
import AgendaExperience from "../agenda/AgendaExperience"

export const metadata: Metadata = {
  title: "Spectacles, festivals et événements danse | Dance Lab",
  description:
    "Découvre les spectacles de danse, festivals, battles et événements à voir : une sélection Dance Lab pour vivre la danse sur scène et partout ailleurs.",
  openGraph: {
    title: "Spectacles, festivals et événements danse | Dance Lab",
    description:
      "Découvre les spectacles de danse, festivals, battles et événements à voir : une sélection Dance Lab pour vivre la danse sur scène et partout ailleurs.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Spectacles, festivals et événements danse | Dance Lab",
    description:
      "Découvre les spectacles de danse, festivals, battles et événements à voir : une sélection Dance Lab pour vivre la danse sur scène et partout ailleurs.",
  },
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
