'use client'

import { useDeferredValue, useEffect, useId, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { normalizeSearchText } from '@/data/search'

export type AutocompleteItem = {
  id: string
  label: string
  href: string
  typeLabel?: string
  secondary?: string
  searchText?: string
  keywords?: string[]
}

type Props = {
  items: AutocompleteItem[]
  value?: string
  onValueChange?: (value: string) => void
  placeholder: string
  ariaLabel: string
  suggestionsLabel?: string
  minCharacters?: number
  maxResults?: number
  className?: string
  inputClassName?: string
  style?: React.CSSProperties
}

function score(item: AutocompleteItem, query: string) {
  const label = normalizeSearchText(item.label)
  const secondary = normalizeSearchText(item.secondary ?? '')
  const searchable = normalizeSearchText([item.searchText, ...(item.keywords ?? [])].filter(Boolean).join(' '))
  const tokens = query.split(' ').filter(Boolean)
  let value = 0

  if (label === query) value += 180
  else if (label.startsWith(query)) value += 130
  else if (label.split(' ').some((word) => word.startsWith(query))) value += 105
  else if (label.includes(query)) value += 80
  if (secondary.startsWith(query)) value += 45
  else if (secondary.includes(query)) value += 28
  if (searchable.includes(query)) value += 24

  let matches = 0
  for (const token of tokens) {
    const words = `${label} ${secondary} ${searchable}`.split(' ')
    if (words.some((word) => word.startsWith(token))) { value += 18; matches += 1 }
    else if (`${label} ${secondary} ${searchable}`.includes(token)) { value += 7; matches += 1 }
  }
  return matches === tokens.length ? value : 0
}

/**
 * Autocomplétion partagée Dance Lab.
 * La rubrique fournit seulement ses données et leurs URLs ; aucune suggestion
 * métier, style, épisode ou article n'est codée en dur dans ce composant.
 */
export default function SearchAutocomplete({
  items,
  value,
  onValueChange,
  placeholder,
  ariaLabel,
  suggestionsLabel = 'Suggestions',
  minCharacters = 1,
  maxResults = 8,
  className = '',
  inputClassName = '',
  style,
}: Props) {
  const router = useRouter()
  const listId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const [internalValue, setInternalValue] = useState(value ?? '')
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const query = value ?? internalValue
  const deferredQuery = useDeferredValue(query)
  const normalizedQuery = normalizeSearchText(deferredQuery)

  useEffect(() => {
    if (value !== undefined) setInternalValue(value)
  }, [value])

  const results = useMemo(() => {
    if (normalizedQuery.length < minCharacters) return []
    return items
      .map((item) => ({ item, score: score(item, normalizedQuery) }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score || a.item.label.localeCompare(b.item.label, 'fr', { sensitivity: 'base' }))
      .slice(0, maxResults)
      .map((entry) => entry.item)
  }, [items, maxResults, minCharacters, normalizedQuery])

  useEffect(() => {
    const close = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false)
        setActiveIndex(-1)
      }
    }
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [])

  useEffect(() => {
    if (activeIndex < 0) return
    document.getElementById(`${listId}-option-${activeIndex}`)?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex, listId])

  const update = (nextValue: string) => {
    setInternalValue(nextValue)
    onValueChange?.(nextValue)
    setActiveIndex(-1)
    setOpen(true)
  }
  const navigate = (item: AutocompleteItem) => {
    setOpen(false)
    setActiveIndex(-1)
    router.push(item.href)
  }
  const showSuggestions = open && normalizedQuery.length >= minCharacters

  return <div ref={rootRef} className={`search-autocomplete ${className}`.trim()} style={style}>
    <svg className="el-search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7.5" /><line x1="18.5" y1="18.5" x2="22" y2="22" /></svg>
    <input
      ref={inputRef}
      className={inputClassName}
      type="search"
      role="combobox"
      value={query}
      placeholder={placeholder}
      aria-label={ariaLabel}
      aria-autocomplete="list"
      aria-expanded={showSuggestions}
      aria-controls={listId}
      aria-activedescendant={activeIndex >= 0 ? `${listId}-option-${activeIndex}` : undefined}
      autoComplete="off"
      spellCheck={false}
      onChange={(event) => update(event.target.value)}
      onFocus={() => { if (normalizeSearchText(query).length >= minCharacters) setOpen(true) }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') { setOpen(false); setActiveIndex(-1); return }
        if (!showSuggestions) return
        if (event.key === 'ArrowDown') { event.preventDefault(); setActiveIndex((index) => Math.min(index + 1, results.length - 1)) }
        else if (event.key === 'ArrowUp') { event.preventDefault(); setActiveIndex((index) => Math.max(index - 1, -1)) }
        else if (event.key === 'Enter' && results.length) { event.preventDefault(); navigate(results[Math.max(activeIndex, 0)]) }
      }}
    />
    {query && <button className="el-search-clear" type="button" onClick={() => { update(''); setOpen(false); inputRef.current?.focus() }} aria-label="Effacer la recherche"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg></button>}

    {showSuggestions && <ul id={listId} className="search-autocomplete-list" role="listbox" aria-label={suggestionsLabel}>
      {results.length ? results.map((item, index) => <li
        key={item.id}
        id={`${listId}-option-${index}`}
        role="option"
        aria-selected={index === activeIndex}
        className={index === activeIndex ? 'is-active' : ''}
        onMouseEnter={() => setActiveIndex(index)}
        onPointerDown={(event) => { event.preventDefault(); navigate(item) }}
      >
        <span><strong>{item.label}</strong>{item.secondary && <small>{item.secondary}</small>}</span>
        {item.typeLabel && <em>{item.typeLabel}</em>}
        <span className="search-autocomplete-arrow" aria-hidden="true">→</span>
      </li>) : <li className="search-autocomplete-empty" aria-disabled="true">Aucune suggestion</li>}
    </ul>}
  </div>
}
