import Header from './Header'
import Footer from './Footer'
import ScrollManager from './ScrollManager'
import BackToTop from './BackToTop'
import ContentProtection from './ContentProtection'
import DanceLabAssistant from './DanceLabAssistant'
import { getSearchIndex } from '../data/search-index'
import { getLatestEpisode } from '@/lib/episodes'
import type { Locale } from '@/lib/i18n/routing'

export default async function SiteLayout({
  children,
  locale = 'fr',
}: {
  children: React.ReactNode
  locale?: Locale
}) {
  // Fetch en parallèle : index de recherche + dernier épisode (image carte ÉCOUTER mobile)
  const [searchItems, latestEpisode] = await Promise.all([
    locale === 'en' ? Promise.resolve([]) : getSearchIndex(),
    getLatestEpisode().catch(() => null),
  ])

  // Image du dernier épisode — injectée dans la carte ÉCOUTER du menu mobile.
  // Null si Ausha est indisponible → la carte utilise l'image CSS de secours.
  const latestEpisodeImage = latestEpisode?.image ?? null

  return (
    <>
      <ScrollManager />
      <ContentProtection />
      <Header searchItems={searchItems} locale={locale} latestEpisodeImage={latestEpisodeImage} />
      <DanceLabAssistant />
      {children}
      <Footer locale={locale} />
      <BackToTop locale={locale} />
    </>
  )
}
