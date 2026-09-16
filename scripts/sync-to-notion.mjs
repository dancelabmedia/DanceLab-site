/**
 * scripts/sync-to-notion.mjs
 * Envoie tous les articles générés dans la base Notion "📰 Magazine — Articles"
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = path.resolve(__dirname, '..')
const ARTICLES_DIR = path.join(PROJECT_ROOT, 'data', 'podcast-articles')

// Charge .env.local
function loadEnv() {
  const envPath = path.join(PROJECT_ROOT, '.env.local')
  if (!fs.existsSync(envPath)) return
  for (const line of fs.readFileSync(envPath, 'utf-8').split('\n')) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const eq = t.indexOf('=')
    if (eq === -1) continue
    const key = t.slice(0, eq).trim()
    const val = t.slice(eq + 1).trim().replace(/^["']|["']$/g, '')
    if (!process.env[key]) process.env[key] = val
  }
}
loadEnv()

const NOTION_TOKEN = process.env.NOTION_TOKEN
const DATABASE_ID = 'a1bb5381-a584-4727-9fae-19cb63324620'

if (!NOTION_TOKEN) {
  console.error('❌ NOTION_TOKEN manquant dans .env.local')
  process.exit(1)
}

const HEADERS = {
  'Authorization': `Bearer ${NOTION_TOKEN}`,
  'Content-Type': 'application/json',
  'Notion-Version': '2022-06-28',
}

const STATUS_MAP = {
  brouillon: '🔘 Brouillon',
  a_valider: '🔍 À valider',
  valide: '✅ Validé',
  programme: '📅 Programmé',
  publie: '🟢 Publié',
}

async function episodeExistsInNotion(episodeNumber) {
  const res = await fetch(`https://api.notion.com/v1/databases/${DATABASE_ID}/query`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({
      filter: { property: 'Épisode N°', number: { equals: episodeNumber } }
    }),
  })
  const data = await res.json()
  return data.results?.length > 0 ? data.results[0].id : null
}

async function createNotionPage(episodeFile) {
  const { article, episodeNumber, episodeSlug, status, generatedAt, scheduledFor, publishedAt } = episodeFile

  const pubDate = publishedAt ?? scheduledFor
  const statut = STATUS_MAP[status] ?? '🔘 Brouillon'

  // Construit le corps de l'article comme texte
  const bodyLines = []
  bodyLines.push(`**Chapô :** ${article.chapo}`)
  bodyLines.push('')

  for (const section of (article.sections ?? [])) {
    if (section.heading) bodyLines.push(`## ${section.heading}`)
    for (const p of (section.paragraphs ?? [])) {
      bodyLines.push(p.replace(/<[^>]+>/g, ''))
      bodyLines.push('')
    }
  }

  if (article.conclusion) {
    const conclusion = Array.isArray(article.conclusion) ? article.conclusion : [article.conclusion]
    bodyLines.push('---')
    bodyLines.push('')
    for (const p of conclusion) {
      bodyLines.push(p)
      bodyLines.push('')
    }
  }

  const bodyText = bodyLines.join('\n').slice(0, 1900) // limite Notion

  const properties = {
    'Titre': { title: [{ text: { content: article.title ?? `Épisode #${episodeNumber}` } }] },
    'Statut': { select: { name: statut } },
    'Épisode N°': { number: episodeNumber },
    'Slug': { rich_text: [{ text: { content: article.slug ?? '' } }] },
    'Généré le': { date: { start: generatedAt?.split('T')[0] ?? new Date().toISOString().split('T')[0] } },
    'Tags': { rich_text: [{ text: { content: (article.tags ?? []).join(', ') } }] },
  }

  if (article.guest) {
    properties['Invité·e'] = { rich_text: [{ text: { content: article.guest } }] }
  }
  if (article.category) {
    // Map vers les catégories Notion
    const catMap = {
      'Portrait': 'Portrait', 'Décryptage': 'Décryptage', 'Pratique': 'Pratique',
      'Parcours': 'Parcours', 'Réflexion': 'Réflexion',
      'Technique': 'Portrait', 'Carrière': 'Parcours', 'Mindset': 'Réflexion',
      'Culture': 'Décryptage',
    }
    const cat = catMap[article.category] ?? 'Portrait'
    properties['Catégorie'] = { select: { name: cat } }
  }
  if (article.metaDescription) {
    properties['Meta description'] = { rich_text: [{ text: { content: article.metaDescription.slice(0, 2000) } }] }
  }
  if (pubDate) {
    properties['Date de publication'] = { date: { start: pubDate.split('T')[0] } }
  }
  if (episodeSlug) {
    properties['Lien épisode'] = { url: `https://dancelab.fr/episodes/${episodeSlug}` }
  }

  const body = {
    parent: { database_id: DATABASE_ID },
    properties,
    children: [
      {
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [{ type: 'text', text: { content: bodyText } }]
        }
      }
    ]
  }

  if (article.image) {
    body['cover'] = { type: 'external', external: { url: article.image } }
  }

  const res = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Notion API ${res.status}: ${err}`)
  }

  return await res.json()
}

async function main() {
  console.log('\n📔 Synchronisation vers Notion — Dance Lab Magazine\n')

  const files = fs.readdirSync(ARTICLES_DIR)
    .filter(f => f.startsWith('ep-') && f.endsWith('.json'))
    .sort((a, b) => {
      const numA = parseInt(a.replace('ep-', '').replace('.json', ''))
      const numB = parseInt(b.replace('ep-', '').replace('.json', ''))
      return numA - numB
    })

  console.log(`📁 ${files.length} articles trouvés\n`)

  let created = 0, skipped = 0, failed = 0

  for (const file of files) {
    const filePath = path.join(ARTICLES_DIR, file)
    let episodeFile
    try {
      episodeFile = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    } catch {
      console.log(`⚠️  ${file} — JSON invalide, ignoré`)
      failed++
      continue
    }

    const epNum = episodeFile.episodeNumber
    process.stdout.write(`⏳ Épisode #${epNum} (${episodeFile.article?.guest ?? '?'})… `)

    try {
      // Vérifie si déjà dans Notion
      const existing = await episodeExistsInNotion(epNum)
      if (existing) {
        console.log(`⏭  déjà présent`)
        skipped++
      } else {
        await createNotionPage(episodeFile)
        console.log(`✅`)
        created++
      }
    } catch (err) {
      console.log(`❌ ${err.message?.slice(0, 80)}`)
      failed++
    }

    // Petite pause pour éviter le rate limiting Notion
    await new Promise(r => setTimeout(r, 350))
  }

  console.log('\n' + '─'.repeat(50))
  console.log(`📊 Résumé : ${created} créés, ${skipped} déjà présents, ${failed} échecs`)
  console.log('\n👉 Ouvre Notion → Dance Lab, Le média → 📰 Magazine — Articles\n')
}

main().catch(err => {
  console.error('\n❌ Erreur inattendue :', err)
  process.exit(1)
})
