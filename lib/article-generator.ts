/**
 * lib/article-generator.ts
 * Génération automatique d'articles éditoriaux à partir des données d'un épisode.
 *
 * Utilise l'API Anthropic (Claude) pour transformer les informations brutes
 * d'un épisode Ausha en un article structuré, éditorial et optimisé SEO.
 *
 * Variable d'environnement requise : ANTHROPIC_API_KEY
 */

import type { RssEpisode } from '@/lib/ausha-rss'
import type { MagazineArticle } from '@/app/decouvrir/articles-data'
import { regenerateArticleAssociations } from '@/lib/article-episode-associations'
import { getEpisodeRecommendationCatalog } from '@/lib/episode-recommendations.server'
import {
  formatDisplayDate,
  estimateReadTime,
  getNextTuesdayPublishDate,
} from '@/lib/podcast-articles'

// ─── Types internes ───────────────────────────────────────────────────────────

type GeneratedArticleContent = {
  title: string
  chapo: string
  metaTitle: string
  metaDescription: string
  slug: string
  category: string
  tags: string[]
  quote?: string
  takeaway?: string
  sections: {
    heading: string
    paragraphs: string[]
  }[]
  conclusion: string[]
}

// ─── Prompt système ───────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `Tu es journaliste éditorial pour Dance Lab, un média de référence sur la danse en France.
Tu rédiges des articles pour la section Magazine à partir d'épisodes du podcast Dance Lab.

LIGNE ÉDITORIALE :
- Ton professionnel, accessible, journalistique mais humain
- Écriture journalistique, pas scolaire ni générique
- Donne envie de lire ET d'écouter l'épisode
- Chaque article doit avoir une vraie valeur éditoriale, même pour quelqu'un qui n'a pas écouté

INTERDITS ABSOLUS :
- "Dans le monde fascinant de la danse..."
- Superlatifs inutiles ("incroyable", "extraordinaire", "fascinant")
- Formulations génériques de l'IA ("plonger dans", "explorer", "à travers le prisme de")
- Répétitions
- Inventer des informations ou des citations
- Recopier mot pour mot la description de l'épisode

STRUCTURE ATTENDUE (JSON strict) :
{
  "title": "Titre éditorial fort, naturel, cliquable, 60-90 caractères max",
  "chapo": "2-3 phrases qui introduisent l'invité et la problématique centrale. Pas de présentation sèche.",
  "metaTitle": "Titre SEO, 55-65 caractères, inclut le nom de l'invité et le sujet",
  "metaDescription": "Description SEO, 140-160 caractères, accrocheur, inclut les mots-clés",
  "slug": "slug-url-propre-sans-accents",
  "category": "Une seule catégorie parmi : Parcours, Technique, Carrière, Mindset, Culture, Décryptage, Portrait",
  "tags": ["3-5 tags pertinents"],
  "quote": "Citation forte de l'invité si disponible dans la description (texte exact, sans invention)",
  "takeaway": "Phrase éditoriale courte synthétisant une idée essentielle de l'article (1 phrase max, naturelle, directe, jamais générique)",
  "sections": [
    {
      "heading": "Intertitre H2 éditorial (pas un résumé, une accroche)",
      "paragraphs": ["Paragraphe 1", "Paragraphe 2"]
    }
  ],
  "conclusion": ["Paragraphe de conclusion 1", "Paragraphe de conclusion 2"]
}

RÈGLES SECTIONS :
- 3 à 5 sections avec intertitres H2
- Chaque section développe une idée ou un angle de l'épisode
- Les intertitres doivent être des phrases courtes, pas des titres de fiche
- La conclusion ouvre vers l'écoute sans être une pub grossière
- Minimum 600 mots au total (corps de l'article)

RÈGLES SEO :
- Intègre naturellement le nom de l'invité, son métier et le sujet dans le texte
- Le slug doit être court (3-5 mots), mémorable, sans le numéro d'épisode
- Les tags doivent refléter les styles de danse, les thèmes et le contexte

Réponds UNIQUEMENT avec le JSON. Aucun texte avant ou après.`

// ─── Fonction principale ──────────────────────────────────────────────────────

/**
 * Génère un article éditorial complet à partir des données d'un épisode RSS.
 *
 * @throws Error si ANTHROPIC_API_KEY n'est pas défini ou si l'API échoue
 */
export async function generateArticleFromEpisode(
  episode: RssEpisode
): Promise<MagazineArticle> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error(
      'ANTHROPIC_API_KEY non définie. Ajoute-la dans .env.local pour activer la génération d\'articles.'
    )
  }

  // Prépare le contexte de l'épisode pour le prompt
  const episodeContext = buildEpisodeContext(episode)

  // Appel API Anthropic
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: episodeContext,
        },
      ],
    }),
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Erreur inconnue')
    throw new Error(`Erreur API Anthropic (${response.status}): ${errorText}`)
  }

  const data = await response.json() as {
    content: { type: string; text: string }[]
  }

  const rawText = data.content?.find(c => c.type === 'text')?.text ?? ''

  // Parse le JSON généré
  const generated = parseGeneratedContent(rawText)

  // Calcule les métadonnées
  const scheduledFor = getNextTuesdayPublishDate()
  const displayDate = formatDisplayDate(scheduledFor)
  const allText = [
    generated.chapo,
    ...generated.sections.flatMap(s => [s.heading, ...s.paragraphs]),
    ...generated.conclusion,
  ].join(' ')
  const readTime = estimateReadTime(allText)

  // Construit l'objet MagazineArticle final
  const article: MagazineArticle = {
    slug: generated.slug,
    status: 'draft',
    publishedAt: scheduledFor,
    category: generated.category,
    title: generated.title,
    chapo: generated.chapo,
    meta: `${displayDate} · ${readTime} de lecture`,
    publishedDate: displayDate,
    episodeSlug: episode.aushaSlug,
    episodeNumber: `#${episode.number}`,
    sourceEpisodeNumber: episode.number,
    guest: episode.guest || extractGuestFromTitle(episode.title),
    image: episode.aushaImage || '',
    readTime,
    tags: generated.tags,
    metaDescription: generated.metaDescription,
    quote: generated.quote,
    takeaway: generated.takeaway,
    sections: generated.sections,
    conclusion: generated.conclusion,
  }

  // Persist once at creation; a manual editorial choice can subsequently replace it.
  const { inputs, catalog } = await getEpisodeRecommendationCatalog()
  const cards = new Map(catalog.map(ep => [ep.number, ep]))
  const associationInputs = inputs.map(input => ({
    ...input, guest: cards.get(input.number)?.guest, image: cards.get(input.number)?.image,
  }))
  // The source interview is already in hand even if a second RSS fetch fails.
  if (!associationInputs.some(input => input.number === episode.number)) {
    associationInputs.push({
      number: episode.number, slug: episode.aushaSlug, title: episode.title,
      description: episode.description, guest: episode.guest,
      image: episode.aushaImage, excerpt: '',
    })
  }
  return regenerateArticleAssociations(article, associationInputs)
}

