/**
 * Preview: npx tsx scripts/regenerate-article-associations.ts [--slug=article]
 * Apply:   npx tsx scripts/regenerate-article-associations.ts --write [--slug=article]
 * --force replaces manual choices except the protected career article.
 * Commit the resulting data files after editorial review.
 */
import fs from 'node:fs'
import path from 'node:path'
import { magazineArticles } from '../app/decouvrir/articles-data'
import { episodes } from '../data/episodes'
import { getEpisodes } from '../lib/episodes'
import { buildRecommendationInputs } from '../lib/episode-recommendations.server'
import { getAllPodcastArticles } from '../lib/podcast-articles'
import { PROTECTED_ARTICLE, regenerateArticleAssociations, selectArticleEpisodes } from '../lib/article-episode-associations'

async function main() {
  const args = process.argv.slice(2)
  const write = args.includes('--write')
  const force = args.includes('--force')
  const slug = args.find(arg => arg.startsWith('--slug='))?.slice(7)
  const root = process.cwd()
  const mappingPath = path.join(root, 'data/article-episode-associations.json')
  const saved = JSON.parse(fs.readFileSync(mappingPath, 'utf8')) as Record<string, { mode: 'manual' | 'auto'; numbers: number[] }>
  const generated = getAllPodcastArticles()
  const catalog = await getEpisodes()
  const cards = new Map(catalog.map(ep => [ep.number, ep]))
  const inputs = buildRecommendationInputs(catalog, episodes, []).map(input => ({
    ...input, guest: cards.get(input.number)?.guest, image: cards.get(input.number)?.image,
  }))
  if (catalog.length < episodes.length) throw new Error('Catalogue incomplet : aucune association sauvegardée.')

  for (const article of magazineArticles.filter(item => !slug || item.slug === slug)) {
    const existing = saved[article.slug]
    if (article.slug === PROTECTED_ARTICLE || (existing?.mode === 'manual' && !force)) continue
    const numbers = selectArticleEpisodes(article, inputs)
    console.log(article.slug, numbers)
    saved[article.slug] = { mode: 'auto', numbers }
  }
  for (const file of generated.filter(item => !slug || item.article.slug === slug)) {
    if (file.article.slug === PROTECTED_ARTICLE) continue
    if (file.article.episodeLinksMode === 'manual' && !force) continue
    const updated = regenerateArticleAssociations({ ...file.article, sourceEpisodeNumber: file.episodeNumber }, inputs, force)
    console.log(file.article.slug, updated.episodeLinks?.map(link => link.number) ?? [])
    if (write) fs.writeFileSync(path.join(root, `data/podcast-articles/ep-${file.episodeNumber}.json`), JSON.stringify({ ...file, article: updated }, null, 2) + '\n')
  }
  if (write) fs.writeFileSync(mappingPath, JSON.stringify(saved, null, 2) + '\n')
  else console.log('Simulation uniquement ; ajouter --write après relecture.')
}

main().catch(error => { console.error(error); process.exitCode = 1 })
