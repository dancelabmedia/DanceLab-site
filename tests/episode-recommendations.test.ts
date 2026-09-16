import { test } from 'node:test'
import assert from 'node:assert/strict'
import { analyzeEpisode, createRecommendationIndex, recommendEpisodes, type RecommendationInput } from '../lib/episode-recommendations'
import { buildRecommendationInputs } from '../lib/episode-recommendations.server'
import { EPISODE_THEME_REFERENCE, TAG_TAXONOMY, getEpisodeTags } from '../lib/episode-themes'
import { episodes } from '../data/episodes'
import type { UnifiedEpisode } from '../lib/episodes'
import type { MagazineArticle } from '../app/decouvrir/articles-data'

const episode = (number: number, fields: Partial<RecommendationInput> = {}): RecommendationInput => ({ title: 'Une conversation', slug: `episode-${number}`, ...fields, number })
const keys = (input: RecommendationInput) => analyzeEpisode(input).themes.map(t => t.key)
const wilfried = episode(128, {
  slug: '128-wilfried-bernard',
  title: 'Danse et handicap : le milieu est-il vraiment inclusif',
  excerpt: 'Est-ce qu’on peut vraiment parler d’inclusion si tout le monde n’a pas encore accès à la danse ?',
  description: 'Wilfried partage sa vision de la mixité, de la place des personnes en situation de handicap.\nC’est surtout connaître ses droits, comprendre son statut et savoir ce qu’on ne doit plus accepter.\nLisez vos contrats et apprenez à négocier.',
  quote: 'Ma vision du handidanse, c’est pas tire-larmes, au contraire.',
})

test('canonical subjects are unique, with at most five evidenced main themes', () => {
  assert.equal(new Set(EPISODE_THEME_REFERENCE.map(t => t.key)).size, EPISODE_THEME_REFERENCE.length)
  const profile = analyzeEpisode(episode(1, { title: 'Handicap, inclusion, maternité, violences, emprise, argent, carrière, TCA, santé mentale' }))
  assert.equal(profile.themes.length, 5)
  assert.ok(profile.themes.every(t => t.evidence.length > 0 && t.evidence.length <= 5))
})

test('new recommendation vocabulary does not retag the existing public pages', () => {
  assert.ok(!TAG_TAXONOMY.some(t => t.recommendationOnly))
  assert.ok(EPISODE_THEME_REFERENCE.some(t => t.key === 'innovation'))
  assert.ok(!getEpisodeTags('Tatiana et Ludovica : des expériences familiales.').includes('innovation'))
})

test('manual Wilfried → Ilies + Angelina precedes an otherwise identical candidate', () => {
  const index = createRecommendationIndex([wilfried, ...episodes.filter(e => [22, 25].includes(e.number)), episode(900, { ...wilfried, slug: 'competitor' })])
  const recommendations = recommendEpisodes(128, index)
  assert.deepEqual(recommendations.slice(0, 2).map(r => r.number), [22, 25])
  assert.ok(recommendations.slice(0, 2).every(r => r.manual && r.reason))
  assert.equal(recommendations.length, 3)
})

test('manual links ignore missing targets, duplicates and self references', () => {
  const index = createRecommendationIndex([episode(1), episode(2), episode(3)])
  const links = { 1: [1, 999, 2, 2, 3].map(number => ({ episode: number, reason: 'Validated editorial link', themes: [] })) }
  assert.deepEqual(recommendEpisodes(1, index, 3, links).map(r => r.number), [2, 3])
  assert.equal(recommendEpisodes(1, index, 1, links).length, 1)
  assert.deepEqual(recommendEpisodes(1, index, 0, links), [])
  assert.deepEqual(recommendEpisodes(999, index), [])
})

