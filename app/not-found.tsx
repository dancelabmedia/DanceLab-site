import Link from 'next/link'
import { requestLocale } from '@/lib/i18n/server'
import { uiText } from '@/data/i18n/messages'

export default async function NotFound() {
  const locale = await requestLocale()
  const t = (text: string) => uiText(locale, text)

  return (
    <main className="not-found-page">
      <div className="not-found-content">
        <div className="not-found-code">{t('Erreur 404')}</div>
        <h1>{t('Cette page est introuvable.')}</h1>
        <p>
          {t("Le contenu recherché n'existe pas ou a été déplacé.")}
        </p>
        <Link href="/" className="btn btn-primary">
          {t("Retour à l'accueil")}
        </Link>
      </div>
    </main>
  )
}
