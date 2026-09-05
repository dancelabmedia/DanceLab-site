'use client'

/**
 * StylesScrollGallery — galerie horizontale scroll-driven (Part D)
 *
 * Sur desktop : le scroll vertical entraîne un défilement horizontal
 * des cartes de styles (inspiration Apple iPhone product pages).
 * La hauteur de la section = 100vh + la largeur totale de la piste,
 * de sorte que 100 % du scroll vertical = 100 % du déplacement horizontal.
 *
 * Sur mobile (< 768 px) : défilement horizontal natif (overflow-x scroll).
 */

import Link from 'next/link'
import { useEffect, useRef } from 'react'
import type { DanceStyleFamily } from './styles-data'

type GalleryStyle = {
  slug: string
  name: string
  family: DanceStyleFamily
  summary?: string
  image?: string
  era?: string
  originCity?: string
  available?: boolean
}

const FAMILY_GRADIENTS: Record<string, string> = {
  'Danses urbaines':
    'linear-gradient(145deg, #050505 0%, #233033 45%, #425659 100%)',
  'Danses académiques':
    'linear-gradient(145deg, #233033 0%, #425659 50%, #5B7377 100%)',
  'Danses contemporaines et expérimentales':
    'linear-gradient(145deg, #425659 0%, #5B7377 50%, #233033 100%)',
  'Danses scéniques':
    'linear-gradient(145deg, #050505 0%, #233033 55%, #5B7377 100%)',
  'Danses sociales':
    'linear-gradient(145deg, #233033 0%, #5B7377 48%, #425659 100%)',
  'Danses traditionnelles':
    'linear-gradient(145deg, #425659 0%, #233033 55%, #050505 100%)',
  'Danses de club':
    'linear-gradient(145deg, #050505 0%, #425659 52%, #233033 100%)',
  'Danses issues des cultures afro-descendantes':
    'linear-gradient(145deg, #233033 0%, #425659 50%, #050505 100%)',
}

interface Props {
  styles: GalleryStyle[]
}

export default function StylesScrollGallery({ styles }: Props) {
  const sectionRef  = useRef<HTMLDivElement>(null)
  const trackRef    = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const isDesktop   = useRef(false)

  useEffect(() => {
    const section  = sectionRef.current
    const track    = trackRef.current
    if (!section || !track) return

    const prefersReduced =
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    /* ── Calcule la hauteur de la section selon la largeur de la piste ── */
    const setup = () => {
      isDesktop.current = window.innerWidth >= 768
      if (!isDesktop.current) {
        section.style.height = ''
        track.style.transform = ''
        return
      }
      // scrollWidth inclut le padding-right du track
      const maxTranslate = Math.max(0, track.scrollWidth - window.innerWidth)
      section.style.height = `calc(100vh + ${maxTranslate}px)`
    }

    /* ── Scroll : déplace la piste horizontalement ───────────────────── */
    const onScroll = () => {
      if (!isDesktop.current) return
      const rect      = section.getBoundingClientRect()
      const scrollable = section.offsetHeight - window.innerHeight
      const progress  = Math.max(0, Math.min(1, -rect.top / scrollable))
      const maxX      = Math.max(0, track.scrollWidth - window.innerWidth)

      if (!prefersReduced) {
        track.style.transform = `translateX(-${progress * maxX}px)`
      }
      if (progressRef.current) {
        progressRef.current.style.width = `${progress * 100}%`
      }
    }

    setup()
    onScroll()
    window.addEventListener('resize', setup)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('resize', setup)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  return (
    <div ref={sectionRef} className="ssg-section">
      <div className="ssg-sticky">

        {/* En-tête */}
        <div className="ssg-intro">
          <span className="ssg-intro-label">Explorer · Styles de danse</span>
          <h2 className="ssg-intro-title">Tous les styles</h2>
        </div>

        {/* Piste de cartes */}
        <div className="ssg-viewport">
          <div className="ssg-track" ref={trackRef}>
            {styles.map((style, i) => {
              const isAvailable = style.available !== false

              const inner = (
                <>
                  {style.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={style.image}
                      alt={style.name}
                      className="ssg-card-bg"
                      draggable={false}
                    />
                  ) : (
                    <div
                      className="ssg-card-bg"
                      style={{
                        background:
                          FAMILY_GRADIENTS[style.family] ??
                          FAMILY_GRADIENTS['Danses urbaines'],
                      }}
                    />
                  )}
                  <div className="ssg-card-shade" />
                  <div className="ssg-card-content">
                    <span className="ssg-card-num">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <span className="ssg-card-family">{style.family}</span>
                      <h3 className="ssg-card-name">{style.name}</h3>
                      {(style.era || style.originCity) && (
                        <p className="ssg-card-era">
                          {[style.era, style.originCity]
                            .filter(Boolean)
                            .join(' · ')}
                        </p>
                      )}
                      {style.summary && (
                        <p className="ssg-card-summary">
                          {style.summary.slice(0, 130)}…
                        </p>
                      )}
                    </div>
                    {isAvailable ? (
                      <div className="ssg-card-cta">
                        Découvrir
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </div>
                    ) : (
                      <span className="ssg-card-coming">À venir</span>
                    )}
                  </div>
                </>
              )

              return isAvailable ? (
                <Link
                  key={style.slug}
                  href={`/explorer/styles-de-danse/${style.slug}`}
                  className="ssg-card"
                >
                  {inner}
                </Link>
              ) : (
                <div
                  key={style.slug}
                  className="ssg-card ssg-card--upcoming"
                  aria-label={`${style.name} — contenu à venir`}
                >
                  {inner}
                </div>
              )
            })}
          </div>
        </div>

        {/* Barre de progression */}
        <div className="ssg-progress-wrap" aria-hidden="true">
          <div className="ssg-progress-fill" ref={progressRef} />
        </div>

        <button
          className="ssg-hint ssg-hint--btn"
          onClick={() => {
            document.querySelector('.sty-magazine')?.scrollIntoView({ behavior: 'smooth' })
          }}
          aria-label="Passer la galerie et continuer vers la suite"
        >
          Continuer ↓
        </button>
      </div>
    </div>
  )
}
