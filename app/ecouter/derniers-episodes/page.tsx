import { episodes } from "../../../data/episodes"

export default function DerniersEpisodesPage() {
  return (
    <main className="episodes-page">

      <section className="episodes-header">
        <div className="container">
          <span className="section-label">
            Podcast Dance Lab
          </span>

          <h1>
            Derniers épisodes
          </h1>

          <p>
            Retrouvez les dernières conversations Dance Lab.
          </p>
        </div>
      </section>

      <section className="episodes-list">
        <div className="container">

          <div className="episodes-grid">

            {episodes.slice(0, 9).map((episode) => (
              <article
                key={episode.number}
                className="episode-card"
              >

                <img
                  src={episode.image}
                  alt={episode.guest}
                  className="episode-image"
                />

                <div className="episode-content">

                  <span className="episode-number">
                    Épisode {episode.number}
                  </span>

                  <h2>{episode.title}</h2>

                  <h3>
                    Avec {episode.guest}
                  </h3>

                  <p>
                    {episode.description}
                  </p>

                  <a
                    href={episode.link}
                    target="_blank"
                    className="btn btn-primary"
                  >
                    Écouter l'épisode
                  </a>

                </div>

              </article>
            ))}

          </div>

        </div>
      </section>

    </main>
  )
}