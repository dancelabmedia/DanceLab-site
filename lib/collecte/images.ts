/**
 * lib/collecte/images.ts
 * Recherche du visuel officiel d'un événement sur sa propre page (billetterie
 * ou site de l'organisateur), avec contrôles de correspondance :
 *
 *   1. la page doit être celle de l'événement (pas une page d'accueil ni une
 *      liste « saison », « programmation »…) ;
 *   2. le titre de la page doit reprendre le titre de l'événement ;
 *   3. l'image ne doit pas être le visuel par défaut du site (comparaison avec
 *      la page d'accueil) ni un logo ;
 *   4. l'URL de l'image doit répondre et renvoyer une image.
 *
 * Toute entrée qui échoue à un contrôle reste sans image : le site garde alors
 * le visuel de remplacement actuel.
 */

import { fetchWithRetry } from "./http"
import { normalizeKey } from "./rules"

export const IMAGE_STATUS = {
  openData: "Officielle (open data Ville de Paris)",
  official: "Officielle (page de l'événement)",
  manual: "Ajoutée à la main",
  refused: "Refusée",
  none: "Aucune trouvée",
} as const

export const IMAGE_RIGHTS = {
  openData: "Jeu de données ouvert de la Ville de Paris (licence ODbL), crédit photo affiché",
  official:
    "Visuel promotionnel publié par l'organisateur sur la page de l'événement, affiché avec crédit et lien vers la source",
} as const

export type FoundImage = {
  url: string
  sourceUrl: string
  credit: string
  alt: string
}

const USER_AGENT = "Mozilla/5.0 (compatible; DanceLabAgenda/1.0; +https://dance-lab-site.vercel.app)"

/** Mots d'un titre qui permettent de reconnaître l'événement. */
const STOP = new Set([
  "les", "des", "une", "aux", "pour", "avec", "par", "sur", "dans", "the", "and", "from",
  "danse", "spectacle", "festival", "paris", "theatre", "saison", "creation", "compagnie", "cie",
  "ballet", "opera", "edition", "tournee", "version", "musical", "musicale", "comedie",
  "2024", "2025", "2026", "2027", "2028",
])

export function titleTokens(value: string): string[] {
  return normalizeKey(value)
    .split(" ")
    .filter((t) => t.length >= 3 && !STOP.has(t))
}

/** Pages qui ne sont pas la page d'un événement précis. */
export function isGenericPage(pageUrl: string): boolean {
  let url: URL
  try {
    url = new URL(pageUrl)
  } catch {
    return true
  }
  const segments = url.pathname.split("/").filter(Boolean)
  const meaningful = segments.filter((s) => !/^(fr|en|de|es|it|[a-z]{2}-[a-z]{2})$/i.test(s))
  if (meaningful.length === 0) return true
  const last = meaningful[meaningful.length - 1].toLowerCase()
  return /^(saison|saisons|programmation|programme|agenda|spectacles?|evenements?|events?|danse|billetterie|calendrier|accueil|home|index(\.html?|\.php)?)$/.test(
    last
  )
}

function isLogoLike(imageUrl: string): boolean {
  return /logo|favicon|placeholder|default|mainvisu|share[-_]?image|og[-_]?default|apple-touch/i.test(imageUrl)
}

function decodeEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim()
}

/** Lit les balises <meta> d'une page, quel que soit l'ordre des attributs. */
export function readMeta(html: string): Record<string, string> {
  const meta: Record<string, string> = {}
  for (const tag of html.match(/<meta\b[^>]*>/gi) ?? []) {
    const key = /\b(?:property|name|itemprop)\s*=\s*["']([^"']+)["']/i.exec(tag)?.[1]?.toLowerCase()
    const content = /\bcontent\s*=\s*["']([^"']*)["']/i.exec(tag)?.[1]
    if (key && content && !meta[key]) meta[key] = decodeEntities(content)
  }
  const title = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1]
  if (title) meta["html:title"] = decodeEntities(title.replace(/\s+/g, " "))
  return meta
}

