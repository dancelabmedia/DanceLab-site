import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import {
  ECOLE_CATEGORIES,
  ecolesDanse,
  getEcoleCategories,
  getEcoleLocationLabel,
  getEcoleMarkerKind,
  getEcoleSearchText,
  normalizeEcoleSearch,
} from '../app/explorer/ecoles-de-danse/ecoles-data'

const requestedSchoolIds = [
  'studio-harmonic',
  'centre-danse-marais',
  'studio-bleu-10e',
  'ifpro-rick-odums',
  'centre-arts-vivants',
  'studio-massaro',
  'ze-art-studios',
  'ecole-danse-paris',
  'paris-marais-dance',
  'ecole-danses-latines-tropicales',
  'crr-paris-ida-rubinstein',
]

test('the Paris directory contains every explicitly requested establishment', () => {
  for (const id of requestedSchoolIds) {
    const school = ecolesDanse.find(entry => entry.id === id)
    assert.ok(school, `Missing requested school: ${id}`)
    assert.match(school.siteWeb ?? '', /^https:\/\//, `Missing official URL: ${id}`)
  }
})

test('the directory contains the 17 municipal conservatories and the CRR', () => {
  const conservatories = ecolesDanse.filter(entry => entry.ville === 'Paris' && entry.type === 'Conservatoire')
  assert.equal(conservatories.length, 18)
  assert.ok(conservatories.every(entry => entry.adresse && entry.arrondissement && entry.siteWeb))
})

test('editorial school filters remain complete and backed by data', () => {
  assert.deepEqual(ECOLE_CATEGORIES, [
    'Classique', 'Jazz & Modern Jazz', 'Contemporain', 'Hip-hop & danses urbaines',
    'Club & freestyle', 'Street Jazz & Commercial', 'Heels', 'Danses latines',
    'Danses de couple', 'Danses du monde', 'Formation professionnelle', 'Conservatoires',
  ])
  for (const category of ECOLE_CATEGORIES) {
    assert.ok(ecolesDanse.some(entry => getEcoleCategories(entry).includes(category)), `Empty filter: ${category}`)
  }
})

test('search index finds schools by name, arrondissement, discipline and training type', () => {
  const find = (query: string) => ecolesDanse.filter(entry => getEcoleSearchText(entry).includes(normalizeEcoleSearch(query)))
  assert.ok(find('ZE Art Studios').some(entry => entry.id === 'ze-art-studios'))
  assert.ok(find('Paris 11').some(entry => entry.id === 'studio-massaro'))
  assert.ok(find('danses latines').some(entry => entry.id === 'ecole-danses-latines-tropicales'))
  assert.ok(find('formation professionnelle').some(entry => entry.id === 'ifpro-rick-odums'))
  assert.ok(find('conservatoire').some(entry => entry.id === 'crr-paris-ida-rubinstein'))
})

test('cards expose precise Paris locations and map categories without public data-quality wording', () => {
  const harmonic = ecolesDanse.find(entry => entry.id === 'studio-harmonic')!
  const crr = ecolesDanse.find(entry => entry.id === 'crr-paris-ida-rubinstein')!
  const opera = ecolesDanse.find(entry => entry.id === 'ecole-danse-opera-paris')!
  assert.equal(getEcoleLocationLabel(harmonic), 'Paris 11e · Bastille')
  assert.equal(getEcoleMarkerKind(harmonic), 'formation')
  assert.equal(getEcoleMarkerKind(crr), 'conservatoire')
  assert.equal(getEcoleMarkerKind(opera), 'superieur')
  assert.ok(!readFileSync('app/explorer/ecoles-de-danse/EcolesClient.tsx', 'utf8').includes('Établissement sans coordonnées'))
})
