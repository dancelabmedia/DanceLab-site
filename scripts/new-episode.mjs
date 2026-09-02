#!/usr/bin/env node
/**
 * scripts/new-episode.mjs
 *
 * Outil de diagnostic et de préparation des données pour un nouvel épisode.
 * À lancer manuellement après publication d'un épisode sur Ausha et YouTube.
 *
 * Usage :
 *   node scripts/new-episode.mjs          → analyse le dernier épisode
 *   node scripts/new-episode.mjs 127      → analyse l'épisode 127
 *
 * Ce que fait le script :
 *   1. Lit le flux RSS Ausha et trouve l'épisode (+ son extrait)
 *   2. Lit le flux Atom YouTube et cherche la vidéo correspondante
 *   3. Affiche la citation extraite du titre de l'extrait
 *   4. Génère l'entrée à coller dans data/episode-extras.ts
 */

const RSS_URL = 'https://feed.ausha.co/yvVqGgCrEkqK'
const YOUTUBE_FEED_URL =
  'https://www.youtube.com/feeds/videos.xml?channel_id=UCzTqgBJF9aI66DxFyhPLdTA'

// ─── Helpers XML ──────────────────────────────────────────────────────────────

function extractTag(xml, tag) {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i')
  return xml.match(re)?.[1]?.trim() ?? ''
}

function extractAttr(xml, tag, attr) {
  const re = new RegExp(`<${tag}[^>]*\\s${attr}="([^"]*)"`, 'i')
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

// ─── Fetch Ausha RSS ───────────────────────────────────────────────────────────

async function fetchAushaEpisode(targetNumber) {
  console.log('📡 Récupération du flux RSS Ausha...')
  const res = await fetch(RSS_URL)
  if (!res.ok) throw new Error(`Flux Ausha inaccessible (${res.status})`)

  const xml = await res.text()
  const items = xml.match(/<item>[\s\S]*?<\/item>/g) ?? []

  const episodes = []
  const extraits = []

  for (const item of items) {
    const rawTitle = extractTag(item, 'title')
    const parsed = parseAushaTitle(rawTitle)
    if (parsed.number === 0) continue
    if (parsed.isExtrait) extraits.push(parsed)
    else episodes.push(parsed)
  }

  // Tri par numéro décroissant
  episodes.sort((a, b) => b.number - a.number)

  const number = targetNumber ?? episodes[0]?.number
  if (!number) throw new Error('Aucun épisode trouvé dans le flux.')

  const episode = episodes.find((e) => e.number === number)
  const extrait = extraits.find((e) => e.number === number)

  return { episode, extrait, latestNumber: episodes[0]?.number }
}

// ─── Fetch YouTube ─────────────────────────────────────────────────────────────

async function fetchYoutubeVideo(targetNumber) {
  console.log('🎬 Récupération du flux YouTube (15 dernières vidéos)...')
  try {
    const res = await fetch(YOUTUBE_FEED_URL)
    if (!res.ok) {
      console.warn(`  ⚠️  Flux YouTube inaccessible (${res.status})`)
      return null
    }

    const xml = await res.text()
    const entries = xml.match(/<entry>[\s\S]*?<\/entry>/g) ?? []

    for (const entry of entries) {
      const videoId = extractTag(entry, 'yt:videoId')
      const title = extractTag(entry, 'title')
      const { episodeNumber, isShort } = parseYoutubeTitle(title)

      if (episodeNumber === targetNumber && !isShort) {
        return { videoId, title }
      }
    }

    console.warn(
      `  ⚠️  Épisode ${targetNumber} non trouvé dans les 15 dernières vidéos YouTube.`
    )
    console.warn(
      `     → Cherche manuellement sur https://www.youtube.com/@maiwennbramoulle/videos`
    )
    console.warn(
      `       puis ajoute youtubeId dans data/episode-extras.ts`
    )
    return null
  } catch (err) {
    console.warn('  ⚠️  Erreur YouTube :', err.message)
    return null
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const arg = process.argv[2]
  const targetNumber = arg ? parseInt(arg, 10) : null

  if (arg && isNaN(targetNumber)) {
    console.error('❌ Argument invalide. Usage: node scripts/new-episode.mjs [numéro]')
    process.exit(1)
  }

  const { episode, extrait, latestNumber } = await fetchAushaEpisode(targetNumber)
  const number = targetNumber ?? latestNumber

  console.log('\n' + '═'.repeat(60))
  console.log(`🎙  ÉPISODE ${number}`)
  console.log('═'.repeat(60))

  if (!episode) {
    console.log(`❌ Épisode ${number} non trouvé dans le flux Ausha.`)
    console.log('   (Les épisodes 1–121 sont dans data/episodes-list.ts, pas dans le RSS.)')
    process.exit(0)
  }

  console.log(`\n📝 Titre   : ${episode.title}`)
  console.log(`👤 Invité  : ${episode.guest}`)

  // Citation depuis l'extrait
  const quote = extrait?.title ?? ''
  if (quote) {
    console.log(`\n💬 Citation extraite de l'extrait Ausha :`)
    console.log(`   "${quote}"`)
  } else {
    console.log('\n⚠️  Aucun extrait trouvé pour cet épisode dans le flux.')
    console.log('   → Ajoute une citation manuellement dans data/episode-extras.ts')
  }

  // YouTube
  const yt = await fetchYoutubeVideo(number)
  if (yt) {
    console.log(`\n▶️  Vidéo YouTube trouvée automatiquement :`)
    console.log(`   Titre   : ${yt.title}`)
    console.log(`   ID      : ${yt.videoId}`)
    console.log(`   URL     : https://www.youtube.com/watch?v=${yt.videoId}`)
  }

  // Génération de l'entrée episode-extras
  console.log('\n' + '─'.repeat(60))
  console.log('📋 Entrée à ajouter dans data/episode-extras.ts :')
  console.log('─'.repeat(60))

  const lines = [`  ${number}: {`]
  if (quote) lines.push(`    quote:     "${quote}",`)
  else        lines.push(`    quote:     "", // ← à remplir manuellement`)
  if (yt)    lines.push(`    youtubeId: "${yt.videoId}",`)
  else       lines.push(`    youtubeId: "", // ← à remplir après publication YouTube`)
  lines.push(`  },`)

  console.log(lines.join('\n'))
  console.log('─'.repeat(60))

  if (!quote && !yt) {
    console.log('\n⚠️  Les deux champs sont manquants — vérifie que l\'épisode est bien publié.')
  } else if (!quote) {
    console.log('\n⚠️  Citation manquante — vérifie que l\'extrait est publié sur Ausha.')
  } else if (!yt) {
    console.log('\n⚠️  YouTube manquant — la vidéo n\'est pas encore publiée ou dépasse les 15 dernières.')
  } else {
    console.log('\n✅ Tout est prêt ! Colle l\'entrée ci-dessus dans data/episode-extras.ts')
    console.log('   puis pousse sur GitHub pour déclencher le déploiement Vercel.')
  }

  console.log()
}

main().catch((err) => {
  console.error('❌', err.message)
  process.exit(1)
})
