import type { Metadata } from 'next'
import { requireExplorerAccess } from '@/lib/explorer-access'
import MetiersExplorer from './MetiersExplorer'
import MetiersPodcastShowcase, { type MetierPodcastEpisode } from './MetiersPodcastShowcase'
import { getEpisodes, type UnifiedEpisode } from '@/lib/episodes'

// ── Métadonnées ────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: 'Métiers de la danse - Carrières et professions | Dance Lab',
  description:
    'Découvre les métiers de la danse, les parcours professionnels et celles et ceux qui créent, interprètent, transmettent, produisent et accompagnent la danse.',
  openGraph: {
    title: 'Métiers de la danse - Carrières et professions | Dance Lab',
    description:
      'Découvre les métiers de la danse, les parcours professionnels et celles et ceux qui créent, interprètent, transmettent, produisent et accompagnent la danse.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Métiers de la danse - Carrières et professions | Dance Lab',
    description:
      'Découvre les métiers de la danse, les parcours professionnels et celles et ceux qui créent, interprètent, transmettent, produisent et accompagnent la danse.',
  },
}

import { UNIVERS_ORDER, type MetierUniversId } from './metiers-data'

// ── Mapping rôle → univers(s) Métiers ─────────────────────────────────────────
//
//  ep.role est la source de vérité unique (data/episodes.ts).
//  Cette fonction dérive les univers à partir du texte libre du rôle.
//  Un invité.e peut appartenir à plusieurs univers simultanément.
//  Ordre vérifié : du plus spécifique au plus large pour éviter les faux positifs.

function getRoleUniverses(role: string): MetierUniversId[] {
  if (!role || !role.trim()) return []

  const n = (s: string) =>
    s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  const norm = n(role)
  const has  = (kw: string) => norm.includes(n(kw))

  const univers = new Set<MetierUniversId>()

  // 01 — Interpréter : sur scène, en corps
  if (
    has('danseuse') || has('danseur') || has('danseuses') || has('danseurs') ||
    has('performeuse') || has('performeur') || has('comedienne') || has('comedien') ||
    has('comédienne') || has('comédien') || has('chanteur') || has('chanteuse') ||
    has('acrobate') || has('cascadeur') || has('cascadeuse') ||
    // "artiste" seul = interprète, mais "agente d'artiste" = Produire → exclure
    (has('artiste') && !has("agente d'artiste") && !has("agent d'artiste")) ||
    has('maitresse de ceremonie') || has('pole dance') ||
    has('mc ') || has(' mc') || has('dj')
  ) univers.add('interpreter')

  // 02 — Créer : conception, écriture chorégraphique, scénographie
  if (
    has('choregraphe') || has('scenographe') || has('movement director') ||
    has('compositeur') || has('compositrice') || has('auteur') || has('auteure') ||
    has('assistant choregraphe')
  ) univers.add('creer')

  // 03 — Transmettre : enseignement, formation, coaching (hors corps/santé)
  if (
    has('professeur') || has('professeure') || has('formateur') || has('formatrice') ||
    has("directeur d'ecole") || has("directrice d'ecole") || has("directeur d ecole") ||
    // "coach" générique → transmettre, SAUF si contexte corps/santé (boxe, pilates)
    (has('coach') && !has('coach boxe') && !has('coach pilates') && !has('coach vocal'))
  ) univers.add('transmettre')

  // 04 — Produire & diffuser : gestion de projet, entrepreneuriat, diffusion
  if (
    has('entrepreneur') || has('entrepreneuse') || has('entrepreneurs') ||
    has("agente d'artiste") || has("agent d'artiste") || has('agente') ||
    has('cheffe de projet') || has('chef de projet') ||
    has('directeur de casting') || has('directrice de casting') ||
    has('animatrice')   // dans le sens médias / events
  ) univers.add('produire')

  // 05 — Accompagner : santé, préparation physique, bien-être, juridique
  if (
    has('kinesitherapeute') || has('medecin du sport') || has('osteopathe') ||
    has('naturopathe') || has('magnetiseuse') || has('magnetiseur') ||
    has('coach pilates') || has('coach boxe') ||
    has('preparateur') || has('preparatrice') || has('juriste') || has('juristes') ||
    has('pilates')
  ) univers.add('accompagner')

  // 06 — Image & scène : technique, visuel, costumes, photo, vidéo
  if (
    has('photographe') || has('videaste') || has('vidéaste') || has('styliste') ||
    has('costume designer') || has('regisseur') || has('regisseuse') ||
    has('brand designer')
  ) univers.add('image')

  return [...univers]
}

