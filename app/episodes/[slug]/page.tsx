import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { existsSync, readdirSync } from "node:fs";
import path from "node:path";

import EpisodeAnimations from "./EpisodeAnimations";
import MobileEpisodeYouTube from "./MobileEpisodeYouTube";
import EpisodeImage from "../../../components/EpisodeImage";
import imageStyles from "../../../components/episode-image.module.css";
import { episodeExtras } from "../../../data/episode-extras";
import { episodeNumberFromImageName, findImagePresentation, resolveImageFrame } from "@/lib/episode-image-presentation";
import EpisodeInstagramReel from "../../../components/EpisodeInstagramReel";
import EpisodeShare from "../../../components/EpisodeShare";
import HistoryBackLink from "../../../components/HistoryBackLink";
import { episodes, type Episode } from "../../../data/episodes";
import { episodeTranslationsEN } from "../../../data/episode-translations-en";
import { getLocalizedEpisode } from "@/lib/episode-l10n";
import {
  getRecommendedEpisodes,
  getRecommendationEpisodeBySlug as getUnifiedEpisodeBySlug,
} from "@/lib/episode-recommendations.server";
import { SITE_URL } from "../../../data/site";
import {
  getEpisodeYoutubeUrl,
  type UnifiedEpisode,
} from "@/lib/episodes";
import { youtubeUrl, youtubeThumbnail } from "@/lib/youtube-rss";
import {
  TAG_LABEL,
  getEpisodeTags,
  keyToSlug,
} from "@/lib/episode-themes";
import { getPodcastArticleByEpisode } from "@/lib/podcast-articles";
import { requestLocale } from "@/lib/i18n/server";
import { uiText } from "@/data/i18n/messages";

// Rendu dynamique par requête : nécessaire pour lire la locale (cookie EN/FR) à chaque visite.
// Le cache des données RSS Ausha (fetch interne) reste actif 1h indépendamment.
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

const HEADER_IMAGE_DIR = "/images/les-invites-header";
const HEADER_IMAGE_FALLBACK = "/images/les-invites-header/imagetest.png";

function publicFileExists(publicPath: string) {
  return existsSync(path.join(process.cwd(), "public", publicPath.replace(/^\//, "")));
}

function getEpisodeCardImage(episode: Episode) {
  return episode.image;
}

function getEpisodeHeaderImage(episode: Episode) {
  const configuredHeader = episodeExtras[episode.number]?.headerImage;
  if (configuredHeader && publicFileExists(configuredHeader)) return configuredHeader;
  const imageName = episode.image.split("/").pop();
  const headerImage = imageName ? `${HEADER_IMAGE_DIR}/${imageName}` : null;

  if (headerImage && publicFileExists(headerImage)) return headerImage;
  return HEADER_IMAGE_FALLBACK;
}

function getEpisodeBySlug(slug: string) {
  return episodes.find((episode) => episode.slug === slug);
}

/**
 * Convertit n'importe quelle chaîne de date en format français JJ.MM.AAAA.
 *
 * Accepte :
 *   - ISO date     "2026-08-03"                        → "03.08.2026"
 *   - ISO datetime "2026-08-03T22:26:50Z"              → "03.08.2026"
 *   - RFC 2822     "Mon, 03 Aug 2026 22:26:50 +0000"   → "03.08.2026"
 *
 * En cas d'échec (date vide ou non parseable), retourne une chaîne vide.
 */
function formatEpisodeDate(date: string): string {
  if (!date) return "";

  // Format ISO YYYY-MM-DD (avec ou sans suffixe heure) — chemin rapide, sans new Date()
  const isoMatch = date.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    return `${day}.${month}.${year}`;
  }

  // Tout autre format : déléguer au moteur JS (RFC 2822, etc.)
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return "";
    const day   = String(d.getUTCDate()).padStart(2, "0");
    const month = String(d.getUTCMonth() + 1).padStart(2, "0");
    const year  = d.getUTCFullYear();
    return `${day}.${month}.${year}`;
  } catch {
    return "";
  }
}

/** Extrait l'identifiant vidéo YouTube depuis toute forme d'URL YouTube. */
function getYouTubeId(url: string | undefined): string | null {
  if (!url) return null;
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([a-zA-Z0-9_-]{11})/
  );
  return match?.[1] ?? null;
}

