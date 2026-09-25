/** Accès de travail explicitement activé sur un serveur de développement local.
 * Jamais actif dans un build de production ni sur Vercel, même avec la variable.
 * Autorise localhost ainsi que les adresses privées du réseau local afin que
 * l'aperçu puisse être testé depuis un téléphone connecté au même Wi-Fi.
 */
export function isLocalEditorAccess(headers: Pick<Headers, 'get'>): boolean {
  if (process.env.NODE_ENV !== 'development' || process.env.VERCEL || process.env.DANCELAB_LOCAL_EDITOR !== '1') return false
  const host = headers.get('host')?.toLowerCase() ?? ''
  return /^(?:localhost|127\.0\.0\.1|\[::1\]|10(?:\.\d{1,3}){3}|192\.168(?:\.\d{1,3}){2}|172\.(?:1[6-9]|2\d|3[01])(?:\.\d{1,3}){2})(?::\d{1,5})?$/.test(host)
}
