/**
 * Fiches établissements & spectacles — Cabarets & dîners-spectacles
 *
 * Ces entrées concernent les établissements qui ne sont PAS encore présents
 * dans la base Notion (Moulin Rouge, Crazy Horse et Paradis Latin y sont déjà,
 * avec enrichissement automatique via enrich-notion-events.mjs).
 *
 * Politique de mise à jour :
 *   - isRecurring: true → jamais retiré par la logique "événement passé"
 *   - startDate = date de début de la production en cours (ou 1er janvier de
 *     l'année courante si non connue). NE PAS mettre "2024-01-01" : cette valeur
 *     s'affichait en clair sur les cartes comme "01.01.24" (fausse date).
 *     Depuis le fix 2026-10-17, formatAgendaDateRange retourne dates ("Spectacle
 *     permanent") pour isRecurring:true, donc startDate n'est plus visible
 *     directement, mais il influence l'ordre de tri : préférer l'année en cours.
 *   - dates = texte libre affiché sur la carte (ex: "Spectacle permanent")
 *   - endDate absent pour les shows sans date de fin annoncée
 *   - Toutes les informations proviennent exclusivement des sites officiels
 */

import type { AgendaEvent } from "./agenda-data"

export const cabaretEvents: AgendaEvent[] = [
  // ─────────────────────────────────────────────────────────────────
  // 1. Alcazar — "Paris s'éveille"
  // Source : https://www.alcazar.fr
  // Note : aucun nom d'artiste publié sur le site officiel
  // ─────────────────────────────────────────────────────────────────
  {
    slug: "alcazar-paris-seveille",
    title: "Paris s'éveille - Alcazar",
    category: "Cabaret & dîner-spectacle",
    dates: "Spectacle permanent",
    startDate: "2026-01-01",  // année courante — non affiché (isRecurring: true → affiche dates)
    venue: "Alcazar",
    address: "62 rue Mazarine",
    city: "Paris",
    postalCode: "75006",
    latitude: 48.8534,
    longitude: 2.3386,
    price: "À partir de 90 € (formule spectacle + champagne) - dîner-spectacle à partir de 149 €",
    time: "Jeu - Dim : 18h (early show) / 20h (dîner-spectacle)",
    description:
      "Alcazar présente « Paris s'éveille », une grande revue de cabaret parisien avec 16 danseurs, 9 chanteurs et 3 artistes visuels. Fondé en 1968, l'Alcazar propose deux formules : un early show avec champagne dès 18h (jeudi au dimanche) et un dîner-spectacle à partir de 20h.",
    officialUrl: "https://www.alcazar.fr/",
    ticketUrl: "https://eu.sevenrooms.com/explore/lalcazar/reservations/create/search/?lang=fr",
    source: "Alcazar (officiel)",
    sourceLabel: "Alcazar",
    lastVerifiedAt: "2026-10-16",
    status: "En cours",
    isRecurring: true,
    disciplines: ["Danse", "Revue", "Chant"],
    additionalInfo: [
      { label: "Horaires", value: "Jeudi, Vendredi, Samedi, Dimanche" },
      { label: "Formule early", value: "Spectacle + champagne à partir de 90 €" },
      { label: "Formule dîner", value: "Dîner-spectacle à partir de 149 €" },
      { label: "Accès", value: "Odéon (ligne 4 / 10)" },
    ],
    // Distribution non publiée sur le site officiel — mise à jour dès communication officielle
  },

  // ─────────────────────────────────────────────────────────────────
  // 2. La Nouvelle Ève — "Paris, je t'aime"
  // Source : https://lanouvelleeve.com + sortiraparis.com
  // Direction artistique : Adrien Pierini / Chorégraphie : Lianne Scrivener
  // ─────────────────────────────────────────────────────────────────
  {
    slug: "la-nouvelle-eve-paris-je-taime",
    title: "Paris, je t'aime - La Nouvelle Ève",
    category: "Cabaret & dîner-spectacle",
    dates: "Spectacle permanent",
    startDate: "2026-01-01",  // année courante — non affiché (isRecurring: true → affiche dates)
    venue: "La Nouvelle Ève",
    address: "25 rue Pierre Fontaine",
    city: "Paris",
    postalCode: "75009",
    latitude: 48.8833,
    longitude: 2.3333,
    price: "Formule spectacle + champagne / dîner-spectacle - voir site officiel",
    time: "18h30 (dîner) / 20h15 (spectacle seul) / 22h30 (spectacle seul)",
    description:
      "Fondée en 1897, La Nouvelle Ève est l'un des derniers cabarets historiques de Pigalle. Son spectacle « Paris, je t'aime » mêle French Cancan, revue de music-hall et numéros de cabaret dans une salle classée Art Déco. Deux séances de spectacle seul (20h15 et 22h30) et une formule dîner-spectacle (18h30).",
    officialUrl: "https://lanouvelleeve.com/",
    ticketUrl: "https://lanouvelleeve.com/reserver",
    source: "La Nouvelle Ève (officiel)",
    sourceLabel: "La Nouvelle Ève",
    lastVerifiedAt: "2026-10-16",
    status: "En cours",
    isRecurring: true,
    disciplines: ["Revue", "French Cancan", "Danse"],
    additionalInfo: [
      { label: "Fondation", value: "1897 - l'un des plus anciens cabarets de Paris" },
      { label: "Salle", value: "Classée Art Déco, 350 places" },
      { label: "Quartier", value: "Pigalle / Blanche" },
      { label: "Accès", value: "Pigalle (ligne 2 / 12)" },
    ],
    cast: [
      { name: "Adrien Pierini", role: "Direction artistique" },
      { name: "Nicolas Skorsky", role: "Composition musicale originale" },
      { name: "Lianne Scrivener", role: "Chorégraphie" },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  // 3. Oh! César Paris — "Les Nuits Caraïbes"
  // Source : https://ohcesarparis.com
  // ─────────────────────────────────────────────────────────────────
  {
    slug: "oh-cesar-paris-nuits-caraibes",
    title: "Les Nuits Caraïbes - Oh! César Paris",
    category: "Cabaret & dîner-spectacle",
    dates: "Spectacle permanent",
    startDate: "2026-01-01",  // année courante — non affiché (isRecurring: true → affiche dates)
    venue: "Oh! César Paris",
    address: "23 avenue du Maine",
    city: "Paris",
    postalCode: "75015",
    latitude: 48.8434,
    longitude: 2.3219,
    price: "Voir site officiel",
    time: "Dîner-spectacle à partir de 20h",
    description:
      "Oh! César Paris propose « Les Nuits Caraïbes », un dîner-spectacle de 3h15 mêlant revue tropicale, danse caribéenne et cuisine créole. Un cabaret festif et coloré au cœur du 15e arrondissement.",
    officialUrl: "https://ohcesarparis.com/",
    ticketUrl: "https://ohcesarparis.com/offres-experience/",
    source: "Oh! César Paris (officiel)",
    sourceLabel: "Oh! César Paris",
    lastVerifiedAt: "2026-10-16",
    status: "En cours",
    isRecurring: true,
    disciplines: ["Revue", "Danse caribéenne", "Dîner-spectacle"],
    additionalInfo: [
      { label: "Durée", value: "3h15 (dîner + spectacle)" },
      { label: "Style", value: "Revue tropicale et caribéenne" },
      { label: "Accès", value: "Montparnasse - Bienvenüe (lignes 4, 6, 12, 13)" },
    ],
    // Distribution non publiée sur le site officiel — mise à jour dès communication officielle
  },

  // ─────────────────────────────────────────────────────────────────
  // 4. Artishow Cabaret — Revue transformiste
  // Source : https://www.artishowcabaret.com
  // Fondateur & créateur : Pascal Papazian
  // ─────────────────────────────────────────────────────────────────
  {
    slug: "artishow-cabaret",
    title: "Artishow Cabaret - Revue transformiste",
    category: "Cabaret & dîner-spectacle",
    dates: "Septembre - décembre 2026 (jeu/ven/sam)",
    startDate: "2026-09-01",
    endDate: "2026-12-31",
    venue: "Artishow Cabaret",
    address: "3 Cité Souzy",
    city: "Paris",
    postalCode: "75011",
    latitude: 48.8604,
    longitude: 2.3785,
    price: "Voir site officiel",
    time: "Jeudi, Vendredi, Samedi soir",
    description:
      "Artishow Cabaret est un cabaret transformiste qui réunit 10 artistes (cirque, danse, performance) pour une revue atypique et festive dans le 11e arrondissement. Sa saison 2026 court de septembre à décembre, les jeudi, vendredi et samedi.",
    officialUrl: "https://www.artishowcabaret.com/",
    ticketUrl: "https://www.artishowcabaret.com/accueil-artishow-2/",
    source: "Artishow Cabaret (officiel)",
    sourceLabel: "Artishow Cabaret",
    lastVerifiedAt: "2026-10-16",
    status: "En cours",
    isRecurring: false,
    disciplines: ["Revue", "Transformisme", "Cirque", "Danse"],
    additionalInfo: [
      { label: "Style", value: "Cabaret transformiste" },
      { label: "Saison 2026", value: "Septembre - décembre 2026" },
      { label: "Accès", value: "Oberkampf (lignes 5 / 9)" },
    ],
    cast: [
      { name: "Pascal Papazian", role: "Fondateur et créateur" },
      // Artistes de la troupe (noms de scène)
      { name: "Framboise", role: "Artiste" },
      { name: "Pétunia", role: "Artiste" },
      { name: "Catherine", role: "Artiste" },
      { name: "Galipette", role: "Artiste" },
      { name: "Delhia", role: "Artiste" },
      { name: "Coco", role: "Artiste" },
      { name: "Phongsak", role: "Artiste" },
      { name: "Alexandre Josiane", role: "Artiste" },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  // 5. Lou Diprey — "Love Bazar"
  // Source : https://www.loudiprey.com + pariszigzag.fr
  // Chorégraphie Love Bazar : Yoan / Maître de cérémonie : Yoan Joao
  // ─────────────────────────────────────────────────────────────────
  {
    slug: "lou-diprey-love-bazar",
    title: "Love Bazar - Lou Diprey",
    category: "Cabaret & dîner-spectacle",
    dates: "9 octobre - 27 novembre 2026",
    startDate: "2026-10-09",
    endDate: "2026-11-27",
    venue: "Lou Diprey",
    address: "77 rue du Faubourg du Temple",
    city: "Paris",
    postalCode: "75010",
    latitude: 48.8661,
    longitude: 2.3663,
    price: "Voir site officiel",
    time: "Voir site officiel",
    description:
      "Lou Diprey présente « Love Bazar », un cabaret queer-friendly et inclusif avec 7 artistes. Une revue chaleureuse et festive dans la salle de Faubourg du Temple, du 9 octobre au 27 novembre 2026.",
    officialUrl: "https://www.loudiprey.com/",
    ticketUrl: "https://widget.thefork.com/4111648a-8dea-4d00-9f27-711757fa76da",
    source: "Lou Diprey (officiel)",
    sourceLabel: "Lou Diprey",
    lastVerifiedAt: "2026-10-16",
    status: "En cours",
    isRecurring: false,
    disciplines: ["Revue", "Cabaret", "Danse"],
    additionalInfo: [
      { label: "Style", value: "Cabaret queer-friendly et inclusif" },
      { label: "Quartier", value: "Faubourg du Temple / République" },
      { label: "Accès", value: "Goncourt (ligne 11) / République (lignes 3, 5, 8, 9, 11)" },
    ],
    cast: [
      { name: "Yoan", role: "Chorégraphie et maître de cérémonie" },
      { name: "Yoan Joao", role: "Danseur et présentateur" },
      { name: "Misty Phœnix", role: "Artiste - Interprète" },
      { name: "Azémylia", role: "Artiste - Interprète" },
      { name: "Jenny From The Blocnote", role: "Artiste - Interprète" },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  // 6. Lou Diprey — "Brunch & Queen"
  // Source : https://www.loudiprey.com
  // ─────────────────────────────────────────────────────────────────
  {
    slug: "lou-diprey-brunch-queen",
    title: "Brunch & Queen - Lou Diprey",
    category: "Cabaret & dîner-spectacle",
    dates: "11 octobre - 29 novembre 2026 (dimanches)",
    startDate: "2026-10-11",
    endDate: "2026-11-29",
    venue: "Lou Diprey",
    address: "77 rue du Faubourg du Temple",
    city: "Paris",
    postalCode: "75010",
    latitude: 48.8661,
    longitude: 2.3663,
    price: "Voir site officiel",
    time: "Dimanches",
    description:
      "Lou Diprey propose « Brunch & Queen » les dimanches : un brunch festif avec spectacle de cabaret queer pour un moment convivial et coloré. Du 11 octobre au 29 novembre 2026.",
    officialUrl: "https://www.loudiprey.com/",
    ticketUrl: "https://widget.thefork.com/4111648a-8dea-4d00-9f27-711757fa76da",
    source: "Lou Diprey (officiel)",
    sourceLabel: "Lou Diprey",
    lastVerifiedAt: "2026-10-16",
    status: "En cours",
    isRecurring: false,
    disciplines: ["Revue", "Cabaret", "Brunch"],
    additionalInfo: [
      { label: "Format", value: "Brunch + spectacle le dimanche" },
      { label: "Style", value: "Cabaret queer-friendly" },
      { label: "Accès", value: "Goncourt (ligne 11) / République" },
    ],
    cast: [
      { name: "Yoan", role: "Chorégraphie et maître de cérémonie" },
      { name: "Yoan Joao", role: "Danseur et présentateur" },
      { name: "Misty Phœnix", role: "Artiste - Interprète" },
      { name: "Azémylia", role: "Artiste - Interprète" },
      { name: "Jenny From The Blocnote", role: "Artiste - Interprète" },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  // 7. Le Bœuf sur le Toit
  // Source : https://boeufsurletoit.com
  // Note : établissement historique à dominante jazz & music-hall
  //        Distribution non publiée (programmation variable selon les soirées)
  // ─────────────────────────────────────────────────────────────────
  {
    slug: "boeuf-sur-le-toit",
    title: "Le Bœuf sur le Toit - Jazz & Music-Hall",
    category: "Cabaret & dîner-spectacle",
    dates: "Programmation permanente",
    startDate: "2024-01-01",
    venue: "Le Bœuf sur le Toit",
    address: "34 rue du Colisée",
    city: "Paris",
    postalCode: "75008",
    latitude: 48.8715,
    longitude: 2.3071,
    price: "Voir site officiel selon les soirées",
    time: "Voir programmation sur le site officiel",
    description:
      "Institution du Paris des Années Folles fondée en 1921, Le Bœuf sur le Toit est une brasserie de music-hall fréquentée par Cocteau, Picasso et les Six. Soirées jazz, dîners-spectacles et programmation de music-hall contemporain dans un décor Art Déco classé.",
    officialUrl: "https://boeufsurletoit.com/",
    ticketUrl: "https://eu.sevenrooms.com/explore/leboeufsurletoit/reservations/create/search?venues=leboeufsurletoit",
    source: "Le Bœuf sur le Toit (officiel)",
    sourceLabel: "Le Bœuf sur le Toit",
    lastVerifiedAt: "2026-10-16",
    status: "En cours",
    isRecurring: true,
    disciplines: ["Jazz", "Music-Hall", "Dîner-spectacle"],
    additionalInfo: [
      { label: "Fondation", value: "1921 - berceau du Paris des Années Folles" },
      { label: "Style", value: "Brasserie jazz & music-hall, décor Art Déco" },
      { label: "Histoire", value: "Lieu de prédilection de Cocteau, Picasso, les Six" },
      { label: "Accès", value: "Saint-Philippe-du-Roule (ligne 9) / Franklin D. Roosevelt (lignes 1 / 9)" },
    ],
    // Distribution variable selon la programmation — voir site officiel
  },
]
