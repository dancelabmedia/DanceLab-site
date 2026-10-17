import type { AgendaEvent } from '../../app/agenda/agenda-data'
import { normalizeEventText } from '../../lib/event-deduplication.mjs'

export function propertyText(property: any): string {
  if (!property) return ''
  if (property.multi_select) return property.multi_select.map((item: any) => item.name).join(' | ')
  if (property.title || property.rich_text) return (property.title || property.rich_text).map((part: any) => part.plain_text || part.text?.content || '').join('')
  return property.url || property.select?.name || property.status?.name || ''
}

export function notionAgendaEvent(page: any): AgendaEvent {
  const props = page.properties
  const text = (...names: string[]) => names.map(alias => propertyText(Object.entries(props).find(([name]) => normalizeEventText(alias) === normalizeEventText(name))?.[1])).find(Boolean) || ''
  const parse = (name: string) => { try { return JSON.parse(text(name) || '[]') } catch { return [] } }
  const title = text('Événement', 'Titre', 'Nom')
  const dates: any = Object.values(props).find((p: any) => p.type === 'date' && p.date && !['Dernière vérification', 'Image vérifiée le'].some(name => props[name] === p))
  const date = props.Date?.date || dates?.date
  const startDate = date?.start?.slice(0, 10) || ''
  const venue = text('Lieu', 'Salle')
  const sourceUrls = parse('Sources fusionnées Dance Lab')
  return {
    canonicalSourceId: `notion:${page.id}`,
    slug: text('Slug Dance Lab') || `${title.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}-${startDate}`,
    title,
    disciplines: text('Disciplines', 'Discipline', 'Styles', 'Style').split(/[|;,]/).map(value => value.trim()).filter(Boolean),
    description: text('Description', 'Résumé') || text('Notes'),
    startDate, endDate: date?.end?.slice(0, 10), dates: text('Horaires') || startDate,
    time: text('Horaires'), venue, city: text('Ville'), address: text('Adresse'),
    image: text('Image URL') || page.cover?.external?.url || page.cover?.file?.url,
    price: text('Tarif', 'Prix'), category: /stage|workshop|masterclass|formation/i.test(text('Type')) ? 'Stage / workshop' : /cours|atelier/i.test(text('Type')) ? 'Cours / atelier' : /festival/i.test(text('Type')) ? 'Festival' : 'Spectacle',
    officialUrl: text('Lien officiel', 'URL source') || text('Source image'),
    ticketUrl: text('Lien billetterie'), source: 'Notion', sourceLabel: 'Notion',
    lastVerifiedAt: page.last_edited_time?.slice(0, 10) || '', status: 'À venir',
    sourceIds: [`notion:${page.id}`],
    sourceUrls: Array.isArray(sourceUrls) ? sourceUrls : [],
    aliasSlugs: parse('Anciennes URL Dance Lab'),
    performances: parse('Représentations Dance Lab'), cast: parse('Distribution Dance Lab'),
    additionalInfo: [{ label: 'Compagnie / Chorégraphe', value: text('Compagnie / Chorégraphe') }].filter(p => p.value),
  }
}

export class NotionAgendaClient {
  token = process.env.NOTION_TOKEN || process.env.NOTION_API_KEY
  databaseId = process.env.NOTION_AGENDA_DATABASE_ID || 'c06a1552cfcc4522ae68d32f833b3cf3'
  dataSource: any

  async request(path: string, method = 'GET', body?: unknown): Promise<any> {
    if (!this.token) throw new Error('NOTION_TOKEN manquant')
    const response = await fetch(`https://api.notion.com/v1/${path}`, {
      method, signal: AbortSignal.timeout(30000),
      headers: { Authorization: `Bearer ${this.token}`, 'Content-Type': 'application/json', 'Notion-Version': '2025-09-03' },
      body: body ? JSON.stringify(body) : undefined,
    })
    if (!response.ok) throw new Error(`Notion ${response.status}: ${(await response.json()).message}`)
    return response.json()
  }

