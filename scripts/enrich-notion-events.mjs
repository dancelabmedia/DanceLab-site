#!/usr/bin/env node
/**
 * enrich-notion-events.mjs
 *
 * Script d'enrichissement automatique et complet des événements Notion.
 * Pour chaque événement :
 *   1. Si pas d'URL officielle → découverte automatique (patterns salle + recherche web)
 *   2. Écriture de l'URL découverte dans Notion (sauf --no-notion-update)
 *   3. Extraction depuis la page : image, description, prix, disciplines, vidéo
 *   4. Sauvegarde dans data/notion-event-enrichment.json
 *
 * Usage :
 *   node scripts/enrich-notion-events.mjs [--dry-run] [--limit N] [--force] [--no-notion-update]
 *
 * Variables d'environnement :
 *   NOTION_TOKEN ou NOTION_API_KEY
 *   NOTION_AGENDA_DATABASE_ID (optionnel)
 */

import fs from "fs/promises"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, "..")
const CACHE_FILE = path.join(ROOT, "data", "notion-event-enrichment.json")

const NOTION_VERSION = "2025-09-03"
const DEFAULT_DATABASE_ID = "c06a1552cfcc4522ae68d32f833b3cf3"
const NOTION_TOKEN = process.env.NOTION_TOKEN || process.env.NOTION_API_KEY
const NOTION_DATABASE_ID = process.env.NOTION_AGENDA_DATABASE_ID || DEFAULT_DATABASE_ID

const DRY_RUN = process.argv.includes("--dry-run")
const FORCE = process.argv.includes("--force")
const NO_NOTION_UPDATE = process.argv.includes("--no-notion-update")
const DEBUG = process.argv.includes("--debug")
const LIMIT = (() => {
  const idx = process.argv.indexOf("--limit")
  return idx !== -1 ? parseInt(process.argv[idx + 1] || "50", 10) : 0
})()

// ─── Notion API ─────────────────────────────────────────────────────────────

async function notionReq(path_, init = {}) {
  const res = await fetch(`https://api.notion.com/v1/${path_}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${NOTION_TOKEN}`,
      "Content-Type": "application/json",
      "Notion-Version": NOTION_VERSION,
      ...(init.headers || {}),
    },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(`Notion API ${res.status}: ${err.message || path_}`)
  }
  return res.json()
}

async function resolveDataSourceId() {
  const db = await notionReq(`databases/${NOTION_DATABASE_ID}`, { method: "GET" })
  return db.data_sources?.[0]?.id || NOTION_DATABASE_ID
}

async function fetchAllPages() {
  const dataSourceId = await resolveDataSourceId()
  const pages = []
  let cursor

  do {
    const data = await notionReq(`data_sources/${dataSourceId}/query`, {
      method: "POST",
      body: JSON.stringify({ page_size: 100, start_cursor: cursor }),
    })
    pages.push(...data.results)
    cursor = data.has_more ? data.next_cursor : undefined
  } while (cursor)

  return pages
}

/**
 * Écrit l'URL officielle découverte dans la propriété Notion correspondante.
 * Essaie successivement les noms de propriété les plus courants.
 */
async function writeUrlToNotion(pageId, url, properties) {
  // Trouver quelle propriété contient l'URL (URL vide ou absente)
  const urlPropNames = ["Lien officiel", "Lien", "URL", "Site", "Site officiel", "OfficialUrl", "Page officielle"]
  let targetProp = null

  for (const name of urlPropNames) {
    const found = Object.entries(properties).find(([k]) => normKey(k) === normKey(name))
    if (found) {
      targetProp = found[0]
      break
    }
  }

  if (!targetProp) {
    // Chercher la première propriété de type url
    const urlEntry = Object.entries(properties).find(([, v]) => v.type === "url")
    if (urlEntry) targetProp = urlEntry[0]
  }

  if (!targetProp) {
    console.log(`     ⚠️  Aucune propriété URL trouvée dans Notion pour cette page`)
    return false
  }

  try {
    await notionReq(`pages/${pageId}`, {
      method: "PATCH",
      body: JSON.stringify({
        properties: { [targetProp]: { url } },
      }),
    })
    return true
  } catch (err) {
    console.log(`     ⚠️  Échec écriture Notion : ${err.message}`)
    return false
  }
}

// ─── Property helpers ────────────────────────────────────────────────────────

