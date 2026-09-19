import type { Metadata } from 'next'
import '@fontsource/dm-sans/300.css'
import '@fontsource/dm-sans/400.css'
import '@fontsource/dm-sans/500.css'
import '@fontsource/dm-sans/600.css'
import '@fontsource/dm-sans/700.css'
import '@fontsource/dm-sans/800.css'
import '@fontsource/aileron/300.css'
import '@fontsource/aileron/400.css'
import '@fontsource/aileron/400-italic.css'
import '@fontsource/aileron/600.css'
import '@fontsource/aileron/600-italic.css'
import '@fontsource/aileron/700.css'
import '@fontsource/aileron/700-italic.css'
import '@fontsource/aileron/800.css'
import '@fontsource/aileron/800-italic.css'
import '@fontsource-variable/hanken-grotesk/wght.css'
import '@fontsource-variable/hanken-grotesk/wght-italic.css'
import 'leaflet/dist/leaflet.css'
import './globals.css'
import './typography.css'
import './heading-system.css'
import './density-pass.css'
import SiteLayout from '../components/SiteLayout'
import DevLockButton from '../components/DevLockButton'
import NewsletterModal from '../components/NewsletterModal'
import ScrollReveal from './components/ScrollReveal'
import { SITE_URL } from '../data/site'
import { requestLocale, requestPath, languageAlternates } from '@/lib/i18n/server'
import LocaleProvider from '@/components/LocaleProvider'
import LanguageSwitcher from '@/components/LanguageSwitcher'


const frenchMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Dance Lab - Le podcast et média de référence de la danse',
  description:
    'Dance Lab est le podcast et média de référence sur la danse : podcast, interviews, articles, culture, métiers, écoles de danse, conseils, spectacles et ressources pour découvrir, comprendre et vivre la danse.',
  openGraph: {
    title: 'Dance Lab - Le podcast et média de référence de la danse',
    description:
      'Podcast, interviews, articles, culture, métiers, écoles, spectacles et ressources : découvre celles et ceux qui font, pensent et transforment la danse.',
    type: 'website',
    siteName: 'Dance Lab',
    locale: 'fr_FR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dance Lab - Le podcast et média de référence de la danse',
    description:
      'Podcast, interviews, articles, culture, métiers, écoles, spectacles et ressources : découvre celles et ceux qui font, pensent et transforment la danse.',
  },
}


export async function generateMetadata(): Promise<Metadata> {
  const locale = await requestLocale()
  const title = locale === 'en' ? 'Dance Lab — Dance, culture and conversations' : frenchMetadata.title
  const description = locale === 'en' ? 'Dance Lab explores dance through interviews, culture and resources for professionals, enthusiasts and curious minds.' : frenchMetadata.description
  return { ...frenchMetadata, title, description, alternates: languageAlternates(await requestPath(), locale), openGraph: { ...frenchMetadata.openGraph, title: title as string, description: description as string, locale: locale === 'en' ? 'en_GB' : 'fr_FR' }, twitter: { ...frenchMetadata.twitter, title: title as string, description: description as string } }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await requestLocale()
  return (
    <html lang={locale}>
      <head>
        <link
          rel="icon"
          href="/dancelab-favicon.ico?v=20260724"
          sizes="any"
          type="image/x-icon"
        />
        <link
          rel="icon"
          href="/dancelab-favicon-16x16.png?v=20260724"
          sizes="16x16"
          type="image/png"
        />
        <link
          rel="icon"
          href="/dancelab-favicon-32x32.png?v=20260724"
          sizes="32x32"
          type="image/png"
        />
        <link
          rel="icon"
          href="/dancelab-favicon-48x48.png?v=20260724"
          sizes="48x48"
          type="image/png"
        />
        <link
          rel="apple-touch-icon"
          href="/dancelab-apple-touch-icon.png?v=20260724"
          sizes="180x180"
        />
        <link rel="shortcut icon" href="/dancelab-favicon.ico?v=20260724" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#050505" />
      </head>
      <body>
        <LocaleProvider locale={locale}>
        <SiteLayout locale={locale}>
          {children}
        </SiteLayout>
        <NewsletterModal locale={locale} />
        <DevLockButton />
        <ScrollReveal />
        <LanguageSwitcher locale={locale} />
        </LocaleProvider>
      </body>
    </html>
  )
}
