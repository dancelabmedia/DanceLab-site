const styles = [
  "Waacking",
  "Krump",
  "Heels",
  "Danse contemporaine",
  "Hip-hop",
  "Jazz",
]

export default function HistoireDesStylesPage() {
  return (
    <main className="discover-page">
      <section className="discover-hero discover-hero--compact">
        <div className="container">
          <span className="section-label">Découvrir</span>
          <h1>Histoire des styles</h1>
          <p>
            Une rubrique pour donner des repères : origines, contextes, figures,
            vocabulaire et évolutions des styles qui traversent la danse.
          </p>
        </div>
      </section>

      <section className="discover-index">
        <div className="container">
          <div className="discover-section-heading">
            <span className="section-label">Repères</span>
            <h2>Fiches styles à construire</h2>
            <p>
              Ces emplacements prépareront des contenus pédagogiques, clairs et
              documentés, sans réduire les styles à de simples définitions.
            </p>
          </div>

          <div className="discover-grid discover-grid--compact">
            {styles.map((style) => (
              <article key={style} className="discover-card">
                <span>Style</span>
                <h3>{style}</h3>
                <p>
                  Origines, codes, figures clés, vocabulaire et ressources à
                  rassembler dans une fiche éditoriale dédiée.
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
