import { isPrivateSectionPath } from './section-visibility'

/** Même référentiel pour le middleware et les mentions de disponibilité. */
export const previewPaths = ['/sortir', '/apprendre'] as const
export type PrivateAccessScope = 'explorer' | 'preview'
export function privateAccessScope(value: string): PrivateAccessScope | null {
  if (isPrivateSectionPath(value)) return 'explorer'
  if (!value.startsWith('/') || value.startsWith('//') || value.includes('\\')) return null
  try {
    const pathname = decodeURIComponent(new URL(value, 'https://dancelab.invalid').pathname).replace(/\/+$/, '')
    return previewPaths.some(path => pathname === path || pathname.startsWith(path + '/')) ? 'preview' : null
  } catch { return null }
}

export function privateAccessHref(path: string) {
  return privateAccessScope(path) === 'explorer'
    ? `/explorer/acces-prive?returnTo=${encodeURIComponent(path)}`
    : `/acces-prive?redirect=${encodeURIComponent(path)}`
}

/** Le menu présente toujours la page d'attente ; l'accès au contenu reste contrôlé côté serveur. */
export function publicNavigationHref(path: string) {
  return privateAccessScope(path) ? privateAccessHref(path) : path
}
