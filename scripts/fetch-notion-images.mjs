#!/usr/bin/env node
/**
 * fetch-notion-images.mjs
 *
 * Pré-télécharge les og:image pour tous les événements Notion de l'agenda.
 * Utilise Microlink.io pour rendre le JavaScript des sites SPA/CSR.
 *
 * Résultats sauvegardés dans data/notion-image-urls.json
 * (clé = officialUrl de l'événement, valeur = URL de l'image trouvée)
 *
 * Usage :
 *   node scripts/fetch-notion-images.mjs [--dry-run] [--limit 50]
 *
 * Variables d'environnement requises :
 *   NOTION_TOKEN ou NOTION_API_KEY
 *   NOTION_AGENDA_DATABASE_ID (optionnel)
 */

import fs from "fs/promises"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, "..")
const CACHE_FILE = path.join(ROOT, "data", "notion-image-urls.json")

const NOTION_VERSION = "2025-09-03"
const DEFAULT_DATABASE_ID = "c06a1552cfcc4522ae68d32f833b3cf3"
const NOTION_TOKEN = process.env.NOTION_TOKEN || process.env.NOTION_API_KEY
const NOTION_DATABASE_ID = process.env.NOTION_AGENDA_DATABASE_ID || DEFAULT_DATABASE_ID

const DRY_RUN = process.argv.includes("--dry-run")
const LIMIT = (() => {
  const idx = process.argv.indexOf("--limit")
  return idx !== -1 ? parseInt(process.argv[idx + 1] || "50", 10) : 0
})()

// ─── Notion API ─────────────────────────────────────────────────────────────

async function notionRequest(path_, init = {}) {
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
  const db = await notionRequest(`databases/${NOTION_DATABASE_ID}`, { method: "GET" })
  return db.data_sources?.[0]?.id || NOTION_DATABASE_ID
}

