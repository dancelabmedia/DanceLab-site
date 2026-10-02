'use client'

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import Link from 'next/link'
import { useLocale } from '@/components/LocaleProvider'
import { uiText } from '@/data/i18n/messages'

export type PodcastBannerImage = {
  src: string
  alt: string
  desktopPosition: string
  mobilePosition: string
}

export type PodcastEpisodeCard = {
  number: number
  guest: string
  title: string
  slug: string
  image: string
}

type Props = {
  images: PodcastBannerImage[]
  episode?: PodcastEpisodeCard | null
}

function shuffledIndexes(length: number): number[] {
  const indexes = Array.from({ length }, (_, index) => index)
  for (let index = indexes.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1))
    ;[indexes[index], indexes[swap]] = [indexes[swap], indexes[index]]
  }
  return indexes
}

export default function StylesPodcastBanner({ images, episode }: Props) {
  const locale = useLocale()
  const t = (text: string) => uiText(locale, text)
  const [order, setOrder] = useState(() => images.map((_, index) => index))
  const orderRef = useRef(order)
  const [position, setPosition] = useState(0)
  const [previous, setPrevious] = useState<number | null>(null)

  useEffect(() => {
    if (images.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const initialOrder = shuffledIndexes(images.length)
    orderRef.current = initialOrder
    setOrder(initialOrder)
    setPosition(0)
    const timer = window.setInterval(() => {
      setPosition(current => {
        const next = (current + 1) % images.length
        setPrevious(orderRef.current[current] ?? current)
        if (next === 0) {
          const nextOrder = shuffledIndexes(images.length)
          orderRef.current = nextOrder
          setOrder(nextOrder)
        }
        return next
      })
    }, 3600)
    return () => window.clearInterval(timer)
  }, [images.length])

  const currentIndex = order[position] ?? 0
  const current = images[currentIndex]
  const previousImage = previous === null ? null : images[previous]

  return (
    <div className="sty-podcast">

      {/* ── Image de fond cyclique ── */}
      <div className="sty-podcast-media" aria-hidden="true">
        {previousImage ? (
          <img
            key={`previous-${previous}-${position}`}
            src={previousImage.src}
            alt=""
            className="sty-podcast-media-previous"
            style={{
              '--sty-podcast-position': previousImage.desktopPosition,
              '--sty-podcast-position-mobile': previousImage.mobilePosition,
            } as CSSProperties}
          />
        ) : null}
        {current ? (
          <img
            key={`current-${currentIndex}-${position}`}
            src={current.src}
            alt=""
            className="sty-podcast-media-current"
            style={{
              '--sty-podcast-position': current.desktopPosition,
              '--sty-podcast-position-mobile': current.mobilePosition,
            } as CSSProperties}
          />
        ) : null}
      </div>
      <div className="sty-podcast-glow" aria-hidden="true" />

      {/* ── Composition éditoriale — texte gauche · carte droite ── */}
      <div className="sty-podcast-inner">

        {/* Gauche : éditorial */}
        <div className="sty-podcast-content">
          <span className="sty-podcast-eyebrow">{t('Écouter')}</span>
          <h2>
            {t('Des conversations')}<br />
            {t('qui donnent du sens')}<br />
            {t('aux styles de danse.')}
          </h2>
          <p>
            {t('Celles et ceux qui font, pensent et transforment la danse partagent leur parcours, leur vision et leur rapport à leur style.')}
          </p>
          <Link href="/ecouter" className="sty-podcast-btn">
            {t('Découvrir tous les épisodes →')}
          </Link>
        </div>

        {/* Droite : dernier épisode en glassmorphism */}
        {episode && (
          <div
            className="sty-podcast-episode"
            aria-label={`${t('Dernier épisode')} : ${episode.guest}`}
          >
            <span className="sty-podcast-ep-badge">{t('Dernier épisode')}</span>
            <div className="sty-podcast-ep-img">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={episode.image} alt={episode.guest} />
            </div>
            <div className="sty-podcast-ep-body">
              <span className="sty-podcast-ep-meta">
                #{episode.number}&thinsp;·&thinsp;{episode.guest}
              </span>
              <p className="sty-podcast-ep-title">{episode.title}</p>
            </div>
            <Link href={`/episodes/${episode.slug}`} className="sty-podcast-ep-play">
              <span className="sty-podcast-ep-play-icon" aria-hidden="true">
                <svg width="10" height="12" viewBox="0 0 10 12" fill="currentColor">
                  <path d="M0 1.5v9l9-4.5L0 1.5z" />
                </svg>
              </span>
              {t("Écouter l'épisode")}
            </Link>
          </div>
        )}

      </div>
    </div>
  )
}
