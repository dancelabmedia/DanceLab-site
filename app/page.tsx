'use client'

import React, { useState, useEffect, useRef } from 'react'
import { featuredAgendaEvents, formatAgendaDateRange } from "./agenda/agenda-data"
import type { AgendaEvent } from "./agenda/agenda-data"
import { magazineArticles } from "./decouvrir/articles-data"
import { episodes } from "../data/episodes"
import Link from "next/link"

/* =====================================================
   SVG ICONS (réutilisables)
===================================================== */
const IconPlay = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
)
const IconArrow = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
)
const IconMenu = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
)
const IconPin = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
)
const IconClock = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)

const PremiumSectionIcon = ({ name }: { name: string }) => {
  const commonProps = {
    width: 28,
    height: 28,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  }

  const icons: Record<string, React.ReactElement> = {
    movement: (
      <svg {...commonProps}>
        <path d="M4 18c4-7 8-11 16-12" />
        <path d="M7 18c4-3 7-4 12-4" />
        <circle cx="7" cy="7" r="2" />
      </svg>
    ),
    signature: (
      <svg {...commonProps}>
        <path d="M4 20c4-1 7-4 9-9l2-5 3 3-5 2c-5 2-8 5-9 9Z" />
        <path d="M14 6l4 4" />
      </svg>
    ),
    stage: (
      <svg {...commonProps}>
        <path d="M4 6h16" />
        <path d="M6 6v12" />
        <path d="M18 6v12" />
        <path d="M8 18h8" />
        <path d="M9 10h6" />
      </svg>
    ),
    portrait: (
      <svg {...commonProps}>
        <circle cx="12" cy="8" r="3" />
        <path d="M5 20c1.5-4 4-6 7-6s5.5 2 7 6" />
      </svg>
    ),
    career: (
      <svg {...commonProps}>
        <path d="M6 9V6h12v3" />
        <path d="M4 9h16v10H4z" />
        <path d="M9 13h6" />
      </svg>
    ),
    document: (
      <svg {...commonProps}>
        <path d="M7 3h7l3 3v15H7z" />
        <path d="M14 3v4h4" />
        <path d="M9 12h6" />
        <path d="M9 16h4" />
      </svg>
    ),
    status: (
      <svg {...commonProps}>
        <path d="M5 5h14v14H5z" />
        <path d="M8 9h8" />
        <path d="M8 13h6" />
        <path d="M8 17h4" />
      </svg>
    ),
    target: (
      <svg {...commonProps}>
        <circle cx="12" cy="12" r="8" />
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v3" />
        <path d="M22 12h-3" />
      </svg>
    ),
    network: (
      <svg {...commonProps}>
        <circle cx="7" cy="7" r="2" />
        <circle cx="17" cy="7" r="2" />
        <circle cx="12" cy="17" r="2" />
        <path d="M9 8l6 0" />
        <path d="M8 9l3 6" />
        <path d="M16 9l-3 6" />
      </svg>
    ),
    idea: (
      <svg {...commonProps}>
        <path d="M9 18h6" />
        <path d="M10 22h4" />
        <path d="M8 14c-1.5-1.2-2-2.8-2-4a6 6 0 0 1 12 0c0 1.2-.5 2.8-2 4-.8.7-1 1.4-1 2H9c0-.6-.2-1.3-1-2Z" />
      </svg>
    ),
    calendar: (
      <svg {...commonProps}>
        <path d="M7 3v4" />
        <path d="M17 3v4" />
        <path d="M4 8h16" />
        <path d="M5 5h14v16H5z" />
        <path d="M8 12h3" />
        <path d="M13 12h3" />
        <path d="M8 16h3" />
      </svg>
    ),
  }

  return icons[name] || icons.document
}

const GUEST_CARD_COUNT = 5
const GUEST_CARD_DELAYS = ['', 'd1', 'd2', 'd3', 'd3'] as const
const GUEST_SELECTION_STORAGE_KEY = 'dance-lab-home-guest-selection'

const GUEST_POOL = episodes.filter((episode, index, allEpisodes) => {
  if (!episode.slug || !episode.guest || !episode.image || !episode.quote) {
    return false
  }

  const normalizedGuest = episode.guest.trim().toLocaleLowerCase('fr')

  return allEpisodes.findIndex(
    (candidate) =>
      candidate.guest.trim().toLocaleLowerCase('fr') === normalizedGuest
  ) === index
})

