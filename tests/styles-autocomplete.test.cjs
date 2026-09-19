require('./register.cjs');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createRequire } = require('node:module');
const ts = require('typescript');
const React = require('react');
const { danceStyles } = require('../app/explorer/styles-de-danse/styles-data.ts');

const sourcePath = path.join(__dirname, '../app/explorer/styles-de-danse/StylesAutocomplete.tsx');
const source = fs.readFileSync(sourcePath, 'utf8');

// Exercise the real component's markup and event handlers without adding a test runtime.
// This checks behaviour and presentation contracts, not browser layout or screenshots.
function harness() {
  const state = [];
  const navigations = [];
  const queries = [];
  let cursor = 0;
  const localRequire = createRequire(sourcePath);
  const hooks = {
    ...React,
    useId: () => 'suggestions',
    useMemo: (callback) => callback(),
    useEffect: () => {},
    useRef: () => ({ current: { focus() {}, blur() {} } }),
    useState(initial) {
      const i = cursor++;
      if (!(i in state)) state[i] = initial;
      return [state[i], value => { state[i] = typeof value === 'function' ? value(state[i]) : value; }];
    },
  };
  const compiled = ts.transpileModule(source, {
    fileName: sourcePath,
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const mod = { exports: {} };
  new Function('require', 'module', 'exports', compiled)(name => {
    if (name === 'react') return hooks;
    if (name === 'next/navigation') return { useRouter: () => ({ push: url => navigations.push(url) }) };
    return localRequire(name);
  }, mod, mod.exports);
  const render = () => {
    cursor = 0;
    return mod.exports.default({ styles: danceStyles, onQueryChange: query => queries.push(query) });
  };
  const search = query => {
    find(render(), el => el.type === 'input')[0].props.onChange({ target: { value: query } });
    return render();
  };
  return { render, search, navigations, queries };
}

function find(node, predicate) {
  if (Array.isArray(node)) return node.flatMap(child => find(child, predicate));
  if (!React.isValidElement(node)) return [];
  return [...(predicate(node) ? [node] : []), ...find(node.props.children, predicate)];
}
function text(node) {
  if (Array.isArray(node)) return node.map(text).join('');
  if (React.isValidElement(node)) return text(node.props.children);
  return typeof node === 'string' || typeof node === 'number' ? String(node) : '';
}
const hasClass = name => el => el.props.className?.split(' ').includes(name);

test('multiple suggestions expose name, category and readable metadata without decorative emojis', () => {
  const ui = harness();
  const options = find(ui.search('danse'), hasClass('sac-item'));
  assert.ok(options.length > 1 && options.length <= 8);
  for (const option of options) {
    assert.ok(text(find(option, hasClass('sac-item-name'))[0]));
    assert.ok(text(find(option, hasClass('sac-item-category'))[0]));
    assert.equal(text(find(option, hasClass('sac-item-badge'))[0]), 'Style');
    assert.doesNotMatch(text(option), /\p{Emoji_Presentation}/u);
    assert.equal(find(option, el => el.type === 'img' || el.type === 'svg').length, 0);
    for (const meta of find(option, hasClass('sac-item-meta'))) {
      assert.ok(text(find(meta, hasClass('sac-item-meta-label'))[0]).endsWith(' : '));
    }
  }
});

test('names, aliases, keywords, families, origins and eras keep their existing search and click navigation', () => {
  for (const query of ['Break', 'B-boying', 'freestyle', 'Danses urbaines', 'États-Unis', '1970']) {
    const ui = harness();
    const first = find(ui.search(query), hasClass('sac-item'))[0];
    assert.ok(first, query);
    const name = text(find(first, hasClass('sac-item-name'))[0]);
    first.props.onPointerDown({ preventDefault() {} });
    assert.equal(ui.navigations[0], `/explorer/styles-de-danse/${danceStyles.find(style => style.name === name).slug}`);
    assert.deepEqual(ui.queries, [query]);
  }
});

test('keyboard selection, Escape and clearing retain the combobox behaviour', () => {
  const ui = harness();
  ui.search('danse');
  const key = key => find(ui.render(), el => el.type === 'input')[0].props.onKeyDown({ key, preventDefault() {} });
  key('ArrowDown');
  const selected = find(ui.render(), el => el.props.role === 'option' && el.props['aria-selected']);
  assert.equal(selected.length, 1);
  key('Enter');
  assert.equal(ui.navigations.length, 1);
  assert.equal(find(ui.render(), el => el.props.role === 'listbox').length, 0);
  ui.search('Break');
  key('Escape');
  assert.equal(find(ui.render(), el => el.props.role === 'listbox').length, 0);
  find(ui.search('Jazz'), hasClass('sac-clear'))[0].props.onClick();
  assert.equal(ui.queries.at(-1), '');
  assert.equal(find(ui.render(), el => el.type === 'input')[0].props.value, '');
});

test('empty suggestions retain the existing helpful hints', () => {
  const ui = harness();
  const empty = find(ui.search('zzzzzz'), hasClass('sac-empty'))[0];
  assert.match(text(empty), /Aucun résultat/);
  assert.equal(find(empty, hasClass('sac-hint')).length, 5);
  assert.doesNotMatch(text(empty), /\p{Emoji_Presentation}/u);
});

test('all suggestion text meets 4.5:1 contrast on normal and active surfaces', () => {
  const css = fs.readFileSync(path.join(__dirname, '../app/globals.css'), 'utf8');
  const token = name => css.match(new RegExp(`--${name}:\\s*(#[0-9A-Fa-f]{6})`))[1];
  const luminance = hex => hex.slice(1).match(/../g).map(v => parseInt(v, 16) / 255)
    .map(v => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
    .reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
  for (const fg of ['color-text-dark', 'color-primary-dark']) {
    for (const bg of ['color-text', 'color-background-soft']) {
      const light = luminance(token(bg));
      const dark = luminance(token(fg));
      assert.ok((light + 0.05) / (dark + 0.05) >= 4.5, `${fg} on ${bg}`);
    }
  }
  assert.match(css, /\.sac-item-category,\s*\.sac-item-meta\s*\{[^}]*font-size: 13px;[^}]*color: var\(--color-primary-dark\)/);
  assert.match(css, /\.sac-item \+ \.sac-item\s*\{[^}]*border-top: 1px solid var\(--color-secondary\)/);
});
