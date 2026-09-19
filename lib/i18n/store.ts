import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import type { TranslationDocument } from './translations'

// Read-only on Vercel: translations are produced/imported BEFORE deployment, never per visit.
export function translationFile(id: string) {
  if (!/^[a-z0-9][a-z0-9._-]*$/.test(id) || id.includes('..')) throw new Error('Identifiant de traduction invalide')
  return path.join(process.cwd(), 'data', 'translations', 'en', `${id}.json`)
}
export function readTranslation(id: string): TranslationDocument | undefined {
  const file = translationFile(id)
  if (!existsSync(file)) return undefined
  const document = JSON.parse(readFileSync(file, 'utf8')) as TranslationDocument
  if (document.locale !== 'en' || document.sourceId !== id || !document.fields || typeof document.fields !== 'object') throw new Error('Document de traduction invalide')
  return document
}