test('strong subject outranks same guest, series, profession and dance style', () => {
  const current = episode(63, { title: 'Handicap et inclusion : les droits des danseurs', role: 'Chorégraphe', chapters: [{ time: '10:00', title: 'Histoire du hip-hop' }] })
  const index = createRecommendationIndex([current, episode(900, { title: 'Handicap et inclusion dans la danse' }), episode(65, { title: 'Créer une chorégraphie hip-hop', role: 'Chorégraphe' })])
  assert.equal(recommendEpisodes(63, index, 3, {})[0].number, 900)
})

test('problem > professional role > studied dance style > generic overlap', () => {
  const index = createRecommendationIndex([
    episode(1, { title: 'Argent et carrière dans le hip-hop', role: 'Régisseur' }),
    episode(2, { title: 'Comprendre son argent' }), episode(3, { role: 'Régisseur' }),
    episode(4, { title: 'Les fondements du hip-hop' }), episode(5, { title: 'Construire sa carrière' }),
  ])
  assert.deepEqual(recommendEpisodes(1, index, 4, {}).map(r => r.number), [2, 3, 4, 5])
})

test('a passing mention, a guest biography and tags do not establish subjects', () => {
  const input = episode(1, { title: 'Construire sa carrière', description: 'Elle pratique le heels. Elle est connue pour le heels. Son ami lui parle un instant de handicap.', tags: ['handicap', 'inclusion', 'heels', 'maternite'], role: 'Professeur de heels' })
  assert.deepEqual(keys(input), ['carriere'])
  assert.deepEqual(analyzeEpisode(input).styles, [])
})

test('repeated copies of the same passing mention are not independent evidence', () => {
  const text = 'Nous avons salué une personne en situation de handicap à notre arrivée dans le studio.'
  assert.ok(!keys(episode(1, { description: `${text}\n${text}`, excerpt: text, quote: text })).includes('handicap'))
})

test('word boundaries prevent mère/première and viol/violon confusion', () => {
  const profile = analyzeEpisode(episode(1, { title: 'Première interview avec un violoniste', description: 'Le violoniste évoque cette première expérience. Une première passion pour le violon.' }))
  assert.ok(!profile.themes.some(t => ['violences', 'maternite'].includes(t.key)))
})

test('marketing boilerplate is not interview evidence', () => {
  assert.deepEqual(keys(episode(1, { description: 'Un beau moment partagé.\nAbonnez-vous : Instagram et santé mentale. Découvrez les droits des artistes. Droits des artistes et handicap.' })), [])
})

test('titles, chapter subjects and explicit interview summaries are evidence', () => {
  const profile = analyzeEpisode(episode(1, { title: 'Handicap dans la danse', excerpt: 'Un échange sur la maternité et la vie de famille.', chapters: [{ time: '14:22', title: 'L’accessibilité de la danse' }] }))
  assert.ok(['handicap', 'accessibilite', 'maternite'].every(key => profile.themes.some(t => t.key === key)))
})

test('multiple substantive transcript passages can establish a subject', () => {
  assert.ok(keys(episode(1, { transcript: Array.from({ length: 5 }, (_, i) => `Passage ${i} : les obstacles au handicap changent selon le contexte ${i}.`).join('\n') })).includes('handicap'))
  assert.ok(!keys(episode(2, { transcript: 'Le handicap est mentionné rapidement.' })).includes('handicap'))
})

test('related editorial content alone cannot attribute a subject to an interview', () => {
  assert.equal(analyzeEpisode(episode(1, { editorial: ['Handicap et inclusion. Le handicap est visible. L’inclusion est nécessaire.'] })).themes.length, 0)
})

test('sparse interviews are not padded with invented themes or unrelated cards', () => {
  const index = createRecommendationIndex([episode(1, { title: 'Handicap dans la danse' }), episode(2, { title: 'Créer un spectacle' })])
  assert.equal(index.profiles.get(1)!.themes.length, 1)
  assert.equal(index.profiles.get(1)!.needsEditorialReview, true)
  assert.deepEqual(recommendEpisodes(1, index, 3, {}), [])
})

