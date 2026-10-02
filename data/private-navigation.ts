import { isPrivateSectionPath } from './section-visibility'

/** Même référentiel pour le middleware et les mentions de disponibilité. */
// Note : '/explorer' retiré — la page d'accueil Explorer gère sa propre visibilité via
// explorerHomeVisibility + canViewExplorerHome(). Les sous-rubriques fonctionnelles
// (métiers-de-la-danse, etc.) sont gérées section par section dans sectionVisibility.
export const previewPaths = ['/sortir', '/apprendre', '/explorer/artistes', '/explorer/auditions', '/explorer/compagnies'] as const
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
  // Sous `next dev`, les liens restent des liens de travail directs. Le
  // middleware vérifie ensuite que la requête vient bien d'un hôte local.
  // Un build Vercel/production conserve toujours les écrans d'attente.
  if (process.env.NODE_ENV === 'development' && !process.env.VERCEL) return path
  return privateAccessScope(path) ? privateAccessHref(path) : path
}
