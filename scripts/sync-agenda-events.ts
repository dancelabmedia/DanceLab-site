/** Import a collected/validated JSON feed. Dry-run by default; --apply persists the plan. */
import { loadEnvConfig } from '@next/env'
import fs from 'node:fs/promises'
import path from 'node:path'
import rules from '../data/event-canonicalizations.json'
import { deduplicateEvents, planEventUpserts } from '../lib/event-deduplication.mjs'
import { NotionAgendaClient, notionAgendaEvent } from './lib/notion-agenda'
import { applyEventDisciplines } from '../lib/event-disciplines.mjs'

loadEnvConfig(process.cwd(), false, { info() {}, error() {} })

async function main() {
  const args = process.argv.slice(2)
  const inputPath = args[args.indexOf('--input') + 1]
  if (!args.includes('--input') || !inputPath) throw new Error('Usage : npm run sync:events -- --input fichier.json [--apply]')
  const input = JSON.parse(await fs.readFile(inputPath, 'utf8'))
  const incoming = (Array.isArray(input) ? input : input.events).filter((event: any) => !event.needsReview).map((event: any) => ({
    ...event,
    slug: event.slug || `${String(event.title).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}-${event.startDate}`,
  }))
  const client = new NotionAgendaClient()
  // Always read the live database immediately before the import, not a stale title index.
  const pages = await client.pages()
  const existing = pages.map(notionAgendaEvent).map(applyEventDisciplines)
  const plan = planEventUpserts(existing, incoming, { rules })
  console.log(JSON.stringify({ create: plan.create.length, update: plan.update.length, review: plan.review.map(item => ({ title: item.event.title, reason: item.reason })) }, null, 2))
  if (!args.includes('--apply')) return
  const backupRoot = path.join(process.cwd(), '.local/event-deduplication', `import-${Date.now()}`)
  await fs.mkdir(backupRoot, { recursive: true })
  await fs.writeFile(path.join(backupRoot, 'before.json'), JSON.stringify({ pages, incoming }, null, 2))
  await client.ensureIdentityFields()
  for (const rawEvent of plan.update) {
    const event = applyEventDisciplines(rawEvent)
    const pageId = (event.canonicalSourceId || event.sourceIds?.find(id => id.startsWith('notion:')))?.slice(7)
    if (!pageId) throw new Error(`Identifiant Notion manquant pour ${event.title}`)
    await client.request(`pages/${pageId}`, 'PATCH', { properties: client.eventProperties(event) })
  }
  for (const rawEvent of deduplicateEvents(plan.create, { rules }).events) {
    const event = applyEventDisciplines(rawEvent)
    await client.request('pages', 'POST', { parent: { type: 'data_source_id', data_source_id: client.dataSource.id }, properties: client.eventProperties(event) })
  }
}

main().catch(error => { console.error(error.message); process.exitCode = 1 })
