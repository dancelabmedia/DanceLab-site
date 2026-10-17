/**
 * lib/auditions/collecte.ts
 * Moteur de découverte automatique d'annonces d'auditions et d'offres d'emploi
 * dans le secteur chorégraphique.
 *
 * Principe :
 *   1. Scrape les sources publiques (CND, danseurs.fr…).
 *   2. Compare avec les auditions déjà connues dans auditions-data.ts.
 *   3. Retourne un rapport structuré : nouvelles annonces, expirées, doublons.
 *
 * Le moteur ne modifie JAMAIS auditions-data.ts automatiquement.
 * Toute nouvelle annonce requiert une validation manuelle avant intégration.
 */

import { auditions } from "@/app/explorer/auditions/auditions-data"

// ── Types ────────────────────────────────────────────────────────────────────

export type AuditionDecuverte = {
  titre: string
  structure: string
  deadline: string | null
  url: string
  source: string
}

export type RapportCollecte = {
  runAt: string
  durationMs: number
  sourcesConsulted: number
  /** Annonces trouvées en ligne, non encore dans auditions-data.ts */
  nouvelles: AuditionDecuverte[]
  /** Annonces de auditions-data.ts dont la deadline est passée */
  expirees: { id: string; titre: string; structure: string; deadline: string }[]
  /** Annonces actives confirmées (deadline non dépassée) */
  actives: number
  erreurs: string[]
}

// ── Extracteur HTML minimal ──────────────────────────────────────────────────

/**
 * Extrait les annonces d'une page CND.
 * La page HTML contient des <li> avec des liens et des metas de deadline.
 */
function parseCndHtml(html: string, sourceUrl: string): AuditionDecuverte[] {
  const results: AuditionDecuverte[] = []

  // Cherche des blocs <article> ou <li> contenant des annonces
  // Pattern CND : /fr/auditions-offres-emploi/<slug>
  const linkPattern = /href="(\/fr\/auditions-offres-emploi\/[^"]+)"/g
  const seenUrls = new Set<string>()
  let match: RegExpExecArray | null

  while ((match = linkPattern.exec(html)) !== null) {
    const path = match[1]
    const fullUrl = `https://www.cnd.fr${path}`

    // Dédoublonner
    if (seenUrls.has(fullUrl)) continue
    seenUrls.add(fullUrl)

    // Extraire le texte autour du lien (titre approximatif depuis le slug)
    const slug = path.replace("/fr/auditions-offres-emploi/", "")
    const titreApprox = slug
      .replace(/-fhx.*$/, "")
      .replace(/-fx.*$/, "")
      .replace(/-[0-9]+$/, "")
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())

    results.push({
      titre: titreApprox,
      structure: "— (à préciser via le lien)",
      deadline: null,
      url: fullUrl,
      source: "CND",
    })
  }

  return results
}

/**
 * Extrait les deadlines depuis le HTML CND.
 * Les deadlines apparaissent sous forme "JJ.MM.AAAA" près de chaque annonce.
 */
function extractDeadline(html: string, startIndex: number): string | null {
  const snippet = html.slice(startIndex, startIndex + 500)
  const match = snippet.match(/(\d{2})\.(\d{2})\.(\d{4})/)
  if (!match) return null
  return `${match[3]}-${match[2]}-${match[1]}`
}

// ── URLs connues (déjà dans auditions-data.ts) ──────────────────────────────

function getUrlsConnues(): Set<string> {
  const urls = new Set<string>()
  for (const a of auditions) {
    if (a.lienCandidature) urls.add(a.lienCandidature.toLowerCase().trim())
  }
  return urls
}

// ── Fetch robuste avec timeout ───────────────────────────────────────────────

async function fetchWithTimeout(url: string, timeoutMs = 15_000): Promise<string> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "DanceLab-Auditions-Bot/1.0 (contact: maiwennbramoulle@gmail.com)",
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "fr-FR,fr;q=0.9",
      },
    })
    if (!res.ok) throw new Error(`HTTP ${res.status} pour ${url}`)
    return await res.text()
  } finally {
    clearTimeout(timer)
  }
}

// ── Sources à scanner ────────────────────────────────────────────────────────

type SourceDef = {
  nom: string
  urls: string[]
  parser: (html: string, sourceUrl: string) => AuditionDecuverte[]
}

const SOURCES: SourceDef[] = [
  {
    nom: "CND — page 1",
    urls: ["https://www.cnd.fr/fr/auditions-offres-emploi"],
    parser: parseCndHtml,
  },
  {
    nom: "CND — page 2",
    urls: ["https://www.cnd.fr/fr/auditions-offres-emploi?page=1"],
    parser: parseCndHtml,
  },
]

// ── Point d'entrée principal ─────────────────────────────────────────────────

export async function runCollecteAuditions(): Promise<RapportCollecte> {
  const t0 = Date.now()
  const erreurs: string[] = []
  const urlsConnues = getUrlsConnues()
  const decouvertes: AuditionDecuverte[] = []
  let sourcesConsulted = 0

  // 1. Scanner les sources
  for (const source of SOURCES) {
    for (const url of source.urls) {
      try {
        const html = await fetchWithTimeout(url)
        sourcesConsulted++
        const found = source.parser(html, url)

        for (const item of found) {
          const itemUrlNorm = item.url.toLowerCase().trim()
          // Vérifier si l'URL de l'annonce est déjà dans nos données
          const dejaConnue = urlsConnues.has(itemUrlNorm)
          // Vérifier aussi si une annonce existante pointe vers une URL CND qui contient ce slug
          const connueViaSlug = Array.from(urlsConnues).some(
            (known) => known.includes(item.url.replace("https://www.cnd.fr", ""))
          )
          if (!dejaConnue && !connueViaSlug) {
            decouvertes.push({ ...item, source: source.nom })
          }
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        erreurs.push(`[${source.nom}] ${msg}`)
      }
    }
  }

  // 2. Identifier les auditions expirées dans nos données
  const now = new Date()
  const expirees = auditions
    .filter((a) => {
      if (a.archive) return true
      return new Date(a.deadlineCandidature) < now
    })
    .map((a) => ({
      id: a.id,
      titre: a.titre,
      structure: a.structure,
      deadline: a.deadlineCandidature,
    }))

  // 3. Compter les actives
  const actives = auditions.filter((a) => {
    if (a.archive) return false
    return new Date(a.deadlineCandidature) >= now
  }).length

  return {
    runAt: new Date().toISOString(),
    durationMs: Date.now() - t0,
    sourcesConsulted,
    nouvelles: decouvertes,
    expirees,
    actives,
    erreurs,
  }
}
