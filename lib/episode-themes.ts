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
}

// ─────────────────────────────────────────────────────────────────────────────
// RÉFÉRENTIEL
// Ordre : les groupes les plus spécifiques / forts enjeux d'abord.
// ─────────────────────────────────────────────────────────────────────────────

export const TAG_TAXONOMY: TagEntry[] = [

  // ── Santé & corps ──────────────────────────────────────────────────────────
  {
    key: 'sante_mentale', priority: 'high', label: 'Santé mentale',
    keywords: [
      'santé mentale', 'burn-out', 'burnout', 'dépression', 'anxiété',
      'bien-être psychologique', 'résilience', 'reconstruction mentale',
      'thérapie', 'psy', 'souffrance psycho', 'épuisement', 'effondrement',
      'détresse', 'suivi psy',
    ],
  },
  {
    key: 'blessures', priority: 'high', label: 'Santé physique',
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
    keywords: [
      'emprise', 'prise d\'emprise', 'emprise psychologique',
      'dépendance émotionnelle', 'manipulation psychologique',
      'relation toxique', 'mettre une emprise',
    ],
  },
  {
    key: 'harcelement', priority: 'high', label: 'Harcèlement',
    keywords: [
      'harcèlement', 'harceler', 'harcelé', 'toxicité', 'toxique',
      'hypocrisie', 'bullying', 'bully',
    ],
  },

  // ── Carrière & vie professionnelle ────────────────────────────────────────
  {
    key: 'carriere', priority: 'normal', label: 'Carrière',
    keywords: [
      'carrière', 'parcours professionnel', 'contrat', 'intermittent',
      'intermittence', 'vivre de la danse', 'gagner sa vie',
      'précarité', 'agent artistique',
    ],
  },
  {
    key: 'casting', priority: 'high', label: 'Casting & auditions',
    keywords: [
      'casting', 'audition', 'book de danseur', 'cv de danseur',
      'passer une audition', 'sélection', 'se vendre',
      'être sélectionné', 'portfolio',
    ],
  },
  {
    key: 'entrepreneuriat', priority: 'high', label: 'Entrepreneuriat',
    keywords: [
      'entreprise', 'créer une école', 'école de danse', 'lancer son',
      'studio', 'monter sa compagnie', 'créer sa structure',
      'entrepreneur', 'projet entrepreneurial',
    ],
  },
  {
    key: 'argent', priority: 'high', label: 'Argent & revenus',
    keywords: [
      'argent', 'salaire', 'revenu', 'financement', 'économi',
      'cachet', 'rémunération', 'pauvreté', 'richesse',
      'précarité financière', 'revenus de la danse',
    ],
  },
  {
    key: 'reconversion', priority: 'high', label: 'Reconversion',
    keywords: [
      'reconversion', 'après la danse', 'deuxième carrière',
      'arrêter de danser', 'changement de vie', 'nouvelle vie',
      'se reconvertir', 'fin de carrière',
    ],
  },
  {
    key: 'longevite', priority: 'high', label: 'Longévité',
    keywords: [
      'longévité', 'durer dans la danse', 'vieillir en dansant',
      'vieillir en danse', 'durer longtemps dans',
    ],
  },
  {
    key: 'droits', priority: 'high', label: 'Droits des artistes',
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
    keywords: [
      'identité', 'légitimité', 'qui suis-je', 'se définir',
      'origines', 'identitaire', 'appartenance',
    ],
  },
  {
    key: 'confiance', priority: 'high', label: 'Confiance en soi',
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
    keywords: [
      'inclusion', 'diversité', 'représentation', 'minorité',
      'discrimination', 'racisme', 'sexisme', 'égalité', 'inégalité',
    ],
  },
  {
    key: 'maternite', priority: 'high', label: 'Maternité',
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
    ],
  },
  {
    key: 'battle', priority: 'high', label: 'Battle',
    keywords: [
      'battle', 'compétition de danse', 'juge de battle',
      'les 1000', 'open battle',
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
    keywords: [
      'chorégraphe', 'chorégraphie', 'composition chorégraphique',
      'écriture chorégraphique', 'mettre en scène',
    ],
  },
  {
    key: 'creation', priority: 'normal', label: 'Créativité',
    keywords: [
      'créativité', 'processus créatif', 'expérimentation artistique',
      'inspiration créative', 'créer une pièce',
    ],
  },
  {
    key: 'transmission', priority: 'normal', label: 'Transmission',
    keywords: [
      'transmission', 'pédagogie', 'cours de danse', 'enseigner la danse',
      'professeur de danse', 'apprendre à danser', 'formation de danseur',
      'transmettre la danse',
    ],
  },
  {
    key: 'scene', priority: 'normal', label: 'Scène & performance',
    keywords: [
      'sur scène', 'spectacle vivant', 'plateau de danse',
      'représentation scénique', 'performance scénique',
    ],
  },
  {
    key: 'musicalite', priority: 'normal', label: 'Musicalité',
    keywords: [
      'musicalité', 'groove', 'ressentir la musique',
      'écoute musicale', 'connexion musique',
    ],
  },

  // ── Médias & société ──────────────────────────────────────────────────────
  {
    key: 'reseaux', priority: 'normal', label: 'Réseaux sociaux',
    keywords: [
      'réseaux sociaux', 'instagram', 'tiktok',
      'contenu vidéo', 'audience en ligne', 'visibilité sur',
      'communauté en ligne', 'présence sur les réseaux',
    ],
  },
]

// ─── Exports dérivés ──────────────────────────────────────────────────────────

/** key → label affiché */
export const TAG_LABEL: Record<string, string> = Object.fromEntries(
  TAG_TAXONOMY.map(({ key, label }) => [key, label])
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
      return { key: entry.key, score: matchCount + bonus, matchCount, minRequired }
    })
    .filter(({ matchCount, minRequired }) => matchCount >= minRequired)
    .sort((a, b) => b.score - a.score)
    .slice(0, max)
    .map(({ key }) => key)
}
