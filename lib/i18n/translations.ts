import { createHash } from 'node:crypto'

export type TranslationSource = {
  id: string
  fields: Record<string, string>
  protectedTerms: string[]
}
export type TranslationField = {
  text: string
  sourceHash: string
  origin: 'machine' | 'editorial'
  locked: boolean
  approved: boolean
}
export type TranslationDocument = { locale: 'en'; sourceId: string; fields: Record<string, TranslationField> }
export type TranslationBatch = { sourceId: string; fields: Record<string, { text: string; sourceHash: string }> }
export const sourceHash = (text: string) => createHash('sha256').update(text.normalize('NFC')).digest('hex')

export function translationQueue(source: TranslationSource, document?: TranslationDocument) {
  return Object.entries(source.fields).flatMap(([key, text]) => {
    const previous = document?.fields[key]
    if (!text.trim() || previous?.locked || previous?.sourceHash === sourceHash(text)) return []
    return [{ key, text, sourceHash: sourceHash(text), protectedTerms: source.protectedTerms.filter(term => text.includes(term)) }]
  })
}
export function translationStatus(source: TranslationSource, document?: TranslationDocument) {
  return Object.entries(source.fields).map(([key, text]) => {
    const field = document?.fields[key]
    return { key, status: !field ? 'missing' : field.sourceHash !== sourceHash(text) ? 'stale' : !field.approved ? 'review' : 'ready', locked: field?.locked ?? false }
  })
}

/** Imports are atomic at document level. Machine output can NEVER overwrite an editorial lock. */
export function mergeTranslation(source: TranslationSource, previous: TranslationDocument | undefined, batch: TranslationBatch, editorial = false): TranslationDocument {
  if (batch.sourceId !== source.id || (previous && previous.sourceId !== source.id)) throw new Error('Source de traduction incorrecte')
  const document: TranslationDocument = { locale: 'en', sourceId: source.id, fields: { ...previous?.fields } }
  for (const [key, incoming] of Object.entries(batch.fields)) {
    if (!Object.hasOwn(source.fields, key) || !incoming || typeof incoming.text !== 'string' || !incoming.text.trim() || incoming.text.length > 100_000) throw new Error(`Champ invalide : ${key}`)
    if (document.fields[key]?.locked && !editorial) continue
    const original = source.fields[key]
    if (incoming.sourceHash !== sourceHash(original)) throw new Error(`Source modifiée : ${key}`)
    for (const term of source.protectedTerms) {
      if (original.includes(term) && !incoming.text.includes(term)) throw new Error(`Appellation à conserver : ${term}`)
    }
    document.fields[key] = { text: incoming.text, sourceHash: incoming.sourceHash, origin: editorial ? 'editorial' : 'machine', locked: editorial, approved: editorial }
  }
  return document
}

export function translatedField(source: TranslationSource, document: TranslationDocument | undefined, key: string) {
  const field = document?.fields[key]
  // A manual correction survives source edits; the status still requests editorial review.
  return field?.approved && (field.locked || field.sourceHash === sourceHash(source.fields[key] ?? '')) ? field.text : undefined
}

/** No provider is selected or called by the application. A future approved worker can implement this contract. */
export interface TranslationProvider {
  translate(input: { sourceId: string; sourceLocale: 'fr'; targetLocale: 'en'; fields: ReturnType<typeof translationQueue> }): Promise<TranslationBatch>
}
export async function prepareAutomaticTranslation(source: TranslationSource, previous: TranslationDocument | undefined, provider?: TranslationProvider) {
  const fields = translationQueue(source, previous)
  if (!fields.length) return previous
  if (!provider) throw new Error('Aucun fournisseur de traduction autorisé. La file reste en attente.')
  const batch = await provider.translate({ sourceId: source.id, sourceLocale: 'fr', targetLocale: 'en', fields })
  return mergeTranslation(source, previous, batch)
}
