import { featuredDiscoverArticles } from "../discover-data"

export default function DecryptagesPage() {
  return (
    <main className="discover-page">
      <section className="discover-hero discover-hero--compact">
        <div className="container">
          <span className="section-label">Découvrir</span>
          <h1>Décryptages</h1>
          <p>
            Des analyses pour comprendre les enjeux culturels, professionnels et
            artistiques qui se cachent derrière les images, les scènes et les parcours.
          </p>
        </div>
      </section>

      <section className="discover-feature">
        <div className="container discover-feature-grid">
          <article className="discover-lead-card">
            <span>{featuredDiscoverArticles[0].category}</span>
            <h2>{featuredDiscoverArticles[0].title}</h2>
            <p>{featuredDiscoverArticles[0].meta}</p>
            <a href="/decouvrir/decryptages">Dossier à enrichir</a>
          </article>
          <div className="discover-stack">
            {["Économie du métier", "Santé mentale", "Transmission", "Droits des artistes"].map((topic) => (
              <article key={topic} className="discover-stack-item">
                <span>Angle</span>
                <strong>{topic}</strong>
                <small>À compléter</small>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
