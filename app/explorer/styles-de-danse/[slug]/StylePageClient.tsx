"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import type { DanceStyle } from "../styles-data"
import type { LinkedEpisode } from "./page"

type Props = {
  style: DanceStyle
  linkedEpisodes: LinkedEpisode[]
  relatedStylesData: DanceStyle[]
}

const SECTIONS = [
  { id: "introduction", label: "Introduction" },
  { id: "origines", label: "Origines & contextes" },
  { id: "chronologie", label: "Chronologie" },
  { id: "caracteristiques", label: "Caractéristiques" },
  { id: "musiques", label: "Musiques" },
  { id: "personnalites", label: "Personnalités" },
  { id: "france", label: "En France" },
  { id: "confusions", label: "Confusions fréquentes" },
  { id: "ressources", label: "Pour aller plus loin" },
  { id: "ecouter", label: "À écouter" },
]

export default function StylePageClient({ style, linkedEpisodes, relatedStylesData }: Props) {
  const [activeSection, setActiveSection] = useState("introduction")
  const [tocOpen, setTocOpen] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)

  // Intersection observer pour mettre en évidence la section active
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
            break
          }
        }
      },
      { rootMargin: "-20% 0px -70% 0px" }
    )

    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observerRef.current?.observe(el)
    })

    return () => observerRef.current?.disconnect()
  }, [])

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })
    setTocOpen(false)
  }

  const visibleSections = SECTIONS.filter(({ id }) => {
    if (id === "confusions" && (!style.commonConfusions || style.commonConfusions.length === 0)) return false
    if (id === "ressources" && style.resources.length === 0) return false
    if (id === "ecouter" && linkedEpisodes.length === 0) return false
    return true
  })

  return (
    <div className="style-body">
      {/* ── TOC mobile ─────────────────────────────────────────── */}
      <div className="style-toc-mobile">
        <button
          type="button"
          className="style-toc-toggle"
          onClick={() => setTocOpen(!tocOpen)}
          aria-expanded={tocOpen}
        >
          <span>Sommaire</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" style={{ transform: tocOpen ? "rotate(180deg)" : undefined, transition: "transform .2s" }}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
        {tocOpen && (
          <nav className="style-toc-dropdown">
            {visibleSections.map(({ id, label }) => (
              <button key={id} type="button" onClick={() => scrollTo(id)}>{label}</button>
            ))}
          </nav>
        )}
      </div>

      <div className="style-layout">
        {/* ── TOC desktop sticky ─────────────────────────────────── */}
        <aside className="style-toc">
          <nav aria-label="Sommaire">
            <p className="style-toc-heading">Sommaire</p>
            {visibleSections.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                className={`style-toc-item${activeSection === id ? " is-active" : ""}`}
                onClick={() => scrollTo(id)}
              >
                {label}
              </button>
            ))}
          </nav>

          {/* Mots-clés */}
          {style.keywords.length > 0 && (
            <div className="style-toc-keywords">
              <p>Mots-clés</p>
              <div>
                {style.keywords.slice(0, 8).map((k) => (
                  <span key={k} className="style-keyword">{k}</span>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* ── Contenu principal ──────────────────────────────────── */}
        <article className="style-content">

          {/* Introduction */}
          <section id="introduction" className="style-section">
            <h2>Introduction</h2>
            {style.introduction.split("\n\n").map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </section>

          {/* Origines */}
          <section id="origines" className="style-section">
            <h2>Origines & contextes</h2>
            <div className="style-origin-meta">
              <div><span>Époque</span><strong>{style.era}</strong></div>
              <div><span>Territoire</span><strong>{style.originCity}, {style.originCountry}</strong></div>
              <div><span>Famille</span><strong>{style.family}</strong></div>
            </div>
            {style.origins.split("\n\n").map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </section>

          {/* Chronologie */}
          <section id="chronologie" className="style-section">
            <h2>Chronologie</h2>
            <ol className="style-timeline">
              {style.timeline.map((event, i) => (
                <li key={i} className="style-timeline-item">
                  <span className="style-timeline-year">{event.year}</span>
                  <span className="style-timeline-event">{event.event}</span>
                </li>
              ))}
            </ol>
          </section>

          {/* Caractéristiques */}
          <section id="caracteristiques" className="style-section">
            <h2>Caractéristiques du style</h2>

            <h3>Vocabulaire du mouvement</h3>
            <p>{style.characteristics.movements}</p>

            <h3>Rapport à la musique</h3>
            <p>{style.characteristics.musicRelationship}</p>

            <h3>Place de l'improvisation</h3>
            <p>{style.characteristics.improvisation}</p>

            {style.characteristics.visualCodes && (
              <>
                <h3>Codes visuels</h3>
                <p>{style.characteristics.visualCodes}</p>
              </>
            )}

            <h3>Formats de pratique</h3>
            <div className="style-formats">
              {style.characteristics.formats.map((f) => (
                <span key={f} className="style-format-pill">{f}</span>
              ))}
            </div>
          </section>

          {/* Musiques */}
          <section id="musiques" className="style-section">
            <h2>Musiques associées</h2>
            <div className="style-music-genres">
              {style.music.genres.map((g) => (
                <span key={g} className="style-genre-pill">{g}</span>
              ))}
            </div>
            <p>{style.music.description}</p>
            {style.music.keyArtists && style.music.keyArtists.length > 0 && (
              <>
                <h3>Artistes de référence</h3>
                <ul className="style-artists-list">
                  {style.music.keyArtists.map((a) => <li key={a}>{a}</li>)}
                </ul>
              </>
            )}
          </section>

          {/* Personnalités */}
          <section id="personnalites" className="style-section">
            <h2>Personnalités et collectifs importants</h2>
            {style.keyFigures.map((group) => (
              <div key={group.category} className="style-figures-group">
                <h3>{group.category}</h3>
                <div className="style-figures-grid">
                  {group.figures.map((figure) => (
                    <div key={figure.name} className="style-figure-card">
                      <strong>{figure.name}</strong>
                      <span>{figure.role}</span>
                      {figure.note && <em>{figure.note}</em>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </section>

          {/* Développement en France */}
          <section id="france" className="style-section">
            <h2>Développement en France</h2>
            <p>{style.franceHistory}</p>
          </section>

          {/* Styles associés */}
          {relatedStylesData.length > 0 && (
            <div className="style-related-styles">
              <h3>Styles associés</h3>
              <div className="style-related-grid">
                {relatedStylesData.map((s) => (
                  <Link key={s.slug} href={`/explorer/styles-de-danse/${s.slug}`} className="style-related-card">
                    <span className="style-badge style-badge--family">{s.family}</span>
                    <strong>{s.name}</strong>
                    <p>{s.summary.slice(0, 90)}…</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Confusions */}
          {style.commonConfusions && style.commonConfusions.length > 0 && (
            <section id="confusions" className="style-section">
              <h2>Confusions fréquentes</h2>
              {style.commonConfusions.map((c, i) => (
                <div key={i} className="style-confusion-card">
                  <strong>{c.styles}</strong>
                  <p>{c.explanation}</p>
                </div>
              ))}
            </section>
          )}

          {/* Ressources */}
          {style.resources.length > 0 && (
            <section id="ressources" className="style-section">
              <h2>Pour aller plus loin</h2>
              <p className="style-resources-note">
                Ressources vérifiées — livres, documentaires, archives et sites institutionnels.
              </p>
              <div className="style-resources-list">
                {style.resources.map((r, i) => (
                  <div key={i} className="style-resource-card">
                    <div className="style-resource-header">
                      <span className="style-resource-format">{r.format}</span>
                      <span className="style-resource-year">{r.year}</span>
                    </div>
                    <strong>{r.title}</strong>
                    <span className="style-resource-author">{r.author}</span>
                    <p>{r.description}</p>
                    {r.url && (
                      <a href={r.url} target="_blank" rel="noopener noreferrer">
                        Accéder à la ressource →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Épisodes Dance Lab */}
          {linkedEpisodes.length > 0 && (
            <section id="ecouter" className="style-section">
              <h2>À écouter sur Dance Lab</h2>
              <div className="style-episodes-grid">
                {linkedEpisodes.map(({ episode, relevance }) => (
                  <Link
                    key={episode.slug}
                    href={`/episodes/${episode.slug}`}
                    className="style-episode-card"
                  >
                    <div className="style-episode-img">
                      <img src={episode.image} alt={episode.guest} />
                    </div>
                    <div className="style-episode-body">
                      <span className="style-episode-number">Épisode {episode.number}</span>
                      <strong>{episode.guest}</strong>
                      <p className="style-episode-title">{episode.title}</p>
                      {relevance && (
                        <p className="style-episode-relevance">{relevance}</p>
                      )}
                      <span className="style-episode-cta">Écouter l&apos;épisode →</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

        </article>
      </div>

      {/* ── Pour aller plus loin — bandeau éditorial ───────────── */}
      <section className="sc-band-section">
        <div className="container">
          <div className="sc-band">

            {/* Bloc éditorial gauche */}
            <div className="sc-editorial">
              <span className="sc-pretitle">Pour aller plus loin</span>
              <p className="sc-subtitle">
                D&apos;autres styles, d&apos;autres récits,<br />
                d&apos;autres façons de vivre la danse.
              </p>
            </div>

            <div className="sc-divider" aria-hidden="true" />

            {/* Rangée de cartes */}
            <div className="sc-cards" role="list">

              {/* Carte 1 — index des styles */}
              <Link href="/explorer/styles-de-danse" className="sc-card sc-card--ink" role="listitem">
                <strong className="sc-card-title">Tous les styles</strong>
                <span className="sc-card-sub">Revenir à l&apos;index</span>
                <span className="sc-card-arrow" aria-hidden="true">→</span>
              </Link>

              {/* Cartes 2 & 3 — styles associés */}
              {relatedStylesData.slice(0, 2).map((s, i) => (
                <Link
                  key={s.slug}
                  href={`/explorer/styles-de-danse/${s.slug}`}
                  className={`sc-card ${i === 0 ? "sc-card--deep" : "sc-card--mid"}`}
                  role="listitem"
                >
                  <strong className="sc-card-title">{s.name}</strong>
                  <span className="sc-card-sub">{s.era} · {s.originCity}</span>
                  <span className="sc-card-arrow" aria-hidden="true">→</span>
                </Link>
              ))}

              {/* Carte 4 — podcast */}
              <Link href="/ecouter" className="sc-card sc-card--mist" role="listitem">
                <strong className="sc-card-title">Podcast Dance Lab</strong>
                <span className="sc-card-sub">Tous les épisodes</span>
                <span className="sc-card-arrow" aria-hidden="true">→</span>
              </Link>

            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
