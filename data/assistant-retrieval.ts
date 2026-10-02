import type { AssistantItem } from './assistant-index'
import { normalizeSearchText } from './search'

// ─── Style knowledge ───────────────────────────────────────────────────────────

/**
 * Maps each canonical style name to the tags that represent it in the index.
 * Keep aligned with lib/episode-search-tags.ts TOPIC_RULES.
 */
const STYLE_TAGS: Record<string, string[]> = {
  'waacking':    ['waacking', 'waacker'],
  'break':       ['break', 'breaking', 'breakdance', 'breaker', 'b-boy', 'b-girl'],
  'voguing':     ['voguing', 'vogue', 'ballroom', 'old way'],
  'house':       ['house dance', 'house'],
  'krump':       ['krump'],
  'heels':       ['heels'],
  'classique':   ['danse classique', 'ballet', 'classique'],
  'contemporain':['danse contemporaine', 'contemporain', 'neo-classique', 'néo-classique'],
  'jazz':        ['jazz', 'danse jazz'],
  'pole':        ['pole dance'],
  'flamenco':    ['flamenco'],
  'afro':        ['danses afro', 'afro'],
  'claquettes':  ['claquettes', 'tap dance'],
  'hip-hop':     ['hip-hop', 'culture hip-hop', 'danse urbaine'],
}

/**
 * Keywords in a query that signal a dance-style intent.
 * Maps normalized keyword → canonical style key.
 */
const STYLE_TRIGGERS: [RegExp, string][] = [
  [/\bwaack(ing|er)?\b/,                        'waacking'],
  [/\bwaak\b/,                                  'waacking'],
  [/\bbreak(dance|dancing|eur|er)?\b|\bb-?boy\b|\bb-?girl\b/, 'break'],
  [/\bbreaking\b/,                              'break'],
  [/\bvoguing\b|\bvogue\b|\bballroom\b|\bold[ -]?way\b/, 'voguing'],
  [/\bhouse\s+dance\b|\bhouse\b(?=.*danse)/,   'house'],
  [/\bkrump\b/,                                 'krump'],
  [/\bheels\b/,                                 'heels'],
  [/\bclassique\b|\bballet\b/,                  'classique'],
  [/\bcontemp(orain|oraine|orary)\b|\bn[eé]o[ -]classique\b/, 'contemporain'],
  [/\bjazz\b/,                                  'jazz'],
  [/\bpole\s*dance\b/,                          'pole'],
  [/\bflamenco\b/,                              'flamenco'],
  [/\bafro\b/,                                  'afro'],
  [/\bclaquettes?\b|\btap\s*dance\b/,           'claquettes'],
  [/\bhip[ -]?hop\b/,                           'hip-hop'],
]

// ─── Topic knowledge ──────────────────────────────────────────────────────────

/**
 * Maps topic-trigger patterns to the tag clusters they should search for.
 */
