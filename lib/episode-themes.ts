/**
 * lib/episode-themes.ts
 * Référentiel canonique de tags thématiques pour Dance Lab.
 *
 * Ce fichier est la source unique de vérité pour :
 *   • La détection automatique des thèmes d'un épisode (titre + description + excerpt)
 *   • Les labels français affichés sur les pages épisodes
 *   • Les URLs des pages thématiques (/themes/[slug])
 *   • Le scoring de similarité entre épisodes
 *
 * Règle éditoriale :
 *   Un tag ne doit apparaître que si le sujet est réellement abordé dans l'épisode.
 *   La détection repose exclusivement sur le contenu textuel (titre, résumé, description)
 *   — jamais sur le profil ou la discipline de l'invité·e.
 */

export type TagEntry = {
  /** Identifiant interne stable (snake_case) */
  key: string
  /** Label français affiché */
  label: string
  /**
   * Mots-clés déclencheurs.
   * La correspondance est partielle et insensible à la casse (text.includes).
   */
  keywords: string[]
  /**
   * Priorité d'affichage :
   *   'high'   — tag spécifique ou fort enjeu : s'affiche dès 1 correspondance
   *   'normal' — tag plus générique : requiert 2+ correspondances
   * Par défaut : 'normal'
   */
  priority?: 'high' | 'normal'
  /** Formulations éditoriales supplémentaires ; n'élargissent pas les tags historiques. */
  editorialKeywords?: string[]
  /** Nouveau sujet utilisé pour les recommandations, sans retaguer les pages existantes. */
  recommendationOnly?: boolean
}

// ─────────────────────────────────────────────────────────────────────────────
// RÉFÉRENTIEL
// Ordre : les groupes les plus spécifiques / forts enjeux d'abord.
// ─────────────────────────────────────────────────────────────────────────────

