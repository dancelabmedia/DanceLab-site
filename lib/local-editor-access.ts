/** Accès de travail automatique sur la boucle locale avec `next dev`.
 * Jamais actif dans un build de production ni sur Vercel.
 * Les adresses privées du réseau local restent soumises au drapeau explicite
 * DANCELAB_LOCAL_EDITOR=1 afin de ne pas exposer involontairement le contenu.
 */
export function isLocalEditorAccess(headers: Pick<Headers, 'get'>): boolean {
  if (process.env.NODE_ENV !== 'development' || process.env.VERCEL) return false
  const host = headers.get('host')?.toLowerCase() ?? ''
  const loopback = /^(?:localhost|127\.0\.0\.1|\[::1\])(?::\d{1,5})?$/.test(host)
  if (loopback) return true
  if (process.env.DANCELAB_LOCAL_EDITOR !== '1') return false
  return /^(?:10(?:\.\d{1,3}){3}|192\.168(?:\.\d{1,3}){2}|172\.(?:1[6-9]|2\d|3[01])(?:\.\d{1,3}){2})(?::\d{1,5})?$/.test(host)
}
