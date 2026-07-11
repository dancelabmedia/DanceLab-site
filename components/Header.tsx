'use client'

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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)

    window.addEventListener('scroll', onScroll, { passive: true })

    return () => window.removeEventListener('scroll', onScroll)
  }, [])


  return (
    <header className={`header${scrolled ? ' scrolled' : ''}`}>
      <nav className="nav">

        <a href="/" className="logo">
          <img
            src="/logo.png"
            alt="Dance Lab"
            className="logo-image"
          />
        </a>


        <ul className="nav-links">

          <li className="nav-dropdown">
            <a href="/decouvrir">Découvrir</a>

            <div className="dropdown-menu">
              {discoverLinks.map((item) => (
                <a key={item.label} href={item.href}>
                  {item.label}
                </a>
              ))}
            </div>

          </li>


          <li className="nav-dropdown">
            <button type="button" className="nav-dropdown-trigger">
              Écouter
            </button>

            <div className="dropdown-menu">
              {listenLinks.map((item) => (
                <a key={item.label} href={item.href}>
                  {item.label}
                </a>
              ))}
            </div>

          </li>


          <li className="nav-dropdown">
            <a href="/agenda">Sortir</a>

            <div className="dropdown-menu">
              <a href="/agenda">Spectacles</a>
              <a href="/agenda">Festivals</a>
              <a href="/agenda">Événements gratuits</a>
            </div>

          </li>


          <li className="nav-dropdown">
            <a href="/explorer">Explorer</a>

            <div className="dropdown-menu">
              {exploreLinks.map((item) => (
                <a key={item.label} href={item.href}>
                  {item.label}
                </a>
              ))}
            </div>

          </li>


          <li className="nav-dropdown">
            <a href="/#ressources">Ressources</a>

            <div className="dropdown-menu">
              <a href="/#ressources">Guides &amp; conseils</a>
              <a href="/#ressources">Partenaires</a>
            </div>

          </li>


          <li>
            <a href="/a-propos">À propos</a>
          </li>


        </ul>


        <div className="nav-right">

          <button
            className="nav-icon-btn"
            aria-label="Rechercher"
          >
            <IconSearch />
          </button>


          <a
            href="/#newsletter"
            className="btn btn-primary"
            style={{ padding: '10px 20px', fontSize: '13px' }}
          >
            Newsletter
          </a>


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
          onClick={() => setMobileOpen(false)}
          aria-label="Fermer"
        >
          ✕
        </button>

        {[
          {
            label: 'Découvrir',
            items: discoverLinks,
          },
          {
            label: 'Écouter',
            items: listenLinks,
          },
          {
            label: 'Sortir',
            items: [
              { label: 'Spectacles', href: '/agenda' },
              { label: 'Festivals', href: '/agenda' },
              { label: 'Événements gratuits', href: '/agenda' },
            ],
          },
          {
            label: 'Explorer',
            items: exploreLinks,
          },
          {
            label: 'Ressources',
            items: [
              { label: 'Guides & conseils', href: '/#ressources' },
              { label: 'Partenaires', href: '/#ressources' },
            ],
          },
        ].map((group) => (
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
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            ) : null}
          </div>
        ))}

        <a
          href="/a-propos"
          className="mobile-menu-title"
          onClick={() => setMobileOpen(false)}
        >
          À propos
        </a>
      </nav>
    </header>
  )
}
