"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import type { DanceStyle, DanceStyleFamily } from "./styles-data"
import { STYLE_FAMILIES, upcomingStyles } from "./styles-data"

type Props = {
  styles: DanceStyle[]
}

const ALL = "Tous les styles"

export default function StylesExplorer({ styles }: Props) {
  const [search, setSearch] = useState("")
  const [activeFamily, setActiveFamily] = useState<string>(ALL)

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return styles.filter((s) => {
      const matchFamily = activeFamily === ALL || s.family === activeFamily
      const matchSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.aliases?.some((a) => a.toLowerCase().includes(q)) ||
        s.keywords.some((k) => k.toLowerCase().includes(q)) ||
        s.originCity.toLowerCase().includes(q) ||
        s.originCountry.toLowerCase().includes(q) ||
        s.family.toLowerCase().includes(q) ||
        s.summary.toLowerCase().includes(q)
      return matchFamily && matchSearch
    })
  }, [styles, search, activeFamily])

  const families = useMemo(() => {
    const present = Array.from(new Set(styles.map((s) => s.family)))
    return [ALL, ...STYLE_FAMILIES.filter((f) => present.includes(f as DanceStyleFamily))]
  }, [styles])

  return (
    <div className="styles-explorer">
      {/* ── Barre de recherche ─────────────────────── */}
      <div className="styles-search-wrap">
        <div className="styles-search-field">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un style, une époque, un pays, un mot-clé…"
            aria-label="Rechercher un style de danse"
          />
          {search && (
            <button type="button" onClick={() => setSearch("")} aria-label="Effacer">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* ── Filtres familles ───────────────────────── */}
      <div className="styles-filters" role="group" aria-label="Filtrer par famille">
        {families.map((family) => (
          <button
            key={family}
            type="button"
            className={`styles-filter-pill${activeFamily === family ? " is-active" : ""}`}
            onClick={() => setActiveFamily(family)}
          >
            {family}
          </button>
        ))}
      </div>

      {/* ── Résultats ─────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="styles-empty">
          <p>Aucun style ne correspond à cette recherche.</p>
          <button type="button" onClick={() => { setSearch(""); setActiveFamily(ALL) }}>
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        <div className="styles-grid">
          {filtered.map((style) => (
            <Link
              key={style.slug}
              href={`/explorer/styles-de-danse/${style.slug}`}
              className="style-card"
            >
              {style.image ? (
                <div className="style-card-img">
                  <img src={style.image} alt={style.name} />
                </div>
              ) : (
                <div className="style-card-img style-card-img--placeholder">
                  <span>{style.name.slice(0, 2).toUpperCase()}</span>
                </div>
              )}
              <div className="style-card-body">
                <span className="style-card-family">{style.family}</span>
                <h3>{style.name}</h3>
                {style.aliases && style.aliases.length > 0 && (
                  <p className="style-card-aliases">{style.aliases.join(" · ")}</p>
                )}
                <p className="style-card-era">
                  <span>{style.originCity}</span>
                  <span>{style.era}</span>
                </p>
                <p className="style-card-summary">{style.summary.slice(0, 120)}…</p>
                <span className="style-card-cta">Explorer →</span>
              </div>
            </Link>
          ))}

          {/* Styles à venir (coming soon) — si filtre = Tous */}
          {activeFamily === ALL && !search && upcomingStyles
            .filter((u) => !styles.find((s) => s.slug === u.slug))
            .map((u) => (
              <div key={u.slug} className="style-card style-card--soon">
                <div className="style-card-img style-card-img--placeholder">
                  <span>{u.name.slice(0, 2).toUpperCase()}</span>
                </div>
                <div className="style-card-body">
                  <span className="style-card-family">{u.family}</span>
                  <h3>{u.name}</h3>
                  <p className="style-card-era"><span>En cours de rédaction</span></p>
                  <span className="style-card-soon-badge">Bientôt disponible</span>
                </div>
              </div>
            ))
          }
        </div>
      )}
    </div>
  )
}
