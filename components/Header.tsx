'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { FormEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { searchContent, type SearchItem } from '../data/search'

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

const popularSearches = ['Waacking', 'Breakdance', 'Intermittence', 'Chorégraphes', 'Danse contemporaine']
const MAX_PREVIEW_RESULTS = 12

export default function Header({ searchItems }: { searchItems: SearchItem[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileSubOpen, setMobileSubOpen] = useState<string | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [activeResult, setActiveResult] = useState(-1)
  const searchInputRef = useRef<HTMLInputElement | null>(null)
  const searchBoxRef = useRef<HTMLDivElement | null>(null)

  const allSuggestions = useMemo(
    () => searchContent(searchItems, debouncedQuery, searchItems.length),
    [debouncedQuery, searchItems]
  )
  const suggestionGroups = useMemo(() => {
    const groupedResults = new Map<string, SearchItem[]>()

    for (const item of allSuggestions) {
      const group = groupedResults.get(item.groupLabel) || []
      group.push(item)
      groupedResults.set(item.groupLabel, group)
    }

    const sourceGroups = Array.from(groupedResults, ([label, items]) => ({ label, items }))
    const previewGroups = sourceGroups.map((group) => ({
      label: group.label,
      items: group.items.slice(0, 2),
    }))
    let remainingSlots = Math.max(
      0,
      MAX_PREVIEW_RESULTS - previewGroups.reduce((total, group) => total + group.items.length, 0)
    )
    let resultOffset = 2

    while (remainingSlots > 0) {
      let resultAdded = false

      for (let index = 0; index < sourceGroups.length && remainingSlots > 0; index += 1) {
        const result = sourceGroups[index].items[resultOffset]
        if (!result) continue

        previewGroups[index].items.push(result)
        remainingSlots -= 1
        resultAdded = true
      }

      if (!resultAdded) break
      resultOffset += 1
    }

    return previewGroups.filter((group) => group.items.length > 0)
  }, [allSuggestions])
  const suggestions = useMemo(
    () => suggestionGroups.flatMap((group) => group.items),
    [suggestionGroups]
  )
  const hasMoreSuggestions = allSuggestions.length > suggestions.length

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

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedQuery(query), 120)
    return () => window.clearTimeout(timeout)
  }, [query])

  useEffect(() => {
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setMobileOpen(false)
        setSearchOpen(true)
      }

      if (event.key === 'Escape') {
        setSearchOpen(false)
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    if (!searchOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.requestAnimationFrame(() => searchInputRef.current?.focus())

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [searchOpen])

  useEffect(() => {
    setSearchOpen(false)
  }, [pathname])

  useEffect(() => {
    setActiveResult(-1)
  }, [debouncedQuery])

  const closeMobileMenu = () => {
    setMobileOpen(false)
    setMobileSubOpen(null)
  }

  const openSearch = () => {
    closeMobileMenu()
    setSearchOpen(true)
  }

  const closeSearch = () => {
    setSearchOpen(false)
    setQuery('')
    setDebouncedQuery('')
    setActiveResult(-1)
  }

  const goToSearchResults = () => {
    const trimmedQuery = query.trim()
    if (!trimmedQuery) return

    router.push(`/recherche?q=${encodeURIComponent(trimmedQuery)}`)
    closeSearch()
  }

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    goToSearchResults()
  }

  const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown' && suggestions.length > 0) {
      event.preventDefault()
      setActiveResult((current) => (current + 1) % suggestions.length)
    }

    if (event.key === 'ArrowUp' && suggestions.length > 0) {
      event.preventDefault()
      setActiveResult((current) => (current <= 0 ? suggestions.length - 1 : current - 1))
    }

    if (event.key === 'Enter' && activeResult >= 0 && suggestions[activeResult]) {
      event.preventDefault()
      router.push(suggestions[activeResult].href)
      closeSearch()
    } else if (event.key === 'Enter') {
      event.preventDefault()
      goToSearchResults()
    }
  }

  const handleDialogKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.stopPropagation()
      closeSearch()
      return
    }

    if (event.key !== 'Tab' || !searchBoxRef.current) return

    const focusableElements = Array.from(
      searchBoxRef.current.querySelectorAll<HTMLElement>('a[href], button, input')
    ).filter((element) => !element.hasAttribute('disabled'))
    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault()
      lastElement?.focus()
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault()
      firstElement?.focus()
    }
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
          <button
            type="button"
            className="nav-icon-btn"
            aria-label="Rechercher"
            aria-haspopup="dialog"
            onClick={openSearch}
          >
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

      {searchOpen ? createPortal(
        <div
          className="search-overlay open"
          role="dialog"
          aria-modal="true"
          aria-label="Recherche sur Dance Lab"
          onKeyDown={handleDialogKeyDown}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeSearch()
          }}
        >
          <div ref={searchBoxRef} className="search-box">
            <form className="search-row" role="search" onSubmit={submitSearch}>
              <IconSearch />
              <input
                ref={searchInputRef}
                className="search-input"
                type="search"
                value={query}
                placeholder="Rechercher un épisode, un artiste, un style…"
                autoComplete="off"
                aria-label="Rechercher dans Dance Lab"
                aria-autocomplete="list"
                aria-controls="search-suggestions"
                aria-activedescendant={
                  activeResult >= 0 ? `search-result-${suggestions[activeResult]?.id}` : undefined
                }
                onChange={(event) => {
                  setQuery(event.target.value)
                  setActiveResult(-1)
                }}
                onKeyDown={handleSearchKeyDown}
              />
              <button className="search-submit-btn" type="submit">
                Rechercher
              </button>
              <button className="search-close-btn" type="button" onClick={closeSearch} aria-label="Fermer la recherche">
                ✕
              </button>
            </form>

            {!query.trim() ? (
              <div className="search-popular">
                <p>Suggestions populaires</p>
                <div className="search-chips">
                  {popularSearches.map((search) => (
                    <button
                      key={search}
                      type="button"
                      className="s-chip"
                      onClick={() => {
                        setQuery(search)
                        searchInputRef.current?.focus()
                      }}
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {query.trim() ? (
              <div className="search-suggestions" aria-live="polite">
                {suggestions.length > 0 ? (
                  <div id="search-suggestions" className="search-suggestion-scroll" role="listbox">
                    {suggestionGroups.map((group, groupIndex) => (
                      <section
                        key={group.label}
                        className="search-suggestion-group"
                        role="group"
                        aria-labelledby={`search-group-${groupIndex}`}
                      >
                        <h2 id={`search-group-${groupIndex}`}>
                          {group.label}
                        </h2>
                        <ul>
                          {group.items.map((item) => {
                            const itemIndex = suggestions.findIndex((suggestion) => suggestion.id === item.id)

                            return (
                              <li key={item.id} role="presentation">
                                <Link
                                  id={`search-result-${item.id}`}
                                  className={`search-suggestion${activeResult === itemIndex ? ' active' : ''}`}
                                  href={item.href}
                                  role="option"
                                  aria-selected={activeResult === itemIndex}
                                  onClick={closeSearch}
                                >
                                  {item.image ? (
                                    <img src={item.image} alt="" />
                                  ) : (
                                    <span className="search-suggestion-placeholder" aria-hidden="true">
                                      {item.typeLabel.slice(0, 1)}
                                    </span>
                                  )}
                                  <span className="search-suggestion-copy">
                                    <small>
                                      {item.typeLabel}
                                      {item.episodeNumber ? ` ${item.episodeNumber}` : ''}
                                    </small>
                                    <strong>{item.title}</strong>
                                    {item.guest ? <span>Avec {item.guest}</span> : <span>{item.summary}</span>}
                                  </span>
                                  <span className="search-suggestion-arrow" aria-hidden="true">→</span>
                                </Link>
                              </li>
                            )
                          })}
                        </ul>
                      </section>
                    ))}
                  </div>
                ) : query === debouncedQuery ? (
                  <p className="search-empty">Aucun résultat trouvé pour « {query.trim()} ».</p>
                ) : null}

                {hasMoreSuggestions ? (
                  <button className="search-all-results" type="button" onClick={goToSearchResults}>
                    Voir tous les résultats ({allSuggestions.length})
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>,
        document.body
      ) : null}
    </header>
  )
}
