import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  UNIVERS,
  UNIVERS_ORDER,
  getMetiersByUnivers,
  getUniversIdBySlug,
} from '../metiers-data'
import MetierUniversLayout from './MetierUniversLayout'

/**
 * Layout persistant pour toutes les pages de type /[univers]/[metier].
 *
 * Rendu unique par univers, partagé entre tous les métiers de l'univers :
 * – Hero de l'univers (fond, titre, description, breadcrumb)
 * – Deux colonnes : contenu métier (gauche) + navigation sidebar (droite)
 *
 * Le layout ne se re-monte pas entre navigations /interpreter/danseur →
 * /interpreter/performeur : seul le {children} change, le hero reste stable.
 */
export default async function UniversMetiersLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params:   Promise<{ univers: string }>
}) {
  const { univers: slug } = await params
  const universId = getUniversIdBySlug(slug)
  if (!universId) notFound()

  const universe = UNIVERS[universId]
  const items    = getMetiersByUnivers(universId)

  // Navigation entre univers (points)
  const currentIndex = UNIVERS_ORDER.indexOf(universId)
  const prevId = currentIndex > 0                         ? UNIVERS_ORDER[currentIndex - 1] : null
  const nextId = currentIndex < UNIVERS_ORDER.length - 1 ? UNIVERS_ORDER[currentIndex + 1] : null

  return (
    <>
      {/* ═══════════════════════════════════════════════════════
          HERO — identité de l'univers (stable à travers la navigation)
      ═══════════════════════════════════════════════════════ */}
      <section className="met-univers-page-hero" aria-label={`Univers ${universe.label}`}>

        {/* Décorations géométriques */}
        <div className="met-hero-deco" aria-hidden="true">
          <div className="met-hero-deco-circle met-hero-deco-circle-1" />
          <div className="met-hero-deco-circle met-hero-deco-circle-2" />
          <div className="met-hero-deco-line" />
        </div>

        <div className="container">

          {/* Fil d'Ariane + retour */}
          <nav className="met-univers-breadcrumb" aria-label="Fil d'Ariane">
            <Link href="/explorer/metiers-de-la-danse" className="met-univers-back">
              <span aria-hidden="true">←</span> Tous les métiers
            </Link>
            <span className="met-univers-breadcrumb-sep" aria-hidden="true">/</span>
            <span className="met-univers-breadcrumb-current" aria-current="page">
              {universe.label}
            </span>
          </nav>

          <span className="met-univers-page-num" aria-hidden="true">{universe.num}</span>
          <h1 className="met-univers-page-title">{universe.label}</h1>
          <p className="met-univers-page-desc">{universe.description}</p>

          <div className="met-univers-hero-foot">
            <span className="met-univers-page-badge">
              {items.length} métier{items.length > 1 ? 's' : ''}
            </span>

            {/* Dots de navigation entre les 6 univers */}
            <nav className="met-univers-hero-dots" aria-label="Naviguer entre les univers">
              {UNIVERS_ORDER.map((uid) => (
                <Link
                  key={uid}
                  href={`/explorer/metiers-de-la-danse/${UNIVERS[uid].slug}`}
                  className={`met-univers-hero-dot${uid === universId ? ' is-active' : ''}`}
                  aria-label={UNIVERS[uid].label}
                  aria-current={uid === universId ? 'page' : undefined}
                  title={UNIVERS[uid].label}
                />
              ))}
            </nav>
          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          CORPS — deux colonnes (client component pour état actif sidebar)
      ═══════════════════════════════════════════════════════ */}
      <MetierUniversLayout universId={universId} metiers={items}>
        {children}
      </MetierUniversLayout>

      {/* ═══════════════════════════════════════════════════════
          NAVIGATION ENTRE UNIVERS — discrète en pied de page
      ═══════════════════════════════════════════════════════ */}
      <nav className="met-univers-nav met-univers-nav--compact" aria-label="Naviguer entre les univers">
        <div className="container met-univers-nav-inner">

          {prevId ? (
            <Link
              href={`/explorer/metiers-de-la-danse/${UNIVERS[prevId].slug}`}
              className="met-univers-nav-link met-univers-nav-link--prev"
            >
              <span className="met-univers-nav-dir"><span aria-hidden="true">←</span> Univers précédent</span>
              <strong className="met-univers-nav-label">{UNIVERS[prevId].label}</strong>
            </Link>
          ) : <span />}

          {nextId ? (
            <Link
              href={`/explorer/metiers-de-la-danse/${UNIVERS[nextId].slug}`}
              className="met-univers-nav-link met-univers-nav-link--next"
            >
              <span className="met-univers-nav-dir">Univers suivant <span aria-hidden="true">→</span></span>
              <strong className="met-univers-nav-label">{UNIVERS[nextId].label}</strong>
            </Link>
          ) : <span />}

        </div>
      </nav>
    </>
  )
}
