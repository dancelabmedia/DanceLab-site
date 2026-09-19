import type { Metadata } from 'next'
import { sectionVisibility } from '@/data/section-visibility'
import ExplorerSectionLayout from '@/components/ExplorerSectionLayout'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = sectionVisibility.schools === 'private'
  ? { robots: { index: false, follow: false, nocache: true } } : {}
export default function Layout({ children }: { children: React.ReactNode }) {
  return <ExplorerSectionLayout section="schools">{children}</ExplorerSectionLayout>
}
