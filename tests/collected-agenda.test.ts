import { test } from 'node:test'
import assert from 'node:assert/strict'
import { collectedAgendaAudit, getCollectedAgendaEvents } from '../app/agenda/collected-events'

test('la collecte consolidée publie toutes les entrées datées sans doublon', () => {
  const events = getCollectedAgendaEvents('2026-10-12')
  assert.equal(collectedAgendaAudit.sourceRows, 247)
  assert.equal(collectedAgendaAudit.importedRows, getCollectedAgendaEvents().length)
  assert.equal(collectedAgendaAudit.withheldRows, collectedAgendaAudit.sourceRows - collectedAgendaAudit.importedRows)
  assert.equal(collectedAgendaAudit.undatedRows, 4)
  assert.equal(collectedAgendaAudit.duplicateIds, 0)
  assert.equal(events.length, 243)
  assert.equal(new Set(events.map(event => event.slug)).size, events.length)
})

test('les huit catégories de la collecte sont conservées dans Sortir', () => {
  const events = getCollectedAgendaEvents('2026-10-12')
  const counts = Object.fromEntries(
    [...new Set(events.map(event => event.category))].map(category => [category, events.filter(event => event.category === category).length])
  )

  assert.deepEqual(counts, {
    'Cours / atelier': 36,
    Spectacle: 165,
    Festival: 10,
    'Conférence / rencontre': 11,
    'Stage / workshop': 7,
    'Bal / soirée': 8,
    Exposition: 1,
    Battle: 5,
  })
})

test('les fiches conservent source, lien, dates et détails disponibles', () => {
  const events = getCollectedAgendaEvents('2026-10-12')
  assert.ok(events.every(event => event.officialUrl.startsWith('http')))
  assert.ok(events.every(event => event.startDate && event.description && event.sourceLabel))
  assert.ok(events.every(event => event.additionalInfo?.some(info => info.label === 'Source des données')))
  assert.ok(events.some(event => event.disciplines?.includes('Hip-hop / Breaking')))
})

test('les événements expirés sont automatiquement archivés', () => {
  assert.equal(getCollectedAgendaEvents('2028-01-01').length, 0)
})
