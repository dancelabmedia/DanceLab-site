import Link from "next/link";

export default function AProposPage() {
  return (
    <main>

      {/* HERO */}
      <section className="about-hero">
        <div className="container about-hero-grid">

          <div className="about-hero-image">
            <img
              src="/images/maiwenn-about.jpg"
              alt="Maïwenn Bramoullé, fondatrice de Dance Lab"
            />
          </div>

        </div>
      </section>


      {/* INTRODUCTION */}
      <section className="section">
        <div className="container about-text">
          <h1>À propos de Dance Lab</h1>
          <h2>Maïwenn Bramoullé</h2>
          <h3>Fondatrice de Dance Lab</h3>
          <p>
            Danseuse, chorégraphe, productrice et créatrice de contenus, j’ai créé
            Dance Lab avec une conviction simple :
            <strong> la danse mérite d’être racontée autrement.</strong>
          </p>
          <p>
            Derrière chaque artiste, chaque parcours et chaque carrière,
            il existe une histoire. Des rencontres, des doutes, des choix,
            des sacrifices, des apprentissages, des réussites, mais aussi
            des réalités souvent invisibles.
          </p>
          <p>
            À travers Dance Lab, je pars à la rencontre de celles et ceux
            qui font vivre la danse pour mettre en lumière leurs expériences,
            leurs visions et leurs histoires.
          </p>
          <p>
            Le projet est né d’une envie : créer un espace où la danse ne se
            limite pas à ce que l’on voit sur scène, mais où l’on comprend aussi
            tout ce qui l’entoure : les réalités du métier, les enjeux professionnels,
            les tabous, les violences et comportements qui peuvent exister dans le
            milieu, les idées reçues, mais aussi la richesse, la créativité et la
            passion qui animent cet univers.
          </p>
        </div>
      </section>

      {/* MEDIA */}
      <section className="section about-soft">

        <div className="container">

          <div className="about-heading fu">

            <h2>
              Un média pour découvrir, comprendre et vivre la danse
            </h2>

          </div>


          <div className="about-text fu d1">

            <p>
              Dance Lab explore la danse sous toutes ses dimensions :
              création, transmission, carrière artistique, entrepreneuriat,
              culture, enjeux professionnels et juridiques, santé mentale,
              prévention des violences et passion.
            </p>

            <p>
              À travers des podcasts, des portraits, des articles,
              des recommandations culturelles et des ressources,
              Dance Lab donne la parole aux artistes et propose un regard
              plus profond sur celles et ceux qui construisent la danse
              d’aujourd’hui et de demain.
            </p>

            <p>
              L’objectif : créer un pont entre les artistes, les professionnels
              et le public, afin de rendre cet univers plus accessible,
              plus transparent et plus humain.
            </p>

          </div>

        </div>

      </section>


      {/* PARCOURS */}
      <section className="section">

        <div className="container about-grid">

          <div className="about-image fu">
            <img
              src="/images/maiwenn-danse.jpg"
              alt="Maïwenn Bramoullé en danse"
            />
          </div>


          <div className="about-content fu d1">

            <h2>
              Le parcours de Maïwenn
            </h2>

            <p>
              Danseuse depuis l’âge de 7 ans, je me forme en danse classique,
              pointes, modern-jazz et danse contemporaine.
            </p>

            <p>
              J’obtiens en 2014 l’EAT jazz, suivi du Diplôme d’Artiste Interprète.
              Soucieuse d’enrichir mon vocabulaire artistique et de développer
              une approche plus complète du mouvement, je me forme également en
              street jazz, électro, voguing, tutting et heels, ainsi qu’en chant,
              comédie et montage vidéo.
            </p>

            <p>
              Au fil des années, j’ai eu l’opportunité d’évoluer dans différents
              univers artistiques : scène, audiovisuel, événements, création
              chorégraphique et production.
            </p>

            <p>
              Je collabore notamment en tant que danseuse avec Ubisoft pour
              Just Dance 2024 et Just Dance 2025, Disneyland Paris,
              Universal Music Group et Netflix.
            </p>

            <p>
              Je participe également à différents clips, films, cabarets et
              spectacles, parmi lesquels Les Chatouilles, Starmusical ou encore
              Relais de la Flamme Olympique de Paris 2024.
            </p>

            <p>
              Je performe pour de nombreux événements, notamment Euro 2016,
              Bal de la Rose et YouTube Festival, ainsi qu’à l’international
              avec Balich Wonder Studio.
            </p>

            <p>
              Plus récemment, je rejoins l’ensemble de La Légende de Monte-Cristo
              en tant que danseuse et j’assure également le rôle de Dance Captain.
            </p>

          </div>

        </div>

      </section>


      {/* CREATION */}
      <section className="section about-soft">

        <div className="container about-text">

          <h2>
            De l’interprétation à la création
          </h2>

          <p>
            Au-delà de mon parcours d’interprète, je développe également une
            activité de chorégraphe, assistante chorégraphe et coordinatrice artistique.
          </p>

          <p>
            J’accompagne des projets artistiques, événementiels et audiovisuels
            pour différents acteurs comme BMW, Dassault Systèmes, Icade, DTR Fight
            ou encore Spoade.
          </p>

          <p>
            Je travaille également sur des projets télévisés, notamment pour
            Soprano : Le Concert des 1000 Choristes diffusé sur TF1.
          </p>

          <p>
            Ces expériences m’ont permis de comprendre les multiples réalités
            du métier d’artiste : le travail invisible derrière chaque création,
            les moments de remise en question, les rencontres qui changent une
            trajectoire, mais aussi les problématiques qui traversent le milieu artistique.
          </p>

        </div>

      </section>


      {/* ENTREPRENEURIAT */}
      <section className="section">

        <div className="container about-text">

          <h2>
            Créer des espaces pour raconter et transmettre
          </h2>

          <p>
            Attirée depuis longtemps par l’entrepreneuriat et la création de projets,
            je fonde Dance Lab en 2024 avec l’envie de créer un média qui rapproche
            les artistes, les professionnels et le grand public.
          </p>

          <p>
            Cette démarche s’inscrit dans un écosystème plus large autour de la
            création avec 2.6 Productions, une structure dédiée à la production
            audiovisuelle et artistique, ainsi qu’avec Twalk Club, un projet mêlant
            marche, échange et créativité.
          </p>

          <p>
            À travers ces différents projets, mon objectif reste le même :
            créer des espaces qui permettent de raconter, transmettre et faire
            émerger de nouvelles connexions.
          </p>

        </div>

      </section>


      {/* MISSION */}
      <section className="about-mission">

        <div className="container about-text">

          <h2>
            La mission de Dance Lab
          </h2>

          <h3>
            Faire découvrir, comprendre et vivre la danse.
          </h3>

          <p>
            Donner la parole à celles et ceux qui ont un lien avec la danse.
            Artistes, professionnels, experts, passionnés, amateurs ou acteurs
            qui contribuent à faire évoluer cet univers : chaque regard permet
            de mieux comprendre la richesse et la complexité de la danse.
          </p>

          <p>
            Mettre en lumière les parcours, transmettre des connaissances,
            questionner les réalités du milieu et partager des histoires qui
            inspirent celles et ceux qui dansent, mais aussi celles et ceux
            qui souhaitent simplement découvrir et mieux comprendre cet univers.
          </p>

          <p>
            Dance Lab est un média pensé pour toutes les personnes qui aiment
            la danse : des professionnels aux passionnés, des curieux aux futurs danseurs.
          </p>

          <h3>
            Bienvenue dans l’univers Dance Lab.
          </h3>

        </div>

      </section>


    </main>
  );
}