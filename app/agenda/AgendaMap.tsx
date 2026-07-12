"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import type { AgendaEvent } from "./agenda-data"
import { formatAgendaDateRange, resolveAgendaEventLocation } from "./agenda-data"

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

type LeafletModule = typeof import("leaflet")
type LeafletMap = import("leaflet").Map
type LeafletLayerGroup = import("leaflet").LayerGroup

const DEFAULT_CENTER: [number, number] = [46.7, 2.25]
const DEFAULT_ZOOM = 6

function getEventGroups(events: AgendaEvent[]) {
  const groups = new Map<string, EventGroup>()

  events.forEach((event) => {
    const location = resolveAgendaEventLocation(event)
    if (!location.isComplete || typeof location.latitude !== "number" || typeof location.longitude !== "number") return

    const key = `${location.latitude.toFixed(2)}-${location.longitude.toFixed(2)}`
    const group = groups.get(key)

    if (group) {
      group.events.push(event)
      return
    }

    groups.set(key, {
      key,
      lat: location.latitude,
      lng: location.longitude,
      events: [event],
    })
  })

  return Array.from(groups.values())
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
}

function fitMapToEvents(L: LeafletModule, map: LeafletMap, events: AgendaEvent[], animate = false) {
  const coordinates = events
    .map((event) => resolveAgendaEventLocation(event))
    .filter(
      (location): location is ReturnType<typeof resolveAgendaEventLocation> & { latitude: number; longitude: number } =>
        location.isComplete && typeof location.latitude === "number" && typeof location.longitude === "number"
    )

  if (coordinates.length === 0) {
    map.setView(DEFAULT_CENTER, DEFAULT_ZOOM, { animate })
    return
  }

  const bounds = L.latLngBounds(
    coordinates.map((location) => [location.latitude, location.longitude] as [number, number])
  )

  map.fitBounds(bounds.pad(0.22), { maxZoom: 7, animate })
}

