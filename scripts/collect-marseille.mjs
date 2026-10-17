#!/usr/bin/env node
/**
 * scripts/collect-marseille.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Collecte les événements de danse à Marseille et en Provence depuis les sites
 * officiels des principaux lieux culturels.
 *
 * Stratégie :
 *   1. Scraping HTML des pages de programmation (pas d'API disponible)
 *   2. Détection des schémas JSON-LD (schema.org/Event) quand présents
 *   3. Normalisation vers le format AgendaEvent Dance Lab
 *   4. Écriture dans Notion (optionnel avec --no-notion-update)
 *
 * Usage :
 *   node scripts/collect-marseille.mjs
 *   node scripts/collect-marseille.mjs --dry-run       # pas d'écriture Notion
 *   node scripts/collect-marseille.mjs --venue klap    # un seul lieu
 *   node scripts/collect-marseille.mjs --json          # sortie JSON brute
 *
 * Dépendances :
 *   npm install node-fetch cheerio @notionhq/client dotenv
 */

import https from "https"
import http from "http"
import { fileURLToPath } from "url"
import path from "path"
import fs from "fs"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// ─── Configuration ────────────────────────────────────────────────────────────

const DRY_RUN  = process.argv.includes("--dry-run")
const AS_JSON  = process.argv.includes("--json")
const VENUE_ARG = process.argv.find(a => a.startsWith("--venue="))?.split("=")[1]