const TOPIC_TRIGGERS: [RegExp, string[], string][] = [
  // [regex, matching tags, intent-key]
  [/\bintermitt(ence|ent(e)?|ants)?\b|\bcachet\b|\bdroit\s+du\s+travail\b|\bstatut\b.*\barts?\b/,
    ['intermittence', 'contrats', 'droits des artistes', 'spectacle vivant'],
    'intermittence'],
  [/\bcastings?\b|\bauditions?\b/,
    ['casting', 'audition'],
    'casting'],
  [/\br[eé]seau\s+professionnel\b|\bnetworking\b|\bcontacts?\s+professionnels?\b|\bbouche[ -]à[ -]oreille\b/,
    ['réseau professionnel', 'réseau', 'collaboration', 'opportunités', 'carrière'],
    'reseau'],
  [/\br[eé]seaux?\s+sociaux\b|\binstagram\b|\btiktok\b|\bpersonal\s+branding\b|\bmarque\s+personnelle\b|\bvisibilit[eé]\b/,
    ['réseaux sociaux', 'communication digitale', 'création de contenu', 'visibilité'],
    'visibilite'],
  [/\bshowreel\b|\bdemo\s*reel\b|\bportfolio\b|\bcv\s+(?:de\s+)?dans(eur|euse)\b/,
    ['showreel', 'portfolio', 'cv', 'visibilité', 'casting'],
    'portfolio'],
  [/\bcontrats?\b|\br[eé]mun[eé]ration\b|\bsalaire\b|\bdroits?\s+des\s+artistes\b/,
    ['contrats', 'rémunération', 'droits des artistes', 'intermittence'],
    'contrats'],
  [/\bformation\b|\bse\s+former\b|\bworkshops?\b|\bstages?\b.*\bdanse\b/,
    ['formation', 'professionnalisation', 'transmission', 'workshop'],
    'formation'],
  [/\breconversion\b|\bchanger\s+de\s+m[eé]tier\b|\bapr[eè]s\s+la\s+danse\b/,
    ['reconversion', 'carrière', 'formation', 'métier de la danse'],
    'reconversion'],
  [/\bcarri[eè]re\b|\bdevenir\s+danseur\b|\bvivre\s+de\s+la\s+danse\b|\bprofessionnali[sz]/,
    ['carrière', 'développement de carrière', 'professionnalisation', 'métier de la danse'],
    'carriere'],
  [/\bagents?\b|\bmanager\b|\bmanagement\b|\baccompagnement.*artiste/,
    ["agent d'artistes", 'management', 'manager', "accompagnement d'artistes"],
    'agent'],
  [/\bdiffus(er|ion)?\b|\bprogrammateur\b/,
    ['diffusion', 'diffusion artistique', 'spectacle vivant', 'production artistique'],
    'diffusion'],
  [/\bproduction\b.*\bspectacle\b|\bspectacle.*\bproduction\b|\bproducteur\b/,
    ['production artistique', 'diffusion artistique', 'spectacle vivant'],
    'production'],
  [/\bfinancement\b|\bsubvention\b|\bbudget\b.*\bdanse\b/,
    ['financement', "économie de la culture", 'spectacle vivant'],
    'financement'],
  [/\bcompagnie\b|\bcollectif\b|\bcr[eé]er\s+sa\s+compagnie\b/,
    ['compagnie', 'collectif', 'entrepreneuriat', 'création chorégraphique'],
    'compagnie'],
  [/\btournée\b|\btourne\b|\binternational\b.*\bdans(eur|euse|e)\b/,
    ['tournée', 'international', 'mobilité artistique'],
    'tournee'],
  [/\bchor[eé]graphe\b|\bchor[eé]graphie\b/,
    ['chorégraphe', 'chorégraphie', 'création chorégraphique'],
    'choregraphie'],
  [/\btransmission\b|\bp[eé]dagogie\b|\benseign(er|ant|ement)\b|\bprofesseur\b/,
    ['transmission', 'pédagogie', 'enseignement', 'éducation artistique'],
    'transmission'],
  [/\bbattle\b|\bcomp[eé]tition\b|\bconcours\b/,
    ['battle', 'compétition', 'performance'],
    'battle'],
]

const HEALTH_PATTERN = /\bblessures?\b|\bbless[eé]e?s?\b|\bkine\b|\bkinesith\b|\bsante\b|\bpreventi|\brecupera|\balimentation\b|\bnutrition\b|\bburn[ -]?out\b|\bfatigue\b|\bdouleurs?\b|\bmental\b|\bpsycholog|\bbien[ -]?etre\b|\bacc?ident\b|\boperation\b|\bchirurgie\b|\bathl[eè]te\b|\bblessure/

const HEALTH_TAGS = ['blessures', 'prévention', 'santé du danseur', 'récupération', 'kinésithérapie', 'nutrition', 'alimentation', 'santé mentale', 'bien-être']

// ─── Generic booster tags (should carry very little weight on their own) ─────

/**
 * Tags that appear on virtually every Dance Lab episode.
 * Matches on these alone should not elevate a result.
 * Also used to visually filter tags in recommendation cards.
 */
export const GENERIC_TAGS = new Set([
  'danse', 'podcast danse', 'interview', 'parcours artistique', 'culture chorégraphique',
])

// ─── Intent detection ─────────────────────────────────────────────────────────

type Intent =
  | { type: 'style'; style: string; styleTags: string[] }
  | { type: 'health' }
  | { type: 'topic'; topicTags: string[]; intentKey: string }
  | { type: 'general' }

function detectIntent(query: string): Intent {
  const normalized = normalizeSearchText(query)

  // 1. Dance style detection (most specific)
  for (const [pattern, styleKey] of STYLE_TRIGGERS) {
    if (pattern.test(normalized)) {
      return { type: 'style', style: styleKey, styleTags: STYLE_TAGS[styleKey] ?? [styleKey] }
    }
  }

  // 2. Health & body
  if (HEALTH_PATTERN.test(normalized)) {
    return { type: 'health' }
  }

  // 3. Career / industry topics
  for (const [pattern, tags, intentKey] of TOPIC_TRIGGERS) {
    if (pattern.test(normalized)) {
      return { type: 'topic', topicTags: tags, intentKey }
    }
  }

  return { type: 'general' }
}

