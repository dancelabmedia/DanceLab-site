import { requireExplorerAccess } from '@/lib/explorer-access'
import { sectionVisibility, type SectionKey } from '@/data/section-visibility'
import ExplorerPrivateNav from './ExplorerPrivateNav'
import { headers } from 'next/headers'
import { isLocalEditorAccess } from '@/lib/local-editor-access'

export default async function ExplorerSectionLayout({ section, children }: { section: SectionKey; children: React.ReactNode }) {
  await requireExplorerAccess(section)
  return <>{sectionVisibility[section] === 'private' && <ExplorerPrivateNav localEditor={isLocalEditorAccess(await headers())} />}{children}</>
}
