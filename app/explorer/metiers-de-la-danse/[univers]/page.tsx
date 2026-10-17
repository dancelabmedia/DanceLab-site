import type { Metadata } from 'next'
import ProfessionCard from './ProfessionCard'
import styles from './ProfessionCard.module.css'
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
        <div className={styles.grid}>
          {items.map((metier) => (
            <ProfessionCard
              key={metier.id}
              metier={metier}
              universeSlug={universe.slug}
            />
          ))}
        </div>

      </div>
    </section>
  )
}
