#!/usr/bin/env node
/**
 * scripts/add-reel.mjs
 *
 * Associe un Reel Instagram à un épisode Dance Lab.
 * Patche data/episode-extras.ts directement, sans écraser les données existantes.
 *
 * Usage :
 *   node scripts/add-reel.mjs <numéro> <url-reel>
 *
 * Exemple :
 *   node scripts/add-reel.mjs 127 https://www.instagram.com/reel/DhXXXXXXXXX/
 *
 * Le script :
 *   1. Vérifie que l'URL est bien un Reel Instagram valide
 *   2. Si l'épisode a déjà un instagramReelUrl → affiche un avertissement et s'arrête
 *   3. Si l'épisode existe dans episode-extras.ts → ajoute instagramReelUrl
 *   4. Si l'épisode n'existe pas encore → crée le bloc minimal avec instagramReelUrl
 *   5. Affiche la commande git à lancer pour publier la mise à jour
 *
 * Vérifications avant association :
 *   - L'URL Instagram fournie est syntaxiquement valide
 *   - Le numéro d'épisode correspond bien à un épisode dans le flux Ausha
 *     (titre, invité, date) afin d'éviter toute mauvaise association
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath }               from 'node:url'
import path                            from 'node:path'

const __dirname   = path.dirname(fileURLToPath(import.meta.url))
const EXTRAS_PATH = path.join(__dirname, '..', 'data', 'episode-extras.ts')
const RSS_URL     = 'https://feed.ausha.co/yvVqGgCrEkqK'

// ─── Validation URL ───────────────────────────────────────────────────────────

function validateReelUrl(url) {
  if (!url) return false
  return /^https:\/\/(www\.)?instagram\.com\/reel\/[A-Za-z0-9_-]+\/?/.test(url)
}

function normalizeReelUrl(url) {
  // S'assure que l'URL se termine par /
  return url.replace(/\/?$/, '/')
}

// ─── Vérification Ausha ───────────────────────────────────────────────────────

async function verifyEpisodeOnAusha(number) {
  try {
    const res = await fetch(RSS_URL, { signal: AbortSignal.timeout(8000) })
    if (!res.ok) return null

    const xml = await res.text()
    const items = xml.match(/<item>[\s\S]*?<\/item>/g) ?? []

    for (const item of items) {
      const rawTitle = item.match(/<title[^>]*>(.*?)<\/title>/)?.[1] ?? ''
      const numMatch = rawTitle.match(/^(\d+)\.\s*/)
      if (!numMatch) continue
      const num = parseInt(numMatch[1], 10)
      if (num !== number) continue

      const isExtrait = /^\d+\.\s*EXTRAIT/i.test(rawTitle)
      if (isExtrait) continue

      // Extrait invité et titre
      let rest = rawTitle.slice(numMatch[0].length)
      const guestMatch = rest.match(/,\s*avec\s+(.+)$/i)
      const guest = guestMatch ? guestMatch[1].trim() : ''
      const title = guestMatch ? rest.slice(0, rest.length - guestMatch[0].length).trim() : rest.trim()

      // Date de publication
      const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] ?? ''

      return { title, guest, pubDate }
    }
    return null
  } catch {
    return null
  }
}

// ─── Patch episode-extras.ts ──────────────────────────────────────────────────

