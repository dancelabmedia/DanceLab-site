import type { Metadata } from "next"
import { requireExplorerAccess } from '@/lib/explorer-access'
import Link from "next/link"
import StylesHeroFeatured from "./StylesHeroFeatured"
import StylesPodcastBanner, { type PodcastBannerImage } from "./StylesPodcastBanner"
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
          3. DANS LE MAGAZINE
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
                <span className="sty-mag-badge">{t('Article')}</span>
                <h3>Le break, de la rue aux Jeux olympiques</h3>
                <span className="sty-mag-cta">{t('Lire l\'article →')}</span>
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
                <span className="sty-mag-badge">{t('Article')}</span>
                <h3>Waacking&nbsp;: une danse née dans les clubs underground</h3>
                <span className="sty-mag-cta">{t('Lire l\'article →')}</span>
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
                <span className="sty-mag-badge">{t('Article')}</span>
                <h3>Le voguing et la culture ballroom en France</h3>
                <span className="sty-mag-cta sty-mag-cta--soon">{t('Bientôt disponible')}</span>
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
          <StylesPodcastBanner images={podcastBannerImages} />
        </div>
      </section>

      {/* Animations scroll */}
      <StylesReveal />
    </main>
  )
}