export function pickImage(meta: Record<string, string>, baseUrl: string): string {
  const raw = meta["og:image:secure_url"] || meta["og:image"] || meta["og:image:url"] || meta["twitter:image"] || meta["twitter:image:src"] || meta["image"]
  if (!raw) return ""
  try {
    const url = new URL(raw, baseUrl)
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString().replace(/^http:/, "https:") : ""
  } catch {
    return ""
  }
}

/**
 * Parties d'un titre de fiche à retrouver sur la page : l'œuvre et l'artiste
 * (« The Last Hamlet — Ben Duke / Lost Dog (Théâtre de la Ville) » →
 * « The Last Hamlet » + « Ben Duke »). Le lieu et les parenthèses sont ignorés.
 */
export function requiredParts(eventTitle: string): string[][] {
  const cleaned = eventTitle.replace(/\([^)]*\)/g, " ")
  return cleaned
    .split(/\s[—–]\s|\s-\s/)
    .slice(0, 2)
    .map((part) => titleTokens(part.split(/\s\/\s|:|,|\|/)[0] ?? ""))
    .filter((tokens) => tokens.length > 0)
}

/** La page reprend-elle l'œuvre et l'artiste de la fiche ? */
export function titlesMatch(eventTitle: string, pageText: string): boolean {
  const parts = requiredParts(eventTitle)
  if (!parts.length) return false
  const page = new Set(titleTokens(pageText))
  return parts.every((tokens) => tokens.every((t) => page.has(t)))
}

/** Rubriques qui ne concernent pas la danse (ex. l'opéra « Roméo et Juliette »). */
export function isNonDanceSection(pageUrl: string): boolean {
  try {
    return /\/(opera|operas|lyrique|concerts?|musique|cinema|recitals?)(\/|$)/i.test(new URL(pageUrl).pathname)
  } catch {
    return true
  }
}

async function getHtml(url: string): Promise<string | null> {
  try {
    const response = await fetchWithRetry(
      url,
      { headers: { "User-Agent": USER_AGENT, Accept: "text/html,application/xhtml+xml" }, redirect: "follow" },
      { attempts: 2, timeoutMs: 15_000, baseDelayMs: 500 }
    )
    if (!response.ok) return null
    const type = response.headers.get("content-type") ?? ""
    if (!/html/i.test(type)) return null
    // Les balises utiles sont dans <head> : 400 Ko suffisent largement.
    return (await response.text()).slice(0, 400_000)
  } catch {
    return null
  }
}

async function imageResponds(url: string): Promise<boolean> {
  try {
    const response = await fetchWithRetry(
      url,
      { method: "GET", headers: { "User-Agent": USER_AGENT, Range: "bytes=0-2047" }, redirect: "follow" },
      { attempts: 2, timeoutMs: 15_000, baseDelayMs: 500 }
    )
    const type = response.headers.get("content-type") ?? ""
    response.body?.cancel().catch(() => {})
    return (response.ok || response.status === 206) && /^image\//i.test(type)
  } catch {
    return false
  }
}

const homepageImages = new Map<string, Promise<string>>()

/** Visuel par défaut du site (celui de sa page d'accueil), mis en cache par domaine. */
function defaultImageOf(pageUrl: string): Promise<string> {
  const origin = new URL(pageUrl).origin
  if (!homepageImages.has(origin)) {
    homepageImages.set(
      origin,
      getHtml(origin + "/").then((html) => (html ? pickImage(readMeta(html), origin) : ""))
    )
  }
  return homepageImages.get(origin)!
}

export type ImageLookup = { image: FoundImage | null; reason: string }

/**
 * Sur une page générale (accueil, liste de la saison…), cherche le lien qui
 * mène à la page de l'événement : texte du lien ou adresse reprenant le titre.
 */
