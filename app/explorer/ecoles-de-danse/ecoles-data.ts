export type EcoleType = "Studio" | "École" | "Conservatoire" | "Centre de formation" | "Association"

export type EcoleStyle = string

export type EcoleDanse = {
  id: string
  nom: string
  type: EcoleType
  adresse: string
  arrondissement: number
  lat: number
  lng: number
  styles: string[]
  stylesSlugs?: string[]
  niveaux: ("Débutant" | "Intermédiaire" | "Avancé" | "Professionnel")[]
  pratiques: ("Loisirs" | "Formation professionnelle" | "Préparation EAT/DE" | "Enfants" | "Adultes" | "Cours open")[]
  description?: string
  siteWeb?: string
  instagram?: string
  featured?: boolean
}

export const ecolesDanse: EcoleDanse[] = [
  {
    id: "centre-danse-marais",
    nom: "Centre de Danse du Marais",
    type: "Centre de formation",
    adresse: "41 rue du Temple, 75004 Paris",
    arrondissement: 4,
    lat: 48.8608,
    lng: 2.3518,
    styles: ["Danse classique", "Contemporain", "Jazz", "Flamenco", "Danse orientale"],
    niveaux: ["Débutant", "Intermédiaire", "Avancé"],
    pratiques: ["Loisirs", "Enfants", "Adultes", "Cours open"],
    description: "Établissement de référence du Marais proposant une large gamme de styles de danse avec des cours adaptés à tous les niveaux.",
    siteWeb: "https://www.centrededansedumarais.fr/",
    featured: true
  },
  {
    id: "studio-harmonic",
    nom: "Studio Harmonic",
    type: "École",
    adresse: "5 passage des Taillandiers, 75011 Paris",
    arrondissement: 11,
    lat: 48.8557,
    lng: 2.3802,
    styles: ["Danse classique", "Jazz", "Contemporain", "Capoeira", "Claquettes", "Locking", "Ragga"],
    niveaux: ["Débutant", "Intermédiaire", "Avancé", "Professionnel"],
    pratiques: ["Loisirs", "Formation professionnelle", "Enfants", "Adultes", "Cours open"],
    description: "École professionnelle fondée en 1988 avec 47 styles de danse et plus de 100 professeurs. Formation en danse classique, jazz et contemporain.",
    siteWeb: "https://www.studioharmonic.eu/",
    featured: true
  },
  {
    id: "conservatoire-de-paris",
    nom: "Conservatoire National Supérieur de Musique et de Danse de Paris",
    type: "Conservatoire",
    adresse: "209 Avenue Jean-Jaurès, 75019 Paris",
    arrondissement: 19,
    lat: 48.8865,
    lng: 2.3796,
    styles: ["Danse classique", "Contemporain", "Jazz"],
    niveaux: ["Intermédiaire", "Avancé", "Professionnel"],
    pratiques: ["Formation professionnelle", "Préparation EAT/DE"],
    description: "Institution prestigieuse de formation professionnelle en danse classique, contemporaine et jazz au niveau supérieur.",
    siteWeb: "https://www.conservatoiredeparis.fr/",
    featured: true
  },
  {
    id: "lax-studio",
    nom: "Lax Studio",
    type: "Studio",
    adresse: "18 bis Villa Riberolle, 75020 Paris",
    arrondissement: 20,
    lat: 48.8713,
    lng: 2.4052,
    styles: ["Hip-hop", "Breaking", "House dance", "Street jazz", "Contemporain"],
    niveaux: ["Débutant", "Intermédiaire", "Avancé"],
    pratiques: ["Loisirs", "Enfants", "Adultes"],
    description: "Studio de hip-hop et danses urbaines avec une atmosphère créative et bienveillante pour progresser à son rythme.",
    siteWeb: "https://laxstudio.fr/",
    featured: true
  },
  {
    id: "juste-debout-school",
    nom: "Juste Debout School",
    type: "École",
    adresse: "3 Rue de l'Est, 75020 Paris",
    arrondissement: 20,
    lat: 48.8716,
    lng: 2.4085,
    styles: ["Popping", "Locking", "House", "Breaking", "Hip-hop", "Waacking"],
    niveaux: ["Débutant", "Intermédiaire", "Avancé", "Professionnel"],
    pratiques: ["Loisirs", "Formation professionnelle", "Adultes", "Cours open"],
    description: "Lieu entièrement dédié aux danses urbaines. Enseignement des techniques street dance par des maîtres mondialement reconnus.",
    siteWeb: "https://www.juste-debout-school.com/",
    featured: true
  },
  {
    id: "academie-internationale-danse",
    nom: "Académie Internationale de la Danse",
    type: "École",
    adresse: "74 bis rue Lauriston, 75016 Paris",
    arrondissement: 16,
    lat: 48.8628,
    lng: 2.2769,
    styles: ["Danse classique", "Jazz", "Contemporain"],
    niveaux: ["Débutant", "Intermédiaire", "Avancé", "Professionnel"],
    pratiques: ["Loisirs", "Formation professionnelle", "Préparation EAT/DE"],
    description: "École fondée en 1976 proposant préparation aux examen EAT et diplôme d'État pour les professeurs de danse.",
    siteWeb: "https://academiedanseparis.com/",
    featured: true
  },
  {
    id: "pole-dance-paris",
    nom: "Pole Dance Paris",
    type: "Studio",
    adresse: "42 rue d'Avron, 75020 Paris",
    arrondissement: 20,
    lat: 48.8698,
    lng: 2.4043,
    styles: ["Pole dance", "Danse acrobatique"],
    niveaux: ["Débutant", "Intermédiaire", "Avancé"],
    pratiques: ["Loisirs", "Enfants", "Adultes"],
    description: "École spécialisée en pole dance avec trois studios à proximité de Place de la Nation.",
    siteWeb: "https://poledance-paris.com/",
    featured: false
  },
  {
    id: "pole-and-dance-13e",
    nom: "Pole and Dance",
    type: "Studio",
    adresse: "54 rue du Château des Rentiers, 75013 Paris",
    arrondissement: 13,
    lat: 48.8295,
    lng: 2.3568,
    styles: ["Pole dance", "Danse acrobatique"],
    niveaux: ["Débutant", "Intermédiaire", "Avancé"],
    pratiques: ["Loisirs", "Adultes"],
    description: "Studio de pole dance proposant des cours pour tous les niveaux et une atmosphère motivante.",
    siteWeb: "https://www.pole-and-dance.com/",
    featured: false
  },
  {
    id: "wild-pole-studio",
    nom: "Wild Pole Studio",
    type: "Studio",
    adresse: "8 boulevard Saint-Martin, 75010 Paris",
    arrondissement: 10,
    lat: 48.8724,
    lng: 2.3594,
    styles: ["Pole dance", "Danse acrobatique", "Arts aériens"],
    niveaux: ["Débutant", "Intermédiaire", "Avancé"],
    pratiques: ["Loisirs", "Adultes"],
    description: "Studio réputé de pole dance et arts aériens situé en centre-ville avec équipements modernes.",
    siteWeb: "https://www.wildpolestudio.com/",
    featured: false
  },
  {
    id: "centre-arts-vivants",
    nom: "Le Centre des Arts Vivants",
    type: "Centre de formation",
    adresse: "4 rue Bréguet, 75011 Paris",
    arrondissement: 11,
    lat: 48.8556,
    lng: 2.3786,
    styles: ["Danse classique", "Contemporain", "Jazz", "Flamenco", "Danse orientale", "Hip-hop"],
    niveaux: ["Débutant", "Intermédiaire", "Avancé"],
    pratiques: ["Loisirs", "Enfants", "Adultes", "Cours open"],
    description: "Centre d'arts complet à proximité de la Bastille offrant danse, musique et théâtre pour tous les niveaux.",
    siteWeb: "https://www.lecentredesarts.com/",
    featured: true
  },
  {
    id: "acts-ecole-danse",
    nom: "ACTS - Écoles de Danse Contemporaine de Paris",
    type: "Centre de formation",
    adresse: "15 rue Geoffroy L'Asnier, 75004 Paris",
    arrondissement: 4,
    lat: 48.8528,
    lng: 2.3543,
    styles: ["Contemporain", "Jazz", "Danse classique"],
    niveaux: ["Débutant", "Intermédiaire", "Avancé", "Professionnel"],
    pratiques: ["Loisirs", "Formation professionnelle"],
    description: "École reconnue de danse contemporaine offrant formation professionnelle et cycles spécialisés.",
    siteWeb: "https://en.acts-dance.com/",
    featured: false
  },
  {
    id: "salsanueva-12e",
    nom: "SalsaNueva Paris",
    type: "Studio",
    adresse: "10 rue Érard, 75012 Paris",
    arrondissement: 12,
    lat: 48.8441,
    lng: 2.3919,
    styles: ["Salsa", "Bachata", "Kizomba", "Heels", "Reggaeton"],
    niveaux: ["Débutant", "Intermédiaire", "Avancé"],
    pratiques: ["Loisirs", "Adultes", "Cours open"],
    description: "École spécialisée en danses latines et urbaines avec une ambiance chaleureuse et énergétique.",
    siteWeb: "https://www.salsavida.com/",
    featured: false
  },
  {
    id: "salsanueva-20e",
    nom: "SalsaNueva Paris - Annexe 20e",
    type: "Studio",
    adresse: "32 rue du Capitaine Marchal, 75020 Paris",
    arrondissement: 20,
    lat: 48.8674,
    lng: 2.4092,
    styles: ["Salsa", "Bachata", "Kizomba", "Heels"],
    niveaux: ["Débutant", "Intermédiaire", "Avancé"],
    pratiques: ["Loisirs", "Adultes"],
    description: "Succursale de SalsaNueva proposant les mêmes styles de danses latines et urbaines.",
    siteWeb: "https://www.salsavida.com/",
    featured: false
  },
  {
    id: "studio-mrg",
    nom: "Studio MRG",
    type: "Centre de formation",
    adresse: "Sud de Paris",
    arrondissement: 13,
    lat: 48.8304,
    lng: 2.3568,
    styles: ["Afro", "Dancehall", "Hip-hop", "House", "Kizomba"],
    niveaux: ["Débutant", "Intermédiaire", "Avancé", "Professionnel"],
    pratiques: ["Loisirs", "Formation professionnelle", "Adultes"],
    description: "Centre de formation professionnelle en danses urbaines et afro. Programmes de 10 mois en chorégraphie professionnelle.",
    siteWeb: "https://www.studiomrg.fr/",
    featured: false
  },
  {
    id: "elephant-paname",
    nom: "Éléphant Paname",
    type: "Centre de formation",
    adresse: "10 rue Volney, 75002 Paris",
    arrondissement: 2,
    lat: 48.8692,
    lng: 2.3301,
    styles: ["Danse classique", "Jazz", "Contemporain", "Hip-hop", "Danse orientale", "Capoeira"],
    niveaux: ["Débutant", "Intermédiaire", "Avancé"],
    pratiques: ["Loisirs", "Enfants", "Adultes", "Cours open"],
    description: "Espace pluridisciplinaire et multiculturel de 500 m² entre Opéra Garnier et Place Vendôme avec plusieurs studios de danse.",
    siteWeb: "http://www.elephantpaname.com/fr/centre-de-danse/",
    featured: false
  },
  {
    id: "studio-bleu-10e",
    nom: "Studio Bleu",
    type: "Studio",
    adresse: "7/9 Rue des Petites Écuries, 75010 Paris",
    arrondissement: 10,
    lat: 48.8738,
    lng: 2.3596,
    styles: ["Danse classique", "Jazz", "Contemporain", "Hip-hop", "Danse orientale"],
    niveaux: ["Débutant", "Intermédiaire", "Avancé"],
    pratiques: ["Loisirs", "Enfants", "Adultes", "Cours open"],
    description: "Studio multifonctionnel de danse et musique situé dans le 10e arrondissement avec salles de répétition et salles de danse.",
    siteWeb: "https://www.studiobleu.com/",
    featured: false
  },
  {
    id: "paris-marais-dance",
    nom: "Paris Marais Dance School",
    type: "École",
    adresse: "41 rue du Temple, 75004 Paris",
    arrondissement: 4,
    lat: 48.8608,
    lng: 2.3518,
    styles: ["Danse classique", "Contemporain", "Danse Graham"],
    niveaux: ["Débutant", "Intermédiaire", "Avancé", "Professionnel"],
    pratiques: ["Loisirs", "Formation professionnelle", "Enfants", "Adultes"],
    description: "École de ballet professionnel dans un bâtiment historique du 17e siècle, spécialisée en formation pour compagnies de danse.",
    siteWeb: "https://en.paris-marais-dance-school.org/",
    featured: false
  },
  {
    id: "crr-paris-ida-rubinstein",
    nom: "CRR de Paris - Ida Rubinstein",
    type: "Conservatoire",
    adresse: "3e arrondissement, Paris",
    arrondissement: 3,
    lat: 48.8637,
    lng: 2.3596,
    styles: ["Danse classique", "Contemporain", "Jazz"],
    niveaux: ["Débutant", "Intermédiaire", "Avancé", "Professionnel"],
    pratiques: ["Loisirs", "Formation professionnelle", "Enfants", "Adultes"],
    description: "Conservatoire à rayonnement régional offrant formation initiale et cycle spécialisé en danse classique et contemporaine.",
    siteWeb: "https://www.paris.fr/conservatoires",
    featured: false
  },
  {
    id: "institut-stanlowa",
    nom: "Institut International de Danse Janine Stanlowa",
    type: "École",
    adresse: "23 rue de la Baume, 75008 Paris",
    arrondissement: 8,
    lat: 48.8767,
    lng: 2.2998,
    styles: ["Danse classique", "Barre au sol"],
    niveaux: ["Débutant", "Intermédiaire", "Avancé"],
    pratiques: ["Loisirs", "Enfants", "Adultes"],
    description: "Institution historique spécialisée en danse classique depuis plus de 40 ans avec studios modernes et plus de 60 classes hebdomadaires.",
    siteWeb: "https://institut-stanlowa.com/",
    featured: false
  },
  {
    id: "triwat-school",
    nom: "Triwat - International Dance School",
    type: "École",
    adresse: "Paris",
    arrondissement: 5,
    lat: 48.8462,
    lng: 2.3474,
    styles: ["Danse indienne", "Bollywood", "Kathak"],
    niveaux: ["Débutant", "Intermédiaire", "Avancé"],
    pratiques: ["Loisirs", "Enfants", "Adultes"],
    description: "École internationale spécialisée en danse indienne classique (Kathak) et Bollywood, avec cours pour tous les âges.",
    siteWeb: "https://www.triwat.org/",
    featured: false
  },
  {
    id: "studio-l-envol-5e",
    nom: "Studio l'Envol",
    type: "Studio",
    adresse: "5e arrondissement, Paris",
    arrondissement: 5,
    lat: 48.8462,
    lng: 2.3474,
    styles: ["Danse classique", "Contemporain", "Jazz", "Flamenco", "Hip-hop", "Modern jazz"],
    niveaux: ["Débutant", "Intermédiaire", "Avancé"],
    pratiques: ["Loisirs", "Enfants", "Adultes"],
    description: "Studio de danse variée situé au cœur du 5e arrondissement, idéalement localisé près de stations de métro majeures.",
    siteWeb: "https://studiolenvol.com/",
    featured: false
  },
  {
    id: "studio-16-ballet",
    nom: "Studio 16",
    type: "École",
    adresse: "16e arrondissement, Paris",
    arrondissement: 16,
    lat: 48.8632,
    lng: 2.2698,
    styles: ["Danse classique", "Jazz", "Danse orientale"],
    niveaux: ["Débutant", "Intermédiaire", "Avancé"],
    pratiques: ["Loisirs", "Enfants", "Adultes"],
    description: "Grande école avec plus de 800 élèves proposant cours de danse classique, jazz et danse orientale.",
    siteWeb: "https://www.studio16.fr/",
    featured: false
  },
  {
    id: "artballet-paris",
    nom: "ArtBallet Paris",
    type: "École",
    adresse: "17e arrondissement, Paris",
    arrondissement: 17,
    lat: 48.8867,
    lng: 2.3097,
    styles: ["Danse classique", "Jazz", "Barre au sol", "Éveil danse"],
    niveaux: ["Débutant", "Intermédiaire", "Avancé"],
    pratiques: ["Loisirs", "Enfants", "Adultes"],
    description: "École établie depuis plus de 30 ans proposant cours de danse classique, jazz et éveil pour enfants dès 4 ans.",
    siteWeb: "http://www.artballet.fr/",
    featured: false
  },
  {
    id: "paris-swing-spirit",
    nom: "Paris Swing Spirit",
    type: "Studio",
    adresse: "Paris",
    arrondissement: 2,
    lat: 48.8668,
    lng: 2.3475,
    styles: ["Swing", "Rock'n'roll", "Lindy hop", "West Coast Swing", "Boogie Woogie"],
    niveaux: ["Débutant", "Intermédiaire", "Avancé"],
    pratiques: ["Loisirs", "Adultes", "Cours open"],
    description: "École spécialisée en rock 6 temps, boogie et west coast swing au cœur de Paris.",
    siteWeb: "https://parisswingspirit.fr/",
    featured: false
  },
  {
    id: "studio-rockland",
    nom: "Studio Rockland",
    type: "Studio",
    adresse: "75018 Paris",
    arrondissement: 18,
    lat: 48.8924,
    lng: 2.3447,
    styles: ["Rock'n'roll", "Swing", "Danse classique", "Salsa", "Dancehall"],
    niveaux: ["Débutant", "Intermédiaire", "Avancé"],
    pratiques: ["Loisirs", "Enfants", "Adultes"],
    description: "Studio proposant rock swing et autres styles de danse pour enfants et adultes.",
    siteWeb: "https://rockland-danse.fr/",
    featured: false
  },
  {
    id: "cercles-de-la-forme",
    nom: "Cercles de la Forme",
    type: "Association",
    adresse: "Paris (multiples emplacements)",
    arrondissement: 16,
    lat: 48.8632,
    lng: 2.2698,
    styles: ["Danse classique", "Danse orientale", "Modern jazz"],
    niveaux: ["Débutant", "Intermédiaire", "Avancé"],
    pratiques: ["Loisirs", "Enfants", "Adultes"],
    description: "Association proposant cours de danse classique et danse orientale dans différents emplacements parisiens.",
    siteWeb: "https://www.cerclesdelaforme.com/",
    featured: false
  },
  {
    id: "dancenter-paris",
    nom: "Dancenter Paris",
    type: "Studio",
    adresse: "Paris",
    arrondissement: 2,
    lat: 48.8668,
    lng: 2.3475,
    styles: ["Rock", "Swing", "West Coast Swing", "Boogie Woogie", "Lindy Hop"],
    niveaux: ["Débutant", "Intermédiaire", "Avancé"],
    pratiques: ["Loisirs", "Adultes", "Cours open"],
    description: "Espace dédié à l'enseignement du rock, swing et autres danses de couple.",
    siteWeb: "https://dancenter.fr/",
    featured: false
  },
  {
    id: "ecole-danse-nathalie-gustine",
    nom: "École de Danse Nathalie Gustine",
    type: "École",
    adresse: "15e arrondissement, Paris",
    arrondissement: 15,
    lat: 48.8484,
    lng: 2.2978,
    styles: ["Danse classique", "Modern jazz"],
    niveaux: ["Débutant", "Intermédiaire", "Avancé"],
    pratiques: ["Loisirs", "Enfants", "Adultes"],
    description: "École établie depuis plus de 27 ans proposant danse classique et modern jazz pour enfants et adolescents près de la Tour Eiffel.",
    siteWeb: "https://nathaliegustine.fr/",
    featured: false
  }
]

export function getEcoleById(id: string): EcoleDanse | undefined {
  return ecolesDanse.find(e => e.id === id)
}

export function getEcolesByArrondissement(arr: number): EcoleDanse[] {
  return ecolesDanse.filter(e => e.arrondissement === arr)
}

export function getEcolesByStyle(style: string): EcoleDanse[] {
  return ecolesDanse.filter(e =>
    e.styles.some(s => s.toLowerCase().includes(style.toLowerCase())) ||
    e.stylesSlugs?.includes(style)
  )
}

export const ALL_ECOLE_STYLES = [...new Set(ecolesDanse.flatMap(e => e.styles))].sort()