export const EPISODE_THEME_REFERENCE: TagEntry[] = [

  // ── Santé & corps ──────────────────────────────────────────────────────────
  {
    key: 'sante_mentale', priority: 'high', label: 'Santé mentale',
    editorialKeywords: ["surmenage","suicide","s ic de","s icide","épuisement mental"],
    keywords: [
      'santé mentale', 'burn-out', 'burnout', 'dépression', 'anxiété',
      'bien-être psychologique', 'résilience', 'reconstruction mentale',
      'thérapie', 'psy', 'souffrance psycho', 'épuisement', 'effondrement',
      'détresse', 'suivi psy',
    ],
  },
  {
    key: 'blessures', priority: 'high', label: 'Santé physique',
    editorialKeywords: ["se blessent","se blesser","se faire opérer","rupture des ligaments","arrachement osseux","hygiène de vie","naturopathie","prévenir les blessures"],
    keywords: [
      'blessure', 'blesser', 'kiné', 'kinésithérapeute', 'récupération physique',
      'échauffement', 'prévention', 'douleur', 'blessé', 'chirurgi', 'opération',
      'corps médical', 'médecin du sport', 'soigner', 'rééducation',
    ],
  },
  {
    key: 'tca', priority: 'high', label: 'Troubles alimentaires',
    keywords: [
      'anorexie', 'boulimie', 'trouble alimentaire', 'tca',
      'dysmorpho', 'rapport au poids', 'rapport à la nourriture',
      'restriction alimentaire', 'hyperphagie',
    ],
  },
  {
    key: 'corps', priority: 'normal', label: 'Corps',
    editorialKeywords: ["coordination","cardio","conscience du corps","conditionnement physique","athlétique","yoga","pilates"],
    keywords: [
      'corps', 'physique', 'athlète', 'préparation physique',
      'anatomie', 'proprioception', 'corporel', 'image corporelle',
    ],
  },

  // ── Violences & relations toxiques ────────────────────────────────────────
  {
    key: 'violences', priority: 'high', label: 'Violences',
    keywords: [
      'violence', 'violences', 'agression', 'abus', 'maltraitance',
      'traumatisme', 'trauma', 'viol', 'harcelé', 'abusé',
      'violences sexuelles', 'violences psychologiques',
    ],
  },
  {
    key: 'emprise', priority: 'high', label: 'Emprise',
    editorialKeywords: ["abus de pouvoir","rapports de pouvoir","élèves n appartiennent pas","élèves ne leur appartiennent pas","tyrannie"],
    keywords: [
      'emprise', 'prise d\'emprise', 'emprise psychologique',
      'dépendance émotionnelle', 'manipulation psychologique',
      'relation toxique', 'mettre une emprise',
    ],
  },
  {
    key: 'harcelement', priority: 'high', label: 'Harcèlement',
    editorialKeywords: ["cyberharcèlement","cyber harcèlement","menaces","insultes"],
    keywords: [
      'harcèlement', 'harceler', 'harcelé', 'toxicité', 'toxique',
      'hypocrisie', 'bullying', 'bully',
    ],
  },

  // ── Carrière & vie professionnelle ────────────────────────────────────────
  {
    key: 'carriere', priority: 'normal', label: 'Carrière',
    editorialKeywords: ["réalités professionnelles","réalités du métier","carrière artistique","compétences professionnelles","marché du travail"],
    keywords: [
      'carrière', 'parcours professionnel', 'contrat', 'intermittent',
      'intermittence', 'vivre de la danse', 'gagner sa vie',
      'précarité', 'agent artistique',
    ],
  },
  {
    key: 'casting', priority: 'high', label: 'Casting & auditions',
    editorialKeywords: ["gérer les refus","passer un casting","auditions absurdes"],
    keywords: [
      'casting', 'audition', 'book de danseur', 'cv de danseur',
      'passer une audition', 'sélection', 'se vendre',
      'être sélectionné', 'portfolio',
    ],
  },
  {
    key: 'entrepreneuriat', priority: 'high', label: 'Entrepreneuriat',
    editorialKeywords: ["entrepreneuriat","entreprendre","création d entreprise","créer sa compagnie","création de projets","propres projets","start up"],
    keywords: [
      'entreprise', 'créer une école', 'école de danse', 'lancer son',
      'studio', 'monter sa compagnie', 'créer sa structure',
      'entrepreneur', 'projet entrepreneurial',
    ],
  },
  {
    key: 'argent', priority: 'high', label: 'Argent & revenus',
    editorialKeywords: ["gérer ses finances","subvention","inflation","précarité","rémunération des danseurs"],
    keywords: [
      'argent', 'salaire', 'revenu', 'financement', 'économi',
      'cachet', 'rémunération', 'pauvreté', 'richesse',
      'précarité financière', 'revenus de la danse',
    ],
  },
  {
    key: 'reconversion', priority: 'high', label: 'Reconversion',
    editorialKeywords: ["quitté le monde de la danse","quitté la danse","quitter le milieu de la danse","quitter la danse","fini par quitter","réinvention artistique","se réinventer"],
    keywords: [
      'reconversion', 'après la danse', 'deuxième carrière',
      'arrêter de danser', 'changement de vie', 'nouvelle vie',
      'se reconvertir', 'fin de carrière',
    ],
  },
  {
    key: 'longevite', priority: 'high', label: 'Longévité',
    editorialKeywords: ["débuts tardifs","trop tard pour commencer","trop vieux","tenir sur la durée","permet vraiment de durer","en vit toujours","carrière solide et durable"],
    keywords: [
      'longévité', 'durer dans la danse', 'vieillir en dansant',
      'vieillir en danse', 'durer longtemps dans',
    ],
  },
  {
    key: 'droits', priority: 'high', label: 'Droits des artistes',
    editorialKeywords: ["connaître ses droits","nos droits","vos droits","ses droits","contrat artistique","contrats","signer un contrat","signez plus jamais un contrat","juridique","embauche","embaucher","arrêt de travail","accident du travail","intermittence","obligations des employeurs","protéger ses oeuvres","clauses"],
    keywords: [
      'droits des artistes', 'statut d\'artiste', 'protection sociale',
      'syndicat', 'convention collective', 'droit du travail des',
    ],
  },
  {
    key: 'international', priority: 'normal', label: 'International',
    keywords: [
      'international', 'étranger', 'tournée internationale',
      'emigrer', 'expatrié', 'vivre à l\'étranger', 'quitter la france',
    ],
  },

  // ── Identité & construction de soi ────────────────────────────────────────
  {
    key: 'identite', priority: 'normal', label: 'Identité',
    editorialKeywords: ["singularité","authenticité","expression de soi","personnalité artistique","identité artistique","se démarquer","trouvez ce qui vous différencie","style qu on reconnaît","liberté d être soi"],
    keywords: [
      'identité', 'légitimité', 'qui suis-je', 'se définir',
      'origines', 'identitaire', 'appartenance',
    ],
  },
  {
    key: 'confiance', priority: 'high', label: 'Confiance en soi',
    editorialKeywords: ["croire en soi","confiance","perfectionnisme","accepter l imperfection","croire en son parcours"],
    keywords: [
      'confiance en soi', 'doute', 'estime de soi',
      'syndrome de l\'imposteur', 'imposture', 'se sentir légitime',
      'manque de confiance',
    ],
  },
  {
    key: 'reussite', priority: 'normal', label: 'Réussite',
    keywords: [
      'réussite', 'succès', 'réussir', 'accomplissement',
      'ambition', 'aboutissement',
    ],
  },
  {
    key: 'inclusion', priority: 'high', label: 'Inclusion & diversité',
    editorialKeywords: ["inclusif","inclusive","mixité","normaliser des corps différents","place pour les femmes","représentation des femmes","inclusivité","homophobie","personnes dites valides","diversité des corps","danser pour la diversité","chacun peut trouver sa place","public mixé","danse comme outil social","sans couleur sans genre"],
    keywords: [
      'inclusion', 'diversité', 'représentation', 'minorité',
      'discrimination', 'racisme', 'sexisme', 'égalité', 'inégalité',
    ],
  },
  {
    key: 'handicap', priority: 'high', label: 'Handicap & handidanse',
    recommendationOnly: true,
    keywords: ['handicap', 'handidanse', 'handi-danse', 'achondroplasie', 'nanisme', 'amputation', 'amputé', 'paralympique'],
  },
  {
    key: 'accessibilite', priority: 'high', label: 'Accessibilité de la danse',
    recommendationOnly: true,
    keywords: ['accessibilité', 'accès à la danse', 'danse accessible', 'rendre la danse accessible', 'danse adaptée'],
    editorialKeywords: ['accès au métier', 'barrières à la pratique', 'pousser les portes', 'faire sauter les barrières'],
  },
  {
    key: 'diversite_corps', priority: 'high', label: 'Diversité des corps',
    recommendationOnly: true,
    keywords: ['diversité des corps', 'corps différents', 'normes corporelles', 'corps hors normes', 'corps atypiques'],
    editorialKeywords: ['personnes désirables', 'condition physique', 'milieu trop normé'],
  },
  {
    key: 'maternite', priority: 'high', label: 'Maternité',
    editorialKeywords: ["maman","vie de famille"],
    keywords: [
      'maternité', 'mère', 'grossesse', 'maternel',
      'accouche', 'enceinte', 'concilier danse et',
    ],
  },

  // ── Styles & pratiques ────────────────────────────────────────────────────
  {
    key: 'hip_hop', priority: 'high', label: 'Hip-hop',
    keywords: [
      'hip-hop', 'hip hop', 'breakdance', 'breaking', 'b-boy', 'b-girl',
      'popping', 'locking', 'street dance', 'culture hip',
      'danse urbaine', 'culture urbaine', 'breakdancer', 'freestyle urbain',
    ],
  },
  {
    key: 'battle', priority: 'high', label: 'Battle',
    keywords: [
      'battle', 'compétition de danse', 'juge de battle',
      'les 1000', 'open battle', 'cypher', 'freestyle battle',
      'urban battle', 'danseur de rue', 'juge', 'juger un battle',
    ],
  },
  {
    key: 'heels', priority: 'high', label: 'Danse heels',
    keywords: [
      'heels', 'talons', 'féminité dans la danse', 'danse en talon',
    ],
  },
  {
    key: 'waacking', priority: 'high', label: 'Waacking',
    keywords: ['waacking', 'waack', 'punking'],
  },
  {
    key: 'krump', priority: 'high', label: 'Krump',
    keywords: ['krump', 'krumper', 'krumping'],
  },
  {
    key: 'voguing', priority: 'high', label: 'Voguing',
    keywords: ['vogue', 'voguing', 'ballroom', 'ball culture', 'maisons de vogue'],
  },
  {
    key: 'contemporain', priority: 'high', label: 'Danse contemporaine',
    keywords: ['contemporain', 'danse contemporaine', 'ballet contemporain'],
  },
  {
    key: 'classique', priority: 'high', label: 'Ballet classique',
    keywords: [
      'danse classique', 'ballet', 'pointes', 'opéra de paris',
      'école de ballet',
    ],
  },
  {
    key: 'jazz', priority: 'high', label: 'Jazz & comédie musicale',
    keywords: ['jazz', 'jazz funk', 'comédie musicale', 'broadway', 'musical'],
  },
  {
    key: 'afro', priority: 'high', label: 'Afro dance',
    keywords: ['afro', 'afrodance', 'afrobeats', 'danse africaine'],
  },
  {
    key: 'flamenco', priority: 'high', label: 'Flamenco',
    keywords: ['flamenco', 'tablao', 'duende', 'sévillane'],
  },
  {
    key: 'pole', priority: 'high', label: 'Pole dance',
    keywords: ['pole dance', 'pole dancing', 'pole fitness'],
  },

  // ── Création & pédagogie ──────────────────────────────────────────────────
  {
    key: 'choreo', priority: 'normal', label: 'Chorégraphie',
    editorialKeywords: ["chorégraphier","direction chorégraphique","devenir chorégraphe","métier de chorégraphe","diriger des danseurs","responsabilités d un e chorégraphe"],
    keywords: [
      'chorégraphe', 'chorégraphie', 'composition chorégraphique',
      'écriture chorégraphique', 'mettre en scène',
    ],
  },
  {
    key: 'creation', priority: 'normal', label: 'Créativité',
    editorialKeywords: ["création artistique","création d un spectacle","création d un seul en scène","écriture","interprétation","incarner","créer des personnages","création de personnage","créer transmettre","source de création","création et de liberté","matière de création","créativité","expérimenter","expérimentation","inspiration","repenser la création"],
    keywords: [
      'créativité', 'processus créatif', 'expérimentation artistique',
      'inspiration créative', 'créer une pièce',
    ],
  },
  {
    key: 'transmission', priority: 'normal', label: 'Transmission',
    editorialKeywords: ["transmettre","enseigner","éducation","professeurs qui marquent","formation","savoir faire"],
    keywords: [
      'transmission', 'pédagogie', 'cours de danse', 'enseigner la danse',
      'professeur de danse', 'apprendre à danser', 'formation de danseur',
      'transmettre la danse',
    ],
  },
  {
    key: 'scene', priority: 'normal', label: 'Scène & performance',
    editorialKeywords: ["présence scénique","seul en scène","maîtresse de cérémonie","régisseur","scène comme espace","tournée","scène comme terrain"],
    keywords: [
      'sur scène', 'spectacle vivant', 'plateau de danse',
      'représentation scénique', 'performance scénique',
    ],
  },
  {
    key: 'musicalite', priority: 'normal', label: 'Musicalité',
    editorialKeywords: ["ressentent la musique","interprètent et incarnent la musique","écoute des danseurs","la musique prend vie"],
    keywords: [
      'musicalité', 'groove', 'ressentir la musique',
      'écoute musicale', 'connexion musique',
    ],
  },

  // ── Sujets éditoriaux distincts (pas des styles ni des profils d'invités) ──
  {
    key: 'pressions', label: 'Pression & regard des autres',
    recommendationOnly: true,
    keywords: ['pression sociale', 'regard des autres', 'comparaison', 'jalousie', 'snobisme', 'toxicité du milieu'],
    editorialKeywords: ['pression', 'se comparer', 'critiques et toxicité', 'hypocrisie', 'perfectionnisme', 'critiques'],
  },
  {
    key: 'reconstruction', label: 'Reconstruction & résilience',
    recommendationOnly: true,
    keywords: ['reconstruction', 'résilience', 'deuil', 'se reconstruire', 'danse comme moyen de survie'],
    editorialKeywords: ['renaître', 'pouvoir de l art', 'guérir', 'pouvoir du mouvement', 'danser pour survivre', 'vulnérabilité', 'réapproprier son corps'],
  },
  {
    key: 'sexualisation', label: 'Féminité & sexualisation',
    recommendationOnly: true,
    keywords: ['sexualisation', 'sexualisée', 'sensualité', 'féminité'],
    editorialKeywords: ['s xualisees', 's xualisation', 'être féminine', 'gestuelle féminine'],
  },
  {
    key: 'pluridisciplinarite', label: 'Pluridisciplinarité artistique',
    recommendationOnly: true,
    keywords: ['pluridisciplinarité', 'polyvalence', 'polyvalent', 'fusion des styles', 'autres arts', 'autres disciplines artistiques'],
    editorialKeywords: ['compétences complémentaires', 'vie artistique multiple', 'vie multiple', 'peindre avec ses jambes', 'art visuel', 'influences artistiques'],
  },
  {
    key: 'collectif', label: 'Collectif & relations humaines',
    recommendationOnly: true,
    keywords: ['travail collectif', 'collectif', 'qualités humaines', 'responsabilités humaines', 'créer du lien'],
    editorialKeywords: ['humain qui prime', 'importance de l humain', 'responsabilité', 'solidaires', 'lien social', 'force d être jumelles', 'énergie de l équipe', 'complicité', 'fraternité', 'valeurs humaines', 'sociabilité'],
  },
  {
    key: 'photographie', label: 'Photographie & image professionnelle',
    recommendationOnly: true,
    keywords: ['photographie', 'photo de danse', 'image professionnelle', 'shooting', 'photos professionnelles'],
    editorialKeywords: ['appareil photo', 'photographier', 'chaque image', 'une seule image', 'retouches', 'photo'],
  },
  {
    key: 'innovation', label: 'Innovation & intelligence artificielle',
    recommendationOnly: true,
    keywords: ['intelligence artificielle', 'innovation', 'technologie', 'IA'],
  },
  {
    key: 'mode', label: 'Danse & mode',
    recommendationOnly: true,
    keywords: ['danse et mode', 'danse et de la mode', 'danse sur la mode', 'danse mode', 'tenues confortables'],
    editorialKeywords: ['mode et la musique', 'création de tenues', 'tenues pensées', 'vêtements'],
  },
  {
    key: 'culture_club', label: 'Culture club & dancefloor',
    recommendationOnly: true,
    keywords: ['culture club', 'cultures club', 'clubbing', 'dancefloor', 'rave party'],
    editorialKeywords: ['rôle des djs', 'la fête comme espace', 'base du club', 'dans le club', 'platines', 'connexion invisible et essentielle entre le dj et le public'],
  },

  // ── Médias & société ──────────────────────────────────────────────────────
  {
    key: 'reseaux', priority: 'normal', label: 'Réseaux sociaux',
    editorialKeywords: ["communication digitale","création de contenu","community manager","identité de marque"],
    keywords: [
      'réseaux sociaux', 'instagram', 'tiktok',
      'contenu vidéo', 'audience en ligne', 'visibilité sur',
      'communauté en ligne', 'présence sur les réseaux',
    ],
  },
]

