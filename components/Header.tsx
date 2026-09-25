'use client'

import Link from 'next/link'
import { privateAccessScope, publicNavigationHref } from '@/data/private-navigation'
import availability from './HeaderAvailability.module.css'
import { usePathname, useRouter } from 'next/navigation'
import { FormEvent, KeyboardEvent, MouseEvent, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { searchContent, type SearchItem } from '../data/search'
import { localizedHref, sourcePath, type Locale } from '@/lib/i18n/routing'
import { uiText } from '@/data/i18n/messages'
import { useLocale } from './LocaleProvider'
import LanguageSwitcher from './LanguageSwitcher'

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

const IconArrow = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M5 12h14M14 6l6 6-6 6" />
  </svg>
)

const IconEnvelope = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <rect x="2.5" y="4.5" width="19" height="15" rx="1.5" />
    <path d="m3.5 6 8.5 7 8.5-7" />
  </svg>
)

const MAX_PREVIEW_RESULTS = 12

export default function Header({ searchItems, locale: _initialLocale = 'fr' }: { searchItems: SearchItem[]; locale?: Locale }) {
  // Read from context so locale updates instantly without page reload
  const locale = useLocale()
  const t = (text: string) => uiText(locale, text)
  const href = (path: string) => localizedHref(path, locale)
  const router = useRouter()
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileSubOpen, setMobileSubOpen] = useState<string | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [compactSearchPlaceholder, setCompactSearchPlaceholder] = useState(false)
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [activeResult, setActiveResult] = useState(-1)
  const [popularSearches, setPopularSearches] = useState<string[]>([])
  const [showAll, setShowAll] = useState(false)
  const searchInputRef = useRef<HTMLInputElement | null>(null)
  const searchBoxRef = useRef<HTMLDivElement | null>(null)
  const newsletterScrollTimersRef = useRef<number[]>([])

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

  // Groupe complet (sans limite de prévisualisation) — utilisé quand showAll = true
  const allSuggestionGroups = useMemo(() => {
    const groupedResults = new Map<string, SearchItem[]>()
    for (const item of allSuggestions) {
      const group = groupedResults.get(item.groupLabel) || []
      group.push(item)
      groupedResults.set(item.groupLabel, group)
    }
    return Array.from(groupedResults, ([label, items]) => ({ label, items }))
  }, [allSuggestions])

  // Ce que l'overlay affiche réellement selon l'état "expand"
  const displayedGroups = showAll ? allSuggestionGroups : suggestionGroups
  const displayedItems  = showAll ? allSuggestions      : suggestions

  const discoverLinks = [
    { label: 'Articles', href: '/decouvrir/articles-culture' },
    { label: 'Portraits', href: '/decouvrir/artistes-a-suivre' },
    { label: 'Décryptages', href: '/decouvrir/decryptages' },
    { label: 'Tendances', href: '/decouvrir/tendances' },
  ]

  const navGroups = [
    { label: 'Magazine', directHref: '/decouvrir' },
    { label: 'Écouter', directHref: '/ecouter' },
    { label: 'Sortir', directHref: '/sortir' },
    { label: 'Explorer', directHref: '/explorer' },
    { label: 'Apprendre', directHref: '/apprendre' },
  ]

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)

    window.addEventListener('scroll', onScroll, { passive: true })

    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setShowAll(false) // nouveau mot → retour en mode aperçu
    const timeout = window.setTimeout(() => setDebouncedQuery(query), 120)
    return () => window.clearTimeout(timeout)
  }, [query])

  // Charge les recherches populaires depuis l'API à chaque ouverture de la barre
  useEffect(() => {
    if (!searchOpen) return
    fetch('/api/search-stats')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data?.searches)) setPopularSearches(data.searches)
      })
      .catch(() => {})
  }, [searchOpen])

  useEffect(() => {
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setMobileOpen(false)
        setSearchOpen(true)
      }

      if (event.key === 'Escape') {
        setSearchOpen(false)
        setMobileOpen(false)
        setMobileSubOpen(null)
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
    if (!mobileOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [mobileOpen])

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 1101px)')
    const closeOnDesktop = () => {
      if (desktop.matches) {
        setMobileOpen(false)
        setMobileSubOpen(null)
      }
    }
    desktop.addEventListener('change', closeOnDesktop)
    return () => desktop.removeEventListener('change', closeOnDesktop)
  }, [])

  useEffect(() => {
    const mobileSearch = window.matchMedia('(max-width: 640px)')
    const syncPlaceholder = () => setCompactSearchPlaceholder(mobileSearch.matches)
    syncPlaceholder()
    mobileSearch.addEventListener('change', syncPlaceholder)
    return () => mobileSearch.removeEventListener('change', syncPlaceholder)
  }, [])

  useEffect(() => {
    setSearchOpen(false)
    setMobileOpen(false)
    setMobileSubOpen(null)
  }, [pathname])

  useEffect(() => {
    setActiveResult(-1)
  }, [debouncedQuery])

  useEffect(() => () => {
    newsletterScrollTimersRef.current.forEach((timer) => window.clearTimeout(timer))
  }, [])

  const closeMobileMenu = () => {
    setMobileOpen(false)
    setMobileSubOpen(null)
  }

  const openSearch = () => {
    closeMobileMenu()
    setSearchOpen(true)
  }

  const handleNewsletterClick = (event: MouseEvent<HTMLAnchorElement>) => {
    closeMobileMenu()

    if (sourcePath(pathname) !== '/') return

    const newsletter = document.getElementById('newsletter')
    if (!newsletter) return

    event.preventDefault()

    if (window.location.hash !== '#newsletter') {
      window.history.pushState(null, '', '#newsletter')
    }

    newsletterScrollTimersRef.current.forEach((timer) => window.clearTimeout(timer))
    newsletterScrollTimersRef.current = []

    const alignNewsletter = () => {
      const header = document.querySelector<HTMLElement>('.header')
      if (!header) return

      const headerHeight = header.getBoundingClientRect().height
      const targetTop = window.scrollY + newsletter.getBoundingClientRect().top - headerHeight

      window.scrollTo({
        top: Math.max(0, targetTop),
        behavior: 'smooth',
      })
    }

    window.requestAnimationFrame(alignNewsletter)

    for (const delay of [700, 1600]) {
      newsletterScrollTimersRef.current.push(window.setTimeout(() => {
        const header = document.querySelector<HTMLElement>('.header')
        if (!header) return

        const offset = newsletter.getBoundingClientRect().top - header.getBoundingClientRect().bottom
        if (Math.abs(offset) > 1) alignNewsletter()
      }, delay))
    }
  }

  const closeSearch = () => {
    setSearchOpen(false)
    setQuery('')
    setDebouncedQuery('')
    setActiveResult(-1)
  }

  /** Enregistre une requête côté serveur (fire-and-forget, sans bloquer la nav). */
  const trackSearch = (q: string) => {
    fetch('/api/search-stats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: q }),
    }).catch(() => {})
  }

  const goToSearchResults = () => {
    const trimmedQuery = query.trim()
    if (!trimmedQuery) return
    trackSearch(trimmedQuery)
    // Affiche tous les résultats dans l'overlay — aucune redirection
    setShowAll(true)
  }

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    goToSearchResults()
  }

  const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown' && displayedItems.length > 0) {
      event.preventDefault()
      setActiveResult((current) => (current + 1) % displayedItems.length)
    }

    if (event.key === 'ArrowUp' && displayedItems.length > 0) {
      event.preventDefault()
      setActiveResult((current) => (current <= 0 ? displayedItems.length - 1 : current - 1))
    }

    if (event.key === 'Enter' && activeResult >= 0 && displayedItems[activeResult]) {
      event.preventDefault()
      router.push(displayedItems[activeResult].href)
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
        <Link href={href('/')} className="logo" onClick={closeMobileMenu}>
          <img src="/logo.png" alt="Dance Lab" className="logo-image" />
        </Link>

        <ul className="nav-links">
          {navGroups.map((group) => (
            <li key={group.label}>
              <Link href={href(publicNavigationHref(group.directHref))} className={privateAccessScope(group.directHref) ? availability.available : undefined}>
                {t(group.label)}{privateAccessScope(group.directHref) && <small className={availability.badge}>{t('Bientôt')}</small>}
              </Link>
            </li>
          ))}

          <li>
            <Link href={href('/a-propos')}>{t('À propos')}</Link>
          </li>
        </ul>

        <div className="nav-right">
          <button
            type="button"
            className="nav-icon-btn"
            aria-label={t('Rechercher')}
            aria-haspopup="dialog"
            onClick={openSearch}
          >
            <IconSearch />
          </button>

          <LanguageSwitcher locale={locale} />

          <Link
            href={href('/#newsletter')}
            className="btn btn-primary"
            style={{ padding: '10px 20px', fontSize: '13px' }}
            onClick={handleNewsletterClick}
          >
            Newsletter
          </Link>

          <button
            className="nav-burger"
            type="button"
            aria-label={t('Menu principal mobile')}
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMobileOpen(true)}
          >
            <IconMenu />
          </button>
        </div>
      </nav>

      {mobileOpen ? createPortal(
        <nav id="mobile-navigation" className="mobile-nav open" aria-label={t('Menu principal mobile')}>
          <div className="mobile-nav-shell">
            <div className="mobile-nav-head">
              <Link href={href('/')} className="mobile-nav-logo" onClick={closeMobileMenu}>
                <img src="/logo.png" alt="Dance Lab" />
              </Link>
              <button className="mobile-nav-close" onClick={closeMobileMenu} aria-label={t('Fermer')}>
                <span aria-hidden="true" />
              </button>
            </div>

            <div className="mobile-editorial-cards">
              <Link href={href('/decouvrir')} className="mobile-editorial-card mobile-editorial-card--magazine" onClick={closeMobileMenu}>
                <strong>{t('Magazine')}</strong>
                <span className="mobile-card-copy">{t('Lire, comprendre, découvrir')}</span>
                <span className="mobile-card-arrow"><IconArrow /></span>
              </Link>
              <Link href={href('/ecouter')} className="mobile-editorial-card mobile-editorial-card--listen" onClick={closeMobileMenu}>
                <strong>{t('Écouter')}</strong>
                <span className="mobile-card-copy">{t('Les conversations avec celles et ceux qui font, pensent et transforment la danse.')}</span>
                <span className="mobile-card-arrow"><IconArrow /></span>
              </Link>
            </div>

            <div className="mobile-secondary-nav">
              <Link href={href(publicNavigationHref('/sortir'))} onClick={closeMobileMenu}>
                <span>{t('Sortir')} <small>{t('Bientôt')}</small></span><IconArrow />
              </Link>
              <Link href={href(publicNavigationHref('/explorer'))} onClick={closeMobileMenu}>
                <span>{t('Explorer')} <small>{t('Bientôt')}</small></span><IconArrow />
              </Link>
              <Link href={href(publicNavigationHref('/apprendre'))} onClick={closeMobileMenu}>
                <span>{t('Apprendre')} <small>{t('Bientôt')}</small></span><IconArrow />
              </Link>
              <Link href={href('/a-propos')} onClick={closeMobileMenu}>
                <span>{t('À propos')}</span><IconArrow />
              </Link>
            </div>

            <button type="button" className="mobile-search-bar" onClick={openSearch}>
              <IconSearch />
              <span>{t('Rechercher sur Dance Lab')}</span>
            </button>

            <div className="mobile-newsletter-row">
              <div className="mobile-newsletter-copy">
                <IconEnvelope />
                <span><strong>Newsletter</strong><small>{t('Recevoir nos nouveautés et nos sélections')}</small></span>
              </div>
              <Link href={href('/#newsletter')} className="mobile-newsletter-cta" onClick={handleNewsletterClick}>
                {t("S’inscrire")} <IconArrow />
              </Link>
            </div>

            <div className="mobile-language-row">
              <LanguageSwitcher locale={locale} mobile />
            </div>
          </div>
        </nav>,
        document.body
      ) : null}

      {searchOpen ? createPortal(
        <div
          className="search-overlay open"
          role="dialog"
          aria-modal="true"
          aria-label={t('Recherche sur Dance Lab')}
          onKeyDown={handleDialogKeyDown}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeSearch()
          }}
        >
          <div ref={searchBoxRef} className="search-box">
            <div className="search-mobile-head">
              <Link href={href('/')} className="search-mobile-logo" onClick={closeSearch}>
                <img src="/logo.png" alt="Dance Lab" />
              </Link>
              <button className="search-mobile-close" type="button" onClick={closeSearch} aria-label={t('Fermer la recherche')}>
                <span aria-hidden="true" />
              </button>
            </div>
            <form className="search-row" role="search" onSubmit={submitSearch}>
              <IconSearch />
              <input
                ref={searchInputRef}
                className="search-input"
                type="search"
                value={query}
                placeholder={
                  compactSearchPlaceholder
                    ? (locale === 'en' ? 'Search an episode or artist…' : 'Rechercher un épisode, un artiste…')
                    : t('Rechercher un épisode, un artiste, un style…')
                }
                autoComplete="off"
                aria-label={t('Rechercher dans Dance Lab')}
                aria-autocomplete="list"
                aria-controls="search-suggestions"
                aria-activedescendant={
                  activeResult >= 0 ? `search-result-${displayedItems[activeResult]?.id}` : undefined
                }
                onChange={(event) => {
                  setQuery(event.target.value)
                  setActiveResult(-1)
                }}
                onKeyDown={handleSearchKeyDown}
              />
              <button className="search-submit-btn" type="submit">
                {t('Rechercher')}
              </button>
              <button className="search-close-btn" type="button" onClick={closeSearch} aria-label={t('Fermer la recherche')}>
                ✕
              </button>
            </form>

            {!query.trim() ? (
              <div className="search-popular">
                <p>{locale === 'en' ? 'English search is being prepared. Browse Explore or switch to French for the full catalogue.' : t('Suggestions populaires')}</p>
                <div className="search-chips">
                  {(locale === 'en' ? [] : popularSearches).map((search) => (
                    <button
                      key={search}
                      type="button"
                      className="s-chip"
                      onClick={() => {
                        // Insère le terme dans le champ — les résultats apparaissent
                        // immédiatement dans l'overlay, sans quitter l'interface.
                        setQuery(search)
                        trackSearch(search)
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
                {displayedItems.length > 0 ? (
                  <div
                    id="search-suggestions"
                    className={`search-suggestion-scroll${showAll ? ' search-suggestion-scroll--all' : ''}`}
                    role="listbox"
                  >
                    {displayedGroups.map((group, groupIndex) => (
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
                            const itemIndex = displayedItems.findIndex((s) => s.id === item.id)

                            return (
                              <li key={item.id} role="presentation">
                                <Link
                                  id={`search-result-${item.id}`}
                                  className={`search-suggestion${activeResult === itemIndex ? ' active' : ''}`}
                                  href={href(item.href)}
                                  role="option"
                                  aria-selected={activeResult === itemIndex}
                                  onClick={closeSearch}
                                >
                                  {item.image ? (
                                    <img src={item.image} alt="" style={item.imageObjectPosition ? { objectPosition: item.imageObjectPosition } : undefined} />
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
                                    {item.guest ? <span>{t('Avec')} {item.guest}</span> : <span>{item.summary}</span>}
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
                  <p className="search-empty">{locale === 'en' ? 'English search is not available yet.' : `${t('Aucun résultat trouvé pour')} « ${query.trim()} ».`}</p>
                ) : null}

                {/* Bouton visible seulement quand il reste des résultats non affichés */}
                {hasMoreSuggestions && !showAll ? (
                  <button className="search-all-results" type="button" onClick={goToSearchResults}>
                    {t('Voir tous les résultats')} ({allSuggestions.length})
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
