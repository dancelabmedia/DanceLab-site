'use client'

import { useState, useEffect } from 'react'

/* =====================================================
   SVG ICONS (réutilisables)
===================================================== */
const IconPlay = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
)
const IconPause = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <rect x="6" y="4" width="4" height="16" />
    <rect x="14" y="4" width="4" height="16" />
  </svg>
)
const IconArrow = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
)
const IconSearch = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
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

/* =====================================================
   DONNÉES (à remplacer par vos vraies données / API)
===================================================== */
const FEATURED_EPISODES = [
  {
    id: 'ep72',
    seed: 'dancelab_ep72',
    tag: 'Carrière',
    ep: '72',
    title: 'Construire sa carrière de danseur indépendant en 2026',
    excerpt: 'Les clés pour naviguer entre cachets, contrats et liberté créatrice selon Julien Moreau.',
    guest: 'Julien Moreau',
    duration: '1h 04min',
    delay: '',
  },
  {
    id: 'ep65',
    seed: 'dancelab_ep65',
    tag: 'Santé mentale',
    ep: '65',
    title: 'Prendre soin de soi : santé mentale et danse professionnelle',
    excerpt: "Comment les danseurs vivent la pression et le doute — avec Marie Lecomte, psychologue du sport.",
    guest: 'Marie Lecomte',
    duration: '52min',
    delay: 'd1',
  },
  {
    id: 'ep58',
    seed: 'dancelab_ep58',
    tag: 'Entrepreneuriat',
    ep: '58',
    title: "Monter sa compagnie de danse : de l'idée à la réalité",
    excerpt: "Toutes les étapes, les erreurs à éviter et les ressources indispensables avec Thomas Clément.",
    guest: 'Thomas Clément',
    duration: '1h 18min',
    delay: 'd2',
  },
]

const GUESTS = [
  { seed: 'guest_sofia', name: 'Sofia Amaral', role: 'Chorégraphe · Cie Éclat', ep: '#87', quote: "La danse m'a appris à habiter mon corps et à raconter des histoires sans mots.", delay: '' },
  { seed: 'guest_julien', name: 'Julien Moreau', role: 'Danseur · Chorégraphe indépendant', ep: '#72', quote: "Être indépendant, c'est choisir sa liberté chaque matin en la réinventant.", delay: 'd1' },
  { seed: 'guest_amara', name: 'Amara Diallo', role: "B-boy · Fondateur d'Urban Roots", ep: '#79', quote: "Le hip-hop est une philosophie. La danse n'en est que l'expression la plus visible.", delay: 'd2' },
  { seed: 'guest_lea', name: 'Léa Fontaine', role: 'Pédagogue · Directrice artistique', ep: '#83', quote: "Enseigner la danse, c'est transmettre une façon d'être au monde.", delay: 'd3' },
]

const TEXT_ARTICLES = [
  { tag: 'Sortir', title: 'Quels spectacles de danse voir à Paris ce week-end ?', meta: 'Notre sélection hebdomadaire · 4 min de lecture', delay: '' },
  { tag: 'Guide', title: 'Comment assister à un battle de danse pour la première fois ?', meta: 'Guide complet du débutant · 5 min de lecture', delay: 'd1' },
  { tag: 'Portrait', title: "Les chorégraphes qui façonnent la danse contemporaine aujourd'hui", meta: 'Panorama 2026 · 7 min de lecture', delay: 'd2' },
]

const AGENDA_EVENTS = [
  { seed: 'agenda_giselle', day: '12', month: 'Juillet', year: '2026', title: 'Giselle revisitée — Akram Khan Company', venue: 'Théâtre du Châtelet · Paris', type: 'Spectacle', free: false, delay: '' },
  { seed: 'agenda_montpellier', day: '18', month: 'Juillet', year: '2026', title: 'Festival Montpellier Danse 2026', venue: 'Opéra Comédie · Montpellier', type: 'Festival', free: false, delay: 'd1' },
  { seed: 'agenda_battle', day: '20', month: 'Juillet', year: '2026', title: 'Battle Cercle des Batailles — édition spéciale', venue: 'La Villette · Paris', type: 'Battle · Entrée libre', free: true, delay: 'd2' },
]

