export type AgendaCategory =
  | "Festival"
  | "Spectacle"
  | "Battle"
  | "Atelier"
  | "Arts de rue"
  | "Ballet"
  | "Performance"
  | "Rencontre"

export type AgendaStatus = "En cours" | "À venir" | "Complet" | "Reporté" | "Annulé"

export type AgendaEvent = {
  slug: string
  title: string
  description: string
  image?: string
  dates: string
  startDate: string
  endDate?: string
  venue: string
  address?: string
  city: string
  postalCode?: string
  latitude?: number
  longitude?: number
  price: string
  category: AgendaCategory
  officialUrl: string
  ticketUrl?: string
  source: string
  sourceLabel: string
  lastVerifiedAt: string
  status: AgendaStatus
}

export type ResolvedAgendaLocation = {
  latitude?: number
  longitude?: number
  label: string
  isComplete: boolean
}

const CITY_COORDINATES: Record<string, { latitude: number; longitude: number }> = {
  avignon: { latitude: 43.9493, longitude: 4.8055 },
  paris: { latitude: 48.8566, longitude: 2.3522 },
  lyon: { latitude: 45.764, longitude: 4.8357 },
  montpellier: { latitude: 43.6119, longitude: 3.8772 },
  biarritz: { latitude: 43.4832, longitude: -1.5586 },
  suresnes: { latitude: 48.8715, longitude: 2.2293 },
  "vendée / loire-atlantique": { latitude: 46.697, longitude: -1.94 },
}

function normalizeCity(city: string) {
  return city.trim().toLowerCase()
}

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

function isPastEvent(event: AgendaEvent) {
  return Boolean(event.endDate ? event.endDate < todayIso() : event.startDate < todayIso())
}

export function formatAgendaDate(date: string) {
  const [year, month, day] = date.split("-")

  if (!year || !month || !day) return "À compléter"

  return `${day} - ${month} - ${year}`
}

export function formatAgendaDateRange(event: AgendaEvent) {
  if (event.dates === "À compléter") return "À compléter"
  if (event.endDate && event.endDate !== event.startDate) {
    return `${formatAgendaDate(event.startDate)} au ${formatAgendaDate(event.endDate)}`
  }

  return formatAgendaDate(event.startDate)
}

