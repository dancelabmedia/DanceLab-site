type SearchTagSource = {
  title?: string
  guest?: string
  role?: string
  category?: string
  excerpt?: string
  description?: string
  quote?: string
  chapters?: Array<{ title?: string }>
  tags?: string[]
}

type TopicRule = {
  match: RegExp
  tags: string[]
}

const TOPIC_RULES: TopicRule[] = [
  { match: /\b(break|breaking|breakdance|b[ -]?boy|b[ -]?girl|breakeur)/, tags: ['break', 'breaking', 'breakdance', 'breaker', 'culture hip-hop'] },
  { match: /\bhip[ -]?hop\b/, tags: ['hip-hop', 'culture hip-hop', 'danse urbaine'] },
  { match: /\bkrump\b/, tags: ['krump', 'danse urbaine', 'culture hip-hop'] },
  { match: /\bwaack(ing)?\b/, tags: ['waacking', 'club culture', 'danse urbaine'] },
  { match: /\b(vogue|voguing|ballroom)\b/, tags: ['voguing', 'ballroom', 'club culture'] },
  { match: /\bhouse\b/, tags: ['house dance', 'club culture', 'danse urbaine'] },
  { match: /\bheels?\b/, tags: ['heels', 'féminité', 'danse commerciale'] },
  { match: /\b(classique|ballet)\b/, tags: ['danse classique', 'ballet'] },
  { match: /\bcontemporain/, tags: ['danse contemporaine', 'création chorégraphique'] },
  { match: /\bjazz\b/, tags: ['jazz', 'danse jazz'] },
  { match: /\bpole dance\b/, tags: ['pole dance', 'discipline aérienne'] },
  { match: /\bflamenco\b/, tags: ['flamenco', 'culture espagnole'] },
  { match: /\bafro\b/, tags: ['danses afro', 'cultures africaines'] },
  { match: /\b(claquettes?|tap dance)\b/, tags: ['claquettes', 'tap dance', 'rythme'] },
  { match: /\b(agent|management|manager|accompagnement d artistes?)\b/, tags: ['agent d’artistes', 'management', 'manager', 'accompagnement d’artistes'] },
  { match: /\bproduction\b/, tags: ['production', 'production artistique'] },
  { match: /\bdiffusion\b/, tags: ['diffusion', 'diffusion artistique'] },
  { match: /\b(financement|financer|budget)\b/, tags: ['financement', 'budget', 'économie de la culture'] },
  { match: /\bcasting|audition/, tags: ['casting', 'audition'] },
  // Tag "directeur de casting" uniquement si la fonction est explicitement mentionnée
  { match: /directeur de casting|directrice de casting|casting director/, tags: ['directeur de casting'] },
  { match: /\bchoregraphe|choregraphie|choregraphique/, tags: ['chorégraphe', 'chorégraphie', 'création chorégraphique'] },
  { match: /\bphotograph/, tags: ['photographie', 'photographe de danse', 'image'] },
  { match: /\b(kine|physiotherap|osteopath)/, tags: ['kinésithérapie', 'prévention', 'santé du danseur'] },
  { match: /\b(blessure|blesse|douleur|recuperation)\b/, tags: ['blessures', 'prévention', 'récupération', 'santé du danseur'] },
  { match: /\b(sante mentale|depression|anxiete|burn[ -]?out|psycholog)/, tags: ['santé mentale', 'bien-être', 'psychologie', 'prévention'] },
  { match: /\b(nutrition|alimentation|tca|trouble alimentaire)\b/, tags: ['nutrition', 'alimentation', 'santé du danseur'] },
  { match: /\b(maternite|mere|maman|grossesse|parentalite)\b/, tags: ['maternité', 'parentalité', 'carrière'] },
  { match: /\b(handicap|handidanse|accessibilite)\b/, tags: ['handicap', 'handidanse', 'accessibilité', 'inclusion'] },
  { match: /\b(inclusion|diversite|discrimination|racisme|sexisme|homophobie)\b/, tags: ['inclusion', 'diversité', 'représentation'] },
  { match: /\b(reseaux sociaux|instagram|tiktok|community manager|contenu digital)\b/, tags: ['réseaux sociaux', 'communication digitale', 'création de contenu', 'visibilité'] },
  { match: /\b(entreprene|entreprise|business)\b/, tags: ['entrepreneuriat', 'développement de carrière', 'gestion de projet'] },
  { match: /\b(intermitt|cachet|contrat|droit du travail)\b/, tags: ['intermittence', 'contrats', 'droits des artistes', 'spectacle vivant'] },
  { match: /\b(transmission|pedagog|professeur|enseigne|education|ecole)\b/, tags: ['transmission', 'pédagogie', 'enseignement', 'éducation artistique'] },
  { match: /\b(competition|battle|concours)\b/, tags: ['battle', 'compétition', 'performance'] },
  { match: /\b(jeux olympiques|olympique|jo 20)/, tags: ['Jeux olympiques', 'sport', 'compétition'] },
  { match: /\b(television|dals|danse avec les stars|tv)\b/, tags: ['télévision', 'danse commerciale', 'médias'] },
  { match: /\b(cinema|film|acteur|comedien)\b/, tags: ['cinéma', 'audiovisuel', 'interprétation'] },
  { match: /\b(comedie musicale|musical)\b/, tags: ['comédie musicale', 'spectacle vivant', 'scène'] },
  { match: /\b(tournee|international|etranger|voyage)\b/, tags: ['tournée', 'international', 'mobilité artistique'] },
  { match: /\b(compagnie|collectif|crew)\b/, tags: ['compagnie', 'collectif', 'travail en équipe'] },
  { match: /\b(festival|evenement)\b/, tags: ['événementiel', 'festival', 'spectacle vivant'] },
  { match: /\b(scene|spectacle|performance)\b/, tags: ['spectacle vivant', 'scène', 'performance'] },
  { match: /\b(carriere|metier|profession|travail)\b/, tags: ['carrière', 'métier de la danse', 'professionnalisation'] },
  { match: /\b(creativ|creation|artistique|artiste)\b/, tags: ['création', 'identité artistique', 'parcours artistique'] },
  { match: /\b(confiance|resilience|doute|echec|mental|pression)\b/, tags: ['résilience', 'confiance en soi', 'mental', 'parcours artistique'] },
  { match: /\b(corps|image de soi|sexualis|feminite|sensualite)\b/, tags: ['rapport au corps', 'image de soi', 'représentation'] },
]

function normalize(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[’']/g, ' ')
}

/**
 * Construit les tags de recherche depuis le contenu éditorial réel.
 * Les cinq tags génériques décrivent tous les épisodes Dance Lab et servent
 * uniquement de filet de sécurité lorsque les métadonnées historiques sont
 * particulièrement courtes.
 */
export function buildEpisodeSearchTags(source: SearchTagSource, manualTags: readonly string[] = []): string[] {
  const text = normalize([
    source.title,
    source.guest,
    source.role,
    source.category,
    source.excerpt,
    source.description,
    source.quote,
    ...(source.chapters ?? []).map(chapter => chapter.title),
    ...(source.tags ?? []),
  ].filter(Boolean).join(' '))

  const tags = new Set<string>(['danse', 'podcast danse', 'interview', 'parcours artistique', 'culture chorégraphique'])
  for (const rule of TOPIC_RULES) {
    if (rule.match.test(text)) rule.tags.forEach(tag => tags.add(tag))
  }
  manualTags.forEach(tag => tags.add(tag))
  return Array.from(tags)
}