// Tentative de chargement de dotenv
try {
  const dotenvPath = path.join(__dirname, "..", ".env.local")
  if (fs.existsSync(dotenvPath)) {
    const lines = fs.readFileSync(dotenvPath, "utf-8").split("\n")
    for (const line of lines) {
      const m = line.match(/^([A-Z_]+)=(.+)$/)
      if (m) process.env[m[1]] = m[2].trim().replace(/^['"]|['"]$/g, "")
    }
  }
} catch { /* ignore */ }

// ─── Définition des lieux de collecte ────────────────────────────────────────

const VENUES = [
  // ── Marseille ──────────────────────────────────────────────────────────────
  {
    id: "klap",
    name: "KLAP Maison pour la danse",
    city: "Marseille",
    postalCode: "13003",
    address: "5 avenue Rostand, 13003 Marseille",
    latitude: 43.2965, longitude: 5.3697,
    urls: [
      "https://www.klap.art/programmation",
      "https://www.klap-marseille.com/saison",
    ],
    selectors: {
      // Sélecteurs CSS pour extraire les événements (ajuster selon HTML réel)
      eventList: ".event-item, .programmation-item, article.event, .card-event",
      title: "h2, h3, .event-title, .titre",
      date: ".event-date, .date, time",
      description: ".description, .texte, p",
      link: "a[href]",
      image: "img",
    },
    disciplines: ["Danse contemporaine"],
    category: "Spectacle",
  },
  {
    id: "ballet-marseille",
    name: "Ballet national de Marseille",
    city: "Marseille",
    postalCode: "13001",
    address: "20 boulevard de Gabès, 13008 Marseille",
    latitude: 43.2847, longitude: 5.3989,
    urls: [
      "https://www.ballet-de-marseille.com/saison",
      "https://www.ballet-de-marseille.com/programmation",
    ],
    disciplines: ["Ballet", "Danse contemporaine"],
    category: "Ballet",
  },
  {
    id: "festival-marseille",
    name: "Festival de Marseille",
    city: "Marseille",
    postalCode: "13001",
    latitude: 43.2965, longitude: 5.3698,
    urls: [
      "https://www.festival-de-marseille.com/programmation",
      "https://www.festival-de-marseille.com/",
    ],
    disciplines: ["Danse contemporaine", "Performance"],
    category: "Festival",
  },
  {
    id: "lacriee",
    name: "La Criée — Théâtre National de Marseille",
    city: "Marseille",
    postalCode: "13007",
    address: "30 quai de Rive Neuve, 13007 Marseille",
    latitude: 43.2900, longitude: 5.3610,
    urls: [
      "https://www.lacriee.org/saison",
      "https://www.lacriee.org/spectacles",
    ],
    disciplines: ["Danse contemporaine"],
    category: "Spectacle",
  },
  {
    id: "zef",
    name: "Le ZEF — Scène nationale de Marseille",
    city: "Marseille",
    postalCode: "13015",
    address: "338 chemin de la Madrague-Ville, 13015 Marseille",
    latitude: 43.3100, longitude: 5.3850,
    urls: [
      "https://www.zef-marseille.com/programmation",
      "https://www.scenenationalezef.com/programmation",
    ],
    disciplines: ["Danse contemporaine", "Cirque"],
    category: "Spectacle",
  },
  {
    id: "joliette",
    name: "Théâtre Joliette",
    city: "Marseille",
    postalCode: "13002",
    address: "2 place Henri Verneuil, 13002 Marseille",
    latitude: 43.2980, longitude: 5.3460,
    urls: [
      "https://www.theatrejoliette.fr/saison",
      "https://www.theatrejoliette.fr/programmation",
    ],
    disciplines: ["Danse contemporaine"],
    category: "Spectacle",
  },
  {
    id: "friche",
    name: "Friche la Belle de Mai",
    city: "Marseille",
    postalCode: "13003",
    address: "41 rue Jobin, 13003 Marseille",
    latitude: 43.3108, longitude: 5.3936,
    urls: [
      "https://www.lafriche.org/agenda",
      "https://www.lafriche.org/programmation",
    ],
    disciplines: ["Performance", "Danse contemporaine"],
    category: "Performance",
  },
  {
    id: "silo",
    name: "CEPAC Silo",
    city: "Marseille",
    postalCode: "13002",
    address: "35 quai du Lazaret, 13002 Marseille",
    latitude: 43.3018, longitude: 5.3380,
    urls: [
      "https://www.cepacsilo.com/agenda",
      "https://www.cepacsilo.com/programmation",
    ],
    disciplines: ["Comédie musicale"],
    category: "Comédie musicale",
  },
  {
    id: "gymnase",
    name: "Théâtre du Gymnase — Marie Bell",
    city: "Marseille",
    postalCode: "13001",
    address: "4 rue du Théâtre Français, 13001 Marseille",
    latitude: 43.2955, longitude: 5.3785,
    urls: [
      "https://www.theatredugymnase.com/programmation",
      "https://www.theatredugymnase.com/spectacles",
    ],
    disciplines: ["Spectacle vivant"],
    category: "Spectacle",
  },
  {
    id: "opera-marseille",
    name: "Opéra de Marseille",
    city: "Marseille",
    postalCode: "13001",
    address: "2 rue Molière, 13001 Marseille",
    latitude: 43.2970, longitude: 5.3822,
    urls: [
      "https://www.opera.marseille.fr/saison",
      "https://www.opera.marseille.fr/programmation",
    ],
    disciplines: ["Ballet", "Opéra"],
    category: "Ballet",
  },
  // ── Aix-en-Provence ────────────────────────────────────────────────────────
  {
    id: "pavillon-noir",
    name: "Pavillon Noir — CCN Ballet Preljocaj",
    city: "Aix-en-Provence",
    postalCode: "13100",
    address: "530 avenue Wolfgang Amadeus Mozart, 13100 Aix-en-Provence",
    latitude: 43.5350, longitude: 5.4260,
    urls: [
      "https://www.preljocaj.org/calendrier",
      "https://www.preljocaj.org/spectacles",
    ],
    disciplines: ["Danse contemporaine", "Ballet"],
    category: "Ballet",
  },
  {
    id: "grand-theatre-provence",
    name: "Grand Théâtre de Provence",
    city: "Aix-en-Provence",
    postalCode: "13100",
    address: "380 avenue Max Juvénal, 13100 Aix-en-Provence",
    latitude: 43.5299, longitude: 5.4430,
    urls: [
      "https://www.grandtheatredeprovence.com/saison",
      "https://www.lestheatres.net/fr/saison",
    ],
    disciplines: ["Ballet", "Danse"],
    category: "Ballet",
  },
]

// ─── Utilitaires HTTP ─────────────────────────────────────────────────────────

const USER_AGENT = "DanceLab-collector/1.0 (https://dancelab.fr; contact@dancelab.fr)"

function fetchUrl(url, timeout = 12000) {
  return new Promise((resolve) => {
    const mod = url.startsWith("https") ? https : http
    const req = mod.get(url, { headers: { "User-Agent": USER_AGENT, "Accept-Language": "fr-FR,fr;q=0.9" } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        const loc = res.headers.location
        if (loc) return resolve(fetchUrl(loc.startsWith("http") ? loc : new URL(loc, url).href, timeout))
        return resolve({ ok: false, status: res.statusCode, text: "" })
      }
      let body = ""
      res.setEncoding("utf-8")
      res.on("data", c => body += c)
      res.on("end", () => resolve({ ok: res.statusCode < 400, status: res.statusCode, text: body }))
    })
    req.on("error", () => resolve({ ok: false, status: 0, text: "" }))
    req.setTimeout(timeout, () => { req.destroy(); resolve({ ok: false, status: 0, text: "" }) })
  })
}

// ─── Extraction JSON-LD ───────────────────────────────────────────────────────

function extractJsonLdEvents(html) {
  const events = []
  const regex = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  let m
  while ((m = regex.exec(html)) !== null) {
    try {
      const data = JSON.parse(m[1])
      const items = Array.isArray(data) ? data : [data]
      for (const item of items) {
        if (!item["@type"]) continue
        const types = Array.isArray(item["@type"]) ? item["@type"] : [item["@type"]]
        if (types.some(t => /Event|DanceEvent|MusicEvent|TheaterEvent/i.test(t))) {
          events.push(item)
        }
        // Liste d'événements
        if (item["@type"] === "ItemList" && item.itemListElement) {
          for (const el of item.itemListElement) {
            const it = el.item || el
            if (it["@type"] && /Event/i.test(it["@type"])) events.push(it)
          }
        }
      }
    } catch { /* skip malformed JSON */ }
  }
  return events
}

// ─── Normalisation JSON-LD → AgendaEvent ─────────────────────────────────────

function slugify(str) {
  return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80)
}

