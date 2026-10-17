import type { UnifiedEpisode } from './episodes'

/**
 * Retourne uniquement la pochette officielle publiée dans l'item RSS Ausha.
 * Les portraits éditoriaux locaux ne doivent jamais servir de couverture de
 * substitution dans la rubrique Écouter.
 */
export function getOfficialEpisodeCover(
  episode: Pick<UnifiedEpisode, 'aushaImage'>,
): string | null {
  const source = episode.aushaImage.trim()
  return isOfficialAushaCoverUrl(source) ? new URL(source).toString() : null
}

export function isOfficialAushaCoverUrl(source: string): boolean {
  if (!source) return false

  try {
    const url = new URL(source)
    return url.protocol === 'https:' && url.hostname === 'image.ausha.co'
  } catch {
    return false
  }
}
