import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getMagazineArticleBySlug, magazineArticles } from "../../articles-data"

type ArticlePageProps = {
  params: Promise<{
    slug: string
  }>
}

export function generateStaticParams() {
  return magazineArticles.map((article) => ({
    slug: article.slug,
  }))
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params
  const article = getMagazineArticleBySlug(slug)

  if (!article) {
    return {
      title: "Article introuvable | Dance Lab",
    }
  }

  return {
    title: `${article.title} | Dance Lab`,
    description: article.chapo,
    openGraph: {
      title: article.title,
      description: article.chapo,
      images: [article.image],
      type: "article",
    },
  }
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params
  const article = getMagazineArticleBySlug(slug)

  if (!article) {
    notFound()
  }

  const relatedArticles = magazineArticles.filter((item) => item.slug !== article.slug).slice(0, 2)

  return (
    <main className="article-page">
      <section className="article-hero">
        <div className="container article-hero-grid">
          <div className="article-hero-copy">
            <Link href="/decouvrir/articles-culture" className="article-back">
              Retour au magazine
            </Link>
            <span className="section-label">{article.category}</span>
            <h1>{article.title}</h1>
            <p>{article.chapo}</p>
            <div className="article-meta">
              <span>{article.publishedDate}</span>
              <span>{article.category}</span>
              <span>{article.readTime}</span>
            </div>
          </div>
          <div className="article-hero-image">
            <img src={article.image} alt={article.guest} />
          </div>
        </div>
      </section>

      <section className="article-body">
        <div className="container article-body-grid">
          <article className="article-content">
            {article.quote ? (
              <blockquote>
                <p>{article.quote}</p>
              </blockquote>
            ) : null}

            {article.sections.map((section) => (
              <section key={section.heading}>
                <h2>{section.heading}</h2>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </section>
            ))}

            <div className="article-conclusion">
              <p>{article.conclusion}</p>
            </div>
          </article>

          <aside className="article-sidebar">
            <div className="article-panel">
              <span>Épisode source</span>
              <h2>{article.guest}</h2>
              <p>Article construit à partir de l'épisode {article.episodeNumber} de Dance Lab.</p>
              <Link href={`/episodes/${article.episodeSlug}`}>Écouter l'épisode</Link>
            </div>

            {article.aside ? (
              <div className="article-panel">
                <span>{article.aside.title}</span>
                <ul>
                  {article.aside.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="article-panel">
              <span>Tags</span>
              <div className="article-tags">
                {article.tags.map((tag) => (
                  <small key={tag}>{tag}</small>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="article-related">
        <div className="container">
          <div className="discover-section-heading">
            <span className="section-label">À lire aussi</span>
            <h2>Prolonger l'écoute</h2>
          </div>
          <div className="discover-grid discover-grid--compact">
            {relatedArticles.map((item) => (
              <Link key={item.slug} href={`/decouvrir/articles/${item.slug}`} className="discover-card">
                <span>{item.category}</span>
                <h3>{item.title}</h3>
                <p>{item.chapo}</p>
                <small>Lire l'article</small>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
