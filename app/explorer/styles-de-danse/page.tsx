import type { Metadata } from "next"
import { requireExplorerAccess } from '@/lib/explorer-access'
import Link from "next/link"
import StylesHeroFeatured from "./StylesHeroFeatured"
import StylesPodcastBanner, { type PodcastBannerImage, type PodcastEpisodeCard } from "./StylesPodcastBanner"
import StylesReveal from "./StylesReveal"
import MissionReveal from "../../../components/MissionReveal"
import { danceStyles, upcomingStyles } from "./styles-data"
import { withDedicatedStyleImages } from "./style-image-resolver"
import { getEpisodes } from "@/lib/episodes"
import { requestLocale } from '@/lib/i18n/server'
import { uiText } from '@/data/i18n/messages'
import { episodeExtras } from '@/data/episode-extras'
import { findImagePresentation, resolveImageFrame } from '@/lib/episode-image-presentation'

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
  await requireExplorerAccess('danceStyles')
  const locale = await requestLocale()
  const t = (text: string) => uiText(locale, text)
  const resolvedDanceStyles    = withDedicatedStyleImages(danceStyles)
  const resolvedUpcomingStyles = withDedicatedStyleImages(upcomingStyles)

  // Source de vérité : même données que la page Écouter (legacy + RSS Ausha)
  const episodes = await getEpisodes()

  // Carte glassmorphism — dernier épisode (sans association forcée à un style)
  const latestEpisodeCard: PodcastEpisodeCard | null = episodes[0]
    ? {
        number: episodes[0].number,
        guest:  episodes[0].guest,
        title:  episodes[0].title,
        slug:   episodes[0].slug,
        image:  episodeExtras[episodes[0].number]?.headerImage ?? episodes[0].image ?? '',
      }
    : null

  const podcastBannerImages = episodes.flatMap<PodcastBannerImage>((episode) => {
    const src = episodeExtras[episode.number]?.headerImage ?? episode.image
    if (!src) return []
    const presentation = findImagePresentation(episodeExtras[episode.number]?.imagePresentations, src)
    return [{
      src,
      alt: episode.guest,
      desktopPosition: presentation ? resolveImageFrame(presentation, 'desktop').objectPosition : 'center center',
      mobilePosition: presentation ? resolveImageFrame(presentation, 'mobile').objectPosition : 'center center',
    }]
  }).filter((image, index, all) => all.findIndex(candidate => candidate.src === image.src) === index)

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
            <span className="about-mission-chapter-num">{t('Explorer · Styles de danse')}</span>
            <h2>
              {t('La démarche')} <span>Dance Lab</span>
            </h2>
            <h3>
              {t('Comprendre un style, c\'est aussi comprendre l\'histoire et les cultures qui l\'ont fait naître.')}
            </h3>
            <div className="about-mission-rule" />
          </div>

          <MissionReveal>

            <div className="mission-card">
              <span className="mission-card-number">01</span>
              <div className="mission-card-body">
                <h4>{t('Des origines précises')}</h4>
                <p>
                  {t('Chaque fiche situe le style dans son époque, son territoire et ses communautés d\'origine.')}
                </p>
              </div>
            </div>

            <div className="mission-card">
              <span className="mission-card-number">02</span>
              <div className="mission-card-body">
                <h4>{t('Des ressources vérifiées')}</h4>
                <p>
                  {t('Livres, documentaires, archives, sites institutionnels. Chaque ressource est vérifiée et sourcée.')}
                </p>
              </div>
            </div>

            <div className="mission-card">
              <span className="mission-card-number">03</span>
              <div className="mission-card-body">
                <h4>{t('Reliée au podcast')}</h4>
                <p>
                  {t('Chaque style est connecté aux épisodes Dance Lab correspondants pour aller plus loin avec les personnes qui le font vivre.')}
                </p>
              </div>
            </div>

          </MissionReveal>

        </div>
      </section>

      {/* ════════════════════════════════════════
          3. DANS LE MAGAZINE — composition asymétrique
      ════════════════════════════════════════ */}
      <section className="sty-magazine" data-reveal>
        <div className="container">
          <div className="sty-magazine-header">
            <div>
              <h2 className="sty-section-title">{t('Dans le magazine')}</h2>
              <p className="sty-section-sub">
                {t('Approfondir, s\'inspirer, aller plus loin.')}
              </p>
            </div>
            <Link href="/decouvrir/articles-culture" className="sty-seeall">
              {t('Voir tous les articles →')}
            </Link>
          </div>

          <div className="sty-mag-grid">

            {/* ── Article héros (gauche, grande carte) — Waacking ── */}
            <Link
              href="/decouvrir/articles/comprendre-le-waacking-histoire-culture-influences"
              className="sty-mag-card sty-mag-card--hero"
              style={{ "--i": 0 } as React.CSSProperties}
              data-reveal
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/sofiastanic.jpg" alt="" aria-hidden="true" className="sty-mag-card-bg" />
              <div className="sty-mag-card-overlay" />
              <div className="sty-mag-body">
                <span className="sty-mag-cat">{t('Culture')}</span>
                <h3>Waacking&nbsp;: une danse née dans les clubs underground</h3>
                <p className="sty-mag-chapo">
                  {t('Né dans les clubs de Los Angeles dans les années 1970, le waacking est bien plus qu\'un vocabulaire de bras. C\'est une danse d\'expression, de théâtralité et d\'affirmation, traversée par l\'histoire des communautés LGBTQ+.')}
                </p>
                <div className="sty-mag-footer">
                  <span className="sty-mag-cta">{t('Lire l\'article →')}</span>
                  <span className="sty-mag-btn" aria-hidden="true">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </div>
            </Link>

            {/* ── Pile droite : 2 cartes plus petites ── */}
            <div className="sty-mag-stack">

              {/* Voguing — pas encore d'article dédié */}
              <div
                className="sty-mag-card sty-mag-card--sm sty-mag-card--soon"
                style={{ "--i": 1 } as React.CSSProperties}
                data-reveal
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/festivalavignon.jpg" alt="" aria-hidden="true" className="sty-mag-card-bg" />
                <div className="sty-mag-card-overlay" />
                <div className="sty-mag-body">
                  <span className="sty-mag-cat">{t('Histoire')}</span>
                  <h3>Le voguing et la culture ballroom en France</h3>
                  <div className="sty-mag-footer">
                    <span className="sty-mag-cta sty-mag-cta--soon">{t('Bientôt disponible')}</span>
                    <span className="sty-mag-btn" aria-hidden="true">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
              </div>

              {/* Réseaux sociaux — article publié */}
              <Link
                href="/decouvrir/articles/reseaux-sociaux-obligatoires-danseur"
                className="sty-mag-card sty-mag-card--sm"
                style={{ "--i": 2 } as React.CSSProperties}
                data-reveal
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/maiwenn-2.jpg" alt="" aria-hidden="true" className="sty-mag-card-bg" style={{ objectPosition: '60% 18%' }} />
                <div className="sty-mag-card-overlay" />
                <div className="sty-mag-body">
                  <span className="sty-mag-cat">{t('Décryptage')}</span>
                  <h3>{t('Les réseaux sociaux sont-ils devenus obligatoires pour un.e danseur.se ?')}</h3>
                  <div className="sty-mag-footer">
                    <span className="sty-mag-cta">{t('Lire l\'article →')}</span>
                    <span className="sty-mag-btn" aria-hidden="true">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>

            </div>{/* /sty-mag-stack */}
          </div>{/* /sty-mag-grid */}
        </div>
      </section>

      {/* ════════════════════════════════════════
          4. PODCAST — hero éditorial immersif
      ════════════════════════════════════════ */}
      <section className="sty-podcast-wrap" data-reveal>
        <div className="container">
          <StylesPodcastBanner
            images={podcastBannerImages}
            episode={latestEpisodeCard}
          />
        </div>
      </section>

      {/* ════════════════════════════════════════
          5. CONTINUER À EXPLORER
      ════════════════════════════════════════ */}
      <section className="sty-explore-next" data-reveal>
        <div className="container">

          {/* En-tête */}
          <div className="sty-explore-next-head">
            <div className="sty-explore-next-head-left">
              <span className="section-label">{t('Continuer à explorer')}</span>
              <h2 className="sty-section-title">
                {t('La danse ne s\'arrête pas aux styles.')}
              </h2>
            </div>
            <p className="sty-explore-next-head-right">
              {t('Métiers, écoles, auditions… découvrez toutes les facettes d\'un secteur en mouvement.')}
            </p>
          </div>

          {/* Trois entrées éditoriales */}
          <div className="sty-explore-entries">

            {/* 1. Métiers de la danse — accessible */}
            <Link href="/explorer/metiers-de-la-danse" className="sty-explore-entry" data-reveal style={{ "--i": 0 } as React.CSSProperties}>
              <div className="sty-explore-entry-img">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/styles-de-danse/claquettes.png" alt="" aria-hidden="true" />
              </div>
              <div className="sty-explore-entry-body">
                <h3>{t('Métiers de la danse')}</h3>
                <p>{t('Les personnes et les professions qui font vivre le secteur.')}</p>
              </div>
              <span className="sty-explore-entry-arrow" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </span>
            </Link>

            {/* 2. Auditions — bientôt */}
            <div className="sty-explore-entry sty-explore-entry--soon" data-reveal style={{ "--i": 1 } as React.CSSProperties}>
              <div className="sty-explore-entry-img">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/styles-de-danse/break.png" alt="" aria-hidden="true" />
              </div>
              <div className="sty-explore-entry-body">
                <span className="sty-explore-entry-badge">{t('Bientôt')}</span>
                <h3>{t('Auditions')}</h3>
                <p>{t('Les opportunités et auditions liées à la danse et au spectacle vivant.')}</p>
              </div>
              <span className="sty-explore-entry-arrow" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </span>
            </div>

            {/* 3. Écoles de danse — bientôt */}
            <div className="sty-explore-entry sty-explore-entry--soon" data-reveal style={{ "--i": 2 } as React.CSSProperties}>
              <div className="sty-explore-entry-img">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/styles-de-danse/danseclassique.png" alt="" aria-hidden="true" />
              </div>
              <div className="sty-explore-entry-body">
                <span className="sty-explore-entry-badge">{t('Bientôt')}</span>
                <h3>{t('Écoles de danse')}</h3>
                <p>{t('Les lieux où se former et développer sa pratique.')}</p>
              </div>
              <span className="sty-explore-entry-arrow" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </span>
            </div>

          </div>{/* /sty-explore-entries */}
        </div>
      </section>

      {/* Animations scroll */}
      <StylesReveal />
    </main>
  )
}
