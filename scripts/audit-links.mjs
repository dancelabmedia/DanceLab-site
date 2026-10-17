#!/usr/bin/env node
/**
 * audit-links.mjs — Vérification automatique de tous les liens externes Dance Lab
 *
 * Usage :
 *   node scripts/audit-links.mjs                   # audit complet
 *   node scripts/audit-links.mjs --json            # sortie JSON brute
 *   node scripts/audit-links.mjs --only-broken     # n'afficher que les liens cassés
 *   node scripts/audit-links.mjs --url <url>       # vérifier une seule URL
 *
 * Détecte : 404, 410, 500+, domaine inexistant, redirection cassée, URL mal formée.
 * Ignore  : 403, 429, protection anti-bot (ECONNREFUSED sur domaines connus).
 *
 * Rapport sauvegardé dans data/link-audit-report.json après chaque exécution.
 */

import fs from "fs"
import path from "path"
import https from "https"
import http from "http"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, "..")

// ─── Configuration ──────────────────────────────────────────────────────────

const TIMEOUT_MS = 10_000
const CONCURRENCY = 6

/** Domaines protégés anti-bot : un 403/503 n'indique pas un lien cassé */
const ANTI_BOT_DOMAINS = [
  "ticketmaster.fr",
  "ticketmaster.com",
  "fnacspectacles.com",
  "digitick.com",
  "seetickets.com",
  "eventbrite.fr",
  "billetweb.fr",
  "shotgun.live",
  "instagram.com",
  "facebook.com",
]

/** Codes HTTP considérés comme "cassé" (hors contexte anti-bot) */
const BROKEN_CODES = new Set([400, 404, 405, 410, 500, 502, 503, 504])

// ─── Extraction des URLs ─────────────────────────────────────────────────────

/**
 * Extrait toutes les URLs (officialUrl, ticketUrl) depuis les fichiers TypeScript
 * d'événements via expressions régulières.
 */
function extractUrlsFromTs(filePath) {
  const results = []
  try {
    const content = fs.readFileSync(filePath, "utf8")
    const lines = content.split("\n")
    const pattern = /(officialUrl|ticketUrl)\s*:\s*["']([^"']+)["']/

    lines.forEach((line, idx) => {
      const m = line.match(pattern)
      if (m) {
        const url = m[2].trim()
        if (url.startsWith("http")) {
          results.push({ url, field: m[1], file: path.relative(ROOT, filePath), line: idx + 1 })
        }
      }
    })
  } catch (e) {
    console.error(`[audit] Impossible de lire ${filePath}: ${e.message}`)
  }
  return results
}

/**
 * Extrait les URLs depuis les fichiers JSON de cache (notion-image-urls.json,
 * notion-event-enrichment.json).
 */
function extractUrlsFromJson(filePath, field) {
  const results = []
  try {
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"))
    for (const key of Object.keys(data)) {
      if (key.startsWith("http")) {
        results.push({ url: key, field, file: path.relative(ROOT, filePath), line: null })
      }
    }
  } catch {
    /* fichier absent ou invalide */
  }
  return results
}

/**
 * Collecte tous les liens à vérifier depuis l'ensemble du catalogue.
 */
function collectAllUrls() {
  const tsFiles = [
    path.join(ROOT, "app/agenda/shows-events.ts"),
    path.join(ROOT, "app/agenda/agenda-data.ts"),
    path.join(ROOT, "app/agenda/collected-events.ts"),
    path.join(ROOT, "app/agenda/cabaret-events.ts"),
    path.join(ROOT, "app/agenda/initial-events.ts"),
  ]

  const entries = []
  for (const f of tsFiles) {
    if (fs.existsSync(f)) entries.push(...extractUrlsFromTs(f))
  }

  // Cache JSON d'enrichissement (URLs officielles des événements Notion)
  entries.push(...extractUrlsFromJson(
    path.join(ROOT, "data/notion-event-enrichment.json"),
    "enrichmentKey"
  ))

  // Dédupliquer sur l'URL, conserver la première occurrence (fichier statique prioritaire)
  const seen = new Map()
  for (const e of entries) {
    if (!seen.has(e.url)) seen.set(e.url, e)
  }
  return [...seen.values()]
}

// ─── Vérification HTTP ───────────────────────────────────────────────────────

