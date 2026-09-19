// Lightweight offline entry point using the TypeScript dependency already used by Next.js.
const path = require('node:path')
const fs = require('node:fs')
const Module = require('node:module')
const ts = require('typescript')
const root = path.resolve(__dirname, '..')
const originalResolve = Module._resolveFilename
Module._resolveFilename = function (request, parent, ...args) {
  return originalResolve.call(this, request.startsWith('@/') ? path.join(root, request.slice(2)) : request, parent, ...args)
}
require.extensions['.ts'] = (module, filename) => {
  const { outputText } = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true }, fileName: filename,
  })
  module._compile(outputText, filename)
}
