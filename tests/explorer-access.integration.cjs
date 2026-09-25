// Tests HTTP d'un build isolé. Aucun secret ni cookie n'est affiché/enregistré.
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const net = require('node:net')
const { spawn } = require('node:child_process')
const { randomBytes } = require('node:crypto')
const { once } = require('node:events')
const { danceStyles } = require('../app/explorer/styles-de-danse/styles-data.ts')
const { isPrivateSectionPath, explorerAccessSections } = require('../data/section-visibility.ts')
const { publicNavigationHref } = require('../data/private-navigation.ts')
const { createExplorerSession, EXPLORER_SESSION_SECONDS, EXPLORER_COOKIE } = require('../lib/explorer-session.ts')

const buildDir = process.env.DANCELAB_TEST_BUILD_DIR
assert.ok(buildDir && fs.existsSync(path.join(buildDir, '.next', 'BUILD_ID')), 'Un build isolé est requis')
assert.ok(!fs.existsSync(path.join(buildDir, '.env.local')), 'Le build de test ne doit contenir aucun .env.local')
const nextBin = require.resolve('next/dist/bin/next')
const previewTestSecret = randomBytes(32).toString('hex')
const wait = ms => new Promise(resolve => setTimeout(resolve, ms))
let checks = 0

async function start(secret) {
  const allocator = net.createServer().listen(0, '127.0.0.1')
  await once(allocator, 'listening')
  const port = allocator.address().port
  await new Promise(resolve => allocator.close(resolve))
  const server = spawn(process.execPath, [nextBin, 'start', '--hostname', '127.0.0.1', '--port', String(port)], {
    cwd: buildDir, env: { PATH: process.env.PATH, NODE_ENV: 'production', DANCELAB_LOCAL_EDITOR: '1', EXPLORER_ACCESS_CODE: secret || '', PREVIEW_PASSWORD: secret ? previewTestSecret : '', NEXT_TELEMETRY_DISABLED: '1' }, stdio: ['ignore', 'ignore', 'pipe'],
  })
  server.testErrors = ''
  server.stderr.on('data', chunk => {
    const lines = String(chunk).split('\n').filter(line => !line.includes('items over 2MB'))
    server.testErrors = (server.testErrors + lines.join('\n')).slice(-4000)
  })
  const base = `http://127.0.0.1:${port}`
  for (let i = 0; i < 150; i++) {
    try {
      const response = await fetch(base + '/explorer/acces-prive')
      if (response.ok) return { server, base }
    } catch {}
    if (server.exitCode !== null) throw new Error('Le serveur de test a quitté avant de démarrer')
    await wait(200)
  }
  server.kill('SIGTERM')
  throw new Error('Le serveur de test ne répond pas')
}
async function stop(server) {
  const exited = once(server, 'exit')
  server.kill('SIGTERM')
  await exited
}
async function post(base, body, extra = {}) {
  return fetch(base + '/api/explorer-access', { method: 'POST', headers: { Origin: base, 'Content-Type': 'application/json', ...extra }, body: JSON.stringify(body), redirect: 'manual' })
}
async function blocked(base, pathname, headers = {}) {
  const response = await fetch(base + pathname, { redirect: 'manual', headers })
  assert.equal(response.status, 307, `Route protégée : ${pathname}`)
  const location = new URL(response.headers.get('location'))
  assert.equal(location.pathname, '/explorer/acces-prive')
  assert.ok(response.headers.get('x-robots-tag')?.includes('noindex'))
  assert.ok(response.headers.get('cache-control')?.includes('no-store'))
  checks++
}