  async pages() {
    const db = await this.request(`databases/${this.databaseId}`)
    const id = db.data_sources?.[0]?.id || this.databaseId
    this.dataSource = await this.request(`data_sources/${id}`)
    let cursor: string | undefined
    const pages: any[] = []
    do {
      const data = await this.request(`data_sources/${id}/query`, 'POST', { page_size: 100, start_cursor: cursor })
      pages.push(...data.results)
      cursor = data.has_more ? data.next_cursor : undefined
    } while (cursor)
    return pages
  }

  async ensureIdentityFields() {
    const fields = ['Slug Dance Lab', 'Anciennes URL Dance Lab', 'Représentations Dance Lab', 'Distribution Dance Lab', 'Sources fusionnées Dance Lab']
    const properties = Object.fromEntries(fields.filter(name => !this.dataSource.properties[name]).map(name => [name, { rich_text: {} }]))
    if (Object.keys(properties).length) await this.request(`data_sources/${this.dataSource.id}`, 'PATCH', { properties })
  }

  async blocks(pageId: string) {
    const result: any[] = []
    let cursor: string | undefined
    do {
      const page = await this.request(`blocks/${pageId}/children?page_size=100${cursor ? `&start_cursor=${cursor}` : ''}`)
      result.push(...page.results)
      cursor = page.has_more ? page.next_cursor : undefined
    } while (cursor)
    return result
  }

  eventProperties(event: AgendaEvent) {
    const rich = (value: string) => ({ rich_text: (value.match(/[\s\S]{1,1800}/g) || []).map(content => ({ text: { content } })) })
    const titleName = Object.entries(this.dataSource.properties).find(([, p]: any) => p.type === 'title')?.[0] || 'Événement'
    const props: Record<string, unknown> = {
      [titleName]: { title: [{ text: { content: event.title } }] },
      'Slug Dance Lab': rich(event.slug),
      'Anciennes URL Dance Lab': rich(JSON.stringify(event.aliasSlugs || [])),
      'Représentations Dance Lab': rich(JSON.stringify(event.performances || [])),
      'Distribution Dance Lab': rich(JSON.stringify(event.cast || [])),
      'Sources fusionnées Dance Lab': rich(JSON.stringify(event.sourceUrls || [])),
    }
    const disciplineField = ['Disciplines', 'Discipline', 'Styles', 'Style'].find(name => this.dataSource.properties[name])
    if (disciplineField && event.disciplines) {
      const type = this.dataSource.properties[disciplineField].type
      if (type === 'multi_select') props[disciplineField] = { multi_select: event.disciplines.map(name => ({ name })) }
      if (type === 'rich_text') props[disciplineField] = rich(event.disciplines.join(' · '))
    }
    for (const [name, value] of Object.entries({ Description: event.description, Horaires: event.time, Tarif: event.price, Adresse: event.address, Ville: event.city, 'Code postal': event.postalCode })) {
      if (this.dataSource.properties[name]?.type === 'rich_text' && value) props[name] = rich(value)
    }
    for (const [name, value] of Object.entries({ 'Lien officiel': event.officialUrl, 'Lien billetterie': event.ticketUrl, 'Image URL': event.image })) {
      if (this.dataSource.properties[name]?.type === 'url' && value) props[name] = { url: value }
    }
    if (event.startDate && this.dataSource.properties.Date?.type === 'date') props.Date = { date: { start: event.startDate, end: event.endDate || null } }
    if (event.venue && this.dataSource.properties.Lieu?.type === 'select') props.Lieu = { select: { name: event.venue } }
    const typeOption = this.dataSource.properties.Type?.select?.options?.find((option: any) => normalizeEventText(option.name).startsWith(normalizeEventText(event.category)))
    if (typeOption) props.Type = { select: { name: typeOption.name } }
    return props
  }
}
