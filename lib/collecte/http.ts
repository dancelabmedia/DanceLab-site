/**
 * lib/collecte/http.ts
 * fetch avec délai maximal et nouvelles tentatives sur les erreurs
 * temporaires (429, 5xx, coupure réseau). Respecte l'en-tête Retry-After.
 */

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

type RetryOptions = { attempts?: number; timeoutMs?: number; baseDelayMs?: number }

export async function fetchWithRetry(url: string, init: RequestInit = {}, options: RetryOptions = {}): Promise<Response> {
  const { attempts = 3, timeoutMs = 30_000, baseDelayMs = 1_000 } = options
  let lastError: unknown

  for (let attempt = 1; attempt <= attempts; attempt++) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    try {
      const response = await fetch(url, { ...init, signal: controller.signal, cache: "no-store" })
      if (response.status !== 429 && response.status < 500) return response
      lastError = new Error(`HTTP ${response.status}`)
      if (attempt === attempts) return response
      const retryAfter = Number(response.headers.get("retry-after"))
      await sleep(Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : baseDelayMs * 2 ** (attempt - 1))
    } catch (error) {
      lastError = error
      if (attempt === attempts) break
      await sleep(baseDelayMs * 2 ** (attempt - 1))
    } finally {
      clearTimeout(timer)
    }
  }

  throw lastError instanceof Error ? lastError : new Error(String(lastError))
}
