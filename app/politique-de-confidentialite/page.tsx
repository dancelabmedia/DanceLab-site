import type { Metadata } from 'next'
import '../mentions-legales/mentions-legales.css'
import LegalNav from '@/components/LegalNav'

export const metadata: Metadata = {
  title: 'Politique de confidentialité – Dance Lab',
  description: 'Traitements de données personnelles mis en œuvre par Dance Lab.',
}

const Missing = ({ children }: { children: React.ReactNode }) => (
  <span className="ml-placeholder">[À COMPLÉTER — {children}]</span>
)

export default function PrivacyPage() {
  return (
    <main className="politique-confidentialite-page">

      {/* ── HERO ── */}
      <section className="ml-hero">
        <div className="container">
          <div className="ml-hero-inner">
            <span className="section-label">Vie privée</span>
            <h1>Politique de confidentialité</h1>
            <p className="ml-intro">
              Cette politique décrit les traitements réellement mis en œuvre sur Dance Lab.
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
                <h2>Responsable du traitement</h2>
                <p><strong>2.6 Productions</strong>, SASU au capital de 1 000 €, SIRET 102 267 002 00016, représentée par Maïwenn Bramoullé, <Missing>adresse complète du siège social</Missing>. Contact : <a href="mailto:contact@deuxpointsixproductions.com">contact@deuxpointsixproductions.com</a> ou <a href="mailto:dancelab.podcast@gmail.com">dancelab.podcast@gmail.com</a>.</p>
              </div>
            </div>

            <div className="ml-section">
              <span className="ml-section-num">02</span>
              <div className="ml-section-content">
                <h2>Traitements identifiés</h2>
                <table className="ml-info-table">
                  <thead>
                    <tr>
                      <th>Traitement</th>
                      <th>Données et finalité</th>
                      <th>Base légale</th>
                      <th>Conservation</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th scope="row">Newsletter</th>
                      <td>Adresse e-mail transmise à Substack pour envoyer la lettre Dance Lab et gérer les désabonnements.</td>
                      <td>Consentement</td>
                      <td>Jusqu'au désabonnement ou retrait du consentement ; suppression selon les règles de Substack.</td>
                    </tr>
                    <tr>
                      <th scope="row">Commentaires</th>
                      <td>Pseudonyme, commentaire, article concerné, date et hash de l'adresse IP pour publier, modérer et prévenir les abus.</td>
                      <td>Intérêt légitime à animer et sécuriser l'espace éditorial</td>
                      <td>Commentaires : durée de publication de l'article, sauf retrait ou modération. Hash IP : 3 mois, puis suppression automatique.</td>
                    </tr>
                    <tr>
                      <th scope="row">Recherches</th>
                      <td>Requête saisie, fréquence et date de dernière recherche afin d'améliorer le moteur et proposer les recherches populaires.</td>
                      <td>Intérêt légitime à améliorer le service</td>
                      <td>13 mois après la dernière recherche, puis suppression automatique.</td>
                    </tr>
                    <tr>
                      <th scope="row">Accès privés</th>
                      <td>Cookie de session sécurisé confirmant l'autorisation, sans enregistrer le code dans le navigateur.</td>
                      <td>Intérêt légitime à protéger les rubriques en préparation</td>
                      <td>Durée définie par la session technique, au maximum celle configurée dans le cookie.</td>
                    </tr>
                    <tr>
                      <th scope="row">Préférence linguistique</th>
                      <td>Langue FR/EN mémorisée dans un cookie fonctionnel.</td>
                      <td>Intérêt légitime / service demandé</td>
                      <td>12 mois.</td>
                    </tr>
                    <tr>
                      <th scope="row">Journaux techniques</th>
                      <td>Adresse IP et données de requête susceptibles d'être traitées par Vercel pour la sécurité, la livraison et le diagnostic.</td>
                      <td>Intérêt légitime à sécuriser et exploiter le site</td>
                      <td>Selon la configuration du compte Vercel et ses durées documentées, à vérifier.</td>
                    </tr>
                    <tr>
                      <th scope="row">Contenus externes</th>
                      <td>Données techniques transmises à YouTube, Spotify ou Instagram uniquement après votre choix d'autoriser ces contenus.</td>
                      <td>Consentement</td>
                      <td>Selon la politique de chaque plateforme.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="ml-section">
              <span className="ml-section-num">03</span>
              <div className="ml-section-content">
                <h2>Destinataires et prestataires</h2>
                <p>Les données sont accessibles aux personnes habilitées de Dance Lab et, selon le service utilisé, à Vercel (hébergement), Substack (newsletter), ainsi qu'aux plateformes externes expressément activées. Les données ne sont pas vendues.</p>
                <p>Ausha fournit le flux et les médias du podcast. OpenStreetMap peut recevoir des données techniques lors du chargement des cartes. Les liens externes simples ne transmettent des données qu'après le clic.</p>
              </div>
            </div>

            <div className="ml-section">
              <span className="ml-section-num">04</span>
              <div className="ml-section-content">
                <h2>Transferts hors de l'Espace économique européen</h2>
                <p>Vercel, Substack, Google/YouTube, Meta/Instagram et Spotify peuvent traiter des données aux États-Unis ou dans d'autres pays. Vercel indique s'appuyer sur le cadre UE–États-Unis de protection des données et, lorsque nécessaire, sur les clauses contractuelles types. Le DPA intégré au contrat éditeur de Substack prévoit également le Data Privacy Framework et les clauses contractuelles types. Pour les autres plateformes, les mécanismes applicables sont ceux décrits dans leurs politiques et contrats en vigueur.</p>
              </div>
            </div>

            <div className="ml-section">
              <span className="ml-section-num">05</span>
              <div className="ml-section-content">
                <h2>Vos droits</h2>
                <p>Vous pouvez demander l'accès, la rectification, l'effacement, la limitation, la portabilité lorsque celle-ci s'applique, vous opposer aux traitements fondés sur l'intérêt légitime ou retirer votre consentement à tout moment. Le retrait ne remet pas en cause les traitements antérieurs.</p>
                <p>Écrivez à <a href="mailto:contact@deuxpointsixproductions.com">contact@deuxpointsixproductions.com</a> ou <a href="mailto:dancelab.podcast@gmail.com">dancelab.podcast@gmail.com</a> en précisant votre demande. Un justificatif peut être demandé uniquement en cas de doute raisonnable sur votre identité. Vous pouvez également saisir la <a href="https://www.cnil.fr/fr/plaintes" target="_blank" rel="noopener noreferrer">CNIL</a>.</p>
              </div>
            </div>

            <div className="ml-section">
              <span className="ml-section-num">06</span>
              <div className="ml-section-content">
                <h2>Sécurité et mise à jour</h2>
                <p>Dance Lab applique des mesures proportionnées : validation des entrées, limitation des tentatives, cookies d'accès HttpOnly et contrôle des accès administratifs. Aucun service ne pouvant garantir une sécurité absolue, les mesures sont régulièrement réévaluées.</p>
                <p>Cette politique sera mise à jour lors de l'ajout d'un service, d'une nouvelle collecte ou d'une évolution réglementaire.</p>
              </div>
            </div>

          </div>
        </div>
      </section>

    </main>
  )
}
