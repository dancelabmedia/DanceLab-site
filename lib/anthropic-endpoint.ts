/**
 * lib/anthropic-endpoint.ts
 * Accès à Claude, directement (clé Anthropic « sk-ant-… ») ou via Vercel AI
 * Gateway (clé « vck_… », variable AI_GATEWAY_API_KEY ou ANTHROPIC_API_KEY).
 */

export function anthropicKey(): string {
  return process.env.AI_GATEWAY_API_KEY || process.env.ANTHROPIC_API_KEY || ""
}

export function anthropicConfigured(): boolean {
  return Boolean(anthropicKey())
}

/** Adresse, en-têtes et nom du modèle pour l'API Messages. */
export function anthropicEndpoint(model: string): { url: string; headers: Record<string, string>; model: string } | null {
  const key = anthropicKey()
  if (!key) return null
  if (key.startsWith("vck_") || process.env.AI_GATEWAY_API_KEY) {
    // AI Gateway : modèles nommés « anthropic/claude-haiku-4.5 ».
    const gatewayModel = model.includes("/")
      ? model
      : `anthropic/${model.replace(/-\d{8}$/, "").replace(/-(\d+)-(\d+)$/, "-$1.$2")}`
    return {
      url: "https://ai-gateway.vercel.sh/v1/messages",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}`, "anthropic-version": "2023-06-01" },
      model: gatewayModel,
    }
  }
  return {
    url: "https://api.anthropic.com/v1/messages",
    headers: { "Content-Type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
    model,
  }
}
