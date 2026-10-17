import { headers } from "next/headers"
import Link from "next/link"
import { notFound, permanentRedirect } from "next/navigation"
import type { ReactNode } from "react"
import AgendaVisual from "../../agenda/AgendaVisual"
import type { AgendaEvent, TourStop } from "../../agenda/agenda-data"
import { formatAgendaDateRange, getUrgencyBadge, todayIso, resolveAgendaEventLocation } from "../../agenda/agenda-data"import { requestLocale } from "@/lib/i18n/server"
import { uiText } from "@/data/i18n/messages"
import { SITE_URL } from "@/data/site"
import { getInitialAgendaEvents } from "../../agenda/initial-events"
import { resolveCanonicalEventSlug } from "@/lib/event-catalogue"
import { localizedHref } from "@/lib/i18n/routing"
import DistributionSection from "./DistributionSection"

export const dynamic = "force-dynamic"

async function getAgendaEvents() {
  const headersList = await headers()
  const host = headersList.get("host")
  const forwardedProtocol = headersList.get("x-forwarded-proto")
  const isLoopback = host?.startsWith("localhost") || host?.startsWith("127.0.0.1") || host?.startsWith("[::1]")
  const protocol = forwardedProtocol === "http" || isLoopback ? "http" : "https"
  const baseUrl = host ? `${protocol}://${host}` : SITE_URL
  const localEvents = getInitialAgendaEvents()
  const response = await fetch(`${baseUrl}/api/agenda?view=detail`, { cache: "no-store" })
  if (!response.ok) return localEvents
  const data = await response.json()
  const updatedEvents = Array.isArray(data.events) ? (data.events as AgendaEvent[]) : []
  const merged = new Map(localEvents.map(event => [event.slug, event]))
  updatedEvents.forEach(event => merged.set(event.slug, event))
  return [...merged.values()]
}

const HIDDEN_LABELS = new Set([
  // Métadonnées techniques
  "Disciplines", "Source des données", "État de vérification", "Thématiques source",
  "Crédit image", "Réservation", "Public", "Jeune public", "Horaires détaillés",
  "Organisateur", "Compagnie", "Artistes",
  // Distribution — désormais affichée dans la section Distribution dédiée
  "Distribution", "Distribution principale", "Distribution artistique",
  "Mise en scène", "Chorégraphie", "Direction artistique",
  "Mise en scène & chorégraphie", "Direction musicale",
  "Producteur", "Production",
  "Reines", "20e anniversaire",
])
const DANCE_EVIDENCE = /\b(danse|danseur|danseuse|ballet|chor[ée]graph|hip[ -]?hop|waacking|voguing|break|flamenco|salsa|contemporain|classique|performance corporelle)\b/i

type IconName = "calendar" | "pin" | "people" | "clock" | "map" | "tag" | "dance" | "building" | "ticket" | "info"

function DetailIcon({ name }: { name: IconName }) {
  const paths: Record<IconName, ReactNode> = {
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></>,
    pin: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
    people: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    map: <><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3Z"/><path d="M9 3v15M15 6v15"/></>,
    tag: <><path d="M20 13 11 22l-9-9V4h9Z"/><circle cx="7" cy="9" r="1.5"/></>,
    dance: <><circle cx="14" cy="4" r="2"/><path d="m9 22 2-7 3-3 2 4 4 2M5 10l5-3 4 2 4-1"/></>,
    building: <><path d="M3 21h18M5 21V8l7-5 7 5v13M9 21v-5h6v5M8 10h1M12 10h1M16 10h1"/></>,
    ticket: <><path d="M2 9a3 3 0 0 0 0 6v4h20v-4a3 3 0 0 0 0-6V5H2Z"/><path d="M13 5v2M13 11v2M13 17v2"/></>,
    info: <><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/></>,
  }
  return <svg className="sc-fiche-icon" viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>
}

function additionalValue(event: AgendaEvent, labels: string[]) {
  const wanted = new Set(labels.map(label => label.toLocaleLowerCase("fr")))
  return event.additionalInfo?.find(item => wanted.has(item.label.toLocaleLowerCase("fr")))?.value?.trim() || ""
}

