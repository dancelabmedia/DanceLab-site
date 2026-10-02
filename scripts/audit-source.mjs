import { readFileSync, readdirSync, statSync } from 'node:fs'
import { extname, join, relative } from 'node:path'

const root = process.cwd()
const productionRoots = ['app', 'components', 'data', 'lib', 'public']
const textExtensions = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.json', '.txt', '.xml'])
const ignored = new Set(['node_modules', '.next', '.git'])

function filesIn(directory) {
  const absolute = join(root, directory)
  const result = []
  for (const entry of readdirSync(absolute)) {
    if (ignored.has(entry)) continue
    const path = join(absolute, entry)
    if (statSync(path).isDirectory()) result.push(...filesIn(relative(root, path)))
    else if (textExtensions.has(extname(entry))) result.push(path)
  }
  return result
}

const violations = []
for (const file of productionRoots.flatMap(filesIn)) {
  const source = readFileSync(file, 'utf8')
  const name = relative(root, file)
  if (/https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?/i.test(source)) {
    // Les deux routes ci-dessous utilisent volontairement loopback comme garde
    // locale. Elles ne constituent pas une URL de contenu ou de production.
    if (!['app/api/acces-prive/route.ts', 'lib/local-editor-access.ts'].includes(name)) violations.push(`${name}: URL loopback`)
  }
  if (/https:\/\/dance-lab-site\.vercel\.app/i.test(source)) violations.push(`${name}: domaine technique Vercel`)
}

if (violations.length) {
  console.error(violations.join('\n'))
  process.exit(1)
}
console.log('Audit source : aucune URL locale ou canonical Vercel dans les contenus/configurations de production.')
