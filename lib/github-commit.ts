/**
 * lib/github-commit.ts
 * Helper pour committer un fichier dans le dépôt GitHub via l'API REST.
 *
 * Utilisé par le cron match-teasers pour persister data/teaser-resolved.json
 * sur le filesystem Git (le filesystem Vercel est éphémère).
 *
 * Variables d'environnement requises :
 *   GITHUB_TOKEN   — Personal Access Token avec scope "repo" (ou "contents:write")
 *   GITHUB_OWNER   — Propriétaire du dépôt (ex : "maiwennbramoulle")
 *   GITHUB_REPO    — Nom du dépôt (ex : "dancelab-site")
 */

// ─── Types ────────────────────────────────────────────────────────────────────

type CommitFileOptions = {
  /** Chemin du fichier dans le dépôt, relatif à la racine (ex : "data/teaser-resolved.json") */
  path: string
  /** Contenu du fichier (sera encodé en base64 automatiquement) */
  content: string
  /** Message de commit */
  message: string
  /** Branche cible (défaut : "main") */
  branch?: string
}

type CommitResult =
  | { ok: true; sha: string; url: string }
  | { ok: false; error: string }

// ─── Helper ───────────────────────────────────────────────────────────────────

/**
 * Crée ou met à jour un fichier dans le dépôt GitHub.
 *
 * Procédure :
 *   1. GET  /repos/{owner}/{repo}/contents/{path}  → récupère le SHA existant (si le fichier existe)
 *   2. PUT  /repos/{owner}/{repo}/contents/{path}  → crée/met à jour avec le nouveau contenu
 *
 * En cas d'erreur réseau ou d'API, retourne { ok: false, error } sans lever d'exception.
 */
export async function commitFileToGitHub(options: CommitFileOptions): Promise<CommitResult> {
  const { path, content, message, branch = 'main' } = options

  const token = process.env.GITHUB_TOKEN
  const owner = process.env.GITHUB_OWNER
  const repo  = process.env.GITHUB_REPO

  if (!token || !owner || !repo) {
    return {
      ok: false,
      error: 'Variables d\'environnement manquantes : GITHUB_TOKEN, GITHUB_OWNER ou GITHUB_REPO',
    }
  }

  const apiBase = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Accept':        'application/vnd.github+json',
    'Content-Type':  'application/json',
    'X-GitHub-Api-Version': '2022-11-28',
  }

  // ── Étape 1 : récupérer le SHA du fichier existant ──────────────────────────
  let existingSha: string | undefined

  try {
    const getRes = await fetch(`${apiBase}?ref=${branch}`, { headers })
    if (getRes.ok) {
      const data = await getRes.json() as { sha?: string }
      existingSha = data.sha
    }
    // 404 → fichier inexistant, c'est OK (création)
  } catch (err) {
    console.warn('[github-commit] Impossible de récupérer le SHA existant :', err)
    // On continue sans SHA → si le fichier existe déjà, GitHub retournera 409
  }

  // ── Étape 2 : encoder le contenu en base64 ──────────────────────────────────
  // Buffer.from() est disponible dans Node.js (Edge runtime non supporté ici)
  const contentBase64 = Buffer.from(content, 'utf-8').toString('base64')

  // ── Étape 3 : PUT pour créer ou mettre à jour ────────────────────────────────
  try {
    const body: Record<string, unknown> = {
      message,
      content: contentBase64,
      branch,
    }
    if (existingSha) body.sha = existingSha

    const putRes = await fetch(apiBase, {
      method:  'PUT',
      headers,
      body:    JSON.stringify(body),
    })

    if (!putRes.ok) {
      const errText = await putRes.text()
      return { ok: false, error: `GitHub API ${putRes.status}: ${errText}` }
    }

    const data = await putRes.json() as { content?: { sha?: string }; commit?: { html_url?: string } }
    return {
      ok:  true,
      sha: data.content?.sha ?? '',
      url: data.commit?.html_url ?? '',
    }
  } catch (err) {
    return { ok: false, error: String(err) }
  }
}
