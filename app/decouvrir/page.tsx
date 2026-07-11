import { magazineArticles } from "./articles-data"
import { discoverSections, featuredDiscoverArticles } from "./discover-data"

export default function DecouvrirPage() {
  return (
    <main className="discover-page">
      <section className="discover-hero">
        <div className="container">
          <span className="section-label">Découvrir</span>
          <h1>Comprendre la danse comme une culture vivante.</h1>
          <p>
            Articles, repères, décryptages et portraits : cette rubrique rassemble
            les contenus éditoriaux qui permettent d'entrer plus profondément dans
            l'univers Dance Lab.
          </p>
        </div>
      </section>

      <section className="discover-feature">
        <div className="container discover-feature-grid">
          <article className="discover-lead-card">
            <span>{magazineArticles[0].category}</span>
            <h2>{magazineArticles[0].title}</h2>
            <p>{magazineArticles[0].chapo}</p>
            <a href={`/decouvrir/articles/${magazineArticles[0].slug}`}>Lire l'article</a>
          </article>

          <div className="discover-stack">
            {magazineArticles.slice(1, 3).map((article) => (
              <a key={article.title} href={`/decouvrir/articles/${article.slug}`} className="discover-stack-item">
                <span>{article.category}</span>
                <strong>{article.title}</strong>
                <small>{article.meta}</small>
              </a>
            ))}
            <a href={featuredDiscoverArticles[0].href} className="discover-stack-item">
              <span>{featuredDiscoverArticles[0].category}</span>
              <strong>{featuredDiscoverArticles[0].title}</strong>
              <small>{featuredDiscoverArticles[0].meta}</small>
            </a>
          </div>
        </div>
      </section>

      <section className="discover-index">
        <div className="container">
          <div className="discover-section-heading">
            <span className="section-label">Rubriques</span>
            <h2>Une architecture éditoriale pensée pour grandir</h2>
            <p>
              Chaque entrée prépare une ligne de contenus claire, identifiable et
              utile pour transformer Dance Lab en véritable média culturel.
            </p>
          </div>

          <div className="discover-grid">
            {discoverSections.map((section) => (
              <a
                key={section.slug}
                href={`/decouvrir/${section.slug}`}
                className="discover-card"
              >
                <span>{section.kicker}</span>
                <h3>{section.title}</h3>
                <p>{section.description}</p>
                <small>Explorer</small>
              </a>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
