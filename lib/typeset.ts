/**
 * lib/typeset.ts
 * Règles typographiques françaises appliquées automatiquement
 * aux textes affichés dans l'interface Dance Lab.
 *
 * Point d'entrée unique : toute chaîne destinée à l'affichage
 * (titre d'épisode, titre d'article…) peut passer par frenchTypeset()
 * avant d'être rendue en JSX.
 *
 * Règle implémentée
 * ─────────────────
 * L'espace ordinaire (U+0020) précédant un signe de ponctuation double
 * (? ! : ;) est remplacé par une espace insécable (U+00A0).
 *
 * Effet : le signe ne peut plus se retrouver seul en début de ligne,
 * quelle que soit la longueur du titre ou la taille de la fenêtre.
 *
 * Exemples
 *   "Les corps s*xualisées ?"   →  "Les corps s*xualisées\u00A0?"
 *   "Danser : enjeux du corps"  →  "Danser\u00A0: enjeux du corps"
 *   "Bouger !"                  →  "Bouger\u00A0!"
 */

/** Espace insécable Unicode (U+00A0) */
const NBSP = '\u00A0'

/**
 * Applique les règles typographiques françaises à une chaîne.
 *
 * - Espace ordinaire ou insécable devant `?` `!` `:` `;` → espace insécable
 *
 * La fonction est idempotente : l'appliquer deux fois donne le même résultat.
 *
 * @param str  Texte brut destiné à l'affichage
 * @returns    Texte avec espaces insécables devant la ponctuation double
 */
export function frenchTypeset(str: string): string {
  if (!str) return str
  // Capture tout espace (ordinaire U+0020 ou insécable U+00A0 déjà présent)
  // suivi d'un signe de ponctuation double et le remplace par un espace insécable.
  return str.replace(/[\u0020\u00A0]([?!:;])/g, `${NBSP}$1`)
}
