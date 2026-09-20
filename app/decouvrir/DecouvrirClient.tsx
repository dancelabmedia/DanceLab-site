'use client'

import Link from "next/link"
import { sectionVisibility } from '@/data/section-visibility'
import { useState, useMemo, useRef, useEffect, useCallback } from "react"
import { useLocale } from "@/components/LocaleProvider"
import { uiText } from "@/data/i18n/messages"
import type { MagazineArticle } from "./articles-data"
import MagHeroSlider, { type MagHeroSliderHandle, type SlideArticle } from "./MagHeroSlider"
import PhotoCredit from "@/components/PhotoCredit"
import MagazineEditorial from "./MagazineEditorial"
import type { UnifiedEpisode } from "@/lib/episodes"

// ─── Données statiques ─────────────────────────────────────────────────────────

const MAG_CATEGORIES = [
  "Tous",
  "Décryptage",
  "Culture",
  "Histoire",
  "Parcours",
  "Ressources",
  "Sélection",
]

const STYLES = [
  { name: "Break",      slug: "break",          image: "/images/styles-de-danse/break.png" },
  { name: "Claquettes", slug: "claquettes",      image: "/images/styles-de-danse/claquettes.png" },
  { name: "Classique",  slug: "danse-classique", image: "/images/styles-de-danse/danseclassique.png" },
  { name: "Jazz",       slug: "jazz",            image: "/images/styles-de-danse/jazz.png" },
]

const THEMES = [
  { label: "Métiers & Carrière",       href: "/decouvrir/articles-culture" },
  { label: "Santé & Bien-être",        href: "/decouvrir/articles-culture" },
  { label: "Société & Représentation", href: "/decouvrir/articles-culture" },
  { label: "Culture & Histoire",       href: "/decouvrir/articles-culture" },
  { label: "Marché & Industrie",       href: "/decouvrir/articles-culture" },
  { label: "Ressources & Conseils",    href: "/decouvrir/articles-culture" },
]

// ─── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  /** Articles déjà filtrés (publiés uniquement), triés par publishedAt desc */
  articles: MagazineArticle[]
  /** Dernier épisode publié — affiché dans le bloc "Épisode en lien" */
  latestEpisode?: UnifiedEpisode
  /** Épisodes récents pour le carrousel de la section podcast */
  carouselEpisodes?: UnifiedEpisode[]
}

// ─── Composant principal ───────────────────────────────────────────────────────

