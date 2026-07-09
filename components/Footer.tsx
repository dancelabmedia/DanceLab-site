export default function Footer() {
  const discoverLinks = [
    { label: 'Articles culture', href: '/#magazine' },
    { label: 'Histoire des styles', href: '/#magazine' },
    { label: 'Décryptages', href: '/#magazine' },
    { label: 'Tendances', href: '/#magazine' },
    { label: 'Artistes à suivre', href: '/#interviews' },
  ]

  const listenLinks = [
    { label: 'Derniers épisodes', href: '/#ecouter' },
    { label: 'Incontournables', href: '/#ecouter' },
    { label: 'Interviews', href: '/#interviews' },
    { label: 'Playlists thématiques', href: '/#ecouter' },
  ]

  const outingLinks = [
    { label: 'Spectacles', href: '/#agenda' },
    { label: 'Festivals', href: '/#agenda' },
    { label: 'Événements gratuits', href: '/#agenda' },
  ]

  const exploreLinks = [
    { label: 'Styles de danse', href: '/#explorer' },
    { label: 'Chorégraphes', href: '/#explorer' },
    { label: 'Compagnies', href: '/#explorer' },
    { label: 'Métiers de la danse', href: '/#explorer' },
  ]

  const resourceLinks = [
    { label: 'Guides pratiques', href: '/#ressources' },
    { label: 'Conseils carrière', href: '/#ressources' },
    { label: 'Partenaires', href: '/#ressources' },
    { label: 'À propos', href: '/a-propos' },
  ]

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">

          {/* Marque */}
          <div>
            <a href="/" className="logo footer-logo">
              Dance<span>Lab</span>
            </a>

            <p className="footer-tagline">
              Le média qui ouvre les portes du monde de la danse — pour les professionnels,
              les passionnés et les curieux.
            </p>

            <div className="socials">
              <a href="#" className="social-btn" aria-label="Instagram">📷</a>
              <a href="#" className="social-btn" aria-label="TikTok">🎵</a>
              <a href="#" className="social-btn" aria-label="YouTube">▶️</a>
              <a href="#" className="social-btn" aria-label="Spotify">🎙</a>
            </div>
          </div>


          {/* Découvrir */}
          <div>
            <p className="foot-col-title">Découvrir</p>

            <ul className="foot-links">
              {discoverLinks.map((item) => (
                <li key={item.label}>
                  <a href={item.href}>{item.label}</a>
                </li>
              ))}
            </ul>
          </div>


          {/* Écouter + Sortir */}
          <div>
            <p className="foot-col-title">Écouter</p>

            <ul className="foot-links">
              {listenLinks.map((item) => (
                <li key={item.label}>
                  <a href={item.href}>{item.label}</a>
                </li>
              ))}
            </ul>


            <p className="foot-col-title" style={{ marginTop: '26px' }}>
              Sortir
            </p>

            <ul className="foot-links">
              {outingLinks.map((item) => (
                <li key={item.label}>
                  <a href={item.href}>{item.label}</a>
                </li>
              ))}
            </ul>
          </div>


          {/* Explorer + Ressources */}
          <div>
            <p className="foot-col-title">Explorer</p>

            <ul className="foot-links">
              {exploreLinks.map((item) => (
                <li key={item.label}>
                  <a href={item.href}>{item.label}</a>
                </li>
              ))}
            </ul>


            <p className="foot-col-title" style={{ marginTop: '26px' }}>
              Ressources
            </p>

            <ul className="foot-links">
              {resourceLinks.map((item) => (
                <li key={item.label}>
                  <a href={item.href}>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

        </div>


        {/* Barre légale */}
        <div className="foot-bottom">

          <p className="foot-copy">
            © 2026 Dance Lab — Tous droits réservés
          </p>

          <ul className="foot-legal">
            <li>
              <a href="#">Mentions légales</a>
            </li>
            <li>
              <a href="#">Confidentialité</a>
            </li>
            <li>
              <a href="/#newsletter">Contact</a>
            </li>
          </ul>

        </div>

      </div>
    </footer>
  )
}
