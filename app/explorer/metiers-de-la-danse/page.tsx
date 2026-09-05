import type { Metadata } from 'next'
import Link from 'next/link'
import {
  metiers,
  UNIVERS,
  UNIVERS_ORDER,
  TOTAL_METIERS,
  TOTAL_UNIVERS,
  getMetiersByUnivers,
} from './metiers-data'

export const metadata: Metadata = {
  title: 'Métiers de la danse - Carrières et professions | Dance Lab',
  description:
    'Découvre les métiers de la danse, les parcours professionnels et celles et ceux qui créent, interprètent, transmettent, produisent et accompagnent la danse.',
  openGraph: {
    title: 'Métiers de la danse - Carrières et professions | Dance Lab',
    description:
      'Découvre les métiers de la danse, les parcours professionnels et celles et ceux qui créent, interprètent, transmettent, produisent et accompagnent la danse.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Métiers de la danse - Carrières et professions | Dance Lab',
    description:
      'Découvre les métiers de la danse, les parcours professionnels et celles et ceux qui créent, interprètent, transmettent, produisent et accompagnent la danse.',
  },
}

export default function MetiersDeLaDansePage() {
  return (
    <main className="met-page">

      {/* ════════════════════════════════════════════════════
          HERO — éditorial, typographique, deux colonnes
      ════════════════════════════════════════════════════ */}
      <section className="met-hero" aria-label="Introduction">

        {/* Décoration d'arrière-plan */}
        <div className="met-hero-deco" aria-hidden="true">
          <div className="met-hero-deco-circle met-hero-deco-circle-1" />
          <div className="met-hero-deco-circle met-hero-deco-circle-2" />
          <div className="met-hero-deco-line" />
        </div>

        <div className="container met-hero-inner">

          {/* — Colonne gauche : texte éditorial ————————— */}
          <div className="met-hero-left">
            <span className="met-hero-kicker">Explorer · Métiers de la danse</span>

            <h1 className="met-hero-title">
              Les métiers<br />
              qui font exister<br />
              <em>la danse.</em>
            </h1>

            <p className="met-hero-desc">
              Danser n&apos;est qu&apos;une partie de l&apos;écosystème. Derrière chaque
              représentation, il y a celles et ceux qui créent, produisent, transmettent,
              accompagnent et rendent la danse visible.
            </p>

            {/* Stats */}
            <div className="met-hero-stats">
              <div className="met-hero-stat">
                <strong>{TOTAL_UNIVERS}</strong>
                <span>univers</span>
              </div>
              <div className="met-hero-stat-divider" aria-hidden="true" />
              <div className="met-hero-stat">
                <strong>{TOTAL_METIERS}+</strong>
                <span>métiers référencés</span>
              </div>
            </div>
          </div>

          {/* — Colonne droite : table des matières ————— */}
          <div className="met-hero-right" aria-label="Univers">
            <ol className="met-hero-index">
              {UNIVERS_ORDER.map((id) => {
                const u = UNIVERS[id]
                return (
                  <li key={id} className="met-hero-index-item">
                    <a href={`#univers-${id}`} className="met-hero-index-link">
                      <span className="met-hero-index-num">{u.num}</span>
                      <span className="met-hero-index-label">{u.label}</span>
                      <span className="met-hero-index-arrow" aria-hidden="true">↓</span>
                    </a>
                  </li>
                )
              })}
            </ol>
          </div>

        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          CONTENU PAR UNIVERS
      ════════════════════════════════════════════════════ */}
      <div className="met-content">
        {UNIVERS_ORDER.map((universId, sectionIndex) => {
          const u       = UNIVERS[universId]
          const items   = getMetiersByUnivers(universId)
          const featured = items.filter(m => m.featured)
          const regular  = items.filter(m => !m.featured)

          return (
            <section
              key={universId}
              id={`univers-${universId}`}
              className="met-univers"
              data-index={sectionIndex}
            >
              <div className="container">

                {/* En-tête de l'univers */}
                <header className="met-univers-header">
                  <div className="met-univers-meta">
                    <span className="met-univers-num">{u.num}</span>
                    <span className="met-univers-count">{items.length} métier{items.length > 1 ? 's' : ''}</span>
                  </div>
                  <div className="met-univers-title-wrap">
                    <h2 className="met-univers-title">{u.label}</h2>
                    <p className="met-univers-desc">{u.description}</p>
                  </div>
                  <div className="met-univers-rule" aria-hidden="true" />
                </header>

                {/* Grille de métiers */}
                <div className="met-grid">

                  {/* Carte(s) featured — large */}
                  {featured.map(metier => (
                    <article key={metier.id} className="met-card met-card--featured">
                      <div className="met-card-accent" aria-hidden="true" />
                      <div className="met-card-body">
                        <span className="met-card-univers">{u.label}</span>
                        <h3 className="met-card-title">{metier.nom}</h3>
                        <p className="met-card-desc">{metier.description}</p>
                      </div>
                      <div className="met-card-foot">
                        <span className="met-card-cta">En savoir plus →</span>
                      </div>
                    </article>
                  ))}

                  {/* Cartes régulières */}
                  {regular.map(metier => (
                    <article key={metier.id} className="met-card">
                      <div className="met-card-accent" aria-hidden="true" />
                      <div className="met-card-body">
                        <span className="met-card-univers">{u.label}</span>
                        <h3 className="met-card-title">{metier.nom}</h3>
                        <p className="met-card-desc">{metier.description}</p>
                      </div>
                      <div className="met-card-foot">
                        <span className="met-card-cta">En savoir plus →</span>
                      </div>
                    </article>
                  ))}

                </div>
              </div>
            </section>
          )
        })}
      </div>

      {/* ════════════════════════════════════════════════════
          FOOTER ÉDITORIAL — renvoi vers le podcast
      ════════════════════════════════════════════════════ */}
      <section className="met-podcast-cta">
        <div className="container met-podcast-cta-inner">
          <div className="met-podcast-cta-text">
            <span className="section-label">Podcast Dance Lab</span>
            <h2>Des professionnels racontent leur métier</h2>
            <p>
              Plus de {metiers.filter(m => m.univers !== 'image').length * 3} conversations avec
              des danseurs, chorégraphes, agents, régisseurs et professeurs.
              Tout ce qu'on ne voit pas, raconté par celles et ceux qui le font.
            </p>
          </div>
          <Link href="/ecouter" className="met-podcast-cta-btn">
            Écouter les épisodes →
          </Link>
        </div>
      </section>

    </main>
  )
}