export function findEventLink(html: string, baseUrl: string, eventTitle: string): string {
  const base = new URL(baseUrl)
  const candidates: Array<{ url: string; score: number }> = []
  const wanted = titleTokens(eventTitle.split(/\s[—–-]\s|\s\/\s|\(|:/)[0] ?? eventTitle)
  if (!wanted.length) return ""
  for (const match of html.matchAll(/<a\b[^>]*href\s*=\s*["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    let url: URL
    try {
      url = new URL(decodeEntities(match[1]), base)
    } catch {
      continue
    }
    if (url.hostname.replace(/^www\./, "") !== base.hostname.replace(/^www\./, "")) continue
    if (isGenericPage(url.toString())) continue
    const anchor = decodeEntities(match[2].replace(/<[^>]+>/g, " ").replace(/\s+/g, " "))
    const slug = decodeURIComponent(url.pathname).replace(/[-_/]+/g, " ")
    if (isNonDanceSection(url.toString())) continue
    const inAnchor = wanted.every((t) => normalizeKey(anchor).split(" ").includes(t))
    const inSlug = wanted.every((t) => normalizeKey(slug).split(" ").includes(t))
    if (inAnchor || inSlug) candidates.push({ url: url.toString(), score: (inAnchor ? 1 : 0) + (inSlug ? 2 : 0) })
  }
  candidates.sort((a, b) => b.score - a.score)
  return candidates[0]?.url ?? ""
}

export async function findOfficialImage(eventTitle: string, pageUrl: string): Promise<ImageLookup> {
  if (!/^https?:\/\//i.test(pageUrl)) return { image: null, reason: "Pas de lien officiel" }

  let html: string | null
  if (isGenericPage(pageUrl)) {
    // Le lien mène à une page générale : on cherche la page de l'événement dedans.
    const listing = await getHtml(pageUrl)
    const eventUrl = listing ? findEventLink(listing, pageUrl, eventTitle) : ""
    if (!eventUrl) return { image: null, reason: "Le lien mène à une page générale où l'événement est introuvable" }
    pageUrl = eventUrl
  }
  html = await getHtml(pageUrl)
  if (!html) return { image: null, reason: "Page officielle inaccessible" }

  if (isNonDanceSection(pageUrl)) return { image: null, reason: "La page concerne un opéra ou un concert, pas de la danse" }

  const meta = readMeta(html)
  const pageText = [
    meta["og:title"], meta["html:title"], meta["twitter:title"], meta["og:description"], meta["description"], meta["twitter:description"],
  ].filter(Boolean).join(" ")
  if (!titlesMatch(eventTitle, pageText)) return { image: null, reason: "La page ne correspond pas au titre de l'événement" }

  const url = pickImage(meta, pageUrl)
  if (!url) return { image: null, reason: "Aucun visuel déclaré sur la page" }
  if (isLogoLike(url)) return { image: null, reason: "Le visuel trouvé est un logo ou une image par défaut" }

  const fallback = await defaultImageOf(pageUrl)
  if (fallback && fallback === url) return { image: null, reason: "Le visuel trouvé est celui de la page d'accueil du site" }

  if (!(await imageResponds(url))) return { image: null, reason: "L'image ne se charge pas" }

  const site = meta["og:site_name"] || new URL(pageUrl).hostname.replace(/^www\./, "")
  return {
    image: {
      url,
      sourceUrl: pageUrl,
      credit: site,
      alt: meta["og:image:alt"] || eventTitle,
    },
    reason: "",
  }
}

/**
 * Un même visuel utilisé pour plusieurs événements différents est un visuel
 * générique (bannière de saison, image de festival…) : on l'écarte.
 */
export function findSharedImages(entries: Array<{ title: string; imageUrl: string }>): Set<string> {
  const titlesByImage = new Map<string, Set<string>>()
  for (const { title, imageUrl } of entries) {
    if (!imageUrl) continue
    const set = titlesByImage.get(imageUrl) ?? new Set<string>()
    set.add(titleTokens(title).slice(0, 3).join(" "))
    titlesByImage.set(imageUrl, set)
  }
  return new Set(Array.from(titlesByImage.entries()).filter(([, titles]) => titles.size >= 3).map(([url]) => url))
}
