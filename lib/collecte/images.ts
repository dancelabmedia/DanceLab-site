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
  /** Trouvée mais pas assez sûre (score ou droits) : non affichée. */
  review: "À vérifier",
  /** L'image ne se charge plus : nouvelle recherche programmée. */
  broken: "Lien cassé",
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
  "dance", "company", "dancers", "show", "live",
  "2024", "2025", "2026", "2027", "2028",
])

export function titleTokens(value: string): string[] {
  // « l'Opéra » → « l opera » (et non « lopera »).
  return normalizeKey(value.replace(/['’`´]/g, " "))
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
  return /logo|favicon|placeholder|default|mainvisu|share[-_]?image|\/share\.(jpe?g|png)|\/partage\.(jpe?g|png)|og[-_]?default|apple-touch|gravatar|avatar/i.test(imageUrl)
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
    // Le guillemet ouvrant détermine le fermant (« content="Festival d'Avignon" »).
    const key = /\b(?:property|name|itemprop)\s*=\s*(["'])(.*?)\1/i.exec(tag)?.[2]?.toLowerCase()
    const content = /\bcontent\s*=\s*(["'])([\s\S]*?)\1/i.exec(tag)?.[2]
    if (key && content && !meta[key]) meta[key] = decodeEntities(content)
  }
  const ld = structuredImage(html)
  if (ld) meta["ld:image"] = decodeEntities(ld)
  const main = mainContentImage(html)
  if (main) meta["page:image"] = decodeEntities(main)
  const title = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1]
  if (title) meta["html:title"] = decodeEntities(title.replace(/\s+/g, " "))
  return meta
}

/** Image déclarée en données structurées (schema.org) ou en <link rel="image_src">. */
export function structuredImage(html: string): string {
  for (const block of html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const data = JSON.parse(block[1])
      const items = Array.isArray(data) ? data : data["@graph"] ?? [data]
      for (const item of items) {
        const image = item?.image
        const url = typeof image === "string" ? image : Array.isArray(image) ? (typeof image[0] === "string" ? image[0] : image[0]?.url) : image?.url
        if (typeof url === "string" && url) return url
      }
    } catch {}
  }
  return /<link[^>]+rel=["']image_src["'][^>]*href=["']([^"']+)["']/i.exec(html)?.[1] ?? ""
}

/**
 * Dernier recours si la page ne déclare aucun visuel : l'image principale du
 * contenu (bannière, couverture…), jamais un logo ou une icône.
 */
export function mainContentImage(html: string): string {
  const imgs = Array.from(html.matchAll(/<img\b[^>]*>/gi), (m) => m[0])
  const src = (tag: string) => /\b(?:data-src|src)\s*=\s*["']([^"']+)["']/i.exec(tag)?.[1] ?? ""
  const usable = imgs.filter((tag) => {
    const url = src(tag)
    return url && !/\.svg(\?|$)|^data:/i.test(url) && !/logo|icon|picto|partenaire|sponsor|avatar|gravatar|favicon|placeholder|pixel/i.test(url + tag)
  })
  const hero = usable.find((tag) => /\b(cover|hero|banner|header|slide|visuel|affiche|main)\b/i.test(tag) || /banner|banniere|bandeau|cover|hero|header|slide|visuel|affiche/i.test(src(tag)))
  // Uniquement une image identifiée comme visuel principal (bannière, couverture…).
  return src(hero ?? "")
}

/**
 * Image du contenu dont le nom de fichier reprend le titre de l'œuvre
 * (ex. « 4-saisons-pdc-web.jpg » pour « Les Quatre Saisons »).
 */
export function titledContentImage(html: string, eventTitle: string): string {
  const work = requiredParts(eventTitle)[0] ?? []
  if (!work.length) return ""
  for (const m of html.matchAll(/<img\b[^>]*>/gi)) {
    const url = /\b(?:data-src|src)\s*=\s*["']([^"']+)["']/i.exec(m[0])?.[1] ?? ""
    if (!url || /\.svg(\?|$)|^data:|logo|icon|picto|avatar/i.test(url)) continue
    const file = decodeURIComponent(url.split("?")[0].split("/").pop() ?? "")
    const words = new Set(titleTokens(file.replace(/[-_.]+/g, " ")))
    if (work.some((t) => t.length >= 3 && words.has(t))) return url
  }
  return ""
}

export function pickImage(meta: Record<string, string>, baseUrl: string): string {
  const raw = meta["og:image:secure_url"] || meta["og:image"] || meta["og:image:url"] || meta["twitter:image"] || meta["twitter:image:src"] || meta["image"] || meta["ld:image"] || meta["page:image"]
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

/**
 * La page reprend-elle l'œuvre et l'artiste de la fiche ? L'œuvre doit figurer
 * dans le titre ou la description de la page ; l'artiste peut figurer dans le
 * texte de la page (ex. TCE : titre « The Joffrey Ballet », œuvre dans le texte).
 */
export function titlesMatch(eventTitle: string, pageText: string, bodyText = ""): boolean {
  const parts = requiredParts(eventTitle)
  if (!parts.length) return false
  const head = new Set(titleTokens(pageText))
  const all = new Set([...head, ...titleTokens(bodyText)])
  const [first, ...others] = parts
  const firstInHead = first.every((t) => head.has(t))
  const othersInHead = others.every((tokens) => tokens.every((t) => head.has(t)))
  if (firstInHead && othersInHead) return true
  // Une des parties dans le titre, les autres au moins dans le texte de la page.
  const anyPartInHead = parts.some((tokens) => tokens.every((t) => head.has(t)))
  return anyPartInHead && parts.every((tokens) => tokens.every((t) => all.has(t)))
}

/** Texte visible du contenu principal (sans menus, scripts ni pied de page). */
export function visibleText(html: string): string {
  const body = (/<main[\s\S]*?<\/main>/i.exec(html)?.[0] ?? /<body[\s\S]*/i.exec(html)?.[0] ?? html)
    .replace(/<(script|style|noscript|nav|footer|header|aside)\b[\s\S]*?<\/\1>/gi, " ")
  return decodeEntities(body.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ")).slice(0, 12_000)
}

/** Rubriques qui ne concernent pas la danse (ex. l'opéra « Roméo et Juliette »). */
export function isNonDanceSection(pageUrl: string): boolean {
  try {
    return /\/(opera|operas|lyrique|concerts?|musique|cinema|recitals?)(\/|$)/i.test(new URL(pageUrl).pathname)
  } catch {
    return true
  }
}

/** Une requête à la fois par site, espacées d'une seconde (politesse et anti-blocage). */
const hostQueues = new Map<string, Promise<unknown>>()
const HOST_GAP_MS = Number(process.env.COLLECTE_HOST_GAP_MS) || 1_000

function throttled<T>(url: string, task: () => Promise<T>): Promise<T> {
  let host = ""
  try {
    host = new URL(url).hostname
  } catch {}
  const previous = hostQueues.get(host) ?? Promise.resolve()
  const run = previous.then(task, task)
  hostQueues.set(
    host,
    run.then(
      () => new Promise((r) => setTimeout(r, HOST_GAP_MS)),
      () => new Promise((r) => setTimeout(r, HOST_GAP_MS))
    )
  )
  return run
}

/** Pages de protection anti-robots renvoyées à la place du contenu. */
function isChallengePage(html: string): boolean {
  return /<title>\s*(just a moment|attention required|access denied|un instant|vérification|captcha|403 forbidden)/i.test(html) ||
    /cf-browser-verification|challenge-platform|_Incapsula_Resource|datadome/i.test(html.slice(0, 20_000))
}

/**
 * Disjoncteur par site : après 3 échecs d'affilée (site bloqué ou hors ligne),
 * le site n'est plus sollicité pendant cette exécution. Il sera retenté à la
 * collecte suivante (file d'attente avec délais progressifs).
 */
const hostFailures = new Map<string, number>()
const HOST_FAILURE_LIMIT = 3

export function hostIsTripped(url: string): boolean {
  try {
    return (hostFailures.get(new URL(url).hostname) ?? 0) >= HOST_FAILURE_LIMIT
  } catch {
    return false
  }
}

function recordHost(url: string, ok: boolean) {
  try {
    const host = new URL(url).hostname
    hostFailures.set(host, ok ? 0 : (hostFailures.get(host) ?? 0) + 1)
  } catch {}
}

async function getRaw(url: string, accept: string): Promise<{ text: string; type: string } | null> {
  if (hostIsTripped(url)) return null
  return throttled(url, async () => {
    try {
      const response = await fetchWithRetry(
        url,
        { headers: { "User-Agent": USER_AGENT, Accept: accept }, redirect: "follow" },
        { attempts: 2, timeoutMs: 15_000, baseDelayMs: 800 }
      )
      // 404 : la page n'existe pas (pas une panne du site).
      if (response.status === 404 || response.status === 410) {
        recordHost(url, true)
        return null
      }
      if (!response.ok) {
        recordHost(url, false)
        return null
      }
      recordHost(url, true)
      return { text: await response.text(), type: response.headers.get("content-type") ?? "" }
    } catch {
      recordHost(url, false)
      return null
    }
  })
}

async function getHtml(url: string): Promise<string | null> {
  for (let attempt = 0; attempt < 2; attempt++) {
    const raw = await getRaw(url, "text/html,application/xhtml+xml")
    if (!raw || !/html/i.test(raw.type)) return null
    // Les balises utiles sont dans <head> : 400 Ko suffisent largement.
    const html = raw.text.slice(0, 400_000)
    if (!isChallengePage(html)) return html
    await new Promise((r) => setTimeout(r, 4_000))
  }
  return null
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

/** Fiches qui décrivent une saison, un festival ou un lieu, et non un spectacle précis. */
export function isCollectiveTitle(eventTitle: string): boolean {
  return /^(saison|programmation|festival|collections?|cycle|visite|nuit blanche|f[êe]te|journ[ée]es|biennale|soir[ée]es|studios ouverts|galeries|camping|marathon|les conf[ée]rences|vid[ée]odanse|hivernales|rencontres|june events|suresnes cit[ée]s danse|plan d)\b/i.test(
    eventTitle.trim()
  )
}

// ─── Plans de site (sitemaps) ────────────────────────────────────────────────

const sitemapCache = new Map<string, Promise<string[]>>()
const MAX_SITEMAP_FILES = 40
const MAX_SITEMAP_URLS = 60_000

function locs(xml: string): string[] {
  return Array.from(xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi), (m) => decodeEntities(m[1]))
}

/** Toutes les adresses déclarées dans le plan du site (robots.txt, sitemap.xml…). */
export function sitemapUrls(origin: string): Promise<string[]> {
  if (!sitemapCache.has(origin)) {
    sitemapCache.set(
      origin,
      (async () => {
        const roots = new Set<string>()
        const robots = await getRaw(`${origin}/robots.txt`, "text/plain")
        for (const m of robots?.text.matchAll(/^\s*sitemap:\s*(\S+)/gim) ?? []) roots.add(m[1])
        if (!roots.size) ["/sitemap.xml", "/sitemap_index.xml", "/wp-sitemap.xml"].forEach((p) => roots.add(origin + p))

        const queue = Array.from(roots)
        const seen = new Set<string>()
        const pages: string[] = []
        while (queue.length && seen.size < MAX_SITEMAP_FILES && pages.length < MAX_SITEMAP_URLS) {
          const file = queue.shift()!
          if (seen.has(file)) continue
          seen.add(file)
          const raw = await getRaw(file, "application/xml,text/xml")
          if (!raw || !/<(urlset|sitemapindex)/i.test(raw.text)) continue
          const entries = locs(raw.text)
          if (/<sitemapindex/i.test(raw.text)) {
            // Priorité aux plans qui listent des spectacles ou des événements.
            entries.sort((a, b) => Number(/event|spectacle|show|programm|agenda|danse|post/i.test(b)) - Number(/event|spectacle|show|programm|agenda|danse|post/i.test(a)))
            queue.push(...entries)
          } else {
            pages.push(...entries)
          }
        }
        return pages
      })()
    )
  }
  return sitemapCache.get(origin)!
}

/** Pages qui ne présentent pas un événement (article, entretien, catégorie…). */
export function isNonEventPath(pageUrl: string): boolean {
  try {
    return /\/(entretiens?|interviews?|articles?|actualites?|actus?|news|blog|podcasts?|videos?|magazine|categorie|category|tag|artistes?|personnalites|presse|journal|mediatheque)(\/|$)/i.test(
      new URL(pageUrl).pathname
    ) || /\/(entretien|interview|rencontre-avec|portrait)[-_]/i.test(new URL(pageUrl).pathname)
  } catch {
    return true
  }
}

/**
 * Année de saison indiquée dans l'adresse (« saison-17-18 » → 2017,
 * « 2025-2026 » → 2025). Sert à écarter les pages d'anciennes productions.
 */
export function seasonYearInPath(pageUrl: string): number | null {
  let path = ""
  try {
    path = new URL(pageUrl).pathname
  } catch {
    return null
  }
  const long = /(20\d\d)[-_/](20\d\d)/.exec(path)
  if (long) return Number(long[1])
  const short = /(?:saison|season)[-_/]?(\d\d)[-_/](\d\d)(?:\/|$|-)/i.exec(path) ?? /\/(\d\d)[-_](\d\d)\//.exec(path)
  if (short && Number(short[2]) === (Number(short[1]) + 1) % 100) return 2000 + Number(short[1])
  return null
}

/** Adresses du plan du site dont le chemin reprend le titre de l'œuvre. */
export async function sitemapCandidates(origin: string, eventTitle: string, eventYear?: number): Promise<string[]> {
  const [work, artist = []] = requiredParts(eventTitle)
  if (!work?.length) return []
  const urls = await sitemapUrls(origin)
  const scored: Array<{ url: string; score: number }> = []
  for (const url of urls) {
    let path: string
    try {
      path = decodeURIComponent(new URL(url).pathname)
    } catch {
      continue
    }
    if (isNonDanceSection(url) || isGenericPage(url) || isNonEventPath(url)) continue
    const season = seasonYearInPath(url)
    // Saison terminée avant l'événement : ancienne production, autre visuel.
    if (eventYear && season !== null && season < eventYear) continue
    const words = new Set(titleTokens(path.replace(/[-_/.]+/g, " ")))
    if (!work.every((t) => words.has(t))) continue
    let score = 10 + artist.filter((t) => words.has(t)).length * 3
    if (/(20)?26[-_/]?(20)?27|2026|2027/.test(path)) score += 2
    if (/\/(en|de|es)\//.test(path)) score -= 1
    if (/scolaire|groupes?|ateliers?/i.test(path)) score -= 2
    score -= path.split("/").length * 0.1
    scored.push({ url, score })
  }
  return scored.sort((a, b) => b.score - a.score).slice(0, 3).map((s) => s.url)
}

// ─── Score de confiance ──────────────────────────────────────────────────────

/** Seuils du score de confiance (sur 100). */
export const SCORE_PUBLISH = 75
export const SCORE_REVIEW = 55

/** Médias et agrégateurs : utiles pour trouver un événement, pas pour réutiliser ses images. */
const AGGREGATORS =
  /(^|\.)(offi\.fr|sceneweb\.fr|agendaculturel\.fr|unidivers\.fr|theatreinparis\.com|bachtrack\.com|festivalenfrance\.com|sortiraparis\.com|timeout\.(fr|com)|parisinfo\.com|telerama\.fr|lefigaro\.fr|lemonde\.fr|wikipedia\.org|facebook\.com|instagram\.com|youtube\.com|x\.com|twitter\.com|linkedin\.com|pinterest\.)/i
/** Billetteries : visuels fournis par le producteur. */
const TICKETING = /(^|\.)(fnacspectacles\.com|billetreduc\.com|ticketmaster\.fr|seetickets\.com|feverup\.com|mapado\.com|weezevent\.com|helloasso\.com|digitick\.com|shotgun\.live|dice\.fm|billetweb\.fr)/i

export type Provenance = "open data" | "officielle" | "billetterie" | "média ou agrégateur" | "autre site"

export function provenanceOf(pageUrl: string, trustedHosts: string[]): Provenance {
  let host = ""
  try {
    host = new URL(pageUrl).hostname.replace(/^www\./, "")
  } catch {
    return "autre site"
  }
  if (/(^|\.)paris\.fr$/.test(host)) return "open data"
  if (AGGREGATORS.test(host)) return "média ou agrégateur"
  if (TICKETING.test(host)) return "billetterie"
  if (trustedHosts.some((h) => h && (host === h || host.endsWith("." + h)))) return "officielle"
  return "autre site"
}

export type ImageScore = {
  total: number
  details: Record<string, number>
  /** Droits de réutilisation suffisamment établis pour une publication. */
  rightsOk: boolean
}

/** Années (2020-2039) citées dans une adresse ou un texte. */
export function yearsIn(value: string): number[] {
  return Array.from(new Set(Array.from(value.matchAll(/(?<!\d)(20[23]\d)(?!\d)/g), (m) => Number(m[1]))))
}

export type LookupContext = {
  title: string
  /** Année de début de saison (septembre → saison suivante). */
  eventYear?: number
  /** Année civile de l'événement. */
  calendarYear?: number
  venue?: string
  /** Domaines considérés comme officiels (lieu, organisateur, lien d'origine…). */
  trustedHosts: string[]
  directories: string[]
}

const UNKNOWN_VENUES = /^(à confirmer|a confirmer|hors paris|festival itinérant|espace public.*|)$/i

/** Calcule le score de confiance d'une page et de son visuel. */
export function scorePage(
  ctx: LookupContext,
  pageUrl: string,
  head: string,
  body: string,
  imageUrl: string,
  collective: boolean
): ImageScore {
  const details: Record<string, number> = {}
  const headSet = new Set(titleTokens(head))
  const allSet = new Set([...headSet, ...titleTokens(body)])
  const parts = requiredParts(ctx.title)
  const [work = [], artist = []] = parts

  details["œuvre"] = work.length && work.every((t) => headSet.has(t)) ? 35 : work.length && work.every((t) => allSet.has(t)) ? 25 : collective ? 25 : 0
  details["artiste"] = !artist.length ? 10 : artist.every((t) => headSet.has(t)) ? 15 : artist.every((t) => allSet.has(t)) ? 12 : 0

  const venue = (ctx.venue ?? "").trim()
  if (!venue || UNKNOWN_VENUES.test(venue)) details["lieu"] = 7
  else {
    const venueTokens = titleTokens(venue).filter((t) => !["palais", "grande", "halle", "salle", "espace"].includes(t))
    let host = ""
    try {
      host = new URL(pageUrl).hostname
    } catch {}
    const hostWords = host.replace(/[.-]/g, " ")
    details["lieu"] = venueTokens.some((t) => allSet.has(t) || hostWords.includes(t)) ? 15 : 0
  }

  const years = [ctx.calendarYear, ctx.eventYear, ctx.eventYear ? ctx.eventYear + 1 : undefined].filter(Boolean) as number[]
  const seasonShort = ctx.eventYear ? `${String(ctx.eventYear).slice(2)}-${String(ctx.eventYear + 1).slice(2)}` : "__"
  const mentioned = yearsIn(`${head} ${body.slice(0, 4000)} ${pageUrl}`)
  details["date / édition"] = mentioned.some((y) => years.includes(y)) || `${head} ${pageUrl}`.includes(seasonShort) ? 15 : mentioned.length ? 0 : 5

  const provenance = provenanceOf(pageUrl, ctx.trustedHosts)
  details["provenance"] = { "open data": 20, officielle: 20, billetterie: 12, "autre site": 10, "média ou agrégateur": 0 }[provenance]

  const total = Object.values(details).reduce((a, b) => a + b, 0)
  return { total, details, rightsOk: provenance !== "média ou agrégateur" && Boolean(imageUrl) }
}

/** Le visuel appartient-il à une édition plus ancienne que l'événement ? */
export function isOlderEditionImage(imageUrl: string, calendarYear?: number, eventYear?: number): boolean {
  if (!calendarYear && !eventYear) return false
  const oldest = Math.min(...([calendarYear, eventYear].filter(Boolean) as number[]))
  // Les dossiers d'upload (« /uploads/2023/11/ ») datent le fichier, pas l'édition :
  // seule une année dans le nom du fichier compte.
  const file = decodeURIComponent(imageUrl.split("?")[0].split("/").pop() ?? "")
  return yearsIn(file).some((y) => y < oldest)
}

// ─── Vérification d'une page ──────────────────────────────────────────────────

export type ImageFit = "photo" | "logo"
export type ScoredImage = FoundImage & { score: ImageScore; provenance: Provenance; fit: ImageFit }
export type ScoredLookup = { image: ScoredImage | null; reason: string; best?: ScoredImage | null }

async function checkPage(ctx: LookupContext, pageUrl: string, collective: boolean): Promise<ScoredLookup> {
  if (!collective && isNonEventPath(pageUrl)) return { image: null, reason: "Le lien mène à un article, pas à la page de l'événement" }
  const season = seasonYearInPath(pageUrl)
  if (ctx.eventYear && season !== null && season < ctx.eventYear) return { image: null, reason: "La page concerne une saison passée" }
  const html = await getHtml(pageUrl)
  if (!html) return { image: null, reason: "Page officielle inaccessible" }
  if (isNonDanceSection(pageUrl)) return { image: null, reason: "La page concerne un opéra ou un concert, pas de la danse" }

  const meta = readMeta(html)
  const head = [
    meta["og:title"], meta["html:title"], meta["twitter:title"], meta["og:description"], meta["description"], meta["twitter:description"], meta["og:site_name"],
  ].filter(Boolean).join(" ")
  const body = visibleText(html)
  const matches = collective
    ? (() => {
        // Saison ou festival : le nom du festival ou du lieu doit figurer sur la page.
        const page = new Set(titleTokens(head + " " + new URL(pageUrl).hostname.replace(/[.-]/g, " ")))
        return requiredParts(ctx.title).some((part) => part.some((t) => page.has(t)))
      })()
    : titlesMatch(ctx.title, head, body)
  if (!matches) return { image: null, reason: "La page ne correspond pas au titre de l'événement" }

  // Saison ou festival : la page ne doit pas annoncer une autre édition.
  if (collective && ctx.calendarYear) {
    const titleYears = yearsIn(`${meta["og:title"] ?? ""} ${meta["html:title"] ?? ""}`)
    if (titleYears.length && !titleYears.some((y) => y >= (ctx.eventYear ?? ctx.calendarYear!))) {
      return { image: null, reason: "La page présente une édition passée" }
    }
  }

  let url = pickImage(meta, pageUrl)
  if (!url) {
    const titled = titledContentImage(html, ctx.title)
    if (titled) url = pickImage({ image: titled }, pageUrl)
  }
  if (!url) return { image: null, reason: "Aucun visuel déclaré sur la page" }

  let fit: ImageFit = "photo"
  if (isLogoLike(url)) {
    // Saison ou festival : le logo officiel est acceptable, affiché en entier.
    if (!collective || /favicon|apple-touch|gravatar|avatar|placeholder/i.test(url)) {
      return { image: null, reason: "Le visuel trouvé est un logo ou une image par défaut" }
    }
    fit = "logo"
  }
  if (isOlderEditionImage(url, ctx.calendarYear, ctx.eventYear)) return { image: null, reason: "Le visuel est celui d'une édition passée" }

  if (!collective) {
    const fallback = await defaultImageOf(pageUrl)
    if (fallback && fallback === url) return { image: null, reason: "Le visuel trouvé est celui de la page d'accueil du site" }
  }
  if (!(await imageResponds(url))) return { image: null, reason: "L'image ne se charge pas" }

  const score = scorePage(ctx, pageUrl, head, body, url, collective)
  const provenance = provenanceOf(pageUrl, ctx.trustedHosts)
  const site = meta["og:site_name"] || new URL(pageUrl).hostname.replace(/^www\./, "")
  const image: ScoredImage = { url, sourceUrl: pageUrl, credit: site, alt: meta["og:image:alt"] || ctx.title, score, provenance, fit }
  if (score.total >= SCORE_PUBLISH && score.rightsOk) return { image, reason: "" }
  return {
    image: null,
    best: score.total >= SCORE_REVIEW ? image : null,
    reason: !score.rightsOk
      ? `Visuel trouvé sur un média ou agrégateur (droits non établis), score ${score.total}`
      : `Correspondance insuffisante (score ${score.total}/100)`,
  }
}

/**
 * Adresses probables, saisons, plans de site… (voir findOfficialImage).
 */
export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/['’`´]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

/**
 * Adresses probables de la page de l'événement, construites sur le modèle des
 * pages déjà connues du même site (ex. « /saison-26-27/ballet/<œuvre> »).
 * Chaque adresse reste vérifiée comme n'importe quelle page.
 */
export function guessedUrls(eventTitle: string, directories: string[]): string[] {
  const cleaned = eventTitle.replace(/\([^)]*\)/g, " ")
  const parts = cleaned.split(/\s[—–]\s|\s-\s/).map((p) => p.split(/\s\/\s|:|,|\|/)[0].trim()).filter(Boolean)
  const slugs = new Set<string>()
  if (parts[0]) slugs.add(slugify(parts[0]))
  if (parts[0] && parts[1]) {
    slugs.add(slugify(`${parts[1]} ${parts[0]}`))
    slugs.add(slugify(`${parts[0]} ${parts[1]}`))
  }
  // Compagnie complète (« Boris Charmatz / Terrain » → « boris-charmatz-terrain-muette »).
  const fullArtist = cleaned.split(/\s[—–]\s|\s-\s/)[1]?.replace(/\s\/\s/g, " ").trim()
  if (parts[0] && fullArtist) slugs.add(slugify(`${fullArtist} ${parts[0]}`))
  const urls: string[] = []
  for (const dir of directories) for (const slug of slugs) if (slug.length >= 3) urls.push(dir.replace(/\/?$/, "/") + slug)
  return urls.slice(0, 8)
}

/** Contexte de recherche d'une fiche (années, lieu, domaines de confiance). */
export function lookupContext(
  fiche: { title: string; startDate: string | null; venue?: string; eventLinks?: string[] },
  directories: string[] = [],
  extraTrusted: string[] = [],
  venueSites: Record<string, string> = {}
): LookupContext {
  const date = fiche.startDate ?? ""
  const calendarYear = date ? Number(date.slice(0, 4)) : undefined
  const eventYear = date ? Number(date.slice(0, 4)) - (Number(date.slice(5, 7)) < 8 ? 1 : 0) : undefined
  const host = (u: string) => {
    try {
      return new URL(u).hostname.replace(/^www\./, "")
    } catch {
      return ""
    }
  }
  const trusted = [...(fiche.eventLinks ?? []), ...extraTrusted, venueSites[fiche.venue ?? ""] ?? ""]
    .map(host)
    .filter((h) => h && !AGGREGATORS.test(h) && !TICKETING.test(h))
  return { title: fiche.title, eventYear, calendarYear, venue: fiche.venue, trustedHosts: Array.from(new Set(trusted)), directories }
}

/**
 * Cherche le visuel officiel à partir d'un lien (page de l'événement, page
 * générale ou site du lieu) :
 *   1. la page elle-même si elle est propre à l'événement ;
 *   2. sinon le lien de l'événement trouvé sur la page ;
 *   3. sinon les pages du plan du site, puis les adresses probables ;
 *   4. fiches « saison » ou « festival » : le visuel (ou le logo) du site.
 * Chaque page reçoit un score de confiance ; seule une image au-dessus du
 * seuil, aux droits établis, est renvoyée (les autres sont « à vérifier »).
 */
export async function findOfficialImage(ctx: LookupContext, pageUrl: string): Promise<ScoredLookup> {
  if (!/^https?:\/\//i.test(pageUrl)) return { image: null, reason: "Pas de lien officiel" }
  const collective = isCollectiveTitle(ctx.title)
  const tried = new Set<string>()
  let last: ScoredLookup = { image: null, reason: "Le lien mène à une page générale où l'événement est introuvable" }
  let best: ScoredImage | null = null

  const attempt = async (url: string, asCollective = false) => {
    if (!url || tried.has(url)) return null
    tried.add(url)
    const result = await checkPage(ctx, url, asCollective)
    if (result.image) return result
    if (result.best && (!best || result.best.score.total > best.score.total)) best = result.best
    last = result
    return null
  }

  if (!isGenericPage(pageUrl)) {
    const direct = await attempt(pageUrl)
    if (direct) return direct
  } else {
    const listing = await getHtml(pageUrl)
    const eventUrl = listing ? findEventLink(listing, pageUrl, ctx.title) : ""
    const viaLink = await attempt(eventUrl)
    if (viaLink) return viaLink
  }

  const origin = new URL(pageUrl).origin
  if (!collective) {
    for (const candidate of await sitemapCandidates(origin, ctx.title, ctx.eventYear)) {
      const found = await attempt(candidate)
      if (found) return found
    }
    const directories = ctx.directories.filter((d) => d.startsWith(origin))
    if (isGenericPage(pageUrl) && new URL(pageUrl).pathname.length > 1) directories.push(pageUrl)
    for (const candidate of guessedUrls(ctx.title, directories)) {
      const found = await attempt(candidate)
      if (found) return found
    }
  }

  if (collective) {
    const site = await attempt(isGenericPage(pageUrl) ? pageUrl : origin + "/", true)
    if (site) return site
  }
  return { ...last, best }
}

/** Revérifie une image déjà enregistrée (lien toujours valide). */
export async function imageStillResponds(url: string): Promise<boolean> {
  return imageResponds(url)
}

/**
 * Un même visuel utilisé pour plusieurs événements différents est un visuel
 * générique (bannière de saison, image de festival…) : on l'écarte.
 */
/**
 * Deux fiches décrivent-elles la même production (même œuvre, même artiste),
 * éventuellement à d'autres dates ou dans un autre lieu ?
 * Sans artiste sur l'une des fiches, il faut le même lieu et moins d'un an
 * d'écart (pour ne pas confondre deux « Giselle » différentes).
 */
export function sameProduction(
  a: { title: string; venue: string; startDate: string | null },
  b: { title: string; venue: string; startDate: string | null }
): boolean {
  const pa = requiredParts(a.title)
  const pb = requiredParts(b.title)
  if (!pa.length || !pb.length) return false
  const sets = (parts: string[][]) => parts.map((p) => new Set(p))
  const [workA, artistA] = sets(pa)
  const [workB, artistB] = sets(pb)
  const subset = (x: Set<string>, y: Set<string>) => [...x].every((t) => y.has(t))
  // L'œuvre peut être écrite « Œuvre — Artiste » ou « Artiste — Œuvre ».
  const pairs: Array<[Set<string>, Set<string> | undefined, Set<string>, Set<string> | undefined]> = [
    [workA, artistA, workB, artistB],
    [workA, artistA, artistB ?? new Set(), workB],
  ]
  for (const [wa, aa, wb, ab] of pairs) {
    const small = wa.size <= wb.size ? wa : wb
    const large = small === wa ? wb : wa
    if (!small.size || !subset(small, large) || (small.size < 2 && small.size !== large.size)) continue
    if (aa?.size && ab?.size) {
      if ([...aa].some((t) => ab.has(t))) return true
      continue
    }
    const days = a.startDate && b.startDate ? Math.abs(Date.parse(a.startDate.slice(0, 10)) - Date.parse(b.startDate.slice(0, 10))) / 86_400_000 : 9999
    if (a.venue && a.venue === b.venue && days <= 365) return true
  }
  return false
}

/** Dossiers d'événements déduits des pages officielles déjà trouvées. */
export function eventDirectories(sourceUrls: string[]): string[] {
  const dirs = new Set<string>()
  for (const source of sourceUrls) {
    try {
      const url = new URL(source)
      if (isGenericPage(source) || isNonEventPath(source)) continue
      const path = url.pathname.replace(/\/$/, "")
      const parent = path.slice(0, path.lastIndexOf("/") + 1)
      if (parent.length > 1) dirs.add(url.origin + parent)
    } catch {}
  }
  return Array.from(dirs)
}

export function findSharedImages(entries: Array<{ title: string; imageUrl: string }>): Set<string> {
  const titlesByImage = new Map<string, Set<string>>()
  for (const { title, imageUrl } of entries) {
    if (!imageUrl) continue
    const set = titlesByImage.get(imageUrl) ?? new Set<string>()
    // Clé = l'œuvre : plusieurs fiches du même spectacle ne comptent qu'une fois.
    set.add((requiredParts(title)[0] ?? titleTokens(title)).join(" "))
    titlesByImage.set(imageUrl, set)
  }
  return new Set(Array.from(titlesByImage.entries()).filter(([, titles]) => titles.size >= 3).map(([url]) => url))
}

/**
 * Événement de la Ville de Paris correspondant à une fiche :
 *   - même œuvre et même artiste (si la fiche en cite un) ;
 *   - dates qui se recoupent (± 45 jours) ;
 *   - même lieu si la fiche indique un lieu connu, sinon titre quasi identique
 *     (évite « Le Fantôme de l'Opéra » ⇔ « Le Fantôme de Canterville »).
 */
export function matchesOpenDataEvent(
  fiche: { title: string; startDate: string | null; endDate?: string | null; venue?: string },
  record: { title: string; description: string; startDate: string | null; endDate: string | null; imageUrl: string; venue: string; address: string; city: string },
  knownVenues: string[] = []
): boolean {
  if (!record.imageUrl) return false
  if (!titlesMatch(fiche.title, record.title, record.description)) return false

  const day = (v: string | null | undefined) => (v ? Date.parse(v.slice(0, 10)) : NaN)
  const fs = day(fiche.startDate), fe = day(fiche.endDate ?? fiche.startDate)
  const rs = day(record.startDate), re = day(record.endDate ?? record.startDate)
  if ([fs, fe, rs, re].some(Number.isNaN)) return false
  const margin = 45 * 86_400_000
  if (!(rs <= fe + margin && fs <= re + margin)) return false

  const venue = (fiche.venue ?? "").trim()
  if (venue && knownVenues.includes(venue)) {
    const wanted = titleTokens(venue).filter((t) => !["palais", "grande", "halle"].includes(t))
    const where = new Set(titleTokens(`${record.venue} ${record.address} ${record.city}`))
    return wanted.length > 0 && wanted.some((t) => where.has(t))
  }
  const work = requiredParts(fiche.title)[0] ?? []
  const recordWords = titleTokens(record.title)
  const shared = work.filter((t) => recordWords.includes(t)).length
  return shared >= 2 && shared / Math.max(recordWords.length, work.length) >= 0.75
}
