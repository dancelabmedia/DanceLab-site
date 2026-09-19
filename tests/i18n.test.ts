import { test } from 'node:test'
import assert from 'node:assert/strict'
import { NextRequest } from 'next/server'
import { localeFromPath, sourcePath, localizedHref, safeLanguageTarget, hasPublishedEnglish } from '../lib/i18n/routing'
import { sourceHash, mergeTranslation, translationQueue, translationStatus, translatedField, prepareAutomaticTranslation } from '../lib/i18n/translations'
import { translationSources, explorerSource } from '../lib/i18n/catalog'
import { readTranslation, translationFile } from '../lib/i18n/store'
import { middleware } from '../middleware'

test('URLs FR inchangées, EN préfixé ; même fiche, paramètres et ancre dans les deux sens', () => {
  for (const href of ['/', '/explorer', '/explorer/styles-de-danse/break?style=house#origines', '/episodes/127-waabee', '/recherche?q=danse%20classique', '/acces-prive?redirect=%2Fexplorer%2Fartistes']) {
    assert.equal(localizedHref(href, 'fr'), href)
    const english = localizedHref(href, 'en')
    assert.equal(localizedHref(english, 'en'), english)
    assert.equal(localizedHref(english, 'fr'), href)
  }
  assert.equal(localeFromPath('/en/explorer'), 'en')
  assert.equal(localeFromPath('/enfant'), 'fr')
  assert.equal(sourcePath('/en'), '/')
  for (const href of ['https://instagram.com/dancelab', '//example.com', '#origines', '/images/fond3.png', '/api/agenda', '/admin/articles']) assert.equal(localizedHref(href, 'en'), href)
  for (const href of ['//evil.test', '/\\evil.test', 'https://evil.test', '/en//evil.test', '/en/%5cevil.test', '/api/language', '/en/admin', '/explorer/../admin', '/%00', '/%ZZ']) assert.equal(safeLanguageTarget(href), null)
})

test('cache par source : import unique, invalidation au changement et sortie machine non publiée', () => {
  const source = { id: 'episode-127', fields: { summary: 'WaaBee parle de danse.' }, protectedTerms: ['WaaBee'] }
  const field = { text: 'WaaBee talks about dance.', sourceHash: sourceHash(source.fields.summary) }
  const cached = mergeTranslation(source, undefined, { sourceId: source.id, fields: { summary: field } })
  assert.equal(translationQueue(source, cached).length, 0)
  assert.equal(translationStatus(source, cached)[0].status, 'review')
  assert.equal(translatedField(source, cached, 'summary'), undefined)
  assert.equal(translationQueue({ ...source, fields: { summary: 'WaaBee parle des battles.' } }, cached).length, 1)
  assert.throws(() => mergeTranslation(source, cached, { sourceId: source.id, fields: { summary: { ...field, sourceHash: 'old' } } }), /Source modifiée/)
})

test('correction manuelle verrouillée, conservée après génération ou changement du français', () => {
  const source = { id: 'episode-127', fields: { summary: 'WaaBee parle de danse.' }, protectedTerms: ['WaaBee'] }
  const batch = { sourceId: source.id, fields: { summary: { text: 'An interview with WaaBee about dance.', sourceHash: sourceHash(source.fields.summary) } } }
  const manual = mergeTranslation(source, undefined, batch, true)
  const later = mergeTranslation(source, manual, { ...batch, fields: { summary: { ...batch.fields.summary, text: 'Changed by machine: WaaBee.' } } })
  assert.deepEqual(later, manual)
  const changed = { ...source, fields: { summary: 'WaaBee décrit sa préparation.' } }
  assert.equal(translationQueue(changed, later).length, 0)
  assert.equal(translationStatus(changed, later)[0].status, 'stale')
  assert.equal(later.fields.summary.text, batch.fields.summary.text)
})

test('noms, titres officiels et identifiants hors traduction ; noms cités protégés', () => {
  const sources = translationSources()
  assert.equal(new Set(sources.map(source => source.id)).size, sources.length)
  for (const source of sources) for (const key of Object.keys(source.fields)) assert.ok(!/^(slug|guest|image|siteWeb|lat|lng|adresse|programmes)$/.test(key))
  for (const source of sources.filter(source => source.id.startsWith('episode-'))) assert.ok(!Object.hasOwn(source.fields, 'title'))
  const source = { id: 'test', fields: { summary: 'Une rencontre avec WaaBee.' }, protectedTerms: ['WaaBee'] }
  assert.throws(() => mergeTranslation(source, undefined, { sourceId: 'test', fields: { summary: { text: 'A conversation with someone else.', sourceHash: sourceHash(source.fields.summary) } } }), /Appellation/)
  assert.throws(() => translationFile('../secret'), /invalide/)
})

test('aucun appel sans fournisseur autorisé et aucun appel pour une traduction déjà cachée', async () => {
  const source = explorerSource(), doc = readTranslation(source.id)
  assert.equal(translationStatus(source, doc).every(field => field.status === 'ready'), true)
  let calls = 0
  await prepareAutomaticTranslation(source, doc, { translate: async () => { calls++; throw new Error('Unexpected API call') } })
  assert.equal(calls, 0)
  await assert.rejects(prepareAutomaticTranslation({ ...source, id: 'new-document' }, undefined), /Aucun fournisseur/)
  assert.ok(hasPublishedEnglish('/explorer'))
  assert.ok(!hasPublishedEnglish('/episodes/127-waabee'))
})

test("middleware : langue derivee de l'URL ou du cookie, aucun contournement des routes privees EN", async () => {
  // /en/* paths always resolve to English regardless of cookie
  const english = await middleware(new NextRequest('https://example.test/en/explorer', { headers: { 'x-dancelab-locale': 'fr', 'x-dancelab-path': '/admin' } }))
  assert.equal(english.headers.get('x-middleware-request-x-dancelab-locale'), 'en')
  assert.equal(english.headers.get('x-middleware-request-x-dancelab-path'), '/en/explorer')
  // Cookie preference is now respected on non-/en/ paths
  const cookieEn = await middleware(new NextRequest('https://example.test/explorer', { headers: { Cookie: 'dancelab_locale=en', 'x-dancelab-locale': 'en' } }))
  assert.equal(cookieEn.headers.get('x-middleware-request-x-dancelab-locale'), 'en')
  // Without EN cookie, French URL stays French
  const cookieFr = await middleware(new NextRequest('https://example.test/explorer', { headers: { Cookie: 'dancelab_locale=fr' } }))
  assert.equal(cookieFr.headers.get('x-middleware-request-x-dancelab-locale'), 'fr')
  // Homepage with EN cookie renders in English (no redirect to /en — locale is cookie-based)
  const home = await middleware(new NextRequest('https://example.test/', { headers: { Cookie: 'dancelab_locale=en' } }))
  assert.equal(home.headers.get('x-middleware-request-x-dancelab-locale'), 'en')
  assert.ok(!home.headers.get('location'))
  for (const path of ['/en/explorer/styles-de-danse/break', '/en/explorer/metiers-de-la-danse', '/en/explorer/ecoles-de-danse/fiche', '/en/explorer/artistes', '/en/apprendre/guides']) {
    const response = await middleware(new NextRequest('https://example.test' + path))
    assert.equal(response.status, 307)
    assert.ok(new URL(response.headers.get('location')!).pathname.startsWith('/en/'))
    assert.ok(response.headers.get('x-robots-tag')?.includes('noindex'))
  }
  assert.equal((await middleware(new NextRequest('https://example.test/en/admin/articles'))).status, 404)
})
