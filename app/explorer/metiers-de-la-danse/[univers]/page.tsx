import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  UNIVERS,
  UNIVERS_ORDER,
  getMetiersByUnivers,
  getUniversIdBySlug,
} from '../metiers-data'

// ── Paramètres statiques ───────────────────────────────────────────────────────

export async function generateStaticParams() {
  return Object.values(UNIVERS).map((u) => ({ univers: u.slug }))
}

// ── Métadonnées ────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ univers: string }>
}): Promise<Metadata> {
  const { univers: slug } = await params
  const universId = getUniversIdBySlug(slug)
  if (!universId) return {}
  const universe = UNIVERS[universId]
  const items    = getMetiersByUnivers(universId)

  const title       = `${universe.label} — Métiers de la danse · Dance Lab`
  const description = `${universe.description} Découvrez les ${items.length} métiers de la catégorie ${universe.label}.`

  return {
    title,
    description,
    openGraph: { title, description, type: 'website' },
    twitter:   { card: 'summary_large_image', title, description },
    alternates: { canonical: `/explorer/metiers-de-la-danse/${universe.slug}` },
  }
}

// ── Page catégorie — liste des métiers ────────────────────────────────────────
//
// Affiche tous les métiers d'un univers sous forme de grille de cartes.
// Chaque carte renvoie vers la fiche détaillée du métier.
//
// Parcours correct : Métiers → Catégorie (cette page) → Fiche métier

export default async function UniversMetiersPage({
  params,
}: {
  params: Promise<{ univers: string }>
}) {
  const { univers: slug } = await params
  const universId = getUniversIdBySlug(slug)
  if (!universId) notFound()

  const universe = UNIVERS[universId]
  const items    = getMetiersByUnivers(universId)
  if (items.length === 0) notFound()

  return (
    <section className="met-univers-page-content">
      <div className="container">

        {/* Intro discrète */}
        <p className="met-univers-grid-intro">
          {items.length} métier{items.length > 1 ? 's' : ''} dans cette catégorie
        </p>

        {/* Grille des métiers */}
        <div className="met-grid met-univers-grid">
          {items.map((metier) => (
            <Link
              key={metier.id}
              href={`/explorer/metiers-de-la-danse/${universe.slug}/${metier.id}`}
              className={`met-card met-card--link${metier.featured ? ' met-card--featured' : ''}`}
            >
              <div className="met-card-accent" aria-hidden="true" />
              <div className="met-card-body">
                <p className="met-card-title">{metier.nom}</p>
                <p className="met-card-desc">{metier.description}</p>
              </div>
              <div className="met-card-foot">
                <span className="met-card-cta">
                  Découvrir ce métier{' '}
                  <svg
                    aria-hidden="true"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </span>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  )
}
