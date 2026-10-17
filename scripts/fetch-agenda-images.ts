#!/usr/bin/env npx ts-node
/**
 * fetch-agenda-images.ts
 *
 * Script de récupération automatique des images manquantes pour l'agenda.
 *
 * Usage :
 *   npx ts-node scripts/fetch-agenda-images.ts [--dry-run] [--force]
 *
 * Options :
 *   --dry-run   Affiche les images manquantes sans télécharger
 *   --force     Ré-télécharge même les images déjà présentes
 *
 * Logique :
 *   1. Charge tous les événements du JSON collecté
 *   2. Pour chaque événement, vérifie si l'image locale existe déjà
 *   3. Si manquante, tente d'extraire og:image depuis la page officielle
 *   4. Télécharge l'image et la valide (taille > 10KB, format image)
 *   5. Ne jamais écraser une image validée existante (sauf --force)
 *   6. Génère un rapport en fin d'exécution
 */

import * as fs from "fs"
import * as path from "path"
import * as https from "https"
import * as http from "http"
import { execSync } from "child_process"

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const PUBLIC_IMAGES_DIR = path.resolve(__dirname, "../public/images/agenda")
const COLLECTED_JSON = path.resolve(__dirname, "../Collecte/dance_lab_tous_evenements.json")
const OVERRIDES_FILE = path.resolve(__dirname, "../data/agenda-image-overrides.ts")

const DRY_RUN = process.argv.includes("--dry-run")
const FORCE = process.argv.includes("--force")
const TIMEOUT_MS = 15_000
const MIN_IMAGE_SIZE_BYTES = 10_000 // 10KB minimum → rejects placeholder/icon images
const VALID_EXTENSIONS = ["jpg", "jpeg", "png", "webp"]

// ---------------------------------------------------------------------------
// Types (mirror of collected JSON shape)
// ---------------------------------------------------------------------------

type CollectedEvent = {
  id: string
  nom: string
  image_url?: string
  site_officiel?: string
  url_source?: string
  date_debut?: string
  date_fin?: string
}

// ---------------------------------------------------------------------------
// Stats
// ---------------------------------------------------------------------------

const stats = {
  total: 0,
  alreadyPresent: 0,
  missing: 0,
  fetched: 0,
  failed: 0,
  skipped: 0,
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function log(msg: string) {
  process.stdout.write(msg + "\n")
}

function logError(msg: string) {
  process.stderr.write("  ✗ " + msg + "\n")
}

/** Resolve the expected local path for a given event and CDN URL */
function localPath(eventId: string, cdnUrl: string): string {
  const rawExt = cdnUrl.split(".").pop()?.split("?")[0]?.toLowerCase() ?? ""
  const ext = VALID_EXTENSIONS.includes(rawExt) ? rawExt : "jpg"
  return path.join(PUBLIC_IMAGES_DIR, `${eventId}.${ext}`)
}

/** Check if a file exists and has sufficient size */
function isValidLocalFile(filePath: string): boolean {
  try {
    const stat = fs.statSync(filePath)
    return stat.size >= MIN_IMAGE_SIZE_BYTES
  } catch {
    return false
  }
}

/** Download a URL to a local file, returns true on success */
async function download(url: string, dest: string): Promise<boolean> {
  return new Promise((resolve) => {
    const protocol = url.startsWith("https") ? https : http
    const timeout = setTimeout(() => {
      resolve(false)
    }, TIMEOUT_MS)

    const req = protocol.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; DanceLab-ImageBot/1.0)",
        "Accept": "image/*,*/*",
      },
    }, (res) => {
      // Follow redirects (up to 3)
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        clearTimeout(timeout)
        download(res.headers.location, dest).then(resolve)
        return
      }

      if (!res.statusCode || res.statusCode < 200 || res.statusCode >= 300) {
        clearTimeout(timeout)
        resolve(false)
        return
      }

      const contentType = res.headers["content-type"] ?? ""
      if (!contentType.startsWith("image/")) {
        clearTimeout(timeout)
        res.resume()
        resolve(false)
        return
      }

      const tmpPath = dest + ".tmp"
      const file = fs.createWriteStream(tmpPath)
      res.pipe(file)

      file.on("finish", () => {
        clearTimeout(timeout)
        file.close(() => {
          try {
            const stat = fs.statSync(tmpPath)
            if (stat.size < MIN_IMAGE_SIZE_BYTES) {
              fs.unlinkSync(tmpPath)
              resolve(false)
            } else {
              fs.renameSync(tmpPath, dest)
              resolve(true)
            }
          } catch {
            resolve(false)
          }
        })
      })

      file.on("error", () => {
        clearTimeout(timeout)
        try { fs.unlinkSync(tmpPath) } catch { /* ignore */ }
        resolve(false)
      })
    })

    req.on("error", () => {
      clearTimeout(timeout)
      resolve(false)
    })
  })
}

/** Extract og:image from a page using curl (avoids importing node-fetch) */
async function fetchOgImage(pageUrl: string): Promise<string | undefined> {
  try {
    const output = execSync(
      `curl -sL --max-time 12 --user-agent "Mozilla/5.0 (compatible; DanceLab-ImageBot/1.0)" "${pageUrl}"`,
      { encoding: "utf8", timeout: 15_000 },
    )
    // Try og:image
    const ogMatch = output.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
      ?? output.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i)
    if (ogMatch?.[1]) return ogMatch[1]

    // Fallback: twitter:image
    const twitterMatch = output.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i)
      ?? output.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i)
    if (twitterMatch?.[1]) return twitterMatch[1]
  } catch {
    // curl failed or timed out
  }
  return undefined
}

