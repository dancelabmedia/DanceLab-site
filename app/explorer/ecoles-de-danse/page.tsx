import type { Metadata } from 'next'
import EcolesClient from './EcolesClient'
import { ecolesDanse } from './ecoles-data'

export const metadata: Metadata = {
  title: 'Écoles de danse à Paris | Explorer | Dance Lab',
  description: 'Annuaire interactif des studios, écoles, conservatoires et centres de formation en danse à Paris. Filtrez par style, niveau et arrondissement.',
}

export default function EcolesPage() {
  return <EcolesClient ecoles={ecolesDanse} />
}
