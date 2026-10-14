'use client'

import { useState, useMemo } from 'react'
import {
  type Audition,
  type TypeProjet,
  TYPE_PROJET_LABELS,
  getStatutAudition,
  getAuditionsActives,
  getAuditionsArchivees,
} from './auditions-data'
import { ressources, getRessourcesFiltrees } from './ressources-data'

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string | null | undefined): string {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

function formatDeadline(iso: string): string {
  const date = new Date(iso)
  const now  = new Date()
  const diff = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  if (diff <= 0)  return 'Deadline dépassée'
  if (diff === 1) return `Dernier jour — ${formatDate(iso)}`
  if (diff <= 7)  return `J−${diff} · ${formatDate(iso)}`
  return `Candidatures jusqu'au ${formatDate(iso)}`
}

// ── Filtres catégories (liste fixe — toujours toutes affichées) ───────────────

const FILTRE_CATS: Array<{ value: TypeProjet | ''; label: string }> = [
  { value: '',                             label: 'Toutes' },
  { value: 'compagnie-choregraphique',     label: 'Compagnies chorégraphiques' },
  { value: 'ccn-structure-choregraphique', label: 'CCN & structures' },
  { value: 'opera-ballet',                 label: 'Opéras & ballets' },
  { value: 'comedie-musicale',             label: 'Comédies musicales' },
  { value: 'production-commerciale',       label: 'Productions commerciales' },
  { value: 'audiovisuel',                  label: 'Audiovisuel & clips' },
  { value: 'parc-evenementiel',            label: 'Parcs & événementiel' },
  { value: 'international',               label: 'Projets internationaux' },
]

// ── Carte audition ────────────────────────────────────────────────────────────

function AuditionCard({ audition }: { audition: Audition }) {
  const statut = getStatutAudition(audition)
  const isNew  = statut === 'nouveau'

  return (
    <article className="aud2-card">
      <div className="aud2-card-top">
        <div className="aud2-card-badges">
          <span className="aud2-badge-cat">{TYPE_PROJET_LABELS[audition.typeProjet]}</span>
          {isNew && <span className="aud2-badge-new">Nouveau</span>}
        </div>
        <p className="aud2-card-structure">{audition.structure}</p>
        <h3 className="aud2-card-titre">{audition.titre}</h3>
        {audition.profilRecherche && (
          <p className="aud2-card-profil">{audition.profilRecherche}</p>
        )}
      </div>

      <div className="aud2-card-meta">
        {(audition.ville || audition.pays) && (
          <span className="aud2-meta-item aud2-meta-lieu">
            {audition.ville}{audition.pays !== 'France' ? `, ${audition.pays}` : ''}
          </span>
        )}
        {audition.dateAudition && (
          <span className="aud2-meta-item">
            Audition le {formatDate(audition.dateAudition)}
            {audition.dateAuditionFin && ` → ${formatDate(audition.dateAuditionFin)}`}
          </span>
        )}
        {audition.typeContrat && (
          <span className="aud2-meta-item aud2-meta-contrat">{audition.typeContrat}</span>
        )}
      </div>

      <div className="aud2-card-foot">
        <span className="aud2-deadline">{formatDeadline(audition.deadlineCandidature)}</span>
        <a
          href={audition.lienCandidature}
          target="_blank"
          rel="noopener noreferrer"
          className="aud2-cta"
          aria-label={`Voir l'annonce : ${audition.titre} — ${audition.structure}`}
        >
          Voir l&apos;annonce <span aria-hidden="true">→</span>
        </a>
      </div>
    </article>
  )
}

// ── Composant principal ───────────────────────────────────────────────────────

export default function AuditionsClient({ auditions }: { auditions: Audition[] }) {
  const [filtreCat,    setFiltreCat]    = useState<TypeProjet | ''>('')
  const [showArchives, setShowArchives] = useState(false)

  const actives   = useMemo(() => getAuditionsActives(auditions),   [auditions])
  const archivees = useMemo(() => getAuditionsArchivees(auditions), [auditions])

  const ressourcesFiltrees = useMemo(
    () => getRessourcesFiltrees(ressources, filtreCat),
    [filtreCat],
  )

  const filtrees = useMemo(() => {
    if (!filtreCat) return actives
    return actives.filter(a => a.typeProjet === filtreCat)
  }, [actives, filtreCat])

  return (
    <>
      {/* ── Filtres tag pills ──────────────────────────────────────────────── */}
      <section className="aud2-filtres-bar" aria-label="Filtrer par catégorie">
        <div className="container">
          <div className="aud2-filtres" role="group" aria-label="Catégories d'auditions">
            {FILTRE_CATS.map(cat => (
              <button
                key={cat.value}
                type="button"
                className={`aud2-pill${filtreCat === cat.value ? ' is-active' : ''}`}
                onClick={() => setFiltreCat(cat.value)}
                aria-pressed={filtreCat === cat.value}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Les auditions du moment ────────────────────────────────────────── */}
      <section className="aud2-section" aria-labelledby="aud-moment-title">
        <div className="container">
          {actives.length === 0 ? (
            /* État vide — pas de "bientôt disponible", juste une info sobre */
            <div className="aud2-empty">
              <span className="section-label">Prochainement</span>
              <h2>De nouvelles auditions arrivent</h2>
              <p>
                Nous référençons régulièrement des opportunités dans le secteur de la danse.
                Revenez bientôt ou abonnez-vous à la newsletter Dance Lab pour être alerté.e
                dès qu&apos;une audition est publiée.
              </p>
            </div>
          ) : (
            <>
              <div className="aud2-section-head">
                <h2 id="aud-moment-title">Les auditions du moment</h2>
                <span className="aud2-count" aria-live="polite">
                  {filtreCat === ''
                    ? `${actives.length} audition${actives.length > 1 ? 's' : ''} en cours`
                    : `${filtrees.length} audition${filtrees.length !== 1 ? 's' : ''} dans cette catégorie`}
                </span>
              </div>

              {filtrees.length === 0 ? (
                <div className="aud2-no-results">
                  <p>Aucune audition dans cette catégorie pour le moment.</p>
                  <button
                    type="button"
                    className="aud2-reset"
                    onClick={() => setFiltreCat('')}
                  >
                    Voir toutes les auditions
                  </button>
                </div>
              ) : (
                <div className="aud2-grid">
                  {filtrees.map(a => <AuditionCard key={a.id} audition={a} />)}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* ── Où trouver d'autres auditions ? ───────────────────────────────── */}
      <section className="aud2-ressources" aria-labelledby="aud-res-title">
        <div className="container">
          <div className="aud2-res-head">
            <span className="section-label">Pour aller plus loin</span>
            <h2 id="aud-res-title">
              {filtreCat
                ? 'Les plateformes pour cette catégorie'
                : 'Où trouver d\u2019autres auditions\u00a0?'}
            </h2>
            <p>Des plateformes fiables pour poursuivre vos recherches.</p>
          </div>
          {ressourcesFiltrees.length > 0 ? (
            <div className="aud2-res-grid">
              {ressourcesFiltrees.map(r => (
                <a
                  key={r.name}
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="aud2-res-card"
                >
                  <strong>{r.name}</strong>
                  <span>{r.description}</span>
                  <i aria-hidden="true">→</i>
                </a>
              ))}
            </div>
          ) : (
            <p className="aud2-res-empty">
              Aucune plateforme référencée pour cette catégorie pour le moment.
            </p>
          )}
        </div>
      </section>

      {/* ── Archives ──────────────────────────────────────────────────────── */}
      {archivees.length > 0 && (
        <section className="aud2-archives" aria-label="Auditions passées">
          <div className="container">
            <button
              type="button"
              className="aud2-archives-toggle"
              aria-expanded={showArchives}
              onClick={() => setShowArchives(v => !v)}
            >
              {showArchives ? '−' : '+'} Auditions passées ({archivees.length})
            </button>
            {showArchives && (
              <div className="aud2-grid aud2-grid--archives">
                {archivees.map(a => <AuditionCard key={a.id} audition={a} />)}
              </div>
            )}
          </div>
        </section>
      )}
    </>
  )
}
