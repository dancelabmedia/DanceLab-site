import { redirect } from 'next/navigation'
import { notFound } from 'next/navigation'
import {
  UNIVERS,
  UNIVERS_ORDER,
  getMetiersByUnivers,
  getUniversIdBySlug,
} from '../metiers-data'

// ── Paramètres statiques ───────────────────────────────────────────────────────
// Génère les routes /explorer/metiers-de-la-danse/[slug] pour tous les univers.

export async function generateStaticParams() {
  return Object.values(UNIVERS).map((u) => ({ univers: u.slug }))
}

// ── Redirection vers le premier métier ────────────────────────────────────────
//
// /explorer/metiers-de-la-danse/interpreter
//   → /explorer/metiers-de-la-danse/interpreter/danseur
//
// Le layout [univers]/layout.tsx rend le hero et la sidebar ; cette page
// n'a donc rien à afficher elle-même. La redirection est permanente (308)
// pour les moteurs de recherche.

export default async function UniversMetiersPage({
  params,
}: {
  params: Promise<{ univers: string }>
}) {
  const { univers: slug } = await params
  const universId = getUniversIdBySlug(slug)
  if (!universId) notFound()

  const items = getMetiersByUnivers(universId)
  if (items.length === 0) notFound()

  const universe = UNIVERS[universId]
  redirect(`/explorer/metiers-de-la-danse/${universe.slug}/${items[0].id}`)
}
