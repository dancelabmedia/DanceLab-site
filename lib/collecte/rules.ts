/**
 * lib/collecte/rules.ts
 * Règles métier de la collecte : classement, disciplines, décision de
 * publication, empreinte de changement, dédoublonnage et calendrier.
 *
 * Fonctions pures (aucun appel réseau) : elles sont couvertes par
 * tests/collecte.test.ts.
 */

import { PUBLICATION, type CollectedEvent, type PublicationDecision } from "./types"

// ─── Texte ────────────────────────────────────────────────────────────────────

export function stripHtml(value: string | null | undefined): string {
  if (!value) return ""
  return value
    .replace(/<br\s*\/?>|<\/p>|<\/li>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&rsquo;/g, "’")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n+/g, "\n")
    .trim()
}

export function normalizeKey(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[«»"“”'’]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
}

// ─── Détection danse ──────────────────────────────────────────────────────────

/** Mots qui désignent clairement la danse (évite « Bal Blomet », « battle de puzzle »…). */
const STRICT_DANCE =
  /\bdans(e|es|eur|eurs|euse|euses|er)\b|ballet|chor[ée]graph|hip[- ]hop|breaking|break ?dance|pole dance|tarentelle|konpa|nihon buy|tango|salsa|flamenco|krump|voguing|waacking|claquettes/i

export function looksLikeDance(text: string): boolean {
  return STRICT_DANCE.test(text)
}

// ─── Disciplines ──────────────────────────────────────────────────────────────

const DISCIPLINES_SHORT: Array<[string, RegExp]> = [
  ["Hip-hop / Breaking", /hip[- ]hop|breaking|break ?dance|b-?boy|krump|popping|locking|house dance/i],
  ["Contemporain", /contemporain/i],
  ["Classique / Ballet", /ballet|danse classique|n[ée]oclassique/i],
  ["Jazz", /\bjazz\b/i],
  ["Danses de couple", /tango|salsa|bachata|kizomba|swing|lindy|rock|valse|konpa|danse en couple|danse de salon/i],
  ["Danses du monde / traditionnelles", /tarentelle|folk|traditionnel|africain|bollywood|kathak|bharata|nihon buy|flamenco|orientale|baroque|capoeira/i],
  ["Voguing / Ballroom", /voguing|ballroom|waacking/i],
  ["Claquettes", /claquettes|tap dance/i],
  ["Pole dance", /pole dance/i],
]

/** Dans le texte long, on ne retient que les mentions sans ambiguïté. */
const DISCIPLINES_LONG: Array<[string, RegExp]> = [
  ["Hip-hop / Breaking", /hip[- ]hop|breaking|krump|popping|house dance/i],
  ["Contemporain", /danse contemporaine|chor[ée]graphe contemporain/i],
  ["Classique / Ballet", /ballet|danse classique|n[ée]oclassique/i],
  ["Jazz", /danse jazz|modern jazz/i],
  ["Danses de couple", /tango|salsa|bachata|kizomba|lindy|danse de salon/i],
  ["Danses du monde / traditionnelles", /flamenco|danse africaine|danse orientale|bollywood|kathak|bharata|danse baroque|danse traditionnelle|capoeira/i],
  ["Voguing / Ballroom", /voguing|ballroom|waacking/i],
]

export function detectDisciplines(titleAndSummary: string, longText = ""): string[] {
  const found = DISCIPLINES_SHORT.filter(([, re]) => re.test(titleAndSummary)).map(([name]) => name)
  for (const [name, re] of DISCIPLINES_LONG) {
    if (!found.includes(name) && re.test(longText)) found.push(name)
  }
  return found
}

// ─── Type d'événement (options existantes du champ Notion « Type ») ─────────

export function classifyType(title: string, summary: string, sourceTags: string): string {
  const head = `${title} ${summary}`
  const t = title.toLowerCase()
  if (/\bstages?\b|masterclass|master class|workshop/.test(t)) return "Stage / Atelier"
  if (/battle|championnat|championship|comp[ée]tition|concours|breakleague|contest/i.test(head)) return "Battle / Compétition"
  if (/\bcours\b|initiation|atelier/.test(t) || /Atelier/.test(sourceTags)) return "Stage / Atelier"
  if (/\bbal\b|soir[ée]e dansante|boum|guinguette|milonga/.test(t)) return "Bal / Performance gratuite"
  if (/Conférence/.test(sourceTags)) return "Conférence / Rencontre"
  if (/Expo/.test(sourceTags) && !/Danse/.test(sourceTags)) return "Exposition"
  if (/Festival/.test(sourceTags) || /festival/.test(t)) return "Festival"
  if (/com[ée]die musicale/.test(t)) return "Comédie musicale"
  return "Spectacle / Création"
}

// ─── Géographie ───────────────────────────────────────────────────────────────

/** Boîte englobante large de l'Île-de-France. */
export function isInIleDeFrance(lat: number | null, lon: number | null): boolean {
  if (lat === null || lon === null) return false
  return lat > 48.1 && lat < 49.25 && lon > 1.4 && lon < 3.6
}

export function arrondissement(postalCode: string): string | null {
  const m = /^750(\d\d)$/.exec(postalCode.trim())
  if (!m) return postalCode.trim() === "75116" ? "16e" : null
  const n = Number(m[1])
  if (n < 1 || n > 20) return null
  return n === 1 ? "1er" : `${n}e`
}

// ─── Dates & calendrier (heure de Paris) ──────────────────────────────────────

export function parisParts(date: Date) {
  const parts = new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    weekday: "short",
    hourCycle: "h23",
  }).formatToParts(date)
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? ""
  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: Number(get("hour")),
    minute: Number(get("minute")),
    weekday: get("weekday").replace(".", ""), // "lun", "mar"…
  }
}

