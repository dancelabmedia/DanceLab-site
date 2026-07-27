import AboutReveal from "../../components/AboutReveal";
import MissionReveal from "../../components/MissionReveal";

export default function AProposPage() {
  return (
    <main className="about-page">
      <AboutReveal />

      {/* HERO + INTRODUCTION */}
      <section className="about-hero about-chapter">

        <div className="container about-hero-grid">

          <div className="about-hero-content">

            <span className="section-label">
              À propos
            </span>

            <h1>
              Le média qui raconte la danse autrement.
            </h1>

          </div>


          <div className="about-hero-image">
            <img
              src="/images/maiwenn-about.jpg"
              alt="Maïwenn Bramoullé, fondatrice de Dance Lab"
            />
            <span className="about-photo-credit" aria-hidden="true">© Blandine Abad</span>
          </div>

          <div className="about-text about-intro-content">
            <h2>Maïwenn Bramoullé</h2>
            <p>
              Danseuse, chorégraphe, productrice et créatrice de contenus, j'ai créé
              Dance Lab avec une conviction simple :{' '}
              <strong>la danse mérite d'être racontée autrement.</strong>
            </p>
            <p>
              Derrière chaque personne, chaque parcours et chaque carrière,
              il existe une histoire. Des rencontres, des doutes, des choix,
              des sacrifices, des apprentissages, des réussites, mais aussi
              des réalités souvent invisibles.
            </p>
            <p>
              À travers Dance Lab, je pars à la rencontre de celles et ceux
              qui <strong>font vivre la danse</strong> pour mettre en lumière leurs expériences,
              leurs visions et leurs histoires.
            </p>
            <p>
              Le projet est né d'une envie : créer un espace où la danse ne se
              limite pas à ce que l'on voit sur scène, mais où l'on comprend aussi
              tout ce qui l'entoure :
            </p>
            <p>
              les <strong>réalités du métier</strong>, les enjeux professionnels,
              les tabous, les violences et comportements qui peuvent exister dans le
              milieu, les idées reçues, mais aussi la richesse, la créativité et la
              passion qui animent cet univers.
            </p>
          </div>

        </div>

      </section>

      {/* MEDIA */}
      <section className="section about-soft about-media about-chapter">

        <div className="container about-media-grid">

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
              des recommandations culturelles et des ressources,{' '}
              <strong>Dance Lab donne la parole et propose un regard</strong>{' '}
              plus profond sur celles et ceux qui construisent la danse
              d'aujourd'hui et de demain.
            </p>

            <p>
              L'objectif : créer un pont entre les <strong>artistes, les professionnels
              et le public</strong>, afin de rendre cet univers plus accessible,
              plus transparent et plus humain.
            </p>

          </div>

          <div className="about-story-image">
            <img
              src="/images/maiwenn-1.JPG"
              alt="Maïwenn Bramoullé, interprète et créatrice"
            />
            <span className="about-photo-credit" aria-hidden="true">© Blandine Abad</span>
          </div>

        </div>

      </section>


      {/* PARCOURS */}
      <section className="section about-parcours about-chapter">

        <div className="container about-grid">

          <div className="about-image fu">
            <img
              src="/images/maiwenn-danse.jpg"
              alt="Maïwenn Bramoullé en danse"
            />
            <span className="about-photo-credit" aria-hidden="true">© Blandine Abad</span>
          </div>


          <div className="about-content fu d1">

            <h2>
              Le parcours de Maïwenn
            </h2>

            <p>
              Danseuse depuis l'âge de 7 ans, je me forme en danse classique,
              pointes, modern-jazz et danse contemporaine.
            </p>

            <p>
              J'obtiens en 2014 l'EAT Jazz, suivi du Diplôme d'Artiste Interprète.
            </p>

            <p>
              Soucieuse d'enrichir mon vocabulaire artistique et de développer
              une approche plus complète du mouvement, je me forme également en
              street jazz, électro, voguing, tutting et heels, ainsi qu'en chant,
              comédie et montage vidéo.
            </p>

            <p>
              Au fil des années, j'ai eu l'opportunité d'évoluer dans différents
              univers artistiques : scène, audiovisuel, événements, création
              chorégraphique et production.
            </p>

            <p>
              Je collabore notamment en tant que danseuse avec Ubisoft pour{' '}
              <em>Just Dance 2024</em> et <em>Just Dance 2025</em>, <em>Disneyland Paris</em>,{' '}
              <em>Universal Music Group</em> et <em>Netflix</em>.
            </p>

            <p>
              Je participe également à différents clips, films, cabarets et
              spectacles, parmi lesquels <em>Les Chatouilles</em>, <em>Starmusical</em> ou encore{' '}
              <em>Relais de la Flamme Olympique de Paris 2024</em>.
            </p>

            <p>
              Je performe pour de nombreux événements, notamment <em>Euro 2016</em>,{' '}
              <em>Bal de la Rose</em> et <em>YouTube Festival</em>, ainsi qu'à l'international
              avec <em>Balich Wonder Studio</em>.
            </p>

            <p>
              Plus récemment, je rejoins l'ensemble de <em>La Légende de Monte-Cristo</em>{' '}
              en tant que danseuse et j'assure également le rôle de <strong>Dance Captain</strong>.
            </p>

          </div>

        </div>

      </section>


      {/* CREATION */}
      <section className="section about-soft about-creation about-chapter">

        <div className="container about-closing-grid">

          <div className="about-text">

            <h2>
              De l'interprétation à la création
            </h2>

            <p>
              Au-delà de mon parcours d'interprète, je développe également une
              activité de <strong>chorégraphe, assistante chorégraphe et coordinatrice artistique</strong>.
            </p>

            <p>
              J'accompagne des projets artistiques, événementiels et audiovisuels
              pour différents acteurs comme <em>BMW</em>, <em>Dassault Systèmes</em>, <em>Icade</em>, <em>DTR Fight</em>{' '}
              ou encore <em>Spoade</em>.
            </p>

            <p>
              Je travaille également sur des projets télévisés, notamment pour{' '}
              <em>Soprano : Le Concert des 1000 Choristes diffusé sur TF1</em>.
            </p>

            <p>
              Ces expériences m'ont permis de comprendre{' '}
              <strong>les multiples réalités du métier d'artiste</strong> :
              le travail invisible derrière chaque création,
              les moments de remise en question, les rencontres qui changent une
              trajectoire, mais aussi les problématiques qui traversent le milieu artistique.
            </p>

          </div>

        </div>

      </section>


      {/* ENTREPRENEURIAT */}
      <section className="section about-entrepreneur about-chapter">

        <div className="container about-entrepreneur-grid">

          <div className="about-text">

            <h2>
              Créer des espaces pour raconter et transmettre
            </h2>

            <p>
              Attirée depuis longtemps par <strong>l'entrepreneuriat et la création de projets</strong>,
              je fonde Dance Lab en 2024 avec l'envie de créer un média qui rapproche
              les artistes, les professionnels et le grand public.
            </p>

            <p>
              Cette démarche s'inscrit dans un écosystème plus large autour de la
              création avec <strong>2.6 Productions</strong>, une structure dédiée à la production
              audiovisuelle et artistique.
            </p>

            <p>
              À travers ces différents projets, mon objectif reste le même :
              créer des espaces qui permettent de raconter, transmettre et faire
              émerger de nouvelles connexions.
            </p>

          </div>

          <div className="about-closing-image">
            <img
              src="/images/maiwenn-2.jpg"
              alt="Maïwenn Bramoullé travaillant sur Dance Lab"
            />
            <span className="about-photo-credit" aria-hidden="true">© Blandine Abad</span>
          </div>

        </div>

      </section>


      {/* MISSION */}
      <section className="about-mission about-chapter">

        {/* Fond abstrait — halos lumineux diffus, aucune image */}
        <div className="about-mission-bg" aria-hidden="true">
          <div className="about-mission-halo about-mission-halo-1" />
          <div className="about-mission-halo about-mission-halo-2" />
          <div className="about-mission-halo about-mission-halo-3" />
        </div>

        <div className="container about-mission-inner">

          <div className="about-mission-heading">
            <span className="about-mission-chapter-num">06</span>
            <h2>
              La mission de <span>Dance Lab</span>
            </h2>
            <h3>
              Faire découvrir, comprendre et vivre la danse.
            </h3>
            <div className="about-mission-rule" />
          </div>

          <MissionReveal>

            <div className="mission-card">
              <span className="mission-card-number">01</span>
              <div className="mission-card-body">
                <h4>Donner la parole</h4>
                <p>
                  Donner la parole à celles et ceux qui ont un lien avec la danse.
                  Artistes, professionnels, experts, passionnés, amateurs ou acteurs
                  qui contribuent à faire évoluer cet univers : chaque regard permet
                  de mieux comprendre la richesse et la complexité de la danse.
                </p>
              </div>
            </div>

            <div className="mission-card">
              <span className="mission-card-number">02</span>
              <div className="mission-card-body">
                <h4>Mettre en lumière et transmettre</h4>
                <p>
                  Mettre en lumière les parcours, transmettre des connaissances,
                  questionner les réalités du milieu et partager des histoires qui
                  inspirent celles et ceux qui dansent, mais aussi celles et ceux
                  qui souhaitent simplement découvrir et mieux comprendre cet univers.
                </p>
              </div>
            </div>

            <div className="mission-card">
              <span className="mission-card-number">03</span>
              <div className="mission-card-body">
                <h4>Rendre la danse accessible à tous</h4>
                <p>
                  Dance Lab est un média pensé pour toutes les personnes qui aiment
                  la danse : des professionnels aux passionnés, des curieux aux futurs danseurs.
                </p>
              </div>
            </div>

          </MissionReveal>

        </div>

      </section>


    </main>
  );
}
