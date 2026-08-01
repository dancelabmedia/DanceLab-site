import type { Metadata } from "next";
import "./mentions-legales.css";

export const metadata: Metadata = {
  title: "Mentions légales – Dance Lab",
  description: "Informations légales relatives au site Dance Lab : éditeur, hébergeur, propriété intellectuelle et données personnelles.",
  robots: { index: false, follow: false },
};

export default function MentionsLegalesPage() {
  return (
    <main className="mentions-legales-page">

      {/* HERO */}
      <section className="ml-hero">
        <div className="container">
          <div className="ml-hero-inner">

            <span className="section-label">Informations légales</span>

            <h1>Mentions légales</h1>

            <p className="ml-intro">
              Conformément aux dispositions de la loi n° 2004-575 du 21 juin 2004
              pour la confiance dans l'économie numérique (LCEN), les présentes
              mentions légales précisent l'identité des responsables du site
              Dance Lab et les conditions d'utilisation du service.
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
              <li><a href="#editeur">Éditeur du site</a></li>
              <li><a href="#directeur">Directeur de la publication</a></li>
              <li><a href="#hebergeur">Hébergeur</a></li>
              <li><a href="#propriete">Propriété intellectuelle</a></li>
              <li><a href="#responsabilite">Responsabilité</a></li>
              <li><a href="#liens">Liens externes</a></li>
              <li><a href="#contact">Contact</a></li>
            </ol>

          </div>
        </div>
      </section>


      {/* BODY */}
      <section className="ml-body">
        <div className="container">
          <div className="ml-body-inner">


            {/* 01 – ÉDITEUR */}
            <div className="ml-section" id="editeur">
              <span className="ml-section-num">01</span>
              <h2>Éditeur du site</h2>

              <p>
                Le site <strong>dancelab.fr</strong> est édité par la société suivante :
              </p>

              <table className="ml-info-table">
                <tbody>
                  <tr>
                    <th scope="row">Raison sociale</th>
                    <td>
                      <span className="ml-placeholder">[Raison sociale de la société]</span>
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">Forme juridique</th>
                    <td>
                      <span className="ml-placeholder">[SASU / EURL / SAS / Auto-entrepreneur…]</span>
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">Capital social</th>
                    <td>
                      <span className="ml-placeholder">[Montant] €</span>
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">SIRET</th>
                    <td>
                      <span className="ml-placeholder">[Numéro SIRET à 14 chiffres]</span>
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">RCS</th>
                    <td>
                      <span className="ml-placeholder">[Ville d'immatriculation] — [Numéro RCS]</span>
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">Siège social</th>
                    <td>
                      <span className="ml-placeholder">[Adresse complète, code postal, ville]</span>
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">Adresse e-mail</th>
                    <td>
                      <a href="mailto:contact@dancelabmedia.com">contact@dancelabmedia.com</a>
                    </td>
                  </tr>
                </tbody>
              </table>

              <p>
                Toute reproduction, représentation, modification, publication ou
                adaptation de tout ou partie du site, quel que soit le moyen ou le
                procédé utilisé, est interdite sans autorisation préalable écrite de
                l'éditeur.
              </p>
            </div>


            {/* 02 – DIRECTEUR DE LA PUBLICATION */}
            <div className="ml-section" id="directeur">
              <span className="ml-section-num">02</span>
              <h2>Directeur de la publication</h2>

              <table className="ml-info-table">
                <tbody>
                  <tr>
                    <th scope="row">Nom</th>
                    <td>Maïwenn Bramoullé</td>
                  </tr>
                  <tr>
                    <th scope="row">Qualité</th>
                    <td>Fondatrice et directrice de la publication</td>
                  </tr>
                  <tr>
                    <th scope="row">Contact</th>
                    <td>
                      <a href="mailto:contact@dancelabmedia.com">contact@dancelabmedia.com</a>
                    </td>
                  </tr>
                </tbody>
              </table>

              <p>
                En application de l'article 6, III et IV de la loi n° 2004-575 du
                21 juin 2004, le directeur de la publication est personnellement
                responsable des contenus publiés sur le site.
              </p>
            </div>


            {/* 03 – HÉBERGEUR */}
            <div className="ml-section" id="hebergeur">
              <span className="ml-section-num">03</span>
              <h2>Hébergeur</h2>

              <p>
                Le site Dance Lab est hébergé par la société Vercel Inc., dont les
                coordonnées sont les suivantes :
              </p>

              <table className="ml-info-table">
                <tbody>
                  <tr>
                    <th scope="row">Raison sociale</th>
                    <td>Vercel Inc.</td>
                  </tr>
                  <tr>
                    <th scope="row">Siège social</th>
                    <td>340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis</td>
                  </tr>
                  <tr>
                    <th scope="row">Site web</th>
                    <td>
                      <a href="https://vercel.com" target="_blank" rel="noopener noreferrer">
                        vercel.com
                      </a>
                    </td>
                  </tr>
                </tbody>
              </table>

              <p>
                L'hébergeur assure la disponibilité technique et la sécurité
                des infrastructures permettant l'accès au site. Les données sont
                stockées sur des serveurs situés dans l'Union européenne et/ou
                aux États-Unis, conformément à la réglementation en vigueur.
              </p>
            </div>


            {/* 04 – PROPRIÉTÉ INTELLECTUELLE */}
            <div className="ml-section" id="propriete">
              <span className="ml-section-num">04</span>
              <h2>Propriété intellectuelle</h2>

              <p>
                L'ensemble des éléments constituant le site Dance Lab — textes,
                photographies, illustrations, graphismes, logo, sons, vidéos,
                podcasts, typographies et architecture — sont la propriété exclusive
                de Maïwenn Bramoullé ou font l'objet d'une autorisation d'utilisation,
                et sont protégés par les lois françaises et internationales relatives
                au droit d'auteur et à la propriété intellectuelle.
              </p>

              <p>
                Toute reproduction, représentation, modification, publication,
                adaptation ou exploitation de tout ou partie de ces éléments, par
                quelque moyen ou procédé que ce soit, est strictement interdite sans
                l'autorisation écrite préalable de l'éditeur, sous peine de poursuites
                judiciaires.
              </p>

              <p>
                Les marques et logos reproduits sur le site sont la propriété de leurs
                détenteurs respectifs. Leur mention ne saurait être interprétée comme
                conférant une licence ou un droit d'utilisation.
              </p>
            </div>


            {/* 05 – RESPONSABILITÉ */}
            <div className="ml-section" id="responsabilite">
              <span className="ml-section-num">05</span>
              <h2>Responsabilité</h2>

              <p>
                Dance Lab s'efforce de maintenir les informations publiées sur ce site
                aussi précises et à jour que possible. Toutefois, l'éditeur ne peut
                garantir l'exactitude, la complétude ou l'actualité des informations
                diffusées, et décline toute responsabilité pour toute imprécision,
                inexactitude ou omission.
              </p>

              <p>
                L'éditeur ne pourra être tenu responsable des dommages directs ou
                indirects résultant de l'accès ou de l'utilisation du site, ni
                des éventuelles interruptions, indisponibilités techniques ou
                infections par des virus ou logiciels malveillants.
              </p>

              <p>
                L'utilisation du site Dance Lab implique l'acceptation pleine et
                entière des présentes conditions. Ces conditions peuvent être
                modifiées à tout moment, sans préavis.
              </p>
            </div>


            {/* 06 – LIENS EXTERNES */}
            <div className="ml-section" id="liens">
              <span className="ml-section-num">06</span>
              <h2>Liens externes</h2>

              <p>
                Le site Dance Lab peut contenir des liens hypertextes vers des sites
                tiers, notamment des plateformes de streaming (Spotify, Apple Podcasts,
                Deezer, YouTube), des réseaux sociaux ou d'autres sites partenaires.
                Ces liens sont fournis à titre informatif uniquement.
              </p>

              <p>
                Dance Lab n'exerce aucun contrôle sur le contenu de ces sites et
                n'en assume aucune responsabilité. La mise en place d'un lien vers
                le site dancelab.fr est autorisée sous réserve qu'il ne soit pas
                utilisé à des fins commerciales ou publicitaires sans accord préalable,
                et qu'il n'entraîne pas de confusion avec l'identité du site.
              </p>
            </div>


            {/* 07 – CONTACT */}
            <div className="ml-section" id="contact">
              <span className="ml-section-num">07</span>
              <h2>Contact</h2>

              <p>
                Pour toute question relative au site, à son contenu ou aux présentes
                mentions légales, vous pouvez contacter Dance Lab aux coordonnées
                suivantes :
              </p>

              <div className="ml-contact-card">
                <span className="ml-contact-label">Dance Lab — Informations de contact</span>
                <div className="ml-contact-line">
                  <strong>E-mail</strong>
                  <a href="mailto:contact@dancelabmedia.com">contact@dancelabmedia.com</a>
                </div>
                <div className="ml-contact-line">
                  <strong>Adresse</strong>
                  <span className="ml-placeholder">[Adresse postale complète]</span>
                </div>
                <div className="ml-contact-line">
                  <strong>Instagram</strong>
                  <a href="https://www.instagram.com/dancelabmedia" target="_blank" rel="noopener noreferrer">
                    @dancelabmedia
                  </a>
                </div>
              </div>

              <p>
                Toute demande sera traitée dans les meilleurs délais, et au plus
                tard dans un délai de trente (30) jours ouvrés à compter de la
                réception de votre message.
              </p>
            </div>


          </div>
        </div>
      </section>

    </main>
  );
}
