/** Read-only by default. --apply-verified merges only the explicitly verified rule groups. */
import { loadEnvConfig } from '@next/env'
import fs from 'node:fs/promises'
import path from 'node:path'
import { agendaEvents } from '../app/agenda/agenda-data'
import { getCollectedAgendaEvents } from '../app/agenda/collected-events'
import { cabaretEvents } from '../app/agenda/cabaret-events'
import { showsEvents } from '../app/agenda/shows-events'
import { deduplicateEvents, compareEventProgramming, normalizeEventText } from '../lib/event-deduplication.mjs'
import rules from '../data/event-canonicalizations.json'
import { NotionAgendaClient, notionAgendaEvent, propertyText } from './lib/notion-agenda'

loadEnvConfig(process.cwd(), false, { info() {}, error() {} })

async function main() {
  const client = new NotionAgendaClient()
  const pages = await client.pages()
  const notion = pages.map(notionAgendaEvent)
  const local = [...agendaEvents, ...getCollectedAgendaEvents('0000-01-01'), ...cabaretEvents, ...showsEvents]
  const result = deduplicateEvents([...local, ...notion], { rules })
  const review: unknown[] = []
  for (let i = 0; i < notion.length; i++) for (let j = i + 1; j < notion.length; j++) {
    const a = notion[i], b = notion[j]
    const title = (s: string) => normalizeEventText(s.split(/\s[—–-]\s/)[0])
    if (!title(a.title) || title(a.title) !== title(b.title)) continue
    const decision = compareEventProgramming(a, b)
    if (!decision.match) review.push({ titles: [a.title, b.title], ids: [pages[i].id, pages[j].id], reason: decision.reason, venues: [a.venue, b.venue], dates: [[a.startDate, a.endDate], [b.startDate, b.endDate]] })
  }
  const report = {
    generatedAt: new Date().toISOString(), notionPages: pages.length, localRecords: local.length,
    recordsChecked: local.length + pages.length, consolidatedRecords: result.events.length,
    groups: result.groups, review,
  }
  await fs.writeFile(path.join(process.cwd(), 'data/event-duplicate-audit.json'), JSON.stringify(report, null, 2) + '\n')
  console.log(JSON.stringify({ notionPages: pages.length, localRecords: local.length, groups: result.groups.length, review: review.length, merged: report.recordsChecked - report.consolidatedRecords }))
  console.log(JSON.stringify(result.groups.map(g => ({ title: g.title, slug: g.slug, count: g.members.length, members: g.members.map(m => ({ title: m.title, sourceIds: m.sourceIds, venue: m.venue, start: m.startDate, end: m.endDate })) })), null, 2))

  if (!process.argv.includes('--apply-verified')) return
  const actions: Array<{ retained: string; archived: string[] }> = []
  const backupRoot = path.join(process.cwd(), '.local/event-deduplication', new Date().toISOString().replace(/[:.]/g, '-'))
  await fs.mkdir(backupRoot, { recursive: true })
  await fs.writeFile(path.join(backupRoot, 'notion-before.json'), JSON.stringify(pages, null, 2))
  await client.ensureIdentityFields()
  for (const rule of rules) {
    const ids = rule.event.sourceIds.filter(id => id.startsWith('notion:')).map(id => id.slice(7))
    const originals = pages.filter(page => ids.includes(page.id))
    const canonical = pages.find(page => page.id === rule.notionCanonicalId)
    if (!canonical) throw new Error(`Fiche conservée absente : ${rule.notionCanonicalId}`)
    const event = result.events.find(event => event.slug === rule.event.slug) || rule.event
    const blocks = await Promise.all(originals.map(async page => ({ id: page.id, blocks: await client.blocks(page.id) })))
    await fs.writeFile(path.join(backupRoot, `${rule.key}-blocks.json`), JSON.stringify(blocks, null, 2))
    const notes = [...new Set(originals.map(page => propertyText(page.properties.Notes)).filter(Boolean))].join('\n\n')
    const properties = client.eventProperties(event)
    if (notes) properties.Notes = { rich_text: (notes.match(/[\s\S]{1,1800}/g) || []).map(content => ({ text: { content } })) }
    await client.request(`pages/${canonical.id}`, 'PATCH', { properties })
    // Verify the retained page before archiving any copy. Archived pages remain recoverable.
    const saved = await client.request(`pages/${canonical.id}`)
    if (notionAgendaEvent(saved).title !== rule.event.title) throw new Error('Vérification du titre échouée')
    for (const page of originals.filter(page => page.id !== canonical.id)) await client.request(`pages/${page.id}`, 'PATCH', { archived: true })
    actions.push({ retained: canonical.id, archived: originals.filter(page => page.id !== canonical.id).map(page => page.id) })
    console.log(JSON.stringify({ retained: canonical.id, archived: originals.filter(page => page.id !== canonical.id).map(page => page.id), backupRoot }))
  }
  const afterPages = await client.pages()
  const afterEvents = afterPages.map(notionAgendaEvent)
  const resync = deduplicateEvents([...afterEvents, ...notion], { rules }).events
  const verification = rules.map(rule => ({
    slug: rule.event.slug,
    activeSourcePages: afterEvents.filter(event => rule.event.sourceIds.some(id => event.sourceIds?.includes(id))).length,
    afterReimport: resync.filter(event => event.slug === rule.event.slug).length,
    performances: afterEvents.find(event => event.canonicalSourceId === `notion:${rule.notionCanonicalId}`)?.performances,
  }))
  if (verification.some(result => result.activeSourcePages !== 1 || result.afterReimport !== 1 || result.performances?.length !== 3)) throw new Error('La vérification après fusion a échoué')
  await fs.writeFile(path.join(process.cwd(), 'data/event-duplicate-audit.json'), JSON.stringify({ ...report, actions, verification, activeNotionPagesAfter: afterPages.length, backupRoot }, null, 2) + '\n')
  console.log(JSON.stringify({ verification, activeNotionPagesAfter: afterPages.length }))
}

main().catch(error => { console.error(error.message); process.exitCode = 1 })