// ─── Scoring ───────────────────────────────────────────────────────────────────

function normalizedTags(item: AssistantItem): string[] {
  return item.tags.map(t => normalizeSearchText(t))
}

function scoreStyle(item: AssistantItem, styleTags: string[]): number {
  const itemTagsNorm = normalizedTags(item)
  const normStyleTags = styleTags.map(t => normalizeSearchText(t))
  let score = 0

  // Tag matches (×4 multiplier)
  const tagMatches = normStyleTags.filter(st =>
    itemTagsNorm.some(it => it === st || it.includes(st))
  ).length
  score += tagMatches * 50 * FIELD_MULTIPLIERS.tag

  // Title matches (×3 multiplier)
  const titleNorm = normalizeSearchText(item.title)
  const titleMatches = normStyleTags.filter(st => titleNorm.includes(st)).length
  score += titleMatches * 40 * FIELD_MULTIPLIERS.title

  // Guest matches (×2 multiplier)
  if (item.guest) {
    const guestNorm = normalizeSearchText(item.guest)
    const guestMatches = normStyleTags.filter(st => guestNorm.includes(st)).length
    score += guestMatches * 30 * FIELD_MULTIPLIERS.guest
  }

  // Description/searchText matches (×1 multiplier)
  const contentMatches = normStyleTags.filter(st => item.searchText.includes(st)).length
  score += contentMatches * 20 * FIELD_MULTIPLIERS.content

  return score
}

function scoreHealth(item: AssistantItem): number {
  const itemTagsNorm = normalizedTags(item)
  const normHealthTags = HEALTH_TAGS.map(t => normalizeSearchText(t))
  let score = 0

  // Tag matches (×4 multiplier) — exact match ou l'épisode contient le tag santé
  // (ex: "sante du danseur" contient "sante" → OK).
  // Jamais l'inverse (ht.includes(it)) pour éviter les faux positifs sur tags courts.
  const tagMatches = normHealthTags.filter(ht =>
    itemTagsNorm.some(it => !GENERIC_TAGS.has(it) && (it === ht || it.includes(ht)))
  ).length
  score += tagMatches * 50 * FIELD_MULTIPLIERS.tag

  // Title matches (×3 multiplier)
  const titleNorm = normalizeSearchText(item.title)
  const titleMatches = normHealthTags.filter(ht => titleNorm.includes(ht)).length
  score += titleMatches * 35 * FIELD_MULTIPLIERS.title

  // Description/searchText matches (×1 multiplier)
  const contentMatches = normHealthTags.filter(ht => item.searchText.includes(ht)).length
  score += contentMatches * 20 * FIELD_MULTIPLIERS.content

  // Health pattern match in searchText (×1 multiplier, content-level signal)
  if (HEALTH_PATTERN.test(item.searchText)) {
    score += 15 * FIELD_MULTIPLIERS.content
  }

  return score
}

function scoreTopic(item: AssistantItem, topicTags: string[]): number {
  const itemTagsNorm = normalizedTags(item)
  const normTopicTags = topicTags.map(t => normalizeSearchText(t))
  let score = 0

  // Tag matches (×4 multiplier) — exact match uniquement.
  // L'ancien `tt.includes(it)` causait un bug critique : le tag court "creation"
  // matchait "creation choregraphique" par substring, propulsant des épisodes
  // généralistes à 200 pts pour des requêtes sans rapport (ex: "compagnie").
  // Les tags génériques sont explicitement exclus du scoring.
  const tagMatches = normTopicTags.filter(tt =>
    itemTagsNorm.some(it => !GENERIC_TAGS.has(it) && it === tt)
  ).length
  score += tagMatches * 50 * FIELD_MULTIPLIERS.tag

  // Title matches (×3 multiplier)
  const titleNorm = normalizeSearchText(item.title)
  const titleMatches = normTopicTags.filter(tt => titleNorm.includes(tt)).length
  score += titleMatches * 40 * FIELD_MULTIPLIERS.title

  // Description/searchText matches (×1 multiplier)
  const textMatches = normTopicTags.filter(tt => item.searchText.includes(tt)).length
  score += textMatches * 20 * FIELD_MULTIPLIERS.content

  return score
}

