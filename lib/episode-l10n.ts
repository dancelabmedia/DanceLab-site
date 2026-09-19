/**
 * lib/episode-l10n.ts
 *
 * Couche de localisation centralisée pour les épisodes Dance Lab.
 *
 * Usage :
 *   const loc = getLocalizedEpisode(episode, locale)
 *   // loc.title, loc.description, loc.quote, loc.seoTitle, loc.seoDescription…
 *
 * Règles :
 *   • locale === 'fr'  → champs Ausha/legacy d'origine (jamais modifiés)
 *   • locale === 'en'  → traduction EN depuis data/episode-translations-en.ts
 *   • Fallback FR automatique si un champ EN est absent
 *   • Tous les champs techniques (IDs, URLs, durée, slug, pubDate…) restent inchangés
 *
 * Champs non traduits (toujours identiques en FR et EN) :
 *   number, slug, guest, duration, image, aushaImage, link, pubDate,
 *   youtubeId, spotifyEmbedUrl, fromRSS, instagramReelUrl, isYoutubeShort
 */

import type { EpisodeTranslationEN } from '@/data/episode-translations-en'
import type { Locale } from '@/lib/i18n/routing'

// ─── Interface d'entrée ───────────────────────────────────────────────────────

/**
 * Subset des champs éditoriaux nécessaires pour la localisation.
 * Compatible avec `Episode` (data/episodes.ts) et `UnifiedEpisode` (lib/episodes.ts).
 */
export interface EpisodeL10nInput {
  number: number
  title: string
  excerpt: string
  quote: string
  description: string
  /** Champs SEO (présents dans Episode, absents dans UnifiedEpisode → auto-calculés) */
  seoTitle?: string
  seoDescription?: string
  /** Chapitres (présents dans Episode, absents dans UnifiedEpisode → array vide) */
  chapters?: { time: string; title: string }[]
  /** Traductions EN pré-attachées (depuis lib/episodes.ts → UnifiedEpisode.en) */
  en?: EpisodeTranslationEN
}

// ─── Type de retour ───────────────────────────────────────────────────────────

export type LocalizedEpisodeContent = {
  /** Titre localisé (h1, cards, og:title) */
  title: string
  /** Résumé court localisé (≤ 220 chars — cards, og:description fallback) */
  excerpt: string
  /** Citation mise en avant localisée (blockquote héro) */
  quote: string
  /** Description complète localisée (texte brut, paragraphes séparés par \n\n) */
  description: string
  /** Titre SEO localisé */
  seoTitle: string
  /** Description SEO localisée */
  seoDescription: string
  /** Chapitres localisés */
  chapters: { time: string; title: string }[]
  /**
   * true si au moins un champ éditorial est affiché en FR alors que locale = 'en'
   * (utile pour les rapports de couverture et les avertissements développeur)
   */
  hasFrFallback: boolean
  /**
   * Liste des champs qui tombent en fallback FR (vide si couverture complète)
   */
  frFallbackFields: string[]
}

// ─── Helpers internes ─────────────────────────────────────────────────────────

function buildSeoTitle(title: string): string {
  return `${title} | Dance Lab`
}

// ─── Fonction principale ──────────────────────────────────────────────────────

/**
 * Retourne le contenu éditorial localisé d'un épisode.
 *
 * Tous les composants de la page épisode doivent utiliser cette fonction
 * plutôt que d'accéder directement aux champs de l'épisode.
 *
 * Compatible avec `Episode` (épisodes 1–121) et `UnifiedEpisode` (épisodes RSS ≥ 122).
 *
 * @param episode  - épisode (Episode ou UnifiedEpisode — les deux acceptés)
 * @param locale   - locale courante ('fr' | 'en')
 * @returns        contenu éditorial localisé avec métadonnées de couverture
 */
export function getLocalizedEpisode(
  episode: EpisodeL10nInput,
  locale: Locale,
): LocalizedEpisodeContent {
  const episodeChapters = episode.chapters ?? []

  // ── locale === 'fr' : données source, aucun overhead ─────────────────────────
  if (locale === 'fr') {
    return {
      title:            episode.title,
      excerpt:          episode.excerpt,
      quote:            episode.quote,
      description:      episode.description,
      seoTitle:         episode.seoTitle ?? buildSeoTitle(episode.title),
      seoDescription:   episode.seoDescription ?? episode.excerpt,
      chapters:         episodeChapters,
      hasFrFallback:    false,
      frFallbackFields: [],
    }
  }

  // ── locale === 'en' : traductions EN avec fallback FR ────────────────────────
  const enT = episode.en
  const frFallbackFields: string[] = []

  // Helpers inline pour tracer les fallbacks
  function enOrFr<T>(field: string, enVal: T | undefined, frVal: T): T {
    if (enVal !== undefined && enVal !== null && (typeof enVal !== 'string' || enVal !== '')) return enVal
    frFallbackFields.push(field)
    return frVal
  }

  const title       = enOrFr('title',       enT?.title,       episode.title)
  const excerpt     = enOrFr('excerpt',     enT?.excerpt,     episode.excerpt)
  const quote       = episode.quote
    ? enOrFr('quote', enT?.quote, episode.quote)
    : (enT?.quote ?? episode.quote)
  const description = episode.description
    ? enOrFr('description', enT?.description, episode.description)
    : (enT?.description ?? episode.description)

  // SEO : auto-calculé depuis les traductions EN
  const seoTitle       = enT?.seoTitle ?? buildSeoTitle(title)
  const seoDescription = enT?.seoDescription ?? excerpt

  // Chapitres : EN si traduits, FR en fallback
  const chapters = (enT?.chapters && enT.chapters.length > 0)
    ? enT.chapters
    : (() => {
        if (episodeChapters.length > 0) frFallbackFields.push('chapters')
        return episodeChapters
      })()

  return {
    title,
    excerpt,
    quote,
    description,
    seoTitle,
    seoDescription,
    chapters,
    hasFrFallback:    frFallbackFields.length > 0,
    frFallbackFields,
  }
}