export default function DecouvrirClient({ articles, latestEpisode, carouselEpisodes }: Props) {
  const locale = useLocale()
  const t = (text: string) => uiText(locale, text)
  const [search, setSearch]               = useState("")
  const [activeCategory, setActiveCategory] = useState("Tous")
  const heroRef = useRef<HTMLElement>(null)

  // ── Nav éditoriale du slider ───────────────────────────────────────────
  const sliderRef     = useRef<MagHeroSliderHandle>(null)
  const [heroSlides, setHeroSlides]     = useState<SlideArticle[]>([])
  const [heroCurrent, setHeroCurrent]   = useState(0)

  const handleNavClick = useCallback((i: number) => {
    sliderRef.current?.goTo(i)
  }, [])

  // Déclenche les animations el-anim après le premier rendu
  useEffect(() => {
    const t = setTimeout(() => heroRef.current?.classList.add("el-hero--ready"), 40)
    return () => clearTimeout(t)
  }, [])

  // Article à la une : toujours le plus récent (articles déjà triés par publishedAt desc)
  const defaultFeatured = useMemo(
    () => articles[0] ?? null,
    [articles]
  )
  const defaultRecent = useMemo(
    () => articles.filter(a => a.slug !== defaultFeatured?.slug).slice(0, 3),
    [articles, defaultFeatured]
  )

  // ─── Articles filtrés ──────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let result = [...articles]

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(a =>
        a.title.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q) ||
        (a.chapo ?? "").toLowerCase().includes(q)
      )
    }

    if (activeCategory !== "Tous") {
      result = result.filter(a => a.category === activeCategory)
    }

    // Déjà triés par publishedAt desc depuis le serveur — on maintient l'ordre
    return result
  }, [articles, search, activeCategory])

  const hasFilter = search.trim() !== "" || activeCategory !== "Tous"

  const featuredArticle = hasFilter
    ? (filtered[0] ?? defaultFeatured)
    : defaultFeatured

  const recentArticles = hasFilter
    ? filtered.filter(a => a.slug !== filtered[0]?.slug).slice(0, 3)
    : defaultRecent

  // ──────────────────────────────────────────────────────────────────────

  return (
    <main className="mag-page">

      {/* ══ HERO ══════════════════════════════════════════════════════════ */}
      <section className="mag-hero" ref={heroRef} aria-label={t('Magazine — en-tête')}>

        {/* Slider éditorial — uniquement les articles publiés */}
        <MagHeroSlider
          ref={sliderRef}
          articles={articles.map(a => ({
            slug:        a.slug,
            title:       a.title,
            image:       a.image,
            imageCredit: a.imageCredit,
          }))}
          onSlidesReady={setHeroSlides}
          onCurrentChange={setHeroCurrent}
        />

        <div className="mag-hero-fade" aria-hidden="true" />

        <div className="mag-hero-left">
          <span className="mag-kicker">{t('Magazine')}</span>
          <h1 className="mag-hero-title">{t('Comprendre la danse autrement.')}</h1>
          <p className="mag-hero-desc">
            {t('Décryptages, culture, parcours, histoire et ressources pour regarder la danse au-delà de la scène.')}
          </p>

          {/* Barre de recherche */}
          <label
            className="el-search-wrap el-anim"
            style={{ "--el-delay": "200ms" } as React.CSSProperties}
          >
            <svg
              className="el-search-icon"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7.5" />
              <line x1="18.5" y1="18.5" x2="22" y2="22" />
            </svg>
            <input
              className="el-search"
              type="search"
              placeholder={t("Rechercher un article, une catégorie, un thème…")}
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoComplete="off"
            />
            {search && (
              <button
                className="el-search-clear"
                type="button"
                onClick={() => setSearch("")}
                aria-label={t("Effacer la recherche")}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </label>

          {/* Filtres par catégorie */}
          <div
            className="mag-chips el-anim"
            style={{ "--el-delay": "260ms" } as React.CSSProperties}
            role="group"
            aria-label={t("Filtrer par catégorie")}
          >
            {MAG_CATEGORIES.map(cat => (
              <button
                key={cat}
                type="button"
                className={`mag-chip${activeCategory === cat ? " mag-chip--active" : ""}`}
                onClick={() => setActiveCategory(cat)}
                aria-pressed={activeCategory === cat}
              >
                {t(cat)}
              </button>
            ))}
          </div>
        </div>

        {/* ── Navigation éditoriale — titres à droite ── */}
        {heroSlides.length > 0 && (
          <div className="mag-hero-right" aria-hidden="true">
            <nav className="mag-slide-nav" aria-label={t("Navigation éditoriale")}>
              {heroSlides.map((slide, i) => (
                <button
                  key={slide.slug}
                  type="button"
                  tabIndex={-1}
                  className={`mag-slide-nav-item${i === heroCurrent ? ' mag-slide-nav-item--active' : ''}`}
                  onClick={() => handleNavClick(i)}
                >
                  {slide.title}
                </button>
              ))}
            </nav>
          </div>
        )}
      </section>

      <div className="mag-hero-transition" aria-hidden="true" />

      {/* ══ CONTENU ═══════════════════════════════════════════════════════ */}
      {hasFilter ? (

        /* ── Résultats filtrés ─────────────────────────────────────────── */
        <section className="mag-filtered">
          <div className="container">
            <p className="mag-filtered-count">
              {filtered.length === 0
                ? t("Aucun article trouvé")
                : `${filtered.length} ${t(filtered.length > 1 ? 'articles' : 'article')}`}
              {activeCategory !== "Tous" && ` · ${t(activeCategory)}`}
            </p>

            {filtered.length > 0 ? (
              <div className="mag-recent-grid">
                {filtered.map(article => (
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
                      <PhotoCredit credit={article.imageCredit} />
                    </div>
                    <div className="mag-card-foot">
                      <span className="mag-card-date">{article.publishedDate}</span>
                      <span className="mag-card-read">{article.readTime}</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="mag-no-results">
                {t("Essayez un autre mot-clé ou effacez les filtres.")}
              </p>
            )}
          </div>
        </section>

      ) : featuredArticle ? (
        <>
          <MagazineEditorial articles={articles} latestEpisode={latestEpisode} carouselEpisodes={carouselEpisodes} />
          {false && (<>
          {/* ══ À LA UNE ════════════════════════════════════════════════════ */}
          <section className="mag-une">
            <div className="container">

              <div className="mag-une-header">
                <p className="mag-section-label">À la une</p>
              </div>

              <Link
                href={`/decouvrir/articles/${featuredArticle.slug}`}
                className="mag-une-card"
              >
                <div className="mag-une-img">
                  <img
                    src={featuredArticle.image}
                    alt={featuredArticle.title}
                    style={featuredArticle.imageObjectPosition ? { objectPosition: featuredArticle.imageObjectPosition } : undefined}
                  />
                  <PhotoCredit credit={featuredArticle.imageCredit} />
                </div>
                <div className="mag-une-body">
                  <span className="mag-une-category">{featuredArticle.category}</span>
                  <h2 className="mag-une-title">{featuredArticle.title}</h2>
                  <p className="mag-une-chapo">{featuredArticle.chapo}</p>
                  <p className="mag-une-meta">
                    {featuredArticle.publishedDate}&thinsp;·&thinsp;{featuredArticle.readTime} de lecture
                  </p>
                  <span className="mag-une-cta" aria-hidden="true">Lire l&apos;article →</span>
                </div>
              </Link>

            </div>
          </section>

          {/* ══ DERNIERS ARTICLES ══════════════════════════════════════════ */}
          {recentArticles.length > 0 && (
            <section className="mag-recent">
              <div className="container">

                <div className="mag-section-header">
                  <p className="mag-section-label">Derniers articles</p>
                  <Link href="/decouvrir/articles-culture" className="mag-seeall">
                    Voir tous les articles →
                  </Link>
                </div>

                <div className="mag-recent-layout">

                  {/* Premier article récent : grande carte horizontale */}
                  {recentArticles[0] && (
                    <Link
                      href={`/decouvrir/articles/${recentArticles[0].slug}`}
                      className="mag-card-h"
                    >
                      <div className="mag-card-h-img">
                        <img
                          src={recentArticles[0].image}
                          alt={recentArticles[0].title}
                          style={recentArticles[0].imageObjectPosition ? { objectPosition: recentArticles[0].imageObjectPosition } : undefined}
                        />
                        <PhotoCredit credit={recentArticles[0].imageCredit} />
                      </div>
                      <div className="mag-card-h-body">
                        <span className="mag-card-h-category">{recentArticles[0].category}</span>
                        <h3 className="mag-card-h-title">{recentArticles[0].title}</h3>
                        <p className="mag-card-h-chapo">{recentArticles[0].chapo}</p>
                        <p className="mag-card-h-meta">
                          {recentArticles[0].publishedDate}&thinsp;·&thinsp;{recentArticles[0].readTime} de lecture
                        </p>
                        <span className="mag-card-h-cta" aria-hidden="true">Lire l&apos;article →</span>
                      </div>
                    </Link>
                  )}

                  {/* Articles suivants : grille 2 colonnes compacte */}
                  {recentArticles.length > 1 && (
                    <div className="mag-card-small-grid">
                      {recentArticles.slice(1).map(article => (
                        <Link
                          key={article.slug}
                          href={`/decouvrir/articles/${article.slug}`}
                          className="mag-card"
                        >
                          <div className="mag-card-img">
                            <img
                              src={article.image}
                              alt={article.title}
                              style={article.imageObjectPosition ? { objectPosition: article.imageObjectPosition } : undefined}
                            />
                            <div className="mag-card-overlay">
                              <span className="mag-card-category">{article.category}</span>
                              <h3 className="mag-card-title">{article.title}</h3>
                            </div>
                            <PhotoCredit credit={article.imageCredit} />
                          </div>
                          <div className="mag-card-foot">
                            <span className="mag-card-date">{article.publishedDate}</span>
                            <span className="mag-card-read">{article.readTime}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}

                </div>
              </div>
            </section>
          )}

          {/* ══ THÉMATIQUES ═════════════════════════════════════════════════ */}
          <section className="mag-themes">
            <div className="container">

              <div className="mag-section-header">
                <p className="mag-section-label">Par thématique</p>
              </div>

              <div className="mag-themes-grid">
                {THEMES.map(theme => (
                  <Link key={theme.label} href={theme.href} className="mag-theme-item">
                    <span className="mag-theme-label">{theme.label}</span>
                    <span className="mag-theme-arrow" aria-hidden="true">→</span>
                  </Link>
                ))}
              </div>

            </div>
          </section>

          {/* ══ EXPLORER LES STYLES ══════════════════════════════════════════ */}
          {sectionVisibility.danceStyles === 'public' && <section className="mag-styles">
            <div className="container">

              <div className="mag-section-header">
                <p className="mag-section-label">Explorer les styles de danse</p>
                <Link href="/explorer/styles-de-danse" className="mag-seeall">
                  Voir tous les styles →
                </Link>
              </div>

              <div className="mag-styles-grid">
                {STYLES.map(style => (
                  <Link
                    key={style.slug}
                    href={`/explorer/styles-de-danse/${style.slug}`}
                    className="mag-style-card"
                  >
                    <div className="mag-style-img">
                      <img src={style.image} alt={style.name} />
                    </div>
                    <span className="mag-style-name">{style.name}</span>
                  </Link>
                ))}
              </div>

            </div>
          </section>}
          </>)}
        </>
      ) : null}

    </main>
  )
}
