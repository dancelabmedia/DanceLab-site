import { requestLocale } from "@/lib/i18n/server"
import { uiText } from "@/data/i18n/messages"

export default async function PlaylistsThematiquesPage() {
  const locale = await requestLocale()
  const t = (text: string) => uiText(locale, text)

  const PLAYLIST_PLACEHOLDERS = [
    {
      title: t("Carrière & métier"),
      description: t("Un futur parcours d'écoute autour des réalités professionnelles, des choix de carrière et de la construction d'un chemin artistique."),
    },
    {
      title: t("Création & transmission"),
      description: t("Un emplacement dédié aux épisodes sur la pédagogie, la scène, la création chorégraphique et le partage du savoir."),
    },
    {
      title: t("Corps & équilibre"),
      description: t("Une future playlist pour rassembler les conversations autour du corps, de la prévention, de la santé et du rythme de vie."),
    },
    {
      title: t("Culture danse"),
      description: t("Une entrée pensée pour explorer les styles, les héritages, les influences et les récits culturels autour de la danse."),
    },
  ]

  return (
    <main id="episodes" className="episodes-page listen-page">
      <section className="episodes-header listen-hero">
        <div className="container">
          <span className="section-label">{t('Podcast Dance Lab')}</span>
          <h1>{t('Playlists thématiques')}</h1>
          <p>
            {t("Des parcours d'écoute éditorialisés seront bientôt proposés pour explorer Dance Lab par sujet, par besoin ou par moment de parcours.")}
          </p>
        </div>
      </section>

      <section className="episodes-list listen-curation">
        <div className="container">
          <div className="listen-curation-header">
            <span className="section-label">{t('À venir')}</span>
            <h2>{t("Des playlists pensées comme des dossiers audio")}</h2>
            <p>
              {t("Chaque espace ci-dessous servira de point d'entrée vers une sélection d'épisodes cohérente, claire et facile à parcourir.")}
            </p>
          </div>

          <div className="listen-placeholder-grid listen-placeholder-grid--wide">
            {PLAYLIST_PLACEHOLDERS.map((playlist) => (
              <article key={playlist.title} className="listen-placeholder-card">
                <span>{t('Playlist')}</span>
                <h3>{playlist.title}</h3>
                <p>{playlist.description}</p>
                <small>{t("En cours d'enrichissement")}</small>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
