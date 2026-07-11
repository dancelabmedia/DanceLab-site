import { notFound } from "next/navigation"
import { explorerSections, getExplorerSection } from "../explorer-data"

type PageProps = {
  params: Promise<{
    slug: string
  }>
}

export function generateStaticParams() {
  return explorerSections.map((section) => ({
    slug: section.slug,
  }))
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const section = getExplorerSection(slug)

  if (!section) {
    return {
      title: "Explorer | Dance Lab",
    }
  }

  return {
    title: `${section.label} | Explorer | Dance Lab`,
    description: section.intro,
  }
}

export default async function ExplorerDetailPage({ params }: PageProps) {
  const { slug } = await params
  const section = getExplorerSection(slug)

  if (!section) {
    notFound()
  }

  const relatedSections = explorerSections.filter((item) => item.slug !== section.slug).slice(0, 3)

  return (
    <main className="explorer-page">
      <section className="explorer-hero explorer-hero--detail">
        <div className="container">
          <span className="section-label">Explorer · {section.kicker}</span>
          <h1>{section.title}</h1>
          <p>{section.intro}</p>
        </div>
      </section>

      <section className="explorer-feature">
        <div className="container explorer-feature-grid">
          <article className="explorer-lead-card">
            <span>{section.lead.eyebrow}</span>
            <h2>{section.lead.title}</h2>
            <p>{section.lead.text}</p>
          </article>

          <div className="explorer-quote-card">
            <span>Point de vue</span>
            <blockquote>{section.quote}</blockquote>
          </div>
        </div>
      </section>

      <section className="explorer-index">
        <div className="container">
          <div className="explorer-section-heading">
            <span className="section-label">Repères</span>
            <h2>Une structure pour comprendre, comparer et approfondir</h2>
            <p>
              Ces blocs posent les fondations éditoriales de la rubrique. Ils
              pourront accueillir des articles, portraits, épisodes, ressources et
              recommandations au fil du développement du média.
            </p>
          </div>

          <div className="explorer-grid explorer-grid--three">
            {section.cards.map((card) => (
              <article key={card.title} className="explorer-card">
                <span>{card.label}</span>
                <h3>{card.title}</h3>
                <p>{card.text}</p>
                <small>À compléter</small>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="explorer-collections">
        <div className="container">
          <div className="explorer-section-heading">
            <span className="section-label">Collections</span>
            <h2>Des formats prêts à enrichir la rubrique</h2>
          </div>

          <div className="explorer-collection-list">
            {section.collections.map((collection, index) => (
              <article key={collection.title} className="explorer-collection-item">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <h3>{collection.title}</h3>
                  <p>{collection.text}</p>
                </div>
                <small>À compléter</small>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="explorer-index explorer-related">
        <div className="container">
          <div className="explorer-section-heading">
            <span className="section-label">Continuer l'exploration</span>
            <h2>Rubriques liées</h2>
          </div>

          <div className="explorer-grid explorer-grid--three">
            {relatedSections.map((item) => (
              <a key={item.slug} href={`/explorer/${item.slug}`} className="explorer-card explorer-card--compact">
                <span>{item.kicker}</span>
                <h3>{item.label}</h3>
                <p>{item.intro}</p>
                <small>Explorer</small>
              </a>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
