import type { Metadata } from "next"
import { requestLocale } from "@/lib/i18n/server";
import { type Locale } from "@/lib/i18n/routing";
import { aboutContent } from "@/data/i18n/about";
import AboutReveal from "../../components/AboutReveal";
import MissionReveal from "../../components/MissionReveal";
import AboutVideoCard from "../../components/AboutVideoCard";

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await requestLocale()) as Locale;
  const c = aboutContent(locale);

  return {
    title: c.seoTitle,
    description: c.seoDescription,
    openGraph: {
      title: c.seoTitle,
      description: c.seoDescription,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: c.seoTitle,
      description: c.seoDescription,
    },
  };
}

export default async function AProposPage() {
  const locale = (await requestLocale()) as Locale;
  const c = aboutContent(locale);

  return (
    <main className="about-page">
      <AboutReveal />

      {/* HERO + INTRODUCTION */}
      <section className="about-hero about-chapter">

        <div className="container about-hero-grid">

          <div className="about-hero-content">

            <span className="section-label">
              {c.heroLabel}
            </span>

            <h1>
              {c.heroTitle}
            </h1>

          </div>


          <div className="about-hero-image">
            <img
              src="/images/maiwenn-about.jpg"
              alt="Maïwenn Bramoullé, fondatrice de Dance Lab"
            />
            <span className="about-photo-credit" aria-hidden="true">© Blandine Abad</span>
          </div>

          <div className="about-text about-intro-content">
            <h2>{c.introTitle}</h2>
            <p>
              {c.introP1}
            </p>
            <p>
              {c.introP2}
            </p>
            <p>
              {c.introP3} <strong>{c.introP3Bold}</strong>
            </p>
            <p>
              {c.introP4}
            </p>
            <p>
              {c.introP5}
            </p>
          </div>

        </div>

      </section>

      {/* MEDIA */}
      <section className="section about-soft about-media about-chapter">

        <div className="container about-media-grid">

          <div className="about-heading fu">

            <h2>
              {c.mediaTitle}
            </h2>

          </div>


          <div className="about-text fu d1">

            <p>
              {c.mediaP1}
            </p>

            <p>
              {c.mediaP2Part1}{' '}
              <strong>{c.mediaP2Bold}</strong>{' '}
              {c.mediaP2Part2}
            </p>

            <p>
              {locale === 'en' ? (
                <>
                  {c.mediaP3Part1} <strong>{c.mediaP3Bold}</strong> {c.mediaP3Part2}
                </>
              ) : (
                <>
                  {c.mediaP3Part1} <strong>{c.mediaP3Bold}</strong> {c.mediaP3Part2}
                </>
              )}
            </p>

          </div>

          <div className="about-story-image">
            <img
              src="/images/maiwenn-1.JPG"
              alt="Maïwenn Bramoullé, interprète et créatrice"
            />
            <span className="about-photo-credit" aria-hidden="true">© Blandine Abad</span>
          </div>

        </div>

      </section>


      {/* PARCOURS */}
      <section className="section about-parcours about-chapter">

        <div className="container about-grid">

          <div className="about-image fu">
            <img
              src="/images/maiwenn-danse.jpg"
              alt="Maïwenn Bramoullé en danse"
            />
            <span className="about-photo-credit" aria-hidden="true">© Blandine Abad</span>
          </div>


          <div className="about-content fu d1">

            <h2>
              {c.parcoursTitle}
            </h2>

            <p>
              {c.parcoursP1}
            </p>

            <p>
              {c.parcoursP2}
            </p>

            <p>
              {c.parcoursP3}
            </p>

            <p>
              {c.parcoursP4}
            </p>

            <p>
              {c.parcoursP5}{' '}
              <em>Just Dance 2024</em> {locale === 'en' ? 'and' : 'et'} <em>Just Dance 2025</em>, <em>Disneyland Paris</em>,{' '}
              <em>Universal Music Group</em> {locale === 'en' ? 'and' : 'et'} <em>Netflix</em>.
            </p>

            <p>
              {c.parcoursP6}{' '}
              <em>Les Chatouilles</em>, <em>Starmusical</em> {locale === 'en' ? 'or' : 'ou'}{' '}
              <em>Relais de la Flamme Olympique de Paris 2024</em>.
            </p>

            <p>
              {c.parcoursP7}{' '}
              <em>Euro 2016</em>,{' '}
              <em>Bal de la Rose</em> {locale === 'en' ? 'and' : 'et'} <em>YouTube Festival</em>, {locale === 'en' ? 'as well as internationally with' : 'ainsi qu\'à l\'international avec'}{' '}
              <em>Balich Wonder Studio</em>.
            </p>

            <p>
              {c.parcoursP8}{' '}
              <em>La Légende de Monte-Cristo</em>{' '}
              {locale === 'en' ? 'as a dancer and also took on the role of' : 'en tant que danseuse et j\'assure également le rôle de'} <strong>Dance Captain</strong>.
            </p>

          </div>

        </div>

      </section>


      {/* CREATION */}
      <section className="section about-soft about-creation about-chapter">

        <div className="container about-closing-grid">

          <div className="about-text">

            <h2>
              {c.creationTitle}
            </h2>

            <p>
              {c.creationP1Part1}{' '}
              <strong>{c.creationP1Bold}</strong>.
            </p>

            <p>
              {c.creationP2}{' '}
              <em>BMW</em>, <em>Dassault Systèmes</em>, <em>Icade</em>, <em>DTR Fight</em>{' '}
              {locale === 'en' ? 'and' : 'et'} <em>Spoade</em>.
            </p>

            <p>
              {c.creationP3}{' '}
              <em>Soprano : Le Concert des 1000 Choristes diffusé sur TF1</em>.
            </p>

            <p>
              {c.creationP4Part1}{' '}
              <strong>{c.creationP4Bold}</strong>
              {c.creationP4Part2}
            </p>

          </div>

        </div>

      </section>


      {/* ENTREPRENEURIAT */}
      <section className="section about-entrepreneur about-chapter">

        <div className="container about-entrepreneur-grid">

          <div className="about-text">

            <h2>
              {c.entrepreneurTitle}
            </h2>

            <p>
              {c.entrepreneurP1Part1}{' '}
              <strong>{c.entrepreneurP1Bold}</strong>
              {c.entrepreneurP1Part2}
            </p>

            <p>
              {c.entrepreneurP2Part1}{' '}
              <strong>{c.entrepreneurP2Bold}</strong>
              {c.entrepreneurP2Part2}
            </p>

            <p>
              {c.entrepreneurP3}
            </p>

          </div>

          <div className="about-closing-image">
            <img
              src="/images/maiwenn-2.jpg"
              alt="Maïwenn Bramoullé travaillant sur Dance Lab"
            />
            <span className="about-photo-credit" aria-hidden="true">© Blandine Abad</span>
          </div>

        </div>

      </section>


      {/* MISSION */}
      <section className="about-mission about-chapter">

        {/* Fond abstrait — halos lumineux diffus, aucune image */}
        <div className="about-mission-bg" aria-hidden="true">
          <div className="about-mission-halo about-mission-halo-1" />
          <div className="about-mission-halo about-mission-halo-2" />
          <div className="about-mission-halo about-mission-halo-3" />
        </div>

        <div className="container about-mission-inner">

          <div className="about-mission-heading">
            <span className="about-mission-chapter-num">06</span>
            <h2>
              {c.missionTitle} <span>Dance Lab</span>
            </h2>
            <h3>
              {c.missionSubtitle}
            </h3>
            <div className="about-mission-rule" />
          </div>

          <MissionReveal>

            <div className="mission-card">
              <span className="mission-card-number">01</span>
              <div className="mission-card-body">
                <h4>{c.mission1Title}</h4>
                <p>
                  {c.mission1Text}
                </p>
              </div>
            </div>

            <div className="mission-card">
              <span className="mission-card-number">02</span>
              <div className="mission-card-body">
                <h4>{c.mission2Title}</h4>
                <p>
                  {c.mission2Text}
                </p>
              </div>
            </div>

            <div className="mission-card">
              <span className="mission-card-number">03</span>
              <div className="mission-card-body">
                <h4>{c.mission3Title}</h4>
                <p>
                  {c.mission3Text}
                </p>
              </div>
            </div>

          </MissionReveal>

        </div>

      </section>


      {/* INTERVIEWS */}
      <section className="section about-soft about-interviews about-chapter">

        <div className="container">

          <div className="about-interviews-header">
            <span className="about-interviews-kicker">{c.interviewsKicker}</span>
            <h2>{c.interviewsTitle}</h2>
            <p className="about-interviews-intro">
              {c.interviewsIntro}
            </p>
          </div>

          <div className="about-interviews-grid">
            <AboutVideoCard
              videoId="4SF21fx8IzE"
            />
            <AboutVideoCard
              videoId="uEpARjK5O1c"
            />
            <AboutVideoCard
              instagramReel={{
                url: "https://www.instagram.com/reel/DHJk8fQoCUz/",
                // Miniature officielle du Reel (og:image), conservée sans retouche.
                thumbnailSrc: "/images/reel-DHJk8fQoCUz.jpg",
                thumbnailWidth: 360,
                thumbnailHeight: 640,
              }}
            />
          </div>

        </div>

      </section>


    </main>
  );
}
