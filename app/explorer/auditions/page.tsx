import { auditions, getAuditionsActives } from './auditions-data'
import AuditionsClient from './AuditionsClient'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Auditions danse — opportunités et castings | Explorer | Dance Lab',
  description:
    'Compagnies, ballets, comédies musicales, productions, clips, parcs… Les auditions et castings à suivre en France et à l\'international.',
}

export default function AuditionsPage() {
  const actives = getAuditionsActives(auditions)

  return (
    <main className="explorer-page aud-page">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="explorer-hero explorer-hero--detail">
        <div className="container">
          <nav className="explorer-breadcrumb" aria-label="Fil d'Ariane">
            <span>Explorer</span>
            <span>/</span>
            <span>Auditions</span>
          </nav>
          <span className="section-label">Explorer · Opportunités</span>
          <h1>Auditions</h1>
          <p className="aud2-hero-intro">
            Les opportunités pour danser, créer et travailler dans le secteur.
          </p>
          <p className="aud2-hero-body">
            Compagnies, ballets, comédies musicales, productions, clips, parcs…
            Retrouvez les auditions et castings à suivre en France et à l&apos;international.
          </p>
          {actives.length > 0 && (
            <p className="aud-hero-count">
              <strong>{actives.length}</strong> audition{actives.length > 1 ? 's' : ''} en cours
            </p>
          )}
        </div>
      </section>

      <AuditionsClient auditions={auditions} />

    </main>
  )
}
