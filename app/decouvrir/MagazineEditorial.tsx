'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { sectionVisibility } from '@/data/section-visibility'
import PhotoCredit from '@/components/PhotoCredit'
import type { MagazineArticle } from './articles-data'
import { getReadTime } from './articles-data'
import { useLocale } from '@/components/LocaleProvider'
import { uiText } from '@/data/i18n/messages'
import type { UnifiedEpisode } from '@/lib/episodes'

function getThemes(locale: string) {
  if (locale === 'en') return [
    { n: '01', title: 'Careers &\nWork',          text: 'Advice, interviews\nand career realities.' },
    { n: '02', title: 'Health &\nWellness',        text: 'Body, prevention\nand balance.' },
    { n: '03', title: 'Society &\nRepresentation', text: 'Inclusion, diversity\nand contemporary issues.' },
    { n: '04', title: 'Culture &\nHistory',        text: 'Origins, heritage\nand movements.' },
    { n: '05', title: 'Market &\nIndustry',        text: 'Trends, economy\nand opportunities.' },
    { n: '06', title: 'Resources &\nTips',         text: 'Tools, guides and ideas\nto go further.' },
  ]
  return [
    { n: '01', title: 'Métiers &\nCarrière',         text: 'Conseils, témoignages\nou réalités du métier.' },
    { n: '02', title: 'Santé &\nBien-être',           text: 'Corps, prévention\net équilibre.' },
    { n: '03', title: 'Société &\nReprésentation',    text: 'Inclusion, diversité\net enjeux contemporains.' },
    { n: '04', title: 'Culture &\nHistoire',          text: 'Origines, héritages\net mouvements.' },
    { n: '05', title: 'Marché &\nIndustrie',          text: 'Tendances, économie\net opportunités.' },
    { n: '06', title: 'Ressources &\nConseils',       text: 'Outils, guides et bons plans\npour aller plus loin.' },
  ]
}

const STYLES = [
  { name: 'Break',      slug: 'break',          image: '/images/styles-de-danse/break.png' },
  { name: 'Claquettes', slug: 'claquettes',      image: '/images/styles-de-danse/claquettes.png' },
  { name: 'Classique',  slug: 'danse-classique', image: '/images/styles-de-danse/danseclassique.png' },
  { name: 'Jazz',       slug: 'jazz',            image: '/images/styles-de-danse/jazz.png' },
]

// ── Utilitaire : mélange Fisher-Yates ─────────────────────────────────────
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function ArticleMeta({ article }: { article: MagazineArticle }) {
  return <span className="magx-meta">{article.publishedDate} · {getReadTime(article)}</span>
}

function ArticleImage({ article }: { article: MagazineArticle }) {
  return <div className="magx-image"><img src={article.image} alt={article.title} style={article.imageObjectPosition ? { objectPosition: article.imageObjectPosition } : undefined} /><PhotoCredit credit={article.imageCredit} /></div>
}

