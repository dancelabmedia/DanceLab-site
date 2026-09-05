#!/usr/bin/env node
/**
 * scripts/new-episode.mjs
 *
 * Outil de préparation automatique d'un nouvel épisode Dance Lab.
 * À lancer après publication de l'épisode sur Ausha (et YouTube si disponible).
 *
 * Usage :
 *   node scripts/new-episode.mjs            → dernier épisode Ausha
 *   node scripts/new-episode.mjs 127        → épisode 127 spécifique
 *   node scripts/new-episode.mjs --write    → écrit directement dans episode-extras.ts
 *   node scripts/new-episode.mjs 127 --write
 *
 * Ce que fait le script :
 *   1. Lit le flux RSS Ausha → trouve l'épisode + son extrait (citation)
 *   2. Lit le flux Atom YouTube → trouve la vidéo correspondante
 *   3. Affiche la citation + YouTube détectés
 *   4. Avec --write : patche data/episode-extras.ts directement (ne remplace pas les valeurs déjà renseignées)
 *   5. Sans --write : affiche l'entrée à copier-coller
 *
 * Pour ajouter le Reel Instagram ultérieurement :
 *   node scripts/add-reel.mjs 127 https://www.instagram.com/reel/XXXXX/
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath }               from 'node:url'
import path                            from 'node:path'

const __dirname  = path.dirname(fileURLToPath(import.meta.url))
const EXTRAS_PATH = path.join(__dirname, '..', 'data', 'episode-extras.ts')

const RSS_URL          = 'https://feed.ausha.co/yvVqGgCrEkqK'
const YOUTUBE_FEED_URL = 'https://www.youtube.com/feeds/videos.xml?channel_id=UCzTqgBJF9aI66DxFyhPLdTA'

// ─── Helpers XML ──────────────────────────────────────────────────────────────

function extractTag(xml, tag) {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i')
  return xml.match(re)?.[1]?.trim() ?? ''
}

// ─── Parsers ──────────────────────────────────────────────────────────────────

function parseAushaTitle(raw) {
  const numMatch = raw.match(/^(\d+)\.\s*/)
  const number = numMatch ? parseInt(numMatch[1], 10) : 0
  let rest = numMatch ? raw.slice(numMatch[0].length) : raw

  const isExtrait = /^EXTRAIT\b/i.test(rest)

  const guestMatch = rest.match(/,\s*avec\s+(.+)$/i)
  const guest = guestMatch ? guestMatch[1].trim() : ''
  if (guestMatch) rest = rest.slice(0, rest.length - guestMatch[0].length)

  let title = rest
    .replace(/^EXTRAIT\s*[-–]\s*/i, '')
    .replace(/^["«"\u201c]|["»"\u201d]$/g, '')
    .trim()
  title = title.replace(/,\s*$/, '').trim()

  return { number, title, guest, isExtrait }
}