function normKey(name) {
  return (name || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
}

function findProp(properties, aliases) {
  const normed = aliases.map(normKey)

  // 1. Chercher par nom de propriété
  const entry = Object.entries(properties).find(([k]) => normed.includes(normKey(k)))
  if (entry) return entry[1]

  // 2. Fallback par type : si "title" est dans les alias, prendre la prop de type "title"
  if (normed.includes("title")) {
    const found = Object.values(properties).find(v => v.type === "title")
    if (found) return found
  }

  // 3. Fallback par type : "date"
  if (normed.includes("date")) {
    const found = Object.values(properties).find(v => v.type === "date")
    if (found) return found
  }

  return undefined
}

function getText(prop) {
  if (!prop) return ""
  if (prop.type === "title") return prop.title?.map(t => t.plain_text || "").join("").trim() || ""
  if (prop.type === "rich_text") return prop.rich_text?.map(t => t.plain_text || "").join("").trim() || ""
  if (prop.type === "url") return prop.url || ""
  if (prop.type === "select") return prop.select?.name || ""
  if (prop.type === "status") return prop.status?.name || ""
  if (prop.type === "multi_select") return prop.multi_select?.map(i => i.name).filter(Boolean).join(", ") || ""
  return ""
}

function getFileUrl(prop) {
  const f = prop?.files?.[0]
  if (!f) return ""
  return f.type === "external" ? f.external?.url || "" : f.file?.url || ""
}

function hasCoverImage(page) {
  // Image de couverture Notion
  if (page.cover) {
    const url = page.cover.type === "external" ? page.cover.external?.url : page.cover.file?.url
    if (url) return true
  }
  // Propriété files
  const imageProp = findProp(page.properties, ["Image", "Photo", "Affiche", "Visuel", "Cover"])
  if (getFileUrl(imageProp)) return true
  for (const prop of Object.values(page.properties)) {
    if (prop.type === "files" && prop.files?.length && getFileUrl(prop)) return true
  }
  // Propriété URL d'image (type url) — ex : "Image URL"
  const imageUrlProp = findProp(page.properties, ["Image URL", "Image Url", "URL image", "Source image", "Visuel URL"])
  if (imageUrlProp?.type === "url" && imageUrlProp.url?.startsWith("http")) return true
  return false
}

function getTitle(page) {
  return getText(findProp(page.properties, [
    "title", "Titre", "Nom", "Name", "Spectacle", "Événement", "Evenement", "Intitulé", "Intitule"
  ])) || ""
}

function getVenue(page) {
  return getText(findProp(page.properties, [
    "Lieu", "Salle", "Venue", "Lieu/Salle", "Lieu de spectacle", "Structure", "Théâtre", "Theatre",
    "Lieu d'accueil", "Espace", "Établissement", "Etablissement"
  ])) || ""
}

function getStartDate(page) {
  const dateProp = findProp(page.properties, [
    "date", "Date", "Dates", "Période", "Periode", "Quand", "Début", "Debut", "Date de début", "Date de debut"
  ])
  return (dateProp?.date?.start || dateProp?.formula?.date?.start || "").slice(0, 10)
}

/** Affiche les noms des propriétés Notion disponibles (debug) */
function debugProps(page) {
  return Object.entries(page.properties)
    .map(([k, v]) => `${k}(${v.type})`)
    .join(", ")
}

function getOfficialUrl(page) {
  return getText(findProp(page.properties, [
    "Lien", "URL", "Lien officiel", "Site", "Site officiel", "OfficialUrl", "Page officielle"
  ])) || ""
}

function isPast(page) {
  const dateProp = findProp(page.properties, ["date", "Date", "Dates", "Période", "Quand", "Début"])
  const start = (dateProp?.date?.start || dateProp?.formula?.date?.start || "").slice(0, 10)
  const end = (dateProp?.date?.end || dateProp?.formula?.date?.end || "").slice(0, 10)
  if (!start) return false
  const today = new Date().toISOString().slice(0, 10)
  return end ? end < today : start < today
}

// ─── URL auto-discovery ──────────────────────────────────────────────────────

const BRAVE_API_KEY = process.env.BRAVE_API_KEY || ""

function slugify(text) {
  return (text || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[''`]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

/**
 * Extrait le titre principal d'un titre Notion composé.
 *
 * Exemples :
 *   "Correspondances nocturnes — Ballet de l'Opéra de Paris (festival)"
 *     → "Correspondances nocturnes"
 *   "Portrait de Rita — Laurène Marx & Bwanga Pilipili"
 *     → "Portrait de Rita"
 *   "Giselle — Johan Inger / Ballet de l'Opéra de Paris"
 *     → "Giselle"
 *   "Olivier Dubois — Come Out — Fondation Fiminco"
 *     → "Come Out"     ← format "Artiste — Titre — Salle"
 *   "ANNULÉ Apprendre un mouvement d'Hofesh Shechter"
 *     → "Apprendre un mouvement d'Hofesh Shechter"
 */
function extractMainTitle(fullTitle) {
  const cleaned = (fullTitle || "")
    // Supprimer les préfixes "ANNULÉ", "REPORTÉ", "COMPLET"
    .replace(/^(ANNUL[EÉ]|REPORT[EÉ]|COMPLET)\s+/i, "")
    .trim()

  // Séparer par em-dash/en-dash
  const parts = cleaned.split(/\s*[—–]\s*/).map(p => p.trim()).filter(Boolean)

  if (parts.length === 1) {
    // Pas de tiret em : c'est le titre seul
    return parts[0].replace(/\s*\([^)]+\)\s*$/, "").trim()
  }

  if (parts.length === 2) {
    // Format "Titre — Équipe/Salle"  →  premier segment = titre
    return parts[0].replace(/\s*\([^)]+\)\s*$/, "").trim()
  }

  if (parts.length >= 3) {
    // Format "Artiste — Titre — Salle" : le deuxième segment est le titre du spectacle
    // Heuristique : si le premier segment est court (≤ 3 mots) et semble un nom d'artiste,
    // utiliser le deuxième segment comme titre.
    const firstWords = parts[0].split(/\s+/).length
    const secondPart = parts[1].replace(/\s*\([^)]+\)\s*$/, "").trim()
    if (firstWords <= 3 && secondPart.length > 1) {
      return secondPart
    }
    return parts[0].replace(/\s*\([^)]+\)\s*$/, "").trim()
  }

  return cleaned.replace(/\s*\([^)]+\)\s*$/, "").trim()
}

// Mots-clés qui indiquent qu'une chaîne est un nom de salle/lieu
const VENUE_HINTS = /ballet|op[eé]ra|th[eé][aâ]tre|festival|mus[eé]e|espace|centre|maison|salle|chaillot|cnd\b|tce\b|mac\s|la\s+place|la\s+seine|philharmon|fondation|seine[-\s]saint|gennevilliers|bobigny|montreuil|vincennes|ivry|vélizy|veli?zy|aubervilliers|vitry|banlieue|théâtre\s+national|national\s+de/i

/**
 * Essaie d'extraire un nom de salle depuis le titre Notion.
 * De nombreux événements encodent la salle dans le titre :
 *   "Giselle — Johan Inger / Ballet de l'Opéra de Paris" → "Ballet de l'Opéra de Paris"
 *   "Leather Jacket — Oona Doherty / MAC Créteil"        → "MAC Créteil"
 *   "Muette — Boris Charmatz / Terrain (Chaillot)"        → "Terrain (Chaillot)"
 *   "Olivier Dubois — Come Out — Fondation Fiminco"       → "Fondation Fiminco"
 */
function extractVenueFromTitle(title) {
  // Cas 1 : salle après "/" dans le titre
  const slashMatch = title.match(/\/\s*([^/]+)$/)
  if (slashMatch) {
    const candidate = slashMatch[1].trim()
    if (VENUE_HINTS.test(candidate)) return candidate
    // Aussi tester le contenu des parenthèses s'il contient un nom de lieu
    const innerParen = candidate.match(/\(([^)]+)\)/)
    if (innerParen && VENUE_HINTS.test(innerParen[1])) return innerParen[1].trim()
  }

  // Cas 2 : segments séparés par — (2 ou 3+)
  const parts = title.split(/\s*[—–]\s*/).map(p => p.trim()).filter(Boolean)
  if (parts.length >= 2) {
    const lastPart = parts[parts.length - 1].replace(/\s*\([^)]+\)\s*$/, "").trim()
    if (VENUE_HINTS.test(lastPart)) return lastPart
    // Aussi vérifier les parenthèses dans le dernier segment
    const innerParen = parts[parts.length - 1].match(/\(([^)]+)\)/)
    if (innerParen && VENUE_HINTS.test(innerParen[1])) return innerParen[1].trim()
  }

  return ""
}

/**
 * Patterns d'URLs par salle.
 * Retourne une liste d'URLs candidates à tester pour un slug donné.
 * Les slugs testés sont, par ordre de priorité :
 *   - slug du titre principal (avant "—")
 *   - slug court (3-4 mots)
 *   - slug du titre complet
 */
const VENUE_PATTERNS = [
  // ── Danse / Scène nationale ──
  {
    match: ["chaillot", "theatre national de chaillot"],
    domain: "theatre-chaillot.fr",
    urls: (slug) => [
      `https://theatre-chaillot.fr/fr/spectacles/${slug}`,
      `https://theatre-chaillot.fr/fr/programmation/2026-2027/${slug}`,
      `https://theatre-chaillot.fr/fr/programmation/2025-2026/${slug}`,
    ],
  },
  {
    match: ["mc93", "maison de la culture de la seine-saint-denis", "bobigny"],
    domain: "mc93.com",
    urls: (slug) => [
      `https://www.mc93.com/agenda/${slug}`,
      `https://www.mc93.com/saison/${slug}`,
      `https://www.mc93.com/spectacles/${slug}`,
    ],
  },
  {
    match: ["festival d'automne", "festival automne", "automne a paris"],
    domain: "festival-automne.com",
    urls: (slug) => [
      `https://www.festival-automne.com/fr/edition-2026/${slug}`,
      `https://www.festival-automne.com/fr/spectacles/${slug}`,
      `https://www.festival-automne.com/spectacles/${slug}`,
    ],
  },
  {
    match: ["cnd", "centre national de la danse", "pantin"],
    domain: "cnd.fr",
    urls: (slug) => [
      `https://www.cnd.fr/fr/evenements/${slug}`,
      `https://www.cnd.fr/fr/programme/${slug}`,
    ],
  },
  {
    match: ["theatre de la ville", "theatredelaville", "abbesses", "espace cardin", "sarah bernhardt"],
    domain: "theatredelaville-paris.com",
    urls: (slug) => [
      `https://www.theatredelaville-paris.com/programmation/${slug}`,
      `https://www.theatredelaville-paris.com/${slug}`,
    ],
  },
  {
    match: ["centquatre", "le 104", "104 paris"],
    domain: "104.fr",
    urls: (slug) => [
      `https://www.104.fr/evenements/${slug}`,
      `https://www.104.fr/agenda/${slug}`,
    ],
  },
  // ── Opéra national de Paris ──
  {
    match: ["opera de paris", "opera national de paris", "palais garnier", "opera bastille", "ballet de l opera de paris", "ballet de lopera"],
    domain: "operadeparis.fr",
    urls: (slug) => [
      `https://www.operadeparis.fr/saison-26-27/ballet/${slug}`,
      `https://www.operadeparis.fr/saison-26-27/opera/${slug}`,
      `https://www.operadeparis.fr/saison-25-26/ballet/${slug}`,
      `https://www.operadeparis.fr/saison-25-26/opera/${slug}`,
    ],
  },
  {
    match: ["philharmonie de paris", "philharmonie"],
    domain: "philharmoniedeparis.fr",
    urls: (slug) => [
      `https://philharmoniedeparis.fr/fr/activite/${slug}`,
      `https://philharmoniedeparis.fr/fr/activite/danse/${slug}`,
    ],
  },
  {
    match: ["atelier de paris", "atelier paris cdcn"],
    domain: "atelierdeparis.org",
    urls: (slug) => [
      `https://www.atelierdeparis.org/programmation/${slug}`,
      `https://www.atelierdeparis.org/agenda/${slug}`,
    ],
  },
  // ── Salles de comédie musicale / spectacle ──
  {
    match: ["theatre mogador", "mogador"],
    domain: "theatremogador.com",
    urls: (slug) => [
      `https://www.theatremogador.com/spectacle/${slug}`,
      `https://www.theatremogador.com/${slug}`,
    ],
  },
  {
    match: ["theatre du chatelet", "le chatelet", "chatelet"],
    domain: "chatelet.com",
    urls: (slug) => [
      `https://www.chatelet.com/fr/programmation/${slug}`,
      `https://www.chatelet.com/fr/spectacle/${slug}`,
    ],
  },
  {
    match: ["theatre des champs-elysees", "tce", "champs-elysees"],
    domain: "theatrechampselysees.fr",
    urls: (slug) => [
      `https://www.theatrechampselysees.fr/saison/spectacle/${slug}`,
      `https://www.theatrechampselysees.fr/saison/${slug}`,
    ],
  },
  {
    match: ["la seine musicale", "seine musicale"],
    domain: "laseinemusicale.com",
    urls: (slug) => [
      `https://www.laseinemusicale.com/spectacles-concerts/${slug}`,
      `https://www.laseinemusicale.com/agenda/${slug}`,
    ],
  },
  {
    match: ["theatre marigny", "marigny"],
    domain: "theatremarigny.fr",
    urls: (slug) => [
      `https://www.theatremarigny.fr/spectacles/${slug}`,
    ],
  },
  {
    match: ["dome de paris", "palais des sports"],
    domain: "ledomedeparis.com",
    urls: (slug) => [
      `https://www.ledomedeparis.com/fr/${slug}`,
    ],
  },
  // ── Cabarets ──
  {
    match: ["moulin rouge"],
    domain: "moulinrouge.fr",
    urls: () => [`https://www.moulinrouge.fr/le-spectacle/`],
  },
  {
    match: ["paradis latin"],
    domain: "paradislatin.com",
    urls: () => [`https://www.paradislatin.com/fr/le-spectacle/`],
  },
  {
    match: ["crazy horse", "crazy horse paris"],
    domain: "lecrazyhorseparis.com",
    urls: () => [`https://www.lecrazyhorseparis.com/le-spectacle/`],
  },
  // ── Festivals ──
  {
    match: ["festival d'avignon", "festival avignon", "avignon"],
    domain: "festival-avignon.com",
    urls: (slug) => [
      `https://festival-avignon.com/fr/edition-2027/programmation/${slug}`,
      `https://festival-avignon.com/fr/edition-2026/programmation/${slug}`,
    ],
  },
  {
    match: ["montpellier danse"],
    domain: "montpellierdanse.com",
    urls: (slug) => [
      `https://www.montpellierdanse.com/spectacle/${slug}`,
    ],
  },
  {
    match: ["la place", "hip opsession", "hip hop"],
    domain: "la-place.fr",
    urls: (slug) => [
      `https://la-place.fr/agenda/${slug}`,
      `https://la-place.fr/evenement/${slug}`,
    ],
  },
  {
    match: ["suresnes cites danse", "theatre de suresnes", "suresnes jean vilar"],
    domain: "theatre-suresnes.fr",
    urls: (slug) => [
      `https://www.theatre-suresnes.fr/spectacle/${slug}`,
      `https://www.theatre-suresnes.fr/programme/${slug}`,
    ],
  },
  // ── Scènes régionales ──
  {
    match: ["theatre national de bretagne", "tnb", "rennes"],
    domain: "t-n-b.fr",
    urls: (slug) => [
      `https://www.t-n-b.fr/fr/programme/${slug}`,
    ],
  },
  {
    match: ["theatre du nord", "grand studio"],
    domain: "theatredunord.fr",
    urls: (slug) => [
      `https://www.theatredunord.fr/saison/spectacles/${slug}`,
    ],
  },
  {
    match: ["mac creteil", "mac de creteil", "maison des arts de creteil"],
    domain: "maccreteil.com",
    urls: (slug) => [
      `https://www.maccreteil.com/spectacle/${slug}`,
      `https://www.maccreteil.com/fr/spectacle/${slug}`,
    ],
  },
  {
    match: ["l'onde", "l onde velizy", "velizy"],
    domain: "londe.fr",
    urls: (slug) => [
      `https://www.londe.fr/saison/spectacle/${slug}`,
    ],
  },
  {
    match: ["theatre jean vilar", "vitry", "jean vilar vitry"],
    domain: "theatrejeanvilar.com",
    urls: (slug) => [
      `https://www.theatrejeanvilar.com/spectacles/${slug}`,
    ],
  },
  {
    match: ["t2g", "theatre de gennevilliers", "gennevilliers"],
    domain: "theatre2gennevilliers.fr",
    urls: (slug) => [
      `https://www.theatre2gennevilliers.fr/spectacle/${slug}`,
    ],
  },
  {
    match: ["theatre de vanves", "vanves", "artdanthe"],
    domain: "theatredevanves.fr",
    urls: (slug) => [
      `https://www.theatredevanves.fr/spectacle/${slug}`,
    ],
  },
  {
    match: ["theatre paul eluard", "choisy", "paul eluard"],
    domain: "theatrechoisy.fr",
    urls: (slug) => [
      `https://www.theatrechoisy.fr/spectacle/${slug}`,
    ],
  },
  {
    match: ["grand palais", "grandpalais"],
    domain: "grandpalais.fr",
    urls: (slug) => [
      `https://www.grandpalais.fr/fr/evenement/${slug}`,
    ],
  },
  {
    match: ["le nouveau gymnase", "nouveau gymnase", "espace 1789", "saint-ouen"],
    domain: "espace1789.com",
    urls: (slug) => [
      `https://www.espace1789.com/spectacle/${slug}`,
    ],
  },
  {
    match: ["fondation fiminco", "fiminco"],
    domain: "fondationfiminco.com",
    urls: (slug) => [
      `https://www.fondationfiminco.com/event/${slug}`,
      `https://www.fondationfiminco.com/agenda/${slug}`,
    ],
  },
]

/**
 * Teste si une URL répond avec un code 200.
 */
async function testUrl(url) {
  try {
    const res = await fetch(url, {
      method: "HEAD",
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html",
      },
      signal: AbortSignal.timeout(6000),
      redirect: "follow",
    })
    return res.ok
  } catch {
    return false
  }
}

