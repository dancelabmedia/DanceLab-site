export type ExplorerSection = {
  slug: string
  label: string
  kicker: string
  title: string
  intro: string
  lead: {
    eyebrow: string
    title: string
    text: string
  }
  cards: {
    label: string
    title: string
    text: string
  }[]
  collections: {
    title: string
    text: string
  }[]
  quote: string
}

export const explorerSections: ExplorerSection[] = [
  {
    slug: "styles-de-danse",
    label: "Styles de danse",
    kicker: "Langages",
    title: "Comprendre les styles comme des cultures en mouvement.",
    intro:
      "Hip-hop, contemporain, classique, afro, waacking, krump ou heels : chaque style porte une histoire, des codes, une énergie et une manière d'habiter le corps.",
    lead: {
      eyebrow: "Guide éditorial",
      title: "Des repères pour regarder autrement",
      text:
        "Cette page prépare une cartographie claire des styles, entre origines, gestes fondateurs, figures majeures et ressources pour aller plus loin.",
    },
    cards: [
      {
        label: "Repère",
        title: "Origines & contextes",
        text:
          "Situer chaque style dans son époque, son territoire et ses communautés de pratique.",
      },
      {
        label: "Vocabulaire",
        title: "Codes du mouvement",
        text:
          "Identifier les appuis, les dynamiques, les intentions et les fondamentaux qui structurent une danse.",
      },
      {
        label: "Culture",
        title: "Artistes & références",
        text:
          "Relier les styles aux chorégraphes, interprètes, battles, scènes et œuvres qui les font vivre.",
      },
    ],
    collections: [
      {
        title: "Lexique des styles",
        text: "À compléter avec des fiches courtes, visuelles et faciles à consulter.",
      },
      {
        title: "Écouter pour comprendre",
        text: "Une sélection future d'épisodes Dance Lab associés à chaque esthétique.",
      },
      {
        title: "À voir absolument",
        text: "Un espace pour recommander spectacles, archives, battles et captations.",
      },
    ],
    quote:
      "Explorer un style, ce n'est pas seulement apprendre des pas : c'est entrer dans une histoire, une musicalité et une façon de penser le monde.",
  },
  {
    slug: "auditions",
    label: "Auditions",
    kicker: "Opportunités",
    title: "Les auditions et castings danse à ne pas manquer.",
    intro:
      "Compagnies, spectacles, opéras, productions commerciales, CCN, CN D et autres structures du secteur : toutes les opportunités réunies au même endroit.",
    lead: {
      eyebrow: "Base d'auditions Dance Lab",
      title: "Trouver sa prochaine audition",
      text:
        "Cette rubrique centralise les appels à candidature du secteur danse et spectacle vivant : compagnies chorégraphiques, institutions, opéras, comédies musicales, productions audiovisuelles et projets internationaux.",
    },
    cards: [
      {
        label: "Scène",
        title: "Compagnies & institutions",
        text:
          "Créations chorégraphiques, CCN, opéras, ballets et structures de diffusion à la recherche d'interprètes.",
      },
      {
        label: "Spectacle vivant",
        title: "Comédies musicales & productions",
        text:
          "Productions commerciales, comédies musicales, spectacles de divertissement, parcs et événementiel.",
      },
      {
        label: "Écrans & médias",
        title: "Audiovisuel & international",
        text:
          "Clips, télévision, cinéma et projets internationaux recherchant des danseur.ses professionnel.les.",
      },
    ],
    collections: [
      {
        title: "Auditions en cours",
        text: "Toutes les candidatures ouvertes, filtrables par type de projet, style, lieu et date.",
      },
      {
        title: "Alertes & nouveautés",
        text: "Les opportunités publiées récemment, signalées avec le badge Nouveau.",
      },
      {
        title: "Archives",
        text: "Les auditions passées, conservées pour référence et pour comprendre les tendances du secteur.",
      },
    ],
    quote:
      "Une audition bien préparée, c'est déjà une présence assumée. Retrouver les opportunités ne devrait pas être un travail à plein temps.",
  },
  {
    slug: "compagnies",
    label: "Compagnies",
    kicker: "Scènes",
    title: "Découvrir les collectifs qui donnent un corps à la danse.",
    intro:
      "Une compagnie est un écosystème : des artistes, des administrateurs, des lieux, des tournées, des publics et une vision partagée du plateau.",
    lead: {
      eyebrow: "Cartographie",
      title: "Comprendre les maisons de création",
      text:
        "Cette page prépare un espace pour situer les compagnies, leurs esthétiques, leurs répertoires et leur rôle dans la vie culturelle.",
    },
    cards: [
      {
        label: "Identité",
        title: "Répertoire & ligne artistique",
        text:
          "Lire ce qui distingue une compagnie : ses thèmes, ses collaborations, ses choix scéniques.",
      },
      {
        label: "Économie",
        title: "Produire, tourner, transmettre",
        text:
          "Comprendre les réalités concrètes qui permettent à une œuvre de rencontrer son public.",
      },
      {
        label: "Repérage",
        title: "Collectifs émergents",
        text:
          "Un futur espace pour mettre en lumière les compagnies et collectifs à suivre.",
      },
    ],
    collections: [
      {
        title: "Annuaire éditorial",
        text: "À compléter avec des fiches compagnies, disciplines, lieux et actualités.",
      },
      {
        title: "Dans les coulisses",
        text: "Des contenus pour comprendre la production, la diffusion et le travail d'équipe.",
      },
      {
        title: "Programmations à suivre",
        text: "Une future sélection de spectacles, festivals et temps forts liés aux compagnies.",
      },
    ],
    quote:
      "Derrière une compagnie, il y a une vision artistique, mais aussi une structure humaine qui rend le mouvement possible.",
  },
  {
    slug: "artistes",
    label: "Artistes",
    kicker: "Portraits",
    title: "Rencontrer les parcours qui façonnent la danse d'aujourd'hui.",
    intro:
      "Interprètes, professeurs, danseurs de battle, performeurs, créateurs de contenus ou artistes hybrides : la danse se raconte aussi par les trajectoires individuelles.",
    lead: {
      eyebrow: "Parcours vivants",
      title: "Mettre des visages sur les pratiques",
      text:
        "Cette rubrique est pensée pour accueillir des portraits, des recommandations et des repères humains autour de celles et ceux qui font la danse.",
    },
    cards: [
      {
        label: "Portrait",
        title: "Trajectoires singulières",
        text:
          "Documenter les débuts, les bifurcations, les choix et les moments décisifs d'un parcours.",
      },
      {
        label: "Pratique",
        title: "Méthodes & rituels",
        text:
          "Comprendre comment les artistes s'entraînent, créent, transmettent et se protègent.",
      },
      {
        label: "Recommandation",
        title: "Artistes à suivre",
        text:
          "Une sélection évolutive de profils qui incarnent la richesse de la scène actuelle.",
      },
    ],
    collections: [
      {
        title: "Galerie de portraits",
        text: "À compléter avec des fiches courtes, photos, épisodes associés et liens utiles.",
      },
      {
        title: "Voix Dance Lab",
        text: "Une passerelle vers les interviews déjà publiées dans le podcast.",
      },
      {
        title: "Carnets d'artistes",
        text: "Un futur format pour suivre les pratiques, inspirations et recommandations.",
      },
    ],
    quote:
      "Chaque parcours d'artiste raconte une manière de tenir dans le métier, de créer sa place et de transformer une pratique en langage.",
  },
  {
    slug: "metiers-de-la-danse",
    label: "Métiers de la danse",
    kicker: "Professionnel",
    title: "Comprendre tout ce qui rend la danse possible.",
    intro:
      "Danseur, chorégraphe, répétiteur, régisseur, administrateur, agent, kinésithérapeute, professeur : la danse est un ensemble de métiers, de compétences et de responsabilités.",
    lead: {
      eyebrow: "Guide métier",
      title: "Au-delà de la scène",
      text:
        "Cette page prépare une lecture claire des métiers de la danse, pour comprendre les rôles, les réalités de terrain et les ressources nécessaires.",
    },
    cards: [
      {
        label: "Rôle",
        title: "Qui fait quoi ?",
        text:
          "Définir les missions, les compétences et les responsabilités de chaque métier.",
      },
      {
        label: "Carrière",
        title: "Se former et durer",
        text:
          "Identifier les parcours possibles, les enjeux de santé, de réseau, de statut et de transmission.",
      },
      {
        label: "Ressource",
        title: "Boîte à outils",
        text:
          "Préparer des fiches pratiques pour accompagner les artistes dans leur quotidien professionnel.",
      },
    ],
    collections: [
      {
        title: "Fiches métiers",
        text: "À compléter avec formations, compétences, statuts, outils et témoignages.",
      },
      {
        title: "Ressources pro",
        text: "Un pont vers les contenus administratifs, juridiques et carrière de Dance Lab.",
      },
      {
        title: "Paroles de terrain",
        text: "Des épisodes et portraits à relier aux réalités concrètes du métier.",
      },
    ],
    quote:
      "Explorer les métiers de la danse, c'est comprendre que le plateau n'est que la partie visible d'un écosystème immense.",
  },
]

export function getExplorerSection(slug: string) {
  return explorerSections.find((section) => section.slug === slug)
}