const EXPLORE_ITEMS = [
  { icon: '💃', label: 'Styles de danse', sub: 'Hip-hop, contemporain, classique, afro, waacking et plus encore', delay: '' },
  { icon: '✍️', label: 'Chorégraphes', sub: "Les créateurs qui façonnent l'art chorégraphique d'aujourd'hui", delay: 'd1' },
  { icon: '🎭', label: 'Compagnies', sub: 'De la Comédie-Française au collectif underground', delay: 'd2' },
  { icon: '🌟', label: 'Artistes', sub: 'Portraits, parcours et coulisses de ceux qui font la danse', delay: 'd3' },
  { icon: '🎓', label: 'Métiers', sub: 'Danseur, chorégraphe, répétiteur, régisseur, critique…', delay: 'd4' },
]

const RESOURCES = [
  { icon: '📄', title: 'Contrats & juridique', desc: "Modèles de contrats, droits d'auteur, fiches pratiques pour comprendre vos obligations et protéger votre travail.", delay: '' },
  { icon: '🎭', title: 'Intermittence', desc: "Comprendre le régime, calculer ses heures, gérer l'administratif — un guide complet pour naviguer dans le système.", delay: 'd1' },
  { icon: '🎯', title: 'Auditions & casting', desc: "Préparer son book, rédiger un CV de danseur, réussir ses auditions — nos conseils et checklists pratiques.", delay: 'd2' },
  { icon: '📱', title: 'Communication & réseaux', desc: "Construire sa marque personnelle, maîtriser Instagram, créer un site — outils et stratégies pour exister en ligne.", delay: '' },
  { icon: '💡', title: 'Entrepreneuriat artistique', desc: "Monter sa structure, trouver des financements, gérer la comptabilité — ressources pour les artistes entrepreneurs.", delay: 'd1' },
  { icon: '🗓️', title: 'Organisation de carrière', desc: "Planifier sa saison, gérer ses projets, se fixer des objectifs — des outils pour prendre en main son parcours.", delay: 'd2' },
]

const TICKER_ITEMS = ['Podcast', 'Articles', 'Agenda culturel', "Portraits d'artistes", 'Ressources pro', 'Styles de danse', 'Festivals', 'Interviews', 'Compagnies', 'Spectacles']

