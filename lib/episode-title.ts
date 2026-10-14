/**
 * lib/episode-title.ts
 * Utilitaires de formatage des titres d'épisodes Dance Lab.
 */

import { frenchTypeset } from '@/lib/typeset'

/**
 * Supprime le suffixe invité d'un titre d'épisode Ausha pour l'affichage,
 * puis applique les règles typographiques françaises (espaces insécables
 * devant ? ! : ;) pour éviter qu'un signe de ponctuation se retrouve seul
 * en début de ligne, sur toutes les cartes et pages du site.
 *
 * Ausha ajoute parfois le nom de l'invité ou de la structure en fin de titre :
 *   "Titre question ?, avec Prénom Nom"  →  "Titre question\u00A0?"
 *   "Titre texte avec DANC.R"            →  "Titre texte"
 *   "Titre, avec Structure"              →  "Titre"
 *
 * ⚠️ La suppression est GUIDÉE par le `guest` connu de l'épisode pour éviter
 * de supprimer accidentellement "avec" lorsqu'il fait partie du sujet :
 *   "Danser avec le coeur"  +  guest:"Laëtitia Simon"  →  inchangé ✅
 *   "Titre avec DANC.R"     +  guest:"DANC.R"          →  "Titre" ✅
 *
 * @param title  Titre brut (éventuellement avec suffixe invité)
 * @param guest  Nom de l'invité déjà associé à l'épisode (source Ausha)
 * @returns      Titre nettoyé et typographié, prêt à l'affichage
 */
export function cleanEpisodeTitle(title: string, guest: string): string {
  if (!title || !guest || guest === 'Invité.e') return frenchTypeset(title.trim())

  // Échappe les caractères spéciaux regex dans le nom de l'invité
  // (DANC.R, noms avec apostrophes, etc.)
  const escapedGuest = guest.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

  // Supprime ", avec {guest}" ou " avec {guest}" en fin de titre
  // La virgule est optionnelle : couvre "Titre, avec Guest" et "Titre avec Guest"
  let cleaned = title
    .replace(new RegExp(`,?\\s+avec\\s+${escapedGuest}\\s*$`, 'i'), '')
    .trim()

  // Certains titres utilisent un rôle ou une structure à la place du nom
  // présent dans les métadonnées :
  //   "Danseuse et enceinte : ... ? avec les juristes du CND"
  // On ne retire ce suffixe générique que si le titre est déjà complet et se
  // termine par une ponctuation forte avant « avec ». Cela évite de casser des
  // titres légitimes comme « Danser avec le coeur ».
  const attributedTitle = cleaned.match(/^(.*[?!.])\s*,?\s+avec\s+(.+)$/iu)
  if (attributedTitle) {
    const suffix = attributedTitle[2].trim()
    const looksLikeAttribution =
      /^(?:le|la|les|l['’]|un|une|des)\s+/iu.test(suffix) ||
      /^\p{Lu}/u.test(suffix)

    if (looksLikeAttribution) cleaned = attributedTitle[1].trim()
  }

  // Applique les règles typographiques françaises (espaces insécables)
  return frenchTypeset(cleaned)
}
