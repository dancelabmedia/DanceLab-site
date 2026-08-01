import type { Metadata } from "next";
import "../mentions-legales/mentions-legales.css";

export const metadata: Metadata = {
  title: "Politique de confidentialité – Dance Lab",
  description:
    "Découvrez comment Dance Lab collecte, utilise et protège vos données personnelles, conformément au Règlement Général sur la Protection des Données (RGPD).",
  robots: { index: false, follow: false },
};

export default function PolitiqueDeConfidentialitePage() {
  return (
    <main className="politique-confidentialite-page">

      {/* HERO */}
      <section className="ml-hero">
        <div className="container">
          <div className="ml-hero-inner">

            <span className="section-label">Données & vie privée</span>

            <h1>Politique de confidentialité</h1>

            <p className="ml-intro">
              Chez Dance Lab, la confiance de nos lecteurs et auditeurs est
              essentielle. Cette page vous explique de manière transparente
              quelles données nous collectons, pourquoi, et comment vous
              pouvez exercer vos droits, conformément au Règlement Général
              sur la Protection des Données (RGPD — Règlement UE 2016/679)
              et à la loi Informatique et Libertés.
            </p>

            <span className="ml-last-update">
              Dernière mise à jour : juillet 2025
            </span>

          </div>
        </div>
      </section>


      {/* SOMMAIRE */}
      <section className="ml-toc">
        <div className="container">
          <div className="ml-toc-inner">

            <p>Sommaire</p>

            <ol>
              <li><a href="#responsable">Responsable du traitement</a></li>
              <li><a href="#donnees">Données collectées</a></li>
              <li><a href="#finalites">Finalités et bases légales</a></li>
              <li><a href="#conservation">Durées de conservation</a></li>
              <li><a href="#prestataires">Prestataires et sous-traitants</a></li>
              <li><a href="#transferts">Transferts hors UE</a></li>
              <li><a href="#droits">Vos droits</a></li>
              <li><a href="#contact">Exercer vos droits</a></li>
              <li><a href="#cnil">Réclamation auprès de la CNIL</a></li>
              <li><a href="#mises-a-jour">Mises à jour de cette politique</a></li>
            </ol>

          </div>
        </div>
      </section>


      {/* BODY */}
      <section className="ml-body">
        <div className="container">
          <div className="ml-body-inner">


            {/* 01 – RESPONSABLE DU TRAITEMENT */}
            <div className="ml-section" id="responsable">
              <span className="ml-section-num">01</span>
              <h2>Responsable du traitement</h2>

              <p>
                Le responsable du traitement des données personnelles collectées
                via le site Dance Lab est :
              </p>

              <table className="ml-info-table">
                <tbody>
                  <tr>
                    <th scope="row">Entité</th>
                    <td>
                      <span className="ml-placeholder">[Raison sociale]</span>
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">Représentée par</th>
                    <td>Maïwenn Bramoullé, fondatrice</td>
                  </tr>
                  <tr>
                    <th scope="row">Adresse</th>
                    <td>
                      <span className="ml-placeholder">[Adresse postale complète]</span>
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">Contact</th>
                    <td>
                      <a href="mailto:contact@dancelabmedia.com">
                        contact@dancelabmedia.com
                      </a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>


            {/* 02 – DONNÉES COLLECTÉES */}
            <div className="ml-section" id="donnees">
              <span className="ml-section-num">02</span>
              <h2>Données collectées</h2>

              <p>
                Dance Lab collecte différentes catégories de données selon
                la manière dont vous utilisez le site. Nous nous engageons à
                ne collecter que les données strictement nécessaires aux
                finalités décrites ci-dessous.
              </p>

              <p>
                <strong>Données de navigation.</strong> Lorsque vous visitez
                le site, notre hébergeur Vercel enregistre automatiquement
                certaines données techniques : adresse IP, type de navigateur,
                système d'exploitation, pages consultées, date et heure des
                visites, et durée de la session. Ces données sont collectées
                à des fins de sécurité, de stabilité technique et de
                statistiques agrégées.
              </p>

              <p>
                <strong>Newsletter.</strong> Si vous vous inscrivez à la
                newsletter Dance Lab, votre adresse e-mail est transmise à
                notre prestataire d'envoi, Substack. Aucune autre donnée
                n'est collectée lors de cette inscription.
              </p>

              <p>
                <strong>Formulaires de contact.</strong> Si vous nous
                contactez par e-mail ou via un formulaire, nous collectons
                les informations que vous nous communiquez volontairement :
                nom, prénom, adresse e-mail et contenu de votre message.
              </p>

              <p>
                <strong>Cookies et traceurs.</strong> Le site Dance Lab
                utilise des cookies techniques indispensables à son
                fonctionnement (session de navigation, préférences
                utilisateur). Ces cookies ne nécessitent pas votre
                consentement. Si des cookies de mesure d'audience ou
                publicitaires venaient à être utilisés, votre consentement
                explicite serait recueilli au préalable.
              </p>

              <p>
                <strong>Plateformes de diffusion.</strong> Les épisodes du
                podcast Dance Lab sont disponibles sur des plateformes
                tierces (Spotify, Apple Podcasts, Deezer, YouTube). En
                accédant à ces contenus, vous êtes soumis à la politique de
                confidentialité propre à chacune de ces plateformes, sur
                lesquelles Dance Lab n'exerce aucun contrôle.
              </p>
            </div>


            {/* 03 – FINALITÉS ET BASES LÉGALES */}
            <div className="ml-section" id="finalites">
              <span className="ml-section-num">03</span>
              <h2>Finalités et bases légales</h2>

              <p>
                Tout traitement de données personnelles repose sur une base
                légale identifiée au sens de l'article 6 du RGPD. Voici le
                détail des traitements mis en œuvre par Dance Lab :
              </p>

              <table className="ml-info-table">
                <thead>
                  <tr>
                    <th scope="col">Finalité</th>
                    <th scope="col">Base légale</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">Hébergement et sécurité du site</th>
                    <td>Intérêt légitime (art. 6.1.f)</td>
                  </tr>
                  <tr>
                    <th scope="row">Envoi de la newsletter</th>
                    <td>Consentement (art. 6.1.a)</td>
                  </tr>
                  <tr>
                    <th scope="row">Réponse aux demandes de contact</th>
                    <td>Intérêt légitime (art. 6.1.f)</td>
                  </tr>
                  <tr>
                    <th scope="row">Statistiques de fréquentation agrégées</th>
                    <td>Intérêt légitime (art. 6.1.f)</td>
                  </tr>
                  <tr>
                    <th scope="row">Cookies techniques essentiels</th>
                    <td>Intérêt légitime / nécessité contractuelle</td>
                  </tr>
                </tbody>
              </table>

              <p>
                Lorsque le traitement est fondé sur votre consentement, vous
                pouvez le retirer à tout moment, sans que cela ne remette en
                cause la licéité du traitement réalisé avant ce retrait.
              </p>
            </div>


            {/* 04 – DURÉES DE CONSERVATION */}
            <div className="ml-section" id="conservation">
              <span className="ml-section-num">04</span>
              <h2>Durées de conservation</h2>

              <p>
                Vos données sont conservées pour la durée strictement
                nécessaire aux finalités pour lesquelles elles ont été
                collectées, et dans le respect des délais légaux en vigueur.
              </p>

              <table className="ml-info-table">
                <thead>
                  <tr>
                    <th scope="col">Type de données</th>
                    <th scope="col">Durée de conservation</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">Logs de connexion (données techniques)</th>
                    <td>12 mois maximum (obligation légale)</td>
                  </tr>
                  <tr>
                    <th scope="row">Adresse e-mail newsletter</th>
                    <td>Jusqu'au désabonnement ou retrait du consentement</td>
                  </tr>
                  <tr>
                    <th scope="row">Données de contact (e-mail entrant)</th>
                    <td>3 ans à compter du dernier contact</td>
                  </tr>
                  <tr>
                    <th scope="row">Cookies de session</th>
                    <td>Durée de la session de navigation</td>
                  </tr>
                  <tr>
                    <th scope="row">Cookies de préférences</th>
                    <td>13 mois maximum</td>
                  </tr>
                </tbody>
              </table>

              <p>
                À l'expiration de ces délais, les données sont supprimées ou
                anonymisées de façon irréversible, sauf obligation légale de
                conservation plus longue.
              </p>
            </div>


            {/* 05 – PRESTATAIRES ET SOUS-TRAITANTS */}
            <div className="ml-section" id="prestataires">
              <span className="ml-section-num">05</span>
              <h2>Prestataires et sous-traitants</h2>

              <p>
                Dance Lab fait appel à des prestataires techniques pour
                assurer le fonctionnement du site et de ses services. Ces
                prestataires peuvent être amenés à traiter certaines de vos
                données personnelles en qualité de sous-traitants, et
                s'engagent à respecter la confidentialité et la sécurité des
                données qui leur sont confiées.
              </p>

              <table className="ml-info-table">
                <thead>
                  <tr>
                    <th scope="col">Prestataire</th>
                    <th scope="col">Rôle</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">Vercel Inc. (États-Unis)</th>
                    <td>
                      Hébergement et infrastructure du site.{" "}
                      <a
                        href="https://vercel.com/legal/privacy-policy"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Politique de confidentialité Vercel
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">Substack Inc. (États-Unis)</th>
                    <td>
                      Gestion et envoi de la newsletter.{" "}
                      <a
                        href="https://substack.com/privacy"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Politique de confidentialité Substack
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">Spotify AB (Suède)</th>
                    <td>
                      Diffusion du podcast.{" "}
                      <a
                        href="https://www.spotify.com/fr/legal/privacy-policy/"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Politique de confidentialité Spotify
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">Apple Inc. (États-Unis)</th>
                    <td>
                      Diffusion du podcast via Apple Podcasts.{" "}
                      <a
                        href="https://www.apple.com/fr/legal/privacy/"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Politique de confidentialité Apple
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">Deezer SA (France)</th>
                    <td>
                      Diffusion du podcast.{" "}
                      <a
                        href="https://www.deezer.com/legal/personal-datas"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Politique de confidentialité Deezer
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">YouTube / Google LLC (États-Unis)</th>
                    <td>
                      Diffusion vidéo et podcast.{" "}
                      <a
                        href="https://policies.google.com/privacy"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Politique de confidentialité Google
                      </a>
                    </td>
                  </tr>
                </tbody>
              </table>

              <p>
                Nous ne vendons pas, n'échangeons pas et ne transférons pas
                vos données personnelles à des tiers à des fins commerciales
                ou publicitaires.
              </p>
            </div>


            {/* 06 – TRANSFERTS HORS UE */}
            <div className="ml-section" id="transferts">
              <span className="ml-section-num">06</span>
              <h2>Transferts hors Union européenne</h2>

              <p>
                Certains de nos prestataires sont établis en dehors de
                l'Union européenne, notamment aux États-Unis (Vercel,
                Substack, Apple, YouTube/Google). Ces transferts sont
                encadrés par des garanties appropriées conformément au RGPD,
                telles que les Clauses Contractuelles Types (CCT) de la
                Commission européenne, ou reposent sur une décision
                d'adéquation.
              </p>

              <p>
                Vous pouvez obtenir des informations sur les garanties
                applicables en nous contactant à{" "}
                <a href="mailto:contact@dancelabmedia.com">
                  contact@dancelabmedia.com
                </a>
                .
              </p>
            </div>


            {/* 07 – VOS DROITS */}
            <div className="ml-section" id="droits">
              <span className="ml-section-num">07</span>
              <h2>Vos droits</h2>

              <p>
                Conformément au RGPD et à la loi Informatique et Libertés,
                vous disposez des droits suivants concernant vos données
                personnelles :
              </p>

              <table className="ml-info-table">
                <tbody>
                  <tr>
                    <th scope="row">Droit d'accès</th>
                    <td>
                      Vous pouvez demander à accéder à l'ensemble des données
                      personnelles que nous détenons vous concernant
                      (art. 15 RGPD).
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">Droit de rectification</th>
                    <td>
                      Vous pouvez demander la correction de toute donnée
                      inexacte ou incomplète (art. 16 RGPD).
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">Droit à l'effacement</th>
                    <td>
                      Vous pouvez demander la suppression de vos données dans
                      les cas prévus par le RGPD (art. 17), notamment lorsque
                      les données ne sont plus nécessaires ou si vous retirez
                      votre consentement.
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">Droit à la limitation</th>
                    <td>
                      Vous pouvez demander la suspension temporaire du
                      traitement de vos données dans certaines situations
                      (art. 18 RGPD).
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">Droit à la portabilité</th>
                    <td>
                      Vous pouvez récupérer vos données dans un format
                      structuré et couramment utilisé, pour les transmettre
                      à un autre responsable de traitement (art. 20 RGPD).
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">Droit d'opposition</th>
                    <td>
                      Vous pouvez vous opposer à tout moment au traitement de
                      vos données fondé sur notre intérêt légitime, pour des
                      raisons tenant à votre situation particulière
                      (art. 21 RGPD).
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">Retrait du consentement</th>
                    <td>
                      Lorsqu'un traitement est fondé sur votre consentement,
                      vous pouvez le retirer à tout moment, sans que cela
                      affecte la licéité des traitements antérieurs
                      (art. 7 RGPD).
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">Directives post-mortem</th>
                    <td>
                      Vous pouvez définir des directives relatives à la
                      conservation, l'effacement et la communication de vos
                      données après votre décès (art. 40-1 loi
                      Informatique et Libertés).
                    </td>
                  </tr>
                </tbody>
              </table>

              <p>
                Ces droits peuvent être exercés à tout moment, gratuitement,
                en nous contactant via les coordonnées indiquées ci-dessous.
                Nous nous engageons à répondre dans un délai d'un (1) mois
                à compter de la réception de votre demande. Ce délai peut
                être prolongé de deux mois supplémentaires en cas de demande
                complexe ou multiple, avec notification de ce report.
              </p>
            </div>


            {/* 08 – EXERCER VOS DROITS */}
            <div className="ml-section" id="contact">
              <span className="ml-section-num">08</span>
              <h2>Exercer vos droits</h2>

              <p>
                Pour exercer l'un de vos droits ou pour toute question
                relative au traitement de vos données personnelles, vous
                pouvez contacter Dance Lab :
              </p>

              <div className="ml-contact-card">
                <span className="ml-contact-label">Dance Lab — Protection des données</span>
                <div className="ml-contact-line">
                  <strong>E-mail</strong>
                  <a href="mailto:contact@dancelabmedia.com">
                    contact@dancelabmedia.com
                  </a>
                </div>
                <div className="ml-contact-line">
                  <strong>Courrier</strong>
                  <span className="ml-placeholder">[Adresse postale complète]</span>
                </div>
              </div>

              <p>
                Afin de traiter votre demande dans les meilleurs délais, merci
                de préciser la nature du droit que vous souhaitez exercer
                et, si possible, les données concernées. Une pièce d'identité
                pourra vous être demandée afin de vérifier votre identité et
                d'éviter toute divulgation non autorisée.
              </p>
            </div>


            {/* 09 – RÉCLAMATION CNIL */}
            <div className="ml-section" id="cnil">
              <span className="ml-section-num">09</span>
              <h2>Réclamation auprès de la CNIL</h2>

              <p>
                Si vous estimez, après nous avoir contactés, que vos droits
                ne sont pas respectés, vous avez la possibilité d'introduire
                une réclamation auprès de la Commission Nationale de
                l'Informatique et des Libertés (CNIL), l'autorité de contrôle
                française compétente en matière de protection des données :
              </p>

              <table className="ml-info-table">
                <tbody>
                  <tr>
                    <th scope="row">Organisme</th>
                    <td>Commission Nationale de l'Informatique et des Libertés (CNIL)</td>
                  </tr>
                  <tr>
                    <th scope="row">Adresse</th>
                    <td>3 Place de Fontenoy – TSA 80715 – 75334 Paris Cedex 07</td>
                  </tr>
                  <tr>
                    <th scope="row">Téléphone</th>
                    <td>+33 (0)1 53 73 22 22</td>
                  </tr>
                  <tr>
                    <th scope="row">Site web</th>
                    <td>
                      <a
                        href="https://www.cnil.fr"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        cnil.fr
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">Réclamation en ligne</th>
                    <td>
                      <a
                        href="https://www.cnil.fr/fr/plaintes"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        cnil.fr/fr/plaintes
                      </a>
                    </td>
                  </tr>
                </tbody>
              </table>

              <p>
                Vous disposez également du droit de saisir la juridiction
                compétente si vous estimez que le traitement de vos données
                personnelles constitue une violation du RGPD.
              </p>
            </div>


            {/* 10 – MISES À JOUR */}
            <div className="ml-section" id="mises-a-jour">
              <span className="ml-section-num">10</span>
              <h2>Mises à jour de cette politique</h2>

              <p>
                Dance Lab se réserve le droit de mettre à jour la présente
                politique de confidentialité à tout moment, notamment pour
                se conformer à toute évolution réglementaire, jurisprudentielle
                ou technique, ou pour refléter de nouveaux traitements de
                données mis en place.
              </p>

              <p>
                En cas de modification substantielle affectant vos droits
                ou la nature des traitements, vous en serez informé par
                e-mail (si vous êtes abonné à la newsletter) et/ou par une
                notification visible sur le site. La date de la dernière
                mise à jour est indiquée en haut de cette page.
              </p>

              <p>
                Nous vous encourageons à consulter régulièrement cette page
                pour rester informé de la façon dont Dance Lab protège vos
                informations.
              </p>
            </div>


          </div>
        </div>
      </section>

    </main>
  );
}
