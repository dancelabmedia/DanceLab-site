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
import { SITE_URL } from '../data/site'


export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Dance Lab - Le média qui fait découvrir, comprendre et vivre la danse',
  description:
    'Dance Lab est le média de référence pour découvrir, comprendre et vivre la danse.',
  openGraph: {
    title: 'Dance Lab',
    description: 'Le média qui fait découvrir, comprendre et vivre la danse.',
    type: 'website',
  },
}


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
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
        <SiteLayout>
          {children}
        </SiteLayout>
      </body>
    </html>
  )
}
