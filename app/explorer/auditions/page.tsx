import Link from 'next/link'
import { auditions, getAuditionsActives } from './auditions-data'
import AuditionsClient from './AuditionsClient'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Auditions & castings danse | Explorer | Dance Lab',
  description:
    'Les auditions et castings danse à ne pas manquer : compagnies, spectacles, opéras, productions commerciales, CCN, CN D et autres structures du secteur.',
  robots: { index: false, follow: false },
}

export default function AuditionsPage() {
  const actives = getAuditionsActives(auditions)

  return (
    <main className="explorer-page aud-page">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="explorer-hero explorer-hero--detail">
        <div className="container">
          <nav className="explorer-breadcrumb" aria-label="Fil d'Ariane">
            <Link href="/explorer">← Explorer</Link>
            <span>/</span>
            <span>Auditions</span>
          </nav>
          <span className="section-label">Explorer · Opportunités</span>
          <h1>Auditions & castings danse</h1>
          <p>
            Les auditions et castings danse à ne pas manquer : compagnies, spectacles, opéras,
            productions commerciales, CCN, CN D et autres structures du secteur.
          </p>
          {actives.length > 0 && (
            <p className="aud-hero-count">
              <strong>{actives.length}</strong> audition{actives.length > 1 ? 's' : ''} en cours
            </p>
          )}
        </div>
      </section>

      {/* ── État vide ────────────────────────────────────────────────────── */}
      {auditions.length === 0 ? (
        <section className="aud-coming-soon">
          <div className="container">
            <div className="aud-coming-soon-inner">
              <span className="section-label">Bientôt disponible</span>
              <h2>La base d'auditions se prépare</h2>
              <p>
                Cette rubrique centralisera toutes les auditions et candidatures ouvertes dans
                le secteur danse et spectacle vivant. Revenez bientôt ou abonnez-vous à la
                newsletter Dance Lab pour être notifié.e à chaque nouvelle opportunité.
              </p>
              <div className="aud-coming-soon-categories">
                {[
                  'Compagnies chorégraphiques',
                  'CCN & structures',
                  'Opéras & ballets',
                  'Comédies musicales',
                  'Productions commerciales',
                  'Audiovisuel & clips',
                  'Parcs & événementiel',
                  'Projets internationaux',
                ].map(cat => (
                  <span key={cat} className="aud-tag">{cat}</span>
                ))}
              </div>
              <Link href="/explorer" className="aud-back-link">
                ← Retour à Explorer
              </Link>
            </div>
          </div>
        </section>
      ) : (
        <AuditionsClient auditions={auditions} />
      )}

    </main>
  )
}