function parseYoutubeTitle(title) {
  const fullMatch = title.match(/^(\d+)\.\s+/)
  if (fullMatch) return { episodeNumber: parseInt(fullMatch[1], 10), isShort: false }
  const shortMatch = title.match(/(?:Ep\.?\s*|#)(\d+)/i)
  if (shortMatch) return { episodeNumber: parseInt(shortMatch[1], 10), isShort: true }
  return { episodeNumber: null, isShort: false }
}

// ─── Fetch Ausha ──────────────────────────────────────────────────────────────

async function fetchAushaData(targetNumber) {
  process.stdout.write('📡 Ausha RSS...')
  const res = await fetch(RSS_URL)
  if (!res.ok) throw new Error(`Flux Ausha inaccessible (${res.status})`)

  const xml = await res.text()
  const items = xml.match(/<item>[\s\S]*?<\/item>/g) ?? []

  const episodes = []
  const extraits = []

  for (const item of items) {
    const rawTitle = extractTag(item, 'title')
    // Ignorer les rediffusions — elles ne doivent pas être importées sur le site
    if (/^\s*REDIFFUSION\b/i.test(rawTitle)) continue
    const parsed = parseAushaTitle(rawTitle)
    if (parsed.number === 0) continue
    if (parsed.isExtrait) extraits.push(parsed)
    else episodes.push(parsed)
  }

  episodes.sort((a, b) => b.number - a.number)
  const number = targetNumber ?? episodes[0]?.number
  const episode = episodes.find(e => e.number === number)
  const extrait = extraits.find(e => e.number === number)

  console.log(episode ? ' ✅' : ' ❌')
  return { episode, extrait, number }
}

// ─── Fetch YouTube ────────────────────────────────────────────────────────────

async function fetchYoutubeVideo(targetNumber) {
  process.stdout.write('🎬 YouTube (15 dernières vidéos)...')
  try {
    const res = await fetch(YOUTUBE_FEED_URL)
    if (!res.ok) { console.log(` ❌ (${res.status})`); return null }

    const xml = await res.text()
    const entries = xml.match(/<entry>[\s\S]*?<\/entry>/g) ?? []

    for (const entry of entries) {
      const videoId = extractTag(entry, 'yt:videoId')
      const title   = extractTag(entry, 'title')
      const { episodeNumber, isShort } = parseYoutubeTitle(title)
      if (episodeNumber === targetNumber && !isShort) {
        console.log(' ✅')
        return { videoId, title }
      }
    }
    console.log(' ⚠️  non trouvé dans les 15 dernières')
    return null
  } catch (err) {
    console.log(` ❌ (${err.message})`)
    return null
  }
}

// ─── Patch episode-extras.ts ──────────────────────────────────────────────────

/**
 * Lit episode-extras.ts et insère/met à jour l'entrée pour `number`.
 * Règles :
 *   - Ne remplace PAS les valeurs déjà renseignées (quote, youtubeId, instagramReelUrl)
 *   - Ajoute uniquement les champs manquants
 *   - Insère le bloc avant le commentaire "── Ajouter les prochains épisodes ici ──"
 *     ou, si absent, avant "── Reels Instagram"
 */
function patchExtrasFile(number, fields) {
  let src = readFileSync(EXTRAS_PATH, 'utf8')

  // Vérifier si l'entrée existe déjà
  const existingRe = new RegExp(`^\\s{2}${number}:\\s*\\{([\\s\\S]*?)\\},`, 'm')
  const existingMatch = src.match(existingRe)

  if (existingMatch) {
    // L'entrée existe — ajouter uniquement les champs manquants
    let block = existingMatch[0]
    let changed = false

    for (const [key, value] of Object.entries(fields)) {
      if (!block.includes(`${key}:`)) {
        // Insère avant la fermeture `  },` (la dernière propriété a déjà une virgule)
        const valueStr = JSON.stringify(value)
        block = block.replace(/(\s*\},)\s*$/, `\n    ${key}: ${valueStr},$1`)
        changed = true
      }
    }

    if (changed) {
      src = src.replace(existingMatch[0], block)
      writeFileSync(EXTRAS_PATH, src, 'utf8')
      return 'updated'
    }
    return 'unchanged'
  }

  // L'entrée n'existe pas — créer un nouveau bloc
  const lines = [`  ${number}: {`]
  for (const [key, value] of Object.entries(fields)) {
    lines.push(`    ${key}: ${JSON.stringify(value)},`)
  }
  lines.push(`  },`)
  const newBlock = lines.join('\n')

  // Cherche le marqueur d'insertion
  const marker1 = '// ── Ajouter les prochains épisodes ici ──'
  const marker2 = '// ── Reels Instagram'

  let insertPoint = src.indexOf(marker1)
  if (insertPoint === -1) insertPoint = src.indexOf(marker2)

  if (insertPoint !== -1) {
    // Insère juste avant le marqueur (avec une ligne vide)
    src = src.slice(0, insertPoint) + newBlock + '\n\n  ' + src.slice(insertPoint)
  } else {
    // Dernier recours : avant la fermeture `}` du record
    const lastBrace = src.lastIndexOf('\n}')
    src = src.slice(0, lastBrace) + '\n\n' + newBlock + src.slice(lastBrace)
  }

  writeFileSync(EXTRAS_PATH, src, 'utf8')
  return 'created'
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const args        = process.argv.slice(2)
  const shouldWrite = args.includes('--write')
  const numArg      = args.find(a => /^\d+$/.test(a))
  const targetNumber = numArg ? parseInt(numArg, 10) : null

  console.log('\n' + '═'.repeat(60))
  console.log('🎙  DANCE LAB — Préparation d\'un nouvel épisode')
  console.log('═'.repeat(60) + '\n')

  const [aushaData, ytVideo] = await Promise.all([
    fetchAushaData(targetNumber),
    (async () => {
      const num = targetNumber ?? (await fetchAushaData(targetNumber).catch(() => ({ number: null }))).number
      return fetchYoutubeVideo(num ?? targetNumber)
    })(),
  ])

  const { episode, extrait, number } = aushaData
  console.log()

  if (!episode) {
    console.log(`❌ Épisode ${number ?? '?'} non trouvé dans le flux Ausha.`)
    console.log('   (Les épisodes 1–121 sont dans data/episodes-list.ts)\n')
    process.exit(0)
  }

  console.log(`📝 Titre   : ${episode.title}`)
  console.log(`👤 Invité  : ${episode.guest}`)
  console.log(`🔢 Numéro  : ${number}`)

  const quote     = extrait?.title ?? ''
  const youtubeId = ytVideo?.videoId ?? null

  if (quote)     console.log(`\n💬 Citation : "${quote}"`)
  else           console.log('\n⚠️  Pas d\'extrait Ausha trouvé → citation vide')

  if (youtubeId) console.log(`▶️  YouTube  : https://www.youtube.com/watch?v=${youtubeId}`)
  else           console.log('⚠️  YouTube  : non trouvé dans les 15 dernières vidéos')

  console.log('\n📱 Instagram Reel : non disponible au moment de la création')
  console.log('   → Lancer cette commande dès que le Reel est publié :')
  console.log(`   node scripts/add-reel.mjs ${number} https://www.instagram.com/reel/XXXXX/`)

  // Champs à écrire (uniquement ceux qui ont une valeur)
  const fieldsToWrite = {}
  if (quote)     fieldsToWrite.quote     = quote
  if (youtubeId) fieldsToWrite.youtubeId = youtubeId

  console.log('\n' + '─'.repeat(60))

  if (shouldWrite && Object.keys(fieldsToWrite).length > 0) {
    const result = patchExtrasFile(number, fieldsToWrite)
    if (result === 'created')   console.log(`✅ Entrée ${number} créée dans episode-extras.ts`)
    if (result === 'updated')   console.log(`✅ Entrée ${number} mise à jour dans episode-extras.ts`)
    if (result === 'unchanged') console.log(`ℹ️  Entrée ${number} déjà complète — aucune modification`)
    console.log('\n   Prochaine étape :')
    console.log('   git add data/episode-extras.ts && git commit -m "feat: épisode ' + number + '" && git push')
  } else if (shouldWrite && Object.keys(fieldsToWrite).length === 0) {
    console.log('⚠️  Rien à écrire : citation et YouTube tous les deux manquants.')
    console.log('   Vérifie que l\'épisode et son extrait sont bien publiés sur Ausha.')
  } else {
    // Affichage de l'entrée à copier
    console.log('📋 Entrée à ajouter dans data/episode-extras.ts :')
    console.log('─'.repeat(60))
    const lines = [`  ${number}: {`]
    if (quote)     lines.push(`    quote:     ${JSON.stringify(quote)},`)
    else           lines.push(`    quote:     "", // ← à remplir`)
    if (youtubeId) lines.push(`    youtubeId: ${JSON.stringify(youtubeId)},`)
    else           lines.push(`    youtubeId: "", // ← à remplir`)
    lines.push(`  },`)
    console.log(lines.join('\n'))
    console.log('─'.repeat(60))
    console.log('\n   Ou lancer avec --write pour écrire automatiquement :')
    console.log(`   node scripts/new-episode.mjs ${number} --write`)
  }

  console.log()
}

main().catch(err => {
  console.error('\n❌', err.message)
  process.exit(1)
})
