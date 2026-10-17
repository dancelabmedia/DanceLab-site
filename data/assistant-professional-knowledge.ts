import { normalizeSearchText } from './search'

/** Human-checked knowledge, independent of the recommendation catalogue.
 * Never fetch an arbitrary user-provided URL or treat a podcast as legal authority. */
export const PROFESSIONAL_REVIEW = { checkedAt: '2026-10-17', reviewBy: '2027-01-17' }
export const ANNEXES_ARTICLE_SLUG = 'annexes-8-10-differences-intermittents-spectacle'
export const OFFICIAL_SOURCES = {
  overview: { title: 'France Travail - Artiste ou technicien ?', url: 'https://cultureetspectacle.francetravail.fr/je-decouvre/artiste-ou-technicien' },
  eligibility: { title: 'France Travail - Conditions pour recevoir l’allocation', url: 'https://cultureetspectacle.francetravail.fr/je-decouvre/conditions-pour-recevoir-l-allocation' },
  a8: { title: 'Unédic - Annexe 8, convention du 15 novembre 2024', url: 'https://www.unedic.org/la-reglementation/conventions-d-assurance-chomage/annexe-8-au-reglement-general-annexe-a-la-convention-du-15-novembre-2024-2' },
  a10: { title: 'Unédic - Annexe 10, convention du 15 novembre 2024', url: 'https://www.unedic.org/la-reglementation/conventions-d-assurance-chomage/annexe-10-au-reglement-annexe-a-la-convention-du-15-novembre-2024' },
  teaching: { title: 'France Travail - Heures d’enseignement artistique ou technique', url: 'https://www.francetravail.fr/spectacle/spectacle--intermittents/heures-enseignements.html' },
  renewal: { title: 'France Travail - Renouvellement des droits', url: 'https://www.francetravail.fr/spectacle/spectacle--intermittents/les-demarches-pour-demander-le-r.html' },
  contracts: { title: 'Ministère du Travail - Contrat à durée déterminée d’usage', url: 'https://travail-emploi.gouv.fr/le-contrat-duree-determinee-dusage-cddu' },
  guide: { title: 'France Travail - Guide des intermittents du spectacle', url: 'https://www.francetravail.fr/files/live/sites/PE/files/fichiers-en-telechargement/fichiers-en-telechargement---dem/GUIDE-INTERMITTENT.pdf' },
} as const

export type ProfessionalTopic = 'annexes' | 'hours' | 'cachets' | 'mixed' | 'teaching' | 'renewal' | 'intermittence' | 'contracts' | 'no-contract' | 'unverified'
export function professionalTopic(query: string): ProfessionalTopic | undefined {
  const q = normalizeSearchText(query)
  const intermittent = /\bintermitt|\b507\b|\bannex(?:e|es)?\s*(?:8|10|viii|x)\b|\ba(?:8|10)\b|\bcachets?\b/.test(q)
  if (intermittent && /\b(?:belgique|belgium|quebec|canada)\b/.test(q)) return 'unverified'
  if (intermittent && /combien.*(?:allocation|indemnis|toucher)|how much|calculate my|calcule.*(?:droit|allocation)|suis je eligible|am i eligible/.test(q)) return 'unverified'
  if (intermittent && /\benseign|\bteaching\b|\bteach\b|\bcours\b/.test(q)) return 'teaching'
  if (intermittent && /renouvel|recharg|anniversaire|renew|anniversary/.test(q)) return 'renewal'
  if (/\b(?:artisti|artis|danseur|dancer)/.test(q) && /\b(?:techni|technician)/.test(q) && /\bcumul|\bcombin|\bmix|\baltern|\bboth/.test(q)) return 'mixed'
  if (/\b507\b/.test(q)) return 'hours'
  if (/\bcachets?\b/.test(q)) return 'cachets'
  if (/\bannex(?:e|es)?\s*(?:8|10|viii|x)\b|\ba8\b.*\ba10\b|\ba10\b.*\ba8\b/.test(q)) return 'annexes'
  if (intermittent) return 'intermittence'
  // Période sans contrat — doit être testé AVANT la vérification 'contracts' car
  // « sans contrat » contient le mot « contrat » et serait sinon mal classifié.
  if (/\bsans\s+contrat\b|\bentre\s+(?:deux\s+)?contrats?\b|\bperiode\s+(?:sans|d.inactivite|d.arret|creuse?|vide)\b|\bpas\s+de\s+contrat\b|\bwithout\s+(?:a\s+)?contract\b|\bbetween\s+contracts?\b|\bno\s+contract\b/.test(q)) return 'no-contract'
  if (/\bcontrats?\b|\bcontracts?\b|\bcdd(?:u)?\b|\bdroits? des artistes\b|\bartists? rights\b/.test(q) && !/\btrouver\b|\bchercher\b|\bfind\b/.test(q)) return 'contracts'
  return undefined
}

