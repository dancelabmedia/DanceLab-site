'use client'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import type { Locale } from '@/lib/i18n/routing'
import { useLocale, useSetLocale } from './LocaleProvider'
import styles from './LanguageSwitcher.module.css'

export default function LanguageSwitcher({ locale: _initialLocale, mobile }: { locale: Locale; mobile?: boolean }) {
  const locale = useLocale()
  const setLocale = useSetLocale()
  const [busy, setBusy] = useState(false)
  const pathname = usePathname()

  if (pathname?.startsWith('/admin')) return null

  async function choose(nextLocale: Locale) {
    if (busy || nextLocale === locale) return
    setBusy(true)
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
      // Update context instantly — no page reload, layout preserved.
      setLocale(nextLocale)
    } catch {
      // Silent fail — locale stays unchanged
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
    </div>
  )
}
