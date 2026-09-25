import test from 'node:test'
import assert from 'node:assert/strict'
import { magazineArticles } from '../app/decouvrir/articles-data'
import { episodes } from '../data/episodes'
import { getArticleEpisodeLinks, regenerateArticleAssociations, selectArticleEpisodes } from '../lib/article-episode-associations'
import { buildSidebarFrames } from '../lib/article-sidebar'

const article = (slug: string) => magazineArticles.find(item => item.slug === slug)!

test('carrière durable retains the same four editorial episodes', () => {
  const protectedArticle = article('construire-carriere-danseur-durable')
  const expected = [118, 117, 116, 114]
  assert.deepEqual(getArticleEpisodeLinks(protectedArticle).map(link => Number(link.number)), expected)
  assert.deepEqual(regenerateArticleAssociations(protectedArticle, episodes, true).episodeLinks, protectedArticle.episodeLinks)
})

test('social article no longer suggests generic career episodes', () => {
  const social = article('reseaux-sociaux-obligatoires-danseur')
  assert.deepEqual(getArticleEpisodeLinks(social).map(link => Number(link.number)), [1, 43, 72])
  assert.deepEqual(buildSidebarFrames(social)[0].episodes?.map(link => Number(link.number)), [1, 43, 72])
})

test('empty recommendations stay empty and manual selections survive regeneration', () => {
  const waacking = article('comprendre-le-waacking-histoire-culture-influences')
  assert.deepEqual(getArticleEpisodeLinks(waacking), [])
  assert.ok(buildSidebarFrames(waacking).every(frame => !frame.episodes))
  const manual = { ...waacking, episodeLinks: [], episodeLinksMode: 'manual' as const }
  assert.equal(regenerateArticleAssociations(manual, episodes), manual)
})

test('new articles only persist evidenced matches and retain full card data', () => {
  const social = article('reseaux-sociaux-obligatoires-danseur')
  assert.ok(selectArticleEpisodes(social).includes(1))
  const regenerated = regenerateArticleAssociations({ ...social, slug: 'nouvel-article', episodeLinks: undefined }, episodes)
  assert.equal(regenerated.episodeLinksMode, 'auto')
  assert.equal(regenerated.episodeLinks?.[0]?.slug, episodes.find(ep => ep.number === Number(regenerated.episodeLinks?.[0]?.number))?.slug)
  assert.ok(regenerated.episodeLinks?.[0]?.image)
})
