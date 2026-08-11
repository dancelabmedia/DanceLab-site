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
  /**
   * ID Spotify de l'épisode — uniquement si la détection automatique échoue.
   *
   * La détection automatique récupère cet ID depuis la smartlink Ausha
   * (bouton "Écouter sur Spotify"). Renseigne ce champ seulement si le lecteur
   * Spotify n'apparaît pas sur la page et que la smartlink Ausha est indisponible.
   *
   * Pour trouver l'ID : ouvre l'épisode sur Spotify → copie l'URL
   *   https://open.spotify.com/episode/3sgZzwiot3USPKkGm8HOxd
   * L'ID est la partie après "/episode/" :  3sgZzwiot3USPKkGm8HOxd
   */
  spotifyId?: string
}

/**
 * Extras manuels. Les épisodes 1–121 sont dans data/episodes-list.ts.
 * N'ajoute une entrée ici que si tu as quelque chose à renseigner manuellement.
 */
export const episodeExtras: Record<number, EpisodeExtra> = {

  // ── Épisodes RSS (≥ 122) ─────────────────────────────────────────────────────

  122: {
    title: "Peut-on réussir dans la danse sans sacrifier sa santé mentale ?",
    quote: "Savoir dire non et penser à sa vie perso, c'est une bonne chose",
  },
  123: {
    quote: "Arrêtons de toujours se comparer, on disperse nos énergies, on ne les met pas à la bonne place.",
  },
  // ── Ajouter les prochains épisodes ici ──────────────────────────────────────
  //
  // 123: {
  //   quote:     "…",
  //   youtubeId: "abc12345678",   // si la correspondance auto échoue
  // },

  // ── Épisodes 1–59 : vidéos YouTube associées ─────────────────────────────────
  // Retrouvées automatiquement via recherche par numéro d'épisode + nom d'invité.
  // Les épisodes 60–121 ont leur vidéo dans data/episodes.ts (champ youtube).
  // L'épisode 27 (Laure Dary) n'a pas de vidéo sur la chaîne.

   1: { youtubeId: 'G6mPGnJ2k6M' }, // 1. Mathilde Champion
   2: { youtubeId: 'jyoFJPY4YLM' }, // 2. Omar Dramé
   3: { youtubeId: 'F5KPbBwk0ZQ' }, // 3. Aurélie Sériné
   4: { youtubeId: 'HIqljgrS2bs' }, // 4. Legendary Yanou
   5: { youtubeId: 'gWTWo8hpZc8' }, // 5. Annabelle Da Fonte
   6: { youtubeId: 'nOfuRNRx44M' }, // 6. Nelson Ewandé
   7: { youtubeId: '4NAix3lj97U' }, // 7. Delphine Lemaitre
   8: { youtubeId: 'L2bE7KvQ_M4' }, // 8. Piche
   9: { youtubeId: 'PfQd4QCwzQE' }, // 9. Émilie Heinrich
  10: { youtubeId: 'qZ1EPCjeK64' }, // 10. Régis Truchy
  11: { youtubeId: 'W_n_mGByHFY' }, // 11. Émilie Ferreira Saramago
  12: { youtubeId: '8n5aDeIA734' }, // 12. Rabah Alioune
  13: { youtubeId: 'AL1e34XQuS8' }, // 13. Spoade
  14: { youtubeId: 'pg9gsXPkZy0' }, // 14. Kriss Logan
  15: { youtubeId: 'LYssVy12PXA' }, // 15. Marie Jamots
  16: { youtubeId: 'oOTqvyazgXs' }, // 16. Justine Gérard
  17: { youtubeId: 'u0buO70RySE' }, // 17. Yohann Ancele
  18: { youtubeId: 'NpqopRHlgfI' }, // 18. Léna Schwartz
  19: { youtubeId: '8dz7vje3DQI' }, // 19. Julie Ollivier
  20: { youtubeId: 'qc23tbQgFqg' }, // 20. Antoine Nya
  21: { youtubeId: '8MeiKRwmKhA' }, // 21. Ludovica Moccia
  22: { youtubeId: '-gp3JDQCi5o' }, // 22. Ilies Pidzy
  23: { youtubeId: 'cJLR5RQvQmk' }, // 23. Julie Bagalciague
  24: { youtubeId: 'yu3LOIvP4b4' }, // 24. Priscilla Villa
  25: { youtubeId: 'LnoKfugAOeA' }, // 25. Angelina Bruno
  26: { youtubeId: 'mGyfR07mznU' }, // 26. Diem N'guyen
  // 27: pas de vidéo sur la chaîne (Laure Dary)
  28: { youtubeId: 'e04aTA1Uq6Q' }, // 28. Shirwann Jeammes
  29: { youtubeId: 'EdPTc759Z2g' }, // 29. Reem
  30: { youtubeId: 'StL6yfD6NP8' }, // 30. Coraline Bucciacchio
  31: { youtubeId: 'WG0i4OeKVpg' }, // 31. Manuela
  32: { youtubeId: '999pxJNulYk' }, // 32. William Arese
  33: { youtubeId: 'VW45g6Woc90' }, // 33. Cécilia Siharaj
  34: { youtubeId: 'KuqZAQzsffM' }, // 34. Thomas Vrabie
  35: { youtubeId: '2YhVTovh5dg' }, // 35. Manon Bouquet
  36: { youtubeId: 'a-BSEbUvyhQ' }, // 36. Mélissa Fromentin
  37: { youtubeId: 'UOflLogKv20' }, // 37. Jade Bayonne
  38: { youtubeId: 'rkyWKoqfElU' }, // 38. Yanis Benzineb
  39: { youtubeId: 'wSPcPSUgCJ8' }, // 39. Rachel Vanier
  40: { youtubeId: 'xRUKew-l9wk' }, // 40. Laëtitia Moreau
  41: { youtubeId: 'BAYdhN-IcBc' }, // 41. Matteo Gheza
  42: { youtubeId: 'yFwrk5pOwUM' }, // 42. Gaël Grzeskowiak
  43: { youtubeId: '8g1SyyfZWyA' }, // 43. Loriane Cateloy-Rose
  44: { youtubeId: 'EnGBwY_3Ngg' }, // 44. Danc.r
  45: { youtubeId: 'XTzCyTr3bvM' }, // 45. Julien Verderi
  46: { youtubeId: 'Wqyx94dVaqk' }, // 46. Nathalie Lucas
  47: { youtubeId: '-QrJHjHT2Sg' }, // 47. Benjamin Jouffret
  48: { youtubeId: 'BBSq-CRix4M' }, // 48. Tamara Fernando
  49: { youtubeId: 'up0qqTrRuCY' }, // 49. Krees De Almeida
  50: { youtubeId: '7BiM04LsbnQ' }, // 50. Zoé Laïb
  51: { youtubeId: 'n4OaVUfqtOc' }, // 51. Arnaud Deprez
  52: { youtubeId: '2TyYlXWo3q4' }, // 52. Mark Weld
  53: { youtubeId: 'J_vjjzAMgzs' }, // 53. Sabrina Lonis
  54: { youtubeId: 'vVfY44r69jQ' }, // 54. Link Le Neil
  55: { youtubeId: '-f5K1q4wFjc' }, // 55. Lisa Dulin
  56: { youtubeId: 'O8ikD0oiB1g' }, // 56. Mélodie Molinaro
  57: { youtubeId: 'erAad7BY2gE' }, // 57. Selasi Dogbatse
  58: { youtubeId: '1R0k9hsSfjU' }, // 58. Emanuelle Soum
  59: { youtubeId: 'MIfa5DXmjZA' }, // 59. Hajiba Fahmy
}
