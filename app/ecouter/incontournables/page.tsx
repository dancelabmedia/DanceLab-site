import { requestLocale } from "@/lib/i18n/server"
import { uiText } from "@/data/i18n/messages"

export default async function IncontournablesPage() {
  const locale = await requestLocale()
  const t = (text: string) => uiText(locale, text)

  const PLACEHOLDERS = [
    {
      label: "Sélection 01",
      title: t("Parcours fondateurs"),
      description: t("Un espace pensé pour accueillir les épisodes qui racontent les trajectoires les plus marquantes."),
    },
    {
      label: "Sélection 02",
      title: t("Conversations essentielles"),
      description: t("Une future sélection d'épisodes pour comprendre les grands sujets qui traversent le milieu de la danse."),
    },
    {
      label: "Sélection 03",
      title: t("À écouter pour commencer"),
      description: t("Une entrée éditoriale pour guider les nouvelles auditrices et les nouveaux auditeurs de Dance Lab."),
    },
  ]

  return (
    <main id="episodes" className="episodes-page listen-page">
      <section className="episodes-header listen-hero">
        <div className="container">
          <span className="section-label">{t('Podcast Dance Lab')}</span>
          <h1>{t('Incontournables')}</h1>
          <p>
            {t("Une page pensée comme une sélection éditoriale premium. Les épisodes incontournables de Dance Lab y seront organisés prochainement par parcours, sujets et moments forts.")}
          </p>
        </div>
      </section>

      <section className="episodes-list listen-curation">
        <div className="container">
          <div className="listen-curation-header">
            <span className="section-label">{t('Sélection éditoriale')}</span>
            <h2>{t("Les futurs repères d'écoute")}</h2>
            <p>
              {t("Ces emplacements prépareront une navigation plus guidée, pour retrouver facilement les conversations les plus fortes du média.")}
            </p>
          </div>

          <div className="listen-placeholder-grid">
            {PLACEHOLDERS.map((item) => (
              <article key={item.label} className="listen-placeholder-card">
                <span>{item.label}</span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <small>{t('À compléter')}</small>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