function parseIsoDate(str) {
  if (!str) return null
  const m = String(str).match(/(\d{4}-\d{2}-\d{2})/)
  return m ? m[1] : null
}

function normalizeJsonLdEvent(item, venue) {
  const title = item.name || ""
  if (!title) return null

  const startDate = parseIsoDate(item.startDate)
  if (!startDate) return null

  const endDate = parseIsoDate(item.endDate)
  const today = new Date().toISOString().slice(0, 10)
  if ((endDate ?? startDate) < today) return null // passé

  const location = item.location
  const locationName = typeof location === "object" ? (location.name || venue.name) : venue.name
  const locationAddr = typeof location === "object" ? (location.address?.streetAddress || venue.address || "") : (venue.address || "")

  const image = typeof item.image === "string" ? item.image
    : Array.isArray(item.image) ? item.image[0]
    : typeof item.image === "object" ? item.image?.url
    : ""

  const ticketUrl = typeof item.offers === "object"
    ? (Array.isArray(item.offers) ? item.offers[0]?.url : item.offers?.url)
    : (item.url || venue.urls[0])

  const price = typeof item.offers === "object"
    ? (Array.isArray(item.offers) ? item.offers[0]?.price : item.offers?.price)
    : ""

  const description = item.description || ""
  const slug = `marseille-${slugify(title)}-${startDate}`

  return {
    slug,
    title,
    description,
    image: image || "",
    dates: startDate,
    startDate,
    endDate: endDate || undefined,
    venue: locationName,
    address: locationAddr,
    city: venue.city,
    postalCode: venue.postalCode,
    latitude: venue.latitude,
    longitude: venue.longitude,
    price: price ? `${price} €` : "",
    category: venue.category,
    disciplines: venue.disciplines,
    officialUrl: item.url || venue.urls[0],
    ticketUrl: ticketUrl || "",
    source: `collect-marseille/${venue.id}`,
    sourceLabel: venue.name,
    lastVerifiedAt: today,
    status: "À venir",
    additionalInfo: [],
  }
}

// ─── Collecte d'un lieu ───────────────────────────────────────────────────────

async function collectVenue(venue) {
  const results = []
  let lastError = null

  for (const url of venue.urls) {
    process.stderr.write(`  ↗  ${url} … `)
    const res = await fetchUrl(url)

    if (!res.ok) {
      process.stderr.write(`❌ (HTTP ${res.status})\n`)
      lastError = `HTTP ${res.status}`
      continue
    }

    process.stderr.write(`✅\n`)

    // 1. Essayer JSON-LD
    const jsonLdEvents = extractJsonLdEvents(res.text)
    if (jsonLdEvents.length > 0) {
      process.stderr.write(`     🗂  ${jsonLdEvents.length} événement(s) JSON-LD trouvé(s)\n`)
      for (const item of jsonLdEvents) {
        const event = normalizeJsonLdEvent(item, venue)
        if (event) results.push(event)
      }
      if (results.length > 0) break // succès, on arrête
    }

    // 2. Heuristic HTML : chercher des patterns de dates
    const datePattern = /(\d{1,2}[\s/.](?:jan|f[eé]v|mars?|avr|mai|juin|juil|ao[uû]t|sep|oct|nov|d[eé]c)\w*[\s.]*\d{0,4})/gi
    const dateMatches = res.text.match(datePattern)
    if (dateMatches?.length > 0) {
      process.stderr.write(`     📅 ${dateMatches.length} date(s) détectée(s) dans le HTML (extraction manuelle nécessaire)\n`)
    }

    if (results.length === 0) {
      process.stderr.write(`     ⚠  Aucun événement structuré — vérification manuelle recommandée\n`)
      process.stderr.write(`         → ${url}\n`)
    }

    break
  }

  return { venue: venue.id, name: venue.name, city: venue.city, events: results, error: lastError }
}

