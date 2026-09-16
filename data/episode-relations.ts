/**
 * data/episode-relations.ts
 * Groupes éditoriaux manuels pour la section « Épisodes similaires ».
 *
 * Les rapprochements explicitement validés ci-dessous précèdent l'automatique.
 * Les séries, groupes de styles et invités récurrents ne sont pas des preuves
 * qu'un sujet est abordé : ils ne doivent jamais supplanter les sujets de fond.
 * Moteur commun aux pages historiques et RSS : lib/episode-recommendations.ts.
 */

export type EditorialRecommendation = {
  episode: number
  reason: string
  themes: string[]
}

/** Numéros stables, indépendants des slugs RSS. L'ordre est éditorial. */
export const EDITORIAL_RECOMMENDATIONS: Record<number, EditorialRecommendation[]> = {
  128: [
    {
      episode: 22,
      reason: 'Wilfried Bernard / The Pack → Ilies Pidzy : handicap, inclusion et accès au métier de danseur.',
      themes: ['handicap', 'inclusion', 'accessibilite'],
    },
    {
      episode: 25,
      reason: 'Wilfried Bernard / The Pack → Angelina Bruno : inclusion et normalisation des corps différents dans la danse.',
      themes: ['handicap', 'inclusion', 'diversite_corps'],
    },
  ],
}

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
// Anciens regroupements conservés comme repères éditoriaux. Ils n'attribuent
// plus de points : l'appartenance à un univers ne prouve pas un sujet commun.

export const EPISODE_CLUSTERS: Record<string, number[]> = {
  /** Voguing & Ball culture */
  voguing: [4, 58, 69],

  /** Culture club / dancefloor (DJs, clubbing, musique électronique) */
  club: [86, 95, 97, 107],

  /** Battles de danse */
  battles: [6, 88, 103, 127],

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
// Un invité récurrent ne constitue qu'un lien secondaire, pas un sujet de fond.

export const SAME_GUEST_GROUPS: number[][] = [
  [63, 65, 67, 75, 77, 79, 81], // Samuela Berdah & Raphaëlle Petitperrin
  [49, 94],                      // Krees De Almeida
  [6, 103],                      // Nelson Ewandé
  [90, 112],                     // Lÿdie La PëstE
]
