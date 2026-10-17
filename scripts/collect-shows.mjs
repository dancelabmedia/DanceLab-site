#!/usr/bin/env node
/**
 * collect-shows.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Collecte automatique des spectacles chorégraphiques depuis plusieurs sources.
 *
 * Usage :
 *   node scripts/collect-shows.mjs [--dry-run] [--source=<nom>] [--debug]
 *
 * Sources surveillées :
 *   - Sortir à Paris (sortiraparis.com) — agenda spectacles / danse
 *   - Paris je t'aime (parisjetaime.com) — agenda culturel officiel
 *   - L'Officiel des spectacles (offi.fr) — comédies musicales, danse
 *   - THEATREonline (theatreonline.com) — grandes productions
 *   - Dôme de Paris (ledomedeparis.com) — programmation directe
 *   - Casino de Paris (casinodeparis.fr) — spectacles de scène
 *   - Fever (feverup.com) — via sitemap events
 *   - Décibels Productions (decibelsprod.com) — catalogue producteur
 *   - Les Folies Bergère (foliesbergere.com) — cabaret & shows
 *   - L'Olympia, Zénith Paris, Zénith de Lille, etc.
 *
 * Le script :
 *   1. Interroge les sitemaps / flux RSS / API de chaque source
 *   2. Filtre par mots-clés chorégraphiques
 *   3. Récupère les informations détaillées de chaque fiche
 *   4. Génère un rapport JSON dans data/collected-shows-YYYY-MM-DD.json
 *   5. En mode normal : met à jour data/pending-shows.json (à valider manuellement)
 *
 * Mots-clés chorégraphiques (pour la pertinence danse) :
 *   danse, dance, chorégraph*, ballet, hip-hop, contemporain, classique,
 *   comédie musicale, musical, cabaret, revue, drag, cirque (avec danse),
 *   music-hall, flamenco, claquettes, urban, break, krump, voguing
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { writeFileSync, readFileSync, existsSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"
import { deduplicateEvents, planEventUpserts } from "../lib/event-deduplication.mjs"
import { applyEventDisciplines } from "../lib/event-disciplines.mjs"
import { loadEnvConfig } from '@next/env'
import { tsImport } from 'tsx/esm/api'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..")
const eventRules = JSON.parse(readFileSync(join(ROOT, 'data/event-canonicalizations.json'), 'utf8'))
loadEnvConfig(ROOT, false, { info() {}, error() {} })

// ── CLI args ─────────────────────────────────────────────────────────────────
const args = process.argv.slice(2)
const DRY_RUN = args.includes("--dry-run")
const DEBUG = args.includes("--debug")
const SOURCE_FILTER = args.find((a) => a.startsWith("--source="))?.split("=")[1]

function log(...msg) {
  console.log("[collect-shows]", ...msg)
}
function debug(...msg) {
  if (DEBUG) console.log("[DEBUG]", ...msg)
}

// ── Mots-clés chorégraphiques ─────────────────────────────────────────────────
const DANCE_KEYWORDS = [
  "danse", "dance", "chorégraph", "choreograph", "ballet", "hip-hop", "hip hop",
  "contemporain", "contemporary", "classique", "flamenco", "claquettes", "tap",
  "jazz dance", "urban", "break", "krump", "voguing", "waacking", "popping",
  "locking", "house dance", "afro", "comédie musicale", "comedie musicale",
  "musical", "cabaret", "revue", "drag", "music-hall", "music hall",
  "acrobatique", "acrobatic", "cirque", "circus", "danseur", "danseuse",
  "compagnie de danse", "spectacle chorégraphique",
]

const DANCE_REGEX = new RegExp(DANCE_KEYWORDS.join("|"), "i")

// ── Utilitaires HTTP ──────────────────────────────────────────────────────────
const HEADERS = {
  "User-Agent": "DanceLab-Collector/1.0 (contact: maiwennbramoulle@gmail.com)",
  Accept: "text/html,application/xml,application/json",
}

async function fetchText(url, opts = {}) {
  try {
    const res = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(15000), ...opts })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.text()
  } catch (err) {
    debug(`Fetch error ${url}:`, err.message)
    return null
  }
}

async function fetchJson(url, opts = {}) {
  try {
    const res = await fetch(url, { headers: { ...HEADERS, Accept: "application/json" }, signal: AbortSignal.timeout(15000), ...opts })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } catch (err) {
    debug(`Fetch JSON error ${url}:`, err.message)
    return null
  }
}

// ── Extraction basique de texte HTML ─────────────────────────────────────────
function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function extractMeta(html, property) {
  const m =
    html.match(new RegExp(`<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']+)["']`, "i")) ||
    html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${property}["']`, "i"))
  return m?.[1]?.trim() || null
}

function extractJsonLd(html) {
  const matches = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
  return matches.flatMap((m) => {
    try {
      const parsed = JSON.parse(m[1])
      return Array.isArray(parsed) ? parsed : [parsed]
    } catch {
      return []
    }
  })
}

function findEventJsonLd(html) {
  const ld = extractJsonLd(html)
  return ld.find((d) =>
    ["Event", "TheaterEvent", "MusicEvent", "DanceEvent", "EntertainmentBusiness"].includes(d["@type"])
  )
}

// ── Structure d'un spectacle collecté ────────────────────────────────────────
function makeShow(overrides = {}) {
  return {
    title: "",
    description: "",
    image: "",
    startDate: "",
    endDate: "",
    venue: "",
    address: "",
    city: "Paris",
    price: "",
    officialUrl: "",
    ticketUrl: "",
    source: "",
    collectedAt: new Date().toISOString().slice(0, 10),
    relevanceScore: 0,
    ...overrides,
  }
}

function scoreRelevance(show) {
  const text = [show.title, show.description].join(" ")
  let score = 0
  for (const kw of DANCE_KEYWORDS) {
    if (text.toLowerCase().includes(kw)) score++
  }
  return score
}

// ─────────────────────────────────────────────────────────────────────────────
// SOURCE 1 : Sortir à Paris — sortiraparis.com
// Accès : sitemap ou flux catégorie danse
// ─────────────────────────────────────────────────────────────────────────────
async function collectSortiraparis() {
  log("→ Sortir à Paris (sortiraparis.com)…")
  const shows = []

  // Flux catégorie danse (page HTML listant les spectacles)
  const urls = [
    "https://www.sortiraparis.com/arts-scenes/danse/listes",
    "https://www.sortiraparis.com/arts-scenes/comedie-musicale/listes",
    "https://www.sortiraparis.com/arts-scenes/spectacle/listes",
  ]

  for (const url of urls) {
    const html = await fetchText(url)
    if (!html) continue

    // Extraire les URLs des fiches spectacles
    const linkMatches = [...html.matchAll(/href="(https:\/\/www\.sortiraparis\.com\/[^"]+\/articles\/[^"]+)"/g)]
    const links = [...new Set(linkMatches.map((m) => m[1]))]
    debug(`sortiraparis: ${links.length} fiches trouvées sur ${url}`)

    for (const link of links.slice(0, 20)) {
      const pageHtml = await fetchText(link)
      if (!pageHtml) continue

      const title = extractMeta(pageHtml, "og:title") || ""
      const desc = extractMeta(pageHtml, "og:description") || ""
      const text = title + " " + desc

      if (!DANCE_REGEX.test(text)) continue

      const ld = findEventJsonLd(pageHtml)
      shows.push(
        makeShow({
          title: ld?.name || title,
          description: ld?.description || desc,
          image: ld?.image || extractMeta(pageHtml, "og:image") || "",
          startDate: ld?.startDate?.slice(0, 10) || "",
          endDate: ld?.endDate?.slice(0, 10) || "",
          venue: ld?.location?.name || "",
          address: ld?.location?.address?.streetAddress || "",
          city: ld?.location?.address?.addressLocality || "Paris",
          officialUrl: link,
          ticketUrl: ld?.url || "",
          price: ld?.offers?.price ? `${ld.offers.price} ${ld.offers.priceCurrency || "€"}` : "",
          source: "sortiraparis.com",
        })
      )
    }
  }

  return shows
}

// ─────────────────────────────────────────────────────────────────────────────
// SOURCE 2 : THEATREonline — theatreonline.com
// Accès : catégorie danse et comédie musicale
// ─────────────────────────────────────────────────────────────────────────────
async function collectTheatreonline() {
  log("→ THEATREonline (theatreonline.com)…")
  const shows = []

  const urls = [
    "https://www.theatreonline.com/Musique-et-Danse",
    "https://www.theatreonline.com/Contemporain",
    "https://www.theatreonline.com/Classique",
  ]

  for (const url of urls) {
    const html = await fetchText(url)
    if (!html) continue

    const linkMatches = [...html.matchAll(/href="(\/Spectacle\/[^"]+\/\d+)"/g)]
    const links = [...new Set(linkMatches.map((m) => `https://www.theatreonline.com${m[1]}`))]
    debug(`theatreonline: ${links.length} spectacles trouvés sur ${url}`)

    for (const link of links.slice(0, 15)) {
      const pageHtml = await fetchText(link)
      if (!pageHtml) continue

      const title = extractMeta(pageHtml, "og:title") || ""
      const desc = extractMeta(pageHtml, "og:description") || ""
      const ld = findEventJsonLd(pageHtml)

      shows.push(
        makeShow({
          title: ld?.name || title,
          description: ld?.description || desc,
          image: ld?.image || extractMeta(pageHtml, "og:image") || "",
          startDate: ld?.startDate?.slice(0, 10) || "",
          endDate: ld?.endDate?.slice(0, 10) || "",
          venue: ld?.location?.name || "",
          city: ld?.location?.address?.addressLocality || "Paris",
          officialUrl: link,
          source: "theatreonline.com",
        })
      )
    }
  }

  return shows
}

// ─────────────────────────────────────────────────────────────────────────────
// SOURCE 3 : L'Officiel des spectacles — offi.fr
// Accès : catégories danse, comédie musicale
// ─────────────────────────────────────────────────────────────────────────────
async function collectOffi() {
  log("→ L'Officiel des spectacles (offi.fr)…")
  const shows = []

  const urls = [
    "https://www.offi.fr/danse/paris/",
    "https://www.offi.fr/comedie-musicale/paris/",
    "https://www.offi.fr/cabaret/paris/",
  ]

  for (const url of urls) {
    const html = await fetchText(url)
    if (!html) continue

    const linkMatches = [...html.matchAll(/href="(\/(?:danse|comedie-musicale|cabaret|theatre)\/[^/]+-\d+\/[^"]+)"/g)]
    const links = [...new Set(linkMatches.map((m) => `https://www.offi.fr${m[1]}`))]
    debug(`offi.fr: ${links.length} fiches trouvées sur ${url}`)

    for (const link of links.slice(0, 15)) {
      const pageHtml = await fetchText(link)
      if (!pageHtml) continue

      const title = extractMeta(pageHtml, "og:title") || ""
      const desc = extractMeta(pageHtml, "og:description") || ""
      const ld = findEventJsonLd(pageHtml)

      shows.push(
        makeShow({
          title: ld?.name || title,
          description: ld?.description || desc,
          image: ld?.image || extractMeta(pageHtml, "og:image") || "",
          startDate: ld?.startDate?.slice(0, 10) || "",
          endDate: ld?.endDate?.slice(0, 10) || "",
          venue: ld?.location?.name || "",
          city: ld?.location?.address?.addressLocality || "Paris",
          officialUrl: link,
          source: "offi.fr",
        })
      )
    }
  }

  return shows
}

// ─────────────────────────────────────────────────────────────────────────────
// SOURCE 4 : Paris je t'aime (parisjetaime.com)
// Accès : flux agenda culturel officiel de la Ville de Paris
// ─────────────────────────────────────────────────────────────────────────────
async function collectParisJetaime() {
  log("→ Paris je t'aime (parisjetaime.com)…")
  const shows = []

  const html = await fetchText("https://www.parisjetaime.com/agenda?theme=spectacle")
  if (!html) return shows

  const linkMatches = [...html.matchAll(/href="(\/agenda\/[^"]+)"/g)]
  const links = [...new Set(linkMatches.map((m) => `https://www.parisjetaime.com${m[1]}`))]
  debug(`parisjetaime: ${links.length} fiches trouvées`)

  for (const link of links.slice(0, 20)) {
    const pageHtml = await fetchText(link)
    if (!pageHtml) continue

    const title = extractMeta(pageHtml, "og:title") || ""
    const desc = extractMeta(pageHtml, "og:description") || ""
    const text = title + " " + desc
    if (!DANCE_REGEX.test(text)) continue

    const ld = findEventJsonLd(pageHtml)
    shows.push(
      makeShow({
        title: ld?.name || title,
        description: ld?.description || desc,
        image: ld?.image || extractMeta(pageHtml, "og:image") || "",
        startDate: ld?.startDate?.slice(0, 10) || "",
        endDate: ld?.endDate?.slice(0, 10) || "",
        venue: ld?.location?.name || "",
        city: "Paris",
        officialUrl: link,
        source: "parisjetaime.com",
      })
    )
  }

  return shows
}

// ─────────────────────────────────────────────────────────────────────────────
// SOURCE 5 : Grandes salles parisiennes — programmation directe
// Dôme de Paris, Casino de Paris, Folies Bergère, Olympia, Palais des Congrès
// ─────────────────────────────────────────────────────────────────────────────
async function collectGrandesSalles() {
  log("→ Grandes salles (programmation directe)…")
  const shows = []

  const SALLES = [
    {
      name: "Dôme de Paris",
      url: "https://www.ledomedeparis.com/fr/spectacles/a-laffiche",
      city: "Paris",
      address: "34 Boulevard Victor, 75015 Paris",
      linkPattern: /href="(\/fr\/[^"#]+)"/ig,
      baseUrl: "https://www.ledomedeparis.com",
    },
    {
      name: "Casino de Paris",
      url: "https://www.casinodeparis.fr/fr/",
      city: "Paris",
      address: "16 rue de Clichy, 75009 Paris",
      linkPattern: /href="(\/fr\/[A-Z][^"#]{20,})"/g,
      baseUrl: "https://www.casinodeparis.fr",
    },
    {
      name: "Folies Bergère",
      url: "https://www.foliesbergere.com/",
      city: "Paris",
      address: "32 rue Richer, 75009 Paris",
      linkPattern: /href="(\/spectacles?\/[^"#]+)"/ig,
      baseUrl: "https://www.foliesbergere.com",
    },
  ]

  for (const salle of SALLES) {
    const html = await fetchText(salle.url)
    if (!html) continue

    const linkMatches = [...html.matchAll(salle.linkPattern)]
    const links = [...new Set(linkMatches.map((m) => `${salle.baseUrl}${m[1]}`))]
    debug(`${salle.name}: ${links.length} spectacles trouvés`)

    for (const link of links.slice(0, 10)) {
      const pageHtml = await fetchText(link)
      if (!pageHtml) continue

      const title = extractMeta(pageHtml, "og:title") || ""
      const desc = extractMeta(pageHtml, "og:description") || ""
      // Pour les grandes salles spécialisées, le filtre DANCE est assoupli :
      // on conserve tout spectacle sauf les concerts de musique pure ou le théâtre parlé
      const text = title + " " + desc
      const isMusicOnly = /\bconcert\b/i.test(text) && !DANCE_REGEX.test(text)
      if (isMusicOnly) continue

      const ld = findEventJsonLd(pageHtml)
      shows.push(
        makeShow({
          title: ld?.name || title,
          description: ld?.description || desc,
          image: ld?.image || extractMeta(pageHtml, "og:image") || "",
          startDate: ld?.startDate?.slice(0, 10) || "",
          endDate: ld?.endDate?.slice(0, 10) || "",
          venue: salle.name,
          address: salle.address,
          city: salle.city,
          officialUrl: link,
          source: salle.name.toLowerCase().replace(/ /g, "-"),
        })
      )
    }
  }

  return shows
}

// ─────────────────────────────────────────────────────────────────────────────
// SOURCE 6 : Décibels Productions — decibelsprod.com
// Accès : catalogue artistes (tournées)
// ─────────────────────────────────────────────────────────────────────────────
async function collectDecibels() {
  log("→ Décibels Productions (decibelsprod.com)…")
  const shows = []

  const html = await fetchText("https://decibelsprod.com/artistes/")
  if (!html) return shows

  const linkMatches = [...html.matchAll(/href="(https:\/\/decibelsprod\.com\/artistes\/[^"]+)"/g)]
  const links = [...new Set(linkMatches.map((m) => m[1]))]
  debug(`decibelsprod: ${links.length} artistes/spectacles`)

  for (const link of links.slice(0, 15)) {
    const pageHtml = await fetchText(link)
    if (!pageHtml) continue

    const title = extractMeta(pageHtml, "og:title") || ""
    const desc = extractMeta(pageHtml, "og:description") || ""
    const text = title + " " + desc
    if (!DANCE_REGEX.test(text)) continue

    shows.push(
      makeShow({
        title,
        description: desc,
        image: extractMeta(pageHtml, "og:image") || "",
        officialUrl: link,
        city: "France",
        source: "decibelsprod.com",
      })
    )
  }

  return shows
}

// ─────────────────────────────────────────────────────────────────────────────
// DÉDUPLICATION
// ─────────────────────────────────────────────────────────────────────────────
function deduplicateShows(shows) {
  return deduplicateEvents(shows, { rules: eventRules }).events.map(applyEventDisciplines)
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────
const SOURCES = {
  sortiraparis: collectSortiraparis,
  theatreonline: collectTheatreonline,
  offi: collectOffi,
  parisjetaime: collectParisJetaime,
  grandesalles: collectGrandesSalles,
  decibels: collectDecibels,
}

async function main() {
  log(`Mode : ${DRY_RUN ? "DRY RUN (aucune écriture)" : "NORMAL"}`)
  if (SOURCE_FILTER) log(`Source filtrée : ${SOURCE_FILTER}`)

  const allShows = []

  for (const [name, fn] of Object.entries(SOURCES)) {
    if (SOURCE_FILTER && name !== SOURCE_FILTER) continue
    try {
      const shows = await fn()
      log(`  → ${shows.length} spectacle(s) collecté(s) depuis ${name}`)
      allShows.push(...shows)
    } catch (err) {
      log(`  ✗ Erreur source ${name}:`, err.message)
    }
  }

  // Calcul score de pertinence + déduplication
  const scored = allShows.map((s) => ({ ...s, relevanceScore: scoreRelevance(s) }))
  const deduped = deduplicateShows(scored)

  // Filtrer par score minimum et dates non passées
  const today = new Date().toISOString().slice(0, 10)
  const relevant = deduped.filter(
    (s) => s.relevanceScore > 0 && (s.endDate ? s.endDate >= today : s.startDate >= today || !s.startDate)
  )

  log(`\n✓ ${allShows.length} spectacles bruts → ${deduped.length} après déduplication → ${relevant.length} pertinents`)

  const outputDate = new Date().toISOString().slice(0, 10)
  const outputPath = join(ROOT, "data", `collected-shows-${outputDate}.json`)
  const pendingPath = join(ROOT, "data", "pending-shows.json")

  if (!DRY_RUN) {
    writeFileSync(outputPath, JSON.stringify(relevant, null, 2), "utf8")
    log(`→ Rapport écrit : ${outputPath}`)

    // Mettre à jour pending-shows.json (pour validation manuelle)
    const existingPending = existsSync(pendingPath)
      ? JSON.parse(readFileSync(pendingPath, "utf8"))
      : []

    const candidates = deduplicateShows([...existingPending, ...relevant])
    let updated
    try {
      const { NotionAgendaClient, notionAgendaEvent } = await tsImport('./lib/notion-agenda.ts', import.meta.url)
      const published = (await new NotionAgendaClient().pages()).map(notionAgendaEvent)
      const plan = planEventUpserts(published, candidates, { rules: eventRules })
      updated = [
        ...plan.update.map(event => ({ ...event, importAction: 'update' })),
        ...plan.create.map(event => ({ ...event, importAction: 'create' })),
        ...plan.review.map(item => ({ ...item.event, importAction: 'review', needsReview: true, reviewReason: item.reason })),
      ]
      log(`→ Vérification des fiches existantes : ${plan.update.length} mises à jour, ${plan.create.length} nouvelles programmations, ${plan.review.length} à vérifier`)
    } catch {
      // A failed lookup must never be treated as an empty database.
      updated = candidates.map(event => ({ ...event, importAction: 'review', needsReview: true, reviewReason: 'existing-catalogue-unavailable' }))
      log('→ Base existante indisponible : candidats conservés en attente, aucune création autorisée')
    }
    writeFileSync(pendingPath, JSON.stringify(updated, null, 2), "utf8")
    log(`→ Catalogue enrichi sans doublons dans pending-shows.json (total : ${updated.length})`)
  } else {
    log("\n[DRY RUN] Spectacles qui auraient été écrits :")
    relevant.slice(0, 10).forEach((s) => log(`  - "${s.title}" (${s.startDate}) @ ${s.venue} [score: ${s.relevanceScore}]`))
  }

  // Affichage de résumé par source
  const bySource = {}
  for (const s of relevant) {
    bySource[s.source] = (bySource[s.source] || 0) + 1
  }
  log("\nRépartition par source :")
  for (const [src, count] of Object.entries(bySource)) {
    log(`  ${src.padEnd(30)} ${count}`)
  }
}

main().catch((err) => {
  console.error("[collect-shows] Erreur fatale:", err)
  process.exit(1)
})
