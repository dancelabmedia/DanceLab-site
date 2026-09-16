/**
 * lib/podcast-articles.ts
 * Gestion des articles de podcast générés automatiquement.
 *
 * Les articles sont stockés sous forme de fichiers JSON dans data/podcast-articles/.
 * Chaque fichier correspond à un épisode et suit le cycle de statut :
 *   brouillon → a_valider → valide → programme → publie
 *
 * Ces articles sont fusionnés avec les articles statiques de articles-data.ts
 * pour l'affichage public sur le site.
 */

import fs from 'node:fs'
import path from 'node:path'
import type { MagazineArticle } from '@/app/decouvrir/articles-data'

// ─── Types ────────────────────────────────────────────────────────────────────

export type PodcastArticleStatus =
  | 'brouillon'    // Généré automatiquement, pas encore relu
  | 'a_valider'    // En attente de validation éditoriale
  | 'valide'       // Validé, programmé pour publication
  | 'programme'    // Programmé avec date de publication
  | 'publie'       // Publié et visible sur le site

export type PodcastArticleFile = {
  /** Numéro de l'épisode source (clé d'identification principale) */
  episodeNumber: number
  /** Slug de l'épisode source */
  episodeSlug: string
  /** Statut éditorial */
  status: PodcastArticleStatus
  /** Date de génération */
  generatedAt: string
  /** Date de publication programmée (ISO UTC) */
  scheduledFor?: string
  /** Date de publication effective */
  publishedAt?: string
  /** Notes éditoriales (modifications demandées, retours) */
  editorNotes?: string
  /** Contenu complet de l'article au format MagazineArticle */
  article: MagazineArticle
}

// ─── Chemins ──────────────────────────────────────────────────────────────────

const ARTICLES_DIR = path.join(process.cwd(), 'data', 'podcast-articles')

function ensureDir() {
  if (!fs.existsSync(ARTICLES_DIR)) {
    fs.mkdirSync(ARTICLES_DIR, { recursive: true })
  }
}

function articleFilePath(episodeNumber: number): string {
  return path.join(ARTICLES_DIR, `ep-${episodeNumber}.json`)
}

// ─── Lecture ──────────────────────────────────────────────────────────────────

/** Charge un article JSON par numéro d'épisode. Retourne null si introuvable. */
export function getPodcastArticleByEpisode(episodeNumber: number): PodcastArticleFile | null {
  const filePath = articleFilePath(episodeNumber)
  if (!fs.existsSync(filePath)) return null
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as PodcastArticleFile
  } catch {
    return null
  }
}

/** Charge un article JSON par slug d'article. Retourne null si introuvable. */
export function getPodcastArticleBySlug(slug: string): PodcastArticleFile | null {
  const all = getAllPodcastArticles()
  return all.find(a => a.article.slug === slug) ?? null
}

/** Retourne tous les articles JSON générés (tous statuts confondus). */
export function getAllPodcastArticles(): PodcastArticleFile[] {
  ensureDir()
  try {
    return fs
      .readdirSync(ARTICLES_DIR)
      .filter(f => f.startsWith('ep-') && f.endsWith('.json'))
      .map(f => {
        try {
          return JSON.parse(
            fs.readFileSync(path.join(ARTICLES_DIR, f), 'utf-8')
          ) as PodcastArticleFile
        } catch {
          return null
        }
      })
      .filter(Boolean) as PodcastArticleFile[]
  } catch {
    return []
  }
}

/**
 * Retourne les articles prêts pour l'affichage public.
 * Un article est public si :
 *   - statut = 'publie'
 *   - OU statut = 'programme' ET scheduledFor ≤ maintenant
 *
 * Convertit PodcastArticleFile → MagazineArticle pour la compatibilité
 * avec le système d'articles statiques existant.
 */
export function getPublishedPodcastArticles(): MagazineArticle[] {
  const now = Date.now()
  return getAllPodcastArticles()
    .filter(pa => {
      if (pa.status === 'publie') return true
      if (pa.status === 'programme' && pa.scheduledFor) {
        return new Date(pa.scheduledFor).getTime() <= now
      }
      return false
    })
    .map(pa => pa.article)
}

/**
 * Retourne les numéros d'épisodes qui ont déjà un article généré.
 * Utilisé pour éviter les doublons.
 */
export function getEpisodesWithArticles(): Set<number> {
  return new Set(getAllPodcastArticles().map(a => a.episodeNumber))
}

