'use client'
import { useState, useMemo, useEffect, useRef } from 'react'
import type { EcoleDanse, EcoleType, ParcoursFormation } from './ecoles-data'

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

const PARCOURS_FILTRES: ParcoursFormation[] = [
  "Formation professionnelle", "Préprofessionnel", "CPES / COP", "Danse-études",
  "Jeune Ballet / Junior Ballet", "Insertion professionnelle", "Enseignement supérieur",
  "EAT", "DE", "DNSP",
]

const STYLES_PRO_FILTRES = [
  "Classique", "Contemporain", "Jazz / modern jazz", "Hip-hop / danses urbaines",
  "Street dance", "Pluridisciplinaire", "Cabaret / music-hall", "Comédie musicale",
]

const TYPES_STRUCTURE: { type: EcoleType; label: string; desc: string }[] = [
  {
    type: "Studio",
    label: "Studio",
    desc: "Lieu de pratique souple, souvent axé sur un ou plusieurs styles. Cours ouverts à tous les niveaux, ambiance créative et non compétitive.",
  },
  {
    type: "École",
    label: "École",
    desc: "Structure pédagogique complète avec cycles progressifs, examens et parfois préparation aux concours ou formation professionnelle.",
  },
  {
    type: "Conservatoire",
    label: "Conservatoire",
    desc: "Formation initiale et supérieure sous tutelle publique. Niveaux avancés, accès sur dossier ou concours, débouchés professionnels.",
  },
  {
    type: "Centre de formation",
    label: "Centre de formation",
    desc: "Programmes professionnalisants longs (6 à 12 mois), orientés insertion dans le milieu chorégraphique et préparation aux diplômes d'État.",
  },
  {
    type: "Association",
    label: "Association",
    desc: "Structure à but non lucratif, accessible et ancrée dans la vie locale. Tarifs souvent réduits, esprit communautaire fort.",
  },
]

