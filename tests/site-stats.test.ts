import { test } from 'node:test'
import assert from 'node:assert/strict'
import { COMING_SOON_FIXED_STATS, conversationMilestone } from '../data/site-stats'

test('le compteur de conversations affiche toujours la dizaine complète inférieure', () => {
  assert.equal(conversationMilestone(128), '+120')
  assert.equal(conversationMilestone(129), '+120')
  assert.equal(conversationMilestone(130), '+130')
  assert.equal(conversationMilestone(140), '+140')
})

test('les écoutes et vues viennent de la source centralisée', () => {
  assert.deepEqual(COMING_SOON_FIXED_STATS, {
    cumulativeListens: '+400 000',
    cumulativeViews: '+2 MILLIONS',
  })
})