function getRecommendations(event: AgendaEvent, events: AgendaEvent[]) {
  const disciplines = new Set((event.disciplines ?? []).map(item => item.toLocaleLowerCase("fr")))
  return events.filter(item => item.slug !== event.slug && item.image && DANCE_EVIDENCE.test([item.title, item.description, ...(item.disciplines ?? [])].join(" "))).map(item => ({
    item,
    score: (item.disciplines ?? []).filter(value => disciplines.has(value.toLocaleLowerCase("fr"))).length * 5 + (item.category === event.category ? 3 : 0) + (item.city === event.city ? 1 : 0),
  })).sort((a, b) => b.score - a.score || a.item.startDate.localeCompare(b.item.startDate)).slice(0, 4).map(result => result.item)
}

function verifiedPrice(value: string) {
  const price = value.trim()
  if (!price) return ""
  return /\bgratuit\b/i.test(price) || /\d(?:[\d.,\s]*)(?:€|euros?\b)/i.test(price) ? price : ""
}

function usefulDetail(item: { label: string; value: string }) {
  if (!item.value || HIDDEN_LABELS.has(item.label)) return false
  if (item.label === "Transports" && /\d{12,}/.test(item.value)) return false
  return true
}

/** Formate une plage de dates pour une étape de tournée. */
function formatTourStopDates(stop: TourStop) {
  const fmt = (d: string) => {
    const [year, month, day] = d.split("-")
    return `${day}.${month}.${year?.slice(-2)}`
  }
  const start = fmt(stop.startDate)
  if (stop.endDate && stop.endDate !== stop.startDate) return `${start} → ${fmt(stop.endDate)}`
  return start
}

/** Détecte les URLs dans un texte et les transforme en liens cliquables. */
const URL_PATTERN = /https?:\/\/[^\s<>"']+/g

function linkifyText(text: string): ReactNode {
  const parts: ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null
  URL_PATTERN.lastIndex = 0
  while ((match = URL_PATTERN.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }
    // Retirer la ponctuation finale éventuelle (., ;, ), …)
    const url = match[0].replace(/[.,;:!?)\]]+$/, "")
    const trailing = match[0].slice(url.length)
    parts.push(
      <a key={match.index} href={url} target="_blank" rel="noopener noreferrer" className="sc-fiche-ext-link">
        {url}
      </a>
    )
    if (trailing) parts.push(trailing)
    lastIndex = match.index + match[0].length
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex))
  return parts.length > 1 ? <>{parts}</> : parts.length === 1 ? parts[0] : text
}

