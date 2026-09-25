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

type Props = { images: PodcastBannerImage[] }

function shuffledIndexes(length: number): number[] {
  const indexes = Array.from({ length }, (_, index) => index)
  for (let index = indexes.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1))
    ;[indexes[index], indexes[swap]] = [indexes[swap], indexes[index]]
  }
  return indexes
}

export default function StylesPodcastBanner({ images }: Props) {
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
  }, [images.length]) // La rotation est recréée lorsque le catalogue change.

  const currentIndex = order[position] ?? 0
  const current = images[currentIndex]
  const previousImage = previous === null ? null : images[previous]

  return (
    <div className="sty-podcast">
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
      <div className="sty-podcast-content">
        <div className="sty-podcast-icon" aria-hidden="true">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="23" stroke="rgba(255,255,255,.18)" strokeWidth="1.5"/>
            <circle cx="24" cy="24" r="15" stroke="rgba(255,255,255,.08)" strokeWidth="1"/>
            <path d="M19 16.5v15l13-7.5-13-7.5z" fill="rgba(255,255,255,.90)"/>
          </svg>
        </div>
        <h2>{t('Écoutez les histoires derrière chaque style')}</h2>
        <p>{t('Immersion, témoignages et coulisses avec les artistes qui font vivre ces cultures.')}</p>
        <Link href="/ecouter" className="sty-podcast-btn">{t('Découvrir les épisodes →')}</Link>
      </div>
    </div>
  )
}
