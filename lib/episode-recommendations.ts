import { EPISODE_THEME_REFERENCE, TAG_LABEL } from './episode-themes'
import { EDITORIAL_RECOMMENDATIONS, EPISODE_SERIES, SAME_GUEST_GROUPS, type EditorialRecommendation } from '../data/episode-relations'

/** All text must describe THIS interview, never the guest's whole biography. */
export type RecommendationInput = {
  number: number
  slug: string
  title: string
  excerpt?: string
  description?: string
  quote?: string
  tags?: string[]
  chapters?: { time: string; title: string }[]
  transcript?: string
  editorial?: string[]
  role?: string
}
type Source = 'title' | 'chapter' | 'description' | 'excerpt' | 'quote' | 'transcript' | 'editorial'
export type ThemeEvidence = { source: Source; text: string; terms: string[] }
export type MainTheme = { key: string; label: string; strength: number; evidence: ThemeEvidence[] }
export type EpisodeProfile = {
  number: number
  slug: string
  themes: MainTheme[]
  styles: MainTheme[]
  role: string
  needsEditorialReview: boolean
}
export type Recommendation = {
  number: number
  slug: string
  score: number
  manual: boolean
  sharedThemes: string[]
  reason: string
}

const STYLES = new Set(['hip_hop', 'heels', 'waacking', 'krump', 'voguing', 'contemporain', 'classique', 'jazz', 'afro', 'flamenco', 'pole'])
const SPECIFIC = new Set(['handicap', 'accessibilite', 'diversite_corps', 'inclusion', 'tca', 'emprise', 'violences', 'harcelement', 'maternite', 'droits', 'sante_mentale', 'blessures', 'sexualisation'])
const GENERIC = new Set(['carriere', 'corps', 'identite', 'reussite', 'international', 'scene'])

/** Ambiguous single words must not create a subject merely by accumulating. */
const AMBIGUOUS = new Set([
  'psy', 'epuisement', 'effondrement', 'prevention', 'operation', 'trauma',
  'toxique', 'toxicite', 'selection', 'se vendre', 'etre selectionne',
  'ecole de danse', 'studio', 'lancer son', 'nouvelle vie', 'changement de vie',
  'mere', 'concilier danse et', 'physique', 'condition physique', 'origines',
  'doute', 'ambition', 'representation', 'diversite', 'juge', 'musical',
  'vogue', 'pointes', 'talons', 'professeur de danse', 'cours de danse', 'choregraphe',
  'instagram', 'tiktok',
])
const STEMS = new Set(['chirurgi', 'dysmorpho', 'economi', 'accouche', 'waack'])
const SOURCE_WEIGHT: Record<Source, number> = { title: 6, chapter: 5, quote: 3, excerpt: 3, description: 2, transcript: 1, editorial: 1 }

export function normalizeEpisodeText(text: string): string {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/œ/g, 'oe').replace(/[^a-z0-9]+/g, ' ').trim()
}

function termsFor(key: string): string[] {
  const theme = EPISODE_THEME_REFERENCE.find(t => t.key === key)!
  return [...new Set([...theme.keywords, ...(theme.editorialKeywords ?? [])].map(normalizeEpisodeText))]
    .filter(term => !AMBIGUOUS.has(term) && !(key === 'sante_mentale' && term === 'resilience') && !(key === 'harcelement' && term === 'hypocrisie'))
}

// Word boundaries avoid e.g. « mère » in « première » or « viol » in « violon ».
// Plurals and common French gender inflections are accepted, not arbitrary substrings.
const MATCHERS = EPISODE_THEME_REFERENCE.map(theme => ({
  key: theme.key,
  terms: termsFor(theme.key).map(term => ({ term, pattern: new RegExp(`(?:^| )${term}${STEMS.has(term) ? '[a-z]*' : '(?:s|e|es)?'}(?= |$)`) })),
}))

function cleanText(text: string): string {
  return text.replace(/<[^>]+>/g, ' ').replace(/https?:\/\/\S+/g, '')
    .replace(/&(?:nbsp|amp|quot|apos);/g, ' ')
    // Distribution/marketing copy is not interview evidence.
    .split(/(?:retrouvez?[- ]moi|retrouvez?[- ]nous|abonne[rz][ -]vous|suis[ -]moi|suivez[ -]nous|pour soutenir le podcast|hébergé par ausha)/i)[0]
}