// ─── Helpers privés ───────────────────────────────────────────────────────────

/**
 * Construit le contexte de l'épisode à envoyer au modèle.
 */
function buildEpisodeContext(episode: RssEpisode): string {
  const lines: string[] = [
    `ÉPISODE #${episode.number} — ${episode.title}`,
    '',
    `INVITÉ(E) : ${episode.guest || 'Non précisé'}`,
    `DATE DE PUBLICATION : ${episode.pubDate || 'Non précisée'}`,
    `DURÉE : ${episode.duration}`,
    '',
  ]

  if (episode.subtitle) {
    lines.push(`SOUS-TITRE / ACCROCHE :`)
    lines.push(episode.subtitle)
    lines.push('')
  }

  if (episode.quote) {
    lines.push(`QUESTION D'ACCROCHE (citation de démarrage de l'épisode) :`)
    lines.push(`"${episode.quote}"`)
    lines.push('')
  }

  if (episode.description) {
    lines.push(`DESCRIPTION COMPLÈTE DE L'ÉPISODE :`)
    lines.push(episode.description)
    lines.push('')
  }

  lines.push(`LIEN ÉPISODE : ${episode.link}`)
  lines.push('')
  lines.push(
    `Génère un article éditorial complet pour cet épisode selon les instructions. ` +
    `N'invente aucune information. ` +
    `Si la description est courte, construis l'article autour des thèmes identifiables et de la problématique centrale. ` +
    `Réponds UNIQUEMENT avec le JSON demandé.`
  )

  return lines.join('\n')
}

/**
 * Parse le contenu JSON généré par le modèle.
 * Gère les cas où le modèle entoure le JSON de balises markdown.
 */
function parseGeneratedContent(raw: string): GeneratedArticleContent {
  // Nettoie les éventuelles balises markdown ```json ... ```
  let cleaned = raw.trim()
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
  }

  try {
    const parsed = JSON.parse(cleaned)

    // Validation minimale
    if (!parsed.title || !parsed.sections || !Array.isArray(parsed.sections)) {
      throw new Error('Structure JSON invalide (title ou sections manquants)')
    }

    return parsed as GeneratedArticleContent
  } catch (err) {
    throw new Error(`Impossible de parser le JSON généré: ${err}`)
  }
}

/**
 * Extrait le nom de l'invité depuis le titre si non disponible directement.
 */
function extractGuestFromTitle(title: string): string {
  // Format habituel : "Titre avec Prénom Nom"
  const match = title.match(/avec\s+(.+?)(?:\s*[-–—]|$)/i)
  return match ? match[1].trim() : 'Invité'
}

// ─── Génération en lot ────────────────────────────────────────────────────────

/**
 * Génère des articles pour une liste d'épisodes, un par un avec délai.
 * Retourne les résultats (succès / échec) pour chaque épisode.
 */
export async function generateArticlesForEpisodes(
  episodes: RssEpisode[],
  options: {
    onProgress?: (current: number, total: number, episode: RssEpisode) => void
    delayMs?: number
  } = {}
): Promise<{ episodeNumber: number; success: boolean; error?: string }[]> {
  const results: { episodeNumber: number; success: boolean; error?: string }[] = []
  const delay = options.delayMs ?? 2000 // 2 secondes entre chaque appel par défaut

  for (let i = 0; i < episodes.length; i++) {
    const ep = episodes[i]
    options.onProgress?.(i + 1, episodes.length, ep)

    try {
      await generateArticleFromEpisode(ep)
      results.push({ episodeNumber: ep.number, success: true })
    } catch (err) {
      results.push({
        episodeNumber: ep.number,
        success: false,
        error: String(err),
      })
    }

    // Pause entre les appels pour éviter le rate limiting
    if (i < episodes.length - 1) {
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  return results
}
