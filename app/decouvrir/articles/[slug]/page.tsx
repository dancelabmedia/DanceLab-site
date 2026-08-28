import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import HistoryBackLink from "../../../../components/HistoryBackLink"
import {
  getMagazineArticleBySlug,
  getPublishedArticles,
  isArticlePublished,
  type DocLink,
} from "../../articles-data"
import CommentsSection from "../../../components/CommentsSection"
import ArticleHeroSlider from "./ArticleHeroSlider"
import ScrollReveal from "../../../../components/ScrollReveal"
import PhotoCredit from "../../../../components/PhotoCredit"
import ReadingProgress from "../../../../components/ReadingProgress"

// ── Revalidation ISR ────────────────────────────────────────────────────────
// Re-génère la page au maximum toutes les heures.
// → Un article programmé devient accessible dans l'heure suivant publishedAt.
// → Avant publishedAt, la page renvoie une 404 (voir guard ci-dessous).
export const revalidate = 3600

// ── Encart documentaire ─────────────────────────────────────────────────────
function DocCard({ doc }: { doc: DocLink }) {
  return (
    <a
      href={doc.url}
      target="_blank"
      rel="noopener noreferrer"
      className="doc-card"
      aria-label={`Voir ${doc.title} sur ${doc.platform}`}
    >
      {doc.thumbnail && (
        <div className="doc-card-thumb" aria-hidden="true">
          <img src={doc.thumbnail} alt="" loading="lazy" />
        </div>
      )}
      <div className="doc-card-body">
        <span className="doc-card-platform">
          {doc.platform}
          {doc.free && <span className="doc-card-free">Gratuit</span>}
        </span>
        <span className="doc-card-title">{doc.title}</span>
        <span className="doc-card-cta">
          Voir le documentaire
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M2 6h8M6 2l4 4-4 4"/>
          </svg>
        </span>
      </div>
      <span className="doc-card-icon" aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
          <polyline points="15 3 21 3 21 9"/>
          <line x1="10" y1="14" x2="21" y2="3"/>
        </svg>
      </span>
    </a>
  )
}

type ArticlePageProps = {
  params: Promise<{
    slug: string
  }>
}

