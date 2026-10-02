// ── Types ────────────────────────────────────────────────────────────────────

export type TypeProjet =
  | 'compagnie-choregraphique'
  | 'ccn-structure-choregraphique'
  | 'opera-ballet'
  | 'comedie-musicale'
  | 'production-commerciale'
  | 'audiovisuel'
  | 'parc-evenementiel'
  | 'institution'
  | 'international'
  | 'autre'

export const TYPE_PROJET_LABELS: Record<TypeProjet, string> = {
  'compagnie-choregraphique':  'Compagnie chorégraphique',
  'ccn-structure-choregraphique': 'CCN / Structure chorégraphique',
  'opera-ballet':              'Opéra / Ballet',
  'comedie-musicale':          'Comédie musicale / Spectacle',
  'production-commerciale':    'Production commerciale',
  'audiovisuel':               'Audiovisuel / TV / Clip',
  'parc-evenementiel':         'Parc / Événementiel',
  'institution':               'Institution (CN D, ministère…)',
  'international':             'Projet international',
  'autre':                     'Autre',
}

export type StatutAudition = 'nouveau' | 'ouvert' | 'bientot-complet' | 'termine'

export const STATUT_LABELS: Record<StatutAudition, string> = {
  'nouveau':         'Nouveau',
  'ouvert':          'Candidatures ouvertes',
  'bientot-complet': 'Bientôt complet',
  'termine':         'Terminé',
}

export interface Audition {
  /** Identifiant unique — slug kebab-case */
  id: string

  // ── Informations essentielles ──────────────────────────────────────────────
  titre: string
  structure: string
  typeProjet: TypeProjet

  // ── Profil recherché ───────────────────────────────────────────────────────
  stylesRecherches: string[]           // ex. ['contemporain', 'hip-hop']
  profilRecherche: string              // texte libre, ex. "Danseur.se professionnel.le, 18–35 ans"

  // ── Lieu ───────────────────────────────────────────────────────────────────
  ville: string
  pays: string                         // ex. 'France', 'Belgique'

  // ── Dates ──────────────────────────────────────────────────────────────────
  /** Date de l'audition (ISO 8601). Null si non encore précisée. */
  dateAudition: string | null
  /** Fin de période si l'audition s'étale sur plusieurs jours. */
  dateAuditionFin?: string | null
  /** Date limite de candidature (ISO 8601). Utilisée pour le statut automatique. */
  deadlineCandidature: string
  /** Période ou dates de contrat, texte libre. Ex : "Janvier–Juin 2026" */
  periodeContrat: string

  // ── Conditions ─────────────────────────────────────────────────────────────
  /** Rémunération lorsqu'elle est communiquée. Null = non communiquée. */
  remuneration?: string | null
  /** Type de contrat lorsqu'il est communiqué. Null = non communiqué. */
  typeContrat?: string | null

  // ── Contenu ────────────────────────────────────────────────────────────────
  description: string
  sourceOfficielle: string             // nom de la source (ex. "Site officiel du CCN")
  lienCandidature: string              // URL

  // ── Métadonnées ────────────────────────────────────────────────────────────
  datePublication: string              // ISO 8601 — utilisée pour le badge "Nouveau" (≤ 7 j)
  /** Forcer l'archivage manuel (override le calcul automatique). */
  archive?: boolean
}

// ── Logique de statut ────────────────────────────────────────────────────────

/**
 * Calcule le statut automatique d'une audition.
 *   - "nouveau"         : publiée il y a ≤ 7 jours ET deadline non dépassée
 *   - "ouvert"          : deadline non dépassée
 *   - "bientot-complet" : à positionner manuellement via `archive` = false + override
 *   - "termine"         : deadline dépassée OU archivée manuellement
 */
export function getStatutAudition(audition: Audition): StatutAudition {
  const now       = new Date()
  const deadline  = new Date(audition.deadlineCandidature)

  if (audition.archive || deadline < now) return 'termine'

  const published = new Date(audition.datePublication)
  const ageJours  = Math.floor((now.getTime() - published.getTime()) / (1000 * 60 * 60 * 24))

  return ageJours <= 7 ? 'nouveau' : 'ouvert'
}

/** Vrai si l'audition est active (non archivée, deadline non dépassée). */
export function isAuditionActive(audition: Audition): boolean {
  return getStatutAudition(audition) !== 'termine'
}

/** Auditions en cours, triées de la deadline la plus proche à la plus lointaine. */
export function getAuditionsActives(list: Audition[] = auditions): Audition[] {
  return list
    .filter(isAuditionActive)
    .sort((a, b) => new Date(a.deadlineCandidature).getTime() - new Date(b.deadlineCandidature).getTime())
}

/** Auditions archivées (terminées), triées de la plus récente à la plus ancienne. */
export function getAuditionsArchivees(list: Audition[] = auditions): Audition[] {
  return list
    .filter(a => !isAuditionActive(a))
    .sort((a, b) => new Date(b.deadlineCandidature).getTime() - new Date(a.deadlineCandidature).getTime())
}

// ── Options de filtre ────────────────────────────────────────────────────────

/** Types de projet présents dans la liste des auditions actives. */
export function getTypesDisponibles(list: Audition[]): TypeProjet[] {
  return [...new Set(list.map(a => a.typeProjet))]
}

/** Styles de danse présents dans la liste des auditions actives. */
export function getStylesDisponibles(list: Audition[]): string[] {
  return [...new Set(list.flatMap(a => a.stylesRecherches))].sort()
}

/** Villes présentes dans la liste des auditions actives. */
export function getVillesDisponibles(list: Audition[]): string[] {
  return [...new Set(list.map(a => a.ville))].sort()
}

// ── Données ──────────────────────────────────────────────────────────────────
// Ajouter chaque nouvelle audition ici.
// Le statut est calculé automatiquement à partir de `deadlineCandidature`.
// Pour archiver manuellement avant deadline : passer `archive: true`.

export const auditions: Audition[] = [
  // Exemple commenté — à décommenter et adapter lors de la première vraie audition :
  //
  // {
  //   id:                   'ccn-exemple-2026',
  //   titre:                'Audition danseur.se — Nouvelle création 2026',
  //   structure:            'CCN de Grenoble',
  //   typeProjet:           'ccn-structure-choregraphique',
  //   stylesRecherches:     ['contemporain'],
  //   profilRecherche:      'Interprète professionnel.le, expérience plateau souhaitée',
  //   ville:                'Grenoble',
  //   pays:                 'France',
  //   dateAudition:         '2026-03-15',
  //   dateAuditionFin:      null,
  //   deadlineCandidature:  '2026-03-01',
  //   periodeContrat:       'Avril–Décembre 2026',
  //   remuneration:         'Selon convention collective CCNEAC',
  //   typeContrat:          'CDDU',
  //   description:          'Le CCN de Grenoble recherche des interprètes pour une nouvelle création...',
  //   sourceOfficielle:     'Site officiel CCN de Grenoble',
  //   lienCandidature:      'https://example.com',
  //   datePublication:      '2026-01-10',
  // },
]
