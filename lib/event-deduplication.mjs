/** Shared by the catalogue, API and collectors. No fuzzy title-only merges. */
export function normalizeEventText(value = '') {
  return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/\b(quatre|four)\b/g, '4').replace(/œ/g, 'oe')
    .replace(/[^a-z0-9]+/g, ' ').trim()
}

const meaningful = value => typeof value === 'string' && value.trim() && !/^(a (completer|confirmer|venir)|non renseigne|date renseignee|notion)$/i.test(normalizeEventText(value))
const unique = values => [...new Set(values.filter(Boolean))]
const PLACE_ALIASES = new Map([
  ['tce', 'theatre des champs elysees'],
  ['theatre des champs elysees paris', 'theatre des champs elysees'],
])
const place = value => PLACE_ALIASES.get(normalizeEventText(value)) || normalizeEventText(value)
const known = value => meaningful(value) && !['hors paris', 'plusieurs lieux', 'espace public plein air', 'france', 'lieux divers'].includes(place(value)) ? place(value) : ''
const splitTitle = value => String(value || '').split(/\s+[—–|]\s+|\s+-\s+|\s+(?:avec|par)\s+/i)
const baseTitle = event => {
  let title = normalizeEventText(splitTitle(event.title)[0])
  for (const name of [event.venue, event.city, ...(event.artists || []), ...(event.cast || []).map(p => p.name)]) {
    const normalized = normalizeEventText(name)
    if (normalized.length >= 5) title = title.replace(normalized, ' ')
  }
  return title.replace(/^(?:le|la|les|un|une|l)\s+/, '').replace(/\s+/g, ' ').trim()
}
const tokens = value => new Set(normalizeEventText(value).split(' ').filter(t => t.length > 2 && !['les','des','the','cie','compagnie','ballet','danse','theatre','saison','choregraphie'].includes(t)))
const intersects = (a, b) => [...a].some(value => b.has(value))
const urls = event => unique([event.officialUrl, event.ticketUrl, ...(event.sourceUrls || [])])

function urlKeys(event) {
  const keys = []
  for (const value of urls(event)) {
    try {
      const url = new URL(value)
      const host = url.hostname.replace(/^www\./, '').replace(/^(billetterie|echange|jeunes)\./, '')
      const product = url.searchParams.get('productId') || (/\/redirect\/product$/.test(url.pathname) ? url.searchParams.get('id') : '')
      if (product) keys.push(`${host}:product:${product}`)
      // A venue homepage/category is not an event identifier.
      const path = url.pathname.replace(/\/+$/, '')
      if (path.split('/').filter(Boolean).length >= 2 && !/\/(danse|ballet|spectacles?|events?|categories|date|seat|item|list)$/.test(path)) keys.push(`${host}${path}`)
    } catch { /* A malformed URL is never identity evidence. */ }
  }
  return new Set(keys)
}

function artistTokens(event) {
  const names = [
    ...(event.artists || []),
    ...(event.cast || []).filter(person => /chor[eé]graph|mise en sc[eè]ne|direction|compagnie/i.test(person.role)).map(person => person.name),
    ...(event.additionalInfo || []).filter(info => /chor[eé]graph|compagnie|artistes|distribution/i.test(info.label)).map(info => info.value),
  ]
  return tokens(names.join(' '))
}

function dateRange(event) {
  const dates = [event.startDate, event.endDate, ...(event.performances || []).map(p => p.date)].filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d || '')).sort()
  return dates.length ? [dates[0], dates.at(-1)] : null
}

