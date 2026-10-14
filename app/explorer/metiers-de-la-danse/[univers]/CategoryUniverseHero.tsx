'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import SearchAutocomplete, { type AutocompleteItem } from '@/components/SearchAutocomplete'

type CategoryProfession = {
  id: string
  nom: string
  description: string
  href: string
}

type Props = {
  label: string
  description: string
  count: number
  professions: CategoryProfession[]
}

export default function CategoryUniverseHero({ label, description, count, professions }: Props) {
  const heroRef = useRef<HTMLElement>(null)
  const [query, setQuery] = useState('')

  useEffect(() => {
    const timer = window.setTimeout(() => heroRef.current?.classList.add('el-hero--ready'), 40)
    return () => window.clearTimeout(timer)
  }, [])

  const autocompleteItems = useMemo<AutocompleteItem[]>(() => professions.map((profession) => ({
    id: profession.id,
    label: profession.nom,
    secondary: label,
    typeLabel: 'Métier',
    href: profession.href,
    searchText: profession.description,
    keywords: [label],
  })), [label, professions])

  return (
    <section
      ref={heroRef}
      className="met-hero met-category-hero"
      aria-label={`Métiers de la catégorie ${label}`}
    >
      <div className="el-hero-fade" aria-hidden="true" />

      <div className="el-hero-left met-hero-left met-category-hero-left">
        <nav
          className="el-kicker el-anim met-category-breadcrumb"
          style={{ '--el-delay': '0ms' } as React.CSSProperties}
          aria-label="Fil d'Ariane"
        >
          <Link href="/explorer/metiers-de-la-danse">Explorer · Métiers de la danse</Link>
          <span aria-hidden="true">·</span>
          <span aria-current="page">{label}</span>
        </nav>

        <h1
          className="el-hero-title el-anim met-category-title"
          style={{ '--el-delay': '70ms' } as React.CSSProperties}
        >
          {label}
        </h1>

        <div
          className="el-stats el-anim"
          style={{ '--el-delay': '140ms' } as React.CSSProperties}
        >
          <div className="el-stat">
            <strong>{count}</strong>
            <span>métiers à explorer</span>
          </div>
        </div>

        <p
          className="el-hero-desc el-anim met-category-description"
          style={{ '--el-delay': '200ms' } as React.CSSProperties}
        >
          {description}
        </p>

        <SearchAutocomplete
          className="el-search-wrap met-search-autocomplete el-anim"
          style={{ '--el-delay': '260ms' } as React.CSSProperties}
          items={autocompleteItems}
          value={query}
          onValueChange={setQuery}
          inputClassName="el-search"
          placeholder={`Rechercher un métier dans ${label}…`}
          ariaLabel={`Rechercher un métier dans ${label}`}
          suggestionsLabel={`Suggestions de métiers dans ${label}`}
          minCharacters={1}
          maxResults={8}
          sortAlphabetically
        />
      </div>
    </section>
  )
}
