const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { createRequire } = require('node:module')
const ts = require('typescript')
const React = require('react')

const filename = path.join(__dirname, '../components/PrivateAccessPage.tsx')
const source = fs.readFileSync(filename, 'utf8')
function elements(node, type) {
  if (Array.isArray(node)) return node.flatMap(item => elements(item, type))
  if (!React.isValidElement(node)) return []
  return [...(node.type === type ? [node] : []), ...elements(node.props.children, type)]
}
function harness(response, redirect = '/sortir') {
  let cursor = 0
  const state = [], requests = [], navigations = []
  const hooks = { ...React, useState(initial) {
    const index = cursor++
    if (!(index in state)) state[index] = initial
    return [state[index], value => { state[index] = typeof value === 'function' ? value(state[index]) : value }]
  } }
  const compiled = ts.transpileModule(source, { fileName: filename, compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 } }).outputText
  const mod = { exports: {} }, localRequire = createRequire(filename)
  new Function('require', 'module', 'exports', 'fetch', 'window', compiled)(name => {
    if (name === 'react') return hooks
    if (name === 'next/navigation') return { useRouter: () => ({ push: url => navigations.push(url), refresh() {} }), useSearchParams: () => new URLSearchParams({ redirect }) }
    if (name.endsWith('.module.css')) return { default: new Proxy({}, { get: (_, key) => key }) }
    return localRequire(name)
  }, mod, mod.exports, async (url, options) => { requests.push({ url, options }); return response() }, { location: { assign: url => navigations.push(url) } })
  const render = (mode = 'explorer', props = {}) => { cursor = 0; return mod.exports.default({ mode, returnTo: '/explorer/styles-de-danse/break', ...props }) }
  return { render, requests, navigations }
}

test('formulaire : label accessible, champ masqué par défaut, afficher/masquer', () => {
  const ui = harness(() => {})
  let form = ui.render()
  assert.equal(elements(form, 'input')[0].props.type, 'password')
  assert.equal(elements(form, 'label')[0].props.htmlFor, elements(form, 'input')[0].props.id)
  elements(form, 'button').find(button => button.props.type === 'button').props.onClick()
  form = ui.render()
  assert.equal(elements(form, 'input')[0].props.type, 'text')
  assert.equal(elements(form, 'button').find(button => button.props.type === 'button').props['aria-pressed'], true)
  elements(form, 'button').find(button => button.props.type === 'button').props.onClick()
  assert.equal(elements(ui.render(), 'input')[0].props.type, 'password')
})

test('erreur serveur lisible et annoncée, aucune navigation avec un mauvais code', async () => {
  const ui = harness(() => ({ ok: false, json: async () => ({ error: 'Code incorrect.' }) }))
  elements(ui.render(), 'input')[0].props.onChange({ target: { value: 'incorrect' } })
  await elements(ui.render(), 'form')[0].props.onSubmit({ preventDefault() {} })
  const form = ui.render()
  assert.equal(elements(form, 'input')[0].props['aria-invalid'], true)
  assert.equal(elements(form, 'p').find(p => p.props.role === 'alert').props.children, 'Code incorrect.')
  assert.equal(ui.navigations.length, 0)
  assert.equal(ui.requests[0].url, '/api/explorer-access')
  assert.equal(ui.requests[0].options.credentials, 'same-origin')
})

test('validation uniquement serveur, bouton occupé et retour à la fiche demandée', async () => {
  let release
  const pending = new Promise(resolve => { release = resolve })
  const ui = harness(() => pending)
  elements(ui.render(), 'input')[0].props.onChange({ target: { value: 'test-only' } })
  const submission = elements(ui.render(), 'form')[0].props.onSubmit({ preventDefault() {} })
  assert.equal(elements(ui.render(), 'button').find(button => button.props.type === 'submit').props.disabled, true)
  release({ ok: true, json: async () => ({ returnTo: '/explorer/styles-de-danse/break' }) })
  await submission
  assert.deepEqual(ui.navigations, ['/explorer/styles-de-danse/break'])
  assert.equal(elements(ui.render(), 'button').find(button => button.props.type === 'submit').props.disabled, false)
})

