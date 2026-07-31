import type { Metadata } from "next"
import Link from "next/link"
import StylesCarousel from "./StylesCarousel"
import StylesExplorer from "./StylesExplorer"
import StylesReveal from "./StylesReveal"
import StylesStats from "./StylesStats"
import { danceStyles, upcomingStyles } from "./styles-data"

export const metadata: Metadata = {
  title: "Explorer les styles de danse | Dance Lab",
  description:
    "Une encyclopédie vivante des styles de danse : histoire, origines, vocabulaire, figures clés, musiques et ressources. Break, waacking, voguing, classique, contemporain et plus encore.",
}

export default function StylesDeDansePage() {
  const totalEpisodes = danceStyles.reduce(
    (acc, s) => acc + s.episodeLinks.length,
    0
  )

  return (
    <main className="sty-page">

      {/* ════════════════════════════════════════
          HERO — deux colonnes éditoriales
      ════════════════════════════════════════ */}
      <section className="sty-hero">
        <div className="sty-hero-left">
          <span className="sty-kicker">Explorer · Styles de danse</span>
          <h1 className="sty-hero-title">
            Comprendre les styles comme des cultures en mouvement.
          </h1>
          <p className="sty-hero-desc">
            Hip-hop, contemporain, classique, afro, waacking, krump ou heels&nbsp;:
            chaque style porte une histoire, des codes, une énergie et une manière
            d&apos;habiter le corps. Bienvenue dans l&apos;encyclopédie de référence
            pour découvrir, comprendre et vivre la danse.
          </p>
          <StylesStats
            stylesCount={danceStyles.length}
            episodesCount={totalEpisodes}
          />
        </div>

        <div className="sty-hero-right" aria-hidden="true">
          <img
            src="/images/les-invites-header/imagetest.png"
            alt=""
            className="sty-hero-photo"
          />
          <div className="sty-hero-fade" />
        </div>
      </section>

      {/* ════════════════════════════════════════
          RECHERCHE / FILTRES + CARROUSEL
      ════════════════════════════════════════ */}
      <section className="sty-featured">

        {/* 1. Barre de recherche + filtres par catégorie */}
        <StylesExplorer styles={danceStyles} />

        {/* 2. Carrousel des styles */}
        <StylesCarousel styles={[
          ...danceStyles,
          ...upcomingStyles.filter(
            (u) => !danceStyles.some((s) => s.slug === u.slug)
          ),
        ].sort((a, b) => a.name.localeCompare(b.name, "fr", { sensitivity: "base" }))} />

        {/* 3. Lien « Voir tous les styles » */}
        <div className="sty-viewall" id="sty-explorer">
          <a href="#sty-explorer" className="sty-viewall-link">
            Voir tous les styles <span aria-hidden="true">→</span>
          </a>
        </div>

      </section>

      {/* ════════════════════════════════════════
          VALEURS — bande bleu-gris éditoriale
      ════════════════════════════════════════ */}
      <section className="sty-values" data-reveal>
        <div className="sty-values-circles" aria-hidden="true" />
        <div className="container">
          <div className="sty-values-grid">

            <div className="sty-value-col">
              <div className="sty-value-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <p className="sty-value-num">01</p>
              <h3>Des origines précises</h3>
              <p>
                Chaque fiche situe le style dans son époque, son territoire et ses
                communautés d&apos;origine. Pas de formules vagues&nbsp;: des villes,
                des quartiers, des personnes.
              </p>
            </div>

            <div className="sty-value-sep" aria-hidden="true" />

            <div className="sty-value-col">
              <div className="sty-value-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                </svg>
              </div>
              <p className="sty-value-num">02</p>
              <h3>Des ressources vérifiées</h3>
              <p>
                Livres, documentaires, archives, sites institutionnels. Chaque
                ressource est vérifiée et sourcée. Aucun faux titre, aucun lien
                inventé.
              </p>
            </div>

            <div className="sty-value-sep" aria-hidden="true" />

            <div className="sty-value-col">
              <div className="sty-value-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
                </svg>
              </div>
              <p className="sty-value-num">03</p>
              <h3>Reliée au podcast</h3>
              <p>
                Chaque style est connecté aux épisodes Dance Lab correspondants
                pour aller plus loin avec les praticiens qui le font vivre.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          MAGAZINE — trois cartes articles
      ════════════════════════════════════════ */}
      <section className="sty-magazine" data-reveal>
        <div className="container">
          <div className="sty-magazine-header">
            <div>
              <h2 className="sty-section-title">Dans le magazine</h2>
              <p className="sty-section-sub">
                Approfondir, s&apos;inspirer, aller plus loin.
              </p>
            </div>
            <Link href="/ecouter" className="sty-seeall">
              Voir tous les articles →
            </Link>
          </div>

          <div className="sty-mag-grid">
            <div
              className="sty-mag-card"
              style={{ "--i": 0 } as React.CSSProperties}
              data-reveal
            >
              <div className="sty-mag-img">
                <img src="/images/danydann.jpg" alt="Le break" />
              </div>
              <div className="sty-mag-body">
                <span className="sty-mag-badge">Article</span>
                <h3>Le break, de la rue aux Jeux olympiques</h3>
                <Link
                  href="/explorer/styles-de-danse/break"
                  className="sty-mag-cta"
                >
                  Lire l&apos;article →
                </Link>
              </div>
            </div>

            <div
              className="sty-mag-card"
              style={{ "--i": 1 } as React.CSSProperties}
              data-reveal
            >
              <div className="sty-mag-img">
                <img src="/images/sofiastanic.jpg" alt="Le waacking" />
              </div>
              <div className="sty-mag-body">
                <span className="sty-mag-badge">Article</span>
                <h3>Waacking&nbsp;: une danse née dans les clubs underground</h3>
                <Link
                  href="/explorer/styles-de-danse/waacking"
                  className="sty-mag-cta"
                >
                  Lire l&apos;article →
                </Link>
              </div>
            </div>

            <div
              className="sty-mag-card"
              style={{ "--i": 2 } as React.CSSProperties}
              data-reveal
            >
              <div className="sty-mag-img">
                <img src="/images/festivalavignon.jpg" alt="Le voguing" />
              </div>
              <div className="sty-mag-body">
                <span className="sty-mag-badge">Article</span>
                <h3>Le voguing et la culture ballroom en France</h3>
                <Link
                  href="/explorer/styles-de-danse/voguing"
                  className="sty-mag-cta"
                >
                  Lire l&apos;article →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          PODCAST — grande bannière bleu nuit
      ════════════════════════════════════════ */}
      <section className="sty-podcast-wrap" data-reveal>
        <div className="container">
          <div className="sty-podcast">
            <div className="sty-podcast-glow" aria-hidden="true" />
            <div className="sty-podcast-content">
              <div className="sty-podcast-icon" aria-hidden="true">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <circle cx="24" cy="24" r="23" stroke="rgba(255,255,255,.18)" strokeWidth="1.5"/>
                  <circle cx="24" cy="24" r="15" stroke="rgba(255,255,255,.08)" strokeWidth="1"/>
                  <path d="M19 16.5v15l13-7.5-13-7.5z" fill="rgba(255,255,255,.90)"/>
                </svg>
              </div>
              <h2>Écoutez les histoires derrière chaque style</h2>
              <p>
                Immersion, témoignages et coulisses avec les artistes qui font
                vivre ces cultures.
              </p>
              <Link href="/ecouter" className="sty-podcast-btn">
                Découvrir les épisodes →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Animations scroll */}
      <StylesReveal />
    </main>
  )
}
