import {
  ContentTemplateRenderer,
  type ContentTemplateData,
} from "../../components/templates/ContentTemplates"

const templateExamples: ContentTemplateData[] = [
  {
    template: "article",
    category: "Magazine",
    title: "Article éditorial",
    chapo: "Un modèle pensé pour les sujets culturels, les analyses et les articles de fond.",
    date: "12.07.26",
    readTime: "6 min",
    image: "/images/Couverture.png",
    description: "Template pour les articles de magazine.",
    tags: ["Culture", "Analyse", "Danse"],
    quote: "La danse se raconte autant qu'elle se regarde.",
    blocks: [
      {
        heading: "Une ouverture magazine",
        text: "Ce template permet de construire une page éditoriale avec un grand hero, une introduction forte, des sections lisibles et une colonne latérale pour les informations complémentaires.",
      },
      {
        heading: "Un rythme de lecture clair",
        text: "Les blocs sont pensés pour accueillir des paragraphes, des citations, des listes ou des encadrés sans casser l'identité visuelle du site.",
      },
    ],
  },
  {
    template: "interview",
    category: "Interview",
    title: "Conversation avec un artiste",
    chapo: "Un format pour mettre en avant une parole, un parcours et des citations fortes.",
    guest: "Nom de l'invité",
    role: "Danseur, chorégraphe, créateur",
    date: "12.07.26",
    readTime: "8 min",
    image: "/images/Couverture.png",
    description: "Template pour les entretiens et conversations longues.",
    tags: ["Interview", "Parcours", "Création"],
    quote: "Ce qui compte, c'est la manière dont une trajectoire devient une parole.",
    blocks: [
      {
        heading: "Un format centré sur la voix",
        text: "Le template interview met en valeur l'invité, sa fonction, une citation principale et plusieurs blocs éditoriaux.",
      },
    ],
  },
  {
    template: "portrait",
    category: "Portrait",
    title: "Portrait d'artiste",
    chapo: "Un modèle plus incarné pour raconter un parcours, une esthétique ou une vision.",
    guest: "Nom de l'artiste",
    role: "Artiste chorégraphique",
    date: "12.07.26",
    image: "/images/Couverture.png",
    description: "Template pour les portraits.",
    tags: ["Portrait", "Artiste", "Scène"],
    blocks: [
      {
        heading: "Une page plus humaine",
        text: "Ce format privilégie le récit, les respirations et les détails qui donnent de la présence à un parcours.",
      },
    ],
  },
  {
    template: "event",
    category: "Agenda culturel",
    title: "Événement danse",
    chapo: "Un modèle pour afficher les informations clés d'un spectacle, festival ou rendez-vous culturel.",
    date: "12.07.26",
    city: "Paris",
    venue: "Lieu à compléter",
    price: "À partir de 25 €",
    image: "/images/Couverture.png",
    description: "Template pour les pages événement.",
    ctaLabel: "Voir l'événement",
    ctaHref: "/agenda",
    tags: ["Spectacle", "Agenda", "Sortir"],
    blocks: [
      {
        heading: "Un format pratique",
        text: "Le template événement affiche les informations essentielles avec une hiérarchie claire : lieu, ville, date, prix et description.",
      },
    ],
  },
  {
    template: "guide",
    category: "Guide",
    title: "Guide pratique",
    chapo: "Un modèle utile pour les conseils carrière, ressources professionnelles et fiches pratiques.",
    date: "12.07.26",
    readTime: "5 min",
    image: "/images/Couverture.png",
    description: "Template pour les guides.",
    tags: ["Guide", "Ressources", "Conseils"],
    blocks: [
      {
        heading: "Étape 1",
        text: "Chaque section peut devenir une étape, un conseil ou une ressource actionnable.",
        items: ["Point clé à compléter", "Conseil à compléter", "Ressource à compléter"],
      },
    ],
  },
  {
    template: "gallery",
    category: "Galerie",
    title: "Galerie éditoriale",
    chapo: "Un modèle visuel pour les séries d'images, moodboards, portfolios ou sélections photo.",
    date: "12.07.26",
    image: "/images/Couverture.png",
    description: "Template pour les galeries.",
    items: [
      {
        title: "Image 1",
        text: "Description à compléter.",
        image: "/images/Couverture.png",
        meta: "Galerie",
      },
      {
        title: "Image 2",
        text: "Description à compléter.",
        image: "/images/Couverture.png",
        meta: "Galerie",
      },
      {
        title: "Image 3",
        text: "Description à compléter.",
        image: "/images/Couverture.png",
        meta: "Galerie",
      },
    ],
  },
  {
    template: "podcast",
    category: "Podcast",
    title: "Épisode enrichi",
    chapo: "Un modèle pour transformer un épisode en page éditoriale plus complète.",
    guest: "Nom de l'invité",
    duration: "1 h",
    image: "/images/Couverture.png",
    description: "Template pour les épisodes de podcast.",
    tags: ["Podcast", "Épisode", "Conversation"],
    quote: "Un épisode peut devenir une véritable porte d'entrée éditoriale.",
    blocks: [
      {
        heading: "À retenir",
        text: "Ce format peut accueillir une description longue, des chapitres, des citations et des liens d'écoute.",
      },
    ],
  },
  {
    template: "selection",
    category: "Sélection",
    title: "Sélection éditoriale",
    chapo: "Un modèle pour classer, recommander ou organiser plusieurs contenus autour d'un thème.",
    date: "12.07.26",
    image: "/images/Couverture.png",
    description: "Template pour les sélections.",
    items: [
      {
        title: "Contenu sélectionné",
        text: "Résumé à compléter.",
        image: "/images/Couverture.png",
        meta: "Sélection",
      },
      {
        title: "Autre recommandation",
        text: "Résumé à compléter.",
        image: "/images/Couverture.png",
        meta: "Sélection",
      },
      {
        title: "Dernière carte",
        text: "Résumé à compléter.",
        image: "/images/Couverture.png",
        meta: "Sélection",
      },
    ],
  },
]

export default function TemplatesPage() {
  return (
    <>
      {templateExamples.map((template) => (
        <ContentTemplateRenderer key={`${template.template}-${template.title}`} content={template} />
      ))}
    </>
  )
}
