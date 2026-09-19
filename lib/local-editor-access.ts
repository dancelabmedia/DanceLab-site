/** Accès de travail explicitement activé sur un serveur de développement local.
 * Jamais actif dans un build de production ni sur Vercel, même avec la variable.
 * Le serveur local doit écouter sur l'interface loopback, pas sur le réseau.
 */
export function isLocalEditorAccess(headers: Pick<Headers, 'get'>): boolean {
  if (process.env.NODE_ENV !== 'development' || process.env.VERCEL || process.env.DANCELAB_LOCAL_EDITOR !== '1') return false
  const host = headers.get('host')?.toLowerCase() ?? ''
  return /^(localhost|127\.0\.0\.1|\[::1\])(?::\d{1,5})?$/.test(host)
}
