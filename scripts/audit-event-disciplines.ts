import { loadEnvConfig } from '@next/env'
import fs from 'node:fs/promises'
import { agendaEvents } from '../app/agenda/agenda-data'
import { getCollectedAgendaEvents } from '../app/agenda/collected-events'
import { cabaretEvents } from '../app/agenda/cabaret-events'
import { showsEvents } from '../app/agenda/shows-events'
import { NotionAgendaClient, notionAgendaEvent } from './lib/notion-agenda'
import { classifyEventDisciplines, applyEventDisciplines } from '../lib/event-disciplines.mjs'

loadEnvConfig(process.cwd(), false, { info() {}, error() {} })
async function main() {
  const client = new NotionAgendaClient()
  const pages = await client.pages()
  const local = [...agendaEvents, ...getCollectedAgendaEvents('0000-01-01'), ...cabaretEvents, ...showsEvents]
  const events = [...pages.map(notionAgendaEvent), ...local]
  const records = events.map(event => {
    const result = classifyEventDisciplines(event)
    return { title: event.title, slug: event.slug, sourceId: event.canonicalSourceId, source: event.officialUrl, before: event.disciplines || [], ...result, changed: JSON.stringify(event.disciplines || []) !== JSON.stringify(result.disciplines) }
  })
  const report = { generatedAt: new Date().toISOString(), recordsChecked: records.length, notionPages: pages.length, localRecords: local.length, changed: records.filter(item => item.changed).length, verified: records.filter(item => item.status === 'verified').length, needsReview: records.filter(item => item.status !== 'verified').length, records }
  await fs.writeFile('data/event-discipline-audit.json', JSON.stringify(report, null, 2) + '\n')
  console.log(JSON.stringify({ ...report, records: undefined }))
  if (!process.argv.includes('--apply-verified')) return
  // Only persist sourced editorial locks. No speculative mass rewriting of Notion.
  const directory = `.local/event-deduplication/disciplines-${Date.now()}`
  await fs.mkdir(directory, { recursive: true })
  await fs.writeFile(`${directory}/before.json`, JSON.stringify(pages, null, 2))
  let updated = 0
  for (const page of pages) {
    const event = notionAgendaEvent(page)
    if (!classifyEventDisciplines(event).locked) continue
    const properties = client.eventProperties(applyEventDisciplines(event))
    const names = ['Disciplines', 'Discipline', 'Styles', 'Style']
    const patch = Object.fromEntries(Object.entries(properties).filter(([key]) => names.includes(key)))
    if (!Object.keys(patch).length) throw new Error('Champ de discipline compatible introuvable dans Notion')
    await client.request(`pages/${page.id}`, 'PATCH', { properties: patch })
    updated++
  }
  console.log(JSON.stringify({ verifiedNotionPagesUpdated: updated, backup: directory }))
}
main().catch(error => { console.error(error.message); process.exitCode = 1 })
