#!/usr/bin/env node
/**
 * scripts/audit-geographic.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Rapport d'audit géographique de l'agenda Dance Lab.
 *
 * Analyse la distribution des événements par région, département et ville,
 * identifie les tournées incomplètes, les territoires sous-représentés et
 * les événements encore incomplets.
 *
 * Usage :
 *   node scripts/audit-geographic.mjs
 *   node scripts/audit-geographic.mjs --json          # sortie JSON brute
 *   node scripts/audit-geographic.mjs --min-events 3  # seuil min pour "sous-représenté"
 */

import { readFileSync } from "fs"
import { fileURLToPath } from "url"
import path from "path"
import https from "https"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// ─── Arguments CLI ────────────────────────────────────────────────────────────
const args = process.argv.slice(2)
const AS_JSON     = args.includes("--json")
const MIN_EVENTS  = parseInt(args.find(a => a.startsWith("--min-events="))?.split("=")[1] ?? "2") || 2
const BASE_URL    = args.find(a => a.startsWith("--url="))?.split("=")[1] ?? "http://localhost:3000"

// ─── Correspondance ville → département / région ─────────────────────────────
const DEPT_MAP = {
  // Paris & Île-de-France
  "paris": { dept: "75 – Paris", region: "Île-de-France" },
  "boulogne-billancourt": { dept: "92 – Hauts-de-Seine", region: "Île-de-France" },
  "nanterre": { dept: "92 – Hauts-de-Seine", region: "Île-de-France" },
  "suresnes": { dept: "92 – Hauts-de-Seine", region: "Île-de-France" },
  "versailles": { dept: "78 – Yvelines", region: "Île-de-France" },
  "saint-denis": { dept: "93 – Seine-Saint-Denis", region: "Île-de-France" },
  "montreuil": { dept: "93 – Seine-Saint-Denis", region: "Île-de-France" },
  "aubervilliers": { dept: "93 – Seine-Saint-Denis", region: "Île-de-France" },
  "bobigny": { dept: "93 – Seine-Saint-Denis", region: "Île-de-France" },
  "pantin": { dept: "93 – Seine-Saint-Denis", region: "Île-de-France" },
  "creteil": { dept: "94 – Val-de-Marne", region: "Île-de-France" },
  "vitry-sur-seine": { dept: "94 – Val-de-Marne", region: "Île-de-France" },
  "choisy-le-roi": { dept: "94 – Val-de-Marne", region: "Île-de-France" },
  "ivry-sur-seine": { dept: "94 – Val-de-Marne", region: "Île-de-France" },
  "gennevilliers": { dept: "92 – Hauts-de-Seine", region: "Île-de-France" },
  "vanves": { dept: "92 – Hauts-de-Seine", region: "Île-de-France" },
  "fontenay-sous-bois": { dept: "94 – Val-de-Marne", region: "Île-de-France" },
  "vincennes": { dept: "94 – Val-de-Marne", region: "Île-de-France" },
  "saint-ouen": { dept: "93 – Seine-Saint-Denis", region: "Île-de-France" },
  "bondy": { dept: "93 – Seine-Saint-Denis", region: "Île-de-France" },
  "bagnolet": { dept: "93 – Seine-Saint-Denis", region: "Île-de-France" },
  // PACA
  "marseille": { dept: "13 – Bouches-du-Rhône", region: "Provence-Alpes-Côte d'Azur" },
  "aix-en-provence": { dept: "13 – Bouches-du-Rhône", region: "Provence-Alpes-Côte d'Azur" },
  "martigues": { dept: "13 – Bouches-du-Rhône", region: "Provence-Alpes-Côte d'Azur" },
  "aubagne": { dept: "13 – Bouches-du-Rhône", region: "Provence-Alpes-Côte d'Azur" },
  "arles": { dept: "13 – Bouches-du-Rhône", region: "Provence-Alpes-Côte d'Azur" },
  "istres": { dept: "13 – Bouches-du-Rhône", region: "Provence-Alpes-Côte d'Azur" },
  "vitrolles": { dept: "13 – Bouches-du-Rhône", region: "Provence-Alpes-Côte d'Azur" },
  "toulon": { dept: "83 – Var", region: "Provence-Alpes-Côte d'Azur" },
  "nice": { dept: "06 – Alpes-Maritimes", region: "Provence-Alpes-Côte d'Azur" },
  "cannes": { dept: "06 – Alpes-Maritimes", region: "Provence-Alpes-Côte d'Azur" },
  "antibes": { dept: "06 – Alpes-Maritimes", region: "Provence-Alpes-Côte d'Azur" },
  "avignon": { dept: "84 – Vaucluse", region: "Provence-Alpes-Côte d'Azur" },
  // Auvergne-Rhône-Alpes
  "lyon": { dept: "69 – Rhône", region: "Auvergne-Rhône-Alpes" },
  "villeurbanne": { dept: "69 – Rhône", region: "Auvergne-Rhône-Alpes" },
  "venissieux": { dept: "69 – Rhône", region: "Auvergne-Rhône-Alpes" },
  "grenoble": { dept: "38 – Isère", region: "Auvergne-Rhône-Alpes" },
  "saint-etienne": { dept: "42 – Loire", region: "Auvergne-Rhône-Alpes" },
  "clermont-ferrand": { dept: "63 – Puy-de-Dôme", region: "Auvergne-Rhône-Alpes" },
  "chambery": { dept: "73 – Savoie", region: "Auvergne-Rhône-Alpes" },
  "annecy": { dept: "74 – Haute-Savoie", region: "Auvergne-Rhône-Alpes" },
  "valence": { dept: "26 – Drôme", region: "Auvergne-Rhône-Alpes" },
  "bourg-en-bresse": { dept: "01 – Ain", region: "Auvergne-Rhône-Alpes" },
  // Nouvelle-Aquitaine
  "bordeaux": { dept: "33 – Gironde", region: "Nouvelle-Aquitaine" },
  "merignac": { dept: "33 – Gironde", region: "Nouvelle-Aquitaine" },
  "pessac": { dept: "33 – Gironde", region: "Nouvelle-Aquitaine" },
  "biarritz": { dept: "64 – Pyrénées-Atlantiques", region: "Nouvelle-Aquitaine" },
  "bayonne": { dept: "64 – Pyrénées-Atlantiques", region: "Nouvelle-Aquitaine" },
  "pau": { dept: "64 – Pyrénées-Atlantiques", region: "Nouvelle-Aquitaine" },
  "limoges": { dept: "87 – Haute-Vienne", region: "Nouvelle-Aquitaine" },
  "poitiers": { dept: "86 – Vienne", region: "Nouvelle-Aquitaine" },
  "la rochelle": { dept: "17 – Charente-Maritime", region: "Nouvelle-Aquitaine" },
  "angouleme": { dept: "16 – Charente", region: "Nouvelle-Aquitaine" },
  "saintes": { dept: "17 – Charente-Maritime", region: "Nouvelle-Aquitaine" },
  // Occitanie
  "toulouse": { dept: "31 – Haute-Garonne", region: "Occitanie" },
  "montpellier": { dept: "34 – Hérault", region: "Occitanie" },
  "nimes": { dept: "30 – Gard", region: "Occitanie" },
  "perpignan": { dept: "66 – Pyrénées-Orientales", region: "Occitanie" },
  "montauban": { dept: "82 – Tarn-et-Garonne", region: "Occitanie" },
  "albi": { dept: "81 – Tarn", region: "Occitanie" },
  // Pays de la Loire
  "nantes": { dept: "44 – Loire-Atlantique", region: "Pays de la Loire" },
  "saint-nazaire": { dept: "44 – Loire-Atlantique", region: "Pays de la Loire" },
  "angers": { dept: "49 – Maine-et-Loire", region: "Pays de la Loire" },
  "le mans": { dept: "72 – Sarthe", region: "Pays de la Loire" },
  // Bretagne
  "rennes": { dept: "35 – Ille-et-Vilaine", region: "Bretagne" },
  "brest": { dept: "29 – Finistère", region: "Bretagne" },
  "quimper": { dept: "29 – Finistère", region: "Bretagne" },
  "lorient": { dept: "56 – Morbihan", region: "Bretagne" },
  "vannes": { dept: "56 – Morbihan", region: "Bretagne" },
  "saint-brieuc": { dept: "22 – Côtes-d'Armor", region: "Bretagne" },
  "saint-malo": { dept: "35 – Ille-et-Vilaine", region: "Bretagne" },
  // Hauts-de-France
  "lille": { dept: "59 – Nord", region: "Hauts-de-France" },
  "roubaix": { dept: "59 – Nord", region: "Hauts-de-France" },
  "tourcoing": { dept: "59 – Nord", region: "Hauts-de-France" },
  "valenciennes": { dept: "59 – Nord", region: "Hauts-de-France" },
  "dunkerque": { dept: "59 – Nord", region: "Hauts-de-France" },
  "calais": { dept: "62 – Pas-de-Calais", region: "Hauts-de-France" },
  "arras": { dept: "62 – Pas-de-Calais", region: "Hauts-de-France" },
  "amiens": { dept: "80 – Somme", region: "Hauts-de-France" },
  "saint-quentin": { dept: "02 – Aisne", region: "Hauts-de-France" },
  // Grand Est
  "strasbourg": { dept: "67 – Bas-Rhin", region: "Grand Est" },
  "mulhouse": { dept: "68 – Haut-Rhin", region: "Grand Est" },
  "colmar": { dept: "68 – Haut-Rhin", region: "Grand Est" },
  "metz": { dept: "57 – Moselle", region: "Grand Est" },
  "nancy": { dept: "54 – Meurthe-et-Moselle", region: "Grand Est" },
  "reims": { dept: "51 – Marne", region: "Grand Est" },
  "troyes": { dept: "10 – Aube", region: "Grand Est" },
  "montbeliard": { dept: "25 – Doubs", region: "Bourgogne-Franche-Comté" },
  "besancon": { dept: "25 – Doubs", region: "Bourgogne-Franche-Comté" },
  "belfort": { dept: "90 – Territoire de Belfort", region: "Bourgogne-Franche-Comté" },
  // Normandie
  "rouen": { dept: "76 – Seine-Maritime", region: "Normandie" },
  "le havre": { dept: "76 – Seine-Maritime", region: "Normandie" },
  "caen": { dept: "14 – Calvados", region: "Normandie" },
  "cherbourg": { dept: "50 – Manche", region: "Normandie" },
  "dieppe": { dept: "76 – Seine-Maritime", region: "Normandie" },
  "evreux": { dept: "27 – Eure", region: "Normandie" },
  // Centre-Val de Loire
  "orleans": { dept: "45 – Loiret", region: "Centre-Val de Loire" },
  "tours": { dept: "37 – Indre-et-Loire", region: "Centre-Val de Loire" },
  "chartres": { dept: "28 – Eure-et-Loir", region: "Centre-Val de Loire" },
  // Bourgogne-Franche-Comté
  "dijon": { dept: "21 – Côte-d'Or", region: "Bourgogne-Franche-Comté" },
  // Corse
  "ajaccio": { dept: "2A – Corse-du-Sud", region: "Corse" },
  "bastia": { dept: "2B – Haute-Corse", region: "Corse" },
}

