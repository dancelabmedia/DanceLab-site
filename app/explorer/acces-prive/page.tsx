import type { Metadata } from 'next'
import { Suspense } from 'react'
import { safeExplorerReturnTo } from '@/data/section-visibility'
import PrivateAccessPage from '@/components/PrivateAccessPage'
import { headers } from 'next/headers'
import { isLocalEditorAccess } from '@/lib/local-editor-access'
import { requestLocale } from '@/lib/i18n/server'
import { getComingSoonStats } from '@/lib/site-stats'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  title: 'Cette rubrique se prépare | Dance Lab',
  robots: { index: false, follow: false, nocache: true },
}
export default async function ExplorerAccessPage({ searchParams }: { searchParams: Promise<{ returnTo?: string }> }) {
  const params = await searchParams
  const returnTo = safeExplorerReturnTo(params.returnTo)
  const localWorkHref = isLocalEditorAccess(await headers()) ? returnTo : undefined
  const [locale, stats] = await Promise.all([requestLocale(), getComingSoonStats()])
  return <Suspense><PrivateAccessPage mode="explorer" returnTo={returnTo} localWorkHref={localWorkHref} locale={locale} stats={stats} /></Suspense>
}