function isAntiBotDomain(url) {
  try {
    const host = new URL(url).hostname
    return ANTI_BOT_DOMAINS.some((d) => host.endsWith(d))
  } catch {
    return false
  }
}

/**
 * Vérifie une URL via HEAD puis GET si nécessaire.
 * Suit les redirections jusqu'à 5 sauts.
 * Retourne { status, finalUrl, redirectChain, error, isBot }
 */
async function checkUrl(url, maxRedirects = 5) {
  const isBot = isAntiBotDomain(url)
  let currentUrl = url
  const redirectChain = []

  for (let hop = 0; hop <= maxRedirects; hop++) {
    let parsedUrl
    try {
      parsedUrl = new URL(currentUrl)
    } catch {
      return { status: null, finalUrl: currentUrl, redirectChain, error: "URL malformée", isBot }
    }

    const lib = parsedUrl.protocol === "https:" ? https : http
    const method = hop === 0 ? "HEAD" : "HEAD" // toujours HEAD pour la vitesse

    const result = await new Promise((resolve) => {
      const timeout = setTimeout(() => resolve({ type: "timeout" }), TIMEOUT_MS)

      const req = lib.request(
        {
          hostname: parsedUrl.hostname,
          port: parsedUrl.port || (parsedUrl.protocol === "https:" ? 443 : 80),
          path: parsedUrl.pathname + parsedUrl.search,
          method,
          headers: {
            "User-Agent":
              "Mozilla/5.0 (compatible; DanceLab-LinkAudit/2.0; +https://dancelab.fr)",
            Accept: "text/html,application/xhtml+xml,*/*",
            "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
          },
        },
        (res) => {
          clearTimeout(timeout)
          resolve({ type: "response", status: res.statusCode, location: res.headers.location })
        }
      )

      req.on("error", (err) => {
        clearTimeout(timeout)
        resolve({ type: "error", error: err.message })
      })

      req.end()
    })

    if (result.type === "timeout") {
      return { status: null, finalUrl: currentUrl, redirectChain, error: "Timeout", isBot }
    }
    if (result.type === "error") {
      return { status: null, finalUrl: currentUrl, redirectChain, error: result.error, isBot }
    }

    const status = result.status

    // Redirection
    if ([301, 302, 303, 307, 308].includes(status) && result.location) {
      const nextUrl = new URL(result.location, currentUrl).href
      redirectChain.push({ from: currentUrl, status, to: nextUrl })
      currentUrl = nextUrl
      continue
    }

    return { status, finalUrl: currentUrl, redirectChain, error: null, isBot }
  }

  return { status: null, finalUrl: currentUrl, redirectChain, error: "Trop de redirections", isBot }
}

/**
 * Détermine si un résultat de vérification correspond à un lien cassé.
 */
function isBroken(result) {
  if (result.error && result.error !== "Timeout") {
    // Domaine inexistant ou connexion refusée
    if (result.error.includes("ENOTFOUND") || result.error.includes("ECONNREFUSED")) return true
    if (result.error === "URL malformée") return true
  }
  if (result.status === null) return false // timeout ou anti-bot — on ne sait pas
  if (result.isBot && (result.status === 403 || result.status === 429)) return false // faux-positif
  return BROKEN_CODES.has(result.status)
}

// ─── Rapport ─────────────────────────────────────────────────────────────────

function statusLabel(result) {
  if (result.error === "URL malformée") return "❌ URL MALFORMÉE"
  if (result.error === "Timeout") return "⏱  TIMEOUT"
  if (result.error) return `❌ ERREUR (${result.error})`
  if (!result.status) return "❓ INCONNU"
  if (result.status === 200) return "✅ 200 OK"
  if ([301, 302, 307, 308].includes(result.status)) return `↪  ${result.status} REDIRECT → ${result.finalUrl}`
  if (result.status === 403 && result.isBot) return "🤖 403 (anti-bot)"
  if (result.status === 429 && result.isBot) return "🤖 429 (rate-limit)"
  if (result.status === 404) return "❌ 404 NOT FOUND"
  if (result.status === 410) return "❌ 410 GONE"
  return `⚠️  ${result.status}`
}

// ─── Exécution principale ─────────────────────────────────────────────────────