function getPopupHtml(group: EventGroup) {
  if (group.events.length === 1) {
    const event = group.events[0]
    const eventLink = `/sortir/${event.slug}`

    return `
      <article class="agenda-leaflet-popup">
        ${
          event.image
            ? `<img src="${escapeHtml(event.image)}" alt="${escapeHtml(event.title)}" loading="lazy" />`
            : ""
        }
        <span>${escapeHtml(event.category)}</span>
        <strong>${escapeHtml(event.title)}</strong>
        <p>${escapeHtml(formatAgendaDateRange(event))} · ${escapeHtml(event.venue)} · ${escapeHtml(event.city)}</p>
        <p>${escapeHtml(event.price)}</p>
        ${
          eventLink
            ? `<a href="${escapeHtml(eventLink)}" target="_blank" rel="noopener noreferrer">Voir l'événement</a>`
            : "<em>À compléter</em>"
        }
      </article>
    `
  }

  return `
    <article class="agenda-leaflet-popup agenda-leaflet-popup--cluster">
      <span>${group.events.length} événements</span>
      <strong>${escapeHtml(group.events[0].city)}</strong>
      <ul>
        ${group.events
          .map(
            (event) => {
              const eventLink = `/sortir/${event.slug}`

              return `
              <li>
                ${
                  eventLink
                    ? `<a href="${escapeHtml(eventLink)}" target="_blank" rel="noopener noreferrer">${escapeHtml(event.title)}</a>`
                    : `<strong>${escapeHtml(event.title)}</strong>`
                }
                <small>${escapeHtml(formatAgendaDateRange(event))}</small>
              </li>
            `
            }
          )
          .join("")}
      </ul>
    </article>
  `
}

function createMarkerIcon(L: LeafletModule, group: EventGroup) {
  const isCluster = group.events.length > 1

  return L.divIcon({
    className: isCluster ? "agenda-leaflet-marker is-cluster" : "agenda-leaflet-marker",
    html: `
      <span class="agenda-leaflet-marker-core">
        ${isCluster ? `<strong>${group.events.length}</strong>` : "<i></i>"}
      </span>
    `,
    iconSize: isCluster ? [46, 46] : [34, 34],
    iconAnchor: isCluster ? [23, 23] : [17, 17],
    popupAnchor: [0, -18],
  })
}

export default function AgendaMap({ events, activeSlug, onSelectEvent }: AgendaMapProps) {
  const mapNodeRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<LeafletMap | null>(null)
  const layerRef = useRef<LeafletLayerGroup | null>(null)
  const eventsRef = useRef(events)
  const groups = useMemo(() => getEventGroups(events), [events])
  const [mapReady, setMapReady] = useState(false)

  useEffect(() => {
    eventsRef.current = events
  }, [events])

  useEffect(() => {
    let cancelled = false

    async function setupMap() {
      if (!mapNodeRef.current || mapRef.current) return

      const L = await import("leaflet")

      if (cancelled || !mapNodeRef.current) return

      const map = L.map(mapNodeRef.current, {
        center: DEFAULT_CENTER,
        zoom: DEFAULT_ZOOM,
        minZoom: 5,
        maxZoom: 18,
        scrollWheelZoom: true,
        zoomControl: false,
        attributionControl: false,
      })

      L.control.zoom({ position: "topright" }).addTo(map)
      L.control
        .attribution({ position: "bottomleft", prefix: false })
        .addAttribution('&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>')
        .addTo(map)

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        detectRetina: true,
      }).addTo(map)

      map.on("click", () => {
        map.closePopup()
        fitMapToEvents(L, map, eventsRef.current, true)
      })

      mapRef.current = map
      layerRef.current = L.layerGroup().addTo(map)
      setMapReady(true)
    }

    setupMap()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function renderMarkers() {
      const map = mapRef.current
      const layer = layerRef.current
      if (!mapReady || !map || !layer) return

      const L = await import("leaflet")
      if (cancelled) return

      layer.clearLayers()

      groups.forEach((group) => {
        const marker = L.marker([group.lat, group.lng], {
          icon: createMarkerIcon(L, group),
          keyboard: true,
          title:
            group.events.length > 1
              ? `${group.events.length} événements à ${group.events[0].city}`
              : group.events[0].title,
        })

        marker.bindPopup(getPopupHtml(group), {
          closeButton: false,
          className: "agenda-leaflet-popup-shell",
          maxWidth: 320,
          minWidth: 240,
        })

        marker.on("click", (event) => {
          L.DomEvent.stopPropagation(event.originalEvent)
          onSelectEvent?.(group.events[0])

          map.flyTo([group.lat, group.lng], group.events.length > 1 ? 11 : 12, {
            duration: 0.75,
          })
        })

        marker.addTo(layer)
      })

      fitMapToEvents(L, map, events, false)

      window.setTimeout(() => map.invalidateSize(), 120)
    }

    renderMarkers()

    return () => {
      cancelled = true
    }
  }, [events, groups, mapReady, onSelectEvent])

  useEffect(() => {
    const selectedEvent = events.find((event) => event.slug === activeSlug)
    if (!selectedEvent) return

    const location = resolveAgendaEventLocation(selectedEvent)
    if (
      mapRef.current &&
      location.isComplete &&
      typeof location.latitude === "number" &&
      typeof location.longitude === "number"
    ) {
      mapRef.current.flyTo([location.latitude, location.longitude], 12, {
        duration: 0.7,
      })
    }
  }, [activeSlug, events])

  useEffect(() => {
    return () => {
      mapRef.current?.remove()
      mapRef.current = null
      layerRef.current = null
    }
  }, [])

  return (
    <section className="agenda-map-section" id="agenda-map">
      <div className="container">
        <div className="agenda-map-grid">
          <div className="agenda-map-copy">
            <span className="section-label">Cartographie</span>
            <h2>Explorer les événements sur la carte</h2>
            <p>
              Zoomez, déplacez la carte et cliquez sur les marqueurs pour repérer
              rapidement les villes, les festivals et les grands rendez-vous à venir.
            </p>
          </div>

          <div className="agenda-map-shell">
            <div
              ref={mapNodeRef}
              className="agenda-leaflet-map"
              aria-label="Carte interactive des événements danse"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
