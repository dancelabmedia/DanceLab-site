const PLACEHOLDERS = [
  {
    label: "Sélection 01",
    title: "Parcours fondateurs",
    description:
      "Un espace pensé pour accueillir les épisodes qui racontent les trajectoires les plus marquantes.",
  },
  {
    label: "Sélection 02",
    title: "Conversations essentielles",
    description:
      "Une future sélection d'épisodes pour comprendre les grands sujets qui traversent le milieu de la danse.",
  },
  {
    label: "Sélection 03",
    title: "À écouter pour commencer",
    description:
      "Une entrée éditoriale pour guider les nouvelles auditrices et les nouveaux auditeurs de Dance Lab.",
  },
]

export default function IncontournablesPage() {
  return (
    <main id="episodes" className="episodes-page listen-page">
      <section className="episodes-header listen-hero">
        <div className="container">
          <span className="section-label">Podcast Dance Lab</span>
          <h1>Incontournables</h1>
          <p>
            Une page pensée comme une sélection éditoriale premium. Les épisodes
            incontournables de Dance Lab y seront organisés prochainement par
            parcours, sujets et moments forts.
          </p>
        </div>
      </section>

      <section className="episodes-list listen-curation">
        <div className="container">
          <div className="listen-curation-header">
            <span className="section-label">Sélection éditoriale</span>
            <h2>Les futurs repères d'écoute</h2>
            <p>
              Ces emplacements prépareront une navigation plus guidée, pour
              retrouver facilement les conversations les plus fortes du média.
            </p>
          </div>

          <div className="listen-placeholder-grid">
            {PLACEHOLDERS.map((item) => (
              <article key={item.title} className="listen-placeholder-card">
                <span>{item.label}</span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <small>À compléter</small>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
