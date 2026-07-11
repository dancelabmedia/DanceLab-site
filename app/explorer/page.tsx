import { explorerSections } from "./explorer-data"

export default function ExplorerPage() {
  return (
    <main className="explorer-page">
      <section className="explorer-hero">
        <div className="container">
          <span className="section-label">Explorer</span>
          <h1>Entrer dans l'univers de la danse par ses langages, ses artistes et ses métiers.</h1>
          <p>
            Un espace pour comprendre les styles, les scènes, les parcours et les
            écosystèmes qui composent la culture chorégraphique d'aujourd'hui.
          </p>
        </div>
      </section>

      <section className="explorer-feature">
        <div className="container explorer-feature-grid">
          <article className="explorer-lead-card">
            <span>Cartographie Dance Lab</span>
            <h2>Une porte d'entrée vers toute la culture danse.</h2>
            <p>
              Cette rubrique est pensée comme un guide vivant : elle relie les
              esthétiques, les personnes, les collectifs et les savoir-faire pour
              donner des repères clairs sans enfermer la danse dans des cases.
            </p>
          </article>

          <div className="explorer-mini-index">
            {explorerSections.slice(0, 3).map((section) => (
              <a key={section.slug} href={`/explorer/${section.slug}`}>
                <span>{section.kicker}</span>
                <strong>{section.label}</strong>
                <small>Explorer</small>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="explorer-index">
        <div className="container">
          <div className="explorer-section-heading">
            <span className="section-label">Rubriques</span>
            <h2>Des pages prêtes à accueillir une ligne éditoriale complète</h2>
            <p>
              Chaque entrée combine repères, collections et emplacements
              éditoriaux pour enrichir progressivement Dance Lab.
            </p>
          </div>

          <div className="explorer-grid">
            {explorerSections.map((section) => (
              <a key={section.slug} href={`/explorer/${section.slug}`} className="explorer-card">
                <span>{section.kicker}</span>
                <h3>{section.label}</h3>
                <p>{section.intro}</p>
                <small>Découvrir</small>
              </a>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
