'use client'

import Link from 'next/link'
import { useRef, useState } from 'react'
import EpisodeImage from '@/components/EpisodeImage'

export type MetierPodcastEpisode = { number: number; slug: string; title: string; guest: string; image: string; profession: string }

export default function MetiersPodcastShowcase({ episodes }: { episodes: MetierPodcastEpisode[] }) {
  const railRef = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)
  const updateProgress = () => {
    const rail = railRef.current
    if (!rail) return
    const max = rail.scrollWidth - rail.clientWidth
    setProgress(max > 0 ? rail.scrollLeft / max : 0)
  }
  const move = (direction: -1 | 1) => {
    const rail = railRef.current
    if (!rail) return
    const card = rail.querySelector<HTMLElement>('.met-podcast-card')
    rail.scrollBy({ left: direction * ((card?.offsetWidth ?? 300) + 16), behavior: 'smooth' })
  }
  if (!episodes.length) return null

  return <section className="met-podcast-showcase" aria-labelledby="met-podcast-title">
    <div className="met-podcast-showcase-inner">
      <div className="met-podcast-intro" data-reveal>
        <span className="met-podcast-kicker">Podcast Dance Lab</span>
        <h2 id="met-podcast-title">Les métiers racontés par celles et ceux qui les font.</h2>
        <p>Danseur.ses, chorégraphes, agent.es, professeur.es, directeur.rices de casting, régisseur.ses… Découvrez les métiers du secteur à travers leurs parcours.</p>
        <Link href="/ecouter?theme=metiers" className="met-podcast-main-cta">Écouter les épisodes liés aux métiers <span aria-hidden="true">→</span></Link>
      </div>
      <div className="met-podcast-discover" data-reveal="delay-2">
        <div className="met-podcast-discover-head"><span>Épisodes à découvrir</span><div className="met-podcast-arrows" aria-label="Navigation du carrousel"><button type="button" onClick={() => move(-1)} aria-label="Épisodes précédents">←</button><button type="button" onClick={() => move(1)} aria-label="Épisodes suivants">→</button></div></div>
        <div ref={railRef} className="met-podcast-rail" onScroll={updateProgress}>
          {episodes.map((episode) => <Link key={episode.number} href={`/episodes/${episode.slug}`} className="met-podcast-card">
            <EpisodeImage episodeNumber={episode.number} src={episode.image} alt={`Épisode ${episode.number} avec ${episode.guest}`} loading="lazy" />
            <span className="met-podcast-card-shade" aria-hidden="true" />
            <span className="met-podcast-card-content"><span className="met-podcast-profession">{episode.profession}</span><span className="met-podcast-number">Épisode {episode.number}</span><strong>{episode.title}</strong><span className="met-podcast-guest">{episode.guest}</span></span>
            <span className="met-podcast-play" aria-hidden="true">▶</span>
          </Link>)}
        </div>
        <div className="met-podcast-progress" aria-hidden="true"><span style={{ transform: `scaleX(${Math.max(.12, progress)})` }} /></div>
      </div>
    </div>
  </section>
}
