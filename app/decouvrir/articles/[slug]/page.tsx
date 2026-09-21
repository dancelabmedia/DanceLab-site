import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import HistoryBackLink from "../../../../components/HistoryBackLink"
import {
  getPublishedArticles,
  isArticlePublished,
  getReadTime,
  type DocLink,
} from "../../articles-data"
import { getArticleBySlug, getAllPublishedSlugs } from "@/lib/all-articles"
import CommentsSection from "../../../components/CommentsSection"
import ArticleHeroSlider from "./ArticleHeroSlider"
import ArticleHeroCrossfade from "./ArticleHeroCrossfade"
import ArticleTicker from "./ArticleTicker"
import ArticleSidebar, { SidebarFrameContent } from "./ArticleSidebar"
import ScrollReveal from "../../../../components/ScrollReveal"
import { buildSidebarFrames } from "@/lib/article-sidebar"
import PhotoCredit from "../../../../components/PhotoCredit"
import ReadingProgress from "../../../../components/ReadingProgress"
import { requestLocale } from "@/lib/i18n/server"
import { uiText } from "@/data/i18n/messages"

// ── Revalidation ISR ────────────────────────────────────────────────────────
// Re-génère la page au maximum toutes les heures.
// → Un article programmé devient accessible dans l'heure suivant publishedAt.
// → Avant publishedAt, la page renvoie une 404 (voir guard ci-dessous).
export const revalidate = 3600

// ── Encart documentaire ─────────────────────────────────────────────────────
function DocCard({ doc, t }: { doc: DocLink; t: (s: string) => string }) {
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
          {doc.free && <span className="doc-card-free">{t('Gratuit')}</span>}
        </span>
        <span className="doc-card-title">{doc.title}</span>
        <span className="doc-card-cta">
          {t('Voir le documentaire')}
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
  return getAllPublishedSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params
  const article = getArticleBySlug(slug)

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
  const locale = await requestLocale()
  const t = (text: string) => uiText(locale, text)
  const article = getArticleBySlug(slug)

  // Guard : brouillons et articles programmés → 404 publique
  // Un visiteur qui connaîtrait l'URL en avance ne peut pas lire l'article
  if (!article || !isArticlePublished(article)) {
    notFound()
  }

  const relatedArticles = getPublishedArticles()
    .filter((item) => item.slug !== article.slug)
    .slice(0, 2)

  // Slides pour le hero slider (articles avec useHeroSlider = true)
  // Frames de la colonne éditoriale latérale — une par section
  const sidebarFrames = buildSidebarFrames(article)

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

      {/* ══════════════════════════════════════════════════════
            HERO — même structure que .ep-hero des pages Écouter :
            image plein cadre (droite), dégradé sombre (gauche),
            texte éditorial en bas à gauche, fond sticky au scroll.
          ══════════════════════════════════════════════════════ */}
      <section className="article-hero">

        {/* Couche sticky : image + dégradé restent fixes pendant le premier scroll */}
        <div className="article-hero-sticky-bg">
          <div
            className={`article-hero-bg${article.heroImageType === 'portrait' ? ' article-hero-bg--portrait' : ''}`}
            aria-hidden="true"
          >
            {article.heroImages && article.heroImages.length > 1 ? (
              /* Rotation crossfade automatique entre plusieurs invité·es */
              <ArticleHeroCrossfade images={article.heroImages} />
            ) : article.useHeroSlider && heroSlides.length > 0 ? (
              <ArticleHeroSlider slides={heroSlides} />
            ) : (
              <img
                src={article.image}
                alt=""
                style={article.imageObjectPosition ? { objectPosition: article.imageObjectPosition } : undefined}
              />
            )}
          </div>
          <div className="article-hero-overlay" aria-hidden="true" />
          {/* Crédit photo au survol */}
          <PhotoCredit credit={article.imageCredit} />
        </div>

        {/* Texte posé sur la partie gauche assombrie — défile normalement */}
        <div className="article-hero-content">
          <div className="article-hero-text">
            <HistoryBackLink fallbackHref="/decouvrir" className="article-back">
              {t('← Retour au magazine')}
            </HistoryBackLink>
            <span className="article-hero-category">{article.category}</span>
            <h1>{article.title}</h1>
            <p className="article-hero-chapo">{article.chapo}</p>
            <p className="article-hero-meta">
              {article.publishedDate}&thinsp;·&thinsp;{article.category}&thinsp;·&thinsp;{getReadTime(article)} {t('de lecture')}
            </p>
          </div>
        </div>

      </section>

      {/* Bandeau éditorial défilant — thèmes extraits du contenu de l'article */}
      <ArticleTicker themes={article.themes} />

      <section className="article-body">
        <div className="container article-body-grid">
          <article className="article-content" data-article-content>
            {article.sections.map((section, i) => {
              const docLink = section.docLink ?? null
              return (
                <section
                  key={i}
                  id={`article-section-${i}`}
                >
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
                  {docLink !== null && <DocCard doc={docLink} t={t} />}

                  {/* Slot mobile — même contenu que la sidebar, rendu statiquement
                      entre chaque section. Masqué sur desktop (≥ 981px via CSS). */}
                  {i < sidebarFrames.length && (
                    <div className="asb-mobile-slot">
                      <SidebarFrameContent frame={sidebarFrames[i]} />
                    </div>
                  )}
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

          {/* Colonne éditoriale dynamique — sticky desktop, masquée sur mobile */}
          <aside className="article-sidebar">
            <ArticleSidebar frames={sidebarFrames} />
          </aside>
        </div>
      </section>

      <CommentsSection slug={article.slug} />

      <section className="article-related">
        <div className="container">
          <div className="discover-section-heading">
            <span className="section-label">{t('À lire aussi')}</span>
            <h2>{t("Prolonger l'écoute")}</h2>
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
                  <small>{t("Lire l'article")}</small>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