function splitContinuousDescription(text: string) {
  const sentences = text
    .split(/(?<=[.!?…])\s+(?=[A-ZÀ-ÖØ-Þ0-9«""])/u)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  if (sentences.length <= 1) {
    return [text];
  }

  const paragraphs: string[] = [];
  let currentParagraph = "";

  for (const sentence of sentences) {
    const nextParagraph = currentParagraph
      ? `${currentParagraph} ${sentence}`
      : sentence;

    if (currentParagraph && nextParagraph.length > 420) {
      paragraphs.push(currentParagraph);
      currentParagraph = sentence;
    } else {
      currentParagraph = nextParagraph;
    }
  }

  if (currentParagraph) {
    paragraphs.push(currentParagraph);
  }

  return paragraphs;
}

function getEpisodeDescriptionParagraphs(description: string) {
  const normalizedDescription = description
    .replace(/\r\n?/g, "\n")
    .replace(/[\u2028\u2029]/g, "\n")
    .trim();

  if (!normalizedDescription) {
    return [];
  }

  return normalizedDescription.split(/\n{2,}/).flatMap((block) => {
    const lines = block
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    if (lines.length > 1) {
      return lines;
    }

    return splitContinuousDescription(lines[0]);
  });
}

type EpisodeDescriptionBlock =
  | {
      type: "paragraph" | "callout" | "quote";
      text: string;
    }
  | {
      type: "list";
      items: string[];
    };

const descriptionListPattern = /^[➜➔→•]/u;
const descriptionSeparatorPattern = /^(?:[-─—_]\s*){3,}$/u;
const descriptionCalloutPattern =
  /^(?:à retenir|en résumé|pour résumer|la vérité|le plus important|ce que je retiens|son message est simple|conclusion)\b/iu;
const descriptionQuotePattern = /^(?:"[\s\S]+"|«[\s\S]+»|"[\s\S]+")$/u;
const inlineQuotePattern = /^(?:"[\s\S]+"|«[\s\S]+»|"[\s\S]+")$/u;

function getEpisodeDescriptionBlocks(paragraphs: string[]) {
  const blocks: EpisodeDescriptionBlock[] = [];
  let index = 0;

  while (index < paragraphs.length) {
    const paragraph = paragraphs[index];

    if (descriptionSeparatorPattern.test(paragraph.trim())) {
      index += 1;
      continue;
    }

    if (descriptionListPattern.test(paragraph)) {
      const items: string[] = [];

      while (
        index < paragraphs.length &&
        descriptionListPattern.test(paragraphs[index])
      ) {
        items.push(paragraphs[index]);
        index += 1;
      }

      blocks.push({ type: "list", items });
      continue;
    }

    const isBracketedCallout =
      paragraph.startsWith("[") && paragraph.endsWith("]");

    if (descriptionQuotePattern.test(paragraph)) {
      blocks.push({ type: "quote", text: paragraph });
    } else if (
      isBracketedCallout ||
      descriptionCalloutPattern.test(paragraph)
    ) {
      blocks.push({ type: "callout", text: paragraph });
    } else {
      blocks.push({ type: "paragraph", text: paragraph });
    }

    index += 1;
  }

  return blocks;
}

