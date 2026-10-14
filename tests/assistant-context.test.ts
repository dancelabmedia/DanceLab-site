import { test } from 'node:test'
import assert from 'node:assert/strict'
import { findRelevantContent, generateEditorialPresentation, generateEditorialResponse, generateFollowUps, questionIntentFingerprint } from '../data/assistant-retrieval'
import type { AssistantItem } from '../data/assistant-index'

const items: AssistantItem[] = [
  { id: 'career', type: 'article', title: 'Construire une carrière durable', href: '/decouvrir/articles/carriere', excerpt: 'Carrière et professionnalisation', searchText: 'carriere professionnalisation contrats reseau', tags: ['carrière', 'professionnalisation', 'contrats'] },
  { id: 'network', type: 'episode', title: 'Développer son réseau professionnel', href: '/episodes/reseau', excerpt: 'Rencontres et collaborations', searchText: 'reseau professionnel collaboration opportunites carriere', tags: ['réseau professionnel', 'collaboration', 'carrière'] },
  { id: 'health', type: 'article', title: 'Prévenir les blessures', href: '/decouvrir/articles/blessures', excerpt: 'Santé du danseur', searchText: 'blessures prevention recuperation sante', tags: ['blessures', 'prévention', 'santé du danseur'] },
]

const fundingItems: AssistantItem[] = [
  { id: 'social', type: 'episode', title: 'Réseaux sociaux et opportunités', href: '/episodes/social', excerpt: 'Développer sa visibilité', recommendationEvidence: 'reseaux sociaux opportunites visibilite', searchText: 'reseaux sociaux opportunites argent projet danse', tags: ['visibilité'] },
  { id: 'money', type: 'episode', title: 'Le rapport à l’argent', href: '/episodes/money', excerpt: 'Dépasser ses blocages personnels', recommendationEvidence: 'rapport argent croyances personnelles', searchText: 'argent financement danse', tags: ['argent'] },
  { id: 'validation', type: 'episode', title: 'La validation des autres', href: '/episodes/validation', excerpt: 'Confiance et regard extérieur', recommendationEvidence: 'validation confiance regard autres', searchText: 'projet creation artiste', tags: ['confiance'] },
  { id: 'subventions', type: 'episode', title: 'Créer un spectacle sans subventions', href: '/episodes/subventions', excerpt: 'Financement, mécénat et production', recommendationEvidence: 'spectacle subventions financement mecenat production crowdfunding', searchText: 'spectacle subventions financement mecenat production crowdfunding', tags: ['financement', 'subvention'] },
  { id: 'production', type: 'metier', title: 'Chargé.e de production', href: '/metiers/production', excerpt: 'Dossiers de subvention, budgets et institutions', recommendationEvidence: 'dossiers subvention budgets institutions financement', searchText: 'dossiers subvention budgets institutions financement', tags: ['Produire & diffuser'] },
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

test('les subventions au pluriel déclenchent le financement et excluent les faux positifs', () => {
  const results = findRelevantContent('Comment trouver des subventions pour un projet danse ?', fundingItems)
  assert.deepEqual(results.map(item => item.id), ['subventions', 'production'])
  assert.ok(!results.some(item => ['social', 'money', 'validation'].includes(item.id)))
})

test('le financement reçoit un vrai titre et une réponse utile avant les ressources', () => {
  const query = 'Comment trouver des subventions pour un projet danse ?'
  const results = findRelevantContent(query, fundingItems)
  const presentation = generateEditorialPresentation(query, results)
  const response = generateEditorialResponse(query, results)
  assert.equal(presentation.heading, 'Comment financer un projet chorégraphique ?')
  assert.match(response, /DRAC ou de la DAC/i)
  assert.doesNotMatch(response, /Voici les contenus Dance Lab les plus proches/i)
})

test('un tag seul ne suffit pas à recommander un contenu', () => {
  const misleading: AssistantItem = {
    id: 'tag-only', type: 'episode', title: 'Trouver sa confiance', href: '/episodes/confiance',
    excerpt: 'Un parcours personnel', recommendationEvidence: 'confiance parcours personnel',
    searchText: 'confiance parcours personnel financement', tags: ['financement'],
  }
  assert.deepEqual(findRelevantContent('Comment financer un projet danse ?', [misleading]), [])
})

test('une mention isolée de l’intermittence dans une longue description est insuffisante', () => {
  const passingMention: AssistantItem = {
    id: 'legitimite', type: 'episode', title: 'Trouver sa légitimité artistique', href: '/episodes/legitimite',
    excerpt: 'Une conversation sur la confiance', recommendationEvidence: 'confiance parcours danseur intermittent une fois dans le parcours',
    searchText: 'confiance parcours danseur intermittent', tags: ['intermittence'],
  }
  assert.deepEqual(findRelevantContent("Qu'est-ce que l'intermittence du spectacle ?", [passingMention]), [])
})

test('les suggestions sur l’intermittence sont précises et le secours générique est supprimé', () => {
  assert.deepEqual(generateFollowUps("Qu'est-ce que l'intermittence du spectacle ?"), [
    'Comment obtenir les 507 heures ?',
    'Quelle différence entre les annexes 8 et 10 ?',
    'Comment fonctionne le renouvellement des droits ?',
  ])
  assert.deepEqual(generateFollowUps('Une question totalement inconnue'), [])
})

test('une question déjà affichée ne réapparaît pas dans la conversation', () => {
  const firstSuggestions = generateFollowUps("Qu'est-ce que l'intermittence du spectacle ?")
  const nextSuggestions = generateFollowUps("Qu'est-ce que l'intermittence du spectacle ?", {
    excludedQuestions: firstSuggestions,
  })

  assert.deepEqual(nextSuggestions, [
    'Comment déclarer ses cachets et ses heures ?',
    'Quels contrats comptent pour l’intermittence ?',
    'Que faire en cas de période sans contrat ?',
  ])
  assert.ok(nextSuggestions.every(question => !firstSuggestions.includes(question)))
})

test('les reformulations d’une intention déjà suggérée sont reconnues', () => {
  assert.equal(
    questionIntentFingerprint('Comment obtenir les 507 heures ?'),
    questionIntentFingerprint('Comment cumuler 507 heures ?'),
  )

  const suggestions = generateFollowUps("Qu'est-ce que l'intermittence du spectacle ?", {
    excludedQuestions: ['Comment cumuler 507 heures ?'],
  })
  assert.ok(!suggestions.includes('Comment obtenir les 507 heures ?'))
})

test('le générateur ne force pas trois suggestions lorsque le sujet est épuisé', () => {
  const allButOne = [
    'Comment obtenir les 507 heures ?',
    'Quelle différence entre les annexes 8 et 10 ?',
    'Comment fonctionne le renouvellement des droits ?',
    'Comment déclarer ses cachets et ses heures ?',
    'Quels contrats comptent pour l’intermittence ?',
  ]
  assert.deepEqual(
    generateFollowUps("Qu'est-ce que l'intermittence du spectacle ?", { excludedQuestions: allButOne }),
    ['Que faire en cas de période sans contrat ?'],
  )
})
