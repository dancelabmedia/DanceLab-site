import type { Metadata } from "next"
import Link from "next/link"
import StylesHeroFeatured from "./StylesHeroFeatured"
import StylesReveal from "./StylesReveal"
import MissionReveal from "../../../components/MissionReveal"
import { danceStyles, upcomingStyles } from "./styles-data"
import { withDedicatedStyleImages } from "./style-image-resolver"
import { getEpisodes } from "@/lib/episodes"

export const metadata: Metadata = {
  title: "Styles de danse - Histoire, cultures et ressources | Dance Lab",
  description:
    "Découvre l'histoire, les origines et les codes des styles de danse : hip-hop, contemporain, classique, afro, waacking, krump, heels et bien plus encore.",
  openGraph: {
    title: "Styles de danse - Histoire, cultures et ressources | Dance Lab",
    description:
      "Découvre l'histoire, les origines et les codes des styles de danse : hip-hop, contemporain, classique, afro, waacking, krump, heels et bien plus encore.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Styles de danse - Histoire, cultures et ressources | Dance Lab",
    description:
      "Découvre l'histoire, les origines et les codes des styles de danse : hip-hop, contemporain, classique, afro, waacking, krump, heels et bien plus encore.",
  },
}

// ISR : même cycle que la page Écouter — regénération automatique toutes les heures
export const revalidate = 3600

export default async function StylesDeDansePage() {
  const resolvedDanceStyles    = withDedicatedStyleImages(danceStyles)
  const resolvedUpcomingStyles = withDedicatedStyleImages(upcomingStyles)

  // Source de vérité : même données que la page Écouter (legacy + RSS Ausha)
  const episodes = await getEpisodes()

  // Tous les styles (disponibles + à venir), triés alphabétiquement
  const allStyles = [
    ...resolvedDanceStyles,
    ...resolvedUpcomingStyles.filter(
      (u) => !resolvedDanceStyles.some((s) => s.slug === u.slug)
    ),
  ].sort((a, b) => a.name.localeCompare(b.name, "fr", { sensitivity: "base" }))

  return (
    <main className="sty-page">

      {/* ════════════════════════════════════════
          1. HERO + RECHERCHE / FILTRES + GRILLE UNIQUE
      ════════════════════════════════════════ */}
      <StylesHeroFeatured
        availableStyles={resolvedDanceStyles}
        allStyles={allStyles}
        stylesCount={danceStyles.length}
        episodesCount={episodes.length}
      />

      {/* ════════════════════════════════════════
          2. LA DÉMARCHE DANCE LAB
      ════════════════════════════════════════ */}
      <section className="about-mission sty-demarche">

        {/* Fond abstrait — halos lumineux diffus */}
        <div className="about-mission-bg" aria-hidden="true">
          <div className="about-mission-halo about-mission-halo-1" />
          <div className="about-mission-halo about-mission-halo-2" />
          <div className="about-mission-halo about-mission-halo-3" />
        </div>

        <div className="about-mission-inner">

          <div className="about-mission-heading">
            <span className="about-mission-chapter-num">Explorer · Styles de danse</span>
            <h2>
              La démarche <span>Dance Lab</span>
            </h2>
            <h3>
              Comprendre un style, c&apos;est aussi comprendre l&apos;histoire et les cultures qui l&apos;ont fait naître.
            </h3>
            <div className="about-mission-rule" />
          </div>

          <MissionReveal>

            <div className="mission-card">
              <span className="mission-card-number">01</span>
              <div className="mission-card-body">
                <h4>Des origines précises</h4>
                <p>
                  Chaque fiche situe le style dans son époque, son territoire et ses communautés d&apos;origine.
                </p>
              </div>
            </div>

            <div className="mission-card">
              <span className="mission-card-number">02</span>
              <div className="mission-card-body">
                <h4>Des ressources vérifiées</h4>
                <p>
                  Livres, documentaires, archives, sites institutionnels. Chaque ressource est vérifiée et sourcée.
                </p>
              </div>
            </div>

            <div className="mission-card">
              <span className="mission-card-number">03</span>
              <div className="mission-card-body">
                <h4>Reliée au podcast</h4>
                <p>
                  Chaque style est connecté aux épisodes Dance Lab correspondants pour aller plus loin avec les personnes qui le font vivre.
                </p>
              </div>
            </div>

          </MissionReveal>

        </div>
      </section>

      {/* ════════════════════════════════════════
          3. DANS LE MAGAZINE
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
            <Link href="/decouvrir/articles-culture" className="sty-seeall">
              Voir tous les articles →
            </Link>
          </div>

          <div className="sty-mag-grid">
            {/* ── Break — article publié ── */}
            <Link
              href="/decouvrir/articles/pourquoi-le-breakdance-est-devenu-olympique"
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
                <span className="sty-mag-cta">Lire l&apos;article →</span>
              </div>
            </Link>

            {/* ── Waacking — article publié ── */}
            <Link
              href="/decouvrir/articles/comprendre-le-waacking-histoire-culture-influences"
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
                <span className="sty-mag-cta">Lire l&apos;article →</span>
              </div>
            </Link>

            {/* ── Voguing — pas encore d'article dédié : carte non cliquable ── */}
            <div
              className="sty-mag-card sty-mag-card--soon"
              style={{ "--i": 2 } as React.CSSProperties}
              data-reveal
            >
              <div className="sty-mag-img">
                <img src="/images/festivalavignon.jpg" alt="Le voguing" />
              </div>
              <div className="sty-mag-body">
                <span className="sty-mag-badge">Article</span>
                <h3>Le voguing et la culture ballroom en France</h3>
                <span className="sty-mag-cta sty-mag-cta--soon">Bientôt disponible</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          4. PODCAST — grande bannière bleu nuit
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
