'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'

// ── Types ──────────────────────────────────────────────────────────────────────

export type ServiceConsent = {
  youtube:   boolean
  spotify:   boolean
  instagram: boolean
}

type StoredConsent = { services: ServiceConsent; savedAt: number }

const STORAGE_KEY = 'dancelab_cookie_consent_v2'
const LEGACY_KEY  = 'dancelab_cookie_consent'
const SIX_MONTHS  = 1000 * 60 * 60 * 24 * 183

const ALL_ACCEPTED: ServiceConsent = { youtube: true,  spotify: true,  instagram: true  }
const ALL_REFUSED:  ServiceConsent = { youtube: false, spotify: false, instagram: false }

// ── Storage helpers ────────────────────────────────────────────────────────────

function readConsent(): ServiceConsent | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const stored = JSON.parse(raw) as StoredConsent
      if (stored?.services && Date.now() - stored.savedAt <= SIX_MONTHS) return stored.services
      localStorage.removeItem(STORAGE_KEY)
    }
    // Migration depuis l'ancien format binaire (accepted / refused)
    const legacy = localStorage.getItem(LEGACY_KEY)
    if (legacy) {
      const legacyData = JSON.parse(legacy) as { choice?: string; savedAt: number }
      localStorage.removeItem(LEGACY_KEY)
      if (legacyData?.choice && Date.now() - legacyData.savedAt <= SIX_MONTHS) {
        const migrated = legacyData.choice === 'accepted' ? ALL_ACCEPTED : ALL_REFUSED
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ services: migrated, savedAt: legacyData.savedAt }))
        return migrated
      }
    }
    return null
  } catch { return null }
}

function writeConsent(services: ServiceConsent) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ services, savedAt: Date.now() }))
    localStorage.removeItem(LEGACY_KEY)
  } catch {}
}

// ── Context ────────────────────────────────────────────────────────────────────

type ConsentContextValue = {
  services:          ServiceConsent | null
  hasChosen:         boolean
  youtubeAllowed:    boolean
  spotifyAllowed:    boolean
  instagramAllowed:  boolean
  /** true si au moins un service tiers est autorisé */
  thirdPartyAllowed: boolean
  acceptAll:         () => void
  refuseAll:         () => void
  saveServices:      (s: ServiceConsent) => void
  openSettings:      () => void
}

const ConsentContext = createContext<ConsentContextValue | null>(null)

// ── Provider ───────────────────────────────────────────────────────────────────

