/** Offline editorial workflow. No translation API, paid service or implicit environment credentials. */
import { mkdirSync, readFileSync, writeFileSync, renameSync } from 'node:fs'
import path from 'node:path'
import { translationSources } from '../lib/i18n/catalog'
import { mergeTranslation, translationQueue, translationStatus, type TranslationBatch } from '../lib/i18n/translations'
import { readTranslation, translationFile } from '../lib/i18n/store'

async function main() {
  const [command = 'status', file] = process.argv.slice(2)
  const live = process.argv.includes('--live') ? await (await import('../lib/episodes')).getEpisodes() : []
  const sources = translationSources(live)
  if (command === 'status' || command === 'queue') {
    const queue = sources.flatMap(source => {
      const fields = translationQueue(source, readTranslation(source.id))
      return fields.length ? [{ sourceId: source.id, fields }] : []
    })
    const counts = sources.flatMap(source => translationStatus(source, readTranslation(source.id))).reduce<Record<string, number>>((total, item) => ({ ...total, [item.status]: (total[item.status] ?? 0) + 1 }), {})
    if (command === 'queue') {
      if (!file || file.startsWith('--')) throw new Error('Indiquer un fichier de sortie hors du dossier public.')
      if (path.resolve(file).startsWith(path.resolve('public') + path.sep)) throw new Error('La file contient des contenus privés : ne pas la placer dans public/.')
      writeFileSync(file, JSON.stringify({ sourceLocale: 'fr', targetLocale: 'en', documents: queue }, null, 2) + '\n')
    }
    console.log(JSON.stringify({ documents: sources.length, fields: counts, pendingDocuments: queue.length, provider: 'none' }))
    return
  }
  if (!['import', 'edit'].includes(command) || !file) throw new Error('Usage : translations.ts status | queue fichier | import fichier | edit fichier [--live]')
  // edit: intentional editorial approval + permanent locks. import: machine draft, never published automatically.
  const batch = JSON.parse(readFileSync(file, 'utf8')) as TranslationBatch
  const source = sources.find(item => item.id === batch.sourceId)
  if (!source) throw new Error('Contenu source introuvable ou non publié')
  const document = mergeTranslation(source, readTranslation(source.id), batch, command === 'edit')
  const destination = translationFile(source.id)
  mkdirSync(path.dirname(destination), { recursive: true })
  const temporary = destination + '.tmp'
  writeFileSync(temporary, JSON.stringify(document, null, 2) + '\n')
  renameSync(temporary, destination)
  console.log(`${source.id} : ${Object.keys(batch.fields).length} champs importés ; ${command === 'edit' ? 'corrections verrouillées' : 'brouillon à vérifier'}.`)
}
main().catch(error => { console.error(error.message); process.exitCode = 1 })
