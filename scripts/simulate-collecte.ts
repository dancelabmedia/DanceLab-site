/**
 * scripts/simulate-collecte.ts
 * Collecte à blanc hors ligne : interroge la vraie source, compare avec un
 * export texte de l'agenda Notion (titre|début|fin par ligne) et affiche ce
 * que la collecte ferait, sans rien écrire.
 *
 * Usage : npx tsx scripts/simulate-collecte.ts chemin/vers/export.txt
 */
import fs from 'node:fs'
import { collectQueFaireAParis } from '../lib/collecte/sources/que-faire-a-paris'
import { planActions, pendingAfter } from '../lib/collecte/plan'
import { dedupeWithinSource, parisToday } from '../lib/collecte/rules'
import type { AgendaPage } from '../lib/collecte/notion'

async function main() {
  const file = process.argv[2]
  const pages: AgendaPage[] = (file ? fs.readFileSync(file, 'utf8').split('\n') : [])
    .filter(Boolean)
    .map((line, i) => {
      const [title, start, end] = line.split('|')
      return { id: `n${i}`, url: '', title, startDate: start || null, endDate: end || null, sourceId: '', publication: '', locked: false, fingerprint: '', missingSince: null, imageUrl: '', imageSource: '', imageCredit: '', venue: '', city: '', company: '', ticketUrl: '', officialUrl: '', imageAttempts: 0, imageNext: null, imageHistory: '', imageScore: null, imageRightsNote: '', imageStatus: '', imageChecked: null, eventLinks: [], hasManualImage: false }
    })
  const today = parisToday()
  const collected = await collectQueFaireAParis()
  const { kept, removed } = dedupeWithinSource(collected)
  const plan = planActions(kept, pages, today, ['qfap:'])
  const count = (k: string) => plan.filter((a) => a.kind === k).length
  const creates = plan.filter((a) => a.kind === 'create') as Array<Extract<(typeof plan)[number], { kind: 'create' }>>
  const reasons = new Map<string, number>()
  for (const c of creates) for (const r of c.decision.reasons) reasons.set(r, (reasons.get(r) ?? 0) + 1)
  console.log(JSON.stringify({
    today,
    recues: collected.length,
    doublonsInternes: removed,
    fichesNotion: pages.length,
    aPublier: creates.filter((c) => c.decision.reasons.length === 0).length,
    enAttente: creates.filter((c) => c.decision.reasons.length > 0).length,
    doublonsAvecNotion: count('duplicate'),
    enAttenteApres: pendingAfter(pages, plan),
    raisons: Object.fromEntries(reasons),
  }, null, 2))
  for (const a of plan) if (a.kind === 'duplicate') console.log(`DOUBLON  ${a.event.title}  ⇔  ${a.page.title}`)
  for (const c of creates.slice(0, 12)) console.log(`${c.decision.reasons.length ? 'ATTENTE' : 'PUBLIE '}  ${c.event.startDate?.slice(0, 10)}  ${c.event.type.padEnd(28)} ${c.event.title}`)
}

main().catch((e) => { console.error(e); process.exit(1) })
