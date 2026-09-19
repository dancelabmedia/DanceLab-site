import type { Metadata } from "next"
import AgendaExperience from "../agenda/AgendaExperience"
import { requestLocale } from "@/lib/i18n/server"
import { uiText } from "@/data/i18n/messages"

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
  const locale = await requestLocale()
  const t = (text: string) => uiText(locale, text)

  return (
    <main className="srt-page">
      <section className="srt-hero">
        <div className="container srt-hero-inner">
          <span className="section-label">{t('Sortir')}</span>
          <h1>
            {locale === 'en'
              ? t('Les rendez-vous danse à ne pas manquer.')
              : <>Les rendez-vous danse<br />à ne pas manquer.</>}
          </h1>
          <p className="srt-hero-sub">
            {t('Spectacles, festivals, performances et événements partout en France.')}
          </p>
        </div>
      </section>

      <AgendaExperience events={[]} />
    </main>
  )
}
