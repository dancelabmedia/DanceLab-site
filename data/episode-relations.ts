/**
 * data/episode-relations.ts
 * Groupes éditoriaux manuels pour la section « Épisodes similaires ».
 *
 * Ces données complètent la détection automatique par mots-clés (THEME_CLUSTERS)
 * en capturant des liens que les textes libres ne permettent pas d'inférer :
 * séries d'épisodes, même invité récurrent, univers thématique précis, etc.
 *
 * Hiérarchie de scoring (voir getSimilarEpisodes dans page.tsx) :
 *   1. Même série (EPISODE_SERIES)      → +10 pts
 *   2. Même invité récurrent            → +7  pts
 *   3. Même cluster thématique          → +5  pts (cumulatif si plusieurs clusters)
 *   4. Thème textuel partagé            → +1  pt  (cumulatif, depuis THEME_CLUSTERS)
 */

// ─── Séries formelles ──────────────────────────────────────────────────────────
// Episodes appartenant à une même série éditoriale (même univers / même concept).
// Un épisode peut appartenir à plusieurs séries si justifié.

export const EPISODE_SERIES: Record<string, number[]> = {
  /** Droit du travail des artistes — avec Samuela Berdah & Raphaëlle Petitperrin (CND) */
  cnd: [63, 65, 67, 75, 77, 79, 81],

  /** Tournée / univers Soprano — Soprano, Krees De Almeida (chorégraphe), Romain Mutant (danseur) */
  soprano: [89, 94, 96],
}

// ─── Clusters thématiques éditoriaux ──────────────────────────────────────────
// Groupes éditoriaux pour des styles, pratiques ou sujets non couverts (ou mal
// couverts) par la détection automatique de THEME_CLUSTERS dans page.tsx.

export const EPISODE_CLUSTERS: Record<string, number[]> = {
  /** Voguing & Ball culture */
  voguing: [4, 58, 69],

  /** Culture club / dancefloor (DJs, clubbing, musique électronique) */
  club: [86, 95, 97, 107],

  /** Battles de danse */
  battles: [6, 88, 103],

  /** Danse Avec Les Stars (DALS) */
  dals: [62, 72],

  /** Danse électro / Tecktonik */
  electro: [37, 82],

  /** Photographie de danse */
  photo: [14, 120],

  /** Troubles alimentaires & image du corps (TCA, dysmorphophobie) */
  tca: [36, 38, 85],

  /** Heels comme style / féminité affirmée */
  heels: [23, 118],

  /** Handicap & corps différents */
  handicap: [22, 25],

  /** Danse & mode / vêtements */
  mode: [21, 41],

  /** Polyvalence artistique */
  polyvalence: [49, 50, 59, 80, 87, 114],

  /** Flamenco */
  flamenco: [64],

  /** Pole dance */
  pole: [99],

  /** Krump — renforcement de la détection automatique (THEME_CLUSTERS 'krump' = +1 seulement) */
  krump: [91, 113],

  /** Danse classique — renforcement de la détection automatique ('classique' = +1 seulement) */
  classique: [30, 73],
}

// ─── Invités récurrents ────────────────────────────────────────────────────────
// Chaque tableau regroupe les numéros d'épisodes d'un même invité.
// Les épisodes CND sont inclus ici aussi (cumul de score justifié).

export const SAME_GUEST_GROUPS: number[][] = [
  [63, 65, 67, 75, 77, 79, 81], // Samuela Berdah & Raphaëlle Petitperrin
  [49, 94],                      // Krees De Almeida
  [6, 103],                      // Nelson Ewandé
  [90, 112],                     // Lÿdie La PëstE
]
