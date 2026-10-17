import { test } from 'node:test'
import assert from 'node:assert/strict'
import { classifyEventDisciplines, applyEventDisciplines } from '../lib/event-disciplines.mjs'

test('MEMENTO verrouillé sur la source officielle, sans breaking', () => {
  const event = { title: 'MEMENTO - MazelFreten', disciplines: ['Hip-hop / Breaking'], description: '' }
  const result = classifyEventDisciplines(event)
  assert.deepEqual(result.disciplines, ['Électro', 'Hip-hop'])
  assert.equal(result.locked, true)
  assert.deepEqual(classifyEventDisciplines({ ...event, disciplines: ['Breaking'] }).disciplines, result.disciplines)
  assert.deepEqual(event.disciplines, ['Hip-hop / Breaking'])
})
test('un autre Memento ne récupère pas la correction MazelFreten', () => {
  assert.equal(classifyEventDisciplines({ title: 'Memento', description: 'Une autre compagnie', disciplines: [] }).locked, false)
})
test('le hip-hop ne justifie pas le breaking et une musique électronique ne justifie pas l’électro', () => {
  assert.deepEqual(classifyEventDisciplines({ title: 'Spectacle', description: 'Une pièce hip-hop sur une musique électronique', disciplines: ['Hip-hop / Breaking'] }).disciplines, ['Hip-hop'])
  assert.deepEqual(classifyEventDisciplines({ title: 'Spectacle', description: 'Une bande-son électronique', disciplines: ['Hip-hop / Breaking'] }).disciplines, [])
})
test('breaking, classique, contemporain, house et styles multiples restent distincts', () => {
  for (const label of ['Breaking', 'Classique / Ballet', 'Contemporain', 'House']) {
    assert.deepEqual(classifyEventDisciplines({ disciplines: [label] }).disciplines, [label])
  }
  assert.deepEqual(classifyEventDisciplines({ disciplines: ['House', 'Popping'] }).disciplines, ['House', 'Popping'])
})
test('les détails et filtres utilisent les mêmes disciplines et un type ne devient pas un style', () => {
  const result = applyEventDisciplines({ title: 'MEMENTO de MazelFreten', disciplines: ['Breaking'], category: 'Spectacle', additionalInfo: [{ label: 'Disciplines', value: 'Breaking' }] })
  assert.equal(result.category, 'Spectacle')
  assert.equal(result.additionalInfo[0].value, result.disciplines.join(' · '))
  assert.deepEqual(classifyEventDisciplines({ disciplines: ['Festival', 'Cabaret'] }).disciplines, [])
})