test('adding a hundred historical tags does not change scores or order', () => {
  const inputs = [episode(1, { title: 'Handicap et inclusion' }), episode(2, { title: 'Handicap dans la danse' }), episode(3, { title: 'Inclusion dans la danse' })]
  const baseline = recommendEpisodes(1, createRecommendationIndex(inputs), 3, {})
  inputs[1].tags = Array(100).fill('handicap')
  assert.deepEqual(recommendEpisodes(1, createRecommendationIndex(inputs), 3, {}), baseline)
})

test('ties are deterministic, independent of catalogue order and not recency-based', () => {
  const inputs = Array.from({ length: 12 }, (_, i) => episode(i + 1, { title: 'Handicap dans la danse' }))
  const a = recommendEpisodes(1, createRecommendationIndex(inputs), 3, {})
  assert.deepEqual(a, recommendEpisodes(1, createRecommendationIndex([...inputs].reverse()), 3, {}))
  assert.notDeepEqual(a.map(r => r.number), [12, 11, 10])
})

test('real regressions: workload ≠ law; generic introductions ≠ interview subjects', () => {
  assert.ok(!keys(episodes.find(e => e.number === 43)!).includes('droits'))
  const jey = keys(episodes.find(e => e.number === 113)!)
  assert.ok(!jey.includes('droits'))
  assert.ok(!jey.includes('carriere'))
  assert.ok(jey.includes('identite'))
})

test('Mylène: mental health outranks a briefly outlined secondary theme', () => {
  const index = createRecommendationIndex([
    episode(122, { title: 'Peut-on réussir sans sacrifier sa santé mentale ?', description: 'La dépression a bouleversé sa vie.\nOn a aussi abordé la maternité.' }),
    episode(1, { title: 'Parlons de santé mentale et de dépression' }), episode(2, { title: 'Maternité dans la danse' }),
  ])
  assert.equal(recommendEpisodes(122, index, 3, {})[0].number, 1)
})

const card = (input: RecommendationInput): UnifiedEpisode => ({ ...input, guest: 'Invité', duration: '', image: '/image.png', aushaImage: '', excerpt: input.excerpt ?? '', description: input.description ?? '', quote: input.quote ?? '', link: '', pubDate: '', youtubeId: null, spotifyEmbedUrl: '', fromRSS: input.number >= 122 })

test('historical full descriptions and new RSS are compared bidirectionally', () => {
  const legacy = episodes.filter(e => [22, 25].includes(e.number))
  const catalog = [...legacy.map(e => card({ ...e, description: '' })), card(wilfried)]
  const inputs = buildRecommendationInputs(catalog, legacy, [])
  assert.equal(inputs.find(e => e.number === 22)!.description, legacy.find(e => e.number === 22)!.description)
  const index = createRecommendationIndex(inputs)
  for (const number of [22, 25]) assert.ok(recommendEpisodes(number, index).some(r => r.number === 128))
  assert.deepEqual(recommendEpisodes(128, index).slice(0, 2).map(r => r.number), [22, 25])
})

test('adapter excludes drafts, future articles and cross-links; reads RSS timecodes', () => {
  const base = { slug: 'article', status: 'published', publishedAt: '2020-01-01', episodeSlug: 'episode-1', episodeNumber: '1', title: 'Handicap', chapo: 'Inclusion', sections: [], conclusion: '' } as MagazineArticle
  const inputs = buildRecommendationInputs([card(episode(1, { description: '00:00 Introduction\n12:30 Handicap et accessibilité\n35:20 Droits des artistes' }))], [], [
    { ...base, status: 'draft' }, { ...base, publishedAt: '2999-01-01' },
    { ...base, episodeSlug: 'episode-2', episodeNumber: '2', episodeLinks: [{ name: 'Invité', slug: 'episode-1', number: '1', image: '' }] }, base,
  ])
  assert.equal(inputs[0].editorial!.length, 1)
  assert.equal(inputs[0].chapters!.length, 3)
  assert.ok(keys(inputs[0]).includes('handicap'))
})