/* =====================================================
   COMPOSANT PRINCIPAL
===================================================== */
export default function DanceLabPage() {
  const [searchOpen, setSearchOpen]   = useState(false)
  const [mobileOpen, setMobileOpen]   = useState(false)
  const [mobileSubOpen, setMobileSubOpen] = useState<string | null>(null)
  const [scrolled, setScrolled]       = useState(false)
  const [playing, setPlaying]         = useState<Record<string, boolean>>({})
  const [progress, setProgress]       = useState(33)
  const [nlDone, setNlDone]           = useState(false)

  /* Scroll → header opacity */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* Fade-up animation via IntersectionObserver */
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('vis') }),
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    )
    document.querySelectorAll('.fu').forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  /* Keyboard shortcuts (Échap / ⌘K) */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setSearchOpen(false); setMobileOpen(false) }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setSearchOpen(true) }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  /* Body scroll lock quand overlay ouvert */
  useEffect(() => {
    document.body.style.overflow = searchOpen || mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [searchOpen, mobileOpen])

  const togglePlay = (id: string) =>
    setPlaying((p) => ({ ...p, [id]: !p[id] }))

  const seekProgress = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    setProgress(((e.clientX - r.left) / r.width) * 100)
  }

  const handleNewsletter = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setNlDone(true)
    const input = e.currentTarget.querySelector('input') as HTMLInputElement
    if (input) input.value = ''
    setTimeout(() => setNlDone(false), 3500)
  }

  /* ── Rendu ────────────────────────────────────────── */
  return (
      <>
      {/* ========================================
          SEARCH OVERLAY
      ======================================== */}
      <div
        className={`search-overlay${searchOpen ? ' open' : ''}`}
        role="dialog"
        aria-label="Recherche"
        onClick={(e) => { if (e.target === e.currentTarget) setSearchOpen(false) }}
      >
        <div className="search-box">
          <div className="search-row">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input className="search-input" type="text" placeholder="Rechercher un épisode, un artiste, un style…" />
            <button className="search-close-btn" onClick={() => setSearchOpen(false)} aria-label="Fermer">✕</button>
          </div>
          <p style={{ fontSize: '11px', letterSpacing: '.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,.28)', marginBottom: '14px' }}>
            Suggestions populaires
          </p>
          <div className="search-chips">
            {['Waacking', 'Breakdance JO', 'Festivals 2026', 'Intermittence', 'Chorégraphes', 'Battle Paris', 'Auditions', 'Compagnies', 'Danse contemporaine'].map((chip) => (
              <span key={chip} className="s-chip">{chip}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ========================================
          MOBILE MENU
      ======================================== */}
      <nav className={`mobile-nav${mobileOpen ? ' open' : ''}`}>
        <button className="mobile-nav-close" onClick={() => setMobileOpen(false)}>✕</button>
        {[
          {
            label: 'Découvrir',
            items: ['Articles culture', 'Histoire des styles', 'Décryptages', 'Tendances', 'Artistes à suivre'],
          },
          {
            label: 'Écouter',
            items: ['Derniers épisodes', 'Incontournables', 'Interviews', 'Playlists thématiques'],
          },
          {
            label: 'Sortir',
            items: ['Spectacles', 'Festivals', 'Événements gratuits'],
          },
          {
            label: 'Explorer',
            items: ['Styles de danse', 'Chorégraphes', 'Compagnies', 'Métiers de la danse'],
          },
          {
            label: 'Ressources',
            items: ['Guides pratiques', 'Conseils carrière', 'Partenaires'],
          },
          {
            label: 'À propos',
            items: [],
          },
        ].map(({ label, items }) => (
          <div key={label} className="mobile-menu-group">
            <button
              type="button"
              className="mobile-menu-title"
              onClick={() => setMobileSubOpen(mobileSubOpen === label ? null : label)}
            >
              {label}
            </button>
            {mobileSubOpen === label && items.length > 0 && (
              <div className="mobile-submenu">
                {items.map((item) => (
                  <a key={item} href="#" onClick={() => setMobileOpen(false)}>{item}</a>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* ========================================
          HEADER
      ======================================== */}
      <header className={`header${scrolled ? ' scrolled' : ''}`}>
        <nav className="nav">
          <a href="#" className="logo">
            <img
              src="/logo.png"
              alt="Dance Lab"
              className="logo-image"
            />
          </a>
          <ul className="nav-links">

            <li className="nav-dropdown">
              <a href="#">Découvrir</a>
              <div className="dropdown-menu">
                <a href="#">Articles culture</a>
                <a href="#">Histoire des styles</a>
                <a href="#">Décryptages</a>
                <a href="#">Tendances</a>
                <a href="#">Artistes à suivre</a>
              </div>
            </li>

            <li className="nav-dropdown">
              <a href="/ecouter">Écouter</a>
              <div className="dropdown-menu">
                <a href="/ecouter#episodes">Derniers épisodes</a>
                <a href="#">Incontournables</a>
                <a href="#">Interviews</a>
                <a href="#">Playlists thématiques</a>
              </div>
            </li>

            <li className="nav-dropdown">
              <a href="#agenda">Sortir</a>
              <div className="dropdown-menu">
                <a href="#">Spectacles</a>
                <a href="#">Festivals</a>
                <a href="#">Événements gratuits</a>
              </div>
            </li>

            <li className="nav-dropdown">
              <a href="#explorer">Explorer</a>
              <div className="dropdown-menu">
                <a href="#">Styles de danse</a>
                <a href="#">Chorégraphes</a>
                <a href="#">Compagnies</a>
                <a href="#">Métiers de la danse</a>
              </div>
            </li>

            <li className="nav-dropdown">
              <a href="#ressources">Ressources</a>
              <div className="dropdown-menu">
                <a href="#">Guides pratiques</a>
                <a href="#">Conseils carrière</a>
                <a href="#">Partenaires</a>
              </div>
            </li>

            <li>
              <a href="#">À propos</a>
            </li>

          </ul>
          <div className="nav-right">
            <button className="nav-icon-btn" onClick={() => setSearchOpen(true)} aria-label="Rechercher">
              <IconSearch />
            </button>
            <a href="#newsletter" className="btn btn-primary" style={{ padding: '10px 20px', fontSize: '13px' }}>
              Newsletter
            </a>
            <button className="nav-burger" onClick={() => setMobileOpen(true)} aria-label="Menu">
              <IconMenu />
            </button>
          </div>
        </nav>
      </header>

      {/* ========================================
          HERO
      ======================================== */}
      <section className="hero" id="hero">
        <div className="hero-line" />
        <div className="hero-bg" />
        <div className="hero-overlay" />
        <div className="hero-content">
          <div className="hero-eyebrow">
            <div className="hero-dot" />
            <span className="hero-eyebrow-text">Le média de la danse</span>
          </div>

          <h1 className="hero-title">
            Le média qui fait<br />
            <em>découvrir, comprendre</em><br />
            et vivre la danse.
          </h1>

          <p className="hero-desc">
            Podcast, articles, portraits, recommandations culturelles et ressources :
            Dance Lab ouvre les portes du monde de la danse pour celles et ceux qui
            souhaitent la pratiquer, la créer, la découvrir ou mieux la comprendre.
          </p>

          <div className="hero-btns">
            <a 
              href="https://smartlink.ausha.co/dance-lab"
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

          <div className="hero-platforms">
            <span>Disponible sur</span>

            <div className="platform-links">
              <a 
                href="https://open.spotify.com/show/1E4QoAHY6I5LyNVxBYOIJ4?si=a3083832359847e5"
                target="_blank"
                rel="noopener noreferrer"
              >
                Spotify
              </a>

              <a 
                href="https://podcasts.apple.com/fr/podcast/dance-lab/id1743269399"
                target="_blank"
                rel="noopener noreferrer"
              >
                Apple Podcasts
              </a>

              <a 
                href="https://link.deezer.com/s/33LngLuGSjs26gQNmuuxn"
                target="_blank"
                rel="noopener noreferrer"
              >
                Deezer
              </a>

              <a 
                href="https://www.youtube.com/@maiwennbramoulle"
                target="_blank"
                rel="noopener noreferrer"
              >
                YouTube
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
            <div className="ep-img-wrap fu">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://picsum.photos/seed/dancelab_ep87/800/600"
                alt="Sofia Amaral, invitée de l'épisode 87"
                loading="lazy"
              />
              <div className="ep-badge">
                <span className="lbl">Ép.</span>
                <span className="num">87</span>
              </div>
            </div>

            {/* Info */}
            <div className="ep-info fu d1">
              <span className="section-label">Dernier épisode</span>
              <div className="ep-meta">
                <span className="tag tag-accent">Nouveau</span>
                <span className="ep-dur"><IconClock /> 58 min</span>
              </div>
              <h2 className="ep-title">
                La danse comme langage universel : parcours d&apos;une chorégraphe entre deux cultures
              </h2>
              <p className="ep-guest">Avec <strong>Sofia Amaral</strong> — Chorégraphe, Compagnie Éclat</p>
              <p className="ep-desc">
                Sofia Amaral revient sur son parcours entre le Portugal et la France, sa vision de la
                création contemporaine, les défis de monter sa propre compagnie et comment transformer
                le doute en force créatrice.
              </p>

              {/* Player */}
              <div className="player">
                <div className="player-top">
                  <button className="play-btn" onClick={() => togglePlay('main')} aria-label="Lire l'épisode">
                    {playing['main'] ? <IconPause /> : <IconPlay />}
                  </button>
                  <div className="player-info">
                    <div className="player-title">Dance Lab #87 — Sofia Amaral</div>
                    <div className="player-sub">Dance Lab Podcast</div>
                  </div>
                  <div className="player-time">20:24 / 58:07</div>
                </div>
                <div className="progress" onClick={seekProgress}>
                  <div className="progress-fill" style={{ width: `${progress}%` }} />
                </div>
              </div>

              {/* Plateformes */}
              <div className="platforms">
                <span className="platform-lbl">Disponible sur :</span>
                <a href="#" className="plt">🎵 Spotify</a>
                <a href="#" className="plt">🎙 Apple Podcasts</a>
                <a href="#" className="plt">▶️ YouTube</a>
                <a href="#" className="plt">🎧 Deezer</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================
          ÉPISODES INCONTOURNABLES
      ======================================== */}
      <section className="section section--gray">
        <div className="container">
          <div className="section-header">
            <div className="sh-left">
              <span className="section-label">À écouter absolument</span>
              <h2 className="section-title">Épisodes incontournables</h2>
              <p className="section-sub">Nos épisodes les plus marquants sur la carrière, la création et la vie d&apos;artiste.</p>
            </div>
            <a href="#" className="see-all">Tous les épisodes <IconArrow /></a>
          </div>
          <div className="ep-cards">
            {FEATURED_EPISODES.map(({ id, seed, tag, ep, title, excerpt, guest, duration, delay }) => (
              <div key={id} className={`ep-card fu${delay ? ' ' + delay : ''}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`https://picsum.photos/seed/${seed}/640/360`} alt={title} loading="lazy" />
                <div className="ep-card-body">
                  <div className="ep-card-tags">
                    <span className="tag tag-gray">{tag}</span>
                    <span className="tag tag-gray">Ép. {ep}</span>
                  </div>
                  <h3 className="ep-card-title">{title}</h3>
                  <p className="ep-card-excerpt">{excerpt}</p>
                  <div className="ep-card-foot">
                    <span className="ep-card-guest">{guest} · {duration}</span>
                    <button className="ep-play-sm" onClick={() => togglePlay(id)} aria-label="Lire">
                      {playing[id] ? <IconPause /> : <IconPlay />}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================
          INVITÉS
      ======================================== */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <div className="sh-left">
              <span className="section-label">La famille Dance Lab</span>
              <h2 className="section-title">Les invités</h2>
              <p className="section-sub">Chorégraphes, danseurs, pédagogues, entrepreneurs — des voix qui façonnent la danse d&apos;aujourd&apos;hui.</p>
            </div>
            <a href="#" className="see-all">Tous les invités <IconArrow /></a>
          </div>
          <div className="guests-grid">
            {GUESTS.map(({ seed, name, role, ep, quote, delay }) => (
              <div key={seed} className={`guest-card fu${delay ? ' ' + delay : ''}`}>
                <div className="guest-img-wrap">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`https://picsum.photos/seed/${seed}/400/533`} alt={name} loading="lazy" />
                  <div className="guest-overlay">
                    <p className="guest-quote">&ldquo;{quote}&rdquo;</p>
                  </div>
                </div>
                <h3 className="guest-name">{name}</h3>
                <p className="guest-role">{role}</p>
                <span className="guest-ep">→ Épisode {ep}</span>
              </div>
            ))}
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
              <p className="section-sub">Culture, histoire, tendances — une fenêtre ouverte sur tous les univers de la danse.</p>
            </div>
            <a href="#" className="see-all">Tous les articles <IconArrow /></a>
          </div>

          {/* Grille photo principale */}
          <div className="mag-main fu">
            <div className="art-card art-card-big">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://picsum.photos/seed/mag_break/900/540" alt="Breakdance olympique" loading="lazy" />
              <div className="art-overlay">
                <p className="art-cat">Décryptage</p>
                <h3 className="art-title">
                  Pourquoi le breakdance est devenu une discipline olympique — et ce que ça change pour la danse urbaine
                </h3>
                <p className="art-meta">7 juillet 2026 · 8 min de lecture</p>
              </div>
            </div>
            <div className="mag-side">
              <div className="art-card art-card-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://picsum.photos/seed/mag_waacking/600/380" alt="Waacking" loading="lazy" />
                <div className="art-overlay">
                  <p className="art-cat">Culture</p>
                  <h3 className="art-title">Comprendre le waacking : origines, codes et artistes incontournables</h3>
                  <p className="art-meta">5 juillet 2026 · 5 min</p>
                </div>
              </div>
              <div className="art-card art-card-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://picsum.photos/seed/mag_festival/600/380" alt="Festivals" loading="lazy" />
                <div className="art-overlay">
                  <p className="art-cat">Agenda</p>
                  <h3 className="art-title">Les festivals de danse incontournables en France cet été</h3>
                  <p className="art-meta">2 juillet 2026 · 6 min</p>
                </div>
              </div>
            </div>
          </div>

          {/* Cartes texte */}
          <div className="text-cards" style={{ marginTop: '20px' }}>
            {TEXT_ARTICLES.map(({ tag, title, meta, delay }) => (
              <a key={title} href="#" className={`txt-card fu${delay ? ' ' + delay : ''}`}>
                <span className="tag tag-gray">{tag}</span>
                <h3>{title}</h3>
                <p>{meta}</p>
              </a>
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
              <p className="section-sub">Spectacles, festivals, expositions, événements — ne manquez rien de ce qui se passe.</p>
            </div>
            <a href="#" className="see-all">Tout l&apos;agenda <IconArrow /></a>
          </div>
          <div className="agenda-grid">
            {AGENDA_EVENTS.map(({ seed, day, month, year, title, venue, type, free, delay }) => (
              <div key={seed} className={`ag-card fu${delay ? ' ' + delay : ''}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`https://picsum.photos/seed/${seed}/600/450`} alt={title} loading="lazy" />
                <div className="ag-body">
                  <div className="ag-date">
                    <span className="ag-day">{day}</span>
                    <div>
                      <div className="ag-month">{month}</div>
                      <div className="ag-year">{year}</div>
                    </div>
                  </div>
                  <h3 className="ag-title">{title}</h3>
                  <p className="ag-venue">
                    <IconPin /> {venue}
                    {free && (
                      <span className="tag tag-accent" style={{ marginLeft: '8px', fontSize: '9px' }}>
                        Gratuit
                      </span>
                    )}
                  </p>
                </div>
                <div className="ag-foot">
                  <span className="ag-type">{type}</span>
                  <span className="ag-cta">Voir →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================
          EXPLORER BAND
      ======================================== */}
      <section className="explore-band" id="explorer">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span className="section-label">L&apos;univers Dance Lab</span>
            <h2 className="section-title" style={{ color: '#fff' }}>Explorer la danse</h2>
          </div>
        </div>
        <div className="explore-inner">
          {EXPLORE_ITEMS.map(({ icon, label, sub, delay }) => (
            <div key={label} className={`explore-item fu${delay ? ' ' + delay : ''}`}>
              <div className="explore-icon">{icon}</div>
              <div className="explore-label">{label}</div>
              <div className="explore-sub">{sub}</div>
            </div>
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
            <a href="#" className="see-all">Toutes les ressources <IconArrow /></a>
          </div>
          <div className="res-grid">
            {RESOURCES.map(({ icon, title, desc, delay }) => (
              <div key={title} className={`res-card fu${delay ? ' ' + delay : ''}`}>
                <div className="res-icon">{icon}</div>
                <h3 className="res-title">{title}</h3>
                <p className="res-desc">{desc}</p>
                <a href="#" className="res-link">Accéder <IconArrow /></a>
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
            <span className="section-label" style={{ display: 'block', marginBottom: '14px' }}>
              Newsletter hebdomadaire
            </span>
            <h2 className="nl-title">Le meilleur de la danse, chaque semaine</h2>
            <p className="nl-desc">
              Interviews, spectacles à découvrir, conseils professionnels et actualités culturelles —
              directement dans votre boîte mail. Gratuit, sans spam.
            </p>
            <form className="nl-form" onSubmit={handleNewsletter}>
              <input className="nl-input" type="email" placeholder="Votre adresse e-mail" aria-label="Adresse e-mail" required />
              <button
                type="submit"
                className="btn btn-primary"
                style={nlDone ? { background: '#22c55e' } : undefined}
              >
                {nlDone ? '✓ Inscrit !' : "S'abonner"}
              </button>
            </form>
            <p className="nl-note">Plus de 4 800 passionnés de danse déjà inscrits · Désinscription en un clic</p>
          </div>
        </div>
      </section>

      {/* ========================================
          FOOTER
      ======================================== */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            {/* Marque */}
            <div>
              <a href="#" className="logo footer-logo">Dance<span>Lab</span></a>
              <p className="footer-tagline">
                Le média qui ouvre les portes du monde de la danse — pour les professionnels,
                les passionnés et les curieux.
              </p>
              <div className="socials">
                <a href="#" className="social-btn" aria-label="Instagram">📷</a>
                <a href="#" className="social-btn" aria-label="TikTok">🎵</a>
                <a href="#" className="social-btn" aria-label="YouTube">▶️</a>
                <a href="#" className="social-btn" aria-label="Spotify">🎙</a>
              </div>
            </div>

            {/* Découvrir */}
            <div>
              <p className="foot-col-title">Découvrir</p>
              <ul className="foot-links">
                {['Articles culture', 'Histoire des styles', 'Décryptages', 'Tendances', 'Artistes à suivre'].map((l) => (
                  <li key={l}><a href="#">{l}</a></li>
                ))}
              </ul>
            </div>

            {/* Écouter + Sortir */}
            <div>
              <p className="foot-col-title">Écouter</p>
              <ul className="foot-links">
                {['Derniers épisodes', 'Incontournables', 'Interviews', 'Playlists thématiques'].map((l) => (
                  <li key={l}><a href="#">{l}</a></li>
                ))}
              </ul>
              <p className="foot-col-title" style={{ marginTop: '26px' }}>Sortir</p>
              <ul className="foot-links">
                {['Spectacles', 'Festivals', 'Événements gratuits'].map((l) => (
                  <li key={l}><a href="#">{l}</a></li>
                ))}
              </ul>
            </div>

            {/* Explorer + Ressources */}
            <div>
              <p className="foot-col-title">Explorer</p>
              <ul className="foot-links">
                {['Styles de danse', 'Chorégraphes', 'Compagnies', 'Métiers de la danse'].map((l) => (
                  <li key={l}><a href="#">{l}</a></li>
                ))}
              </ul>
              <p className="foot-col-title" style={{ marginTop: '26px' }}>Ressources</p>
              <ul className="foot-links">
                {['Guides pratiques', 'Conseils carrière', 'Partenaires', 'À propos'].map((l) => (
                  <li key={l}><a href="#">{l}</a></li>
                ))}
              </ul>
            </div>
          </div>

          {/* Barre légale */}
          <div className="foot-bottom">
            <p className="foot-copy">© 2026 Dance Lab — Tous droits réservés</p>
            <ul className="foot-legal">
              <li><a href="#">Mentions légales</a></li>
              <li><a href="#">Confidentialité</a></li>
              <li><a href="#">Contact</a></li>
            </ul>
          </div>
        </div>
      </footer>

      </>
  )
}