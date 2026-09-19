import { requestLocale } from "@/lib/i18n/server"
import { uiText } from "@/data/i18n/messages"

const styles = [
  "Waacking",
  "Krump",
  "Heels",
  "Danse contemporaine",
  "Hip-hop",
  "Jazz",
]

export default async function HistoireDesStylesPage() {
  const locale = await requestLocale()
  const t = (text: string) => uiText(locale, text)

  return (
    <main className="discover-page">
      <section className="discover-hero discover-hero--compact">
        <div className="container">
          <span className="section-label">{t('Découvrir')}</span>
          <h1>{t('Histoire des styles')}</h1>
          <p>
            {t('Une rubrique pour donner des repères : origines, contextes, figures, vocabulaire et évolutions des styles qui traversent la danse.')}
          </p>
        </div>
      </section>

      <section className="discover-index">
        <div className="container">
          <div className="discover-section-heading">
            <span className="section-label">{t('Repères')}</span>
            <h2>{t('Fiches styles à construire')}</h2>
            <p>
              {t('Ces emplacements prépareront des contenus pédagogiques, clairs et documentés, sans réduire les styles à de simples définitions.')}
            </p>
          </div>

          <div className="discover-grid discover-grid--compact">
            {styles.map((style) => (
              <article key={style} className="discover-card">
                <span>{t('Style')}</span>
                <h3>{style}</h3>
                <p>
                  {t('Origines, codes, figures clés, vocabulaire et ressources à rassembler dans une fiche éditoriale dédiée.')}
                </p>
                <small>{t('À compléter')}</small>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
