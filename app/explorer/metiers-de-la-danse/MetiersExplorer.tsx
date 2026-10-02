'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { metiers, UNIVERS, UNIVERS_ORDER, TOTAL_METIERS } from './metiers-data'
import SearchAutocomplete, { type AutocompleteItem } from '@/components/SearchAutocomplete'

const MAX_VISIBLE_TAGS = 3

const normalize = (v: string) =>
  v.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[./–—-]/g, ' ')

export default function MetiersExplorer() {
  const heroRef    = useRef<HTMLElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  const [query, setQuery] = useState('')

  /* Animation d'entrée — même logique que EcouterClient */
  useEffect(() => {
    const t = setTimeout(() => heroRef.current?.classList.add('el-hero--ready'), 40)
    return () => clearTimeout(t)
  }, [])

  /* Résultats de recherche — uniquement pour la barre de recherche */
  const filteredMetiers = useMemo(() => {
    const needle = normalize(query.trim())
    if (!needle) return []
    return metiers.filter((m) => {
      const u = UNIVERS[m.univers]
      return normalize(`${m.nom} ${m.description} ${u.label} ${u.description}`).includes(needle)
    })
  }, [query])

  const showResults = !!query.trim()

  const autocompleteItems = useMemo<AutocompleteItem[]>(() => metiers.map((metier) => {
    const universe = UNIVERS[metier.univers]
    return {
      id:         metier.id,
      label:      metier.nom,
      secondary:  universe.label,
      typeLabel:  'Métier',
      href:       `/explorer/metiers-de-la-danse/${universe.slug}/${metier.id}`,
      searchText: `${metier.description} ${universe.description}`,
      keywords:   [universe.label],
    }
  }), [])

  return (
    <div id="metiers-portal" className="met-portal">

      {/* ════════════════════════════════════════════════════════════════
          HERO — même structure qu'Écouter :
          image de fond CSS, voile dégradé, contenu gauche animé
      ════════════════════════════════════════════════════════════════ */}
      <section
        className="met-hero"
        ref={heroRef}
        aria-label="Explorer les métiers de la danse"
      >
        {/* Voile dégradé — copie de .el-hero-fade */}
        <div className="el-hero-fade" aria-hidden="true" />

        {/* Contenu — classe el-hero-left partagée + met-hero-left override */}
        <div className="el-hero-left met-hero-left">

          <span
            className="el-kicker el-anim"
            style={{ '--el-delay': '0ms' } as React.CSSProperties}
          >
            Explorer · Métiers de la danse
          </span>

          <h1
            className="el-hero-title el-anim"
            style={{ '--el-delay': '70ms' } as React.CSSProperties}
          >
            Les métiers qui font<br />
            exister <em>la danse.</em>
          </h1>

          {/* Compteur dynamique */}
          <div
            className="el-stats el-anim"
            style={{ '--el-delay': '140ms' } as React.CSSProperties}
          >
            <div className="el-stat">
              <strong>{TOTAL_METIERS}+</strong>
              <span>métiers à explorer</span>
            </div>
          </div>

          <p
            className="el-hero-desc el-anim"
            style={{ '--el-delay': '200ms' } as React.CSSProperties}
          >
            Danser n&apos;est qu&apos;une partie de l&apos;écosystème. Derrière
            chaque représentation, il y a celles et ceux qui créent, produisent,
            transmettent, accompagnent et rendent la danse visible.
          </p>

          {/* Barre de recherche — même composant visuel qu'Écouter */}
          <SearchAutocomplete
            className="el-search-wrap met-search-autocomplete el-anim"
            style={{ '--el-delay': '260ms' } as React.CSSProperties}
            items={autocompleteItems}
            value={query}
            onValueChange={setQuery}
            inputClassName="el-search"
            placeholder="Rechercher un métier, une fonction, un secteur…"
            ariaLabel="Rechercher un métier"
            suggestionsLabel="Suggestions de métiers"
            minCharacters={1}
            maxResults={8}
          />

          {/* Tags univers — navigation directe vers les pages catégories */}
          <div
            className="el-tags met-hero-universe-filters el-anim"
            style={{ '--el-delay': '310ms' } as React.CSSProperties}
            aria-label="Naviguer par univers"
          >
            <Link
              href="/explorer/metiers-de-la-danse"
              className="el-tag el-tag--active"
            >
              Tous
            </Link>
            {UNIVERS_ORDER.map((uid) => (
              <Link
                key={uid}
                href={`/explorer/metiers-de-la-danse/${UNIVERS[uid].slug}`}
                className="el-tag"
              >
                {UNIVERS[uid].label}
              </Link>
            ))}
          </div>

        </div>
      </section>

      {/* Transition douce hero → grille — copie de .el-hero-transition */}
      <div className="el-hero-transition met-hero-transition" aria-hidden="true" />

      {/* ════════════════════════════════════════════════════════════════
          6 UNIVERS — portail de navigation
      ════════════════════════════════════════════════════════════════ */}
      <section
        id="met-universe-section"
        className="met-universe-portal"
        aria-labelledby="met-universe-title"
      >
        <div className="container">
          <span className="met-section-kicker" data-reveal>6 univers</span>
          <h2 id="met-universe-title" className="met-portal-title" data-reveal="delay-1">
            Quel métier vous intéresse&nbsp;?
          </h2>
          <div className="met-universe-grid">
            {UNIVERS_ORDER.map((universeId, idx) => {
              const universe = UNIVERS[universeId]
              const items    = metiers.filter((m) => m.univers === universeId)
              const visible  = items.slice(0, MAX_VISIBLE_TAGS)
              const overflow = items.length - MAX_VISIBLE_TAGS
              // Stagger léger : 0 → 80ms → 160ms par colonne, redémarre à chaque rangée
              const cardDelay = (['', 'delay-1', 'delay-2'] as const)[idx % 3]
              return (
                <Link
                  key={universeId}
                  href={`/explorer/metiers-de-la-danse/${universe.slug}`}
                  className="met-universe-card"
                  data-reveal={cardDelay}
                  aria-label={`Explorer l'univers ${universe.label} — ${items.length} métiers`}
                >
                  <span className="met-universe-card-num">{universe.num}</span>
                  <span className="met-universe-card-main">
                    <strong>{universe.label}</strong>
                    <span className="met-universe-card-desc">{universe.description}</span>
                  </span>
                  <span className="met-universe-card-examples" aria-hidden="true">
                    {visible.map((m) => (
                      <span key={m.id} className="met-universe-card-tag">{m.nom}</span>
                    ))}
                    {overflow > 0 && (
                      <span className="met-universe-card-tag met-universe-card-tag--more">
                        +{overflow} métier{overflow > 1 ? 's' : ''}
                      </span>
                    )}
                  </span>
                  <span className="met-universe-card-foot">
                    <span>{items.length} métier{items.length > 1 ? 's' : ''}</span>
                    <span className="met-universe-card-arrow" aria-hidden="true">→</span>
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          RÉSULTATS RECHERCHE — visibles uniquement lors d'une saisie
      ════════════════════════════════════════════════════════════════ */}
      {showResults && (
        <div
          ref={resultsRef}
          className="met-results met-results--inline"
          aria-live="polite"
        >
          {filteredMetiers.length === 0 ? (
            <section className="met-empty">
              <div className="container">
                <span className="met-section-kicker">0 résultat</span>
                <h2>Aucun métier ne correspond à votre recherche.</h2>
                <button
                  type="button"
                  onClick={() => setQuery('')}
                >
                  Voir tous les métiers →
                </button>
              </div>
            </section>
          ) : (
            UNIVERS_ORDER.map((universeId) => {
              const universe = UNIVERS[universeId]
              const items    = filteredMetiers.filter((m) => m.univers === universeId)
              if (!items.length) return null
              return (
                <section
                  key={universeId}
                  id={`univers-${universeId}`}
                  className="met-univers"
                >
                  <div className="container">
                    <header className="met-univers-header">
                      <div className="met-univers-meta">
                        <span className="met-univers-num">{universe.num}</span>
                        <span className="met-univers-count">
                          {items.length} métier{items.length > 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="met-univers-title-wrap">
                        <h2 className="met-univers-title">{universe.label}</h2>
                        <p className="met-univers-desc">{universe.description}</p>
                      </div>
                      <div className="met-univers-rule" aria-hidden="true" />
                    </header>
                    <div className="met-grid">
                      {items.map((metier) => (
                        <article
                          key={metier.id}
                          className={`met-card${metier.featured ? ' met-card--featured' : ''}`}
                        >
                          <div className="met-card-accent" aria-hidden="true" />
                          <div className="met-card-body">
                            <span className="met-card-univers">{universe.label}</span>
                            <h3 className="met-card-title">{metier.nom}</h3>
                            <p className="met-card-desc">{metier.description}</p>
                          </div>
                          <div className="met-card-foot">
                            <Link
                              href={`/explorer/metiers-de-la-danse/${universe.slug}`}
                              className="met-card-cta"
                            >
                              Voir l&apos;univers {universe.label} →
                            </Link>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                </section>
              )
            })
          )}
        </div>
      )}

    </div>
  )
}
