// ── Types ─────────────────────────────────────────────────────────────────────

export type MetierUniversId =
  | 'interpreter'
  | 'creer'
  | 'transmettre'
  | 'produire'
  | 'accompagner'
  | 'image'

export type Metier = {
  id:          string
  nom:         string
  description: string
  univers:     MetierUniversId
  featured?:   boolean
}

// ── Configuration des univers ─────────────────────────────────────────────────

export const UNIVERS: Record<MetierUniversId, {
  label:       string
  num:         string
  description: string
}> = {
  interpreter: {
    label:       'Interpréter',
    num:         '01',
    description: "Être sur scène. Habiter l'espace, porter une œuvre, incarner une énergie.",
  },
  creer: {
    label:       'Créer',
    num:         '02',
    description: "Écrire le mouvement. Concevoir ce que les autres feront exister.",
  },
  transmettre: {
    label:       'Transmettre',
    num:         '03',
    description: "Passer le geste, la technique, le sens. Faire grandir ce qu'on a reçu.",
  },
  produire: {
    label:       'Produire & diffuser',
    num:         '04',
    description: "Rendre les projets possibles. Structurer, financer, mettre en tournée.",
  },
  accompagner: {
    label:       'Accompagner',
    num:         '05',
    description: "Soutenir les corps et les carrières. Être là pour que le reste puisse exister.",
  },
  image: {
    label:       'Image & scène',
    num:         '06',
    description: "Encadrer et magnifier la danse. Ce qui la rend visible, lisible, mémorable.",
  },
}

export const UNIVERS_ORDER: MetierUniversId[] = [
  'interpreter', 'creer', 'transmettre', 'produire', 'accompagner', 'image',
]

// ── Données des métiers ───────────────────────────────────────────────────────

