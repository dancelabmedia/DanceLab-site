import type { Metadata } from "next"
import { SITE_URL } from "../../data/site"
import { apprendreSections } from "./apprendre-data"

const apprendreUrl = new URL("/apprendre", SITE_URL).toString()

export const metadata: Metadata = {
  title: "Apprendre | Guides, conseils, formations et outils | Dance Lab",
  description:
    "Guides, conseils, formations et outils pour accompagner les artistes et professionnels de la danse à chaque étape de leur parcours.",
  alternates: {
    canonical: apprendreUrl,
  },
  openGraph: {
    title: "Apprendre | Dance Lab",
    description:
      "Guides, conseils, formations et outils pour accompagner les artistes et professionnels de la danse.",
    url: apprendreUrl,
    type: "website",
  },
}

export default function ApprendrePage() {
  return (
    <main className="explorer-page">
      <section className="explorer-hero">
        <div className="container">
          <span className="section-label">Apprendre</span>
          <h1>Des ressources pour progresser, se structurer et faire évoluer son parcours.</h1>
          <p>
            Guides, conseils, formations et outils : un espace pensé pour accompagner
            les artistes et les professionnels de la danse dans leur pratique et leurs projets.
          </p>
        </div>
      </section>

      <section className="explorer-index">
        <div className="container">
          <div className="explorer-section-heading">
            <span className="section-label">Rubriques</span>
            <h2>Des ressources organisées pour répondre aux besoins du terrain</h2>
            <p>
              Chaque rubrique accueillera progressivement des contenus pratiques,
              accessibles et utiles à chaque étape d'un parcours dans la danse.
            </p>
          </div>

          <div className="explorer-grid">
            {apprendreSections.map((section) => (
              <a
                key={section.slug}
                href={`/apprendre/${section.slug}`}
                className="explorer-card"
              >
                <span>{section.kicker}</span>
                <h3>{section.label}</h3>
                <p>{section.intro}</p>
                <small>Découvrir</small>
              </a>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
