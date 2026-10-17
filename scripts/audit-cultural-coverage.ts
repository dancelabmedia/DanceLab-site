/** Read-only source crawl. Produces review candidates; never publishes scraped guesses. */
import { loadEnvConfig } from '@next/env'
import fs from 'node:fs/promises'
import crypto from 'node:crypto'
import { culturalVenuesIdf } from '../data/cultural-venues-idf'
import { getInitialAgendaEvents } from '../app/agenda/initial-events'
import { NotionAgendaClient, notionAgendaEvent } from './lib/notion-agenda'
import { compareEventProgramming, deduplicateEvents } from '../lib/event-deduplication.mjs'
import { classifyEventDisciplines } from '../lib/event-disciplines.mjs'
import verifiedEvents from '../data/cultural-coverage-verified.json'
import importLedger from '../data/cultural-coverage-imports.json'
import discoverySources from '../data/cultural-discovery-sources.json'

loadEnvConfig(process.cwd(), false, { info() {}, error() {} })
const norm = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
const clean = (s: unknown) => String(s || '').replace(/<[^>]*>/g, ' ').replace(/&amp;/g, '&').replace(/&#039;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim()
const args = process.argv.slice(2)
const limit = Math.max(1, Math.min(60, Number(args.find(s => s.startsWith('--pages='))?.split('=')[1] || 8)))
const filter = args.find(s => s.startsWith('--venue='))?.slice(8)
const today = new Date().toISOString().slice(0, 10)
const practiceOnly = (title: string) => /^(?:atelier|cours|stage|workshop|masterclass)\b/i.test(norm(title))
const output = 'data/cultural-coverage-idf.json'
const host = (s: string) => new URL(s).hostname.replace(/^www\./, '')
const crawlable = (url: string) => /^https:\/\//.test(url) && !/\.(?:jpg|jpeg|png|svg|webp|zip|mp4|mp3|woff2?)(?:\?|$)/i.test(url)

async function fetchPage(url: string) {
  const response = await fetch(url, { signal: AbortSignal.timeout(12000), headers: { 'User-Agent': 'DanceLabCoverageAudit/1.0 (+https://dancelab.fr)', Accept: 'text/html,application/ld+json,application/pdf' } })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const type = response.headers.get('content-type') || ''
  if (type.includes('pdf')) return { url: response.url, html: '', pdf: true }
  if (!/html|json|text/.test(type)) throw new Error(`Format non analysé: ${type}`)
  const html = await response.text()
  if (html.length > 4_000_000) throw new Error('Page trop volumineuse')
  return { url: response.url, html, pdf: false }
}

export function structuredEvents(html: string): any[] {
  const events: any[] = []
  const walk = (node: any) => {
    if (!node || typeof node !== 'object') return
    if (Array.isArray(node)) { node.forEach(walk); return }
    if ([node['@type']].flat().some(type => /^(?:Event|DanceEvent|TheaterEvent|Festival|MusicEvent|ScreeningEvent|SocialEvent)$/.test(type))) events.push(node)
    Object.values(node).forEach(walk)
  }
  for (const match of html.matchAll(/<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try { walk(JSON.parse(match[1])) } catch { /* Unparseable sources are recorded, never guessed. */ }
  }
  return events
}

export function pageLinks(html: string, base: string) {
  const found = new Map<string, { url: string; text: string; priority: number }>()
  for (const match of html.matchAll(/<a\b[^>]*href\s*=\s*["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    try {
      const url = new URL(match[1].replace(/&amp;/g, '&'), base)
      url.hash = ''
      if (host(url.href) !== host(base) || !crawlable(url.href)) continue
      const text = clean(match[2])
      const searchable = norm(`${url.pathname} ${text}`)
      if (/connexion|login|panier|privacy|confidentialite|mentions legales|cookies|facebook|instagram/.test(searchable)) continue
      const priority = /danse|ballet|choregr|hip hop|electro|battle|cabaret/.test(searchable) ? 3 : /2026|2027|saison|programme|spectacle|manifestation|agenda|calendrier|festival/.test(searchable) ? 2 : 0
      if (priority) found.set(url.href, { url: url.href, text, priority })
    } catch { /* Invalid/non-web links ignored. */ }
  }
  return [...found.values()].sort((a, b) => b.priority - a.priority)
}

async function robotRules(base: string) {
  try {
    const response = await fetch(new URL('/robots.txt', base), { signal: AbortSignal.timeout(8000) })
    if (!response.ok) return []
    const lines = (await response.text()).split('\n')
    let applies = false
    const deny: string[] = []
    for (const line of lines) {
      const value = line.replace(/#.*/, '').trim()
      if (/^user-agent:/i.test(value)) applies = /:\s*(\*|DanceLabCoverageAudit)\s*$/i.test(value)
      if (applies && /^disallow:/i.test(value)) {
        const path = value.slice(value.indexOf(':') + 1).trim()
        if (path) deny.push(path)
      }
    }
    return deny
  } catch { throw new Error('robots.txt inaccessible : collecte différée par prudence') }
}

async function main() {
  const client = new NotionAgendaClient()
  // An unavailable catalogue must not be mistaken for an empty catalogue.
  const existing = deduplicateEvents([...getInitialAgendaEvents('0000-01-01'), ...(await client.pages()).map(notionAgendaEvent)]).events
  let previous: any = { venues: [] }
  try { previous = JSON.parse(await fs.readFile(output, 'utf8')) } catch {}
  const rows: any[] = []
  const candidates: any[] = []
  const discovery: any[] = []
  const jobs = culturalVenuesIdf.filter(row => !filter || filter.split(',').some(name => norm(row[0]).includes(norm(name))))
  let next = 0
  async function worker() {
    while (next < jobs.length) {
      const [name, city, start, aliases] = jobs[next++]
      const names = [name, ...aliases.split('|').filter(s => !s.includes('CONFIRMER'))].map(norm)
      const present = existing.filter((e: any) => names.some(alias => alias.length > 3 && norm(e.venue || '').includes(alias)) && norm(e.city || '') === norm(city))
      const row: any = { name, city, source: start || null, checkedAt: new Date().toISOString(), monitored: !!start, status: 'incomplete', existingEvents: present.length, existingSlugs: present.map((e: any) => e.slug), pages: [], detected: [], added: 0, excluded: [], failures: [], pendingPages: [], changes: [] }
      if (!start) { row.status = 'venue-identity-unconfirmed'; row.failures.push('Nom et site officiel à confirmer, aucune assimilation automatique à un théâtre homonyme.'); rows.push(row); continue }
      const lastRun = previous.venues?.find((v: any) => v.name === name)
      const continuation = lastRun?.pendingPages || []
      const historical = new Set<string>(continuation.length ? (lastRun?.pages || []).map((p: any) => p.url) : [])
      const queue = [...new Set([start, ...continuation])]
      const seen = new Set<string>()
      let deny: string[] = []
      try { deny = await robotRules(start) } catch (error: any) { row.failures.push(error.message); rows.push(row); continue }
      while (queue.length && seen.size < limit) {
        const url = queue.shift()!
        if (seen.has(url)) continue
        seen.add(url)
        const blocked = deny.some(rule => new RegExp('^' + rule.split('*').map(s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('.*').replace(/\\\$$/, '$')).test(new URL(url).pathname))
        if (blocked) { row.excluded.push({ url, reason: 'robots.txt' }); continue }
        try {
          const page = await fetchPage(url)
          if (host(page.url) !== host(start)) { row.failures.push({ url, reason: 'Redirection vers un autre domaine : identité à vérifier', destination: page.url }); continue }
          const digest = crypto.createHash('sha256').update(page.html).digest('hex')
          const old = previous.venues?.find((v: any) => v.name === name)?.pages?.find((p: any) => p.url === url)
          if (old && old.digest !== digest) row.changes.push({ url, reason: 'source-content-changed-review-required' })
          row.pages.push({ url, finalUrl: page.url, checkedAt: new Date().toISOString(), title: clean(page.html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]), digest, pdfNeedsReview: page.pdf })
          for (const link of pageLinks(page.html, page.url)) if (!seen.has(link.url) && !historical.has(link.url) && !queue.includes(link.url)) queue.push(link.url)
          for (const match of page.html.matchAll(/<a\b[^>]*href=["'](https?:\/\/[^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
            const label = clean(match[2])
            if (label.length > 8 && /theatre|scene nationale|centre choregraphique|festival|CDCN/.test(norm(label)) && host(match[1]) !== host(start)) discovery.push({ name: label.slice(0, 150), url: match[1], discoveredOn: url, status: 'unverified-venue-candidate' })
          }
          for (const event of structuredEvents(page.html)) {
            const title = clean(event.name)
            const description = clean(event.description)
            if (practiceOnly(title)) { row.excluded.push({ title, url, reason: 'Pratique / enseignement : à examiner pour Explorer Écoles de danse, pas pour Sortir' }); continue }
            const text = norm(`${title} ${description}`)
            if (!/danse|ballet|choregr|hip hop|breakdance|breaking|electro dance|cabaret|comedie musicale|revue/.test(text)) { row.excluded.push({ title, url, reason: 'No direct dance evidence in published event text' }); continue }
            if (/EventCancelled$/.test(event.eventStatus || '')) { row.excluded.push({ title, url, reason: 'Cancellation published by source; existing record requires verification' }); continue }
            const startDate = String(event.startDate || '').slice(0, 10)
            const endDate = String(event.endDate || startDate).slice(0, 10)
            if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate)) { row.excluded.push({ title, url, reason: 'No reliable published start date' }); continue }
            if (endDate < today) { row.excluded.push({ title, url, reason: 'Past performance' }); continue }
            const location = Array.isArray(event.location) ? event.location[0] : event.location
            const address = location?.address
            const venue = clean(location?.name)
            const eventCity = clean(address?.addressLocality)
            const image = typeof event.image === 'string' ? event.image : event.image?.url || event.image?.[0]?.url || event.image?.[0]
            const offer = Array.isArray(event.offers) ? event.offers[0] : event.offers
            const candidate: any = { title, description: description.slice(0, 650), startDate, endDate, dates: `${startDate} / ${endDate}`, venue, city: eventCity, address: clean(address?.streetAddress), postalCode: clean(address?.postalCode), image: typeof image === 'string' ? image : undefined, officialUrl: typeof event.url === 'string' ? event.url : url, ticketUrl: offer?.url, price: offer?.price != null ? `${offer.price} ${offer.priceCurrency || ''}`.trim() : '', category: 'Spectacle', disciplines: [], source: host(start), sourceLabel: name, lastVerifiedAt: today, status: 'À venir', needsReview: true, sourceIds: [`official:${typeof event.url === 'string' ? event.url : url}#${startDate}#${norm(title)}`] }
            const match = existing.find((other: any) => compareEventProgramming(other, candidate).match)
            const result = { title, url: candidate.officialUrl, startDate, endDate, venue, city: eventCity, alreadyPresent: match?.slug || null, needsReview: true, missing: ['venue', 'city', 'address', 'image', 'ticketUrl', 'price'].filter(field => !candidate[field]), discipline: classifyEventDisciplines(candidate), rawEventType: event['@type'] }
            if (!row.detected.some((e: any) => e.title === title && e.startDate === startDate && e.venue === venue)) { row.detected.push(result); candidates.push(candidate) }
          }
        } catch (error: any) { row.failures.push({ url, reason: error.message }) }
      }
      row.pendingPages = queue.filter(url => !seen.has(url))
      row.pagesThisRun = row.pages.length
      row.pages = [...new Map([...(lastRun?.pages || []), ...row.pages].map((page: any) => [page.url, page])).values()]
      row.detected = [...new Map([...(lastRun?.detected || []), ...row.detected].map((item: any) => [`${item.url}|${item.startDate}|${item.venue}`, item])).values()]
      row.status = row.pages.length ? 'partially-explored-not-certified-complete' : 'source-unavailable'
      row.detectedRelevant = row.detected.length
      row.detectedAlreadyPresent = row.detected.filter((e: any) => e.alreadyPresent).length
      row.notImported = row.detected.length - row.detectedAlreadyPresent
      rows.push(row)
      console.log(`${name}: ${row.pages.length} pages, ${row.detected.length} candidats, ${row.failures.length} erreurs, couverture partielle`)
    }
  }
  await Promise.all(Array.from({ length: 4 }, worker))
  const merged = [...(previous.venues || []).filter((row: any) => !rows.some(item => item.name === row.name)), ...rows].sort((a, b) => a.name.localeCompare(b.name, 'fr'))
  for (const row of merged) {
    const registryEntry = culturalVenuesIdf.find(entry => entry[0] === row.name)
    const venueNames = [row.name, ...(registryEntry?.[3].split('|') || [])].map(norm).filter(name => name.length > 4)
    const belongsHere = (event: { venue: string; city?: string }) => (!event.city || norm(event.city) === norm(row.city)) && venueNames.some(name => norm(event.venue).includes(name))
    const practice = row.detected.filter((item: any) => practiceOnly(item.title))
    row.excluded.push(...practice.map((item: any) => ({ title: item.title, url: item.url, reason: 'Pratique / enseignement : exclu de Sortir, à examiner pour Explorer Écoles de danse' })))
    row.detected = row.detected.filter((item: any) => !practiceOnly(item.title))
    for (const event of verifiedEvents.filter(belongsHere)) {
      const match = existing.find((other: any) => compareEventProgramming(other, event).match)
      // A verified programming replaces its separate JSON-LD performances in the report,
      // without merging tour stops published for other cities on the same URL.
      row.detected = row.detected.filter((item: any) => item.url !== event.officialUrl || (item.city && norm(item.city) !== norm(event.city)))
      row.detected.push({ title: event.title, url: event.officialUrl, startDate: event.startDate, endDate: event.endDate, venue: event.venue, city: event.city, alreadyPresent: match?.slug || null, editoriallyVerified: true, needsReview: false, ...('performances' in event ? { performances: event.performances } : {}), missing: event.title.includes('Junior Ballet') ? ['programme détaillé non publié', 'distribution nominative non publiée'] : [] })
    }
    row.added = importLedger.filter(item => item.action === 'create' && belongsHere(item)).length
    row.detectedRelevant = row.detected.length
    row.detectedAlreadyPresent = row.detected.filter((item: any) => item.alreadyPresent).length
    row.notImported = row.detectedRelevant - row.detectedAlreadyPresent
  }
  const discoveryChecks: any[] = []
  for (const source of discoverySources) {
    try {
      const denied = await robotRules(source.url)
      if (denied.includes('/')) { discoveryChecks.push({ ...source, checkedAt: new Date().toISOString(), error: 'robots.txt' }); continue }
      const page = await fetchPage(source.url)
      for (const match of page.html.matchAll(/<a\b[^>]*href=["'](https?:\/\/[^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
        const label = clean(match[2])
        if (host(match[1]) !== host(source.url) && /theatre|scene|choregr|CDCN|danse|spectacle|site (?:internet|web)/i.test(label)) discovery.push({ name: label.slice(0, 150), url: match[1], discoveredOn: source.url, status: 'unverified-venue-candidate', region: 'to-verify' })
      }
      discoveryChecks.push({ ...source, checkedAt: new Date().toISOString(), fetched: true })
    } catch (error: any) { discoveryChecks.push({ ...source, checkedAt: new Date().toISOString(), error: error.message }) }
  }
  const report = { generatedAt: new Date().toISOString(), scope: 'Paris et Île-de-France; national collectors unchanged', complete: false, identifiedVenues: culturalVenuesIdf.length, exploredThisRun: rows.filter(row => row.pages.length).length, pagesPerVenueLimit: limit, discoveryChecks, summary: { exploredVenues: merged.filter(row => row.pages.length).length, fetchedPages: merged.reduce((sum, row) => sum + row.pages.length, 0), detectedCandidates: merged.reduce((sum, row) => sum + row.detectedRelevant, 0), alreadyPresentCandidates: merged.reduce((sum, row) => sum + row.detectedAlreadyPresent, 0), addedVerifiedEvents: importLedger.length, fullyCoveredVenues: 0 }, venues: merged }
  await fs.mkdir('data', { recursive: true })
  await fs.writeFile(output, JSON.stringify(report, null, 2) + '\n')
  let oldCandidates: any[] = []
  let oldDiscovery: any[] = []
  try { oldCandidates = JSON.parse(await fs.readFile('data/cultural-coverage-candidates.json', 'utf8')) } catch {}
  try { oldDiscovery = JSON.parse(await fs.readFile('data/cultural-venue-discovery.json', 'utf8')) } catch {}
  await fs.writeFile('data/cultural-coverage-observations.json', JSON.stringify(merged.flatMap(row => row.detected || []), null, 2) + '\n')
  await fs.writeFile('data/cultural-coverage-candidates.json', JSON.stringify([...new Map([...oldCandidates, ...candidates].map(item => [`${item.officialUrl}|${item.title}|${item.startDate}|${item.venue}`, item])).values()].map(item => ({ ...item, needsReview: true, ...(practiceOnly(item.title) ? { destination: 'ecoles-de-danse', reviewReason: 'Pratique : ne pas importer dans Sortir' } : {}) })), null, 2) + '\n')
  await fs.writeFile('data/cultural-venue-discovery.json', JSON.stringify([...new Map([...oldDiscovery, ...discovery].map(item => [item.url, item])).values()], null, 2) + '\n')
  console.log(JSON.stringify({ identified: report.identifiedVenues, explored: report.exploredThisRun, detected: candidates.length, added: 0, complete: false }))
}
if (process.argv[1]?.endsWith('audit-cultural-coverage.ts')) main().catch(error => { console.error(error.message); process.exitCode = 1 })
