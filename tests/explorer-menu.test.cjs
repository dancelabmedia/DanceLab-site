require('./register.cjs')
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
function text(node) {
  if (Array.isArray(node)) return node.map(text).join(' ')
  if (React.isValidElement(node)) return text(node.props.children)
  return typeof node === 'string' ? node : ''
}
function harness() {
  const filename = path.join(__dirname, '../components/Header.tsx')
  const localRequire = createRequire(filename)
  const state = []
  let cursor = 0
  const hooks = { ...React, useMemo: cb => cb(), useEffect() {}, useRef: initial => ({ current: initial }), useState(initial) {
    const i = cursor++
    if (!(i in state)) state[i] = initial
    return [state[i], value => { state[i] = typeof value === 'function' ? value(state[i]) : value }]
  } }
  const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { fileName: filename, compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 } }).outputText
  const mod = { exports: {} }
  new Function('require', 'module', 'exports', 'fetch', 'document', compiled)(name => {
    if (name === 'react') return hooks
    if (name === 'react-dom') return { createPortal: child => child }
    if (name === 'next/link') return { default: 'a' }
    if (name === 'next/navigation') return { useRouter: () => ({}), usePathname: () => '/explorer' }
    if (name.endsWith('.module.css')) return { default: { unavailable: 'unavailable', available: 'available', badge: 'badge', privateEntry: 'private-entry' } }
    return localRequire(name)
  }, mod, mod.exports, () => { throw new Error('La navigation ne doit pas dépendre de la session') }, { body: {} })
  const render = () => { cursor = 0; return mod.exports.default({ searchItems: [] }) }
  const mobile = (group = 'Explorer') => {
    find(render(), el => el.type === 'button' && el.props['aria-label'] === 'Menu')[0].props.onClick()
    find(render(), el => el.type === 'button' && el.props.className === 'mobile-menu-title' && text(el) === group)[0].props.onClick()
    return find(render(), el => el.props.className === 'mobile-submenu')[0]
  }
  const desktop = (group = 'Explorer') => find(render(), el => el.props.className === 'dropdown-menu' && text(el).includes(group === 'Explorer' ? 'Styles' : 'Guides'))[0]
  return { render, desktop, mobile }
}

test('Sortir et les dix sous-catégories protégées portent Bientôt, les pages publiques restent accessibles', () => {
  const tree = harness().render()
  assert.equal(find(tree, el => el.props.className === 'badge').length, 11)
  assert.ok(find(tree, el => el.props.href === '/acces-prive?redirect=%2Fsortir').length)
  assert.ok(find(tree, el => el.props.href === '/decouvrir').length)
  assert.ok(find(tree, el => el.props.href === '/ecouter').length)
  assert.ok(find(tree, el => el.props.href === '/a-propos').length)
})

for (const mode of ['desktop', 'mobile']) {
  test(`menu ${mode} : les six sous-catégories ouvrent chacune leur page d'accès avec Bientôt`, () => {
    const ui = harness()
    const menu = ui[mode]()
    for (const [name, slug, scope] of [
      ['Styles', 'styles-de-danse', 'explorer'], ['Artistes', 'artistes', 'preview'],
      ['Chorégraphes', 'choregraphes', 'preview'], ['Compagnies', 'compagnies', 'preview'],
      ['Métiers', 'metiers-de-la-danse', 'explorer'], ['Écoles', 'ecoles-de-danse', 'explorer'],
    ]) {
      const link = find(menu, el => el.type === 'a' && text(el).includes(name))[0]
      assert.ok(link, name)
      const url = new URL(link.props.href, 'https://dancelab.invalid')
      assert.equal(url.pathname, scope === 'explorer' ? '/explorer/acces-prive' : '/acces-prive')
      assert.equal(url.searchParams.get(scope === 'explorer' ? 'returnTo' : 'redirect'), `/explorer/${slug}`)
      assert.ok(text(link).includes('Bientôt'))
    }
    assert.equal(find(menu, el => String(el.props['aria-disabled']) === 'true').length, 0)
    assert.equal(find(menu, el => el.props.className === 'badge').length, 6)
    assert.equal(find(menu, el => el.props.className === 'private-entry').length, 0)
  })
  test(`menu ${mode} : les quatre sous-catégories Apprendre ouvrent leur propre accès`, () => {
    const menu = harness()[mode]('Apprendre')
    for (const label of ['Guides', 'Conseils', 'Formations', 'Outils']) {
      const link = find(menu, el => el.type === 'a' && text(el).includes(label))[0]
      assert.equal(link.props.href, `/acces-prive?redirect=${encodeURIComponent('/apprendre/' + label.toLowerCase())}`)
      assert.ok(text(link).includes('Bientôt'))
    }
    assert.equal(find(menu, el => String(el.props['aria-disabled']) === 'true').length, 0)
    assert.equal(find(menu, el => el.props.className === 'badge').length, 4)
  })
}

test('cartes Explorer : destinations cliquables vers les accès, contenu et classes conservés', () => {
  const filename = path.join(__dirname, '../components/PublicExplorerLink.tsx')
  const localRequire = createRequire(filename), mod = { exports: {} }
  const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { fileName: filename, compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText
  new Function('require', 'module', 'exports', compiled)(localRequire, mod, mod.exports)
  const link = mod.exports.default({ href: '/explorer/ecoles-de-danse', className: 'existing-card', children: 'Écoles · Bientôt' })
  assert.equal(link.props.href, '/explorer/acces-prive?returnTo=%2Fexplorer%2Fecoles-de-danse')
  assert.equal(link.props.className, 'existing-card')
  assert.equal(link.props.children, 'Écoles · Bientôt')
  assert.equal(link.props['aria-disabled'], undefined)
  assert.equal(mod.exports.default({ href: '/ecouter' }).props.href, '/ecouter')
})
