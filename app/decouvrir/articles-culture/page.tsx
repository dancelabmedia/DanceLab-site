import Link from "next/link"
import { magazineArticles } from "../articles-data"
import { featuredDiscoverArticles } from "../discover-data"

export default function ArticlesCulturePage() {
  const articles = featuredDiscoverArticles.filter((article) =>
    ["Guide", "Décryptage", "Culture"].includes(article.category)
  )

  return (
    <main className="discover-page">
      <section className="discover-hero discover-hero--compact">
        <div className="container">
          <span className="section-label">Découvrir</span>
          <h1>Articles culture</h1>
          <p>
            Une future bibliothèque éditoriale pour publier des articles de fond,
            des récits, des guides et des regards critiques sur la danse.
          </p>
        </div>
      </section>

      <section className="discover-index">
        <div className="container">
          <div className="discover-section-heading">
            <span className="section-label">Articles publiés</span>
            <h2>Des épisodes transformés en formats éditoriaux</h2>
            <p>
              Une première sélection d'articles construits à partir des épisodes
              de Dance Lab, pour prolonger l'écoute par des repères concrets.
            </p>
          </div>

          <div className="discover-grid">
            {magazineArticles.map((article) => (
              <Link
                key={article.slug}
                href={`/decouvrir/articles/${article.slug}`}
                className="discover-card discover-card--article"
              >
                <span>{article.category}</span>
                <h3>{article.title}</h3>
                <p>{article.chapo}</p>
                <small>Lire l'article</small>
              </Link>
            ))}
          </div>

          <div className="discover-section-heading discover-section-heading--secondary">
            <span className="section-label">À développer</span>
            <h2>Les prochains formats du magazine</h2>
          </div>

          <div className="discover-grid">
            {articles.map((article) => (
              <article key={article.title} className="discover-card">
                <span>{article.category}</span>
                <h3>{article.title}</h3>
                <p>{article.meta}</p>
                <small>À compléter</small>
              </article>
            ))}
            <article className="discover-card discover-card--quiet">
              <span>Article</span>
              <h3>Nouvelle publication</h3>
              <p>
                Emplacement réservé pour un prochain article long format, une
                critique ou un récit culturel.
              </p>
              <small>À compléter</small>
            </article>
          </div>
        </div>
      </section>
    </main>
  )
}
