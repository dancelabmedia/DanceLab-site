import Link from "next/link"
import { magazineArticles } from "./articles-data"

export default function DecouvrirPage() {
  return (
    <main className="discover-page">
      <section className="discover-hero discover-hero--compact">
        <div className="container">
          <span className="section-label">Découvrir</span>
          <h1>Comprendre la danse comme une culture vivante.</h1>
          <p>
            Articles, analyses et décryptages : cette rubrique rassemble
            les contenus éditoriaux construits à partir des épisodes Dance Lab.
          </p>
        </div>
      </section>

      <section className="discover-index">
        <div className="container">
          <div className="discover-grid">
            {magazineArticles.map((article) => (
              <Link
                key={article.slug}
                href={`/decouvrir/articles/${article.slug}`}
                className="discover-card discover-card--article"
              >
                {article.image && (
                  <div className="discover-card-img">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={article.image} alt={article.title} />
                  </div>
                )}
                <div className="discover-card-body">
                  <span>{article.category}</span>
                  <h3>{article.title}</h3>
                  <p>{article.chapo}</p>
                  <small>Lire l'article</small>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
