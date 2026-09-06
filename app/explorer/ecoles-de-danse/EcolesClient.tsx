'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { EcoleDanse, EcoleType, ParcoursFormation } from './ecoles-data'
import { AnimatedStats } from '../styles-de-danse/StylesStats'

interface Props { ecoles: EcoleDanse[] }

const PARCOURS: ParcoursFormation[] = [
  'Formation professionnelle', 'Préprofessionnel', 'CPES / COP', 'Danse-études',
  'Jeune Ballet / Junior Ballet', 'Insertion professionnelle', 'Enseignement supérieur',
  'EAT', 'DE', 'DNSP',
]

const TYPES: { type: EcoleType; label: string; desc: string }[] = [
  { type: 'Studio', label: 'Studios', desc: 'Lieux de pratique souples, souvent axés sur plusieurs styles et ouverts à différents niveaux.' },
  { type: 'École', label: 'Écoles', desc: 'Structures pédagogiques proposant des cycles progressifs et parfois des cursus professionnels.' },
  { type: 'Conservatoire', label: 'Conservatoires', desc: 'Formations initiales, préprofessionnelles ou supérieures, principalement sous tutelle publique.' },
  { type: 'Centre de formation', label: 'Centres de formation', desc: 'Parcours professionnalisants tournés vers l’interprétation, l’insertion et les diplômes d’État.' },
  { type: 'Association', label: 'Associations', desc: 'Structures ancrées dans la vie locale, accessibles et animées par une dynamique collective.' },
]

function lieu(ecole: EcoleDanse) {
  return [ecole.ville, ecole.region].filter(Boolean).join(' · ') || ecole.adresse || 'France'
}

