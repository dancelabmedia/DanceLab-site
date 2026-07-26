import type { Metadata } from "next"
import StylesExplorer from "./StylesExplorer"
import { danceStyles } from "./styles-data"

export const metadata: Metadata = {
  title: "Explorer les styles de danse | Dance Lab",
  description:
    "Une encyclopédie vivante des styles de danse : histoire, origines, vocabulaire, figures clés, musiques et ressources. Break, waacking, voguing, classique, contemporain et plus encore.",
}

export default function StylesDeDansePage() {
  return (
    <main className="styles-page">
      <section className="styles-hero">
        <div className="container">
          <span className="section-label">Explorer · Styles de danse</span>
          <h1>
            Comprendre les styles comme des cultures en mouvement.
          </h1>
          <p>
            Hip-hop, contemporain, classique, afro, waacking, krump ou heels : chaque style porte une histoire,
            des codes, une énergie et une manière d'habiter le corps. Une encyclopédie vivante, construite
            progressivement, pour relier les danses à leurs territoires, leurs communautés et leurs combats.
          </p>

          <div className="styles-hero-stats">
            <div>
              <strong>{danceStyles.length}</strong>
              <span>styles documentés</span>
            </div>
            <div>
              <strong>27+</strong>
              <span>styles à venir</span>
            </div>
            <div>
              <strong>{danceStyles.reduce((acc, s) => acc + s.episodeLinks.length, 0)}</strong>
              <span>épisodes reliés</span>
            </div>
          </div>
        </div>
      </section>

      <section className="styles-index">
        <div className="container">
          <StylesExplorer styles={danceStyles} />
        </div>
      </section>

      <section className="styles-about">
        <div className="container">
          <div className="styles-about-grid">
            <div className="styles-about-card">
              <span>01</span>
              <h3>Des origines précises</h3>
              <p>
                Chaque fiche situe le style dans son époque, son territoire et ses communautés d'origine.
                Pas de formules vagues : des villes, des quartiers, des personnes.
              </p>
            </div>
            <div className="styles-about-card">
              <span>02</span>
              <h3>Des ressources vérifiées</h3>
              <p>
                Livres, documentaires, archives, sites institutionnels. Chaque ressource est vérifiée et
                sourcée. Aucun faux titre, aucun lien inventé.
              </p>
            </div>
            <div className="styles-about-card">
              <span>03</span>
              <h3>Reliée au podcast</h3>
              <p>
                Chaque style est connecté aux épisodes Dance Lab correspondants pour aller plus loin
                avec les praticiens qui le font vivre.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
