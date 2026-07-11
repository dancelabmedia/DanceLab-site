const IconInstagram = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <rect x="3" y="3" width="18" height="18" rx="5.2" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.3" cy="6.7" r="1" />
  </svg>
)

const IconTikTok = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path d="M14 3v10.1a4.35 4.35 0 1 1-3.9-4.33" />
    <path d="M14 3c.72 3.42 2.7 5.38 6 5.72" />
  </svg>
)

const IconYouTube = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path d="M21.2 8.2a3.1 3.1 0 0 0-2.18-2.2C17.1 5.5 12 5.5 12 5.5s-5.1 0-7.02.5A3.1 3.1 0 0 0 2.8 8.2 32.5 32.5 0 0 0 2.3 12a32.5 32.5 0 0 0 .5 3.8 3.1 3.1 0 0 0 2.18 2.2c1.92.5 7.02.5 7.02.5s5.1 0 7.02-.5a3.1 3.1 0 0 0 2.18-2.2 32.5 32.5 0 0 0 .5-3.8 32.5 32.5 0 0 0-.5-3.8Z" />
    <path d="m10 15 5.2-3L10 9v6Z" />
  </svg>
)

const IconLinkedIn = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path d="M4.8 9.4v10.1" />
    <path d="M4.8 4.9v.1" />
    <path d="M9.4 19.5V9.4" />
    <path d="M9.4 13.8c0-2.7 1.55-4.6 4.15-4.6 2.92 0 4.65 1.95 4.65 5.15v5.15" />
  </svg>
)

export default function Footer() {
  const mainLinks = [
    { label: 'Découvrir', href: '/decouvrir' },
    { label: 'Écouter', href: '/ecouter' },
    { label: 'Sortir', href: '/agenda' },
    { label: 'Explorer', href: '/explorer' },
    { label: 'Ressources', href: '/#ressources' },
    { label: 'À propos', href: '/a-propos' },
  ]

  const socialLinks = [
    {
      label: 'Instagram',
      href: 'https://www.instagram.com/dancelab.media/',
      icon: <IconInstagram />,
    },
    {
      label: 'TikTok',
      href: 'https://www.tiktok.com/@dance.lab.le.podc',
      icon: <IconTikTok />,
    },
    {
      label: 'YouTube',
      href: 'https://www.youtube.com/@maiwennbramoulle',
      icon: <IconYouTube />,
    },
    {
      label: 'LinkedIn',
      href: 'https://www.linkedin.com/in/maïwenn-bramoullé/',
      icon: <IconLinkedIn />,
    },
  ]

  return (
    <footer className="footer" id="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <a href="/" className="logo footer-logo">
              <img
                src="/logo-footer.png"
                alt="Dance Lab"
                className="footer-logo-image"
              />
            </a>

            <p className="footer-tagline">
              Le média qui ouvre les portes du monde de la danse - pour les professionnels,
              les passionnés et les curieux.
            </p>

          </div>

          <nav className="footer-main-nav" aria-label="Navigation du footer">
            <p className="foot-col-title">Navigation</p>
            <ul className="foot-links">
              {mainLinks.map((item) => (
                <li key={item.label}>
                  <a href={item.href}>{item.label}</a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="footer-actions">
            <p className="foot-col-title">Suivre</p>
            <div className="socials">
              {socialLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="social-btn"
                  aria-label={item.label}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {item.icon}
                </a>
              ))}
            </div>
            <a href="/#newsletter" className="footer-newsletter-link">
              Newsletter
            </a>
          </div>
        </div>

        <div className="foot-bottom">
          <p className="foot-copy">
            © 2026 Dance Lab - Tous droits réservés
          </p>

          <ul className="foot-legal">
            <li>
              <a href="#">Mentions légales</a>
            </li>
            <li>
              <a href="#">Politique de confidentialité</a>
            </li>
            <li>
              <a href="#">Gestion des cookies</a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  )
}
