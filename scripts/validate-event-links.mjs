#!/usr/bin/env node
/**
 * validate-event-links.mjs — Validation pré-publication des liens d'un événement
 *
 * Usage (validation manuelle avant ajout d'un événement au catalogue) :
 *   node scripts/validate-event-links.mjs \
 *     --official "https://venue.fr/event" \
 *     --ticket "https://ticketmaster.fr/..."
 *
 * Usage (depuis un script d'import) :
 *   import { validateEventLinks } from './validate-event-links.mjs'
 *   const result = await validateEventLinks({ officialUrl, ticketUrl })
 *   if (!result.ok) console.warn(result.issues)
 *
 * Règles de validation :
 *   - L'URL est bien formée (parseable)
 *   - La destination répond (pas de ENOTFOUND)
 *   - Le code HTTP n'est pas 404 / 410 / 400 / 5xx
 *   - Après redirection, la destination finale est connue
 *   - Un 403 / 429 sur un domaine anti-bot n'est pas considéré comme une erreur
 *
 * Ce validateur ne peut PAS vérifier :
 *   - Que le contenu de la page correspond au bon spectacle (problème sémantique)
 *   - Que les dates sur la page billettterie correspondent à celles de l'événement
 *   Ces vérifications restent manuelles avant publication.
 */

import https from "https"
import http from "http"

const TIMEOUT_MS = 8_000

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

function isAntiBotDomain(url) {
  try {
    const host = new URL(url).hostname
    return ANTI_BOT_DOMAINS.some((d) => host.endsWith(d))
  } catch {
    return false
  }
}

async function headRequest(url, maxRedirects = 5) {
  let currentUrl = url
  const chain = []

  for (let hop = 0; hop <= maxRedirects; hop++) {
    let parsed
    try {
      parsed = new URL(currentUrl)
    } catch {
      return { status: null, finalUrl: currentUrl, chain, error: "URL malformée" }
    }

    const lib = parsed.protocol === "https:" ? https : http
    const result = await new Promise((resolve) => {
      const t = setTimeout(() => resolve({ type: "timeout" }), TIMEOUT_MS)
      const req = lib.request(
        {
          hostname: parsed.hostname,
          path: parsed.pathname + parsed.search,
          method: "HEAD",
          headers: {
            "User-Agent": "DanceLab-LinkValidator/1.0",
            Accept: "text/html",
          },
        },
        (res) => {
          clearTimeout(t)
          resolve({ type: "response", status: res.statusCode, location: res.headers.location })
        }
      )
      req.on("error", (e) => {
        clearTimeout(t)
        resolve({ type: "error", error: e.message })
      })
      req.end()
    })

    if (result.type === "timeout") return { status: null, finalUrl: currentUrl, chain, error: "Timeout" }
    if (result.type === "error") return { status: null, finalUrl: currentUrl, chain, error: result.error }

    const { status, location } = result
    if ([301, 302, 303, 307, 308].includes(status) && location) {
      chain.push({ from: currentUrl, status, to: new URL(location, currentUrl).href })
      currentUrl = new URL(location, currentUrl).href
      continue
    }
    return { status, finalUrl: currentUrl, chain, error: null }
  }
  return { status: null, finalUrl: currentUrl, chain, error: "Trop de redirections" }
}

/**
 * Valide les liens d'un événement avant publication.
 *
 * @param {object} links - { officialUrl, ticketUrl }
 * @returns {{ ok: boolean, issues: string[], results: object }}
 */
export async function validateEventLinks({ officialUrl, ticketUrl }) {
  const issues = []
  const results = {}

  const urls = [
    { key: "officialUrl", url: officialUrl },
    { key: "ticketUrl", url: ticketUrl },
  ].filter((e) => e.url?.startsWith("http"))

  for (const { key, url } of urls) {
    const bot = isAntiBotDomain(url)
    const r = await headRequest(url)
    results[key] = { url, ...r, isBot: bot }

    if (r.error) {
      if (r.error.includes("ENOTFOUND")) {
        issues.push(`[${key}] Domaine inexistant : ${url}`)
      } else if (r.error === "URL malformée") {
        issues.push(`[${key}] URL malformée : ${url}`)
      } else if (r.error !== "Timeout") {
        issues.push(`[${key}] Erreur réseau (${r.error}) : ${url}`)
      }
      // Timeout : on ne bloque pas la publication
    } else if (r.status === 404) {
      issues.push(`[${key}] Page introuvable (404) : ${url}`)
    } else if (r.status === 410) {
      issues.push(`[${key}] Page supprimée (410 Gone) : ${url}`)
    } else if (r.status && r.status >= 500) {
      issues.push(`[${key}] Erreur serveur (${r.status}) : ${url}`)
    } else if (r.status === 403 && !bot) {
      // 403 sur un domaine non anti-bot est suspect
      issues.push(`[${key}] Accès refusé (403) : ${url} — vérification manuelle recommandée`)
    }
    // 200, 301, 302, 401 (anti-bot), 403 (anti-bot), 429 : OK
  }

  return { ok: issues.length === 0, issues, results }
}

// ─── CLI ─────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2)
if (args.length > 0) {
  const officialIdx = args.indexOf("--official")
  const ticketIdx = args.indexOf("--ticket")
  const officialUrl = officialIdx !== -1 ? args[officialIdx + 1] : undefined
  const ticketUrl = ticketIdx !== -1 ? args[ticketIdx + 1] : undefined

  if (!officialUrl && !ticketUrl) {
    console.error("Usage: node validate-event-links.mjs --official <url> [--ticket <url>]")
    process.exit(1)
  }

  validateEventLinks({ officialUrl, ticketUrl }).then(({ ok, issues, results }) => {
    for (const [key, r] of Object.entries(results)) {
      const status = r.error || r.status
      const mark = issues.some((i) => i.includes(`[${key}]`)) ? "❌" : "✅"
      console.log(`${mark} [${key}] ${status} → ${r.finalUrl || r.url}`)
    }
    if (issues.length > 0) {
      console.log("\n⚠️  Problèmes détectés :")
      issues.forEach((i) => console.log("  •", i))
      process.exit(1)
    } else {
      console.log("\n✅ Tous les liens sont valides.")
    }
  })
}
