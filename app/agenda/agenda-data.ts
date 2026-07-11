export type AgendaEvent = {
  slug: string
  title: string
  category: "Festival" | "Spectacle" | "Battle" | "Atelier" | "Arts de rue"
  dates: string
  startDate: string
  endDate?: string
  venue: string
  city: string
  price: string
  description: string
  href: string
  image?: string
  imageCredit?: string
  sourceLabel: string
  lat: number
  lng: number
  status: "En cours" | "À venir"
}

export const agendaEvents: AgendaEvent[] = [
  {
    slug: "festival-avignon-2026",
    title: "80e Festival d'Avignon",
    category: "Festival",
    dates: "4 au 25 juillet 2026",
    startDate: "2026-07-04",
    endDate: "2026-07-25",
    venue: "Cloître Saint-Louis et lieux du Festival",
    city: "Avignon",
    price: "À compléter",
    description:
      "Le grand rendez-vous du spectacle vivant fête sa 80e édition. Théâtre, performance, danse et formes hybrides se déploient dans toute la ville.",
    href: "https://festival-avignon.com/fr/edition-2026/programmation/par-categorie?cat=1001",
    sourceLabel: "Festival d'Avignon",
    lat: 43.9493,
    lng: 4.8055,
    status: "En cours",
  },
  {
    slug: "festival-paris-lete-2026",
    title: "Festival Paris l'été",
    category: "Festival",
    dates: "À compléter",
    startDate: "2026-07-12",
    endDate: "2026-08-05",
    venue: "Plusieurs lieux",
    city: "Paris",
    price: "À compléter",
    description:
      "Un festival pluridisciplinaire qui investit Paris et ses alentours avec danse, performance, cirque, théâtre et propositions en espace public.",
    href: "https://www.parislete.fr/fr/le-programme",
    sourceLabel: "Festival Paris l'été",
    lat: 48.8566,
    lng: 2.3522,
    status: "À venir",
  },
  {
    slug: "all-world-waacking-2026",
    title: "All World Waacking",
    category: "Battle",
    dates: "À compléter",
    startDate: "2026-07-12",
    venue: "À compléter",
    city: "Paris",
    price: "À compléter",
    description:
      "Un rendez-vous consacré au waacking dans le cadre de Paris l'été. Les informations détaillées de lieu, horaires et tarifs sont à compléter.",
    href: "https://www.parislete.fr/fr/inscription-all-world-waacking",
    sourceLabel: "Festival Paris l'été",
    lat: 48.8566,
    lng: 2.3522,
    status: "À venir",
  },
  {
    slug: "grand-defile-edith-amsellem",
    title: "Le Grand Défilé — Édith Amsellem",
    category: "Spectacle",
    dates: "À compléter",
    startDate: "2026-07-12",
    venue: "À compléter",
    city: "Paris",
    price: "À compléter",
    description:
      "Un projet participatif et chorégraphique annoncé dans le cadre de Festival Paris l'été. Les informations de représentation restent à compléter.",
    href: "https://www.parislete.fr/fr/appel-a-participation-le-grand-defile",
    sourceLabel: "Festival Paris l'été",
    lat: 48.8566,
    lng: 2.3522,
    status: "À venir",
  },
  {
    slug: "la-deferlante-vague-art-2026",
    title: "La Déferlante, la vague à l'art",
    category: "Arts de rue",
    dates: "Juillet et août 2026",
    startDate: "2026-07-11",
    endDate: "2026-08-31",
    venue: "Communes du littoral vendéen et Loire-Atlantique",
    city: "Vendée / Loire-Atlantique",
    price: "À compléter",
    description:
      "Un réseau estival d'arts de la rue sur le littoral, avec une programmation pluridisciplinaire où la danse et le mouvement dialoguent avec l'espace public.",
    href: "https://www.ladeferlante.com/",
    sourceLabel: "La Déferlante",
    lat: 46.697,
    lng: -1.94,
    status: "En cours",
  },
]

export const featuredAgendaEvents = agendaEvents.slice(0, 3)
