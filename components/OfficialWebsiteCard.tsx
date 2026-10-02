type Props = {
  name: string
  logo: string
  url: string
  logoTheme?: 'light' | 'dark'
}

/**
 * Carte compacte vers le site officiel d'un lieu.
 * Affiche le logo du lieu à gauche et le nom + lien à droite.
 * Utilisez logoTheme="dark" pour les logos blancs (ex : La Mona).
 */
export default function OfficialWebsiteCard({ name, logo, url, logoTheme = 'light' }: Props) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`official-website-card${logoTheme === 'dark' ? ' official-website-card--dark' : ''}`}
      aria-label={`${name} — Site officiel (nouvel onglet)`}
    >
      <span className="official-website-card__logo" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logo} alt="" width={80} height={40} />
      </span>
      <span className="official-website-card__info">
        <span className="official-website-card__name">{name}</span>
        <span className="official-website-card__cta">
          Site officiel <span aria-hidden="true">↗</span>
        </span>
      </span>
    </a>
  )
}