const INTENT_EVIDENCE: Record<string, RegExp> = {
  carriere: /\bcarriere\b|\bprofessionnali|\bvivre de la danse\b|\bmetier de (?:la )?danse\b/,
  reseau: /\breseau professionnel\b|\bnetworking\b|\brencontr|\bcollabor|\brecommand|\bbouche a oreille\b/,
  visibilite: /\breseaux sociaux\b|\binstagram\b|\btiktok\b|\bvisibilite\b|\bcreation de contenu\b|\bmarque personnelle\b/,
  portfolio: /\bshowreel\b|\bdemo reel\b|\bportfolio\b|\bcv\b/,
  casting: /\bcasting\b|\baudition\b/,
  contrats: /\bcontrat\b|\bremuneration\b|\bdroits? des artistes\b|\bsalaire\b/,
  formation: /\bformation\b|\bworkshop\b|\bstage\b|\bse former\b/,
  reconversion: /\breconversion\b|\bchanger de metier\b|\bapres la danse\b/,
  agent: /\bagent\b|\bmanagement\b|\bmanager\b|\baccompagnement d artistes\b/,
  diffusion: /\bdiffusion\b|\bprogrammation\b|\bprogrammateur\b/,
  production: /\bproduction\b|\bproducteur\b|\bproductrice\b/,
  financement: /\bfinancement\b|\bsubvention\b|\bbudget\b|\bmecenat\b/,
  compagnie: /\bcompagnie\b|\bcollectif\b|\btroupe\b/,
  choregraphie: /\bchoregraph|\bprocessus creatif\b/,
  intermittence: /\bintermitt|\bcachet\b|\bdroit du travail\b/,
  transmission: /\btransmission\b|\bpedagog|\benseignement\b|\bprofesseur\b/,
  battle: /\bbattle\b|\bcompetition\b|\bconcours\b/,
}

function hasDirectEditorialEvidence(item: AssistantItem, key: string): boolean {
  const pattern = INTENT_EVIDENCE[key]
  if (!pattern) return true
  // Intentionally excludes the generated tag list: a recommendation must be
  // supported by editorial text, not merely by a coincidental tag.
  return pattern.test(normalizeSearchText(`${item.title} ${item.excerpt} ${item.guest ?? ''}`))
}

function scoreGeneral(item: AssistantItem, tokens: string[]): number {
  if (tokens.length === 0) return 0

  let score = 0
  const titleNorm = normalizeSearchText(item.title)
  const guestNorm = normalizeSearchText(item.guest ?? '')
  const fullQuery = tokens.join(' ')

  // Phrase-level matches in title (×3 multiplier)
  if (titleNorm === fullQuery) score += 150 * FIELD_MULTIPLIERS.title
  else if (titleNorm.startsWith(fullQuery)) score += 110 * FIELD_MULTIPLIERS.title
  else if (titleNorm.includes(fullQuery)) score += 75 * FIELD_MULTIPLIERS.title

  // Phrase-level matches in guest (×2 multiplier)
  if (guestNorm) {
    if (guestNorm === fullQuery) score += 140 * FIELD_MULTIPLIERS.guest
    else if (guestNorm.includes(fullQuery)) score += 70 * FIELD_MULTIPLIERS.guest
  }

  // Phrase in searchText (×1 multiplier)
  if (item.searchText.includes(fullQuery)) score += 40 * FIELD_MULTIPLIERS.content

  // Token-level matches
  let matchedTokens = 0
  for (const token of tokens) {
    if (token.length < 3) continue // skip very short tokens

    if (titleNorm.split(' ').some(w => w.startsWith(token))) {
      score += 22 * FIELD_MULTIPLIERS.title
      matchedTokens++
    } else if (guestNorm.split(' ').some(w => w.startsWith(token))) {
      score += 20 * FIELD_MULTIPLIERS.guest
      matchedTokens++
    } else if (item.searchText.split(' ').some(w => w.startsWith(token))) {
      score += 9 * FIELD_MULTIPLIERS.content
      matchedTokens++
    } else if (item.searchText.includes(token)) {
      score += 3 * FIELD_MULTIPLIERS.content
      matchedTokens++
    }
  }

  // All-token bonus
  if (matchedTokens === tokens.length && tokens.length > 1) {
    score += 30 * FIELD_MULTIPLIERS.content
  }

  // If all matching tags are generic → penalize the score
  const itemTagsNorm = normalizedTags(item)
  const hasSpecificTag = itemTagsNorm.some(t => !GENERIC_TAGS.has(t))
  if (!hasSpecificTag && score < 80) score = Math.floor(score / 2)

  return score
}

