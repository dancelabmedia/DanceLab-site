'use client'

import Link from 'next/link'
import PhotoCredit from '@/components/PhotoCredit'
import type { MagazineArticle } from './articles-data'

const THEMES = [
  { n: '01', title: 'Métiers &\nCarrière', text: 'Conseils, témoignages\nou réalités du métier.' },
  { n: '02', title: 'Santé &\nBien-être', text: 'Corps, prévention\net équilibre.' },
  { n: '03', title: 'Société &\nReprésentation', text: 'Inclusion, diversité\net enjeux contemporains.' },
  { n: '04', title: 'Culture &\nHistoire', text: 'Origines, héritages\net mouvements.' },
  { n: '05', title: 'Marché &\nIndustrie', text: 'Tendances, économie\net opportunités.' },
  { n: '06', title: 'Ressources &\nConseils', text: 'Outils, guides et bons plans\npour aller plus loin.' },
]

const STYLES = [
  { name: 'Break', slug: 'break', image: '/images/styles-de-danse/break.png' },
  { name: 'Claquettes', slug: 'claquettes', image: '/images/styles-de-danse/claquettes.png' },
  { name: 'Classique', slug: 'danse-classique', image: '/images/styles-de-danse/danseclassique.png' },
  { name: 'Jazz', slug: 'jazz', image: '/images/styles-de-danse/jazz.png' },
]

function ArticleMeta({ article }: { article: MagazineArticle }) {
  return <span className="magx-meta">{article.publishedDate} · {article.readTime}</span>
}

function ArticleImage({ article }: { article: MagazineArticle }) {
  return <div className="magx-image"><img src={article.image} alt={article.title} style={article.imageObjectPosition ? { objectPosition: article.imageObjectPosition } : undefined} /><PhotoCredit credit={article.imageCredit} /></div>
}

export default function MagazineEditorial({ articles }: { articles: MagazineArticle[] }) {
  const lead = articles[0]
  const side = articles.slice(1, 3)
  const latest = articles.slice(3, 8)
  const mostRead = articles.slice(0, 5)
  const related = articles.filter(article => /battle|carrière|casting|pression|mental/i.test(`${article.title} ${article.tags.join(' ')}`)).slice(0, 3)
  const podcastReads = related.length >= 2 ? related : articles.slice(0, 3)

  if (!lead) return null

  return <>
    <section className="magx-feature">
      <div className="container">
        <header className="magx-section-head"><span>À la une</span><Link href="/decouvrir/articles-culture">Toute l’actualité →</Link></header>
        <div className="magx-feature-grid">
          <Link href={`/decouvrir/articles/${lead.slug}`} className="magx-lead">
            <ArticleImage article={lead} />
            <div className="magx-lead-copy"><span className="magx-category">{lead.category}</span><h2>{lead.title}</h2><p>{lead.chapo}</p><ArticleMeta article={lead} /><i aria-hidden="true">Lire l’article →</i></div>
          </Link>
          <div className="magx-side-stack">{side.map(article => <Link key={article.slug} href={`/decouvrir/articles/${article.slug}`} className="magx-side-card"><ArticleImage article={article} /><div><span className="magx-category">{article.category}</span><h3>{article.title}</h3><ArticleMeta article={article} /></div></Link>)}</div>
        </div>
      </div>
    </section>

    {latest.length > 0 && <section className="magx-latest"><div className="container">
      <header className="magx-section-head"><span>Derniers articles</span><Link href="/decouvrir/articles-culture">Voir tous les articles →</Link></header>
      <div className="magx-latest-grid">{latest.map(article => <Link key={article.slug} href={`/decouvrir/articles/${article.slug}`} className="magx-latest-card"><ArticleImage article={article} /><span className="magx-category">{article.category}</span><h3>{article.title}</h3><ArticleMeta article={article} /></Link>)}</div>
    </div></section>}

    <section className="magx-popular"><div className="container magx-popular-grid">
      <div><span className="magx-eyebrow">Les plus lus</span><h2>Ce qui résonne<br />le plus avec vous.</h2><p>Une sélection éditoriale des articles mis en avant ces dernières semaines.</p></div>
      <ol>{mostRead.map((article, index) => <li key={article.slug}><Link href={`/decouvrir/articles/${article.slug}`}><b>{String(index + 1).padStart(2, '0')}</b><span>{article.title}</span><i aria-hidden="true">→</i></Link></li>)}</ol>
    </div></section>

    <section className="magx-podcast">
      <div className="magx-podcast-photo"><img src="/images/les-invites-header/waabee127.png" alt="WaaBee" /></div>
      <div className="magx-podcast-intro"><span>Prolonger la réflexion</span><h2>Et si on en parlait<br />aussi en podcast ?</h2><p>Des conversations avec celles et ceux qui font la danse d’aujourd’hui.</p><Link href="/ecouter">Découvrir tous les épisodes →</Link></div>
      <Link href="/episodes/127-waabee" className="magx-podcast-episode"><span>Épisode en lien</span><div><img src="/images/les-invites/waabee127.png" alt="WaaBee" /><i aria-hidden="true">▶</i></div><small>WaaBee · Battle</small><h3>Ce qu’un danseur ressent juste avant un battle</h3></Link>
      <div className="magx-readalso"><span>À lire aussi</span>{podcastReads.map(article => <Link key={article.slug} href={`/decouvrir/articles/${article.slug}`}>→ <b>{article.title}</b></Link>)}</div>
    </section>

    <section className="magx-themes"><div className="container">
      <header className="magx-section-head"><span>Explorer par thématique</span><Link href="/decouvrir/articles-culture">Toutes les thématiques →</Link></header>
      <div className="magx-themes-grid">{THEMES.map(theme => <Link key={theme.n} href="/decouvrir/articles-culture"><b>{theme.n}</b><h3>{theme.title.split('\n').map((line, i) => <span key={i}>{line}<br /></span>)}</h3><p>{theme.text.split('\n').map((line, i) => <span key={i}>{line}<br /></span>)}</p><i aria-hidden="true">→</i></Link>)}</div>
    </div></section>

    <section className="magx-styles"><div className="container">
      <header className="magx-section-head"><span>Comprendre les danses</span><Link href="/explorer/styles-de-danse">Voir tous les styles →</Link></header>
      <p className="magx-styles-intro">Origines, histoire et figures majeures pour comprendre les cultures derrière les mouvements.</p>
      <div className="magx-styles-grid">{STYLES.map(style => <Link key={style.slug} href={`/explorer/styles-de-danse/${style.slug}`}><img src={style.image} alt={style.name} /><span>{style.name}</span><i aria-hidden="true">→</i></Link>)}</div>
    </div></section>

    <section className="magx-newsletter"><div className="container"><div><h2>Restons en mouvement.</h2><p>Des articles, des recommandations et les coulisses de Dance Lab, chaque semaine dans votre boîte mail.</p></div><Link href="/#newsletter"><span>Votre adresse e-mail</span><b>S’inscrire</b></Link></div></section>
  </>
}
