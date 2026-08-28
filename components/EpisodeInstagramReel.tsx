'use client'

import { useEffect, useRef, useState } from 'react'

type Props = {
  instagramReelUrl: string
}

/**
 * Bloc Reel Instagram — conçu pour s'intégrer dans la sidebar de la page épisode,
 * juste sous l'encart « Partager ».
 *
 * Usage (dans ep-sidebar-section) :
 *   <EpisodeInstagramReel instagramReelUrl="https://www.instagram.com/reel/XXXXX/" />
 *
 * Le composant n'a pas de section / padding propres — c'est le parent (ep-sidebar-section)
 * qui gère l'espacement et la bordure.
 *
 * Fallback : si embed.js ne peut pas charger (réseau, bloqueur de pub, etc.),
 * un bouton CTA propre remplace le Reel sans jamais casser la page.
 */
export default function EpisodeInstagramReel({ instagramReelUrl }: Props) {
  const [embedFailed, setEmbedFailed] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const blockquoteRef = useRef<HTMLQuoteElement | null>(null)

  useEffect(() => {
    const win = window as Window & {
      instgrm?: { Embeds: { process: () => void } }
    }

    const processEmbed = () => {
      if (win.instgrm) win.instgrm.Embeds.process()

      // Timeout de sécurité : si après 7 s la blockquote est encore dans le DOM
      // (non remplacée par une iframe), l'embed a échoué → fallback
      timeoutRef.current = setTimeout(() => {
        if (blockquoteRef.current && document.contains(blockquoteRef.current)) {
          setEmbedFailed(true)
        }
      }, 7000)
    }

    // Script déjà en mémoire → on re-traite directement
    if (win.instgrm) {
      processEmbed()
      return
    }

    // Script déjà dans le DOM (autre instance chargée avant) → on attend qu'il soit prêt
    const existing = document.querySelector('script[src*="instagram.com/embed.js"]')
    if (existing) {
      processEmbed()
      return
    }

    // Injection du script officiel Instagram
    const script = document.createElement('script')
    script.src = 'https://www.instagram.com/embed.js'
    script.async = true
    script.onload = processEmbed
    script.onerror = () => setEmbedFailed(true)
    document.body.appendChild(script)

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [instagramReelUrl])

  // URL de permalink officielle pour l'attribut data-instgrm-permalink
  const permalink =
    instagramReelUrl.replace(/\/$/, '') +
    '/?utm_source=ig_embed&utm_campaign=loading'

  // Flèche réutilisée dans les deux états
  const Arrow = () => (
    <svg
      className="ep-reel-cta-arrow"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="12"
      height="12"
      aria-hidden="true"
    >
      <path d="M3 8h10M9 4l4 4-4 4" />
    </svg>
  )

  // ── Fallback : embed impossible à charger ─────────────────────────────────
  if (embedFailed) {
    return (
      <div className="ep-reel ep-reel--fallback">
        <p className="ep-reel-kicker">Un extrait de la conversation</p>
        <a
          href={instagramReelUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="ep-reel-cta"
        >
          Voir l&apos;extrait sur Instagram
          <Arrow />
        </a>
      </div>
    )
  }

  // ── Rendu normal : embed officiel ─────────────────────────────────────────
  return (
    <div className="ep-reel">
      <p className="ep-reel-kicker">Un extrait de la conversation</p>

      {/* Embed pleine largeur — s'adapte à la sidebar */}
      <div className="ep-reel-embed-wrap">
        {/*
          Blockquote transformé par embed.js en iframe.
          Pas de maxWidth imposé : on laisse le conteneur parent décider.
          Les styles inline minimaux évitent le flash non stylisé.
        */}
        <blockquote
          ref={blockquoteRef}
          className="instagram-media"
          data-instgrm-permalink={permalink}
          data-instgrm-version="14"
          style={{
            background: '#FFF',
            border: '0',
            borderRadius: '3px',
            boxShadow: '0 0 1px 0 rgba(0,0,0,.5), 0 1px 10px 0 rgba(0,0,0,.15)',
            margin: '0',
            maxWidth: '100%',
            minWidth: '0',
            padding: '0',
            width: '100%',
          }}
        />
      </div>

      <a
        href={instagramReelUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="ep-reel-cta"
      >
        Voir le Reel sur Instagram
        <Arrow />
      </a>
    </div>
  )
}
