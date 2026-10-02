import type { Metadata } from 'next'
import './mentions-legales.css'
import LegalNav from '@/components/LegalNav'

export const metadata: Metadata = {
  title: 'Mentions légales – Dance Lab',
  description: "Identité de l'éditeur, hébergement et informations légales du site Dance Lab.",
}

const Missing = ({ children }: { children: React.ReactNode }) => (
  <span className="ml-placeholder">[À COMPLÉTER — {children}]</span>
)

export default function MentionsLegalesPage() {
  return (
    <main className="mentions-legales-page">

      {/* ── HERO ── */}
      <section className="ml-hero">
        <div className="container">
          <div className="ml-hero-inner">
            <span className="section-label">Informations légales</span>
            <h1>Mentions légales</h1>
            <p className="ml-intro">
              Informations publiées conformément à la loi n° 2004-575 du 21 juin 2004 pour la confiance dans l'économie numérique.
            </p>
            <span className="ml-last-update">Mise à jour — Septembre 2026</span>
          </div>
        </div>
      </section>

      {/* ── NAV LÉGALE ── */}
      <LegalNav />

      {/* ── CONTENU ── */}
      <section className="ml-body">
        <div className="container">
          <div className="ml-body-inner">

            <div className="ml-section">
              <span className="ml-section-num">01</span>
              <div className="ml-section-content">
                <h2>Éditeur du site</h2>
                <table className="ml-info-table">
                  <tbody>
                    <tr><th scope="row">Dénomination sociale</th><td>2.6 Productions</td></tr>
                    <tr><th scope="row">Forme juridique</th><td>SASU</td></tr>
                    <tr><th scope="row">Capital social</th><td>1 000 €</td></tr>
                    <tr><th scope="row">Siège social</th><td><Missing>adresse complète du siège social</Missing></td></tr>
                    <tr><th scope="row">SIRET</th><td>102 267 002 00016</td></tr>
                    <tr><th scope="row">RCS</th><td>102 267 002 RCS Bobigny</td></tr>
                    <tr><th scope="row">TVA intracommunautaire</th><td>FR09 102267002</td></tr>
                    <tr><th scope="row">E-mail</th><td><a href="mailto:contact@deuxpointsixproductions.com">contact@deuxpointsixproductions.com</a></td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="ml-section">
              <span className="ml-section-num">02</span>
              <div className="ml-section-content">
                <h2>Direction de la publication</h2>
                <p>La directrice de la publication est <strong>Maïwenn Bramoullé</strong>, fondatrice de Dance Lab.</p>
              </div>
            </div>

            <div className="ml-section">
              <span className="ml-section-num">03</span>
              <div className="ml-section-content">
                <h2>Hébergement</h2>
                <p>Le site est hébergé par <strong>Vercel Inc.</strong>, 440 N Barranca Avenue #4133, Covina, CA 91723, États-Unis.</p>
                <p>Contact : <a href="mailto:privacy@vercel.com">privacy@vercel.com</a> — Site : <a href="https://vercel.com" target="_blank" rel="noopener noreferrer">vercel.com</a>.</p>
              </div>
            </div>

            <div className="ml-section">
              <span className="ml-section-num">04</span>
              <div className="ml-section-content">
                <h2>Propriété intellectuelle</h2>
                <p>Les textes, podcasts, photographies, vidéos, créations graphiques, logos et éléments éditoriaux publiés sur Dance Lab sont protégés. Ils appartiennent à l'éditeur ou sont utilisés avec l'autorisation de leurs titulaires.</p>
                <p>Toute reproduction ou adaptation, hors exceptions légales, nécessite une autorisation écrite préalable. Les marques et contenus tiers restent la propriété de leurs titulaires respectifs.</p>
              </div>
            </div>

            <div className="ml-section">
              <span className="ml-section-num">05</span>
              <div className="ml-section-content">
                <h2>Responsabilité et liens externes</h2>
                <p>Dance Lab veille à l'exactitude de ses contenus sans pouvoir garantir leur exhaustivité permanente. Les liens vers des services tiers sont fournis pour faciliter l'accès aux contenus ; ces services appliquent leurs propres conditions et politiques.</p>
              </div>
            </div>

            <div className="ml-section">
              <span className="ml-section-num">06</span>
              <div className="ml-section-content">
                <h2>Contact</h2>
                <p>Pour toute question relative au site : <a href="mailto:contact@deuxpointsixproductions.com">contact@deuxpointsixproductions.com</a> ou <a href="mailto:dancelab.podcast@gmail.com">dancelab.podcast@gmail.com</a>.</p>
              </div>
            </div>

          </div>
        </div>
      </section>

    </main>
  )
}