export const metiers: Metier[] = [

  // ── Interpréter ──────────────────────────────────────────────────────────────

  {
    id:          'danseur',
    nom:         'Danseur · Danseuse',
    description: "Au cœur de la danse. Interprète d'œuvres chorégraphiques, dans des esthétiques allant du classique aux danses urbaines, du contemporain à la danse de salon.",
    univers:     'interpreter',
    featured:    true,
  },
  {
    id:          'performeur',
    nom:         'Performeur · Performeuse',
    description: "À la frontière de la danse et des arts vivants. Présence physique, corps en jeu, dispositifs singuliers.",
    univers:     'interpreter',
  },
  {
    id:          'danseur-cirque',
    nom:         'Danseur·se de cirque',
    description: "Croise la technique circassienne et le langage chorégraphique. Acrobatie, portés, aérien.",
    univers:     'interpreter',
  },
  {
    id:          'figurant-artistique',
    nom:         'Figurant·e artistique',
    description: "Présence au plateau dans les opéras, comédies musicales, films et grandes cérémonies. Capacité à s'adapter à des directions très diverses.",
    univers:     'interpreter',
  },

  // ── Créer ─────────────────────────────────────────────────────────────────

  {
    id:          'choregraphe',
    nom:         'Chorégraphe',
    description: "Signe les œuvres, compose les mouvements, dirige les corps dans l'espace. Artiste auteur au sens plein du terme.",
    univers:     'creer',
    featured:    true,
  },
  {
    id:          'metteur-en-scene',
    nom:         'Metteur·se en scène',
    description: "Orchestre l'espace, le temps, la dramaturgie. Travaille souvent en dialogue avec un chorégraphe ou endosse les deux rôles.",
    univers:     'creer',
  },
  {
    id:          'scenographe',
    nom:         'Scénographe',
    description: "Conçoit l'espace dans lequel la danse advient. Architecture du plateau, rapport à la salle, circulation des corps.",
    univers:     'creer',
  },
  {
    id:          'compositeur',
    nom:         'Compositeur·rice / Créateur·rice son',
    description: "Crée la musique ou le paysage sonore qui accompagne et structure l'œuvre chorégraphique.",
    univers:     'creer',
  },
  {
    id:          'dramaturge',
    nom:         'Dramaturge',
    description: "Partenaire de la création : aide à construire le sens, la structure dramaturgique, le rapport au texte et à l'histoire.",
    univers:     'creer',
  },

  // ── Transmettre ──────────────────────────────────────────────────────────

  {
    id:          'professeur',
    nom:         'Professeur·e de danse',
    description: "Enseigne la technique, transmet les codes, accompagne la progression. Diplôme d'État ou CQP selon le contexte d'exercice.",
    univers:     'transmettre',
    featured:    true,
  },
  {
    id:          'repetiteur',
    nom:         'Répétiteur·rice',
    description: "Garant·e de l'œuvre. Transmet et maintient le répertoire d'un chorégraphe auprès des interprètes, souvent au sein d'une compagnie.",
    univers:     'transmettre',
  },
  {
    id:          'pedagogue-scolaire',
    nom:         'Artiste intervenant·e',
    description: "Intervient en milieu scolaire, en milieu social ou hospitalier. À la croisée de la transmission artistique et de l'éducation.",
    univers:     'transmettre',
  },
  {
    id:          'formateur',
    nom:         'Formateur·rice professionnel·le',
    description: "Forme les futurs interprètes et enseignants dans les écoles supérieures, CRR et centres de formation professionnelle.",
    univers:     'transmettre',
  },

  // ── Produire & diffuser ───────────────────────────────────────────────────

  {
    id:          'directeur-compagnie',
    nom:         'Directeur·rice de compagnie',
    description: "Pilote artistique et administratif. Porte la vision, gère les ressources, incarne la compagnie vis-à-vis des partenaires et du public.",
    univers:     'produire',
    featured:    true,
  },
  {
    id:          'charge-production',
    nom:         'Chargé·e de production',
    description: "Assure le montage financier des projets : dossiers de subvention, budgets, relations avec les institutions culturelles.",
    univers:     'produire',
  },
  {
    id:          'diffuseur',
    nom:         'Diffuseur · Programmatrice',
    description: "Sélectionne et programme les œuvres dans les salles, festivals et structures culturelles. Garant·e de la rencontre entre une œuvre et son public.",
    univers:     'produire',
  },
  {
    id:          'agent-artistique',
    nom:         'Agent·e artistique',
    description: "Représente les artistes, négocie les contrats, développe leur carrière et leur visibilité sur les marchés nationaux et internationaux.",
    univers:     'produire',
  },
  {
    id:          'charge-communication',
    nom:         'Chargé·e de communication',
    description: "Construit l'image d'une compagnie ou d'une salle. Relations presse, réseaux sociaux, identité visuelle, dossiers artistiques.",
    univers:     'produire',
  },

  // ── Accompagner ───────────────────────────────────────────────────────────

  {
    id:          'kine',
    nom:         'Kinésithérapeute spécialisé·e',
    description: "Prévention et traitement des blessures spécifiques aux danseurs. Connaissance des contraintes physiques propres à chaque discipline.",
    univers:     'accompagner',
    featured:    true,
  },
  {
    id:          'coach',
    nom:         'Coach de scène / Préparateur·rice mental·e',
    description: "Accompagne la posture, la confiance, la gestion du trac et la performance en situation d'audition ou de représentation.",
    univers:     'accompagner',
  },
  {
    id:          'photographe',
    nom:         'Photographe de danse',
    description: "Capture le mouvement, les répétitions, les portraits d'artistes. Images qui documentent et donnent à voir la danse en dehors de la scène.",
    univers:     'accompagner',
  },
  {
    id:          'journaliste',
    nom:         'Journaliste / Critique',
    description: "Documente, analyse et met en mots la danse. Presse, web, radio, podcast : autant de formats pour faire exister la danse dans le débat culturel.",
    univers:     'accompagner',
  },

  // ── Image & scène ─────────────────────────────────────────────────────────

  {
    id:          'regisseur',
    nom:         'Régisseur·euse',
    description: "Coordonne les aspects techniques d'un spectacle : son, lumière, décors, plateau. Clé de voûte de chaque représentation.",
    univers:     'image',
    featured:    true,
  },
  {
    id:          'createur-lumiere',
    nom:         'Créateur·rice lumière',
    description: "Conçoit l'éclairage d'un spectacle comme un langage à part entière. La lumière sculpte l'espace, guide le regard, crée l'atmosphère.",
    univers:     'image',
  },
  {
    id:          'costumier',
    nom:         'Costumier·ère / Créateur·rice costume',
    description: "Habille les corps, amplifie le propos chorégraphique, travaille avec les contraintes du mouvement et du plateau.",
    univers:     'image',
  },
  {
    id:          'videaste',
    nom:         'Vidéaste / Réalisateur·rice',
    description: "Crée les captations, les dispositifs vidéo scéniques, les films de danse. Document d'archive et œuvre à part entière.",
    univers:     'image',
  },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

export function getMetiersByUnivers(id: MetierUniversId): Metier[] {
  return metiers.filter(m => m.univers === id)
}

export const TOTAL_METIERS = metiers.length
export const TOTAL_UNIVERS = UNIVERS_ORDER.length
