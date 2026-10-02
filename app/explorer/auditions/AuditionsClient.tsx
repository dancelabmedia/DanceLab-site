'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  type Audition,
  type TypeProjet,
  type StatutAudition,
  TYPE_PROJET_LABELS,
  STATUT_LABELS,
  getStatutAudition,
  getAuditionsActives,
  getAuditionsArchivees,
  getTypesDisponibles,
  getStylesDisponibles,
  getVillesDisponibles,
} from './auditions-data'

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '–'
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function formatDeadline(iso: string): string {
  const date = new Date(iso)
  const now  = new Date()
  const diff = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  if (diff <= 0)  return 'Deadline dépassée'
  if (diff === 1) return 'Dernier jour'
  if (diff <= 7)  return `J−${diff}`
  return `Deadline : ${formatDate(iso)}`
}

// ── Carte audition ───────────────────────────────────────────────────────────

function AuditionCard({ audition }: { audition: Audition }) {
  const statut = getStatutAudition(audition)
  const statutClass = `aud-statut aud-statut--${statut}`

  return (
    <article className="aud-card">
      <header className="aud-card-header">
        <div className="aud-card-meta">
          <span className={statutClass}>{STATUT_LABELS[statut]}</span>
          <span className="aud-card-type">{TYPE_PROJET_LABELS[audition.typeProjet]}</span>
        </div>
        <h3 className="aud-card-titre">{audition.titre}</h3>
        <p className="aud-card-structure">{audition.structure}</p>
      </header>

      <div className="aud-card-body">
        {audition.stylesRecherches.length > 0 && (
          <div className="aud-card-styles">
            {audition.stylesRecherches.map(s => (
              <span key={s} className="aud-tag">{s}</span>
            ))}
          </div>
        )}
        <p className="aud-card-profil">{audition.profilRecherche}</p>
        <p className="aud-card-desc">{audition.description}</p>
      </div>

      <footer className="aud-card-footer">
        <div className="aud-card-infos">
          <div className="aud-info">
            <span className="aud-info-label">Lieu</span>
            <span>{audition.ville}{audition.pays !== 'France' ? `, ${audition.pays}` : ''}</span>
          </div>
          {audition.dateAudition && (
            <div className="aud-info">
              <span className="aud-info-label">Date d'audition</span>
              <span>
                {formatDate(audition.dateAudition)}
                {audition.dateAuditionFin && ` → ${formatDate(audition.dateAuditionFin)}`}
              </span>
            </div>
          )}
          <div className="aud-info">
            <span className="aud-info-label">Contrat</span>
            <span>{audition.periodeContrat}{audition.typeContrat ? ` · ${audition.typeContrat}` : ''}</span>
          </div>
          {audition.remuneration && (
            <div className="aud-info">
              <span className="aud-info-label">Rémunération</span>
              <span>{audition.remuneration}</span>
            </div>
          )}
        </div>
        <div className="aud-card-actions">
          <span className="aud-deadline">{formatDeadline(audition.deadlineCandidature)}</span>
          <a
            href={audition.lienCandidature}
            target="_blank"
            rel="noopener noreferrer"
            className="aud-cta"
          >
            Candidater →
          </a>
        </div>
      </footer>
    </article>
  )
}

// ── Filtres ──────────────────────────────────────────────────────────────────

interface Filtres {
  type:        TypeProjet | ''
  style:       string
  ville:       string
  remunere:    boolean
}

const FILTRES_VIDES: Filtres = { type: '', style: '', ville: '', remunere: false }

// ── Composant principal ──────────────────────────────────────────────────────

