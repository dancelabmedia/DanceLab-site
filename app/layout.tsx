import type { Metadata } from 'next'
import { Playfair_Display, DM_Sans } from 'next/font/google'
import './globals.css'


const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '600', '700'],
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
  title: 'Dance Lab — Le média qui fait découvrir, comprendre et vivre la danse',
  description: 
    'Dance Lab est le média de référence pour découvrir, comprendre et vivre la danse. Podcast, articles, agenda culturel, ressources professionnelles.',
  openGraph: {
    title: 'Dance Lab',
    description: 'Le média qui fait découvrir, comprendre et vivre la danse.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html 
      lang="fr" 
      className={`${playfair.variable} ${dmSans.variable}`}
    >
      <body>
        {children}
      </body>
    </html>
  )
}
