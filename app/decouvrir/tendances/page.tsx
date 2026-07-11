const trends = [
  "Formats courts et transmission",
  "Scène, réseaux sociaux et visibilité",
  "Nouveaux espaces de création",
  "Danse et bien-être professionnel",
]

export default function TendancesPage() {
  return (
    <main className="discover-page">
      <section className="discover-hero discover-hero--compact">
        <div className="container">
          <span className="section-label">Découvrir</span>
          <h1>Tendances</h1>
          <p>
            Une veille éditoriale pour suivre les signaux qui traversent la danse,
            sans céder à l'effet de mode ou au contenu jetable.
          </p>
        </div>
      </section>

      <section className="discover-index">
        <div className="container">
          <div className="discover-grid">
            {trends.map((trend) => (
              <article key={trend} className="discover-card">
                <span>Signal</span>
                <h3>{trend}</h3>
                <p>
                  Observation éditoriale à développer avec exemples, références
                  et liens vers les épisodes concernés.
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
