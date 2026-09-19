'use client'
import { createContext, useContext, useState } from 'react'
import type { Locale } from '@/lib/i18n/routing'

// Two separate contexts: one for reading (subscribed by many), one for writing (switcher only).
// This avoids re-rendering all consumers when only the setter identity changes.
const LocaleContext = createContext<Locale>('fr')
const SetLocaleContext = createContext<(locale: Locale) => void>(() => {})

export const useLocale = () => useContext(LocaleContext)
export const useSetLocale = () => useContext(SetLocaleContext)

export default function LocaleProvider({
  locale: initialLocale,
  children,
}: {
  locale: Locale
  children: React.ReactNode
}) {
  const [locale, setLocale] = useState<Locale>(initialLocale)
  return (
    <SetLocaleContext.Provider value={setLocale}>
      <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>
    </SetLocaleContext.Provider>
  )
}
