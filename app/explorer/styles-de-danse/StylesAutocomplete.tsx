"use client"

import { useEffect, useId, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import type { DanceStyle } from "./styles-data"
import { normalizeSearchText } from "../../../data/search"

// ── Types ──────────────────────────────────────────────────────────────────

type MatchType = "name" | "alias" | "family" | "location" | "era"

type ResultItem = {
  slug: string
  name: string
  matchType: MatchType
  matchLabel: string
  score: number
}

type Props = {
  styles: DanceStyle[]
}

// ── Constants ──────────────────────────────────────────────────────────────

const HINTS = ["Break", "Waacking", "Années 1970", "États-Unis", "Danses urbaines"]

const MATCH_ICONS: Record<MatchType, string> = {
  name:     "💃",
  alias:    "↪",
  family:   "✦",
  location: "📍",
  era:      "🕐",
}

const MATCH_LABELS: Record<MatchType, string> = {
  name:     "Style",
  alias:    "Synonyme",
  family:   "Catégorie",
  location: "Origine",
  era:      "Époque",
}

// ── Score helpers ──────────────────────────────────────────────────────────

function scoreNorm(haystack: string, needle: string): number {
  if (haystack === needle)           return 150
  if (haystack.startsWith(needle))   return 110
  if (haystack.includes(needle))     return 75
  const words = haystack.split(" ")
  if (words.some((w) => w.startsWith(needle))) return 55
  return 0
}

// ── Component ──────────────────────────────────────────────────────────────

export default function StylesAutocomplete({ styles }: Props) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const [activeIdx, setActiveIdx] = useState(-1)

  const inputRef = useRef<HTMLInputElement>(null)
  const wrapRef  = useRef<HTMLDivElement>(null)
  const listId   = useId()

  // ── Build results ────────────────────────────────────────────────────────

  const results = useMemo<ResultItem[]>(() => {
    const norm = normalizeSearchText(query)
    if (!norm) return []

    const seen  = new Set<string>()
    const items: ResultItem[] = []

    for (const style of styles) {
      const nameNorm = normalizeSearchText(style.name)

      // 1. Name
      const nameScore = scoreNorm(nameNorm, norm)
      if (nameScore > 0 && !seen.has(style.slug)) {
        seen.add(style.slug)
        items.push({ slug: style.slug, name: style.name, matchType: "name", matchLabel: style.family, score: nameScore })
        continue
      }

      // 2. Aliases
      let aliasMatched = false
      for (const alias of style.aliases ?? []) {
        const aliasNorm  = normalizeSearchText(alias)
        const aliasScore = scoreNorm(aliasNorm, norm)
        if (aliasScore > 0 && !seen.has(style.slug)) {
          seen.add(style.slug)
          items.push({ slug: style.slug, name: style.name, matchType: "alias", matchLabel: `« ${alias} »`, score: aliasScore - 10 })
          aliasMatched = true
          break
        }
      }
      if (aliasMatched) continue

      // 3. Keywords
      const kwMatched = (style.keywords ?? []).some((kw) => {
        const kwNorm = normalizeSearchText(kw)
        return kwNorm.startsWith(norm) || kwNorm.includes(norm)
      })
      if (kwMatched && !seen.has(style.slug)) {
        seen.add(style.slug)
        items.push({ slug: style.slug, name: style.name, matchType: "name", matchLabel: style.family, score: 40 })
        continue
      }

      // 4. Family
      const familyNorm  = normalizeSearchText(style.family)
      const familyScore = scoreNorm(familyNorm, norm)
      if (familyScore > 0 && !seen.has(style.slug)) {
        seen.add(style.slug)
        items.push({ slug: style.slug, name: style.name, matchType: "family", matchLabel: style.family, score: 35 })
        continue
      }

      // 5. Location (city + country)
      const locNorm  = normalizeSearchText(`${style.originCity} ${style.originCountry}`)
      const locScore = scoreNorm(locNorm, norm)
      if (locScore > 0 && !seen.has(style.slug)) {
        seen.add(style.slug)
        const place = [style.originCity, style.originCountry].filter(Boolean).join(", ")
        items.push({ slug: style.slug, name: style.name, matchType: "location", matchLabel: place, score: 30 })
        continue
      }

      // 6. Era
      const eraNorm  = normalizeSearchText(style.era)
      const eraScore = scoreNorm(eraNorm, norm)
      if (eraScore > 0 && !seen.has(style.slug)) {
        seen.add(style.slug)
        items.push({ slug: style.slug, name: style.name, matchType: "era", matchLabel: style.era, score: 25 })
      }
    }

    return items
      .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name, "fr", { sensitivity: "base" }))
      .slice(0, 8)
  }, [query, styles])

  // ── Keyboard navigation ──────────────────────────────────────────────────

  function navigate(item: ResultItem) {
    setQuery("")
    setOpen(false)
    setActiveIdx(-1)
    router.push(`/explorer/styles-de-danse/${item.slug}`)
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open) return

    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActiveIdx((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActiveIdx((i) => Math.max(i - 1, -1))
    } else if (e.key === "Enter") {
      e.preventDefault()
      if (activeIdx >= 0 && results[activeIdx]) {
        navigate(results[activeIdx])
      } else if (results.length > 0) {
        navigate(results[0])
      }
    } else if (e.key === "Escape") {
      setOpen(false)
      setActiveIdx(-1)
      inputRef.current?.blur()
    }
  }

  // ── Sync active item into view ───────────────────────────────────────────

  useEffect(() => {
    if (activeIdx < 0) return
    const el = document.getElementById(`${listId}-item-${activeIdx}`)
    el?.scrollIntoView({ block: "nearest" })
  }, [activeIdx, listId])

  // ── Click outside closes ─────────────────────────────────────────────────

  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false)
        setActiveIdx(-1)
      }
    }
    document.addEventListener("pointerdown", onPointerDown)
    return () => document.removeEventListener("pointerdown", onPointerDown)
  }, [])

  const showDropdown = open && query.trim().length > 0

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="sac-wrap" ref={wrapRef}>
      {/* Input field — replaces the static field, keeps same CSS */}
      <div className={`styles-search-field sac-field${showDropdown ? " sac-field--open" : ""}`}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>

        <input
          ref={inputRef}
          type="search"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={showDropdown}
          aria-controls={listId}
          aria-activedescendant={activeIdx >= 0 ? `${listId}-item-${activeIdx}` : undefined}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
            setActiveIdx(-1)
          }}
          onFocus={() => { if (query.trim()) setOpen(true) }}
          onKeyDown={onKeyDown}
          placeholder="Rechercher un style, une époque, un pays…"
          aria-label="Rechercher un style de danse"
          autoComplete="off"
          spellCheck={false}
        />

        {query && (
          <button
            type="button"
            className="sac-clear"
            aria-label="Effacer la recherche"
            onClick={() => {
              setQuery("")
              setOpen(false)
              setActiveIdx(-1)
              inputRef.current?.focus()
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </button>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <ul
          id={listId}
          role="listbox"
          aria-label="Suggestions de styles de danse"
          className={`sac-dropdown${showDropdown ? " sac-open" : ""}`}
        >
          {results.length > 0 ? (
            results.map((item, i) => (
              <li
                key={item.slug}
                id={`${listId}-item-${i}`}
                role="option"
                aria-selected={i === activeIdx}
                className={`sac-item${i === activeIdx ? " sac-item--active" : ""}`}
                onPointerDown={(e) => {
                  e.preventDefault() // don't blur input
                  navigate(item)
                }}
                onMouseEnter={() => setActiveIdx(i)}
              >
                <span className="sac-item-icon" aria-hidden="true">
                  {MATCH_ICONS[item.matchType]}
                </span>
                <span className="sac-item-body">
                  <span className="sac-item-name">{item.name}</span>
                  <span className="sac-item-meta">{item.matchLabel}</span>
                </span>
                <span className="sac-item-badge">{MATCH_LABELS[item.matchType]}</span>
                <span className="sac-item-arrow" aria-hidden="true">→</span>
              </li>
            ))
          ) : (
            <li className="sac-empty" role="option" aria-selected={false}>
              <span className="sac-empty-icon" aria-hidden="true">🔍</span>
              <span className="sac-empty-body">
                <strong>Aucun résultat pour « {query} »</strong>
                <span>Essayez&nbsp;: {HINTS.map((h, i) => (
                  <button
                    key={h}
                    type="button"
                    className="sac-hint"
                    onPointerDown={(e) => {
                      e.preventDefault()
                      setQuery(h)
                      setOpen(true)
                      setActiveIdx(-1)
                      inputRef.current?.focus()
                    }}
                  >{h}{i < HINTS.length - 1 ? ", " : ""}</button>
                ))}</span>
              </span>
            </li>
          )}
        </ul>
      )}
    </div>
  )
}
