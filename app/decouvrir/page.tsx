import type { Metadata } from "next"
import DecouvrirClient from "./DecouvrirClient"
import { getPublishedArticles } from "./articles-data"

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

export default function DecouvrirPage() {
  // Filtrage côté serveur : seuls les articles publiés atteignent le client.
  // Les brouillons et les articles programmés dans le futur ne sont jamais
  // envoyés dans le bundle JavaScript du navigateur.
  const publishedArticles = getPublishedArticles()

  return <DecouvrirClient articles={publishedArticles} />
}
