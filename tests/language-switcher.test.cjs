const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { createRequire } = require('node:module')
const ts = require('typescript')
const React = require('react')

function find(node, predicate) {
  if (Array.isArray(node)) return node.flatMap(child => find(child, predicate))
  if (!React.isValidElement(node)) return []
  return [...(predicate(node) ? [node] : []), ...find(node.props.children, predicate)]
}
function harness(response = { ok: true, json: async () => ({ href: '/en/explorer/styles-de-danse/break?view=1#origines' }) }) {
  const filename = path.join(__dirname, '../components/LanguageSwitcher.tsx')
  const state = [], requests = [], navigations = []
  let locale = 'fr', refreshes = 0
  let cursor = 0
  const hooks = { ...React, useEffect() {}, useId: () => 'language-menu', useRef: initial => ({ current: initial }), useState(initial) {
    const i = cursor++
    if (!(i in state)) state[i] = initial
    return [state[i], value => { state[i] = typeof value === 'function' ? value(state[i]) : value }]
  } }
  const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { fileName: filename, compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText
  const mod = { exports: {} }, localRequire = createRequire(filename)
  new Function('require', 'module', 'exports', 'fetch', 'window', compiled)(name => {
    if (name === 'react') return hooks
    if (name === 'next/navigation') return {
      usePathname: () => '/explorer/styles-de-danse/break',
      useRouter: () => ({ replace: (href, options) => navigations.push({ href, options }), refresh: () => { refreshes++ } }),
    }
    if (name === './LocaleProvider') return { useLocale: () => locale, useSetLocale: () => value => { locale = value } }
    if (name.endsWith('.module.css')) return { default: { switcher: 'switcher', option: 'option', active: 'active', divider: 'divider', mobileSwitcher: 'mobileSwitcher' } }
    return localRequire(name)
  }, mod, mod.exports, async (url, options) => { requests.push({ url, options }); return response }, { location: { pathname: '/explorer/styles-de-danse/break', search: '?view=1', hash: '#origines', assign: url => navigations.push(url) } })
  const render = () => { cursor = 0; return mod.exports.default({ locale }) }
  return { render, requests, navigations, get locale() { return locale }, get refreshes() { return refreshes } }
}

test('sélecteur : choix FR/EN accessible et langue active clairement annoncée', () => {
  const ui = harness()
  const options = find(ui.render(), el => el.type === 'button')
  assert.equal(options.length, 2)
  assert.deepEqual(options.map(el => el.props.children), ['FR', 'EN'])
  assert.deepEqual(options.map(el => el.props['aria-pressed']), [true, false])
})

test('changement : même fiche, recherche et ancre envoyées au serveur ; préférence non écrite dans document.cookie', async () => {
  const ui = harness()
  await find(ui.render(), el => el.type === 'button' && el.props.lang === 'en')[0].props.onClick()
  assert.equal(ui.requests[0].url, '/api/language')
  assert.deepEqual(JSON.parse(ui.requests[0].options.body), { locale: 'en', href: '/explorer/styles-de-danse/break?view=1#origines' })
  assert.equal(ui.requests[0].options.credentials, 'same-origin')
  assert.deepEqual(ui.navigations, [{ href: '/en/explorer/styles-de-danse/break?view=1#origines', options: { scroll: false } }])
  assert.equal(ui.locale, 'en')
  assert.equal(ui.refreshes, 1)
})

test('erreur récupérable : pas de changement de page si la préférence ne peut pas être enregistrée', async () => {
  const ui = harness({ ok: false })
  await find(ui.render(), el => el.type === 'button' && el.props.lang === 'en')[0].props.onClick()
  assert.equal(ui.navigations.length, 0)
  assert.ok(find(ui.render(), el => el.props.role === 'alert').length)
  assert.equal(ui.locale, 'fr')
  assert.equal(find(ui.render(), el => el.type === 'button').every(el => !el.props.disabled), true)
})