// ─── Public API ───────────────────────────────────────────────────────────────

export type AssistantResponse = {
  message: string
  results: AssistantItem[]
  followUps: string[]
}

export type AssistantHistoryMessage = {
  role: 'user' | 'assistant'
  content: string
  resultIds?: string[]
}

/**
 * Find relevant content for a query using intent-aware scoring.
 * Returns [] if nothing exceeds the quality threshold for that intent.
 */
export function findRelevantContent(
  query: string,
  items: AssistantItem[],
  limit = 5,
  options: { recentResultIds?: string[] } = {},
): AssistantItem[] {
  const normalizedQuery = normalizeSearchText(query)
  if (!normalizedQuery || items.length === 0) return []

  const intent = detectIntent(normalizedQuery)
  const tokens = normalizedQuery.split(' ').filter(t => t.length >= 2)

  // Score & threshold per intent
  let minScore: number
  const scored = items.map(item => {
    let s = 0
    if (intent.type === 'style')  s = scoreStyle(item, intent.styleTags)
    if (intent.type === 'health') s = scoreHealth(item)
    if (intent.type === 'topic')  s = hasDirectEditorialEvidence(item, intent.intentKey) ? scoreTopic(item, intent.topicTags) : 0
    if (intent.type === 'general') s = scoreGeneral(item, tokens)
    return { item, score: s }
  })

  if (intent.type === 'style')   minScore = 60   // must mention style somewhere
  else if (intent.type === 'health')  minScore = 50   // at least one health tag
  else if (intent.type === 'topic')   minScore = 40   // at least one topic tag
  else                                minScore = 15   // general relevance (lowered threshold)

  return scored
    .filter(e => e.score >= minScore)
    .filter(e => !options.recentResultIds?.includes(e.item.id))
    .sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title, 'fr'))
    .slice(0, limit)
    .map(e => e.item)
}

// ─── Concept Mapping & Weighted Field Scoring ──────────────────────────────────

/**
 * Field-type multipliers for weighted scoring:
 * - tags: 4.0 (most semantic, curated by hand)
 * - title: 3.0 (core subject matter)
 * - description: 2.0 (contextual details)
 * - guest: 2.0 (expert/practitioner context)
 * - searchText/content: 1.0 (general text matching)
 */
const FIELD_MULTIPLIERS = {
  tag: 4.0,
  title: 3.0,
  description: 2.0,
  guest: 2.0,
  content: 1.0,
}

/**
 * Semantic concept maps for each intent domain.
 * Maps intent key → array of concept clusters.
 * Each cluster has a primary concept and related synonyms/variants.
 * Used for semantic matching across tags and text fields.
 */
