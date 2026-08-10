import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { existsSync, readdirSync } from "node:fs";
import path from "node:path";

import EpisodeAnimations from "./EpisodeAnimations";
import EpisodeShare from "../../../components/EpisodeShare";
import HistoryBackLink from "../../../components/HistoryBackLink";
import { episodes, type Episode } from "../../../data/episodes";
import { SITE_URL } from "../../../data/site";
import {
  getEpisodeBySlug as getUnifiedEpisodeBySlug,
  getEpisodeYoutubeUrl,
  type UnifiedEpisode,
} from "@/lib/episodes";
import { youtubeUrl, youtubeThumbnail } from "@/lib/youtube-rss";

// ISR : les nouveaux épisodes (≥ 122) sont rendus dynamiquement et mis en cache 1h
export const revalidate = 3600;
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
  const imageName = episode.image.split("/").pop();
  const headerImage = imageName ? `${HEADER_IMAGE_DIR}/${imageName}` : null;

  if (headerImage && publicFileExists(headerImage)) return headerImage;
  return HEADER_IMAGE_FALLBACK;
}

function getEpisodeBySlug(slug: string) {
  return episodes.find((episode) => episode.slug === slug);
}

function formatEpisodeDate(date: string) {
  const [year, month, day] = date.split("-");

  return year && month && day ? `${day}.${month}.${year}` : date;
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

// ─── Similarity algorithm ──────────────────────────────────────────────────
// Tags are empty in the data, so we derive themes from free text fields.
// Each cluster is [themeKey, keywords[]]. A keyword match anywhere in the
// combined episode text scores one point for that theme.
const THEME_CLUSTERS: [string, string[]][] = [
  ['heels',         ['heels', 'talons', 'féminité', 'féminin', 'sensualité', 'sensuel']],
  ['transmission',  ['transmission', 'transmet', 'enseign', 'pédagogie', 'cours de danse', 'professeur', 'apprendre', 'formation']],
  ['sante_mentale', ['santé mentale', 'burn-out', 'burnout', 'dépression', 'anxiété', 'bien-être', 'résilience', 'reconstruction']],
  ['harcelement',   ['harcèlement', 'toxicité', 'toxique', 'manipulation', 'hypocrisie', 'bully', 'violenc']],
  ['blessures',     ['blessure', 'kiné', 'kinésithérapeute', 'blesser', 'récupération', 'échauffement', 'prévention', 'blessé']],
  ['corps',         ['corps', 'physique', 'athlète', 'préparation physique', 'anatomie', 'proprioception']],
  ['carriere',      ['carrière', 'contrat', 'droits', 'agent', 'casting', 'intermittence', 'vivre de la danse', 'gagner sa vie', 'précarité']],
  ['maternite',     ['maternité', 'mère', 'grossesse', 'maternel', 'enfant']],
  ['krump',         ['krump', 'krumper', 'krumping']],
  ['hip_hop',       ['hip-hop', 'hip hop', 'battle', 'breakdance', 'breaking', 'b-boy', 'b-girl', 'popping', 'locking', 'urbain']],
  ['waacking',      ['waacking', 'waack', 'punking']],
  ['contemporain',  ['contemporain', 'danse contemporaine', 'ballet contemporain']],
  ['entrepreneuriat',['entreprise', 'créer une école', 'école de danse', 'lancer', 'studio', 'structure', 'projet entrepreneurial']],
  ['argent',        ['argent', 'salaire', 'revenu', 'financement', 'économi', 'pauvreté', 'richesse']],
  ['reseaux',       ['réseaux sociaux', 'instagram', 'tiktok', 'youtube', 'contenu', 'communauté', 'audience', 'visibilité']],
  ['identite',      ['identité', 'légitimité', 'confiance en soi', 'valeur', 'qui suis-je', 'se définir']],
  ['musicalite',    ['musicalité', 'groove', 'rythme', 'ressentir la musique', 'écoute musicale']],
  ['scene',         ['scène', 'spectacle', 'plateau', 'représentation', 'performance scénique']],
  ['international', ['international', 'tour du monde', 'pays', 'étranger', 'tournée internationale']],
  ['choreo',        ['chorégraphe', 'chorégraphie', 'composition', 'écriture chorégraphique']],
  ['jazz',          ['jazz', 'jazz funk', 'comédie musicale']],
  ['afro',          ['afro', 'afrodance', 'afrobeats']],
  ['classique',     ['classique', 'ballet', 'danse classique']],
  ['longevite',     ['longévité', 'durer', 'reconversion', 'vieillir en danse', 'fin de carrière']],
  ['creation',      ['création', 'créativité', 'processus créatif', 'expérimentation']],
  ['droits',        ['droits des artistes', 'statut d\'artiste', 'protection sociale', 'syndicat']],
  ['confiance',     ['confiance en soi', 'doute', 'estime de soi', 'imposture', 'syndrome de l\'imposteur']],
  ['inclusion',     ['inclusion', 'diversité', 'représentation', 'minorité', 'discrimination']],
]

function getEpisodeThemes(episode: Episode): Set<string> {
  const text = [
    episode.title,
    episode.excerpt,
    episode.description,
    episode.seoDescription,
    episode.role,
    episode.category,
    ...(episode.tags ?? []),
  ].join(' ').toLowerCase()

  const themes = new Set<string>()
  for (const [theme, keywords] of THEME_CLUSTERS) {
    if (keywords.some((kw) => text.includes(kw.toLowerCase()))) {
      themes.add(theme)
    }
  }
  return themes
}

function getSimilarEpisodes(currentSlug: string): Episode[] {
  const current = episodes.find((ep) => ep.slug === currentSlug)
  if (!current) return []

  const currentThemes = getEpisodeThemes(current)

  const scored = episodes
    .filter((ep) => ep.slug !== currentSlug)
    .map((ep) => {
      const epThemes = getEpisodeThemes(ep)
      let score = 0
      for (const theme of currentThemes) {
        if (epThemes.has(theme)) score++
      }
      return { episode: ep, score }
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || b.episode.number - a.episode.number)

  const result = scored.slice(0, 3).map(({ episode }) => episode)

  // Fallback: fill with recent episodes if not enough thematic matches
  if (result.length < 3) {
    const extra = episodes
      .filter((ep) => ep.slug !== currentSlug && !result.some((r) => r.slug === ep.slug))
      .slice(0, 3 - result.length)
    result.push(...extra)
  }

  return result
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
  const episode = getEpisodeBySlug(slug);

  // Épisode statique introuvable → essayer le flux RSS
  if (!episode) {
    const unified = await getUnifiedEpisodeBySlug(slug);
    if (!unified) return { title: "Épisode introuvable | Dance Lab" };
    const imageUrl = unified.aushaImage || unified.image;
    return {
      title: `${unified.title} — Dance Lab`,
      description: unified.excerpt,
      openGraph: {
        title: `${unified.title} — Dance Lab`,
        description: unified.excerpt,
        url: new URL(`/episodes/${unified.slug}`, SITE_URL).toString(),
        images: [{ url: imageUrl, alt: `${unified.title} — ${unified.guest}` }],
        type: "article",
      },
      twitter: {
        card: "summary_large_image",
        title: `${unified.title} — Dance Lab`,
        description: unified.excerpt,
        images: [imageUrl],
      },
    };
  }

  const episodeUrl = new URL(`/episodes/${episode.slug}`, SITE_URL).toString();
  const imageUrl = new URL(getEpisodeHeaderImage(episode), SITE_URL).toString();

  return {
    title: episode.seoTitle,
    description: episode.seoDescription,
    alternates: {
      canonical: episodeUrl,
    },
    openGraph: {
      title: episode.seoTitle,
      description: episode.seoDescription,
      url: episodeUrl,
      images: [
        {
          url: imageUrl,
          alt: `${episode.title} — ${episode.guest}`,
        },
      ],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: episode.seoTitle,
      description: episode.seoDescription,
      images: [imageUrl],
    },
  };
}

const THEME_DISPLAY: Record<string, string> = {
  heels:          'Danse heels',
  transmission:   'Transmission & pédagogie',
  sante_mentale:  'Santé mentale',
  harcelement:    'Harcèlement',
  blessures:      'Blessures & prévention',
  corps:          'Corps & physique',
  carriere:       'Carrière artistique',
  maternite:      'Maternité',
  krump:          'Krump',
  hip_hop:        'Hip-hop & battle',
  waacking:       'Waacking',
  contemporain:   'Danse contemporaine',
  entrepreneuriat:'Entrepreneuriat',
  argent:         'Argent & revenus',
  reseaux:        'Réseaux sociaux',
  identite:       'Identité & légitimité',
  musicalite:     'Musicalité',
  scene:          'Scène & performance',
  international:  'International',
  choreo:         'Chorégraphie',
  jazz:           'Jazz & comédie musicale',
  afro:           'Afro dance',
  classique:      'Ballet classique',
  longevite:      'Longévité & reconversion',
  creation:       'Processus créatif',
  droits:         'Droits des artistes',
  confiance:      'Confiance en soi',
  inclusion:      'Inclusion & diversité',
}

export default async function EpisodePage({ params }: PageProps) {
  const { slug } = await params;
  const episode = getEpisodeBySlug(slug);

  // ── Épisode RSS (nouveau, ≥ 122) ────────────────────────────────────────────
  if (!episode) {
    const unified = await getUnifiedEpisodeBySlug(slug);
    if (!unified) notFound();
    return <RssEpisodePage unified={unified!} />;
  }

  const similarEpisodes = getSimilarEpisodes(episode.slug);
  const episodeUrl = new URL(`/episodes/${episode.slug}`, SITE_URL).toString();
  const headerImage = getEpisodeHeaderImage(episode);
  const descriptionParagraphs = getEpisodeDescriptionParagraphs(episode.description);
  const descriptionBlocks = getEpisodeDescriptionBlocks(descriptionParagraphs);

  // Identifiant YouTube :
  // 1. URL statique dans episodes.ts → getYouTubeId()
  // 2. Auto-match YouTube RSS ou override manuel dans episode-extras.ts
  const unified = await getUnifiedEpisodeBySlug(slug);
  const youtubeId = getYouTubeId(episode.youtube) ?? unified?.youtubeId ?? null;
  const youtubeHref = youtubeId
    ? (episode.youtube || youtubeUrl(youtubeId))
    : null;

  // Points abordés — union des tags éditoriaux et des thèmes détectés
  const matchedThemes = getEpisodeThemes(episode);
  const themeLabels = [...matchedThemes].map((t) => THEME_DISPLAY[t]).filter(Boolean);
  const topicsList = [...new Set([...episode.tags, ...themeLabels])].slice(0, 10);

  return (
    <main className="ep-page">

      {/* ══════════════════════════════════════
            HERO — image plein cadre, texte gauche
        ══════════════════════════════════════ */}
        <section className="ep-hero">
          {/* Couche sticky : image + dégradé restent fixes pendant le scroll */}
          <div className="ep-hero-sticky-bg">
            <img
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
                  aria-label={`Regarder « ${episode.title} » sur YouTube`}
                >
                  <div className="ep-youtube-thumb-wrap">
                    <img
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
                    <span className="ep-youtube-cta">Regarder l&apos;épisode complet</span>
                  </div>
                </a>
              </div>
            ) : null}
          </div>
          {/* Texte posé sur la partie gauche assombrie — défile normalement */}
          <div className="ep-hero-content">
            <HistoryBackLink className="ep-back" fallbackHref="/ecouter">
              ← Tous les épisodes
            </HistoryBackLink>
            <p className="ep-kicker">
              Épisode {episode.number}
            </p>
            <h1>{episode.title}</h1>
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
              {episode.spotify ? <a href={episode.spotify} target="_blank" rel="noopener noreferrer">Spotify</a> : null}
              {episode.apple ? <a href={episode.apple} target="_blank" rel="noopener noreferrer">Apple Podcasts</a> : null}
              {youtubeHref ? <a href={youtubeHref} target="_blank" rel="noopener noreferrer">YouTube</a> : null}
              {episode.deezer ? <a href={episode.deezer} target="_blank" rel="noopener noreferrer">Deezer</a> : null}
              {episode.link ? <a href={episode.link} target="_blank" rel="noopener noreferrer">Tous les liens</a> : null}
            </div>
          </div>
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
              {episode.quote ? (
                <blockquote className="ep-big-quote">
                  <span className="ep-big-quote-mark" aria-hidden="true">"</span>
                  {episode.quote}
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

                {topicsList.length > 0 ? (
                  <div className="ep-topics-block">
                    <p className="ep-topics-label">Points abordés</p>
                    <div className="ep-topics-pills">
                      {topicsList.map((topic) => (
                        <span key={topic} className="ep-topic-pill">{topic}</span>
                      ))}
                    </div>
                  </div>
                ) : null}

                {episode.chapters.length > 0 ? (
                  <div className="ep-chapters">
                    <h2 className="ep-section-h2">Chapitres</h2>
                    <ol className="ep-chapters-list">
                      {episode.chapters.map((chapter) => (
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
                <div className="ep-sidebar-section">
                  <h3 className="ep-sidebar-h3">Partager</h3>
                  <EpisodeShare title={episode.title} url={episodeUrl} />
                </div>
                {similarEpisodes.length > 0 ? (
                  <div className="ep-sidebar-section">
                    <h3 className="ep-sidebar-h3">Épisodes similaires</h3>
                    <div className="ep-sidebar-similar">
                      {similarEpisodes.map((item) => (
                        <Link key={item.slug} href={`/episodes/${item.slug}`} className="ep-sidebar-ep">
                          <img src={item.image} alt={item.guest} className="ep-sidebar-ep-img" />
                          <div className="ep-sidebar-ep-body">
                            <span>Épisode {item.number}</span>
                            <strong>{item.title}</strong>
                            <p className="ep-sidebar-ep-guest">{item.guest}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
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
  const youtubeId   = unified.youtubeId ?? null;
  const youtubeHref = youtubeId ? youtubeUrl(youtubeId) : null;
  const episodeUrl  = new URL(`/episodes/${unified.slug}`, SITE_URL).toString();

  // Hero image : priorité les-invites-header → les-invites → CDN Ausha
  const heroImage = (() => {
    // 1. Cherche dans les-invites-header (même convention de nommage)
    try {
      const headerDir   = path.join(process.cwd(), 'public', 'images', 'les-invites-header');
      const headerFiles = readdirSync(headerDir);
      const headerMatch = headerFiles.find((f) =>
        new RegExp(`${unified.number}\\.(png|jpg|jpeg|webp|avif)$`, 'i').test(f)
      );
      if (headerMatch) return `/images/les-invites-header/${headerMatch}`;
    } catch { /* dossier absent */ }
    // 2. Image d'encart (les-invites ou override manuel) déjà résolue dans UnifiedEpisode.image
    if (unified.image && !unified.image.startsWith('http')) return unified.image;
    // 3. Fallback CDN Ausha
    return unified.aushaImage || unified.image;
  })();

  // Description : texte complet depuis le RSS (fallback sur l'excerpt si absent)
  const descriptionParagraphs = getEpisodeDescriptionParagraphs(unified.description || unified.excerpt);
  const descriptionBlocks     = getEpisodeDescriptionBlocks(descriptionParagraphs);

  return (
    <>
      <main className="ep-page">

        {/* HERO */}
        <section className="ep-hero">
          <div className="ep-hero-sticky-bg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="ep-hero-img"
              src={heroImage}
              alt={unified.guest}
            />
            <div className="ep-hero-shade" aria-hidden="true" />

            {/* Lecteur YouTube */}
            {youtubeId ? (
              <div className="ep-hero-youtube" id="ep-hero-youtube">
                <a
                  href={youtubeHref!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ep-youtube-link"
                  aria-label={`Regarder « ${unified.title} » sur YouTube`}
                >
                  <div className="ep-youtube-thumb-wrap">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`}
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
                    <span className="ep-youtube-cta">Regarder l&apos;épisode complet</span>
                  </div>
                </a>
              </div>
            ) : null}
          </div>

          <div className="ep-hero-content">
            <HistoryBackLink className="ep-back" fallbackHref="/ecouter">
              ← Tous les épisodes
            </HistoryBackLink>
            <p className="ep-kicker">Épisode {unified.number}</p>
            <h1>{unified.title}</h1>
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
                  {formatEpisodeDate(unified.pubDate.split('T')[0])}
                </time>
              ) : null}
            </div>
            <div className="ep-actions">
              <a href={unified.link} target="_blank" rel="noopener noreferrer">Écouter</a>
              {youtubeHref ? <a href={youtubeHref} target="_blank" rel="noopener noreferrer">YouTube</a> : null}
            </div>
          </div>
        </section>

        {/* CORPS */}
        <section className="ep-body">
          <div className="ep-body-grid">

            {/* Citation */}
            <div className="ep-col-quote" data-ep-reveal>
              {unified.quote ? (
                <blockquote className="ep-big-quote">
                  <span className="ep-big-quote-mark" aria-hidden="true">&ldquo;</span>
                  {unified.quote}
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
              </article>
            </div>

            {/* Sidebar */}
            <aside className="ep-col-sidebar" data-ep-reveal>
              <div className="ep-sidebar-card">
                <div className="ep-sidebar-section">
                  <h3 className="ep-sidebar-h3">Partager</h3>
                  <EpisodeShare title={unified.title} url={episodeUrl} />
                </div>
              </div>
            </aside>

            {/* Player Ausha — même emplacement que le lecteur Spotify sur les épisodes legacy */}
            {unified.aushaEmbedUrl ? (
              <div className="ep-col-player" data-ep-reveal>
                <iframe
                  title={`Lecteur Ausha — ${unified.title}`}
                  src={unified.aushaEmbedUrl}
                  width="100%"
                  height="200"
                  scrolling="no"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                  className="ep-player-iframe"
                  style={{ border: 'none' }}
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