async function fetchAllPages() {
  const dataSourceId = await resolveDataSourceId()
  const pages = []
  let cursor

  do {
    const data = await notionRequest(`data_sources/${dataSourceId}/query`, {
      method: "POST",
      body: JSON.stringify({ page_size: 100, start_cursor: cursor }),
    })
    pages.push(...data.results)
    cursor = data.has_more ? data.next_cursor : undefined
  } while (cursor)

  return pages
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function getText(prop) {
  if (!prop) return ""
  if (prop.type === "title") return prop.title?.map(t => t.plain_text || "").join("").trim() || ""
  if (prop.type === "rich_text") return prop.rich_text?.map(t => t.plain_text || "").join("").trim() || ""
  if (prop.type === "url") return prop.url || ""
  if (prop.type === "select") return prop.select?.name || ""
  if (prop.type === "status") return prop.status?.name || ""
  return ""
}

function normalizeKey(name) {
  return name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
}

function findProp(properties, aliases) {
  const normed = aliases.map(normalizeKey)
  const entry = Object.entries(properties).find(([k]) => normed.includes(normalizeKey(k)))
  return entry?.[1]
}

function getFileUrl(prop) {
  const f = prop?.files?.[0]
  if (!f) return ""
  return f.type === "external" ? f.external?.url || "" : f.file?.url || ""
}

function hasCoverImage(page) {
  // Notion cover
  if (page.cover) {
    const url = page.cover.type === "external" ? page.cover.external?.url : page.cover.file?.url
    if (url) return true
  }
  // Named image property
  const imageProp = findProp(page.properties, ["Image", "Photo", "Affiche", "Visuel", "Cover"])
  if (getFileUrl(imageProp)) return true
  // Any files property
  for (const prop of Object.values(page.properties)) {
    if (prop.type === "files" && prop.files?.length) {
      if (getFileUrl(prop)) return true
    }
  }
  return false
}

function getOfficialUrl(page) {
  const prop = findProp(page.properties, ["Lien", "URL", "Lien officiel", "Site", "OfficialUrl", "Page officielle"])
  return getText(prop) || ""
}

function getTitle(page) {
  const prop = findProp(page.properties, ["title", "Titre", "Nom", "Name"])
  return getText(prop) || ""
}

function isPast(page) {
  const dateProp = findProp(page.properties, ["date", "Date", "Dates", "Période", "Quand", "Début"])
  const start = dateProp?.date?.start?.slice(0, 10) || dateProp?.formula?.date?.start?.slice(0, 10)
  const end = dateProp?.date?.end?.slice(0, 10) || dateProp?.formula?.date?.end?.slice(0, 10)
  if (!start) return false
  const today = new Date().toISOString().slice(0, 10)
  return end ? end < today : start < today
}

// ─── Image fetching ──────────────────────────────────────────────────────────

async function fetchOgImageFromHtml(pageUrl) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 6000)
  try {
    const res = await fetch(pageUrl, {
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; DanceLab/1.0)", Accept: "text/html" },
    })
    clearTimeout(timer)
    if (!res.ok) return null
    const html = await res.text()
    const patterns = [
      /<meta[^>]+property=["']og:image(?::secure_url)?["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image(?::secure_url)?["']/i,
      /<meta[^>]+name=["']twitter:image(?::src)?["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image(?::src)?["']/i,
    ]
    for (const pat of patterns) {
      const m = html.match(pat)
      if (m?.[1]) {
        let url = m[1].trim().replace(/&amp;/g, "&").replace(/&#x26;/g, "&")
        if (url.startsWith("//")) url = "https:" + url
        else if (url.startsWith("/")) url = new URL(url, pageUrl).href
        if (url.startsWith("http")) return url
      }
    }
    return null
  } catch {
    clearTimeout(timer)
    return null
  }
}

async function fetchOgImageViaMicrolink(pageUrl) {
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
    const url = data?.data?.image?.url?.trim()
    return url?.startsWith("http") ? url : null
  } catch {
    clearTimeout(timer)
    return null
  }
}

async function fetchImage(pageUrl) {
  if (!pageUrl?.startsWith("http")) return null
  const fromHtml = await fetchOgImageFromHtml(pageUrl)
  if (fromHtml) return { url: fromHtml, source: "html" }
  const fromMicrolink = await fetchOgImageViaMicrolink(pageUrl)
  if (fromMicrolink) return { url: fromMicrolink, source: "microlink" }
  return null
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  if (!NOTION_TOKEN) {
    console.error("❌ NOTION_TOKEN manquant. Exporter la variable d'environnement.")
    process.exit(1)
  }

  // Charger le cache existant
  let cache = {}
  try {
    const raw = await fs.readFile(CACHE_FILE, "utf8")
    cache = JSON.parse(raw)
  } catch {
    cache = {}
  }

  console.log(`📚 Récupération des pages Notion...`)
  const pages = await fetchAllPages()
  console.log(`   ${pages.length} pages trouvées`)

  // Filtrer : sans image Notion, pas passées, avec URL officielle, pas déjà dans le cache
  const toFetch = pages
    .filter(p => !isPast(p))
    .filter(p => !hasCoverImage(p))
    .filter(p => {
      const url = getOfficialUrl(p)
      return url && url.startsWith("http")
    })
    .filter(p => {
      const url = getOfficialUrl(p)
      return !(url in cache) // pas déjà en cache (même valeur null)
    })

  console.log(`\n🔍 ${toFetch.length} événements sans image à traiter`)
  if (DRY_RUN) {
    console.log("\n[DRY-RUN] Événements qui seraient traités :")
    toFetch.forEach(p => {
      console.log(`  - ${getTitle(p)} → ${getOfficialUrl(p)}`)
    })
    return
  }

  const batch = LIMIT > 0 ? toFetch.slice(0, LIMIT) : toFetch
  if (LIMIT > 0) console.log(`   → Limité à ${batch.length} événements (--limit ${LIMIT})`)

  let found = 0, failed = 0, htmlCount = 0, microlinkCount = 0

  for (let i = 0; i < batch.length; i++) {
    const page = batch[i]
    const title = getTitle(page)
    const officialUrl = getOfficialUrl(page)
    const pct = Math.round(((i + 1) / batch.length) * 100)

    process.stdout.write(`[${pct}%] ${title.slice(0, 50).padEnd(50)} `)

    const result = await fetchImage(officialUrl)

    if (result) {
      cache[officialUrl] = result.url
      found++
      if (result.source === "html") htmlCount++
      else microlinkCount++
      process.stdout.write(`✅ ${result.source}\n`)
    } else {
      cache[officialUrl] = null // null = tried, not found
      failed++
      process.stdout.write(`❌\n`)
    }

    // Sauvegarder progressivement (toutes les 10 entrées)
    if ((i + 1) % 10 === 0) {
      await fs.writeFile(CACHE_FILE, JSON.stringify(cache, null, 2))
    }

    // Petit délai pour ne pas surcharger Microlink
    await new Promise(r => setTimeout(r, 200))
  }

  // Sauvegarde finale
  await fs.writeFile(CACHE_FILE, JSON.stringify(cache, null, 2))

  console.log(`\n📊 Résultats :`)
  console.log(`   ✅ Images trouvées : ${found} (HTML: ${htmlCount}, Microlink: ${microlinkCount})`)
  console.log(`   ❌ Échecs : ${failed}`)
  console.log(`   📁 Cache mis à jour : ${CACHE_FILE}`)
}

main().catch(err => {
  console.error("Erreur fatale :", err)
  process.exit(1)
})