const SKIP_DOMAINS = [
  "wikipedia.", "youtube.", "facebook.", "twitter.com", "instagram.", "tiktok.",
  "google.", "duckduckgo.", "amazon.", "fnac.", "ticketmaster.", "digitick.",
  "billetreduc.", "billeterie.", "leboncoin.", "lacentralebillet.", "bing.",
  "tripadvisor.", "yelp.", "pagesjaunes.", "maps.apple.", "apple.com/maps",
]

/**
 * Recherche via l'API Brave Search (si BRAVE_API_KEY est défini).
 * Documentation : https://api.search.brave.com/
 * Clé gratuite : https://brave.com/search/api/ (2 000 req/mois)
 */
async function searchBrave(query) {
  if (!BRAVE_API_KEY) return null
  try {
    const url = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=5&country=fr&search_lang=fr&ui_lang=fr-FR&safesearch=off`
    const res = await fetch(url, {
      headers: {
        "Accept": "application/json",
        "Accept-Encoding": "gzip",
        "X-Subscription-Token": BRAVE_API_KEY,
      },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return null
    const data = await res.json()
    const results = data?.web?.results || []
    for (const result of results) {
      const href = result.url
      if (href?.startsWith("http") && !SKIP_DOMAINS.some(d => href.includes(d))) {
        return href
      }
    }
  } catch { /* silence */ }
  return null
}

/**
 * Extrait et décode les URLs des résultats DuckDuckGo Lite.
 * La version "lite" (lite.duckduckgo.com) retourne du HTML minimal,
 * plus stable face aux mesures anti-bot.
 */
function parseDuckDuckGoLiteUrls(html) {
  const found = []
  // Liens dans les résultats DDG lite : <a class="result-link" href="...">
  const patterns = [
    /href="(https?:\/\/[^"#?]{10,})"/g,
    /\/l\/\?(?:[^"]*&)?uddg=([^&"]{10,})/g,
  ]
  for (const pat of patterns) {
    let m
    pat.lastIndex = 0
    while ((m = pat.exec(html)) !== null) {
      try {
        const raw = m[1]
        const url = raw.startsWith("http") ? raw : decodeURIComponent(raw)
        if (
          url.startsWith("http") &&
          !SKIP_DOMAINS.some(d => url.includes(d)) &&
          !url.includes("duckduckgo.com") &&
          !found.includes(url)
        ) {
          found.push(url)
        }
      } catch { /* décodage échoué */ }
      if (found.length >= 5) break
    }
    if (found.length > 0) break
  }
  return found
}

/**
 * Recherche l'URL officielle d'un événement via DuckDuckGo Lite.
 * Utilise la version "lite" qui déclenche moins de détection bot.
 * Limité par DuckDuckGo : uniquement en fallback ultime.
 */
async function searchDuckDuckGo(title, venue, year) {
  if (!title) return null

  // Construire des requêtes progressivement moins précises
  const venuePart = venue ? ` "${venue}"` : ""
  const queries = [
    `"${title}"${venuePart} ${year} spectacle site:officiel`,
    `${title}${venuePart} ${year} spectacle`,
    `${title} ${year} danse chorégraphie`,
  ]

  for (const query of queries) {
    const encoded = encodeURIComponent(query)
    try {
      const res = await fetch(`https://lite.duckduckgo.com/lite/?q=${encoded}&kl=fr-fr`, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
          Accept: "text/html",
          "Accept-Language": "fr-FR,fr;q=0.9",
        },
        signal: AbortSignal.timeout(10000),
      })
      if (!res.ok) {
        await new Promise(r => setTimeout(r, 1500))
        continue
      }
      const html = await res.text()

      // Détecter si DDG a bloqué la requête (CAPTCHA ou redirect)
      if (
        html.length < 800 ||
        html.includes("g-recaptcha") ||
        html.includes("blocked")
      ) {
        if (DEBUG) process.stdout.write(`\n     ⚠️  DDG a bloqué la requête`)
        break
      }

      const urls = parseDuckDuckGoLiteUrls(html)
      if (urls.length > 0) return urls[0]
    } catch { /* timeout ou erreur réseau */ }

    await new Promise(r => setTimeout(r, 1200))
  }

  return null
}

