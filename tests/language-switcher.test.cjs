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
    if (name === 'next/navigation') return { usePathname: () => '/explorer/styles-de-danse/break' }
    if (name.endsWith('.module.css')) return { default: { switcher: 'switcher', trigger: 'trigger', menu: 'menu' } }
    return localRequire(name)
  }, mod, mod.exports, async (url, options) => { requests.push({ url, options }); return response }, { location: { pathname: '/explorer/styles-de-danse/break', search: '?view=1', hash: '#origines', assign: url => navigations.push(url) } })
  const render = (locale = 'fr') => { cursor = 0; return mod.exports.default({ locale }) }
  return { render, requests, navigations }
}

test('sélecteur : bouton Newsletter réutilisé, menu bilingue accessible, Échap', () => {
  const ui = harness()
  const trigger = find(ui.render(), el => el.type === 'button')[0]
  assert.ok(trigger.props.className.includes('btn btn-primary'))
  assert.equal(trigger.props['aria-label'], 'Choisir la langue')
  assert.equal(trigger.props['aria-expanded'], false)
  trigger.props.onClick()
  const menu = ui.render()
  const options = find(menu, el => el.props.role === 'menuitemradio')
  assert.equal(options.length, 2)
  assert.deepEqual(options.map(el => el.props.children[0]), ['Français', 'English'])
  assert.deepEqual(options.map(el => el.props['aria-checked']), [true, false])
  menu.props.onKeyDown({ key: 'Escape', preventDefault() {} })
  assert.equal(find(ui.render(), el => el.props.role === 'menu').length, 0)
})

test('changement : même fiche, recherche et ancre envoyées au serveur ; préférence non écrite dans document.cookie', async () => {
  const ui = harness()
  find(ui.render(), el => el.type === 'button')[0].props.onClick()
  await find(ui.render(), el => el.props.role === 'menuitemradio' && el.props.lang === 'en')[0].props.onClick()
  assert.equal(ui.requests[0].url, '/api/language')
  assert.deepEqual(JSON.parse(ui.requests[0].options.body), { locale: 'en', href: '/explorer/styles-de-danse/break?view=1#origines' })
  assert.equal(ui.requests[0].options.credentials, 'same-origin')
  assert.deepEqual(ui.navigations, ['/en/explorer/styles-de-danse/break?view=1#origines'])
})

test('erreur récupérable : pas de changement de page si la préférence ne peut pas être enregistrée', async () => {
  const ui = harness({ ok: false })
  find(ui.render(), el => el.type === 'button')[0].props.onClick()
  await find(ui.render(), el => el.props.role === 'menuitemradio' && el.props.lang === 'en')[0].props.onClick()
  assert.equal(ui.navigations.length, 0)
  assert.ok(find(ui.render(), el => el.props.role === 'alert').length)
  assert.equal(find(ui.render(), el => el.props.role === 'menuitemradio').every(el => !el.props.disabled), true)
})
