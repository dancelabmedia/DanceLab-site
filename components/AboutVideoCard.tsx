'use client'

import { useState } from 'react'

type Props = {
  videoId: string
  label?: string
}

export default function AboutVideoCard({ videoId, label }: Props) {
  const [active, setActive] = useState(false)

  const thumb      = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
  const embedSrc   = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`
  const watchUrl   = `https://www.youtube.com/watch?v=${videoId}`

  return (
    <div className={`about-vc${active ? ' about-vc--active' : ''}`}>

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
      {!active && (
        <button
          className="about-vc-thumb"
          onClick={() => setActive(true)}
          aria-label={`Lancer la vidéo${label ? ` : ${label}` : ''}`}
        >
          {/* Miniature YouTube */}
          <img
            src={thumb}
            alt=""
            loading="lazy"
            className="about-vc-img"
          />

          {/* Voile sombre au survol */}
          <div className="about-vc-veil" aria-hidden="true" />

          {/* Bouton lecture */}
          <div className="about-vc-play" aria-hidden="true">
            <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="18" cy="18" r="18" fill="rgba(255,255,255,0.92)" />
              <path d="M15 12.5l10 5.5-10 5.5V12.5z" fill="#233033" />
            </svg>
          </div>

          {/* Badge "Interview" en haut à gauche */}
          <span className="about-vc-badge" aria-hidden="true">Interview</span>

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
      )}

      {/* ── Label sous la carte ───────────────────────────────────── */}
      {label && (
        <p className="about-vc-label">{label}</p>
      )}

    </div>
  )
}