async function main() {
  const anonymous = await start()
  try {
    for (const section of explorerAccessSections) await blocked(anonymous.base, section.path)
    for (const pathname of ['/sortir', '/apprendre/guides', '/explorer/artistes']) {
      const response = await fetch(anonymous.base + pathname, { redirect: 'manual' })
      assert.equal(response.status, 307)
      assert.equal(new URL(response.headers.get('location')).pathname, '/acces-prive')
      checks++
    }
    const unavailable = await post(anonymous.base, { code: 'test' })
    assert.equal(unavailable.status, 503)
    assert.ok(!unavailable.headers.get('set-cookie'))
    checks++
  } finally { await stop(anonymous.server) }

  const secret = randomBytes(32).toString('hex')
  const { server, base } = await start(secret)
  try {
    const paths = [...explorerAccessSections.map(section => section.path), ...danceStyles.map(style => `/explorer/styles-de-danse/${style.slug}`), '/explorer/metiers-de-la-danse/une-future-fiche', '/explorer/ecoles-de-danse/une-future-fiche']
    for (const pathname of paths) await blocked(base, pathname)
    for (const pathname of paths) {
      const response = await fetch(base + '/en' + pathname, { redirect: 'manual' })
      assert.equal(response.status, 307)
      assert.equal(new URL(response.headers.get('location')).pathname, '/en/explorer/acces-prive')
      assert.ok(response.headers.get('x-robots-tag')?.includes('noindex'))
      checks++
    }
    await blocked(base, '/explorer/styles-de-danse/break?_rsc=test', { RSC: '1', 'next-router-prefetch': '1' })
    await blocked(base, '/explorer/styles-de-danse/break', { 'x-middleware-subrequest': 'middleware:middleware:middleware:middleware:middleware' })
    await blocked(base, '/explorer/%73tyles-de-danse/break')
    await blocked(base, '/explorer/styles-de-danse/break', { Cookie: `${EXPLORER_COOKIE}=forged` })

    const login = await fetch(base + '/explorer/acces-prive?returnTo=%2Fexplorer%2Fstyles-de-danse%2Fbreak')
    const loginHtml = await login.text()
    assert.ok(/name="robots"[^>]*content="[^"]*noindex/.test(loginHtml))
    assert.ok(loginHtml.includes('Son contenu est actuellement en cours de vérification.'))
    assert.ok(loginHtml.includes('name="code"') && loginHtml.includes('type="password"'))
    assert.ok(!loginHtml.includes(secret))
    checks++
    for (const className of ['access-page', 'access-photo', 'access-editorial', 'access-divider', 'access-panel']) assert.ok(loginHtml.includes(`class="${className}"`))
    const legacyHtml = await (await fetch(base + '/acces-prive?redirect=%2Fsortir')).text()
    for (const className of ['access-page', 'access-photo', 'access-editorial', 'access-divider', 'access-panel']) assert.ok(legacyHtml.includes(`class="${className}"`))
    assert.ok(legacyHtml.includes('id="preview-password"'))
    for (const target of [...explorerAccessSections.map(section => section.path), '/explorer/artistes', '/explorer/choregraphes', '/explorer/compagnies', '/sortir', '/apprendre/guides', '/apprendre/conseils', '/apprendre/formations', '/apprendre/outils']) {
      const screen = await fetch(base + publicNavigationHref(target), { redirect: 'manual' })
      assert.equal(screen.status, 200, `Page d'attente : ${target}`)
      const html = await screen.text()
      assert.ok(html.includes('class="access-page"'))
      assert.ok(html.includes('class="access-form"'))
      assert.ok(!html.includes('Ouvrir la page de travail'), 'Aucun raccourci local en production')
      checks++
    }
    const anonymousStatus = await fetch(base + '/api/explorer-access')
    assert.deepEqual(await anonymousStatus.json(), { authorized: false, previewAuthorized: false, localEditor: false })
    assert.ok(anonymousStatus.headers.get('cache-control')?.includes('no-store'))
    checks++
    const csrf = await post(base, { code: secret }, { Origin: 'https://foreign.invalid' })
    assert.equal(csrf.status, 403)
    checks++
    const wrong = await post(base, { code: 'incorrect' })
    assert.equal(wrong.status, 401)
    assert.ok(!wrong.headers.get('set-cookie'))
    checks++
    const accepted = await post(base, { code: secret, returnTo: '/explorer/styles-de-danse/break' })
    assert.equal(accepted.status, 200)
    assert.equal((await accepted.json()).returnTo, '/explorer/styles-de-danse/break')
    const setCookie = accepted.headers.get('set-cookie')
    for (const flag of ['HttpOnly', 'Secure', 'SameSite=lax', 'Max-Age=28800', 'Path=/']) assert.ok(setCookie.includes(flag), `Cookie : ${flag}`)
    assert.ok(!setCookie.includes(secret))
    const cookie = setCookie.split(';')[0]
    checks++
    const previewLogin = await fetch(base + '/api/acces-prive', { method: 'POST', headers: { Origin: base, 'Content-Type': 'application/json' }, body: JSON.stringify({ password: previewTestSecret }) })
    assert.equal(previewLogin.status, 200)
    const previewSetCookie = previewLogin.headers.get('set-cookie')
    assert.ok(previewSetCookie.includes('Max-Age=28800'))
    const previewCookie = previewSetCookie.split(';')[0]
    for (const target of ['/explorer/styles-de-danse', '/explorer/artistes']) {
      const screen = await fetch(base + publicNavigationHref(target), { redirect: 'manual', headers: { Cookie: `${cookie}; ${previewCookie}` } })
      assert.equal(screen.status, 200, 'La connexion ne contourne pas la page d’attente du menu')
      assert.ok((await screen.text()).includes('class="access-page"'))
      checks++
    }
    const previewStatus = await (await fetch(base + '/api/explorer-access', { headers: { Cookie: previewCookie } })).json()
    assert.deepEqual(previewStatus, { authorized: false, previewAuthorized: true, localEditor: false })
    await blocked(base, '/explorer/ecoles-de-danse', { Cookie: previewCookie })
    for (const pathname of ['/sortir', '/apprendre/guides', '/explorer/artistes', '/explorer/choregraphes', '/explorer/compagnies']) {
      const locked = await fetch(base + pathname, { redirect: 'manual', headers: { Cookie: cookie } })
      assert.equal(locked.status, 307)
      const open = await fetch(base + pathname, { redirect: 'manual', headers: { Cookie: previewCookie } })
      assert.equal(open.status, 200)
      assert.ok(open.headers.get('cache-control')?.includes('no-store'))
      checks++
    }
    checks++
    const privateStatus = await fetch(base + '/api/explorer-access', { headers: { Cookie: cookie } })
    assert.deepEqual(await privateStatus.json(), { authorized: true, previewAuthorized: false, localEditor: false })
    assert.ok(privateStatus.headers.get('cache-control')?.includes('no-store'))
    checks++
    const english = await (await fetch(base + '/en/explorer')).text()
    assert.ok(english.includes('<html lang="en"'))
    assert.ok(english.includes('Discover the world of dance through its languages, artists and professions.'))
    assert.ok(english.includes('Explore dance | Dance Lab'))
    assert.ok(english.includes('Choose language'))
    assert.ok(english.includes('href="/en/explorer/acces-prive?returnTo='))
    assert.ok(/hrefLang="fr"/i.test(english) && /hrefLang="en"/i.test(english))
    assert.ok(!english.includes('Entrer dans l&#x27;univers'))
    checks++
    const french = await (await fetch(base + '/explorer', { headers: { 'x-dancelab-locale': 'en', 'x-dancelab-path': '/en/explorer' } })).text()
    assert.ok(french.includes('<html lang="fr"'))
    assert.ok(french.includes('Choisir la langue'))
    assert.ok(/hrefLang="fr"/i.test(french) && /hrefLang="en"/i.test(french))
    checks++
    for (const pathname of ['/en/a-propos', '/en/episodes/121-laetitia-simon', '/en/explorer/styles-de-danse/break']) {
      const response = await fetch(base + pathname, { headers: { Cookie: cookie } })
      assert.equal(response.status, 200)
      const html = await response.text()
      assert.ok(html.includes('<html lang="en"'))
      assert.ok(!html.includes('The English version is being prepared.'))
      assert.ok(/name="robots"[^>]*content="[^"]*noindex/.test(html))
      assert.ok(!/hrefLang="en"/i.test(html))
      checks++
    }
    assert.equal((await fetch(base + '/en/does-not-exist')).status, 404)
    assert.equal((await fetch(base + '/en/admin/articles')).status, 404)
    checks += 2
    const englishAccess = await (await fetch(base + '/en/explorer/acces-prive')).text()
    assert.ok(englishAccess.includes('<html lang="en"'))
    assert.ok(englishAccess.includes('This section') && englishAccess.includes('is taking shape.'))
    assert.ok(!englishAccess.includes('Ouvrir la page de travail'))
    checks++
    const languagePost = (body, origin = base) => fetch(base + '/api/language', { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: JSON.stringify(body), redirect: 'manual' })
    const selectEnglish = await languagePost({ locale: 'en', href: '/explorer/styles-de-danse/break?view=1#origines' })
    assert.equal(selectEnglish.status, 200)
    assert.equal((await selectEnglish.json()).href, '/en/explorer/styles-de-danse/break?view=1#origines')
    const languageCookie = selectEnglish.headers.get('set-cookie')
    assert.ok(languageCookie.includes('HttpOnly') && languageCookie.includes('Secure') && languageCookie.includes('Max-Age=31536000'))
    const revisit = await fetch(base + '/', { headers: { Cookie: languageCookie.split(';')[0] }, redirect: 'manual' })
    assert.equal(new URL(revisit.headers.get('location')).pathname, '/en')
    assert.equal(revisit.headers.get('cache-control'), 'private, no-store')
    const explicitFrench = await fetch(base + '/explorer', { headers: { Cookie: languageCookie.split(';')[0] }, redirect: 'manual' })
    assert.equal(explicitFrench.status, 200)
    assert.ok((await explicitFrench.text()).includes('<html lang="fr"'))
    const selectFrench = await languagePost({ locale: 'fr', href: '/en/explorer/styles-de-danse/break?view=1#origines' })
    assert.equal((await selectFrench.json()).href, '/explorer/styles-de-danse/break?view=1#origines')
    assert.equal((await languagePost({ locale: 'en', href: '//evil.test' })).status, 400)
    assert.equal((await languagePost({ locale: 'de', href: '/' })).status, 400)
    assert.equal((await languagePost({ locale: 'en', href: '/' }, 'https://foreign.invalid')).status, 403)
    checks += 8
    for (const pathname of [...explorerAccessSections.map(section => section.path), '/explorer/styles-de-danse/break', '/explorer/styles-de-danse/jazz']) {
      const response = await fetch(base + pathname, { redirect: 'manual', headers: { Cookie: cookie } })
      assert.equal(response.status, 200, `Navigation autorisée : ${pathname}`)
      assert.ok(response.headers.get('cache-control')?.includes('no-store'))
      assert.ok(response.headers.get('x-robots-tag')?.includes('noindex'))
      const html = await response.text()
      assert.ok(html.includes('Fermer l’accès privé') || html.includes('Fermer l&#x27;accès privé'))
      assert.ok(!html.includes('id="explorer-access-code"'))
      assert.ok(!html.includes(secret))
      checks++
    }
    const rsc = await fetch(base + '/explorer/styles-de-danse/break?_rsc=auth', { headers: { Cookie: cookie, RSC: '1' } })
    assert.equal(rsc.status, 200)
    assert.ok(rsc.headers.get('content-type')?.includes('text/x-component'))
    checks++
    const expired = await createExplorerSession(secret, Date.now() - (EXPLORER_SESSION_SECONDS + 1) * 1000)
    await blocked(base, '/explorer/styles-de-danse/break', { Cookie: `${EXPLORER_COOKIE}=${expired}` })
    const wrongKey = await createExplorerSession(randomBytes(32).toString('hex'))
    await blocked(base, '/explorer/styles-de-danse/break', { Cookie: `${EXPLORER_COOKIE}=${wrongKey}` })

    for (const pathname of ['/', '/explorer', '/decouvrir', '/a-propos', '/ecouter', '/recherche?q=styles', '/episodes/121-laetitia-simon', '/decouvrir/articles/5-lieux-freestyler-paris', '/themes/sante-mentale']) {
      const response = await fetch(base + pathname)
      assert.equal(response.status, 200, `Page publique : ${pathname}`)
      const html = await response.text()
      const hrefs = [...html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/g)].map(match => match[1])
      assert.ok(hrefs.every(href => !isPrivateSectionPath(href)), `Aucun lien privé : ${pathname}`)
      checks++
    }
    const sitemap = await (await fetch(base + '/sitemap.xml')).text()
    for (const section of explorerAccessSections) assert.ok(!sitemap.includes(section.path))
    assert.ok(sitemap.includes('/episodes/'))
    assert.ok(sitemap.includes('/en/explorer'))
    assert.ok(!sitemap.includes('/en/episodes/'))
    assert.ok(sitemap.includes('hreflang="en"'))
    checks++
    const traced = JSON.parse(fs.readFileSync(path.join(buildDir, '.next/server/app/en/explorer/page.js.nft.json'), 'utf8'))
    assert.ok(traced.files.some(file => file.endsWith('data/translations/en/page-explorer.json')), 'Traductions incluses dans le bundle Vercel')
    checks++
    const logout = await fetch(base + '/api/explorer-access', { method: 'DELETE', headers: { Origin: base, Cookie: cookie } })
    assert.equal(logout.status, 200)
    assert.ok(logout.headers.get('set-cookie')?.includes('Max-Age=0'))
    checks++
    await blocked(base, '/explorer/ecoles-de-danse')
    for (let i = 0; i < 3; i++) assert.equal((await post(base, { code: 'incorrect' })).status, 401)
    const throttled = await post(base, { code: secret })
    assert.equal(throttled.status, 429)
    assert.ok(Number(throttled.headers.get('retry-after')) > 0)
    checks++

    const manifest = JSON.parse(fs.readFileSync(path.join(buildDir, '.next/prerender-manifest.json'), 'utf8'))
    assert.ok(Object.keys(manifest.routes).every(route => !isPrivateSectionPath(route)))
    checks++
    const assets = fs.readdirSync(path.join(buildDir, '.next/static'), { recursive: true }).filter(file => file.endsWith('.js'))
    for (const file of assets) {
      const content = fs.readFileSync(path.join(buildDir, '.next/static', file), 'utf8')
      assert.ok(!content.includes(secret))
      assert.ok(!content.includes(danceStyles[0].introduction.slice(0, 100)), 'Aucune fiche privée embarquée dans le JS public')
    }
    checks++
    console.log(`OK : ${checks} vérifications HTTP/build, dont les ${danceStyles.length} fiches de styles et la persistance entre les trois rubriques.`)
  } catch (error) {
    throw new Error(`${error.message}\n${server.testErrors}`)
  } finally { await stop(server) }
}
main().catch(error => { console.error(error.message); process.exitCode = 1 })