// ─── Exports dérivés ──────────────────────────────────────────────────────────

/** Public tag vocabulary is preserved; the recommendation engine uses the full reference. */
export const TAG_TAXONOMY = EPISODE_THEME_REFERENCE.filter(theme => !theme.recommendationOnly)

/** key → label affiché */
export const TAG_LABEL: Record<string, string> = Object.fromEntries(
  EPISODE_THEME_REFERENCE.map(({ key, label }) => [key, label])
)

/**
 * key → priorité du tag ('high' | 'normal').
 * Priorité du détecteur historique de tags. Le moteur de recommandations
 * distingue séparément les sujets forts, les problématiques et les styles ;
 * il n'assimile pas un style « high » à un sujet de fond.
 */
export const TAG_PRIORITY: Record<string, 'high' | 'normal'> = Object.fromEntries(
  TAG_TAXONOMY.map(({ key, priority }) => [key, priority ?? 'normal'])
)

/**
 * Convertit une clé interne en slug URL.
 * sante_mentale  →  sante-mentale
 */
export function keyToSlug(key: string): string {
  return key.replace(/_/g, '-')
}

/**
 * Convertit un slug URL en clé interne.
 * sante-mentale  →  sante_mentale
 */
export function slugToKey(slug: string): string {
  return slug.replace(/-/g, '_')
}

