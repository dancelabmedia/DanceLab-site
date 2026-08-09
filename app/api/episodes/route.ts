/**
 * app/api/episodes/route.ts
 *
 * Route API Next.js qui expose les épisodes fusionnés (statiques + RSS).
 * Utilisée par les composants client qui ne peuvent pas appeler directement
 * les Server Functions (ex : page.tsx marquée 'use client').
 *
 * ISR : la réponse est mise en cache et regénérée toutes les heures côté serveur.
 * Les clients reçoivent toujours une réponse instantanée depuis le cache.
 */

import { NextResponse } from 'next/server'
import { getEpisodes } from '@/lib/episodes'

// Revalidation Vercel ISR — toutes les heures
export const revalidate = 3600

export async function GET() {
  try {
    const episodes = await getEpisodes()
    return NextResponse.json(episodes, {
      headers: {
        // Cache partagé 1 heure, revalidé en arrière-plan (stale-while-revalidate)
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    })
  } catch (error) {
    console.error('[/api/episodes] Erreur :', error)
    return NextResponse.json(
      { error: 'Impossible de récupérer les épisodes' },
      { status: 500 },
    )
  }
}
