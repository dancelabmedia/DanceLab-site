import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

type Episode = {
  image: string;
  slug: string;
  number: string;
  title: string;
  guest: string;
  role: string;
  quote: string;
  excerpt: string;
  description: string;
  duration: string;
  category: string;
  spotifyEmbedUrl?: string;
  appleUrl?: string;
  youtubeUrl?: string;
  chapters: { time: string; title: string }[];
  tags: string[];
};

const EPISODES: Episode[] = [
    {
  image: "yasminehabib118.png",
  slug: "118-yasmine-habib",
  number: "118",
  title:
    "Ce que le milieu de la danse ne montre pas : hypocrisie, critiques et toxicité",
  guest: "Yasmine Habib",
  role: "Danseuse · Heels · Créatrice",
  quote:
    "Une conversation sans filtre autour du heels, de la transmission, des valeurs, de l'hypocrisie dans le milieu de la danse, des contrats et des droits des artistes.",
  excerpt:
    "Une conversation sans filtre autour du heels, de la transmission, des valeurs, de l'hypocrisie dans le milieu de la danse, des contrats et des droits des artistes.",
  description:
    "Dans cet épisode de Dance Lab, Yasmine Habib parle sans détour du milieu de la danse : les critiques, la toxicité, la transmission, les valeurs, mais aussi les contrats, les droits des artistes et la manière de protéger sa place tout en restant alignée avec elle-même.",
  duration: "1 h",
  category: "Dernier épisode",
  spotifyEmbedUrl:
    "https://open.spotify.com/embed/episode/2VLDcDqB2rMrIJWIGWuz0U",
  appleUrl:
    "https://podcasts.apple.com/us/podcast/118-ce-que-le-milieu-de-la-danse-ne-montre-pas/id1743269399?i=1000775727039",
  youtubeUrl: "https://youtu.be/l24JCicz3aw?si=FwPgv9BxgYfBpe2R",
  chapters: [],
  tags: ["Heels", "Transmission", "Milieu de la danse"],
},
{
    image: "tatianaseguin117.png",
    slug: "117-tatiana-seguin",
    number: "117",
    title: "Tatiana Seguin : choisir l'humain avant la carrière",
    guest: "Tatiana Seguin",
    role: "Chorégraphe · Cie Tatiana Seguin",
    quote: "Avant de faire un choix carriériste, je fais un choix humain",
    excerpt:
      "Une conversation sur la création, l'humain, le collectif et les choix qui dessinent une trajectoire artistique.",
    description:
      "Dans cet épisode de Dance Lab, Tatiana Seguin revient sur son parcours, sa manière de créer, son rapport au groupe et la place de l'humain dans les décisions artistiques. Un échange sensible sur la carrière, l'exigence et la fidélité à ses valeurs.",
    duration: "À renseigner",
    category: "Conversation",
    spotifyEmbedUrl: "",
    appleUrl: "",
    youtubeUrl: "",
    chapters: [
      { time: "00:00", title: "Introduction" },
      { time: "05:00", title: "Le parcours de Tatiana Seguin" },
      { time: "15:00", title: "Créer avec et pour l'humain" },
      { time: "30:00", title: "La compagnie, le collectif et les choix" },
    ],
    tags: ["Chorégraphie", "Création", "Humain"],
  },
  {
    image: "julienramade116.png",
    slug: "116-julien-ramade",
    number: "116",
    title: "Julien Ramade : la force d'une formation",
    guest: "Julien Ramade",
    role: "Danseur · Chorégraphe",
    quote: "Il ne faut pas sous-estimer la force d’une formation.",
    excerpt:
      "Un épisode autour de la formation, de la rigueur et des fondations nécessaires pour construire une pratique durable.",
    description:
      "Julien Ramade partage sa vision du métier, l'importance de la formation et ce que l'apprentissage apporte à un danseur au fil du temps. Un échange sur la technique, la transmission et la construction d'une identité artistique.",
    duration: "À renseigner",
    category: "Conversation",
    spotifyEmbedUrl: "",
    appleUrl: "",
    youtubeUrl: "",
    chapters: [],
    tags: ["Formation", "Technique", "Transmission"],
  },
  {
    image: "lauramalieleclerc115.png",
    slug: "115-laura-malie-leclerc",
    number: "115",
    title: "Laura Malié-Leclerc : écouter le corps du danseur",
    guest: "Laura Malié-Leclerc",
    role: "Kinésithérapeute du sport spécialisée dans la danse",
    quote:
      "La douleur c’est le premier signal du corps pour te dire qu’il y a quelque chose qui ne va pas.",
    excerpt:
      "Un épisode essentiel sur la douleur, la prévention, la récupération et la santé des danseurs.",
    description:
      "Laura Malié-Leclerc explique comment mieux comprendre les signaux du corps, prévenir les blessures et accompagner les danseurs dans une pratique plus durable. Une conversation précieuse pour tous ceux qui dansent, enseignent ou accompagnent le mouvement.",
    duration: "À renseigner",
    category: "Santé",
    spotifyEmbedUrl: "",
    appleUrl: "",
    youtubeUrl: "",
    chapters: [],
    tags: ["Santé", "Prévention", "Corps"],
  },
  {
    image: "grichkarootz113.png",
    slug: "113-grichka-rootz",
    number: "113",
    title: "Grichka Rootz : le krump comme langage complet",
    guest: "Grichka Rootz",
    role: "Danseur · Chorégraphe · Pionnier du krump en France",
    quote:
      "Le jiu-jitsu, pour moi c’est comme le krump dans la danse : c’est complet",
    excerpt:
      "Une plongée dans le krump, ses racines, son intensité et sa puissance expressive.",
    description:
      "Grichka Rootz revient sur son parcours, l'émergence du krump en France et la manière dont cette danse engage le corps, l'esprit et l'histoire personnelle. Un épisode sur la puissance du mouvement et la profondeur d'une culture.",
    duration: "À renseigner",
    category: "Culture",
    spotifyEmbedUrl: "",
    appleUrl: "",
    youtubeUrl: "",
    chapters: [],
    tags: ["Krump", "Culture urbaine", "Expression"],
  },
];