const ANSWERS: Record<Exclude<ProfessionalTopic, 'unverified'>, { fr: [string, ...string[]]; en: [string, ...string[]]; sources: (keyof typeof OFFICIAL_SOURCES)[] }> = {
  annexes: {
    fr: ["Annexes 8 et 10 : quelles différences ?", "**L’annexe 8 concerne les ouvriers et techniciens du spectacle**, pour les emplois et employeurs entrant dans son champ. **L’annexe 10 concerne les artistes du spectacle**, dont les danseurs et danseuses interprètes. Ce sont deux règles d’assurance chômage françaises, pas deux métiers ni deux statuts à choisir librement.", "Dans les deux cas, la règle de base est **au moins 507 heures de travail ou assimilées sur les 12 mois précédant la fin de contrat retenue**, avec les autres conditions d’ouverture des droits. Les techniciens sont déclarés en heures ; pour les artistes, un cachet est converti en **12 heures pour l’affiliation**, sans signifier 12 heures réellement travaillées.", "Si tu cumules des contrats artistiques et techniques éligibles, les heures des deux annexes peuvent être totalisées. L’annexe applicable dépend de celle qui représente le plus d’heures dans la période examinée. Les formules d’allocation et de jours indemnisables diffèrent : le montant dépend de ton dossier, pas seulement du seuil de 507 heures."],
    en: ['Annexes 8 and 10: what is the difference?', '**Annex 8 covers eligible entertainment technicians and workers. Annex 10 covers performing artists**, including dancers. These are two parts of the French unemployment insurance rules, not statuses you can freely choose.', 'Both normally require **at least 507 hours of eligible work or recognised equivalent periods in the 12 months before the contract end date used for the assessment**, alongside the other eligibility conditions. Technicians report hours; for artists, one **cachet counts as 12 hours for eligibility**, not 12 hours actually worked.', 'Eligible artistic and technical hours can be combined. The applicable annex is normally the one accounting for the most hours in the reference period. Daily allowance and monthly payable-day calculations differ, so reaching 507 hours does not determine the amount you will receive.'],
    sources: ['overview', 'eligibility', 'a8', 'a10'],
  },
  hours: {
    fr: ['Les 507 heures : ce qui compte', "La règle de base est de réunir **au moins 507 heures éligibles sur les 12 mois précédant la fin de contrat retenue par France Travail**. Ce n’est pas une année civile ni un simple total de tous tes emplois.", "Les heures relevant des annexes 8 et 10 peuvent s’additionner ; certains temps assimilés sont admis sous conditions. Pour les artistes, un cachet retenu correspond à 12 heures pour l’affiliation. Les autres conditions, notamment l’inscription, la recherche d’emploi et la perte involontaire d’emploi, restent à vérifier.", "Compare tes contrats, bulletins et attestations employeur avec ton dossier France Travail. Je ne peux pas certifier ton éligibilité à partir d’un total d’heures seul."],
    en: ['Understanding the 507-hour requirement', '**At least 507 eligible hours are normally required in the 12 months before the contract end date used by France Travail.** This is not necessarily a calendar year, and not every job counts.', 'Eligible Annex 8 and Annex 10 hours can be combined. Some equivalent periods count under specific conditions. An artist’s eligible cachet counts as 12 hours for this test. Registration, job-search and involuntary unemployment conditions also apply.', 'Check contracts, payslips and employer declarations against your France Travail record. An hours total alone cannot establish your personal eligibility.'],
    sources: ['eligibility', 'a8', 'a10'],
  },
  cachets: {
    fr: ['Heures et cachets : ne pas les confondre', "Le **cachet est un mode de rémunération forfaitaire d’une prestation artistique**. Pour rechercher l’affiliation en annexe 10, chaque cachet retenu est converti en **12 heures**. Cette équivalence ne décrit pas la durée réelle de ta journée.", "Les artistes peuvent aussi être déclarés en heures ; les techniciens sont déclarés en heures réelles. Les textes prévoient notamment un plafond de 28 cachets par mois pour la recherche d’affiliation, avec proratisation dans certains cas. Ne transforme pas toi-même une déclaration en heures en cachet : vérifie les documents avec l’employeur et France Travail."],
    en: ['Hours and cachets are different', 'A **cachet is a flat-fee way of paying for an artistic engagement**. For Annex 10 eligibility, each accepted cachet is converted into **12 hours**. This does not mean that the artist actually worked a 12-hour day.', 'Artists can also be declared in hours; technicians report actual hours. The rules include a limit of 28 cachets per month for eligibility, with proportional limits in some cases. Do not convert an employer’s hours declaration into cachets yourself; check any discrepancy with the employer and France Travail.'],
    sources: ['a10', 'eligibility'],
  },
  mixed: {
    fr: ['Cumuler des contrats artistiques et techniques', "**Les heures éligibles des annexes 8 et 10 peuvent s’additionner** pour rechercher l’affiliation. Tu n’as pas à réunir séparément 507 heures dans chacune.", "L’annexe appliquée est celle dans laquelle tu totalises le plus d’heures dans la période de référence. Chaque contrat doit correspondre à la fonction réellement exercée et respecter le champ de l’annexe concernée. Un emploi hors spectacle ne devient pas éligible parce que tu es aussi danseur.se.", "Demande à France Travail le détail de la répartition retenue ; une égalité, des activités hors champ ou des droits déjà ouverts peuvent nécessiter un examen particulier."],
    en: ['Combining artistic and technical work', '**Eligible Annex 8 and Annex 10 hours can be added together** for the eligibility test. You do not need 507 hours under each annex separately.', 'The applicable annex is the one accounting for the most hours in the reference period. Each contract must reflect the actual work and meet the relevant annex’s scope. A job outside the scheme does not become eligible simply because you are also a dancer.', 'Ask France Travail for the breakdown used. Equal totals, work outside the scheme or existing benefits may require an individual assessment.'],
    sources: ['overview', 'a8', 'a10'],
  },
  teaching: {
    fr: ['Enseigner et ouvrir des droits à l’intermittence', "Les heures d’enseignement artistique ou technique peuvent compter **sous conditions**, notamment de lien avec ton métier, d’établissement éligible et de justificatifs. Un cours n’est pas automatiquement un cachet de scène.", "France Travail indique une limite de **70 heures avant 50 ans et 120 heures à partir de 50 ans**, l’âge étant apprécié à la fin de contrat retenue. Ces heures s’inscrivent dans le plafond commun aux formations assimilées ; elles ne servent pas au calcul du montant de l’allocation journalière. Fais vérifier tes contrats avant de les intégrer à ton décompte."],
    en: ['Teaching and intermittent benefit eligibility', 'Artistic or technical teaching can count **under specific conditions**, including relevance to your profession, an eligible institution and supporting documents. Teaching is not automatically a performance cachet.', 'France Travail gives limits of **70 hours below age 50 and 120 hours from age 50**, assessed at the relevant contract end date. Teaching shares a cap with recognised training periods and is not included in the daily allowance calculation. Have your contracts checked before counting these hours.'],
    sources: ['teaching'],
  },
  renewal: {
    fr: ['Renouveler ses droits à l’intermittence', "Le renouvellement se prépare autour de ta **date anniversaire**, indiquée dans ta notification. Actualise ta situation, vérifie les attestations employeur et transmets les justificatifs demandés dans ton espace France Travail.", "Si un contrat relevant des annexes 8 ou 10 est en cours à cette date, l’examen est reporté au premier jour non couvert par un contrat spectacle. Le renouvellement dépend de l’examen de ton dossier ; ce n’est pas une prolongation automatique."],
    en: ['Renewing intermittent benefits', 'Prepare for the **anniversary date** shown on your benefit notification. Update your situation, check employer declarations and provide the documents requested through your France Travail account.', 'If an Annex 8 or 10 contract is still running on that date, the assessment is postponed to the first day not covered by an eligible entertainment contract. Renewal requires a new assessment; it is not automatic.'],
    sources: ['renewal'],
  },
  intermittence: {
    fr: ["Comprendre l’intermittence du spectacle", "L’intermittence du spectacle est un **régime spécifique d’assurance chômage** pour certains salariés artistes et techniciens alternant des contrats et des périodes sans emploi. Ce n’est pas un statut professionnel autonome.", "L’annexe 8 concerne les ouvriers et techniciens éligibles ; l’annexe 10 concerne les artistes. La règle de base est de justifier de 507 heures de travail ou assimilées sur les 12 mois précédant la fin de contrat retenue, tout en remplissant les autres conditions. France Travail examine chaque dossier."],
    en: ['Understanding French intermittent benefits', 'Intermittence du spectacle is a **specific French unemployment insurance scheme** for eligible performing artists and technicians who alternate employment and gaps between contracts. It is not a standalone employment status.', 'Annex 8 covers eligible technicians and workers; Annex 10 covers artists. The normal threshold is 507 hours of eligible work or equivalent periods in the 12 months before the relevant contract end date, alongside the other conditions. France Travail assesses each application.'],
    sources: ['eligibility', 'overview'],
  },
  contracts: {
    fr: ["Vérifier son contrat dans le spectacle", "Le **CDD d’usage doit être écrit** et préciser notamment son motif et les mentions obligatoires. Le fait de travailler dans le spectacle ne permet pas de recourir à ce contrat pour n’importe quel emploi.", "Avant de signer, vérifie la fonction, les dates, les répétitions, la rémunération et la convention collective applicable. Distingue le salaire des éventuelles autorisations d’exploitation de ton image. Pour juger une clause ou un litige, il faut lire le contrat et connaître la convention concernée : demande un avis juridique personnalisé."],
    en: ["Checking an entertainment contract", "A French **CDD d’usage must be in writing**, state its reason and include mandatory information. Working in entertainment does not make this type of contract appropriate for every job.", "Before signing, check your role, dates, rehearsals, pay and applicable collective agreement. Distinguish salary from any permission to use your image. Assessing a clause or dispute requires the actual contract and relevant agreement; seek individual legal advice."],
    sources: ["contracts"],
  },
  "no-contract": {
    fr: [
      "Que faire pendant une période sans contrat ?",
      "Les périodes sans contrat font partie de la réalité de nombreux danseurs et danseuses professionnels, notamment lorsqu’on travaille en intermittence.",
      "La première chose à faire est de vérifier sa situation auprès de France Travail. Si tu bénéficies du régime de l’intermittence du spectacle, tu peux, **sous certaines conditions**, percevoir une allocation entre deux contrats. Pense à effectuer ton actualisation mensuelle, à déclarer tes activités et à surveiller ta date anniversaire ainsi que tes heures travaillées.",
      "Si tu n’es pas indemnisé, renseigne-toi sur les aides et dispositifs auxquels tu pourrais avoir droit selon ta situation personnelle et professionnelle.",
      "Cette période peut aussi être l’occasion de préparer tes prochaines opportunités : consulter régulièrement les auditions et les castings, mettre à jour ton CV artistique, tes photos et ta bande démo, contacter des compagnies, chorégraphes et productions, entretenir ton réseau professionnel, continuer à t’entraîner, et te renseigner sur les possibilités de formation - notamment auprès de l’AFDAS, du CPF ou de France Travail, **selon ton statut et ton éligibilité**.",
      "Sur Dance Lab, tu peux retrouver les offres d’auditions et d’emploi disponibles dans la rubrique [Auditions](/explorer/auditions).",
      "Une période sans contrat ne signifie pas nécessairement une période sans activité : elle peut aussi servir à préparer la suite de ton parcours.",
    ],
    en: [
      "Between contracts: what to do?",
      "Gaps between contracts are part of the reality for many professional dancers, particularly those working under the French intermittent du spectacle regime.",
      "The first step is to check your situation with France Travail. If you are eligible for intermittent du spectacle benefits, you may - **under specific conditions** - receive an allowance between contracts. Make sure to update your monthly situation, declare your activity, and keep track of your anniversary date and hours worked.",
      "If you are not currently receiving benefits, check what support schemes you may be entitled to depending on your personal and professional situation.",
      "This period can also be a good time to prepare your next opportunities: check auditions and castings regularly, update your CV, photos and demo reel, reach out to companies, choreographers and productions, maintain your professional network, keep training, and look into training options - for example through AFDAS, CPF or France Travail, **depending on your status and eligibility**.",
      "On Dance Lab, you can also find current auditions and job opportunities in the [Auditions](/explorer/auditions) section.",
      "A gap between contracts does not necessarily mean a gap in activity - it can also be a time to prepare what comes next.",
    ],
    sources: ["eligibility", "overview", "guide"],
  },
}

