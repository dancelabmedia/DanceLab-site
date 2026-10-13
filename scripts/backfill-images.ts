/**
 * scripts/backfill-images.ts
 * Relance immédiate de la recherche de visuels pour les fiches visibles sans
 * image (sans attendre le délai de 28 jours de la collecte hebdomadaire).
 *
 * Usage : NOTION_TOKEN=… npx tsx scripts/backfill-images.ts [--write] [rapport.json]
 */
import fs from 'node:fs'
import { NotionClient, listAgendaPages, officialImageProperties, sourceImageProperties, noImageProperties, sameEventImageProperties, updatePageProperties, DEFAULT_AGENDA_DATABASE_ID } from '../lib/collecte/notion'
import { eventDirectories, findOfficialImage, sameProduction, findSharedImages, IMAGE_STATUS, type FoundImage } from '../lib/collecte/images'
import { PUBLICATION } from '../lib/collecte/types'
import { findOpenDataTwin } from '../lib/collecte/run'
import { parisToday, sameEvent } from '../lib/collecte/rules'

async function main() {
  const write = process.argv.includes('--write')
  const out = process.argv.find((a) => a.endsWith('.json'))
  const client = new NotionClient(process.env.NOTION_TOKEN!)
  const today = parisToday()
  const ds = await client.dataSourceId(process.env.NOTION_AGENDA_DATABASE_ID || DEFAULT_AGENDA_DATABASE_ID)
  const pages = await listAgendaPages(client, ds)
  const todo = pages.filter((p) =>
    !p.imageUrl && !p.hasManualImage && !p.locked &&
    p.imageStatus !== IMAGE_STATUS.refused && p.imageStatus !== IMAGE_STATUS.manual &&
    p.publication !== PUBLICATION.archived && p.publication !== PUBLICATION.pending &&
    !((p.endDate ?? p.startDate ?? '9999').slice(0, 10) < today))
  const illustrated = pages.filter((p) => p.imageUrl && p.imageStatus !== IMAGE_STATUS.refused)
  let copied = 0
  for (const page of [...todo]) {
    const twin = illustrated.find((o) => o.id !== page.id && (sameEvent(o, page) || sameProduction(o, page)))
    if (!twin) continue
    todo.splice(todo.indexOf(page), 1)
    copied++
    console.log('repris :', page.title, '⇐', twin.title)
    if (write) await updatePageProperties(client, page.id, sameEventImageProperties(twin, today))
  }
  console.log('visuels repris d’une fiche jumelle', copied)
  const directories = eventDirectories(pages.filter((p) => p.imageStatus === IMAGE_STATUS.official).map((p) => p.imageSource))
  console.log('à traiter', todo.length, 'dossiers connus', directories.length)
  const results: Array<{ id: string; title: string; image: FoundImage | null; reason: string; links: string[] }> = []
  let i = 0
  const worker = async () => {
    while (i < todo.length) {
      const p = todo[i++]
      const od = await findOpenDataTwin(p)
      if (od) {
        if (write) await updatePageProperties(client, p.id, sourceImageProperties(od, today))
        results.push({ id: p.id, title: p.title, links: [od.sourceUrl], image: { url: od.imageUrl, sourceUrl: od.sourceUrl, credit: od.imageCredit || 'Ville de Paris', alt: p.title }, reason: '', openData: true } as any)
        continue
      }
      let r = { image: null as FoundImage | null, reason: "Pas de lien vers la page de l'événement" }
      for (const link of p.eventLinks) { r = await findOfficialImage(p.title, link, p.startDate, directories); if (r.image) break }
      results.push({ id: p.id, title: p.title, links: p.eventLinks, ...r })
      if (results.length % 20 === 0) console.log(results.length, '/', todo.length)
    }
  }
  await Promise.all(Array.from({ length: 6 }, worker))
  const shared = findSharedImages([
    ...results.map((r) => ({ title: r.title, imageUrl: r.image?.url ?? '' })),
    ...pages.filter((p) => p.imageStatus === IMAGE_STATUS.official).map((p) => ({ title: p.title, imageUrl: p.imageUrl })),
  ])
  for (const r of results) if (r.image && shared.has(r.image.url) && !/^(saison|festival|programmation)/i.test(r.title)) { r.image = null; r.reason = 'Visuel générique utilisé pour plusieurs événements' }
  if (write) for (const r of results) if (!(r as any).openData) await updatePageProperties(client, r.id, r.image ? officialImageProperties(r.image, today) : noImageProperties(r.reason, today))
  const found = results.filter((r) => r.image).length
  console.log(JSON.stringify({ traitées: results.length, trouvées: found, sans: results.length - found, écrit: write }))
  if (out) fs.writeFileSync(out, JSON.stringify(results, null, 1))
}
main().catch((e) => { console.error(e); process.exit(1) })
