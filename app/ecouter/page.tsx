'use client'

import { episodes } from "../../data/episodes"
import Link from "next/link"
import { useState } from "react"

const EPISODES_PAGE_SIZE = 12

function getGuestCardImage(episode: (typeof episodes)[number]) {
  const episodeImageName = episode.image
    .split("/")
    .pop()
    ?.replace(/\.png\.png$/i, ".png")
  const sourceImageName = episode.sourceImage
    .split("/")
    .pop()
    ?.replace(/\.png\.png$/i, ".png")
  const optimizedImageName =
    episodeImageName && episodeImageName !== "logo.png"
      ? episodeImageName
      : sourceImageName

  return optimizedImageName
    ? `/images/les-invites/${optimizedImageName}`
    : episode.image
}

export default function EcouterPage() {
  const [visibleCount, setVisibleCount] = useState(EPISODES_PAGE_SIZE)
  const allEpisodesVisible = visibleCount >= episodes.length
  const visibleEpisodes = episodes.slice(0, visibleCount)

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

            {visibleEpisodes.map((episode) => (
              <Link
                key={episode.number}
                href={`/episodes/${episode.slug}`}
                className="episode-card"
              >

                <img
                  src={getGuestCardImage(episode)}
                  alt={episode.guest}
                  className="episode-image"
                  onError={(event) => {
                    const fallbackImage = episode.image || episode.sourceImage

                    if (
                      fallbackImage &&
                      !event.currentTarget.src.endsWith(fallbackImage)
                    ) {
                      event.currentTarget.src = fallbackImage
                    }
                  }}
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

          {episodes.length > EPISODES_PAGE_SIZE && (
            <div className="episodes-load-more">
              <button
                type="button"
                className="btn btn-primary episodes-more-button"
                aria-expanded={allEpisodesVisible}
                onClick={() =>
                  setVisibleCount((currentCount) =>
                    allEpisodesVisible
                      ? EPISODES_PAGE_SIZE
                      : Math.min(currentCount + EPISODES_PAGE_SIZE, episodes.length)
                  )
                }
              >
                {allEpisodesVisible ? "Voir moins" : "Voir plus"}
              </button>
            </div>
          )}

        </div>
      </section>

    </main>
  )
}
