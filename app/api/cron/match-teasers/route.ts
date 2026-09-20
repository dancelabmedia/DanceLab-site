/**
 * app/api/cron/match-teasers/route.ts
 * Cron Job Vercel — Association automatique des teasers vidéo aux épisodes.
 *
 * Déclenché chaque nuit à minuit UTC (vercel.json).
 * Peut aussi être appelé manuellement depuis le dashboard Vercel.
 *
 * Fonctionnement :
 *   1. Vérifie la signature CRON_SECRET
 *   2. Charge data/teaser-resolved.json depuis GitHub (runtime, toujours à jour)
 *   3. Récupère les épisodes RSS des 30 derniers jours
 *   4. Pour chaque épisode non encore résolu (absent du JSON ET sans extras manuels) :
 *      • Cherche la vidéo YouTube correspondante (flux Atom)
 *      • Cherche le Reel Instagram correspondant (Graph API)
 *   5. Si un ou plusieurs teasers sont trouvés → commit du JSON mis à jour sur GitHub
 *   6. Une fois résolu, l'épisode est ignoré lors des exécutions suivantes
 *
 * ── Variables d'environnement requises ────────────────────────────────────────
 *   CRON_SECRET          — Injecté automatiquement par Vercel (sécurise l'endpoint)
 *   GITHUB_TOKEN         — Personal Access Token (scope: contents:write)
 *   GITHUB_OWNER         — Propriétaire du dépôt (ex: "maiwennbramoulle")
 *   GITHUB_REPO          — Nom du dépôt (ex: "dancelab-site")
 *   INSTAGRAM_ACCESS_TOKEN — Token Graph API (optionnel : désactivé si absent)
 *
 * ── Pourquoi lire le JSON depuis GitHub et non depuis le bundle ────────────────
 *   Le filesystem Vercel est éphémère et le bundle est figé au moment du deploy.
 *   Pour que "stop checking once found" fonctionne entre les déploiements,
 *   le cron récupère TOUJOURS la dernière version commitée sur GitHub.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getEpisodesFromRSS }        from '@/lib/ausha-rss'
import { getYoutubeEpisodeMap }      from '@/lib/youtube-rss'
import {
  getRecentInstagramReels,
  matchReelToEpisode,
}                                    from '@/lib/instagram-api'
import { episodeExtras }             from '@/data/episode-extras'
import { commitFileToGitHub }        from '@/lib/github-commit'
import type { ResolvedTeaser, TeaserResolvedMap } from '@/lib/teaser-resolved'

export const maxDuration = 60 // 1 minute max

// ─── Constantes ───────────────────────────────────────────────────────────────

/** Nombre de jours après la publication d'un épisode pendant lesquels on cherche son teaser */
const LOOKBACK_DAYS = 30

/** Chemin du fichier JSON dans le dépôt GitHub */
const JSON_REPO_PATH = 'data/teaser-resolved.json'

// ─── Lecture du JSON depuis GitHub ───────────────────────────────────────────

/**
 * Récupère data/teaser-resolved.json depuis l'API GitHub (runtime).
 * Retourne un objet vide si le fichier n'existe pas ou si l'API échoue.
 */
