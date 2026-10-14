import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { episodesList } from '../data/episodes-list'
import { magazineArticles } from '../app/decouvrir/articles-data'
import { SITE_URL } from '../data/site'
import { explorerAccessSections } from '../data/section-visibility'
import { episodeExtras } from '../data/episode-extras'
import { AUSHA_GUID_BY_EPISODE_NUMBER } from '../data/episode-ausha-guids'
import { matchReelToEpisode, type InstagramReel } from '../lib/instagram-api'
import { resolveEpisodeGuest } from '../lib/episodes'
import { extractGuestFromDescription, isGenericGuestLabel, parseRssChapters } from '../lib/ausha-rss'
import { youtubeVideoMatchesEpisode, type YoutubeVideo } from '../lib/youtube-rss'
import { cleanEpisodeTitle } from '../lib/episode-title'

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

test('les noms réels des invité.es ne sont jamais remplacés par un libellé générique', () => {
  assert.equal(episodeExtras[122]?.guest, 'Mylène Amboka')
  assert.equal(resolveEpisodeGuest('Invité·e', 'Mylène Amboka'), 'Mylène Amboka')
  assert.equal(resolveEpisodeGuest('Invité.e', 'Laëtitia Simon'), 'Laëtitia Simon')
  assert.equal(resolveEpisodeGuest('Samuela Berdah et Raphaëlle Petitperrin', 'Invité.e'), 'Samuela Berdah et Raphaëlle Petitperrin')
})

test('un invité absent du titre peut être extrait prudemment de la description Ausha', () => {
  const description = "Pour répondre à ces questions, je reçois Raphaëlle Petitperrin et Samuela Berdah, juristes au CND."
  assert.equal(extractGuestFromDescription(description), 'Raphaëlle Petitperrin et Samuela Berdah')
  assert.equal(isGenericGuestLabel('Invité·e'), true)
  assert.equal(isGenericGuestLabel('Mylène Amboka'), false)
})

test('le suffixe invité est retiré sans supprimer un avec légitime dans le titre', () => {
  assert.equal(
    cleanEpisodeTitle('Danse et handicap : le milieu est-il vraiment inclusif ? avec Wilfried Bernard', 'Wilfried Bernard'),
    'Danse et handicap\u00a0: le milieu est-il vraiment inclusif\u00a0?',
  )
  assert.equal(cleanEpisodeTitle('Danser avec le cœur', 'Mylène Amboka'), 'Danser avec le cœur')
})

test('les Reels Instagram 131 et 132 sont associés à leurs GUID Ausha stables', () => {
  assert.equal(episodeExtras[131]?.instagramReelUrl, 'https://www.instagram.com/reel/DeKYA-ix0En/')
  assert.equal(episodeExtras[131]?.aushaGuid, AUSHA_GUID_BY_EPISODE_NUMBER[131])
  assert.equal(episodeExtras[132]?.instagramReelUrl, 'https://www.instagram.com/reel/DecWLeNIUyM/')
  assert.equal(episodeExtras[132]?.aushaGuid, AUSHA_GUID_BY_EPISODE_NUMBER[132])
})

test('l\'association Instagram automatique refuse un numéro d\'épisode seul', () => {
  const reel = (caption: string): InstagramReel => ({
    id: 'instagram-test',
    permalink: 'https://www.instagram.com/reel/test/',
    caption,
    timestamp: '2026-10-10T00:00:00Z',
    media_type: 'VIDEO',
  })

  assert.equal(matchReelToEpisode([reel('Nouvel extrait de l\'épisode 131')], 131, 'Samuela Berdah'), null)
  assert.equal(
    matchReelToEpisode([reel('Épisode 131 avec Samuela Berdah')], 131, 'Samuela Berdah'),
    'https://www.instagram.com/reel/test/',
  )
})

test('les chapitres Ausha Podcasting 2.0 sont intégrés sans intervention manuelle', () => {
  const xml = '<psc:chapters><psc:chapter start="75" title="Première partie"/><psc:chapter start="01:12:03" title="Conclusion" url="https://example.test/chapter"/></psc:chapters>'
  assert.deepEqual(parseRssChapters(xml), [
    { time: '1:15', title: 'Première partie' },
    { time: '01:12:03', title: 'Conclusion', url: 'https://example.test/chapter' },
  ])
})

test('YouTube exige un numéro et une correspondance éditoriale', () => {
  const video = (title: string): YoutubeVideo => ({
    videoId: 'abcdefghijk', title, published: '2026-10-14', episodeNumber: 132, isShort: false,
  })
  const episode = { number: 132, title: "Ce qu'on ne nous apprend pas pour réussir dans la danse", guest: 'Shaun Bui' }
  assert.equal(youtubeVideoMatchesEpisode(video('EP 132 - un contenu sans rapport'), episode), false)
  assert.equal(youtubeVideoMatchesEpisode(video('132. Réussir dans la danse avec Shaun Bui'), episode), true)
})

test('le cron média continue à rechercher les associations partielles', () => {
  const source = readFileSync('app/api/cron/match-teasers/route.ts', 'utf8')
  assert.match(source, /hasYoutube && hasInstagram/)
  assert.match(source, /guid:\$\{ep\.guid\}/)
})
