const artists = [
  "Chorégraphes",
  "Interprètes",
  "Pédagogues",
  "Créateurs et créatrices hybrides",
]

export default function ArtistesASuivrePage() {
  return (
    <main className="discover-page">
      <section className="discover-hero discover-hero--compact">
        <div className="container">
          <span className="section-label">Découvrir</span>
          <h1>Artistes à suivre</h1>
          <p>
            Un espace pour identifier des présences artistiques fortes, raconter
            des parcours et prolonger les interviews par des portraits éditoriaux.
          </p>
        </div>
      </section>

      <section className="discover-index">
        <div className="container">
          <div className="discover-grid">
            {artists.map((artistType) => (
              <article key={artistType} className="discover-card">
                <span>Portrait</span>
                <h3>{artistType}</h3>
                <p>
                  Sélection éditoriale à construire avec portraits, extraits
                  d'interviews et liens vers les épisodes associés.
                </p>
                <small>À compléter</small>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
