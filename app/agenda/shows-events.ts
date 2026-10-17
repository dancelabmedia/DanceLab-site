/**
 * Grandes productions — Comédies musicales, spectacles chorégraphiques majeurs,
 * spectacles drag et pluridisciplinaires à forte dimension danse.
 *
 * Politique :
 *   - Sources officielles uniquement (sites producteurs, billetteries officielles)
 *   - Un slug par production + par ville/run distinct (une tournée = plusieurs fiches)
 *   - Les shows en cours d'affiche (endDate >= today) sont conservés même si startDate est passée
 *   - Vérifier lastVerifiedAt avant toute mise à jour
 */

import type { AgendaEvent } from "./agenda-data"

export const showsEvents: AgendaEvent[] = [

  // ─────────────────────────────────────────────────────────────────
  // 1. La Légende de Monte-Cristo, le Musical — Maison de la Mutualité
  //    Run 1 : 26 déc 2026 – 3 jan 2027
  // Source : https://www.sortiraparis.com + titrespresse.com + casting.fr
  // Note : production distincte du "Monte Cristo" des Folies Bergère (2026)
  //        Gjon's Tears (Edmond Dantès), Philippine Lavrey (Mercédès)
  //        Francis Huster (Narrateur), Marianne Orlowski (Héloïse de Villefort)
  //        Chorégraphie : Nicolas Huchard / Mise en scène : Serge Postigo
  // ─────────────────────────────────────────────────────────────────
  {
    slug: "monte-cristo-musical-paris-dec-2026",
    title: "La Légende de Monte-Cristo, le Musical",
    category: "Comédie musicale",
    dates: "26 décembre 2026 - 3 janvier 2027",
    startDate: "2026-12-26",
    endDate: "2027-01-03",
    venue: "Maison de la Mutualité",
    address: "24 rue Saint-Victor",
    city: "Paris",
    postalCode: "75005",
    latitude: 48.8495,
    longitude: 2.3523,
    price: "À partir de 29 €",
    time: "Voir billetterie",
    duration: "1h50 avec entracte (15-20 min)",
    description:
      "La Légende de Monte-Cristo revient à Paris après son triomphe au Dôme de Paris. Le chanteur Gjon's Tears incarne Edmond Dantès dans cette comédie musicale adaptée du roman d'Alexandre Dumas, avec Francis Huster en narrateur. Sur scène : 11 voix, 12 danseurs, des chorégraphies de Nicolas Huchard et une mise en scène de Serge Postigo. Un spectacle familial dès 5 ans.",
    image: "https://www.ledomedeparis.com/mesimages/bibliotheque/articles/vignettes/lldmc_dome_ig_1080x1350_credit_nickelnigel_anthonyghnassia.jpg",
    officialUrl: "https://lalegendedemontecristo.com",
    ticketUrl: "https://feverup.com/m/669647",
    source: "Sortiraparis / Fever (officiel)",
    sourceLabel: "Maison de la Mutualité",
    lastVerifiedAt: "2026-10-15",
    status: "À venir",
    disciplines: ["Comédie musicale", "Danse", "Chant"],
    additionalInfo: [
      { label: "Production", value: "Nakache Entertainment / Narya Productions" },
      { label: "Public", value: "Dès 5 ans" },
      { label: "Accès", value: "Maubert-Mutualité (ligne 10)" },
    ],
    cast: [
      // Distribution artistique
      { name: "Gjon's Tears", role: "Interprète", character: "Edmond Dantès / Le Comte de Monte-Cristo" },
      { name: "Philippine Lavrey", role: "Interprète", character: "Mercédès" },
      { name: "Marianne Orlowski", role: "Interprète", character: "Héloïse de Villefort" },
      { name: "Francis Huster", role: "Interprète", character: "Narrateur" },
      // Équipe artistique
      { name: "Serge Postigo", role: "Mise en scène" },
      { name: "Nicolas Huchard", role: "Chorégraphie" },
      { name: "Romann Nakache", role: "Direction musicale" },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  // 2. La Légende de Monte-Cristo, le Musical — Maison de la Mutualité
  //    Run 2 : 8 – 28 février 2027
  // Source : sortiraparis.com / titrespresse.com
  // ─────────────────────────────────────────────────────────────────
  {
    slug: "monte-cristo-musical-paris-fev-2027",
    title: "La Légende de Monte-Cristo, le Musical",
    category: "Comédie musicale",
    dates: "8 - 28 février 2027",
    startDate: "2027-02-08",
    endDate: "2027-02-28",
    venue: "Maison de la Mutualité",
    address: "24 rue Saint-Victor",
    city: "Paris",
    postalCode: "75005",
    latitude: 48.8495,
    longitude: 2.3523,
    price: "À partir de 29 €",
    time: "Voir billetterie",
    duration: "1h50 avec entracte (15-20 min)",
    description:
      "Deuxième série de représentations parisiennes de La Légende de Monte-Cristo à la Maison de la Mutualité. Gjon's Tears reprend le rôle d'Edmond Dantès dans cette comédie musicale chorégraphiée par Nicolas Huchard.",
    image: "https://www.ledomedeparis.com/mesimages/bibliotheque/articles/vignettes/lldmc_dome_ig_1080x1350_credit_nickelnigel_anthonyghnassia.jpg",
    officialUrl: "https://lalegendedemontecristo.com",
    ticketUrl: "https://feverup.com/m/669647",
    source: "Sortiraparis / Fever (officiel)",
    sourceLabel: "Maison de la Mutualité",
    lastVerifiedAt: "2026-10-15",
    status: "À venir",
    disciplines: ["Comédie musicale", "Danse", "Chant"],
    additionalInfo: [
      { label: "Production", value: "Nakache Entertainment / Narya Productions" },
      { label: "Public", value: "Dès 5 ans" },
      { label: "Accès", value: "Maubert-Mutualité (ligne 10)" },
    ],
    cast: [
      // Distribution artistique
      { name: "Gjon's Tears", role: "Interprète", character: "Edmond Dantès / Le Comte de Monte-Cristo" },
      { name: "Philippine Lavrey", role: "Interprète", character: "Mercédès" },
      { name: "Marianne Orlowski", role: "Interprète", character: "Héloïse de Villefort" },
      { name: "Francis Huster", role: "Interprète", character: "Narrateur" },
      // Équipe artistique
      { name: "Serge Postigo", role: "Mise en scène" },
      { name: "Nicolas Huchard", role: "Chorégraphie" },
      { name: "Romann Nakache", role: "Direction musicale" },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  // 3. Drag Race France Live — Saison 4
  //    Casino de Paris, 24 sept – 17 oct 2026 (en cours)
  // Source : https://www.casinodeparis.fr + presse
  // Direction artistique : Thomas Jolly / Chorégraphie : Kevin Vivès, Julia Spiesser
  // ─────────────────────────────────────────────────────────────────
  {
    slug: "drag-race-france-live-s4-2026",
    title: "Drag Race France Live - Saison 4",
    category: "Spectacle",
    dates: "24 septembre - 17 octobre 2026",
    startDate: "2026-09-24",
    endDate: "2026-10-17",
    venue: "Casino de Paris",
    address: "16 rue de Clichy",
    city: "Paris",
    postalCode: "75009",
    latitude: 48.8827,
    longitude: 2.3296,
    price: "À partir de 39 €",
    time: "20h00 (portes 19h00)",
    description:
      "Drag Race France Live revient pour une Saison 4 spectaculaire au Casino de Paris ! Nicky Doll aux manettes, nouvelles reines, nouveau show : des performances XXL, créativité et glamour mis en scène par Thomas Jolly avec la chorégraphie de Kevin Vivès. Une célébration de la culture drag portée par 10 reines dont Azemylia, Creatine Price, Fluffy Bidule, Holly White et Margarette.",
    image: "https://www.casinodeparis.fr/sites/hubber_site_casinodeparis8/files/2025-12/1920x600.jpg",
    officialUrl: "https://www.casinodeparis.fr/fr/Drag-Race-France-Live-Saison-4-24-Septembre-Au-3-Octobre-2026-Billetterie-Paris",
    ticketUrl: "https://www.casinodeparis.fr/fr/Drag-Race-France-Live-Saison-4-24-Septembre-Au-3-Octobre-2026-Billetterie-Paris",
    source: "Casino de Paris (officiel)",
    sourceLabel: "Casino de Paris",
    lastVerifiedAt: "2026-10-15",
    status: "En cours",
    disciplines: ["Drag", "Performance", "Danse", "Chant"],
    additionalInfo: [
      { label: "Producteur", value: "Junzi Arts / Endemol France / World of Wonder Productions" },
      { label: "Public", value: "Déconseillé aux moins de 3 ans" },
      { label: "Accès", value: "Place de Clichy (lignes 2 / 13)" },
    ],
    cast: [
      // Distribution artistique
      { name: "Nicky Doll", role: "Hôtesse" },
      { name: "Azemylia", role: "Drag Queen - Interprète" },
      { name: "Creatine Price", role: "Drag Queen - Interprète" },
      { name: "Daisy Superbitch", role: "Drag Queen - Interprète" },
      { name: "Fluffy Bidule", role: "Drag Queen - Interprète" },
      { name: "Holly White", role: "Drag Queen - Interprète" },
      { name: "La Harpie", role: "Drag Queen - Interprète" },
      { name: "Lana Cotta", role: "Drag Queen - Interprète" },
      { name: "Malawitte", role: "Drag Queen - Interprète" },
      { name: "Margarette", role: "Drag Queen - Interprète" },
      { name: "Sublyme", role: "Drag Queen - Interprète" },
      // Équipe artistique
      { name: "Thomas Jolly", role: "Direction artistique et mise en scène" },
      { name: "Kevin Vivès", role: "Direction artistique et chorégraphie" },
      { name: "Samy Zerrouki", role: "Direction artistique et dramaturgie" },
      { name: "Julia Spiesser", role: "Co-chorégraphie" },
      // Création
      { name: "Aymerick Zana", role: "Costumes" },
      { name: "Hélène Fief", role: "Scénographie" },
      { name: "Pascal Noël", role: "Lumières" },
      { name: "Upsilone", role: "Son" },
      { name: "Julien Chapero", role: "Coordination artistique" },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  // 4. Le Roi Soleil — Le Retour — Dôme de Paris (Run 1 : en cours)
  //    12 sept – 18 oct 2026
  // Source : https://decibelsprod.com + https://leroisoleil-lespectacle.fr
  // Mise en scène & chorégraphie : Kamel Ouali / Production : Dove Attia
  // ─────────────────────────────────────────────────────────────────
  {
    slug: "le-roi-soleil-retour-paris-2026",
    title: "Le Roi Soleil - Le Retour",
    category: "Comédie musicale",
    dates: "12 septembre - 18 octobre 2026",
    startDate: "2026-09-12",
    endDate: "2026-10-18",
    venue: "Dôme de Paris - Palais des Sports",
    address: "34 Boulevard Victor",
    city: "Paris",
    postalCode: "75015",
    latitude: 48.8367,
    longitude: 2.2886,
    price: "De 25 € à 98 €",
    time: "Voir calendrier en ligne",
    description:
      "Pour ses 20 ans, le spectacle mythique Le Roi Soleil revient dans une toute nouvelle version mise en scène par Kamel Ouali et produite par Dove Attia. Emmanuel Moire reprend le rôle du Roi, entouré de Yoann Casanova (Beaufort), Clara Poulet (Mme de Maintenon) et plus de 30 artistes avec orchestre live. Musiques originales, chorégraphies épiques.",
    image: "https://decibelsprod.com/wp-content/uploads/2023/07/Decibels-Prod_artiste_header-nblighter_le-roi-soleil-1.jpg",
    officialUrl: "https://www.ledomedeparis.com/fr/spectacle/331/le-roi-soleil",
    ticketUrl: "https://www.ticketmaster.fr/fr/manifestation/le-roi-soleil-billet/idmanif/642899/idtier/78166",
    source: "Dôme de Paris (officiel)",
    sourceLabel: "Dôme de Paris",
    lastVerifiedAt: "2026-10-16",
    status: "En cours",
    disciplines: ["Comédie musicale", "Danse", "Chant"],
    additionalInfo: [
      { label: "20e anniversaire", value: "Version inédite de la comédie musicale originale de 2005" },
      { label: "Accès", value: "Porte de Versailles (ligne 12) / Balard (ligne 8)" },
    ],
    cast: [
      // Distribution principale
      { name: "Emmanuel Moire", role: "Interprète", character: "Louis XIV, le Roi Soleil" },
      { name: "Louis Delort", role: "Interprète", character: "Philippe de France" },
      { name: "Yoann Casanova", role: "Interprète", character: "Beaufort" },
      { name: "Clara Poulet", role: "Interprète", character: "Mme de Maintenon" },
      { name: "Vanina", role: "Interprète", character: "Isabelle" },
      // Équipe artistique
      { name: "Kamel Ouali", role: "Mise en scène et chorégraphie" },
      { name: "Dove Attia", role: "Production" },
      { name: "François Chouquet", role: "Livret et adaptation" },
      { name: "Alain Lagarde", role: "Décors" },
      { name: "David Belugou", role: "Costumes" },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  // 5. Le Roi Soleil — Le Retour — Dôme de Paris (Run 2 : à venir)
  //    19 décembre 2026 – 17 janvier 2027
  // Source : https://decibelsprod.com + https://leroisoleil-lespectacle.fr
  // ─────────────────────────────────────────────────────────────────
  {
    slug: "le-roi-soleil-retour-paris-dec-2026",
    title: "Le Roi Soleil - Le Retour",
    category: "Comédie musicale",
    dates: "19 décembre 2026 - 17 janvier 2027",
    startDate: "2026-12-19",
    endDate: "2027-01-17",
    venue: "Dôme de Paris - Palais des Sports",
    address: "34 Boulevard Victor",
    city: "Paris",
    postalCode: "75015",
    latitude: 48.8367,
    longitude: 2.2886,
    price: "De 25 € à 98 €",
    time: "Voir calendrier en ligne",
    description:
      "Deuxième série de représentations parisiennes du Roi Soleil - Le Retour au Dôme de Paris pour les fêtes et le début 2027. La comédie musicale anniversaire mise en scène par Kamel Ouali avec Emmanuel Moire dans le rôle du Roi.",
    image: "https://decibelsprod.com/wp-content/uploads/2023/07/Decibels-Prod_artiste_header-nblighter_le-roi-soleil-1.jpg",
    officialUrl: "https://www.ledomedeparis.com/fr/spectacle/381/le-roi-soleil",
    ticketUrl: "https://www.ticketmaster.fr/fr/manifestation/le-roi-soleil-billet/idmanif/668474/idtier/78166",
    source: "Dôme de Paris (officiel)",
    sourceLabel: "Dôme de Paris",
    lastVerifiedAt: "2026-10-16",
    status: "À venir",
    disciplines: ["Comédie musicale", "Danse", "Chant"],
    additionalInfo: [
      { label: "Accès", value: "Porte de Versailles (ligne 12) / Balard (ligne 8)" },
    ],
    cast: [
      // Distribution principale
      { name: "Emmanuel Moire", role: "Interprète", character: "Louis XIV, le Roi Soleil" },
      { name: "Louis Delort", role: "Interprète", character: "Philippe de France" },
      { name: "Yoann Casanova", role: "Interprète", character: "Beaufort" },
      { name: "Clara Poulet", role: "Interprète", character: "Mme de Maintenon" },
      // Équipe artistique
      { name: "Kamel Ouali", role: "Mise en scène et chorégraphie" },
      { name: "Dove Attia", role: "Production" },
      { name: "François Chouquet", role: "Livret et adaptation" },
      { name: "Alain Lagarde", role: "Décors" },
      { name: "David Belugou", role: "Costumes" },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  // 4b. Casse-Noisette — Ballet classique — Casino de Paris
  //     4 janvier 2027
  // Source : https://www.casinodeparis.fr + agendaculturel.fr (danseclassique.info)
  // Soloistes issus de grandes compagnies européennes
  // ─────────────────────────────────────────────────────────────────
  {
    slug: "casse-noisette-casino-de-paris-jan-2027",
    title: "Casse-Noisette",
    category: "Ballet",
    dates: "4 janvier 2027",
    startDate: "2027-01-04",
    endDate: "2027-01-04",
    venue: "Casino de Paris",
    address: "16 rue de Clichy",
    city: "Paris",
    postalCode: "75009",
    latitude: 48.87818,
    longitude: 2.33023,
    price: "De 69 € à 89 €",
    time: "20h00",
    duration: "1h50",
    description:
      "Inspiré du conte d'E.T.A. Hoffmann, ce Casse-Noisette propose une relecture contemporaine du chef-d'œuvre de Tchaïkovski, interprétée par des solistes issus des grandes scènes européennes. Un voyage féerique à travers les tableaux emblématiques : la forêt enneigée, le combat contre le Roi des Souris et le Pays des Sucreries.",
    officialUrl: "https://www.casinodeparis.fr/fr/Casse-Noisette-Ballet-Classique-04-Janvier-2027-Billetterie-Paris",
    ticketUrl: "https://www.casinodeparis.fr/fr/Casse-Noisette-Ballet-Classique-04-Janvier-2027-Billetterie-Paris",
    source: "Casino de Paris (officiel)",
    sourceLabel: "Casino de Paris",
    lastVerifiedAt: "2026-10-16",
    status: "À venir",
    disciplines: ["Ballet classique", "Danse classique"],
    additionalInfo: [
      { label: "Accès", value: "Place de Clichy (lignes 2 / 13)" },
      { label: "Public", value: "Dès 5 ans" },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  // 4c. Njeunda - La Succession — Ballet de la Diaspora Camerounaise
  //     Casino de Paris, 30 avril 2027
  // Source : https://www.casinodeparis.fr
  // 30 artistes sur scène, orchestre traditionnel live, 200 costumes régionaux
  // ─────────────────────────────────────────────────────────────────
  {
    slug: "njeunda-la-succession-casino-de-paris-2027",
    title: "Njeunda - La Succession",
    category: "Spectacle",
    dates: "30 avril 2027",
    startDate: "2027-04-30",
    endDate: "2027-04-30",
    venue: "Casino de Paris",
    address: "16 rue de Clichy",
    city: "Paris",
    postalCode: "75009",
    latitude: 48.87818,
    longitude: 2.33023,
    price: "À partir de 39 €",
    time: "20h00 (portes 19h00)",
    description:
      "Njeunda - La Succession plonge au cœur des rites de succession royale camerounais à travers le voyage initiatique d'un jeune prince. 30 artistes sur scène, un orchestre traditionnel unique en live, plus de 200 costumes régionaux et une mise en scène alliant danse, musique et théâtre. Un spectacle célébrant l'identité et la résilience culturelle du Cameroun, surnommé « l'Afrique en miniature ».",
    image: "https://www.casinodeparis.fr/sites/hubber_site_casinodeparis8/files/2026-09/visuel-presentation-manif-1920x600-2.jpg",
    officialUrl: "https://www.casinodeparis.fr/fr/Njeunda-La-Succession-30-Avril-2027-Billetterie-Paris",
    ticketUrl: "https://www.casinodeparis.fr/fr/Njeunda-La-Succession-30-Avril-2027-Billetterie-Paris",
    source: "Casino de Paris (officiel)",
    sourceLabel: "Casino de Paris",
    lastVerifiedAt: "2026-10-16",
    status: "À venir",
    disciplines: ["Danse traditionnelle", "Musique vivante", "Théâtre dansé"],
    additionalInfo: [
      { label: "Compagnie", value: "Ballet de la Diaspora Camerounaise" },
      { label: "Accès", value: "Place de Clichy (lignes 2 / 13)" },
      { label: "Public", value: "Déconseillé aux moins de 3 ans" },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  // 4d. China Dance — Chinese Star Dance Troupe — Casino de Paris
  //     26–28 mars 2027
  // Source : https://www.casinodeparis.fr + sortiraparis.com
  // 30+ danseurs, 5 000 ans de tradition, danse classique / folk / contemporain
  // ─────────────────────────────────────────────────────────────────
  {
    slug: "china-dance-casino-de-paris-2027",
    title: "China Dance",
    category: "Spectacle",
    dates: "26 - 28 mars 2027",
    startDate: "2027-03-26",
    endDate: "2027-03-28",
    venue: "Casino de Paris",
    address: "16 rue de Clichy",
    city: "Paris",
    postalCode: "75009",
    latitude: 48.87818,
    longitude: 2.33023,
    price: "À partir de 25 €",
    time: "Ven 20h / Sam 15h et 20h / Dim 14h et 17h",
    description:
      "La Chinese Star Dance Troupe réunit plus de trente danseurs pour un voyage à travers 5 000 ans de culture et de traditions chinoises. Danse classique chinoise, danses folkloriques régionales et créations contemporaines s'entremêlent dans un spectacle de prestige porté par des artistes primés et reconnus à l'international.",
    officialUrl: "https://www.casinodeparis.fr/fr/China-Dance-Du-26-Au-28-Mars-2027-Billetterie-Paris",
    ticketUrl: "https://www.casinodeparis.fr/fr/China-Dance-Du-26-Au-28-Mars-2027-Billetterie-Paris",
    source: "Casino de Paris (officiel)",
    sourceLabel: "Casino de Paris",
    lastVerifiedAt: "2026-10-16",
    status: "À venir",
    disciplines: ["Danse classique chinoise", "Danses folkloriques", "Danse contemporaine"],
    additionalInfo: [
      { label: "Compagnie", value: "Chinese Star Dance Troupe" },
      { label: "Accès", value: "Place de Clichy (lignes 2 / 13)" },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  // 5b. Un Petit pas de trop — Kader Attou — La Scala Paris
  //     16 octobre – 1er novembre 2026 (en cours)
  // Source : https://lascala-paris.fr/programmation/un-petit-pas-de-trop/
  // Trio hip-hop / contemporain : Kader Attou, Régis Truchy, Mansour Abdessadok
  // ─────────────────────────────────────────────────────────────────
  {
    slug: "un-petit-pas-de-trop-kader-attou-2026",
    title: "Un Petit pas de trop",
    category: "Spectacle",
    dates: "16 octobre - 1er novembre 2026",
    startDate: "2026-10-16",
    endDate: "2026-11-01",
    venue: "La Scala Paris",
    address: "13 boulevard de Strasbourg",
    city: "Paris",
    postalCode: "75010",
    latitude: 48.87121,
    longitude: 2.35673,
    price: "De 14 € à 38 €",
    time: "15h ou 19h (selon les jours)",
    description:
      "Kader Attou réunit sur scène Régis Truchy et Mansour Abdessadok dans un trio hip-hop et contemporain célébrant « la beauté du déséquilibre et la puissance expressive du corps ». La chorégraphie exploite généreusement l'élasticité corporelle, l'amplitude des mouvements, les breaks et les ondulations. Un spectacle humorous, poétique et virtuose, accessible à tous.",
    image: "https://lascala-paris.fr/wp-content/thumbnails/uploads/2026/07/un-petit-pas-de-trop-kader-attou-tt-width-800-height-1246-fill-0-crop-0-bgcolor-eeeeee-post_id-9719.png",
    officialUrl: "https://lascala-paris.fr/programmation/un-petit-pas-de-trop/",
    ticketUrl: "https://indiv.themisweb.fr/0588/fEventChoiceIsMade.aspx?idstructure=0588&idevent=564",
    source: "La Scala Paris (officiel)",
    sourceLabel: "La Scala Paris",
    lastVerifiedAt: "2026-10-16",
    status: "En cours",
    disciplines: ["Hip-hop", "Contemporain"],
    cast: [
      { name: "Kader Attou", role: "Chorégraphie et interprétation" },
      { name: "Régis Truchy", role: "Interprète" },
      { name: "Mansour Abdessadok", role: "Interprète" },
    ],
    additionalInfo: [
      { label: "Salle", value: "Grande Salle — La Scala Paris" },
      { label: "Accès", value: "Strasbourg - Saint-Denis (lignes 4, 8, 9)" },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  // 5c. Sur un fil — Claire Théault & Anthony Figueiredo — La Scala Paris
  //     1er octobre et 11 novembre 2026
  // Source : https://lascala-paris.fr/programmation/sur-un-fil/
  // Théâtre / danse / ombre / vidéo — durée 1h15
  // ─────────────────────────────────────────────────────────────────
  {
    slug: "sur-un-fil-claire-antho-la-scala-2026",
    title: "Sur un fil",
    category: "Spectacle",
    dates: "1 octobre et 11 novembre 2026",
    startDate: "2026-10-01",
    endDate: "2026-11-11",
    venue: "La Scala Paris",
    address: "13 boulevard de Strasbourg",
    city: "Paris",
    postalCode: "75010",
    latitude: 48.87121,
    longitude: 2.35673,
    price: "De 20 € à 35 €",
    time: "20h00",
    duration: "1h15",
    description:
      "Sur un fil est une création croisant théâtre, danse, ombre et vidéo. Un homme seul sur un banc se souvient du jour où il a rencontré une femme. Anthony porte le poids de son enfance et les souvenirs du déclin de sa mère. Claire vit avec sa sensibilité à fleur de peau, qui l'empêche de profiter pleinement de la vie. Ensemble, ils apprennent à se comprendre et à s'épauler.",
    officialUrl: "https://lascala-paris.fr/programmation/sur-un-fil/",
    source: "La Scala Paris (officiel)",
    sourceLabel: "La Scala Paris",
    lastVerifiedAt: "2026-10-16",
    status: "En cours",
    disciplines: ["Théâtre dansé", "Danse", "Arts pluridisciplinaires"],
    cast: [
      { name: "Claire Théault", role: "Interprète et co-autrice" },
      { name: "Anthony Figueiredo", role: "Interprète et co-auteur" },
    ],
    additionalInfo: [
      { label: "Prochaine date", value: "11 novembre 2026 à 20h" },
      { label: "Accès", value: "Strasbourg - Saint-Denis (lignes 4, 8, 9)" },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  // 5d. X Elles — Florence Alayrac & Géraldine Lonfat — Théâtre des Mathurins
  //     21 sept – 28 déc 2026 (tous les lundis, 21h)
  // Source : agendaculturel.fr / fnacspectacles.com
  // Voyage chanté et dansé — chorégraphie Géraldine Lonfat
  // ─────────────────────────────────────────────────────────────────
  {
    slug: "x-elles-theatre-des-mathurins-2026",
    title: "X Elles",
    category: "Spectacle",
    dates: "21 septembre - 28 décembre 2026 (les lundis)",
    startDate: "2026-09-21",
    endDate: "2026-12-28",
    venue: "Théâtre des Mathurins",
    address: "36 rue des Mathurins",
    city: "Paris",
    postalCode: "75008",
    latitude: 48.87484,
    longitude: 2.32297,
    price: "Voir billetterie",
    time: "21h00 (les lundis)",
    duration: "1h15",
    description:
      "X Elles est un voyage chanté et dansé à travers la société contemporaine, où une nouvelle réalité s'ouvre à nous. Création de Florence Alayrac, chorégraphiée et mise en scène par Géraldine Lonfat.",
    officialUrl: "https://www.theatredesmathurins.com/",
    source: "Théâtre des Mathurins (officiel)",
    sourceLabel: "Théâtre des Mathurins",
    lastVerifiedAt: "2026-10-16",
    status: "En cours",
    disciplines: ["Danse", "Chant", "Spectacle musical"],
    cast: [
      { name: "Florence Alayrac", role: "Autrice et interprète" },
      { name: "Géraldine Lonfat", role: "Chorégraphie, mise en scène et interprète" },
    ],
    additionalInfo: [
      { label: "Salle", value: "Petite Salle — Théâtre des Mathurins" },
      { label: "Accès", value: "Saint-Augustin (ligne 9) / Havre-Caumartin (lignes 3, 9)" },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  // 6. The Rise — RB Dance Company — Dôme de Paris
  //    27 février – 2 mai 2027
  // Source : https://www.ledomedeparis.com/fr/the-rise + https://www.rbdancecompany.com/therise/
  // Note : aucune annulation annoncée. Spectacle en anglais surtitré français.
  //        Distribution complète depuis rbdancecompany.com (officiel).
  // ─────────────────────────────────────────────────────────────────
  {
    slug: "the-rise-rb-dance-company-2027",
    title: "The Rise - RB Dance Company",
    category: "Comédie musicale",
    dates: "27 février - 2 mai 2027",
    startDate: "2027-02-27",
    endDate: "2027-05-02",
    venue: "Dôme de Paris - Palais des Sports",
    address: "34 Boulevard Victor",
    city: "Paris",
    postalCode: "75015",
    latitude: 48.8367,
    longitude: 2.2886,
    price: "De 39 € à 119 €",
    time: "Jeu/Ven 20h - Sam 15h et 20h - Dim 15h",
    description:
      "Après le succès international de Stories, la RB Dance Company revient avec The Rise, une comédie musicale épique et chorégraphique avec 33 artistes sur scène. L'histoire se déroule dans un régime autoritaire où résistants et miliciens s'affrontent. Spectacle en anglais surtitré en français, avec des effets de scène immersifs. Suite au succès de la tournée précédente, les dates ont été prolongées jusqu'au 2 mai 2027.",
    image: "https://www.ledomedeparis.com/mesimages/bibliotheque/articles/vignettes/nouveau_visuel_en_date_du_19_05_2026_1.jpg",
    officialUrl: "https://www.ledomedeparis.com/fr/the-rise",
    ticketUrl: "https://www.ticketmaster.fr/fr/manifestation/the-rise-billet/idmanif/655260/idtier/78166",
    source: "Dôme de Paris (officiel)",
    sourceLabel: "Dôme de Paris",
    lastVerifiedAt: "2026-10-15",
    status: "À venir",
    disciplines: ["Danse", "Comédie musicale", "Hip-hop", "Contemporain"],
    additionalInfo: [
      { label: "Compagnie", value: "RB Dance Company" },
      { label: "Langue", value: "Anglais, surtitré en français" },
      { label: "Public", value: "Déconseillé aux moins de 10 ans (effets stroboscopiques, scènes de violence)" },
      { label: "Catégories", value: "Premium 119 € / Or 104 € / Cat. 1 à 5 de 89 € à 39 €" },
      { label: "Accès", value: "Porte de Versailles (ligne 12) / Balard (ligne 8)" },
    ],
    cast: [
      // Direction et création
      { name: "Romain Rachline Borgeaud", role: "Chorégraphie, mise en scène et composition musicale" },
      { name: "Angel Cubero", role: "Direction adjointe et coordination artistique" },
      { name: "John Dada", role: "Direction musicale" },
      { name: "Léa Ruhl", role: "Direction de chœur" },
      // Équipe technique et artistique
      { name: "Hélène Fief", role: "Scénographie" },
      { name: "Alex Hardellet", role: "Lumières" },
      { name: "Arnaud Bayssat", role: "Son" },
      { name: "Marion François", role: "Costumes" },
      { name: "Gwendoline Grandjean", role: "Costumes" },
      { name: "Thomas le Groignec", role: "Direction des cascades" },
      { name: "Bruno Segni", role: "Coiffures et maquillage" },
      // Distribution artistique — rôles principaux
      { name: "Geoffrey Goutorbe", role: "Assistant chorégraphe et interprète", character: "Victor" },
      { name: "Lisa Delolme", role: "Artiste principale", character: "Anna" },
      { name: "Antoine Nya", role: "Artiste principal", character: "Aeon" },
      { name: "Matilda Gemain", role: "Artiste principale", character: "Diane" },
      { name: "Robin Morgenthaler", role: "Artiste principal", character: "Laszlo" },
      { name: "Thiméo Garin", role: "Artiste principal", character: "Ors" },
      { name: "Justine Sène", role: "Artiste principale", character: "Narratrice" },
      { name: "Mila Vuillermoz Hayashi", role: "Artiste principale", character: "Ann" },
      { name: "Tony Ben Azouz", role: "Artiste principal", character: "Ivan" },
      { name: "Lily Sephord", role: "Artiste principale", character: "Young Anna" },
      { name: "Manon Perrin", role: "Artiste principale", character: "Young Anna (alternance)" },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  // Benjamin Millepied — Cycle aux Folies Bergère, novembre 2026
  // 3 créations chorégraphiques distinctes au même lieu
  // Source : foliesbergere.com / jds.fr / arts-in-the-city.com / fnacspectacles.com
  // ─────────────────────────────────────────────────────────────────
  {
    slug: "millepied-barbara-folies-bergere-nov-2026",
    title: "Barbara, du bout des lèvres",
    category: "Danse contemporaine",
    dates: "9 – 22 novembre 2026",
    startDate: "2026-11-09",
    endDate: "2026-11-22",
    venue: "Les Folies Bergère",
    address: "32 rue de Richer",
    city: "Paris",
    postalCode: "75009",
    latitude: 48.8739,
    longitude: 2.3464,
    price: "Voir billetterie",
    time: "20h30",
    description:
      "Benjamin Millepied rend hommage à Barbara dans cette première des trois créations de son cycle aux Folies Bergère. Le répertoire de la chanteuse est incarné par des interprètes de plusieurs générations dans un espace scénique dépouillé et lumineux. La musique de Barbara se transforme en geste, en corps, en présence.",
    officialUrl: "https://foliesbergere.com/",
    ticketUrl: "https://www.fnacspectacles.com/event/benjamin-millepied-barbara-du-bout-des-levres-les-folies-bergere-20981278/",
    source: "Folies Bergère / Fnac Spectacles",
    sourceLabel: "Folies Bergère",
    lastVerifiedAt: "2026-10-17",
    status: "En cours",
    disciplines: ["Danse contemporaine"],
    cast: [
      { name: "Benjamin Millepied", role: "Chorégraphie" },
    ],
  },

  {
    slug: "millepied-move-me-once-more-folies-bergere-nov-2026",
    title: "Move Me Once More — Le Dernier Cabaret",
    category: "Danse contemporaine",
    dates: "14 – 29 novembre 2026",
    startDate: "2026-11-14",
    endDate: "2026-11-29",
    venue: "Les Folies Bergère",
    address: "32 rue de Richer",
    city: "Paris",
    postalCode: "75009",
    latitude: 48.8739,
    longitude: 2.3464,
    price: "Voir billetterie",
    time: "21h00",
    description:
      "Deuxième volet du cycle Benjamin Millepied aux Folies Bergère, co-signé avec la cinéaste Léa Mysius. Un corps découvert après une tempête revient à la vie par la danse, la voix et le chant, dans une forme cabaret qui habite le lieu historique de la rue de Richer.",
    officialUrl: "https://foliesbergere.com/",
    ticketUrl: "https://www.fnacspectacles.com/event/benjamin-millepied-move-me-once-more-le-dernier-cabaret-les-folies-bergere-20977676/",
    source: "Folies Bergère / Fnac Spectacles",
    sourceLabel: "Folies Bergère",
    lastVerifiedAt: "2026-10-17",
    status: "À venir",
    disciplines: ["Danse contemporaine", "Chant"],
    cast: [
      { name: "Benjamin Millepied", role: "Chorégraphie" },
      { name: "Léa Mysius", role: "Co-création" },
    ],
  },

  {
    slug: "millepied-summerland-folies-bergere-nov-2026",
    title: "Summerland",
    category: "Danse contemporaine",
    dates: "24 – 29 novembre 2026",
    startDate: "2026-11-24",
    endDate: "2026-11-29",
    venue: "Les Folies Bergère",
    address: "32 rue de Richer",
    city: "Paris",
    postalCode: "75009",
    latitude: 48.8739,
    longitude: 2.3464,
    price: "Voir billetterie",
    time: "Voir billetterie",
    description:
      "Troisième création de Benjamin Millepied dans son cycle aux Folies Bergère. Summerland évoque une petite ville californienne nimbée de lumière et de souvenirs, métaphore d'un lieu réel et imaginaire à la fois — paysage sensoriel et promesse d'horizon sensuel et lumineux.",
    officialUrl: "https://foliesbergere.com/",
    ticketUrl: "https://www.jds.fr/paris/spectacles/danse/summerland-avec-november-ultra-1257198_A",
    source: "Folies Bergère / JDS",
    sourceLabel: "Folies Bergère",
    lastVerifiedAt: "2026-10-17",
    status: "À venir",
    disciplines: ["Danse contemporaine"],
    cast: [
      { name: "Benjamin Millepied", role: "Chorégraphie" },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  // A4 (Comme la Feuille) — Bobino, nov. 2026 – jan. 2027
  // Source : bobino.fr / arts-in-the-city.com / jds.fr
  // ─────────────────────────────────────────────────────────────────
  {
    slug: "a4-comme-la-feuille-bobino-2026",
    title: "A4 (Comme la Feuille)",
    category: "Danse",
    dates: "26 novembre 2026 – 24 janvier 2027",
    startDate: "2026-11-26",
    endDate: "2027-01-24",
    venue: "Bobino",
    address: "20 rue de la Gaîté",
    city: "Paris",
    postalCode: "75014",
    latitude: 48.8388,
    longitude: 2.3263,
    price: "Voir billetterie",
    time: "Voir billetterie",
    description:
      "Quatre danseurs aux styles radicalement différents — hip-hop, contemporain, acrobatique et comique — partagent la scène de Bobino dans une création de Philippe Lafeuille. Les Quatre Saisons de Vivaldi sont leur terrain de jeu. Danse, théâtre, cirque et poésie se mêlent dans un spectacle festif accessible à tous.",
    officialUrl: "https://bobino.fr/event-pro/a4-comme-la-feuille/",
    ticketUrl: "https://bobino.fr/event-pro/a4-comme-la-feuille/",
    source: "Bobino (officiel)",
    sourceLabel: "Bobino",
    lastVerifiedAt: "2026-10-17",
    status: "À venir",
    disciplines: ["Danse hip-hop", "Danse contemporaine", "Cirque"],
    cast: [
      { name: "Philippe Lafeuille", role: "Chorégraphie et mise en scène" },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  // Breaking & Hip-Hop Freestyle World Championships — Adidas Arena
  // Source : sortiraparis.com / paris.fr / parisjetaime.com
  // ─────────────────────────────────────────────────────────────────
  {
    slug: "breaking-hiphop-world-championships-paris-dec-2026",
    title: "Breaking & Hip-Hop Freestyle World Championships",
    category: "Battle / Compétition",
    dates: "4 – 6 décembre 2026",
    startDate: "2026-12-04",
    endDate: "2026-12-06",
    venue: "Adidas Arena",
    address: "6 rue Paul Meurice",
    city: "Paris",
    postalCode: "75018",
    latitude: 48.8978,
    longitude: 2.3597,
    price: "Voir billetterie",
    time: "Voir programme officiel",
    description:
      "Première édition mondiale unifiée des championnats du monde de Breaking et de Hip-Hop Freestyle. Les meilleurs B-Boys, B-Girls et danseurs Hip-Hop Freestyle du monde entier se retrouvent à Paris pour décrocher les titres mondiaux dans une compétition historique à l'Adidas Arena (ancienne Arena Porte de la Chapelle).",
    officialUrl: "https://www.paris.fr/evenements/world-championships-breaking-hip-hop-freestyle-123883",
    ticketUrl: "https://parisjetaime.com/eng/event/breaking-hip-hop-freestyle-world-championships-paris-e2262",
    source: "Ville de Paris / Paris Je T'aime",
    sourceLabel: "Adidas Arena",
    lastVerifiedAt: "2026-10-17",
    status: "À venir",
    disciplines: ["Breaking", "Hip-hop", "Battle"],
    additionalInfo: [
      { label: "Édition", value: "1ère édition — première unification mondiale Breaking + Hip-Hop Freestyle" },
      { label: "Accès", value: "Porte de la Chapelle (ligne 12)" },
    ],
  },
]
