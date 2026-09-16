#!/usr/bin/env tsx
/**
 * scripts/generate-articles.ts
 * Script de génération des articles podcast Dance Lab.
 *
 * Usage :
 *   npx tsx scripts/generate-articles.ts              # Génère tous les articles manquants
 *   npx tsx scripts/generate-articles.ts --episode 127  # Génère l'article de l'épisode 127
 *   npx tsx scripts/generate-articles.ts --force        # Regénère même si article existant
 *   npx tsx scripts/generate-articles.ts --dry-run      # Affiche les épisodes manquants sans générer
 *
 * Variables d'environnement requises :
 *   ANTHROPIC_API_KEY   — Clé API Anthropic (Claude)
 *   NOTION_TOKEN        — Token d'intégration Notion (optionnel mais recommandé)
 *
 * Les articles sont sauvegardés dans data/podcast-articles/ep-{number}.json
 * avec le statut "brouillon" et synchronisés vers Notion (Dance Lab, Le média).
 * Ils ne sont pas visibles publiquement sur le site avant validation.
 */

import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'

// Résolution des chemins pour ESM
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const PROJECT_ROOT = path.resolve(__dirname, '..')

// ── Charge le .env.local pour les variables d'environnement ──────────────────
function loadEnv() {
  const envPath = path.join(PROJECT_ROOT, '.env.local')
  if (!fs.existsSync(envPath)) return

  const content = fs.readFileSync(envPath, 'utf-8')
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIndex = trimmed.indexOf('=')
    if (eqIndex === -1) continue
    const key = trimmed.slice(0, eqIndex).trim()
    const value = trimmed.slice(eqIndex + 1).trim().replace(/^["']|["']$/g, '')
    if (!process.env[key]) {
      process.env[key] = value
    }
  }
}

loadEnv()

// ── Parse des arguments CLI ───────────────────────────────────────────────────
const args = process.argv.slice(2)
const episodeArg = args.includes('--episode') ? parseInt(args[args.indexOf('--episode') + 1]) : null
const forceFlag = args.includes('--force')
const dryRunFlag = args.includes('--dry-run')

// ── Imports dynamiques (après chargement env) ─────────────────────────────────
// On utilise process.chdir pour que les imports relatifs fonctionnent
process.chdir(PROJECT_ROOT)

async function main() {
  console.log('\n🎙 Dance Lab — Générateur d\'articles podcast\n')
  console.log(`📅 Lancé le ${new Date().toLocaleString('fr-FR')}\n`)

  // Vérifie la clé API
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('❌ ANTHROPIC_API_KEY non définie.')
    console.error('   Ajoute-la dans .env.local ou en variable d\'environnement.\n')
    process.exit(1)
  }

  // Import dynamique des modules du projet
  const { getEpisodesFromRSS } = await import(path.join(PROJECT_ROOT, 'lib/ausha-rss.ts'))
  const {
    getPodcastArticleByEpisode,
    savePodcastArticle,
    getNextTuesdayPublishDate,
  } = await import(path.join(PROJECT_ROOT, 'lib/podcast-articles.ts'))
  const { generateArticleFromEpisode } = await import(path.join(PROJECT_ROOT, 'lib/article-generator.ts'))
  const notionEnabled = !!process.env.NOTION_TOKEN
  const { syncArticleToNotion } = notionEnabled
    ? await import(path.join(PROJECT_ROOT, 'lib/notion-articles.ts'))
    : { syncArticleToNotion: null }

  // Récupère les épisodes depuis Ausha RSS
  console.log('📡 Récupération du flux RSS Ausha…')
  let episodes
  try {
    episodes = await getEpisodesFromRSS()
  } catch (err) {
    console.error(`❌ Impossible de récupérer le flux RSS : ${err}`)
    process.exit(1)
  }

  // Filtre les extraits
  const fullEpisodes = episodes.filter((ep: { isExtrait: boolean }) => !ep.isExtrait)
  console.log(`✅ ${fullEpisodes.length} épisodes récupérés depuis Ausha RSS\n`)

  // Détermine les épisodes à traiter
  let toProcess: typeof fullEpisodes

  if (episodeArg) {
    // Mode épisode spécifique
    const ep = fullEpisodes.find((e: { number: number }) => e.number === episodeArg)
    if (!ep) {
      console.error(`❌ Épisode #${episodeArg} introuvable dans le flux RSS.`)
      process.exit(1)
    }
    toProcess = [ep]
  } else {
    // Mode automatique : épisodes sans article
    toProcess = fullEpisodes.filter((ep: { number: number }) => {
      if (forceFlag) return true
      const existing = getPodcastArticleByEpisode(ep.number)
      return !existing
    })

    if (toProcess.length === 0) {
      console.log('✅ Tous les épisodes ont déjà un article généré.')
      console.log('   Utilise --force pour régénérer.\n')
      process.exit(0)
    }
  }

  console.log(`📝 ${toProcess.length} épisode(s) à traiter :\n`)
  for (const ep of toProcess) {
    console.log(`   • #${ep.number} — ${ep.guest || '?'} (${ep.pubDate || 'date inconnue'})`)
  }
  console.log()

  if (dryRunFlag) {
    console.log('ℹ️  Mode dry-run — aucun article généré.\n')
    process.exit(0)
  }

  // Génération
  let generated = 0
  let failed = 0

  for (const ep of toProcess) {
    process.stdout.write(`⏳ #${ep.number} (${ep.guest || ep.title})… `)

    try {
      const article = await generateArticleFromEpisode(ep)
      const scheduledFor = getNextTuesdayPublishDate()

      const episodeFile = {
        episodeNumber: ep.number,
        episodeSlug: ep.aushaSlug,
        status: 'brouillon' as const,
        generatedAt: new Date().toISOString(),
        scheduledFor,
        article,
      }

      savePodcastArticle(episodeFile)
      console.log(`✅ → ${article.slug}`)

      // Sync Notion si token disponible
      if (syncArticleToNotion) {
        try {
          process.stdout.write(`   📔 Sync Notion… `)
          await syncArticleToNotion(episodeFile)
          console.log(`✅`)
        } catch (notionErr) {
          console.log(`⚠️  (Notion non synced: ${notionErr})`)
        }
      }

      generated++
    } catch (err) {
      console.log(`❌ ERREUR : ${err}`)
      failed++
    }

    // Pause de 2s entre chaque appel API pour éviter le rate limiting
    if (toProcess.indexOf(ep) < toProcess.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  }

  // Résumé
  console.log('\n' + '─'.repeat(50))
  console.log(`📊 Résumé : ${generated} générés, ${failed} échecs\n`)

  if (generated > 0) {
    console.log('👉 Pour valider les articles :')
    if (notionEnabled) {
      console.log('   • Dans Notion : Dance Lab, Le média → 📰 Magazine — Articles')
    }
    console.log('   • Sur le site en local : npm run dev → http://localhost:3000/admin/articles\n')
  }

  if (failed > 0) {
    process.exit(1)
  }
}

main().catch(err => {
  console.error('\n❌ Erreur inattendue :', err)
  process.exit(1)
})
