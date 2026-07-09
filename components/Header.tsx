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
            <a href="#">Sortir</a>

            <div className="dropdown-menu">
              <a href="#">Spectacles</a>
              <a href="#">Festivals</a>
              <a href="#">Événements gratuits</a>
            </div>

          </li>


          <li className="nav-dropdown">
            <a href="#">Explorer</a>

            <div className="dropdown-menu">
              <a href="#">Styles de danse</a>
              <a href="#">Chorégraphes</a>
              <a href="#">Compagnies</a>
              <a href="#">Métiers de la danse</a>
            </div>

          </li>


          <li className="nav-dropdown">
            <a href="#">Ressources</a>

            <div className="dropdown-menu">
              <a href="#">Guides pratiques</a>
              <a href="#">Conseils carrière</a>
              <a href="#">Partenaires</a>
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
          >
            <IconMenu />
          </button>

        </div>

      </nav>
    </header>
  )
}