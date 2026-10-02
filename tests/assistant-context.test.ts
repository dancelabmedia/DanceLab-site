import { test } from 'node:test'
import assert from 'node:assert/strict'
import { findRelevantContent, generateEditorialResponse, generateFollowUps } from '../data/assistant-retrieval'
import type { AssistantItem } from '../data/assistant-index'

const items: AssistantItem[] = [
  { id: 'career', type: 'article', title: 'Construire une carrière durable', href: '/decouvrir/articles/carriere', excerpt: 'Carrière et professionnalisation', searchText: 'carriere professionnalisation contrats reseau', tags: ['carrière', 'professionnalisation', 'contrats'] },
  { id: 'network', type: 'episode', title: 'Développer son réseau professionnel', href: '/episodes/reseau', excerpt: 'Rencontres et collaborations', searchText: 'reseau professionnel collaboration opportunites carriere', tags: ['réseau professionnel', 'collaboration', 'carrière'] },
  { id: 'health', type: 'article', title: 'Prévenir les blessures', href: '/decouvrir/articles/blessures', excerpt: 'Santé du danseur', searchText: 'blessures prevention recuperation sante', tags: ['blessures', 'prévention', 'santé du danseur'] },
]

test('la dernière question pilote le sujet et exclut les contenus santé hors sujet', () => {
  const result = findRelevantContent('Comment construire une carrière durable dans la danse ?', items)
  assert.equal(result[0]?.id, 'career')
  assert.ok(!result.some(item => item.id === 'health'))
})

test('une question de suivi précise change réellement les résultats', () => {
  const initial = findRelevantContent('Comment construire une carrière durable dans la danse ?', items)
  const followUp = findRelevantContent('Comment développer son réseau professionnel ?', items)
  assert.notDeepEqual(followUp.map(item => item.id), initial.map(item => item.id))
  assert.equal(followUp[0]?.id, 'network')
})

test('les recommandations récentes ne sont pas reproposées immédiatement', () => {
  const result = findRelevantContent('Comment développer son réseau professionnel ?', items, 4, { recentResultIds: ['network'] })
  assert.ok(!result.some(item => item.id === 'network'))
})

test('la réponse de suivi progresse sans répéter la réponse précédente', () => {
  const first = generateEditorialResponse('Comment construire une carrière durable ?', [items[0]])
  const second = generateEditorialResponse('Comment développer son réseau professionnel ?', [items[1]], [
    { role: 'user', content: 'Comment construire une carrière durable ?' },
    { role: 'assistant', content: first, resultIds: ['career'] },
  ])
  assert.notEqual(second, first)
  assert.match(second, /réseau professionnel se construit/i)
  assert.doesNotMatch(second, /plusieurs piliers en parallèle/i)
})

test('les suggestions suivent la réponse courante et non la catégorie initiale', () => {
  assert.deepEqual(generateFollowUps('Comment développer son réseau professionnel ?'), [
    'Comment contacter un chorégraphe sans être intrusif ?',
    'Comment transformer une rencontre en opportunité ?',
    'Les réseaux sociaux sont-ils indispensables ?',
  ])
})
