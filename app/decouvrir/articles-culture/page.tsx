import Link from "next/link"
import type { Metadata } from "next"
import { getPublishedArticles } from "../articles-data"
import { requestLocale } from "@/lib/i18n/server"
import { uiText } from "@/data/i18n/messages"

// ── Revalidation ISR — même logique que la page Magazine ────────────────────
export const revalidate = 3600

export const metadata: Metadata = {
  title: "Tous les articles | Magazine | Dance Lab",
  description:
    "Retrouvez l'ensemble des articles du Magazine Dance Lab — décryptages, culture, parcours, histoire et ressources pour comprendre la danse autrement.",
}

export default async function ArticlesCulturePage() {
  const locale = await requestLocale()
  const t = (text: string) => uiText(locale, text)

  // Uniquement les articles publiés, triés par publishedAt décroissant
  const sorted = getPublishedArticles()

  // Catégories uniques parmi les articles publiés (state values stay FR)
  const categories = ["Tous", ...Array.from(new Set(sorted.map((a) => a.category)))]

  return (
    <main className="mag-page">

      {/* ══ EN-TÊTE ════════════════════════════════════════════════════════ */}
      <section className="mag-articles-header">
        <div className="container">
          <Link href="/decouvrir" className="mag-back-link">
            {t('← Magazine')}
          </Link>
          <h1 className="mag-articles-title">{t('Tous les articles')}</h1>
          <p className="mag-articles-count">{sorted.length} {t('articles publiés')}</p>

          <nav className="mag-articles-cats" aria-label={t('Filtrer par catégorie')}>
            {categories.map((cat) => (
              <span key={cat} className="mag-articles-cat">
                {cat === 'Tous' ? t('Tous') : cat}
              </span>
            ))}
          </nav>
        </div>
      </section>

      {/* ══ GRILLE ══════════════════════════════════════════════════════════ */}
      <section className="mag-articles-body">
        <div className="container">
          <div className="mag-recent-grid mag-articles-grid">
            {sorted.map((article) => (
              <Link
                key={article.slug}
                href={`/decouvrir/articles/${article.slug}`}
                className="mag-card"
              >
                <div className="mag-card-img">
                  <img src={article.image} alt={article.title} style={article.imageObjectPosition ? { objectPosition: article.imageObjectPosition } : undefined} />
                  <div className="mag-card-overlay">
                    <span className="mag-card-category">{article.category}</span>
                    <h2 className="mag-card-title">{article.title}</h2>
                  </div>
                </div>

                <div className="mag-card-foot">
                  <span className="mag-card-date">{article.publishedDate}</span>
                  <span className="mag-card-read">{article.readTime}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

    </main>
  )
}
