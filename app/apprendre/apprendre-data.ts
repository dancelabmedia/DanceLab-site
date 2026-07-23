export type ApprendreSection = {
  slug: string
  label: string
  kicker: string
  title: string
  intro: string
  gridTitle: string
  gridIntro: string
}

export const apprendreSections: ApprendreSection[] = [
  {
    slug: "guides",
    label: "Guides",
    kicker: "Repères",
    title: "Des guides clairs pour avancer dans le monde de la danse.",
    intro:
      "Des ressources structurées pour comprendre les démarches, préparer ses projets et trouver plus facilement les informations utiles à son parcours.",
    gridTitle: "Des guides pratiques bientôt disponibles",
    gridIntro:
      "Cette page accueillera progressivement des dossiers structurés, des pas-à-pas et des ressources de référence pour les danseurs et les professionnels.",
  },
  {
    slug: "conseils",
    label: "Conseils",
    kicker: "Accompagnement",
    title: "Des conseils concrets pour faire évoluer sa pratique et sa carrière.",
    intro:
      "Des recommandations accessibles pour mieux s'organiser, se protéger, développer ses projets et prendre des décisions éclairées dans le milieu de la danse.",
    gridTitle: "Des conseils utiles bientôt disponibles",
    gridIntro:
      "Cette page réunira progressivement des conseils issus du terrain, des retours d'expérience et des réponses aux problématiques rencontrées par les artistes.",
  },
  {
    slug: "formations",
    label: "Formations",
    kicker: "Développement",
    title: "Trouver les formations adaptées à chaque étape de son parcours.",
    intro:
      "Un espace pour identifier les apprentissages, compétences et parcours de formation utiles aux artistes, créateurs et professionnels de la danse.",
    gridTitle: "Une sélection de formations bientôt disponible",
    gridIntro:
      "Cette page accueillera progressivement des formations, des programmes et des ressources pour développer ses compétences artistiques et professionnelles.",
  },
  {
    slug: "outils",
    label: "Outils",
    kicker: "Pratique",
    title: "Des outils pour simplifier le quotidien des professionnels de la danse.",
    intro:
      "Des ressources pratiques pour organiser son activité, gérer ses projets, communiquer et gagner en autonomie dans son parcours artistique.",
    gridTitle: "Des outils pratiques bientôt disponibles",
    gridIntro:
      "Cette page rassemblera progressivement des modèles, des sélections d'outils et des ressources directement mobilisables au quotidien.",
  },
]

export function getApprendreSection(slug: string) {
  return apprendreSections.find((section) => section.slug === slug)
}