/**
 * Recherche web : Brave Search en priorité (si API key), DDG Lite en fallback.
 */
async function searchOnWeb(mainTitle, venue, year) {
  if (!mainTitle) return null

  const query = venue
    ? `${mainTitle} ${venue} ${year}`
    : `${mainTitle} ${year} spectacle danse Paris`

  // 1. Brave Search (fiable, pas de bot detection)
  const braveResult = await searchBrave(query)
  if (braveResult) return braveResult

  // 2. Fallback DDG Lite (susceptible d'être bloqué)
  return searchDuckDuckGo(mainTitle, venue, year)
}

/**
 * Découverte automatique de l'URL officielle d'un événement Notion.
 *
 * Stratégie :
 *   1. Extraire le titre principal (avant "—") et le lieu (depuis le titre si absent)
 *   2. Tester les patterns d'URL par salle connue avec plusieurs variantes de slug
 *   3. Recherche web en fallback (Brave API ou DDG Lite)
 */
async function discoverOfficialUrl(fullTitle, venue, startDate) {
  if (!fullTitle) return null

  // Titre principal (avant "—") pour le slug
  const mainTitle = extractMainTitle(fullTitle)
  // Lieu : depuis la propriété Notion ou extrait du titre
  const effectiveVenue = venue || extractVenueFromTitle(fullTitle)
  const venueNorm = normKey(effectiveVenue)

  const year = startDate?.slice(0, 4) || new Date().getFullYear()

  // Générer plusieurs variantes de slug par ordre de priorité :
  // 1. Slug du titre principal seul (ex. "giselle")
  // 2. Slug court du titre principal (≤ 4 mots)
  // 3. Slug du titre complet (≤ 6 mots)
  const slugMain = slugify(mainTitle)
  const slugMainShort = slugMain.split("-").slice(0, 4).join("-")
  const slugFull = slugify(fullTitle).split("-").slice(0, 6).join("-")
  const slugsToTry = [...new Set([slugMain, slugMainShort, slugFull].filter(Boolean))]

  if (DEBUG) {
    process.stdout.write(`\n     mainTitle="${mainTitle}" venue="${effectiveVenue}" slugs=[${slugsToTry.join(", ")}]\n`)
  }

  // 1. Patterns par salle
  for (const { match, urls } of VENUE_PATTERNS) {
    if (match.some(m => venueNorm.includes(normKey(m)))) {
      for (const slug of slugsToTry) {
        for (const candidateUrl of urls(slug)) {
          if (await testUrl(candidateUrl)) {
            return candidateUrl
          }
          await new Promise(r => setTimeout(r, 150))
        }
      }
      // Salle connue mais pattern échoué → on tente quand même la recherche web
      // (ne pas faire break ici, continuer vers le fallback)
      break
    }
  }

  // 2. Recherche web
  await new Promise(r => setTimeout(r, 300))
  return searchOnWeb(mainTitle, effectiveVenue, year)
}

