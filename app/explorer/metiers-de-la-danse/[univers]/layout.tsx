import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  UNIVERS,
  UNIVERS_ORDER,
  getMetiersByUnivers,
  getUniversIdBySlug,
} from '../metiers-data'
import MetierUniversLayout from './MetierUniversLayout'
import CategoryUniverseHero from './CategoryUniverseHero'

const CATEGORY_DESCRIPTIONS = {
  interpreter: "Être sur scène, porter une œuvre, un personnage ou une intention. Les métiers de l'interprétation sont ceux qui donnent corps à la danse et au spectacle face au public, sur scène comme devant une caméra.",
  creer: "Imaginer ce qui sera donné à voir, à entendre ou à ressentir. Les métiers de la création construisent les œuvres, les mouvements, les espaces, les univers et les intentions artistiques qui donnent naissance à un projet.",
  transmettre: "Faire circuler un geste, une technique, une pratique ou une expérience. Les métiers de la transmission accompagnent l'apprentissage de la danse et permettent aux savoirs de se partager et d'évoluer.",
  'produire-diffuser': "Faire en sorte qu'un projet puisse réellement exister et rencontrer son public. Production, administration, financement, diffusion, programmation : ces métiers structurent les projets et les accompagnent de leur création jusqu'à leur exploitation.",
  accompagner: "Prendre soin des corps, des carrières et des personnes qui font la danse. Santé, préparation, récupération, accompagnement physique ou mental : ces métiers permettent aux artistes d'évoluer et de durer.",
  'image-scene': "Construire tout ce qui permet à la danse d'être vue, entendue, mise en lumière, captée et racontée. De la scène à l'image, ces métiers participent directement à la manière dont une œuvre est présentée au public.",
} as const

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

  // Navigation entre univers
  const currentIndex = UNIVERS_ORDER.indexOf(universId)
  const prevId = currentIndex > 0                         ? UNIVERS_ORDER[currentIndex - 1] : null
  const nextId = currentIndex < UNIVERS_ORDER.length - 1 ? UNIVERS_ORDER[currentIndex + 1] : null

  return (
    <>
      {/* ═══════════════════════════════════════════════════════
          HERO — identité de l'univers (stable à travers la navigation)
      ═══════════════════════════════════════════════════════ */}
      <CategoryUniverseHero
        label={universe.label}
        description={CATEGORY_DESCRIPTIONS[universId]}
        count={items.length}
        professions={items.map((item) => ({
            id: item.id,
            nom: item.nom,
            description: item.description,
            href: `/explorer/metiers-de-la-danse/${universe.slug}/${item.id}`,
          }))}
      />

      {/* ═══════════════════════════════════════════════════════
          BARRE NAVIGATION CATÉGORIES — collante sous le hero
          Permet de passer d'une catégorie à l'autre sans revenir
          à la page générale Métiers.
      ═══════════════════════════════════════════════════════ */}
      <div className="met-cat-strip">
        <div className="container met-cat-strip-inner">

          {/* Retour page générale */}
          <Link href="/explorer/metiers-de-la-danse" className="met-cat-strip-back">
            <svg
              aria-hidden="true"
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            <span>Tous les métiers</span>
          </Link>

          <span className="met-cat-strip-sep" aria-hidden="true" />

          {/* Onglets des 6 catégories */}
          <nav className="met-cat-strip-tabs" aria-label="Explorer les catégories de métiers">
            {UNIVERS_ORDER.map((uid) => (
              <Link
                key={uid}
                href={`/explorer/metiers-de-la-danse/${UNIVERS[uid].slug}`}
                className={`met-cat-tab${uid === universId ? ' is-active' : ''}`}
                aria-current={uid === universId ? 'page' : undefined}
              >
                <span className="met-cat-tab-num" aria-hidden="true">
                  {UNIVERS[uid].num}
                </span>
                <span className="met-cat-tab-label">{UNIVERS[uid].label}</span>
              </Link>
            ))}
          </nav>

        </div>
      </div>

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