export function resolveAgendaEventLocation(event: AgendaEvent): ResolvedAgendaLocation {
  if (typeof event.latitude === "number" && typeof event.longitude === "number") {
    return {
      latitude: event.latitude,
      longitude: event.longitude,
      label: [event.address, event.postalCode, event.city].filter(Boolean).join(", "),
      isComplete: true,
    }
  }

  const cityCoordinates = CITY_COORDINATES[normalizeCity(event.city)]

  if (cityCoordinates) {
    return {
      ...cityCoordinates,
      label: [event.address || event.venue, event.postalCode, event.city].filter(Boolean).join(", "),
      isComplete: true,
    }
  }

  return {
    label: "Adresse à compléter",
    isComplete: false,
  }
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
    address: "20 rue du Portail Boquier",
    city: "Avignon",
    postalCode: "84000",
    price: "À compléter",
    description:
      "Le grand rendez-vous du spectacle vivant fête sa 80e édition. Théâtre, performance, danse et formes hybrides se déploient dans toute la ville.",
    officialUrl: "https://festival-avignon.com/fr/edition-2026/programmation/par-categorie?cat=1001",
    source: "Festival d'Avignon",
    sourceLabel: "Festival d'Avignon",
    lastVerifiedAt: "2026-07-11",
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
    postalCode: "75000",
    price: "À compléter",
    description:
      "Un festival pluridisciplinaire qui investit Paris et ses alentours avec danse, performance, cirque, théâtre et propositions en espace public.",
    officialUrl: "https://www.parislete.fr/fr/le-programme",
    source: "Festival Paris l'été",
    sourceLabel: "Festival Paris l'été",
    lastVerifiedAt: "2026-07-11",
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
    postalCode: "75000",
    price: "À compléter",
    description:
      "Un rendez-vous consacré au waacking dans le cadre de Paris l'été. Les informations détaillées de lieu, horaires et tarifs sont à compléter.",
    officialUrl: "https://www.parislete.fr/fr/inscription-all-world-waacking",
    source: "Festival Paris l'été",
    sourceLabel: "Festival Paris l'été",
    lastVerifiedAt: "2026-07-11",
    status: "À venir",
  },
  {
    slug: "grand-defile-edith-amsellem",
    title: "Le Grand Défilé - Édith Amsellem",
    category: "Spectacle",
    dates: "À compléter",
    startDate: "2026-07-12",
    venue: "À compléter",
    city: "Paris",
    postalCode: "75000",
    price: "À compléter",
    description:
      "Un projet participatif et chorégraphique annoncé dans le cadre de Festival Paris l'été. Les informations de représentation restent à compléter.",
    officialUrl: "https://www.parislete.fr/fr/appel-a-participation-le-grand-defile",
    source: "Festival Paris l'été",
    sourceLabel: "Festival Paris l'été",
    lastVerifiedAt: "2026-07-11",
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
    officialUrl: "https://www.ladeferlante.com/",
    source: "La Déferlante",
    sourceLabel: "La Déferlante",
    lastVerifiedAt: "2026-07-11",
    status: "En cours",
  },
  {
    slug: "nuits-fourviere-2026",
    title: "Les Nuits de Fourvière",
    category: "Festival",
    dates: "28 mai au 25 juillet 2026",
    startDate: "2026-05-28",
    endDate: "2026-07-25",
    venue: "Théâtres romains de Fourvière",
    address: "6 rue de l'Antiquaille",
    city: "Lyon",
    postalCode: "69005",
    price: "À compléter",
    description:
      "Un festival pluridisciplinaire où danse, cirque, théâtre et musique se croisent dans les théâtres romains de Fourvière.",
    officialUrl: "https://www.nuitsdefourviere.com/",
    source: "Les Nuits de Fourvière",
    sourceLabel: "Les Nuits de Fourvière",
    lastVerifiedAt: "2026-07-11",
    status: "En cours",
  },
  {
    slug: "opera-paris-ballet-saison-26-27",
    title: "Ballet de l'Opéra national de Paris - Saison 26/27",
    category: "Ballet",
    dates: "Saison 2026-2027",
    startDate: "2026-09-01",
    endDate: "2027-07-31",
    venue: "Palais Garnier et Opéra Bastille",
    address: "Place de l'Opéra",
    city: "Paris",
    postalCode: "75009",
    price: "0€ à 300€ selon les spectacles",
    description:
      "La programmation ballet de l'Opéra national de Paris rassemble les grands classiques, les créations et les rendez-vous chorégraphiques de la saison.",
    officialUrl: "https://www.operadeparis.fr/programmation/saison-26-27",
    source: "Opéra national de Paris",
    sourceLabel: "Opéra national de Paris",
    lastVerifiedAt: "2026-07-11",
    status: "À venir",
  },
  {
    slug: "le-temps-daimer-la-danse-biarritz",
    title: "Le Temps d'Aimer la Danse",
    category: "Festival",
    dates: "À compléter",
    startDate: "2026-09-01",
    venue: "Gare du Midi et lieux partenaires",
    city: "Biarritz",
    postalCode: "64200",
    price: "À compléter",
    description:
      "Le festival biarrot dédié à la danse rassemble compagnies, créations, rencontres et propositions chorégraphiques dans plusieurs lieux du Pays basque.",
    officialUrl: "https://letempsdaimer.com/",
    source: "Le Temps d'Aimer la Danse",
    sourceLabel: "Le Temps d'Aimer la Danse",
    lastVerifiedAt: "2026-07-11",
    status: "À venir",
  },
  {
    slug: "suresnes-cites-danse-2027",
    title: "Suresnes Cités Danse",
    category: "Festival",
    dates: "Janvier 2027",
    startDate: "2027-01-01",
    venue: "Théâtre de Suresnes Jean Vilar",
    address: "16 place Stalingrad",
    city: "Suresnes",
    postalCode: "92150",
    price: "8€ à 40€ selon les tarifs du théâtre",
    description:
      "Un rendez-vous majeur pour les écritures chorégraphiques contemporaines et les formes issues des cultures hip-hop.",
    officialUrl: "https://www.theatre-suresnes.fr/",
    source: "Théâtre de Suresnes Jean Vilar",
    sourceLabel: "Suresnes Cités Danse",
    lastVerifiedAt: "2026-07-11",
    status: "À venir",
  },
]

export const upcomingAgendaEvents = agendaEvents.filter((event) => !isPastEvent(event))
export const featuredAgendaEvents = upcomingAgendaEvents.slice(0, 3)