// ── Algorithme de rotation par univers ────────────────────────────────────────
//
//  Principe :
//  1. Chaque épisode est rattaché à un ou plusieurs univers via getRoleUniverses().
//     ep.role est la source de vérité — pas de déduction par mots-clés depuis
//     le titre ou la description.
//  2. On groupe les épisodes par univers PRIMAIRE (premier retourné).
//  3. Seed journalier : stable toute la journée, change chaque jour.
//  4. Pour chaque des 6 univers, on sélectionne 2 épisodes → 12 cartes au total.
//     → représentation garantie de chaque univers chaque jour.
//  5. Dans chaque univers, la sélection tourne quotidiennement pour varier les profils.

const MAX_PER_UNIVERSE  = 2   // épisodes affichés par univers
const MAX_CAROUSEL_CARDS = 12  // total
const ROTATION_EPOCH = new Date('2024-01-01').getTime()

function computeDailySeed(): number {
  return Math.floor((Date.now() - ROTATION_EPOCH) / 86_400_000)
}

function selectCarouselEpisodes(
  allEpisodes: UnifiedEpisode[],
  seed: number,
): MetierPodcastEpisode[] {

  // Étape 1 — rattacher chaque épisode à son univers primaire via ep.role
  type Tagged = { episode: UnifiedEpisode; primaryUnivers: MetierUniversId }
  const byUnivers = new Map<MetierUniversId, Tagged[]>()

  for (const ep of allEpisodes) {
    if (!ep.role || !ep.role.trim()) continue          // skip sans rôle explicite
    const univers = getRoleUniverses(ep.role)
    if (univers.length === 0) continue                 // rôle non reconnu
    const primary = univers[0]
    const group   = byUnivers.get(primary) ?? []
    group.push({ episode: ep, primaryUnivers: primary })
    byUnivers.set(primary, group)
  }

  // Étape 2 — trier chaque groupe par numéro d'épisode (déterminisme)
  for (const group of byUnivers.values()) {
    group.sort((a, b) => a.episode.number - b.episode.number)
  }

  // Étape 3 — sélection : 2 épisodes par univers, dans l'ordre UNIVERS_ORDER
  const shown  = new Set<number>()
  const result: MetierPodcastEpisode[] = []

  for (const uid of UNIVERS_ORDER) {
    if (result.length >= MAX_CAROUSEL_CARDS) break
    const group = byUnivers.get(uid)
    if (!group || group.length === 0) continue

    const n = group.length
    let picked = 0
    for (let i = 0; i < n && picked < MAX_PER_UNIVERSE; i++) {
      const idx     = (seed + i) % n
      const { episode } = group[idx]
      if (shown.has(episode.number)) continue
      shown.add(episode.number)
      result.push({
        number:     episode.number,
        slug:       episode.slug,
        title:      episode.title,
        guest:      episode.guest,
        image:      episode.image,
        profession: episode.role!.replaceAll('·', '.'), // écriture inclusive Dance Lab
      })
      picked++
    }
  }

  return result
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default async function MetiersDeLaDansePage() {
  await requireExplorerAccess('jobs')
  const allEpisodes = await getEpisodes()

  const seed           = computeDailySeed()
  const careerEpisodes = selectCarouselEpisodes(allEpisodes, seed)

  return (
    <main className="met-page">
      {/* Hero + 6 univers + recherche intégrée */}
      <MetiersExplorer />

      {/* Épisodes à découvrir — rotation équilibrée */}
      <MetiersPodcastShowcase episodes={careerEpisodes} />
    </main>
  )
}