export default function EcolesClient({ ecoles }: Props) {
  const [search, setSearch] = useState('')
  const [activeType, setActiveType] = useState<EcoleType | null>(null)
  const [region, setRegion] = useState('')
  const [ville, setVille] = useState('')
  const [style, setStyle] = useState('')
  const [parcours, setParcours] = useState('')
  const [niveau, setNiveau] = useState('')
  const [pratique, setPratique] = useState('')
  const [professionalOnly, setProfessionalOnly] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const [sort, setSort] = useState<'pertinence' | 'alphabetique'>('pertinence')
  const [mobileView, setMobileView] = useState<'liste' | 'carte'>('liste')
  const [selectedEcole, setSelectedEcole] = useState<EcoleDanse | null>(null)
  const [mapError, setMapError] = useState(false)

  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const leafletRef = useRef<any>(null)
  const markersRef = useRef<Map<string, any>>(new Map())

  const regions = useMemo(() => [...new Set(ecoles.map(e => e.region).filter(Boolean) as string[])].sort(), [ecoles])
  const villes = useMemo(() => [...new Set(ecoles.filter(e => !region || e.region === region).map(e => e.ville).filter(Boolean) as string[])].sort(), [ecoles, region])
  const styles = useMemo(() => [...new Set(ecoles.flatMap(e => e.styles))].sort(), [ecoles])
  const niveaux = useMemo(() => [...new Set(ecoles.flatMap(e => e.niveaux))].sort(), [ecoles])
  const pratiques = useMemo(() => [...new Set(ecoles.flatMap(e => e.pratiques))].sort(), [ecoles])

  const filteredEcoles = useMemo(() => {
    const q = search.trim().toLocaleLowerCase('fr')
    const result = ecoles.filter(ecole => {
      const searchable = [ecole.nom, ecole.adresse, ecole.ville, ecole.region, ecole.description, ...(ecole.styles || []), ...(ecole.parcours || []), ...(ecole.programmes || [])]
        .filter(Boolean).join(' ').toLocaleLowerCase('fr')
      if (q && !searchable.includes(q)) return false
      if (activeType && ecole.type !== activeType) return false
      if (region && ecole.region !== region) return false
      if (ville && ecole.ville !== ville) return false
      if (style && !ecole.styles.includes(style)) return false
      if (parcours && !ecole.parcours?.includes(parcours as ParcoursFormation)) return false
      if (niveau && !ecole.niveaux.includes(niveau as never)) return false
      if (pratique && !ecole.pratiques.includes(pratique as never)) return false
      if (professionalOnly && ecole.categorie !== 'Se former professionnellement') return false
      return true
    })
    return sort === 'alphabetique' ? [...result].sort((a, b) => a.nom.localeCompare(b.nom, 'fr')) : result
  }, [ecoles, search, activeType, region, ville, style, parcours, niveau, pratique, professionalOnly, sort])

  const hasFilters = Boolean(search || activeType || region || ville || style || parcours || niveau || pratique || professionalOnly)

  function resetFilters() {
    setSearch(''); setActiveType(null); setRegion(''); setVille(''); setStyle('')
    setParcours(''); setNiveau(''); setPratique(''); setProfessionalOnly(false)
  }

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return
    let cancelled = false
    import('leaflet').then(L => {
      if (cancelled || !mapRef.current) return
      leafletRef.current = L
      if (!document.querySelector('link[data-leaflet-css]')) {
        const link = document.createElement('link')
        link.rel = 'stylesheet'; link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'; link.dataset.leafletCss = ''
        document.head.appendChild(link)
      }
      const map = L.map(mapRef.current, { center: [46.6, 2.4], zoom: 5, zoomControl: false, attributionControl: false })
      L.control.zoom({ position: 'topright' }).addTo(map)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { subdomains: 'abc', maxZoom: 19, detectRetina: true }).addTo(map)
      mapInstanceRef.current = map
    }).catch(() => { if (!cancelled) setMapError(true) })
    return () => {
      cancelled = true
      mapInstanceRef.current?.remove(); mapInstanceRef.current = null; markersRef.current.clear()
    }
  }, [])

  useEffect(() => {
    const L = leafletRef.current
    const map = mapInstanceRef.current
    if (!L || !map) return
    markersRef.current.forEach(marker => marker.remove()); markersRef.current.clear()
    filteredEcoles.filter(e => e.lat != null && e.lng != null).forEach(ecole => {
      const selected = selectedEcole?.id === ecole.id
      const icon = L.divIcon({ className: '', html: `<div class="ecole-marker${selected ? ' ecole-marker--active' : ''}"><span></span></div>`, iconSize: [24, 30], iconAnchor: [12, 26] })
      const marker = L.marker([ecole.lat!, ecole.lng!], { icon }).addTo(map).on('click', () => {
        setSelectedEcole(ecole)
        document.getElementById(`ecole-${ecole.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      })
      markersRef.current.set(ecole.id, marker)
    })
  }, [filteredEcoles, selectedEcole])

  useEffect(() => {
    if (mobileView === 'carte') setTimeout(() => mapInstanceRef.current?.invalidateSize(), 50)
  }, [mobileView])

  function selectEcole(ecole: EcoleDanse) {
    setSelectedEcole(ecole)
    if (ecole.lat != null && ecole.lng != null) mapInstanceRef.current?.flyTo([ecole.lat, ecole.lng], 13, { duration: .7 })
  }

  return (
    <main className="ecoles-page">
      <section className="ecoles-hero">
        <div className="ecoles-hero-deco" aria-hidden="true"><div className="ecoles-hero-deco-circle ecoles-hero-deco-circle--lg" /><div className="ecoles-hero-deco-circle ecoles-hero-deco-circle--sm" /><div className="ecoles-hero-deco-line" /></div>
        <div className="ecoles-hero-inner">
          <div className="ecoles-hero-content">
            <span className="ecoles-hero-kicker sty-kicker">Explorer · Écoles de danse</span>
            <h1 className="ecoles-hero-title sty-hero-title">Trouver où danser,<br /><em>se former et progresser</em><br />en France.</h1>
            <p className="ecoles-hero-desc sty-hero-desc">Studios, écoles, conservatoires ou centres de formation : explorez des établissements qui partagent votre passion et trouvez le cadre qui correspond à vos ambitions.</p>
            <AnimatedStats items={[
              { target: ecoles.length, label: 'Établissements' },
              { target: 5, label: 'Types de structures' },
              { target: regions.length, label: 'Régions' },
            ]} />
            <div className="ecoles-hero-search sty-hero-search">
              <label className="styles-search-field">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="8.5" cy="8.5" r="6.5" stroke="currentColor" strokeWidth="1.4"/><path d="m14 14 4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
                <input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Rechercher un établissement, une ville, un style..." />
              </label>
              <label className={`sty-filter-btn ecoles-hero-type-select${activeType ? ' sty-filter-btn--has-value' : ''}`}>
                <select value={activeType ?? ''} onChange={event => setActiveType((event.target.value || null) as EcoleType | null)} aria-label="Filtrer par type d’établissement">
                  <option value="">Tous les établissements</option>
                  {TYPES.map(({ type, label }) => <option key={type} value={type}>{label}</option>)}
                </select>
                <svg className="sty-filter-chevron" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M2 4.5L6 8.5L10 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </label>
            </div>
          </div>
        </div>
      </section>

      <section className="ecoles-directory">
        <div className="ecoles-directory-inner">
          <nav className="ecoles-tabs" aria-label="Type d’établissement">
            <button className={!activeType ? 'is-active' : ''} onClick={() => setActiveType(null)}>Tous les établissements</button>
            {TYPES.map(({ type, label }) => <button key={type} className={activeType === type ? 'is-active' : ''} onClick={() => setActiveType(type)}>{label}</button>)}
          </nav>

          <div className="ecoles-directory-toolbar">
            <div className="ecoles-primary-filters">
              <label><span>Région</span><select value={region} onChange={e => { setRegion(e.target.value); setVille('') }}><option value="">Toutes</option>{regions.map(value => <option key={value}>{value}</option>)}</select></label>
              <label><span>Ville</span><select value={ville} onChange={e => setVille(e.target.value)}><option value="">Toutes</option>{villes.map(value => <option key={value}>{value}</option>)}</select></label>
              <label><span>Style</span><select value={style} onChange={e => setStyle(e.target.value)}><option value="">Tous</option>{styles.map(value => <option key={value}>{value}</option>)}</select></label>
              <button className={`ecoles-more-button${moreOpen ? ' is-active' : ''}`} onClick={() => setMoreOpen(!moreOpen)} aria-expanded={moreOpen}><span>+</span> Plus de filtres</button>
            </div>

            {moreOpen && <div className="ecoles-secondary-filters">
              <label>Parcours<select value={parcours} onChange={e => setParcours(e.target.value)}><option value="">Tous les parcours</option>{PARCOURS.map(value => <option key={value}>{value}</option>)}</select></label>
              <label>Niveau<select value={niveau} onChange={e => setNiveau(e.target.value)}><option value="">Tous les niveaux</option>{niveaux.map(value => <option key={value}>{value}</option>)}</select></label>
              <label>Pratique<select value={pratique} onChange={e => setPratique(e.target.value)}><option value="">Toutes les pratiques</option>{pratiques.map(value => <option key={value}>{value}</option>)}</select></label>
              <label className="ecoles-professional-check"><input type="checkbox" checked={professionalOnly} onChange={e => setProfessionalOnly(e.target.checked)} /> Se former professionnellement</label>
            </div>}

            <div className="ecoles-results-meta">
              <span><strong>{filteredEcoles.length}</strong> établissement{filteredEcoles.length > 1 ? 's' : ''}</span>
              <div>{hasFilters && <button onClick={resetFilters}>Effacer les filtres</button>}<label>Trier par : <select value={sort} onChange={e => setSort(e.target.value as typeof sort)}><option value="pertinence">Pertinence</option><option value="alphabetique">A–Z</option></select></label></div>
            </div>
          </div>

          <div className="ecoles-workspace">
            <div className={`ecoles-results-panel${mobileView === 'carte' ? ' is-mobile-hidden' : ''}`}>

              <div className="ecoles-mobile-toggle" aria-label="Choisir la vue"><button className="is-active" onClick={() => setMobileView('liste')}>Liste</button><button onClick={() => setMobileView('carte')}>Carte</button></div>

              <div className="ecoles-cards">
                {filteredEcoles.map((ecole, index) => {
                  const tags = [...(ecole.parcours || []), ...ecole.styles]
                  return <article key={ecole.id} id={`ecole-${ecole.id}`} className={`ecole-result-card${selectedEcole?.id === ecole.id ? ' is-selected' : ''}`} onMouseEnter={() => selectEcole(ecole)} onClick={() => selectEcole(ecole)}>
                    <div className={`ecole-result-visual ecole-result-visual--${index % 4}`} aria-hidden="true"><span>{ecole.type.slice(0, 2)}</span></div>
                    <div className="ecole-result-content">
                      <span className="ecole-result-type">{ecole.type}</span><h2>{ecole.nom}</h2><p className="ecole-result-place">{lieu(ecole)}</p>
                      <div className="ecole-result-tags">{tags.slice(0, 3).map(tag => <span key={tag}>{tag}</span>)}{tags.length > 3 && <span>+{tags.length - 3}</span>}</div>
                      {ecole.description && <p className="ecole-result-desc">{ecole.description}</p>}
                      {ecole.siteWeb && <a href={ecole.siteWeb} target="_blank" rel="noopener noreferrer" onClick={event => event.stopPropagation()} aria-label={`Voir le site officiel de ${ecole.nom}`}>Voir le site officiel <span>↗</span></a>}
                    </div><span className="ecole-result-arrow" aria-hidden="true">→</span>
                  </article>
                })}
                {!filteredEcoles.length && <div className="ecoles-empty"><p>Aucun établissement ne correspond à ces critères.</p><button onClick={resetFilters}>Réinitialiser les filtres</button></div>}
              </div>
            </div>

            <div className={`ecoles-map-panel${mobileView === 'liste' ? ' is-mobile-hidden' : ''}`}>
              <div className="ecoles-map-toggle" aria-hidden="true"><span className="is-active">Carte</span><span>Liste</span></div>
              {mapError ? <div className="ecoles-map-fallback"><p>La carte n’a pas pu se charger.<br />La liste reste disponible.</p></div> : <div ref={mapRef} className="ecoles-map" />}
              {selectedEcole && <aside className="ecoles-map-popup"><button onClick={() => setSelectedEcole(null)} aria-label="Fermer">×</button><span>{selectedEcole.type}</span><h3>{selectedEcole.nom}</h3><p>{lieu(selectedEcole)}</p>{selectedEcole.siteWeb && <a href={selectedEcole.siteWeb} target="_blank" rel="noopener noreferrer">Voir le site officiel ↗</a>}</aside>}
              <div className="ecoles-map-legend"><span><i /> Établissement géolocalisé</span><span><i /> Établissement sans coordonnées</span></div>
              <div className="ecoles-mobile-toggle ecoles-mobile-toggle--map"><button onClick={() => setMobileView('liste')}>Liste</button><button className="is-active" onClick={() => setMobileView('carte')}>Carte</button></div>
            </div>
          </div>
        </div>
      </section>

      <section className="ecoles-types">
        <div className="container"><div className="ecoles-types-heading"><span className="section-label">Structures</span><h2>Cinq types d’établissements, cinq approches de la danse</h2></div>
          <div className="ecoles-types-grid">{TYPES.map(({ type, label, desc }) => <button key={type} className={`ecoles-type-card${activeType === type ? ' ecoles-type-card--active' : ''}`} onClick={() => { setActiveType(activeType === type ? null : type); document.querySelector('.ecoles-directory')?.scrollIntoView({ behavior: 'smooth' }) }}><div className="ecoles-type-card-head"><span className="ecoles-type-card-count">{ecoles.filter(e => e.type === type).length}</span><span className="ecoles-type-card-badge">{label}</span></div><p className="ecoles-type-card-desc">{desc}</p><span className="ecoles-type-card-cta">{activeType === type ? 'Retirer le filtre' : 'Explorer →'}</span></button>)}</div>
        </div>
      </section>
    </main>
  )
}