function renderInlineEditorialText(text: string) {
  const renderQuotedSegments = (value: string, keyPrefix: string) =>
    value
      .split(/("[^"]+"|«[^»]+»|"[^"]+")/gu)
      .filter((segment) => segment.length > 0)
      .map((segment, index) =>
        inlineQuotePattern.test(segment) ? (
          <span
            key={`${keyPrefix}-quote-${index}`}
            className="episode-description-inline-quote"
          >
            {segment}
          </span>
        ) : (
          segment
        ),
      );

  const colonIndex = text.indexOf(":");
  const characterAfterColon = text.charAt(colonIndex + 1);
  const hasEditorialPrefix =
    colonIndex >= 2 &&
    colonIndex <= 72 &&
    !text.slice(0, colonIndex).includes(".") &&
    !/[)(DPp]/u.test(characterAfterColon);

  if (!hasEditorialPrefix) {
    return renderQuotedSegments(text, "text");
  }

  return (
    <>
      <strong className="episode-description-emphasis">
        {renderQuotedSegments(text.slice(0, colonIndex + 1), "prefix")}
      </strong>
      {renderQuotedSegments(text.slice(colonIndex + 1), "content")}
    </>
  );
}

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return episodes.map((episode) => ({
    slug: episode.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const locale = await requestLocale();
  const episode = getEpisodeBySlug(slug);

  // Épisode statique introuvable → essayer le flux RSS
  if (!episode) {
    const unified = await getUnifiedEpisodeBySlug(slug);
    if (!unified) return { title: "Episode not found | Dance Lab" };
    const loc = getLocalizedEpisode(unified, locale);
    const { title, excerpt, seoTitle, seoDescription: seoDesc } = loc;
    const socialImage = unified.number === 127
      ? "/images/les-invites-header/waabee127.png"
      : unified.aushaImage || unified.image;
    const imageUrl = socialImage.startsWith("http")
      ? socialImage
      : new URL(socialImage, SITE_URL).toString();
    return {
      title: seoTitle,
      description: seoDesc,
      openGraph: {
        title: seoTitle,
        description: seoDesc,
        url: new URL(`/episodes/${unified.slug}`, SITE_URL).toString(),
        images: [{ url: imageUrl, alt: `${title} — ${unified.guest}` }],
        type: "article",
      },
      twitter: {
        card: "summary_large_image",
        title: seoTitle,
        description: seoDesc,
        images: [imageUrl],
      },
    };
  }

  const loc = getLocalizedEpisode({ ...episode, en: episodeTranslationsEN[episode.number] }, locale);
  const { title, seoTitle, seoDescription: seoDesc } = loc;

  const episodeUrl = new URL(`/episodes/${episode.slug}`, SITE_URL).toString();
  const imageUrl = new URL(getEpisodeHeaderImage(episode), SITE_URL).toString();

  return {
    title: seoTitle,
    description: seoDesc,
    alternates: {
      canonical: episodeUrl,
    },
    openGraph: {
      title: seoTitle,
      description: seoDesc,
      url: episodeUrl,
      images: [
        {
          url: imageUrl,
          alt: `${title} — ${episode.guest}`,
        },
      ],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: seoTitle,
      description: seoDesc,
      images: [imageUrl],
    },
  };
}

// THEME_DISPLAY remplacé par TAG_LABEL importé depuis lib/episode-themes.ts

export default async function EpisodePage({ params }: PageProps) {
  const { slug } = await params;
  const locale = await requestLocale();
  const t = (text: string) => uiText(locale, text);
  const isEN = locale === 'en';
  const episode = getEpisodeBySlug(slug);

  // ── Épisode RSS (nouveau, ≥ 122) ────────────────────────────────────────────
  if (!episode) {
    const unified = await getUnifiedEpisodeBySlug(slug);
    if (!unified) notFound();
    return <RssEpisodePage unified={unified!} />;
  }

  // ── Localisation centralisée (EN avec fallback FR) ───────────────────────────
  const loc = getLocalizedEpisode({ ...episode, en: episodeTranslationsEN[episode.number] }, locale);
  const { title: displayTitle, quote: displayQuote, description: displayDesc, chapters: displayChapters } = loc;

  const similarEpisodes = await getRecommendedEpisodes(episode.number);
  const episodeUrl = new URL(`/episodes/${episode.slug}`, SITE_URL).toString();
  const headerImage = getEpisodeHeaderImage(episode);
  const headerPresentation = findImagePresentation(episodeExtras[episode.number]?.imagePresentations, headerImage);
  const mobileHeaderPosition = episodeExtras[episode.number]?.mobileHeroPosition
    ?? headerPresentation?.mobile?.objectPosition
    ?? '86% 30%';
  const descriptionParagraphs = getEpisodeDescriptionParagraphs(displayDesc);
  const descriptionBlocks = getEpisodeDescriptionBlocks(descriptionParagraphs);

  // Identifiant YouTube :
  // 1. URL statique dans episodes.ts → getYouTubeId()
  // 2. Auto-match YouTube RSS ou override manuel dans episode-extras.ts
  const unified = await getUnifiedEpisodeBySlug(slug);
  const youtubeId = getYouTubeId(episode.youtube) ?? unified?.youtubeId ?? null;

  // Article magazine associé à cet épisode (généré automatiquement ou existant)
  const associatedArticle = unified?.number ? getPodcastArticleByEpisode(unified.number) : null
  const articleSlug = associatedArticle?.status === 'publie' || associatedArticle?.status === 'programme'
    ? associatedArticle.article.slug
    : null
  const youtubeHref = youtubeId
    ? (episode.youtube || youtubeUrl(youtubeId))
    : null;

  // Tags thématiques — détectés automatiquement depuis le texte de l'épisode (max 6)
  const episodeTagKeys = getEpisodeTags(
    [episode.title, episode.excerpt, episode.description].join(' '), 6
  );

  return (
    <main className="ep-page">

      {/* ══════════════════════════════════════
            HERO — image plein cadre, texte gauche
        ══════════════════════════════════════ */}
        <section className="ep-hero">
          {/* Couche sticky : image + dégradé restent fixes pendant le scroll */}
          <div
            className={`ep-hero-sticky-bg ${headerPresentation ? imageStyles.heroCanvas : ''}`}
            style={{ '--ep-hero-mobile-position': mobileHeaderPosition } as CSSProperties}
          >
            <EpisodeImage
              episodeNumber={episode.number}
              className="ep-hero-img"
              src={headerImage}
              alt={episode.guest}
            />
            {/* Dégradé horizontal : sombre à gauche → transparent à droite */}
            <div className="ep-hero-shade" aria-hidden="true" />

            {/* ── Lecteur YouTube révélé au scroll ── */}
            {youtubeId ? (
              <div className="ep-hero-youtube" id="ep-hero-youtube">
                <a
                  href={youtubeHref!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ep-youtube-link"
                  aria-label={isEN ? `Watch "${displayTitle}" on YouTube` : `Regarder « ${displayTitle} » sur YouTube`}
                >
                  <div className="ep-youtube-thumb-wrap">
                    <EpisodeImage
                      episodeNumber={episode.number}
                      src={`https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`}
                      alt={episode.title}
                      className="ep-youtube-thumb"
                      loading="lazy"
                    />
                    {/* Bouton Play YouTube officiel */}
                    <div className="ep-youtube-play-btn" aria-hidden="true">
                      <svg viewBox="0 0 68 48" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M66.52 7.74a8.23 8.23 0 0 0-5.8-5.84C55.68 0 34 0 34 0S12.32 0 7.28 1.9a8.23 8.23 0 0 0-5.8 5.84C0 12.8 0 24 0 24s0 11.2 1.48 16.26a8.23 8.23 0 0 0 5.8 5.84C12.32 48 34 48 34 48s21.68 0 26.72-1.9a8.23 8.23 0 0 0 5.8-5.84C68 35.2 68 24 68 24s0-11.2-1.48-16.26z"
                          fill="rgba(0,0,0,.72)"
                        />
                        <path d="M27 34 45 24 27 14v20z" fill="#fff" />
                      </svg>
                    </div>
                  </div>
                  <div className="ep-youtube-bar">
                    <span className="ep-youtube-logo" aria-hidden="true">
                      {/* Wordmark YouTube simplifié */}
                      <svg viewBox="0 0 90 20" xmlns="http://www.w3.org/2000/svg" height="14">
                        <text y="16" fontSize="18" fontFamily="inherit" fontWeight="700" fill="#fff">YouTube</text>
                      </svg>
                    </span>
                    <span className="ep-youtube-cta">{t("Regarder l'épisode complet")}</span>
                  </div>
                </a>
              </div>
            ) : null}
          </div>
          {/* Texte posé sur la partie gauche assombrie — défile normalement */}
          <div className="ep-hero-content">
            <HistoryBackLink className="ep-back" fallbackHref="/ecouter">
              {t('← Tous les épisodes')}
            </HistoryBackLink>
            <p className="ep-kicker">
              {t('Épisode')} {episode.number}
            </p>
            <h1>{displayTitle}</h1>
            <p className="ep-guest">
              {episode.guest}
            </p>
            <div className="ep-meta">
              <span className="ep-meta-duration">
                <svg className="ep-meta-icon" viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="8" cy="8" r="6.5"/>
                  <polyline points="8,4.5 8,8.5 10.5,10.5"/>
                </svg>
                {episode.duration}
              </span>
              <time className="ep-meta-date" dateTime={episode.publishedAt}>{formatEpisodeDate(episode.publishedAt)}</time>
              {episode.tags[0] ? <span className="ep-meta-tag">{episode.tags[0]}</span> : null}
            </div>
            <div className="ep-actions">
              {episode.link ? <a href={episode.link} target="_blank" rel="noopener noreferrer">{t("Choisis ta plateforme d'écoute")}</a> : null}
            </div>
          </div>
          {youtubeId ? (
            <MobileEpisodeYouTube
              youtubeId={youtubeId}
              title={displayTitle}
              watchLabel={t("Regarder l'épisode complet")}
            />
          ) : null}
        </section>

        {/* ══════════════════════════════════════════════════════
            CORPS — grille 3 cols
            [col1 row1]   Citation
            [col2 row1]   Description complète (article)
            [col3 rows1+] Sidebar sticky
            [col1-2 row2] Lecteur audio
        ══════════════════════════════════════════════════════ */}
        <section className="ep-body">
          <div className="ep-body-grid">

            {/* ── [col1 row1] Citation ── */}
            <div className="ep-col-quote" data-ep-reveal>
              {displayQuote ? (
                <blockquote className="ep-big-quote">
                  <span className="ep-big-quote-mark" aria-hidden="true">"</span>
                  {displayQuote}
                </blockquote>
              ) : null}
            </div>

            {/* ── [col2 row1] Description complète ── */}
            <div className="ep-col-description" data-ep-reveal>
              <article className="ep-article">
                <div className="ep-description">
                  {descriptionBlocks.map((block, blockIndex) => {
                    if (block.type === "list") {
                      return (
                        <ul
                          key={`${episode.slug}-description-${blockIndex}`}
                          className="ep-desc-list"
                        >
                          {block.items.map((item, itemIndex) => (
                            <li key={`${episode.slug}-description-${blockIndex}-${itemIndex}`}>
                              {renderInlineEditorialText(item.slice(1))}
                            </li>
                          ))}
                        </ul>
                      );
                    }

                    const isLead = blockIndex === 0;
                    const isClosing = blockIndex === descriptionBlocks.length - 1;

                    if (block.type === "quote") {
                      return (
                        <blockquote
                          key={`${episode.slug}-description-${blockIndex}`}
                          className="ep-desc-quote"
                        >
                          {renderInlineEditorialText(block.text)}
                        </blockquote>
                      );
                    }

                    if (block.type === "callout") {
                      return (
                        <p
                          key={`${episode.slug}-description-${blockIndex}`}
                          className="ep-desc-callout"
                        >
                          {renderInlineEditorialText(block.text)}
                        </p>
                      );
                    }

                    return (
                      <p
                        key={`${episode.slug}-description-${blockIndex}`}
                        className={[
                          "ep-desc-p",
                          isLead ? "ep-desc-lead" : "",
                          isClosing ? "ep-desc-closing" : "",
                        ].filter(Boolean).join(" ")}
                      >
                        {renderInlineEditorialText(block.text)}
                      </p>
                    );
                  })}
                </div>

                {episodeTagKeys.length > 0 ? (
                  <div className="ep-topics-block">
                    <p className="ep-topics-label">{t('Dans cet épisode')}</p>
                    <div className="ep-topics-pills">
                      {episodeTagKeys.map((key) => (
                        <Link
                          key={key}
                          href={`/themes/${keyToSlug(key)}`}
                          className="ep-topic-pill"
                        >
                          {TAG_LABEL[key] ?? key}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : null}

                {displayChapters.length > 0 ? (
                  <div className="ep-chapters">
                    <h2 className="ep-section-h2">{t('Chapitres')}</h2>
                    <ol className="ep-chapters-list">
                      {displayChapters.map((chapter) => (
                        <li key={`${chapter.time}-${chapter.title}`}>
                          <span>{chapter.time}</span>
                          <strong>{chapter.title}</strong>
                        </li>
                      ))}
                    </ol>
                  </div>
                ) : null}
              </article>
            </div>

            {/* ── [col3 rows1+] Sidebar sticky ── */}
            <aside className="ep-col-sidebar" data-ep-reveal>
              <div className="ep-sidebar-card">
                {/* Lien vers l'article magazine associé */}
                {articleSlug && (
                  <div className="ep-sidebar-section">
                    <h3 className="ep-sidebar-h3">{t('À lire aussi')}</h3>
                    <Link
                      href={`/decouvrir/articles/${articleSlug}`}
                      className="ep-sidebar-article-link"
                    >
                      <span className="ep-sidebar-article-icon" aria-hidden="true">📖</span>
                      <span>{t("Lire l'article sur cet épisode")}</span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </Link>
                  </div>
                )}
                <div className="ep-sidebar-section">
                  <h3 className="ep-sidebar-h3">{t('Partager')}</h3>
                  <EpisodeShare title={episode.title} url={episodeUrl} />
                </div>
                {similarEpisodes.length > 0 ? (
                  <div className="ep-sidebar-section">
                    <h3 className="ep-sidebar-h3">{t('Épisodes similaires')}</h3>
                    <div className="ep-sidebar-similar">
                      {similarEpisodes.map((item) => (
                        <Link key={item.slug} href={`/episodes/${item.slug}`} className="ep-sidebar-ep">
                          <EpisodeImage episodeNumber={item.number} src={item.image} alt={item.guest} className="ep-sidebar-ep-img" />
                          <div className="ep-sidebar-ep-body">
                            <span>{t('Épisode')} {item.number}</span>
                            <strong>{item.title}</strong>
                            <p className="ep-sidebar-ep-guest">{item.guest}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
              {unified?.instagramReelUrl ? (
                <EpisodeInstagramReel instagramReelUrl={unified.instagramReelUrl} />
              ) : null}
            </aside>

            {/* ── [col1-2 row2] Lecteur audio ── */}
            {episode.spotifyEmbedUrl ? (
              <div className="ep-col-player" data-ep-reveal>
                <iframe
                  title={`Lecteur Spotify — ${episode.title}`}
                  src={episode.spotifyEmbedUrl}
                  width="100%"
                  height="152"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                  className="ep-player-iframe"
                />
              </div>
            ) : null}

          </div>
        </section>

        <EpisodeAnimations />
      </main>
  );
}

// ─── Page pour les épisodes RSS (≥ 122) ──────────────────────────────────────

async function RssEpisodePage({ unified }: { unified: UnifiedEpisode }) {
  const locale = await requestLocale();
  const t = (text: string) => uiText(locale, text);
  const isEN = locale === 'en';

  // Localisation centralisée (EN avec fallback FR)
  const loc = getLocalizedEpisode(unified, locale);
  const { title: displayTitle, quote: displayQuote, description: displayDesc } = loc;

  const youtubeId    = unified.youtubeId ?? null;
  const isShort      = unified.isYoutubeShort ?? false;
  const youtubeHref  = youtubeId
    ? (isShort
        ? `https://youtube.com/shorts/${youtubeId}`
        : youtubeUrl(youtubeId))
    : null;
  const episodeUrl   = new URL(`/episodes/${unified.slug}`, SITE_URL).toString();

  // Épisodes similaires — même logique que les pages statiques
  const similarEpisodes = await getRecommendedEpisodes(unified.number);

  // Hero image : priorité les-invites-header → les-invites → CDN Ausha
  const heroImage = (() => {
    const configuredHeader = episodeExtras[unified.number]?.headerImage;
    if (configuredHeader && publicFileExists(configuredHeader)) return configuredHeader;
    // 1. Cherche dans les-invites-header (même convention de nommage)
    try {
      const headerDir   = path.join(process.cwd(), 'public', 'images', 'les-invites-header');
      const headerFiles = readdirSync(headerDir);
      const headerMatch = headerFiles.find((f) =>
        episodeNumberFromImageName(f) === unified.number
      );
      if (headerMatch) return `/images/les-invites-header/${headerMatch}`;
    } catch { /* dossier absent */ }
    // 2. Image d'encart (les-invites ou override manuel) déjà résolue dans UnifiedEpisode.image
    if (unified.image && !unified.image.startsWith('http')) return unified.image;
    // 3. Fallback CDN Ausha
    return unified.aushaImage || unified.image;
  })();
  const heroPresentation = findImagePresentation(episodeExtras[unified.number]?.imagePresentations, heroImage);
  const mobileHeroPosition = episodeExtras[unified.number]?.mobileHeroPosition
    ?? (heroPresentation?.mobile?.objectPosition ? resolveImageFrame(heroPresentation, 'mobile').objectPosition : undefined)
    ?? '86% 30%';

  // Tags thématiques automatiques (max 6) — toujours sur le texte FR (meilleur matching)
  const rssTagKeys = getEpisodeTags(
    [unified.title, unified.excerpt, unified.description].join(' '), 6
  );

  // Description : EN si disponible, sinon texte complet RSS (fallback sur l'excerpt si absent)
  const descriptionParagraphs = getEpisodeDescriptionParagraphs(displayDesc || unified.excerpt);
  const descriptionBlocks     = getEpisodeDescriptionBlocks(descriptionParagraphs);

  return (
    <>
      <main className="ep-page">

        {/* HERO */}
        <section className="ep-hero">
          <div
            className={`ep-hero-sticky-bg ${heroPresentation ? imageStyles.heroCanvas : ''}`}
            style={{ '--ep-hero-mobile-position': mobileHeroPosition } as CSSProperties}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <EpisodeImage
              episodeNumber={unified.number}
              className="ep-hero-img"
              src={heroImage}
              alt={unified.guest}
            />
            <div className="ep-hero-shade" aria-hidden="true" />

            {/* Lecteur YouTube */}
            {youtubeId ? (
              <div className={`ep-hero-youtube${isShort ? ' ep-hero-youtube--short' : ''}`} id="ep-hero-youtube">
                <a
                  href={youtubeHref!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ep-youtube-link"
                  aria-label={isEN ? `Watch "${displayTitle}" on YouTube` : `Regarder « ${displayTitle} » sur YouTube`}
                >
                  <div className={`ep-youtube-thumb-wrap${isShort ? ' ep-youtube-thumb-wrap--short' : ''}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <EpisodeImage
                      episodeNumber={unified.number}
                      src={
                        isShort
                          ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`
                          : `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`
                      }
                      alt={unified.title}
                      className="ep-youtube-thumb"
                      loading="lazy"
                    />
                    <div className="ep-youtube-play-btn" aria-hidden="true">
                      <svg viewBox="0 0 68 48" xmlns="http://www.w3.org/2000/svg">
                        <path d="M66.52 7.74a8.23 8.23 0 0 0-5.8-5.84C55.68 0 34 0 34 0S12.32 0 7.28 1.9a8.23 8.23 0 0 0-5.8 5.84C0 12.8 0 24 0 24s0 11.2 1.48 16.26a8.23 8.23 0 0 0 5.8 5.84C12.32 48 34 48 34 48s21.68 0 26.72-1.9a8.23 8.23 0 0 0 5.8-5.84C68 35.2 68 24 68 24s0-11.2-1.48-16.26z" fill="rgba(0,0,0,.72)" />
                        <path d="M27 34 45 24 27 14v20z" fill="#fff" />
                      </svg>
                    </div>
                  </div>
                  <div className="ep-youtube-bar">
                    <span className="ep-youtube-logo" aria-hidden="true">
                      <svg viewBox="0 0 90 20" xmlns="http://www.w3.org/2000/svg" height="14">
                        <text y="16" fontSize="18" fontFamily="inherit" fontWeight="700" fill="#fff">YouTube</text>
                      </svg>
                    </span>
                    <span className="ep-youtube-cta">
                      {isShort ? t('Regarder le Short') : t("Regarder l'épisode complet")}
                    </span>
                  </div>
                </a>
              </div>
            ) : null}
          </div>

          <div className="ep-hero-content">
            <HistoryBackLink className="ep-back" fallbackHref="/ecouter">
              {t('← Tous les épisodes')}
            </HistoryBackLink>
            <p className="ep-kicker">{t('Épisode')} {unified.number}</p>
            <h1>{displayTitle}</h1>
            <p className="ep-guest">{unified.guest}</p>
            <div className="ep-meta">
              <span className="ep-meta-duration">
                <svg className="ep-meta-icon" viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="8" cy="8" r="6.5"/>
                  <polyline points="8,4.5 8,8.5 10.5,10.5"/>
                </svg>
                {unified.duration}
              </span>
              {unified.pubDate ? (
                <time className="ep-meta-date" dateTime={unified.pubDate}>
                  {formatEpisodeDate(unified.pubDate)}
                </time>
              ) : null}
            </div>
            <div className="ep-actions">
              <a href={unified.link} target="_blank" rel="noopener noreferrer">{t("Choisis ta plateforme d'écoute")}</a>
            </div>
          </div>
          {youtubeId ? (
            <MobileEpisodeYouTube
              youtubeId={youtubeId}
              title={displayTitle}
              isShort={isShort}
              watchLabel={isShort ? t('Regarder le Short') : t("Regarder l'épisode complet")}
            />
          ) : null}
        </section>

        {/* CORPS */}
        <section className="ep-body">
          <div className="ep-body-grid">

            {/* Citation */}
            <div className="ep-col-quote" data-ep-reveal>
              {displayQuote ? (
                <blockquote className="ep-big-quote">
                  <span className="ep-big-quote-mark" aria-hidden="true">&ldquo;</span>
                  {displayQuote}
                </blockquote>
              ) : null}
            </div>

            {/* Description */}
            <div className="ep-col-description" data-ep-reveal>
              <article className="ep-article">
                <div className="ep-description">
                  {descriptionBlocks.map((block, blockIndex) => {
                    if (block.type === 'list') {
                      return (
                        <ul key={`rss-desc-${blockIndex}`} className="ep-desc-list">
                          {block.items.map((item, i) => (
                            <li key={i}>{renderInlineEditorialText(item.slice(1))}</li>
                          ))}
                        </ul>
                      );
                    }
                    const isLead    = blockIndex === 0;
                    const isClosing = blockIndex === descriptionBlocks.length - 1;
                    if (block.type === 'quote') {
                      return (
                        <blockquote key={`rss-desc-${blockIndex}`} className="ep-desc-quote">
                          {renderInlineEditorialText(block.text)}
                        </blockquote>
                      );
                    }
                    if (block.type === 'callout') {
                      return (
                        <p key={`rss-desc-${blockIndex}`} className="ep-desc-callout">
                          {renderInlineEditorialText(block.text)}
                        </p>
                      );
                    }
                    return (
                      <p
                        key={`rss-desc-${blockIndex}`}
                        className={['ep-desc-p', isLead ? 'ep-desc-lead' : '', isClosing ? 'ep-desc-closing' : ''].filter(Boolean).join(' ')}
                      >
                        {renderInlineEditorialText(block.text)}
                      </p>
                    );
                  })}
                </div>

                {rssTagKeys.length > 0 ? (
                  <div className="ep-topics-block">
                    <p className="ep-topics-label">{t('Dans cet épisode')}</p>
                    <div className="ep-topics-pills">
                      {rssTagKeys.map((key) => (
                        <Link
                          key={key}
                          href={`/themes/${keyToSlug(key)}`}
                          className="ep-topic-pill"
                        >
                          {TAG_LABEL[key] ?? key}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : null}
              </article>
            </div>

            {/* Sidebar */}
            <aside className="ep-col-sidebar" data-ep-reveal>
              <div className="ep-sidebar-card">
                <div className="ep-sidebar-section">
                  <h3 className="ep-sidebar-h3">{t('Partager')}</h3>
                  <EpisodeShare title={unified.title} url={episodeUrl} />
                </div>
                {similarEpisodes.length > 0 ? (
                  <div className="ep-sidebar-section">
                    <h3 className="ep-sidebar-h3">{t('Épisodes similaires')}</h3>
                    <div className="ep-sidebar-similar">
                      {similarEpisodes.map((item) => (
                        <Link key={item.slug} href={`/episodes/${item.slug}`} className="ep-sidebar-ep">
                          <EpisodeImage episodeNumber={item.number} src={item.image} alt={item.guest} className="ep-sidebar-ep-img" />
                          <div className="ep-sidebar-ep-body">
                            <span>{t('Épisode')} {item.number}</span>
                            <strong>{item.title}</strong>
                            <p className="ep-sidebar-ep-guest">{item.guest}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
              {unified.instagramReelUrl ? (
                <EpisodeInstagramReel instagramReelUrl={unified.instagramReelUrl} />
              ) : null}
            </aside>

            {/* Lecteur Spotify — même design que les épisodes statiques */}
            {unified.spotifyEmbedUrl ? (
              <div className="ep-col-player" data-ep-reveal>
                <iframe
                  title={`Lecteur Spotify — ${unified.title}`}
                  src={unified.spotifyEmbedUrl}
                  width="100%"
                  height="152"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                  className="ep-player-iframe"
                />
              </div>
            ) : null}

          </div>
        </section>

        <EpisodeAnimations />
      </main>
    </>
  );
}
