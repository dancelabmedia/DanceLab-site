import { episodes } from "../../../data/episodes"
import Link from "next/link"
import { requestLocale } from "@/lib/i18n/server"
import { uiText } from "@/data/i18n/messages"

export default async function DerniersEpisodesPage() {
  const locale = await requestLocale()
  const t = (text: string) => uiText(locale, text)
  return (
    <main id="episodes" className="episodes-page">

      <section className="episodes-header">
        <div className="container">

          <span className="section-label">{t('Podcast Dance Lab')}</span>

          <h1>{t('Tous les épisodes')}</h1>

          <p>{t("Conversations, parcours et réflexions autour de la danse, du métier d'artiste et de tout ce qui se cache derrière la scène.")}</p>

          <div className="episodes-stats">
            <div className="episodes-search">
              <input type="text" placeholder={t('Rechercher un invité, un thème...')} />
            </div>
          </div>

          <div className="episodes-filters">
            <button className="active">{t('Tous')}</button>
            <button>{t('Droit')}</button>
            <button>{t('Santé mentale')}</button>
            <button>{t('Carrière')}</button>
            <button>{t('Entrepreneuriat')}</button>
          </div>

        </div>
      </section>

      <section className="episodes-list">
        <div className="container">
          <div className="episodes-grid">
            {episodes.map((episode) => (
              <Link key={episode.number} href={`/episodes/${episode.slug}`} className="episode-card">
                <div className="episode-image-wrapper">
                  <img src={episode.image} alt={episode.guest} className="episode-image" />
                </div>
                <div className="episode-content">
                  <span className="episode-meta">{t('Épisode')} {episode.number}</span>
                  <h2>{episode.title}</h2>
                  <h3>{locale === 'en' ? `With ${episode.guest}` : `Avec ${episode.guest}`}</h3>
                  <p>{episode.excerpt}</p>
                  <span className="btn btn-primary">{t("Écouter l'épisode")}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

    </main>
  )
}