function normalizeKey(str) {
  return str.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
}

function getCityInfo(city) {
  const key = normalizeKey(city)
  return DEPT_MAP[key] ?? { dept: "Inconnu", region: "Inconnue" }
}

// ─── Récupération des événements ──────────────────────────────────────────────
function fetchEvents() {
  return new Promise((resolve, reject) => {
    // D'abord, essayer l'API locale
    const url = new URL("/api/agenda?scope=cultural&view=detail", BASE_URL)
    const mod = url.protocol === "https:" ? https : (await import("http")).default
    const req = mod.get(url.toString(), (res) => {
      let body = ""
      res.on("data", c => body += c)
      res.on("end", () => {
        try {
          const data = JSON.parse(body)
          resolve(Array.isArray(data.events) ? data.events : [])
        } catch {
          resolve([])
        }
      })
    })
    req.on("error", () => resolve([]))
    req.setTimeout(5000, () => { req.destroy(); resolve([]) })
  })
}

// ─── Chargement depuis les fichiers statiques (fallback) ─────────────────────
async function loadEvents() {
  let events = []
  try {
    events = await fetchEvents()
    if (events.length > 0) return events
  } catch { /* silently fall through */ }

  // Fallback : lire les fichiers de données statiques via require
  try {
    const { createRequire } = await import("module")
    const require = createRequire(import.meta.url)
    // Essayer de lire le fichier generated s'il existe
    const builtPath = path.join(__dirname, "..", ".next", "server", "app", "api", "agenda", "route.js")
    console.warn("⚠️  API non disponible. Lance `next dev` pour un audit complet.")
    console.warn("    Lecture des fichiers statiques…\n")
  } catch { /* ignore */ }

  return events
}

