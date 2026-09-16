'use client'

import { useState } from 'react'

type Props = {
  label?: string
} & (
  | { videoId: string; instagramReel?: never }
  | {
      videoId?: never
      instagramReel: {
        url: string
        thumbnailSrc: string
        thumbnailWidth: number
        thumbnailHeight: number
      }
    }
)

export default function AboutVideoCard({ videoId, instagramReel, label }: Props) {
  const [active, setActive] = useState(false)

  const thumb      = instagramReel?.thumbnailSrc ?? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
  const embedSrc   = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`
  const watchUrl   = `https://www.youtube.com/watch?v=${videoId}`

  // Le Reel conserve son ratio natif, sans recadrage, y compris au survol.
  const thumbnail = (
    <>
      <img
        src={thumb}
        alt=""
        loading="lazy"
        className="about-vc-img"
        width={instagramReel?.thumbnailWidth}
        height={instagramReel?.thumbnailHeight}
        style={instagramReel ? {
          objectFit: 'contain',
          objectPosition: 'center',
          transform: 'none',
        } : undefined}
      />
      <div className="about-vc-veil" aria-hidden="true" />
      <div className="about-vc-play" aria-hidden="true">
        <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="18" cy="18" r="18" fill="rgba(255,255,255,0.92)" />
          <path d="M15 12.5l10 5.5-10 5.5V12.5z" fill="#233033" />
        </svg>
      </div>
      <span className="about-vc-badge" aria-hidden="true">
        {instagramReel ? 'Reel Instagram' : 'Interview'}
      </span>
    </>
  )

  return (
    <div
      className={`about-vc${active ? ' about-vc--active' : ''}`}
      style={instagramReel ? {
        width: '100%',
        maxWidth: instagramReel.thumbnailWidth,
        alignSelf: 'start',
      } : undefined}
    >

      {/* ── Vidéo intégrée (après clic) ──────────────────────────── */}
      {active && (
        <div className="about-vc-embed">
          <iframe
            src={embedSrc}
            title={label ?? 'Interview vidéo'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      )}

      {/* ── Miniature + bouton lecture (état par défaut) ─────────── */}
      {!active && (instagramReel ? (
        <a
          className="about-vc-thumb"
          style={{ aspectRatio: `${instagramReel.thumbnailWidth} / ${instagramReel.thumbnailHeight}` }}
          href={instagramReel.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Voir le Reel sur Instagram${label ? ` : ${label}` : ''} (nouvel onglet)`}
        >
          {thumbnail}
        </a>
      ) : (
        <button
          className="about-vc-thumb"
          onClick={() => setActive(true)}
          aria-label={`Lancer la vidéo${label ? ` : ${label}` : ''}`}
        >
          {thumbnail}

          {/* Lien alternatif (accessibilité / no-JS) */}
          <a
            href={watchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="about-vc-fallback"
            tabIndex={-1}
            aria-hidden="true"
          />
        </button>
      ))}

      {/* ── Label sous la carte ───────────────────────────────────── */}
      {label && (
        <p className="about-vc-label">{label}</p>
      )}

    </div>
  )
}
