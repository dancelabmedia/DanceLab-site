import Header from './Header'
import Footer from './Footer'
import ScrollManager from './ScrollManager'
import BackToTop from './BackToTop'
import ContentProtection from './ContentProtection'
import { searchIndex } from '../data/search-index'
import type { Locale } from '@/lib/i18n/routing'

export default function SiteLayout({
  children,
  locale = 'fr',
}: {
  children: React.ReactNode
  locale?: Locale
}) {
  return (
    <>
      <ScrollManager />
      <ContentProtection />
      <Header searchItems={locale === 'en' ? [] : searchIndex} locale={locale} />
      {children}
      <Footer locale={locale} />
      <BackToTop locale={locale} />
    </>
  )
}
