// Importer uniquement depuis middleware, routes API et composants serveur.
// Le secret n'est lu qu'à l'exécution côté serveur, jamais à la compilation client.
export const EXPLORER_COOKIE = 'dancelab_explorer_access'
export const EXPLORER_SESSION_SECONDS = 8 * 60 * 60
const encoder = new TextEncoder()

export function explorerSecret() { return process.env.EXPLORER_ACCESS_CODE || null }

function hex(bytes: ArrayBuffer) {
  return Array.from(new Uint8Array(bytes), value => value.toString(16).padStart(2, '0')).join('')
}

async function signingKey(secret: string) {
  return crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify'])
}

export async function matchesExplorerCode(candidate: string, secret: string) {
  const [a, b] = await Promise.all([candidate, secret].map(value => crypto.subtle.digest('SHA-256', encoder.encode(value))))
  const left = new Uint8Array(a), right = new Uint8Array(b)
  let different = 0
  for (let i = 0; i < left.length; i++) different |= left[i] ^ right[i]
  return different === 0
}

export async function createExplorerSession(secret: string, now = Date.now()) {
  const expires = Math.floor(now / 1000) + EXPLORER_SESSION_SECONDS
  const nonce = hex(crypto.getRandomValues(new Uint8Array(16)).buffer)
  const payload = `v1.${expires}.${nonce}`
  const signature = await crypto.subtle.sign('HMAC', await signingKey(secret), encoder.encode(`dance-lab-explorer:${payload}`))
  return `${payload}.${hex(signature)}`
}

export async function validExplorerSession(token: string | undefined, secret = explorerSecret(), now = Date.now()) {
  if (!secret || !token || token.length > 160) return false
  const match = /^(v1)\.(\d{10})\.([a-f0-9]{32})\.([a-f0-9]{64})$/.exec(token)
  if (!match) return false
  const expires = Number(match[2]), seconds = Math.floor(now / 1000)
  if (expires <= seconds || expires > seconds + EXPLORER_SESSION_SECONDS) return false
  const signature = Uint8Array.from(match[4].match(/../g)!, byte => parseInt(byte, 16))
  return crypto.subtle.verify('HMAC', await signingKey(secret), signature, encoder.encode(`dance-lab-explorer:${match[1]}.${match[2]}.${match[3]}`))
}
