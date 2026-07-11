const PLAYLIST_PLACEHOLDERS = [
  {
    title: "Carrière & métier",
    description:
      "Un futur parcours d'écoute autour des réalités professionnelles, des choix de carrière et de la construction d'un chemin artistique.",
  },
  {
    title: "Création & transmission",
    description:
      "Un emplacement dédié aux épisodes sur la pédagogie, la scène, la création chorégraphique et le partage du savoir.",
  },
  {
    title: "Corps & équilibre",
    description:
      "Une future playlist pour rassembler les conversations autour du corps, de la prévention, de la santé et du rythme de vie.",
  },
  {
    title: "Culture danse",
    description:
      "Une entrée pensée pour explorer les styles, les héritages, les influences et les récits culturels autour de la danse.",
  },
]

export default function PlaylistsThematiquesPage() {
  return (
    <main id="episodes" className="episodes-page listen-page">
      <section className="episodes-header listen-hero">
        <div className="container">
          <span className="section-label">Podcast Dance Lab</span>
          <h1>Playlists thématiques</h1>
          <p>
            Des parcours d'écoute éditorialisés seront bientôt proposés pour
            explorer Dance Lab par sujet, par besoin ou par moment de parcours.
          </p>
        </div>
      </section>

      <section className="episodes-list listen-curation">
        <div className="container">
          <div className="listen-curation-header">
            <span className="section-label">À venir</span>
            <h2>Des playlists pensées comme des dossiers audio</h2>
            <p>
              Chaque espace ci-dessous servira de point d'entrée vers une
              sélection d'épisodes cohérente, claire et facile à parcourir.
            </p>
          </div>

          <div className="listen-placeholder-grid listen-placeholder-grid--wide">
            {PLAYLIST_PLACEHOLDERS.map((playlist) => (
              <article key={playlist.title} className="listen-placeholder-card">
                <span>Playlist</span>
                <h3>{playlist.title}</h3>
                <p>{playlist.description}</p>
                <small>En cours d'enrichissement</small>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