test('réseau indisponible : erreur récupérable sans navigation', async () => {
  const ui = harness(() => { throw new Error('offline') })
  await elements(ui.render(), 'form')[0].props.onSubmit({ preventDefault() {} })
  assert.equal(ui.navigations.length, 0)
  assert.ok(elements(ui.render(), 'p').some(p => p.props.role === 'alert'))
})

test('Sortir et les autres accès existants conservent leur API et leur navigation', async () => {
  const ui = harness(() => ({ ok: true }))
  elements(ui.render('preview'), 'input')[0].props.onChange({ target: { value: 'test-only' } })
  await elements(ui.render('preview'), 'form')[0].props.onSubmit({ preventDefault() {} })
  assert.equal(ui.requests[0].url, '/api/acces-prive')
  assert.deepEqual(Object.keys(JSON.parse(ui.requests[0].options.body)), ['password'])
  assert.deepEqual(ui.navigations, ['/sortir'])
})

test('les deux accès utilisent exactement la même composition, photo et CSS responsive', () => {
  const ui = harness(() => {})
  const explorer = ui.render('explorer'), preview = ui.render('preview')
  assert.equal(explorer.props.className, 'access-page')
  assert.equal(preview.props.className, 'access-page')
  assert.equal(elements(explorer, 'style')[0].props.children, elements(preview, 'style')[0].props.children)
  for (const className of ['access-photo', 'access-editorial', 'access-divider', 'access-panel', 'access-stats']) {
    const findClass = node => elements(node, className === 'access-editorial' || className === 'access-panel' ? 'section' : 'div').find(el => el.props.className === className)
    assert.ok(findClass(explorer))
    assert.ok(findClass(preview))
    if (className === 'access-photo') assert.equal(findClass(explorer).props.children.props.src, findClass(preview).props.children.props.src)
  }
})

test('le raccourci de travail réutilise le lien secondaire sans changer le design ni le formulaire', () => {
  const ui = harness(() => {})
  const normal = ui.render(), local = ui.render('explorer', { localWorkHref: '/explorer/styles-de-danse/break' })
  const waiting = tree => elements(tree, 'div').find(el => el.props.className === 'access-waiting')
  assert.equal(waiting(normal).props.children[1].props.href, '/ecouter')
  assert.equal(waiting(local).props.children[1].props.href, '/explorer/styles-de-danse/break')
  assert.equal(waiting(local).props.children[1].props.children[1], 'Ouvrir la page de travail')
  assert.equal(elements(normal, 'style')[0].props.children, elements(local, 'style')[0].props.children)
  assert.equal(elements(normal, 'input')[0].props.type, elements(local, 'input')[0].props.type)
  assert.equal(elements(normal, 'section').length, elements(local, 'section').length)
})

test('les photographies, titres et numéros existants restent spécifiques à chaque rubrique', () => {
  for (const [redirect, image, title, number] of [
    ['/sortir', '/images/sorties/imagefond.png', 'Cette rubrique', '02'],
    ['/explorer/artistes', '/images/fond3.png', 'Les portraits qui', '03'],
    ['/explorer/choregraphes', '/images/fond5.png', 'Celles et ceux', '04'],
    ['/explorer/compagnies', '/images/fond8.png', 'Les collectifs qui', '05'],
  ]) {
    const tree = harness(() => {}, redirect).render('preview')
    assert.equal(elements(tree, 'div').find(el => el.props.className === 'access-photo').props.children.props.src, image)
    assert.equal(elements(tree, 'h1')[0].props.children[0], title)
    assert.equal(elements(tree, 'div').find(el => el.props.className === 'access-number').props.children, number)
  }
})
