export const PREVIEW_COOKIE = 'preview_access'
export async function hashPreviewPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(password + 'dancelab-salt')
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash), byte => byte.toString(16).padStart(2, '0')).join('')
}
export async function validPreviewSession(token: string | undefined) {
  const secret = process.env.PREVIEW_PASSWORD
  return !!secret && !!token && token === await hashPreviewPassword(secret)
}