export default async function SortirEventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const locale = await requestLocale()
  const canonicalSlug = resolveCanonicalEventSlug(slug)
  if (canonicalSlug !== slug) permanentRedirect(localizedHref(`/sortir/${canonicalSlug}`, locale))
  const t = (text: string) => uiText(locale, text)
  const events = await getAgendaEvents()
  const event = events.find(item => item.slug === slug || item.aliasSlugs?.includes(slug))
  if (!event) notFound()
  if (event.slug !== slug) permanentRedirect(localizedHref(`/sortir/${event.slug}`, locale))

  const location = resolveAgendaEventLocation(event)
  const reservationUrl = event.ticketUrl || event.officialUrl
  const dateRange = formatAgendaDateRange(event)
  const audience = additionalValue(event, ["Public", "Jeune public"])
  const company = additionalValue(event, ["Compagnie", "Organisateur", "Artistes"])
  const duration = event.duration || additionalValue(event, ["Durée"])
  const price = verifiedPrice(event.price)
  const details = (event.additionalInfo ?? []).filter(usefulDetail)
  const recommendations = getRecommendations(event, events)
  const gallery = [...new Set(event.gallery ?? [])].filter(Boolean)
  const mapQuery = encodeURIComponent(location.label || [event.venue, event.city].filter(Boolean).join(", "))
  const practical = [
    dateRange ? { icon: "calendar" as IconName, label: t("Dates"), value: dateRange } : null,
    event.time ? { icon: "clock" as IconName, label: t("Horaires"), value: event.time } : null,
    duration ? { icon: "clock" as IconName, label: t("Durée"), value: duration } : null,
    event.venue ? { icon: "pin" as IconName, label: t("Lieu"), value: event.venue } : null,
    location.label ? { icon: "map" as IconName, label: t("Adresse"), value: location.label } : null,
    audience ? { icon: "people" as IconName, label: t("Public"), value: audience } : null,
    price ? { icon: "tag" as IconName, label: t("Tarifs"), value: price } : null,
    event.disciplines?.length ? { icon: "dance" as IconName, label: t("Discipline"), value: event.disciplines.join(" · ") } : null,
    company ? { icon: "building" as IconName, label: t("Compagnie"), value: company } : null,
  ].filter((item): item is NonNullable<typeof item> => Boolean(item))

  // Badge affiché sur la page individuelle :
  // - niveau d'urgence si ≤ 7 jours restants et déjà commencé (3 niveaux)
  // - "À venir" si pas encore commencé
  // - rien si le spectacle est en cours sans urgence
  const today = todayIso()
  const urgency = getUrgencyBadge(event)
  const eventBadgeLabel = urgency
    ? t(urgency.label)
    : event.startDate > today
    ? t("À venir")
    : null
  const eventBadgeLevel = urgency ? urgency.level : event.startDate > today ? "soon" : null

  return <main className="sc-fiche">
    <section className="sc-fiche-hero">
      {event.image ? <img src={event.image} alt="" className="sc-fiche-hero-img" /> : <div className="sc-fiche-hero-placeholder" />}
      <div className="sc-fiche-hero-overlay" />
      <div className="container sc-fiche-hero-content"><div className="sc-fiche-hero-body">
        <div className="sc-fiche-badges">
          <span className="sc-fiche-category">{event.category}</span>
          {eventBadgeLabel && <span className={`sc-fiche-status${eventBadgeLevel ? ` sc-fiche-status--${eventBadgeLevel}` : ""}`} data-status={eventBadgeLevel ?? ""}>{eventBadgeLabel}</span>}        </div>
        <h1 className="sc-fiche-title">{event.title}</h1>
        {company ? <p className="sc-fiche-company">{company}</p> : null}
        {event.description ? <p className="sc-fiche-hero-description">{event.description}</p> : null}
        <div className="sc-fiche-hero-facts">
          {dateRange ? <div><DetailIcon name="calendar"/><span>{dateRange}</span></div> : null}
          {event.venue || event.city ? <div><DetailIcon name="pin"/><span>{[event.venue, event.city].filter(Boolean).join(" · ")}</span></div> : null}
          {audience ? <div><DetailIcon name="people"/><span>{audience}</span></div> : null}
        </div>
      </div></div>
    </section>

    <section className="sc-fiche-body">
      <div className="container sc-fiche-layout">
        <article className="sc-fiche-main">
          <section className="sc-fiche-section"><h2>{t("À propos du spectacle")}</h2><div className="sc-fiche-description">{event.description.split(/\n{2,}/).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div></section>
          {event.cast && event.cast.length > 0 ? <DistributionSection cast={event.cast} labels={{ distribution: t("Distribution"), seeAll: t("Voir toute la distribution"), collapse: t("Réduire la distribution"), of: t("sur"), artists: t("artistes") }} /> : null}
          {event.performances?.length ? <section className="sc-fiche-section"><h2>{t("Représentations")}</h2><dl className="sc-fiche-info-grid">{event.performances.map(performance => <div className="sc-fiche-info-card" key={`${performance.date}-${performance.time ?? ''}`}><DetailIcon name="calendar"/><div><dt>{new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${performance.date}T12:00:00Z`))}</dt><dd>{performance.time ?? event.time}{performance.ticketUrl ? <> · <a href={performance.ticketUrl} target="_blank" rel="noopener noreferrer">{t("Voir la billetterie")}</a></> : null}</dd></div></div>)}</dl></section> : null}
          {event.tourStops?.length ? <section className="sc-fiche-section sc-fiche-section--tour">
            <h2>{t("Toutes les dates de la tournée")}</h2>
            <p className="sc-fiche-tour-intro">{t("Ce spectacle est présenté dans plusieurs villes.")}</p>
            <div className="sc-fiche-tour-grid">
              {event.tourStops.map((stop, idx) => (
                <div className="sc-fiche-tour-stop" key={`${stop.city}-${stop.startDate}-${idx}`}>
                  <div className="sc-fiche-tour-stop-head">
                    <span className="sc-fiche-tour-city"><DetailIcon name="pin"/>{stop.city}</span>
                    <span className="sc-fiche-tour-dates">{formatTourStopDates(stop)}</span>
                  </div>
                  <div className="sc-fiche-tour-stop-body">
                    <span className="sc-fiche-tour-venue">{stop.venue}</span>
                    {stop.time ? <span className="sc-fiche-tour-time">{stop.time}</span> : null}
                    {stop.price ? <span className="sc-fiche-tour-price">{stop.price}</span> : null}
                    {stop.performances?.length ? (
                      <ul className="sc-fiche-tour-perfs">
                        {stop.performances.map((p, pi) => (
                          <li key={`${p.date}-${pi}`}>
                            {new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(new Date(`${p.date}T12:00:00Z`))}
                            {p.time ? ` · ${p.time}` : ""}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                  {stop.ticketUrl ? (
                    <a href={stop.ticketUrl} target="_blank" rel="noopener noreferrer" className="sc-fiche-tour-btn">
                      {t("Réserver")}
                    </a>
                  ) : null}
                </div>
              ))}
            </div>
          </section> : null}
          {practical.length ? <section className="sc-fiche-section"><h2>{t("Informations pratiques")}</h2><dl className="sc-fiche-info-grid">
            {practical.map(item => <div className="sc-fiche-info-card" key={`${item.label}-${item.value}`}><DetailIcon name={item.icon}/><div><dt>{item.label}</dt><dd>{linkifyText(item.value)}</dd></div></div>)}
          </dl></section> : null}
          {details.length ? <section className="sc-fiche-secondary-info" aria-label={t("Informations complémentaires")}>{details.map(item => <p key={`${item.label}-${item.value}`}><strong>{item.label}</strong><span>{linkifyText(item.value)}</span></p>)}</section> : null}
        </article>

        <aside className="sc-fiche-side">
          <section className="sc-fiche-booking">
            <div className="sc-fiche-card-heading"><DetailIcon name="ticket"/><h2>{t("Réservation")}</h2></div>
            <p>{t("Retrouvez les disponibilités et les tarifs sur la billetterie officielle.")}</p>
            <a href={reservationUrl} target="_blank" rel="noopener noreferrer" className="sc-fiche-ticket-btn">{t("Voir la billetterie")}</a>
            {price ? <div className="sc-fiche-price"><small>{t("Tarif")}</small><strong>{price}</strong></div> : null}
            <div className="sc-fiche-booking-note"><DetailIcon name="info"/><span>{event.time ? `${t("Horaires")} : ${event.time}` : t("Consultez la billetterie pour les informations actualisées.")}</span></div>
          </section>
          {(event.venue || location.label) ? <section className="sc-fiche-map-card"><iframe title={`${t("Localisation")} - ${event.title}`} src={`https://www.google.com/maps?q=${mapQuery}&output=embed`} loading="lazy" referrerPolicy="no-referrer-when-downgrade"/><a href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`} target="_blank" rel="noopener noreferrer">{t("Voir sur Google Maps")}</a></section> : null}
          {event.image && event.imageCredit && !/^inconnu$/i.test(event.imageCredit.trim()) ? (
            <p className="sc-fiche-source">
              {t("Visuel")} :{" "}
              {event.imageSourceUrl ? (
                <a href={event.imageSourceUrl} target="_blank" rel="noopener noreferrer">
                  {event.imageCredit}
                </a>
              ) : event.imageCredit}
            </p>
          ) : null}
          <p className="sc-fiche-source">{t("Source")} : <a href={event.officialUrl} target="_blank" rel="noopener noreferrer">{event.sourceLabel}</a></p>        </aside>
      </div>

      {gallery.length || event.videoUrl ? <section className="container sc-fiche-wide-section"><h2>{t("En images")}</h2><div className="sc-fiche-gallery">
        {gallery.map((image, index) => <a href={image} target="_blank" rel="noopener noreferrer" key={image}><img src={image} alt={`${event.title} - ${index + 1}`}/></a>)}
        {event.videoUrl ? <a className="sc-fiche-video" href={event.videoUrl} target="_blank" rel="noopener noreferrer"><span aria-hidden>▶</span><b>{t("Voir la vidéo officielle")}</b></a> : null}
      </div></section> : null}

      {recommendations.length ? <section className="container sc-fiche-wide-section sc-fiche-related"><h2>{t("Autour du spectacle")}</h2><p>{t("Découvrez d’autres événements qui pourraient vous intéresser.")}</p><div className="sc-fiche-related-grid">
        {recommendations.map(item => <Link href={`/sortir/${item.slug}`} className="sc-fiche-related-card" key={item.slug}><div className="sc-fiche-related-image"><img src={item.image} alt=""/><span>{item.category}</span></div><div className="sc-fiche-related-copy"><h3>{item.title}</h3><small><span>▣ {formatAgendaDateRange(item)}</span><span>⌖ {item.city}</span></small><i aria-hidden>→</i></div></Link>)}
      </div></section> : null}
    </section>
  </main>
}
