import 'server-only'
import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { explorerAccessSections, sectionVisibility, type SectionKey } from '@/data/section-visibility'
import { EXPLORER_COOKIE, validExplorerSession } from './explorer-session'
import { isLocalEditorAccess } from './local-editor-access'

/** Vérification au plus près du rendu des données, en plus du middleware. */
export async function requireExplorerAccess(section: SectionKey, path?: string) {
  if (sectionVisibility[section] === 'public') return
  if (isLocalEditorAccess(await headers())) return
  if (await validExplorerSession((await cookies()).get(EXPLORER_COOKIE)?.value)) return
  const returnTo = path ?? explorerAccessSections.find(item => item.key === section)!.path
  redirect(`/explorer/acces-prive?returnTo=${encodeURIComponent(returnTo)}`)
}