export function generateStaticParams() {
  // Ne pré-génère que les articles déjà publiés au moment du build.
  // Les articles programmés dans le futur seront rendus à la demande
  // (dynamicParams = true par défaut) et mis en cache après leur first request.
  return getPublishedArticles().map((article) => ({
    slug: article.slug,
  }))
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params
  const article = getMagazineArticleBySlug(slug)

  if (!article || !isArticlePublished(article)) {
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

  // Guard : brouillons et articles programmés → 404 publique
  // Un visiteur qui connaîtrait l'URL en avance ne peut pas lire l'article
  if (!article || !isArticlePublished(article)) {
    notFound()
  }

  const relatedArticles = getPublishedArticles()
    .filter((item) => item.slug !== article.slug)
    .slice(0, 2)

  // Slides pour le hero slider (articles avec useHeroSlider = true)
  const heroSlides = article.useHeroSlider
    ? article.sections
        .map((s, i) => ({ s, i }))
        .filter(({ s }) => !!s.docLink?.thumbnail)
        .map(({ s, i }) => ({
          thumbnail: s.docLink!.thumbnail!,
          heading: s.heading,
          sectionId: `article-section-${i}`,
        }))
    : []

  return (
    <main className="article-page">
      {/* Barre de progression de lecture — fixed, top: 0, au-dessus du header */}
      <ReadingProgress />

      {/* Même système de défilement que la page À propos */}
      <ScrollReveal selector=".article-page .article-content p, .article-page .article-content h2, .article-page .article-content blockquote, .article-page .article-content .article-section-img, .article-page .article-content .doc-card, .article-page .article-conclusion p" />

      <section
        className="article-hero"
        style={article.heroAspectRatio ? { aspectRatio: article.heroAspectRatio } : undefined}
      >
        {/* Photo plein cadre en arrière-plan */}
        <div className="article-hero-bg" aria-hidden="true">
          {article.useHeroSlider && heroSlides.length > 0 ? (
            <ArticleHeroSlider slides={heroSlides} />
          ) : (
            <img
              src={article.image}
              alt=""
              style={article.imageObjectPosition ? { objectPosition: article.imageObjectPosition } : undefined}
            />
          )}
          <div className="article-hero-overlay" />
          {/* Crédit photo au survol — système global PhotoCredit */}
          <PhotoCredit credit={article.imageCredit} />
        </div>

        {/* Texte superposé */}
        <div className="container article-hero-content">
          <div className="article-hero-text">
            <HistoryBackLink fallbackHref="/decouvrir" className="article-back">
              ← Retour au magazine
            </HistoryBackLink>
            <span className="article-hero-category">{article.category}</span>
            <h1>{article.title}</h1>
            <p className="article-hero-chapo">{article.chapo}</p>
            <p className="article-hero-meta">
              {article.publishedDate}&thinsp;·&thinsp;{article.category}&thinsp;·&thinsp;{article.readTime} de lecture
            </p>
          </div>
        </div>
      </section>

      <section className="article-body">
        <div className="container article-body-grid">
          <article className="article-content" data-article-content>
            {article.sections.map((section, i) => {
              const docLink = section.docLink ?? null
              return (
                <section key={i} id={`article-section-${i}`}>
                  {section.heading && <h2>{section.heading}</h2>}
                  {section.paragraphs.map((paragraph, pi) => (
                    <p key={pi} dangerouslySetInnerHTML={{ __html: paragraph }} />
                  ))}
                  {section.items && section.items.length > 0 && (
                    <ul className="article-items">
                      {section.items.map((item, ii) => (
                        <li key={ii}>
                          <span className="article-item-prefix" aria-hidden="true">
                            {section.itemPrefix ?? "•"}
                          </span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {section.itemConclusion && (
                    <p className="article-item-conclusion">{section.itemConclusion}</p>
                  )}
                  {section.sectionImage && (
                    <figure className="article-section-img">
                      <img
                        src={section.sectionImage}
                        alt={section.sectionImageAlt ?? ""}
                        loading="lazy"
                      />
                    </figure>
                  )}
                  {docLink !== null && <DocCard doc={docLink} />}
                </section>
              )
            })}

            <div className="article-conclusion">
              {Array.isArray(article.conclusion)
                ? article.conclusion.map((para, i) => <p key={i}>{para}</p>)
                : <p>{article.conclusion}</p>
              }
            </div>
          </article>

          <aside className="article-sidebar">

            {/* Encart épisodes personnalisé OU encart source par défaut */}
            {article.episodeLinks ? (
              <div className="article-panel article-panel--episodes">
                <span>Épisodes à écouter pour aller plus loin</span>
                <ul className="article-episode-links">
                  {article.episodeLinks.map((ep) => (
                    <li key={ep.slug}>
                      <Link href={`/episodes/${ep.slug}`} className="article-episode-item">
                        <div className="article-episode-img">
                          <img src={ep.image} alt={ep.name} />
                        </div>
                        <div className="article-episode-info">
                          <small>Épisode {ep.number}</small>
                          <strong>{ep.name}</strong>
                        </div>
                        <svg className="article-episode-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="article-panel">
                <span>Épisode source</span>
                <h2>{article.guest}</h2>
                <p>Article construit à partir de l'épisode {article.episodeNumber} de Dance Lab.</p>
                <Link href={`/episodes/${article.episodeSlug}`}>Écouter l'épisode</Link>
              </div>
            )}

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

      <CommentsSection slug={article.slug} />

      <section className="article-related">
        <div className="container">
          <div className="discover-section-heading">
            <span className="section-label">À lire aussi</span>
            <h2>Prolonger l'écoute</h2>
          </div>
          <div className="discover-grid discover-grid--compact">
            {relatedArticles.map((item) => (
              <Link key={item.slug} href={`/decouvrir/articles/${item.slug}`} className="discover-card discover-card--article">
                {item.image && (
                  <div className="discover-card-img">
                    <img
                      src={item.image}
                      alt=""
                      loading="lazy"
                      style={item.imageObjectPosition ? { objectPosition: item.imageObjectPosition } : undefined}
                    />
                    <PhotoCredit credit={item.imageCredit} />
                  </div>
                )}
                <div className="discover-card-body">
                  <span>{item.category}</span>
                  <h3>{item.title}</h3>
                  <p>{item.chapo}</p>
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
