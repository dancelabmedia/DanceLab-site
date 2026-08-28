import type { Metadata } from "next"
import DecouvrirClient from "./DecouvrirClient"
import { getPublishedArticles } from "./articles-data"

// ── Revalidation ISR ──────────────────────────────────────────────────────────
// La page est re-rendue au maximum toutes les heures sur Vercel.
// Un article programmé à 09h00 apparaîtra au plus tard à 10h00.
// Aucun redéploiement manuel n'est nécessaire.
export const revalidate = 3600

export const metadata: Metadata = {
  title: "Magazine | Dance Lab",
  description:
    "Comprendre la danse autrement. Décryptages, culture, parcours, histoire et ressources pour regarder la danse au-delà de la scène.",
}

export default function DecouvrirPage() {
  // Filtrage côté serveur : seuls les articles publiés atteignent le client.
  // Les brouillons et les articles programmés dans le futur ne sont jamais
  // envoyés dans le bundle JavaScript du navigateur.
  const publishedArticles = getPublishedArticles()

  return <DecouvrirClient articles={publishedArticles} />
}
