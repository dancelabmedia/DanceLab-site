import Header from './Header'
import Footer from './Footer'
import ScrollManager from './ScrollManager'
import BackToTop from './BackToTop'
import ContentProtection from './ContentProtection'
import DanceLabAssistant from './DanceLabAssistant'
import { getSearchIndex } from '../data/search-index'
import type { Locale } from '@/lib/i18n/routing'

export default async function SiteLayout({
  children,
  locale = 'fr',
}: {
  children: React.ReactNode
  locale?: Locale
}) {
  const searchItems = locale === 'en' ? [] : await getSearchIndex()
  return (
    <>
      <ScrollManager />
      <ContentProtection />
      <Header searchItems={searchItems} locale={locale} />
      <DanceLabAssistant />
      {children}
      <Footer locale={locale} />
      <BackToTop locale={locale} />
    </>
  )
}