/** Date du jour à Paris au format YYYY-MM-DD. */
export function parisToday(now = new Date()): string {
  const p = parisParts(now)
  return `${p.year}-${p.month}-${p.day}`
}

/**
 * Vercel planifie en UTC. Deux déclenchements (3 h et 4 h UTC le lundi)
 * couvrent l'heure d'été et l'heure d'hiver ; seul celui qui tombe entre
 * 5 h et 5 h 59 à Paris lance réellement la collecte.
 */
export function isWeeklySlot(now = new Date()): boolean {
  const p = parisParts(now)
  return p.weekday === "lun" && p.hour === 5
}

/** Prochain lundi 5 h (heure de Paris), renvoyé en ISO UTC. */
export function nextWeeklyRun(now = new Date()): string {
  for (let addHours = 0; addHours <= 24 * 8; addHours++) {
    const candidate = new Date(now.getTime() + addHours * 3600_000)
    candidate.setUTCMinutes(0, 0, 0)
    if (candidate.getTime() <= now.getTime()) continue
    const p = parisParts(candidate)
    if (p.weekday === "lun" && p.hour === 5) return candidate.toISOString()
  }
  return ""
}

export function dayOf(value: string | null): string | null {
  return value ? value.slice(0, 10) : null
}

export function isExpired(event: Pick<CollectedEvent, "startDate" | "endDate">, today: string): boolean {
  const end = dayOf(event.endDate) ?? dayOf(event.startDate)
  return Boolean(end && end < today)
}

export function seasonOf(day: string | null): string | null {
  if (!day) return null
  const year = Number(day.slice(0, 4))
  const month = Number(day.slice(5, 7))
  const start = month >= 9 ? year : year - 1
  return `${start}-${start + 1}`
}

// ─── Décision de publication ──────────────────────────────────────────────────

/**
 * Publication automatique uniquement si l'entrée est complète, cohérente,
 * à venir, issue d'une source officielle et classée « danse » par la source.
 * Sinon : en attente de validation, avec les raisons.
 */
