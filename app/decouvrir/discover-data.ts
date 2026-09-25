export type DiscoverSection = {
  slug: string
  label: string
  title: string
  description: string
  kicker: string
  /**
   * Contrôle la visibilité dans la recherche publique.
   * - `false` (défaut) : rubrique en construction, exclue de la recherche
   * - `true` : rubrique publiée, indexée et visible dans la recherche
   *
   * Pour rendre une rubrique publique, passer cette valeur à `true`.
   */
  published: boolean
}

export const discoverSections: DiscoverSection[] = [
  {
    slug: "articles-culture",
    label: "Articles culture",
    title: "Articles culture",
    description:
      "Un espace pour publier des articles de fond, des regards critiques et des récits autour de la danse comme culture vivante.",
    kicker: "Magazine",
    published: false, // page de rubrique en construction
  },
  {
    slug: "histoire-des-styles",
    label: "Histoire des styles",
    title: "Histoire des styles",
    description:
      "Une rubrique pensée pour raconter les origines, les filiations, les codes et les évolutions des grandes esthétiques de danse.",
    kicker: "Repères",
    published: false, // page de rubrique en construction
  },
  {
    slug: "decryptages",
    label: "Décryptages",
    title: "Décryptages",
    description:
      "Des analyses pour comprendre ce qui se joue derrière les tendances, les spectacles, les carrières et les transformations du milieu.",
    kicker: "Analyse",
    published: false, // page de rubrique en construction
  },
  {
    slug: "tendances",
    label: "Tendances",
    title: "Tendances",
    description:
      "Une veille éditoriale sur les mouvements, formats, pratiques et signaux qui traversent la danse aujourd'hui.",
    kicker: "Veille",
    published: false, // page de rubrique en construction
  },
  {
    slug: "artistes-a-suivre",
    label: "Artistes à suivre",
    title: "Artistes à suivre",
    description:
      "Un espace pour mettre en avant les voix, parcours et présences artistiques qui façonnent la danse contemporaine.",
    kicker: "Portraits",
    published: false, // page de rubrique en construction
  },
]

export const featuredDiscoverArticles = [
  {
    category: "Décryptage",
    title:
      "Pourquoi le break est devenu une discipline olympique et ce que ça change pour la culture hip-hop ?",
    meta: "18.06.26 · 8 min de lecture",
    href: "/decouvrir/articles/pourquoi-le-breakdance-est-devenu-olympique",
  },
  {
    category: "Culture",
    title: "Comprendre le waacking",
    meta: "25.06.26 · 7 min de lecture",
    href: "/decouvrir/articles/comprendre-le-waacking-histoire-culture-influences",
  },
  {
    category: "Agenda",
    title: "Les festivals de danse incontournables en France cet été",
    meta: "02.07.26 · 6 min de lecture",
    href: "/decouvrir/articles/festivals-danse-incontournables-ete",
  },
  {
    category: "Guide",
    title: "Comment assister à un battle de danse pour la première fois ?",
    meta: "Guide complet du débutant · 5 min de lecture",
    href: "/decouvrir/articles-culture",
  },
  {
    category: "Portrait",
    title: "Les chorégraphes qui façonnent la danse contemporaine aujourd'hui",
    meta: "Panorama 2026 · 7 min de lecture",
    href: "/decouvrir/artistes-a-suivre",
  },
]
