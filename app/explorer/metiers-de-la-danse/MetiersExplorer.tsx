'use client'

import Link from 'next/link'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { metiers, UNIVERS, UNIVERS_ORDER, TOTAL_METIERS, getMetiersByUnivers, sortMetiersAlphabetically, type Metier } from './metiers-data'
import SearchAutocomplete, { type AutocompleteItem } from '@/components/SearchAutocomplete'
import { normalizeSearchText as normalize } from '@/data/search'

const MAX_VISIBLE_TAGS = 6

function RotatingMetierTags({
  items,
  universeSlug,
  cardIndex,
}: {
  items: Metier[]
  universeSlug: string
  cardIndex: number
}) {
  // Maximum slots we'll ever attempt to show (real tags + potential "+X" pill = 1 slot).
  const initialBudget = Math.min(MAX_VISIBLE_TAGS, items.length)
  const tagsRef = useRef<HTMLSpanElement>(null)

  // slotBudget = total pill count budget (real tags + the "+X" pill if needed).
  // The layout effect shrinks it until everything fits within the fixed 67 px zone.
  const [slotBudget, setSlotBudget] = useState(initialBudget)

  // Derived values — recalculated on every render.
  // hasMore is true when items can't all fit in slotBudget slots even without a "+X" pill,
  // meaning we reserve 1 slot for "+X" and fill the rest with real métier tags.
  const hasMore   = items.length > slotBudget
  const realSlots = hasMore ? Math.max(1, slotBudget - 1) : Math.min(slotBudget, items.length)
  const overflowCount = items.length - realSlots

  // Indices into items[] currently occupying each real slot.
  const [visibleIndices, setVisibleIndices] = useState(() =>
    Array.from({ length: initialBudget }, (_, i) => i),
  )
  const [fadingSlot, setFadingSlot]   = useState<number | null>(null)
  const rotationStepRef               = useRef(0)

  /* ── Overflow guard ──────────────────────────────────────────────────────
     After each render, check whether the pills overflow the fixed 67 px zone.
     If so, reduce the budget by 1 and re-render. Converges in at most
     MAX_VISIBLE_TAGS iterations. The "+X" pill is included in the budget,
     so the measurement accounts for its width/height. */
  useLayoutEffect(() => {
    const el = tagsRef.current
    if (!el || slotBudget <= 1) return
    if (el.scrollHeight > el.clientHeight + 1) {
      setSlotBudget((b) => Math.max(1, b - 1))
    }
  }, [slotBudget, visibleIndices])

  /* ── Reset budget on container resize (e.g. viewport width change) ───── */
  useEffect(() => {
    const el = tagsRef.current
    if (!el || typeof ResizeObserver === 'undefined') return
    let prevWidth = el.clientWidth
    const ro = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width
      if (Math.abs(w - prevWidth) < 1) return
      prevWidth = w
      setSlotBudget(initialBudget)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [initialBudget])

  /* ── Tag rotation ────────────────────────────────────────────────────── */
  useEffect(() => {
    if (
      items.length <= realSlots ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) return

    let replaceTimer: ReturnType<typeof setTimeout> | undefined
    let interval:     ReturnType<typeof setInterval> | undefined

    const replaceOneTag = () => {
      const step      = rotationStepRef.current
      const slot      = step % realSlots
      const nextIndex = (initialBudget + step) % items.length
      setFadingSlot(slot)
      replaceTimer = setTimeout(() => {
        setVisibleIndices((curr) =>
          curr.map((v, i) => (i === slot ? nextIndex : v)),
        )
        // After a swap the incoming label might be shorter → try full budget again.
        setSlotBudget(initialBudget)
        setFadingSlot(null)
        rotationStepRef.current = step + 1
      }, 550)
    }

    const initialTimer = setTimeout(() => {
      replaceOneTag()
      interval = setInterval(replaceOneTag, 3200 + cardIndex * 400)
    }, 800 + cardIndex * 500)

    return () => {
      clearTimeout(initialTimer)
      if (replaceTimer) clearTimeout(replaceTimer)
      if (interval) clearInterval(interval)
    }
  }, [cardIndex, items.length, realSlots, initialBudget])

  return (
    <span ref={tagsRef} className="met-universe-card-examples" aria-label="Métiers de cet univers">
      {visibleIndices.slice(0, realSlots).map((itemIndex, slot) => {
        const metier = items[itemIndex] ?? items[0]
        return (
          <Link
            key={slot}
            href={`/explorer/metiers-de-la-danse/${universeSlug}/${metier.id}`}
            className={`met-universe-card-tag${fadingSlot === slot ? ' is-changing' : ''}`}
          >
            {metier.nom}
          </Link>
        )
      })}
      {hasMore && (
        <Link
          href={`/explorer/metiers-de-la-danse/${universeSlug}`}
          className="met-universe-card-tag met-universe-card-tag--more"
        >
          +{overflowCount} métier{overflowCount > 1 ? 's' : ''}
        </Link>
      )}
    </span>
  )
}

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
    return sortMetiersAlphabetically(metiers.filter((m) => {
      const u = UNIVERS[m.univers]
      return normalize(`${m.nom} ${m.description} ${u.label} ${u.description}`).includes(needle)
    }))
  }, [query])

  const showResults = !!query.trim()

  const autocompleteItems = useMemo<AutocompleteItem[]>(() => sortMetiersAlphabetically(metiers).map((metier) => {
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
            sortAlphabetically
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
              const items    = getMetiersByUnivers(universeId)
              const representative = items.find((metier) => metier.featured) ?? items[0]
              // Stagger léger : 0 → 80ms → 160ms par colonne, redémarre à chaque rangée
              const cardDelay = (['', 'delay-1', 'delay-2'] as const)[idx % 3]
              return (
                <article
                  key={universeId}
                  className="met-universe-card"
                  data-reveal={cardDelay}
                >
                  <Link
                    href={`/explorer/metiers-de-la-danse/${universe.slug}/${representative.id}`}
                    className="met-universe-card-hit"
                    aria-label={`Découvrir ${representative.nom}, métier représentatif de l'univers ${universe.label}`}
                  />
                  <span className="met-universe-card-num">{universe.num}</span>
                  <span className="met-universe-card-main">
                    <strong>{universe.label}</strong>
                    <span className="met-universe-card-desc">{universe.description}</span>
                  </span>
                  <RotatingMetierTags
                    items={items}
                    universeSlug={universe.slug}
                    cardIndex={idx}
                  />
                  <span className="met-universe-card-foot">
                    <span>{items.length} métier{items.length > 1 ? 's' : ''}</span>
                    <span className="met-universe-card-arrow" aria-hidden="true">→</span>
                  </span>
                </article>
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