const CONCEPT_MAPS: Record<string, Array<{ primary: string; variants: string[] }>> = {
  // ─── Styles ───
  waacking: [
    { primary: 'waacking', variants: ['waack', 'waacker', 'popping', 'locking'] },
    { primary: 'expression', variants: ['attitude', 'style', 'mouvement'] },
    { primary: 'culture', variants: ['lgbtq', 'ballroom', 'underground'] },
  ],
  break: [
    { primary: 'break', variants: ['breaking', 'breakdance', 'b-boy', 'b-girl', 'breaker'] },
    { primary: 'culture', variants: ['hip-hop', 'battle', 'compétition', 'cypher'] },
    { primary: 'technique', variants: ['freeze', 'move', 'footwork', 'power'] },
  ],
  voguing: [
    { primary: 'voguing', variants: ['vogue', 'ballroom', 'old way', 'new way', 'house'] },
    { primary: 'culture', variants: ['lgbtq', 'underground', 'new york', 'documentary'] },
    { primary: 'movement', variants: ['hand', 'pose', 'attitude', 'floor'] },
  ],

  // ─── Career & Industry Topics ───
  compagnie: [
    { primary: 'compagnie', variants: ['collectif', 'troupe', 'ensemble', 'company'] },
    { primary: 'création', variants: ['créer', 'fondation', 'lancer', 'création chorégraphique'] },
    { primary: 'gestion', variants: ['management', 'équipe', 'organisation', 'structure'] },
    { primary: 'administratif', variants: ['statut', 'légal', 'droit', 'contrat'] },
  ],
  agent: [
    { primary: 'agent', variants: ['représentant', 'manager', 'management', 'agence'] },
    { primary: 'représentation', variants: ['accompagnement', 'suivi', 'négociation'] },
    { primary: 'carrière', variants: ['contrat', 'opportunité', 'opportunités', 'booking'] },
  ],
  diffusion: [
    { primary: 'diffusion', variants: ['programmation', 'programmateur', 'présentation'] },
    { primary: 'spectacle vivant', variants: ['représentation', 'performance', 'création'] },
    { primary: 'production', variants: ['producteur', 'productrice', 'projet', 'événement'] },
  ],
  financement: [
    { primary: 'financement', variants: ['budget', 'subvention', 'aide', 'grant'] },
    { primary: 'ressources', variants: ['financer', 'économie', 'investissement', 'mécénat'] },
    { primary: 'projet danse', variants: ['spectacle', 'création', 'production', 'événement'] },
  ],
  casting: [
    { primary: 'casting', variants: ['audition', 'sélection', 'recrutement', 'recherche'] },
    { primary: 'processus', variants: ['auditionner', 'essai', 'préparation', 'sélectionner'] },
    { primary: 'oportunité', variants: ['rôle', 'poste', 'position', 'engagement'] },
  ],
  choregraphie: [
    { primary: 'chorégraphe', variants: ['chorégraphie', 'création', 'créateur', 'créatrice'] },
    { primary: 'création chorégraphique', variants: ['créer', 'composer', 'inventer', 'création'] },
    { primary: 'processus créatif', variants: ['atelier', 'studio', 'répétition', 'développement'] },
  ],
  intermittence: [
    { primary: 'intermittence', variants: ['statut intermittent', 'cachet', 'contrat court', 'vacation'] },
    { primary: 'droits', variants: ['droit du travail', 'protection', 'couverture', 'social'] },
    { primary: 'spectacle vivant', variants: ['intermittent du spectacle', 'artiste', 'profession'] },
  ],
  transmission: [
    { primary: 'transmission', variants: ['enseignement', 'pédagogie', 'formation', 'enseigner'] },
    { primary: 'professeur', variants: ['professeure', 'maître', 'expert', 'instructeur'] },
    { primary: 'apprentissage', variants: ['cours', 'atelier', 'stage', 'éducation'] },
  ],
  tournee: [
    { primary: 'tournée', variants: ['tour', 'travels', 'mobilité', 'déplacement'] },
    { primary: 'international', variants: ['pays', 'festival', 'voyage', 'réseau'] },
    { primary: 'carrière', variants: ['développement', 'rayonnement', 'visibilité', 'reconnaissance'] },
  ],
  production: [
    { primary: 'production', variants: ['producteur', 'productrice', 'produire', 'réalisation'] },
    { primary: 'spectacle vivant', variants: ['spectacle', 'création', 'événement', 'représentation'] },
    { primary: 'gestion', variants: ['budget', 'équipe', 'organisation', 'logistique'] },
  ],
  battle: [
    { primary: 'battle', variants: ['compétition', 'concours', 'competition', 'duel'] },
    { primary: 'performance', variants: ['performance', 'showcasing', 'battle royal', 'showcase'] },
    { primary: 'culture', variants: ['hip-hop', 'breaking', 'compétitif', 'sport'] },
  ],

  // ─── Health & Body ───
  sante: [
    { primary: 'blessure', variants: ['blessures', 'blessé', 'blessée', 'lésion', 'trauma'] },
    { primary: 'prévention', variants: ['prévention', 'prévenir', 'prophylaxie', 'protection'] },
    { primary: 'récupération', variants: ['récupération', 'récupérer', 'repos', 'régénération'] },
    { primary: 'santé mentale', variants: ['psychologie', 'bien-être', 'mental', 'stress', 'burn-out'] },
    { primary: 'kinésithérapie', variants: ['kinésithérapie', 'kinesith', 'kiné', 'physio', 'rééducation'] },
    { primary: 'nutrition', variants: ['alimentation', 'nutrition', 'nutriment', 'régime', 'performance'] },
  ],
}

// ─── Response text ─────────────────────────────────────────────────────────────

