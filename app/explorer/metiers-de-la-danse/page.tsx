import type { Metadata } from 'next'
import { requireExplorerAccess } from '@/lib/explorer-access'
import MetiersExplorer from './MetiersExplorer'
import MetiersPodcastShowcase, { type MetierPodcastEpisode } from './MetiersPodcastShowcase'
import { getEpisodes, type UnifiedEpisode } from '@/lib/episodes'

// La sélection du carrousel doit être recalculée à chaque nouvelle visite.
export const dynamic = 'force-dynamic'

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
//  3. Une graine propre à la requête varie la sélection à chaque nouvelle visite.
//  4. Un premier passage garantit un épisode par univers disponible.
//  5. Les places restantes sont distribuées entre les univers, sans afficher deux
//     fois le même intitulé de métier tant que le catalogue permet de l'éviter.

const MAX_PER_UNIVERSE  = 2   // épisodes affichés par univers
const MAX_CAROUSEL_CARDS = 12  // total
function computeRequestSeed(): number {
  return (Date.now() ^ Math.floor(Math.random() * 0x7fffffff)) >>> 0
}

function seededShuffle<T>(items: T[], seed: number): T[] {
  const result = [...items]
  let state = seed || 1
  const random = () => {
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 0x100000000
  }
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

function professionKey(role: string): string {
  return role
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[.·]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
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

  // Étape 2 — mélanger chaque univers avec une graine dérivée : les futurs
  // épisodes éligibles intègrent automatiquement le même pool.
  for (const [uid, group] of byUnivers) {
    const universeOffset = UNIVERS_ORDER.indexOf(uid) + 1
    byUnivers.set(uid, seededShuffle(group, seed + universeOffset * 7919))
  }

  // Étape 3 — sélection collective et équilibrée.
  const shown  = new Set<number>()
  const shownProfessions = new Set<string>()
  const result: MetierPodcastEpisode[] = []

  const shuffledUniverses = seededShuffle([...UNIVERS_ORDER], seed + 104729)
  const pickedPerUniverse = new Map<MetierUniversId, number>()

  const pickFromUniverse = (uid: MetierUniversId, allowRepeatedProfession = false) => {
    const group = byUnivers.get(uid) ?? []
    const candidate = group.find(({ episode }) => {
      const roleKey = professionKey(episode.role ?? '')
      return !shown.has(episode.number) && (allowRepeatedProfession || !shownProfessions.has(roleKey))
    })
    if (!candidate) return false

    const { episode } = candidate
    shown.add(episode.number)
    shownProfessions.add(professionKey(episode.role ?? ''))
    pickedPerUniverse.set(uid, (pickedPerUniverse.get(uid) ?? 0) + 1)
    result.push({
      number: episode.number,
      slug: episode.slug,
      title: episode.title,
      guest: episode.guest,
      image: episode.image,
      profession: episode.role!.replaceAll('·', '.'),
    })
    return true
  }

  // Un profil de chaque grande famille, lorsque des épisodes éligibles existent.
  for (const uid of shuffledUniverses) pickFromUniverse(uid)

  // Puis un second profil distinct par univers pour compléter le carrousel.
  for (const uid of shuffledUniverses) {
    if (result.length >= MAX_CAROUSEL_CARDS) break
    if ((pickedPerUniverse.get(uid) ?? 0) < MAX_PER_UNIVERSE) pickFromUniverse(uid)
  }

  // Rare fallback : si les intitulés disponibles sont trop homogènes, compléter
  // sans dupliquer un épisode, tout en conservant la limite par univers.
  for (const uid of shuffledUniverses) {
    if (result.length >= MAX_CAROUSEL_CARDS) break
    if ((pickedPerUniverse.get(uid) ?? 0) < MAX_PER_UNIVERSE) pickFromUniverse(uid, true)
  }

  return result
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default async function MetiersDeLaDansePage() {
  await requireExplorerAccess('jobs')
  const allEpisodes = await getEpisodes()

  const seed           = computeRequestSeed()
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
