'use client'
import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import type { Locale } from '@/lib/i18n/routing'
import { useLocale, useSetLocale } from './LocaleProvider'
import styles from './LanguageSwitcher.module.css'

export default function LanguageSwitcher({ locale: _initialLocale, mobile }: { locale: Locale; mobile?: boolean }) {
  const locale = useLocale()
  const setLocale = useSetLocale()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  if (pathname?.startsWith('/admin')) return null

  async function choose(nextLocale: Locale) {
    if (busy || nextLocale === locale) return
    setBusy(true)
    setError(false)
    try {
      const response = await fetch('/api/language', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locale: nextLocale,
          href: window.location.pathname + window.location.search + window.location.hash,
        }),
      })
      if (!response.ok) throw new Error('language')
      const data = await response.json() as { href?: string }
      if (!data.href) throw new Error('language')
      // Shared client chrome updates immediately; the route transition refreshes
      // Server Components without a destructive browser reload or scroll reset.
      setLocale(nextLocale)
      router.replace(data.href, { scroll: false })
      router.refresh()
    } catch {
      setError(true)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={`${styles.switcher}${mobile ? ` ${styles.mobileSwitcher}` : ''}`} aria-label={locale === 'fr' ? 'Langue du site' : 'Site language'}>
      <button
        type="button"
        lang="fr"
        disabled={busy}
        aria-pressed={locale === 'fr'}
        className={`${styles.option} ${locale === 'fr' ? styles.active : ''}`}
        onClick={() => choose('fr')}
      >
        FR
      </button>
      <span className={styles.divider} aria-hidden="true">|</span>
      <button
        type="button"
        lang="en"
        disabled={busy}
        aria-pressed={locale === 'en'}
        className={`${styles.option} ${locale === 'en' ? styles.active : ''}`}
        onClick={() => choose('en')}
      >
        EN
      </button>
      {error ? <span className="sr-only" role="alert">Le changement de langue a échoué. Réessayez.</span> : null}
    </div>
  )
}