async function fetchResolvedFromGitHub(): Promise<TeaserResolvedMap> {
  const token = process.env.GITHUB_TOKEN
  const owner = process.env.GITHUB_OWNER
  const repo  = process.env.GITHUB_REPO

  if (!token || !owner || !repo) return {}

  try {
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${JSON_REPO_PATH}?ref=main`,
      {
        headers: {
          'Authorization':         `Bearer ${token}`,
          'Accept':                'application/vnd.github+json',
          'X-GitHub-Api-Version':  '2022-11-28',
        },
        // Pas de cache Next.js ici — on veut toujours la version la plus récente
        cache: 'no-store',
      },
    )

    if (!res.ok) {
      if (res.status === 404) return {}            // fichier pas encore créé
      console.warn(`[match-teasers] GitHub GET ${res.status}`)
      return {}
    }

    const data = await res.json() as { content?: string }
    if (!data.content) return {}

    // Le contenu est en base64 avec des retours à la ligne
    const decoded = Buffer.from(data.content.replace(/\n/g, ''), 'base64').toString('utf-8')
    return JSON.parse(decoded) as TeaserResolvedMap
  } catch (err) {
    console.warn('[match-teasers] Erreur lecture JSON GitHub :', err)
    return {}
  }
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  // ── 1. Auth ─────────────────────────────────────────────────────────────────
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  // ── 2. Charger le cache résolu depuis GitHub ─────────────────────────────────
  const resolved = await fetchResolvedFromGitHub()

  // ── 3. Récupérer les épisodes RSS des 30 derniers jours ─────────────────────
  let rssEpisodes
  try {
    rssEpisodes = await getEpisodesFromRSS(false)
  } catch (err) {
    console.error('[match-teasers] Échec RSS Ausha :', err)
    return NextResponse.json({ error: 'Impossible de récupérer le flux RSS' }, { status: 502 })
  }

  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - LOOKBACK_DAYS)

  const recentEpisodes = rssEpisodes.filter((ep) => {
    if (!ep.pubDate) return false
    return new Date(ep.pubDate) >= cutoff
  })

  if (recentEpisodes.length === 0) {
    return NextResponse.json({
      ok: true,
      message: `Aucun épisode publié dans les ${LOOKBACK_DAYS} derniers jours.`,
      checked: 0,
      matched: 0,
    })
  }

  // ── 4. Identifier les épisodes à vérifier ───────────────────────────────────
  // Exclure : déjà résolu (cache) OU déjà renseigné manuellement dans episode-extras
  const toCheck = recentEpisodes.filter((ep) => {
    // Déjà dans le cache résolu
    if (String(ep.number) in resolved) return false

    // Déjà renseigné manuellement (youtubeId ET instagramReelUrl)
    const extras = episodeExtras[ep.number]
    if (extras?.youtubeId && extras?.instagramReelUrl) return false

    return true
  })

  if (toCheck.length === 0) {
    return NextResponse.json({
      ok: true,
      message: 'Tous les épisodes récents ont déjà un teaser résolu.',
      checked: recentEpisodes.length,
      matched: 0,
    })
  }

  // ── 5. Fetch YouTube + Instagram en parallèle ───────────────────────────────
  const [youtubeMap, recentReels] = await Promise.all([
    getYoutubeEpisodeMap(),
    getRecentInstagramReels(),
  ])

  // ── 6. Associer chaque épisode non résolu ───────────────────────────────────
  const newlyResolved: Array<{ episodeNumber: number; teaser: ResolvedTeaser }> = []
  const stillMissing:  number[] = []

  for (const ep of toCheck) {
    const extras = episodeExtras[ep.number]

    // YouTube : extras manuel > détection auto
    const ytVideo = youtubeMap.get(ep.number)
    const youtubeId: string | undefined =
      extras?.youtubeId ?? ytVideo?.videoId ?? undefined

    const isYoutubeShort: boolean | undefined =
      extras?.isYoutubeShort ?? ytVideo?.isShort ?? undefined

    // Instagram : extras manuel > détection auto
    const guest = ep.guest || 'Invité·e'
    const instagramReelUrl: string | undefined =
      extras?.instagramReelUrl ??
      matchReelToEpisode(recentReels, ep.number, guest) ??
      undefined

    if (youtubeId || instagramReelUrl) {
      const teaser: ResolvedTeaser = {
        resolvedAt: new Date().toISOString(),
      }
      if (youtubeId)        teaser.youtubeId       = youtubeId
      if (isYoutubeShort !== undefined) teaser.isYoutubeShort = isYoutubeShort
      if (instagramReelUrl) teaser.instagramReelUrl = instagramReelUrl

      newlyResolved.push({ episodeNumber: ep.number, teaser })
    } else {
      stillMissing.push(ep.number)
    }
  }

  // ── 7. Commit du JSON mis à jour si de nouveaux teasers ont été trouvés ─────
  let commitResult: { ok: boolean; sha?: string; url?: string; error?: string } = { ok: true }

  if (newlyResolved.length > 0) {
    // Fusionner les nouvelles entrées dans le cache existant
    const updatedResolved: TeaserResolvedMap = { ...resolved }
    for (const { episodeNumber, teaser } of newlyResolved) {
      updatedResolved[String(episodeNumber)] = teaser
    }

    const content = JSON.stringify(updatedResolved, null, 2) + '\n'

    const episodesLabel = newlyResolved
      .map((r) => `#${r.episodeNumber}`)
      .join(', ')

    commitResult = await commitFileToGitHub({
      path:    JSON_REPO_PATH,
      content,
      message: `chore: resolve teasers for episode(s) ${episodesLabel} [skip ci]`,
      branch:  'main',
    })

    if (!commitResult.ok) {
      console.error('[match-teasers] Échec commit GitHub :', commitResult.error)
    } else {
      console.log('[match-teasers] Commit GitHub OK :', commitResult.url)
    }
  }

  // ── 8. Réponse ──────────────────────────────────────────────────────────────
  return NextResponse.json({
    ok:            commitResult.ok,
    checked:       toCheck.length,
    matched:       newlyResolved.length,
    stillMissing,
    newlyResolved: newlyResolved.map((r) => ({
      episodeNumber:   r.episodeNumber,
      youtubeId:       r.teaser.youtubeId,
      isYoutubeShort:  r.teaser.isYoutubeShort,
      instagramReelUrl: r.teaser.instagramReelUrl,
    })),
    commitUrl:     commitResult.ok ? (commitResult as { url?: string }).url : undefined,
    commitError:   !commitResult.ok ? (commitResult as { error?: string }).error : undefined,
  })
}