// ─── URL / HTML helpers ──────────────────────────────────────────────────────

function resolveUrl(url, base) {
  const clean = (url || "").trim().replace(/&amp;/g, "&").replace(/&#x26;/g, "&")
  if (clean.startsWith("//")) return "https:" + clean
  if (clean.startsWith("/")) {
    try { return new URL(clean, base).href } catch { return "" }
  }
  return clean
}

function extractMeta(html, keys) {
  for (const key of keys) {
    for (const [qa, qb] of [["property", "name"], ["name", "property"]]) {
      const pats = [
        new RegExp(`<meta[^>]+${qa}=["']${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["'][^>]+content=["']([^"']+)["']`, "i"),
        new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+${qb}=["']${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']`, "i"),
      ]
      for (const p of pats) {
        const m = html.match(p)
        if (m?.[1]) return m[1].trim()
      }
    }
  }
  return null
}

function extractSchemaOrg(html, baseUrl) {
  const result = {}
  const scriptMatches = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]

  for (const match of scriptMatches) {
    try {
      const parsed = JSON.parse(match[1].trim())
      const items = Array.isArray(parsed)
        ? parsed
        : parsed["@graph"]
          ? parsed["@graph"]
          : [parsed]

      for (const item of items) {
        const type = String(item["@type"] ?? "")
        if (!/(Event|Concert|Theater|Theatre|Performance|Festival|Exhibition|DanceEvent)/i.test(type)) continue

        if (!result.image) {
          const img = item["image"]
          if (typeof img === "string" && img.startsWith("http")) result.image = img
          else if (img && typeof img === "object") {
            const u = img["url"] || img["contentUrl"] || ""
            if (String(u).startsWith("http")) result.image = String(u)
          }
          // Tableau d'images
          else if (Array.isArray(img) && img.length > 0) {
            const first = img[0]
            if (typeof first === "string" && first.startsWith("http")) result.image = first
            else if (typeof first === "object") {
              const u = first["url"] || first["contentUrl"] || ""
              if (String(u).startsWith("http")) result.image = String(u)
            }
          }
        }

        if (!result.description) {
          const d = String(item["description"] ?? "")
          if (d.length > 20) result.description = d
        }

        if (!result.price) {
          const offers = item["offers"]
          if (offers) {
            const list = Array.isArray(offers) ? offers : [offers]
            const prices = []
            for (const o of list) {
              const p = o["price"]
              const currency = String(o["priceCurrency"] ?? "EUR")
              const sym = currency === "EUR" ? "€" : currency
              if (p === 0 || p === "0") prices.push("Gratuit")
              else if (p !== undefined && p !== null && p !== "") prices.push(`${p}${sym}`)
            }
            if (prices.length) result.price = [...new Set(prices)].join(" – ")
          }
        }

        if (!result.disciplines?.length) {
          const kw = String(item["keywords"] ?? "")
          if (kw) result.disciplines = kw.split(",").map(k => k.trim()).filter(Boolean).slice(0, 6)
        }

        if (!result.videoUrl) {
          const v = item["video"] || item["trailer"]
          if (v) {
            const u = resolveUrl(String(v["contentUrl"] || v["url"] || v["embedUrl"] || ""), baseUrl)
            if (u.startsWith("http")) result.videoUrl = u
          }
        }
      }
    } catch { /* JSON-LD invalide */ }
  }
  return result
}

// ─── Page fetching ───────────────────────────────────────────────────────────

async function fetchFromHtml(pageUrl) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 7000)
  try {
    const res = await fetch(pageUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "fr-FR,fr;q=0.9",
      },
    })
    clearTimeout(timer)
    if (!res.ok) return null
    const html = await res.text()

    const rawImg = extractMeta(html, ["og:image", "og:image:secure_url", "twitter:image", "twitter:image:src"])
    const rawDesc = extractMeta(html, ["og:description", "description", "twitter:description"])
    const rawVideo = extractMeta(html, ["og:video", "og:video:url", "og:video:secure_url"])
    const schema = extractSchemaOrg(html, pageUrl)

    const image = schema.image || (rawImg ? resolveUrl(rawImg, pageUrl) : null)
    const description = schema.description || (rawDesc && rawDesc.length > 20 ? rawDesc : null)
    const videoUrl = schema.videoUrl || (rawVideo ? resolveUrl(rawVideo, pageUrl) : null)

    return {
      image: image?.startsWith("http") ? image : null,
      description: description || null,
      price: schema.price || null,
      disciplines: schema.disciplines?.length ? schema.disciplines : null,
      videoUrl: videoUrl?.startsWith("http") ? videoUrl : null,
      source: "html",
    }
  } catch {
    clearTimeout(timer)
    return null
  }
}

