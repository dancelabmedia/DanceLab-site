/**
 * lib/notion-articles.ts
 * Synchronisation des articles podcast vers la base Notion "📰 Magazine — Articles".
 *
 * La base Notion est dans Dance Lab, Le média :
 *   https://app.notion.com/p/a1bb5381a58447279fae19cb63324620
 * Data Source ID : 4c568cdc-c818-48ee-9596-6b8542d8e7eb
 *
 * ⚠️  Serveur uniquement — utilise l'API Notion via NOTION_TOKEN.
 */

import type { PodcastArticleFile, PodcastArticleStatus } from './podcast-articles'
import type { MagazineArticle } from '@/app/decouvrir/articles-data'

// ── Config ──────────────────────────────────────────────────────────────────
const NOTION_API = 'https://api.notion.com/v1'
const NOTION_VERSION = '2022-06-28'
// Database ID de "📰 Magazine — Articles"
const DATABASE_ID = 'a1bb5381-a584-4727-9fae-19cb63324620'

// ── Mapping des statuts ──────────────────────────────────────────────────────
const STATUS_MAP: Record<PodcastArticleStatus, string> = {
  brouillon: '🔘 Brouillon',
  a_valider: '🔍 À valider',
  valide: '✅ Validé',
  programme: '📅 Programmé',
  publie: '🟢 Publié',
}

// ── Helpers API ──────────────────────────────────────────────────────────────
function getHeaders(): HeadersInit {
  const token = process.env.NOTION_TOKEN
  if (!token) throw new Error('NOTION_TOKEN non défini dans les variables d\'environnement')
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Notion-Version': NOTION_VERSION,
  }
}

async function notionFetch(path: string, options: RequestInit = {}): Promise<unknown> {
  const res = await fetch(`${NOTION_API}${path}`, {
    ...options,
    headers: {
      ...getHeaders(),
      ...(options.headers ?? {}),
    },
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Notion API ${res.status}: ${body}`)
  }
  return res.json()
}

// ── Formatage du contenu de la page ─────────────────────────────────────────
/**
 * Construit le contenu Markdown de la page Notion à partir d'un article.
 * Notion-flavored Markdown : titres, paragraphes, séparateurs.
 */
function buildNotionPageContent(article: MagazineArticle, episodeFile: PodcastArticleFile): string {
  const lines: string[] = []

  // En-tête éditorial
  lines.push(`> **Chapô :** ${article.chapo}`)
  lines.push('')
  lines.push(`**Meta description :** ${article.metaDescription ?? article.chapo}`)
  lines.push('')
  lines.push('---')
  lines.push('')

  // Corps de l'article
  for (const section of article.sections) {
    if (section.heading) {
      lines.push(`## ${section.heading}`)
      lines.push('')
    }
    for (const para of section.paragraphs) {
      // Nettoyer les balises HTML basiques pour Notion
      const clean = para.replace(/<[^>]+>/g, '')
      lines.push(clean)
      lines.push('')
    }
    if (section.items && section.items.length > 0) {
      for (const item of section.items) {
        lines.push(`- ${item}`)
      }
      lines.push('')
    }
    if (section.itemConclusion) {
      lines.push(section.itemConclusion)
      lines.push('')
    }
  }

  // Conclusion
  if (article.conclusion) {
    lines.push('---')
    lines.push('')
    lines.push('## Conclusion')
    lines.push('')
    const conclusionArray = Array.isArray(article.conclusion)
      ? article.conclusion
      : [article.conclusion]
    for (const para of conclusionArray) {
      lines.push(para)
      lines.push('')
    }
  }

  // Infos techniques
  lines.push('---')
  lines.push('')
  lines.push('### 🔧 Infos techniques')
  lines.push('')
  lines.push(`- **Slug :** \`${article.slug}\``)
  lines.push(`- **Temps de lecture :** ${article.readTime}`)
  lines.push(`- **Image hero :** ${article.image}`)
  if (episodeFile.scheduledFor) {
    lines.push(`- **Publication programmée :** ${episodeFile.scheduledFor}`)
  }
  if (episodeFile.editorNotes) {
    lines.push('')
    lines.push('### 📝 Notes éditoriales')
    lines.push('')
    lines.push(episodeFile.editorNotes)
  }

  return lines.join('\n')
}

