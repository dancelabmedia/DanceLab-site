import type { Metadata } from "next";
import "../mentions-legales/mentions-legales.css";
import "./gestion-cookies.css";

export const metadata: Metadata = {
  title: "Gestion des cookies – Dance Lab",
  description:
    "Découvrez comment Dance Lab utilise les cookies et comment gérer vos préférences, conformément aux recommandations de la CNIL.",
  robots: { index: false, follow: false },
};

export default function GestionCookiesPage() {
  return (
    <main className="gestion-cookies-page">

      {/* HERO */}
      <section className="ml-hero">
        <div className="container">
          <div className="ml-hero-inner">

            <span className="section-label">Transparence & contrôle</span>

            <h1>Gestion des cookies</h1>

            <p className="ml-intro">
              Un cookie est un petit fichier déposé sur votre navigateur
              lorsque vous visitez un site web. Il permet de mémoriser des
              informations sur votre visite afin de vous offrir une
              expérience plus fluide. Cette page vous explique comment
              Dance Lab les utilise — et comment vous gardez le contrôle.
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
              <li><a href="#kesako">C'est quoi un cookie ?</a></li>
              <li><a href="#pourquoi">Pourquoi Dance Lab utilise des cookies</a></li>
              <li><a href="#essentiels">Cookies essentiels</a></li>
              <li><a href="#audience">Cookies de mesure d'audience</a></li>
              <li><a href="#fonctionnels">Cookies fonctionnels</a></li>
              <li><a href="#tiers">Cookies de services tiers</a></li>
              <li><a href="#bandeau">Le bandeau de consentement</a></li>
              <li><a href="#duree">Durée de conservation</a></li>
              <li><a href="#gerer">Gérer vos préférences à tout moment</a></li>
            </ol>

          </div>
        </div>
      </section>


      {/* BODY */}
      <section className="ml-body">
        <div className="container">
          <div className="ml-body-inner">


            {/* 01 – C'EST QUOI */}
            <div className="ml-section" id="kesako">
              <span className="ml-section-num">01</span>
              <h2>C'est quoi un cookie ?</h2>

              <p>
                Imaginez un petit post-it que votre navigateur colle sur la
                fenêtre du site que vous visitez. Ce post-it s'appelle un
                cookie. Il contient une information simple — par exemple le
                fait que vous avez déjà visité le site, ou que vous avez
                accepté telle ou telle préférence — et il est relu à chaque
                fois que vous revenez.
              </p>

              <p>
                Les cookies peuvent être déposés par le site lui-même
                (cookies « first-party ») ou par des services extérieurs
                intégrés à la page, comme un lecteur audio ou une vidéo
                (cookies « third-party »). Ils ne contiennent pas de virus
                et ne peuvent pas accéder aux fichiers stockés sur votre
                ordinateur.
              </p>

              <p>
                En France, le dépôt de certains cookies est soumis à votre
                consentement préalable, conformément à l'article 82 de la
                loi Informatique et Libertés et aux recommandations de la
                CNIL.
              </p>
            </div>


            {/* 02 – POURQUOI */}
            <div className="ml-section" id="pourquoi">
              <span className="ml-section-num">02</span>
              <h2>Pourquoi Dance Lab utilise des cookies</h2>

              <p>
                Dance Lab est avant tout un espace de lecture, d'écoute
                et de découverte. Les cookies que nous utilisons ont pour
                seul objectif de faire fonctionner le site correctement,
                de mémoriser vos préférences, et de mieux comprendre
                comment le contenu est consulté — afin de l'améliorer.
              </p>

              <p>
                Nous n'utilisons aucun cookie à des fins publicitaires.
                Nous ne revendons pas les données de navigation à des
                tiers. Notre approche se veut simple, transparente et
                respectueuse.
              </p>

              <div className="ck-category-grid">

                <div className="ck-category-card ck-cat--essential">
                  <div className="ck-cat-header">
                    <span className="ck-cat-badge ck-badge--essential">Toujours actifs</span>
                    <span className="ck-cat-title">Essentiels</span>
                  </div>
                  <p>Nécessaires au fonctionnement du site. Ils ne peuvent pas être désactivés.</p>
                </div>

                <div className="ck-category-card ck-cat--analytics">
                  <div className="ck-cat-header">
                    <span className="ck-cat-badge ck-badge--optional">Optionnels</span>
                    <span className="ck-cat-title">Mesure d'audience</span>
                  </div>
                  <p>Permettent de comprendre comment le site est utilisé, pour l'améliorer.</p>
                </div>

                <div className="ck-category-card ck-cat--functional">
                  <div className="ck-cat-header">
                    <span className="ck-cat-badge ck-badge--optional">Optionnels</span>
                    <span className="ck-cat-title">Fonctionnels</span>
                  </div>
                  <p>Mémorisent vos préférences pour une navigation plus fluide.</p>
                </div>

                <div className="ck-category-card ck-cat--third">
                  <div className="ck-cat-header">
                    <span className="ck-cat-badge ck-badge--optional">Optionnels</span>
                    <span className="ck-cat-title">Services tiers</span>
                  </div>
                  <p>Déposés par des plateformes externes intégrées au site.</p>
                </div>

              </div>
            </div>


            {/* 03 – ESSENTIELS */}
            <div className="ml-section" id="essentiels">
              <span className="ml-section-num">03</span>
              <h2>Cookies essentiels</h2>

              <p>
                Ces cookies sont indispensables au bon fonctionnement du
                site. Sans eux, certaines fonctionnalités de base —
                navigation entre les pages, mémorisation de vos actions
                en cours de session, sécurité — ne seraient pas assurées.
              </p>

              <p>
                Ils ne collectent aucune information personnelle permettant
                de vous identifier et ne nécessitent pas votre consentement.
                Ils sont actifs en permanence, conformément à l'article 82
                de la loi Informatique et Libertés.
              </p>

              <table className="ml-info-table">
                <thead>
                  <tr>
                    <th scope="col">Cookie</th>
                    <th scope="col">Rôle</th>
                    <th scope="col">Durée</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">Session de navigation</th>
                    <td>Maintient votre session active sur le site</td>
                    <td>Session</td>
                  </tr>
                  <tr>
                    <th scope="row">Préférences consentement</th>
                    <td>Mémorise vos choix concernant les cookies</td>
                    <td>13 mois</td>
                  </tr>
                  <tr>
                    <th scope="row">Sécurité CSRF</th>
                    <td>Protège contre les attaques inter-sites</td>
                    <td>Session</td>
                  </tr>
                </tbody>
              </table>
            </div>


            {/* 04 – MESURE D'AUDIENCE */}
            <div className="ml-section" id="audience">
              <span className="ml-section-num">04</span>
              <h2>Cookies de mesure d'audience</h2>

              <p>
                Ces cookies nous permettent de comprendre comment vous
                naviguez sur le site : quelles pages sont les plus
                consultées, combien de temps vous y passez, d'où viennent
                les visiteurs. Ces informations, analysées de façon agrégée
                et anonymisée, nous aident à améliorer l'expérience de
                lecture et la qualité des contenus proposés.
              </p>

              <p>
                Ils sont optionnels et ne sont déposés qu'avec votre
                consentement. Si vous refusez, votre navigation reste
                totalement identique — vous ne verrez simplement pas
                de différence.
              </p>

              <table className="ml-info-table">
                <thead>
                  <tr>
                    <th scope="col">Service</th>
                    <th scope="col">Rôle</th>
                    <th scope="col">Durée</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">
                      <span className="ml-placeholder">[Outil d'analyse — ex. Plausible, Fathom, Matomo…]</span>
                    </th>
                    <td>Statistiques de fréquentation agrégées et anonymisées</td>
                    <td>13 mois max.</td>
                  </tr>
                </tbody>
              </table>

              <p>
                <em>
                  Note : si Dance Lab ne recourt à aucun outil d'analyse
                  tiers, cette section peut être supprimée ou adaptée
                  en conséquence.
                </em>
              </p>
            </div>


            {/* 05 – FONCTIONNELS */}
            <div className="ml-section" id="fonctionnels">
              <span className="ml-section-num">05</span>
              <h2>Cookies fonctionnels</h2>

              <p>
                Les cookies fonctionnels améliorent votre confort de
                navigation en mémorisant vos préférences d'une visite à
                l'autre. Ils ne servent pas à vous suivre sur d'autres
                sites et ne partagent aucune donnée à des fins commerciales.
              </p>

              <table className="ml-info-table">
                <thead>
                  <tr>
                    <th scope="col">Cookie</th>
                    <th scope="col">Rôle</th>
                    <th scope="col">Durée</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">Sélection invités</th>
                    <td>
                      Mémorise la sélection d'invités affichée en page
                      d'accueil entre deux visites
                    </td>
                    <td>Session</td>
                  </tr>
                  <tr>
                    <th scope="row">Préférences d'affichage</th>
                    <td>
                      Retient vos éventuels réglages d'interface
                    </td>
                    <td>13 mois max.</td>
                  </tr>
                </tbody>
              </table>
            </div>


            {/* 06 – SERVICES TIERS */}
            <div className="ml-section" id="tiers">
              <span className="ml-section-num">06</span>
              <h2>Cookies de services tiers</h2>

              <p>
                Dance Lab intègre des contenus et des outils provenant de
                plateformes extérieures : lecteurs de podcast, vidéos,
                réseaux sociaux, newsletter. Ces services peuvent déposer
                leurs propres cookies lorsque vous interagissez avec eux.
                Nous n'avons aucun contrôle sur ces cookies tiers, qui sont
                soumis aux politiques de confidentialité de chacune de
                ces plateformes.
              </p>

              <table className="ml-info-table">
                <thead>
                  <tr>
                    <th scope="col">Service</th>
                    <th scope="col">Usage sur Dance Lab</th>
                    <th scope="col">Politique</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">Spotify</th>
                    <td>Écoute des épisodes de podcast</td>
                    <td>
                      <a href="https://www.spotify.com/fr/legal/privacy-policy/" target="_blank" rel="noopener noreferrer">
                        Voir
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">Apple Podcasts</th>
                    <td>Écoute et abonnement au podcast</td>
                    <td>
                      <a href="https://www.apple.com/fr/legal/privacy/" target="_blank" rel="noopener noreferrer">
                        Voir
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">Deezer</th>
                    <td>Écoute des épisodes de podcast</td>
                    <td>
                      <a href="https://www.deezer.com/legal/personal-datas" target="_blank" rel="noopener noreferrer">
                        Voir
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">YouTube</th>
                    <td>Lecture de vidéos intégrées</td>
                    <td>
                      <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
                        Voir
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">Instagram</th>
                    <td>Liens et contenus intégrés</td>
                    <td>
                      <a href="https://privacycenter.instagram.com/policy/" target="_blank" rel="noopener noreferrer">
                        Voir
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">LinkedIn</th>
                    <td>Partage de contenus</td>
                    <td>
                      <a href="https://www.linkedin.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">
                        Voir
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">Substack</th>
                    <td>Inscription à la newsletter Dance Lab</td>
                    <td>
                      <a href="https://substack.com/privacy" target="_blank" rel="noopener noreferrer">
                        Voir
                      </a>
                    </td>
                  </tr>
                </tbody>
              </table>

              <p>
                Lorsque vous n'avez pas consenti aux cookies tiers,
                les contenus embarqués (lecteurs audio, vidéos) peuvent
                être remplacés par une vignette neutre vous invitant à
                activer le contenu manuellement.
              </p>
            </div>


            {/* 07 – BANDEAU */}
            <div className="ml-section" id="bandeau">
              <span className="ml-section-num">07</span>
              <h2>Le bandeau de consentement</h2>

              <p>
                Lors de votre première visite sur Dance Lab, un bandeau
                apparaît en bas de l'écran pour vous informer de l'utilisation
                des cookies et recueillir votre choix. Ce bandeau vous propose
                trois options claires :
              </p>

              <div className="ck-consent-steps">

                <div className="ck-consent-step">
                  <div className="ck-step-icon ck-step-icon--accept">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M20 6L9 17l-5-5"/>
                    </svg>
                  </div>
                  <div>
                    <strong>Tout accepter</strong>
                    <p>
                      Vous autorisez tous les cookies : essentiels, fonctionnels,
                      mesure d'audience et services tiers. La navigation est
                      complète et personnalisée.
                    </p>
                  </div>
                </div>

                <div className="ck-consent-step">
                  <div className="ck-step-icon ck-step-icon--refuse">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                  </div>
                  <div>
                    <strong>Tout refuser</strong>
                    <p>
                      Seuls les cookies strictement nécessaires au
                      fonctionnement du site sont déposés. Vous accédez
                      à tous les contenus sans restriction.
                    </p>
                  </div>
                </div>

                <div className="ck-consent-step">
                  <div className="ck-step-icon ck-step-icon--custom">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="12" cy="12" r="3"/>
                      <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
                    </svg>
                  </div>
                  <div>
                    <strong>Personnaliser</strong>
                    <p>
                      Vous choisissez catégorie par catégorie quels cookies
                      vous souhaitez autoriser, selon vos préférences.
                    </p>
                  </div>
                </div>

              </div>

              <p>
                Votre choix est enregistré pendant 13 mois. Passé ce délai,
                le bandeau réapparaîtra pour vous permettre de le renouveler
                ou de le modifier, conformément aux recommandations de la CNIL.
              </p>
            </div>


            {/* 08 – DURÉE */}
            <div className="ml-section" id="duree">
              <span className="ml-section-num">08</span>
              <h2>Durée de conservation des cookies</h2>

              <p>
                Conformément aux recommandations de la CNIL, la durée de
                vie maximale des cookies soumis à consentement est fixée à{" "}
                <strong>13 mois</strong> à compter de leur dépôt sur votre
                navigateur. Passé ce délai, votre consentement est considéré
                comme expiré et le bandeau est présenté à nouveau.
              </p>

              <p>
                Les cookies de session (non persistants) sont quant à eux
                automatiquement supprimés à la fermeture de votre navigateur.
                Ils ne mémorisent rien entre deux visites distinctes.
              </p>

              <table className="ml-info-table">
                <thead>
                  <tr>
                    <th scope="col">Type de cookie</th>
                    <th scope="col">Durée maximale</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">Cookies de session</th>
                    <td>Supprimés à la fermeture du navigateur</td>
                  </tr>
                  <tr>
                    <th scope="row">Cookies persistants optionnels</th>
                    <td>13 mois maximum (recommandation CNIL)</td>
                  </tr>
                  <tr>
                    <th scope="row">Mémorisation du consentement</th>
                    <td>13 mois (renouvellement automatique du bandeau)</td>
                  </tr>
                </tbody>
              </table>
            </div>


            {/* 09 – GÉRER */}
            <div className="ml-section" id="gerer">
              <span className="ml-section-num">09</span>
              <h2>Gérer vos préférences à tout moment</h2>

              <p>
                Vous n'êtes jamais bloqué dans votre choix initial. Plusieurs
                options s'offrent à vous pour modifier vos préférences ou
                supprimer des cookies déjà déposés :
              </p>

              <p>
                <strong>Via le lien dans le footer.</strong> Le lien
                « Gestion des cookies » présent en bas de chaque page du
                site vous permet de rouvrir le panneau de préférences
                à tout moment et de modifier vos choix catégorie par catégorie.
              </p>

              <p>
                <strong>Via les paramètres de votre navigateur.</strong>{" "}
                Tous les navigateurs modernes proposent des options pour
                consulter, bloquer ou supprimer les cookies. Ces réglages
                se trouvent généralement dans le menu Paramètres ou
                Préférences de votre navigateur :
              </p>

              <table className="ml-info-table">
                <tbody>
                  <tr>
                    <th scope="row">Google Chrome</th>
                    <td>
                      Paramètres → Confidentialité et sécurité → Cookies et autres données de site
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">Safari</th>
                    <td>
                      Préférences → Confidentialité → Gérer les données des sites web
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">Firefox</th>
                    <td>
                      Paramètres → Vie privée et sécurité → Cookies et données de sites
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">Microsoft Edge</th>
                    <td>
                      Paramètres → Cookies et autorisations de sites
                    </td>
                  </tr>
                </tbody>
              </table>

              <p>
                Attention : désactiver tous les cookies depuis votre
                navigateur peut altérer le fonctionnement de certains sites,
                y compris Dance Lab. Les cookies essentiels, supprimés de
                cette façon, pourraient perturber votre navigation.
              </p>

              <div className="ml-contact-card">
                <span className="ml-contact-label">Une question sur les cookies ?</span>
                <div className="ml-contact-line">
                  <strong>E-mail</strong>
                  <a href="mailto:contact@dancelabmedia.com">
                    contact@dancelabmedia.com
                  </a>
                </div>
                <div className="ml-contact-line">
                  <strong>CNIL</strong>
                  <a href="https://www.cnil.fr/fr/plaintes" target="_blank" rel="noopener noreferrer">
                    Déposer une réclamation
                  </a>
                </div>
              </div>

            </div>


          </div>
        </div>
      </section>

    </main>
  );
}
