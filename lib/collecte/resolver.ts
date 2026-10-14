/**
 * lib/collecte/resolver.ts
 * Recherche web de la page officielle d'un événement, via l'API Claude et son
 * outil de recherche web (même clé ANTHROPIC_API_KEY que la génération des
 * articles du podcast).
 *
 * Garde-fous :
 *   - l'adresse proposée doit figurer parmi les résultats réels de la
 *     recherche (aucune adresse inventée) ;
 *   - la page est ensuite vérifiée et notée comme toute autre page
 *     (lib/collecte/images.ts) : la recherche ne publie rien d'elle-même ;
 *   - le titre d'une fiche n'est corrigé que si la page officielle le confirme.
 *
 * Variables : ANTHROPIC_API_KEY (obligatoire pour cette étape),
 * COLLECTE_RESOLVER_MODEL (facultative, modèle utilisé).
 */

import { fetchWithRetry } from "./http"
import { claudeAvailable, claudeEndpoint } from "../claude-api"

export type ResolverInput = {
  title: string
  venue: string
  city: string
  startDate: string | null
  endDate: string | null
  company: string
  links: string[]
}

export type Resolution = {
  /** confirmed : événement identifié ; not_found : rien de fiable ; unconfirmed : l'événement ne semble pas exister. */
  status: "confirmed" | "not_found" | "unconfirmed"
  officialUrl: string
  ticketUrl: string
  exactTitle: string
  venue: string
  startDate: string
  endDate: string
  explanation: string
  /** Programmation officielle consultée où l'événement ne figure pas (preuve d'absence). */
  programmeUrl: string
  /** Adresses réellement renvoyées par la recherche web. */
  searchedUrls: string[]
  searches: number
}

export function resolverAvailable(): boolean {
  return Boolean(claudeAvailable() || process.env.COLLECTE_RESOLUTIONS_FILE)
}

/**
 * Pages officielles identifiées à l'avance (scripts uniquement) : même format
 * que la réponse de la recherche web, indexé par titre de fiche.
 */
let preset: Record<string, Partial<Resolution>> | null = null
async function presetResolution(title: string): Promise<Resolution | null> {
  const file = process.env.COLLECTE_RESOLUTIONS_FILE
  if (!file) return null
  if (!preset) {
    const fs = await import("node:fs")
    preset = JSON.parse(fs.readFileSync(file, "utf8"))
  }
  const r = preset![title]
  if (!r) return null
  return {
    status: (r.status as Resolution["status"]) ?? "not_found",
    officialUrl: r.officialUrl ?? "",
    ticketUrl: r.ticketUrl ?? "",
    exactTitle: r.exactTitle ?? "",
    venue: r.venue ?? "",
    startDate: r.startDate ?? "",
    endDate: r.endDate ?? "",
    explanation: r.explanation ?? "",
    programmeUrl: r.programmeUrl ?? "",
    searchedUrls: [r.officialUrl ?? "", r.ticketUrl ?? ""].filter(Boolean),
    searches: 0,
  }
}

const SYSTEM = `Tu aides un média de danse à retrouver la page OFFICIELLE d'un événement (spectacle, festival, saison) à Paris et en Île-de-France.
Règles :
- Cherche la page de l'événement sur le site du théâtre, du festival, de la compagnie ou du producteur (pas un média, pas un agrégateur, pas un réseau social).
- Vérifie que le titre, l'artiste ou la compagnie, le lieu et les dates correspondent à la fiche.
- Pour une saison ou un festival, cherche la page de l'édition correspondant aux dates de la fiche.
- N'invente jamais une adresse : ne donne que des adresses vues dans tes résultats de recherche.
- Si la fiche est vague (« ou similaire », « tournée », « création ») et qu'aucun événement réel ne correspond, réponds "unconfirmed".
- Si tu as consulté la programmation officielle du lieu ou de la compagnie pour ces dates et que l'événement n'y figure pas, réponds "unconfirmed" et donne l'adresse de cette programmation dans programmeUrl.
Réponds UNIQUEMENT par un objet JSON, sans texte autour :
{"status":"confirmed|not_found|unconfirmed","officialUrl":"","ticketUrl":"","exactTitle":"","venue":"","startDate":"AAAA-MM-JJ","endDate":"AAAA-MM-JJ","explanation":"une phrase","programmeUrl":""}`

