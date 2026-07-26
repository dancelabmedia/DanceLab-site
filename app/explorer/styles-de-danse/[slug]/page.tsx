import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { episodes } from "../../../../data/episodes"
import { danceStyles, getDanceStyle } from "../styles-data"
import StylePageClient from "./StylePageClient"

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

export default async function StylePage({ params }: PageProps) {
  const { slug } = await params
  const style = getDanceStyle(slug)
  if (!style) notFound()

  // Résoudre les épisodes Dance Lab liés
  const linkedEpisodes = style.episodeLinks
    .map((link) => {
      const ep = episodes.find((e) => e.slug === link.slug)
      return ep ? { episode: ep, relevance: link.relevance } : null
    })
    .filter(Boolean) as { episode: (typeof episodes)[0]; relevance: string }[]

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