function getEpisodeBySlug(slug: string) {
  return EPISODES.find((episode) => episode.slug === slug);
}

function getSimilarEpisodes(currentSlug: string) {
  return EPISODES.filter((episode) => episode.slug !== currentSlug).slice(0, 3);
}

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return EPISODES.map((episode) => ({
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

  const imageUrl = `/episodes/${episode.image}`;

  return {
    title: `${episode.title} | Dance Lab`,
    description: episode.excerpt,
    openGraph: {
      title: `${episode.title} | Dance Lab`,
      description: episode.excerpt,
      images: [imageUrl],
      type: "article",
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
  const episodeUrl = `https://dancelab.fr/episodes/${episode.slug}`;

  return (
    <>
      <main className="episode-page">
        <section className="episode-hero">
          <img
            className="episode-hero-image"
            src={`/episodes/${episode.image}`}
            alt={episode.guest}
          />

          <div className="episode-hero-shade" />

          <div className="episode-hero-content">
            <Link className="episode-back" href="/">
              ← Retour à l'accueil
            </Link>

            <p className="episode-kicker">
              Épisode {episode.number} · {episode.category}
            </p>

            <h1>{episode.title}</h1>

            <p className="episode-guest">
              Avec {episode.guest}, {episode.role}
            </p>

            <blockquote>“{episode.quote}”</blockquote>

            <p className="episode-excerpt">{episode.excerpt}</p>

            <div className="episode-meta">
              <span>{episode.duration}</span>
              <span>{episode.tags[0]}</span>
            </div>

            <div className="episode-actions">
              {episode.spotifyEmbedUrl ? (
                <a href={episode.spotifyEmbedUrl}>Spotify</a>
              ) : null}
              {episode.appleUrl ? <a href={episode.appleUrl}>Apple Podcasts</a> : null}
              {episode.youtubeUrl ? <a href={episode.youtubeUrl}>YouTube</a> : null}
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
            <p>{episode.description}</p>

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
              <div className="episode-share">
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                    episodeUrl
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  LinkedIn
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
                    episodeUrl
                  )}&text=${encodeURIComponent(episode.title)}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  X
                </a>
              </div>
            </div>

            <div className="episode-panel">
              <h2>Invité</h2>
              <p className="episode-panel-name">{episode.guest}</p>
              <p>{episode.role}</p>
            </div>

            <div className="episode-panel">
              <h2>Tags</h2>
              <div className="episode-tags">
                {episode.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </div>
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
          z-index: -2;
        }

        .episode-hero-shade {
          position: absolute;
          inset: 0;
          z-index: -1;
          background:
            linear-gradient(90deg, rgba(0, 0, 0, 0.82), rgba(0, 0, 0, 0.22)),
            linear-gradient(0deg, rgba(0, 0, 0, 0.78), transparent 50%);
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
          font-size: 0.82rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0;
        }

        .episode-hero h1 {
          max-width: 940px;
          margin: 14px 0;
          font-size: clamp(2.6rem, 7vw, 6.6rem);
          line-height: 0.95;
          letter-spacing: 0;
        }

        .episode-guest,
        .episode-excerpt {
          max-width: 760px;
          font-size: clamp(1rem, 2vw, 1.22rem);
          line-height: 1.55;
        }

        .episode-hero blockquote {
          max-width: 820px;
          margin: 26px 0;
          padding-left: 22px;
          border-left: 3px solid #d8c299;
          font-size: clamp(1.2rem, 2.5vw, 2rem);
          line-height: 1.35;
          font-style: italic;
        }

        .episode-meta,
        .episode-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 24px;
        }

        .episode-meta span,
        .episode-actions a,
        .episode-share a {
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
          gap: 48px;
          padding: 72px 0;
        }

        .episode-main h2,
        .episode-panel h2,
        .episode-similar h2 {
          margin: 0 0 18px;
          font-size: 1.25rem;
        }

        .episode-main p {
          font-size: 1.08rem;
          line-height: 1.75;
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
          padding: 16px 0;
          border-top: 1px solid rgba(0, 0, 0, 0.16);
        }

        .episode-chapters span {
          color: #755f3e;
          font-weight: 800;
        }

        .episode-sidebar {
          display: grid;
          align-content: start;
          gap: 18px;
        }

        .episode-panel {
          border: 1px solid rgba(0, 0, 0, 0.14);
          border-radius: 8px;
          padding: 22px;
          background: white;
        }

        .episode-panel-name {
          font-weight: 800;
        }

        .episode-share,
        .episode-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .episode-tags span {
          border-radius: 999px;
          background: #ece6dc;
          padding: 9px 12px;
          font-size: 0.9rem;
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
          border-radius: 8px;
          padding: 20px;
          background: #151515;
          color: white;
          text-decoration: none;
        }

        .episode-similar-grid span {
          color: #d8c299;
          font-size: 0.82rem;
          font-weight: 800;
          text-transform: uppercase;
        }

        .episode-similar-grid strong {
          font-size: 1.15rem;
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

          .episode-body {
            grid-template-columns: 1fr;
            gap: 28px;
            padding: 48px 0;
          }

          .episode-similar-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}