export default function AuditionsClient({ auditions }: { auditions: Audition[] }) {
  const [filtres,    setFiltres]    = useState<Filtres>(FILTRES_VIDES)
  const [showArchives, setShowArchives] = useState(false)

  const actives   = useMemo(() => getAuditionsActives(auditions),    [auditions])
  const archivees = useMemo(() => getAuditionsArchivees(auditions),  [auditions])

  const typesDisponibles  = useMemo(() => getTypesDisponibles(actives),  [actives])
  const stylesDisponibles = useMemo(() => getStylesDisponibles(actives), [actives])
  const villesDisponibles = useMemo(() => getVillesDisponibles(actives), [actives])

  const filtrees = useMemo(() => actives.filter(a => {
    if (filtres.type     && a.typeProjet !== filtres.type)                  return false
    if (filtres.style    && !a.stylesRecherches.includes(filtres.style))    return false
    if (filtres.ville    && a.ville !== filtres.ville)                      return false
    if (filtres.remunere && !a.remuneration)                                return false
    return true
  }), [actives, filtres])

  const hasFiltres = Object.values(filtres).some(Boolean)

  function set<K extends keyof Filtres>(key: K, val: Filtres[K]) {
    setFiltres(prev => ({ ...prev, [key]: val }))
  }

  return (
    <>
      {/* ── Filtres ──────────────────────────────────────────────────────── */}
      <section className="aud-filtres-bar">
        <div className="container">
          <div className="aud-filtres">
            <select
              value={filtres.type}
              onChange={e => set('type', e.target.value as TypeProjet | '')}
              className="aud-filtre-select"
              aria-label="Type de projet"
            >
              <option value="">Tous les projets</option>
              {typesDisponibles.map(t => (
                <option key={t} value={t}>{TYPE_PROJET_LABELS[t]}</option>
              ))}
            </select>

            <select
              value={filtres.style}
              onChange={e => set('style', e.target.value)}
              className="aud-filtre-select"
              aria-label="Style de danse"
            >
              <option value="">Tous les styles</option>
              {stylesDisponibles.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            <select
              value={filtres.ville}
              onChange={e => set('ville', e.target.value)}
              className="aud-filtre-select"
              aria-label="Ville"
            >
              <option value="">Toutes les villes</option>
              {villesDisponibles.map(v => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>

            <label className="aud-filtre-check">
              <input
                type="checkbox"
                checked={filtres.remunere}
                onChange={e => set('remunere', e.target.checked)}
              />
              <span>Rémunéré uniquement</span>
            </label>

            {hasFiltres && (
              <button
                className="aud-filtre-reset"
                onClick={() => setFiltres(FILTRES_VIDES)}
                type="button"
              >
                Effacer les filtres
              </button>
            )}
          </div>

          <p className="aud-count" aria-live="polite">
            {filtrees.length === 0
              ? 'Aucune audition correspondant à ces critères'
              : `${filtrees.length} audition${filtrees.length > 1 ? 's' : ''} en cours`}
          </p>
        </div>
      </section>

      {/* ── Liste des auditions ───────────────────────────────────────────── */}
      <section className="aud-liste">
        <div className="container">
          {filtrees.length === 0 ? (
            <div className="aud-empty">
              <p>Aucune audition ne correspond à ces critères pour le moment.</p>
              <button
                className="aud-filtre-reset"
                onClick={() => setFiltres(FILTRES_VIDES)}
                type="button"
              >
                Voir toutes les auditions
              </button>
            </div>
          ) : (
            <div className="aud-grid">
              {filtrees.map(a => <AuditionCard key={a.id} audition={a} />)}
            </div>
          )}
        </div>
      </section>

      {/* ── Archives ─────────────────────────────────────────────────────── */}
      {archivees.length > 0 && (
        <section className="aud-archives">
          <div className="container">
            <button
              className="aud-archives-toggle"
              onClick={() => setShowArchives(v => !v)}
              type="button"
              aria-expanded={showArchives}
            >
              {showArchives ? '−' : '+'} Archives ({archivees.length} audition{archivees.length > 1 ? 's' : ''} terminée{archivees.length > 1 ? 's' : ''})
            </button>
            {showArchives && (
              <div className="aud-grid aud-grid--archives">
                {archivees.map(a => <AuditionCard key={a.id} audition={a} />)}
              </div>
            )}
          </div>
        </section>
      )}
    </>
  )
}
