import rules from '../data/event-discipline-rules.json' with { type: 'json' }

const norm = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[‑–—]/g, '-')
export const DANCE_DISCIPLINES = ['Classique / Ballet', 'Contemporain', 'Modern-jazz', 'Jazz', 'Hip-hop', 'Breaking', 'Électro', 'House', 'Popping', 'Locking', 'Waacking', 'Voguing', 'Dancehall', 'Afro', 'Krump', 'Street jazz', 'Heels', 'Danses latines', 'Danses de salon', 'Claquettes', 'Danses traditionnelles', 'Danse expérimentale', 'Pole dance', 'French Cancan', 'Danses caribéennes', 'Danse-théâtre', 'Danses de couple', 'Danse classique chinoise', 'Flamenco', 'Tango', 'Salsa', 'Bachata']
const aliases = new Map([...DANCE_DISCIPLINES, 'Gwoka'].map(label => [norm(label), label]))
for (const [alias, label] of Object.entries({ ballet: 'Classique / Ballet', classique: 'Classique / Ballet', 'danse classique': 'Classique / Ballet', 'danse contemporaine': 'Contemporain', contemporain: 'Contemporain', 'hip hop': 'Hip-hop', breakdance: 'Breaking', break: 'Breaking', 'electro dance': 'Électro', 'danse electro': 'Électro', 'voguing / ballroom': 'Voguing', 'danses traditionnelles / du monde': 'Danses traditionnelles' })) aliases.set(alias, label)
for (const [alias, label] of Object.entries({ 'ballet classique': 'Classique / Ballet', 'danses du monde / traditionnelles': 'Danses traditionnelles', 'danse traditionnelle': 'Danses traditionnelles', 'danses folkloriques': 'Danses traditionnelles', 'danses de salon / couple': 'Danses de couple', 'danse caribeenne': 'Danses caribéennes', 'danse-theatre / performance': 'Danse-théâtre', 'theatre danse': 'Danse-théâtre' })) aliases.set(alias, label)

// Only choreography vocabulary, never music genres or a company's name.
const evidence = {
  'Hip-hop': /\bhip[ -]?hop\b/,
  Breaking: /\b(?:breaking|breakdance|b-boy|b-girl)\b/,
  'Électro': /\b(?:danse(?:urs?|uses?)? electro|gestuelle electro|electro dance)\b/,
}

export function classifyEventDisciplines(event) {
  const raw = [...new Set(event.disciplines || [])]
  const identity = norm([event.title, event.description, JSON.stringify(event.cast || []), JSON.stringify(event.additionalInfo || []), event.officialUrl].join(' '))
  const rule = rules.find(rule => new RegExp(rule.title).test(norm(event.title)) && new RegExp(rule.artist).test(identity))
  if (rule) return { disciplines: [...rule.disciplines], status: 'verified', ruleId: rule.id, source: rule.source, locked: true, issues: raw.some(label => !rule.disciplines.includes(label)) ? ['source-conflicts-with-editorial-lock'] : [] }
  const issues = []
  const labels = []
  for (const value of raw) {
    const normalized = norm(value.trim())
    if (/^hip[ -]?hop\s*[/|]\s*(breaking|breakdance)$/.test(normalized)) {
      const description = norm(event.description)
      const supported = ['Hip-hop', 'Breaking', 'Électro'].filter(label => evidence[label].test(description))
      labels.push(...supported)
      issues.push('ambiguous-hip-hop-breaking', ...(!supported.length ? ['no-discipline-evidence'] : []))
      continue
    }
    const label = aliases.get(normalized)
    if (label) labels.push(label)
    else issues.push(`unrecognized-discipline:${value}`)
  }
  if (raw.length > 1) issues.push('multiple-disciplines-to-verify')
  if (!raw.length) issues.push('missing-discipline')
  return { disciplines: [...new Set(labels)], status: 'needs-review', locked: false, issues: [...new Set(issues)] }
}

export function applyEventDisciplines(event) {
  const classification = classifyEventDisciplines(event)
  return {
    ...event,
    disciplines: classification.disciplines,
    // Do not leave contradictory source labels in the detail's supplementary facts.
    additionalInfo: event.additionalInfo?.map(item => /^(disciplines?|styles?)$/i.test(item.label)
      ? { ...item, value: classification.disciplines.join(' · ') } : item).filter(item => item.value),
  }
}
