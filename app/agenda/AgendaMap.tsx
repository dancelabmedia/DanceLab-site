"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import type { AgendaEvent } from "./agenda-data"
import { formatAgendaDateRange, resolveAgendaEventLocation } from "./agenda-data"
import { useLocale } from "@/components/LocaleProvider"
import { uiText } from "@/data/i18n/messages"

// ─── Clé API (variable d'environnement Vercel/Next.js) ────────────────────────

const GMAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? ""

// ─── Constantes ───────────────────────────────────────────────────────────────

const DEFAULT_CENTER = { lat: 46.7, lng: 2.25 }
const DEFAULT_ZOOM   = 6

// ─── Types ────────────────────────────────────────────────────────────────────

type AgendaMapProps = {
  events: AgendaEvent[]
  activeSlug?: string
  onSelectEvent?: (event: AgendaEvent) => void
}

type EventGroup = {
  key: string
  lat: number
  lng: number
  events: AgendaEvent[]
}

type NominatimResult = {
  place_id: number
  display_name: string
  lat: string
  lon: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getEventGroups(events: AgendaEvent[]): EventGroup[] {
  const groups = new Map<string, EventGroup>()
  for (const event of events) {
    const loc = resolveAgendaEventLocation(event)
    if (!loc.isComplete || typeof loc.latitude !== "number" || typeof loc.longitude !== "number") continue
    const key = `${loc.latitude.toFixed(3)}-${loc.longitude.toFixed(3)}`
    const existing = groups.get(key)
    if (existing) {
      existing.events.push(event)
    } else {
      groups.set(key, { key, lat: loc.latitude, lng: loc.longitude, events: [event] })
    }
  }
  return [...groups.values()]
}

function esc(v: string) {
  return v
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

/** HTML injecté dans google.maps.InfoWindow — réutilise les classes CSS .gmap-popup* */
function buildPopupHtml(group: EventGroup, t: (s: string) => string): string {
  if (group.events.length === 1) {
    const ev = group.events[0]
    return `
      <div class="gmap-popup">
        ${ev.image ? `<img src="${esc(ev.image)}" alt="${esc(ev.title)}" loading="lazy" class="gmap-popup-img" />` : ""}
        <div class="gmap-popup-body">
          <span class="gmap-popup-cat">${esc(ev.category)}</span>
          <strong class="gmap-popup-title">${esc(ev.title)}</strong>
          <p class="gmap-popup-meta">${esc(formatAgendaDateRange(ev))} · ${esc(ev.venue)}</p>
          <p class="gmap-popup-price">${esc(ev.price)}</p>
          <a class="gmap-popup-btn" href="/sortir/${esc(ev.slug)}">${esc(t("Voir l'événement"))} →</a>
        </div>
      </div>`
  }
  return `
    <div class="gmap-popup gmap-popup--multi">
      <div class="gmap-popup-body">
        <span class="gmap-popup-cat">${group.events.length} événement${group.events.length > 1 ? "s" : ""} · ${esc(group.events[0].city)}</span>
        <strong class="gmap-popup-title">${esc(group.events[0].venue)}</strong>
        <ul class="gmap-popup-list">
          ${group.events.map(ev => `
            <li class="gmap-popup-list-item">
              <a href="/sortir/${esc(ev.slug)}">${esc(ev.title)}</a>
              <small>${esc(formatAgendaDateRange(ev))}</small>
            </li>`).join("")}
        </ul>
      </div>
    </div>`
}

/** Recadre la carte sur l'ensemble des groupes d'événements visibles. */
function fitMapToGroups(map: google.maps.Map, groups: EventGroup[]) {
  if (groups.length === 0) {
    map.setCenter(DEFAULT_CENTER)
    map.setZoom(DEFAULT_ZOOM)
    return
  }
  if (groups.length === 1) {
    map.setCenter({ lat: groups[0].lat, lng: groups[0].lng })
    const current = map.getZoom() ?? 0
    if (current < 10) map.setZoom(10)
    return
  }
  const bounds = new google.maps.LatLngBounds()
  groups.forEach(g => bounds.extend({ lat: g.lat, lng: g.lng }))
  map.fitBounds(bounds)
}

/** Recherche de lieux via Nominatim (OpenStreetMap — gratuit, sans clé). */
async function searchNominatim(query: string): Promise<NominatimResult[]> {
  if (!query.trim() || query.length < 2) return []
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&countrycodes=fr&accept-language=fr`
    const res = await fetch(url, { headers: { "User-Agent": "DanceLab-map/1.0" } })
    if (!res.ok) return []
    return res.json() as Promise<NominatimResult[]>
  } catch { return [] }
}

// ─── Style cartographique sobre (supprime POI, simplifie le transit) ──────────

const MAP_STYLES: google.maps.MapTypeStyle[] = [
  { featureType: "poi",           stylers: [{ visibility: "off" }] },
  { featureType: "poi.park",      elementType: "geometry", stylers: [{ visibility: "simplified" }, { color: "#d8e8d4" }] },
  { featureType: "transit",       stylers: [{ visibility: "simplified" }] },
  { featureType: "road",          elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { featureType: "water",         elementType: "geometry.fill", stylers: [{ color: "#b8d4e8" }] },
  { featureType: "landscape.natural", elementType: "geometry", stylers: [{ color: "#f2f0eb" }] },
]

// ─── Composant ────────────────────────────────────────────────────────────────

export default function AgendaMap({ events, activeSlug, onSelectEvent }: AgendaMapProps) {
  const locale = useLocale()
  const t = useCallback((text: string) => uiText(locale, text), [locale])

  // Refs carte
  const mapNodeRef    = useRef<HTMLDivElement | null>(null)
  const mapRef        = useRef<google.maps.Map | null>(null)
  const markersRef    = useRef<google.maps.Marker[]>([])
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null)
  const eventsRef     = useRef(events)
  useEffect(() => { eventsRef.current = events }, [events])

  // Refs recherche
  const searchRef   = useRef<HTMLDivElement | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // État
  const [query,       setQuery]       = useState("")
  const [results,     setResults]     = useState<NominatimResult[]>([])
  const [searching,   setSearching]   = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [mapReady,    setMapReady]    = useState(false)

  const groups = useMemo(() => getEventGroups(events), [events])

  // ── 1. Initialisation Google Maps ─────────────────────────────────────────

  useEffect(() => {
    if (mapRef.current || !mapNodeRef.current) return
    let cancelled = false

    async function setup() {
      // @googlemaps/js-api-loader v2 : utilise setOptions + importLibrary
      const { setOptions, importLibrary } = await import("@googlemaps/js-api-loader")
      setOptions({ key: GMAPS_KEY, v: "weekly" })

      // Chargement parallèle des trois bibliothèques nécessaires
      const [{ Map, InfoWindow }, , ] = await Promise.all([
        importLibrary("maps")   as Promise<google.maps.MapsLibrary>,
        importLibrary("marker") as Promise<google.maps.MarkerLibrary>,
        importLibrary("core")   as Promise<google.maps.CoreLibrary>,
      ])
      if (cancelled || !mapNodeRef.current) return

      const map = new Map(mapNodeRef.current, {
        center: DEFAULT_CENTER,
        zoom:   DEFAULT_ZOOM,
        minZoom: 4,
        maxZoom: 18,
        // Contrôles simplifiés
        mapTypeControl:    false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl:       true,
        zoomControlOptions: { position: google.maps.ControlPosition.RIGHT_BOTTOM },
        // Style sobre cohérent avec la charte Dance Lab
        styles: MAP_STYLES,
        // Sur mobile : toucher à 2 doigts pour scroller la page
        gestureHandling: "cooperative",
      })

      const infoWindow = new google.maps.InfoWindow({ maxWidth: 310 })

      // Clic fond de carte → fermer l'InfoWindow et recadrer sur les événements visibles
      map.addListener("click", () => {
        infoWindow.close()
        fitMapToGroups(map, getEventGroups(eventsRef.current))
      })

      mapRef.current    = map
      infoWindowRef.current = infoWindow
      setMapReady(true)
    }

    setup().catch(console.error)
    return () => { cancelled = true }
  }, [])

  // ── 2. Mise à jour des marqueurs quand les filtres changent ───────────────

  useEffect(() => {
    const map        = mapRef.current
    const infoWindow = infoWindowRef.current
    if (!mapReady || !map || !infoWindow) return

    // Retirer les anciens marqueurs
    markersRef.current.forEach(m => m.setMap(null))
    markersRef.current = []

    for (const group of groups) {
      const isMulti = group.events.length > 1

      const marker = new google.maps.Marker({
        position: { lat: group.lat, lng: group.lng },
        map,
        title: isMulti
          ? `${group.events.length} événements · ${group.events[0].city}`
          : group.events[0].title,
        icon: {
          path:          google.maps.SymbolPath.CIRCLE,
          scale:         isMulti ? 20 : 10,
          fillColor:     isMulti ? "#233033" : "#4a7c59",
          fillOpacity:   1,
          strokeColor:   "#ffffff",
          strokeWeight:  2.5,
        },
        label: isMulti ? {
          text:       String(group.events.length),
          color:      "#ffffff",
          fontSize:   "12px",
          fontWeight: "700",
        } : undefined,
        zIndex: isMulti ? 10 : 5,
      })

      marker.addListener("click", () => {
        infoWindow.setContent(buildPopupHtml(group, t))
        infoWindow.open({ map, anchor: marker })
        onSelectEvent?.(group.events[0])
        map.panTo({ lat: group.lat, lng: group.lng })
        if (!isMulti && (map.getZoom() ?? 0) < 13) map.setZoom(13)
      })

      markersRef.current.push(marker)
    }

    fitMapToGroups(map, groups)
    // Forcer le recalcul de taille si le conteneur a changé de dimensions
    window.setTimeout(() => google.maps.event.trigger(map, "resize"), 120)
  }, [events, groups, mapReady, onSelectEvent, t])

  // ── 3. Voler vers l'événement actif (survol de carte depuis la liste) ─────

  useEffect(() => {
    if (!mapReady || !activeSlug || !mapRef.current) return
    const event = eventsRef.current.find(e => e.slug === activeSlug)
    if (!event) return
    const loc = resolveAgendaEventLocation(event)
    if (loc.isComplete && typeof loc.latitude === "number" && typeof loc.longitude === "number") {
      mapRef.current.panTo({ lat: loc.latitude, lng: loc.longitude })
      if ((mapRef.current.getZoom() ?? 0) < 12) mapRef.current.setZoom(12)
    }
  }, [activeSlug, mapReady])

  // ── 4. Nettoyage au démontage ─────────────────────────────────────────────

  useEffect(() => {
    return () => {
      markersRef.current.forEach(m => m.setMap(null))
      markersRef.current = []
      infoWindowRef.current?.close()
      mapRef.current    = null
      infoWindowRef.current = null
    }
  }, [])

  // ── Barre de recherche (Nominatim) ────────────────────────────────────────

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value
    setQuery(q)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (q.trim().length < 2) { setResults([]); setShowResults(false); return }
    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      const found = await searchNominatim(q)
      setResults(found)
      setShowResults(found.length > 0)
      setSearching(false)
    }, 450)
  }

  function handleSearchKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") { setShowResults(false); setQuery("") }
  }

  function handleSelectPlace(result: NominatimResult) {
    const lat = parseFloat(result.lat)
    const lng = parseFloat(result.lon)
    if (!isNaN(lat) && !isNaN(lng) && mapRef.current) {
      mapRef.current.panTo({ lat, lng })
      mapRef.current.setZoom(13)
    }
    setQuery(result.display_name.split(",").slice(0, 2).join(",").trim())
    setShowResults(false)
  }

  // Fermer le dropdown au clic extérieur
  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener("pointerdown", onPointerDown)
    return () => document.removeEventListener("pointerdown", onPointerDown)
  }, [])

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <section className="agenda-map-section" id="agenda-map">
      <div className="container">
        <div className="agenda-map-grid">

          {/* ── Texte à gauche ─────────────────────────────────────────── */}
          <div className="agenda-map-copy">
            <span className="section-label">{t("Cartographie")}</span>
            <h2>{t("Explorer les événements sur la carte")}</h2>
            <p>{t("Zoomez, déplacez la carte et cliquez sur les marqueurs pour repérer rapidement les villes, les festivals et les grands rendez-vous à venir.")}</p>
          </div>

          {/* ── Carte + barre de recherche ──────────────────────────────── */}
          <div className="agenda-map-shell">

            {/* Barre de recherche */}
            <div className="gmap-search" ref={searchRef}>
              <svg className="gmap-search-icon" width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <circle cx="7.5" cy="7.5" r="5.5" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M13 13l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <input
                type="text"
                className="gmap-search-input"
                value={query}
                onChange={handleSearchChange}
                onKeyDown={handleSearchKeyDown}
                placeholder={t("Rechercher une ville, un théâtre, une adresse…")}
                aria-label={t("Rechercher un lieu sur la carte")}
                aria-expanded={showResults}
                aria-autocomplete="list"
                autoComplete="off"
              />
              {searching && <span className="gmap-search-spinner" aria-hidden="true" />}
              {query && (
                <button
                  className="gmap-search-clear"
                  type="button"
                  aria-label="Effacer la recherche"
                  onClick={() => { setQuery(""); setResults([]); setShowResults(false) }}
                >×</button>
              )}
              {showResults && results.length > 0 && (
                <ul className="gmap-search-results" role="listbox">
                  {results.map(r => (
                    <li
                      key={r.place_id}
                      className="gmap-search-result"
                      role="option"
                      onClick={() => handleSelectPlace(r)}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/>
                      </svg>
                      <span>{r.display_name.split(",").slice(0, 3).join(", ")}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Conteneur Google Maps */}
            <div
              ref={mapNodeRef}
              className="agenda-gmap"
              aria-label={t("Carte interactive des événements danse")}
              role="region"
            />
          </div>

        </div>
      </div>
    </section>
  )
}
