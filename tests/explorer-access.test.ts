import { test } from 'node:test'
import assert from 'node:assert/strict'
import { randomBytes } from 'node:crypto'
import { NextRequest } from 'next/server'
import { sectionForPath, isPrivateSectionPath, safeExplorerReturnTo, sectionVisibility, explorerAccessSections } from '../data/section-visibility'
import { createExplorerSession, validExplorerSession, matchesExplorerCode, EXPLORER_SESSION_SECONDS } from '../lib/explorer-session'
import { createExplorerRateLimiter } from '../lib/explorer-rate-limit'
import { middleware } from '../middleware'
import { searchIndex } from '../data/search-index'
import { privateAccessScope, publicNavigationHref } from '../data/private-navigation'
import { isLocalEditorAccess } from '../lib/local-editor-access'

// Valeurs éphémères de test, jamais enregistrées et jamais utilisées comme code réel.
test('session signée : bon code, mauvais code, falsification, expiration et rotation', async () => {
  const secret = randomBytes(32).toString('hex')
  const now = Date.now()
  assert.ok(await matchesExplorerCode(secret, secret))
  assert.ok(!await matchesExplorerCode('incorrect', secret))
  const token = await createExplorerSession(secret, now)
  assert.ok(!token.includes(secret))
  assert.ok(await validExplorerSession(token, secret, now))
  assert.ok(!await validExplorerSession(token, null, now))
  assert.ok(!await validExplorerSession(token, 'changed', now))
  assert.ok(!await validExplorerSession(token, secret, now + EXPLORER_SESSION_SECONDS * 1000))
  assert.ok(!await validExplorerSession(token.slice(0, -1) + (token.endsWith('0') ? '1' : '0'), secret, now))
  for (const invalid of [undefined, '', 'preview_access', '../', 'a'.repeat(1000)]) assert.ok(!await validExplorerSession(invalid, secret, now))
})

test('les trois familles de routes, leurs fiches et futures sous-pages sont privées', () => {
  for (const section of explorerAccessSections) {
    for (const suffix of ['', '/', '/fiche', '/fiche/detail?test=1']) assert.ok(isPrivateSectionPath(section.path + suffix))
    assert.equal(sectionForPath(section.path)?.key, section.key)
    assert.ok(!isPrivateSectionPath(section.path + '-autre'))
  }
  assert.ok(isPrivateSectionPath('/explorer/%73tyles-de-danse/break'))
  for (const path of ['/', '/explorer', '/explorer/acces-prive', '/decouvrir', '/episodes/128-wilfried-bernard']) assert.ok(!isPrivateSectionPath(path))
})

test('redirection limitée aux rubriques Explorer, sans redirection externe', () => {
  const fallback = explorerAccessSections[0].path
  for (const input of [null, '//evil.test', '/\\evil.test', 'https://evil.test', '/explorer/styles-de-danse/../../admin', '/%00', '/explorer/%ZZ']) assert.equal(safeExplorerReturnTo(input), fallback)
  assert.equal(safeExplorerReturnTo('/explorer/styles-de-danse/break?view=1#origines'), '/explorer/styles-de-danse/break?view=1#origines')
})

test('Bientôt couvre aussi toutes les anciennes pages protégées et leurs sous-routes', () => {
  for (const path of ['/sortir', '/apprendre/guides', '/apprendre/conseils', '/apprendre/formations', '/apprendre/outils', '/explorer/artistes', '/explorer/choregraphes', '/explorer/compagnies']) {
    assert.equal(privateAccessScope(path), 'preview')
    assert.equal(privateAccessScope(path + '/une-fiche'), 'preview')
  }
  assert.equal(privateAccessScope('/decouvrir'), null)
  assert.equal(privateAccessScope('/apprendre-autre'), null)
  assert.equal(privateAccessScope('/explorer/styles-de-danse'), 'explorer')
})

test('édition locale : option explicite, hôte loopback strict, impossible en production ou Vercel', () => {
  const previous = { NODE_ENV: process.env.NODE_ENV, DANCELAB_LOCAL_EDITOR: process.env.DANCELAB_LOCAL_EDITOR, VERCEL: process.env.VERCEL }
  try {
    Object.assign(process.env, { NODE_ENV: 'development', DANCELAB_LOCAL_EDITOR: '1' })
    delete process.env.VERCEL
    for (const host of ['localhost:3010', '127.0.0.1:3010', '[::1]:3010']) assert.ok(isLocalEditorAccess(new Headers({ host })))
    for (const host of ['localhost.evil.test', '127.0.0.1.evil.test', 'dancelabmedia.vercel.app', '192.168.1.2', '']) assert.ok(!isLocalEditorAccess(new Headers({ host })))
    process.env.DANCELAB_LOCAL_EDITOR = '0'
    assert.ok(!isLocalEditorAccess(new Headers({ host: 'localhost:3010' })))
    process.env.DANCELAB_LOCAL_EDITOR = '1'
    process.env.VERCEL = '1'
    assert.ok(!isLocalEditorAccess(new Headers({ host: 'localhost:3010' })))
    delete process.env.VERCEL
    Object.assign(process.env, { NODE_ENV: 'production' })
    assert.ok(!isLocalEditorAccess(new Headers({ host: 'localhost:3010' })))
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key]
      else process.env[key] = value
    }
  }
})

test('chaque rubrique peut être publiée indépendamment et la recherche publique reste filtrée', () => {
  assert.ok(searchIndex.every(item => !isPrivateSectionPath(item.href)))
  for (const section of explorerAccessSections) {
    try {
      sectionVisibility[section.key] = 'public'
      assert.ok(!isPrivateSectionPath(section.path + '/fiche'))
      assert.equal(publicNavigationHref(section.path), section.path)
      assert.equal(publicNavigationHref(section.path + '/fiche'), section.path + '/fiche')
      for (const other of explorerAccessSections.filter(item => item !== section)) assert.ok(isPrivateSectionPath(other.path))
    } finally { sectionVisibility[section.key] = 'private' }
    assert.ok(publicNavigationHref(section.path).startsWith('/explorer/acces-prive?returnTo='))
  }
})

test('limite cinq tentatives par fenêtre, quota global et expiration', () => {
  const limit = createExplorerRateLimiter()
  for (let i = 0; i < 5; i++) assert.equal(limit('ip', 1000), 0)
  assert.equal(limit('ip', 1000), 900)
  assert.equal(limit('other-ip', 1000), 0)
  assert.equal(limit('ip', 901000), 0)
  const globalLimit = createExplorerRateLimiter()
  for (let i = 0; i < 100; i++) assert.equal(globalLimit(`ip-${i}`, 1000), 0)
  assert.equal(globalLimit('new-ip', 1000), 900)
})

test('middleware fermé sans secret : routes, fiches, requêtes RSC et préchargements', async () => {
  const previous = process.env.EXPLORER_ACCESS_CODE
  delete process.env.EXPLORER_ACCESS_CODE
  try {
    for (const section of explorerAccessSections) {
      const response = await middleware(new NextRequest(`https://example.test${section.path}/fiche?_rsc=1`, { headers: { RSC: '1', 'next-router-prefetch': '1' } }))
      assert.equal(response.status, 307)
      assert.equal(new URL(response.headers.get('location')!).pathname, '/explorer/acces-prive')
      assert.match(response.headers.get('x-robots-tag')!, /noindex/)
      assert.match(response.headers.get('cache-control')!, /no-store/)
    }
  } finally {
    if (previous === undefined) delete process.env.EXPLORER_ACCESS_CODE
    else process.env.EXPLORER_ACCESS_CODE = previous
  }
})