export function decidePublication(event: CollectedEvent, today: string): PublicationDecision {
  if (isExpired(event, today)) return { status: PUBLICATION.archived, reasons: ["Événement terminé"] }

  const reasons: string[] = []
  if (!event.taggedDance) reasons.push("Repéré par mot-clé, pas classé « danse » par la source")
  if (!event.startDate) reasons.push("Date manquante")
  if (event.startDate && event.endDate && dayOf(event.endDate)! < dayOf(event.startDate)!) {
    reasons.push("Dates incohérentes (fin avant début)")
  }
  if (!event.address || !event.postalCode) reasons.push("Adresse incomplète")
  if (!isInIleDeFrance(event.latitude, event.longitude)) reasons.push("Coordonnées absentes ou hors Île-de-France")
  if (!/^https:\/\//.test(event.sourceUrl)) reasons.push("Lien source manquant")
  if (!event.title || event.title.length < 3) reasons.push("Titre manquant")

  return reasons.length
    ? { status: PUBLICATION.pending, reasons }
    : { status: PUBLICATION.auto, reasons: [] }
}

// ─── Empreinte (détection des modifications) ──────────────────────────────────

/** Champs suivis : si l'un d'eux change dans la source, la fiche est mise à jour. */
export const TRACKED_FIELDS = [
  "title",
  "description",
  "startDate",
  "endDate",
  "schedule",
  "venue",
  "address",
  "postalCode",
  "city",
  "latitude",
  "longitude",
  "price",
  "ticketUrl",
  "officialUrl",
  "organizer",
  "imageUrl",
] as const

export function fingerprint(event: CollectedEvent): string {
  const payload = TRACKED_FIELDS.map((f) => String(event[f] ?? "")).join("␟")
  // FNV-1a 32 bits : suffisant pour détecter un changement, sans dépendance.
  let hash = 0x811c9dc5
  for (let i = 0; i < payload.length; i++) {
    hash ^= payload.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return (hash >>> 0).toString(16).padStart(8, "0")
}

// ─── Doublons ─────────────────────────────────────────────────────────────────

/** Clé « même événement » : titre normalisé + jour de début. */
export function duplicateKey(title: string, startDate: string | null): string {
  return `${normalizeKey(title)}|${dayOf(startDate) ?? "?"}`
}

/** Mots trop courants pour distinguer deux événements. */
const STOP_WORDS = new Set([
  "les", "des", "une", "aux", "pour", "avec", "par", "sur", "dans", "the", "and", "and",
  "danse", "spectacle", "festival", "automne", "paris", "theatre", "saison", "creation",
  "cie", "compagnie", "edition", "2025", "2026", "2027", "2028",
])

function significantTokens(title: string): Set<string> {
  return new Set(normalizeKey(title).split(" ").filter((t) => t.length >= 3 && !STOP_WORDS.has(t)))
}

type Dated = { title: string; startDate: string | null; endDate?: string | null }

/** Les périodes [début, fin] des deux événements se chevauchent-elles ? */
function datesOverlap(a: Dated, b: Dated): boolean {
  const aStart = dayOf(a.startDate)
  const bStart = dayOf(b.startDate)
  if (!aStart || !bStart) return aStart === bStart
  const aEnd = dayOf(a.endDate ?? null) ?? aStart
  const bEnd = dayOf(b.endDate ?? null) ?? bStart
  return aStart <= bEnd && bStart <= aEnd
}

/**
 * Deux fiches désignent le même événement si leurs périodes se chevauchent
 * et si leurs titres partagent l'essentiel de leurs mots significatifs
 * (« Chill in the City — La Place – Breakleague (Chaillot) » et
 * « « Chill in the City » de La Place - Breakleague », par exemple).
 */
export function sameEvent(a: Dated, b: Dated): boolean {
  if (!datesOverlap(a, b)) return false
  const ta = normalizeKey(a.title)
  const tb = normalizeKey(b.title)
  if (!ta || !tb) return false
  if (ta === tb) return true

  const wa = significantTokens(a.title)
  const wb = significantTokens(b.title)
  const smaller = Math.min(wa.size, wb.size)
  const larger = Math.max(wa.size, wb.size)
  if (smaller < 2) return false
  let shared = 0
  for (const t of wa) if (wb.has(t)) shared++
  // Deux mots en commun ne suffisent pas face à un titre beaucoup plus long
  // (« Casse-noisette » ≠ « Casse-Noisette de Noël — Ballet national d'Ukraine »).
  return shared / smaller >= 0.8 && (smaller >= 3 || shared / larger >= 0.67)
}

/** Dédoublonnage interne à une source : garde la version la plus récente. */
export function dedupeWithinSource(events: CollectedEvent[]): { kept: CollectedEvent[]; removed: number } {
  const byKey = new Map<string, CollectedEvent>()
  let removed = 0
  for (const event of events) {
    const key = `${duplicateKey(event.title, event.startDate)}|${normalizeKey(event.venue)}`
    const existing = byKey.get(key)
    if (!existing) {
      byKey.set(key, event)
      continue
    }
    removed++
    if ((event.sourceUpdatedAt ?? "") > (existing.sourceUpdatedAt ?? "")) byKey.set(key, event)
  }
  return { kept: Array.from(byKey.values()), removed }
}

/** Nombre de jours d'absence dans la source avant mise en attente. */
export const MISSING_GRACE_DAYS = 14

export function daysBetween(fromDay: string, toDay: string): number {
  return Math.round((Date.parse(`${toDay}T00:00:00Z`) - Date.parse(`${fromDay}T00:00:00Z`)) / 86_400_000)
}
