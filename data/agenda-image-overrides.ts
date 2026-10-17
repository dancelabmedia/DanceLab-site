/**
 * agenda-image-overrides.ts
 *
 * Mapping des images locales pour les événements de l'agenda.
 * Générée automatiquement — toutes les images sont stockées dans /public/images/agenda/.
 *
 * Priorité : image locale > image CDN de la source (paris.fr, etc.)
 *
 * Pour ajouter une image manuellement :
 *   1. Placer le fichier dans public/images/agenda/{event-id}.jpg
 *   2. Ajouter une entrée ici avec les métadonnées
 */

export type AgendaImageMeta = {
  /** Chemin relatif à /public (commence par /images/agenda/) */
  localPath: string
  /** URL source originale de l'image */
  sourceUrl?: string
  /** Crédit photographique, si disponible */
  credit?: string
}

/**
 * Images partagées entre plusieurs événements (séries, festivals, lieux).
 * Clé = URL source CDN → valeur = chemin local.
 */
export const SHARED_IMAGE_OVERRIDES: Record<string, string> = {
  "https://cdn.paris.fr/qfapv4/2025/06/04/huge-e77015cf365d7e3a3572f15a96718e74.jpg":
    "/images/agenda/kiosque-fete-1.jpg",
  "https://cdn.paris.fr/qfapv4/2025/06/04/huge-df66110b2c5d35ca79be682547c26f7e.jpg":
    "/images/agenda/kiosque-fete-2.jpg",
  "https://cdn.paris.fr/qfapv4/2025/05/28/huge-164f8aff042b5f1c1d80e4e2699be0ab.jpg":
    "/images/agenda/kiosque-fete-3.jpg",
  "https://cdn.paris.fr/qfapv4/2025/01/14/huge-8c70e1d25d24703e6a361053c5d48cb9.jpg":
    "/images/agenda/kiosque-fete-4.jpg",
  "https://cdn.paris.fr/qfapv4/2026/07/27/huge-9dc39017b179145ab4cd7c4b14fb2fbe.jpg":
    "/images/agenda/rock-4-temps-moderne.jpg",
  "https://cdn.paris.fr/qfapv4/2026/08/28/huge-7ee411eafd8c91411e6803d82d4db1f1.png":
    "/images/agenda/capoeira-angola-faiska.png",
  "https://cdn.paris.fr/qfapv4/2026/05/26/huge-31e29ca2df315d20a9930904a746751a.png":
    "/images/agenda/chaillot-invite.png",
  "https://cdn.paris.fr/qfapv4/2026/05/26/huge-dc4092aa9dd3bbb03c54a7e3036b414a.jpg":
    "/images/agenda/chaillot-visites.jpg",
  "https://cdn.paris.fr/qfapv4/2026/05/29/huge-9f8c79fcac68c7c06a265497ceb70164.jpg":
    "/images/agenda/chaillot-rencontres.jpg",
}

/**
 * Images individuelles pour des événements Notion, hardcodés ou spéciaux
 * (non issus du JSON collecté).
 * Clé = slug de l'événement ou identifiant libre.
 */
