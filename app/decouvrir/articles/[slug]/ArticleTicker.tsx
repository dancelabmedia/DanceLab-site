'use client'

/**
 * ArticleTicker
 * Bandeau éditorial horizontal à défilement infini placé
 * immédiatement sous le hero de chaque article.
 *
 * Technique :
 *   - Les thèmes sont dupliqués pour former un double jeu de contenu.
 *   - Une animation CSS `translateX` de 0% à -50% sur le wrapper dupliqué
 *     donne l'illusion d'un flux infini sans saut visible (effet seamless loop).
 *   - prefers-reduced-motion : l'animation est suspendue (animation-play-state: paused).
 *   - Le bandeau est masqué si aucun thème n'est fourni.
 *
 * Usage :
 *   <ArticleTicker themes={article.themes} />
 */

interface Props {
  themes?: string[]
}

export default function ArticleTicker({ themes }: Props) {
  if (!themes || themes.length === 0) return null

  // Séparateur visuel entre les expressions
  const SEP = '\u2736' // ✶ étoile à six branches (plus élégant que ✦ à l'affichage)

  // On répète 2× pour le loop seamless
  const items = [...themes, ...themes]

  return (
    <div className="article-ticker" aria-hidden="true">
      <div className="article-ticker-track">
        {items.map((theme, i) => (
          <span key={i} className="article-ticker-item">
            <span className="article-ticker-text">{theme}</span>
            <span className="article-ticker-sep" aria-hidden="true">{SEP}</span>
          </span>
        ))}
      </div>
    </div>
  )
}