function collectEvidence(input: RecommendationInput): { source: Source; text: string; normalized: string }[] {
  const units: { source: Source; text: string; normalized: string }[] = []
  const add = (source: Source, text = '') => {
    for (const part of cleanText(text).split(/\n+|(?<=[.!?])\s+/)) {
      const normalized = normalizeEpisodeText(part)
      if (normalized.length < 8) continue
      if (/^(?:il y a des episodes|dans d autres episodes|dans un autre episode|retrouvez aussi|a ecouter aussi|cette conversation rejoint)/.test(normalized)) continue
      // The quote/subtitle is often repeated verbatim in the description.
      // Keep its strongest source, never count it as an independent discussion.
      const duplicate = units.find(u => u.normalized === normalized ||
        (Math.min(normalized.length, u.normalized.length) > 45 &&
          (normalized.includes(u.normalized) || u.normalized.includes(normalized))))
      if (duplicate) {
        if (SOURCE_WEIGHT[source] > SOURCE_WEIGHT[duplicate.source]) {
          duplicate.source = source
          duplicate.text = part.trim()
          duplicate.normalized = normalized
        }
        continue
      }
      units.push({ source, text: part.trim(), normalized })
    }
  }
  add('title', input.title)
  for (const chapter of input.chapters ?? []) add('chapter', chapter.title)
  add('quote', input.quote)
  add('excerpt', input.excerpt)
  add('description', input.description)
  add('transcript', input.transcript)
  for (const article of input.editorial ?? []) add('editorial', article)
  return units
}

export function analyzeEpisode(input: RecommendationInput): EpisodeProfile {
  const units = collectEvidence(input)
  const accepted: MainTheme[] = []
  for (const matcher of MATCHERS) {
    const evidence: ThemeEvidence[] = []
    for (const unit of units) {
      const terms = matcher.terms.filter(({ pattern }) => pattern.test(unit.normalized)).map(t => t.term)
      // « Beaucoup de contrats » describes workload, not employment law.
      if (matcher.key === 'droits' && !/(?:droit|jurid|sign|clauses|negoci|regles|social|comprendre|cumul|embauch|travail)/.test(unit.normalized)) continue
      if (STYLES.has(matcher.key) && /(?:pratique |connu pour |specialis[eé]|enseigne |professeur de)/i.test(unit.text) &&
        !/(?:on parle|on a parl|nous parl|interview|conversation|technique|culture|histoire)/i.test(unit.text)) continue
      if (terms.length) evidence.push({ source: unit.source, text: unit.text, terms })
    }
    const core = evidence.filter(e => e.source !== 'editorial' && e.source !== 'transcript')
    const chapter = core.some(e => e.source === 'chapter')
    const explicitTitle = core.some(e => e.source === 'title')
    const transcriptCount = evidence.filter(e => e.source === 'transcript').length
    // An explicit interview title / chapter is editorial evidence. Otherwise a
    // subject needs independent contexts; one passing mention, a tag, a role or
    // a whole related article alone is insufficient. No artificial minimum of 3.
    const explicitSummary = core.some(e => e.source === 'excerpt' &&
      (/(?:conversation|discussion|echange|temoignage|recit|immersion|rencontre|episode|guide).*(?:sur |autour |entre |pour comprendre|pour distinguer)/.test(normalizeEpisodeText(e.text)) || /\?\s*$/.test(e.text)))
    const topicOutline = core.some(e => e.source === 'description' &&
      (/(?:on (?:a )?parl[eé]|nous (?:avons )?(?:parl|[eé]chang)|on a (?:aussi )?abord|nous [eé]changeons|c.est surtout conna[iî]tre)/i.test(e.text) || /^[➜➔•→-].*\?\s*$/.test(e.text)))
    const substantive = explicitTitle || chapter || core.length >= 2 ||
      (!STYLES.has(matcher.key) && (explicitSummary || topicOutline)) ||
      (transcriptCount >= 3 && core.length >= 1) || transcriptCount >= 5
    if (!substantive) continue
    // Limit both document length bias and repetition bias. Existing tags are
    // intentionally not evidence: some were derived from the guest's profile.
    const strength = Math.min(12, evidence.reduce((sum, e) => sum + SOURCE_WEIGHT[e.source], 0))
    accepted.push({ key: matcher.key, label: TAG_LABEL[matcher.key], strength, evidence: evidence.slice(0, 5) })
  }
  accepted.sort((a, b) => b.strength - a.strength || Number(SPECIFIC.has(b.key)) - Number(SPECIFIC.has(a.key)) || a.key.localeCompare(b.key))
  const themes = accepted.filter(t => !STYLES.has(t.key)).slice(0, 5)
  return {
    number: input.number,
    slug: input.slug,
    themes,
    styles: accepted.filter(t => STYLES.has(t.key)).slice(0, 2),
    role: normalizeEpisodeText(input.role ?? '').replace(/^(danseur|danseuse|artiste)( professionnel(le)?)?$/, ''),
    needsEditorialReview: themes.length < 3,
  }
}

