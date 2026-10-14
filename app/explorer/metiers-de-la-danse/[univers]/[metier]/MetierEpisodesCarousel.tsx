'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRef, useState } from 'react'
import type { UnifiedEpisode } from '@/lib/episodes'

interface Props {
  episodes: UnifiedEpisode[]
}

export default function MetierEpisodesCarousel({ episodes }: Props) {
  const railRef = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)

  const updateProgress = () => {
    const rail = railRef.current
    if (!rail) return
    const max = rail.scrollWidth - rail.clientWidth
    setProgress(max > 0 ? rail.scrollLeft / max : 0)
  }

  const move = (dir: -1 | 1) => {
    const rail = railRef.current
    if (!rail) return
    const card = rail.querySelector<HTMLElement>('.met-ep-card')
    rail.scrollBy({ left: dir * ((card?.offsetWidth ?? 300) + 16), behavior: 'smooth' })
  }

  if (!episodes.length) return null

  const showNav = episodes.length > 1

  return (
    <section className="met-ep-section" aria-labelledby="met-ep-title">
      <div className="met-editorial-shell">
        <div className="met-ep-head">
          <div>
            <span className="met-ep-kicker">Podcast Dance Lab</span>
            <h2 id="met-ep-title">
              {episodes.length === 1
                ? 'Un épisode associé'
                : `${episodes.length} épisodes associés`}
            </h2>
          </div>
          {showNav && (
            <div className="met-ep-arrows" aria-label="Navigation du carrousel d'épisodes">
              <button type="button" onClick={() => move(-1)} aria-label="Épisodes précédents">←</button>
              <button type="button" onClick={() => move(1)} aria-label="Épisodes suivants">→</button>
            </div>
          )}
        </div>

        <div ref={railRef} className="met-ep-rail" onScroll={updateProgress}>
          {episodes.map((ep) => (
            <Link key={ep.number} href={`/episodes/${ep.slug}`} className="met-ep-card">
              <Image
                src={ep.image}
                alt={`Épisode ${ep.number} avec ${ep.guest}`}
                fill
                sizes="(max-width: 768px) 72vw, 335px"
                className="met-ep-card-img"
              />
              <span className="met-ep-card-shade" aria-hidden="true" />
              <span className="met-ep-card-content">
                <span className="met-ep-card-num">Épisode {ep.number}</span>
                <strong className="met-ep-card-title">{ep.title}</strong>
                <span className="met-ep-card-guest">{ep.guest}</span>
                {ep.role && <small className="met-ep-card-role">{ep.role}</small>}
              </span>
              <span className="met-ep-card-play" aria-hidden="true">▶</span>
            </Link>
          ))}
        </div>

        {showNav && (
          <div className="met-ep-progress" aria-hidden="true">
            <span style={{ transform: `scaleX(${Math.max(0.1, progress)})` }} />
          </div>
        )}
      </div>
    </section>
  )
}
