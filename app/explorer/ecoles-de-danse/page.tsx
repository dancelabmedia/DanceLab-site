import type { Metadata } from 'next'
import { requireExplorerAccess } from '@/lib/explorer-access'
import EcolesClient from './EcolesClient'
import { ecolesDanse } from './ecoles-data'

export const metadata: Metadata = {
  title: 'Écoles et formations professionnelles en danse en France | Dance Lab',
  description:
    "Explore les écoles, cursus supérieurs, formations professionnelles, CPES, jeunes ballets et dispositifs d’insertion en danse partout en France.",
  openGraph: {
    title: 'Écoles et formations professionnelles en danse en France | Dance Lab',
    description:
      "Explore les écoles, cursus supérieurs, formations professionnelles, CPES, jeunes ballets et dispositifs d’insertion en danse partout en France.",
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Écoles et formations professionnelles en danse en France | Dance Lab',
    description:
      "Explore les écoles, cursus supérieurs, formations professionnelles, CPES, jeunes ballets et dispositifs d’insertion en danse partout en France.",
  },
}

export default async function EcolesPage() {
  await requireExplorerAccess('schools')
  return <EcolesClient ecoles={ecolesDanse} />
}