export function professionalAnswer(query: string, locale: 'fr' | 'en' = 'fr', now = new Date()) {
  const topic = professionalTopic(query)
  if (!topic) return undefined
  const entry = topic === 'unverified' ? undefined : ANSWERS[topic]
  const stale = now.getTime() > Date.parse(`${PROFESSIONAL_REVIEW.reviewBy}T23:59:59Z`)
  const sources = (entry?.sources ?? ['guide'] as const).map(key => OFFICIAL_SOURCES[key])
  const content = !entry || stale
    ? locale === 'en'
      ? ['Checking your individual situation', 'I cannot reliably determine this specific entitlement or amount from the available information. The sources below explain the French rules; ask France Travail to assess your contracts and current rights.']
      : ['Vérifier ta situation particulière', "Je ne peux pas déterminer ce droit ou ce montant individuel de façon fiable avec les informations disponibles. Consulte les sources officielles ci-dessous et demande à France Travail d’examiner tes contrats et tes droits actuels."]
    : entry[locale]
  const [heading, ...paragraphs] = content
  return {
    topic, heading,
    message: [...paragraphs, `${locale === 'en' ? 'Official sources' : 'Sources officielles'} : ${sources.map(source => `[${source.title}](${source.url})`).join(' · ')}`, locale === 'en' ? `Information checked on ${PROFESSIONAL_REVIEW.checkedAt}. Rules may change; this is general information, not an individual entitlement decision.` : `Informations vérifiées le 17 octobre 2026. Les règles peuvent évoluer ; ces repères ne remplacent pas l’examen de ton dossier.`].join('\n\n'),
  }
}

