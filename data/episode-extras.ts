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
  /**
   * URL du Reel Instagram correspondant à cet épisode.
   * Affiche la section « Un extrait de la conversation » sur la page épisode.
   * Si absent, la section n'apparaît pas du tout.
   *
   * Exemples de format accepté :
   *   https://www.instagram.com/reel/ABC123def/
   *   https://www.instagram.com/p/ABC123def/
   */
  instagramReelUrl?: string
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
    instagramReelUrl: "https://www.instagram.com/reel/DboK-ssMwmt/",
  },
  123: {
    quote: "Arrêtons de toujours se comparer, on disperse nos énergies, on ne les met pas à la bonne place.",
    instagramReelUrl: "https://www.instagram.com/reel/Db6NYLKsyG0/",
  },
  // ── Ajouter les prochains épisodes ici ──────────────────────────────────────

  124: {
    quote:          "Tu n'as pas besoin de mettre une emprise sur tes danseurs pour exister.",
    youtubeId:      "NaB8w4BpsyU",
    instagramReelUrl: "https://www.instagram.com/reel/DcMH-YsIqS3/",
  },
  125: {
    quote:          "Aujourd'hui tout va beaucoup plus vite.",
    youtubeId:      "s4RKHoun40k",
    instagramReelUrl: "https://www.instagram.com/reel/DceUKnrs3Zh/",
  },

  // ── Reels Instagram — épisodes 70 à 121 ─────────────────────────────────────
  // Ajoutés ici car la logique extras s'applique à tous les épisodes,
  // qu'ils soient statiques (1–121) ou RSS (≥ 122).

  121: { instagramReelUrl: "https://www.instagram.com/reel/DbWIesKMBur/" },
  120: { instagramReelUrl: "https://www.instagram.com/reel/DbEKL7WM5oy/" },
  119: { instagramReelUrl: "https://www.instagram.com/reel/DayCAZqKhv4/" },
  118: { instagramReelUrl: "https://www.instagram.com/reel/DagCGxUMlxk/" },
  117: { instagramReelUrl: "https://www.instagram.com/reel/DaOAg4IMP_Z/" },
  116: { instagramReelUrl: "https://www.instagram.com/reel/DZ8F_m6M67C/" },
  115: { instagramReelUrl: "https://www.instagram.com/reel/DZp7vTfsIzq/" },
  114: { instagramReelUrl: "https://www.instagram.com/reel/DZX3uJ3sMZz/" },
  113: { instagramReelUrl: "https://www.instagram.com/reel/DZF8A1QqnJh/" },
  112: { instagramReelUrl: "https://www.instagram.com/reel/DYz9UvAsqqX/" },
  111: { instagramReelUrl: "https://www.instagram.com/reel/DYh1nQtM0j5/" },
  110: { instagramReelUrl: "https://www.instagram.com/reel/DYP0EqdsyJf/" },
  109: { instagramReelUrl: "https://www.instagram.com/reel/DX_WO1hM61A/" },
  108: { instagramReelUrl: "https://www.instagram.com/reel/DXr0Ci-jPgy/" },
  107: { instagramReelUrl: "https://www.instagram.com/reel/DXZyHqvDJZu/" },
  106: { instagramReelUrl: "https://www.instagram.com/reel/DXHs34hDHrG/" },
  105: { instagramReelUrl: "https://www.instagram.com/reel/DW1zj6vDNQe/" },
  104: { instagramReelUrl: "https://www.instagram.com/reel/DWjo9NlDEYO/" },
  103: { instagramReelUrl: "https://www.instagram.com/reel/DWRu88gDOEe/" },
  102: { instagramReelUrl: "https://www.instagram.com/reel/DV_speEjOg4/" },
  101: { instagramReelUrl: "https://www.instagram.com/reel/DVtrH-eDRHk/" },
  100: { instagramReelUrl: "https://www.instagram.com/reel/DVbnr6MDATB/" },
   99: { instagramReelUrl: "https://www.instagram.com/reel/DVJmMC9iiUf/" },
   98: { instagramReelUrl: "https://www.instagram.com/reel/DU3r7dhjCME/" },
   97: { instagramReelUrl: "https://www.instagram.com/reel/DUljVlZjKTM/" },
   96: { instagramReelUrl: "https://www.instagram.com/reel/DUTk8IzjKCX/" },
   95: { instagramReelUrl: "https://www.instagram.com/reel/DUBhD0gjI_k/" },
   94: { instagramReelUrl: "https://www.instagram.com/reel/DTvg-FQjPvq/" },
   93: { instagramReelUrl: "https://www.instagram.com/reel/DTdhwFPjKQv/" },
   92: { instagramReelUrl: "https://www.instagram.com/reel/DTLUV0CirbM/" },
   91: { instagramReelUrl: "https://www.instagram.com/reel/DS5XpnyjAKy/" },
   90: { instagramReelUrl: "https://www.instagram.com/reel/DSvMd9mjHr9/" },
   89: { instagramReelUrl: "https://www.instagram.com/reel/DSnRgnBjNOR/" },
   88: { instagramReelUrl: "https://www.instagram.com/reel/DSdMqKjDNWN/" },
   87: { instagramReelUrl: "https://www.instagram.com/reel/DSVQzjMDNTU/" },
   86: { instagramReelUrl: "https://www.instagram.com/reel/DSDbnrojKxT/" },
   85: { instagramReelUrl: "https://www.instagram.com/reel/DRxWPovDFfy/" },
   84: { instagramReelUrl: "https://www.instagram.com/reel/DRfOX63DEzL/" },
   83: { instagramReelUrl: "https://www.instagram.com/reel/DRNcBO-gEwy/" },
   82: { instagramReelUrl: "https://www.instagram.com/reel/DQ7IL59jPxe/" },
   81: { instagramReelUrl: "https://www.instagram.com/reel/DQpJt0gjEeU/" },
   80: { instagramReelUrl: "https://www.instagram.com/reel/DQXIEKSjGhy/" },
   79: { instagramReelUrl: "https://www.instagram.com/reel/DQE_qX6DJF0/" },
   78: { instagramReelUrl: "https://www.instagram.com/reel/DPy3X_HDDjn/" },
   77: { instagramReelUrl: "https://www.instagram.com/reel/DPg_--CjDGL/" },
   76: { instagramReelUrl: "https://www.instagram.com/reel/DPO69ITDPg_/" },
   75: { instagramReelUrl: "https://www.instagram.com/reel/DO85bbUDLf4/" },
   74: { instagramReelUrl: "https://www.instagram.com/reel/DOq36SkjKhs/" },
   73: { instagramReelUrl: "https://www.instagram.com/reel/DOY2P1ljLUt/" },
   72: { instagramReelUrl: "https://www.instagram.com/reel/DOG45ShDEMW/" },
   71: { instagramReelUrl: "https://www.instagram.com/reel/DN02mWZNscV/" },
   70: { instagramReelUrl: "https://www.instagram.com/reel/DNi1Cojo_qV/" },
   69: { instagramReelUrl: "https://www.instagram.com/reel/DNQzcZ_oVOS/" },
   68: { instagramReelUrl: "https://www.instagram.com/reel/DM-x87-glHQ/" },
   67: { instagramReelUrl: "https://www.instagram.com/reel/DMswZgVgE0q/" },
   66: { instagramReelUrl: "https://www.instagram.com/reel/DMauveVA-yH/" },
   65: { instagramReelUrl: "https://www.instagram.com/reel/DMItjpDNtnK/" },
   64: { instagramReelUrl: "https://www.instagram.com/reel/DL2pIE3NAQo/" },
   63: { instagramReelUrl: "https://www.instagram.com/reel/DLknkCjNerG/" },
   62: { instagramReelUrl: "https://www.instagram.com/reel/DLSipdsN8zy/" },
   61: { instagramReelUrl: "https://www.instagram.com/reel/DLAkhdANH2v/" },
   60: { instagramReelUrl: "https://www.instagram.com/reel/DKujZjFN6Ca/" },

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
  17: { youtubeId: 'u0buO70RySE', instagramReelUrl: "https://www.instagram.com/reel/C-nxU5ZA8ni/" }, // 17. Yohann Ancele
  18: { youtubeId: 'NpqopRHlgfI', instagramReelUrl: "https://www.instagram.com/reel/C-5t_rWg3S9/" }, // 18. Léna Schwartz
  19: { youtubeId: '8dz7vje3DQI', instagramReelUrl: "https://www.instagram.com/reel/C_LsJ1iAwmz/" }, // 19. Julie Ollivier
  20: { youtubeId: 'qc23tbQgFqg', instagramReelUrl: "https://www.instagram.com/reel/C_dnEM-Ao00/" }, // 20. Antoine Nya
  21: { youtubeId: '8MeiKRwmKhA', instagramReelUrl: "https://www.instagram.com/reel/C_vvIS8AmnB/" }, // 21. Ludovica Moccia
  22: { youtubeId: '-gp3JDQCi5o', instagramReelUrl: "https://www.instagram.com/reel/DABpGCvAPvC/" }, // 22. Ilies Pidzy
  23: { youtubeId: 'cJLR5RQvQmk', instagramReelUrl: "https://www.instagram.com/reel/DATuQPlAi0w/" }, // 23. Julie Bagalciague
  24: { youtubeId: 'yu3LOIvP4b4', instagramReelUrl: "https://www.instagram.com/reel/DAlyKvVAabG/" }, // 24. Priscilla Villa
  25: { youtubeId: 'LnoKfugAOeA', instagramReelUrl: "https://www.instagram.com/reel/DA3sxwJgIUW/" }, // 25. Angelina Bruno
  26: { youtubeId: 'mGyfR07mznU', instagramReelUrl: "https://www.instagram.com/reel/DBJ1KMPg_1t/" }, // 26. Diem N'guyen
  27: { instagramReelUrl: "https://www.instagram.com/reel/DBb-yWtgcAK/" },                            // 27. Laure Dary (pas de vidéo YouTube)
  28: { youtubeId: 'e04aTA1Uq6Q', instagramReelUrl: "https://www.instagram.com/reel/DBt_u0WAtcd/" }, // 28. Shirwann Jeammes
  29: { youtubeId: 'EdPTc759Z2g', instagramReelUrl: "https://www.instagram.com/reel/DCAA6TqA7Mk/" }, // 29. Reem
  30: { youtubeId: 'StL6yfD6NP8', instagramReelUrl: "https://www.instagram.com/reel/DCR6cJ4A1Gc/" }, // 30. Coraline Bucciacchio
  31: { youtubeId: 'WG0i4OeKVpg', instagramReelUrl: "https://www.instagram.com/reel/DCkAWF-gsMh/" }, // 31. Manuela
  32: { youtubeId: '999pxJNulYk', instagramReelUrl: "https://www.instagram.com/reel/DC2C8zBggI7/" }, // 32. William Arese
  33: { youtubeId: 'VW45g6Woc90', instagramReelUrl: "https://www.instagram.com/reel/DDH6ZiEg7PT/" }, // 33. Cécilia Siharaj
  34: { youtubeId: 'KuqZAQzsffM', instagramReelUrl: "https://www.instagram.com/reel/DDaG2XLgdpD/" }, // 34. Thomas Vrabie
  35: { youtubeId: '2YhVTovh5dg', instagramReelUrl: "https://www.instagram.com/reel/DDr_-TWAERo/" }, // 35. Manon Bouquet
  36: { youtubeId: 'a-BSEbUvyhQ', instagramReelUrl: "https://www.instagram.com/reel/DD9MZKHg10A/" }, // 36. Mélissa Fromentin
  37: { youtubeId: 'UOflLogKv20', instagramReelUrl: "https://www.instagram.com/reel/DEPLcZ7A5OK/" }, // 37. Jade Bayonne
  38: { youtubeId: 'rkyWKoqfElU', instagramReelUrl: "https://www.instagram.com/reel/DEiBOkoADcQ/" }, // 38. Yanis Benzineb
  39: { youtubeId: 'wSPcPSUgCJ8', instagramReelUrl: "https://www.instagram.com/reel/DEzVkCyA3mY/" }, // 39. Rachel Vanier
  40: { youtubeId: 'xRUKew-l9wk', instagramReelUrl: "https://www.instagram.com/reel/DFGJ1D8gbKM/" }, // 40. Laëtitia Moreau
  41: { youtubeId: 'BAYdhN-IcBc', instagramReelUrl: "https://www.instagram.com/reel/DFYJik8g5nH/" }, // 41. Matteo Gheza
  42: { youtubeId: 'yFwrk5pOwUM', instagramReelUrl: "https://www.instagram.com/reel/DFpRflNg-jF/" }, // 42. Gaël Grzeskowiak
  43: { youtubeId: '8g1SyyfZWyA', instagramReelUrl: "https://www.instagram.com/reel/DF8PsDvt5CZ/" }, // 43. Loriane Cateloy-Rose
  44: { youtubeId: 'EnGBwY_3Ngg', instagramReelUrl: "https://www.instagram.com/reel/DGOUpT3Af1O/" }, // 44. Danc.r
  45: { youtubeId: 'XTzCyTr3bvM', instagramReelUrl: "https://www.instagram.com/reel/DGflp1lA0A9/" }, // 45. Julien Verderi
  46: { youtubeId: 'Wqyx94dVaqk', instagramReelUrl: "https://www.instagram.com/reel/DGxcx8vAinu/" }, // 46. Nathalie Lucas
  47: { youtubeId: '-QrJHjHT2Sg', instagramReelUrl: "https://www.instagram.com/reel/DHDfwIttpp5/" }, // 47. Benjamin Jouffret
  48: { youtubeId: 'BBSq-CRix4M', instagramReelUrl: "https://www.instagram.com/reel/DHVYZCCgnZE/" }, // 48. Tamara Fernando
  49: { youtubeId: 'up0qqTrRuCY', instagramReelUrl: "https://www.instagram.com/reel/DHn8xRBo6WQ/" }, // 49. Krees De Almeida
  50: { youtubeId: '7BiM04LsbnQ', instagramReelUrl: "https://www.instagram.com/reel/DH6SrV9N3ZR/" }, // 50. Zoé Laïb
  51: { youtubeId: 'n4OaVUfqtOc', instagramReelUrl: "https://www.instagram.com/reel/DILbzQ3A95v/" }, // 51. Arnaud Deprez
  52: { youtubeId: '2TyYlXWo3q4', instagramReelUrl: "https://www.instagram.com/reel/DIeWiWotyzz/" }, // 52. Mark Weld
  53: { youtubeId: 'J_vjjzAMgzs', instagramReelUrl: "https://www.instagram.com/reel/DIwT6CogOma/" }, // 53. Sabrina Lonis
  54: { youtubeId: 'vVfY44r69jQ', instagramReelUrl: "https://www.instagram.com/reel/DJCSE6UIpUP/" }, // 54. Link Le Neil
  55: { youtubeId: '-f5K1q4wFjc', instagramReelUrl: "https://www.instagram.com/reel/DJTf33yANIa/" }, // 55. Lisa Dulin
  56: { youtubeId: 'O8ikD0oiB1g', instagramReelUrl: "https://www.instagram.com/reel/DJln9BttjOe/" }, // 56. Mélodie Molinaro
  57: { youtubeId: 'erAad7BY2gE', instagramReelUrl: "https://www.instagram.com/reel/DJ4ii6OtX2m/" }, // 57. Selasi Dogbatse
  58: { youtubeId: '1R0k9hsSfjU', instagramReelUrl: "https://www.instagram.com/reel/DKKemOnI4Y1/" }, // 58. Emanuelle Soum
  59: { youtubeId: 'MIfa5DXmjZA', instagramReelUrl: "https://www.instagram.com/reel/DKcgQd5odct/" }, // 59. Hajiba Fahmy
}
