/**
 * app/ecouter/page.tsx — Server Component
 *
 * Récupère les épisodes depuis la source unifiée (statique + RSS Ausha)
 * et les passe au composant client interactif.
 *
 * ISR : la page est regénérée automatiquement toutes les heures côté Vercel.
 * Les nouveaux épisodes publiés sur Ausha apparaissent sans action manuelle.
 */

import { getEpisodes } from '@/lib/episodes'
import EcouterClient from './EcouterClient'

// Revalidation ISR Vercel — 1 heure
export const revalidate = 3600

export const metadata = {
  title: 'Tous les épisodes — Podcast Dance Lab',
  description:
    "Conversations, parcours et réflexions autour de la danse, du métier d\u2019artiste et de tout ce qui se cache derrière la scène.",
}

export default async function EcouterPage() {
  const episodes = await getEpisodes()
  return <EcouterClient episodes={episodes} />
}
