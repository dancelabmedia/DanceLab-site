import type { Metadata } from "next"
import DecouvrirClient from "./DecouvrirClient"
import { getPublishedArticles } from "./articles-data"
import { getLatestEpisode, getEpisodes } from "@/lib/episodes"

// ── Revalidation ISR ──────────────────────────────────────────────────────────
// La page est re-rendue au maximum toutes les heures sur Vercel.
// Un article programmé à 09h00 apparaîtra au plus tard à 10h00.
// Aucun redéploiement manuel n'est nécessaire.
export const revalidate = 3600

export const metadata: Metadata = {
  title: "Magazine Dance Lab - Actualités, culture et décryptages danse",
  description:
    "Articles, analyses, culture, tendances et décryptages : le magazine Dance Lab explore la danse, ses artistes, ses pratiques et les évolutions du secteur.",
  openGraph: {
    title: "Magazine Dance Lab - Actualités, culture et décryptages danse",
    description:
      "Articles, analyses, culture, tendances et décryptages : le magazine Dance Lab explore la danse, ses artistes, ses pratiques et les évolutions du secteur.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Magazine Dance Lab - Actualités, culture et décryptages danse",
    description:
      "Articles, analyses, culture, tendances et décryptages : le magazine Dance Lab explore la danse, ses artistes, ses pratiques et les évolutions du secteur.",
  },
}

export default async function DecouvrirPage() {
  // Filtrage côté serveur : seuls les articles publiés atteignent le client.
  const publishedArticles = getPublishedArticles()

  // Épisodes pour la section podcast : dernier épisode + catalogue complet pour le carrousel
  const [latestEpisode, carouselEpisodes] = await Promise.all([
    getLatestEpisode(),
    getEpisodes(),
  ])

  return (
    <DecouvrirClient
      articles={publishedArticles}
      latestEpisode={latestEpisode}
      carouselEpisodes={carouselEpisodes}
    />
  )
}