const STYLE_LABELS: Record<string, string> = {
  'waacking':     'le waacking',
  'break':        'le break et la culture b-boy / b-girl',
  'voguing':      'le voguing et la culture ballroom',
  'house':        'la house dance',
  'krump':        'le krump',
  'heels':        'les heels',
  'classique':    'la danse classique et le ballet',
  'contemporain': 'la danse contemporaine',
  'jazz':         'la danse jazz',
  'pole':         'le pole dance',
  'flamenco':     'le flamenco',
  'afro':         'les danses afro',
  'claquettes':   'les claquettes et le tap dance',
  'hip-hop':      'la danse hip-hop',
}

const TOPIC_LABELS: Record<string, string> = {
  'intermittence':  "l'intermittence et les droits des artistes",
  'casting':        'les castings et auditions en danse',
  'agent':          "les agents et le management artistique",
  'diffusion':      'la diffusion et la programmation de spectacles',
  'production':     'la production artistique et le spectacle vivant',
  'financement':    'le financement de projets artistiques',
  'compagnie':      'la création de compagnie et le travail collectif',
  'tournee':        'les tournées et la mobilité artistique',
  'choregraphie':   'la chorégraphie et la création',
  'transmission':   'la transmission et la pédagogie en danse',
  'battle':         'les battles et compétitions',
  'reseau':         'le réseau professionnel dans la danse',
  'visibilite':     'la visibilité et les réseaux sociaux',
  'portfolio':      'le CV, le portfolio et le showreel',
  'contrats':       'les contrats et les droits professionnels',
  'formation':      'la formation et la professionnalisation',
  'reconversion':   'la reconversion dans les métiers de la danse',
  'carriere':       'la construction d’une carrière durable',
}

const GUIDED_ANSWERS: Record<string, string[]> = {
  carriere: [
    'Construire une carrière durable demande de travailler plusieurs piliers en parallèle : une base technique solide, une identité artistique lisible et une connaissance concrète du fonctionnement professionnel.',
    'Il faut aussi apprendre à choisir ses collaborations, comprendre les contrats, diversifier ses compétences et protéger sa santé pour pouvoir durer.',
    'L’objectif n’est pas d’accepter toutes les opportunités, mais de construire un parcours cohérent avec ses valeurs et son projet.',
  ],
  reseau: [
    'Un réseau professionnel se construit surtout dans la durée : cours, workshops, auditions, événements, collaborations et recommandations créent des rencontres concrètes.',
    'Après une rencontre, un message bref et personnalisé suffit : rappeler le contexte, remercier, puis partager une actualité réellement pertinente plutôt que solliciter immédiatement un travail.',
    'Tenir un suivi simple de ses contacts aide à entretenir ces relations sans devenir intrusif.',
  ],
  visibilite: [
    'Les réseaux sociaux sont un outil de visibilité, pas une preuve de valeur artistique.',
    'Un profil utile doit surtout montrer clairement ton univers, quelques travaux solides, ton rôle sur chaque projet et une façon simple de te contacter.',
    'La régularité peut aider, mais elle ne remplace ni les auditions, ni les rencontres, ni les recommandations professionnelles.',
  ],
  casting: [
    'Avant une audition, vérifie le style demandé, le projet, les disponibilités, les conditions de travail et la rémunération afin de savoir si elle correspond réellement à ton profil.',
    'Prépare les éléments demandés sans surcharger ta candidature et arrive avec une présentation claire de ton parcours.',
    'Après le casting, note ce que tu as appris et garde un contact professionnel sobre, sans relance insistante.',
  ],
  portfolio: [
    'Un CV de danseur doit être lisible rapidement : formations, expériences, styles maîtrisés, compétences particulières et coordonnées à jour.',
    'Le showreel doit être court, commencer par les séquences les plus fortes et permettre d’identifier clairement ton travail.',
    'Adapte ces supports au projet visé plutôt que d’envoyer exactement le même dossier partout.',
  ],
  contrats: [
    'Avant d’accepter un projet, clarifie par écrit la mission, les dates, les répétitions, la rémunération, les droits à l’image et les conditions d’annulation.',
    'Une promesse orale ou une visibilité annoncée ne remplace pas un contrat précis.',
    'En cas de doute, demande une reformulation et conserve tous les échanges utiles.',
  ],
  formation: [
    'Choisis une formation selon l’écart réel entre ton niveau actuel et ton objectif professionnel, pas seulement selon sa notoriété.',
    'Observe la pédagogie, les intervenants, le volume de pratique, les débouchés et la place donnée à la santé et aux réalités du métier.',
    'Les workshops peuvent compléter une formation, mais ils ne remplacent pas toujours un apprentissage régulier et structuré.',
  ],
  reconversion: [
    'Une reconversion peut commencer avant l’arrêt de la scène en identifiant les compétences transférables : pédagogie, production, coordination, communication ou accompagnement artistique.',
    'Teste progressivement une piste par une formation courte, une mission ou une collaboration avant de basculer complètement.',
    'Le réseau construit dans la danse reste souvent un point d’appui précieux pour cette transition.',
  ],
  sante: [
    'Pour durer, la prévention doit faire partie du travail : progression des charges, récupération, sommeil, renforcement et écoute des signaux inhabituels.',
    'Une douleur persistante ne doit pas être banalisée ; un professionnel de santé connaissant les contraintes de la danse pourra orienter la reprise.',
    'La santé mentale, la fatigue et l’environnement de travail comptent autant que la préparation physique.',
  ],
}