/** Ensure a URL is absolute (resolve relative paths against base) */
function absoluteUrl(url: string, base: string): string {
  if (url.startsWith("//")) return "https:" + url
  if (url.startsWith("http")) return url
  try {
    return new URL(url, base).href
  } catch {
    return url
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  if (!fs.existsSync(PUBLIC_IMAGES_DIR)) {
    fs.mkdirSync(PUBLIC_IMAGES_DIR, { recursive: true })
  }

  if (!fs.existsSync(COLLECTED_JSON)) {
    log(`❌ JSON collecté introuvable : ${COLLECTED_JSON}`)
    process.exit(1)
  }

  const events: CollectedEvent[] = JSON.parse(fs.readFileSync(COLLECTED_JSON, "utf8"))
  stats.total = events.length

  log(`\n🔍 DanceLab — Récupération des images manquantes`)
  log(`   ${stats.total} événements à analyser`)
  log(`   Dossier cible : public/images/agenda/`)
  if (DRY_RUN) log(`   Mode : DRY-RUN (aucun téléchargement)\n`)
  if (FORCE) log(`   Mode : FORCE (réécrase les images existantes)\n`)

  const missing: Array<{ id: string; name: string; cdnUrl?: string; officialUrl?: string }> = []

  // --- Pass 1: identify missing images ---
  for (const event of events) {
    const cdnUrl = event.image_url?.trim()
    if (!cdnUrl) {
      // No CDN URL at all → can't derive local path
      stats.missing++
      missing.push({
        id: event.id,
        name: event.nom,
        officialUrl: event.site_officiel?.trim() || event.url_source?.trim(),
      })
      continue
    }

    const expected = localPath(event.id, cdnUrl)
    if (!FORCE && isValidLocalFile(expected)) {
      stats.alreadyPresent++
    } else {
      stats.missing++
      missing.push({ id: event.id, name: event.nom, cdnUrl, officialUrl: event.site_officiel?.trim() || event.url_source?.trim() })
    }
  }

  log(`\n📊 Résultat de l'analyse :`)
  log(`   ✅ Déjà présentes  : ${stats.alreadyPresent}`)
  log(`   ⚠️  Manquantes      : ${stats.missing}`)

  if (missing.length === 0) {
    log(`\n✨ Toutes les images sont déjà présentes. Rien à faire.\n`)
    return
  }

  if (DRY_RUN) {
    log(`\n📋 Images manquantes (${missing.length}) :`)
    for (const item of missing) {
      log(`   • [${item.id}] ${item.name}`)
      if (item.cdnUrl) log(`     CDN : ${item.cdnUrl}`)
      if (item.officialUrl) log(`     URL officielle : ${item.officialUrl}`)
    }
    log("")
    return
  }

  // --- Pass 2: download ---
  log(`\n⬇️  Téléchargement des images manquantes…\n`)

  for (const item of missing) {
    process.stdout.write(`  [${item.id}] ${item.name.slice(0, 50)}…`)

    // Strategy A: use CDN URL directly
    if (item.cdnUrl) {
      const dest = localPath(item.id, item.cdnUrl)
      const ok = await download(item.cdnUrl, dest)
      if (ok) {
        log(` ✓ (CDN)`)
        stats.fetched++
        continue
      }
    }

    // Strategy B: extract og:image from official page
    if (item.officialUrl) {
      const ogUrl = await fetchOgImage(item.officialUrl)
      if (ogUrl) {
        const absUrl = absoluteUrl(ogUrl, item.officialUrl)
        // Derive extension from discovered URL
        const rawExt = absUrl.split(".").pop()?.split("?")[0]?.toLowerCase() ?? ""
        const ext = VALID_EXTENSIONS.includes(rawExt) ? rawExt : "jpg"
        const dest = path.join(PUBLIC_IMAGES_DIR, `${item.id}.${ext}`)
        const ok = await download(absUrl, dest)
        if (ok) {
          log(` ✓ (og:image)`)
          stats.fetched++
          continue
        }
      }
    }

    log(` ✗ (échec)`)
    stats.failed++
    logError(`${item.id} — ${item.name}`)
  }

  // --- Summary ---
  log(`\n──────────────────────────────────────────`)
  log(`📋 Rapport final`)
  log(`   Total analysés   : ${stats.total}`)
  log(`   Déjà présentes   : ${stats.alreadyPresent}`)
  log(`   Manquantes       : ${stats.missing}`)
  log(`   Téléchargées     : ${stats.fetched}`)
  log(`   Échecs           : ${stats.failed}`)
  log(`   Couverture finale: ${stats.alreadyPresent + stats.fetched} / ${stats.total} (${Math.round((stats.alreadyPresent + stats.fetched) / stats.total * 100)}%)`)
  log(`──────────────────────────────────────────\n`)

  if (stats.failed > 0) {
    log(`⚠️  ${stats.failed} image(s) n'ont pas pu être récupérées.`)
    log(`   Vérifiez les URLs officielles et ajoutez les images manuellement`)
    log(`   dans public/images/agenda/ avec la convention {ID}.{ext}\n`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