// ─── Export vers Notion (optionnel) ──────────────────────────────────────────

async function exportToNotion(events) {
  const token = process.env.NOTION_TOKEN
  const dbId  = process.env.NOTION_AGENDA_DATABASE_ID

  if (!token || !dbId) {
    console.error("⚠  NOTION_TOKEN ou NOTION_AGENDA_DATABASE_ID non défini — pas d'export Notion.")
    return
  }

  // Import dynamique de @notionhq/client
  let Client
  try {
    const mod = await import("@notionhq/client")
    Client = mod.Client
  } catch {
    console.error("⚠  @notionhq/client non installé. Lance : npm install @notionhq/client")
    return
  }

  const notion = new Client({ auth: token })
  let created = 0, skipped = 0

  for (const event of events) {
    try {
      await notion.pages.create({
        parent: { database_id: dbId },
        properties: {
          "Nom": { title: [{ text: { content: event.title } }] },
          "Ville": { rich_text: [{ text: { content: event.city } }] },
          "Lieu": { rich_text: [{ text: { content: event.venue } }] },
          "Date de début": { date: { start: event.startDate, end: event.endDate ?? null } },
          "URL officielle": { url: event.officialUrl },
          "Lien billetterie": event.ticketUrl ? { url: event.ticketUrl } : undefined,
          "Source": { rich_text: [{ text: { content: event.sourceLabel } }] },
        },
      })
      created++
      process.stderr.write(`  ✅ Créé : ${event.title}\n`)
    } catch (err) {
      process.stderr.write(`  ❌ Erreur Notion : ${event.title} — ${err.message}\n`)
      skipped++
    }
  }

  console.log(`\n  Notion : ${created} événements créés, ${skipped} échecs.`)
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const venuesToCollect = VENUE_ARG
    ? VENUES.filter(v => v.id === VENUE_ARG)
    : VENUES

  if (venuesToCollect.length === 0) {
    console.error(`❌ Lieu inconnu : "${VENUE_ARG}". IDs disponibles : ${VENUES.map(v => v.id).join(", ")}`)
    process.exit(1)
  }

  console.error(`\n🎭  Collecte Dance Lab — Marseille & Provence`)
  console.error(`    ${venuesToCollect.length} lieu(x) à traiter${DRY_RUN ? " (dry run)" : ""}\n`)

  const allResults = []
  const allEvents  = []
  let totalFound = 0, totalVenuesOk = 0, totalVenuesEmpty = 0

  for (const venue of venuesToCollect) {
    console.error(`\n📍 ${venue.name} (${venue.city})`)
    const result = await collectVenue(venue)
    allResults.push(result)
    allEvents.push(...result.events)
    totalFound += result.events.length
    if (result.events.length > 0) totalVenuesOk++
    else totalVenuesEmpty++
  }

  // Déduplication par slug
  const seen = new Set()
  const unique = allEvents.filter(e => {
    if (seen.has(e.slug)) return false
    seen.add(e.slug)
    return true
  })

  console.error(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
  console.error(`  ✅ ${totalVenuesOk} lieu(x) avec données structurées`)
  console.error(`  ⚠  ${totalVenuesEmpty} lieu(x) sans données structurées (HTML non parsé)`)
  console.error(`  🎯 ${unique.length} événements uniques collectés`)
  console.error(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`)

  if (totalVenuesEmpty > 0) {
    console.error("  💡 Pour les lieux sans données JSON-LD, les URLs à visiter manuellement :")
    for (const r of allResults.filter(r => r.events.length === 0)) {
      console.error(`     • ${r.name} : ${VENUES.find(v => v.id === r.venue)?.urls[0]}`)
    }
    console.error()
  }

  if (AS_JSON) {
    console.log(JSON.stringify({ venues: allResults, events: unique }, null, 2))
    return
  }

  if (unique.length === 0) {
    console.error("  Aucun événement collecté automatiquement.")
    console.error("  Les sites marseillais n'exposent pas encore de JSON-LD.")
    console.error("  → Visite les URLs ci-dessus et ajoute les événements manuellement dans Notion.")
    return
  }

  // Afficher les événements collectés
  console.log(`\n${unique.length} événement(s) collecté(s) :\n`)
  for (const e of unique) {
    console.log(`  • [${e.startDate}] ${e.title} — ${e.venue}, ${e.city}`)
    if (e.officialUrl) console.log(`    ${e.officialUrl}`)
  }

  // Export Notion
  if (!DRY_RUN && unique.length > 0) {
    console.log("\n📤 Export vers Notion…")
    await exportToNotion(unique)
  } else if (DRY_RUN) {
    console.log("\n  (dry run — aucun export Notion)")
  }
}

main().catch(err => { console.error(err); process.exit(1) })