function intentKey(intent: Intent): string {
  if (intent.type === 'health') return 'sante'
  if (intent.type === 'topic') return intent.intentKey
  if (intent.type === 'style') return intent.style
  return 'general'
}

export function generateFollowUps(query: string): string[] {
  const key = intentKey(detectIntent(normalizeSearchText(query)))
  const byIntent: Record<string, string[]> = {
    carriere: ['Comment développer son réseau professionnel ?', 'Comment choisir les auditions adaptées à mon profil ?', 'Que faut-il mettre dans un CV de danseur ?'],
    reseau: ['Comment contacter un chorégraphe sans être intrusif ?', 'Comment transformer une rencontre en opportunité ?', 'Les réseaux sociaux sont-ils indispensables ?'],
    visibilite: ['Que montrer dans un portfolio artistique ?', 'Faut-il publier régulièrement pour rester visible ?', 'Comment séparer visibilité et valeur artistique ?'],
    casting: ['Comment savoir si une audition correspond à mon profil ?', 'Que faut-il préparer avant un casting ?', 'Comment relancer après une audition ?'],
    portfolio: ['Quelle durée pour un showreel ?', 'Comment adapter son CV à une audition ?', 'Quelles vidéos choisir pour son portfolio ?'],
    sante: ['Comment organiser sa récupération ?', 'Quand consulter après une douleur ?', 'Comment prévenir le burn-out dans la danse ?'],
  }
  return byIntent[key] ?? ['Quel aspect faut-il approfondir ?', 'Quels obstacles faut-il anticiper ?', 'Quelle serait la prochaine étape concrète ?']
}

/**
 * Generate a short, contextual intro message.
 * Does NOT list episode numbers — the cards do that.
 */
export function generateEditorialResponse(
  query: string,
  results: AssistantItem[],
  history: AssistantHistoryMessage[] = [],
): string {
  const normalizedQuery = normalizeSearchText(query)
  const intent = detectIntent(normalizedQuery)

  const key = intentKey(intent)
  const previousAssistantText = normalizeSearchText(history.filter(item => item.role === 'assistant').map(item => item.content).join(' '))
  const guided = GUIDED_ANSWERS[key]?.filter(sentence => !previousAssistantText.includes(normalizeSearchText(sentence))) ?? []
  const guidance = guided.slice(0, history.length ? 2 : 3).join(' ')
  const resourceNote = results.length
    ? ' Les ressources ci-dessous approfondissent précisément ce point.'
    : ` Je n’ai pas trouvé de ressource Dance Lab assez directement liée pour en recommander une sans forcer le rapprochement.`
  if (guidance) return guidance + resourceNote

  if (results.length === 0) {
    return `Je n'ai pas trouvé de contenu réellement consacré à ce sujet dans le catalogue Dance Lab. Précise le point que tu veux approfondir pour poursuivre la recherche.`
  }

  if (intent.type === 'style') {
    const label = STYLE_LABELS[intent.style] ?? intent.style
    return `Pour découvrir ${label}, voici les contenus Dance Lab consacrés à cette culture et à celles et ceux qui la pratiquent.`
  }

  if (intent.type === 'health') {
    return `Sur la santé du corps et la prévention des blessures en danse, voici ce que Dance Lab a exploré avec ses invités.`
  }

  if (intent.type === 'topic') {
    const label = TOPIC_LABELS[intent.intentKey] ?? 'ce sujet'
    return `Sur ${label}, voici les épisodes et ressources les plus pertinents de Dance Lab.`
  }

  // General
  return `Voici les contenus Dance Lab les plus proches de ta question.`
}
