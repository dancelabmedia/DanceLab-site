import type { ComponentProps } from 'react'
import { publicNavigationHref } from '@/data/private-navigation'
import { localizedHref, type Locale } from '@/lib/i18n/routing'

/** Conserve le graphisme des teasers et ouvre la page d'attente de chaque rubrique privée. */
export default function PublicExplorerLink({ href = '', children, locale = 'fr', ...props }: ComponentProps<'a'> & { locale?: Locale }) {
  return <a href={localizedHref(publicNavigationHref(href), locale)} {...props}>{children}</a>
}