async function runAudit(options = {}) {
  const { jsonMode = false, onlyBroken = false, singleUrl = null } = options

  let entries = singleUrl
    ? [{ url: singleUrl, field: "manuel", file: "CLI", line: null }]
    : collectAllUrls()

  if (!jsonMode) {
    console.log(`\n🔍 Dance Lab — Audit des liens externes`)
    console.log(`   ${entries.length} URLs collectées\n`)
  }

  // Vérification concurrente par lots
  const results = []
  for (let i = 0; i < entries.length; i += CONCURRENCY) {
    const batch = entries.slice(i, i + CONCURRENCY)
    const checked = await Promise.all(
      batch.map(async (entry) => {
        const check = await checkUrl(entry.url)
        return { ...entry, ...check, broken: isBroken(check) }
      })
    )
    results.push(...checked)
    if (!jsonMode) process.stdout.write(".")
  }
  if (!jsonMode) console.log("\n")

  // Statistiques
  const broken = results.filter((r) => r.broken)
  const ok = results.filter((r) => r.status === 200)
  const protected_ = results.filter((r) => r.isBot && !r.broken)
  const unknown = results.filter((r) => r.status === null && !r.broken)

  if (jsonMode) {
    console.log(JSON.stringify({ generatedAt: new Date().toISOString(), results }, null, 2))
    return results
  }

  // Affichage console
  const toShow = onlyBroken ? broken : results
  for (const r of toShow) {
    const label = statusLabel(r)
    const loc = r.line ? `${r.file}:${r.line}` : r.file
    console.log(`${label}`)
    console.log(`   ${r.field.padEnd(14)} ${r.url}`)
    console.log(`   └─ ${loc}\n`)
  }

  // Rapport final
  console.log("═".repeat(60))
  console.log(`📊 RÉSUMÉ DE L'AUDIT — ${new Date().toLocaleDateString("fr-FR")}`)
  console.log(`═`.repeat(60))
  console.log(`  Total URLs vérifiées : ${results.length}`)
  console.log(`  ✅ OK (200)          : ${ok.length}`)
  console.log(`  ❌ Liens cassés       : ${broken.length}`)
  console.log(`  🤖 Anti-bot (ignorés) : ${protected_.length}`)
  console.log(`  ❓ Inconnus/Timeout   : ${unknown.length}`)
  console.log(`  📅 Dernière vérif.    : ${new Date().toISOString()}`)

  if (broken.length > 0) {
    console.log(`\n⚠️  LIENS CASSÉS DÉTECTÉS :`)
    for (const r of broken) {
      console.log(`  ❌ [${r.field}] ${r.url}`)
      console.log(`     ↳ ${r.file}${r.line ? `:${r.line}` : ""}`)
      console.log(`     ↳ ${statusLabel(r)}`)
    }
  } else {
    console.log(`\n✅ Aucun lien cassé détecté.`)
  }

  // Sauvegarde du rapport
  const reportPath = path.join(ROOT, "data/link-audit-report.json")
  const report = {
    generatedAt: new Date().toISOString(),
    summary: {
      total: results.length,
      ok: ok.length,
      broken: broken.length,
      antiBot: protected_.length,
      unknown: unknown.length,
    },
    broken: broken.map((r) => ({
      url: r.url,
      field: r.field,
      file: r.file,
      line: r.line,
      status: r.status,
      error: r.error,
      finalUrl: r.finalUrl,
    })),
    results: results.map((r) => ({
      url: r.url,
      field: r.field,
      file: r.file,
      line: r.line,
      status: r.status,
      broken: r.broken,
      isBot: r.isBot,
      error: r.error,
      finalUrl: r.finalUrl !== r.url ? r.finalUrl : undefined,
      redirectCount: r.redirectChain?.length || 0,
    })),
  }

  try {
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf8")
    console.log(`\n💾 Rapport sauvegardé : data/link-audit-report.json`)
  } catch (e) {
    console.warn(`[audit] Impossible d'écrire le rapport : ${e.message}`)
  }

  return results
}

// ─── CLI ─────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2)
const jsonMode = args.includes("--json")
const onlyBroken = args.includes("--only-broken")
const urlIdx = args.indexOf("--url")
const singleUrl = urlIdx !== -1 ? args[urlIdx + 1] : null

runAudit({ jsonMode, onlyBroken, singleUrl }).catch((err) => {
  console.error("Erreur audit-links :", err)
  process.exit(1)
})
