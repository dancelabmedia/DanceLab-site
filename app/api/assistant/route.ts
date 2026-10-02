import { getAssistantIndex } from '@/data/assistant-index'
import { findRelevantContent, generateEditorialResponse, generateFollowUps, type AssistantHistoryMessage, type AssistantResponse } from '@/data/assistant-retrieval'

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json()
    const { query, history = [], recentResultIds = [] } = body as { query: string; history?: AssistantHistoryMessage[]; recentResultIds?: string[] }

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
    const safeRecentIds = Array.isArray(recentResultIds) ? recentResultIds.filter(id => typeof id === 'string').slice(-20) : []

    // Load the cached assistant index (built from RSS + static data with full searchTags)
    const items = await getAssistantIndex()

    // Find relevant content using intent-aware scoring
    const results = findRelevantContent(trimmedQuery, items, 4, { recentResultIds: safeRecentIds })

    // Generate contextual editorial message
    const message = generateEditorialResponse(trimmedQuery, results, safeHistory)
    const followUps = generateFollowUps(trimmedQuery)

    const response: AssistantResponse = { message, results, followUps }

    return Response.json(response)
  } catch (error) {
    console.error('Assistant API error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