export const SPECIAL_EVENT_IMAGES: Record<string, AgendaImageMeta> = {
  "festival-avignon-2026": {
    localPath: "/images/agenda/festival-avignon-2026.jpeg",
    sourceUrl: "https://festival-avignon.com/storage/image/41/354841_6a6729c5c721a.jpeg",
    credit: "© Festival d'Avignon 2026 — affiche officielle 80e édition",
  },
  "festival-paris-lete-2026": {
    localPath: "/images/agenda/festival-paris-lete-2026.jpg",
    sourceUrl: "https://cdn.paris.fr/qfapv4/2025/06/12/huge-eb1efd8cc79e51647182b392b2607781.jpg",
    credit: "© Festival Paris l'été",
  },
  "all-world-waacking-2026": {
    localPath: "/images/agenda/all-world-waacking-2026.jpg",
    sourceUrl: "https://www.grandpalais.fr/sites/default/files/medias/images/2026-03/visuel-all-world-waacking-battle-2vs2-josepha-madoki-c-grandpalaisrmn2025-c-quentin-chevrier.jpg",
    credit: "© Quentin Chevrier / Grand Palais RMN 2025",
  },
  "grand-defile-edith-amsellem": {
    localPath: "/images/agenda/grand-defile-edith-amsellem.jpg",
    sourceUrl: "https://www.lecarreaudutemple.eu/app/uploads/2026/04/Le-Grand-Defile-Edith-Amsellem-©-Edith-Amsellem-et-Marguerite-Ruggirello-1920X1080.jpg",
    credit: "© Edith Amsellem & Marguerite Ruggirello",
  },
  "la-deferlante-vague-art-2026": {
    localPath: "/images/agenda/la-deferlante-vague-art-2026.png",
    sourceUrl: "https://www.ladeferlante.com/wp-content/uploads/2026/06/juillet-aout-2026.png",
    credit: "© La Déferlante",
  },
  "nuits-fourviere-2026": {
    localPath: "/images/agenda/nuits-fourviere-2026.webp",
    sourceUrl: "https://www.grandlyon.com/fileadmin/_processed_/c/0/csm_2025-Grand_theatre_NuitsdeFourviere_Gesaffelstein-JulietteValero_4d4c92f85e.webp",
    credit: "© Juliette Valéro / Métropole de Lyon",
  },
  "opera-paris-ballet-saison-26-27": {
    localPath: "/images/agenda/opera-paris-ballet-saison-26-27.jpg",
    sourceUrl: "https://www.operadeparis.fr/saison-26-27/ballet/giselle",
    credit: "© Opéra national de Paris",
  },
  "le-temps-daimer-la-danse-biarritz": {
    localPath: "/images/agenda/le-temps-daimer-la-danse-biarritz.webp",
    sourceUrl: "https://www.culture-nouvelle-aquitaine.fr/wp-content/uploads/2026/06/le_temps_d-aimer_la_danse_2026_carre.webp",
    credit: "© Le Temps d'Aimer la Danse / Culture Nouvelle-Aquitaine",
  },
  "suresnes-cites-danse-2027": {
    localPath: "/images/agenda/suresnes-cites-danse-2027.jpg",
    sourceUrl: "https://www.theatre-suresnes.fr/content/uploads/2025/05/saison-26-27-1500x660.jpg",
    credit: "© Théâtre de Suresnes Jean Vilar",
  },
  "portrait-de-rita": {
    localPath: "/images/agenda/portrait-de-rita.jpg",
    sourceUrl: "https://www.festival-automne.com/storage/medias/banner_spectacle_laurene-marx-portrait-de-rita-250910-rdl-0338-gray_o_1jpknu9jj1eku1ne39juqb21qq2h.jpg",
    credit: "© Christophe Raynaud de Lage / Festival d'Automne",
  },
}

/**
 * Résout l'image locale pour un événement du JSON collecté.
 * Priorité : fichier partagé (si URL dupliquée) > fichier individuel par ID > URL CDN externe
 *
 * Toutes les images ont été téléchargées localement avec l'extension d'origine du CDN.
 * Ex : DL-QFAP-124752.jpg, DL-QFAP-124464.png
 *
 * @param eventId  L'identifiant de l'événement (e.g. "DL-QFAP-124752")
 * @param cdnUrl   L'URL image de la source (paris.fr CDN)
 */
export function resolveAgendaImage(eventId: string, cdnUrl?: string): string | undefined {
  if (!cdnUrl) return undefined

  // 1. Shared images (multiple events share the same CDN URL → one local file)
  if (SHARED_IMAGE_OVERRIDES[cdnUrl]) {
    return SHARED_IMAGE_OVERRIDES[cdnUrl]
  }

  // 2. Individual local file: same extension as the CDN URL
  const rawExt = cdnUrl.split(".").pop()?.split("?")[0]?.toLowerCase() ?? ""
  const ext = ["jpg", "jpeg", "png", "webp"].includes(rawExt) ? rawExt : "jpg"
  return `/images/agenda/${eventId}.${ext}`
}

/**
 * Résout l'image pour un événement hardcodé ou Notion par son slug.
 */
export function resolveSpecialEventImage(slug: string): string | undefined {
  return SPECIAL_EVENT_IMAGES[slug]?.localPath
}
