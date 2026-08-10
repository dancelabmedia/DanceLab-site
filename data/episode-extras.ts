/**
 * data/episode-extras.ts
 *
 * Données complémentaires à ajouter MANUELLEMENT pour chaque nouvel épisode.
 * Ausha et YouTube sont les sources automatiques — ce fichier sert uniquement
 * à enrichir ou corriger ces données.
 *
 * ─── Ce que tu gères ici ────────────────────────────────────────────────────
 *  • quote     : citation affichée sur la carte interview et la page épisode
 *  • image     : chemin local si tu veux un nom personnalisé (sinon {number}.jpg)
 *  • youtubeId : ID YouTube (11 car.) si la correspondance auto échoue ou
 *                si la vidéo est trop ancienne pour figurer dans le flux RSS
 *
 * ─── Ce que tu n'as PAS besoin de renseigner ────────────────────────────────
 *  • Données de base (titre, invité, durée, date) → Ausha RSS automatiquement
 *  • Vidéos récentes (15 derniers uploads) → YouTube RSS automatiquement
 *  • Image de couverture → Ausha CDN en fallback si pas de fichier local
 *
 * ─── Naming convention pour les images ──────────────────────────────────────
 *  Dépose les visuels dans : public/episodes/
 *  Nom recommandé          : {numéro}.jpg  (ex : 122.jpg)
 *  Le fallback auto        : image de couverture Ausha CDN
 *
 * ─── Comment associer une vidéo YouTube manuellement ────────────────────────
 *  URL YouTube : https://www.youtube.com/watch?v=XXXXXXXXXXX
 *  ID à copier :                                 ^^^^^^^^^^^ (11 caractères)
 *
 *  Exemples :
 *    https://www.youtube.com/watch?v=1arXpUwWODA  →  youtubeId: "1arXpUwWODA"
 *    https://youtu.be/1arXpUwWODA                 →  youtubeId: "1arXpUwWODA"
 *
 * ─── Clé = numéro d'épisode ─────────────────────────────────────────────────
 */

export type EpisodeExtra = {
  /** Citation mise en avant */
  quote?: string
  /**
   * Titre corrigé — remplace celui du RSS si besoin
   * (ex : ajouter un "?" manquant, corriger une coquille)
   */
  title?: string
  /** Chemin image personnalisé (ex : "/episodes/mylene-amboka.jpg") */
  image?: string
  /**
   * ID YouTube (11 caractères) si la correspondance automatique échoue.
   * Utilisé aussi pour les épisodes trop anciens pour figurer dans le flux RSS YouTube.
   * Un override manuel prend toujours la priorité sur la correspondance automatique.
   */
  youtubeId?: string
}

/**
 * Extras manuels. Les épisodes 1–121 sont dans data/episodes-list.ts.
 * N'ajoute une entrée ici que si tu as quelque chose à renseigner manuellement.
 */
export const episodeExtras: Record<number, EpisodeExtra> = {
  122: {
    title: "Peut-on réussir dans la danse sans sacrifier sa santé mentale ?",
    quote: "Savoir dire non et penser à sa vie perso, c'est une bonne chose",
  },
  // ── Ajouter les prochains épisodes ici ──────────────────────────────────────
  //
  // 123: {
  //   quote:     "…",
  //   youtubeId: "abc12345678",   // si la correspondance auto échoue
  // },
}
