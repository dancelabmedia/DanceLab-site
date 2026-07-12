'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

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

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileSubOpen, setMobileSubOpen] = useState<string | null>(null)

  const listenLinks = [
    { label: 'Tous les épisodes', href: '/ecouter' },
    { label: 'Incontournables', href: '/ecouter/incontournables' },
    { label: 'Playlists thématiques', href: '/ecouter/playlists-thematiques' },
  ]

  const discoverLinks = [
    { label: 'Articles culture', href: '/decouvrir/articles-culture' },
    { label: 'Histoire des styles', href: '/decouvrir/histoire-des-styles' },
    { label: 'Décryptages', href: '/decouvrir/decryptages' },
    { label: 'Tendances', href: '/decouvrir/tendances' },
    { label: 'Artistes à suivre', href: '/decouvrir/artistes-a-suivre' },
  ]

  const exploreLinks = [
    { label: 'Styles de danse', href: '/explorer/styles-de-danse' },
    { label: 'Chorégraphes', href: '/explorer/choregraphes' },
    { label: 'Compagnies', href: '/explorer/compagnies' },
    { label: 'Artistes', href: '/explorer/artistes' },
    { label: 'Métiers de la danse', href: '/explorer/metiers-de-la-danse' },
  ]

  const navGroups = [
    { label: 'Découvrir', items: discoverLinks },
    { label: 'Écouter', items: listenLinks },
    {
      label: 'Sortir',
      items: [
        { label: 'Tous les événements', href: '/agenda' },
        { label: 'Spectacles', href: '/agenda' },
        { label: 'Festivals', href: '/agenda' },
        { label: 'Événements gratuits', href: '/agenda' },
      ],
    },
    { label: 'Explorer', items: exploreLinks },
    {
      label: 'Ressources',
      items: [
        { label: 'Guides & conseils', href: '/#ressources' },
        { label: 'Partenaires', href: '/#ressources' },
      ],
    },
  ]

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)

    window.addEventListener('scroll', onScroll, { passive: true })

    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const closeMobileMenu = () => {
    setMobileOpen(false)
    setMobileSubOpen(null)
  }

  return (
    <header className={`header${scrolled ? ' scrolled' : ''}`}>
      <nav className="nav">
        <Link href="/" className="logo" onClick={closeMobileMenu}>
          <img src="/logo.png" alt="Dance Lab" className="logo-image" />
        </Link>

        <ul className="nav-links">
          {navGroups.map((group) => (
            <li key={group.label} className="nav-dropdown">
              <button type="button" className="nav-dropdown-trigger">
                {group.label}
              </button>

              <div className="dropdown-menu">
                {group.items.map((item) => (
                  <Link key={item.label} href={item.href}>
                    {item.label}
                  </Link>
                ))}
              </div>
            </li>
          ))}

          <li>
            <Link href="/a-propos">À propos</Link>
          </li>
        </ul>

        <div className="nav-right">
          <button className="nav-icon-btn" aria-label="Rechercher">
            <IconSearch />
          </button>

          <Link
            href="/#newsletter"
            className="btn btn-primary"
            style={{ padding: '10px 20px', fontSize: '13px' }}
          >
            Newsletter
          </Link>

          <button
            className="nav-burger"
            aria-label="Menu"
            onClick={() => setMobileOpen(true)}
          >
            <IconMenu />
          </button>
        </div>
      </nav>

      <nav className={`mobile-nav${mobileOpen ? ' open' : ''}`}>
        <button
          className="mobile-nav-close"
          onClick={closeMobileMenu}
          aria-label="Fermer"
        >
          ✕
        </button>

        {navGroups.map((group) => (
          <div key={group.label} className="mobile-menu-group">
            <button
              type="button"
              className="mobile-menu-title"
              onClick={() => setMobileSubOpen(mobileSubOpen === group.label ? null : group.label)}
            >
              {group.label}
            </button>

            {mobileSubOpen === group.label ? (
              <div className="mobile-submenu">
                {group.items.map((item) => (
                  <Link key={item.label} href={item.href} onClick={closeMobileMenu}>
                    {item.label}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        ))}

        <Link href="/a-propos" className="mobile-menu-title" onClick={closeMobileMenu}>
          À propos
        </Link>
      </nav>
    </header>
  )
}
