'use client'
import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import type { EcoleDanse } from './ecoles-data'

interface Props {
  ecoles: EcoleDanse[]
}

const STYLES_FILTRES = [
  "Danse classique", "Contemporain", "Jazz", "Modern jazz",
  "Hip-hop", "Breaking", "Popping", "Locking", "House",
  "Waacking", "Voguing", "Afro", "Dancehall", "Heels", "Street jazz",
  "Salsa", "Bachata", "Tango", "Swing", "Rock'n'roll",
  "Danse orientale", "Bollywood", "Kathak", "Claquettes", "Pole dance",
  "Flamenco", "Capoeira", "Kizomba", "Lindy hop", "Boogie Woogie",
]

const NIVEAUX_FILTRES = ["Débutant", "Intermédiaire", "Avancé", "Professionnel"]

const PRATIQUES_FILTRES = ["Loisirs", "Formation professionnelle", "Préparation EAT/DE", "Cours open", "Enfants", "Adultes"]

const ARRONDISSEMENTS_FILTRES = Array.from({ length: 20 }, (_, i) => i + 1)

export default function EcolesClient({ ecoles }: Props) {
  const [search, setSearch] = useState('')
  const [activeStyle, setActiveStyle] = useState<string | null>(null)
  const [activeNiveau, setActiveNiveau] = useState<string | null>(null)
  const [activePratique, setActivePratique] = useState<string | null>(null)
  const [activeArr, setActiveArr] = useState<number | null>(null)
  const [selectedEcole, setSelectedEcole] = useState<EcoleDanse | null>(null)

  const mapRef = useRef<HTMLDivElement>(null)
  const leafletRef = useRef<any>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<Map<string, any>>(new Map())

  // Filter logic
  const filteredEcoles = useMemo(() => {
    return ecoles.filter(ecole => {
      if (search) {
        const q = search.toLowerCase()
        const matches =
          ecole.nom.toLowerCase().includes(q) ||
          ecole.adresse.toLowerCase().includes(q) ||
          ecole.styles.some(s => s.toLowerCase().includes(q)) ||
          String(ecole.arrondissement).includes(q)
        if (!matches) return false
      }
      if (activeStyle && !ecole.styles.some(s => s.toLowerCase().includes(activeStyle.toLowerCase()))) return false
      if (activeNiveau && !ecole.niveaux.includes(activeNiveau as any)) return false
      if (activePratique && !ecole.pratiques.includes(activePratique as any)) return false
      if (activeArr && ecole.arrondissement !== activeArr) return false
      return true
    })
  }, [ecoles, search, activeStyle, activeNiveau, activePratique, activeArr])

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return
    let cancelled = false

    import('leaflet').then((L) => {
      if (cancelled || !mapRef.current) return
      leafletRef.current = L

      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)

      const map = L.map(mapRef.current, {
        center: [48.8566, 2.3522],
        zoom: 12,
        zoomControl: false,
      })

      L.control.zoom({ position: 'topright' }).addTo(map)

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map)

      mapInstanceRef.current = map
    })

    return () => {
      cancelled = true
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
        markersRef.current.clear()
      }
    }
  }, [])

  // Update markers
  useEffect(() => {
    const L = leafletRef.current
    const map = mapInstanceRef.current
    if (!L || !map) return

    markersRef.current.forEach(m => m.remove())
    markersRef.current.clear()

    filteredEcoles.forEach(ecole => {
      const isSelected = selectedEcole?.id === ecole.id
      const icon = L.divIcon({
        className: '',
        html: `<div class="ecole-marker${isSelected ? ' ecole-marker--active' : ''}"><div class="ecole-marker-inner"></div></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      })

      const marker = L.marker([ecole.lat, ecole.lng], { icon })
        .addTo(map)
        .on('click', () => setSelectedEcole(ecole))

      markersRef.current.set(ecole.id, marker)
    })
  }, [filteredEcoles, selectedEcole])

  return (
    <main className="ecoles-page">
      {/* HERO HEADER */}
      <section className="ecoles-hero">
        <div className="container">
          <span className="section-label">Explorer · Écoles de danse</span>
          <h1>Trouver où danser, se former et progresser à Paris.</h1>
          <p className="ecoles-hero-desc">
            {ecoles.length} établissements référencés — studios, écoles, conservatoires et centres de formation.
          </p>
          {/* SEARCH BAR */}
          <label className="ecoles-search-wrap">
            <svg className="ecoles-search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="8.5" cy="8.5" r="6.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
              <path d="M14 14l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              className="ecoles-search"
              type="search"
              placeholder="Chercher un studio, un style, un arrondissement…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </label>
        </div>
      </section>

      {/* FILTERS */}
      <section className="ecoles-filters-bar">
        <div className="container ecoles-filters-inner">
          {/* Style filter */}
          <div className="ecoles-filter-row">
            <span className="ecoles-filter-label">Style</span>
            <div className="ecoles-chips">
              {STYLES_FILTRES.map(style => (
                <button
                  key={style}
                  className={`ecoles-chip${activeStyle === style ? ' ecoles-chip--active' : ''}`}
                  onClick={() => setActiveStyle(activeStyle === style ? null : style)}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>
          {/* Level filter */}
          <div className="ecoles-filter-row">
            <span className="ecoles-filter-label">Niveau</span>
            <div className="ecoles-chips">
              {NIVEAUX_FILTRES.map(niveau => (
                <button
                  key={niveau}
                  className={`ecoles-chip${activeNiveau === niveau ? ' ecoles-chip--active' : ''}`}
                  onClick={() => setActiveNiveau(activeNiveau === niveau ? null : niveau)}
                >
                  {niveau}
                </button>
              ))}
            </div>
          </div>
          {/* Practice filter */}
          <div className="ecoles-filter-row">
            <span className="ecoles-filter-label">Pratique</span>
            <div className="ecoles-chips">
              {PRATIQUES_FILTRES.map(pratique => (
                <button
                  key={pratique}
                  className={`ecoles-chip${activePratique === pratique ? ' ecoles-chip--active' : ''}`}
                  onClick={() => setActivePratique(activePratique === pratique ? null : pratique)}
                >
                  {pratique}
                </button>
              ))}
            </div>
          </div>
          {/* Arrondissement filter */}
          <div className="ecoles-filter-row">
            <span className="ecoles-filter-label">Arrond.</span>
            <div className="ecoles-chips">
              {ARRONDISSEMENTS_FILTRES.map(arr => (
                <button
                  key={arr}
                  className={`ecoles-chip${activeArr === arr ? ' ecoles-chip--active' : ''}`}
                  onClick={() => setActiveArr(activeArr === arr ? null : arr)}
                >
                  {arr}e
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* MAP + LIST LAYOUT */}
      <div className="ecoles-body">
        <div className="container ecoles-body-inner">

          {/* MAP */}
          <div className="ecoles-map-wrap">
            <div ref={mapRef} className="ecoles-map" />
            {/* Selected school popup */}
            {selectedEcole && (
              <div className="ecoles-map-popup">
                <button
                  onClick={() => setSelectedEcole(null)}
                  className="ecoles-map-popup-close"
                  aria-label="Fermer"
                >
                  ×
                </button>
                <span className="ecoles-map-popup-type">{selectedEcole.type}</span>
                <h3>{selectedEcole.nom}</h3>
                <p>{selectedEcole.adresse}</p>
                <div className="ecoles-map-popup-styles">
                  {selectedEcole.styles.slice(0, 3).map(s => (
                    <span key={s} className="ecoles-map-popup-style">{s}</span>
                  ))}
                </div>
                <a href={`#ecole-${selectedEcole.id}`} className="ecoles-map-popup-cta">
                  Voir l&apos;école →
                </a>
              </div>
            )}
          </div>

          {/* SCHOOL LIST */}
          <div className="ecoles-list">
            <p className="ecoles-count">
              {filteredEcoles.length} établissement{filteredEcoles.length > 1 ? 's' : ''}
            </p>
            {filteredEcoles.map(ecole => (
              <div
                key={ecole.id}
                id={`ecole-${ecole.id}`}
                className={`ecole-card${selectedEcole?.id === ecole.id ? ' ecole-card--selected' : ''}`}
                onClick={() => setSelectedEcole(ecole)}
              >
                <div className="ecole-card-head">
                  <span className="ecole-card-type">{ecole.type}</span>
                  <span className="ecole-card-arr">{ecole.arrondissement}e arr.</span>
                </div>
                <h3 className="ecole-card-name">{ecole.nom}</h3>
                <p className="ecole-card-address">{ecole.adresse}</p>
                <div className="ecole-card-styles">
                  {ecole.styles.slice(0, 4).map(s => (
                    <span key={s} className="ecole-card-style-tag">{s}</span>
                  ))}
                  {ecole.styles.length > 4 && (
                    <span className="ecole-card-style-more">+{ecole.styles.length - 4}</span>
                  )}
                </div>
                <div className="ecole-card-foot">
                  <div className="ecole-card-niveaux">
                    {ecole.niveaux.slice(0, 2).map(n => (
                      <span key={n} className="ecole-card-niveau">{n}</span>
                    ))}
                  </div>
                  {ecole.siteWeb && (
                    <a
                      href={ecole.siteWeb}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ecole-card-link"
                      onClick={e => e.stopPropagation()}
                    >
                      Site officiel ↗
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </main>
  )
}
