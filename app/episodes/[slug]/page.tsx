import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { existsSync } from "node:fs";
import path from "node:path";

import EpisodeShare from "../../../components/EpisodeShare";
import { episodes, type Episode } from "../../../data/episodes";
import { SITE_URL } from "../../../data/site";

const HEADER_IMAGE_DIR = "/images/les-invites";

function publicFileExists(publicPath: string) {
  return existsSync(path.join(process.cwd(), "public", publicPath.replace(/^\//, "")));
}

function getEpisodeCardImage(episode: Episode) {
  return episode.image;
}

function getEpisodeHeaderImage(episode: Episode) {
  const imageName = episode.image.split("/").pop();
  const headerImage = imageName ? `${HEADER_IMAGE_DIR}/${imageName}` : episode.image;

  return publicFileExists(headerImage) ? headerImage : getEpisodeCardImage(episode);
}

function getEpisodeBySlug(slug: string) {
  return episodes.find((episode) => episode.slug === slug);
}

function formatEpisodeDate(date: string) {
  const [year, month, day] = date.split("-");

  return year && month && day ? `${day}.${month}.${year}` : date;
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

  // Points abordés — union des tags éditoriaux et des thèmes détectés
  const matchedThemes = getEpisodeThemes(episode);
  const themeLabels = [...matchedThemes].map((t) => THEME_DISPLAY[t]).filter(Boolean);
  const topicsList = [...new Set([...episode.tags, ...themeLabels])].slice(0, 10);

  return (
    <>
      <main className="ep-page">

        {/* ══════════════════════════════════════
            HERO — éditorial, 72 vh
        ══════════════════════════════════════ */}
        <section className="ep-hero">
          <img
            className="ep-hero-img"
            src={headerImage}
            alt={episode.guest}
          />
          <div className="ep-hero-shade" />
          <div className="ep-hero-content">
            <Link className="ep-back" href="/">← Retour à l&apos;accueil</Link>
            <p className="ep-kicker">
              Épisode {episode.number}{episode.category ? ` · ${episode.category}` : ""}
            </p>
            <h1>{episode.title}</h1>
            <p className="ep-guest">
              Avec {episode.guest}{episode.role ? `, ${episode.role}` : ""}
            </p>
            <div className="ep-meta">
              <span>{episode.duration}</span>
              <time dateTime={episode.publishedAt}>{formatEpisodeDate(episode.publishedAt)}</time>
              {episode.tags[0] ? <span>{episode.tags[0]}</span> : null}
            </div>
            <div className="ep-actions">
              {episode.spotifyEmbedUrl ? <a href={episode.spotifyEmbedUrl}>Spotify</a> : null}
              {episode.apple ? <a href={episode.apple}>Apple Podcasts</a> : null}
              {episode.youtube ? <a href={episode.youtube}>YouTube</a> : null}
              {episode.deezer ? <a href={episode.deezer}>Deezer</a> : null}
              {episode.link ? <a href={episode.link}>Tous les liens</a> : null}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════
            CORPS — grille 2 colonnes
            Col gauche : 4 sections empilées
            Col droite : sidebar sticky
        ══════════════════════════════════════ */}
        <section className="ep-body">
          <div className="ep-body-inner">

            {/* ────────────────────────────────────
                COLONNE PRINCIPALE
            ──────────────────────────────────── */}
            <div className="ep-main">

              {/* ── ROW 1 : Citation + intro ── */}
              <div className="ep-intro-block">
                {episode.quote ? (
                  <blockquote className="ep-quote">
                    <span className="ep-quote-mark" aria-hidden="true">"</span>
                    {episode.quote}
                  </blockquote>
                ) : null}
                <p className="ep-eyebrow">À propos de cet épisode</p>
                {episode.excerpt ? (
                  <p className="ep-intro-excerpt">{episode.excerpt}</p>
                ) : null}
              </div>

              {/* ── ROW 2 : Points abordés — pills ── */}
              {topicsList.length > 0 ? (
                <div className="ep-pills-section">
                  <p className="ep-pills-label">Points abordés</p>
                  <div className="ep-pills">
                    {topicsList.map((topic) => (
                      <span key={topic} className="ep-pill">{topic}</span>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* ── ROW 3 : Lecteur Spotify ── */}
              {episode.spotifyEmbedUrl ? (
                <div className="ep-player-block">
                  <p className="ep-eyebrow">Écouter l&apos;épisode</p>
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

              {/* ── ROW 4 : Article éditorial complet ── */}
              <article className="ep-article">
                <div className="ep-description">
                  {descriptionBlocks.map((block, blockIndex) => {
                    if (block.type === "list") {
                      return (
                        <ul
                          key={`${episode.slug}-description-${blockIndex}`}
                          className="ep-desc-block ep-desc-list"
                        >
                          {block.items.map((item, itemIndex) => (
                            <li key={`${episode.slug}-description-${blockIndex}-${itemIndex}`}>
                              <span className="ep-desc-list-marker">{item.slice(0, 1)}</span>
                              <span>{renderInlineEditorialText(item.slice(1))}</span>
                            </li>
                          ))}
                        </ul>
                      );
                    }

                    const blockClass = [
                      "ep-desc-block",
                      `ep-desc-${block.type}`,
                      blockIndex === 0 ? "ep-desc-lead" : "",
                      blockIndex === descriptionBlocks.length - 1 ? "ep-desc-closing" : "",
                    ].filter(Boolean).join(" ");

                    if (block.type === "quote") {
                      return (
                        <blockquote
                          key={`${episode.slug}-description-${blockIndex}`}
                          className={blockClass}
                        >
                          {renderInlineEditorialText(block.text)}
                        </blockquote>
                      );
                    }

                    return (
                      <p
                        key={`${episode.slug}-description-${blockIndex}`}
                        className={blockClass}
                      >
                        {renderInlineEditorialText(block.text)}
                      </p>
                    );
                  })}
                </div>

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

            {/* ────────────────────────────────────
                SIDEBAR STICKY
            ──────────────────────────────────── */}
            <aside className="ep-sidebar-col">
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

          </div>
        </section>

      </main>


      <style>{`
        /* ══════════════════════════════════════
           PAGE EPISODE — design premium
        ══════════════════════════════════════ */

        .ep-page {
          background: var(--color-background);
          color: #151515;
          min-height: 100vh;
        }

        /* ─ Animation page body ─ */
        @keyframes epFadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0);   }
        }
        .ep-body { animation: epFadeUp 550ms ease-out 60ms both; }

        /* ─ Eyebrow label ─ */
        .ep-eyebrow {
          font-family: var(--font-body);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: .22em;
          text-transform: uppercase;
          color: var(--color-primary);
          margin: 0 0 20px;
        }
        .ep-eyebrow--center { text-align: center; }

        /* ─ Section h2 ─ */
        .ep-section-h2 {
          font-family: var(--font-display);
          font-size: clamp(1.5rem, 2.2vw, 2rem);
          font-weight: 600;
          line-height: 1.12;
          color: #111;
          margin: 0 0 28px;
        }

        /* ══════════════════════════════════════
           HERO
        ══════════════════════════════════════ */
        .ep-hero {
          position: relative;
          min-height: 73vh;
          display: flex;
          align-items: flex-end;
          overflow: hidden;
          isolation: isolate;
        }

        .ep-hero-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          /* portrait décalé vers la droite — zone de texte libre à gauche */
          object-position: 72% center;
          z-index: -2;
        }

        .ep-hero-shade {
          position: absolute;
          inset: 0;
          z-index: -1;
          background:
            /* dégradé horizontal : zone sombre à gauche, face préservée à droite */
            linear-gradient(90deg,
              rgba(0,0,0,.92) 0%,
              rgba(0,0,0,.80) 24%,
              rgba(0,0,0,.50) 42%,
              rgba(0,0,0,.14) 58%,
              rgba(0,0,0,.00) 70%
            ),
            /* dégradé bas → haut pour protéger les métadonnées */
            linear-gradient(0deg,
              rgba(0,0,0,.70) 0%,
              rgba(0,0,0,.18) 36%,
              transparent 58%
            );
        }

        .ep-hero-content {
          width: min(1120px, calc(100% - 48px));
          margin: 0 auto;
          padding: 64px 0 56px;
          color: white;
        }

        .ep-back {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 28px;
          color: rgba(255,255,255,.80);
          text-decoration: none;
          font-size: 0.82rem;
          font-weight: 600;
          letter-spacing: .04em;
          transition: color 200ms ease;
        }
        .ep-back:hover { color: #fff; }

        .ep-kicker {
          font-family: var(--font-body);
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: .14em;
          color: var(--color-primary-light);
          margin: 0 0 14px;
        }

        .ep-hero-content h1 {
          /* largeur max ~52% — le titre ne chevauche pas le portrait */
          max-width: clamp(320px, 52%, 620px);
          margin: 0 0 16px;
          font-family: var(--font-display);
          font-size: clamp(2.6rem, 4.8vw, 5.4rem);
          font-weight: 600;
          line-height: 1.0;
          letter-spacing: -0.02em;
          text-wrap: balance;
          color: #fff;
        }

        .ep-guest {
          max-width: clamp(280px, 46%, 540px);
          font-size: 1.05rem;
          line-height: 1.65;
          color: rgba(255,255,255,.82);
          margin: 0 0 20px;
        }

        .ep-meta,
        .ep-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 18px;
        }

        .ep-meta span,
        .ep-meta time,
        .ep-actions a {
          border: 1px solid rgba(255,255,255,.38);
          border-radius: 999px;
          padding: 8px 14px;
          color: rgba(255,255,255,.90);
          text-decoration: none;
          font-size: 0.78rem;
          font-weight: 600;
          letter-spacing: .03em;
          transition: border-color 200ms, background 200ms, color 200ms;
        }
        .ep-actions a:hover {
          border-color: var(--color-primary-light);
          background: var(--color-primary-light);
          color: #fff;
        }

        /* ══════════════════════════════════════
           CORPS — 2 colonnes
        ══════════════════════════════════════ */
        .ep-body {
          background: var(--color-background);
          padding: 64px 0 88px;
        }

        .ep-body-inner {
          width: min(1160px, calc(100% - 48px));
          margin: 0 auto;
          display: grid;
          grid-template-columns: minmax(0, 1fr) 300px;
          gap: 0 52px;
          align-items: start;
        }

        /* ─ Colonne principale — 4 sections empilées ─ */
        .ep-main {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 48px;
        }

        /* ── ROW 1 : Intro block ── */
        .ep-intro-block {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        /* Citation dans l'intro */
        .ep-quote {
          padding: 4px 0 4px 20px;
          border-left: 2px solid var(--color-primary-light);
          font-family: var(--font-display);
          font-size: clamp(1.1rem, 1.5vw, 1.28rem);
          font-style: italic;
          font-weight: 500;
          line-height: 1.54;
          color: var(--color-primary-dark);
          margin: 0;
        }

        .ep-quote-mark {
          font-family: Georgia, serif;
          font-size: 1.3em;
          line-height: 0;
          color: var(--color-primary-light);
          font-style: normal;
          vertical-align: -0.18em;
          user-select: none;
          margin-right: 2px;
        }

        /* Extrait court sous l'eyebrow */
        .ep-intro-excerpt {
          font-size: clamp(1rem, 1.15vw, 1.08rem);
          line-height: 1.78;
          color: #333;
          margin: 0;
          max-width: 64ch;
        }

        /* ── ROW 2 : Pills / tags ── */
        .ep-pills-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding-top: 4px;
          border-top: 1px solid rgba(0,0,0,.07);
        }

        .ep-pills-label {
          font-family: var(--font-body);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: .22em;
          text-transform: uppercase;
          color: var(--color-primary);
          margin: 0;
        }

        .ep-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .ep-pill {
          display: inline-flex;
          align-items: center;
          padding: 5px 14px;
          border-radius: 999px;
          border: 1px solid rgba(91,115,119,.22);
          background: rgba(193,208,223,.14);
          color: var(--color-primary-dark);
          font-size: 0.82rem;
          font-weight: 500;
          line-height: 1.2;
          white-space: nowrap;
          transition: background 180ms, border-color 180ms;
        }
        .ep-pill:hover {
          background: rgba(193,208,223,.32);
          border-color: rgba(91,115,119,.40);
        }

        /* ── ROW 3 : Lecteur Spotify ── */
        .ep-player-block {
          padding-top: 4px;
          border-top: 1px solid rgba(0,0,0,.07);
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .ep-player-iframe {
          display: block;
          border: 0;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,.08);
          width: 100%;
        }

        /* ── ROW 4 : Article éditorial ── */
        .ep-article {
          display: flex;
          flex-direction: column;
          gap: 0;
          padding-top: 4px;
          border-top: 1px solid rgba(0,0,0,.07);
        }

        /* ─ Description magazine ─ */
        .ep-description {
          display: flex;
          flex-direction: column;
          gap: 1.6rem;
        }

        .ep-desc-block {
          position: relative;
          margin: 0;
          line-height: 1.85;
          font-size: clamp(1rem, 1.05vw, 1.06rem);
          color: #1e1e1e;
        }

        .ep-desc-lead {
          font-family: var(--font-display);
          font-size: clamp(1.14rem, 1.38vw, 1.24rem) !important;
          font-weight: 600;
          line-height: 1.58 !important;
          color: #111;
          padding-bottom: 4px;
          border-bottom: 1px solid rgba(0,0,0,.07);
        }

        .ep-desc-emphasis {
          font-weight: 700;
          color: inherit;
        }

        .ep-desc-inline-quote {
          font-style: italic;
          font-weight: 600;
          color: inherit;
        }

        /* Citation dans le texte — discrète, pas de fond */
        .ep-desc-quote {
          padding: 6px 0 6px 20px;
          border-left: 2px solid var(--color-primary-light);
          color: var(--color-primary-dark);
          font-family: var(--font-display);
          font-size: clamp(1.08rem, 1.4vw, 1.26rem);
          font-style: italic;
          font-weight: 500;
          line-height: 1.52;
          margin: 4px 0;
          background: none;
        }

        /* Callout — trait gauche discret, pas de fond coloré */
        .ep-desc-callout {
          padding: 2px 0 2px 20px;
          border-left: 2px solid var(--color-primary-light);
          background: none;
          color: var(--color-primary-dark);
          font-size: 1.04rem;
          font-weight: 600;
          line-height: 1.68;
        }

        /* Liste éditoriale — fond blanc, marqueur bleu discret */
        .ep-desc-list {
          display: flex;
          flex-direction: column;
          gap: 0;
          list-style: none;
          padding: 0;
          margin: 4px 0;
          border-left: 2px solid var(--color-primary-light);
          padding-left: 20px;
        }

        .ep-desc-list li {
          display: grid;
          grid-template-columns: 18px 1fr;
          gap: 8px;
          align-items: baseline;
          font-size: 1.01rem;
          line-height: 1.72;
          color: #1e1e1e;
          padding: 3px 0;
        }

        .ep-desc-list-marker {
          color: var(--color-primary-light);
          font-weight: 700;
          font-size: 1.05em;
        }

        .ep-desc-closing {
          font-weight: 600;
          color: inherit;
        }

        .ep-desc-list + .ep-desc-paragraph,
        .ep-desc-callout + .ep-desc-paragraph,
        .ep-desc-quote + .ep-desc-paragraph {
          padding-top: 0.3rem;
        }

        /* ─ Chapitres ─ */
        .ep-chapters {
          padding-top: 32px;
          border-top: 1px solid rgba(0,0,0,.08);
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
          gap: 16px;
          padding: 16px 0;
          border-top: 1px solid rgba(0,0,0,.08);
          align-items: start;
        }

        .ep-chapters-list li span {
          color: #755f3e;
          font-size: 0.88rem;
          font-weight: 700;
          line-height: 1.4;
          padding-top: 2px;
        }

        .ep-chapters-list li strong {
          font-size: 0.98rem;
          font-weight: 600;
          line-height: 1.48;
        }

        /* ─ Col 3 : Sidebar ─ */
        .ep-sidebar-col {
          position: sticky;
          top: calc(var(--nav-h, 64px) + 24px);
          align-self: start;
        }

        .ep-sidebar-card {
          border: 1px solid rgba(0,0,0,.09);
          border-radius: 14px;
          background: white;
          box-shadow: 0 4px 28px rgba(0,0,0,.06);
          overflow: hidden;
        }

        .ep-sidebar-section {
          padding: 20px 22px;
          border-bottom: 1px solid rgba(0,0,0,.07);
        }
        .ep-sidebar-section:last-child { border-bottom: 0; }

        .ep-sidebar-h3 {
          font-family: var(--font-body);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: .20em;
          text-transform: uppercase;
          color: var(--color-primary);
          margin: 0 0 14px;
        }

        /* Share buttons — gardés compatibles avec EpisodeShare */
        .episode-share,
        .ep-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .episode-share { flex-wrap: nowrap; gap: 7px; position: relative; }

        .episode-share-button {
          display: grid;
          width: 40px; height: 40px;
          flex: 0 0 40px;
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
          width: 17px; height: 17px;
          fill: none; stroke: currentColor;
          stroke-linecap: round; stroke-linejoin: round; stroke-width: 1.8;
        }
        .episode-share-menu {
          position: absolute; z-index: 10;
          top: calc(100% + 8px); right: 0;
          width: 190px;
          border: 1px solid rgba(0,0,0,.12);
          border-radius: 10px;
          background: #fff;
          box-shadow: 0 12px 32px rgba(17,17,17,.14);
          overflow: hidden;
        }
        .episode-share-menu a,
        .episode-share-menu button {
          display: block; width: 100%;
          border: 0; border-bottom: 1px solid rgba(0,0,0,.07);
          border-radius: 0; padding: 11px 14px;
          background: transparent; color: inherit;
          font: inherit; text-align: left;
          text-decoration: none; cursor: pointer;
        }
        .episode-share-menu a:last-child,
        .episode-share-menu button:last-child { border-bottom: 0; }
        .episode-share-menu a:hover,
        .episode-share-menu button:hover { background: rgba(193,208,223,.25); }

        /* Tags */
        .ep-tags span {
          border-radius: 999px;
          background: rgba(193,208,223,.22);
          padding: 6px 11px;
          font-size: 0.80rem;
          color: var(--color-primary-dark);
          font-weight: 500;
          line-height: 1.2;
        }

        /* Similar compacts dans la sidebar */
        .ep-sidebar-similar {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .ep-sidebar-ep {
          display: flex;
          gap: 11px;
          align-items: center;
          text-decoration: none;
          color: inherit;
          padding: 8px;
          border-radius: 8px;
          transition: background 200ms;
        }
        .ep-sidebar-ep:hover { background: rgba(193,208,223,.15); }

        .ep-sidebar-ep-img {
          width: 46px; height: 46px;
          border-radius: 6px;
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
          font-size: 0.68rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: .10em;
          color: var(--color-primary);
        }

        .ep-sidebar-ep-body strong {
          font-size: 0.84rem;
          font-weight: 600;
          line-height: 1.25;
          color: #111;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* ── Épisodes similaires dans la sidebar — guest ── */
        .ep-sidebar-ep-guest {
          font-size: 0.78rem;
          color: #888;
          margin: 2px 0 0;
          line-height: 1.3;
        }

        /* ══════════════════════════════════════
           RESPONSIVE
        ══════════════════════════════════════ */
        @media (max-width: 960px) {
          .ep-body-inner {
            grid-template-columns: minmax(0, 1fr) 272px;
            gap: 0 36px;
          }
        }

        @media (max-width: 720px) {
          .ep-hero-content h1 { font-size: clamp(2.4rem, 7vw, 3.8rem); }

          .ep-body { padding: 48px 0 64px; }
          .ep-body-inner {
            grid-template-columns: 1fr;
            gap: 48px;
          }
          .ep-sidebar-col { position: static; }
          .ep-topics-grid { grid-template-columns: 1fr; }
          .ep-desc-quote { font-size: 1.28rem; }
        }

        @media (max-width: 480px) {
          .ep-hero { min-height: 80vh; }
          .ep-hero-content h1 { font-size: 2.2rem; line-height: 1.02; }
          .ep-guest { font-size: 0.95rem; }
          .ep-body { padding: 40px 0 56px; }
          .ep-main { gap: 28px; }
          .ep-sidebar-card { border-radius: 10px; }
          .ep-player-inline { padding: 18px 18px 22px; }
        }
      `}</style>
    </>
  );
}