// ─── Détection automatique ────────────────────────────────────────────────────

/**
 * Détecte automatiquement les thèmes d'un épisode depuis son texte libre.
 *
 * Algorithme :
 *   1. Compte toutes les occurrences des mots-clés dans le contenu
 *   2. Exige au moins deux signaux concordants, même pour un thème spécifique
 *   3. Une mention isolée (renvoi vers un autre épisode, bio, exemple) est ignorée
 *   4. Retourne au maximum `max` clés, triées par score décroissant
 *
 * @param text  Texte combiné : titre + résumé + description
 * @param max   Nombre maximum de tags (défaut : 6)
 */
export function getEpisodeTags(text: string, max = 6): string[] {
  const lower = text.toLowerCase()

  return TAG_TAXONOMY
    .map((entry) => {
      const matchCount = entry.keywords.reduce((total, keyword) => {
        const kw = keyword.toLowerCase()
        if (!kw) return total
        let count = 0
        let cursor = 0
        while ((cursor = lower.indexOf(kw, cursor)) !== -1) {
          count += 1
          cursor += kw.length
        }
        return total + count
      }, 0)
      const bonus = entry.priority === 'high' ? 1 : 0
      const minRequired = 2
      return { key: entry.key, score: matchCount + bonus, matchCount, bonus, minRequired }
    })
    .filter(({ matchCount, bonus, minRequired }) => (matchCount + bonus) >= minRequired)
    .sort((a, b) => b.score - a.score)
    .slice(0, max)
    .map(({ key }) => key)
}
