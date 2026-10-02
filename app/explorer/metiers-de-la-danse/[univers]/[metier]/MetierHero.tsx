'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'

interface Props {
  images:     string[]
  isPortrait: boolean
}

export default function MetierHero({ images, isPortrait }: Props) {
  const [current, setCurrent] = useState(0)
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    if (images.length <= 1 || reduced) return
    const id = setInterval(() => setCurrent(c => (c + 1) % images.length), 6000)
    return () => clearInterval(id)
  }, [images.length, reduced])

  if (!images.length) return null

  const imgClass = `met-editorial-hero-image${isPortrait ? ' met-editorial-hero-image--portrait' : ''}`

  if (images.length === 1 || reduced) {
    return (
      <Image
        src={images[0]}
        alt=""
        fill
        priority
        sizes="100vw"
        className={imgClass}
      />
    )
  }

  return (
    <>
      {images.map((src, i) => (
        <div
          key={src}
          className="met-hero-slide"
          style={{ opacity: i === current ? 1 : 0 }}
          aria-hidden={i !== current ? true : undefined}
        >
          <Image
            src={src}
            alt=""
            fill
            priority={i === 0}
            sizes="100vw"
            className={imgClass}
          />
        </div>
      ))}
    </>
  )
}
