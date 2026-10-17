import type { Metadata } from "next"
import AgendaExperience from "../agenda/AgendaExperience"
import { getInitialCulturalEvents } from "../agenda/initial-events"

export const revalidate = 300

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

export default async function SortirPage() {
  const initialEvents = getInitialCulturalEvents()

  return (
    <main className="srt-page">
      <AgendaExperience events={initialEvents} />
    </main>
  )
}
