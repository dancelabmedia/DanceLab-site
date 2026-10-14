/**
 * scripts/backfill-images.ts
 * Lance immédiatement l'étape « visuels » (la même que la collecte du lundi et
 * le passage quotidien), sans attendre le prochain déclenchement.
 *
 * Usage : NOTION_TOKEN=… [ANTHROPIC_API_KEY=…] npx tsx scripts/backfill-images.ts [--write] [--budget=40]
 * Option : COLLECTE_RESOLUTIONS_FILE=resolutions.json pour fournir des pages
 * officielles déjà identifiées (elles sont vérifiées comme les autres).
 */
import { runCollecte } from '../lib/collecte/run'

async function main() {
  const write = process.argv.includes('--write')
  const budget = Number(process.argv.find((a) => a.startsWith('--budget='))?.split('=')[1] ?? 40)
  const report = await runCollecte({ trigger: 'Manuel', dryRun: !write, imagesOnly: true, resolverBudget: budget, brokenChecks: 400, budgetMs: 3_000_000 })
  console.log(JSON.stringify({ status: report.status, counters: report.counters, errors: report.errors.slice(0, 10) }, null, 2))
  for (const a of report.actions) console.log(a)
}
main().catch((e) => { console.error(e); process.exit(1) })
