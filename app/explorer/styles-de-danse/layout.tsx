import type { Metadata } from 'next'
import { sectionVisibility } from '@/data/section-visibility'
import ExplorerSectionLayout from '@/components/ExplorerSectionLayout'

// La session doit être relue à chaque requête, y compris les fiches dynamiques.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = sectionVisibility.danceStyles === 'private'
  ? { robots: { index: false, follow: false, nocache: true } } : {}
export default function Layout({ children }: { children: React.ReactNode }) {
  return <ExplorerSectionLayout section="danceStyles">{children}</ExplorerSectionLayout>
}
