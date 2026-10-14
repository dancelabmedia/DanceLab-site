import type { Metadata } from 'next'
import Link from 'next/link'
import { existsSync } from 'fs'
import { join } from 'path'
import { notFound } from 'next/navigation'
import { getEpisodes, type UnifiedEpisode } from '@/lib/episodes'
import MetierHero from './MetierHero'
import MetierScrollCue from './MetierScrollCue'
import MetierEpisodesCarousel from './MetierEpisodesCarousel'
import { getRelatedEpisodeNumbersForMetier } from '../../metier-episode-relations'
import {
  UNIVERS,
  UNIVERS_ORDER,
  getMetierById,
  getMetiersByUnivers,
  getUniversIdBySlug,
} from '../../metiers-data'

// ── Paramètres statiques ────────────────────────────────────────────────────

export async function generateStaticParams(): Promise<{ univers: string; metier: string }[]> {
  const params: { univers: string; metier: string }[] = []
  for (const uid of UNIVERS_ORDER) {
    const u     = UNIVERS[uid]
    const items = getMetiersByUnivers(uid)
    for (const m of items) params.push({ univers: u.slug, metier: m.id })
  }
  return params
}

// ── Métadonnées ─────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ univers: string; metier: string }>
}): Promise<Metadata> {
  const { univers: slug, metier: metierId } = await params
  const universId = getUniversIdBySlug(slug)
  if (!universId) return {}
  const universe = UNIVERS[universId]
  const metier   = getMetierById(metierId)
  if (!metier) return {}

  const title       = `${metier.nom} — ${universe.label} | Métiers de la danse · Dance Lab`
  const description = metier.definition
    ? metier.definition.slice(0, 160).replace(/\s\S*$/, '') + '…'
    : metier.description

  return {
    title,
    description,
    openGraph: { title, description, type: 'website' },
    twitter:   { card: 'summary_large_image', title, description },
    alternates: {
      canonical: `/explorer/metiers-de-la-danse/${universe.slug}/${metierId}`,
    },
  }
}

function getRelatedEpisodes(metierId: string, allEpisodes: UnifiedEpisode[]): UnifiedEpisode[] {
  const episodeNumbers = new Set(getRelatedEpisodeNumbersForMetier(metierId))
  if (episodeNumbers.size === 0) return []

  return allEpisodes
    .filter(ep => episodeNumbers.has(ep.number))
    .sort((a, b) => b.number - a.number)
    .slice(0, 6)
}

/**
 * Converts a guest name + episode number to the expected les-invites-header filename.
 * E.g. "Marion Agosta", 130  →  "marionagosta130.png"
 */
function guestToHeaderFilename(guest: string, episodeNumber: number): string {
  const slug = guest
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .toLowerCase()
    .replace(/\s+/g, '')             // remove spaces
  return `${slug}${episodeNumber}.png`
}

/**
 * Builds the list of hero images for a métier, checking les-invites-header first.
 * Returns { images, isPortrait } where isPortrait is true if at least one portrait exists.
 * Falls back to the first episode's square image if none found.
 */
function buildHeroImages(
  episodes: UnifiedEpisode[]
): { images: string[]; isPortrait: boolean } {
  const portraits: string[] = []

  for (const ep of episodes) {
    const filename  = guestToHeaderFilename(ep.guest, ep.number)
    const localPath = join(process.cwd(), 'public', 'images', 'les-invites-header', filename)
    if (existsSync(localPath)) {
      portraits.push(`/images/les-invites-header/${filename}`)
    }
  }

  if (portraits.length > 0) return { images: portraits, isPortrait: true }
  if (episodes.length > 0)  return { images: [episodes[0].image], isPortrait: false }
  return { images: [], isPortrait: false }
}

// ── Page ────────────────────────────────────────────────────────────────────

