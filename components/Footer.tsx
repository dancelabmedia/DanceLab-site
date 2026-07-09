export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">

          {/* Marque */}
          <div>
            <a href="#" className="logo footer-logo">
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
              {[
                'Articles culture',
                'Histoire des styles',
                'Décryptages',
                'Tendances',
                'Artistes à suivre'
              ].map((l) => (
                <li key={l}>
                  <a href="#">{l}</a>
                </li>
              ))}
            </ul>
          </div>


          {/* Écouter + Sortir */}
          <div>
            <p className="foot-col-title">Écouter</p>

            <ul className="foot-links">
              {[
                'Derniers épisodes',
                'Incontournables',
                'Interviews',
                'Playlists thématiques'
              ].map((l) => (
                <li key={l}>
                  <a href="#">{l}</a>
                </li>
              ))}
            </ul>


            <p className="foot-col-title" style={{ marginTop: '26px' }}>
              Sortir
            </p>

            <ul className="foot-links">
              {[
                'Spectacles',
                'Festivals',
                'Événements gratuits'
              ].map((l) => (
                <li key={l}>
                  <a href="#">{l}</a>
                </li>
              ))}
            </ul>
          </div>


          {/* Explorer + Ressources */}
          <div>
            <p className="foot-col-title">Explorer</p>

            <ul className="foot-links">
              {[
                'Styles de danse',
                'Chorégraphes',
                'Compagnies',
                'Métiers de la danse'
              ].map((l) => (
                <li key={l}>
                  <a href="#">{l}</a>
                </li>
              ))}
            </ul>


            <p className="foot-col-title" style={{ marginTop: '26px' }}>
              Ressources
            </p>

            <ul className="foot-links">
              {[
                { label: 'Guides pratiques', href: '#' },
                { label: 'Conseils carrière', href: '#' },
                { label: 'Partenaires', href: '#' },
                { label: 'À propos', href: '/a-propos' },
              ].map((item) => (
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
              <a href="#">Contact</a>
            </li>
          </ul>

        </div>

      </div>
    </footer>
  )
}