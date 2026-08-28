import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getEpisodes, type UnifiedEpisode } from "@/lib/episodes"
import { danceStyles, getDanceStyle } from "../styles-data"
import StylePageClient from "./StylePageClient"

export const revalidate = 3600

type PageProps = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return danceStyles.map((s) => ({ slug: s.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const style = getDanceStyle(slug)
  if (!style) return { title: "Style | Dance Lab" }

  return {
    title: style.seoTitle,
    description: style.seoDescription,
    openGraph: {
      title: style.seoTitle,
      description: style.seoDescription,
      type: "article",
    },
  }
}

// ─── Types ───────────────────────────────────────────────────────────────────

export type LinkedEpisode = {
  episode: UnifiedEpisode
  /** Texte éditorial explicatif (null = lien automatique sans note) */
  relevance: string | null
}

// ─── Helper : auto-linking ────────────────────────────────────────────────────

/**
 * Construit la liste d'épisodes liés à un style.
 *
 * Algorithme :
 *   1. Liens éditoriaux explicites (episodeLinks) — toujours en premier, avec note
 *   2. Liens automatiques — tout épisode dont le titre ou l'excerpt mentionne
 *      le nom du style, ses alias ou ses autoMatchTerms
 *      → sans note éditorialle (relevance: null)
 *
 * Les doublons (slug déjà présent) sont éliminés : l'explicite prime.
 */
function buildLinkedEpisodes(
  style: NonNullable<ReturnType<typeof getDanceStyle>>,
  allEpisodes: UnifiedEpisode[],
): LinkedEpisode[] {
  // --- 1. Liens explicites ---
  const explicitMap = new Map<string, string>()
  for (const link of style.episodeLinks) {
    explicitMap.set(link.slug, link.relevance)
  }

  const explicit: LinkedEpisode[] = []
  for (const [slug, relevance] of explicitMap) {
    const ep = allEpisodes.find((e) => e.slug === slug)
    if (ep) explicit.push({ episode: ep, relevance })
  }

  // --- 2. Liens automatiques ---
  // Termes à rechercher (en minuscules) dans le titre + excerpt de l'épisode
  const rawTerms: string[] = [
    style.name,
    ...(style.aliases ?? []),
    ...(style.autoMatchTerms ?? []),
  ]
  const terms = rawTerms.map((t) => t.toLowerCase()).filter(Boolean)

  const auto: LinkedEpisode[] = []
  if (terms.length > 0) {
    for (const ep of allEpisodes) {
      // Éviter les doublons avec les liens explicites
      if (explicitMap.has(ep.slug)) continue

      const haystack = [ep.title, ep.excerpt, ep.description]
        .join(" ")
        .toLowerCase()

      if (terms.some((t) => haystack.includes(t))) {
        auto.push({ episode: ep, relevance: null })
      }
    }
  }

  return [...explicit, ...auto]
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function StylePage({ params }: PageProps) {
  const { slug } = await params
  const style = getDanceStyle(slug)
  if (!style) notFound()

  // Tous les épisodes (statiques + RSS) — ISR 1h
  const allEpisodes = await getEpisodes()

  // Épisodes liés (explicites + auto-matching)
  const linkedEpisodes = buildLinkedEpisodes(style, allEpisodes)

  // Styles associés résolus
  const relatedStylesData = style.relatedStyles
    .map((s) => getDanceStyle(s))
    .filter(Boolean) as NonNullable<ReturnType<typeof getDanceStyle>>[]

  return (
    <main className="style-detail-page">
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="style-hero">
        {style.image && (
          <>
            <div className="style-hero-bg">
              <img src={style.image} alt={style.name} />
            </div>
            <div className="style-hero-shade" />
          </>
        )}
        <div className="container style-hero-content">
          <nav className="style-breadcrumb" aria-label="Fil d'Ariane">
            <Link href="/explorer">Explorer</Link>
            <span>·</span>
            <Link href="/explorer/styles-de-danse">Styles de danse</Link>
            <span>·</span>
            <span>{style.name}</span>
          </nav>

          <div className="style-hero-badges">
            <span className="style-badge style-badge--family">{style.family}</span>
            <span className="style-badge">{style.era}</span>
            <span className="style-badge">{style.originCity}, {style.originCountry}</span>
          </div>

          <h1>{style.name}</h1>
          {style.aliases && style.aliases.length > 0 && (
            <p className="style-hero-aliases">Aussi appelé : {style.aliases.join(", ")}</p>
          )}
          <p className="style-hero-summary">{style.summary}</p>

          {style.imageCredit && (
            <p className="style-hero-credit">{style.imageCredit}</p>
          )}
        </div>
      </section>

      {/* ── Corps de page avec TOC (client) ─────────────────────── */}
      <StylePageClient style={style} linkedEpisodes={linkedEpisodes} relatedStylesData={relatedStylesData} />
    </main>
  )
}
