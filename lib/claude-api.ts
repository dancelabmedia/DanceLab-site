/**
 * lib/claude-api.ts
 * Accès à l'API Claude, soit directement (clé Anthropic « sk-ant-… »), soit via
 * Vercel AI Gateway (clé « vck_… », facturée sur le compte Vercel).
 *
 * Variables acceptées : ANTHROPIC_API_KEY (sk-ant-… ou vck_…) ou AI_GATEWAY_API_KEY.
 */

export type ClaudeEndpoint = {
  url: string
  headers: Record<string, string>
  /** Identifiant du modèle au format attendu par le point d'accès. */
  model: (anthropicId: string) => string
  via: "anthropic" | "gateway"
}

const GATEWAY_MODELS: Record<string, string> = {
  "claude-haiku-4-5-20251001": "anthropic/claude-haiku-4.5",
}

export function claudeEndpoint(): ClaudeEndpoint | null {
  const anthropic = (process.env.ANTHROPIC_API_KEY ?? "").trim()
  const gateway = (process.env.AI_GATEWAY_API_KEY ?? "").trim() || (anthropic.startsWith("vck_") ? anthropic : "")
  if (anthropic && !anthropic.startsWith("vck_")) {
    return {
      url: "https://api.anthropic.com/v1/messages",
      headers: { "Content-Type": "application/json", "x-api-key": anthropic, "anthropic-version": "2023-06-01" },
      model: (id) => id,
      via: "anthropic",
    }
  }
  if (gateway) {
    return {
      url: "https://ai-gateway.vercel.sh/v1/messages",
      headers: { "Content-Type": "application/json", "x-api-key": gateway, "anthropic-version": "2023-06-01" },
      model: (id) => (id.includes("/") ? id : GATEWAY_MODELS[id] ?? `anthropic/${id}`),
      via: "gateway",
    }
  }
  return null
}

export function claudeAvailable(): boolean {
  return claudeEndpoint() !== null
}
