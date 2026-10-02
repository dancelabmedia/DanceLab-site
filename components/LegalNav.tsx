'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCookieConsent } from './CookieConsent'

const NAV_LINKS = [
  { href: '/mentions-legales', label: 'Mentions légales' },
  { href: '/politique-de-confidentialite', label: 'Politique de confidentialité' },
  { href: '/gestion-cookies', label: 'Politique de cookies' },
]

export default function LegalNav() {
  const pathname = usePathname()
  const { openSettings } = useCookieConsent()

  return (
    <nav className="ml-legal-nav" aria-label="Navigation des pages légales">
      <div className="container">
        <div className="ml-legal-nav-inner">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={pathname === href ? 'ml-nav-active' : ''}
            >
              {label}
            </Link>
          ))}
          <button
            type="button"
            className="ml-legal-nav-btn"
            onClick={openSettings}
          >
            Gérer mes cookies
          </button>
        </div>
      </div>
    </nav>
  )
}
