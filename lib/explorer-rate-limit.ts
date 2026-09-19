// Garde-fou par instance. En production multi-instance, compléter avec une règle
// Vercel WAF sur POST /api/explorer-access (voir docs/private-explorer.md).
const WINDOW_MS = 15 * 60 * 1000
type Bucket = { attempts: number; resetAt: number }
export function createExplorerRateLimiter() {
  const buckets = new Map<string, Bucket>()
  let global: Bucket = { attempts: 0, resetAt: 0 }
  return (key: string, now = Date.now()): number => {
    for (const [id, bucket] of buckets) if (bucket.resetAt <= now) buckets.delete(id)
    if (global.resetAt <= now) global = { attempts: 0, resetAt: now + WINDOW_MS }
    const bucket = buckets.get(key) ?? { attempts: 0, resetAt: now + WINDOW_MS }
    if (global.attempts >= 100 || bucket.attempts >= 5 || (!buckets.has(key) && buckets.size >= 4096)) {
      return Math.max(1, Math.ceil(((global.attempts >= 100 ? global : bucket).resetAt - now) / 1000))
    }
    bucket.attempts++
    global.attempts++
    buckets.set(key, bucket)
    return 0
  }
}
export const limitExplorerAttempt = createExplorerRateLimiter()
