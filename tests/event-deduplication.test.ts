import test from 'node:test'
import assert from 'node:assert/strict'
import { compareEventProgramming, deduplicateEvents, normalizeEventText, planEventUpserts } from '../lib/event-deduplication.mjs'
import rules from '../data/event-canonicalizations.json'
import { consolidateAgendaEvents, resolveCanonicalEventSlug } from '../lib/event-catalogue'
import type { AgendaEvent } from '../app/agenda/agenda-data'

const event = (patch: Partial<AgendaEvent> = {}): AgendaEvent => ({
  slug: 'spectacle-paris', title: 'Les Quatre saisons dansées',
  startDate: '2027-05-10', endDate: '2027-05-13', venue: 'Théâtre des Champs-Élysées', city: 'Paris',
  description: 'Une description.', category: 'Spectacle', officialUrl: '',
  dates: '10 au 13 mai 2027', price: '', source: 'Test', sourceLabel: 'Test', lastVerifiedAt: '2026-10-15', status: 'À venir', ...patch,
})

test('la normalisation reconnaît chiffres, accents, casse et ponctuation', () => {
  assert.equal(normalizeEventText('LES QUATRE SAISONS DANSÉES !'), normalizeEventText('Les 4 saisons dansées'))
  assert.equal(deduplicateEvents([event(), event({ slug: 'bis', title: 'LES 4 SAISONS DANSÉES' })]).events.length, 1)
})

test('les mentions ajoutées du théâtre ou des artistes ne créent pas une nouvelle programmation', () => {
  const cast = [{ name: 'Mourad Merzouki', role: 'Chorégraphie' }]
  const variants = [event({ cast }), event({ slug: 'artiste', cast, title: 'Les 4 saisons dansées - Mourad Merzouki' }), event({ slug: 'lieu', cast, title: 'Les 4 saisons dansées - Théâtre des Champs-Élysées' })]
  assert.equal(deduplicateEvents(variants).events.length, 1)
})

test('une tournée conserve chaque ville, chaque lieu et chaque série éloignée', () => {
  const sameUrl = { officialUrl: 'https://organisateur.fr/spectacles/saisons' }
  const original = event(sameUrl)
  for (const patch of [{ city: 'Lyon' }, { venue: 'Opéra Bastille' }, { startDate: '2027-09-01', endDate: '2027-09-10' }]) {
    assert.equal(compareEventProgramming(original, event({ ...sameUrl, ...patch })).match, false)
  }
})

test('deux productions ou distributions différentes ne sont pas fusionnées', () => {
  const a = event({ title: 'Giselle - Akram Khan', cast: [{ name: 'Akram Khan', role: 'Chorégraphie' }] })
  const b = event({ title: 'Giselle - Johan Inger', cast: [{ name: 'Johan Inger', role: 'Chorégraphie' }] })
  assert.equal(deduplicateEvents([a, b]).events.length, 2)
  assert.equal(compareEventProgramming(event({ productionId: 'a' }), event({ productionId: 'b' })).match, false)
})

test('un lien de catégorie ou un lieu imprécis ne suffit pas à fusionner des spectacles', () => {
  assert.equal(compareEventProgramming(event({ title: 'Le Lac des cygnes', officialUrl: 'https://opera.fr/saison-2027/ballet' }), event({ title: 'Paysages intérieurs', officialUrl: 'https://opera.fr/saison-2027/ballet' })).match, false)
  assert.equal(compareEventProgramming(event({ venue: 'Hors Paris', city: '', officialUrl: 'https://danse.fr/spectacles/come-out' }), event({ venue: 'Hors Paris', city: '', officialUrl: 'https://danse.fr/spectacles/come-out' })).match, false)
})

test('festival et atelier restent deux événements distincts', () => {
  assert.equal(compareEventProgramming(event({ category: 'Festival' }), event({ category: 'Stage / workshop' })).match, false)
})

