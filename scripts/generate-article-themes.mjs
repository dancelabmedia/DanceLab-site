/**
 * generate-article-themes.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Script d'aide à la rédaction : génère automatiquement 7 expressions éditoriales
 * (thèmes) pour un article Dance Lab à partir de son contenu.
 *
 * Usage :
 *   node scripts/generate-article-themes.mjs <slug>
 *
 * Prérequis :
 *   export ANTHROPIC_API_KEY="sk-ant-..."
 *
 * Exemple :
 *   node scripts/generate-article-themes.mjs cv-artistes-auront-disparu
 *
 * Le script :
 *   1. Lit les données de l'article dans articles-data.ts (via un import statique
 *      ou en parsant le fichier selon la disponibilité d'un bundler).
 *   2. Compose un prompt éditorial avec titre + chapo + toutes les sections.
 *   3. Appelle Claude claude-haiku-4-5-20251001 (rapide et économique).
 *   4. Affiche les thèmes à copier-coller dans articles-data.ts.
 *
 * Note : ce script est conçu pour être exécuté manuellement par la rédaction
 * lors de la création d'un nouvel article. Il ne modifie aucun fichier.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { readFileSync } from 'fs'
import { resolve } from 'path'

const SLUG = process.argv[2]

if (!SLUG) {
  console.error('Usage: node scripts/generate-article-themes.mjs <article-slug>')
  process.exit(1)
}

const API_KEY = process.env.ANTHROPIC_API_KEY
if (!API_KEY) {
  console.error('❌  Variable d\'environnement ANTHROPIC_API_KEY manquante.')
  process.exit(1)
}

// ── Extraction basique du contenu depuis articles-data.ts ─────────────────────
// On lit le fichier TS en texte brut et on extrait le bloc de l'article ciblé.
// C'est volontairement simple : pas de compilation, pas de dépendances.

const dataPath = resolve(process.cwd(), 'app/decouvrir/articles-data.ts')
const raw = readFileSync(dataPath, 'utf8')

// Trouver le bloc slug: "<SLUG>"
const slugMarker = `slug: "${SLUG}"`
const startIndex = raw.indexOf(slugMarker)
if (startIndex === -1) {
  console.error(`❌  Article introuvable pour le slug : "${SLUG}"`)
  process.exit(1)
}

// Extraire un bloc de ~4000 caractères autour du slug pour avoir tout le contenu
const excerpt = raw.slice(startIndex, startIndex + 8000)

// Extractions simples par regex
const titleMatch      = excerpt.match(/title:\s*"([^"]+)"/)
const chapoMatch      = excerpt.match(/chapo:\s*"([^"]+)"/)
const categoryMatch   = excerpt.match(/category:\s*"([^"]+)"/)

const title    = titleMatch?.[1]    ?? '(titre inconnu)'
const chapo    = chapoMatch?.[1]    ?? '(chapô inconnu)'
const category = categoryMatch?.[1] ?? '(catégorie inconnue)'

// Extraire les paragraphes (approx.)
const paragraphs = [...excerpt.matchAll(/paragraphs:\s*\[([^\]]+)\]/gs)]
  .map(m => m[1].replace(/["'\\n]/g, ' ').trim())
  .join(' ')
  .slice(0, 3000)

// ── Appel Claude ───────────────────────────────────────────────────────────────

const prompt = `
Tu es éditeur·rice d'un magazine de danse contemporaine et culture urbaine.
Pour l'article suivant, génère 7 expressions éditoriales courtes (thèmes)
qui résument les sujets clés abordés.

Règles :
- Chaque expression = 2 à 6 mots maximum
- Tout en majuscules
- Percutant, magazine, pas banal
- Représentatif du contenu réel (pas générique)
- En français, mais les noms propres (villes, marques) restent tels quels
- Pas de ponctuation sauf les traits d'union et apostrophes
- Format JSON strict : tableau de 7 strings

Article :
Catégorie : ${category}
Titre : ${title}
Chapô : ${chapo}
Extrait du contenu : ${paragraphs}

Réponds uniquement avec le tableau JSON, sans explication.
`.trim()

console.log(`\n🔍  Analyse de l'article : "${title}"\n`)

const response = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'x-api-key': API_KEY,
    'anthropic-version': '2023-06-01',
    'content-type': 'application/json',
  },
  body: JSON.stringify({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 512,
    messages: [{ role: 'user', content: prompt }],
  }),
})

if (!response.ok) {
  const err = await response.text()
  console.error('❌  Erreur API Anthropic :', err)
  process.exit(1)
}

const data = await response.json()
const text = data.content?.[0]?.text ?? ''

let themes
try {
  // Extraire le JSON même si Claude ajoute du texte autour
  const jsonMatch = text.match(/\[[\s\S]*\]/)
  if (!jsonMatch) throw new Error('Aucun tableau JSON trouvé dans la réponse')
  themes = JSON.parse(jsonMatch[0])
} catch (e) {
  console.error('❌  Impossible de parser la réponse :', text)
  process.exit(1)
}

// ── Affichage résultat ─────────────────────────────────────────────────────────

console.log('✅  Thèmes générés :\n')
console.log(`  themes: ${JSON.stringify(themes)},\n`)
console.log('👉  Copie cette ligne dans articles-data.ts, juste après le champ `tags`.')
