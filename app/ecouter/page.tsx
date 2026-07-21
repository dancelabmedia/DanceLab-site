import { episodes } from "../../data/episodes"
import Link from "next/link"

export default function EcouterPage() {
  return (
    <main id="episodes" className="episodes-page">

      <section className="episodes-header">
        <div className="container">

          <span className="section-label">
            Podcast Dance Lab
          </span>

          <h1>
            Tous les épisodes
          </h1>

          <p>
            Conversations, parcours et réflexions autour de la danse,
            du métier d'artiste et de tout ce qui se cache derrière la scène.
          </p>

        </div>
      </section>


      <section className="episodes-list">
        <div className="container">

          <div className="episodes-grid">

            {episodes.map((episode) => (
              <Link
                key={episode.number}
                href={`/episodes/${episode.slug}`}
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

                  <h2>
                    {episode.title}
                  </h2>

                  <h3>
                    Avec {episode.guest}
                  </h3>

                  <p>
                    {episode.excerpt}
                  </p>

                  <span className="btn btn-primary">
                    Écouter l'épisode
                  </span>

                </div>

              </Link>
            ))}

          </div>

        </div>
      </section>

    </main>
  )
}
