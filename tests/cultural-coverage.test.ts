import { test } from 'node:test'
import assert from 'node:assert/strict'
import { structuredEvents, pageLinks } from '../scripts/audit-cultural-coverage'
import { culturalVenuesIdf } from '../data/cultural-venues-idf'
import { readFileSync } from 'node:fs'

test('explore les événements JSON-LD dans les graphes sans traiter les organisations comme des spectacles', () => {
  const html = '<script type="application/ld+json">{"@graph":[{"@type":"Organization","name":"Théâtre"},{"@type":"DanceEvent","name":"Création"}]}</script>'
  assert.equal(structuredEvents(html).length, 1)
  assert.equal(structuredEvents(html)[0].name, 'Création')
  assert.deepEqual(structuredEvents('<script type="application/ld+json">not json</script>'), [])
})
test('suit les pages de saisons et événements sans envoyer le collecteur sur les domaines externes', () => {
  const links = pageLinks('<a href="/saison-2026-2027">Saison</a><a href="/manifestations/danse">Danse</a><a href="https://autre.example/danse">Danse</a><a href="/connexion">Connexion</a>', 'https://theatre.example/')
  assert.equal(links.length, 2)
  assert.equal(links[0].url, 'https://theatre.example/manifestations/danse')
})
test('répertoire distinct des lieux et identité Saint-Antoine non inventée', () => {
  assert.equal(new Set(culturalVenuesIdf.map(row => row[0])).size, culturalVenuesIdf.length)
  assert.equal(culturalVenuesIdf.find(row => row[0] === 'Théâtre Saint-Antoine')?.[2], '')
  assert.ok(culturalVenuesIdf.some(row => row[0] === 'Lido 2 Paris' && row[2].includes('theatredulido.com')))
})

test('un ballet ne doit pas être classé comme un bal par sous-chaîne', () => {
  const source = readFileSync('app/api/agenda/route.ts', 'utf8')
  const start = source.indexOf('function normalizeCategory(')
  const classifier = source.slice(start, source.indexOf('\n}', start))
  assert.ok(classifier.indexOf('includes("ballet")') < classifier.indexOf('return "Bal / soirée"'))
  assert.ok(!classifier.includes('includes("bal")'))
})

test('les ateliers ne sont pas publiés comme spectacles et une exploration partielle conserve les observations antérieures', () => {
  const source = readFileSync('scripts/audit-cultural-coverage.ts', 'utf8')
  assert.ok(source.includes('if (practiceOnly(title))'))
  assert.ok(source.includes('lastRun?.detected'))
  assert.ok(source.includes("destination: 'ecoles-de-danse'"))
})
