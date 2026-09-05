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
  title: 'Dance Lab Podcast - Interviews et conversations sur la danse',
  description:
    'Écoute les épisodes de Dance Lab et découvre les parcours, expériences et réflexions des danseurs, chorégraphes et professionnels qui font vivre la danse.',
  openGraph: {
    title: 'Dance Lab Podcast - Interviews et conversations sur la danse',
    description:
      'Écoute les épisodes de Dance Lab et découvre les parcours, expériences et réflexions des danseurs, chorégraphes et professionnels qui font vivre la danse.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dance Lab Podcast - Interviews et conversations sur la danse',
    description:
      'Écoute les épisodes de Dance Lab et découvre les parcours, expériences et réflexions des danseurs, chorégraphes et professionnels qui font vivre la danse.',
  },
}

export default async function EcouterPage() {
  const episodes = await getEpisodes()
  return <EcouterClient episodes={episodes} />
}
