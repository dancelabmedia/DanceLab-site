import Link from "next/link"
import type { Metadata } from "next"
import { magazineArticles } from "./articles-data"

export const metadata: Metadata = {
  title: "Découvrir | Dance Lab",
  description:
    "Articles, analyses, ressources, interviews et décryptages pour mieux comprendre la danse comme une culture vivante.",
}

// ── Format de date depuis DD.MM.YY → "18 juin 2026" ──────────
function formatArticleDate(dateStr: string): string {
  const months = [
    "janvier","février","mars","avril","mai","juin",
    "juillet","août","septembre","octobre","novembre","décembre",
  ]
  // Format attendu : DD.MM.YY (ex: "18.06.26")
  const parts = dateStr.split(".")
  if (parts.length !== 3) return dateStr
  const day = parseInt(parts[0])
  const month = parseInt(parts[1]) - 1
  const year = 2000 + parseInt(parts[2])
  return `${day} ${months[month]} ${year}`
}

export default function DecouvrirPage() {
  const latestArticle = magazineArticles[0]

  return (
    <main className="discover-page">

      {/* ══════════════════════════════════════════════════════════
          HERO — deux colonnes éditoriales + bande verticale
      ══════════════════════════════════════════════════════════ */}
      <section className="dc-hero" aria-label="En-tête Découvrir">

        {/* ── Bande verticale magazine ── */}
        <div className="dc-nav-strip" aria-hidden="true">
          <span className="dc-nav-num">01</span>
          <div className="dc-nav-line" />
          <span className="dc-nav-label">Découvrir</span>
          <div className="dc-nav-dots" />
        </div>

        {/* ── Colonne gauche : texte + CTAs ── */}
        <div className="dc-hero-left">
          <span className="dc-kicker">Découvrir</span>

          <h1 className="dc-hero-title">
            Comprendre la danse<br />
            comme une culture<br />
            vivante.
          </h1>

          <p className="dc-hero-desc">
            Articles, analyses, ressources, interviews et décryptages
            pour mieux comprendre la danse.
          </p>

          <div className="dc-ctas">
            <Link href="/decouvrir/articles-culture" className="dc-cta dc-cta--primary">
              Découvrir les articles
            </Link>
            <Link href="/explorer/styles-de-danse" className="dc-cta dc-cta--outline">
              Explorer les styles
            </Link>
          </div>
        </div>

        {/* ── Colonne droite : photo + formes décoratives ── */}
        <div className="dc-hero-right">
          {/* Formes géométriques — profondeur discrète */}
          <div className="dc-shapes" aria-hidden="true">
            <div className="dc-shape-circle dc-shape-circle--lg" />
            <div className="dc-shape-circle dc-shape-circle--sm" />
            <div className="dc-shape-arc" />
          </div>

          {/* Photo */}
          <div className="dc-hero-photo-wrap">
            <img
              src={latestArticle.image}
              alt=""
              className="dc-hero-photo"
              aria-hidden="true"
            />
          </div>

          {/* Dégradé gauche pour la lisibilité */}
          <div className="dc-hero-fade" aria-hidden="true" />

          {/* Légende discrète — article */}
          <div className="dc-hero-caption">
            <span className="dc-hero-caption-ep">{latestArticle.category}</span>
            <span className="dc-hero-caption-guest">{latestArticle.title}</span>
          </div>
        </div>

      </section>

      {/* ══════════════════════════════════════════════════════════
          DERNIER ARTICLE — grande carte horizontale
      ══════════════════════════════════════════════════════════ */}
      <section className="dc-latest">
        <div className="dc-latest-inner">

          {/* En-tête de section */}
          <div className="dc-latest-header">
            <h2 className="dc-latest-title">Dernier article</h2>
            <Link href="/decouvrir/articles-culture" className="dc-latest-seeall">
              Voir tous les articles <span aria-hidden="true">→</span>
            </Link>
          </div>

          {/* Carte horizontale */}
          <div className="dc-latest-card">

            {/* Image de couverture */}
            <div className="dc-latest-img">
              <img
                src={latestArticle.image}
                alt={latestArticle.title}
              />
            </div>

            {/* Contenu */}
            <div className="dc-latest-body">
              <span className="dc-latest-ep-num">{latestArticle.category}</span>

              <h3 className="dc-latest-ep-title">{latestArticle.title}</h3>

              <p className="dc-latest-ep-excerpt">{latestArticle.chapo}</p>

              {/* Méta : temps de lecture + date */}
              <div className="dc-latest-meta">
                {latestArticle.readTime && (
                  <span className="dc-latest-meta-item">
                    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true" style={{ verticalAlign: "middle", marginRight: 5 }}>
                      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.3"/>
                      <path d="M7 4v3.2l2 1.4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                    </svg>
                    {latestArticle.readTime} de lecture
                  </span>
                )}
                {latestArticle.publishedDate && (
                  <span className="dc-latest-meta-item">
                    {formatArticleDate(latestArticle.publishedDate)}
                  </span>
                )}
              </div>

              {/* CTA principal */}
              <Link href={`/decouvrir/articles/${latestArticle.slug}`} className="dc-listen-btn">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
                  <rect x="1" y="2" width="10" height="1.3" rx=".65"/>
                  <rect x="1" y="5.35" width="8" height="1.3" rx=".65"/>
                  <rect x="1" y="8.7" width="5.5" height="1.3" rx=".65"/>
                </svg>
                Lire l&apos;article
              </Link>
            </div>

          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          ARTICLES — grille existante (inchangée)
      ══════════════════════════════════════════════════════════ */}
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
                  <small>Lire l&apos;article</small>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

    </main>
  )
}