function patchExtrasWithReel(number, reelUrl) {
  let src = readFileSync(EXTRAS_PATH, 'utf8')

  // Cherche une entrée existante pour ce numéro
  const existingRe = new RegExp(`^(\\s{2}${number}:\\s*\\{)([\\s\\S]*?)(\\s*\\},)`, 'm')
  const existingMatch = src.match(existingRe)

  if (existingMatch) {
    const fullBlock = existingMatch[0]
    const body = existingMatch[2]

    // Déjà un Reel renseigné ?
    if (body.includes('instagramReelUrl')) {
      const existing = body.match(/instagramReelUrl:\s*"([^"]*)"/)?.[1] ?? ''
      return { status: 'already_set', existing }
    }

    // Ajoute instagramReelUrl à la fin du bloc (avant la fermeture `},`)
    // La dernière propriété existante a déjà une virgule — on n'en rajoute pas
    const newBlock = fullBlock.replace(
      /(\s*\},)\s*$/,
      `\n    instagramReelUrl: ${JSON.stringify(reelUrl)},\n  },`
    )
    src = src.replace(fullBlock, newBlock)
    writeFileSync(EXTRAS_PATH, src, 'utf8')
    return { status: 'updated' }
  }

  // L'épisode n'a pas encore d'entrée — crée un bloc minimal
  const newBlock = `  ${number}: {\n    instagramReelUrl: ${JSON.stringify(reelUrl)},\n  },`

  // Point d'insertion : avant le commentaire "── Ajouter les prochains épisodes ici ──"
  // ou avant "── Reels Instagram" ou avant la dernière `}`
  const markers = [
    '// ── Ajouter les prochains épisodes ici ──',
    '// ── Reels Instagram',
  ]

  let insertPoint = -1
  for (const marker of markers) {
    const idx = src.indexOf(marker)
    if (idx !== -1) { insertPoint = idx; break }
  }

  if (insertPoint !== -1) {
    src = src.slice(0, insertPoint) + newBlock + '\n\n  ' + src.slice(insertPoint)
  } else {
    const lastBrace = src.lastIndexOf('\n}')
    src = src.slice(0, lastBrace) + '\n\n' + newBlock + src.slice(lastBrace)
  }

  writeFileSync(EXTRAS_PATH, src, 'utf8')
  return { status: 'created' }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const [numStr, reelUrl] = process.argv.slice(2)

  console.log('\n' + '═'.repeat(60))
  console.log('📱 DANCE LAB — Ajout d\'un Reel Instagram')
  console.log('═'.repeat(60) + '\n')

  // Validation des arguments
  if (!numStr || !reelUrl) {
    console.error('❌ Usage : node scripts/add-reel.mjs <numéro> <url-reel>')
    console.error('   Ex.   : node scripts/add-reel.mjs 127 https://www.instagram.com/reel/DhXXXX/')
    process.exit(1)
  }

  const number = parseInt(numStr, 10)
  if (isNaN(number) || number < 1) {
    console.error(`❌ Numéro d'épisode invalide : "${numStr}"`)
    process.exit(1)
  }

  if (!validateReelUrl(reelUrl)) {
    console.error(`❌ URL Instagram invalide : "${reelUrl}"`)
    console.error('   Format attendu : https://www.instagram.com/reel/XXXXXXXXXXX/')
    process.exit(1)
  }

  const normalizedUrl = normalizeReelUrl(reelUrl)

  // Vérification de l'épisode sur Ausha
  process.stdout.write(`📡 Vérification épisode ${number} sur Ausha...`)
  const aushaInfo = await verifyEpisodeOnAusha(number)

  if (aushaInfo) {
    console.log(' ✅')
    console.log(`   Titre  : ${aushaInfo.title}`)
    console.log(`   Invité : ${aushaInfo.guest}`)
    if (aushaInfo.pubDate) console.log(`   Date   : ${aushaInfo.pubDate}`)
  } else {
    console.log(' ⚠️  Épisode non trouvé dans le flux RSS (peut-être < 122 ou non encore publié)')
  }

  console.log(`\n🔗 URL Reel : ${normalizedUrl}`)
  console.log('\n📝 Mise à jour de data/episode-extras.ts...')

  // Patch du fichier
  const result = patchExtrasWithReel(number, normalizedUrl)

  if (result.status === 'already_set') {
    console.log(`\n⚠️  L'épisode ${number} a déjà un Reel renseigné :`)
    console.log(`   ${result.existing}`)
    console.log('\n   Pour remplacer, modifie manuellement data/episode-extras.ts')
    process.exit(0)
  }

  if (result.status === 'updated') {
    console.log(`✅ instagramReelUrl ajouté à l'entrée ${number} existante`)
  } else {
    console.log(`✅ Nouvelle entrée ${number} créée avec instagramReelUrl`)
  }

  console.log('\n' + '─'.repeat(60))
  console.log('📤 Prochaine étape — publier sur le site :')
  console.log('─'.repeat(60))
  console.log(`git add data/episode-extras.ts && git commit -m "feat(ep${number}): Reel Instagram" && git push`)
  console.log()
}

main().catch(err => {
  console.error('\n❌', err.message)
  process.exit(1)
})
