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
import { getPublishedArticles } from './decouvrir/articles-data'
import HomeClient from './HomeClient'

// Revalidation ISR Vercel — 1 heure (identique à /ecouter)
export const revalidate = 3600

export const metadata = {
  title: 'Dance Lab - Le podcast et média de référence de la danse',
  description:
    "Dance Lab est le podcast et média de référence sur la danse : podcast, interviews, articles, culture, métiers, écoles de danse, conseils, spectacles et ressources pour découvrir, comprendre et vivre la danse.",
  openGraph: {
    title: 'Dance Lab - Le podcast et média de référence de la danse',
    description:
      'Podcast, interviews, articles, culture, métiers, écoles, spectacles et ressources : découvre celles et ceux qui font, pensent et transforment la danse.',
    type: 'website',
    siteName: 'Dance Lab',
    locale: 'fr_FR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dance Lab - Le podcast et média de référence de la danse',
    description:
      'Podcast, interviews, articles, culture, métiers, écoles, spectacles et ressources : découvre celles et ceux qui font, pensent et transforment la danse.',
  },
}

export default async function DanceLabPage() {
  const episodes = await getEpisodes()
  // episodes[0] est toujours le plus récent (RSS Ausha > statique)
  const latestEpisode = episodes[0]
  // Dernier article publié — null si aucun article n'est encore publié
  const latestArticle = getPublishedArticles()[0] ?? null
  return <HomeClient latestEpisode={latestEpisode} latestArticle={latestArticle} />
}