export default function EcolesClient({ ecoles }: Props) {
  const [search, setSearch] = useState('')
  const [activeStyle, setActiveStyle] = useState<string | null>(null)
  const [activeNiveau, setActiveNiveau] = useState<string | null>(null)
  const [activePratique, setActivePratique] = useState<string | null>(null)
  const [activeArr, setActiveArr] = useState<number | null>(null)
  const [activeType, setActiveType] = useState<EcoleType | null>(null)
  const [activeRegion, setActiveRegion] = useState('')
  const [activeVille, setActiveVille] = useState('')
  const [activeParcours, setActiveParcours] = useState('')
  const [activeProStyle, setActiveProStyle] = useState('')
  const [professionalOnly, setProfessionalOnly] = useState(false)
  const [selectedEcole, setSelectedEcole] = useState<EcoleDanse | null>(null)

  const mapRef = useRef<HTMLDivElement>(null)
  const leafletRef = useRef<any>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<Map<string, any>>(new Map())
  const [mapError, setMapError] = useState(false)

  const regions = useMemo(() => [...new Set(ecoles.map(e => e.region).filter(Boolean) as string[])].sort(), [ecoles])
  const villes = useMemo(() => [...new Set(ecoles
    .filter(e => !activeRegion || e.region === activeRegion)
    .map(e => e.ville).filter(Boolean) as string[])].sort(), [ecoles, activeRegion])

  const hasActiveFilter = !!(search || activeStyle || activeNiveau || activePratique || activeArr || activeType || activeRegion || activeVille || activeParcours || activeProStyle || professionalOnly)

  function clearFilters() {
    setSearch('')
    setActiveStyle(null)
    setActiveNiveau(null)
    setActivePratique(null)
    setActiveArr(null)
    setActiveType(null)
    setActiveRegion('')
    setActiveVille('')
    setActiveParcours('')
    setActiveProStyle('')
    setProfessionalOnly(false)
  }

  // Filter logic
  const filteredEcoles = useMemo(() => {
    return ecoles.filter(ecole => {
      if (search) {
        const q = search.toLowerCase()
        const matches =
          ecole.nom.toLowerCase().includes(q) ||
          (ecole.adresse ?? '').toLowerCase().includes(q) ||
          (ecole.ville ?? '').toLowerCase().includes(q) ||
          (ecole.region ?? '').toLowerCase().includes(q) ||
          (ecole.parcours ?? []).some(p => p.toLowerCase().includes(q)) ||
          ecole.styles.some(s => s.toLowerCase().includes(q)) ||
          String(ecole.arrondissement).includes(q)
        if (!matches) return false
      }
      if (activeType && ecole.type !== activeType) return false
      if (activeStyle && !ecole.styles.some(s => s.toLowerCase().includes(activeStyle.toLowerCase()))) return false
      if (activeNiveau && !ecole.niveaux.includes(activeNiveau as any)) return false
      if (activePratique && !ecole.pratiques.includes(activePratique as any)) return false
      if (activeArr && ecole.arrondissement !== activeArr) return false
      if (professionalOnly && ecole.categorie !== "Se former professionnellement") return false
      if (activeRegion && ecole.region !== activeRegion) return false
      if (activeVille && ecole.ville !== activeVille) return false
      if (activeParcours && !ecole.parcours?.includes(activeParcours as ParcoursFormation)) return false
      if (activeProStyle && !ecole.styles.includes(activeProStyle)) return false
      return true
    })
  }, [ecoles, search, activeStyle, activeNiveau, activePratique, activeArr, activeType, activeRegion, activeVille, activeParcours, activeProStyle, professionalOnly])

  const featuredEcoles = filteredEcoles.filter(e => e.featured)
  const regularEcoles = filteredEcoles.filter(e => !e.featured)

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return
    let cancelled = false

    import('leaflet').then((L) => {
      if (cancelled || !mapRef.current) return
      leafletRef.current = L

      if (!document.querySelector('link[data-leaflet-css]')) {
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        link.setAttribute('data-leaflet-css', '')
        document.head.appendChild(link)
      }

      const map = L.map(mapRef.current, {
        center: [48.8566, 2.3522],
        zoom: 12,
        zoomControl: false,
      })

      L.control.zoom({ position: 'topright' }).addTo(map)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        subdomains: 'abc',
        maxZoom: 19,
        detectRetina: true,
      }).addTo(map)

      mapInstanceRef.current = map
    }).catch(() => {
      if (!cancelled) setMapError(true)
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

    filteredEcoles.filter(ecole => ecole.lat != null && ecole.lng != null).forEach(ecole => {
      const isSelected = selectedEcole?.id === ecole.id
      const isFeatured = ecole.featured
      const icon = L.divIcon({
        className: '',
        html: `<div class="ecole-marker${isSelected ? ' ecole-marker--active' : ''}${isFeatured ? ' ecole-marker--featured' : ''}"><div class="ecole-marker-inner"></div></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      })

      const marker = L.marker([ecole.lat!, ecole.lng!], { icon })
        .addTo(map)
        .on('click', () => setSelectedEcole(ecole))

      markersRef.current.set(ecole.id, marker)
    })
  }, [filteredEcoles, selectedEcole])

  return (
    <main className="ecoles-page">

      {/* ── HERO ── dark editorial */}
      <section className="ecoles-hero">
        <div className="ecoles-hero-deco" aria-hidden="true">
          <div className="ecoles-hero-deco-circle ecoles-hero-deco-circle--lg" />
          <div className="ecoles-hero-deco-circle ecoles-hero-deco-circle--sm" />
          <div className="ecoles-hero-deco-line" />
        </div>
        <div className="container ecoles-hero-inner">
          <div className="ecoles-hero-content">
            <span className="ecoles-hero-kicker">Explorer · Écoles de danse</span>
            <h1 className="ecoles-hero-title">
              Trouver où danser,<br /><em>se former et progresser</em><br />en France.
            </h1>
            <p className="ecoles-hero-desc">
              Chaque trajectoire commence quelque part. Studios, écoles, conservatoires ou centres de formation — explorez {ecoles.length} établissements pour trouver le cadre qui correspond à vos ambitions.
            </p>
            <div className="ecoles-hero-stats">
              <div className="ecoles-hero-stat">
                <span className="ecoles-hero-stat-number">{ecoles.length}</span>
                <span className="ecoles-hero-stat-label">établissements</span>
              </div>
              <div className="ecoles-hero-stat">
                <span className="ecoles-hero-stat-number">5</span>
                <span className="ecoles-hero-stat-label">types de structures</span>
              </div>
              <div className="ecoles-hero-stat">
                <span className="ecoles-hero-stat-number">{regions.length}</span>
                <span className="ecoles-hero-stat-label">régions</span>
              </div>
            </div>
          </div>

          <div className="ecoles-hero-aside">
            <label className="ecoles-hero-search-wrap">
              <svg className="ecoles-search-icon" width="18" height="18" viewBox="0 0 20 20" fill="none">
                <circle cx="8.5" cy="8.5" r="6.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
                <path d="M14 14l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <input
                className="ecoles-hero-search"
                type="search"
                placeholder="Chercher une école, une ville, un parcours…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </label>
            <div className="ecoles-hero-types">
              {TYPES_STRUCTURE.map(({ type }) => (
                <button
                  key={type}
                  className={`ecoles-hero-type-btn${activeType === type ? ' ecoles-hero-type-btn--active' : ''}`}
                  onClick={() => setActiveType(activeType === type ? null : type)}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="ecoles-professional">
        <div className="container">
          <button
            className={`ecoles-professional-title${professionalOnly ? ' ecoles-professional-title--active' : ''}`}
            onClick={() => setProfessionalOnly(!professionalOnly)}
          >
            <span className="section-label">Nouvelle catégorie</span>
            <strong>Se former professionnellement</strong>
            <span>{ecoles.filter(e => e.categorie === "Se former professionnellement").length} structures en France →</span>
          </button>
          <div className="ecoles-professional-filters" aria-label="Filtres des formations professionnelles">
            <label>Région
              <select value={activeRegion} onChange={e => { setActiveRegion(e.target.value); setActiveVille(''); setProfessionalOnly(true) }}>
                <option value="">Toutes les régions</option>
                {regions.map(region => <option key={region}>{region}</option>)}
              </select>
            </label>
            <label>Ville
              <select value={activeVille} onChange={e => { setActiveVille(e.target.value); setProfessionalOnly(true) }}>
                <option value="">Toutes les villes</option>
                {villes.map(ville => <option key={ville}>{ville}</option>)}
              </select>
            </label>
            <label>Parcours
              <select value={activeParcours} onChange={e => { setActiveParcours(e.target.value); setProfessionalOnly(true) }}>
                <option value="">Tous les parcours</option>
                {PARCOURS_FILTRES.map(parcours => <option key={parcours}>{parcours}</option>)}
              </select>
            </label>
            <label>Style
              <select value={activeProStyle} onChange={e => { setActiveProStyle(e.target.value); setProfessionalOnly(true) }}>
                <option value="">Tous les styles</option>
                {STYLES_PRO_FILTRES.map(style => <option key={style}>{style}</option>)}
              </select>
            </label>
          </div>
        </div>
      </section>

      {/* ── TYPES EDITORIAL SECTION ── */}
      <section className="ecoles-types">
        <div className="container">
          <div className="ecoles-types-heading">
            <span className="section-label">Structures</span>
            <h2>Cinq types d&apos;établissements, cinq approches de la danse</h2>
          </div>
          <div className="ecoles-types-grid">
            {TYPES_STRUCTURE.map(({ type, label, desc }) => {
              const count = ecoles.filter(e => e.type === type).length
              return (
                <button
                  key={type}
                  className={`ecoles-type-card${activeType === type ? ' ecoles-type-card--active' : ''}`}
                  onClick={() => setActiveType(activeType === type ? null : type)}
                >
                  <div className="ecoles-type-card-head">
                    <span className="ecoles-type-card-count">{count}</span>
                    <span className="ecoles-type-card-badge">{label}</span>
                  </div>
                  <p className="ecoles-type-card-desc">{desc}</p>
                  <span className="ecoles-type-card-cta">
                    {activeType === type ? 'Retirer le filtre' : 'Filtrer →'}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── FILTER BAR ── sticky horizontal scroll */}
      <section className="ecoles-filters-bar">
        <div className="ecoles-filters-scroll">
          <div className="ecoles-filter-group">
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
          <div className="ecoles-filter-group">
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
          <div className="ecoles-filter-group">
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
          <div className="ecoles-filter-group">
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
        {hasActiveFilter && (
          <button className="ecoles-filters-clear" onClick={clearFilters}>
            Effacer ×
          </button>
        )}
      </section>

      {/* ── MAP + LIST ── */}
      <div className={`ecoles-body${professionalOnly ? ' ecoles-body--directory' : ''}`}>
        <div className="ecoles-body-inner">

          {/* MAP */}
          <div className="ecoles-map-wrap">
            {mapError ? (
              <div className="ecoles-map-fallback">
                <p>La carte n&apos;a pas pu se charger.<br />Consultez la liste ci-dessous.</p>
              </div>
            ) : (
              <div ref={mapRef} className="ecoles-map" />
            )}
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
                <p>{selectedEcole.ville ?? selectedEcole.adresse}</p>
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
              <strong>{filteredEcoles.length}</strong>{' '}
              établissement{filteredEcoles.length > 1 ? 's' : ''}
              {hasActiveFilter ? ' correspondent à votre recherche' : ' référencés'}
            </p>

            {/* FEATURED SCHOOLS */}
            {featuredEcoles.length > 0 && (
              <div className="ecoles-section">
                <span className="ecoles-section-label">Sélection éditoriale</span>
                {featuredEcoles.map(ecole => (
                  <div
                    key={ecole.id}
                    id={`ecole-${ecole.id}`}
                    className={`ecole-card ecole-card--featured${selectedEcole?.id === ecole.id ? ' ecole-card--selected' : ''}`}
                    onClick={() => setSelectedEcole(ecole)}
                  >
                    <div className="ecole-card-accent" />
                    <div className="ecole-card-body">
                      <div className="ecole-card-head">
                        <span className="ecole-card-type">{ecole.type}</span>
                        <span className="ecole-card-arr">{ecole.ville ?? (ecole.arrondissement ? `${ecole.arrondissement}e arr.` : '')}</span>
                      </div>
                      <h3 className="ecole-card-name">{ecole.nom}</h3>
                      <p className="ecole-card-address">{[ecole.ville, ecole.region].filter(Boolean).join(' · ') || ecole.adresse}</p>
                      {ecole.duree && <p className="ecole-card-duration">Durée · {ecole.duree}</p>}
                      {ecole.description && (
                        <p className="ecole-card-desc">{ecole.description}</p>
                      )}
                      <div className="ecole-card-styles">
                        {ecole.parcours?.slice(0, 4).map(p => (
                          <span key={p} className="ecole-card-style-tag">{p}</span>
                        ))}
                        {ecole.styles.slice(0, 5).map(s => (
                          <span key={s} className="ecole-card-style-tag">{s}</span>
                        ))}
                        {ecole.styles.length > 5 && (
                          <span className="ecole-card-style-more">+{ecole.styles.length - 5}</span>
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
                            Voir le site officiel ↗
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* EDITORIAL INSERT — between featured and regular */}
            {featuredEcoles.length > 0 && regularEcoles.length > 0 && !hasActiveFilter && (
              <div className="ecoles-editorial-insert">
                <span className="ecoles-editorial-insert-kicker">À savoir</span>
                <h3>Formation ou loisir ?</h3>
                <p>
                  Les studios et associations conviennent à une pratique régulière et accessible.
                  Pour une orientation professionnelle, les conservatoires, centres de formation et
                  écoles agréées proposent des cursus diplômants et des préparations aux examens
                  d&apos;État (EAT / DE).
                </p>
              </div>
            )}

            {/* REGULAR SCHOOLS */}
            {regularEcoles.length > 0 && (
              <div className="ecoles-section">
                {featuredEcoles.length > 0 && !hasActiveFilter && (
                  <span className="ecoles-section-label">Tous les établissements</span>
                )}
                {regularEcoles.map(ecole => (
                  <div
                    key={ecole.id}
                    id={`ecole-${ecole.id}`}
                    className={`ecole-card${selectedEcole?.id === ecole.id ? ' ecole-card--selected' : ''}`}
                    onClick={() => setSelectedEcole(ecole)}
                  >
                    <div className="ecole-card-accent" />
                    <div className="ecole-card-body">
                      <div className="ecole-card-head">
                        <span className="ecole-card-type">{ecole.type}</span>
                        <span className="ecole-card-arr">{ecole.ville ?? (ecole.arrondissement ? `${ecole.arrondissement}e arr.` : '')}</span>
                      </div>
                      <h3 className="ecole-card-name">{ecole.nom}</h3>
                      <p className="ecole-card-address">{[ecole.ville, ecole.region].filter(Boolean).join(' · ') || ecole.adresse}</p>
                      {ecole.duree && <p className="ecole-card-duration">Durée · {ecole.duree}</p>}
                      <div className="ecole-card-styles">
                        {ecole.parcours?.slice(0, 4).map(p => (
                          <span key={p} className="ecole-card-style-tag">{p}</span>
                        ))}
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
                            Voir le site officiel ↗
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {filteredEcoles.length === 0 && (
              <div className="ecoles-empty">
                <p>Aucun établissement ne correspond à ces critères.</p>
                <button onClick={clearFilters} className="ecoles-empty-reset">
                  Réinitialiser les filtres
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </main>
  )
}