async function fetchFromMicrolink(pageUrl) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 12000)
  try {
    const res = await fetch(
      `https://api.microlink.io/?url=${encodeURIComponent(pageUrl)}&meta=true`,
      { signal: controller.signal, headers: { Accept: "application/json" } }
    )
    clearTimeout(timer)
    if (!res.ok) return null
    const data = await res.json()
    if (data?.status !== "success") return null
    const d = data.data || {}
    const image = d.image?.url?.trim()
    return {
      image: image?.startsWith("http") ? image : null,
      description: d.description || null,
      price: null,
      disciplines: null,
      videoUrl: null,
      source: "microlink",
    }
  } catch {
    clearTimeout(timer)
    return null
  }
}

async function enrichPage(pageUrl) {
  if (!pageUrl?.startsWith("http")) return null

  const fromHtml = await fetchFromHtml(pageUrl)

  if (fromHtml?.image) return fromHtml

  const fromMicrolink = await fetchFromMicrolink(pageUrl)
  if (!fromMicrolink?.image) return fromHtml || null

  return {
    image: fromMicrolink.image,
    description: fromHtml?.description || fromMicrolink.description || null,
    price: fromHtml?.price || null,
    disciplines: fromHtml?.disciplines || null,
    videoUrl: fromHtml?.videoUrl || null,
    source: "html+microlink",
  }
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  if (!NOTION_TOKEN) {
    console.error("❌ NOTION_TOKEN manquant. Définir la variable d'environnement.")
    process.exit(1)
  }

  // Charger le cache existant
  let cache = {}
  try {
    const raw = await fs.readFile(CACHE_FILE, "utf8")
    cache = JSON.parse(raw)
  } catch { cache = {} }

  console.log("📚 Récupération des pages Notion...")
  const pages = await fetchAllPages()
  console.log(`   ${pages.length} pages trouvées`)

  const today = new Date().toISOString().slice(0, 10)
  const currentYear = new Date().getFullYear()

  // Séparer les pages avec et sans URL officielle
  const pagesWithUrl = []
  const pagesWithoutUrl = []

  for (const p of pages) {
    if (isPast(p)) continue
    const url = getOfficialUrl(p)
    if (url?.startsWith("http")) {
      pagesWithUrl.push(p)
    } else {
      pagesWithoutUrl.push(p)
    }
  }

  console.log(`\n📋 ${pagesWithUrl.length} événements avec URL officielle`)
  console.log(`🔍 ${pagesWithoutUrl.length} événements sans URL → découverte automatique`)

  // ── Phase 1 : Découverte automatique des URLs manquantes ─────────────────

  if (pagesWithoutUrl.length > 0) {
    console.log(`\n━━━ Phase 1 : Découverte automatique des URLs ━━━━━━━━━━━━━━━━━━━━━━━━━`)

    const toDiscover = LIMIT > 0 ? pagesWithoutUrl.slice(0, LIMIT) : pagesWithoutUrl
    let discovered = 0

    for (let i = 0; i < toDiscover.length; i++) {
      const page = toDiscover[i]
      const title = getTitle(page)
      const venue = getVenue(page)
      const startDate = getStartDate(page)
      const pct = Math.round(((i + 1) / toDiscover.length) * 100)

      process.stdout.write(`[${String(pct).padStart(3)}%] ${title.slice(0, 40).padEnd(40)} `)

      if (DEBUG) {
        process.stdout.write(`\n     props: ${debugProps(page)}\n     title="${title}" venue="${venue}"\n`)
      }

      if (DRY_RUN) {
        process.stdout.write(`[dry-run: venue="${venue}"]\n`)
        continue
      }

      const foundUrl = await discoverOfficialUrl(title, venue, startDate)

      if (foundUrl) {
        process.stdout.write(`🔗 ${foundUrl.slice(0, 55)}\n`)
        discovered++

        // Écrire dans Notion
        if (!NO_NOTION_UPDATE) {
          const written = await writeUrlToNotion(page.id, foundUrl, page.properties)
          if (written) {
            process.stdout.write(`     ✏️  URL écrite dans Notion\n`)
          }
        }

        // Ajouter à la liste pour enrichissement
        // On recycle l'objet page avec la nouvelle URL (in-memory)
        pagesWithUrl.push({ ...page, _discoveredUrl: foundUrl })
      } else {
        process.stdout.write(`❓ Introuvable\n`)
      }

      await new Promise(r => setTimeout(r, 400))
    }

    console.log(`\n   ✅ ${discovered}/${toDiscover.length} URLs découvertes automatiquement`)
  }

  // ── Phase 2 : Enrichissement (image, description, prix…) ─────────────────

  // Toutes les pages à enrichir : avec URL d'origine + URLs découvertes
  const allToEnrich = pagesWithUrl.filter(p => {
    const url = p._discoveredUrl || getOfficialUrl(p)
    if (!FORCE && url in cache) return false
    return true
  })

  console.log(`\n━━━ Phase 2 : Enrichissement des pages ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
  console.log(`🔍 ${allToEnrich.length} événements à enrichir`)

  const batch = LIMIT > 0 ? allToEnrich.slice(0, LIMIT) : allToEnrich
  let found = 0, failed = 0
  const stats = { image: 0, description: 0, price: 0, disciplines: 0, videoUrl: 0 }

  for (let i = 0; i < batch.length; i++) {
    const page = batch[i]
    const title = getTitle(page)
    const url = page._discoveredUrl || getOfficialUrl(page)
    const pct = Math.round(((i + 1) / batch.length) * 100)

    process.stdout.write(`[${String(pct).padStart(3)}%] ${title.slice(0, 42).padEnd(42)} `)

    if (DRY_RUN) {
      process.stdout.write(`[dry-run]\n`)
      continue
    }

    const result = await enrichPage(url)

    if (result) {
      cache[url] = {
        image: result.image || null,
        description: result.description || null,
        price: result.price || null,
        disciplines: result.disciplines || null,
        videoUrl: result.videoUrl || null,
        enrichedAt: today,
      }
      found++
      if (result.image) stats.image++
      if (result.description) stats.description++
      if (result.price) stats.price++
      if (result.disciplines) stats.disciplines++
      if (result.videoUrl) stats.videoUrl++

      const fields = [
        result.image ? "🖼️" : "—",
        result.description ? "📝" : "—",
        result.price ? "💰" : "—",
        result.disciplines ? "🎭" : "—",
        result.videoUrl ? "🎬" : "—",
      ].join(" ")
      process.stdout.write(`${fields} [${result.source}]\n`)
    } else {
      cache[url] = null
      failed++
      process.stdout.write("❌\n")
    }

    // Sauvegarde progressive toutes les 10 entrées
    if ((i + 1) % 10 === 0) {
      await fs.writeFile(CACHE_FILE, JSON.stringify(cache, null, 2))
    }

    await new Promise(r => setTimeout(r, 150))
  }

  await fs.writeFile(CACHE_FILE, JSON.stringify(cache, null, 2))

  // ── Résumé final ──────────────────────────────────────────────────────────

  console.log(`\n━━━ Résumé ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
  console.log(`   ✅ Pages enrichies    : ${found}`)
  console.log(`   ❌ Échecs             : ${failed}`)
  console.log(`\n   Champs extraits :`)
  console.log(`   🖼️  Images            : ${stats.image}/${found}`)
  console.log(`   📝 Descriptions       : ${stats.description}/${found}`)
  console.log(`   💰 Prix               : ${stats.price}/${found}`)
  console.log(`   🎭 Disciplines        : ${stats.disciplines}/${found}`)
  console.log(`   🎬 Vidéos             : ${stats.videoUrl}/${found}`)
  console.log(`\n   📁 Cache mis à jour  : ${CACHE_FILE}`)
  console.log(`      ${Object.keys(cache).length} URLs en cache total`)
}

main().catch(err => {
  console.error("Erreur fatale :", err)
  process.exit(1)
})
