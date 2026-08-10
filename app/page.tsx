/**
 * app/page.tsx — Page d'accueil (Server Component)
 *
 * Récupère le dernier épisode depuis la source unifiée (statique + RSS Ausha)
 * et le passe au composant client interactif.
 *
 * ISR : la page est regénérée automatiquement toutes les heures côté Vercel.
 * Dès qu'un nouvel épisode est publié sur Ausha, il devient automatiquement
 * le "Dernier épisode" sur l'accueil, sans intervention manuelle.
 *
 * Source de vérité unique : getEpisodes() — identique à la page /ecouter.
 */

import { getEpisodes } from '@/lib/episodes'
import HomeClient from './HomeClient'

// Revalidation ISR Vercel — 1 heure (identique à /ecouter)
export const revalidate = 3600

export const metadata = {
  title: 'Dance Lab — Le podcast qui ouvre les portes de la danse',
  description:
    "Conversations avec les danseurs, chorégraphes et artistes qui font la danse d'aujourd'hui. Podcast, articles et ressources pour découvrir, comprendre et vivre la danse.",
}

export default async function DanceLabPage() {
  const episodes = await getEpisodes()
  // episodes[0] est toujours le plus récent (RSS Ausha > statique)
  const latestEpisode = episodes[0]
  return <HomeClient latestEpisode={latestEpisode} />
}