export function createRecommendationIndex(inputs: RecommendationInput[]) {
  const profiles = new Map<number, EpisodeProfile>()
  for (const input of inputs) profiles.set(input.number, analyzeEpisode(input))
  const frequency = new Map<string, number>()
  for (const profile of profiles.values()) {
    for (const theme of [...profile.themes, ...profile.styles]) frequency.set(theme.key, (frequency.get(theme.key) ?? 0) + 1)
  }
  return { profiles, frequency }
}
export type RecommendationIndex = ReturnType<typeof createRecommendationIndex>

// Deterministic pair-specific tie break, not recency, popularity or catalogue order.
function pairTie(a: number, b: number): number {
  let hash = 2166136261
  for (const char of `${a}:${b}`) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619)
  return hash >>> 0
}

export function recommendEpisodes(
  currentNumber: number,
  index: RecommendationIndex,
  limit = 3,
  manualLinks: Record<number, EditorialRecommendation[]> = EDITORIAL_RECOMMENDATIONS,
): Recommendation[] {
  const current = index.profiles.get(currentNumber)
  if (!current || limit <= 0) return []
  const result: Recommendation[] = []
  const seen = new Set([currentNumber])
  for (const link of manualLinks[currentNumber] ?? []) {
    const target = index.profiles.get(link.episode)
    if (!target || seen.has(link.episode)) continue
    seen.add(link.episode)
    result.push({ number: target.number, slug: target.slug, score: 1000, manual: true, sharedThemes: link.themes, reason: link.reason })
    if (result.length >= limit) return result
  }

  const idf = (key: string) => 1 + Math.log(1 + index.profiles.size / (1 + (index.frequency.get(key) ?? 0)))
  const automatic: Recommendation[] = []
  for (const candidate of index.profiles.values()) {
    if (seen.has(candidate.number)) continue
    const shared = current.themes.filter(theme => candidate.themes.some(t => t.key === theme.key))
    const sharedStyles = current.styles.filter(theme => candidate.styles.some(t => t.key === theme.key))
    const sameRole = current.role !== '' && current.role === candidate.role
    const sameSeries = Object.values(EPISODE_SERIES).some(group => group.includes(currentNumber) && group.includes(candidate.number))
    const sameGuest = SAME_GUEST_GROUPS.some(group => group.includes(currentNumber) && group.includes(candidate.number))
    // Disjoint score bands enforce the editorial hierarchy; several generic
    // tags, a style cluster or the same guest cannot outvote a specific subject.
    const tier = shared.some(t => SPECIFIC.has(t.key) && t.strength >= 5 && candidate.themes.find(c => c.key === t.key)!.strength >= 5) ? 5
      : shared.some(t => !GENERIC.has(t.key)) ? 4
      : sameRole ? 3
      : sharedStyles.length ? 2
      : shared.length || sameSeries || sameGuest ? 1 : 0
    if (!tier) continue // No unrelated filler just to produce three cards.
    const union = new Set([...current.themes, ...candidate.themes].map(t => t.key))
    const sharedWeight = shared.reduce((sum, t) => sum + idf(t.key), 0)
    const unionWeight = [...union].reduce((sum, key) => sum + idf(key), 0)
    const similarity = unionWeight ? sharedWeight / unionWeight : 0
    const confidence = shared.length ? shared.reduce((sum, t) => sum + Math.min(t.strength, candidate.themes.find(c => c.key === t.key)!.strength) / 12, 0) / shared.length : 0
    const specificity = shared.length ? Math.max(...shared.map(t => idf(t.key))) / (1 + Math.log(1 + index.profiles.size / 2)) : 0
    const score = Math.round((tier * 100 + similarity * 40 + specificity * 30 + confidence * 20 + Math.min(5, sharedStyles.length * 2 + Number(sameSeries) + Number(sameGuest))) * 100) / 100
    const sharedThemes = [...shared, ...sharedStyles].map(t => t.key)
    const reason = shared.length
      ? `Poursuivre la réflexion : ${shared.map(t => t.label).join(' · ')}`
      : sameRole ? 'Parcours professionnel commun, en complément des sujets de fond.'
      : sharedStyles.length ? `Pratique abordée dans les deux interviews : ${sharedStyles.map(t => t.label).join(' · ')}`
      : 'Même série ou invité récurrent, en complément des sujets de fond.'
    automatic.push({ number: candidate.number, slug: candidate.slug, score, manual: false, sharedThemes, reason })
  }
  automatic.sort((a, b) => b.score - a.score || pairTie(currentNumber, a.number) - pairTie(currentNumber, b.number))
  return [...result, ...automatic.slice(0, Math.max(0, Math.floor(limit) - result.length))]
}
