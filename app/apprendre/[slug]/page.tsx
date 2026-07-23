import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { SITE_URL } from "../../../data/site"
import { apprendreSections, getApprendreSection } from "../apprendre-data"

type PageProps = {
  params: Promise<{
    slug: string
  }>
}

export function generateStaticParams() {
  return apprendreSections.map((section) => ({
    slug: section.slug,
  }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const section = getApprendreSection(slug)

  if (!section) {
    return {
      title: "Apprendre | Dance Lab",
    }
  }

  const pageUrl = new URL(`/apprendre/${section.slug}`, SITE_URL).toString()

  return {
    title: `${section.label} | Apprendre | Dance Lab`,
    description: section.intro,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: `${section.label} | Apprendre | Dance Lab`,
      description: section.intro,
      url: pageUrl,
      type: "website",
    },
  }
}

export default async function ApprendreDetailPage({ params }: PageProps) {
  const { slug } = await params
  const section = getApprendreSection(slug)

  if (!section) {
    notFound()
  }

  const relatedSections = apprendreSections.filter((item) => item.slug !== section.slug)

  return (
    <main className="explorer-page">
      <section className="explorer-hero explorer-hero--detail">
        <div className="container">
          <span className="section-label">Apprendre · {section.kicker}</span>
          <h1>{section.title}</h1>
          <p>{section.intro}</p>
        </div>
      </section>

      <section className="explorer-index">
        <div className="container">
          <div className="explorer-section-heading">
            <span className="section-label">{section.label}</span>
            <h2>{section.gridTitle}</h2>
            <p>{section.gridIntro}</p>
          </div>

          <div className="explorer-grid explorer-grid--three">
            <article className="explorer-card">
              <span>À venir</span>
              <h3>Les premiers contenus arrivent bientôt</h3>
              <p>
                Dance Lab prépare actuellement les premières ressources de cette rubrique.
              </p>
              <small>En cours d'enrichissement</small>
            </article>
          </div>
        </div>
      </section>

      <section className="explorer-index explorer-related">
        <div className="container">
          <div className="explorer-section-heading">
            <span className="section-label">Continuer à apprendre</span>
            <h2>Rubriques liées</h2>
          </div>

          <div className="explorer-grid explorer-grid--three">
            {relatedSections.map((item) => (
              <a
                key={item.slug}
                href={`/apprendre/${item.slug}`}
                className="explorer-card explorer-card--compact"
              >
                <span>{item.kicker}</span>
                <h3>{item.label}</h3>
                <p>{item.intro}</p>
                <small>Découvrir</small>
              </a>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
