import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { existsSync } from 'fs'
import { join } from 'path'
import { notFound } from 'next/navigation'
import { getEpisodes, type UnifiedEpisode } from '@/lib/episodes'
import MetierHero from './MetierHero'
import {
  UNIVERS,
  UNIVERS_ORDER,
  getMetierById,
  getMetiersByUnivers,
  getUniversIdBySlug,
  type Metier,
  type MetierUniversId,
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

// ── Épisodes associés ───────────────────────────────────────────────────────

/**
 * Mots-clés par métier pour filtrer les épisodes associés.
 *
 * RÈGLE ÉDITORIALE STRICTE :
 * Un épisode n'est associé à un métier que si l'invité·e EXERCE réellement ce métier,
 * d'après son rôle déclaré dans le champ `role` de l'épisode.
 * - Parler d'un métier ≠ exercer ce métier.
 * - Travailler avec des personnes de ce métier ≠ exercer ce métier.
 * - Évoluer dans le même secteur ≠ exercer ce métier.
 * En cas de doute, ne pas associer. Une fiche sans épisode est préférable
 * à une fiche avec des associations inexactes.
 */
const METIER_KEYWORDS: Record<string, string[]> = {
  // ── Interpréter ────────────────────────────────────────────────────────────
  'danseur':                   ['danseur', 'danseuse', 'danseurs', 'danseuses'],
  'performeur':                ['performeur', 'performeuse'],
  'acrobate':                  ['acrobate', 'cirque', 'aérien'],
  // figurant, swing, doublure-danse, artiste-pluridisciplinaire → aucun épisode pertinent actuellement

  // ── Créer ──────────────────────────────────────────────────────────────────
  'choregraphe':               ['chorégraphe', 'choreographe'],
  'metteur-en-scene':          ['metteur en scène', 'metteure en scène'],
  'scenographe':               ['scénographe', 'scenographe'],
  'compositeur':               ['compositeur', 'compositrice', 'auteur compositeur', 'auteure compositrice'],
  // dramaturge, assistant-choregraphe, notateur-mouvement, dance-captain → aucun épisode pertinent

  // ── Transmettre ────────────────────────────────────────────────────────────
  'professeur':                ['professeur', 'professeure'],
  'repetiteur':                ['répétiteur', 'répétitrice', 'assistant chorégraphe'],
  // pedagogue-scolaire → aucun épisode pertinent
  'formateur':                 ['formateur', 'formatrice'],
  // maitre-ballet, coach-choregraphique, mediateur-culturel → aucun épisode pertinent

  // ── Produire & diffuser ────────────────────────────────────────────────────
  'directeur-compagnie-ecole': ['directeur de compagnie', 'directrice de compagnie', "directeur d'école", "directrice d'école"],
  'charge-production':         ['cheffe de projet', 'chef de projet'],
  'diffuseur':                 ['diffuseur', 'programmatrice', 'programmateur'],
  'agent-artistique':          ["agente d'artiste", "agent d'artiste"],
  // charge-communication : 'entrepreneur'/'entrepreneuse' ≠ chargé.e de communication —
  // aucun épisode ne déclare ce métier explicitement dans son rôle pour le moment
  'charge-communication':      ['chargée de communication', 'chargé de communication', 'responsable communication'],
  // administrateur-compagnie, directeur-production, charge-diffusion,
  // charge-relations-publics, booker → aucun épisode pertinent

  // ── Accompagner ────────────────────────────────────────────────────────────
  'kine':                      ['kinésithérapeute', 'kinesitherapeute'],
  // coach : 'coach' seul est trop large (vocal, boxe…). On cible les coachings
  // directement liés à la préparation corporelle des danseur·ses.
  'coach':                     ['préparateur', 'préparatrice', 'naturopathe', 'coach pilates', 'coach corporel'],
  'photographe':               ['photographe'],
  'journaliste':               ['journaliste', 'critique de danse'],
  'medecin-sport':             ['médecin', 'médecine du sport', 'docteur'],
  'osteopathe':                ['ostéopathe', 'osteopathe'],
  'magnetiseur':               ['magnétiseur', 'magnetiseur', 'magnétiseuse'],
  'directeur-casting':         ['directeur de casting', 'directrice de casting'],
  // preparateur-physique, nutritionniste, manager-artiste, conseiller-insertion,
  // avocat-spectacle, comptable-artistes → aucun épisode pertinent actuellement

  // ── Image & scène ──────────────────────────────────────────────────────────
  'regisseur':                 ['régisseur', 'régisseuse'],
  // createur-lumiere : 'lumiere'/'eclairage' seul est trop large → aucun épisode
  // déclare ce rôle explicitement pour le moment
  'costumier':                 ['costumier', 'costumière', 'costume designer'],
  'styliste':                  ['styliste'],
  'videaste':                  ['vidéaste', 'videaste'],
  // realisateur, cadreur, directeur-photo : aucun épisode ne déclare ce rôle
  // directement — un tournage ne fait pas de l'invité·e un réalisateur·rice
}

function normalize(s: string): string {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

function getRelatedEpisodes(metierId: string, allEpisodes: UnifiedEpisode[]): UnifiedEpisode[] {
  const keywords = METIER_KEYWORDS[metierId] ?? []
  if (keywords.length === 0) return []
  const normKeys = keywords.map(normalize)

  return allEpisodes
    .filter(ep => {
      if (!ep.role) return false
      const nr = normalize(ep.role)
      return normKeys.some(k => nr.includes(k))
    })
    .sort((a, b) => b.number - a.number)
    .slice(0, 6)
}

function getProfessionImage(metier: Metier, episodes: UnifiedEpisode[]): string | null {
  return getRelatedEpisodes(metier.id, episodes)[0]?.image || null
}

/**
 * Répartit les cartes avec et sans portrait aussi régulièrement que possible.
 * Le groupe majoritaire forme la trame ; le groupe minoritaire est inséré à
 * intervalles réguliers. Aucune donnée ni image n'est créée par cette logique.
 */
function balanceProfessionVisuals<T extends { image: string | null }>(items: T[]): T[] {
  const portraits = items.filter(item => item.image)
  const gradients = items.filter(item => !item.image)
  if (!portraits.length || !gradients.length) return items

  const majority = portraits.length >= gradients.length ? portraits : gradients
  const minority = portraits.length >= gradients.length ? gradients : portraits

  if (majority.length === minority.length) {
    return majority.flatMap((item, index) => [item, minority[index]])
  }

  const insertAfter = new Map<number, T[]>()
  minority.forEach((item, index) => {
    const target = Math.max(
      0,
      Math.floor(((index + 1) * majority.length) / (minority.length + 1)) - 1,
    )
    insertAfter.set(target, [...(insertAfter.get(target) ?? []), item])
  })

  return majority.flatMap((item, index) => [item, ...(insertAfter.get(index) ?? [])])
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
    .slice(0, 5)
  const relatedProfessionCards = balanceProfessionVisuals(
    relatedMetiers.map(item => ({ metier: item, image: getProfessionImage(item, allEpisodes) })),
  )
  const { images: heroImages, isPortrait: heroIsPortrait } = buildHeroImages(relatedEpisodes)
  const secondaryImage  = relatedEpisodes[1]?.image || null
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
            <span>/</span><span>{universe.label}</span>
          </nav>
          <span className="met-editorial-pill">{universe.label}</span>
          <h1>{metier.nom}</h1>
          <p>{metier.description}</p>
          {metier.tags && <div className="met-editorial-tags">{metier.tags.map(tag => <span key={tag}>{tag}</span>)}</div>}
          <div className="met-editorial-stats">
            {relatedEpisodes.length > 0 && (
              <div><strong>{relatedEpisodes.length}</strong><span>Témoignage{relatedEpisodes.length > 1 ? 's' : ''}</span></div>
            )}
            <div><strong>{relatedMetiers.length}</strong><span>Métiers associés</span></div>
            <a href="#contenu-metier" aria-label="Découvrir la fiche">→</a>
          </div>
        </div>
      </header>

      <div className="met-editorial-shell met-editorial-flow" id="contenu-metier">

        {/* ── En bref ── */}
        <section className="met-editorial-brief" aria-labelledby="met-brief-title" data-reveal>
          <div><h2 id="met-brief-title">En bref</h2><p>{metier.definition ?? metier.description}</p></div>
          {secondaryImage && <Image src={secondaryImage} alt="" width={520} height={340} className="met-editorial-brief-image" />}
        </section>

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
            <div>{metier.neConfondreAvec.map(item => <article key={item.titre}>{item.lien ? <Link href={`/explorer/metiers-de-la-danse/${universe.slug}/${item.lien}`}>{item.titre} →</Link> : <h3>{item.titre}</h3>}<p>{item.texte}</p></article>)}</div>
          </section>
        ) : null}

        {/* ── Épisodes associés — heading + cartes en stagger ── */}
        {relatedEpisodes.length > 0 && (
          <section className="met-editorial-episodes" aria-labelledby="met-episodes-title">
            <div className="met-editorial-section-heading" data-reveal>
              <div>
                <span>Podcast Dance Lab</span>
                <h2 id="met-episodes-title">Épisode{relatedEpisodes.length > 1 ? 's' : ''} associé{relatedEpisodes.length > 1 ? 's' : ''}</h2>
                <p>Des invité.e.s qui exercent ce métier ont partagé leur expérience dans le podcast.</p>
              </div>
            </div>
            <div className="met-editorial-episode-grid">
              {relatedEpisodes.map((ep, idx) => (
                <Link
                  key={ep.number}
                  href={`/episodes/${ep.slug}`}
                  className="met-editorial-episode-card"
                  data-reveal={(['', 'delay-1', 'delay-2', '', 'delay-1', 'delay-2'] as const)[Math.min(idx, 5)]}
                >
                  <Image src={ep.image} alt={ep.guest} width={620} height={400} />
                  <div><span>Épisode {ep.number}</span><h3>{ep.title}</h3><strong>{ep.guest}</strong>{ep.role && <small>{ep.role}</small>}</div>
                  <i aria-hidden="true">▶</i>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── Métiers associés — heading + cartes en stagger ── */}
        <section className="met-editorial-related" aria-labelledby="met-related-title">
          <div className="met-editorial-section-heading" data-reveal>
            <div><span>{universe.label}</span><h2 id="met-related-title">Métiers associés</h2><p>Ces métiers collaborent souvent au sein du même univers.</p></div>
          </div>
          <div className="met-editorial-related-track">
            {relatedProfessionCards.map(({ metier: item, image }, idx) => (
              <Link
                key={item.id}
                href={`/explorer/metiers-de-la-danse/${UNIVERS[item.univers].slug}/${item.id}`}
                className={`met-editorial-related-card${image ? ' has-photo' : ''}`}
                data-reveal={(['', 'delay-1', 'delay-2', 'delay-1', 'delay-2'] as const)[Math.min(idx, 4)]}
              >
                {image && <Image src={image} alt="" fill sizes="240px" />}
                <span>{item.nom}</span><i aria-hidden="true">→</i>
              </Link>
            ))}
          </div>
        </section>

        {/* ── CTA global ── */}
        <Link href="/explorer/metiers-de-la-danse" className="met-editorial-all-cta" data-reveal>
          <span>Aller plus loin</span>
          <strong>Découvrir tous les métiers</strong>
          <p>Explorez l&apos;ensemble des métiers qui font vivre la danse, sur scène, en coulisses et au-delà.</p>
          <i aria-hidden="true">Voir tous les métiers →</i>
        </Link>
      </div>
    </article>
  )
}
