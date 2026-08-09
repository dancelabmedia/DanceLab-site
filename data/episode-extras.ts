/**
 * data/episode-extras.ts
 *
 * Données complémentaires à ajouter MANUELLEMENT pour chaque nouvel épisode.
 * Ausha est la source de vérité pour les données de base (titre, invité, durée, etc.).
 * Ce fichier sert à enrichir ces données avec :
 *   - une citation mise en avant (affichée sur la carte et la page de l'épisode)
 *   - un chemin d'image local si tu déposes le visuel dans /public/episodes/
 *
 * ─── Naming convention pour les images ────────────────────────────────────────
 * Dépose les visuels dans : public/episodes/
 * Nom recommandé          : {numéro}.jpg  (ex : 122.jpg, 123.jpg)
 *
 * Si le fichier existe, il est utilisé automatiquement.
 * Si aucun fichier ne correspond, l'image Ausha CDN est utilisée à la place.
 * Tu peux aussi spécifier un nom personnalisé via le champ `image` ci-dessous.
 *
 * ─── Comment ajouter un épisode ───────────────────────────────────────────────
 * 1. Ausha publie l'épisode → il apparaît automatiquement dans les listes
 * 2. Tu ajoutes une entrée ici si tu veux une citation ou une image personnalisée
 * 3. Tu déposes le visuel dans public/episodes/
 *
 * ─── Format ───────────────────────────────────────────────────────────────────
 * La clé est le numéro d'épisode (number).
 */

export type EpisodeExtra = {
  /** Citation mise en avant (affichée sur la carte interview) */
  quote?: string
  /**
   * Chemin local de l'image (relatif à /public/).
   * Exemple : "/episodes/mylene-amboka.jpg"
   * Si absent, le système cherche automatiquement /episodes/{number}.jpg puis .png,
   * avant de retomber sur l'image du CDN Ausha.
   */
  image?: string
}

/**
 * Extras manuels pour les épisodes publiés depuis Ausha.
 * Clé = numéro d'épisode.
 *
 * Les épisodes 1–121 sont dans data/episodes-list.ts (données historiques).
 * Seuls les nouveaux épisodes (≥ 122) doivent être ajoutés ici.
 */
export const episodeExtras: Record<number, EpisodeExtra> = {
  // ── Exemples — remplace par tes vrais contenus ────────────────────────────
  //
  // 122: {
  //   quote: "Savoir dire non et penser à sa vie perso, c'est une bonne chose.",
  //   image: "/episodes/mylene-amboka.jpg",
  // },
  //
  // 123: {
  //   quote: "Arrêtons de toujours se comparer, on disperse nos énergies.",
  // },
}
