import { episodes } from "../../../data/episodes"

export default function DerniersEpisodesPage() {
  return (
    <main id="episodes" className="episodes-page">

      <section className="episodes-header">
        <div className="container">

          <span className="section-label">
            Podcast Dance Lab
          </span>

          <h1>
            Derniers épisodes
          </h1>

          <p>
            Conversations, parcours et réflexions autour de la danse, du métier d'artiste et de tout ce qui se cache derrière la scène.
          </p>

          <div className="episodes-stats">

            <div className="episodes-search">
              <input
                type="text"
                placeholder="Rechercher un invité, un thème..."
              />
            </div>

          </div>


          <div className="episodes-filters">

            <button className="active">
              Tous
            </button>

            <button>
              Droit
            </button>

            <button>
              Santé mentale
            </button>

            <button>
              Carrière
            </button>

            <button>
              Entrepreneuriat
            </button>

          </div>

        </div>
      </section>


      <section className="episodes-list">

        <div className="container">

          <div className="episodes-grid">

            {episodes.map((episode) => (

              <article
                key={episode.number}
                className="episode-card"
              >

                <div className="episode-image-wrapper">

                  <img
                    src={episode.image}
                    alt={episode.guest}
                    className="episode-image"
                  />

                </div>


                <div className="episode-content">

                  <span className="episode-meta">
                    Épisode {episode.number}
                  </span>


                  <h2>
                    {episode.title}
                  </h2>


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