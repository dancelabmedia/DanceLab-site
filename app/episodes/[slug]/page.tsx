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
    .split(/(?<=[.!?…])\s+(?=[A-ZÀ-ÖØ-Þ0-9«“"])/u)
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
const descriptionQuotePattern = /^(?:“[\s\S]+”|«[\s\S]+»|"[\s\S]+")$/u;
const inlineQuotePattern = /^(?:“[\s\S]+”|«[\s\S]+»|"[\s\S]+")$/u;

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
      .split(/(“[^”]+”|«[^»]+»|"[^"]+")/gu)
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

function getSimilarEpisodes(currentSlug: string) {
  return episodes.filter((episode) => episode.slug !== currentSlug).slice(0, 3);
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

  return (
    <>
      <main className="episode-page">
        <section className="episode-hero">
          <img
            className="episode-hero-image"
            src={headerImage}
            alt={episode.guest}
          />

          <div className="episode-hero-shade" />

          <div className="episode-hero-content">
            <Link className="episode-back" href="/">
              ← Retour à l'accueil
            </Link>

            <p className="episode-kicker">
              Épisode {episode.number}
              {episode.category ? ` · ${episode.category}` : ""}
            </p>

            <h1>{episode.title}</h1>

            <p className="episode-guest">
              Avec {episode.guest}
              {episode.role ? `, ${episode.role}` : ""}
            </p>

            <blockquote>“{episode.quote}”</blockquote>

            <div className="episode-meta">
              <span>{episode.duration}</span>
              <time dateTime={episode.publishedAt}>
                {formatEpisodeDate(episode.publishedAt)}
              </time>
              {episode.tags[0] ? <span>{episode.tags[0]}</span> : null}
            </div>

            <div className="episode-actions">
              {episode.spotifyEmbedUrl ? (
                <a href={episode.spotifyEmbedUrl}>Spotify</a>
              ) : null}
              {episode.apple ? <a href={episode.apple}>Apple Podcasts</a> : null}
              {episode.youtube ? <a href={episode.youtube}>YouTube</a> : null}
              {episode.deezer ? <a href={episode.deezer}>Deezer</a> : null}
              {episode.link ? <a href={episode.link}>Tous les liens</a> : null}
            </div>
          </div>
        </section>

        <section className="episode-body">
          <article className="episode-main">
            <div className="episode-player">
              {episode.spotifyEmbedUrl ? (
                <iframe
                  title={`Lecteur Spotify - ${episode.title}`}
                  src={episode.spotifyEmbedUrl}
                  width="100%"
                  height="152"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                />
              ) : (
                <p>Le lecteur arrive bientôt.</p>
              )}
            </div>

            <h2>Description</h2>
            <div className="episode-description">
              {descriptionBlocks.map((block, blockIndex) => {
                if (block.type === "list") {
                  return (
                    <ul
                      key={`${episode.slug}-description-${blockIndex}`}
                      className="episode-description-block episode-description-list"
                    >
                      {block.items.map((item, itemIndex) => (
                        <li
                          key={`${episode.slug}-description-${blockIndex}-${itemIndex}`}
                          data-description-text
                        >
                          <span className="episode-description-list-marker">
                            {item.slice(0, 1)}
                          </span>
                          <span>{renderInlineEditorialText(item.slice(1))}</span>
                        </li>
                      ))}
                    </ul>
                  );
                }

                const className = [
                  "episode-description-block",
                  `episode-description-${block.type}`,
                  blockIndex === 0 ? "episode-description-lead" : "",
                  blockIndex === descriptionBlocks.length - 1
                    ? "episode-description-closing"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ");

                if (block.type === "quote") {
                  return (
                    <blockquote
                      key={`${episode.slug}-description-${blockIndex}`}
                      className={className}
                      data-description-text
                    >
                      {renderInlineEditorialText(block.text)}
                    </blockquote>
                  );
                }

                return (
                  <p
                    key={`${episode.slug}-description-${blockIndex}`}
                    className={className}
                    data-description-text
                  >
                    {renderInlineEditorialText(block.text)}
                  </p>
                );
              })}
            </div>

            {episode.chapters.length > 0 ? (
              <>
                <h2>Chapitres</h2>
                <ol className="episode-chapters">
                  {episode.chapters.map((chapter) => (
                    <li key={`${chapter.time}-${chapter.title}`}>
                      <span>{chapter.time}</span>
                      <strong>{chapter.title}</strong>
                    </li>
                  ))}
                </ol>
              </>
            ) : null}
          </article>

          <aside className="episode-sidebar">
            <div className="episode-panel">
              <h2>Partager</h2>
              <EpisodeShare title={episode.title} url={episodeUrl} />
            </div>

            <div className="episode-panel">
              <h2>Invité</h2>
              <p className="episode-panel-name">{episode.guest}</p>
              {episode.role ? <p>{episode.role}</p> : null}
            </div>

            {episode.tags.length > 0 ? (
              <div className="episode-panel">
                <h2>Tags</h2>
                <div className="episode-tags">
                  {episode.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              </div>
            ) : null}
          </aside>
        </section>

        {similarEpisodes.length > 0 ? (
          <section className="episode-similar">
            <h2>Épisodes similaires</h2>
            <div className="episode-similar-grid">
              {similarEpisodes.map((item) => (
                <Link key={item.slug} href={`/episodes/${item.slug}`}>
                  <span>Épisode {item.number}</span>
                  <strong>{item.title}</strong>
                  <p>{item.guest}</p>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </main>

      <style>{`
        .episode-page {
          background: #fbfaf7;
          color: #151515;
          min-height: 100vh;
        }

        .episode-hero {
          position: relative;
          min-height: 92vh;
          display: flex;
          align-items: flex-end;
          overflow: hidden;
          isolation: isolate;
        }

        .episode-hero-image {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 28%;
          z-index: -2;
        }

        .episode-hero-shade {
          position: absolute;
          inset: 0;
          z-index: -1;
          background:
            linear-gradient(90deg, rgba(0, 0, 0, 0.84), rgba(0, 0, 0, 0.2) 58%, rgba(0, 0, 0, 0.34)),
            linear-gradient(0deg, rgba(0, 0, 0, 0.8), transparent 54%);
        }

        .episode-hero-content {
          width: min(1120px, calc(100% - 40px));
          margin: 0 auto;
          padding: 90px 0 68px;
          color: white;
        }

        .episode-back {
          display: inline-flex;
          margin-bottom: 34px;
          color: white;
          text-decoration: none;
          opacity: 0.9;
        }

        .episode-kicker,
        .episode-meta {
          font-family: var(--font-body);
          font-size: 0.74rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0;
          line-height: 1.2;
        }

        .episode-hero h1 {
          max-width: 980px;
          margin: 18px 0;
          font-family: var(--font-display);
          font-size: 6.8rem;
          font-weight: 600;
          line-height: 0.92;
          letter-spacing: 0;
          text-wrap: balance;
        }

        .episode-guest,
        .episode-excerpt {
          max-width: 760px;
          font-size: 1.18rem;
          line-height: 1.78;
        }

        .episode-hero blockquote {
          max-width: 820px;
          margin: 34px 0;
          padding-left: 26px;
          border-left: 3px solid var(--color-primary-light);
          font-family: var(--font-display);
          font-size: 2.4rem;
          font-weight: 500;
          line-height: 1.16;
          font-style: italic;
          text-wrap: balance;
        }

        .episode-meta,
        .episode-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 24px;
        }

        .episode-meta span,
        .episode-meta time,
        .episode-actions a {
          border: 1px solid currentColor;
          border-radius: 999px;
          padding: 10px 14px;
          color: inherit;
          text-decoration: none;
        }

        .episode-body {
          width: min(1120px, calc(100% - 40px));
          margin: 0 auto;
          display: grid;
          grid-template-columns: minmax(0, 1fr) 330px;
          gap: 56px;
          padding: 88px 0;
        }

        .episode-main h2,
        .episode-panel h2,
        .episode-similar h2 {
          margin: 0 0 22px;
          font-family: var(--font-display);
          font-size: 1.85rem;
          font-weight: 600;
          line-height: 1.1;
          letter-spacing: 0;
        }

        .episode-main p {
          max-width: 68ch;
          font-size: 1.1rem;
          line-height: 1.9;
        }

        .episode-description {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          max-width: 64ch;
        }

        .episode-description-block {
          position: relative;
          max-width: none;
          margin: 0;
          line-height: 1.88;
        }

        .episode-description-lead {
          color: inherit;
          font-family: var(--font-display);
          font-size: clamp(1.38rem, 2.25vw, 1.78rem) !important;
          font-weight: 600;
          line-height: 1.48 !important;
        }

        .episode-description-emphasis {
          color: inherit;
          font-weight: 700;
        }

        .episode-description-inline-quote {
          color: inherit;
          font-style: italic;
          font-weight: 600;
        }

        .episode-description-callout {
          padding: 24px 26px;
          border-left: 3px solid var(--color-primary-light);
          border-radius: 0 8px 8px 0;
          background:
            linear-gradient(135deg, rgba(193, 208, 223, 0.2), rgba(255, 255, 255, 0.74));
          color: var(--color-primary-dark);
          font-size: 1.08rem;
          font-weight: 600;
        }

        .episode-description-quote {
          padding: 28px 0 28px 28px;
          border-left: 3px solid var(--color-primary-light);
          color: var(--color-primary-dark);
          font-family: var(--font-display);
          font-size: clamp(1.45rem, 2.8vw, 2.15rem);
          font-style: italic;
          font-weight: 500;
          line-height: 1.38;
        }

        .episode-description-list {
          display: grid;
          gap: 13px;
          padding: 24px 26px;
          border: 1px solid rgba(35, 48, 51, 0.12);
          border-radius: 8px;
          background: rgba(193, 208, 223, 0.13);
          list-style: none;
        }

        .episode-description-list li {
          display: grid;
          grid-template-columns: 24px minmax(0, 1fr);
          gap: 10px;
          align-items: start;
          color: inherit;
          font-size: 1.04rem;
          line-height: 1.72;
        }

        .episode-description-list-marker {
          color: var(--color-primary-light);
          font-weight: 700;
        }

        .episode-description-list + .episode-description-paragraph,
        .episode-description-callout + .episode-description-paragraph,
        .episode-description-quote + .episode-description-paragraph {
          padding-top: 1.35rem;
        }

        .episode-description-closing {
          color: inherit;
          font-weight: 600;
        }

        .episode-player {
          margin-bottom: 44px;
        }

        .episode-player iframe {
          display: block;
          border: 0;
          border-radius: 8px;
        }

        .episode-chapters {
          display: grid;
          gap: 12px;
          padding: 0;
          list-style: none;
        }

        .episode-chapters li {
          display: grid;
          grid-template-columns: 74px minmax(0, 1fr);
          gap: 16px;
          padding: 18px 0;
          border-top: 1px solid rgba(0, 0, 0, 0.16);
        }

        .episode-chapters span {
          color: #755f3e;
          font-size: 0.92rem;
          font-weight: 700;
          line-height: 1.4;
        }

        .episode-chapters strong {
          font-size: 1.02rem;
          line-height: 1.45;
        }

        .episode-sidebar {
          display: grid;
          align-content: start;
          gap: 18px;
        }

        .episode-panel {
          border: 1px solid rgba(0, 0, 0, 0.14);
          border-radius: 8px;
          padding: 24px;
          background: white;
        }

        .episode-panel-name {
          font-size: 1.04rem;
          font-weight: 700;
          line-height: 1.4;
        }

        .episode-share,
        .episode-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .episode-share {
          position: relative;
          flex-wrap: nowrap;
          gap: 9px;
        }

        .episode-share-button {
          display: grid;
          width: 44px;
          height: 44px;
          flex: 0 0 44px;
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

        .episode-share-button:focus-visible {
          outline: 2px solid currentColor;
          outline-offset: 3px;
        }

        .episode-share-button svg {
          width: 19px;
          height: 19px;
          fill: none;
          stroke: currentColor;
          stroke-linecap: round;
          stroke-linejoin: round;
          stroke-width: 1.8;
        }

        .episode-share-menu {
          position: absolute;
          z-index: 5;
          top: calc(100% + 10px);
          right: 0;
          display: grid;
          width: 190px;
          overflow: hidden;
          border: 1px solid rgba(0, 0, 0, 0.14);
          border-radius: 8px;
          background: #fff;
          box-shadow: 0 14px 32px rgba(17, 17, 17, 0.14);
        }

        .episode-share-menu a,
        .episode-share-menu button {
          width: 100%;
          border: 0;
          border-bottom: 1px solid rgba(0, 0, 0, 0.08);
          border-radius: 0;
          padding: 11px 14px;
          background: transparent;
          color: inherit;
          font: inherit;
          text-align: left;
          text-decoration: none;
          cursor: pointer;
        }

        .episode-share-menu a:last-child,
        .episode-share-menu button:last-child {
          border-bottom: 0;
        }

        .episode-share-menu a:hover,
        .episode-share-menu a:focus-visible,
        .episode-share-menu button:hover,
        .episode-share-menu button:focus-visible {
          background: rgba(193, 208, 223, 0.28);
          outline: none;
        }

        .episode-tags span {
          border-radius: 999px;
          background: #ece6dc;
          padding: 9px 12px;
          font-size: 0.86rem;
          line-height: 1.2;
        }

        .episode-similar {
          width: min(1120px, calc(100% - 40px));
          margin: 0 auto;
          padding: 0 0 80px;
        }

        .episode-similar-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
        }

        .episode-similar-grid a {
          min-height: 180px;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          gap: 8px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 8px;
          padding: 20px;
          background: var(--color-primary-dark);
          box-shadow: 0 14px 34px rgba(35, 48, 51, 0.12);
          color: #fff;
          text-decoration: none;
        }

        .episode-similar-grid span {
          color: var(--color-primary-light);
          font-size: 0.74rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0;
        }

        .episode-similar-grid strong {
          font-family: var(--font-display);
          font-size: 1.35rem;
          font-weight: 600;
          line-height: 1.12;
        }

        .episode-similar-grid p {
          margin: 0;
        }

        @media (max-width: 820px) {
          .episode-hero {
            min-height: 86vh;
          }

          .episode-hero-content {
            padding-bottom: 44px;
          }

          .episode-hero h1 {
            font-size: 4.2rem;
            line-height: 0.96;
          }

          .episode-guest,
          .episode-excerpt {
            font-size: 1.04rem;
            line-height: 1.72;
          }

          .episode-hero blockquote {
            font-size: 1.9rem;
            line-height: 1.18;
          }

          .episode-body {
            grid-template-columns: 1fr;
            gap: 28px;
            padding: 60px 0;
          }

          .episode-similar-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 560px) {
          .episode-description {
            gap: 1.05rem;
          }

          .episode-description-callout,
          .episode-description-list {
            padding: 20px;
          }

          .episode-description-quote {
            padding: 22px 0 22px 20px;
          }

          .episode-share {
            gap: 6px;
          }

          .episode-share-button {
            width: 40px;
            height: 40px;
            flex-basis: 40px;
          }

          .episode-hero h1 {
            font-size: 3rem;
            line-height: 1;
          }

          .episode-hero blockquote {
            font-size: 1.45rem;
            padding-left: 18px;
          }

          .episode-main h2,
          .episode-panel h2,
          .episode-similar h2 {
            font-size: 1.45rem;
          }
        }
      `}</style>
    </>
  );
}