// ── Propriétés Notion ────────────────────────────────────────────────────────
function buildNotionProperties(
  article: MagazineArticle,
  episodeFile: PodcastArticleFile
): Record<string, unknown> {
  const props: Record<string, unknown> = {
    'Titre': {
      title: [{ text: { content: article.title } }],
    },
    'Statut': {
      select: { name: STATUS_MAP[episodeFile.status] },
    },
    'Épisode N°': {
      number: episodeFile.episodeNumber,
    },
    'Slug': {
      rich_text: [{ text: { content: article.slug } }],
    },
    'Catégorie': {
      select: { name: article.category },
    },
    'Généré le': {
      date: { start: episodeFile.generatedAt.split('T')[0] },
    },
    'Tags': {
      rich_text: [{ text: { content: article.tags?.join(', ') ?? '' } }],
    },
  }

  // Invité·e
  if (article.guest) {
    props['Invité·e'] = { rich_text: [{ text: { content: article.guest } }] }
  }

  // Meta description
  const meta = (article as MagazineArticle & { metaDescription?: string }).metaDescription
  if (meta) {
    props['Meta description'] = { rich_text: [{ text: { content: meta } }] }
  }

  // Date de publication
  const pubDate = episodeFile.publishedAt ?? episodeFile.scheduledFor
  if (pubDate) {
    props['Date de publication'] = {
      date: { start: pubDate.split('T')[0] },
    }
  }

  // Notes éditoriales
  if (episodeFile.editorNotes) {
    props['Notes éditoriales'] = {
      rich_text: [{ text: { content: episodeFile.editorNotes } }],
    }
  }

  // Lien épisode
  if (episodeFile.episodeSlug) {
    props['Lien épisode'] = {
      url: `https://dancelab.fr/episodes/${episodeFile.episodeSlug}`,
    }
  }

  return props
}

// ── API publique ─────────────────────────────────────────────────────────────

/**
 * Recherche une page Notion par numéro d'épisode.
 * Retourne l'ID Notion de la page si trouvée, null sinon.
 */
export async function findNotionPageByEpisode(episodeNumber: number): Promise<string | null> {
  const data = await notionFetch(`/databases/${DATABASE_ID}/query`, {
    method: 'POST',
    body: JSON.stringify({
      filter: {
        property: 'Épisode N°',
        number: { equals: episodeNumber },
      },
    }),
  }) as { results: Array<{ id: string }> }

  if (data.results && data.results.length > 0) {
    return data.results[0].id
  }
  return null
}

/**
 * Crée une nouvelle page dans la base Notion pour l'article donné.
 * Retourne l'ID Notion de la page créée.
 */
export async function createNotionArticlePage(episodeFile: PodcastArticleFile): Promise<string> {
  const { article } = episodeFile
  const content = buildNotionPageContent(article, episodeFile)
  const properties = buildNotionProperties(article, episodeFile)

  // Ajouter l'image de couverture si disponible
  const cover = article.image
    ? { type: 'external', external: { url: article.image } }
    : undefined

  const body: Record<string, unknown> = {
    parent: { database_id: DATABASE_ID },
    properties,
    children: [
      {
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [
            {
              type: 'text',
              text: { content: content.slice(0, 2000) },
            },
          ],
        },
      },
    ],
  }

  if (cover) body['cover'] = cover

  const result = await notionFetch('/pages', {
    method: 'POST',
    body: JSON.stringify(body),
  }) as { id: string }

  console.log(`✅ Notion: page créée pour l'épisode ${episodeFile.episodeNumber} (${result.id})`)
  return result.id
}

/**
 * Met à jour une page Notion existante avec les nouvelles données de l'article.
 */
export async function updateNotionArticlePage(
  notionPageId: string,
  episodeFile: PodcastArticleFile
): Promise<void> {
  const { article } = episodeFile
  const properties = buildNotionProperties(article, episodeFile)

  await notionFetch(`/pages/${notionPageId}`, {
    method: 'PATCH',
    body: JSON.stringify({ properties }),
  })

  console.log(`🔄 Notion: page mise à jour pour l'épisode ${episodeFile.episodeNumber}`)
}

/**
 * Synchronise un article vers Notion (crée ou met à jour selon existence).
 * Retourne l'ID Notion de la page.
 */
export async function syncArticleToNotion(episodeFile: PodcastArticleFile): Promise<string> {
  const existingId = await findNotionPageByEpisode(episodeFile.episodeNumber)

  if (existingId) {
    await updateNotionArticlePage(existingId, episodeFile)
    return existingId
  } else {
    return createNotionArticlePage(episodeFile)
  }
}

/**
 * Met à jour uniquement le statut d'une page Notion.
 */
export async function updateNotionArticleStatus(
  notionPageId: string,
  status: PodcastArticleStatus
): Promise<void> {
  await notionFetch(`/pages/${notionPageId}`, {
    method: 'PATCH',
    body: JSON.stringify({
      properties: {
        'Statut': {
          select: { name: STATUS_MAP[status] },
        },
      },
    }),
  })
}

/**
 * Supprime (archive) une page Notion.
 */
export async function archiveNotionArticlePage(notionPageId: string): Promise<void> {
  await notionFetch(`/pages/${notionPageId}`, {
    method: 'PATCH',
    body: JSON.stringify({ archived: true }),
  })
}