export default async function MetierDetailPage({
  params,
}: {
  params: Promise<{ univers: string; metier: string }>
}) {
  const { univers: slug, metier: metierId } = await params

  const universId = getUniversIdBySlug(slug)
  if (!universId) notFound()

  const universe = UNIVERS[universId]
  const metier   = getMetierById(metierId)
  if (!metier || metier.univers !== universId) notFound()

  const allEpisodes     = await getEpisodes()
  const relatedEpisodes = getRelatedEpisodes(metierId, allEpisodes)
  const relatedMetiers  = getMetiersByUnivers(universId)
    .filter(item => item.id !== metier.id)
  const { images: heroImages, isPortrait: heroIsPortrait } = buildHeroImages(relatedEpisodes)
  const infoCards = [
    metier.environnement ? { title: 'Environnement de travail', text: metier.environnement } : null,
    metier.competences?.length ? { title: 'Compétences clés', items: metier.competences } : null,
    metier.formation ? { title: 'Formation & diplômes', text: metier.formation } : null,
    metier.statut ? { title: "Statut & conditions d'exercice", text: metier.statut } : null,
  ].filter(Boolean) as Array<{ title: string; text?: string; items?: string[] }>

  return (
    <article className="met-editorial-page" aria-label={metier.nom}>
      <header className={`met-editorial-hero${heroImages.length ? ' has-photo' : ''}`}>
        {heroImages.length > 0 && (
          <MetierHero images={heroImages} isPortrait={heroIsPortrait} />
        )}
        <div className="met-editorial-hero-overlay" aria-hidden="true" />
        <div className="met-editorial-shell met-editorial-hero-content">
          <nav className="met-editorial-breadcrumb" aria-label="Fil d'Ariane">
            <Link href="/explorer/metiers-de-la-danse">← Tous les métiers</Link>
            <span>{universe.label}</span>
          </nav>
          <h1>{metier.nom}</h1>
          <p>{metier.description}</p>
          {metier.tags && <div className="met-editorial-tags">{metier.tags.map(tag => <span key={tag}>{tag}</span>)}</div>}
          <div className="met-editorial-stats">
            {relatedEpisodes.length > 0 && (
              <div><strong>{relatedEpisodes.length}</strong><span>Épisode{relatedEpisodes.length > 1 ? 's' : ''}</span></div>
            )}
            <div><strong>{relatedMetiers.length}</strong><span>Métiers associés</span></div>
            <a href="#contenu-metier" aria-label="Découvrir la fiche">→</a>
          </div>
        </div>
        <MetierScrollCue />
      </header>

      <div className="met-cat-strip met-cat-strip--detail">
        <div className="container met-cat-strip-inner">
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

          <nav className="met-cat-strip-tabs" aria-label="Explorer les catégories de métiers">
            {UNIVERS_ORDER.map(uid => (
              <Link
                key={uid}
                href={`/explorer/metiers-de-la-danse/${UNIVERS[uid].slug}`}
                className={`met-cat-tab${uid === universId ? ' is-active' : ''}`}
                aria-current={uid === universId ? 'page' : undefined}
              >
                <span className="met-cat-tab-num" aria-hidden="true">{UNIVERS[uid].num}</span>
                <span className="met-cat-tab-label">{UNIVERS[uid].label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <div className="met-editorial-shell met-editorial-flow" id="contenu-metier">

        {/* ── Premier niveau : En bref + métiers associés ── */}
        <div className="met-editorial-overview" data-reveal>
          <section className="met-editorial-brief" aria-labelledby="met-brief-title">
            <div><h2 id="met-brief-title">En bref</h2><p>{metier.definition ?? metier.description}</p></div>
          </section>

          {relatedMetiers.length > 0 && (
            <aside className="met-editorial-related-list" aria-labelledby="met-related-title">
              <h2 id="met-related-title">Métiers associés</h2>
              <div>
                {relatedMetiers.map(item => (
                  <Link
                    key={item.id}
                    href={`/explorer/metiers-de-la-danse/${UNIVERS[item.univers].slug}/${item.id}`}
                  >
                    <span>{item.nom}</span><i aria-hidden="true">→</i>
                  </Link>
                ))}
              </div>
            </aside>
          )}
        </div>

        {/* ── Missions ── */}
        {metier.missions?.length ? (
          <section className="met-editorial-missions" aria-labelledby="met-missions-title" data-reveal>
            <h2 id="met-missions-title">Missions principales</h2>
            <ol>{metier.missions.map((mission, index) => <li key={mission}><span>{String(index + 1).padStart(2, '0')}</span><p>{mission}</p></li>)}</ol>
          </section>
        ) : null}

        {/* ── Infos (env. / compétences / formation / statut) — stagger par carte ── */}
        {infoCards.length > 0 && (
          <section className="met-editorial-info-grid" aria-label="Informations sur le métier">
            {infoCards.map((card, idx) => (
              <article
                key={card.title}
                className="met-editorial-info-card"
                data-reveal={(['', 'delay-1', 'delay-2', 'delay-3'] as const)[Math.min(idx, 3)]}
              >
                <h2>{card.title}</h2>
                {card.text  && <p>{card.text}</p>}
                {card.items && <ol>{card.items.map((item, i) => <li key={item}><span>{String(i + 1).padStart(2, '0')}</span>{item}</li>)}</ol>}
              </article>
            ))}
          </section>
        )}

        {/* ── À ne pas confondre ── */}
        {metier.neConfondreAvec?.length ? (
          <section className="met-editorial-npc" aria-labelledby="met-npc-title" data-reveal>
            <h2 id="met-npc-title">À ne pas confondre</h2>
            <div>{metier.neConfondreAvec.map(item => {
              const target = item.lien ? getMetierById(item.lien) : null
              const href = target
                ? `/explorer/metiers-de-la-danse/${UNIVERS[target.univers].slug}/${target.id}`
                : null

              return (
                <article key={item.titre}>
                  {href ? <Link href={href}>{item.titre}</Link> : <h3>{item.titre}</h3>}
                  <p>{item.texte}</p>
                </article>
              )
            })}</div>
          </section>
        ) : null}

      </div>{/* fin met-editorial-flow */}

      {/* ── Bas de fiche : séquence éditoriale immersive ── */}
      <div className="met-fiche-bottom">

        {/* Épisodes : carrousel vertical plein format */}
        <MetierEpisodesCarousel episodes={relatedEpisodes} />

        {/* CTA final indépendant */}
        <section className="met-fiche-cta" aria-label="Continuer l'exploration">
          <div className="met-editorial-shell">
            <Link href="/explorer/metiers-de-la-danse" className="met-fiche-cta-link">
              <span>Continuer l&apos;exploration</span>
              <strong>Tous les métiers</strong>
              <i>Voir l&apos;annuaire complet →</i>
            </Link>
          </div>
        </section>

      </div>{/* fin met-fiche-bottom */}
    </article>
  )
}
