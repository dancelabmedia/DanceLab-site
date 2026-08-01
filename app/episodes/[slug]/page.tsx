import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { existsSync } from "node:fs";
import path from "node:path";

import EpisodeAnimations from "./EpisodeAnimations";
import EpisodeShare from "../../../components/EpisodeShare";
import { episodes, type Episode } from "../../../data/episodes";
import { SITE_URL } from "../../../data/site";

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

  if (!episode) {
    return {
      title: "Épisode introuvable | Dance Lab",
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

  if (!episode) {
    notFound();
  }

  const similarEpisodes = getSimilarEpisodes(episode.slug);
  const episodeUrl = new URL(`/episodes/${episode.slug}`, SITE_URL).toString();
  const headerImage = getEpisodeHeaderImage(episode);
  const descriptionParagraphs = getEpisodeDescriptionParagraphs(episode.description);
  const descriptionBlocks = getEpisodeDescriptionBlocks(descriptionParagraphs);

  // Identifiant YouTube pour la miniature + le lien
  const youtubeId = getYouTubeId(episode.youtube);

  // Points abordés — union des tags éditoriaux et des thèmes détectés
  const matchedThemes = getEpisodeThemes(episode);
  const themeLabels = [...matchedThemes].map((t) => THEME_DISPLAY[t]).filter(Boolean);
  const topicsList = [...new Set([...episode.tags, ...themeLabels])].slice(0, 10);

  return (
    <>
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
                  href={episode.youtube}
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
            <Link className="ep-back" href="/ecouter">← Tous les épisodes</Link>
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
              {episode.youtube ? <a href={episode.youtube} target="_blank" rel="noopener noreferrer">YouTube</a> : null}
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


      <style>{`
        /* ══════════════════════════════════════
           PAGE ÉPISODE — template magazine
        ══════════════════════════════════════ */

        .ep-page {
          background: var(--color-background);
          color: #151515;
          min-height: 100vh;
        }

        /* ══════════════════════════════════════
           ANIMATIONS — hero (CSS pur, au chargement)
        ══════════════════════════════════════ */

        /* Image : fondu + très léger dézoom */
        @keyframes epImgReveal {
          from { opacity: 0; transform: scale(1.04); }
          to   { opacity: 1; transform: scale(1); }
        }

        /* Dégradé : simple fondu */
        @keyframes epFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        /* Texte : remontée légère + fondu */
        @keyframes epTextUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Application sur les éléments du hero */
        .ep-hero-img   { animation: epImgReveal 1100ms cubic-bezier(.25,.46,.45,.94) both; }
        .ep-hero-shade { animation: epFadeIn     650ms ease                           both; }

        /* Cascade textuelle — délais progressifs */
        .ep-back            { animation: epTextUp 580ms ease 200ms both; }
        .ep-kicker          { animation: epTextUp 580ms ease 330ms both; }
        .ep-hero-content h1 { animation: epTextUp 600ms ease 450ms both; }
        .ep-guest           { animation: epTextUp 580ms ease 570ms both; }
        .ep-meta            { animation: epTextUp 560ms ease 670ms both; }
        .ep-actions         { animation: epTextUp 560ms ease 770ms both; }

        /* ══════════════════════════════════════
           ANIMATIONS — scroll reveal (via JS IntersectionObserver)
        ══════════════════════════════════════ */

        /* État initial caché */
        [data-ep-reveal] {
          opacity: 0;
          transform: translateY(22px);
          transition:
            opacity  600ms cubic-bezier(.25,.46,.45,.94),
            transform 600ms cubic-bezier(.25,.46,.45,.94);
        }

        /* État révélé */
        [data-ep-reveal].ep-revealed {
          opacity: 1;
          transform: translateY(0);
        }

        /* Délais entre les colonnes du corps */
        .ep-col-quote[data-ep-reveal]       { transition-delay:   0ms; }
        .ep-col-description[data-ep-reveal] { transition-delay:  90ms; }
        .ep-col-sidebar[data-ep-reveal]     { transition-delay: 180ms; }
        .ep-col-player[data-ep-reveal]      { transition-delay:   0ms; }

        /* ══════════════════════════════════════
           ACCESSIBILITÉ — prefers-reduced-motion
        ══════════════════════════════════════ */
        @media (prefers-reduced-motion: reduce) {
          .ep-hero-img,
          .ep-hero-shade,
          .ep-back,
          .ep-kicker,
          .ep-hero-content h1,
          .ep-guest,
          .ep-meta,
          .ep-actions {
            animation: none !important;
          }
          [data-ep-reveal] {
            opacity: 1 !important;
            transform: none !important;
            transition: none !important;
          }
          /* Encart YouTube : toujours visible, pas d'animation */
          .ep-hero-youtube {
            opacity: 1 !important;
            transform: translateY(-50%) !important;
            pointer-events: auto !important;
          }
        }

        /* Mobile : amplitudes réduites */
        @media (max-width: 620px) {
          @keyframes epTextUp {
            from { opacity: 0; transform: translateY(10px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          [data-ep-reveal] { transform: translateY(14px); }
        }

        /* ─ Eyebrow ─ */
        .ep-eyebrow {
          font-family: var(--font-body);
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: .22em;
          text-transform: uppercase;
          color: var(--color-primary);
          margin: 0 0 16px;
        }

        /* ─ Section h2 ─ */
        .ep-section-h2 {
          font-family: var(--font-display);
          font-size: clamp(1.4rem, 2vw, 1.8rem);
          font-weight: 600;
          line-height: 1.15;
          color: #111;
          margin: 0 0 22px;
        }

        /* ══════════════════════════════════════
           HERO — image plein cadre, texte gauche
        ══════════════════════════════════════ */
        .ep-hero {
          /* 200vh : 100vh pour le texte + 100vh de "parking" pendant le scroll */
          position: relative;
          height: 200vh;
        }

        /* Couche sticky : reste visuelle pendant tout le scroll du hero */
        .ep-hero-sticky-bg {
          position: sticky;
          top: 0;
          height: 100vh;
          overflow: hidden;
          isolation: isolate;
        }

        /* Photo plein cadre — sujet ancré à droite, image non déformée */
        .ep-hero-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: right center;
          z-index: 0;
        }

        /* Dégradé naturel : très sombre à gauche, invisible à droite */
        .ep-hero-shade {
          position: absolute;
          inset: 0;
          z-index: 1;
          background:
            linear-gradient(
              to right,
              rgba(8,8,8,.97)   0%,
              rgba(8,8,8,.92)  18%,
              rgba(8,8,8,.78)  32%,
              rgba(8,8,8,.46)  46%,
              rgba(8,8,8,.14)  60%,
              rgba(8,8,8,.00)  72%
            ),
            /* Légère protection en bas pour la lisibilité des boutons */
            linear-gradient(
              to top,
              rgba(0,0,0,.40) 0%,
              transparent     28%
            );
        }

        /* ── Encart YouTube révélé au scroll ── */
        .ep-hero-youtube {
          position: absolute;
          top: 50%;
          /* Aligné sur le bord gauche du conteneur 1160px (même que le texte du hero) */
          left: max(24px, calc(50% - 556px));
          width: min(480px, 44%);
          z-index: 4;
          pointer-events: none; /* activé par JS quand visible */
          /* État initial : caché, légèrement en dessous du centre vertical */
          opacity: 0;
          transform: translateY(calc(-50% + 60px));
        }
        .ep-hero-youtube.ep-yt-active {
          pointer-events: auto;
        }

        .ep-youtube-link {
          display: block;
          border-radius: 12px;
          overflow: hidden;
          text-decoration: none;
          box-shadow: 0 20px 60px rgba(0,0,0,.60), 0 4px 16px rgba(0,0,0,.30);
          transition: transform 240ms cubic-bezier(.25,.46,.45,.94),
                      box-shadow 240ms cubic-bezier(.25,.46,.45,.94);
        }
        .ep-youtube-link:hover {
          transform: translateY(-4px) scale(1.01);
          box-shadow: 0 32px 80px rgba(0,0,0,.70), 0 6px 24px rgba(0,0,0,.35);
        }

        /* Miniature 16:9 */
        .ep-youtube-thumb-wrap {
          position: relative;
          aspect-ratio: 16 / 9;
          overflow: hidden;
          background: #000;
        }
        .ep-youtube-thumb {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 400ms cubic-bezier(.25,.46,.45,.94);
        }
        .ep-youtube-link:hover .ep-youtube-thumb {
          transform: scale(1.04);
        }

        /* Bouton Play */
        .ep-youtube-play-btn {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .ep-youtube-play-btn svg {
          width: 72px;
          height: 51px;
          filter: drop-shadow(0 3px 12px rgba(0,0,0,.50));
          transition: transform 200ms ease, filter 200ms ease;
        }
        .ep-youtube-link:hover .ep-youtube-play-btn svg {
          transform: scale(1.12);
          filter: drop-shadow(0 4px 16px rgba(0,0,0,.65));
        }

        /* Barre inférieure — label editorial */
        .ep-youtube-bar {
          background: rgba(8,8,8,.88);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          padding: 11px 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        .ep-youtube-logo svg text {
          fill: #fff;
        }
        .ep-youtube-cta {
          color: rgba(255,255,255,.70);
          font-size: 0.76rem;
          font-weight: 500;
          letter-spacing: .03em;
          text-transform: uppercase;
          transition: color 200ms ease;
        }
        .ep-youtube-link:hover .ep-youtube-cta {
          color: rgba(255,255,255,.95);
        }

        /* Conteneur texte — se superpose à la sticky bg, défile normalement */
        .ep-hero-content {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 100vh;
          z-index: 2;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          width: 100%;
          max-width: 1160px;
          margin: 0 auto;
          padding: 64px 24px 56px;
          color: white;
          box-sizing: border-box;
        }

        /* Limite la largeur de chaque élément textuel */
        .ep-back,
        .ep-kicker,
        .ep-hero-content h1,
        .ep-guest,
        .ep-meta,
        .ep-actions {
          max-width: min(540px, 46%);
        }

        .ep-back {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 28px;
          color: rgba(255,255,255,.62);
          text-decoration: none;
          font-size: 0.82rem;
          font-weight: 600;
          letter-spacing: .04em;
          transition: color 200ms ease;
        }
        .ep-back:hover { color: #fff; }

        .ep-kicker {
          font-family: var(--font-body);
          font-size: 0.71rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: .15em;
          color: var(--color-primary-light);
          margin: 0 0 12px;
        }

        .ep-hero-content h1 {
          margin: 0 0 14px;
          font-family: var(--font-display);
          font-size: clamp(2.2rem, 3.8vw, 4.8rem);
          font-weight: 600;
          line-height: 1.02;
          letter-spacing: -0.02em;
          text-wrap: balance;
          color: #fff;
        }

        .ep-guest {
          font-size: 1.02rem;
          line-height: 1.6;
          color: rgba(255,255,255,.75);
          margin: 0 0 18px;
        }

        .ep-meta,
        .ep-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 16px;
        }

        /* Boutons d'écoute — pill conservé */
        .ep-actions a {
          border: 1px solid rgba(255,255,255,.28);
          border-radius: 999px;
          padding: 7px 14px;
          color: rgba(255,255,255,.88);
          text-decoration: none;
          font-size: 0.77rem;
          font-weight: 600;
          letter-spacing: .03em;
          transition: border-color 200ms, background 200ms, color 200ms;
        }
        .ep-actions a:hover {
          border-color: var(--color-primary-light);
          background: var(--color-primary-light);
          color: #fff;
        }

        /* Durée + date — style épuré, sans encart */
        .ep-meta-duration,
        .ep-meta-date {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          color: rgba(255,255,255,.68);
          font-size: 0.80rem;
          font-weight: 500;
          letter-spacing: .01em;
        }

        /* Icône horloge SVG */
        .ep-meta-icon {
          width: 13px;
          height: 13px;
          flex-shrink: 0;
          opacity: .90;
        }

        /* Séparateur · entre durée et date */
        .ep-meta-duration + .ep-meta-date::before {
          content: '·';
          margin-right: 3px;
          opacity: .40;
        }

        /* Tag éventuel — pill conservé */
        .ep-meta-tag {
          border: 1px solid rgba(255,255,255,.28);
          border-radius: 999px;
          padding: 7px 14px;
          color: rgba(255,255,255,.88);
          font-size: 0.77rem;
          font-weight: 600;
          letter-spacing: .03em;
        }

        /* ══════════════════════════════════════
           CORPS — grille principale
        ══════════════════════════════════════ */
        .ep-body {
          position: relative;
          z-index: 1; /* glisse par-dessus l'image sticky du hero */
          background: var(--color-background);
          padding: 56px 0 80px;
        }

        .ep-body-grid {
          width: min(1160px, calc(100% - 48px));
          margin: 0 auto;
          display: grid;
          /* col1: citation étroite | col2: description article | col3: sidebar */
          grid-template-columns: minmax(0, 0.72fr) minmax(0, 1.6fr) 276px;
          grid-template-rows: auto auto;
          column-gap: 48px;
          row-gap: 0;
          align-items: start;
        }

        /* ── [col1 row1] Citation ── */
        .ep-col-quote {
          grid-column: 1;
          grid-row: 1;
          padding-top: 4px;
        }

        .ep-big-quote {
          /* Hook éditorial — mis en valeur comme un mini-titre de magazine */
          padding: 0 0 28px 20px;
          border-left: 2px solid var(--color-primary-light);
          font-family: var(--font-display);
          font-size: clamp(1.22rem, 1.65vw, 1.52rem);
          font-style: normal;
          font-weight: 700;
          line-height: 1.46;
          color: #111;
          margin: 0;
          letter-spacing: -0.01em;
        }

        .ep-big-quote-mark {
          font-family: Georgia, serif;
          font-size: 1.6em;
          line-height: 0;
          color: var(--color-primary-light);
          font-style: normal;
          font-weight: 400;
          vertical-align: -0.26em;
          user-select: none;
          margin-right: 1px;
          opacity: 0.7;
        }

        /* ── [col3 rows1+] Sidebar sticky ── */
        .ep-col-sidebar {
          grid-column: 3;
          grid-row: 1 / -1;
          position: sticky;
          top: calc(var(--nav-h, 64px) + 20px);
          align-self: start;
        }

        .ep-sidebar-card {
          border: 1px solid rgba(0,0,0,.09);
          border-radius: 13px;
          background: white;
          box-shadow: 0 3px 22px rgba(0,0,0,.06);
          overflow: hidden;
        }

        .ep-sidebar-section {
          padding: 18px 20px;
          border-bottom: 1px solid rgba(0,0,0,.07);
        }
        .ep-sidebar-section:last-child { border-bottom: 0; }

        .ep-sidebar-h3 {
          font-family: var(--font-body);
          font-size: 9.5px;
          font-weight: 700;
          letter-spacing: .20em;
          text-transform: uppercase;
          color: var(--color-primary);
          margin: 0 0 12px;
        }

        /* EpisodeShare component */
        .episode-share { display: flex; flex-wrap: nowrap; gap: 7px; position: relative; }

        .episode-share-button {
          display: grid;
          width: 38px; height: 38px;
          flex: 0 0 38px;
          place-items: center;
          border: 1px solid currentColor;
          border-radius: 50%;
          background: transparent;
          color: inherit;
          cursor: pointer;
          transition: background-color 180ms ease, border-color 180ms ease,
            color 180ms ease, transform 180ms ease;
        }
        .episode-share-button:hover,
        .episode-share-button:focus-visible {
          border-color: var(--color-primary-light);
          background: var(--color-primary-light);
          color: #fff;
          transform: translateY(-1px);
        }
        .episode-share-button:focus-visible { outline: 2px solid currentColor; outline-offset: 3px; }
        .episode-share-button svg {
          width: 16px; height: 16px;
          fill: none; stroke: currentColor;
          stroke-linecap: round; stroke-linejoin: round; stroke-width: 1.8;
        }
        .episode-share-menu {
          position: absolute; z-index: 10;
          top: calc(100% + 8px); right: 0;
          width: 188px;
          border: 1px solid rgba(0,0,0,.12);
          border-radius: 10px;
          background: #fff;
          box-shadow: 0 10px 28px rgba(17,17,17,.13);
          overflow: hidden;
        }
        .episode-share-menu a,
        .episode-share-menu button {
          display: block; width: 100%;
          border: 0; border-bottom: 1px solid rgba(0,0,0,.07);
          border-radius: 0; padding: 10px 14px;
          background: transparent; color: inherit;
          font: inherit; text-align: left;
          text-decoration: none; cursor: pointer;
        }
        .episode-share-menu a:last-child,
        .episode-share-menu button:last-child { border-bottom: 0; }
        .episode-share-menu a:hover,
        .episode-share-menu button:hover { background: rgba(193,208,223,.22); }

        /* Épisodes similaires dans la sidebar */
        .ep-sidebar-similar {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .ep-sidebar-ep {
          display: flex;
          gap: 10px;
          align-items: center;
          text-decoration: none;
          color: inherit;
          padding: 7px;
          border-radius: 7px;
          transition: background 200ms;
        }
        .ep-sidebar-ep:hover { background: rgba(193,208,223,.14); }

        .ep-sidebar-ep-img {
          width: 42px; height: 42px;
          border-radius: 5px;
          object-fit: cover;
          object-position: center top;
          flex-shrink: 0;
        }

        .ep-sidebar-ep-body {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
        }

        .ep-sidebar-ep-body span {
          font-size: 0.65rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: .10em;
          color: var(--color-primary);
        }

        .ep-sidebar-ep-body strong {
          font-size: 0.81rem;
          font-weight: 600;
          line-height: 1.24;
          color: #111;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .ep-sidebar-ep-guest {
          font-size: 0.74rem;
          color: #888;
          margin: 2px 0 0;
          line-height: 1.3;
        }

        /* ── [col2 row1] Description ── */
        .ep-col-description {
          grid-column: 2;
          grid-row: 1;
          padding-top: 4px;
        }

        /* Article */
        .ep-article {
          display: flex;
          flex-direction: column;
        }

        /* ─ Description — style magazine sobre ─ */
        .ep-description {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }

        /* Paragraphe standard */
        .ep-desc-p {
          margin: 0;
          font-size: clamp(0.97rem, 1.05vw, 1.03rem);
          line-height: 1.76;
          color: #1c1c1c;
        }

        /* Premier paragraphe — légèrement mis en valeur */
        .ep-desc-lead {
          font-size: clamp(1.06rem, 1.2vw, 1.14rem) !important;
          font-weight: 500;
          line-height: 1.68 !important;
          color: #111;
        }

        /* Dernier paragraphe */
        .ep-desc-closing {
          color: #2a2a2a;
        }

        /* Citation — une seule fine ligne bleue */
        .ep-desc-quote {
          margin: 6px 0;
          padding: 4px 0 4px 18px;
          border-left: 2px solid var(--color-primary-light);
          font-size: clamp(1.02rem, 1.18vw, 1.14rem);
          font-style: italic;
          font-weight: 500;
          line-height: 1.62;
          color: var(--color-primary-dark);
        }

        /* Callout — semi-gras discret, sans bordure */
        .ep-desc-callout {
          margin: 0;
          font-size: clamp(0.97rem, 1.05vw, 1.03rem);
          font-weight: 600;
          line-height: 1.68;
          color: #111;
        }

        /* Liste — propre, sans bordure décorative */
        .ep-desc-list {
          margin: 4px 0;
          padding: 0 0 0 20px;
          list-style: disc;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .ep-desc-list li {
          font-size: clamp(0.96rem, 1.04vw, 1.02rem);
          line-height: 1.72;
          color: #1c1c1c;
          padding-left: 4px;
        }
        .ep-desc-list li::marker {
          color: var(--color-primary-light);
        }

        /* Inline emphasis */
        .episode-description-emphasis {
          font-weight: 700;
          color: inherit;
        }
        .episode-description-inline-quote {
          font-style: italic;
          color: inherit;
        }

        /* Points abordés — inline sous la description */
        .ep-topics-block {
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid rgba(0,0,0,.07);
        }

        .ep-topics-label {
          font-family: var(--font-body);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: .22em;
          text-transform: uppercase;
          color: var(--color-primary);
          margin: 0 0 12px;
        }

        .ep-topics-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
        }

        .ep-topic-pill {
          display: inline-flex;
          align-items: center;
          padding: 4px 12px;
          border-radius: 999px;
          border: 1px solid rgba(91,115,119,.20);
          background: rgba(193,208,223,.12);
          color: var(--color-primary-dark);
          font-size: 0.80rem;
          font-weight: 500;
          white-space: nowrap;
        }

        /* Chapitres */
        .ep-chapters {
          margin-top: 36px;
          padding-top: 32px;
          border-top: 1px solid rgba(0,0,0,.07);
        }

        .ep-chapters-list {
          display: grid;
          gap: 0;
          padding: 0;
          list-style: none;
        }

        .ep-chapters-list li {
          display: grid;
          grid-template-columns: 72px 1fr;
          gap: 14px;
          padding: 14px 0;
          border-top: 1px solid rgba(0,0,0,.06);
          align-items: start;
        }

        .ep-chapters-list li span {
          color: #755f3e;
          font-size: 0.86rem;
          font-weight: 700;
          line-height: 1.4;
          padding-top: 2px;
        }

        .ep-chapters-list li strong {
          font-size: 0.96rem;
          font-weight: 600;
          line-height: 1.46;
        }

        /* ── [col1-2 row2] Lecteur audio ── */
        .ep-col-player {
          grid-column: 1 / 3;
          grid-row: 2;
          padding-top: 32px;
          border-top: 1px solid rgba(0,0,0,.07);
          margin-top: 32px;
        }

        .ep-player-iframe {
          display: block;
          border: 0;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,.08);
          width: 100%;
        }

        /* ══════════════════════════════════════
           RESPONSIVE
        ══════════════════════════════════════ */
        @media (max-width: 1060px) {
          .ep-body-grid {
            grid-template-columns: minmax(0, 0.65fr) minmax(0, 1.5fr) 256px;
            column-gap: 36px;
          }
        }

        @media (max-width: 860px) {
          /* Tablette : citation disparaît dans la col, description occupe toute la largeur */
          .ep-body-grid {
            grid-template-columns: minmax(0, 1fr) 240px;
            grid-template-rows: auto auto;
          }
          .ep-col-quote       { grid-column: 1; grid-row: 1; padding-bottom: 24px; border-bottom: 1px solid rgba(0,0,0,.07); margin-bottom: 24px; }
          .ep-col-description { grid-column: 1; grid-row: 2; }
          .ep-col-sidebar     { grid-column: 2; grid-row: 1 / -1; }
          .ep-col-player      { grid-column: 1; grid-row: 3; }
        }

        @media (max-width: 620px) {
          /* Mobile : désactiver le parallax sticky */
          .ep-hero {
            height: auto;
            min-height: 78vh;
            display: flex;
            align-items: flex-end;
            overflow: hidden;
          }
          .ep-hero-sticky-bg {
            position: absolute;
            inset: 0;
            height: auto;
          }
          .ep-hero-content {
            position: relative;
            height: auto;
            min-height: 78vh;
          }
          /* Sur mobile le visage risque d'être coupé — on recentre légèrement */
          .ep-hero-img { object-position: 70% center; }
          .ep-hero-content { padding: 40px 24px 44px; }
          /* Encart YouTube : pleine largeur sur mobile, ancré en bas à gauche */
          .ep-hero-youtube {
            top: auto;
            bottom: 12%;
            left: 16px;
            width: calc(100% - 32px);
            transform: translateY(0) !important;
          }
          .ep-back,
          .ep-kicker,
          .ep-hero-content h1,
          .ep-guest,
          .ep-meta,
          .ep-actions { max-width: 100%; }
          .ep-hero-content h1 { font-size: clamp(1.9rem, 7vw, 3rem); }
          .ep-guest { font-size: 0.94rem; }

          .ep-body { padding: 36px 0 56px; }
          .ep-body-grid {
            display: flex;
            flex-direction: column;
            gap: 0;
          }
          /* Ordre mobile : citation → description → player → sidebar */
          .ep-col-quote       { order: 1; padding-bottom: 24px; border-bottom: 1px solid rgba(0,0,0,.07); margin-bottom: 24px; }
          .ep-col-description { order: 2; }
          .ep-col-player      { order: 3; padding-top: 28px; margin-top: 28px; border-top: 1px solid rgba(0,0,0,.07); }
          .ep-col-sidebar     { order: 4; margin-top: 36px; position: static; }
          .ep-desc-quote      { font-size: 1.06rem; }
        }
      `}</style>
    </>
  );
}

