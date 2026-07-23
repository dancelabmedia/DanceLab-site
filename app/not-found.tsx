import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="not-found-page">
      <div className="not-found-content">
        <div className="not-found-code">Erreur 404</div>
        <h1>Cette page est introuvable.</h1>
        <p>
          Le contenu recherché n&apos;existe pas ou a été déplacé.
        </p>
        <Link href="/" className="btn btn-primary">
          Retour à l&apos;accueil
        </Link>
      </div>
    </main>
  )
}
