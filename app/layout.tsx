import type { Metadata } from 'next'
import { Cormorant_Garamond, DM_Sans } from 'next/font/google'
import 'leaflet/dist/leaflet.css'
import './globals.css'
import SiteLayout from '../components/SiteLayout'


const displayFont = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['300', '400', '500', '600'],
  display: 'swap',
})


export const metadata: Metadata = {
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
      <body className={`${displayFont.variable} ${dmSans.variable}`}>
        <SiteLayout>
          {children}
        </SiteLayout>
      </body>
    </html>
  )
}
