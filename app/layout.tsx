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
      <body>
        <SiteLayout>
          {children}
        </SiteLayout>
      </body>
    </html>
  )
}