test('des représentations proches explicitement liées à la même production se regroupent', () => {
  const a = event({ cast: [{ name: 'Mourad Merzouki', role: 'Chorégraphie' }], startDate: '2027-05-10', endDate: undefined, performances: [{ date: '2027-05-10', time: '19h30' }] })
  const b = event({ slug: 'seance-13', cast: a.cast, startDate: '2027-05-13', endDate: undefined, performances: [{ date: '2027-05-13', time: '19h30' }] })
  const result = deduplicateEvents([a, b]).events
  assert.equal(result.length, 1)
  assert.deepEqual(result[0].performances.map(p => p.date), ['2027-05-10', '2027-05-13'])
})

test('la fusion conserve les données complémentaires et ne modifie pas les sources', () => {
  const input = [event({ image: 'https://image.fr/officielle.jpg', gallery: ['a'], additionalInfo: [{ label: 'Tarif', value: '15 €' }] }), event({ slug: 'bis', description: 'Une description plus complète.', price: '15 €', gallery: ['b'] })]
  const before = structuredClone(input)
  const merged = deduplicateEvents(input).events[0]
  assert.equal(merged.image, input[0].image)
  assert.equal(merged.price, '15 €')
  assert.deepEqual(merged.gallery.sort(), ['a', 'b'])
  assert.equal(merged.sourceRecords.length, 2)
  assert.deepEqual(input, before)
})

test('la règle vérifiée conserve trois représentations et toutes les anciennes URL', () => {
  const rule = rules[0]
  const variants = rule.event.aliasSlugs.map(slug => event({ slug }))
  const result = consolidateAgendaEvents(variants as any)
  const current = result.filter(e => /saisons dansées/i.test(e.title))
  assert.equal(current.length, 1)
  assert.equal(current[0].title, 'Les 4 saisons dansées')
  assert.deepEqual(current[0].performances?.map(p => p.date), ['2027-05-10', '2027-05-11', '2027-05-13'])
  assert.equal(current[0].cast?.length, 7)
  for (const slug of rule.event.aliasSlugs) assert.equal(resolveCanonicalEventSlug(slug), rule.event.slug)
  const other = consolidateAgendaEvents([event({ slug: 'autre-ville', city: 'Lyon' })] as any)
  assert.ok(other.some(e => e.slug === 'autre-ville'))
})

test('une synchronisation répétée ne recrée pas les anciennes fiches', () => {
  const incoming = [event(), event({ slug: 'bis', title: 'Les 4 saisons dansées - Mourad Merzouki' })]
  const first = deduplicateEvents(incoming, { rules }).events
  const next = deduplicateEvents([...first, ...incoming], { rules }).events
  assert.equal(next.length, first.length)
  assert.equal(next[0].slug, first[0].slug)
  assert.equal(new Set(next[0].aliasSlugs).size, next[0].aliasSlugs.length)
})

test('le plan d’import enrichit la fiche existante sans créer une deuxième page', () => {
  const original = event({ sourceIds: ['notion:existing'], canonicalSourceId: 'notion:existing' })
  const plan = planEventUpserts([original], [event({ slug: 'nouveau-titre', title: 'Les 4 saisons dansées - Théâtre des Champs-Élysées', image: 'https://image.fr/photo.jpg' })])
  assert.equal(plan.create.length, 0)
  assert.equal(plan.update.length, 1)
  assert.equal(plan.update[0].canonicalSourceId, 'notion:existing')
  assert.equal(plan.update[0].image, 'https://image.fr/photo.jpg')
})

test('un import ambigu attend une vérification et ne crée pas de doublon', () => {
  const plan = planEventUpserts([event()], [event({ venue: '', city: '', slug: 'incertain' })])
  assert.equal(plan.create.length, 0)
  assert.equal(plan.update.length, 0)
  assert.equal(plan.review.length, 1)
})

test('deux entrées du même nouveau lot ne créent qu’une programmation', () => {
  const plan = planEventUpserts([], [event(), event({ slug: 'bis', image: 'photo.jpg' })])
  assert.equal(plan.create.length, 1)
  assert.equal(plan.update.length, 0)
  assert.equal(plan.create[0].image, 'photo.jpg')
})