export function compareEventProgramming(a, b) {
  const cityA = known(a.city), cityB = known(b.city)
  const venueA = known(a.venue), venueB = known(b.venue)
  if (cityA && cityB && cityA !== cityB) return { match: false, reason: 'different-city' }
  if (venueA && venueB && venueA !== venueB) return { match: false, reason: 'different-venue' }
  const practice = value => /cours|atelier|stage|workshop|masterclass|formation/i.test(value || '')
  if (a.category && b.category && practice(a.category) !== practice(b.category)) return { match: false, reason: 'different-format' }
  const ra = dateRange(a), rb = dateRange(b)
  if (!ra || !rb) return { match: false, reason: 'missing-dates' }
  const overlap = ra[0] <= rb[1] && rb[0] <= ra[1]
  const gap = Math.max(0, (Date.parse(ra[0]) - Date.parse(rb[1])) / 86400000, (Date.parse(rb[0]) - Date.parse(ra[1])) / 86400000)
  // A later run/tour stop is a separate programming, even with the same product URL.
  if (!overlap && gap > 14) return { match: false, reason: 'different-run' }
  if (a.programmingId && b.programmingId && a.programmingId !== b.programmingId) return { match: false, reason: 'different-official-programming' }
  if (a.productionId && b.productionId && a.productionId !== b.productionId) return { match: false, reason: 'different-production' }
  const artistsA = artistTokens(a), artistsB = artistTokens(b)
  if (artistsA.size && artistsB.size && !intersects(artistsA, artistsB)) return { match: false, reason: 'different-artists' }
  if (a.canonicalKey && a.canonicalKey === b.canonicalKey) return { match: true, reason: 'verified-programming' }
  const sameUrl = intersects(urlKeys(a), urlKeys(b))
  const sameId = intersects(new Set(a.sourceIds || []), new Set(b.sourceIds || []))
  const sameTitle = Boolean(baseTitle(a)) && baseTitle(a) === baseTitle(b)
  const suffix = event => {
    const result = tokens(splitTitle(event.title).slice(1).join(' '))
    for (const token of tokens(`${event.venue || ''} ${event.city || ''}`)) result.delete(token)
    if (place(event.venue) === 'theatre des champs elysees') result.delete('tce')
    return result
  }
  const suffixA = suffix(a), suffixB = suffix(b)
  if (!sameId && suffixA.size && suffixB.size && !intersects(suffixA, suffixB) && !(artistsA.size && artistsB.size && intersects(artistsA, artistsB))) return { match: false, reason: 'production-needs-review' }
  const locationEvidence = (venueA && venueB && venueA === venueB) || (cityA && cityB && cityA === cityB)
  if ((sameId || (sameUrl && sameTitle && locationEvidence)) && (overlap || (venueA && venueA === venueB))) return { match: true, reason: 'shared-official-identifier' }
  if (!venueA || !venueB || venueA !== venueB) return { match: false, reason: 'insufficient-location' }
  if (!sameTitle) return { match: false, reason: 'different-title' }
  if (overlap) return { match: true, reason: 'same-title-venue-dates' }
  if (artistsA.size && artistsB.size && intersects(artistsA, artistsB)) return { match: true, reason: 'same-production-nearby-performances' }
  return { match: false, reason: 'separate-dates-need-evidence' }
}

function records(event) {
  if (event.sourceRecords?.length) return event.sourceRecords
  const { sourceRecords, aliasSlugs, canonicalKey, ...record } = event
  return [record]
}

function unionRecords(values, key) {
  const map = new Map()
  for (const value of values) map.set(key(value), value)
  return [...map.values()]
}

export function mergeEventRecords(a, b) {
  const result = { ...b, ...a }
  for (const [key, value] of Object.entries(b)) {
    if (result[key] == null || (typeof result[key] === 'string' && !meaningful(result[key]) && meaningful(value))) result[key] = value
  }
  if (!a.canonicalKey && (b.description?.length || 0) > (a.description?.length || 0)) result.description = b.description
  const dates = [dateRange(a), dateRange(b)].filter(Boolean)
  if (dates.length) {
    result.startDate = dates.map(d => d[0]).sort()[0]
    result.endDate = dates.map(d => d[1]).sort().at(-1)
  }
  result.aliasSlugs = unique([a.slug, b.slug, ...(a.aliasSlugs || []), ...(b.aliasSlugs || [])]).filter(slug => slug !== result.slug)
  result.sourceIds = unique([...(a.sourceIds || []), ...(b.sourceIds || [])]).sort()
  result.sourceUrls = unique([...urls(a), ...urls(b)]).sort()
  result.gallery = unique([...(a.gallery || []), ...(b.gallery || [])])
  result.disciplines = unique([...(a.disciplines || []), ...(b.disciplines || [])])
  result.cast = unionRecords([...(a.cast || []), ...(b.cast || [])], p => normalizeEventText(`${p.name}|${p.role}|${p.character || ''}`))
  result.additionalInfo = unionRecords([...(a.additionalInfo || []), ...(b.additionalInfo || [])], p => normalizeEventText(`${p.label}|${p.value}`))
  result.performances = unionRecords([...(a.performances || []), ...(b.performances || [])], p => `${p.date}|${p.time || ''}`)
    .sort((x, y) => `${x.date} ${x.time || ''}`.localeCompare(`${y.date} ${y.time || ''}`))
  result.sourceRecords = unionRecords([...records(a), ...records(b)], p => (p.sourceIds || []).join('|') || `${p.slug}|${p.officialUrl || ''}`)
  return result
}

