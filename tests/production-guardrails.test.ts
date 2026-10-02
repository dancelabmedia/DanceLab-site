import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { episodesList } from '../data/episodes-list'
import { magazineArticles } from '../app/decouvrir/articles-data'
import { SITE_URL } from '../data/site'
import { explorerAccessSections } from '../data/section-visibility'
import { episodeExtras } from '../data/episode-extras'

test('le domaine canonique est public et jamais un domaine technique Vercel', () => {
  assert.equal(SITE_URL, 'https://dancelab.fr')
  assert.ok(!SITE_URL.includes('vercel.app'))
})

test('les données essentielles des épisodes historiques sont valides', () => {
  const seen = new Set<number>()
  for (const episode of episodesList) {
    assert.ok(Number.isInteger(episode.number) && episode.number > 0)
    assert.ok(!seen.has(episode.number), `épisode dupliqué : ${episode.number}`)
    seen.add(episode.number)
    for (const [field, value] of Object.entries({ slug: episode.slug, title: episode.title, guest: episode.guest, image: episode.image })) {
      assert.ok(typeof value === 'string' && value.trim(), `épisode ${episode.number}: ${field} absent`)
    }
  }
})

test('les données essentielles des articles sont valides', () => {
  const seen = new Set<string>()
  for (const article of magazineArticles) {
    assert.ok(article.slug && article.title && article.category && article.image)
    assert.ok(!seen.has(article.slug), `slug article dupliqué : ${article.slug}`)
    seen.add(article.slug)
    assert.ok(!Number.isNaN(Date.parse(article.publishedAt)), `${article.slug}: publishedAt invalide`)
    assert.ok(Array.isArray(article.sections), `${article.slug}: sections invalides`)
  }
})

test('les routes privées sont absentes de llms.txt et filtrées du sitemap', () => {
  const llms = readFileSync('public/llms.txt', 'utf8')
  const sitemapSource = readFileSync('app/sitemap.ts', 'utf8')
  for (const section of explorerAccessSections) assert.ok(!llms.includes(section.path), `${section.path} exposée dans llms.txt`)
  assert.match(sitemapSource, /sectionVisibility\[section\.key\] === 'public'/)
  assert.match(sitemapSource, /explorerHomeVisibility === 'public'/)
})

test('les titres éditoriaux corrigés remplacent toujours les titres RSS', () => {
  assert.equal(episodeExtras[130]?.title, "Est-ce qu'on danse pour soi ou pour correspondre ?")
  assert.equal(episodeExtras[128]?.title, 'Danse et handicap : le milieu est-il vraiment inclusif ?')
  assert.equal(episodeExtras[125]?.title, 'Quelle place pour les femmes dans la danse, le hip-hop et les cultures club ?')
  assert.equal(episodeExtras[123]?.title, 'Comment se démarquer quand tout le monde est talentueux ?')
})
