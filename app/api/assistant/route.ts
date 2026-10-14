import { getAssistantIndex } from '@/data/assistant-index'
import { findRelevantContent, generateEditorialPresentation, generateEditorialResponse, generateFollowUps, type AssistantHistoryMessage, type AssistantResponse } from '@/data/assistant-retrieval'

/** Convention éditoriale Dance Lab : aucun tiret long dans les textes affichés. */
function normalizeAssistantDashes(value: string): string {
  return value.replace(/[—–]/g, '-')
}

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json()
    const { query, history = [], recentResultIds = [], suggestedQuestions = [] } = body as {
      query: string
      history?: AssistantHistoryMessage[]
      recentResultIds?: string[]
      suggestedQuestions?: string[]
    }

    if (!query || typeof query !== 'string') {
      return Response.json({ error: 'Query is required and must be a string' }, { status: 400 })
    }

    const trimmedQuery = query.trim()
    if (trimmedQuery.length === 0) {
      return Response.json({ error: 'Query cannot be empty' }, { status: 400 })
    }

    const safeHistory = Array.isArray(history)
      ? history.slice(-8).filter(item => item && (item.role === 'user' || item.role === 'assistant') && typeof item.content === 'string').map(item => ({ ...item, content: item.content.slice(0, 1000) }))
      : []
    const safeRecentIds = Array.isArray(recentResultIds) ? recentResultIds.filter(id => typeof id === 'string').slice(-100) : []
    const safeSuggestedQuestions = Array.isArray(suggestedQuestions)
      ? suggestedQuestions.filter(question => typeof question === 'string').slice(-100).map(question => question.slice(0, 300))
      : []

    // Load the cached assistant index (built from RSS + static data with full searchTags)
    const items = await getAssistantIndex()

    // Find relevant content using intent-aware scoring
    const results = findRelevantContent(trimmedQuery, items, 3, { recentResultIds: safeRecentIds })
      // Le texte d'indexation peut contenir des fiches éditoriales très longues.
      // Il sert au classement côté serveur, jamais à l'affichage dans le panneau.
      .map(item => ({ ...item, searchText: '' }))

    // Generate contextual editorial message
    const message = generateEditorialResponse(trimmedQuery, results, safeHistory)
    const followUps = generateFollowUps(trimmedQuery, {
      excludedQuestions: [
        ...safeSuggestedQuestions,
        ...safeHistory.filter(item => item.role === 'user').map(item => item.content),
      ],
    })
    const editorial = generateEditorialPresentation(trimmedQuery, results)

    const response: AssistantResponse = {
      message: normalizeAssistantDashes(message),
      results: results.map(item => ({
        ...item,
        answerDetails: undefined,
        recommendationEvidence: undefined,
        title: normalizeAssistantDashes(item.title),
        guest: item.guest ? normalizeAssistantDashes(item.guest) : undefined,
        category: item.category ? normalizeAssistantDashes(item.category) : undefined,
        excerpt: normalizeAssistantDashes(item.excerpt),
        tags: item.tags.map(normalizeAssistantDashes),
      })),
      followUps: followUps.map(normalizeAssistantDashes),
      editorial: {
        heading: normalizeAssistantDashes(editorial.heading),
        highlights: editorial.highlights?.map(highlight => ({
          title: normalizeAssistantDashes(highlight.title),
          items: highlight.items.map(normalizeAssistantDashes),
        })),
      },
    }

    return Response.json(response)
  } catch (error) {
    console.error('Assistant API error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