// ─── Analyse ─────────────────────────────────────────────────────────────────
function analyze(events) {
  const byCity    = {}
  const byDept    = {}
  const byRegion  = {}
  const incomplete = []
  const tourStopsMissing = []

  for (const event of events) {
    const city   = event.city?.trim() || "— ville inconnue —"
    const info   = getCityInfo(city)
    const dept   = info.dept
    const region = info.region

    byCity[city]     = (byCity[city]     || 0) + 1
    byDept[dept]     = (byDept[dept]     || 0) + 1
    byRegion[region] = (byRegion[region] || 0) + 1

    // Événement incomplet ?
    const issues = []
    if (!event.image)         issues.push("image manquante")
    if (!event.latitude && !event.longitude) issues.push("coordonnées GPS absentes")
    if (!event.ticketUrl && !event.officialUrl) issues.push("billetterie manquante")
    if (!event.description || event.description.length < 30) issues.push("description trop courte")
    if (!event.startDate)     issues.push("date de début absente")
    if (!event.price)         issues.push("tarif non renseigné")
    if (issues.length > 0) {
      incomplete.push({ slug: event.slug, title: event.title, city, issues })
    }

    // Tournée potentiellement incomplète ?
    // (spectacle sans tourStops mais dont le titre/description mentionne des villes ou "tournée")
    const tourHints = /tourn[ée]e?|tour\b|dates? suppl[eé]mentaires/i
    if (!event.tourStops?.length && tourHints.test(`${event.title} ${event.description}`)) {
      tourStopsMissing.push({ slug: event.slug, title: event.title, city })
    }
  }

  return { byCity, byDept, byRegion, incomplete, tourStopsMissing }
}

