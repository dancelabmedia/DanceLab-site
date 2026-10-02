import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireExplorerAccess } from '@/lib/explorer-access'
import { getPublishedArticles } from '@/app/decouvrir/articles-data'
import { danceStyles } from '@/app/explorer/styles-de-danse/styles-data'
import { episodesList } from '@/data/episodes-list'
import { ecolesDanse, getEcoleById, getEcoleLocationLabel } from '../ecoles-data'

type Props = { params: Promise<{ id: string }> }

const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

function linkedStylesFor(styles: string[]) {
  return danceStyles.filter(style => {
    const names = [style.name, ...(style.aliases ?? [])].map(normalize)
    return styles.some(schoolStyle => {
      const school = normalize(schoolStyle)
      return names.some(name => school === name || school.includes(name))
    })
  })
}

export function generateStaticParams() {
  return ecolesDanse.map(ecole => ({ id: ecole.id }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const ecole = getEcoleById(id)
  if (!ecole) return { title: 'Établissement introuvable | Dance Lab' }
  return {
    title: `${ecole.nom} — école de danse | Dance Lab`,
    description: ecole.description ?? `Disciplines, niveaux et informations pratiques de ${ecole.nom}.`,
  }
}

export default async function EcoleDetailPage({ params }: Props) {
  await requireExplorerAccess('schools')
  const { id } = await params
  const ecole = getEcoleById(id)
  if (!ecole) notFound()

  const linkedStyles = linkedStylesFor(ecole.styles).slice(0, 6)
  const episodeSlugs = [...new Set(linkedStyles.flatMap(style => style.episodeLinks.map(episode => episode.slug)))]
  const linkedEpisodes = episodeSlugs.map(slug => episodesList.find(episode => episode.slug === slug)).filter(Boolean).slice(0, 3)
  const styleTerms = new Set(linkedStyles.flatMap(style => [style.name, ...(style.aliases ?? [])]).map(normalize))
  const linkedArticles = getPublishedArticles().filter(article => article.tags.some(tag => styleTerms.has(normalize(tag)))).slice(0, 3)

  return <main className="ecole-detail-page">
    <header className="ecole-detail-hero">
      <div className="ecole-detail-hero-inner">
        <Link href="/explorer/ecoles-de-danse" className="ecole-detail-back">← Toutes les écoles</Link>
        <span>{ecole.type}</span>
        <h1>{ecole.nom}</h1>
        <p>{getEcoleLocationLabel(ecole)}</p>
      </div>
    </header>

    <div className="ecole-detail-layout">
      <article className="ecole-detail-main">
        {ecole.image && <div className="ecole-detail-image"><img src={ecole.image} alt={ecole.imageAlt ?? ecole.nom} /></div>}
        {ecole.description && <p className="ecole-detail-intro">{ecole.description}</p>}

        <section><span className="section-label">Disciplines</span><div className="ecole-detail-pills">{ecole.styles.map(style => <span key={style}>{style}</span>)}</div></section>
        <section className="ecole-detail-grid">
          <div><span className="section-label">Public</span><p>{ecole.publics?.join(' · ') || ecole.pratiques.filter(value => value === 'Enfants' || value === 'Adultes').join(' · ') || 'Non précisé'}</p></div>
          <div><span className="section-label">Niveaux</span><p>{ecole.niveaux.join(' · ') || 'Non précisé'}</p></div>
          <div><span className="section-label">Pratique</span><p>{ecole.pratiques.join(' · ') || 'Non précisé'}</p></div>
          <div><span className="section-label">Adresse</span><p>{ecole.adresse || getEcoleLocationLabel(ecole)}</p></div>
        </section>
      </article>

      <aside className="ecole-detail-aside">
        <span className="section-label">Informations</span>
        <h2>Préparer sa visite</h2>
        <p>Consultez les horaires, conditions d’inscription et tarifs directement auprès de l’établissement.</p>
        {ecole.siteWeb && <a href={ecole.siteWeb} target="_blank" rel="noopener noreferrer">Visiter le site officiel ↗</a>}
      </aside>
    </div>

    {(linkedStyles.length > 0 || linkedEpisodes.length > 0 || linkedArticles.length > 0) && <section className="ecole-detail-ecosystem">
      <div className="container">
        <span className="section-label">L’écosystème Dance Lab</span>
        <h2>Continuer l’exploration</h2>
        <p className="ecole-detail-ecosystem-intro">Trouver où danser, découvrir le style, comprendre sa culture et écouter les artistes qui le font vivre.</p>
        <div className="ecole-detail-links">
          {linkedStyles.map(style => <Link key={style.slug} href={`/explorer/styles-de-danse/${style.slug}`}><small>STYLE DE DANSE</small><strong>{style.name}</strong><span>Découvrir →</span></Link>)}
          {linkedEpisodes.map(episode => episode && <Link key={episode.slug} href={`/episodes/${episode.slug}`}><small>ÉPISODE #{episode.number}</small><strong>{episode.guest}</strong><span>{episode.title} →</span></Link>)}
          {linkedArticles.map(article => <Link key={article.slug} href={`/decouvrir/articles/${article.slug}`}><small>MAGAZINE</small><strong>{article.title}</strong><span>Lire →</span></Link>)}
        </div>
      </div>
    </section>}
  </main>
}
