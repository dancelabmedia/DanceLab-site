import type { Metadata } from 'next'
import '../mentions-legales/mentions-legales.css'
import './gestion-cookies.css'
import LegalNav from '@/components/LegalNav'

export const metadata: Metadata = {
  title: 'Politique de cookies – Dance Lab',
  description: 'Cookies, stockage local et contenus externes utilisés sur Dance Lab.',
}

export default function CookiesPage() {
  return (
    <main className="gestion-cookies-page">

      {/* ── HERO ── */}
      <section className="ml-hero">
        <div className="container">
          <div className="ml-hero-inner">
            <span className="section-label">Confidentialité</span>
            <h1>Politique de cookies</h1>
            <p className="ml-intro">
              Dance Lab limite les traceurs et bloque les contenus externes optionnels jusqu'à votre accord.
            </p>
            <span className="ml-last-update">Mise à jour — Septembre 2026</span>
          </div>
        </div>
      </section>

      {/* ── NAV LÉGALE ── */}
      <LegalNav />

      {/* ── CONTENU ── */}
      <section className="ml-body">
        <div className="container">
          <div className="ml-body-inner">

            <div className="ml-section">
              <span className="ml-section-num">01</span>
              <div className="ml-section-content">
                <h2>Votre choix</h2>
                <p>Lors de votre première visite, vous pouvez accepter ou refuser les contenus externes avec deux boutons de même importance. Le refus n'empêche pas de consulter les contenus éditoriaux du site.</p>
                <p>Votre choix est conservé dans le stockage local du navigateur pendant six mois maximum. Vous pouvez le modifier à tout moment grâce au bouton « Gérer mes cookies » du pied de page.</p>
              </div>
            </div>

            <div className="ml-section">
              <span className="ml-section-num">02</span>
              <div className="ml-section-content">
                <h2>Traceurs strictement nécessaires</h2>
                <table className="ml-info-table">
                  <thead>
                    <tr>
                      <th>Nom</th>
                      <th>Émetteur</th>
                      <th>Finalité</th>
                      <th>Durée</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th scope="row">dancelab_locale</th>
                      <td>Dance Lab</td>
                      <td>Mémoriser la langue choisie.</td>
                      <td>12 mois</td>
                    </tr>
                    <tr>
                      <th scope="row">Cookies d'accès privé</th>
                      <td>Dance Lab</td>
                      <td>Authentifier temporairement l'accès aux rubriques protégées. Cookies HttpOnly.</td>
                      <td>Selon la session configurée</td>
                    </tr>
                    <tr>
                      <th scope="row">dancelab_cookie_consent</th>
                      <td>Dance Lab — stockage local</td>
                      <td>Mémoriser votre acceptation ou votre refus.</td>
                      <td>6 mois maximum</td>
                    </tr>
                    <tr>
                      <th scope="row">État local d'interface</th>
                      <td>Dance Lab — sessionStorage</td>
                      <td>Restaurer la navigation, le scroll ou certains filtres pendant la session.</td>
                      <td>Session du navigateur</td>
                    </tr>
                  </tbody>
                </table>
                <p>Ces éléments répondent à une demande de l'utilisateur, assurent la sécurité ou mémorisent son choix. Ils ne sont pas utilisés à des fins publicitaires.</p>
              </div>
            </div>

            <div className="ml-section">
              <span className="ml-section-num">03</span>
              <div className="ml-section-content">
                <h2>Services optionnels soumis au consentement</h2>
                <table className="ml-info-table">
                  <thead>
                    <tr>
                      <th>Service</th>
                      <th>Usage</th>
                      <th>Chargement</th>
                      <th>Durée</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th scope="row">YouTube / Google</th>
                      <td>Vidéos et teasers intégrés.</td>
                      <td>Uniquement après acceptation et activation.</td>
                      <td>Selon Google</td>
                    </tr>
                    <tr>
                      <th scope="row">Spotify</th>
                      <td>Lecteur audio intégré.</td>
                      <td>Uniquement après acceptation.</td>
                      <td>Selon Spotify</td>
                    </tr>
                    <tr>
                      <th scope="row">Instagram / Meta</th>
                      <td>Reels intégrés.</td>
                      <td>Script bloqué avant acceptation.</td>
                      <td>Selon Meta</td>
                    </tr>
                  </tbody>
                </table>
                <p>Les liens simples vers Apple Podcasts, Deezer, LinkedIn ou d'autres sites ne chargent pas leurs traceurs sur Dance Lab ; leurs politiques s'appliquent après votre clic.</p>
              </div>
            </div>

            <div className="ml-section">
              <span className="ml-section-num">04</span>
              <div className="ml-section-content">
                <h2>Services sans traceur publicitaire identifié</h2>
                <p>Les polices sont hébergées localement. Aucun SDK publicitaire ni outil d'analytics tiers n'a été identifié dans le code audité. Les statistiques de recherches sont enregistrées côté serveur sans cookie publicitaire. Les tuiles OpenStreetMap et les images ou fichiers audio distants peuvent néanmoins recevoir des données techniques de connexion lors de leur chargement.</p>
              </div>
            </div>

            <div className="ml-section">
              <span className="ml-section-num">05</span>
              <div className="ml-section-content">
                <h2>Gérer ou retirer votre consentement</h2>
                <p>Utilisez « Gérer mes cookies » dans le pied de page. Refuser retire l'autorisation pour les prochains chargements ; les cookies déjà déposés par un tiers peuvent aussi être supprimés depuis les réglages du navigateur.</p>
                <p>Pour toute question : <a href="mailto:contact@deuxpointsixproductions.com">contact@deuxpointsixproductions.com</a> ou <a href="mailto:dancelab.podcast@gmail.com">dancelab.podcast@gmail.com</a>.</p>
              </div>
            </div>

          </div>
        </div>
      </section>

    </main>
  )
}