function describe(input: ResolverInput): string {
  const lines = [
    `Titre de la fiche : ${input.title}`,
    input.company && `Compagnie / chorégraphe : ${input.company}`,
    input.venue && `Lieu : ${input.venue}`,
    input.city && `Ville : ${input.city}`,
    input.startDate && `Dates : ${input.startDate.slice(0, 10)}${input.endDate ? ` au ${input.endDate.slice(0, 10)}` : ""}`,
    input.links.length ? `Liens actuels (imprécis) : ${input.links.join(" ; ")}` : "",
  ].filter(Boolean)
  return lines.join("\n")
}

function sameUrl(a: string, b: string): boolean {
  try {
    const x = new URL(a)
    const y = new URL(b)
    const norm = (u: URL) => u.hostname.replace(/^www\./, "") + u.pathname.replace(/\/$/, "")
    return norm(x) === norm(y)
  } catch {
    return false
  }
}

export async function resolveOfficialPage(input: ResolverInput): Promise<Resolution | null> {
  if (process.env.COLLECTE_RESOLUTIONS_FILE) return presetResolution(input.title)
  const endpoint = claudeEndpoint()
  if (!endpoint) return null

  const response = await fetchWithRetry(
    endpoint.url,
    {
      method: "POST",
      headers: endpoint.headers,
      body: JSON.stringify({
        model: endpoint.model(process.env.COLLECTE_RESOLVER_MODEL || "claude-haiku-4-5-20251001"),
        max_tokens: 1024,
        system: SYSTEM,
        tools: [
          {
            type: "web_search_20250305",
            name: "web_search",
            max_uses: 4,
            user_location: { type: "approximate", city: "Paris", country: "FR", timezone: "Europe/Paris" },
          },
        ],
        messages: [{ role: "user", content: describe(input) }],
      }),
    },
    { attempts: 2, timeoutMs: 90_000, baseDelayMs: 2_000 }
  )
  if (!response.ok) throw new Error(`API Claude ${response.status} : ${(await response.text().catch(() => "")).slice(0, 200)}`)

  const data = (await response.json()) as {
    content: Array<{ type: string; text?: string; content?: Array<{ type: string; url?: string }> | { type: string } }>
    usage?: { server_tool_use?: { web_search_requests?: number } }
  }

  const searchedUrls: string[] = []
  for (const block of data.content) {
    if (block.type === "web_search_tool_result" && Array.isArray(block.content)) {
      for (const r of block.content) if (r.type === "web_search_result" && r.url) searchedUrls.push(r.url)
    }
  }
  const text = data.content.filter((b) => b.type === "text").map((b) => b.text ?? "").join("\n")
  const json = /\{[\s\S]*\}/.exec(text)?.[0]
  if (!json) return null
  let parsed: Partial<Resolution>
  try {
    parsed = JSON.parse(json)
  } catch {
    return null
  }

  const verified = (url?: string) => (url && searchedUrls.some((u) => sameUrl(u, url)) ? url : "")
  const officialUrl = verified(parsed.officialUrl)
  const status: Resolution["status"] =
    parsed.status === "unconfirmed" ? "unconfirmed" : parsed.status === "confirmed" && officialUrl ? "confirmed" : "not_found"

  return {
    status,
    officialUrl,
    ticketUrl: verified(parsed.ticketUrl),
    exactTitle: (parsed.exactTitle ?? "").trim(),
    venue: (parsed.venue ?? "").trim(),
    startDate: (parsed.startDate ?? "").trim(),
    endDate: (parsed.endDate ?? "").trim(),
    explanation: (parsed.explanation ?? "").trim().slice(0, 300),
    programmeUrl: status === "unconfirmed" ? verified(parsed.programmeUrl) : "",
    searchedUrls,
    searches: data.usage?.server_tool_use?.web_search_requests ?? 0,
  }
}
