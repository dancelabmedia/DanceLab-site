import { Suspense } from 'react'
import PrivateAccessPage from '@/components/PrivateAccessPage'
import { headers } from 'next/headers'
import { isLocalEditorAccess } from '@/lib/local-editor-access'
import { privateAccessScope } from '@/data/private-navigation'
import { requestLocale } from '@/lib/i18n/server'

// La rubrique dépend de l'URL : rendre aussi l'écran existant côté serveur.
export const dynamic = 'force-dynamic'

export default async function AccesPrivePage({ searchParams }: { searchParams: Promise<{ redirect?: string }> }) {
  const params = await searchParams
  const localWorkHref = params.redirect && privateAccessScope(params.redirect) && isLocalEditorAccess(await headers())
    ? params.redirect
    : undefined
  return <Suspense><PrivateAccessPage localWorkHref={localWorkHref} locale={await requestLocale()} /></Suspense>
}