const INITIAL_GUEST_SELECTION = GUEST_POOL.slice(0, GUEST_CARD_COUNT)

function shuffleGuests<T>(items: T[]): T[] {
  const shuffled = [...items]

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    ;[shuffled[index], shuffled[randomIndex]] = [
      shuffled[randomIndex],
      shuffled[index],
    ]
  }

  return shuffled
}

function createGuestSelection(previousSlugs: string[]) {
  const previousSelection = new Set(previousSlugs)
  const freshCandidates = shuffleGuests(
    GUEST_POOL.filter((episode) => !previousSelection.has(episode.slug))
  )
  const freshSlugs = new Set(freshCandidates.map((episode) => episode.slug))
  const remainingCandidates = shuffleGuests(
    GUEST_POOL.filter((episode) => !freshSlugs.has(episode.slug))
  )

  return [...freshCandidates, ...remainingCandidates].slice(
    0,
    GUEST_CARD_COUNT
  )
}

function getHomeGuestImage(episode: (typeof episodes)[number]) {
  const episodeImageName = episode.image
    .split('/')
    .pop()
    ?.replace(/\.png\.png$/i, '.png')
  const sourceImageName = episode.sourceImage
    .split('/')
    .pop()
    ?.replace(/\.png\.png$/i, '.png')
  const optimizedImageName =
    episodeImageName && episodeImageName !== 'logo.png'
      ? episodeImageName
      : sourceImageName

  return optimizedImageName
    ? `/images/les-invites/${optimizedImageName}`
    : episode.image
}

const TEXT_ARTICLES = [
  { tag: 'Guide', title: 'Comment assister à un battle de danse pour la première fois ?', meta: 'Guide complet du débutant · 5 min de lecture', delay: 'd1' },
  { tag: 'Portrait', title: "Les chorégraphes qui façonnent la danse contemporaine aujourd'hui", meta: 'Panorama 2026 · 7 min de lecture', delay: 'd2' },
]

const EXPLORE_ITEMS = [
  { icon: 'movement', label: 'Styles de danse', sub: 'Hip-hop, contemporain, classique, afro, waacking et plus encore', href: '/explorer/styles-de-danse', delay: '' },
  { icon: 'signature', label: 'Chorégraphes', sub: "Les créateurs qui façonnent l'art chorégraphique d'aujourd'hui", href: '/explorer/choregraphes', delay: 'd1' },
  { icon: 'stage', label: 'Compagnies', sub: 'De la Comédie-Française au collectif underground', href: '/explorer/compagnies', delay: 'd2' },
  { icon: 'portrait', label: 'Artistes', sub: 'Portraits, parcours et coulisses de ceux qui font la danse', href: '/explorer/artistes', delay: 'd3' },
  { icon: 'career', label: 'Métiers', sub: 'Danseur, chorégraphe, répétiteur, régisseur, critique…', href: '/explorer/metiers-de-la-danse', delay: 'd4' },
]

const RESOURCES = [
  { icon: 'document', title: 'Contrats & juridique', desc: "Modèles de contrats, droits d'auteur, fiches pratiques pour comprendre vos obligations et protéger votre travail.", delay: '' },
  { icon: 'status', title: 'Intermittence', desc: "Comprendre le régime, calculer ses heures, gérer l'administratif - un guide complet pour naviguer dans le système.", delay: 'd1' },
  { icon: 'target', title: 'Auditions & casting', desc: "Préparer son book, rédiger un CV de danseur, réussir ses auditions - nos conseils et checklists pratiques.", delay: 'd2' },
  { icon: 'network', title: 'Communication & réseaux', desc: "Construire sa marque personnelle, maîtriser Instagram, créer un site - outils et stratégies pour exister en ligne.", delay: '' },
  { icon: 'idea', title: 'Entrepreneuriat artistique', desc: "Monter sa structure, trouver des financements, gérer la comptabilité - ressources pour les artistes entrepreneurs.", delay: 'd1' },
  { icon: 'calendar', title: 'Organisation de carrière', desc: "Planifier sa saison, gérer ses projets, se fixer des objectifs - des outils pour prendre en main son parcours.", delay: 'd2' },
]

const TICKER_ITEMS = ['Podcast', 'Articles', 'Agenda culturel', "Portraits d\'artistes", 'Ressources pro', 'Styles de danse', 'Festivals', 'Interviews', 'Compagnies', 'Spectacles']
const HOME_AGENDA_LIMIT = 3

