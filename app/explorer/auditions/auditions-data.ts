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
  'institution':               'Institution (CND, conservatoire…)',
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
  // ── Ajouter chaque nouvelle audition ci-dessous (la plus récente en tête) ──
  // Copier-coller le bloc suivant et adapter. Le statut est calculé automatiquement.
  // Pour archiver avant deadline : ajouter archive: true.

  // ── Actives — par deadline croissante ──────────────────────────────────────

  {
    id:                  'starlight-express-bochum-2026',
    titre:               'Chanteur.euses et danseur.euses — Starlight Express',
    structure:           'Starlight Express (production permanente de Bochum)',
    typeProjet:          'comedie-musicale',
    stylesRecherches:    ['comédie musicale', 'commercial', 'hip-hop', 'contemporain', 'jazz'],
    profilRecherche:     'Chanteur.euse avec fort niveau de danse ou danseur.euse avec fort niveau de chant. Rôles principaux et ensemble/doublures. Patinage intégral enseigné en formation.',
    ville:               'Paris (auditions) — Bochum (contrat)',
    pays:                'Allemagne',
    dateAudition:        '2026-10-21',
    dateAuditionFin:     '2026-10-23',
    deadlineCandidature: '2026-10-19',
    periodeContrat:      'Contrats d\'un an à partir de février 2027, saison dès juin 2027',
    remuneration:        null,
    typeContrat:         'CDD 1 an',
    description:         'Auditions à Paris pour la production allemande permanente d\'Andrew Lloyd Webber, installée à Bochum depuis 1988. Styles : commercial, hip-hop, lyrical, contemporain, jive. Acrobaties appréciées. Formation patinage intégrale assurée par la production.',
    sourceOfficielle:    'Maxicasting.com / Regard en Coulisse',
    lienCandidature:     'https://www.maxicasting.com/castings/musique/auditions-chant-et-danse-a-paris-pour-starlight-express/',
    datePublication:     '2026-10-07',
  },

  {
    id:                  'cie-shifts-reach-high-2026',
    titre:               '2 interprètes pour « Reach High »',
    structure:           'Cie shifts — art in movement',
    typeProjet:          'compagnie-choregraphique',
    stylesRecherches:    ['contemporain'],
    profilRecherche:     'Danseur.euse-performeur.euse contemporain.e confirmé.e, minimum 3 productions scéniques, capacité physique (sauts, rotations, précision), sensibilité pluridisciplinaire danse et arts visuels.',
    ville:               'Le Havre',
    pays:                'France',
    dateAudition:        '2026-11-09',
    dateAuditionFin:     '2026-11-10',
    deadlineCandidature: '2026-10-20',
    periodeContrat:      'CDDU — calendrier de création à définir',
    remuneration:        'Selon CCNEAC',
    typeContrat:         'CDDU',
    description:         'Nouvelle création chorégraphique « Reach High » pour jeune public (9-12 ans) et tout public, inspirée du monde aviaire. Pré-sélection en visioconférence les 29-30 octobre, auditions à Le Havre les 9-10 novembre. Envoi dossier (CV + vidéo 3-5 min) à alix@s-h-i-f-t-s.org.',
    sourceOfficielle:    'CND — Centre national de la danse',
    lienCandidature:     'https://www.cnd.fr/fr/auditions-offres-emploi/2-danseur-euses-performeur-euses-au-profil-pluridisciplinaire-fhx',
    datePublication:     '2026-10-08',
  },

  {
    id:                  'cie-choari-distro-reprise-2026',
    titre:               '2 danseuses pour reprise de rôle — Distro',
    structure:           "Compagnie C'hoari",
    typeProjet:          'compagnie-choregraphique',
    stylesRecherches:    ['contemporain'],
    profilRecherche:     "Danseuse professionnelle, à l'aise en danse physique et dynamique (sauts, portés, rythme intense), adaptable aux espaces variés, outdoor et indoor, appétence pour l'interaction public.",
    ville:               'Rennes',
    pays:                'France',
    dateAudition:        '2026-11-02',
    dateAuditionFin:     '2026-11-03',
    deadlineCandidature: '2026-10-20',
    periodeContrat:      '19 avril – 2 mai 2027',
    remuneration:        null,
    typeContrat:         'CDDU',
    description:         "« Distro, pièce houblonnée » (40 min) explore le rôle social des bistrots en indoor et outdoor. La Cie C'hoari (Bretagne) recrute 2 danseuses pour reprendre les rôles de la création. Dossier à envoyer à cie.choari@gmail.com.",
    sourceOfficielle:    'CND — Centre national de la danse',
    lienCandidature:     'https://www.cnd.fr/fr/auditions-offres-emploi/2-danseuses-pour-reprise-de-role-fx',
    datePublication:     '2026-10-08',
  },

  {
    id:                  'ballet-de-lorraine-jan-2027',
    titre:               'Danseurs masculins — CDD court terme',
    structure:           'CCN — Ballet de Lorraine',
    typeProjet:          'ccn-structure-choregraphique',
    stylesRecherches:    ['contemporain', 'classique'],
    profilRecherche:     'Danseur masculin de haut niveau, formation académique solide, technique contemporaine ET classique, improvisation et composition confirmées, expérience professionnelle requise.',
    ville:               'Nancy',
    pays:                'France',
    dateAudition:        '2026-11-07',
    dateAuditionFin:     '2026-11-08',
    deadlineCandidature: '2026-10-23',
    periodeContrat:      'CDD court terme à partir de janvier 2027 (> 7 mois)',
    remuneration:        null,
    typeContrat:         'CDD',
    description:         'Le CCN — Ballet de Lorraine recrute des danseurs masculins pour un contrat court terme débutant en janvier 2027. Auditions à Paris les 7 et 8 novembre 2026. Dossier (CV + lettre + liens vidéo) à envoyer à auditions@ballet-de-lorraine.eu.',
    sourceOfficielle:    'Site officiel CCN Ballet de Lorraine',
    lienCandidature:     'https://ballet-de-lorraine.eu/fr/actualites/audition-pour-danseurs-et-danseuses',
    datePublication:     '2026-10-05',
  },

  {
    id:                  'jann-gallois-dtsc-2026',
    titre:               '8 danseur.euses — Depuis des temps sans commencement',
    structure:           'Compagnie Jann Gallois / Agora, Cité Internationale de la Danse',
    typeProjet:          'compagnie-choregraphique',
    stylesRecherches:    ['contemporain', 'hip-hop', 'urbain', 'contact'],
    profilRecherche:     'Danseur.euse professionnel.le, excellent niveau en danse urbaine, contemporaine et contact, expérience plateau confirmée, mémorisation rapide des détails chorégraphiques, pleine disponibilité lors des périodes de création.',
    ville:               'Montpellier',
    pays:                'France',
    dateAudition:        '2026-11-17',
    dateAuditionFin:     '2026-11-20',
    deadlineCandidature: '2026-10-25',
    periodeContrat:      'Périodes de création sur 2027-2028 (calendrier à confirmer)',
    remuneration:        null,
    typeContrat:         'CDDU',
    description:         "Pour sa nouvelle création « Depuis des temps sans commencement », Jann Gallois (co-directrice d'Agora, Cité Internationale de la Danse) recherche 8 interprètes. Envoyer CV + lien vidéo à audition-gallois@agora-cid.com, objet : « PRÉNOM NOM — Audition DTSC ».",
    sourceOfficielle:    'CND — Centre national de la danse',
    lienCandidature:     'https://www.cnd.fr/fr/auditions-offres-emploi/8-danseureuses-fhx',
    datePublication:     '2026-10-08',
  },

  {
    id:                  'crr-clermont-contemporain-2026',
    titre:               'Enseignant.e en danse contemporaine — remplacement',
    structure:           'CRR de Clermont Auvergne Métropole',
    typeProjet:          'institution',
    stylesRecherches:    ['contemporain'],
    profilRecherche:     "Diplôme d'État de professeur de danse contemporaine requis, expérience pédagogique, capacité à enseigner de l'éveil au 3e cycle et CPES, 20h hebdomadaires.",
    ville:               'Clermont-Ferrand',
    pays:                'France',
    dateAudition:        null,
    deadlineCandidature: '2026-10-25',
    periodeContrat:      '1er octobre 2026 – 27 mars 2027 (remplacement congé maternité)',
    remuneration:        null,
    typeContrat:         'CDD (ATEA catégorie B)',
    description:         "Remplacement au Conservatoire à Rayonnement Régional de Clermont Auvergne Métropole. 20h hebdomadaires du lundi au vendredi. Contact : contact-crr@clermontmetropole.eu ou Madeline Izoulet-Réant (mizouletreant@clermontmetropole.eu).",
    sourceOfficielle:    'CND — Centre national de la danse',
    lienCandidature:     'https://www.cnd.fr/fr/auditions-offres-emploi/enseignante-en-danse-contemporaine-fhx-contractuelle-remplacement-conge',
    datePublication:     '2026-10-08',
  },

  {
    id:                  'crd-laval-jazz-2026',
    titre:               'Professeur.e de danse jazz',
    structure:           'CRD de Laval agglomération',
    typeProjet:          'institution',
    stylesRecherches:    ['jazz'],
    profilRecherche:     "Diplômé.e d'État de professeur de danse jazz, ouvert.e à tous niveaux (enfants dès 4 ans jusqu'aux adultes), environ 120 élèves.",
    ville:               'Changé (Laval)',
    pays:                'France',
    dateAudition:        null,
    deadlineCandidature: '2026-10-29',
    periodeContrat:      '3 novembre 2026 – 30 mai 2027, 20h/semaine',
    remuneration:        null,
    typeContrat:         'Contractuel (ATEA)',
    description:         "Remplacement à temps plein au Conservatoire à Rayonnement Départemental de Laval. Enseignement du jazz et de l'éveil créatif, du mardi au vendredi. Dossier à franck.serveau@agglo-laval.fr.",
    sourceOfficielle:    'CND — Centre national de la danse',
    lienCandidature:     'https://www.cnd.fr/fr/auditions-offres-emploi/professeur-de-danse-jazz-fhx-1',
    datePublication:     '2026-10-08',
  },

  {
    id:                  'joinville-danse-classique-2026',
    titre:               'Enseignant.e en danse classique — 20h/semaine',
    structure:           "École Municipale des Arts — Ville de Joinville-le-Pont",
    typeProjet:          'institution',
    stylesRecherches:    ['classique'],
    profilRecherche:     "Diplôme d'État de professeur de danse classique, aptitude au jeune public (très jeunes enfants), qualités de créativité, rigueur et bienveillance.",
    ville:               'Joinville-le-Pont',
    pays:                'France',
    dateAudition:        null,
    deadlineCandidature: '2026-10-31',
    periodeContrat:      '1er janvier – 31 décembre 2027',
    remuneration:        null,
    typeContrat:         'Statutaire ou contractuel (ATEA)',
    description:         "Poste à l'Espace Danse Aurélie Dupont (RER A), 20h hebdomadaires lundi-jeudi. Enseignement auprès d'enfants et adultes, préparation de spectacles. Candidatures à candidature@joinvillelepont.fr.",
    sourceOfficielle:    'CND — Centre national de la danse',
    lienCandidature:     'https://www.cnd.fr/fr/auditions-offres-emploi/enseignante-en-danse-classique-20hsemaine-fhx',
    datePublication:     '2026-10-10',
  },

  {
    id:                  'enb-swan-lake-2027',
    titre:               'Danseur.ses classiques — Le Lac des cygnes in the round',
    structure:           'English National Ballet',
    typeProjet:          'international',
    stylesRecherches:    ['classique'],
    profilRecherche:     'Danseur.se classique professionnel.le, technique académique solide et confirmée, expérience professionnelle en ballet requise. Deux sessions (féminine et masculine).',
    ville:               'Londres (Royal Albert Hall)',
    pays:                'Royaume-Uni',
    dateAudition:        '2027-02-13',
    deadlineCandidature: '2026-11-01',
    periodeContrat:      'Femmes : 10 mai – 27 juin 2027 / Hommes : 17 mai – 27 juin 2027',
    remuneration:        null,
    typeContrat:         'CDD',
    description:         "English National Ballet recrute des danseurs et danseuses pour Le Lac des cygnes in the round au Royal Albert Hall (juin 2027), version de Derek Deane. Audition unique le 13 février 2027 (journée entière). Candidatures sur careers.ballet.org.uk.",
    sourceOfficielle:    'English National Ballet — careers.ballet.org.uk',
    lienCandidature:     'https://careers.ballet.org.uk/',
    datePublication:     '2026-10-08',
  },

  {
    id:                  'mamma-mia-geneve-2027',
    titre:               "Comédien.nes-chanteur.euses — Mamma Mia ! Genève",
    structure:           'NEPSA (Genève)',
    typeProjet:          'comedie-musicale',
    stylesRecherches:    ['comédie musicale', 'chant'],
    profilRecherche:     'Comédien.ne-chanteur.euse, 8 rôles principaux (femmes 18-50 ans, hommes 18-50 ans). Personnalité, sens du jeu, présence scénique et capacité à raconter une histoire en musique primés.',
    ville:               'Genève',
    pays:                'Suisse',
    dateAudition:        null,
    deadlineCandidature: '2026-11-01',
    periodeContrat:      'Répétitions août – octobre 2027 ; représentations mi-octobre – mi-novembre 2027',
    remuneration:        null,
    typeContrat:         null,
    description:         "Production en français de Mamma Mia! sur la musique d'ABBA, par NEPSA à Genève. 8 rôles principaux à pourvoir. Étapes 2-3 fin 2026 (présentiel Genève), étapes 4-5 en février-mars 2027. Candidatures via le formulaire sur mammamia-geneve.ch.",
    sourceOfficielle:    'Site officiel — mammamia-geneve.ch',
    lienCandidature:     'https://mammamia-geneve.ch/',
    datePublication:     '2026-10-01',
  },

  {
    id:                  'conservatoire-massy-pianiste-2026',
    titre:               'Pianiste accompagnateur.trice danse — 11h/sem',
    structure:           'Conservatoire de Massy / Mairie de Massy',
    typeProjet:          'institution',
    stylesRecherches:    ['classique', 'contemporain'],
    profilRecherche:     "Titulaire du Diplôme d'État d'accompagnateur ou de piano, expérience en accompagnement danse, sensibilité artistique et aptitude pédagogique.",
    ville:               'Massy',
    pays:                'France',
    dateAudition:        null,
    deadlineCandidature: '2026-11-01',
    periodeContrat:      '1er octobre 2026 – 30 août 2027, 11h/semaine',
    remuneration:        '13e mois + mutuelle (selon ancienneté)',
    typeContrat:         'CDD',
    description:         "Pianiste accompagnateur pour les cours de danse classique et contemporaine au Conservatoire de Massy. Initiation au mouvement en parallèle de l'enseignant. Contact : gabriel.cabaret@mairie-massy.fr.",
    sourceOfficielle:    'CND — Centre national de la danse',
    lienCandidature:     'https://www.cnd.fr/fr/auditions-offres-emploi/accompagnement-danse-aea-2eme-classe-fhx',
    datePublication:     '2026-10-10',
  },

  {
    id:                  'nsp-2-norvege-2027',
    titre:               'Programme NSP 2 — jeunes danseurs contemporains',
    structure:           'Nagelhus Schia Productions (NSP)',
    typeProjet:          'international',
    stylesRecherches:    ['contemporain'],
    profilRecherche:     "Danseur.se diplômé.e d'une formation supérieure en danse (3 ans minimum), diplôme obtenu depuis moins de 3 ans. Fort niveau technique et voix artistique singulière.",
    ville:               'Sandvika',
    pays:                'Norvège',
    dateAudition:        '2026-12-04',
    deadlineCandidature: '2026-11-04',
    periodeContrat:      'Février – fin 2027 (périodes d\'activité rémunérées)',
    remuneration:        'Rémunéré par période d\'activité',
    typeContrat:         null,
    description:         "NSP 2 est le programme national de talent de la compagnie norvégienne Nagelhus Schia Productions, soutenu par Talent Norway. Il accompagne les jeunes diplômés vers la vie professionnelle en danse contemporaine. Audition sur invitation unique le 4 décembre 2026 à Sandvika (Oslo).",
    sourceOfficielle:    'Site officiel NSP — nsproductions.no',
    lienCandidature:     'https://www.nsproductions.no/nsp2',
    datePublication:     '2026-10-05',
  },

  {
    id:                  'cie-wanguy-creation-2026',
    titre:               '3 danseur.ses — Première création',
    structure:           'Compagnie Wanguy',
    typeProjet:          'compagnie-choregraphique',
    stylesRecherches:    ['contemporain'],
    profilRecherche:     "Danseur.se professionnel.le, aisance en improvisation et recherche collective, sensibilité au travail de contact et de proximité, personnalité artistique affirmée. Expérience en médiation appréciée.",
    ville:               'Nièvre (58)',
    pays:                'France',
    dateAudition:        null,
    deadlineCandidature: '2026-11-08',
    periodeContrat:      'Janvier – décembre 2027, principalement jeudis-dimanches',
    remuneration:        'Selon CCNEAC',
    typeContrat:         'CDDU',
    description:         "Première création de la Compagnie Wanguy (compagnie émergente en milieu rural, Nièvre). Exploration des relations entre trois corps : symbiose, conflit, dialogue physique. Dossier (CV + photos + vidéo impro 2 min max) à ciewanguy@gmail.com, objet : « AUDITION CIE WANGUY — NOM ».",
    sourceOfficielle:    'CND — Centre national de la danse',
    lienCandidature:     'https://www.cnd.fr/fr/auditions-offres-emploi/recherche-3-danseursses-fhx',
    datePublication:     '2026-10-10',
  },

  {
    id:                  'pierrots-de-la-nuit-2026',
    titre:               'Danseur.euses / circassien.nes — Processions nocturnes',
    structure:           'AMUON — Les Pierrots de la Nuit',
    typeProjet:          'compagnie-choregraphique',
    stylesRecherches:    ['danse de rue', 'cirque', 'contemporain'],
    profilRecherche:     "Danseur.euse ou circassien.ne professionnel.le, aisance en travail de chœur et de rue, improvisation, interaction publique. Atouts : portés, bases théâtrales.",
    ville:               'Paris',
    pays:                'France',
    dateAudition:        null,
    deadlineCandidature: '2026-11-13',
    periodeContrat:      '1er avril – 30 septembre 2027 (13 spectacles)',
    remuneration:        null,
    typeContrat:         'CDDU',
    description:         "3 performeurs pour des processions artistiques nocturnes en milieu festif, avec médiation bruit et sensibilisation artistique. Travail de chœur avec comédiens, dispositif casque double voie. Entretiens décembre 2026, auditions janvier 2027. Contact : art.pierrotsdelanuit@gmail.com.",
    sourceOfficielle:    'CND — Centre national de la danse',
    lienCandidature:     'https://www.cnd.fr/fr/auditions-offres-emploi/danseureusescircassiennes-fhx',
    datePublication:     '2026-10-10',
  },

  {
    id:                  'conservatoire-fontenay-pianiste-2026',
    titre:               'Pianiste accompagnateur.trice danse — 6h/semaine',
    structure:           'Conservatoire de Fontenay-aux-Roses / Vallée Sud Grand Paris',
    typeProjet:          'institution',
    stylesRecherches:    ['classique', 'contemporain'],
    profilRecherche:     "Diplômé.e d'État en accompagnement piano, expérience pédagogique confirmée, ouvert.e aux pédagogies innovantes et pluridisciplinaires.",
    ville:               'Fontenay-aux-Roses',
    pays:                'France',
    dateAudition:        null,
    deadlineCandidature: '2026-11-24',
    periodeContrat:      '1er octobre 2026 – 31 août 2027, 6h/semaine',
    remuneration:        null,
    typeContrat:         'Statutaire ou contractuel (ATEA)',
    description:         "Pianiste accompagnateur au Conservatoire de Fontenay-aux-Roses pour les cours de danse, 6h hebdomadaires. Conduite de projets artistiques transversaux appréciée. Candidature sur le portail Vallée Sud Grand Paris.",
    sourceOfficielle:    'CND — Centre national de la danse',
    lienCandidature:     'https://www.cnd.fr/fr/auditions-offres-emploi/enseignant-artistique-discipline-pianiste-accompagnateur-6hsemaine-fhx',
    datePublication:     '2026-10-12',
  },

  {
    id:                  'disneyland-paris-personnages-2026',
    titre:               'Performeurs personnages et parade — Disneyland Paris',
    structure:           'Disneyland Paris',
    typeProjet:          'parc-evenementiel',
    stylesRecherches:    ['comédie musicale', 'parade', 'danse de rue'],
    profilRecherche:     "Artiste performeur.se, look-alike Disney / Marvel (univers Avengers Campus inclus), haute énergie, pleine amplitude corporelle, aptitude à la parade et aux interactions avec le public.",
    ville:               'Chessy (Marne-la-Vallée)',
    pays:                'France',
    dateAudition:        null,
    deadlineCandidature: '2027-12-31',
    periodeContrat:      'Contrats saisonniers ou annuels',
    remuneration:        null,
    typeContrat:         null,
    description:         "Disneyland Paris recrute régulièrement des performeurs pour ses personnages (Disney, Pixar, Marvel, Star Wars) et ses spectacles de parade. Candidatures rolling via le portail Disney Auditions. Sessions organisées dans plusieurs villes européennes.",
    sourceOfficielle:    'Disney Auditions — disneyauditions.com',
    lienCandidature:     'https://www.disneyauditions.com/',
    datePublication:     '2026-10-17',
  },

  {
    id:                  'cndc-angers-formation-2027-2030',
    titre:               'Formation DNSPD — Promotion 2027-2030',
    structure:           "CNDC Angers — École Supérieure de Danse Contemporaine",
    typeProjet:          'institution',
    stylesRecherches:    ['contemporain'],
    profilRecherche:     "Plus de 18 ans, baccalauréat (ou équivalent), minimum 3 ans de pratique de la danse. Formation diplômante de niveau Licence.",
    ville:               'Angers',
    pays:                'France',
    dateAudition:        null,
    deadlineCandidature: '2027-01-31',
    periodeContrat:      'Formation 3 ans : septembre 2027 – juin 2030 (DNSPD + Licence Arts)',
    remuneration:        null,
    typeContrat:         null,
    description:         "Admission à l'école supérieure du CNDC d'Angers, seule école en France exclusivement dédiée à la danse contemporaine. 20 étudiant.es par promotion maximum. Inscriptions ouvertes en décembre 2026, auditions en janvier-mars 2027.",
    sourceOfficielle:    "CNDC Angers — École supérieure",
    lienCandidature:     'https://cndc.fr/fr/ecole/audition',
    datePublication:     '2026-10-17',
  },

  // ── Archivées (deadline passée) ────────────────────────────────────────────

  {
    id:                  'la-nouvelle-eve-cabaret-2026',
    titre:               "Danseur.euses pour La Nouvelle Ève — Saison 2027",
    structure:           "La Nouvelle Ève",
    typeProjet:          'production-commerciale',
    stylesRecherches:    ['classique', 'jazz', 'variétés'],
    profilRecherche:     "Danseur.euse professionnel.le, taille minimum 1,72 m (femmes) / 1,75 m (hommes), formation professionnelle exigée.",
    ville:               'Paris (9e)',
    pays:                'France',
    dateAudition:        '2026-10-14',
    deadlineCandidature: '2026-10-11',
    periodeContrat:      'Saison 2027',
    remuneration:        null,
    typeContrat:         null,
    description:         "Audition pour la troupe de danseurs du cabaret La Nouvelle Ève (25 rue Pierre Fontaine, 75009 Paris). Talon haut et tenue de danse moulante demandés.",
    sourceOfficielle:    'Maxicasting.com',
    lienCandidature:     'https://www.maxicasting.com/castings/divers/audition-danseurs-danseuses-pour-le-cabaret-la-nouvelle-eve/',
    datePublication:     '2026-10-01',
    archive:             true,
  },

  // ── Entrées existantes ─────────────────────────────────────────────────────

  {
    id:                  'bnm-lahorde-2026',
    titre:               'Danseur.ses professionnel.les',
    structure:           'Ballet national de Marseille / (LA)HORDE',
    typeProjet:          'compagnie-choregraphique',
    stylesRecherches:    ['contemporain'],
    profilRecherche:     'Danseur.ses professionnel.les, toutes disciplines',
    ville:               'Marseille',
    pays:                'France',
    dateAudition:        null,
    deadlineCandidature: '2026-11-15',
    periodeContrat:      'Saison 2027',
    remuneration:        'Selon convention CCNEAC',
    typeContrat:         'CDD',
    description:         'Le Ballet national de Marseille, sous la direction de Marine Brutti et Jonathan Debrouwer ((LA)HORDE), recherche des interprètes pour la prochaine saison.',
    sourceOfficielle:    'Site officiel Ballet national de Marseille',
    lienCandidature:     'https://www.ballet-de-marseille.com/',
    datePublication:     '2026-10-01',
  },

  {
    id:                  'cndc-angers-2026',
    titre:               "Interprètes contemporain.es — Nouvelle création",
    structure:           "Centre national de danse contemporaine d'Angers",
    typeProjet:          'ccn-structure-choregraphique',
    stylesRecherches:    ['contemporain'],
    profilRecherche:     "Interprètes contemporain.es, expérience plateau requise",
    ville:               'Angers',
    pays:                'France',
    dateAudition:        '2026-11-25',
    deadlineCandidature: '2026-11-10',
    periodeContrat:      'Janvier–Juin 2027',
    remuneration:        'Selon convention collective du spectacle vivant',
    typeContrat:         'CDDU',
    description:         "Le CNDC d'Angers ouvre ses auditions pour une nouvelle création prévue en résidence dès janvier 2027. Dossier de candidature à envoyer par email.",
    sourceOfficielle:    'Site officiel CNDC Angers',
    lienCandidature:     'https://www.cndc.fr/',
    datePublication:     '2026-10-03',
  },
]