export default function MagazineEditorial({
  articles,
  latestEpisode,
  carouselEpisodes,
}: {
  articles: MagazineArticle[]
  latestEpisode?: UnifiedEpisode
  carouselEpisodes?: UnifiedEpisode[]
}) {
  const locale = useLocale()
  const t = (text: string) => uiText(locale, text)
  const THEMES = getThemes(locale)

  // ── Carrousel aléatoire — 2 slots en crossfade ────────────────────────────
  const slides = carouselEpisodes && carouselEpisodes.length > 0 ? carouselEpisodes : null

  type Slide = { src: string; alt: string }
  const [slotA, setSlotA] = useState<Slide | null>(null)
  const [slotB, setSlotB] = useState<Slide | null>(null)
  const [activeSlot, setActiveSlot] = useState<'A' | 'B'>('A')

  // Refs pour éviter les stale closures dans setInterval
  const queueRef = useRef<number[]>([])
  const posRef = useRef(0)
  const activeSlotRef = useRef<'A' | 'B'>('A')

  // Initialisation : mélange aléatoire au montage
  useEffect(() => {
    if (!slides || slides.length === 0) return
    const q = shuffle(slides.map((_, i) => i))
    queueRef.current = q
    posRef.current = 0
    const first = slides[q[0]]
    setSlotA({ src: first.image || '', alt: first.guest || '' })
    setActiveSlot('A')
    activeSlotRef.current = 'A'
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Défilement automatique toutes les 2 s
  useEffect(() => {
    if (!slides || slides.length <= 1) return
    const timer = setInterval(() => {
      // Avance dans la queue
      let nextPos = posRef.current + 1
      if (nextPos >= queueRef.current.length) {
        // Queue épuisée : réinitialisation avec anti-répétition du dernier épisode affiché
        const lastIdx = queueRef.current[posRef.current]
        let newQueue = shuffle(slides.map((_, i) => i))
        if (newQueue.length > 1 && newQueue[0] === lastIdx) {
          const swapIdx = 1 + Math.floor(Math.random() * (newQueue.length - 1))
          ;[newQueue[0], newQueue[swapIdx]] = [newQueue[swapIdx], newQueue[0]]
        }
        queueRef.current = newQueue
        nextPos = 0
      }
      posRef.current = nextPos

      const ep = slides[queueRef.current[nextPos]]
      const newSlide: Slide = { src: ep.image || '', alt: ep.guest || '' }

      // Met à jour le slot caché puis bascule (crossfade)
      const nextSlot = activeSlotRef.current === 'A' ? 'B' : 'A'
      if (nextSlot === 'B') setSlotB(newSlide)
      else setSlotA(newSlide)
      activeSlotRef.current = nextSlot
      setActiveSlot(nextSlot)
    }, 2000)
    return () => clearInterval(timer)
  }, [slides]) // eslint-disable-line react-hooks/exhaustive-deps

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
        <header className="magx-section-head"><span>{t('À la une')}</span><Link href="/decouvrir/articles-culture">{t("Toute l'actualité →")}</Link></header>
        <div className="magx-feature-grid">
          <Link href={`/decouvrir/articles/${lead.slug}`} className="magx-lead">
            <ArticleImage article={lead} />
            <div className="magx-lead-copy"><span className="magx-category">{lead.category}</span><h2>{lead.title}</h2><p>{lead.chapo}</p><ArticleMeta article={lead} /><i aria-hidden="true">{t("Lire l'article →")}</i></div>
          </Link>
          <div className="magx-side-stack">{side.map(article => <Link key={article.slug} href={`/decouvrir/articles/${article.slug}`} className="magx-side-card"><ArticleImage article={article} /><div><span className="magx-category">{article.category}</span><h3>{article.title}</h3><ArticleMeta article={article} /></div></Link>)}</div>
        </div>
      </div>
    </section>

    {latest.length > 0 && <section className="magx-latest"><div className="container">
      <header className="magx-section-head"><span>{t('Derniers articles')}</span><Link href="/decouvrir/articles-culture">{t('Voir tous les articles →')}</Link></header>
      <div className="magx-latest-grid">{latest.map(article => <Link key={article.slug} href={`/decouvrir/articles/${article.slug}`} className="magx-latest-card"><ArticleImage article={article} /><span className="magx-category">{article.category}</span><h3>{article.title}</h3><ArticleMeta article={article} /></Link>)}</div>
    </div></section>}

    <section className="magx-popular"><div className="container magx-popular-grid">
      <div><span className="magx-eyebrow">{t('Les plus lus')}</span><h2>{t('Ce qui résonne le plus avec vous.')}</h2><p>{t('Une sélection éditoriale des articles mis en avant ces dernières semaines.')}</p></div>
      <ol>{mostRead.map((article, index) => <li key={article.slug}><Link href={`/decouvrir/articles/${article.slug}`}><b>{String(index + 1).padStart(2, '0')}</b><span>{article.title}</span><i aria-hidden="true">→</i></Link></li>)}</ol>
    </div></section>

    <section className="magx-podcast">
      {/* Carrousel aléatoire — crossfade 2 slots, toutes les 2 s */}
      <div className="magx-podcast-photo" style={{ position: 'relative' }}>
        {slotA ? (
          <>
            <img
              src={slotA.src}
              alt={slotA.alt}
              style={{
                position: 'absolute', inset: 0,
                width: '100%', height: '100%',
                objectFit: 'cover',
                opacity: activeSlot === 'A' ? 0.86 : 0,
                transition: 'opacity 0.9s ease',
                pointerEvents: 'none',
              }}
            />
            {slotB && (
              <img
                src={slotB.src}
                alt={slotB.alt}
                style={{
                  position: 'absolute', inset: 0,
                  width: '100%', height: '100%',
                  objectFit: 'cover',
                  opacity: activeSlot === 'B' ? 0.86 : 0,
                  transition: 'opacity 0.9s ease',
                  pointerEvents: 'none',
                }}
              />
            )}
          </>
        ) : (
          <img src="/images/les-invites-header/waabee127.png" alt="Dance Lab" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.86 }} />
        )}
      </div>

      <div className="magx-podcast-intro">
        <span>{t('Prolonger la réflexion')}</span>
        <h2>{t("Et si on en parlait aussi en podcast ?")}</h2>
        <p>{t("Des conversations avec celles et ceux qui font la danse d'aujourd'hui.")}</p>
        <Link href="/ecouter">{t("Découvrir tous les épisodes →")}</Link>
      </div>

      {/* Dernier épisode publié — mis à jour automatiquement */}
      {latestEpisode ? (
        <Link href={`/episodes/${latestEpisode.slug}`} className="magx-podcast-episode">
          <span>{t('Épisode en lien')}</span>
          <div>
            <img src={latestEpisode.image} alt={latestEpisode.guest} />
            <i aria-hidden="true">▶</i>
          </div>
          <small>
            {latestEpisode.number ? `#${latestEpisode.number} · ` : ''}{latestEpisode.guest}
          </small>
          <h3>{latestEpisode.title}</h3>
        </Link>
      ) : (
        <Link href="/episodes/127-waabee" className="magx-podcast-episode">
          <span>{t('Épisode en lien')}</span>
          <div><img src="/images/les-invites/waabee127.png" alt="WaaBee" /><i aria-hidden="true">▶</i></div>
          <small>WaaBee · Battle</small>
          <h3>Ce qu&apos;un danseur ressent juste avant un battle</h3>
        </Link>
      )}

      <div className="magx-readalso"><span>{t('À lire aussi')}</span>{podcastReads.map(article => <Link key={article.slug} href={`/decouvrir/articles/${article.slug}`}>→ <b>{article.title}</b></Link>)}</div>
    </section>

    <section className="magx-themes"><div className="container">
      <header className="magx-section-head"><span>{t('Explorer par thématique')}</span><Link href="/decouvrir/articles-culture">{t('Toutes les thématiques →')}</Link></header>
      <div className="magx-themes-grid">{THEMES.map(theme => <Link key={theme.n} href="/decouvrir/articles-culture"><b>{theme.n}</b><h3>{theme.title.split('\n').map((line, i) => <span key={i}>{line}<br /></span>)}</h3><p>{theme.text.split('\n').map((line, i) => <span key={i}>{line}<br /></span>)}</p><i aria-hidden="true">→</i></Link>)}</div>
    </div></section>

    {sectionVisibility.danceStyles === 'public' && <section className="magx-styles"><div className="container">
      <header className="magx-section-head"><span>{t('Comprendre les danses')}</span><Link href="/explorer/styles-de-danse">{t('Voir tous les styles →')}</Link></header>
      <p className="magx-styles-intro">{t('Origines, histoire et figures majeures pour comprendre les cultures derrière les mouvements.')}</p>
      <div className="magx-styles-grid">{STYLES.map(style => <Link key={style.slug} href={`/explorer/styles-de-danse/${style.slug}`}><img src={style.image} alt={style.name} /><span>{style.name}</span><i aria-hidden="true">→</i></Link>)}</div>
    </div></section>}

    <section className="magx-newsletter"><div className="container"><div><h2>{t('Restons en mouvement.')}</h2><p>{t("Des articles, des recommandations et les coulisses de Dance Lab, chaque semaine dans votre boîte mail.")}</p></div><Link href="/#newsletter"><span>{t('Votre adresse e-mail')}</span><b>{t("S'inscrire")}</b></Link></div></section>
  </>
}