export function applyEventCanonicalRules(event, rules = []) {
  for (const rule of rules) {
    const identities = [event.slug, ...(event.aliasSlugs || []), ...(event.sourceIds || [])]
    const explicit = identities.some(id => [rule.event.slug, ...(rule.event.aliasSlugs || []), ...(rule.event.sourceIds || [])].includes(id))
    const inWindow = event.startDate >= rule.startDate && (event.endDate || event.startDate) <= rule.endDate
    const venueMatches = rule.venueAliases.some(alias => place(alias) === place(event.venue))
    const cityMatches = !known(event.city) || place(event.city) === place(rule.event.city)
    const titleMatches = rule.titleAliases.some(title => baseTitle({ title }) === baseTitle(event))
    if (inWindow && cityMatches && (venueMatches || (explicit && !known(event.venue))) && (explicit || titleMatches)) {
      const merged = mergeEventRecords({ ...rule.event, canonicalKey: rule.key }, event)
      merged.sourceRecords = records(event)
      return merged
    }
  }
  return { ...event }
}

export function deduplicateEvents(events, { rules = [] } = {}) {
  const groups = []
  // Stable order independent of source/network ordering.
  const ordered = events.map(e => applyEventCanonicalRules(e, rules)).sort((a, b) =>
    Number(Boolean(b.canonicalKey)) - Number(Boolean(a.canonicalKey)) ||
    String(a.slug || a.officialUrl).localeCompare(String(b.slug || b.officialUrl)))
  for (const event of ordered) {
    // Complete-link grouping prevents an imprecise record bridging two productions.
    const group = groups.find(g => g.members.every(member => compareEventProgramming(member, event).match))
    if (group) {
      group.members.push(event)
      group.event = mergeEventRecords(group.event, event)
    } else groups.push({ event, members: [event] })
  }
  return {
    events: groups.map(g => g.event).sort((a, b) => String(a.startDate).localeCompare(String(b.startDate)) || String(a.slug).localeCompare(String(b.slug))),
    groups: groups.filter(g => g.members.length > 1).map(g => ({
      slug: g.event.slug, title: g.event.title, aliases: g.event.aliasSlugs,
      members: unionRecords(g.members.flatMap(records), p => (p.sourceIds || []).join('|') || `${p.slug}|${p.officialUrl || ''}`).map(e => ({ slug: e.slug, title: e.title, sourceIds: e.sourceIds, venue: e.venue, city: e.city, startDate: e.startDate, endDate: e.endDate, officialUrl: e.officialUrl })),
    })),
  }
}

/** Plan before any persistence: an existing programming is updated, never recreated. */
export function planEventUpserts(existing, incoming, options = {}) {
  const current = deduplicateEvents(existing, options).events
  const create = [], update = [], review = []
  for (const raw of incoming) {
    const candidate = applyEventCanonicalRules(raw, options.rules || [])
    const matches = current.filter(event => compareEventProgramming(event, candidate).match)
    if (matches.length > 1) { review.push({ event: candidate, reason: 'multiple-existing-programmings' }); continue }
    if (matches.length === 1) {
      const original = matches[0]
      const merged = mergeEventRecords(original, candidate)
      current[current.indexOf(original)] = merged
      const planned = update.findIndex(item => item.slug === merged.slug)
      if (planned === -1) update.push(merged)
      else update[planned] = merged
      // Multiple records from the same new batch remain a single creation.
      const created = create.findIndex(item => item.slug === merged.slug)
      if (created !== -1) { create[created] = merged; update.splice(update.findIndex(item => item.slug === merged.slug), 1) }
    } else {
      const ambiguous = current.some(event => baseTitle(event) === baseTitle(candidate) &&
        ['insufficient-location', 'missing-dates', 'production-needs-review', 'separate-dates-need-evidence'].includes(compareEventProgramming(event, candidate).reason))
      if (ambiguous || !candidate.startDate || !known(candidate.venue)) review.push({ event: candidate, reason: 'insufficient-programming-evidence' })
      else { current.push(candidate); create.push(candidate) }
    }
  }
  return { create, update, review }
}