export function CookieConsentProvider({ children }: { children: React.ReactNode }) {
  const [services, setServices]         = useState<ServiceConsent | null>(null)
  const [ready, setReady]               = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  useEffect(() => {
    setServices(readConsent())
    setReady(true)
    const open = () => setSettingsOpen(true)
    window.addEventListener('dancelab:cookie-settings', open)
    return () => window.removeEventListener('dancelab:cookie-settings', open)
  }, [])

  const save = (s: ServiceConsent) => {
    writeConsent(s)
    setServices(s)
    setSettingsOpen(false)
  }

  const value = useMemo<ConsentContextValue>(() => ({
    services,
    hasChosen:         services !== null,
    youtubeAllowed:    services?.youtube   ?? false,
    spotifyAllowed:    services?.spotify   ?? false,
    instagramAllowed:  services?.instagram ?? false,
    thirdPartyAllowed: !!(services?.youtube || services?.spotify || services?.instagram),
    acceptAll:    () => save(ALL_ACCEPTED),
    refuseAll:    () => save(ALL_REFUSED),
    saveServices: save,
    openSettings: () => setSettingsOpen(true),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [services])

  // Bandeau : affiché dès que la page est hydratée et qu'aucun choix n'a été fait,
  // sauf si la modale de détail est ouverte.
  const showBanner = ready && services === null && !settingsOpen

  // Modale de personnalisation : ouverte explicitement (footer "Gérer mes cookies"
  // ou bouton "Personnaliser mes choix" dans le bandeau).
  const showDetail = ready && settingsOpen

  return (
    <ConsentContext.Provider value={value}>
      {children}

      {/* ── Bandeau flottant (bas-gauche) — non-bloquant ── */}
      {showBanner && (
        <CookieBanner
          onAcceptAll={() => save(ALL_ACCEPTED)}
          onRefuseAll={() => save(ALL_REFUSED)}
          onPersonalize={() => setSettingsOpen(true)}
        />
      )}

      {/* ── Modale de personnalisation — avec overlay ── */}
      {showDetail && (
        <CookieDetailModal
          services={services}
          onAcceptAll={() => save(ALL_ACCEPTED)}
          onRefuseAll={() => save(ALL_REFUSED)}
          onSave={save}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </ConsentContext.Provider>
  )
}

// ── Bandeau flottant ───────────────────────────────────────────────────────────
//
// Affiché lors de la première visite. Ne bloque pas la navigation ni le scroll.
// Compact, éditorial, positionné en bas-à-gauche sur desktop.

function CookieBanner({
  onAcceptAll,
  onRefuseAll,
  onPersonalize,
}: {
  onAcceptAll:   () => void
  onRefuseAll:   () => void
  onPersonalize: () => void
}) {
  return (
    <div className="cookie-banner" role="region" aria-label="Préférences de confidentialité">
      <div className="cookie-banner__inner">

        <p className="cookie-banner__eyebrow">Vos préférences</p>

        <p className="cookie-banner__body">
          Dance Lab utilise des cookies nécessaires au fonctionnement du site.
          Avec votre accord, des contenus YouTube, Spotify et Instagram peuvent
          également être chargés.
        </p>

        <div className="cookie-banner__actions">
          <div className="cookie-banner__actions-row">
            <button
              type="button"
              className="cookie-banner__btn cookie-banner__btn--secondary"
              onClick={onRefuseAll}
            >
              Tout refuser
            </button>
            <button
              type="button"
              className="cookie-banner__btn cookie-banner__btn--primary"
              onClick={onAcceptAll}
            >
              Tout accepter
            </button>
          </div>
          <button
            type="button"
            className="cookie-banner__customize"
            onClick={onPersonalize}
          >
            Personnaliser mes choix
          </button>
        </div>

        <a href="/gestion-cookies" className="cookie-banner__policy">
          Politique de cookies
        </a>

      </div>
    </div>
  )
}

// ── Modale de personnalisation ─────────────────────────────────────────────────
//
// Ouverte via "Personnaliser mes choix" (bandeau) ou "Gérer mes cookies" (footer).
// Cette modale PEUT avoir un overlay — c'est une action explicite de l'utilisateur.

const SERVICES_DEF: Array<{ key: keyof ServiceConsent; label: string; desc: string }> = [
  { key: 'youtube',   label: 'YouTube',   desc: 'Lecteur vidéo intégré pour regarder les épisodes.' },
  { key: 'spotify',   label: 'Spotify',   desc: 'Lecteur audio intégré pour écouter les podcasts.' },
  { key: 'instagram', label: 'Instagram', desc: 'Reels et contenus intégrés depuis Instagram.' },
]

function CookieDetailModal({
  services,
  onAcceptAll,
  onRefuseAll,
  onSave,
  onClose,
}: {
  services:    ServiceConsent | null
  onAcceptAll: () => void
  onRefuseAll: () => void
  onSave:      (s: ServiceConsent) => void
  onClose:     () => void
}) {
  const [pending, setPending] = useState<ServiceConsent>(services ?? ALL_REFUSED)

  // Sync quand services change (ré-ouverture depuis le footer)
  useEffect(() => { setPending(services ?? ALL_REFUSED) }, [services])

  const toggle = (key: keyof ServiceConsent) =>
    setPending(p => ({ ...p, [key]: !p[key] }))

  return (
    <div
      className="cookie-detail"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-detail-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="cookie-detail__panel">

        {/* En-tête */}
        <div className="cookie-detail__head">
          <p className="cookie-detail__eyebrow">Vos préférences</p>
          <h2 id="cookie-detail-title">Personnaliser mes choix</h2>
          <p className="cookie-detail__intro">
            Gérez précisément quels contenus tiers vous autorisez à se charger sur Dance Lab.
          </p>
        </div>

        {/* Catégories */}
        <div className="cookie-detail__categories">

          {/* Cookies nécessaires — toujours actifs */}
          <div className="cookie-detail__category">
            <div className="cookie-detail__category-info">
              <span className="cookie-detail__category-name">Cookies nécessaires</span>
              <span className="cookie-detail__category-desc">
                Indispensables au fonctionnement du site et à l'enregistrement de vos préférences.
                Ils ne peuvent pas être désactivés.
              </span>
            </div>
            <span className="cookie-detail__always-on">Toujours actifs</span>
          </div>

          {/* Contenus tiers — groupe + toggles individuels */}
          <div className="cookie-detail__category cookie-detail__category--group">
            <div className="cookie-detail__category-info">
              <span className="cookie-detail__category-name">Contenus tiers</span>
              <span className="cookie-detail__category-desc">
                YouTube, Spotify et Instagram peuvent déposer ou utiliser des cookies lors du
                chargement de leurs contenus intégrés. Ces contenus sont chargés uniquement
                avec votre accord.
              </span>
            </div>
          </div>

          {SERVICES_DEF.map(({ key, label, desc }) => (
            <div key={key} className="cookie-detail__category cookie-detail__category--service">
              <div className="cookie-detail__category-info">
                <span className="cookie-detail__category-name cookie-detail__category-name--service">
                  {label}
                </span>
                <span className="cookie-detail__category-desc">{desc}</span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={pending[key]}
                className={`cookie-detail__toggle${pending[key] ? ' cookie-detail__toggle--on' : ''}`}
                onClick={() => toggle(key)}
                aria-label={`${label} : ${pending[key] ? 'autorisé' : 'refusé'}`}
              >
                <span className="cookie-detail__toggle-thumb" aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>

        {/* Lien politique */}
        <a href="/gestion-cookies" className="cookie-detail__policy-link">
          Consulter la politique de cookies
        </a>

        {/* Actions */}
        <div className="cookie-detail__actions">
          <div className="cookie-detail__actions-row">
            <button
              type="button"
              className="cookie-detail__btn cookie-detail__btn--secondary"
              onClick={onRefuseAll}
            >
              Tout refuser
            </button>
            <button
              type="button"
              className="cookie-detail__btn cookie-detail__btn--primary"
              onClick={() => onSave(pending)}
            >
              Enregistrer mes préférences
            </button>
          </div>
          <button type="button" className="cookie-detail__cancel" onClick={onClose}>
            Annuler
          </button>
        </div>

      </div>
    </div>
  )
}

// ── Hooks & exports ────────────────────────────────────────────────────────────

export function useCookieConsent() {
  const context = useContext(ConsentContext)
  if (!context) throw new Error('useCookieConsent must be used inside CookieConsentProvider')
  return context
}

export function CookieSettingsButton({ className = '' }: { className?: string }) {
  const { openSettings } = useCookieConsent()
  return (
    <button type="button" className={className} onClick={openSettings}>
      Gérer mes cookies
    </button>
  )
}
