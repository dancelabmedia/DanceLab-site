import type { Metadata } from "next"
import { requireExplorerAccess } from '@/lib/explorer-access'
import { sectionVisibility } from '@/data/section-visibility'
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { getEpisodes, type UnifiedEpisode } from "@/lib/episodes"
import { getAllPublishedArticles } from "@/lib/all-articles"
import { danceStyles, getDanceStyle } from "../styles-data"
import { withDedicatedStyleImage } from "../style-image-resolver"
import StyleEditorial from "./StyleEditorial"
import css from "./style-editorial.module.css"
import { requestLocale } from '@/lib/i18n/server'
import { uiText } from '@/data/i18n/messages'

export const revalidate = 3600

type PageProps = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  if (sectionVisibility.danceStyles === 'private') return []
  return danceStyles.map((s) => ({ slug: s.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  await requireExplorerAccess('danceStyles', `/explorer/styles-de-danse/${slug}`)
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
  await requireExplorerAccess('danceStyles', `/explorer/styles-de-danse/${slug}`)
  const locale = await requestLocale()
  const t = (text: string) => uiText(locale, text)
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

  // Même photographie que dans la grille, sans modifier la source éditoriale.
  const cover = withDedicatedStyleImage(style).image
  const sentenceEnd = style.summary.search(/[.!?](?:\s|$)/)
  const heroSummary = sentenceEnd < 0 ? style.summary : style.summary.slice(0, sentenceEnd + 1)
  const summaryRest = sentenceEnd < 0 ? "" : style.summary.slice(sentenceEnd + 1).trim()

  // Appellations entières dans le titre ou tag exact ; pas de mots-clés génériques.
  const normalize = (value: string) => value.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, " ").trim()
  const names = [style.name, ...(style.aliases ?? [])].map(normalize).filter(Boolean)
  const linkedArticles = getAllPublishedArticles().filter((article) => {
    const title = ` ${normalize(article.title)} `
    const tags = article.tags.map(normalize)
    return names.some((name) => tags.includes(name) || title.includes(` ${name} `))
  })

  const orderedStyles = [...danceStyles].sort((a, b) => a.name.localeCompare(b.name, "fr", { sensitivity: "base" }))
  const currentIndex = orderedStyles.findIndex((item) => item.slug === slug)

  return (
    <main className={css.page}>
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className={css.hero} aria-labelledby="style-title">
        {cover && (
          <div className={css.heroImage}>
            <Image src={cover} alt={style.name} fill priority sizes="100vw" />
          </div>
        )}
        <div className={css.heroShade} />
        <div className={`container ${css.heroContent}`}>
          <nav className={css.breadcrumb} aria-label={t("Fil d'Ariane")}>
            <Link href="/explorer/styles-de-danse">{t('Styles de danse')}</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{style.name}</span>
          </nav>
          <p className={css.kicker}>{style.family}</p>
          <h1 id="style-title" className={css.heroTitle} data-long={style.name.length > 20}>{style.name}</h1>
          {style.aliases && style.aliases.length > 0 && (
            <p className={css.aliases}>{style.aliases.join(" · ")}</p>
          )}
          <p className={css.heroSummary}>{heroSummary}</p>
          <Link href="#introduction" className={css.discover}>
            <span aria-hidden="true">↓</span> {t('Découvrir le style')}
          </Link>
          {cover === style.image && style.imageCredit && (
            <p className={css.heroCredit}>{style.imageCredit}</p>
          )}
        </div>
      </section>

      <StyleEditorial
        style={style}
        cover={cover}
        summaryRest={summaryRest}
        linkedEpisodes={linkedEpisodes}
        linkedArticles={linkedArticles}
        relatedStylesData={relatedStylesData}
        previousStyle={orderedStyles[currentIndex - 1] ?? null}
        nextStyle={orderedStyles[currentIndex + 1] ?? null}
      />
    </main>
  )
}
