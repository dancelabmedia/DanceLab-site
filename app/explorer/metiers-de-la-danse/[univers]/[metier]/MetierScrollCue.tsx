'use client'

export default function MetierScrollCue() {
  const scrollToContent = () => {
    document.getElementById('contenu-metier')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  return (
    <button
      type="button"
      className="met-editorial-scroll-cue"
      onClick={scrollToContent}
      aria-label="Faire défiler vers le contenu de la fiche métier"
    >
      <span aria-hidden="true">↓</span>
    </button>
  )
}