// ─── Formatage du rapport ─────────────────────────────────────────────────────
function printReport(events, analysis) {
  const { byCity, byDept, byRegion, incomplete, tourStopsMissing } = analysis
  const total = events.length

  const sortedRegions = Object.entries(byRegion).sort((a, b) => b[1] - a[1])
  const sortedDepts   = Object.entries(byDept).sort((a, b) => b[1] - a[1])
  const sortedCities  = Object.entries(byCity).sort((a, b) => b[1] - a[1])
  const underRepresented = sortedCities.filter(([,n]) => n < MIN_EVENTS)

  const bar = (n, max, width = 20) => {
    const filled = Math.round((n / max) * width)
    return "█".repeat(filled) + "░".repeat(width - filled)
  }

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
  console.log("  🗺  AUDIT GÉOGRAPHIQUE — DANCE LAB AGENDA")
  console.log(`  ${new Date().toLocaleDateString("fr-FR", { dateStyle: "long" })}`)
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n")
  console.log(`  Total événements analysés : ${total}`)
  console.log(`  Villes couvertes           : ${Object.keys(byCity).length}`)
  console.log(`  Régions couvertes          : ${sortedRegions.filter(([r]) => r !== "Inconnue").length} / 18`)
  console.log(`  Départements couverts      : ${Object.keys(byDept).length}`)
  console.log()

  // Par région
  const maxRegion = Math.max(...Object.values(byRegion))
  console.log("  ── Par région ────────────────────────────────────────────────")
  for (const [region, count] of sortedRegions) {
    const pct = ((count / total) * 100).toFixed(1)
    console.log(`  ${region.padEnd(36)} ${bar(count, maxRegion, 14)} ${String(count).padStart(4)}  (${pct}%)`)
  }

  // Par département (top 20)
  console.log("\n  ── Par département (top 20) ──────────────────────────────────")
  const maxDept = Math.max(...Object.values(byDept))
  for (const [dept, count] of sortedDepts.slice(0, 20)) {
    console.log(`  ${dept.padEnd(34)} ${bar(count, maxDept, 14)} ${String(count).padStart(4)}`)
  }

  // Par ville (top 30)
  console.log("\n  ── Par ville (top 30) ────────────────────────────────────────")
  const maxCity = sortedCities[0]?.[1] ?? 1
  for (const [city, count] of sortedCities.slice(0, 30)) {
    const { region } = getCityInfo(city)
    console.log(`  ${city.padEnd(28)} ${bar(count, maxCity, 14)} ${String(count).padStart(4)}  ${region}`)
  }

  // Territoires sous-représentés
  console.log(`\n  ── Territoires sous-représentés (< ${MIN_EVENTS} événement${MIN_EVENTS > 1 ? "s" : ""}) ──────────`)
  if (underRepresented.length === 0) {
    console.log("  ✅ Aucun — toutes les villes connues ont au moins " + MIN_EVENTS + " événement(s).")
  } else {
    for (const [city, count] of underRepresented) {
      console.log(`  ⚠  ${city.padEnd(26)} ${count} événement(s)`)
    }
  }

  // Régions absentes
  const allRegions = [
    "Île-de-France","Auvergne-Rhône-Alpes","Nouvelle-Aquitaine","Occitanie",
    "Hauts-de-France","Grand Est","Provence-Alpes-Côte d'Azur","Pays de la Loire",
    "Normandie","Bretagne","Bourgogne-Franche-Comté","Centre-Val de Loire",
    "Corse","La Réunion","Martinique","Guadeloupe","Guyane","Mayotte",
  ]
  const missingRegions = allRegions.filter(r => !byRegion[r])
  if (missingRegions.length > 0) {
    console.log("\n  ── Régions absentes de l'agenda ──────────────────────────────")
    for (const r of missingRegions) console.log(`  ❌ ${r}`)
  }

  // Tournées potentiellement incomplètes
  console.log(`\n  ── Tournées potentiellement incomplètes (${tourStopsMissing.length}) ──────────────`)
  if (tourStopsMissing.length === 0) {
    console.log("  ✅ Aucune tournée incomplète détectée.")
  } else {
    for (const { title, city, slug } of tourStopsMissing.slice(0, 20)) {
      console.log(`  ⚡ ${title.slice(0, 40).padEnd(40)} ${city}  /sortir/${slug}`)
    }
    if (tourStopsMissing.length > 20) {
      console.log(`  … et ${tourStopsMissing.length - 20} autres.`)
    }
  }

  // Événements incomplets
  console.log(`\n  ── Événements incomplets (${incomplete.length}) ─────────────────────────────`)
  if (incomplete.length === 0) {
    console.log("  ✅ Tous les événements sont complets.")
  } else {
    for (const { title, city, issues, slug } of incomplete.slice(0, 25)) {
      console.log(`  📋 ${title.slice(0, 38).padEnd(38)} ${city}`)
      console.log(`     ${issues.join(" · ")}`)
    }
    if (incomplete.length > 25) console.log(`  … et ${incomplete.length - 25} autres.`)
  }

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n")
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log("⏳ Chargement des événements…")
  const events = await loadEvents()

  if (events.length === 0) {
    console.error("❌ Aucun événement trouvé.")
    console.error("   Démarre le serveur Next.js avec `npm run dev` puis relance ce script.")
    process.exit(1)
  }

  console.log(`✅ ${events.length} événements chargés.\n`)

  const analysis = analyze(events)

  if (AS_JSON) {
    const { byCity, byDept, byRegion, incomplete, tourStopsMissing } = analysis
    console.log(JSON.stringify({
      total: events.length,
      byRegion: Object.fromEntries(Object.entries(byRegion).sort((a, b) => b[1] - a[1])),
      byDept: Object.fromEntries(Object.entries(byDept).sort((a, b) => b[1] - a[1])),
      byCity: Object.fromEntries(Object.entries(byCity).sort((a, b) => b[1] - a[1])),
      underRepresented: Object.entries(byCity).filter(([,n]) => n < MIN_EVENTS).map(([city, n]) => ({ city, count: n })),
      incomplete: incomplete.slice(0, 50),
      tourStopsMissing: tourStopsMissing.slice(0, 50),
    }, null, 2))
  } else {
    printReport(events, analysis)
  }
}

main().catch(err => { console.error(err); process.exit(1) })
