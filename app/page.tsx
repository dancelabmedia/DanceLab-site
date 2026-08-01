'use client'

import React, { useState, useEffect, useRef } from 'react'
import { featuredAgendaEvents, formatAgendaDateRange } from "./agenda/agenda-data"
import type { AgendaEvent } from "./agenda/agenda-data"
import { episodes } from "../data/episodes"
import { magazineArticles } from "./decouvrir/articles-data"
import Link from "next/link"
import MediaReveal from "./components/MediaReveal"
import LatestEpisodeSticky from "./components/LatestEpisodeSticky"

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

/**
 * Image automatique du dernier épisode dans /images/les-invites.
 * Convention : prénomNomSansAccentsSansEspaces + numéro.png
 * ex. "Yasmine Habib" + 118 → "yasminehabib118.png"
 * Fallback : episode.image si le fichier n'existe pas (géré côté client via onError).
 */
function getLatestEpisodeImage(episode: (typeof episodes)[number]): string {
  const normalized = episode.guest
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')   // retire les accents
    .replace(/[^a-z0-9]/g, '')          // retire espaces, tirets, apostrophes…
  return `/images/les-invites/${normalized}${episode.number}.png`
}

/**
 * Image éditoriale haute définition depuis /images/les-invites-header/.
 * Utilise le même nom de fichier que episode.image, avec fallback sur les-invites.
 */
function getLatestEpisodeHeaderImage(episode: (typeof episodes)[number]): string {
  const filename = episode.image.split('/').pop()?.replace(/\.png\.png$/i, '.png')
  return filename && filename !== 'logo.png'
    ? `/images/les-invites-header/${filename}`
    : getLatestEpisodeImage(episode)
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

  // Défilement avec pré-téléportation pour la boucle infinie.
  // Si la cible dépasse la zone réelle du set, on téléporte d'abord
  // (imperceptible car même contenu), puis on smooth-scroll normalement.
  function scrollCarousel(delta: number) {
    const track = guestTrackRef.current
    if (!track) return
    const card = track.querySelector<HTMLElement>('.guest-card')
    if (!card) return
    const s = getComputedStyle(track)
    const gap = parseFloat(s.columnGap || s.gap || '28')
    const sw = guestSelection.length * card.offsetWidth + (guestSelection.length - 1) * gap
    if (sw === 0) return
    const target = track.scrollLeft + delta
    if (delta < 0 && target < sw * 0.5) track.scrollLeft += sw
    else if (delta > 0 && target > sw * 1.5) track.scrollLeft -= sw
    track.scrollBy({ left: delta, behavior: 'smooth' })
  }

  // ── Carrousel infini ─────────────────────────────────────────────────────────
  // Les cartes sont rendues en 3 exemplaires : [clones-gauche][réel][clones-droite].
  // scrollLeft initial = setWidth (début du set réel).
  // Le handler scroll détecte l'entrée dans une zone clone et téléporte
  // silencieusement (même contenu → transition imperceptible).
  // scrollCarousel() pré-téléporte AVANT le smooth-scroll pour éviter
  // qu'une animation de flèche soit interrompue par le jump.
  // ─────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const track = guestTrackRef.current
    if (!track || guestSelection.length === 0) return

    function calcSetWidth(): number {
      const card = track!.querySelector<HTMLElement>('.guest-card')
      if (!card) return 0
      const s = getComputedStyle(track!)
      const gap = parseFloat(s.columnGap || s.gap || '28')
      return guestSelection.length * card.offsetWidth + (guestSelection.length - 1) * gap
    }

    // Positionnement initial au set du milieu
    const sw = calcSetWidth()
    if (sw > 0) track.scrollLeft = sw

    let jumping = false
    function handleInfiniteScroll() {
      if (jumping) return
      const t = guestTrackRef.current
      if (!t) return
      const w = calcSetWidth()
      if (w === 0) return
      if (t.scrollLeft < w * 0.5) {
        jumping = true
        t.scrollLeft += w
        guestDrag.current.scrollLeft += w   // garde la référence drag en phase
        jumping = false
      } else if (t.scrollLeft > w * 1.5) {
        jumping = true
        t.scrollLeft -= w
        guestDrag.current.scrollLeft -= w
        jumping = false
      }
    }

    track.addEventListener('scroll', handleInfiniteScroll, { passive: true })
    return () => track.removeEventListener('scroll', handleInfiniteScroll)
  }, [guestSelection])

  // Ajustement automatique de la taille des noms trop longs dans le carrousel.
  // white-space: nowrap (CSS) empêche le saut de ligne ; ce hook réduit font-size
  // par pas de 0.5 px jusqu'à ce que scrollWidth ≤ clientWidth.
  // line-height fixe en CSS garantit que le bas de chaque nom reste aligné
  // à la même hauteur quelle que soit la taille de police appliquée.
  useEffect(() => {
    function fitGuestNames() {
      const nameEls = document.querySelectorAll<HTMLElement>(
        '.home-interviews-grid .guest-name'
      )
      nameEls.forEach(el => {
        el.style.fontSize = ''            // réinitialise à la valeur CSS (18 px)
        if (el.scrollWidth <= el.clientWidth) return  // tient sur une ligne → rien à faire
        let size = 18
        while (el.scrollWidth > el.clientWidth && size > 13) {
          size -= 0.5
          el.style.fontSize = `${size}px`
        }
      })
    }

    fitGuestNames()
    window.addEventListener('resize', fitGuestNames, { passive: true })
    return () => window.removeEventListener('resize', fitGuestNames)
  }, [guestSelection])

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
            <a href="/ecouter" className="btn btn-primary">
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

      {/* ════════════════════════════════════════════════════════════
          EXPÉRIENCE IMMERSIVE — MediaReveal + LatestEpisodeSticky
          Un seul wrapper, un seul dégradé, aucune coupure visible.
          .mxp-wrapper fournit le fond continu ; les deux sections
          internes sont transparentes et servent de fenêtres animées.
      ════════════════════════════════════════════════════════════ */}
      <div className="mxp-wrapper">
        <MediaReveal
          article={magazineArticles[0]}
          event={featuredAgendaEvents[0] ?? null}
        />
        <LatestEpisodeSticky
          episode={latestEpisode}
          fallbackImage={getLatestEpisodeImage(latestEpisode)}
          interviewPool={GUEST_POOL}
          getGuestImage={getHomeGuestImage}
        />

        <div className="episodes-newsletter-transition" aria-hidden="true" />

      {/* ========================================
          NEWSLETTER
      ======================================== */}
      <section className="newsletter" id="newsletter">
        <div className="container">
          <div className="nl-inner fu">
            <span className="section-label">
              Newsletter hebdomadaire
            </span>
            <h2 className="nl-title">Recevez chaque semaine le meilleur de la danse.</h2>
            <p className="nl-desc">
              Interviews, spectacles à découvrir, conseils professionnels et actualités culturelles,
              directement dans votre boîte mail. Gratuit, sans spam.
            </p>
            <div className="newsletter-watermark">
              <img
                src="/logo.png"
                alt="Dance Lab"
                className="newsletter-logo-bg"
              />
            </div>
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

        <div className="mxp-outro" aria-hidden="true" />
      </div>

    </main>
  )
}