function getAgendaHomeDateParts(event: AgendaEvent) {
  const formattedDate = formatAgendaDateRange(event)

  if (formattedDate === 'À compléter') {
    return {
      day: 'À compléter',
      detail: '',
    }
  }

  const [start, end] = formattedDate.split(' au ')

  return {
    day: start,
    detail: end ? `au ${end}` : '',
  }
}

/* =====================================================
   COMPOSANT PRINCIPAL
===================================================== */
export default function DanceLabPage() {
  const [scrolled, setScrolled]       = useState(false)
  const [progress, setProgress]       = useState(33)
  const [newsletterStatus, setNewsletterStatus] = useState<
    'idle' | 'loading' | 'success' | 'invalid' | 'error'
  >('idle')
  const [homeAgendaEvents, setHomeAgendaEvents] = useState<AgendaEvent[]>(featuredAgendaEvents)
  const [guestSelection, setGuestSelection] = useState(
    INITIAL_GUEST_SELECTION
  )
  const guestTrackRef = useRef<HTMLDivElement | null>(null)
  const newsletterInputRef = useRef<HTMLInputElement | null>(null)
  const newsletterSubmittedRef = useRef(false)
  const newsletterTimeoutRef = useRef<number | null>(null)
  const guestDrag = useRef({
    active: false,
    moved: false,
    startX: 0,
    scrollLeft: 0,
  })

  useEffect(() => {
    let previousSlugs: string[] = []

    try {
      const storedSelection = window.sessionStorage.getItem(
        GUEST_SELECTION_STORAGE_KEY
      )
      const parsedSelection = storedSelection
        ? JSON.parse(storedSelection)
        : []

      if (Array.isArray(parsedSelection)) {
        previousSlugs = parsedSelection.filter(
          (slug: unknown): slug is string => typeof slug === 'string'
        )
      }
    } catch {
      previousSlugs = []
    }

    const nextSelection = createGuestSelection(previousSlugs)
    setGuestSelection(nextSelection)

    try {
      window.sessionStorage.setItem(
        GUEST_SELECTION_STORAGE_KEY,
        JSON.stringify(nextSelection.map((episode) => episode.slug))
      )
    } catch {}
  }, [])

  /* Scroll → header opacity */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* Fade-up animation via IntersectionObserver */
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('vis')
          } else {
            e.target.classList.remove('vis')
          }
        })
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    )
    document.querySelectorAll('.fu').forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [guestSelection])

  useEffect(() => {
    return () => {
      if (newsletterTimeoutRef.current) window.clearTimeout(newsletterTimeoutRef.current)
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function loadHomeAgenda() {
      try {
        const response = await fetch('/api/agenda', { cache: 'no-store' })
        if (!response.ok) return

        const data = await response.json()
        if (cancelled || !Array.isArray(data.events)) return

        setHomeAgendaEvents(
          data.events.length > 0
            ? data.events.slice(0, HOME_AGENDA_LIMIT)
            : featuredAgendaEvents
        )
      } catch {
        setHomeAgendaEvents(featuredAgendaEvents)
      }
    }

    loadHomeAgenda()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function loadHomeAgenda() {
      try {
        const response = await fetch('/api/agenda', { cache: 'no-store' })
        if (!response.ok) return

        const data = await response.json()
        if (cancelled || !Array.isArray(data.events)) return

        setHomeAgendaEvents(
          data.events.length > 0
            ? data.events.slice(0, HOME_AGENDA_LIMIT)
            : featuredAgendaEvents
        )
      } catch {
        setHomeAgendaEvents(featuredAgendaEvents)
      }
    }

    loadHomeAgenda()

    return () => {
      cancelled = true
    }
  }, [])

  const startGuestDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    const track = guestTrackRef.current
    if (!track) return

    guestDrag.current = {
      active: true,
      moved: false,
      startX: e.clientX,
      scrollLeft: track.scrollLeft,
    }
    track.classList.add('is-dragging')
    track.setPointerCapture(e.pointerId)
  }

  const moveGuestDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    const track = guestTrackRef.current
    if (!track || !guestDrag.current.active) return

    const distance = e.clientX - guestDrag.current.startX
    if (Math.abs(distance) > 6) guestDrag.current.moved = true
    track.scrollLeft = guestDrag.current.scrollLeft - distance
  }

  const endGuestDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    const track = guestTrackRef.current
    if (!track) return

    guestDrag.current.active = false
    track.classList.remove('is-dragging')
    if (track.hasPointerCapture(e.pointerId)) {
      track.releasePointerCapture(e.pointerId)
    }
  }

  const stopGuestClickAfterDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!guestDrag.current.moved) return

    e.preventDefault()
    e.stopPropagation()
    guestDrag.current.moved = false
  }

  const moveHeroArt = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2

    e.currentTarget.style.setProperty('--hero-parallax-x', x.toFixed(3))
    e.currentTarget.style.setProperty('--hero-parallax-y', y.toFixed(3))
  }

  const resetHeroArt = (e: React.MouseEvent<HTMLElement>) => {
    e.currentTarget.style.setProperty('--hero-parallax-x', '0')
    e.currentTarget.style.setProperty('--hero-parallax-y', '0')
  }

  const seekProgress = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    setProgress(((e.clientX - r.left) / r.width) * 100)
  }

  const handleNewsletter = (e: React.FormEvent<HTMLFormElement>) => {
    const form = e.currentTarget
    const input = newsletterInputRef.current
    const email = input?.value.trim() ?? ''

    if (!input?.checkValidity() || !email) {
      e.preventDefault()
      setNewsletterStatus('invalid')
      return
    }

    setNewsletterStatus('loading')
    newsletterSubmittedRef.current = true

    if (newsletterTimeoutRef.current) window.clearTimeout(newsletterTimeoutRef.current)
    newsletterTimeoutRef.current = window.setTimeout(() => {
      if (!newsletterSubmittedRef.current) return
      newsletterSubmittedRef.current = false
      setNewsletterStatus('error')
    }, 12000)
  }

  const handleNewsletterFrameLoad = () => {
    if (!newsletterSubmittedRef.current) return

    newsletterSubmittedRef.current = false
    if (newsletterTimeoutRef.current) window.clearTimeout(newsletterTimeoutRef.current)
    if (newsletterInputRef.current) newsletterInputRef.current.value = ''
    setNewsletterStatus('success')
  }

  /* ── Rendu ────────────────────────────────────────── */
  const latestEpisode = episodes[0]
  const agendaPreviewEvents = homeAgendaEvents.length > 0 ? homeAgendaEvents : featuredAgendaEvents

  return (
      <main>
      {/* ========================================
          HERO
      ======================================== */}
      <section
        className="hero"
        id="hero"
        onMouseMove={moveHeroArt}
        onMouseLeave={resetHeroArt}
      >
        <div className="hero-line" />
        <div className="hero-bg" />
        <div className="hero-overlay" />
        <div className="hero-stage">
        <div className="hero-signature">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="hero-signature-photo"
            src="/episodes/dancelab.png"
            alt="Dance Lab, le média de la danse, par Maïwenn Bramoullé"
            width="1080"
            height="1080"
            loading="eager"
            fetchPriority="high"
          />
        </div>
        <div className="hero-content">
          <div className="hero-eyebrow">
            <div className="hero-dot" />
            <span className="hero-eyebrow-text">Le média de la danse</span>
          </div>

          <h1 className="hero-title">
            <span className="hero-title-line">
              Le <span className="hero-rank" aria-label="premier"><span className="hero-rank-number">1</span><span className="hero-rank-suffix">er</span></span> média qui fait <em>découvrir,</em>
            </span>{" "}
            <span className="hero-title-line"><em>comprendre</em> et vivre la danse.</span>
          </h1>

          <p className="hero-desc">
            Podcast, articles, portraits, recommandations culturelles et ressources :
            Dance Lab ouvre les portes du monde de la danse pour celles et ceux qui
            souhaitent la pratiquer, la créer, la découvrir ou mieux la comprendre.
          </p>

          <div className="hero-btns">
            <a 
              href={latestEpisode.link}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              <IconPlay /> Écouter le podcast
            </a>

            <a href="#magazine" className="btn btn-outline-w">
              Découvrir l&apos;univers Dance Lab <IconArrow />
            </a>
          </div>
        </div>
        </div>

        <div className="hero-scroll" aria-hidden="true">
          <span>Scroll</span>
          <div className="scroll-line" />
        </div>
      </section>

      {/* ========================================
          TICKER
      ======================================== */}
      <div className="ticker" aria-hidden="true">
        <div className="ticker-track">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} className="ticker-item">{item}</span>
          ))}
        </div>
      </div>

      {/* ========================================
          DERNIER ÉPISODE
      ======================================== */}
      <section className="section" id="ecouter">
        <div className="container">
          <div className="ep-grid">
            {/* Image */}
            <div className="ep-img-wrap fu episode-image-reveal">
              <Link href={`/episodes/${latestEpisode.slug}`} className="latest-episode-link">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={latestEpisode.image}
                  alt={`${latestEpisode.guest}, invité(e) de l'épisode ${latestEpisode.number}`}
                  loading="lazy"
                  className="latest-episode-img"
                />
                <div className="ep-badge">
                  <span className="lbl">Ép.</span>
                  <span className="num">{latestEpisode.number}</span>
                </div>
              </Link>
            </div>

            {/* Info */}
            <div className="ep-info fu d1">
              <span className="section-label">Dernier épisode</span>

              <div className="ep-meta">
                <span className="tag tag-accent">Nouveau</span>
                <span className="ep-dur">
                  <IconClock /> {latestEpisode.duration}
                </span>
              </div>

              <Link
                href={`/episodes/${latestEpisode.slug}`}
                className="latest-episode-title-link"
              >
                <h2 className="ep-title">{latestEpisode.title}</h2>
              </Link>

              <p className="ep-guest">
                Avec <strong>{latestEpisode.guest}</strong>
              </p>

              <p className="ep-desc">{latestEpisode.excerpt}</p>

              {/* Plateformes */}
              <div className="platforms">
                <a
                  href={latestEpisode.spotify}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="plt"
                >
                  <img src="/icons/spotify.svg" alt="Spotify" />
                </a>

                <a
                  href={latestEpisode.apple}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="plt"
                >
                  <img src="/icons/apple-podcasts.svg" alt="Apple Podcasts" />
                </a>

                <a
                  href={latestEpisode.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="plt"
                >
                  <img src="/icons/youtube.svg" alt="YouTube" />
                </a>

                <a
                  href={latestEpisode.deezer}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="plt"
                >
                  <img src="/icons/deezer.svg" alt="Deezer" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================
          INVITÉS
      ======================================== */}
      <section className="section" id="interviews">
        <div className="container">
          <div className="section-header">
            <div className="sh-left">
              <span className="section-label">Interviews</span>
              <h2 className="section-title">Les invités</h2>
              <p className="section-sub">Chorégraphes, danseurs, pédagogues, entrepreneurs, juristes, professionnels de santé : des voix qui façonnent la danse d&apos;aujourd&apos;hui et de demain.</p>
            </div>
            <a href="/ecouter" className="see-all">Tous les épisodes <IconArrow /></a>
          </div>
          <div
            className="guests-grid"
            ref={guestTrackRef}
            onPointerDown={startGuestDrag}
            onPointerMove={moveGuestDrag}
            onPointerUp={endGuestDrag}
            onPointerCancel={endGuestDrag}
            onClickCapture={stopGuestClickAfterDrag}
          >
            {guestSelection.map((episode, index) => {
              const delay = GUEST_CARD_DELAYS[index] ?? ''
              const guestMeta =
                episode.role || `Épisode ${episode.number} · ${episode.duration}`
              const guestImage = getHomeGuestImage(episode)

              return (
                <Link
                  href={`/episodes/${episode.slug}`}
                  key={episode.slug}
                  className={`guest-card fu${delay ? ' ' + delay : ''}`}
                >
                  <div className="guest-img-wrap">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={guestImage}
                      alt={`${episode.guest}, invité(e) de l'épisode ${episode.number}`}
                      loading="lazy"
                      onError={(event) => {
                        if (event.currentTarget.dataset.fallbackApplied) {
                          return
                        }

                        event.currentTarget.dataset.fallbackApplied = 'true'
                        event.currentTarget.src = episode.image
                      }}
                    />
                    <div className="guest-overlay">
                      <p className="guest-quote">
                        &ldquo;{episode.quote}&rdquo;
                      </p>
                    </div>
                  </div>
                  <h3 className="guest-name">{episode.guest}</h3>
                  <p className="guest-role">{guestMeta}</p>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* ========================================
          MAGAZINE
      ======================================== */}
      <section className="section section--gray" id="magazine">
        <div className="container">
          <div className="section-header">
            <div className="sh-left">
              <span className="section-label">Magazine</span>
              <h2 className="section-title">Découvrir la danse</h2>
              <p className="section-sub">Culture, histoire et tendances</p>
            </div>
            <a href="/decouvrir" className="see-all">Tous les articles <IconArrow /></a>
          </div>

          {/* Grille photo principale */}
            <div className="mag-main fu">
            <a href="/decouvrir/articles/pourquoi-le-breakdance-est-devenu-olympique" className="art-card art-card-big">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://picsum.photos/image/mag_break/900/540" alt="Breakdance olympique" loading="lazy" />
              <div className="art-overlay">
                <p className="art-cat">Décryptage</p>
                <h3 className="art-title">
                  Pourquoi le breakdance est devenu une discipline olympique - et ce que ça change pour la danse urbaine
                </h3>
                <p className="art-meta">07.07.26 · 8 min de lecture</p>
              </div>
            </a>
            <div className="mag-side">
              <a href="/decouvrir/articles/comprendre-le-waacking-histoire-culture-influences" className="art-card art-card-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://picsum.photos/image/mag_waacking/600/380" alt="Waacking" loading="lazy" />
                <div className="art-overlay">
                  <p className="art-cat">Culture</p>
                  <h3 className="art-title">Comprendre le waacking : origines, codes et artistes incontournables</h3>
                  <p className="art-meta">05.07.26 · 5 min</p>
                </div>
              </a>
              <a href="/decouvrir/articles/festivals-danse-incontournables-ete" className="art-card art-card-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://picsum.photos/image/mag_festival/600/380" alt="Festivals" loading="lazy" />
                <div className="art-overlay">
                  <p className="art-cat">Agenda</p>
                  <h3 className="art-title">Les festivals de danse incontournables en France cet été</h3>
                  <p className="art-meta">02.07.26 · 6 min</p>
                </div>
              </a>
            </div>
          </div>

          {/* Cartes texte */}
          <div className="text-cards" style={{ marginTop: '20px' }}>
            {TEXT_ARTICLES.map(({ tag, title, meta, delay }) => (
              <a
                key={title}
                href={tag === 'Portrait' ? '/decouvrir/artistes-a-suivre' : '/decouvrir/articles-culture'}
                className={`txt-card fu${delay ? ' ' + delay : ''}`}
              >
                <span className="tag tag-gray">{tag}</span>
                <h3>{title}</h3>
                <p>{meta}</p>
              </a>
            ))}
          </div>

          <div className="magazine-article-strip">
            {magazineArticles.map((article) => (
              <Link
                key={article.slug}
                href={`/decouvrir/articles/${article.slug}`}
                className="magazine-article-link"
              >
                <span>{article.category}</span>
                <strong>{article.title}</strong>
                <small>{article.meta}</small>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================
          AGENDA
      ======================================== */}
      <section className="section" id="agenda">
        <div className="container">
          <div className="section-header">
            <div className="sh-left">
              <span className="section-label">Agenda culturel</span>
              <h2 className="section-title">Sortir &amp; vivre la danse</h2>
              <p className="section-sub">Spectacles, festivals, expositions, événements, ne manquez rien.</p>
            </div>
            <Link href="/agenda" className="see-all">Tout l&apos;agenda <IconArrow /></Link>
          </div>
          <div className="agenda-grid">
            {agendaPreviewEvents.map((event, index) => {
              const dateParts = getAgendaHomeDateParts(event)

              return (
                <Link
                  href={`/sortir/${event.slug}`}
                  key={event.slug}
                  className="guest-card"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={event.image || "/images/Couverture.png"}
                    alt={event.title}
                    loading="lazy"
                  />
                  <div className="ag-body">
                    <div className="ag-date">
                      <span className="ag-day">{dateParts.day}</span>
                      <div>
                        <div className="ag-month">{dateParts.detail}</div>
                        <div className="ag-year">{event.city}</div>
                      </div>
                    </div>
                    <h3 className="ag-title">{event.title}</h3>
                    <p className="ag-venue">
                      <IconPin /> {event.venue} · {event.city}
                    </p>
                  </div>
                  <div className="ag-foot">
                    <span className="ag-type">{event.category}</span>
                    <span className="ag-cta">Voir →</span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* ========================================
          EXPLORER BAND
      ======================================== */}
      <section className="explore-band" id="explorer">
        <div className="container">
          <div className="section-header section-header--solo">
            <div className="sh-left">
              <span className="section-label">L&apos;univers Dance Lab</span>
              <h2 className="section-title" style={{ color: '#fff' }}>Explorer la danse</h2>
            </div>
          </div>
        </div>
        <div className="explore-inner">
          {EXPLORE_ITEMS.map(({ icon, label, sub, href, delay }) => (
            <a key={label} href={href} className={`explore-item fu${delay ? ' ' + delay : ''}`}>
              <div className="explore-icon"><PremiumSectionIcon name={icon} /></div>
              <div className="explore-label">{label}</div>
              <div className="explore-sub">{sub}</div>
            </a>
          ))}
        </div>
      </section>

      {/* ========================================
          RESSOURCES
      ======================================== */}
      <section className="section section--dark" id="ressources">
        <div className="container">
          <div className="section-header">
            <div className="sh-left">
              <span className="section-label">Pour les professionnels</span>
              <h2 className="section-title" style={{ color: '#fff' }}>Ressources &amp; outils</h2>
              <p className="section-sub" style={{ color: 'rgba(255,255,255,.48)' }}>
                Tout ce dont un danseur a besoin pour gérer sa carrière, se protéger et évoluer.
              </p>
            </div>
            <a href="/#ressources" className="see-all">Toutes les ressources <IconArrow /></a>
          </div>
          <div className="res-grid">
            {RESOURCES.map(({ icon, title, desc, delay }) => (
              <div key={title} className={`res-card fu${delay ? ' ' + delay : ''}`}>
                <div className="res-icon"><PremiumSectionIcon name={icon} /></div>
                <h3 className="res-title">{title}</h3>
                <p className="res-desc">{desc}</p>
                <a href="/#ressources" className="res-link">Accéder <IconArrow /></a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================
          NEWSLETTER
      ======================================== */}
      <section className="newsletter" id="newsletter">
        <div className="newsletter-watermark">
          <img
            src="/logo.png"
            alt="Dance Lab"
            className="newsletter-logo-bg"
          />
        </div>

        <div className="container">
          <div className="nl-inner">
            <span className="section-label">
              Newsletter hebdomadaire
            </span>
            <h2 className="nl-title">Recevez chaque semaine le meilleur de la danse.</h2>
            <p className="nl-desc">
              Interviews, spectacles à découvrir, conseils professionnels et actualités culturelles,
              directement dans votre boîte mail. Gratuit, sans spam.
            </p>
            <form
              className="nl-form"
              action="https://dancelablemedia.substack.com/api/v1/free?nojs=true"
              method="post"
              target="substack-newsletter-frame"
              onSubmit={handleNewsletter}
              noValidate
            >
              <input
                ref={newsletterInputRef}
                className="nl-input"
                type="email"
                name="email"
                placeholder="Adresse e-mail"
                aria-label="Adresse e-mail"
                aria-invalid={newsletterStatus === 'invalid'}
                required
              />
              <input type="hidden" name="source" value="dance-lab-site" />
              <input type="hidden" name="current_url" value="https://dancelablemedia.substack.com/" />
              <input type="hidden" name="current_referrer" value="" />
              <input type="hidden" name="first_url" value="" />
              <input type="hidden" name="first_referrer" value="" />
              <input type="hidden" name="first_session_url" value="" />
              <input type="hidden" name="first_session_referrer" value="" />
              <input type="hidden" name="referral_code" value="" />
              <button
                type="submit"
                className="btn btn-primary"
                disabled={newsletterStatus === 'loading'}
              >
                Recevoir la newsletter
              </button>
            </form>
            <iframe
              title="Inscription newsletter Substack"
              name="substack-newsletter-frame"
              className="nl-frame"
              onLoad={handleNewsletterFrameLoad}
            />
            <div className="nl-message" aria-live="polite">
              {newsletterStatus === 'loading' ? (
                <p>Envoi en cours...</p>
              ) : null}
              {newsletterStatus === 'success' ? (
                <p className="nl-message-success">
                  Bienvenue dans l’univers Dance Lab ✨ Votre inscription est bien enregistrée.
                </p>
              ) : null}
              {newsletterStatus === 'invalid' ? (
                <p className="nl-message-error">Adresse e-mail invalide.</p>
              ) : null}
              {newsletterStatus === 'error' ? (
                <p className="nl-message-error">
                  Erreur de connexion. Merci de réessayer dans quelques instants.
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </section>

    </main>
  )
}
