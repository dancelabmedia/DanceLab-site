/**
 * /api/search-stats
 *
 * GET              → retourne les N recherches les plus populaires
 * POST { query }   → enregistre une recherche (incrémente le compteur)
 *
 * Les données sont stockées dans SQLite (même base que les commentaires).
 * La normalisation évite les doublons dus aux majuscules/minuscules/espaces.
 *
 * Confidentialité : une recherche ne peut apparaître dans les suggestions
 * publiques que si elle produit au moins un résultat dans l'index public.
 * Cela empêche que le nom d'une rubrique privée ou d'une page en construction
 * soit révélé indirectement via les chips de suggestions.
 */

import { NextRequest, NextResponse } from 'next/server'
import { recordSearch, getPopularSearches } from '@/lib/db'
import { searchIndex } from '@/data/search-index'
import { searchContent } from '@/data/search'

// On charge plus de résultats bruts pour pouvoir en filtrer
// et toujours en retourner jusqu'à POPULAR_LIMIT après filtrage.
const POPULAR_LIMIT = 10
const POPULAR_FETCH = 30

export async function GET() {
  try {
    const candidates = getPopularSearches(POPULAR_FETCH)

    // Filtre de confidentialité : ne garder que les recherches
    // qui renvoient au moins un résultat public.
    const searches = candidates
      .filter((term) => searchContent(searchIndex, term, 1).length > 0)
      .slice(0, POPULAR_LIMIT)

    return NextResponse.json({ searches }, {
      headers: {
        // Cache court : 60 s côté CDN, revalider en arrière-plan
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
      },
    })
  } catch (err) {
    console.error('[search-stats] GET error:', err)
    return NextResponse.json({ searches: [] }, { status: 200 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const query = typeof body?.query === 'string' ? body.query.trim() : ''

    if (!query) {
      return NextResponse.json({ ok: false, error: 'empty query' }, { status: 400 })
    }

    recordSearch(query)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[search-stats] POST error:', err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