// ─── Écriture ─────────────────────────────────────────────────────────────────

/** Sauvegarde un nouvel article (écrase si existe déjà). */
export function savePodcastArticle(data: PodcastArticleFile): void {
  ensureDir()
  const filePath = articleFilePath(data.episodeNumber)
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
}

/** Met à jour le statut d'un article. */
export function updatePodcastArticleStatus(
  episodeNumber: number,
  status: PodcastArticleStatus,
  scheduledFor?: string
): boolean {
  const existing = getPodcastArticleByEpisode(episodeNumber)
  if (!existing) return false

  existing.status = status
  if (scheduledFor) existing.scheduledFor = scheduledFor
  if (status === 'publie' && !existing.publishedAt) {
    existing.publishedAt = new Date().toISOString()
  }

  // Met à jour aussi le statut dans l'objet article pour la compatibilité
  if (status === 'programme' || status === 'publie') {
    existing.article.status = status === 'publie' ? 'published' : 'scheduled'
    if (scheduledFor) existing.article.publishedAt = scheduledFor
  } else {
    existing.article.status = 'draft'
  }

  savePodcastArticle(existing)
  return true
}

/** Met à jour le contenu éditorial d'un article (titre, chapô, sections…). */
export function updatePodcastArticleContent(
  episodeNumber: number,
  patch: Partial<MagazineArticle>
): boolean {
  const existing = getPodcastArticleByEpisode(episodeNumber)
  if (!existing) return false

  existing.article = { ...existing.article, ...patch }
  savePodcastArticle(existing)
  return true
}

/** Met à jour les notes éditoriales. */
export function updateEditorNotes(episodeNumber: number, notes: string): boolean {
  const existing = getPodcastArticleByEpisode(episodeNumber)
  if (!existing) return false
  existing.editorNotes = notes
  savePodcastArticle(existing)
  return true
}

/** Supprime un article généré (irréversible). */
export function deletePodcastArticle(episodeNumber: number): boolean {
  const filePath = articleFilePath(episodeNumber)
  if (!fs.existsSync(filePath)) return false
  fs.unlinkSync(filePath)
  return true
}

// ─── Utilitaires ──────────────────────────────────────────────────────────────

/**
 * Calcule le prochain mardi à 9h (heure de Paris) en UTC.
 * Si on est mardi et qu'il n'est pas encore 9h Paris → retourne aujourd'hui.
 * Sinon → retourne le mardi suivant.
 */
export function getNextTuesdayPublishDate(fromDate?: Date): string {
  const now = fromDate ?? new Date()

  // Offset Paris : été UTC+2, hiver UTC+1
  // On calcule l'heure Paris en approximant (sans lib de timezone)
  const utcHour = now.getUTCHours()
  const month = now.getUTCMonth() // 0-11
  // CEST (UTC+2) : fin mars → fin octobre (approximation)
  const isParisSummer = month >= 2 && month <= 9
  const parisOffset = isParisSummer ? 2 : 1
  const parisHour = utcHour + parisOffset

  const dayOfWeek = now.getUTCDay() // 0 = dimanche, 2 = mardi

  let daysUntilTuesday = (2 - dayOfWeek + 7) % 7

  // Si c'est mardi mais après 9h Paris → viser le mardi suivant
  if (daysUntilTuesday === 0 && parisHour >= 9) {
    daysUntilTuesday = 7
  }

  const target = new Date(now)
  target.setUTCDate(now.getUTCDate() + daysUntilTuesday)
  target.setUTCHours(isParisSummer ? 7 : 8) // 9h Paris en UTC
  target.setUTCMinutes(0)
  target.setUTCSeconds(0)
  target.setUTCMilliseconds(0)

  return target.toISOString()
}

/**
 * Formate un timestamp ISO en date d'affichage "JJ.MM.AA".
 */
export function formatDisplayDate(iso: string): string {
  const d = new Date(iso)
  const day = String(d.getUTCDate()).padStart(2, '0')
  const month = String(d.getUTCMonth() + 1).padStart(2, '0')
  const year = String(d.getUTCFullYear()).slice(2)
  return `${day}.${month}.${year}`
}

/**
 * Estime le temps de lecture en minutes.
 * Base : 200 mots/minute.
 */
export function estimateReadTime(text: string): string {
  const words = text.split(/\s+/).length
  const minutes = Math.max(3, Math.round(words / 200))
  return `${minutes} min`
}
