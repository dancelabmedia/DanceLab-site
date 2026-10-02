'use client'

import { useCookieConsent } from './CookieConsent'
import type { ServiceConsent } from './CookieConsent'

type Provider = 'youtube' | 'spotify' | 'instagram'

type Props = React.IframeHTMLAttributes<HTMLIFrameElement> & {
  provider: string
}

const ALL_REFUSED: ServiceConsent = { youtube: false, spotify: false, instagram: false }

/** Noms affichés dans le placeholder. */
const PROVIDER_LABELS: Record<Provider, string> = {
  youtube:   'YouTube',
  spotify:   'Spotify',
  instagram: 'Instagram',
}

/**
 * Enveloppe conditionnelle pour les contenus tiers.
 *
 * – Si l'utilisateur a autorisé ce provider → rendu normal de l'iframe.
 * – Sinon → placeholder propre avec possibilité de débloquer uniquement ce service.
 *
 * Le déblocage unitaire ("Autoriser YouTube") appelle saveServices() avec
 * l'état actuel des autres services inchangé : pas d'effet de bord.
 */
export default function ThirdPartyEmbed({ provider, title, ...props }: Props) {
  const { services, saveServices, youtubeAllowed, spotifyAllowed, instagramAllowed } =
    useCookieConsent()

  const key = provider.toLowerCase() as Provider
  const label = PROVIDER_LABELS[key] ?? provider

  const allowed =
    key === 'youtube'   ? youtubeAllowed   :
    key === 'spotify'   ? spotifyAllowed   :
    key === 'instagram' ? instagramAllowed :
    false

  if (!allowed) {
    const handleUnlock = () => {
      const current = services ?? ALL_REFUSED
      saveServices({ ...current, [key]: true })
    }

    return (
      <div className="tp-placeholder" role="group" aria-label={`Contenu ${label} désactivé`}>
        <div className="tp-placeholder__icon" aria-hidden="true">
          {key === 'youtube'   && '▶'}
          {key === 'spotify'   && '♪'}
          {key === 'instagram' && '◻'}
        </div>
        <p className="tp-placeholder__title">Ce contenu nécessite votre autorisation</p>
        <p className="tp-placeholder__desc">
          Pour afficher ce contenu {label}, vous devez autoriser les contenus {label}.
        </p>
        <button type="button" className="tp-placeholder__btn" onClick={handleUnlock}>
          Autoriser {label}
        </button>
      </div>
    )
  }

  return <iframe title={title} {...props} />
}
