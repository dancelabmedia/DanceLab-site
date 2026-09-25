import { explorerSections } from "./explorer-data"
import PublicExplorerLink from '@/components/PublicExplorerLink'
import { privateAccessScope } from '@/data/private-navigation'
import { explorerSource } from '@/lib/i18n/catalog'
import { readTranslation } from '@/lib/i18n/store'
import { translatedField } from '@/lib/i18n/translations'
import { requestLocale, languageAlternates } from '@/lib/i18n/server'
import { uiText } from '@/data/i18n/messages'
import type { Locale } from '@/lib/i18n/routing'
import { cookies, headers } from 'next/headers'
import { explorerHomeVisibility } from '@/data/section-visibility'
import { EXPLORER_COOKIE, validExplorerSession } from '@/lib/explorer-session'
import { isLocalEditorAccess } from '@/lib/local-editor-access'
import PrivateAccessPage from '@/components/PrivateAccessPage'
import { getComingSoonStats } from '@/lib/site-stats'
import { Suspense } from 'react'

export const dynamic = 'force-dynamic'

async function canViewExplorerHome() {
  if (explorerHomeVisibility === 'public') return true
  if (isLocalEditorAccess(await headers())) return true
  return validExplorerSession((await cookies()).get(EXPLORER_COOKIE)?.value)
}

function explorerText(locale: Locale) {
  const source = explorerSource()
  const translation = locale === 'en' ? readTranslation(source.id) : undefined
  return (key: string) => {
    if (locale === 'fr') return source.fields[key]
    const text = translatedField(source, translation, key)
    return text ?? source.fields[key]
  }
}
export async function generateMetadata() {
  const locale = await requestLocale(), t = explorerText(locale)
  if (!await canViewExplorerHome()) return { title: 'Cette rubrique se prépare | Dance Lab', robots: { index: false, follow: false } }
  return { title: t('seoTitle'), description: t('seoDescription'), alternates: languageAlternates('/explorer', locale), openGraph: { title: t('seoTitle'), description: t('seoDescription'), locale: locale === 'en' ? 'en_GB' : 'fr_FR' } }
}
export default async function ExplorerPage() {
  const locale = await requestLocale()
  if (!await canViewExplorerHome()) {
    const stats = await getComingSoonStats()
    return <Suspense><PrivateAccessPage mode="explorer" returnTo="/explorer" locale={locale} stats={stats} /></Suspense>
  }
  const t = explorerText(locale)
  const ui = (text: string) => uiText(locale, text)
  return (
    <main className="explorer-page">
      <section className="explorer-hero explorer-hero--explorer">
        <div className="container">
          <span className="section-label">{ui('Explorer')}</span>
          <h1>{t('title')}</h1>
          <p>{t('intro')}</p>
        </div>
      </section>

      <section className="explorer-feature">
        <div className="container explorer-feature-grid">
          <article className="explorer-lead-card">
            <span>{t('eyebrow')}</span>
            <h2>{t('leadTitle')}</h2>
            <p>{t('lead')}</p>
          </article>

          <div className="explorer-mini-index">
            {explorerSections.slice(0, 3).map((section) => (
              <PublicExplorerLink key={section.slug} href={`/explorer/${section.slug}`} locale={locale}>
                <span>{t(`section.${section.slug}.kicker`)}</span>
                <strong>{t(`section.${section.slug}.label`)}</strong>
                <small>{ui(privateAccessScope(`/explorer/${section.slug}`) ? 'Bientôt' : 'Explorer')}</small>
              </PublicExplorerLink>
            ))}
          </div>
        </div>
      </section>

      <section className="explorer-index">
        <div className="container">
          <div className="explorer-section-heading">
            <span className="section-label">{t('sections')}</span>
            <h2>{t('sectionsTitle')}</h2>
            <p>{t('sectionsIntro')}</p>
          </div>

          <div className="explorer-grid">
            {explorerSections.map((section) => (
              <PublicExplorerLink key={section.slug} href={`/explorer/${section.slug}`} className="explorer-card" locale={locale}>
                <span>{t(`section.${section.slug}.kicker`)}</span>
                <h3>{t(`section.${section.slug}.label`)}</h3>
                <p>{t(`section.${section.slug}.intro`)}</p>
                <small>{ui(privateAccessScope(`/explorer/${section.slug}`) ? 'Bientôt' : 'Découvrir')}</small>
              </PublicExplorerLink>
            ))}
            <PublicExplorerLink href="/explorer/ecoles-de-danse" className="explorer-card" locale={locale}>
              <span>{t('schoolsKicker')}</span>
              <h3>{t('schoolsTitle')}</h3>
              <p>{t('schoolsIntro')}</p>
              <small>{ui(privateAccessScope('/explorer/ecoles-de-danse') ? 'Bientôt' : 'Découvrir')}</small>
            </PublicExplorerLink>
          </div>
        </div>
      </section>
    </main>
  )
}