/** Same subject is not enough: recommendations must address the requested subtopic. */
export function professionalResourceMatches(query: string, evidence: string): boolean {
  const topic = professionalTopic(query)
  const text = normalizeSearchText(evidence)
  if (!topic) return true
  if (topic === 'unverified') return false
  if (topic === 'annexes') return /\bannex(?:e|es)?\s*(?:8|viii)\b|\ba8\b/.test(text) && /\b(?:annex(?:e|es)?\s*)?(?:10|x)\b|\ba10\b/.test(text)
  if (topic === 'hours') return /\b507\b/.test(text)
  if (topic === 'cachets') return /\bcachets?\b/.test(text) && /\bheures?\b|\b12\b/.test(text)
  if (topic === 'mixed') return /\bcumul|\bcombin/.test(text) && /\bintermitt|\bartist|\btechni/.test(text)
  if (topic === 'teaching') return /\benseign|\bteach/.test(text) && /\bintermitt|\b507\b/.test(text)
  if (topic === 'renewal') return /\brenouvel|\banniversaire\b|\brenew/.test(text) && /\bintermitt|\b507\b/.test(text)
  if (topic === 'contracts') {
    if (/\becrit|\bwritten|\bcdd(?:u)?\b/.test(normalizeSearchText(query))) return /\bcdd(?:u)?\b|\bcontrat.{0,30}\becrit|\bmentions obligatoires\b/.test(text)
    return /\bcontrats?\b/.test(text) && /\bdroit du travail\b|\bremuneration\b|\bsalari|\bembauche\b|\bengagement\b/.test(text)
  }
  // Période sans contrat : recommander des ressources sur l'intermittence,
  // les auditions, la carrière ou la formation — mais pas uniquement des conseils CDDU.
  if (topic === 'no-contract') {
    return /\bintermitt|\baudition|\bcarriere\b|\bformation\b|\breseau\b|\bemploi\b|\bcasting\b/.test(text)
  }
  return true
}
