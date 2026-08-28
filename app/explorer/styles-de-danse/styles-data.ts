// ─────────────────────────────────────────────────────────────────────────────
//  Dance Lab · Plateforme « Explorer les styles de danse »
//  Modèle de données centralisé — ajouter un style = ajouter un objet ici.
// ─────────────────────────────────────────────────────────────────────────────

export type DanceStyleFamily =
  | "Danses académiques"
  | "Danses urbaines"
  | "Danses contemporaines et expérimentales"
  | "Danses scéniques"
  | "Danses sociales"
  | "Danses traditionnelles"
  | "Danses classiques indiennes"
  | "Danses de club"
  | "Danses issues des cultures afro-descendantes"

export type ResourceFormat =
  | "Documentaire"
  | "Livre"
  | "Article"
  | "Film"
  | "Série"
  | "Archive"
  | "Site web"
  | "Conférence"

export type TimelineEvent = {
  year: string
  event: string
}

export type KeyFigure = {
  name: string
  role: string
  note?: string
}

export type Resource = {
  title: string
  author: string
  year: string
  format: ResourceFormat
  description: string
  url?: string
}

export type StyleEpisode = {
  slug: string
  relevance: string
}

export type StyleConfusion = {
  styles: string
  explanation: string
}

export type DanceStyle = {
  slug: string
  name: string
  aliases?: string[]
  family: DanceStyleFamily
  era: string
  originCountry: string
  originCity: string
  summary: string
  introduction: string
  origins: string
  timeline: TimelineEvent[]
  characteristics: {
    movements: string
    musicRelationship: string
    improvisation: string
    formats: string[]
    visualCodes?: string
  }
  music: {
    genres: string[]
    description: string
    keyArtists?: string[]
  }
  keyFigures: {
    category: string
    figures: KeyFigure[]
  }[]
  franceHistory: string
  relatedStyles: string[]
  commonConfusions?: StyleConfusion[]
  resources: Resource[]
  episodeLinks: StyleEpisode[]
  /**
   * Termes supplémentaires pour le matching automatique d'épisodes
   * (en plus du nom et des alias du style).
   * Utilisé par buildLinkedEpisodes() dans [slug]/page.tsx.
   */
  autoMatchTerms?: string[]
  keywords: string[]
  image?: string
  imageCredit?: string
  seoTitle: string
  seoDescription: string
}

// ─────────────────────────────────────────────────────────────────────────────
//  TYPE POUR LES STYLES « À VENIR » (sans fiche complète)
// ─────────────────────────────────────────────────────────────────────────────

export type UpcomingStyle = {
  slug: string
  name: string
  family: DanceStyleFamily
  /** true = fiche disponible dans danceStyles ; false = coming soon */
  available: boolean
}

// ─────────────────────────────────────────────────────────────────────────────
//  FAMILLES — référence pour les filtres
// ─────────────────────────────────────────────────────────────────────────────

export const STYLE_FAMILIES: DanceStyleFamily[] = [
  "Danses académiques",
  "Danses urbaines",
  "Danses contemporaines et expérimentales",
  "Danses scéniques",
  "Danses sociales",
  "Danses traditionnelles",
  "Danses classiques indiennes",
  "Danses de club",
  "Danses issues des cultures afro-descendantes",
]

// ─────────────────────────────────────────────────────────────────────────────
//  DONNÉES — 9 styles pilotes
// ─────────────────────────────────────────────────────────────────────────────

export const danceStyles: DanceStyle[] = [
  // ── BREAK ────────────────────────────────────────────────────────────────
  {
    slug: "break",
    name: "Break",
    aliases: ["Breaking", "B-boying", "B-girling", "Breakdance"],
    family: "Danses urbaines",
    era: "Années 1970",
    originCountry: "États-Unis",
    originCity: "South Bronx, New York",
    summary:
      "Le break est une danse née dans les années 1970 dans le South Bronx, au cœur du mouvement hip-hop. Il se caractérise par des mouvements au sol (footwork, freezes), des figures acrobatiques (power moves) et une forte dimension d'improvisation. Il est aujourd'hui pratiqué comme art, sport et forme d'expression culturelle dans le monde entier.",
    introduction:
      "Le break — souvent appelé b-boying ou b-girling par les praticiens — est l'une des quatre disciplines fondatrices du mouvement hip-hop avec le DJing, le MCing et le graffiti. Il se développe dans les années 1970 dans le South Bronx, un quartier de New York marqué par la pauvreté, les tensions sociales et les violences de gangs, au sein des communautés afro-américaines et portoricaines.\n\nVisuellement, le break se distingue par la richesse de ses vocabulaires : le toprock (mouvements debout), le footwork (séquences au sol sur les mains et les pieds), les power moves (figures acrobatiques comme le windmill ou l'headspin) et les freezes (positions statiques surprenantes). La danse se pratique dans un cercle appelé cypher, où les danseurs s'expriment en dialogue avec la musique et les autres participants.\n\nEn 2024, le breaking fait son entrée aux Jeux olympiques de Paris, une reconnaissance mondiale qui ne va pas sans questionnements au sein de la communauté sur la transformation d'une pratique culturelle en discipline sportive.",
    origins:
      "Le break naît lors des block parties organisées par DJ Kool Herc à partir de 1973 dans le South Bronx. Herc invente le « break beat » en isolant et en répétant les passages instrumentaux (breaks) de disques funk et soul à l'aide de deux platines. C'est sur ces boucles de percussions que les premiers danseurs — appelés b-boys et b-girls — commencent à improviser.\n\nLe contexte politique et social est déterminant : le South Bronx de cette époque est l'un des quartiers les plus appauvris des États-Unis, abandonné par les politiques publiques, ravagé par les incendies d'immeubles et les plans d'urbanisme destructeurs des années 1950-60. Le hip-hop émerge comme réponse créative et communautaire à cette violence structurelle. Le break devient un moyen d'expression, de compétition non violente et d'affirmation identitaire.\n\nDes crews pionniers comme Rock Steady Crew, Dynamic Rockers et New York City Breakers contribuent à codifier les mouvements et à structurer la compétition. À partir des années 1980, les médias, les films (Breakin', Beat Street, Wild Style) et les tournées internationales projettent le breaking au-delà du Bronx.",
    timeline: [
      { year: "1973", event: "DJ Kool Herc invente le break beat lors des block parties du South Bronx" },
      { year: "1977", event: "Fondation de Rock Steady Crew par Jimmy D et Jojo, l'un des premiers crews structurés" },
      { year: "1983", event: "Sortie de Wild Style, premier film documentant la culture hip-hop" },
      { year: "1984", event: "Sorties de Breakin' et Beat Street, qui popularisent le breaking à l'international" },
      { year: "Fin 1980s", event: "Déclin médiatique aux États-Unis mais développement souterrain mondial" },
      { year: "Années 1990", event: "Renouveau de la scène battle internationale, notamment en Europe et en Corée du Sud" },
      { year: "2000s", event: "Institutionnalisation des compétitions mondiales (Battle of the Year, R16, Red Bull BC One)" },
      { year: "2018", event: "Le breaking est inclus au programme des Jeux olympiques de la jeunesse de Buenos Aires" },
      { year: "2024", event: "Le breaking fait son entrée aux Jeux olympiques de Paris — et est ensuite retiré du programme de Los Angeles 2028" },
    ],
    characteristics: {
      movements:
        "Le break s'organise en quatre grandes familles de mouvements : le toprock (mouvements debout, entrée en matière), le footwork (travail au sol, circulaire, sur mains et pieds), les power moves (figures acrobatiques continues : windmill, flare, headspin, airflare) et les freezes (positions bloquées, souvent inversées, qui closent une séquence). Chaque danseur construit son propre « style » en combinant ces éléments.",
      musicRelationship:
        "Le breaking est fondamentalement lié au break beat : le danseur entre dans le cercle précisément au moment où le break instrumental commence. La musique conditionne le timing, l'énergie et la structure de la performance. Les genres associés sont le funk, le soul, le hip-hop old school et l'electro.",
      improvisation:
        "L'improvisation est centrale, notamment dans le cypher et les battles. Un b-boy ou une b-girl répond en temps réel à la musique, aux mouvements de l'adversaire et à l'énergie du cercle. La créativité et l'originalité comptent autant que la technique.",
      formats: ["Cypher", "Battle (1v1, 2v2, crew)", "Jam", "Scène", "Compétition internationale"],
      visualCodes:
        "Vêtements confortables permettant les mouvements au sol : joggings, sneakers, sweat à capuche. Les tenues évoluent avec les époques et les cultures locales.",
    },
    music: {
      genres: ["Funk", "Soul", "Hip-hop old school", "Electro", "Break beat"],
      description:
        "Le break est indissociable du funk et du soul des années 1970 (James Brown, The Incredible Bongo Band), dont les breaks percussifs sont les fondements rythmiques du style. L'electro de Afrika Bambaataa et les premiers morceaux hip-hop nourrissent ensuite la pratique.",
      keyArtists: ["James Brown", "The Incredible Bongo Band", "Afrika Bambaataa", "Grandmaster Flash"],
    },
    keyFigures: [
      {
        category: "Pionniers et fondateurs",
        figures: [
          { name: "DJ Kool Herc", role: "DJ fondateur du break beat, inventeur technique du style" },
          { name: "Afrika Bambaataa", role: "DJ et fondateur de la Zulu Nation, figure centrale du mouvement hip-hop global" },
          { name: "Crazy Legs", role: "Membre fondateur de Rock Steady Crew, figure emblématique des années 1980" },
        ],
      },
      {
        category: "Développement et diffusion internationale",
        figures: [
          { name: "Rock Steady Crew", role: "Crew new-yorkais fondateur, ambassadeur mondial du breaking" },
          { name: "Dynamic Rockers", role: "Crew pionnier qui rivalise avec Rock Steady Crew dès les années 1980" },
          { name: "Battle of the Year", role: "Compétition internationale fondée en 1990 en Allemagne, pionnière de la scène globale" },
        ],
      },
      {
        category: "Scène française",
        figures: [
          { name: "Lilou", role: "B-boy marseillais, multiple champion du monde, figure de proue de la scène française" },
          { name: "Menno", role: "B-boy hollandais basé en France, style reconnu internationalement" },
          { name: "Pockemon Crew", role: "Crew français fondé à Paris, référence mondiale dans les compétitions de style" },
        ],
      },
    ],
    franceHistory:
      "Le break arrive en France dès le début des années 1980 via les films américains et les émissions télévisées. Des émissions comme H.I.P. H.O.P. sur TF1 (1984, présentée par Sydney) jouent un rôle déterminant dans la diffusion du style. Paris, Marseille et Lyon deviennent rapidement des foyers importants. La France développe une scène battle très active à partir des années 1990 et produit des danseurs reconnus internationalement, notamment dans les compétitions comme Red Bull BC One ou le Battle of the Year.",
    relatedStyles: ["hip-hop-freestyle", "popping", "locking", "electro"],
    commonConfusions: [
      {
        styles: "Break et hip-hop freestyle",
        explanation:
          "Le break est une discipline précise avec son propre vocabulaire (toprock, footwork, power moves, freezes). Le terme « hip-hop freestyle » désigne souvent une danse plus debout, inspirée des clips, moins codifiée et plus hybride. Les deux appartiennent à l'écosystème hip-hop mais ne partagent pas les mêmes fondamentaux.",
      },
    ],
    resources: [
      {
        title: "The Freshest Kids: A History of the B-Boy",
        author: "Israel (réalisateur)",
        year: "2002",
        format: "Documentaire",
        description:
          "Documentaire de référence sur l'histoire du breaking, avec des témoignages de pionniers comme Crazy Legs, Ken Swift et Phase One.",
        url: "https://www.imdb.com/title/tt0375783/",
      },
      {
        title: "Planet B-Boy",
        author: "Benson Lee (réalisateur)",
        year: "2007",
        format: "Documentaire",
        description:
          "Suit plusieurs crews du monde entier se préparant pour le Battle of the Year. Offre un panorama de la scène internationale des années 2000.",
        url: "https://www.imdb.com/title/tt0988763/",
      },
      {
        title: "Can't Stop Won't Stop : Une histoire de la génération hip-hop",
        author: "Jeff Chang",
        year: "2005",
        format: "Livre",
        description:
          "Ouvrage de référence sur les origines politiques et culturelles du hip-hop, incluant le breaking. Traduit en français.",
        url: "https://www.seuil.com/ouvrage/can-t-stop-won-t-stop-jeff-chang/9782021135046",
      },
    ],
    episodeLinks: [
      {
        slug: "51-arnaud-deprez",
        relevance:
          "Arnaud Deprez est un danseur et pédagogue issu de la culture hip-hop. L'épisode explore la transmission, l'éducation par le mouvement et le rôle social du break.",
      },
      {
        slug: "71-yaman-okur",
        relevance:
          "Yaman Okur est un b-boy turc dont la pratique a été profondément transformée par une expérience de vie intense. L'épisode questionne le rapport au corps, à l'identité et à la danse comme territoire personnel.",
      },
      {
        slug: "100-kanti",
        relevance:
          "Kanti est un artiste issu du breaking qui explore la frontière entre mouvement et trace visuelle. L'épisode questionne ce que le corps produit comme image et comme langage.",
      },
      {
        slug: "106-mounir-amhiln",
        relevance:
          "Mounir Amhiln explore comment les autres arts enrichissent la danse urbaine. Son rapport au break et aux cultures hip-hop traverse tout l'épisode.",
      },
    ],
    keywords: ["b-boy", "b-girl", "cypher", "battle", "footwork", "power moves", "freeze", "toprock", "hip-hop", "South Bronx", "New York", "break beat"],
    image: "/images/danydann.jpg",
    imageCredit: "© Dance Lab",
    seoTitle: "Break — Histoire, origines et culture | Explorer les styles | Dance Lab",
    seoDescription:
      "Découvrez l'histoire du break : origines dans le South Bronx, vocabulaire des mouvements, figures pionnières, développement en France et épisodes Dance Lab associés.",
  },

  // ── WAACKING ─────────────────────────────────────────────────────────────
  {
    slug: "waacking",
    name: "Waacking",
    aliases: ["Punking", "Garbo"],
    family: "Danses urbaines",
    era: "Années 1970",
    originCountry: "États-Unis",
    originCity: "Los Angeles",
    summary:
      "Le waacking est né dans les clubs gay de Los Angeles au début des années 1970, au sein des communautés LGBTQ+ afro-américaines et latinos. Il se caractérise par des bras en fouet rapides (« whacks »), une théâtralité expressive et une forte connexion à la musique disco. Style fondamentalement queer, il porte une histoire de résistance et de célébration.",
    introduction:
      "Le waacking — initialement appelé « punking » — émerge dans les clubs de la scène gay de Los Angeles au début des années 1970. Dans des espaces comme le Gino's Club, les danseurs issus des communautés noires et latinos LGBTQ+ développent un style extrêmement expressif, caractérisé par des mouvements de bras rapides et théâtraux, inspirés des poses des stars hollywoodiennes et des pin-ups des années 1940-50.\n\nLe waacking est indissociable de son contexte de création : la scène disco et gay de Los Angeles, dans une Amérique où les communautés LGBTQ+, et plus particulièrement les personnes noires et latinas, font face à une violence sociale, juridique et policière quotidienne. Danser était à la fois une célébration de soi et un acte de résistance.\n\nÀ partir des années 2000, le waacking connaît un renouveau mondial porté par des compétitions comme Juste Debout et des figures comme Ana Rokafella Garcia. Il est aujourd'hui pratiqué et enseigné dans le monde entier.",
    origins:
      "Le waacking naît à Los Angeles dans les années 1970 dans les clubs fréquentés par les communautés LGBTQ+ noires et latinos. Le nom initial, « punking », fait référence au fait que les danseurs, considérés comme des « punks » (terme péjoratif désignant des personnes queer), s'appropriaient ce mot comme emblème de fierté.\n\nLes mouvements caractéristiques — bras lancés en fouet à grande vitesse autour du corps, poses spectaculaires, théâtralité proche du mime et du cabaret — s'inspirent des gestes des stars de cinéma, des danses africaines-américaines vernaculaires et de l'énergie de la musique disco.\n\nL'émission télévisée Soul Train, diffusée depuis 1971, contribue à donner une visibilité nationale à ces mouvements. On y aperçoit des danseurs pratiquant des mouvements apparentés au waacking. Certains historiens du style, dont Tyrone Proctor (l'une des figures pionnières), parlent de la période 1973-1979 comme l'âge d'or du style.",
    timeline: [
      { year: "1971–1975", event: "Émergence du « punking » dans les clubs gay de Los Angeles" },
      { year: "Années 1970", event: "Soul Train diffuse des danseurs aux mouvements proches du waacking" },
      { year: "1979", event: "Le mot « waacking » commence à être utilisé dans la communauté" },
      { year: "Années 1980–1990", event: "Déclin avec la fin de l'ère disco et l'épidémie de sida qui décime la communauté créatrice" },
      { year: "Années 2000", event: "Renouveau mondial via les compétitions Juste Debout et les réseaux sociaux" },
      { year: "2010s", event: "Le waacking est enseigné dans le monde entier ; des émissions de télévision contribuent à sa diffusion" },
    ],
    characteristics: {
      movements:
        "Les mouvements fondamentaux du waacking sont les « whacks » — bras lancés à grande vitesse autour du corps —, les poses spectaculaires empruntées aux divas hollywoodiennes, et les changements de niveau. Le danseur joue avec l'extension maximale du bras, le timing précis sur la musique et une théâtralité assumée.",
      musicRelationship:
        "Le waacking est fondamentalement lié au disco et à la funk. La connexion musicale est extrêmement précise : chaque whack correspond à un temps, un contretemps ou un accent musical. La musicalité est l'un des critères essentiels d'évaluation dans les battles.",
      improvisation:
        "L'improvisation est centrale : en cypher ou en battle, le danseur répond à la musique et à son adversaire en temps réel. L'expression personnelle (le « feeling ») compte autant que la technique.",
      formats: ["Cypher", "Battle (1v1)", "Jam", "Scène", "Compétition (Juste Debout, etc.)"],
      visualCodes:
        "Les tenues peuvent être très variées, de la tenue de rue à des looks plus théâtraux inspirés du cabaret. L'expression du visage (le « face ») fait partie intégrante du style.",
    },
    music: {
      genres: ["Disco", "Funk", "Soul", "R&B"],
      description:
        "Le waacking est né sur le disco des années 1970 : Diana Ross, Gloria Gaynor, Donna Summer, Sylvester. Ces artistes sont plus que des références musicales : ils font partie du panthéon culturel de la communauté qui a créé le style.",
      keyArtists: ["Diana Ross", "Gloria Gaynor", "Donna Summer", "Sylvester", "Grace Jones"],
    },
    keyFigures: [
      {
        category: "Pionniers",
        figures: [
          { name: "Tyrone Proctor", role: "L'une des figures fondatrices du waacking à Los Angeles, pédagogue et historien du style" },
          { name: "Lonnie Carbajal", role: "Pionnier du waacking, figure de la scène de Los Angeles des années 1970" },
          { name: "Tinker", role: "Pionnier reconnu pour avoir contribué à codifier les mouvements fondamentaux" },
        ],
      },
      {
        category: "Diffusion internationale",
        figures: [
          { name: "Ana 'Rokafella' Garcia", role: "Figure majeure du hip-hop et du waacking, contribue à la reconnaissance mondiale du style" },
          { name: "Archie Burnett", role: "Danseur de la scène new-yorkaise, transmetteur du waacking à l'international" },
        ],
      },
      {
        category: "Scène française",
        figures: [
          { name: "Sofia Stanić", role: "Danseuse et pédagogue, figure de la scène waacking en France", note: "Invitée de Dance Lab (épisode 98)" },
          { name: "Annabelle Da Fonte", role: "Danseuse et pédagogue active sur la scène internationale", note: "Invitée de Dance Lab (épisode 5)" },
        ],
      },
    ],
    franceHistory:
      "Le waacking arrive en France dans les années 2000, principalement par les compétitions internationales comme Juste Debout et la diffusion de vidéos en ligne. La France développe une scène active à Paris et dans plusieurs grandes villes. Des pédagogues comme Sofia Stanić contribuent à transmettre l'histoire et les fondamentaux du style.",
    relatedStyles: ["voguing", "locking", "house-dance"],
    commonConfusions: [
      {
        styles: "Waacking et voguing",
        explanation:
          "Ces deux styles sont souvent confondus car tous deux sont issus des communautés LGBTQ+ afro-américaines et latinos. Mais ils ont des origines géographiques différentes (Los Angeles pour le waacking, New York pour le voguing), des vocabulaires distincts et des contextes de pratique différents. Le voguing est lié à la culture ballroom ; le waacking est né dans les clubs disco.",
      },
    ],
    resources: [
      {
        title: "Waacking — Ressources historiques",
        author: "Waacking History Project",
        year: "En ligne",
        format: "Site web",
        description: "Documentation et archives sur l'histoire du waacking, collectées par des praticiens du style.",
        url: "https://www.waackinghistory.com/",
      },
    ],
    episodeLinks: [
      {
        slug: "98-sofia",
        relevance:
          "Sofia est une danseuse spécialiste du waacking. L'épisode explore son rapport à la pratique, à la transmission et à ce que la danse laisse comme trace après une performance.",
      },
      {
        slug: "5-annabelle-da-fonte",
        relevance:
          "Annabelle Da Fonte est une danseuse active sur la scène des danses urbaines, dont le waacking. L'épisode aborde les infrastructures de la danse et la réalité du métier.",
      },
    ],
    keywords: ["waacking", "punking", "disco", "LGBTQ+", "Los Angeles", "whip", "arms", "Soul Train", "tyrone proctor"],
    image: "/images/sofiastanic.jpg",
    imageCredit: "Danseuse : Sofia Stanić · © Anna Jot",
    seoTitle: "Waacking — Histoire, origines et culture | Explorer les styles | Dance Lab",
    seoDescription:
      "Découvrez l'histoire du waacking : origines dans les clubs gay de Los Angeles, vocabulaire, figures pionnières, développement en France et épisodes Dance Lab.",
  },

  // ── VOGUING ──────────────────────────────────────────────────────────────
  {
    slug: "voguing",
    name: "Voguing",
    aliases: ["Vogue"],
    family: "Danses urbaines",
    era: "Années 1980",
    originCountry: "États-Unis",
    originCity: "Harlem, New York",
    summary:
      "Le voguing est né dans la scène ballroom de Harlem dans les années 1980, au sein des communautés LGBTQ+ noires et latinas. Il se caractérise par des poses angulaires inspirées du magazine Vogue, une fluidité extrême et cinq éléments fondamentaux : catwalk, duckwalk, hands, spins & dips, floor performance. Il est indissociable de la culture ballroom.",
    introduction:
      "Le voguing est inséparable de la culture ballroom de New York : un écosystème social, culturel et compétitif créé par et pour les personnes LGBTQ+ noires et latinas, exclues des grandes compétitions drag et des espaces sociaux dominants. Les « Houses » — familles de substitution portant des noms de grandes maisons de mode — organisent des bals où s'affrontent des catégories variées, dont le vogue.\n\nLe style tire son nom du magazine Vogue, dont les couvertures et photographies glamour servent de matière première aux poses et aux attitudes des danseurs. Il s'inspire aussi du mime, de la danse africaine-américaine vernaculaire, du ballet et du kabuki. Dans les années 1980, des figures comme Willi Ninja, Paris Dupree et les maisons LaBeija, Xtravaganza et Ninja codifient les styles et établissent les règles des compétitions.\n\nEn 1990, le documentaire Paris Is Burning (Jennie Livingston) et le tube de Madonna Vogue projettent la culture ballroom dans le grand public mondial — non sans débats sur l'appropriation culturelle.",
    origins:
      "Les origines du voguing remontent aux bals drag harlemites du début du XXe siècle, que fréquentaient des personnes racisées rejetées des compétitions drag blanches. Dans les années 1960-70, Crystal LaBeija, Miss Harlem et grande figure de la scène, fonde la House of LaBeija après avoir été discriminée lors du National Drag Queen Contest.\n\nC'est dans ce contexte que les bals deviennent des espaces autonomes et créatifs, organisés par et pour les communautés noires et latinas LGBTQ+. Le voguing émerge comme catégorie principale : les concurrents s'affrontent en interprétant des poses inspirées des mannequins du magazine Vogue, devant un jury (les « judges ») et sous les encouragements d'un maître de cérémonie (le « commentator »).\n\nPlusieurs styles se développent : l'Old Way (années 1960-80, poses angulaires précises et géométriques), le New Way (années 1990, influences caoutchouteuses et poses impossibles) et le Vogue Fem (fluidité, sensualité, féminité revendiquée).",
    timeline: [
      { year: "Années 1920–40", event: "Bals drag harlemites et premières formes de compétition dans les communautés noires LGBTQ+" },
      { year: "1972", event: "Crystal LaBeija fonde la House of LaBeija après avoir été discriminée" },
      { year: "Années 1980", event: "Développement des grands bals et codification du voguing en styles distincts" },
      { year: "1990", event: "Sortie de Paris Is Burning (Jennie Livingston) et du tube Vogue (Madonna)" },
      { year: "Années 2000–10", event: "Diffusion internationale via internet ; émergence de scènes ballroom en Europe" },
      { year: "2018–2021", event: "La série Pose (Ryan Murphy, FX) remet la culture ballroom au centre de l'attention mondiale" },
    ],
    characteristics: {
      movements:
        "Le voguing repose sur cinq éléments officiels : le catwalk (défilé), le duckwalk (marche accroupie), les hands (performance des mains et des bras), les spins & dips (rotations et chutes spectaculaires) et le floor performance (travail au sol). Selon le style (Old Way, New Way, Vogue Fem), les priorités changent.",
      musicRelationship:
        "Le voguing est lié à la musique house, à la dance music et aux ballroom beats (productions spécifiques aux bals). La musicalité — timing des poses sur les accents musicaux — est essentielle dans l'évaluation.",
      improvisation:
        "Le voguing est à la fois codifié (cinq éléments, règles des bals) et profondément improvisé. Chaque performer donne une interprétation unique des catégories, souvent liée à son histoire personnelle et à sa maison.",
      formats: ["Bal (Ball)", "Cypher", "Battle (catégories)", "Scène", "Clip"],
      visualCodes:
        "Les codes visuels varient selon les catégories (realness, femme queen, butch queen...) et les maisons. Les tenues peuvent aller du streetwear à la haute couture selon la catégorie.",
    },
    music: {
      genres: ["House", "Dance", "Ballroom beats", "Electronic"],
      description:
        "Le voguing est né sur la musique house de Chicago et New York, et sur les productions spécifiques aux bals (ballroom music). Les bals contemporains utilisent souvent des productions originales de DJ comme MikeQ ou Vjuan Allure.",
      keyArtists: ["MikeQ", "Vjuan Allure", "Kevin JZ Prodigy (commentator)"],
    },
    keyFigures: [
      {
        category: "Fondateurs et pionniers",
        figures: [
          { name: "Crystal LaBeija", role: "Fondatrice de la House of LaBeija, figure fondatrice de la culture ballroom" },
          { name: "Paris Dupree", role: "Fondatrice de la House of Dupree, créditée pour avoir codifié le voguing comme compétition" },
          { name: "Willi Ninja", role: "Danseur et chorégraphe, figure mondiale du New Way, ambassadeur du voguing à l'international" },
        ],
      },
      {
        category: "Maisons historiques",
        figures: [
          { name: "House of LaBeija", role: "L'une des premières et plus importantes maisons de la scène ballroom" },
          { name: "House of Xtravaganza", role: "Maison centrale dans les années 1980-90, présente dans Paris Is Burning" },
          { name: "House of Ninja", role: "Maison fondée par Willi Ninja, influente dans la diffusion internationale du voguing" },
        ],
      },
      {
        category: "Scène française et européenne",
        figures: [
          { name: "Legendary Yanou", role: "Figure de la scène Old Way en France", note: "Invité de Dance Lab (épisode 4)" },
          { name: "Emanuelle Soum", role: "Danseuse et pédagogue, figure du voguing et de la culture ballroom en France", note: "Invitée de Dance Lab (épisode 58)" },
        ],
      },
    ],
    franceHistory:
      "La culture ballroom et le voguing arrivent en France dans les années 2000, portés par des artistes et pédagogues qui reviennent de New York avec une connaissance directe de la scène. Des bals commencent à être organisés à Paris. Des maisons françaises se créent. Aujourd'hui, la scène ballroom française est l'une des plus actives d'Europe.",
    relatedStyles: ["waacking", "house-dance"],
    commonConfusions: [
      {
        styles: "Voguing et waacking",
        explanation:
          "Deux styles LGBTQ+ nés dans les années 1970-80, mais dans des contextes différents. Le voguing est lié à la culture ballroom de New York, avec ses compétitions, ses maisons et ses catégories. Le waacking naît dans les clubs de Los Angeles. Leurs vocabulaires sont distincts même si des éléments se croisent.",
      },
      {
        styles: "Voguing et ballroom",
        explanation:
          "Le voguing est une discipline parmi d'autres pratiquées dans les bals (balls). La culture ballroom est l'écosystème global qui inclut le voguing mais aussi d'autres catégories : runway, face, performance, body, etc.",
      },
    ],
    resources: [
      {
        title: "Paris Is Burning",
        author: "Jennie Livingston (réalisatrice)",
        year: "1990",
        format: "Documentaire",
        description:
          "Documentaire de référence sur la scène ballroom de Harlem dans les années 1980. Suit plusieurs maisons et figures du voguing, dont les houses Xtravaganza et Ninja.",
        url: "https://www.imdb.com/title/tt0100332/",
      },
      {
        title: "Pose",
        author: "Ryan Murphy, Brad Falchuk, Steven Canals (créateurs)",
        year: "2018",
        format: "Série",
        description:
          "Fiction HBO mettant en scène la culture ballroom des années 1980-90 à New York. Casting majoritairement composé de personnes trans et non-binaires.",
        url: "https://www.imdb.com/title/tt7562112/",
      },
    ],
    episodeLinks: [
      {
        slug: "4-legendary-yanou",
        relevance:
          "Legendary Yanou est une figure du Old Way en France. L'épisode explore les cinq éléments du voguing, la précision du style et la transmission de la culture ballroom.",
      },
      {
        slug: "58-emanuelle-soum",
        relevance:
          "Emanuelle Soum aborde le voguing, la féminité, l'émancipation par le corps et son rapport à la culture ballroom française à travers ses projets Beyond et MaisonM.",
      },
      {
        slug: "69-tianee-achille",
        relevance:
          "Tianée Achille évoque son parcours entre rave party, battle et voguing, illustrant comment la culture ballroom s'articule avec d'autres scènes de la danse urbaine.",
      },
    ],
    keywords: ["ballroom", "voguing", "vogue", "maison", "house", "ball", "Old Way", "New Way", "Vogue Fem", "Harlem", "LGBTQ+", "pose"],
    seoTitle: "Voguing — Histoire, culture ballroom et origines | Explorer les styles | Dance Lab",
    seoDescription:
      "Découvrez l'histoire du voguing : culture ballroom de Harlem, maisons, styles Old Way et New Way, figures pionnières, développement en France et épisodes Dance Lab.",
  },

  // ── KRUMP ────────────────────────────────────────────────────────────────
  {
    slug: "krump",
    name: "Krump",
    aliases: ["K.R.U.M.P.", "Clown dancing"],
    family: "Danses urbaines",
    era: "Années 2000",
    originCountry: "États-Unis",
    originCity: "Compton, Los Angeles",
    summary:
      "Le krump naît à Compton, Los Angeles, au début des années 2000. Style d'une intensité extrême, il se caractérise par des mouvements explosifs du torse, des bras et des jambes, une énergie souvent qualifiée de spirituelle ou tribale. Il émerge comme exutoire dans l'un des quartiers les plus touchés par la pauvreté et les violences aux États-Unis.",
    introduction:
      "Le krump naît en 2001 à Compton, California, à partir d'une danse de rue spectaculaire et joyeuse appelée « clown dancing », inventée par Thomas « Tommy the Clown » Johnson. Tommy se produit habillé en clown lors de fêtes d'anniversaires dans le quartier, et crée autour de lui une communauté de danseurs — les « clowns » — qui développent un langage de plus en plus intense et cathartique.\n\nC'est à partir de cette pratique que des jeunes danseurs, dont Tight Eyez et Lil C, développent le krump — un acronyme parfois décrit comme Kingdom Radically Uplifted Mighty Praise. Le style se distingue par sa puissance physique : les mouvements du torse (chest pops), des bras (arm swings) et des jambes sont exécutés à pleine intensité, dans une énergie proche de la transe.\n\nLe krump est profondément lié à une expérience communautaire, spirituelle et thérapeutique. Il est pratiqué comme exutoire à la violence de rue, au deuil et à la détresse sociale. Le documentaire Rize (David LaChapelle, 2005) le révèle au monde entier.",
    origins:
      "Compton, dans le comté de Los Angeles, est l'un des territoires les plus touchés par les violences de gangs, la pauvreté et l'injustice raciale aux États-Unis. C'est dans ce contexte que Thomas « Tommy the Clown » Johnson crée en 1992 une forme de divertissement pour les fêtes d'anniversaire, le « clown dancing » — danse enjouée, costumée, destinée à offrir une alternative aux gangs et à l'oisiveté.\n\nAutour de lui se forme une communauté appelée Hip Hop Clowns. Des jeunes danseurs comme Tight Eyez et Lil C s'y initient, puis font évoluer le style vers quelque chose de beaucoup plus intense, libérant une énergie explosive et souvent qualifiée de transe ou de prière. Ils nomment ce nouveau style krump.\n\nLe krump se pratique souvent en sessions appelées « battles » ou « sessions krump », dans des espaces comme des parkings, des garages ou des salles communautaires. L'objectif n'est pas de blesser l'autre mais de libérer quelque chose de profond en soi.",
    timeline: [
      { year: "1992", event: "Thomas « Tommy the Clown » Johnson invente le clown dancing à Compton" },
      { year: "2001", event: "Tight Eyez et Lil C font évoluer le clown dancing vers ce qui deviendra le krump" },
      { year: "2005", event: "Sortie de Rize (David LaChapelle) — révélation mondiale du krump" },
      { year: "2005–2010", event: "Développement de la scène krump internationale, notamment en Europe et au Japon" },
      { year: "2010s", event: "Le krump intègre les compétitions de danse urbaine et les festivals internationaux" },
    ],
    characteristics: {
      movements:
        "Le krump repose sur quatre éléments principaux : les chest pops (explosions de poitrine), les arm swings (balancements de bras puissants), les stomps (frappes au sol) et le jabs (lancers rapides). L'intensité et l'authenticité émotionnelle sont primordiales.",
      musicRelationship:
        "Le krump se pratique sur une grande variété de musiques : gospel, hip-hop, trap, musiques tribales. La musique n'est pas un simple fond sonore mais une invitation à libérer une énergie intérieure.",
      improvisation:
        "L'improvisation est totale. Le krump n'est pas chorégraphié : il est l'expression directe d'un état émotionnel. Chaque session est unique.",
      formats: ["Session", "Battle", "Cypher", "Représentation scénique"],
      visualCodes:
        "Le maquillage de clown (face painting) reste présent dans certaines sessions, hommage aux origines du style. Les tenues sont souvent amples pour permettre les mouvements.",
    },
    music: {
      genres: ["Gospel", "Hip-hop", "Trap", "Musiques tribales et percussives"],
      description:
        "Le krump n'est pas lié à un genre musical spécifique. Ce qui compte, c'est l'énergie produite par la musique. Gospel, percussions africaines, hip-hop ou trap — tout ce qui peut libérer une énergie collective intense peut servir de support.",
    },
    keyFigures: [
      {
        category: "Fondateurs",
        figures: [
          { name: "Thomas « Tommy the Clown » Johnson", role: "Inventeur du clown dancing à Compton, père fondateur de ce qui deviendra le krump" },
          { name: "Tight Eyez", role: "Co-fondateur du krump avec Lil C, figure centrale du style depuis ses origines" },
          { name: "Lil C", role: "Co-fondateur du krump, figure internationale, présent dans le documentaire Rize" },
        ],
      },
      {
        category: "Scène française",
        figures: [
          { name: "Grichka Rootz", role: "Danseur, pédagogue et figure du krump en France", note: "Invité de Dance Lab (épisode 113)" },
          { name: "Dexter", role: "Danseur krump, figure de la scène française", note: "Invité de Dance Lab (épisode 91)" },
        ],
      },
    ],
    franceHistory:
      "Le krump arrive en France dans les années 2006-2008, notamment via le documentaire Rize et les échanges avec la scène internationale. Des danseurs comme Grichka Rootz jouent un rôle central dans la transmission et le développement de la scène française, qui compte aujourd'hui parmi les plus actives d'Europe.",
    relatedStyles: ["break", "hip-hop-freestyle"],
    commonConfusions: [
      {
        styles: "Krump et hip-hop freestyle",
        explanation:
          "Le krump est souvent regroupé avec le hip-hop mais c'est une pratique distincte, avec ses propres fondements, ses propres codes et une philosophie très particulière centrée sur le catharsis. Son intensité physique et émotionnelle le différencie clairement des autres styles urbains.",
      },
    ],
    resources: [
      {
        title: "Rize",
        author: "David LaChapelle (réalisateur)",
        year: "2005",
        format: "Documentaire",
        description:
          "Documentaire de référence sur les origines du krump à Compton. Suit Tommy the Clown, Tight Eyez et les communautés de danseurs de Los Angeles.",
        url: "https://www.imdb.com/title/tt0436689/",
      },
    ],
    episodeLinks: [
      {
        slug: "113-grichka-rootz",
        relevance:
          "Grichka Rootz est une figure centrale du krump en France. L'épisode explore l'histoire du style, son rapport à l'identité, à la transmission et à la question « qu'est-ce que je suis si je ne danse plus ? »",
      },
      {
        slug: "91-dexter",
        relevance:
          "Dexter est un danseur krump dont l'épisode explore comment la pratique sert à tenir debout, à traverser des épreuves et à construire une identité par le mouvement.",
      },
    ],
    keywords: ["krump", "Compton", "clown dancing", "Tommy the Clown", "chest pop", "catharsis", "Los Angeles", "communauté"],
    seoTitle: "Krump — Histoire, origines et culture | Explorer les styles | Dance Lab",
    seoDescription:
      "Découvrez l'histoire du krump : origines à Compton, Tommy the Clown, vocabulaire des mouvements, développement en France et épisodes Dance Lab de Grichka Rootz et Dexter.",
  },

  // ── DANSE CLASSIQUE ──────────────────────────────────────────────────────
  {
    slug: "danse-classique",
    name: "Danse classique",
    aliases: ["Ballet classique", "Ballet"],
    family: "Danses académiques",
    era: "XVe–XVIIe siècle",
    originCountry: "Italie / France",
    originCity: "Florence, puis Paris",
    summary:
      "La danse classique naît dans les cours italiennes de la Renaissance et se codifie en France sous Louis XIV avec la création de l'Académie Royale de Danse en 1661. Elle repose sur un vocabulaire précis de positions des pieds, des bras et du corps, la recherche de l'élévation et de la légèreté, et une technique rigoureuse transmise en académies dans le monde entier.",
    introduction:
      "La danse classique — souvent appelée ballet — est l'une des formes d'expression chorégraphique les plus codifiées au monde. Son vocabulaire, établi au fil des siècles par des académies et des maîtres de ballet, repose sur des principes d'élévation, de légèreté, d'en-dehors des jambes et d'une grammaire précise de positions et de pas.\n\nNée dans les divertissements de cour italiens de la Renaissance, la danse classique est formalisée en France sous le règne de Louis XIV — lui-même danseur — avec la fondation de l'Académie Royale de Danse en 1661 et la création du premier ballet professionnel. Les siècles suivants voient l'émergence du ballet romantique (La Sylphide, Giselle), puis du ballet classique russe (Tchaïkovski, Petipa, Ivanov) qui produit les œuvres les plus connues du répertoire.\n\nAujourd'hui, la danse classique reste une pratique vivante et contestée. Des artistes comme Chloé Lopes Gomes interrogent les normes raciales, corporelles et sociales d'une discipline longtemps marquée par des critères d'exclusion.",
    origins:
      "Les premières traces de ce qui deviendra la danse classique se trouvent dans les spectacles de cour italiens du XVe siècle : les « balletti » (petits bals) sont des divertissements aristocratiques mêlant danse, musique, chant et déclamation. Catherine de Médicis, en se mariant avec le futur Henri II de France, importe ces pratiques à la cour française.\n\nL'étape décisive est la création de l'Académie Royale de Danse par Louis XIV en 1661, puis de l'Académie Royale de Musique (l'actuelle Opéra de Paris) en 1669. Le danseur et chorégraphe Jean-Baptiste Lully codifie les premiers ballets de cour, suivi de Pierre Beauchamps qui établit les cinq positions fondamentales des pieds.\n\nAu XVIIIe siècle, Jean-Georges Noverre formule dans ses Lettres sur la danse (1760) les principes du ballet d'action, réclamant plus d'expression dramatique et moins de virtuosité mécanique. Au XIXe siècle, le ballet romantique met en scène des sylphides et des willis sur pointes, des créatures célestes échappant à la gravité.",
    timeline: [
      { year: "1489", event: "Premier spectacle de cour documenté à la cour des Sforza à Milan" },
      { year: "1489–1600", event: "Développement des ballets de cour en Italie et en France" },
      { year: "1661", event: "Louis XIV fonde l'Académie Royale de Danse à Paris" },
      { year: "1760", event: "Jean-Georges Noverre publie ses Lettres sur la danse, texte fondateur du ballet d'action" },
      { year: "1832", event: "La Sylphide (Marie Taglioni) — naissance du ballet romantique et de la danse sur pointes" },
      { year: "1890–1895", event: "La Belle au bois dormant et Le Lac des cygnes (Petipa, Ivanov, Tchaïkovski) — apogée du ballet classique russe" },
      { year: "1909–1929", event: "Les Ballets Russes de Serge Diaghilev révolutionnent la danse mondiale" },
      { year: "Années 1930–70", event: "Développement des grandes compagnies nationales (Royal Ballet, Paris, Bolchoï, NYCB)" },
      { year: "Aujourd'hui", event: "Questionnements sur les normes raciales, de genre et de corps dans le ballet classique" },
    ],
    characteristics: {
      movements:
        "La danse classique repose sur cinq positions des pieds, une technique d'en-dehors (rotation externe des jambes depuis la hanche), des pas codifiés (plié, relevé, arabesque, attitude, grand jeté, pirouette), le travail sur pointes pour les danseuses et la virtuosité masculine dans les sauts et portés.",
      musicRelationship:
        "Le ballet classique est étroitement lié à la musique orchestrale. Les chorégraphies suivent la structure musicale. Les grands compositeurs du répertoire classique sont Tchaïkovski, Adolphe Adam, Léo Delibes et Prokofiev.",
      improvisation:
        "L'improvisation n'existe pas dans le ballet classique traditionnel : tout est rigoureusement chorégraphié. L'interprétation personnelle s'exprime dans les nuances, la qualité du mouvement et la présence scénique.",
      formats: ["Scène (compagnie, soirée)", "École de danse (académie)", "Concours"],
      visualCodes:
        "Tutu, pointes, chignon, collants. Les codes visuels du ballet classique sont parmi les plus reconnaissables de la danse.",
    },
    music: {
      genres: ["Musique orchestrale classique et romantique"],
      description:
        "Le répertoire du ballet classique est dominé par les partitions de Tchaïkovski (Le Lac des cygnes, La Belle au bois dormant, Casse-Noisette), Adam (Giselle) et Delibes (Coppélia, Sylvia).",
      keyArtists: ["Piotr Ilitch Tchaïkovski", "Adolphe Adam", "Léo Delibes", "Sergei Prokofiev"],
    },
    keyFigures: [
      {
        category: "Fondateurs et codificateurs",
        figures: [
          { name: "Louis XIV", role: "Danseur et fondateur de l'Académie Royale de Danse (1661)" },
          { name: "Jean-Baptiste Lully", role: "Compositeur et chorégraphe, codifie les premiers ballets de cour" },
          { name: "Pierre Beauchamps", role: "Maître de ballet, établit les cinq positions fondamentales" },
          { name: "Jean-Georges Noverre", role: "Théoricien du ballet d'action, auteur des Lettres sur la danse (1760)" },
        ],
      },
      {
        category: "Grandes figures historiques",
        figures: [
          { name: "Marie Taglioni", role: "Danseuse romantique, popularise la danse sur pointes (La Sylphide, 1832)" },
          { name: "Marius Petipa", role: "Chorégraphe du ballet impérial russe, auteur de La Belle au bois dormant et Le Lac des cygnes" },
          { name: "Rudolf Noureïev", role: "Danseur et chorégraphe soviétique, directeur du Ballet de l'Opéra de Paris 1983-1989" },
        ],
      },
      {
        category: "Voix critiques contemporaines",
        figures: [
          { name: "Chloé Lopes Gomes", role: "Danseuse soliste, militante pour la diversité dans le ballet classique", note: "Invitée de Dance Lab (épisode 73)" },
          { name: "Michaela DePrince", role: "Danseuse américaine d'origine sierra-léonaise, figure internationale de la diversité dans le ballet" },
        ],
      },
    ],
    franceHistory:
      "La France est la patrie institutionnelle de la danse classique. L'Opéra national de Paris est la compagnie la plus ancienne du monde encore en activité. L'École de Danse de l'Opéra de Paris forme depuis des siècles les danseurs du corps de ballet. La France a également contribué à la diffusion mondiale du vocabulaire (les termes techniques du ballet sont en français dans le monde entier).",
    relatedStyles: ["contemporain", "jazz"],
    commonConfusions: [
      {
        styles: "Danse classique et danse contemporaine",
        explanation:
          "La danse contemporaine est née, au XXe siècle, en réaction au ballet classique. Elle remet en question ses règles, sa verticalité, son rapport au sol et sa hiérarchie des corps. Les deux coexistent mais avec des philosophies souvent opposées.",
      },
    ],
    resources: [
      {
        title: "Lettres sur la danse et sur les ballets",
        author: "Jean-Georges Noverre",
        year: "1760",
        format: "Livre",
        description:
          "Texte fondateur de la pensée chorégraphique occidentale. Plaide pour un ballet plus expressif et dramatique, moins virtuose.",
        url: "https://gallica.bnf.fr/ark:/12148/bpt6k5622932s",
      },
      {
        title: "La danse classique — Opéra national de Paris",
        author: "Opéra national de Paris",
        year: "En ligne",
        format: "Site web",
        description: "Ressources pédagogiques sur l'histoire du ballet et la compagnie.",
        url: "https://www.operadeparis.fr/",
      },
    ],
    episodeLinks: [
      {
        slug: "73-chloe-lopes-gomes",
        relevance:
          "Chloé Lopes Gomes est l'une des voix les plus importantes sur les discriminations dans la danse classique. L'épisode explore les codes raciaux du ballet et la nécessité de les remettre en question.",
      },
      {
        slug: "30-coraline-bucciacchio",
        relevance:
          "Coraline Bucciacchio témoigne des joies et des sacrifices d'une carrière dans la danse classique, abordant aussi les troubles alimentaires et le rapport difficile au corps dans ce milieu.",
      },
    ],
    keywords: ["ballet", "classique", "pointes", "Opéra de Paris", "Tchaïkovski", "Louis XIV", "arabesque", "tutu", "académie"],
    seoTitle: "Danse classique — Histoire, technique et ballet | Explorer les styles | Dance Lab",
    seoDescription:
      "Découvrez l'histoire de la danse classique : origines en France, codification du ballet, figures historiques, questionnements contemporains et épisodes Dance Lab.",
  },

  // ── JAZZ ─────────────────────────────────────────────────────────────────
  {
    slug: "jazz",
    name: "Jazz",
    aliases: ["Jazz dance", "Danse jazz"],
    family: "Danses scéniques",
    era: "Début XXe siècle",
    originCountry: "États-Unis",
    originCity: "La Nouvelle-Orléans, puis New York",
    summary:
      "La danse jazz naît au début du XXe siècle dans les communautés afro-américaines de La Nouvelle-Orléans et de New York, nourrie par les musiques de jazz, de blues et de ragtime. Elle se caractérise par une fluidité particulière du corps, une forte musicalité, la syncope et une expressivité joyeuse. Elle a profondément influencé la comédie musicale, le cinéma, le Broadway et le show business mondial.",
    introduction:
      "La danse jazz est indissociable de l'histoire des communautés afro-américaines aux États-Unis. Elle naît dans les juke joints et les dance halls de La Nouvelle-Orléans puis de Harlem, sur les musiques de jazz, de blues et de ragtime du début du XXe siècle. Elle absorbe et transforme des danses africaines, des claquettes, du vaudeville et des traditions de plantation pour créer un style nouveau, fondamentalement populaire et profondément musical.\n\nÀ partir des années 1920-30, la danse jazz conquiert Broadway, les cabarets et le cinéma. Des chorégraphes comme Jack Cole, Bob Fosse et Katherine Dunham lui donnent une dimension scénique et théâtrale qui en font un art à part entière. Aujourd'hui, la danse jazz est enseignée dans toutes les académies du monde sous des formes très diverses.\n\nIl faut distinguer la danse jazz vernaculaire (les danses sociales originales : Lindy Hop, Charleston, Shim Sham) de la danse jazz scénique, codifiée pour la scène par des chorégraphes au XXe siècle.",
    origins:
      "La danse jazz vernaculaire émerge dans les communautés afro-américaines du Sud des États-Unis à la fin du XIXe siècle, portée par des danses comme le cakewalk et le ragtime dance. Elle se diffuse à Harlem dans les années 1920 lors de la Renaissance de Harlem, une période d'extraordinaire effervescence culturelle afro-américaine.\n\nDes lieux comme le Savoy Ballroom à Harlem (ouvert en 1926) deviennent des espaces de création collective où le Lindy Hop, le Charleston et d'autres danses se développent dans une atmosphère de concurrence et d'innovation permanente.\n\nC'est dans ce contexte que la danse jazz, à partir des années 1930-40, est appropriée, modifiée et codifiée par des chorégraphes blancs pour Broadway et Hollywood — un processus qui efface souvent ses origines afro-américaines.",
    timeline: [
      { year: "1890–1910", event: "Émergence des danses jazz vernaculaires afro-américaines (cakewalk, ragtime dance)" },
      { year: "1920s", event: "Renaissance de Harlem et développement du Charleston, du Lindy Hop, du Savoy Ballroom" },
      { year: "1930–1940s", event: "Broadway et Hollywood intègrent les danses jazz, souvent en les expurgeant de leurs origines" },
      { year: "1950s", event: "Jack Cole fonde un style jazz technique scénique qui influence des générations de chorégraphes" },
      { year: "1950–1970s", event: "Bob Fosse développe un jazz distinctif avec isolations, chapeaux, talons — devenu iconique" },
      { year: "Années 1970–80", event: "Diffusion mondiale via les cours de danse, émissions télévisées et comédies musicales" },
      { year: "Aujourd'hui", event: "La danse jazz se décline en jazz classique, modern jazz, street jazz, lyrical jazz et de nombreux sous-styles" },
    ],
    characteristics: {
      movements:
        "La danse jazz se caractérise par les isolations (mouvements indépendants des différentes parties du corps), la syncope (danser sur les contretemps), la fluidité, l'expressivité du visage et une grande variété de dynamiques. Elle intègre des éléments au sol, des sauts et une utilisation expressive des bras.",
      musicRelationship:
        "La connexion musicale est au cœur du jazz : danser le jazz, c'est interpréter la musique avec son corps. La syncope, le swing, le phrasé musical définissent la qualité du mouvement.",
      improvisation:
        "L'improvisation est centrale dans le jazz vernaculaire. Dans le jazz scénique contemporain, elle est plus ou moins présente selon les contextes.",
      formats: ["Scène", "Comédie musicale", "Cours académique", "Clip", "Show télévisé"],
    },
    music: {
      genres: ["Jazz", "Blues", "R&B", "Gospel", "Musique de Broadway"],
      description:
        "La danse jazz est née sur le jazz et le blues, et a évolué avec la musique populaire américaine : swing, bebop, puis rhythm and blues, soul et funk.",
      keyArtists: ["Duke Ellington", "Count Basie", "Ella Fitzgerald"],
    },
    keyFigures: [
      {
        category: "Pionniers vernaculaires",
        figures: [
          { name: "Frankie Manning", role: "Maître du Lindy Hop, figure du Savoy Ballroom, ambassadeur mondial" },
          { name: "Norma Miller", role: "Danseuse et chorégraphe, figure centrale du Lindy Hop et du Savoy" },
        ],
      },
      {
        category: "Codificateurs scéniques",
        figures: [
          { name: "Jack Cole", role: "Chorégraphe, fondateur du jazz technique scénique, maître de nombreux chorégraphes de Broadway" },
          { name: "Bob Fosse", role: "Chorégraphe et réalisateur, créateur d'un style jazz distinctif (Chicago, Cabaret, All That Jazz)" },
          { name: "Katherine Dunham", role: "Danseuse, chorégraphe et anthropologue, pionnière de l'intégration des danses afro-caribéennes dans la danse moderne américaine" },
        ],
      },
    ],
    franceHistory:
      "La danse jazz arrive en France dans les années 1920 avec les musiciens de jazz américains qui se produisent à Paris. Dans les années 1950-70, des pédagogues comme Matt Mattox (qui s'installe en France) développent l'enseignement du jazz dans les académies françaises. Aujourd'hui, le jazz est l'une des disciplines les plus enseignées en France.",
    relatedStyles: ["contemporain", "danse-classique", "street-jazz"],
    commonConfusions: [
      {
        styles: "Jazz et modern jazz",
        explanation:
          "Le jazz et le modern jazz désignent des réalités proches mais distinctes selon les contextes et les pays. En France, le « jazz » en école de danse est souvent un jazz codifié et technique (héritage Jack Cole / Matt Mattox), tandis que le « modern jazz » intègre des influences contemporaines.",
      },
    ],
    resources: [
      {
        title: "Jazz Dance : The Story of American Vernacular Dance",
        author: "Marshall Stearns & Jean Stearns",
        year: "1968",
        format: "Livre",
        description:
          "Ouvrage de référence sur les origines afro-américaines de la danse jazz, couvrant le cakewalk, le Lindy Hop, les claquettes et le vaudeville.",
        url: "https://www.macmillanlearning.com/college/us/product/Jazz-Dance/p/0306803550",
      },
    ],
    episodeLinks: [
      {
        slug: "7-delphine-lemaitre",
        relevance:
          "Delphine Lemaitre est une figure du street jazz, style issu de la fusion entre le jazz scénique et les danses de rue. L'épisode explore l'expression de soi et la pédagogie de la danse.",
      },
    ],
    keywords: ["jazz dance", "swing", "Lindy Hop", "Broadway", "Bob Fosse", "syncopation", "Harlem", "vernaculaire", "scénique"],
    seoTitle: "Danse jazz — Histoire, origines et culture | Explorer les styles | Dance Lab",
    seoDescription:
      "Découvrez l'histoire de la danse jazz : origines afro-américaines, Harlem, Broadway, Bob Fosse, développement en France et épisodes Dance Lab associés.",
  },

  // ── CONTEMPORAIN ─────────────────────────────────────────────────────────
  {
    slug: "contemporain",
    name: "Danse contemporaine",
    aliases: ["Danse moderne", "Contemporary dance"],
    family: "Danses contemporaines et expérimentales",
    era: "XXe siècle",
    originCountry: "États-Unis / Europe",
    originCity: "New York, puis diffusion mondiale",
    summary:
      "La danse contemporaine naît au début du XXe siècle en réaction aux codes du ballet classique. Elle remet en question la verticalité, l'élévation, la narration linéaire et la hiérarchie des corps. Plurielle par nature, elle englobe des formes très variées, de la danse-théâtre à la performance en passant par la danse conceptuelle.",
    introduction:
      "La danse contemporaine est moins un style qu'un territoire : un espace de questionnement et d'expérimentation qui interroge ce qu'est la danse elle-même. Elle naît au début du XXe siècle avec des pionnières comme Isadora Duncan et Loïe Fuller, qui rejettent le corset technique du ballet pour explorer la liberté du mouvement, la nature, l'émotion et le quotidien.\n\nÀ la différence du ballet classique, qui cherche à transcender la pesanteur, la danse contemporaine accepte et travaille avec la gravité, le sol, la chute et l'imperfection. Elle s'intéresse aux corps réels, aux histoires singulières et aux questions politiques, sociales et philosophiques.\n\nEn France, la danse contemporaine connaît un développement exceptionnel à partir des années 1980 sous l'impulsion des politiques culturelles du ministère Jack Lang, qui crée les Centres Chorégraphiques Nationaux (CCN). La scène française est aujourd'hui l'une des plus actives et reconnues au monde.",
    origins:
      "La première grande rupture vient d'Isadora Duncan (1877-1927), danseuse américaine qui rejette les pointes et le tutu pour danser pieds nus, en tunique grecque, librement inspirée de la nature et des sculptures antiques. Elle inaugure une pensée du corps libéré, indissociable d'une vision politique et féministe.\n\nAux États-Unis, Ruth St. Denis et Ted Shawn fondent la Denishawn School (1915) qui produit Martha Graham — peut-être la figure la plus influente de la danse moderne américaine. Graham développe une technique fondée sur la contraction et la release (compression et libération) du torse, liée à l'expression des émotions profondes.\n\nMerce Cunningham, élève de Graham, rompt encore plus radicalement avec la narration et l'expression : pour lui, la danse n'a pas à raconter quoi que ce soit. Elle est mouvement pur. Il collabore avec John Cage pour dissocier complètement la danse de la musique. Cette rupture ouvre la voie à la postmodern dance des années 1960 (Judson Dance Theater) et à la danse conceptuelle.",
    timeline: [
      { year: "1890–1910", event: "Isadora Duncan et Loïe Fuller inaugurent les premières ruptures avec le ballet" },
      { year: "1915", event: "Fondation de la Denishawn School par Ruth St. Denis et Ted Shawn" },
      { year: "1923", event: "Martha Graham commence à développer sa propre technique" },
      { year: "1953", event: "Merce Cunningham fonde sa compagnie et révolutionne le rapport danse/musique" },
      { year: "1962–1964", event: "Judson Dance Theater à New York : rupture avec les conventions scéniques" },
      { year: "Années 1970", event: "La danse contact improvisation émerge (Steve Paxton)" },
      { year: "Années 1980", event: "Pina Bausch développe le Tanztheater (danse-théâtre) à Wuppertal" },
      { year: "1982", event: "Création des Centres Chorégraphiques Nationaux en France" },
      { year: "Aujourd'hui", event: "La danse contemporaine interroge constamment ses propres frontières" },
    ],
    characteristics: {
      movements:
        "La danse contemporaine n'a pas de vocabulaire unique. Elle se caractérise plutôt par une attitude : le questionnement permanent des formes, l'acceptation de la gravité et du sol, l'intégration du quotidien, la fluidité des frontières entre danse et performance.",
      musicRelationship:
        "Le rapport à la musique est variable : certains chorégraphes travaillent en silence, d'autres avec une musique originale, d'autres encore en décalant danse et musique (héritage Cunningham). La relation n'est jamais systématique.",
      improvisation:
        "L'improvisation peut être centrale (contact improvisation) ou totalement absente (œuvres très écrites). La danse contemporaine accepte toutes les positions.",
      formats: ["Scène (théâtre, festival)", "Performance", "Installation", "In situ", "Transmission en studio"],
    },
    music: {
      genres: ["Musique contemporaine", "Silence", "Musique électronique", "Installations sonores"],
      description:
        "Le rapport à la musique est une question ouverte dans la danse contemporaine. Cage, Feldman, Nono, ou le silence total — tout est possible selon le projet.",
    },
    keyFigures: [
      {
        category: "Pionnières",
        figures: [
          { name: "Isadora Duncan", role: "Figure fondatrice de la danse moderne, rejet des codes du ballet" },
          { name: "Loïe Fuller", role: "Pionnière de la danse lumière et des costumes scéniques innovants" },
          { name: "Martha Graham", role: "Créatrice de la technique Graham, l'une des plus importantes de la danse moderne américaine" },
        ],
      },
      {
        category: "Ruptures esthétiques",
        figures: [
          { name: "Merce Cunningham", role: "Figure centrale de la danse postmoderne, dissocie danse et musique" },
          { name: "Pina Bausch", role: "Pionnière du Tanztheater, mêle danse, théâtre et enquête sur les relations humaines" },
          { name: "Steve Paxton", role: "Co-créateur de la Contact Improvisation" },
        ],
      },
      {
        category: "Scène française",
        figures: [
          { name: "Maguy Marin", role: "Chorégraphe française majeure, associée au CCN de Rillieux-la-Pape" },
          { name: "Jérôme Bel", role: "Figure de la danse conceptuelle française" },
          { name: "Alain Platel", role: "Chorégraphe belge, figure du Tanztheater européen" },
        ],
      },
    ],
    franceHistory:
      "La France joue un rôle central dans le développement de la danse contemporaine. La politique culturelle des années 1980 crée les CCN (Centres Chorégraphiques Nationaux), structures uniques au monde qui permettent à des chorégraphes d'avoir un outil de travail permanent. Des artistes comme Anne Teresa De Keersmaeker, Maguy Marin, Angelin Preljocaj ou Jérôme Bel contribuent à faire de la scène française un point de référence mondial.",
    relatedStyles: ["danse-classique", "jazz"],
    commonConfusions: [
      {
        styles: "Danse contemporaine et danse moderne",
        explanation:
          "La « danse moderne » désigne historiquement le mouvement de rupture avec le ballet du début du XXe siècle (Graham, Cunningham, Limón). La « danse contemporaine » est un terme plus récent qui désigne la danse de création actuelle. En France, les deux expressions coexistent souvent avec des significations proches.",
      },
    ],
    resources: [
      {
        title: "Centre national de la danse (CN D)",
        author: "Centre national de la danse",
        year: "En ligne",
        format: "Site web",
        description:
          "Ressources, archives vidéo et documentation sur la danse contemporaine française et internationale.",
        url: "https://www.cnd.fr/",
      },
      {
        title: "Pina",
        author: "Wim Wenders (réalisateur)",
        year: "2011",
        format: "Documentaire",
        description:
          "Portrait cinématographique de Pina Bausch, filmé en 3D. Présente des extraits de ses œuvres majeures interprétés par les danseurs du Tanztheater Wuppertal.",
        url: "https://www.imdb.com/title/tt1556553/",
      },
    ],
    episodeLinks: [],
    keywords: ["danse contemporaine", "Martha Graham", "Pina Bausch", "Cunningham", "CCN", "postmodern", "performance", "Tanztheater"],
    seoTitle: "Danse contemporaine — Histoire, techniques et figures | Explorer les styles | Dance Lab",
    seoDescription:
      "Découvrez l'histoire de la danse contemporaine : d'Isadora Duncan à Pina Bausch, en passant par la scène française. Figures, techniques et ressources.",
  },

  // ── TUTTING ──────────────────────────────────────────────────────────────
  {
    slug: "tutting",
    name: "Tutting",
    aliases: ["King Tut"],
    family: "Danses urbaines",
    era: "Années 1980–1990",
    originCountry: "États-Unis",
    originCity: "New York",
    summary:
      "Le tutting est un style issu des danses hip-hop, caractérisé par des mouvements géométriques des bras, des mains et des doigts formant des angles à 90 degrés. Son nom fait référence au pharaon Toutankhamon, dont les représentations en profil avec les bras angulaires ont inspiré le style. Il peut être pratiqué en solo ou de manière synchronisée en groupe.",
    introduction:
      "Le tutting appartient à la famille des « finger tutting » et « arm tutting », pratiqués seuls ou combinés. Il naît dans la scène hip-hop américaine des années 1980-90, dans un contexte où la recherche de l'originalité gestuelle est permanente. Le nom vient du pharaon Toutankhamon (King Tut en anglais), dont les profils égyptiens en bas-relief, avec les bras formant des angles à 90°, ont inspiré les premiers danseurs.\n\nDeux sous-styles principaux coexistent : le « arm tutting » (travail des bras et des épaules) et le « finger tutting » (travail des mains et des doigts, formant des structures géométriques complexes). Ce dernier est devenu particulièrement populaire avec la diffusion de vidéos en ligne dans les années 2010.\n\nLe tutting peut être pratiqué de façon autonome ou combiné au popping, au waving ou à d'autres styles hip-hop.",
    origins:
      "Les origines précises du tutting sont difficiles à dater avec certitude, mais il émerge dans la scène hip-hop américaine des années 1980. Il est souvent associé au milieu du popping et du funk styles de la côte Ouest américaine, mais aussi à la scène new-yorkaise.\n\nLe style s'est popularisé via les compétitions de danse, les vidéos internet et l'émission américaine America's Best Dance Crew dans les années 2000-2010. Des danseurs comme Marquese Scott (connu sous le nom de « Nonstop ») contribuent à sa diffusion mondiale grâce à des vidéos virales.",
    timeline: [
      { year: "Années 1980", event: "Émergence du tutting dans la scène hip-hop américaine" },
      { year: "Années 1990–2000", event: "Développement et codification du style, notamment sur la côte Ouest" },
      { year: "2000s", event: "Popularisation via internet et les battles internationaux" },
      { year: "2010s", event: "Le finger tutting devient viral grâce aux réseaux sociaux et à des créateurs comme Marquese Scott" },
    ],
    characteristics: {
      movements:
        "Le tutting repose sur la création de formes géométriques (90°, 45°) avec les bras, les mains et les doigts. Les transitions entre positions doivent être précises et fluides. Le timing sur la musique est essentiel.",
      musicRelationship:
        "Le tutting se pratique sur des musiques électroniques, hip-hop, ou tout genre avec un temps marqué. La précision du timing sur les temps et les accents est fondamentale.",
      improvisation:
        "Le tutting peut être improvisé (notamment en cypher) ou chorégraphié pour la scène ou les vidéos.",
      formats: ["Cypher", "Battle", "Vidéo / réseaux sociaux", "Scène", "Performance synchronisée en groupe"],
    },
    music: {
      genres: ["Hip-hop", "Electronic", "Dubstep", "Trap"],
      description:
        "Le tutting se pratique sur des musiques au temps marqué qui permettent d'aligner précisément chaque mouvement sur un temps ou un contretemps.",
    },
    keyFigures: [
      {
        category: "Figures contemporaines",
        figures: [
          { name: "Marquese Scott (Nonstop)", role: "Danseur américain dont les vidéos de finger tutting et waving ont été vues des millions de fois" },
        ],
      },
    ],
    franceHistory:
      "Le tutting arrive en France dans les années 2000 via les compétitions et les échanges de la scène hip-hop internationale. Il est souvent pratiqué en combinaison avec d'autres styles urbains. Plusieurs danseurs français ont développé une expertise dans ce domaine.",
    relatedStyles: ["electro", "break", "hip-hop-freestyle"],
    commonConfusions: [
      {
        styles: "Tutting et popping",
        explanation:
          "Le tutting et le popping sont souvent pratiqués ensemble, mais ce sont deux styles distincts. Le popping est centré sur les contractions musculaires brusques (pops), tandis que le tutting est centré sur la géométrie des formes créées par les membres.",
      },
    ],
    resources: [],
    episodeLinks: [],
    keywords: ["tutting", "finger tutting", "arm tutting", "géométrie", "hip-hop", "Toutankhamon", "angles", "90 degrés"],
    seoTitle: "Tutting — Histoire et technique | Explorer les styles | Dance Lab",
    seoDescription:
      "Découvrez le tutting : origines dans la scène hip-hop, finger tutting, arm tutting, géométrie des mouvements et développement en France.",
  },

  // ── ÉLECTRO ──────────────────────────────────────────────────────────────
  {
    slug: "electro",
    name: "Électro",
    aliases: ["Tecktonik", "Electrodance", "Milky Way"],
    family: "Danses de club",
    era: "Années 2000",
    originCountry: "France",
    originCity: "Île-de-France (club Metropolis)",
    summary:
      "L'électro — aussi appelée tecktonik dans sa forme la plus codifiée — est une danse de club née en France à la fin des années 1990 et popularisée dans les années 2000. Elle se caractérise par des mouvements rapides des bras, des mains et des doigts sur des musiques électroniques, combinés à des déplacements dynamiques.",
    introduction:
      "L'électro est l'un des rares styles de danse nés en France qui ait connu une diffusion internationale. Elle émerge dans les clubs de la région parisienne à la fin des années 1990, notamment au club Metropolis à Nanterre, sur des musiques techno, hardstyle et électroniques.\n\nLe terme « tecktonik » est déposé comme marque en 2000 par Cyril Blanc et Alexandre Barouzdin, fondateurs du label du même nom, qui organisent des soirées et des battles. La danse se caractérise par des mouvements de bras rapides et angulaires, des déplacements au sol énergiques et une esthétique très distincte (cheveux en pointe, vêtements colorés, maquillage).\n\nEntre 2007 et 2010, la tecktonik connaît un phénomène de mode massif en France, suscitant à la fois un engouement populaire et des critiques de la part de certains danseurs urbains qui y voient une dérive commerciale. Depuis, le style a évolué sous le nom d'électrodance ou milky way, libéré de la marque commerciale.",
    origins:
      "L'électro naît dans les clubs de la banlieue parisienne à la fin des années 1990. Le club Metropolis à Nanterre joue un rôle central : c'est là que se retrouvent les danseurs qui développent ce style particulier, inspiré par la musique techno et hardstyle, le trance et l'eurodance.\n\nCyril Blanc et Alexandre Barouzdin repèrent ce phénomène et l'organisent sous la marque « tecktonik », créant des soirées battles et des vidéos qui circulent sur Dailymotion et YouTube. L'affaire prend une ampleur inattendue : la tecktonik devient un phénomène générationnel, critiqué par certains pour sa dimension commerciale, adopté par des millions de jeunes.",
    timeline: [
      { year: "Fin 1990s", event: "Émergence de l'électrodance dans les clubs de la région parisienne" },
      { year: "2000", event: "Dépôt de la marque « tecktonik » par Cyril Blanc et Alexandre Barouzdin" },
      { year: "2006–2007", event: "Premières vidéos virales sur Dailymotion ; le phénomène dépasse les clubs" },
      { year: "2007–2010", event: "Phénomène de mode massif en France : médias, publicités, cours en académies" },
      { year: "2010s", event: "Déclin de la mode, mais persistance du style sous l'appellation électrodance ou milky way" },
    ],
    characteristics: {
      movements:
        "L'électro se caractérise par des mouvements de bras rapides et angulaires (influencés par le tutting), des mouvements des mains et des doigts, des déplacements dynamiques et des mouvements de jambes caractéristiques. La vitesse d'exécution et la précision sur les temps musicaux sont essentielles.",
      musicRelationship:
        "L'électro est directement lié aux musiques électroniques rapides : hardstyle, techno, trance, eurodance. La danse est construite sur les beats caractéristiques de ces genres.",
      improvisation:
        "L'improvisation est centrale dans la pratique en club ou en cypher. Les battles sont improvisés.",
      formats: ["Club", "Battle", "Cypher", "Vidéo / réseaux sociaux"],
      visualCodes:
        "L'esthétique tecktonik des années 2000 était très codifiée : cheveux en crête, maquillage, vêtements colorés skinny. Cette esthétique s'est depuis diversifiée.",
    },
    music: {
      genres: ["Hardstyle", "Techno", "Trance", "Eurodance", "Electronic"],
      description:
        "L'électro se pratique sur des musiques électroniques rapides avec un BPM élevé. Des DJs comme Joachim Garraud ou des artistes comme Yelle sont associés à l'époque tecktonik.",
    },
    keyFigures: [
      {
        category: "Figures fondatrices",
        figures: [
          { name: "Cyril Blanc & Alexandre Barouzdin", role: "Créateurs de la marque Tecktonik et organisateurs des premières soirées battles" },
        ],
      },
    ],
    franceHistory:
      "L'électro est l'un des rares styles de danse dont la France est le pays d'origine. Le phénomène tecktonik de 2007-2010 a marqué une génération entière et a fait entrer les danses de club dans le débat culturel français. Après le déclin de la mode, des danseurs ont continué à développer le style de façon plus artistique sous le nom d'électrodance ou milky way.",
    relatedStyles: ["tutting", "break", "hip-hop-freestyle"],
    resources: [],
    episodeLinks: [],
    keywords: ["tecktonik", "électrodance", "milky way", "Metropolis", "hardstyle", "clubs", "France", "banlieue parisienne"],
    seoTitle: "Électro / Tecktonik — Histoire et origines | Explorer les styles | Dance Lab",
    seoDescription:
      "Découvrez l'histoire de l'électro et de la tecktonik : naissance dans les clubs parisiens, phénomène de mode 2007-2010, développement et évolutions.",
  },

  // ── POPPING ───────────────────────────────────────────────────────────────
  {
    slug: "popping",
    name: "Popping",
    aliases: ["Funk styles", "Electric Boogaloo"],
    family: "Danses urbaines",
    era: "Années 1970",
    originCountry: "États-Unis",
    originCity: "Fresno, Californie",
    summary:
      "Le popping naît à Fresno, en Californie, à la fin des années 1960, sous l'impulsion de Sam Solomon (Boogaloo Sam) et du crew Electric Boogaloos. Il se caractérise par des contractions musculaires brusques et rythmées (les « pops ») qui traversent le corps, créant une illusion de mouvement mécanique ou robotique. Le popping est l'un des piliers des funk styles et de la culture hip-hop.",
    introduction:
      "Le popping est l'un des styles fondateurs de ce que l'on appelle les « funk styles » ou « West Coast funk styles » — un ensemble de danses nées en Californie dans les années 1970, distinctes du hip-hop new-yorkais bien qu'intégrées par la suite dans l'écosystème urbain global.\n\nLe style est fondé sur la technique du « pop » : une contraction brusque et rythmée des muscles (biceps, triceps, abdominaux, cuisses, bras) qui crée une vibration visible dans tout le corps. Ces pops peuvent être exécutés sur chaque temps musical, en continu, en isolation ou en combinaison avec d'autres techniques.\n\nLe popping est souvent pratiqué avec des animations — illusions de mouvement qui donnent l'impression que le corps est robotique, magnétisé ou sans gravité : le waving (ondulations traversant le corps), le tutting (angles géométriques), le gliding (glissements au sol), le boogaloo (ondulations des hanches et du bassin). Chaque danseur développe son propre vocabulaire à partir de ces fondamentaux.",
    origins:
      "Sam Solomon, connu sous le nom de Boogaloo Sam, développe le popping à Fresno, en Californie, à la fin des années 1960 et au début des années 1970. Influencé par les danses funky qu'il observe autour de lui et par l'imagination de mouvements robotiques et d'animations télévisuelles, il crée un langage gestuel original qu'il partage avec son frère Popin' Pete et leurs amis.\n\nEn 1977, Sam et Popin' Pete fondent les Electric Boogaloos, un crew qui va devenir l'une des références mondiales du popping. Le style se diffuse rapidement en Californie, notamment à Los Angeles et Oakland. En 1973-74, Rerun (Fred Berry), acteur de la série télévisée What's Happening!!, contribue à le populariser.\n\nL'émission télévisée Soul Train — diffusée de 1971 à 2006 — joue un rôle essentiel dans la diffusion du popping au niveau national. Des danseurs comme Popin' Pete y apparaissent régulièrement. À partir des années 1980, les films de danse (Breakin', 1984) et les clips musicaux projettent le popping à l'international.",
    timeline: [
      { year: "Fin 1960s–1970", event: "Boogaloo Sam développe le popping à Fresno, Californie" },
      { year: "1977", event: "Fondation des Electric Boogaloos par Boogaloo Sam et Popin' Pete" },
      { year: "Années 1970–80", event: "Diffusion via Soul Train et la scène des clubs californiens" },
      { year: "1984", event: "Breakin' et Breakin' 2 popularisent le popping à l'international" },
      { year: "Années 1990–2000", event: "Le popping intègre les compétitions Juste Debout et la scène internationale" },
      { year: "2010s", event: "Expansion via YouTube, les battles en ligne et la diffusion mondiale" },
    ],
    characteristics: {
      movements:
        "Le popping repose sur le « pop » : une contraction musculaire brusque visible dans tout le corps. Les techniques associées incluent le waving (ondulations du corps), le tutting (géométrie des bras), le gliding (glissement des pieds), l'animation (illusions de marionnette ou de robot), le boogaloo (ondulations des hanches), et l'isolation (déplacement indépendant de parties du corps).",
      musicRelationship:
        "Le popping est fondamentalement lié au funk et au soul des années 1970. La connexion musicale est précise : les pops sont placés sur les temps forts, les contretemps ou les accents de la musique. La musicalité est un critère d'excellence dans les battles.",
      improvisation:
        "L'improvisation est centrale dans le cypher et les battles. Chaque danseur construit son set en réponse à la musique et à l'énergie du moment, développant son propre style (son « flavor »).",
      formats: ["Cypher", "Battle (1v1, crew)", "Jam", "Scène", "Clip", "Compétition (Juste Debout, etc.)"],
      visualCodes:
        "Les tenues varient selon les époques et les sous-styles. L'ère Electric Boogaloos est associée à des tenues colorées et des lunettes de soleil. Aujourd'hui les codes vestimentaires sont diversifiés.",
    },
    music: {
      genres: ["Funk", "Soul", "R&B", "Electronic funk", "Hip-hop"],
      description:
        "Le popping est né sur le funk des années 1970 : James Brown, Parliament-Funkadelic, Zapp & Roger. Il s'adapte ensuite à l'electro, au hip-hop et à la musique électronique sans jamais perdre sa connexion aux racines funk.",
      keyArtists: ["James Brown", "Parliament-Funkadelic", "Zapp & Roger", "Cameo", "Roger Troutman"],
    },
    keyFigures: [
      {
        category: "Fondateurs",
        figures: [
          { name: "Boogaloo Sam (Sam Solomon)", role: "Créateur du popping, fondateur des Electric Boogaloos" },
          { name: "Popin' Pete (Timothy Solomon)", role: "Co-fondateur des Electric Boogaloos, frère de Boogaloo Sam" },
          { name: "Electric Boogaloos", role: "Crew fondateur, référence mondiale du popping depuis les années 1970" },
        ],
      },
      {
        category: "Diffusion internationale",
        figures: [
          { name: "Skeeter Rabbit", role: "Membre des Electric Boogaloos, figure internationale de la pédagogie du popping" },
          { name: "Mr. Wiggles", role: "Danseur new-yorkais, contribue à la fusion des styles à l'international" },
        ],
      },
      {
        category: "Scène française",
        figures: [
          { name: "Salah Benlemqawanssa", role: "Danseur et chorégraphe français, figure du popping et de la scène funk française" },
        ],
      },
    ],
    franceHistory:
      "Le popping arrive en France à la fin des années 1980, via les films américains et les échanges avec la scène internationale. Paris et Lyon développent rapidement des communautés de pratique. La France est aujourd'hui l'un des pays où le popping est le plus pratiqué, notamment grâce aux compétitions internationales comme Juste Debout (Paris) qui contribuent à structurer la scène mondiale.",
    relatedStyles: ["break", "locking", "hip-hop-freestyle", "tutting"],
    commonConfusions: [
      {
        styles: "Popping et locking",
        explanation:
          "Ces deux styles sont souvent confondus car ils appartiennent tous deux aux « funk styles » californiens des années 1970. Le popping repose sur les contractions musculaires (pops) et les animations. Le locking est fondé sur des mouvements rythmés et saccadés suivis de poses ou de « locks » (blocages). Les deux ont des fondateurs, des crews et des techniques distincts.",
      },
    ],
    resources: [
      {
        title: "Electric Boogaloos — Site officiel",
        author: "Electric Boogaloos",
        year: "En ligne",
        format: "Site web",
        description: "Ressources, histoire et vidéos du crew fondateur du popping.",
        url: "https://www.electricboogaloos.com/",
      },
    ],
    episodeLinks: [],
    autoMatchTerms: ["popping", "popper", "boogaloo", "funk style"],
    keywords: ["popping", "funk styles", "Electric Boogaloos", "Boogaloo Sam", "waving", "animation", "gliding", "Fresno", "Californie"],
    seoTitle: "Popping — Histoire, origines et Electric Boogaloos | Explorer les styles | Dance Lab",
    seoDescription:
      "Découvrez le popping : origines à Fresno avec Boogaloo Sam, techniques (waving, gliding, animation), Electric Boogaloos et développement en France.",
  },

  // ── LOCKING ───────────────────────────────────────────────────────────────
  {
    slug: "locking",
    name: "Locking",
    aliases: ["Campbellocking", "Funk locking"],
    family: "Danses urbaines",
    era: "Années 1970",
    originCountry: "États-Unis",
    originCity: "Los Angeles, Californie",
    summary:
      "Le locking est né à Los Angeles au début des années 1970, inventé par Don Campbell. Il se caractérise par des mouvements rythmés et énergiques des bras et des mains, entrecoupés de pauses brusques (les « locks »), d'une forte connexion au groove musical et d'une dimension joyeuse et théâtrale. Il est l'un des styles fondateurs des funk styles et de la culture hip-hop.",
    introduction:
      "Le locking est né d'un accident heureux. Don Campbell, danseur amateur de Los Angeles, n'arrivait pas à se souvenir d'une chorégraphie et se « bloquait » sur des mouvements qu'il ne savait pas enchaîner. Cette hésitation involontaire — ce gel du corps en plein mouvement — se transforme en signature esthétique, que ses amis commencent à imiter et à amplifier.\n\nLe locking se caractérise par des sequences de mouvements énergiques des bras, du torse et des jambes, suivies de pauses brusques — les « locks » — durant lesquelles le corps se fige momentanément avant de repartir. L'énergie est high-voltage, les expressions du visage (grimaces, sourires, regards complices avec le public) font partie intégrante du style.\n\nDon Campbell et ses amis forment les Campbellock Dancers, qui deviennent The Lockers, et se produisent à la télévision américaine dans les années 1970, notamment sur Soul Train et sur des émissions de variétés comme The Tonight Show. Le locking devient ainsi l'un des premiers styles de danse urbaine à avoir une visibilité télévisée nationale.",
    origins:
      "Don Campbell développe le locking à Los Angeles vers 1969-1971. Inspiré par le funk, le soul et la musique de James Brown, il crée un style basé sur des séquences de mouvements rapides (les « locks ») et des gestes expressifs des mains (les « points » et le « giving dap »).\n\nIl est rapidement rejoint par d'autres danseurs qui enrichissent le style : Toni Basil (qui contribuera aussi à le produire et à le diffuser), Fred Berry (Rerun), Leo Williamson, Alpha Anderson, Adolfo Quiñones (Shabba-Doo) et d'autres. Ensemble, ils forment The Lockers, le crew fondateur du locking, qui se produit professionnellement à la télévision et sur scène dès le début des années 1970.\n\nLe locking est ainsi l'un des rares styles de danse urbaine à avoir eu une carrière professionnelle institutionnalisée dès son émergence, bien avant la démocratisation du hip-hop.",
    timeline: [
      { year: "1969–1971", event: "Don Campbell invente le locking à Los Angeles" },
      { year: "1971–1973", event: "Formation des Campbellock Dancers, puis The Lockers" },
      { year: "Années 1970", event: "The Lockers se produisent sur Soul Train, The Tonight Show et en tournée" },
      { year: "1984", event: "Diffusion internationale via les films Breakin' et Beat Street" },
      { year: "Années 1990–2000", event: "Renouveau international, notamment via les compétitions Juste Debout" },
    ],
    characteristics: {
      movements:
        "Le locking repose sur des séquences de mouvements rapides (bras, poignets, doigts) suivies de locks (arrêts brusques). Les mouvements fondamentaux incluent le lock (gel du corps), le point (désigner du doigt), le giving dap (poignée de main stylisée), le wrist roll (roulement de poignet), le scooby doo (pas latéral), le robot et différentes « funky walks ». L'expression du visage et le contact visuel avec le public sont essentiels.",
      musicRelationship:
        "Le locking est intimement lié au funk et au soul des années 1970. Les pops et les locks sont placés précisément sur les temps forts de la musique. La joie et l'énergie communicative du funk définissent l'atmosphère du locking.",
      improvisation:
        "L'improvisation est centrale : dans le cypher ou le battle, le locking est une conversation joyeuse entre le danseur, la musique et le public. L'humour et le charisme font partie du style.",
      formats: ["Cypher", "Battle (1v1)", "Scène professionnelle", "Clip", "Jam", "Compétition"],
      visualCodes:
        "Les codes vestimentaires des Lockers des années 1970 — knicker pants, rayures, chapeaux, grosses chaussettes — sont devenus iconiques et restent une référence pour certains praticiens, même si les styles contemporains sont variés.",
    },
    music: {
      genres: ["Funk", "Soul", "Groove", "R&B"],
      description:
        "James Brown, Sly & the Family Stone, Kool & the Gang, Parliament-Funkadelic : le locking est né sur cette génération de funk américain. L'énergie festive et communautaire de cette musique est constitutive du style.",
      keyArtists: ["James Brown", "Sly & the Family Stone", "Kool & the Gang", "Parliament-Funkadelic"],
    },
    keyFigures: [
      {
        category: "Fondateurs",
        figures: [
          { name: "Don Campbell", role: "Inventeur du locking, fondateur des Campbellock Dancers et de The Lockers" },
          { name: "Toni Basil", role: "Danseuse, chorégraphe et productrice, membre fondatrice de The Lockers" },
          { name: "Fred Berry (Rerun)", role: "Danseur et acteur, figure médiatique du locking dans les années 1970" },
          { name: "Shabba-Doo (Adolfo Quiñones)", role: "Membre de The Lockers, acteur dans Breakin'" },
        ],
      },
      {
        category: "Scène française",
        figures: [
          { name: "Mounir Amhiln", role: "Danseur et pédagogue, figure du locking en France", note: "Invité de Dance Lab (épisode 106)" },
        ],
      },
    ],
    franceHistory:
      "Le locking arrive en France à la fin des années 1980, notamment via les films américains et les premières compétitions. Paris, Lyon et Marseille développent des scènes actives. La France est l'un des pays où le locking est le mieux représenté en dehors des États-Unis, avec des danseurs reconnus internationalement et une scène battle structurée.",
    relatedStyles: ["popping", "break", "hip-hop-freestyle", "waacking"],
    commonConfusions: [
      {
        styles: "Locking et popping",
        explanation:
          "Locking et popping sont souvent regroupés sous l'étiquette « funk styles » mais ce sont deux pratiques distinctes. Le locking est fondé sur des sequences rythmées avec des locks (arrêts) et une énergie joyeuse et théâtrale. Le popping repose sur des contractions musculaires (pops) et des animations. Leurs origines, leurs crews fondateurs et leurs vocabulaires sont différents.",
      },
    ],
    resources: [],
    episodeLinks: [
      {
        slug: "106-mounir-amhiln",
        relevance:
          "Mounir Amhiln est un danseur et pédagogue issu des styles funk, dont le locking. L'épisode explore comment les arts plastiques et les autres disciplines nourrissent la danse urbaine.",
      },
    ],
    autoMatchTerms: ["locking", "locker", "campbellocking"],
    keywords: ["locking", "The Lockers", "Don Campbell", "funk styles", "lock", "point", "soul", "Los Angeles", "Soul Train"],
    seoTitle: "Locking — Histoire, Don Campbell et The Lockers | Explorer les styles | Dance Lab",
    seoDescription:
      "Découvrez le locking : invention par Don Campbell à Los Angeles, The Lockers, techniques (lock, point, wrist roll) et développement en France.",
  },

  // ── HIP-HOP FREESTYLE ─────────────────────────────────────────────────────
  {
    slug: "hip-hop-freestyle",
    name: "Hip-hop freestyle",
    aliases: ["New style", "Hip-hop new school"],
    family: "Danses urbaines",
    era: "Années 1990–2000",
    originCountry: "États-Unis / International",
    originCity: "New York, Los Angeles, puis diffusion mondiale",
    summary:
      "Le terme « hip-hop freestyle » désigne une catégorie large de danses urbaines debout, inspirées des clips musicaux, des battles et de l'improvisation, distinctes du break (qui a son propre vocabulaire codifié). Ce n'est pas un style unique mais un espace de pratique hybride qui fusionne des influences multiples : new style, brooklyn style, swag, et de nombreux sous-styles régionaux.",
    introduction:
      "Le hip-hop freestyle est souvent le premier contact des pratiquant·es avec la danse urbaine : une danse debout, musicale, improvisée, qui n'exige pas la maîtrise d'un vocabulaire codifié aussi strict que le break, le popping ou le locking.\n\nIl faut être clair sur ce que ce terme recouvre — et ne recouvre pas. Il ne désigne pas un style unique avec un fondateur identifié et un vocabulaire précis. C'est plutôt une étiquette de pratique qui regroupe plusieurs approches : le « new style » (inspiré des clips des années 1990, fortement influencé par Janet Jackson et ses chorégraphes comme Fatima Robinson), le « Brooklyn style » (plus ancré dans la rue, le bounce, le swagger), et de nombreux styles régionaux américains (ATL, Baltimore Club, Jerking, Crip Walk, etc.).\n\nEn France, le terme est très souvent utilisé dans les écoles de danse pour désigner une pratique à mi-chemin entre cours de danse urbaine et interprétation musicale. Il faut distinguer cette acception pédagogique du freestyle tel que pratiqué dans les battles, où il désigne la capacité à improviser sur n'importe quelle musique.",
    origins:
      "Les danses hip-hop debout se développent à New York et Los Angeles dès les années 1980, parallèlement au break. Elles sont fortement influencées par les clips musicaux, en particulier ceux de Michael Jackson (Thriller, 1982 ; Bad, 1987) et des premières stars du R&B et du hip-hop.\n\nDans les années 1990, les clips de Janet Jackson, TLC, Missy Elliott et des artistes hip-hop codifient un certain vocabulaire de gestuelles debout — isolations du torse, passes de bras, freezes debout, pas stylisés — qui devient la référence du « hip-hop freestyle » scénique.\n\nSimultanément, les compétitions de dance crews (Battle of the Year, Juste Debout) et les émissions télévisées (Star Search aux États-Unis, Sacrée Soirée en France) contribuent à diffuser ces styles.",
    timeline: [
      { year: "Années 1980", event: "Développement des danses hip-hop debout en parallèle du break" },
      { year: "1982–1987", event: "Michael Jackson définit des référentiels gestuels qui influencent des générations" },
      { year: "Années 1990", event: "Les clips de Janet Jackson, TLC, Missy Elliott codifient le new style" },
      { year: "2000s", event: "Explosion des battle crews en France ; le hip-hop freestyle entre dans les écoles de danse" },
      { year: "2010s–présent", event: "Hybridation avec d'autres styles ; émergence de figures virales sur les réseaux sociaux" },
    ],
    characteristics: {
      movements:
        "Le hip-hop freestyle se caractérise par des mouvements debout : isolations (tête, épaules, poitrine, hanches), passes de bras, pas rythmés, freezes debout, et une grande variété de gestes inspirés des clips et de la rue. La musicité et le swag (attitude, présence) sont essentiels.",
      musicRelationship:
        "La connexion musicale est fondamentale : le hip-hop freestyle est une interprétation corporelle de la musique. Les accents, les drops, les changements de tempo sont traduits dans les mouvements.",
      improvisation:
        "L'improvisation est centrale dans le cypher et le battle. En contexte de cours ou de chorégraphie, le style peut être plus ou moins écrit.",
      formats: ["Cypher", "Battle (crew, équipe)", "Cours académique", "Clip", "Compétition", "Scène"],
    },
    music: {
      genres: ["Hip-hop", "R&B", "Rap", "Pop urban", "Trap"],
      description:
        "Le hip-hop freestyle est lié aux musiques populaires noires américaines depuis les années 1980. Rap, R&B, hip-hop old school, new school et trap sont ses terrains de jeu naturels.",
      keyArtists: ["Michael Jackson", "Janet Jackson", "Missy Elliott", "Beyoncé", "TLC"],
    },
    keyFigures: [
      {
        category: "Chorégraphes et figures influentes",
        figures: [
          { name: "Fatima Robinson", role: "Chorégraphe américaine, figure du new style via ses travaux avec Janet Jackson, Will Smith et de nombreux clips" },
          { name: "Laurieann Gibson", role: "Chorégraphe, figure du hip-hop freestyle scénique et télévisuel" },
          { name: "Hi-Hat (Cédric Doumbé)", role: "Note : différent du champion MMA, ce prénom est porté par des danseurs hip-hop français — le terme désigne souvent la précision sur les contretemps (hi-hat) musicaux" },
        ],
      },
    ],
    franceHistory:
      "Le hip-hop freestyle est aujourd'hui la discipline urbaine la plus enseignée en France dans les académies et les associations culturelles. Le développement de la scène hip-hop française à partir des années 1990 — avec des émissions comme H.I.P. H.O.P. et des festivals comme Danse Élargie — a contribué à structurer une scène de battle très active et reconnue internationalement.",
    relatedStyles: ["break", "popping", "locking", "krump"],
    commonConfusions: [
      {
        styles: "Hip-hop freestyle et break",
        explanation:
          "Le break (breaking) est un style précis avec son vocabulaire codifié (toprock, footwork, power moves, freezes). Le hip-hop freestyle désigne les danses urbaines debout, moins codifiées. Les deux appartiennent à l'écosystème hip-hop mais ne partagent pas les mêmes fondamentaux.",
      },
    ],
    resources: [],
    episodeLinks: [],
    autoMatchTerms: ["hip-hop", "new style", "freestyle hip hop", "danse urbaine"],
    keywords: ["hip-hop freestyle", "new style", "battle", "cypher", "urbain", "clip", "swag", "improvisation"],
    seoTitle: "Hip-hop freestyle — Pratique et culture | Explorer les styles | Dance Lab",
    seoDescription:
      "Découvrez le hip-hop freestyle : new style, battles, improvisation, différences avec le break et les autres styles urbains.",
  },

  // ── HOUSE DANCE ───────────────────────────────────────────────────────────
  {
    slug: "house-dance",
    name: "House dance",
    family: "Danses de club",
    era: "Années 1980",
    originCountry: "États-Unis",
    originCity: "Chicago et New York",
    summary:
      "La house dance naît dans les clubs de Chicago et de New York dans les années 1980, sur la musique house. Elle se caractérise par un rapport particulier au sol (footwork de house), des qualités de mouvement fluides et percussives, une forte connexion à la musique et une énergie de célébration communautaire.",
    introduction:
      "La house dance est indissociable de la musique house et des clubs qui l'ont vue naître : le Warehouse à Chicago (d'où vient le nom « house ») et le Paradise Garage à New York dans les années 1980. Ces clubs, fréquentés principalement par des communautés noires, latinos et LGBTQ+, sont des espaces de liberté et de célébration dans l'Amérique réactionnaire des années Reagan.\n\nLa house dance se distingue des autres danses de club par son rapport complexe au sol et à la gravité : le travail des pieds (« footwork ») est particulièrement élaboré, avec des pas rapides, croisés et glissés, hérités du jazz, du gospel et des danses africaines-américaines vernaculaires. Au-dessus du sol, le corps est fluide, habité par la musique, avec des moments de percussion et de syncopation.\n\nTrois grands éléments structurent la house dance : le footwork (travail des pieds), le lofting (danser dans l'espace avec sauts et élévations) et le jacking (mouvement du torse et du bassin sur le beat).",
    origins:
      "La house music naît à Chicago au début des années 1980 avec des DJs comme Frankie Knuckles et Larry Heard, qui développent une musique électronique influencée par le disco, le soul et le gospel. Le Warehouse, club de Chicago où Frankie Knuckles est résident, donne son nom au genre.\n\nDans ce contexte, des danseurs des communautés noires et latinos de Chicago et New York — notamment au Paradise Garage (Larry Levan) à New York — développent une façon de bouger adaptée à cette musique : rapide, fluide, percussive, avec un travail de pieds complexe et une connexion spirituelle à la musique.\n\nDes figures comme Archie Burnett, Marjory Smarth et Jason Samuels Smith sont associées au développement de la house dance comme style pratiqué en dehors des clubs, dans des cyphers et des battles.",
    timeline: [
      { year: "1977–1982", event: "Naissance de la house music à Chicago (Warehouse, Frankie Knuckles)" },
      { year: "Années 1980", event: "Développement de la house dance dans les clubs de Chicago et New York" },
      { year: "1987", event: "Le Paradise Garage de New York ferme — fin d'une ère fondatrice" },
      { year: "Années 1990", event: "Diffusion de la house music et de la house dance en Europe" },
      { year: "2000s", event: "La house dance entre dans les compétitions de danse internationale" },
      { year: "2010s", event: "Développement de la scène mondiale, battles dédiés, documentation vidéo" },
    ],
    characteristics: {
      movements:
        "La house dance repose sur trois piliers : le footwork (travail rapide et complexe des pieds, hérité du jazz), le lofting (danser dans l'espace, sauts, élévations) et le jacking (mouvement du torse et du bassin qui répondent au beat). Le style peut être très fluide, très percussif ou combiner les deux.",
      musicRelationship:
        "La connexion à la musique house est constitutive du style. La house, avec son 4/4 régulier, ses basslines profondes et ses éléments gospel et soul, génère une énergie collective et quasi spirituelle que la dance incarne.",
      improvisation:
        "L'improvisation est centrale dans le cypher. La house dance est une conversation en temps réel avec la musique et les autres danseurs.",
      formats: ["Club", "Cypher", "Battle", "Jam", "Scène"],
      visualCodes:
        "Pas de codes vestimentaires formels. L'esthétique varie selon les contextes : de la tenue de club à la tenue de pratique décontractée.",
    },
    music: {
      genres: ["House", "Deep house", "Afro house", "Gospel house", "Soulful house"],
      description:
        "La house music est le territoire sonore de la house dance : ses 4/4 réguliers, ses lignes de basse épaisses, ses éléments de gospel et de soul et son énergie collective sont la matière même de la danse.",
      keyArtists: ["Frankie Knuckles", "Larry Heard", "Larry Levan", "Marshall Jefferson", "Ten City"],
    },
    keyFigures: [
      {
        category: "Pionniers",
        figures: [
          { name: "Archie Burnett", role: "Figure majeure de la house dance new-yorkaise, danseur et pédagogue de renommée mondiale" },
          { name: "Marjory Smarth", role: "Danseuse et pédagogue, figure fondatrice de la house dance" },
          { name: "Brian Green", role: "Danseur et pédagogue, figure du développement de la house dance" },
        ],
      },
      {
        category: "Scène française",
        figures: [
          { name: "Tierney Otis (Ti)", role: "Danseuse et pédagogue, figure de la house dance en France" },
        ],
      },
    ],
    franceHistory:
      "La house dance arrive en France dans les années 1990 avec la diffusion de la musique house en Europe. Paris développe une scène active avec des danseurs qui voyagent pour se former aux États-Unis et reviennent transmettre. Des battles et des jams dédiés à la house se développent progressivement.",
    relatedStyles: ["waacking", "voguing", "jazz"],
    commonConfusions: [
      {
        styles: "House dance et voguing",
        explanation:
          "Ces deux styles sont nés dans les mêmes espaces communautaires (clubs new-yorkais, communautés LGBTQ+) et partagent une histoire. Mais le voguing est lié à la culture ballroom et à ses cinq éléments codifiés, tandis que la house dance est une pratique de club plus ouverte, basée sur la musique house.",
      },
    ],
    resources: [
      {
        title: "The Last Angel of History",
        author: "John Akomfrah (réalisateur)",
        year: "1996",
        format: "Documentaire",
        description:
          "Documentaire sur les connexions entre la culture africaine-américaine, la technologie et la musique électronique, incluant la house.",
        url: "https://www.imdb.com/title/tt0116890/",
      },
    ],
    episodeLinks: [],
    autoMatchTerms: ["house dance", "house music", "footwork", "jacking"],
    keywords: ["house dance", "house music", "footwork", "jacking", "lofting", "Chicago", "New York", "Paradise Garage", "Frankie Knuckles"],
    seoTitle: "House dance — Histoire et origines | Explorer les styles | Dance Lab",
    seoDescription:
      "Découvrez la house dance : naissance dans les clubs de Chicago et New York, footwork, lofting, jacking et développement en France.",
  },

  // ── HEELS ────────────────────────────────────────────────────────────────
  {
    slug: "heels",
    name: "Heels",
    aliases: ["Danse en talons", "Sexy style"],
    family: "Danses scéniques",
    era: "Années 2000–2010",
    originCountry: "États-Unis / International",
    originCity: "Los Angeles, puis diffusion mondiale",
    summary:
      "Le heels est un style de danse pratiqué en chaussures à talons hauts. Né dans le milieu des clips musicaux et de la danse commerciale américaine, il s'est développé comme pratique à part entière dans les années 2000-2010, revendiquant une esthétique sexuée, une puissance physique et une exploration de la féminité dans toutes ses expressions — y compris pour les danseurs masculins et non-binaires.",
    introduction:
      "Le heels est une pratique de danse qui s'est émancipée du clip musical et de la scène commerciale pour devenir un style revendiqué, enseigné et pratiqué dans des espaces dédiés. Son nom dit tout : on danse en chaussures à talons hauts — stilettos, plateformes, ou talons blocs selon les styles.\n\nLe heels emprunte à plusieurs univers : la danse jazz, la danse contemporaine, le hip-hop, la culture drag, la danse commerciale. Il met en avant des qualités de mouvement spécifiques — ondulations du corps, portés de hanches, cambrés, attitudes — amplifiées par la contrainte et l'élégance du talon.\n\nLe heels n'est pas réservé à une identité de genre : des danseurs de tous genres le pratiquent, explorant leur rapport à la féminité, à la séduction, à la puissance et à la performance de soi. C'est l'une des dimensions les plus importantes du style : déplacer et questionner ce que la féminité dans la danse signifie.",
    origins:
      "Les danses en talons existent depuis longtemps dans le cabaret, le burlesque et la danse de music-hall. Mais le heels comme style identifié et pratiqué pour lui-même émerge dans les années 2000, notamment via le milieu des clips musicaux à Los Angeles.\n\nDes chorégraphes comme Brian Friedman, Laurieann Gibson et plus tard Yanis Marshall contribuent à son développement. La démocratisation des cours de heels dans les studios de danse de Los Angeles et New York dans les années 2010, puis leur diffusion via YouTube et les réseaux sociaux, en font un phénomène mondial.\n\nEn France, des artistes comme Julie Bagalciague contribuent à développer une approche du heels qui questionne le rapport à la féminité dans la danse et à ouvrir le style à une pratique inclusive.",
    timeline: [
      { year: "Années 2000", event: "Développement du heels dans la scène des clips et de la danse commerciale américaine" },
      { year: "2010s", event: "Émergence de studios et de cours dédiés au heels à Los Angeles et New York" },
      { year: "2015–présent", event: "Diffusion mondiale via YouTube, Instagram et les réseaux sociaux" },
      { year: "Années 2020", event: "Reconnaissance du heels comme pratique artistique à part entière dans les festivals et les scènes de danse" },
    ],
    characteristics: {
      movements:
        "Le heels valorise des qualités de mouvement amplifiées par le talon : ondulations (body rolls), portés de hanches, cambrés, porte-de-bras élaborés, attitudes. La précision des appuis et l'équilibre sur talon exigent une grande conscience du corps. Le rapport à la fluidité et à la puissance coexistent.",
      musicRelationship:
        "Le heels s'adapte à des musiques très variées : pop, R&B, trap, slowed-down. La connexion musicale est importante mais le style peut fonctionner sur un large répertoire.",
      improvisation:
        "Le heels peut être très chorégraphié (pour la scène, les clips) ou plus libre (cyphers, freestyle).",
      formats: ["Cours académique", "Clip", "Scène", "Battle", "Performance solo"],
      visualCodes:
        "Les chaussures à talons hauts sont constitutives du style. Les tenues varient selon les sous-styles et les chorégraphes, des tenues de scène élaborées aux vêtements de pratique.",
    },
    music: {
      genres: ["Pop", "R&B", "Trap", "Electronic", "Hip-hop"],
      description:
        "Le heels s'adapte à un large répertoire musical. Les musiques puissantes, les beats lents et les productions luxueuses sont souvent privilégiés.",
      keyArtists: ["Beyoncé", "Rihanna", "Lady Gaga", "Kylie Minogue"],
    },
    keyFigures: [
      {
        category: "Chorégraphes et figures",
        figures: [
          { name: "Yanis Marshall", role: "Danseur et chorégraphe français, figure internationale du heels" },
          { name: "Aliya Janell", role: "Chorégraphe américaine, figure influente du heels sur les réseaux sociaux" },
          { name: "Brian Friedman", role: "Chorégraphe américain, pionnier du heels dans le milieu commercial" },
        ],
      },
      {
        category: "Scène française",
        figures: [
          { name: "Julie Bagalciague", role: "Danseuse et pédagogue, figure du heels en France", note: "Invitée de Dance Lab (épisode 23)" },
        ],
      },
    ],
    franceHistory:
      "Le heels se développe en France dans les années 2010, d'abord via les studios de danse de Paris, puis dans d'autres grandes villes. Des artistes comme Yanis Marshall contribuent à internationaliser la pratique française. Des discussions autour du heels — sur le genre, la féminité, l'inclusion — enrichissent la scène et en font une pratique politiquement pertinente.",
    relatedStyles: ["jazz", "street-jazz", "hip-hop-freestyle"],
    commonConfusions: [
      {
        styles: "Heels et burlesque / pole dance",
        explanation:
          "Le heels est souvent associé à d'autres pratiques qui utilisent des chaussures à talons ou valorisent la féminité scénique. Mais le heels est un style de danse à part entière, distinct du burlesque (qui est un art du dépouillement et du spectacle) et de la pole dance (qui utilise une barre verticale). Ils peuvent se croiser mais restent des disciplines distinctes.",
      },
    ],
    resources: [],
    episodeLinks: [
      {
        slug: "23-julie-bagalciague",
        relevance:
          "Julie Bagalciague est une figure du heels en France. L'épisode explore comment le heels permet d'affirmer sa féminité, de traverser le regard des autres et de construire une pratique inclusive.",
      },
    ],
    autoMatchTerms: ["heels", "talons", "danse en talons", "sexy style"],
    keywords: ["heels", "talons", "féminité", "clips", "commercial", "Los Angeles", "Julie Bagalciague", "Yanis Marshall"],
    seoTitle: "Heels — Danse en talons : histoire et pratique | Explorer les styles | Dance Lab",
    seoDescription:
      "Découvrez le heels : origines, techniques, rapport à la féminité, figures clés et épisodes Dance Lab associés.",
  },

  // ── STREET JAZZ ──────────────────────────────────────────────────────────
  {
    slug: "street-jazz",
    name: "Street jazz",
    aliases: ["Street jazz funk", "Jazz hip-hop"],
    family: "Danses scéniques",
    era: "Années 1990–2000",
    originCountry: "International (France, États-Unis)",
    originCity: "Paris, Los Angeles",
    summary:
      "Le street jazz est une fusion entre les techniques de la danse jazz scénique et les influences des danses de rue (hip-hop, funk, soul). Il se caractérise par une énergie dynamique, une forte musicalité, des isolations précises et un mélange de fluidité jazz et d'attitudes hip-hop. C'est l'un des styles les plus enseignés en France.",
    introduction:
      "Le street jazz n'est pas né dans un seul lieu ou d'un seul créateur : c'est un style hybride qui émerge progressivement à partir des années 1990, dans les studios de danse et sur les scènes de clips et de comédie musicale, à la croisée du jazz technique et des danses urbaines.\n\nIl réunit les bases du jazz — syncope, isolation, expressivité musicale, technique des bras et des jambes — et l'énergie, les attitudes et certains vocabulaires des danses hip-hop et funk. Le résultat est un style à la fois accessible et exigeant : adapté à de nombreux publics, présent dans les cours amateurs comme dans les productions professionnelles.\n\nEn France, le street jazz est devenu l'une des disciplines les plus enseignées dans les académies et les associations culturelles. Des pédagogues français contribuent à définir ce style et à en transmettre les spécificités.",
    origins:
      "Les origines du street jazz sont multiples. D'un côté, le jazz scénique américain — dans la lignée de Jack Cole, Bob Fosse et Matt Mattox — qui intègre progressivement des influences funk et pop à partir des années 1980. De l'autre, les danses de rue et les clips musicaux, notamment les chorégraphies de Janet Jackson et de ses collaborateurs.\n\nEn France, des pédagogues et chorégraphes développent à partir des années 1990 une approche particulière du street jazz, adaptée aux contextes des écoles de danse françaises. Ce développement local donne au street jazz français une identité propre, parfois différente de ce qu'on appelle « jazz hip-hop » ou « urban jazz » aux États-Unis.",
    timeline: [
      { year: "Années 1980", event: "Les clips de Michael Jackson et de Janet Jackson définissent un vocabulaire hybride jazz/hip-hop" },
      { year: "Années 1990", event: "Développement du street jazz dans les studios américains et français" },
      { year: "2000s", event: "Le street jazz devient l'une des disciplines les plus enseignées en France" },
      { year: "2010s–présent", event: "Évolution continue, hybridation avec d'autres styles, développement du heels et du commercial" },
    ],
    characteristics: {
      movements:
        "Le street jazz se caractérise par des isolations précises (tête, épaules, poitrine, hanches), des passes de bras jazz, des dynamiques contrastées (doux/fort, lent/rapide), des attitudes hip-hop et une qualité de mouvement qui oscille entre fluidité et percussion.",
      musicRelationship:
        "La connexion musicale est centrale. Le street jazz interprète le phrasé musical, les accents et les silences. Les genres varient selon les chorégraphies.",
      improvisation:
        "Variable selon les contextes. Le street jazz peut être très chorégraphié ou laisser place à l'improvisation et au freestyle.",
      formats: ["Cours académique", "Scène", "Clip", "Compétition", "Battle"],
    },
    music: {
      genres: ["R&B", "Hip-hop", "Pop", "Jazz", "Soul", "Funk"],
      description:
        "Le street jazz s'adapte à un large répertoire, des classiques R&B et soul aux productions pop contemporaines.",
      keyArtists: ["Janet Jackson", "Beyoncé", "Bruno Mars", "Justin Timberlake"],
    },
    keyFigures: [
      {
        category: "Pédagogues et figures françaises",
        figures: [
          { name: "Delphine Lemaître", role: "Danseuse et pédagogue, figure du street jazz en France", note: "Invitée de Dance Lab (épisode 7)" },
        ],
      },
      {
        category: "Références américaines",
        figures: [
          { name: "Fatima Robinson", role: "Chorégraphe, influence majeure sur le style jazz/hip-hop des clips" },
          { name: "Brian Friedman", role: "Chorégraphe, figure du jazz commercial americain" },
        ],
      },
    ],
    franceHistory:
      "La France est l'un des pays où le street jazz est le plus développé. Des pédagogues français ont contribué à en définir les fondamentaux et à le transmettre dans un réseau très dense d'écoles de danse. Aujourd'hui, le street jazz est présent dans les programmes de nombreux conservatoires et académies.",
    relatedStyles: ["jazz", "heels", "hip-hop-freestyle", "contemporain"],
    resources: [],
    episodeLinks: [
      {
        slug: "7-delphine-lemaitre",
        relevance:
          "Delphine Lemaître est une figure du street jazz en France. L'épisode explore l'expression de soi, la pédagogie de la danse et l'identité du pratiquant.",
      },
    ],
    autoMatchTerms: ["street jazz", "jazz hip-hop", "jazz funk"],
    keywords: ["street jazz", "jazz hip-hop", "isolations", "R&B", "clips", "pédagogie", "France", "Delphine Lemaître"],
    seoTitle: "Street jazz — Histoire, technique et culture | Explorer les styles | Dance Lab",
    seoDescription:
      "Découvrez le street jazz : fusion entre jazz et hip-hop, isolations, musicalité, développement en France et épisodes Dance Lab.",
  },

  // ── AFRO DANCE ───────────────────────────────────────────────────────────
  {
    slug: "afro-dance",
    name: "Afro dance",
    aliases: ["Afrodance", "Afro", "Afrobeats dance", "Danse afro-contemporaine"],
    family: "Danses issues des cultures afro-descendantes",
    era: "XXe–XXIe siècle",
    originCountry: "Afrique subsaharienne / Diaspora",
    originCity: "Lagos (Nigeria), Accra (Ghana), et diaspora mondiale",
    summary:
      "L'afro dance est un terme qui désigne une famille large et diverse de danses inspirées des cultures d'Afrique subsaharienne et de leurs diasporas. Il regroupe des pratiques très différentes — de l'azonto ghanéen au coupé-décalé ivoirien, des danses afrobeats nigérianes aux mouvements issus du soukous congolais — unifiées par une connexion au sol, une dextérité des hanches et un dialogue avec les musiques afro-contemporaines.",
    introduction:
      "Il faut commencer par une nuance importante : l'afro dance n'est pas un style unique. C'est un terme-parapluie qui regroupe des danses extrêmement diverses, issues de contextes culturels, géographiques et historiques distincts. Les utiliser comme si elles formaient un bloc homogène serait réducteur.\n\nCe que ces danses partagent souvent : une connexion forte au sol et aux percussions, une grande dextérité des hanches et du bassin, une fluidité verticale du corps, et un dialogue intime avec les musiques afro-contemporaines — afrobeats, afropop, amapiano, kuduro, coupé-décalé.\n\nDans les espaces de danse français et européens, l'afro dance est souvent enseignée comme une discipline hybride, inspirée à la fois des danses traditionnelles africaines et des musiques populaires afro-contemporaines. Cette hybridation est vivante et créative, mais elle mérite d'être nommée pour ce qu'elle est : une synthèse, pas un reflet direct de pratiques ancestrales.",
    origins:
      "Les danses d'Afrique subsaharienne sont extrêmement nombreuses et diverses : chaque région, chaque peuple, chaque contexte cérémoniel a ses danses propres. Ces danses ont voyagé avec les diasporas, notamment à travers la traite transatlantique, et ont contribué à former des styles comme le jazz, la salsa, le reggae et le hip-hop.\n\nAu XXe siècle, l'indépendance des États africains s'accompagne de mouvements culturels qui valorisent et réinventent les danses locales. Des chorégraphes comme Germaine Acogny (Sénégal) développent des techniques qui articulent danses traditionnelles et danse contemporaine.\n\nDepuis les années 2010, l'explosion mondiale des musiques afrobeats (Nigeria, Ghana) et amapiano (Afrique du Sud) s'accompagne d'une visibilité sans précédent des danses qui y sont associées : shaku shaku, zanku, alté, gwara gwara. Des artistes comme Afrobeast, Kizomba et des créateurs de contenu sur TikTok contribuent à diffuser ces styles dans le monde entier.",
    timeline: [
      { year: "Précolonial", event: "Existence de danses rituelles, cérémonielles et sociales dans toute l'Afrique subsaharienne" },
      { year: "Années 1960–70", event: "Indépendances africaines et valorisation des cultures locales" },
      { year: "Années 1970–80", event: "Germaine Acogny développe la technique Acogny, articulant tradition et modernité" },
      { year: "Années 1990–2000", event: "Coupé-décalé (Côte d'Ivoire), ndombolo (Congo), azonto (Ghana) connaissent des succès internationaux" },
      { year: "2010s", event: "Explosion mondiale des afrobeats nigérians ; les danses associées (shaku shaku, zanku) deviennent virales" },
      { year: "2020s", event: "L'amapiano sud-africain popularise de nouveaux vocabulaires gestuels mondialement" },
    ],
    characteristics: {
      movements:
        "Les mouvements varient selon les styles et les régions. On retrouve souvent une connexion forte au sol, une fluidité des hanches et du bassin (parfois appelée « ondulations »), un travail de la colonne vertébrale, des bras expressifs et un rapport percussif au rythme.",
      musicRelationship:
        "La connexion à la musique est fondamentale. Chaque sous-style est lié à des genres musicaux spécifiques : afrobeats, amapiano, coupé-décalé, kizomba, kuduro. La danse est souvent une interprétation directe du rythme et des paroles.",
      improvisation:
        "L'improvisation est centrale dans les contextes festifs et sociaux. Les chorégraphies structurées coexistent avec des pratiques très libres.",
      formats: ["Fête", "Club", "Cours académique", "Scène", "Clip", "Réseaux sociaux"],
    },
    music: {
      genres: ["Afrobeats", "Afropop", "Amapiano", "Coupé-décalé", "Kizomba", "Kuduro", "Ndombolo"],
      description:
        "L'afro dance est liée à un territoire musical qui couvre toute l'Afrique subsaharienne et ses diasporas. Chaque sous-style correspond à un genre musical spécifique.",
      keyArtists: ["Wizkid", "Burna Boy", "Davido", "DJ Arafat", "DJ Tárico"],
    },
    keyFigures: [
      {
        category: "Figures fondatrices",
        figures: [
          { name: "Germaine Acogny", role: "Chorégraphe sénégalaise, pionnière d'une technique articulant danses africaines et danse contemporaine" },
        ],
      },
      {
        category: "Diffusion internationale",
        figures: [
          { name: "Mr. Eazi", role: "Artiste qui contribue à la diffusion mondiale des afrobeats et de leurs danses associées" },
          { name: "Afrobeast", role: "Collectif de danse qui contribue à structurer l'afro dance en France" },
        ],
      },
    ],
    franceHistory:
      "L'afro dance se développe en France en lien avec les diasporas africaines et leurs cultures. Paris compte une scène active, notamment via des cours proposés dans des associations culturelles et des studios. La France est l'un des pays européens où les musiques afrobeats et amapiano ont la plus grande audience, ce qui contribue à développer les pratiques de danse associées.",
    relatedStyles: ["dancehall", "hip-hop-freestyle"],
    commonConfusions: [
      {
        styles: "Afro dance et « danses africaines »",
        explanation:
          "Le terme « danses africaines » est extrêmement vaste et peut désigner des centaines de pratiques distinctes. L'afro dance telle qu'elle est enseignée dans les studios occidentaux est souvent une synthèse contemporaine, influencée par les musiques populaires actuelles. Il faut distinguer cette pratique hybride des danses traditionnelles spécifiques à des cultures particulières.",
      },
    ],
    resources: [
      {
        title: "École des Sables",
        author: "Germaine Acogny",
        year: "1998",
        format: "Site web",
        description: "École internationale de danses africaines contemporaines fondée par Germaine Acogny au Sénégal.",
        url: "https://www.ecole-des-sables.org/",
      },
    ],
    episodeLinks: [],
    autoMatchTerms: ["afro dance", "afrodance", "afrobeats", "amapiano", "coupé-décalé", "kizomba"],
    keywords: ["afro dance", "afrobeats", "amapiano", "Nigeria", "Ghana", "diaspora", "Germaine Acogny", "coupé-décalé"],
    seoTitle: "Afro dance — Histoire et diversité | Explorer les styles | Dance Lab",
    seoDescription:
      "Découvrez l'afro dance : origines, diversité des sous-styles (afrobeats, amapiano, coupé-décalé), figures clés et développement en France.",
  },

  // ── DANCEHALL ─────────────────────────────────────────────────────────────
  {
    slug: "dancehall",
    name: "Dancehall",
    family: "Danses issues des cultures afro-descendantes",
    era: "Années 1970–1980",
    originCountry: "Jamaïque",
    originCity: "Kingston, Jamaïque",
    summary:
      "Le dancehall est né en Jamaïque à la fin des années 1970, dans les sound systems de Kingston. Style de danse indissociable de la musique du même nom, il se caractérise par une énergie festive et sensuelle, une grande dextérité des hanches et du bassin, et une culture de la joute dansée. Il a profondément influencé le reggae, le hip-hop et les musiques et danses populaires mondiales.",
    introduction:
      "Le dancehall — le mot désigne à l'origine les salles de bal jamaïcaines où les sound systems jouent — est né dans les quartiers populaires de Kingston à la fin des années 1970. Il émerge dans un contexte de post-reggae : après le triomphe mondial du reggae roots et de Bob Marley, une nouvelle génération de musiciens développe un son plus rapide, plus électronique, ancré dans les réalités des ghettos urbains de Kingston.\n\nLa musique dancehall génère ses propres danses, extrêmement codifiées et souvent nommées. Chaque hit musical s'accompagne souvent d'une danse spécifique (un « move »), créée par des danseurs de la rue et popularisée par les sound systems et les clips. Ce phénomène de « danse-du-moment » est constitutif de la culture dancehall.\n\nLe dancehall a une dimension politique et communautaire forte : c'est l'espace de célébration, de catharsis et de résistance des communautés jamaïcaines pauvres. Il inclut aussi des dimensions contestées, notamment autour des paroles homophobes de certains artistes — un débat qui traverse la culture dancehall depuis les années 1990.",
    origins:
      "Le dancehall emerge des sound systems de Kingston dans les années 1970, portés par des figures comme Coxsone Dodd et Duke Reid. Mais c'est dans les années 1980, avec des artistes comme Yellowman, Shabba Ranks et Beenie Man, que le dancehall se distingue clairement du reggae roots pour devenir un genre autonome.\n\nLes danses dancehall sont créées dans les dancehalls (salles de danse) et les espaces de sound system. Elles portent souvent des noms qui décrivent le mouvement (Dutty Wine, Bogle, Log On, Daggering) et sont popularisées par les vidéos et les fêtes. L'inventeur d'une danse peut devenir une célébrité locale.",
    timeline: [
      { year: "Années 1970", event: "Émergence du dancehall dans les sound systems de Kingston" },
      { year: "Années 1980", event: "Yellowman, Shabba Ranks : le dancehall devient un genre distinct du reggae roots" },
      { year: "Années 1990", event: "Expansion internationale ; influence sur le hip-hop américain (Sean Paul, Busta Rhymes)" },
      { year: "2000s", event: "Le dancehall intègre les scènes de danse européennes et mondiales" },
      { year: "2010s–présent", event: "Hybridation avec le trap, l'afrobeats ; vogue du dancehall comme discipline dans les studios" },
    ],
    characteristics: {
      movements:
        "Le dancehall valorise une grande dextérité des hanches et du bassin. Les danses varient selon les morceaux : certaines sont très spécifiques (Dutty Wine, Wine and Daggering), d'autres sont plus libres. En commun : une connexion au sol, un accent sur les mouvements bas du corps, une énergie festive.",
      musicRelationship:
        "La connexion à la musique est constitutive : chaque danse est née sur un morceau particulier. Le riddim (base instrumentale du dancehall) conditionne les mouvements.",
      improvisation:
        "Le dancehall mêle des moves codifiés (appris collectivement) et de l'improvisation dans les fêtes et les battles.",
      formats: ["Sound system", "Fête", "Compétition", "Cours académique", "Clip", "Festival"],
      visualCodes:
        "Les codes vestimentaires du dancehall sont flamboyants et sexualisés — une esthétique assumée, en contraste avec d'autres genres plus austères.",
    },
    music: {
      genres: ["Dancehall", "Reggaeton", "Afrobeats (influence)", "Trap Caribbean"],
      description:
        "Le dancehall est né sur les riddims jamaïcains, cadences rythmiques répétitives sur lesquelles les DJs « toastent » (rappent ou chantent). Des artistes comme Sean Paul, Beenie Man, Vybz Kartel et Popcaan définissent le son du dancehall contemporain.",
      keyArtists: ["Sean Paul", "Beenie Man", "Vybz Kartel", "Popcaan", "Spice"],
    },
    keyFigures: [
      {
        category: "Musiciens fondateurs",
        figures: [
          { name: "Yellowman", role: "Pionnier du dancehall deejaying dans les années 1980" },
          { name: "Shabba Ranks", role: "Figure du dancehall ragga des années 1990, percée internationale" },
        ],
      },
      {
        category: "Culture et danse",
        figures: [
          { name: "Bogle (Gerald Levy)", role: "Danseur jamaïcain, icône du dancehall, créateur de nombreuses danses emblématiques" },
          { name: "John Hype", role: "Danseur et performer, figure de la scène dancehall jamaïcaine" },
        ],
      },
    ],
    franceHistory:
      "Le dancehall arrive en France avec les diasporas antillaises et jamaïcaines, et se développe particulièrement dans les Antilles françaises. En métropole, Paris compte une scène dancehall active. Des cours de dancehall sont proposés dans de nombreux studios.",
    relatedStyles: ["afro-dance", "hip-hop-freestyle"],
    resources: [],
    episodeLinks: [],
    autoMatchTerms: ["dancehall", "reggaeton", "riddim", "wine", "bogle"],
    keywords: ["dancehall", "Jamaïque", "Kingston", "reggae", "riddim", "sound system", "Bogle", "Sean Paul"],
    seoTitle: "Dancehall — Histoire et culture | Explorer les styles | Dance Lab",
    seoDescription:
      "Découvrez le dancehall : origines en Jamaïque, culture des sound systems, danses iconiques et développement en France.",
  },

  // ── CLAQUETTES ────────────────────────────────────────────────────────────
  {
    slug: "claquettes",
    name: "Claquettes",
    aliases: ["Tap dance", "Tap"],
    family: "Danses scéniques",
    era: "XIXe siècle",
    originCountry: "États-Unis",
    originCity: "Nouvelle-Orléans, puis New York",
    summary:
      "Les claquettes (tap dance) naissent aux États-Unis au XIXe siècle de la rencontre entre les danses percussives africaines-américaines et les danses à claquements des communautés irlandaises immigrées. Elles se caractérisent par la production de sons rythmiques par des plaques métalliques fixées sous les chaussures, faisant du danseur un musicien à part entière.",
    introduction:
      "Les claquettes sont un art double : une danse et une musique. Le danseur produit des sons avec les plaques métalliques (taps) fixées sous la pointe et le talon de ses chaussures, s'inscrivant dans le rythme et souvent en dialogue avec les musiciens. Ce caractère de percussionniste du corps est au cœur du style.\n\nLes claquettes naissent de la rencontre — forcée puis créative — entre des populations afro-américaines et des immigrants irlandais au XIXe siècle. Les minstrel shows (spectacles racistes qui utilisaient et déformaient les cultures africaines-américaines) contribuent malheureusement à diffuser les claquettes en les appropriant, les caricaturant et en effaçant les origines noires du style.\n\nAu XXe siècle, des figures comme Bill Robinson (Bojangles), Fred Astaire, Gene Kelly et Savion Glover portent les claquettes vers les plus grandes scènes mondiales. Savion Glover, en particulier, revendique et restaure les racines africaines-américaines du style avec son spectacle Bring in 'Da Noise, Bring in 'Da Funk.",
    origins:
      "Les claquettes naissent de la rencontre de deux traditions percussives : les danses à frappements de pieds des esclaves africains-américains (interdits de tambours, ils utilisaient leur corps comme instrument) et les danses à claquements des immigrants irlandais (jig, hornpipe).\n\nDans les quartiers populaires mélangés de la Nouvelle-Orléans et de New York au XIXe siècle, ces traditions se rencontrent et fusionnent. Les minstrel shows des années 1830-1900 diffusent les claquettes — dans une version caricaturale et raciste — à travers les États-Unis. C'est dans ce contexte de dépossession culturelle que des danseurs afro-américains continuent néanmoins à innover et à développer le style.",
    timeline: [
      { year: "Début XIXe siècle", event: "Rencontre entre danses africaines-américaines et danses irlandaises dans les grandes villes américaines" },
      { year: "1830–1900", event: "Les minstrel shows diffusent les claquettes en les appropriant et les caricaturant" },
      { year: "1890–1920", event: "Développement des claquettes dans le vaudeville et les cabarets" },
      { year: "Années 1930–50", event: "Âge d'or de Hollywood : Fred Astaire, Ginger Rogers, Gene Kelly, Bill Robinson" },
      { year: "1996", event: "Savion Glover crée Bring in 'Da Noise, Bring in 'Da Funk à Broadway" },
      { year: "Aujourd'hui", event: "Renouveau des claquettes, pratiquées dans les académies du monde entier" },
    ],
    characteristics: {
      movements:
        "Les claquettes reposent sur la production sonore par les taps (plaques métalliques). Le vocabulaire inclut le shuffle (glissement), le flap, le brush, le cramp roll, le pullback, et des combinaisons complexes. La précision rythmique est essentielle.",
      musicRelationship:
        "Le danseur est un musicien : ses pieds produisent des sons qui s'intègrent à la musique. Les claquettes peuvent être pratiquées a cappella, sur du jazz, du blues, du Broadway ou des musiques plus contemporaines.",
      improvisation:
        "L'improvisation est une dimension centrale des claquettes dans le jazz tap — le danseur improvise comme un musicien de jazz. Le tap scénique peut être plus chorégraphié.",
      formats: ["Scène (Broadway, music-hall)", "Cours académique", "Jazz session", "Compétition"],
      visualCodes:
        "Les chaussures à taps sont constitutives du style. Les tenues varient selon les contextes : des costumes de Broadway au jean décontracté de la session jazz.",
    },
    music: {
      genres: ["Jazz", "Blues", "Swing", "Broadway", "A cappella"],
      description:
        "Les claquettes sont historiquement liées au jazz et au swing. Mais elles peuvent dialoguer avec n'importe quelle musique — ou s'en passer, dans les performances a cappella (boogaloo, body music).",
      keyArtists: ["Duke Ellington", "Count Basie", "Ella Fitzgerald"],
    },
    keyFigures: [
      {
        category: "Figures historiques",
        figures: [
          { name: "Bill Robinson (Bojangles)", role: "Danseur afro-américain, l'une des figures les plus célébrées des claquettes dans les années 1920-40" },
          { name: "Fred Astaire", role: "Danseur et acteur, figure iconique de l'âge d'or d'Hollywood" },
          { name: "Gene Kelly", role: "Danseur, acteur et chorégraphe, figure de la comédie musicale américaine" },
        ],
      },
      {
        category: "Réinvention contemporaine",
        figures: [
          { name: "Savion Glover", role: "Danseur et chorégraphe, revendique les racines africaines-américaines des claquettes (Bring in 'Da Noise, 1996)" },
          { name: "Dormeshia Sumbry-Edwards", role: "Danseuse et pédagogue, figure contemporaine des claquettes" },
        ],
      },
    ],
    franceHistory:
      "Les claquettes arrivent en France via les tournées de music-hall américaines et le cinéma dès les années 1930. Elles sont enseignées dans de nombreuses académies françaises. Des associations comme l'Association pour le développement des claquettes en France contribuent à structurer la pratique. Des festivals et compétitions internationales de claquettes ont lieu régulièrement en France.",
    relatedStyles: ["jazz", "danse-classique"],
    commonConfusions: [
      {
        styles: "Claquettes et claquettes de ballet (chaussons)",
        explanation:
          "En français, « claquettes » peut désigner les chaussures de sport ou de plage (flip-flops) mais aussi, en danse, les chaussures à plaques métalliques du tap dance. Il ne faut pas confondre avec les demi-pointes ou les chaussons de ballet.",
      },
    ],
    resources: [
      {
        title: "Bring in 'Da Noise, Bring in 'Da Funk",
        author: "Savion Glover",
        year: "1996",
        format: "Conférence",
        description:
          "Spectacle de Broadway qui retrace l'histoire des Afro-Américains à travers les claquettes, du temps des esclaves au présent.",
        url: "https://www.imdb.com/title/tt0116174/",
      },
    ],
    episodeLinks: [],
    autoMatchTerms: ["claquettes", "tap dance", "tap"],
    keywords: ["claquettes", "tap dance", "Savion Glover", "Fred Astaire", "jazz", "percussions", "Broadway", "Bill Robinson"],
    seoTitle: "Claquettes (Tap dance) — Histoire et origines | Explorer les styles | Dance Lab",
    seoDescription:
      "Découvrez les claquettes : origines afro-irlandaises, figures historiques (Bojangles, Fred Astaire, Savion Glover), technique et développement en France.",
  },

  // ── FLAMENCO ─────────────────────────────────────────────────────────────
  {
    slug: "flamenco",
    name: "Flamenco",
    family: "Danses traditionnelles",
    era: "XVIIIe–XIXe siècle (codification)",
    originCountry: "Espagne",
    originCity: "Andalousie (Séville, Jerez de la Frontera, Cadix)",
    summary:
      "Le flamenco est un art vivant né en Andalousie, porté par les communautés Gitanes (Roms), morisques et Andalouses au carrefour de multiples cultures méditerranéennes. Il regroupe chant (cante), danse (baile) et guitare (toque), dans une expression d'une intensité émotionnelle unique appelée duende. Inscrit au patrimoine immatériel de l'UNESCO depuis 2010.",
    introduction:
      "Le flamenco est bien plus qu'une danse : c'est un art total — cante (chant), baile (danse), toque (guitare) — qui s'est développé dans les communautés marginalisées de l'Andalousie du XVIIIe et XIXe siècles. Il porte les histoires de peuples multiples et souvent persécutés : les Gitans (Roms) d'Andalousie, les Maures convertis de force (moriscos), les Juifs séfarades, les communautés rurales pauvres.\n\nLe flamenco ne s'enseigne pas d'abord en studio : il s'absorbe, se vit, se transmet par immersion dans la communauté. La notion centrale est celle du duende — un terme intraduisible qui désigne la force obscure, l'intensité émotionnelle qui s'empare de l'artiste et du public lors d'une interprétation parfaite. Federico García Lorca en a fait la théorie dans sa conférence Juego y teoría del duende (1933).\n\nIl est important de reconnaître la centralité de la culture gitane dans la naissance du flamenco, tout en comprenant que le style est devenu une expression partagée, un patrimoine vivant de l'Andalousie et de l'Espagne entière, qui continue d'évoluer.",
    origins:
      "Les origines du flamenco sont multiples et complexes. Le consensus des chercheurs situe son émergence entre le XVIIe et le XIXe siècle en Andalousie, à la confluence de plusieurs traditions musicales et chorégraphiques : les musiques et danses des Gitans (Roms) arrivés en Espagne au XVe siècle, les influences arabes et mauresques héritées de l'Al-Andalus médiéval, les traditions musicales judéo-séfarades, et les chants et danses populaires andalous.\n\nL'ère des cafés cantantes (1850-1910) est souvent considérée comme la période de codification du flamenco : c'est dans ces salles de spectacle payantes que le flamenco s'institutionnalise, acquiert des palos (formes musicales codifiées comme la soleá, la bulería, le siguiriyas) et que des bailaores professionnels développent un vocabulaire gestuel sophistiqué.\n\nAu XXe siècle, des chorégraphes comme Antonio Gades contribuent à créer un flamenco scénique de haut niveau, tandis que des artistes comme Paco de Lucía révolutionnent la guitare flamenca.",
    timeline: [
      { year: "XVe–XVIIe siècle", event: "Arrivée des Gitans en Andalousie et brassage des cultures méditerranéennes" },
      { year: "XVIIIe siècle", event: "Émergence progressive du flamenco dans les milieux gitans andalous" },
      { year: "1850–1910", event: "Ère des cafés cantantes : codification des palos et professionnalisation" },
      { year: "1915–1920", event: "Concours de cante jondo à Grenade (Lorca, Falla) : premier mouvement de valorisation artistique" },
      { year: "1933", event: "García Lorca publie sa conférence sur le duende — texte fondateur de la pensée flamenca" },
      { year: "Années 1960–80", event: "Antonio Gades et le flamenco scénique contemporain ; Paco de Lucía révolutionne la guitare" },
      { year: "2010", event: "Inscription du flamenco au patrimoine immatériel de l'UNESCO" },
    ],
    characteristics: {
      movements:
        "La danse flamenca (baile) repose sur les zapateados (frappes rythmiques des pieds), les palmas (frappés de mains), les bras (floreos — mouvements souples et serpentins des poignets et des doigts), et l'utilisation d'accessoires (châle, éventail, castagnettes, bata de cola). La colonne vertébrale et le port de tête sont centraux.",
      musicRelationship:
        "Le flamenco est un art de la conversation entre chanteur, guitariste et danseur. Le bailaor réagit en temps réel au cante et au toque. Chaque palo (forme musicale) a son propre compás (rythme) et son atmosphère émotionnelle.",
      improvisation:
        "L'improvisation est fondamentale dans le flamenco traditionnel : le bailaor dialogue en temps réel avec le chanteur et le guitariste. Les formes très scéniques peuvent être plus chorégraphiées.",
      formats: ["Tablao (scène de flamenco)", "Juerga (fête privée)", "Scène de danse contemporaine", "Cours académique"],
      visualCodes:
        "Robe à volants (bata de cola) pour les bailaoras, chemise et pantalon ajusté pour les bailaores. Les chaussures flamencas ont des clous dans la semelle pour amplifier les zapateados.",
    },
    music: {
      genres: ["Cante flamenco", "Guitare flamenca", "Palmas", "Cajón flamenco"],
      description:
        "Le flamenco repose sur les palos — formes musicales codifiées (soleá, bulería, siguiriyas, tangos, fandango) — chacune avec son compás (structure rythmique) et son caractère émotionnel. La guitare flamenca et le cante (chant) sont inséparables de la danse.",
      keyArtists: ["Paco de Lucía", "Camarón de la Isla", "Estrella Morente", "Vicente Amigo"],
    },
    keyFigures: [
      {
        category: "Figures historiques fondatrices",
        figures: [
          { name: "La Niña de los Peines (Pastora Pavón)", role: "Considérée comme l'une des plus grandes cantaoras (chanteuses) de l'histoire du flamenco" },
          { name: "Antonio Gades", role: "Danseur et chorégraphe, fondateur du flamenco scénique contemporain" },
          { name: "Carmen Amaya", role: "Bailaora gitane, figure légendaire du flamenco, pionnière de la présence des femmes sur scène" },
        ],
      },
      {
        category: "Figures contemporaines",
        figures: [
          { name: "Paco de Lucía", role: "Guitariste, révolutionne le toque flamenco au XXe siècle" },
          { name: "Sara Baras", role: "Bailaora et chorégraphe, figure du flamenco scénique international" },
        ],
      },
      {
        category: "Scène française",
        figures: [
          { name: "Rubén Molina", role: "Danseur et chorégraphe flamenco basé en France", note: "Invité de Dance Lab (épisode 64)" },
        ],
      },
    ],
    franceHistory:
      "Le flamenco est présent en France depuis le XIXe siècle, notamment dans les régions du sud. Paris compte une scène flamenca active, avec des tablaos, des cours et des festivals. Des artistes espagnols et gitans se sont installés en France. Le flamenco est aujourd'hui enseigné dans de nombreuses associations et académies françaises.",
    relatedStyles: [],
    commonConfusions: [
      {
        styles: "Flamenco et musiques/danses espagnoles en général",
        explanation:
          "Le flamenco est souvent confondu avec « la danse espagnole » en général. Mais l'Espagne a des traditions de danse régionales très diverses : la sardane catalane, la jota aragonaise, la muñeira galicienne, etc. Le flamenco est spécifiquement andalou et porte une histoire culturelle particulière liée aux communautés gitanes.",
      },
    ],
    resources: [
      {
        title: "Juego y teoría del duende",
        author: "Federico García Lorca",
        year: "1933",
        format: "Conférence",
        description:
          "Conférence de García Lorca sur le duende — la force obscure qui donne vie au flamenco. Texte fondateur de la pensée flamenca.",
        url: "https://www.bibliotheque-nationale.fr/",
      },
      {
        title: "Centro Andaluz de Documentación del Flamenco",
        author: "Junta de Andalucía",
        year: "En ligne",
        format: "Site web",
        description: "Archives et documentation sur le flamenco, maintenues par la Junta de Andalucía.",
        url: "https://www.juntadeandalucia.es/cultura/centrodocumentacionflamenco/",
      },
    ],
    episodeLinks: [
      {
        slug: "64-ruben-molina",
        relevance:
          "Rubén Molina est un artiste flamenco basé en France. L'épisode explore le flamenco comme acte de création, de transmission et de résistance culturelle.",
      },
    ],
    autoMatchTerms: ["flamenco", "tablao", "duende", "zapateado", "cante", "bailaor"],
    keywords: ["flamenco", "Andalousie", "Gitans", "duende", "cante", "toque", "baile", "zapateado", "palo", "UNESCO"],
    seoTitle: "Flamenco — Histoire, culture et duende | Explorer les styles | Dance Lab",
    seoDescription:
      "Découvrez le flamenco : origines en Andalousie, rôle des Gitans, duende, grands palos, figures historiques et épisodes Dance Lab associés.",
  },

  // ── POLE DANCE ────────────────────────────────────────────────────────────
  {
    slug: "pole-dance",
    name: "Pole dance",
    aliases: ["Pole fitness", "Pole art"],
    family: "Danses scéniques",
    era: "XXe siècle (sport/art : années 2000)",
    originCountry: "États-Unis / Canada",
    originCity: "Vancouver, puis Los Angeles et New York",
    summary:
      "Le pole dance est une discipline qui combine acrobaties aériennes, danse et force physique autour d'une barre verticale fixe ou tournante. Né dans les cabarets du début du XXe siècle, il s'est développé comme sport et art à partir des années 2000, donnant naissance à une communauté mondiale et à une compétition internationale.",
    introduction:
      "Le pole dance est une pratique à la croisée de la danse, de la force physique et de l'acrobatie aérienne. Il implique des mouvements autour et sur une barre verticale (le « pole »), qui peut être fixe ou tournante. Les gestes allient des portés de poids, des inversions, des spirales et une fluidité chorégraphique.\n\nL'histoire du pole dance est complexe et souvent réductrice quand elle est racontée de façon simpliste. La barre verticale est utilisée dans de nombreuses cultures et contextes : les lutteurs indiens pratiquent le mallakhamb (discipline gymnique sur poteau) depuis des siècles. Au XIXe siècle, des cirques itinérants américains utilisent des perches. Dans les années 1920-50, les spectacles de burlesque et de cabaret intègrent la barre.\n\nC'est dans les années 1990-2000 que le pole dance se développe comme discipline sportive et artistique à part entière, hors de tout contexte de cabaret. Des clubs de fitness et des académies dédiées naissent à Vancouver, Los Angeles et New York. Des compétitions internationales se structurent. Aujourd'hui, le pole dance est revendiqué comme un art et un sport — avec une candidature récurrente aux Jeux olympiques.",
    origins:
      "L'utilisation athlétique de poteaux et barres verticales existe dans de nombreuses cultures depuis des siècles. La pratique contemporaine du pole dance dans les clubs de fitness naît à Vancouver au Canada dans les années 1990, initiée par des praticientes comme Fawnia Mondey-Dietrich, qui commencent à enseigner des techniques de pole dans un contexte non-adulte.\n\nAux États-Unis, des studios de pole fitness ouvrent dès les années 1990. En 2003 est fondée la World Pole Sports & Fitness Championship — première grande compétition internationale. La Fédération internationale de sports de pole dance (IPSF) structure progressivement la discipline.",
    timeline: [
      { year: "Années 1920–50", event: "La barre verticale est utilisée dans les spectacles de cabaret et de burlesque" },
      { year: "Années 1990", event: "Des studios de pole fitness ouvrent à Vancouver et aux États-Unis" },
      { year: "2003", event: "Première compétition internationale de pole dance (World Pole Sports & Fitness Championship)" },
      { year: "2010s", event: "Développement mondial, compétitions, reconnaissance comme discipline sportive et artistique" },
      { year: "2023", event: "Le pole sport est reconnu par le Comité olympique international" },
    ],
    characteristics: {
      movements:
        "Le pole dance mêle acrobaties aériennes (portés de poids, inversions, spins), fluidité chorégraphique et force physique. Les éléments incluent les spins (rotations), les inversions (tête en bas), les poses statiques, et les transitions fluides entre les éléments.",
      musicRelationship:
        "Le pole dance peut se pratiquer sur une grande variété de musiques. En compétition, les musicques choisies reflètent l'expression artistique du danseur.",
      improvisation:
        "En pratique libre, l'improvisation est possible. En compétition, les enchaînements sont chorégraphiés.",
      formats: ["Cours académique (sport/loisir)", "Compétition internationale", "Performance artistique", "Entraînement fitness"],
      visualCodes:
        "Les tenues sont fonctionnelles (permettant l'adhérence de la peau à la barre). En compétition, elles peuvent être très élaborées.",
    },
    music: {
      genres: ["Pop", "Electronic", "R&B", "Classique", "Rock"],
      description:
        "Le pole dance s'adapte à n'importe quel genre musical selon les artistes et les contextes.",
    },
    keyFigures: [
      {
        category: "Pionnières et fondateurs",
        figures: [
          { name: "Fawnia Mondey-Dietrich", role: "Pionnière du pole fitness en contexte sportif à Vancouver dans les années 1990" },
          { name: "Felix Cane", role: "Championne mondiale multiple, contribue à établir le pole comme discipline artistique" },
          { name: "Jenyne Butterfly", role: "Figure internationale, connue pour l'aspect acrobatique et artistique de sa pratique" },
        ],
      },
      {
        category: "Scène française",
        figures: [
          { name: "Marion Crampe", role: "Artiste et pédagogue, figure internationale du pole dance basée en France", note: "Invitée de Dance Lab (épisode 99)" },
        ],
      },
    ],
    franceHistory:
      "Le pole dance se développe en France à partir des années 2000, notamment via l'ouverture de studios spécialisés dans les grandes villes. La France compte aujourd'hui une scène compétitive active et des artistes de niveau international. Le pole est enseigné aussi bien comme discipline fitness que comme pratique artistique.",
    relatedStyles: ["contemporain", "jazz"],
    commonConfusions: [
      {
        styles: "Pole dance et strip-tease",
        explanation:
          "Le pole dance contemporain est souvent réduit à tort à une pratique sexuelle ou de strip-tease. La discipline contemporaine est pratiquée dans des contextes sportifs, artistiques et de fitness, sans contenu à caractère sexuel. Cette réduction est une forme de stigmatisation que les pratiquants et pratiquantes combattent activement.",
      },
    ],
    resources: [],
    episodeLinks: [
      {
        slug: "99-marion-crampe",
        relevance:
          "Marion Crampe est une artiste internationale du pole dance. L'épisode explore comment construire une carrière artistique dans cette discipline, en navigant les préjugés et en affirmant une vision artistique.",
      },
    ],
    autoMatchTerms: ["pole dance", "pole dancing", "pole fitness", "pole art"],
    keywords: ["pole dance", "pole fitness", "barre", "acrobatie", "aérien", "Marion Crampe", "compétition", "sport"],
    seoTitle: "Pole dance — Histoire, technique et sport | Explorer les styles | Dance Lab",
    seoDescription:
      "Découvrez le pole dance : origines, technique, développement comme sport et art, figures clés et épisodes Dance Lab avec Marion Crampe.",
  },

  {
    slug: "salsa",
    name: "Salsa",
    aliases: ["salsa cubaine", "salsa portoricaine", "salsa new-yorkaise"],
    family: "Danses sociales",
    era: "Années 1960-1970",
    originCountry: "Cuba et Porto Rico",
    originCity: "La Havane / New York",
    summary: "Danse sociale exubérante fusionnant rythmes cubains et influences nord-américaines, caractérisée par des mouvements de hanche rapides et des figures de couple spectaculaires.",
    introduction: "La salsa est née de la rencontre entre les traditions musicales cubaines et la modernité urbaine, devenant l'une des danses sociales les plus populaires au monde. Danse de couple dynamique, elle se pratique en boîtes de nuit, lors de festivals ou en soirées communautaires, incarnant la joie de vivre et l'énergie des Caraïbes.\n\nBien que souvent associée à Cuba, la salsa s'est développée dans un espace transculturel : les musiciens cubains exilés à New York ont fusionné leurs traditions avec le jazz américain, créant un phénomène musical et chorégraphique hybride. Aujourd'hui, elle symbolise l'échange culturel et l'intégration des diasporas latines en Amérique du Nord.",
    origins: "Les origines de la salsa sont débattues entre historiens. Cuba revendique des racines profondes dans le son cubano, la rumba et la musique de tradition africaine. Les années 1930-1950 voient l'émergence d'orchestres pionniers à La Havane. Cependant, la salsa moderne s'est cristallisée à New York dans les années 1960-1970, lorsque des musiciens cubains et portoricains en exil ont fusionné le son cubain avec le jazz, créant un style nouveau.\n\nLes figures emblématiques comme Celia Cruz, Tito Puente et Willie Colón ont popularisé la salsa à travers les États-Unis et le monde. L'industrie du disque new-yorkaise a jouée un rôle crucial dans sa diffusion internationale. La salsa a d'abord été une danse urbaine dans les clubs latinos, avant de devenir un phénomène culturel mondial.\n\nChaque région a développé son propre style : la salsa cubaine privilégie les mouvements de groupe et les figures fluides, tandis que la salsa portoricaine et new-yorkaise adopte un timing plus complexe et des figures de couple plus spectaculaires.",
    timeline: [
      { year: "1930-1950", event: "Développement du son cubano et de la rumba à Cuba, fondations musicales de la salsa" },
      { year: "1960", event: "Émigration de musiciens cubains à New York après la révolution, fusion du son cubano avec le jazz" },
      { year: "1966", event: "Fania Records fonde le label qui devient le centre nerveux de la salsa new-yorkaise" },
      { year: "1970s", event: "Apogée de la salsa new-yorkaise avec Celia Cruz, Tito Puente, Héctor Lavoe ; explosion mondiale" },
      { year: "1980s-1990s", event: "Globalisation de la salsa ; développement de concours internationaux et de styles régionaux" },
      { year: "2000s", event: "Ressurgence de la salsa cubaine traditionnelle et diversification des sous-genres (timba, salsaéro)" },
      { year: "2010-présent", event: "Salsa toujours vivante dans les diasporas urbaines mondiales ; nouvelles générations de danseurs et musiciens" },
    ],
    characteristics: {
      movements: "Mouvements de hanche sensuels et fluides, rotations du bassin, figures de couple complexes (tours, dips, promenades), jeu de jambes rapide, isolations corporelles.",
      musicRelationship: "Dansée sur des rythmes de clave 5/8, avec des accents sur le tempo de la musique de salsa (généralement 92-110 BPM). La danse suit strictement la structure musicale.",
      improvisation: "Haute improvisation au sein d'une structure de base ; les danseurs exécutent des variations et des tricks librement tout en restant attachés à la figure principale.",
      formats: ["Bal social", "Compétition", "Performance scénique", "Cours collectif"],
      visualCodes: "Tenues colorées et ajustées, souvent brillantes ; femmes en robes courtes ou pantalons moulants, hommes en chemises amples ; chaussures de danse légères.",
    },
    music: {
      genres: ["Salsa", "Son cubano", "Timba", "Mambo"],
      description: "Musique en rythme binaire avec des cuivres (trompettes, trombones), des percussions complexes (timbales, congas, cloches) et une ligne de basse fondamentale. Les paroles traitent de thèmes sociaux, d'amour et de vie quotidienne.",
      keyArtists: ["Celia Cruz", "Tito Puente", "Willie Colón", "Héctor Lavoe", "Oscar D'León", "Rubén Blades"],
    },
    keyFigures: [
      {
        category: "Pionniers et légendes",
        figures: [
          { name: "Celia Cruz", role: "Chanteuse légendaire, reine de la salsa", note: "Figure iconique de la salsa cubaine et mondiale" },
          { name: "Tito Puente", role: "Timbalero et chef d'orchestre emblématique" },
          { name: "Willie Colón", role: "Tromboniste et compositeur, pionnier de la salsa de New York" },
        ],
      },
      {
        category: "Danseurs et figures scéniques",
        figures: [
          { name: "Eddie Torres", role: "Danseur de salsa new-yorkaise, figure fondatrice du style" },
          { name: "Víctor Manuelle", role: "Chanteur et interprète de salsa moderne" },
        ],
      },
    ],
    franceHistory: "La salsa s'est implantée en France à partir des années 1970-1980, d'abord dans les communautés antillaises et latino-américaines, particulièrement en Île-de-France. Paris possède une scène salsa dynamique avec des salons réguliers (Salsa Loca, Petit Palais) et une forte présence dans le 11e arrondissement. La France accueille des danseurs cubains, portoricains et américains qui ont contribué à la diffusion du style. Aujourd'hui, la salsa est enseignée dans de nombreux studios et clubs, avec des compétitions nationales et internationales.",
    relatedStyles: ["rumba", "cha-cha-cha", "mambo", "bachata"],
    commonConfusions: [
      {
        styles: "Salsa et merengue",
        explanation: "Bien que toutes deux d'origine caribéenne, le merengue (dominicain) et la salsa (cubano-portoricaine) sont distinctes. Le merengue suit un rythme binaire simple, tandis que la salsa utilise la clave 5/8. Leurs mouvements, structures musicales et histoires culturelles diffèrent profondément.",
      },
      {
        styles: "Salsa cubaine et salsa new-yorkaise",
        explanation: "La salsa cubaine privilégie les mouvements circulaires et la promenade du couple dans l'espace, avec un timing sur le beat 1. La salsa new-yorkaise adopte un style plus linéaire, un timing décalé et des figures spectaculaires. Ces variantes reflètent des héritages musicaux et géographiques distincts.",
      },
    ],
    resources: [
      {
        title: "Celia Cruz, la reine de la salsa",
        author: "Dioses Marañón",
        year: "2003",
        format: "Livre",
        description: "Biographie complète de Celia Cruz et histoire de la salsa cubaine",
      },
      {
        title: "Tito Puente - A Life",
        author: "Marc Eliot",
        year: "2008",
        format: "Livre",
        description: "Vie et carrière du roi des timbales et pilier de la salsa new-yorkaise",
      },
    ],
    episodeLinks: [],
    autoMatchTerms: ["salsa cubaine", "salsa portoricaine", "salsa new-yorkaise", "mambo"],
    keywords: ["salsa", "danse caribéenne", "couple", "boîte de nuit", "clave", "Cuba", "Porto Rico", "New York"],
    seoTitle: "Salsa — Histoire, rythmes et styles | Explorer les styles | Dance Lab",
    seoDescription: "Découvrez la salsa : origines caribéennes, mouvements sensuels, styles régionaux et légendes de cette danse sociale mondialement populaire.",
  },

  {
    slug: "bachata",
    name: "Bachata",
    aliases: ["bachata dominicaine", "bachata moderna"],
    family: "Danses sociales",
    era: "Années 1960-1980",
    originCountry: "République Dominicaine",
    originCity: "Saint-Domingue / zones rurales",
    summary: "Danse de couple intime et sensuelle, caractérisée par une gestuelle fluide du bassin et une connexion étroite, née de la musique bachata dominicaine.",
    introduction: "La bachata est l'expression dansée d'une musique profondément ancrée dans la vie dominicaine, racontant des histoires d'amour, de douleur et d'nostalgie. Contrairement à la salsa exubérante, la bachata cultive l'intimité et la sensualité, offrant une connexion émotionnelle directe entre les danseurs. Elle s'est transformée d'une pratique rurale stigmatisée en phénomène culturel mondial, incarnant la renaissance culturelle dominicaine.\n\nLa danse reflète la musique : chaque mouvement semble raconter une histoire de sentiment et de désir. Les couples enlacés, proches et connectés, exécutent des motifs hypnotiques qui laissent place à l'improvisation et à l'expression personnelle.",
    origins: "La bachata émerge dans les zones rurales et les quartiers pauvres de la République Dominicaine dans les années 1960. Musicalement, elle fusionne des éléments du bolero cubain, de la guitare espagnole et des traditions locales. Initialement méprisée par les classes aisées comme une musique des pauvres, elle s'est développée dans les cabarets de quartier avant de conquérir progressivement la nation.\n\nJuan Luis Guerra révolutionne la bachata dans les années 1980-1990 en l'intégrant à des arrangements sophistiqués, lui conférant une légitimité culturelle et la propulsant sur la scène internationale. Cette transformation crée la distinction entre la bachata tradicional (acoustique, intime) et la bachata moderna (produite, arrangée).\n\nLa danse suit parallèlement l'évolution musicale : initialement une gestuelle simple et proche, elle s'enrichit de figures complexes et de variations stylistiques au fur et à mesure de l'internationalisation du genre.",
    timeline: [
      { year: "1960s", event: "Émergence de la bachata musicale en République Dominicaine, musique des quartiers pauvres" },
      { year: "1970s", event: "La bachata reste stigmatisée, pratiquée surtout en zones rurales et cabarets de quartier" },
      { year: "1980s", event: "Juan Luis Guerra popularise la bachata modernisée ; acceptation croissante en Dominicanie" },
      { year: "1990s", event: "Internationalisation massive ; la bachata devient symbole culturel dominicain mondialement reconnu" },
      { year: "2000s", event: "Développement de styles variés (bachata urbana, bachata sensual) et prolifération des compétitions" },
      { year: "2010-présent", event: "Bachata reste vivante avec nouvelles générations de musiciens et danseurs; fusions avec d'autres styles" },
    ],
    characteristics: {
      movements: "Mouvements de hanche lents et fluides, oscillations du bassin latérales, pas marchés proches du sol, rotations du couple, contact corporel constant et étroit.",
      musicRelationship: "Dansée sur des rythmes binaires lents (généralement 48-65 BPM), permettant une ampleur et une sensualité accrue dans chaque mouvement. La musique guide émotionnellement la danse.",
      improvisation: "Improvisation modérée au sein d'une structure très proche et intime ; variations personnelles du motif de base de quatre pas.",
      formats: ["Bal social/discothèque", "Performance", "Compétition", "Cours"],
      visualCodes: "Tenues ajustées et sensuelles ; femmes souvent en robes fluides, hommes en chemises amples ; connexion physique très rapprochée, faces proches.",
    },
    music: {
      genres: ["Bachata", "Bolero latino-américain", "Bachata moderna"],
      description: "Guitares acoustiques ou électriques, cordes solistes expressives, basse discrète, percussions minimalistes. Chansons aux paroles lyriques traitant d'amour, de perte, de romance.",
      keyArtists: ["Juan Luis Guerra", "Romeo Santos", "Antony Santos", "Aventura", "Frank Reyes"],
    },
    keyFigures: [
      {
        category: "Musiciens pionniers",
        figures: [
          { name: "Juan Luis Guerra", role: "Compositeur et chanteur qui a modernisé et légitimé la bachata", note: "Figure clé de la transformation de la bachata" },
          { name: "Antony Santos", role: "Chanteur de bachata tradicional" },
        ],
      },
      {
        category: "Artistes contemporains",
        figures: [
          { name: "Romeo Santos", role: "Chanteur moderne de bachata, superstar internationale" },
        ],
      },
    ],
    franceHistory: "La bachata s'est développée en France via les communautés dominicaines et latino-américaines, particulièrement à partir des années 1990-2000. Paris et les banlieues accueillent régulièrement des soirées bachata et des danseurs professionnels. Des studios spécialisés proposent des cours, et la danse a intégré les festivals de danse urbaine. La France compte des champions nationaux et des figures d'enseignement reconnues internationalement.",
    relatedStyles: ["salsa", "bolero", "merengue", "romantique"],
    commonConfusions: [
      {
        styles: "Bachata et merengue",
        explanation: "Le merengue dominicain est rapide et énergique, privilégiant les mouvements de jambes et les rotations du couple. La bachata est lente, sensuelle et intime. Musicalement et chorégraphiquement, ce sont deux genres distincts.",
      },
    ],
    resources: [
      {
        title: "Juan Luis Guerra - A Dominican Legend",
        author: "Various",
        year: "2015",
        format: "Documentaire",
        description: "Documentaire sur l'impact de Juan Luis Guerra sur la bachata mondiale",
      },
    ],
    episodeLinks: [],
    autoMatchTerms: ["bachata dominicaine", "bachata sensual", "bachata urbana"],
    keywords: ["bachata", "danse sensuelle", "République Dominicaine", "couple", "intimité", "romanticisme"],
    seoTitle: "Bachata — Danse sensuelle dominicaine | Explorer les styles | Dance Lab",
    seoDescription: "Découvrez la bachata : origines dominicaines, mouvements sensuels, histoire de la musique et de la danse contemporaine.",
  },

  {
    slug: "tango",
    name: "Tango argentin",
    aliases: ["tango de Buenos Aires", "tango de salon", "tango escénico"],
    family: "Danses sociales",
    era: "Fin XIXe siècle / début XXe siècle",
    originCountry: "Argentine",
    originCity: "Buenos Aires",
    summary: "Danse d'une profondeur émotionnelle intense, caractérisée par une posture étroite, des mouvements détaillés et une narration dramatique ; symbole culturel argentin mondialement reconnu.",
    introduction: "Le tango argentin est bien plus qu'une danse : c'est une manifestation culturelle incarnant la passion, la mélancolie et l'identité porteña. Né dans les faubourgs de Buenos Aires à la fin du XIXe siècle, le tango fusionne les rythmes africains des migrants, la musique européenne et l'esprit urbain argentin en un langage chorégraphique unique. Sur la piste, deux corps se nouent dans une étreinte intime, racontant des histoires d'amour perdu, de désir et de fierté.\n\nLe tango transcende la simple danse de couple : c'est une conversation silencieuse entre deux êtres, où chaque pas résonne d'une intention émotionnelle. La posture caractéristique, la connexion close et le jeu de jambes complexe distinguent le tango de toute autre danse sociale.",
    origins: "Les origines du tango sont débattues entre historiens. La thèse dominante souligne l'émergence du tango dans les prostibulos et les quartiers pauvres de La Boca et San Telmo dans les années 1880-1890. Le tango résulterait de la fusion entre la musique africaine des esclaves libérés, les traditions musicales espagnoles et le milonga gaucho. Les premiers musiciens de tango joueraient à l'oreille, créant progressivement une structure musicale codifiée.\n\nAu tournant du XXe siècle, le tango sort des bas quartiers et conquiert les salons de la classe moyenne porteña. Sa popularité explose lorsque les mélodies de tango atteignent Paris dans les années 1910, créant une sensation mondiale. Des figures comme Carlos Gardel et Astor Piazzolla deviennent des ambassadeurs culturels.\n\nIl existe un débat persistant sur l'authenticité : le tango de salon (social, proche) versus le tango de scène (spectaculaire, chorégraphié). Ces deux variantes coexistent et influencent la danse contemporaine.",
    timeline: [
      { year: "1880-1890", event: "Émergence du tango dans les quartiers pauvres de Buenos Aires (La Boca, San Telmo)" },
      { year: "1900-1910", event: "Popularisation du tango dans les salons de classe moyenne ; le tango devient symbole porteño" },
      { year: "1910-1920", event: "Explosion du tango en Europe (Paris en tête) ; Carlos Gardel devient légende mondiale" },
      { year: "1940s-1960s", event: "Apogée du tango dans les milongas de Buenos Aires ; Astor Piazzolla révolutionne la musique de tango" },
      { year: "1970s-1980s", event: "Tango décline légèrement, maintenu vivant par les milongas traditionnelles" },
      { year: "1990s-2000s", event: "Renaissance du tango ; spectacles comme Tango Argentino popularisent le style à travers le monde" },
      { year: "2010-présent", event: "Tango toujours vivant dans les milongas de Buenos Aires et les communautés argentines ; fusions contemporaines émergentes" },
    ],
    characteristics: {
      movements: "Posture étroite et connectée, marche détaillée et contrôlée, mouvements de jambes complexes (ochos, ganchos, barridas), pivots et rotations, contact corporel constant.",
      musicRelationship: "Dansée sur des rythmes de tango (2/4 ou 4/8, 100-220 BPM selon les styles). La musique guide chaque geste ; improvisation et musicality sont essentielles.",
      improvisation: "Improvisation libre mais structurée ; chaque danseur interprète la musique personnellement tout en maintenant la connexion du couple.",
      formats: ["Milonga (bal social)", "Performance scénique", "Compétition", "Cours particuliers"],
      visualCodes: "Tenue classique : costume sombre ou chemise blanche pour l'homme, robe élégante ou longue pour la femme. Chaussures spécialisées de tango. Posture droite, port altier.",
    },
    music: {
      genres: ["Tango", "Tango Nuevo", "Tango de cámara"],
      description: "Musicalement complexe : bandonéons expressifs, violons solistes, contrebasse en pizzicato, piano. Paroles lyriques traitant de mélancolie, amour perdu et vie urbaine. Rythmes syncopés et phrasing musical élaboré.",
      keyArtists: ["Carlos Gardel", "Astor Piazzolla", "Susana Rinaldi", "Ástor Piazzolla", "Julio De Caro"],
    },
    keyFigures: [
      {
        category: "Légendes et pionniers",
        figures: [
          { name: "Carlos Gardel", role: "Chanteur et acteur emblématique, figure mythique du tango", note: "Ambassadeur mondial du tango au XXe siècle" },
          { name: "Astor Piazzolla", role: "Compositeur et bandonéoniste révolutionnaire", note: "Créateur du tango nuevo, transformant la musique de tango" },
        ],
      },
      {
        category: "Danseurs et maîtres",
        figures: [
          { name: "Juan Carlos Copes", role: "Danseur et maître de tango de salon, figure historique de la milonga" },
          { name: "Susana Rinaldi", role: "Chanteuse de tango traditionnel, interprète majeure" },
        ],
      },
    ],
    franceHistory: "Le tango arrive en France dans les années 1910 et provoque une révolution culturelle. Paris devient un centre majeur du tango européen. Aujourd'hui, la France accueille une scène active de tango : les milongas parisiennes (notamment dans le Marais et le 5e arrondissement) accueillent régulièrement des danseurs professionnels. Des écoles spécialisées enseignent le tango de salon et de scène. La France compte des champions internationaux et des musiciens de tango reconnus.",
    relatedStyles: ["valse", "foxtrot", "danse de salon"],
    commonConfusions: [
      {
        styles: "Tango argentin et tango de compétition (ballroom)",
        explanation: "Le tango argentin (tango de salon) est improvisation sociale, pratiqué dans les milongas de Buenos Aires. Le tango de ballroom (compétition) est chorégraphié, standardisé et spectaculaire. Posture, musicality, approche : tout diffère. Ce sont deux univers distincts.",
      },
    ],
    resources: [
      {
        title: "Tango Argentino - Historia de un sentimiento",
        author: "Juan José Sebreli",
        year: "1995",
        format: "Livre",
        description: "Analyse historique et culturelle du tango argentin",
      },
      {
        title: "Tango: The Dance, The Song, The Story",
        author: "Christine Denniston",
        year: "2012",
        format: "Livre",
        description: "Histoire complète du tango et de son impact culturel mondial",
      },
    ],
    episodeLinks: [],
    autoMatchTerms: ["tango porteño", "tango de Buenos Aires", "milonga", "bandonéon"],
    keywords: ["tango", "Argentine", "Buenos Aires", "passion", "mélancolie", "milonga", "danse de salon"],
    seoTitle: "Tango argentin — Histoire, passion et culture | Explorer les styles | Dance Lab",
    seoDescription: "Découvrez le tango argentin : origines de Buenos Aires, mouvements, musiciens légendaires et la milonga de salon.",
  },

  {
    slug: "valse",
    name: "Valse",
    aliases: ["valse viennoise", "valse anglaise", "valse lente", "quickstep"],
    family: "Danses sociales",
    era: "Fin XVIIIe siècle / XIXe siècle",
    originCountry: "Autriche",
    originCity: "Vienne",
    summary: "Danse de couple élégante et gracieuse, exécutée en rotation rapide, caractérisée par une posture droite et des mouvements fluides ; danse de salon par excellence.",
    introduction: "La valse incarne l'élégance et la sophistication de l'Autriche impériale. Née aux confins de l'aristocratie viennoise, cette danse de couple révolutionnaire en rapprocha les danseurs (scandale à l'époque !), transformant les salons de bal du XVIIIe siècle. La valse est mouvement perpétuel, une rotation fluide et hypnotique où deux corps enlacés tournent ensemble au rythme d'une musique en trois temps.\n\nSymbole de l'Europe de concert et de la Belle Époque, la valse représente l'élégance, la grâce et l'harmonie. Elle reste la danse de salon classique par excellence, enseignée et pratiquée dans les bal-musettes et les événements formels européens.",
    origins: "La valse émerge à la fin du XVIIIe siècle à Vienne, évoluant progressivement à partir de danses d'Allemagne du Sud (le Ländler). Initialement dansée par les paysans et les classes populaires, la valse choque l'aristocratie européenne par son style rapproché et tournoyant. Progressivement, elle s'intègre aux salons aristocratiques viennois, particulièrement grâce aux compositions de Johann Strauss et de ses fils.\n\nLes danses royales britanniques adoptent la valse au XIXe siècle, créant une variante anglaise plus lente et solennelle (valse lente). La valse viennoise demeure rapide et énergique, caractérisée par des rotations continues et un vertige élégant. Des variantes régionales et stylistiques émergent : valse musette française, valse anglaise, valse lente des compétitions.",
    timeline: [
      { year: "1770-1800", event: "Émergence de la valse à partir du Ländler ; adoption progressive en Autriche" },
      { year: "1800-1815", event: "La valse conquiert Vienne malgré l'opposition aristocratique ; devient danse royale" },
      { year: "1820-1870", event: "Apogée de la valse viennoise ; compositions de Strauss et diffusion européenne" },
      { year: "1870-1920", event: "La valse s'établit comme danse de salon standard ; Belle Époque et ball-musettes français" },
      { year: "1920-1960", event: "Valse demeure populaire dans les salons ; compétitions de danse de salon standardisent les styles" },
      { year: "1960-présent", event: "Valse continue en compétitions et événements formels ; patrimoine culturel européen préservé" },
    ],
    characteristics: {
      movements: "Rotation continue du couple, posture droite et élancée, mouvements fluides et naturels, pas marchés légers exécutés sur le rythme ternaire (trois temps).",
      musicRelationship: "Dansée en rythme ternaire (3/4 ou 3/8), sur des tempi variants : valse rapide (54-60 mesures/min), valse lente (30-40 mesures/min). La musique en trois temps est essentielle à l'identité de la valse.",
      improvisation: "Faible improvisation ; structure définie avec figures de base (natural turn, reverse turn, weave). Les compétitions standardisent les pas.",
      formats: ["Bal masqué / événement formel", "Compétition de danse de salon", "Cours", "Performance"],
      visualCodes: "Tenue formelle ; smoking et nœud papillon pour l'homme, robe longue et élégante pour la femme. Chaussures de danse lisses. Port altier et gracieux.",
    },
    music: {
      genres: ["Valse classique", "Valse lente", "Valse musette"],
      description: "Musique légère et élégante, souvent pour orchestre avec cordes prédominantes, bois et cuivres discrets. Rythme ternaire régulier avec accent sur le premier temps. Mélodies gracieuses et romantiques.",
      keyArtists: ["Johann Strauss II", "Johann Strauss père", "Émile Waldteufel", "Joseph Lanner"],
    },
    keyFigures: [
      {
        category: "Compositeurs pionniers",
        figures: [
          { name: "Johann Strauss II", role: "Roi de la valse, compositeur de renom européen", note: "Définisseur de la valse viennoise classique" },
          { name: "Joseph Lanner", role: "Compositeur de valses et rivale historique de Strauss père" },
        ],
      },
      {
        category: "Danseurs de compétition modernes",
        figures: [
          { name: "Divers champions mondiaux de ballroom", role: "Maîtres de la valse de compétition standardisée" },
        ],
      },
    ],
    franceHistory: "La valse s'est implantée en France au XIXe siècle, devenant symbole de l'aristocratie et de la Belle Époque. Les bals masqués parisiens popularisent la valse. Les bal-musettes français (variante française plus légère) deviennent institutions. Aujourd'hui, la valse se pratique dans les écoles de danse de salon français, les événements formels et les compétitions. Paris conserve une tradition de valse classique.",
    relatedStyles: ["foxtrot", "quickstep", "tango", "paso-doble"],
    commonConfusions: [
      {
        styles: "Valse viennoise et valse lente",
        explanation: "La valse viennoise est rapide et tournoyante (54-60 mesures/min), caractérisée par des rotations continues. La valse lente est solennelle et plus ample (30-40 mesures/min), avec des figures plus élaborées. Ce sont deux styles distincts, tous deux importants en compétition ballroom.",
      },
    ],
    resources: [
      {
        title: "The Waltz: The History of the Dance from 1740 to the Present Day",
        author: "Peter Moore",
        year: "2006",
        format: "Livre",
        description: "Histoire complète de la valse depuis ses origines jusqu'à l'époque moderne",
      },
    ],
    episodeLinks: [],
    autoMatchTerms: ["valse viennoise", "valse lente", "Strauss", "danse royale"],
    keywords: ["valse", "Vienne", "Autriche", "danse de salon", "élégance", "bal masqué", "Belle Époque"],
    seoTitle: "Valse — Danse de salon classique | Explorer les styles | Dance Lab",
    seoDescription: "Découvrez la valse : origines viennoises, styles régionaux, composition et tradition de danse de salon élégante.",
  },

  {
    slug: "lindy-hop",
    name: "Lindy Hop",
    aliases: ["lindy", "swing de Harlem", "jive américain"],
    family: "Danses sociales",
    era: "Années 1920-1940",
    originCountry: "États-Unis",
    originCity: "New York (Harlem)",
    summary: "Danse de couple énergique et joyeuse, caractérisée par des figures aériennes, des mouvements elastiques et une improvisation débridée ; reine du swing.",
    introduction: "Le Lindy Hop incarne la joie et la liberté des années 1920-1940 en Amérique. Né dans les clubs de jazz de Harlem, cette danse de couple révolutionnaire fusionne les rythmes du swing moderne avec l'esprit improviste du jazz. Le Lindy Hop se distingue par ses figures aériennes vertigineuses, ses mouvements elastiques et sa capacité à laisser les danseurs décoller littéralement du sol.\n\nCette danse représente un moment de libération culturelle : dans les clubs enfumés de Harlem, les danseurs noirs et la classe ouvrière blanche se rencontrent sur la piste de danse, transgressant les barrières raciales. Le Lindy Hop incarne l'esprit de la Grande Dépression triomphée et de la jeunesse indomptable.",
    origins: "Le Lindy Hop émerge à Harlem dans les années 1920-1930, se développant particulièrement au Savoy Ballroom (1926-1958), temple du swing et du jazz. La danse fusionne les traditions afro-américaines de danse sociale, la structure de couple européenne et la musique de jazz révolutionnaire. Le nom \"Lindy Hop\" reste débattu : certains évoquent Charles Lindbergh et son traversée atlantique (1927), d'autres le terme \"hop\" pour mouvement de saut.\n\nLe Lindy Hop se popularise rapidement aux États-Unis dans les années 1930-1940, avec des danseurs professionnels comme Frankie Manning et Dean Collins révolutionnant le style en ajoutant des figures aériennes spectaculaires. La Seconde Guerre mondiale dispersa les danseurs, mais le Lindy Hop survit grâce aux adeptes passionnés. Redécouvert dans les années 1980-1990, le Lindy Hop connaît aujourd'hui une renaissance mondiale.",
    timeline: [
      { year: "1926", event: "Ouverture du Savoy Ballroom à Harlem, foyer du Lindy Hop" },
      { year: "1928-1935", event: "Émergence du Lindy Hop ; premières figures définissant le style" },
      { year: "1935-1945", event: "Apogée du Lindy Hop ; popularité massive dans les États-Unis et les bases militaires alliées" },
      { year: "1940s", event: "Frankie Manning et autres pionniers créent les figures aériennes emblématiques" },
      { year: "1945-1970", event: "Déclin du Lindy Hop avec la fermeture du Savoy et l'émergence du rock'n'roll" },
      { year: "1980-1990", event: "Renaissance du Lindy Hop ; redécouverte par les historiens de la danse et les jeunes" },
      { year: "1990-présent", event: "Boom international du Lindy Hop ; festivals mondiaux, scène active, jeunes générations" },
    ],
    characteristics: {
      movements: "Mouvements elastiques et brisés, figures aériennes (throws), lancements spectaculaires du partenaire, jeu de jambes rapide et complexe, pivots, rotations du couple.",
      musicRelationship: "Dansée sur la musique de swing (jazz bebop, big band ; rythme 4/4, 100-200+ BPM selon l'époque). L'improvisation musicale des musiciens guide directement la danse.",
      improvisation: "Très haute improvisation ; chaque danse est unique et répondant musicalement. Les danseurs dialoguent avec la musique et leurs partenaires.",
      formats: ["Bal social/club", "Compétition", "Performance", "Jam session", "Cours"],
      visualCodes: "Tenue vintage années 1930-1940 : femmes en robes courtes et fluides, hommes en chemises larges et pantalons amples. Chaussures confortables de swing. Attitude énergique et joviale.",
    },
    music: {
      genres: ["Swing", "Jazz bebop", "Jump blues", "Boogie-woogie"],
      description: "Musique de jazz dynamique avec big bands, cuivres énergiques, saxophone et trompette solistes, piano et contrebasse énergétiques. Rythme swing marqué, phrasé décalé donnant sa saveur caractéristique.",
      keyArtists: ["Duke Ellington", "Count Basie", "Benny Goodman", "Chick Webb", "Louis Armstrong"],
    },
    keyFigures: [
      {
        category: "Pionniers et créateurs",
        figures: [
          { name: "Frankie Manning", role: "Danseur légendaire et innovateur du Lindy Hop", note: "Créateur des figures aériennes emblématiques, figura clé de la scène du Savoy" },
          { name: "Dean Collins", role: "Danseur de style West Coast, populariseur du Lindy Hop en Californie" },
          { name: "Whitey's Lindy Hoppers", role: "Groupe de danseurs pionniers du Savoy Ballroom" },
        ],
      },
      {
        category: "Musiciens swing",
        figures: [
          { name: "Chick Webb", role: "Chef d'orchestre du Savoy, créateur d'une musique pour le Lindy Hop" },
          { name: "Count Basie", role: "Pianiste et chef d'orchestre swing, compositeur de standards de swing" },
        ],
      },
    ],
    franceHistory: "Le Lindy Hop arrive en France tardivement, surtout après les années 1980 via la redécouverte internationale. Aujourd'hui, la France accueille une communauté active de Lindy Hop : Paris, Lyon et d'autres villes proposent régulièrement des cours et des bals. Des festivals français de swing accueillent des danseurs internationaux. La France participe aux compétitions mondiales de Lindy Hop.",
    relatedStyles: ["swing", "charleston", "boogie-woogie", "rock'n'roll"],
    commonConfusions: [
      {
        styles: "Lindy Hop et Charleston",
        explanation: "Le Charleston (années 1920) privilégie les mouvements individuels et de groupe énergiques, avec peu de contact de couple. Le Lindy Hop (années 1930+) est centré sur le couple, avec des figures complexes et des lancers aériens. Ce sont deux styles de swing distincts.",
      },
      {
        styles: "Lindy Hop et West Coast Swing",
        explanation: "Le Lindy Hop est explosif, centrifuge et très aérien (figures de lancer). Le West Coast Swing est plus linéaire, compact et terrestre. Styles distincts malgré une certaine parenté.",
      },
    ],
    resources: [
      {
        title: "Frankie Manning: Ambassador of the Lindy Hop",
        author: "Julie Malnig (éditrice)",
        year: "2009",
        format: "Livre",
        description: "Biographie et histoire du Lindy Hop via la figure de Frankie Manning",
      },
      {
        title: "Swingin' at the Savoy",
        author: "Various historians",
        year: "2010",
        format: "Documentaire",
        description: "Histoire du Savoy Ballroom et du Lindy Hop à Harlem",
      },
    ],
    episodeLinks: [],
    autoMatchTerms: ["swing", "Savoy Ballroom", "Harlem swing", "Frankie Manning"],
    keywords: ["Lindy Hop", "swing", "jazz", "Harlem", "années 1930-1940", "figures aériennes", "danse de couple"],
    seoTitle: "Lindy Hop — Danse swing de Harlem | Explorer les styles | Dance Lab",
    seoDescription: "Découvrez le Lindy Hop : origines de Harlem, figures aériennes, Savoy Ballroom, et la renaissance contemporaine du swing.",
  },

  {
    slug: "charleston",
    name: "Charleston",
    aliases: ["Charleston dance"],
    family: "Danses sociales",
    era: "Années 1920-1930",
    originCountry: "États-Unis",
    originCity: "Charleston (Afro-américains) puis Harlem (popularisation)",
    summary: "Danse énergique et révolutionnaire, caractérisée par des mouvements des jambes extrêmes, des bras libres et une attitude insouciante ; symbole de la jeunesse des années 1920.",
    introduction: "Le Charleston est la danse de la rébellion joyeuse. Née au cœur de la communauté afro-américaine, cette danse individuelle ou de groupe scandaleuse pour l'époque devient le symbole de la jeunesse insoucieuse des années 1920. Les mouvements extrêmes des jambes (pieds en rotation, coups de pied), les bras libres et l'attitude dégagée du Charleston brisent les conventions victoriennes de dignité corporelle.\n\nLe Charleston représente la libération : libération des corsets, des mouvements contraints, des convenances. C'est la danse du Jazz Age, de la Prohibition, de l'émancipation des femmes.",
    origins: "Le Charleston émerge dans les quartiers afro-américains de Charleston (Caroline du Sud) et Savannah (Géorgie) vers 1903, issu des traditions de danse afro-américaine, du ragtime et de la musique populaire. La danse reste d'abord confinée aux communautés noires du Sud.\n\nLe véritable explosion du Charleston intervient à Harlem dans les années 1920, particulièrement au club Harlem Renaissance et au Savoy Ballroom. La célébrité du comédien et danseur James P. Johnson popularise le Charleston nationales et internationalement. Le Charleston conquiert rapidement les États-Unis, l'Europe et le monde, cristallisant l'esprit des Années folles.\n\nLe Charleston provoque un scandale moral : l'église condamne la danse, des autorités la bannissent des établissements publics, certains observateurs craignent pour la morale publique. Cette controverse même l'amplifie en symbole de jeunesse rebelleuse et libération.",
    timeline: [
      { year: "1903", event: "Émergence du Charleston dans les communautés afro-américaines du Sud" },
      { year: "1923", event: "Le Charleston arrive à Harlem ; popularité croissante dans les clubs noirs" },
      { year: "1924-1925", event: "Explosion du Charleston en Amérique du Nord et en Europe ; devient symbole du Jazz Age" },
      { year: "1925-1930", event: "Apogée du Charleston ; popularité massive malgré oppositions morales et interdictions" },
      { year: "1930s", event: "Le Charleston décline progressivement avec l'émergence du swing et du Lindy Hop" },
      { year: "1980s-présent", event: "Renaissance historique du Charleston ; redécouverte par les jeunes via films vintage et danse historique" },
    ],
    characteristics: {
      movements: "Mouvements des jambes extrêmes (kicks, twists, rotations des pieds), bras libres, rotations du corps, énergie brute, attitude faciale joyeuse.",
      musicRelationship: "Dansé sur des rythmes de jazz rapides et syncopés (100-200+ BPM). Chaque geste épouse l'énergie irrépressible de la musique.",
      improvisation: "Très haute improvisation ; chaque danseur interprète le rythme à sa manière, sans structure formelle.",
      formats: ["Bal social", "Performance", "Danse de groupe", "Jam session"],
      visualCodes: "Tenue années 1920 : femmes en robes courtes et droites (flapper), garçonne, cheveux courts ; hommes en vestons amples et chapeaux de feutre. Attitude joyeuse et provocatrice.",
    },
    music: {
      genres: ["Jazz", "Ragtime", "Jazz traditionnel"],
      description: "Musique de jazz dynamique, saxophones énergiques, trompettes, pianos ragtime syncopés. Rythme dansant et irrépressiblement joyeux.",
      keyArtists: ["Duke Ellington", "Louis Armstrong", "Jelly Roll Morton"],
    },
    keyFigures: [
      {
        category: "Danseurs pionniers",
        figures: [
          { name: "James P. Johnson", role: "Compositeur, danseur et figure clé de la popularisation du Charleston" },
          { name: "Florence Mills", role: "Danseuse afro-américaine, ambassadrice du Charleston" },
        ],
      },
    ],
    franceHistory: "Le Charleston arrive en France au milieu des années 1920 via les contacts avec le jazz américain et les expatriés. Paris devient un centre majeur du Charleston européen, scandalisant la bourgeoisie française tout en fascinant la jeunesse. Le Charleston contribue à la libération des conventions sociales françaises.",
    relatedStyles: ["lindy-hop", "swing", "jazz", "boogie-woogie"],
    commonConfusions: [
      {
        styles: "Charleston et Lindy Hop",
        explanation: "Le Charleston (années 1920) peut être dansé individuellement ou en groupe, sans partenaire fixe. Le Lindy Hop (années 1930+) est une danse de couple structurée avec des figures définies. Styles distincts d'ères différentes.",
      },
    ],
    resources: [
      {
        title: "Jazz Dance: The Story of American Vernacular Dance",
        author: "Marshall Stearns and Jean Stearns",
        year: "1994",
        format: "Livre",
        description: "Histoire complète des danses jazz et vernaculaires, incluant le Charleston",
      },
    ],
    episodeLinks: [],
    autoMatchTerms: ["danse des années 1920", "Jazz Age", "flapper dance"],
    keywords: ["Charleston", "années 1920", "jazz", "Harlem", "jeunesse rebelleuse", "libération", "danse individuelle"],
    seoTitle: "Charleston — Danse révolutionnaire des années 1920 | Explorer les styles | Dance Lab",
    seoDescription: "Découvrez le Charleston : origines afro-américaines, mouvements libres, symbole de la jeunesse des années 1920 et du Jazz Age.",
  },

  {
    slug: "jive",
    name: "Jive",
    aliases: ["jive de compétition", "jive de ballroom"],
    family: "Danses sociales",
    era: "Années 1940-1950",
    originCountry: "États-Unis / Grande-Bretagne",
    originCity: "Harlem (États-Unis) / Londres (codification)",
    summary: "Danse de couple énergique et acrobatique, codifiée pour la compétition, dérivée du Lindy Hop et du swing ; incluse dans les compétitions de danse de salon.",
    introduction: "Le Jive est une formalisation du swing pour la compétition. Né du Lindy Hop et du swing populaire, le Jive est standardisé par les organisateurs britanniques de danse de ballroom dans les années 1950. Danse de couple explosive, elle se caractérise par des mouvements bruts, des rebonds énergiques et une énergie électrisante.\n\nContrairement à son précurseur improvisé, le Jive de compétition suit un cadre strictement défini avec des figures nommées et une technique précise. C'est la traduction compétitive du jazz et du swing joyeux.",
    origins: "Le Jive s'enracine dans le Lindy Hop et le swing des années 1940, mais se développe comme variante distinct en Grande-Bretagne. Les Britanniques codifient progressivement le Jive pour la compétition de danse de ballroom, standardisant les mouvements et les figures. Dans les années 1950-1960, le Jive devient l'une des cinq danses de compétition de « Standard Latin » ballroom.\n\nLa codification distingue le Jive du Lindy Hop : mouvements moins aériens, figures définies, posture spécifique. Le Jive emprunte au rock'n'roll émergent, devenant la danse de compétition par excellence pour la musique rhythmique et énergique.",
    timeline: [
      { year: "1940s", event: "Émergence du Jive comme variante américaine de swing" },
      { year: "1950s", event: "Codification du Jive par les organisateurs britanniques de ballroom" },
      { year: "1960-présent", event: "Le Jive devient l'une des cinq danses compétitives de ballroom Latin" },
    ],
    characteristics: {
      movements: "Mouvements bruts et énergiques, rebonds du couple, kicks, twists, isolations du bassin, rotations rapides, peu de figures aériennes comparé au Lindy Hop.",
      musicRelationship: "Dansé sur des rythmes rapides de rock et de swing (120-160 BPM).",
      improvisation: "Faible improvisation ; figures standardisées de compétition.",
      formats: ["Compétition de ballroom", "Performance"],
      visualCodes: "Tenue formelle de compétition ballroom ; smoking pour l'homme, robe de danse élégante pour la femme.",
    },
    music: {
      genres: ["Rock'n'roll", "Swing", "Jump blues"],
      description: "Musique rapide, énergique, avec pianos, saxophones, rythmes percussifs marqués.",
      keyArtists: ["Bill Haley", "Elvis Presley"],
    },
    keyFigures: [
      {
        category: "Organisateurs de compétition",
        figures: [
          { name: "Danseurs de ballroom britanniques", role: "Codificateurs du Jive de compétition" },
        ],
      },
    ],
    franceHistory: "Le Jive s'est implanté en France via la scène internationale de danse de ballroom. Aujourd'hui, le Jive est pratiqué dans les écoles de danse de salon français et les compétitions nationales et internationales.",
    relatedStyles: ["lindy-hop", "rock", "swing"],
    resources: [
      {
        title: "Ballroom Dance: A Guide for Dancers and Teachers",
        author: "Alexander Moore",
        year: "2004",
        format: "Livre",
        description: "Guide complet incluant le Jive et les danses de ballroom",
      },
    ],
    episodeLinks: [],
    autoMatchTerms: ["compétition ballroom", "rock'n'roll dance"],
    keywords: ["Jive", "compétition ballroom", "danse de couple", "rock'n'roll", "énergie"],
    seoTitle: "Jive — Danse de compétition ballroom | Explorer les styles | Dance Lab",
    seoDescription: "Découvrez le Jive : danse de compétition énergique codifiée, dérivée du Lindy Hop et du swing.",
  },

  {
    slug: "cha-cha-cha",
    name: "Cha-cha-cha",
    aliases: ["cha-cha", "cha-cha-cha cubain"],
    family: "Danses sociales",
    era: "Années 1950",
    originCountry: "Cuba",
    originCity: "La Havane",
    summary: "Danse de couple ludique et sensuelle, caractérisée par une gesticulation des hanches marquée et un rythme ternaire distinctif ; fusion cubaine du mambo et du tango.",
    introduction: "Le Cha-cha-cha incarne la joie de vivre cubaine et la séduction ludique. Née à La Havane dans les années 1950, cette danse fusionne l'énergie du mambo avec une sensualité plus marquée. Le Cha-cha-cha se caractérise par un rythme distinctif (2-3-cha-cha-cha), des mouvements de hanche fluides et une attitude joyeuse du couple.\n\nContrairement à la salsa énergique ou au tango mélancolique, le Cha-cha-cha cultive la légèreté et la séduction platonique. C'est une danse de flirt, de jeu, de partage de plaisir.",
    origins: "Le Cha-cha-cha émerge à Cuba, probablement comme variation du mambo ou du danzón, avec l'addition d'un rythme ternaire distinctif (cha-cha-cha). Compositeurs et musiciens cubains comme Enrique Jorrín jouent un rôle clé dans sa popularisation musicale. La danse se popularise à La Havane puis se diffuse internationalement via les musiciens cubains en exil.\n\nLe Cha-cha-cha est rapidement codifié pour la compétition de ballroom, parallèlement à sa pratique sociale. Les Britanniques standardisent ses figures, le rendant une danse compétitive majeure aux côtés du tango et de la valse.",
    timeline: [
      { year: "1950", event: "Émergence du Cha-cha-cha à Cuba, création musicale et chorégraphique" },
      { year: "1950s", event: "Popularisation à La Havane et diffusion internationale" },
      { year: "1960s", event: "Codification pour compétition de ballroom ; standardisation des figures" },
      { year: "1960-présent", event: "Le Cha-cha-cha reste une danse compétitive et sociale majeure" },
    ],
    characteristics: {
      movements: "Mouvements de hanche fluideset marqués, jeu de jambes spécifique (three-cha-cha-cha), rotations du couple, flair de bras, attitude ludique.",
      musicRelationship: "Rythme binaire avec accent ternaire (2-3-cha-cha-cha), créant une signature musicale distinctive (100-128 BPM en compétition).",
      improvisation: "Modérée ; figures standardisées de compétition, mais variations sociales plus libres.",
      formats: ["Bal social", "Compétition de ballroom", "Performance"],
      visualCodes: "Tenue de compétition ou vêtements colorés pour le bal social. Attitude ludique et séductrice.",
    },
    music: {
      genres: ["Cha-cha-cha cubain", "Mambo", "Danzón"],
      description: "Musique cubaine avec rythme distinctif, instruments à vent (saxophones, trompettes), percussions (claves, congas), piano.",
      keyArtists: ["Enrique Jorrín", "Tito Puente"],
    },
    keyFigures: [
      {
        category: "Compositeurs cubains",
        figures: [
          { name: "Enrique Jorrín", role: "Compositeur cubain créateur du style musical Cha-cha-cha" },
        ],
      },
    ],
    franceHistory: "Le Cha-cha-cha s'est implanté en France via la popularité internationale de la musique cubaine et les compétitions de danse de ballroom. Aujourd'hui, le Cha-cha-cha est pratiqué dans les écoles de danse de salon et compétitions françaises.",
    relatedStyles: ["mambo", "salsa", "danzón"],
    commonConfusions: [
      {
        styles: "Cha-cha-cha et Mambo",
        explanation: "Le Mambo est plus rapide, énergique et moins intime que le Cha-cha-cha. Le Cha-cha-cha privilégie un rythme ternaire distinctif et une sensualité joyeuse. Styles musicalement et chorégraphiquement distincts.",
      },
    ],
    resources: [
      {
        title: "Cuban Dance: An Illustrated History",
        author: "Julie Malnig",
        year: "2004",
        format: "Livre",
        description: "Histoire illustrée des danses cubaines, incluant le Cha-cha-cha",
      },
    ],
    episodeLinks: [],
    autoMatchTerms: ["mambo cubain", "danzón"],
    keywords: ["Cha-cha-cha", "Cuba", "danse sensuelle", "ludique", "mambo", "compétition ballroom"],
    seoTitle: "Cha-cha-cha — Danse cubaine ludique | Explorer les styles | Dance Lab",
    seoDescription: "Découvrez le Cha-cha-cha : origines cubaines, rythme distinctif, sensualité ludique et compétition de ballroom.",
  },

  {
    slug: "rumba",
    name: "Rumba",
    aliases: ["rumba cubaine", "rumba de ballroom", "rumba de salon"],
    family: "Danses sociales",
    era: "Années 1900-1920",
    originCountry: "Cuba",
    originCity: "La Havane / zones urbaines",
    summary: "Danse de couple sensuelle et passionnée, caractérisée par des mouvements de hanche fluideset une connexion corporelle étroite ; danse rituelle afro-caribéenne avec variantes sociales et compétitives.",
    introduction: "La Rumba incarne la passion charnelle et la sexualité assumée. Née de l'alchimie entre les traditions africaines, espagnoles et caribéennes, la Rumba cubaine est une danse de séduction, d'émancipation du corps et de liberté sensuelle. La posture rapprochée, les mouvements de hanche fluides et la connexion étroite du couple font de la Rumba une danse d'intimité partitale.\n\nIl existe cependant une distinction cruciale : la Rumba cubaine (sociale, afro-descendante, intime) et la Rumba de ballroom (compétitive, standardisée, spectaculaire) sont deux univers différents. La première raconte une histoire de désir; la seconde stylise ce désir pour la compétition.",
    origins: "La Rumba émerge à Cuba au début du XXe siècle (probablement vers 1900-1920) dans les zones urbaines de La Havane. Ses racines s'enfoncent profondément dans les traditions musicales afro-cubaines, les traditions africaines des esclaves libérés, et les influences espagnoles. La Rumba mélange des éléments de danse congolaise (le « rumbao »), du son cubano et des traditions de danse couples caribéennes.\n\nMusicallement et chorégraphiquement, la Rumba se développe en plusieurs variantes. La Rumba cubaine traditionnelle privilégie l'improvisation, la proximité du couple et l'expression sensuelle. Quant à la Rumba de ballroom, elle émerge dans les années 1920-1930, codifiée par les Britanniques pour la compétition. Cette variante standardise les figures, augmente le spectacle et redéfinit la Rumba en danse de compétition.\n\nCette scission entre Rumba cubaine et Rumba de ballroom est fondamentale et souvent source de confusion.",
    timeline: [
      { year: "1900-1920", event: "Émergence de la Rumba cubaine en tant que danse sociale de Cuba" },
      { year: "1920-1930", event: "Popularisation de la Rumba ; codification pour compétition de ballroom (Britanniques)" },
      { year: "1930-1960", event: "Apogée de la Rumba, tant cubaine que de compétition ; diffusion mondiale" },
      { year: "1960-présent", event: "Rumba cubaine persiste dans les bals sociaux; Rumba de ballroom demeure danse compétitive majeure" },
    ],
    characteristics: {
      movements: "Mouvements de hanche fluides et sensuels, rotation du bassin, pas marchés proches, connexion corporelle étroite, isolations du bassin, mouvements ondulatoires du corps.",
      musicRelationship: "Rythme binaire cubain (2/4 ou 4/8, 92-110 BPM environ). La musique guide la danse émotionnellement.",
      improvisation: "Très haute improvisation pour la Rumba cubaine; faible improvisation pour la Rumba de ballroom (figures standardisées).",
      formats: ["Bal social (Rumba cubaine)", "Compétition de ballroom (Rumba de compétition)", "Performance"],
      visualCodes: "Tenue rapprochée et sensuelle pour la Rumba cubaine. Tenue formelle de compétition pour la Rumba de ballroom.",
    },
    music: {
      genres: ["Rumba cubaine", "Son cubano", "Rumba de ballroom"],
      description: "Musique cubaine avec cuivres, percussions complexes (claves, congas, cloches), pianos, voix. Rythme syncopé cubain caractéristique.",
      keyArtists: ["Beny Moré", "Los Muñequitos de Matanzas", "Tito Puente"],
    },
    keyFigures: [
      {
        category: "Musiciens et compositeurs",
        figures: [
          { name: "Beny Moré", role: "Chanteur et musicien cubain légendaire" },
          { name: "Los Muñequitos de Matanzas", role: "Groupe traditionnel cubain, gardiens de la Rumba cubaine" },
        ],
      },
    ],
    franceHistory: "La Rumba s'est implantée en France via les musiciens cubains en exil et l'influence de la musique latino-américaine. Aujourd'hui, la France accueille une communauté active de danseurs de Rumba. Les compétitions de danse de ballroom français incluent la Rumba compétitive.",
    relatedStyles: ["salsa", "mambo", "cha-cha-cha"],
    commonConfusions: [
      {
        styles: "Rumba cubaine et Rumba de ballroom",
        explanation: "La Rumba cubaine est improvisation sociale, intime et enracinée dans les traditions afro-cubaines. La Rumba de ballroom est standardisée, spectaculaire et conçue pour la compétition. Ce sont deux pratiques parallèles mais distinctes, avec origines, techniques et contextes différents.",
      },
      {
        styles: "Rumba et Salsa",
        explanation: "Bien que toutes deux cubaines ou caribéennes, la Rumba privilégie l'intimité sensuelle et le rythme binaire cubain traditionnel. La Salsa est énergique, spectaculaire et utilise la clave 5/8. Styles distincts.",
      },
    ],
    resources: [
      {
        title: "Rumba: Dance and Social Change in Contemporary Cuba",
        author: "Yvonne Daniel",
        year: "1995",
        format: "Livre",
        description: "Étude anthropologique de la Rumba cubaine et de son rôle social",
      },
    ],
    episodeLinks: [],
    autoMatchTerms: ["rumba cubaine", "danse afro-cubaine"],
    keywords: ["Rumba", "Cuba", "sensualité", "danse de couple", "tradition afro-cubaine", "compétition ballroom"],
    seoTitle: "Rumba — Danse sensuelle cubaine | Explorer les styles | Dance Lab",
    seoDescription: "Découvrez la Rumba : origines cubaines, mouvements sensuels, distinction entre Rumba cubaine et Rumba de ballroom.",
  },

  {
    slug: "samba",
    name: "Samba",
    aliases: ["samba brésilienne", "samba de Carnaval", "samba de ballroom"],
    family: "Danses sociales",
    era: "Années 1920-1930",
    originCountry: "Brésil",
    originCity: "Rio de Janeiro",
    summary: "Danse de couple énergique et joyeuse, caractérisée par des mouvements de hanche rapides, une énergie irrépressible et un rythme syncopé; danse du Carnaval brésilien et compétition de ballroom.",
    introduction: "La Samba est pure joie. Cette danse brésilienne incarne l'esprit festif, l'énergie du Carnaval et l'exubérance du Brésil. Née de la fusion entre les traditions africaines, les danses portugaises et la musique brésilienne populaire, la Samba explose sur les pistes de danse avec des mouvements de hanche rapides, une sexualité assumée et une atmosphère de fête collective.\n\nComme la Rumba, la Samba se divise en plusieurs variantes : la Samba brésilienne du Carnaval (collective, improvisée, effrénée) et la Samba de ballroom (dansée en couple, standardisée, plus calme que son homologue carnavalesque). La Samba de Carnaval est une explosion de couleurs, de plumes et de rythme; la Samba de ballroom, une interprétation stylisée et technique de cette joie.",
    origins: "La Samba émerge au Brésil au début du XXe siècle (années 1920-1930), résultant de la fusion entre les traditions musicales et chorégraphiques africaines (samba-de-morro), le samba-enredo et les traditions portugaises. Née d'abord dans les communautés populaires de Rio de Janeiro, la Samba s'enracine profondément dans la culture afro-brésilienne.\n\nLa Samba se popularise progressivement, cristallisée notamment lors du premier Carnaval organisé de Rio (années 1930s+). Les écoles de Samba émergent, transformant la Samba en événement communautaire et culturel majeur. Parallèlement, la Samba est codifiée pour la compétition de ballroom par les Britanniques dans les années 1950-1960, créant une variante plus formelle et technique.\n\nLa distinction entre Samba brésilienne (collective, libre, carnavalesque) et Samba de ballroom (couple, standardisée) est cruciale.",
    timeline: [
      { year: "1920-1930", event: "Émergence de la Samba dans les communautés afro-brésiliennes de Rio" },
      { year: "1930s", event: "Premiers Carnavals organisés avec Samba; popularisation massive" },
      { year: "1950s-1960s", event: "Codification de la Samba de ballroom pour compétition" },
      { year: "1960-présent", event: "Samba du Carnaval continue; Samba de ballroom incluse dans compétitions internationales" },
    ],
    characteristics: {
      movements: "Mouvements de hanche rapides et fluides, ondulation du bassin, pas marchés énergiques, isolations du bassin, mouvement perpétuel.",
      musicRelationship: "Rythme binaire brésilien syncopé (2/4, 164-180 BPM environ pour compétition). Musique entraînante et irresistible.",
      improvisation: "Très haute improvisation pour Samba du Carnaval; modérée pour Samba de ballroom (figures standardisées).",
      formats: ["Parade du Carnaval (Samba brésilienne)", "Bal social", "Compétition de ballroom", "Événement communautaire"],
      visualCodes: "Couleurs éclatantes et costumes élaborés pour Carnaval. Tenue de compétition pour ballroom. Attitude joyeuse et exubérante.",
    },
    music: {
      genres: ["Samba", "Samba-enredo", "Samba-no-pé"],
      description: "Musique brésilienne avec percussions complexes (timbales, congas, sordo, agogo), cuivres, voix. Rythme syncopé brésilien distinctif, pulsation énergique.",
      keyArtists: ["Alcione", "Cartola", "Portela (école de Samba)"],
    },
    keyFigures: [
      {
        category: "Musiciens et artistes",
        figures: [
          { name: "Alcione", role: "Chanteuse de Samba brésilienne légendaire" },
          { name: "Portela", role: "École de Samba historique de Rio de Janeiro" },
        ],
      },
    ],
    franceHistory: "La Samba brésilienne s'est diffusée en France via les contacts culturels avec le Brésil et la diaspora brésilienne. Paris accueille régulièrement des événements de Samba et des écoles de danse. La Samba de ballroom s'est implantée via les compétitions internationales.",
    relatedStyles: ["rumba", "mambo", "cha-cha-cha"],
    commonConfusions: [
      {
        styles: "Samba de Carnaval et Samba de ballroom",
        explanation: "La Samba du Carnaval est collective, libre et effrénée, exécutée par des groupes. La Samba de ballroom est une danse de couple strictement codifiée. Ce sont deux approches très différentes de la Samba.",
      },
    ],
    resources: [
      {
        title: "Samba: The Social Dance of Brazil",
        author: "Alma Guillermoprieto",
        year: "1990",
        format: "Livre",
        description: "Histoire culturelle de la Samba au Brésil et son rôle social",
      },
    ],
    episodeLinks: [],
    autoMatchTerms: ["Carnaval brésilien", "samba do Brasil", "école de Samba"],
    keywords: ["Samba", "Brésil", "Carnaval", "Rio de Janeiro", "joie", "danse collective", "compétition ballroom"],
    seoTitle: "Samba — Danse festive brésilienne | Explorer les styles | Dance Lab",
    seoDescription: "Découvrez la Samba : origines brésiliennes, Carnaval de Rio, mouvements énergiques, et variantes de compétition.",
  },

  {
    slug: "paso-doble",
    name: "Paso doble",
    aliases: ["paso-doble espagnol"],
    family: "Danses sociales",
    era: "Fin XIXe siècle / début XXe siècle",
    originCountry: "Espagne",
    originCity: "Andalousie (probablement)",
    summary: "Danse de couple dramatique et structurée, caractérisée par une posture militaire, des mouvements précis et une narration théâtrale imitant le toréador; danse de compétition spectaculaire.",
    introduction: "Le Paso Doble incarne le théâtre corporel. Cette danse espagnole stylisée évoque le drame des arènes : le toréador (l'homme) face au taureau, avec la femme incarnant souvent la muleta (la cape) ou une figure féminine spectaculaire. Caractérisée par une posture martiale, des mouvements précis et une narrativité dramatique, le Paso Doble est performance plutôt que danse sociale libérée.\n\nContrairement aux danses de couple sociales où l'intimité et l'improvisation règnent, le Paso Doble est metteur en scène; chaque mouvement raconte une histoire de fierté espagnole, de courage et de théâtralité.",
    origins: "Le Paso Doble émerge probablement en Andalousie, Espagne, au XIXe siècle, s'inspirant du drame des corridas de taureaux et de la musique espagnole traditionnelle. Les origines exactes demeurent débattues, mais la danse cristallise comme accompagnement musical et chorégraphique de l'esprit espagnol tauromachique. Le Paso Doble se développe d'abord dans les régions du sud de l'Espagne.\n\nLe Paso Doble est progressivement codifié pour la compétition de danse de ballroom, particulièrement par les Britanniques dans les années 1920-1930. Cette codification le transforme d'une danse régionale espagnole en danse compétitive internationalisée, standardisée et hautement théâtrale. Le Paso Doble compétitif diffère significativement de toute variante populaire antérieure.",
    timeline: [
      { year: "1800s", event: "Émergence du Paso Doble en Espagne, s'inspirant de la musique et du drame tauromachique" },
      { year: "1920s-1930s", event: "Codification du Paso Doble pour compétition de ballroom" },
      { year: "1950-présent", event: "Paso Doble demeure danse de compétition ballroom majeure" },
    ],
    characteristics: {
      movements: "Posture martiale et droite, mouvements précis et angulaires, pas marchés militaires, rotations du couple, mouvements dramatiques des bras, positionnement théâtral.",
      musicRelationship: "Rythme binaire simple (2/4, 62-120 BPM). Musique espagnole traditionnelle ou compositions spécialisées pour compétition.",
      improvisation: "Faible improvisation ; figures strictement définies et chorégraphées.",
      formats: ["Compétition de ballroom", "Performance", "Événement formel"],
      visualCodes: "Tenue formelle de compétition ; smoking et nœud papillon pour l'homme, costume dramatique et cape pour la femme (évoquant l'ambiance tauromachique).",
    },
    music: {
      genres: ["Paso Doble", "Musique espagnole traditionnelle"],
      description: "Musique dramatique, souvent composée spécialement pour compétition. Cuivres, percussions, guitares espagnoles créent une ambiance théâtrale et martiale.",
      keyArtists: ["Compositeurs de Paso Doble spécialisés"],
    },
    keyFigures: [
      {
        category: "Standardisateurs de compétition",
        figures: [
          { name: "Organisateurs britanniques de ballroom", role: "Codification du Paso Doble pour compétition" },
        ],
      },
    ],
    franceHistory: "Le Paso Doble s'est implanté en France via les compétitions internationales de danse de ballroom et l'influence culturelle espagnole. Aujourd'hui, le Paso Doble est pratiqué dans les écoles de danse de salon français et les compétitions.",
    relatedStyles: ["tango", "valse", "foxtrot"],
    commonConfusions: [
      {
        styles: "Paso Doble et Flamenco",
        explanation: "Le Paso Doble est une danse de couple formelle et codifiée pour compétition. Le Flamenco est une danse solistaire émotionnelle de danse traditionnelle espagnole. Styles entièrement différents.",
      },
    ],
    resources: [
      {
        title: "Ballroom Dance: A Guide for Dancers and Teachers",
        author: "Alexander Moore",
        year: "2004",
        format: "Livre",
        description: "Guide complet incluant le Paso Doble",
      },
    ],
    episodeLinks: [],
    autoMatchTerms: ["toréador", "danse espagnole", "corrida"],
    keywords: ["Paso Doble", "Espagne", "danse théâtrale", "compétition ballroom", "toréador", "spectaculaire"],
    seoTitle: "Paso Doble — Danse théâtrale espagnole | Explorer les styles | Dance Lab",
    seoDescription: "Découvrez le Paso Doble : origines espagnoles, drame tauromachique, et danse de compétition spectaculaire.",
  },

  {
    slug: "foxtrot",
    name: "Foxtrot",
    aliases: ["foxtrot lent", "foxtrot rapide", "standard foxtrot"],
    family: "Danses sociales",
    era: "Années 1910-1920",
    originCountry: "États-Unis",
    originCity: "New York",
    summary: "Danse de couple élégante et fluide, caractérisée par une démarche glissée (feather step) et une légèreté naturelle; danse de compétition de ballroom classique.",
    introduction: "Le Foxtrot incarne l'élégance urbaine américaine. Née à New York lors des années 1910-1920, cette danse de couple se caractérise par une fluidité naturelle, une démarche glissée et une impression de glisse continue sur la piste. Contrairement au Charleston énergique ou à la valse tournoyante, le Foxtrot cultive une élégance sobre et une fluidité horizontale.\n\nLe Foxtrot est la danse des salles de bal sophistiquées, des musiques de jazz standards, de l'élégance intemporelle de la Belle Époque américaine. Dansée en couple rapproché, elle demande une écoute musicale fine et une harmonie physique étroite.",
    origins: "Le Foxtrot émerge à New York vers 1912-1914, attribué au danseur Harry Fox (bien que l'attribution soit débattue). La danse fusionne les influences de valse, de mouvements naturels de marche et du style de danse jazz émergent. Le Foxtrot se popularise rapidement dans les salles de bal new-yorkaises et américaines, devenant la danse de couple par excellence aux États-Unis.\n\nLe Foxtrot est progressivement standardisé pour la compétition de ballroom, particulièrement par les Britanniques. Cette codification crée deux variantes : le Foxtrot lent (slow foxtrot ou standard foxtrot) et le Foxtrot rapide (quickstep), chacun avec ses figures définies et ses caractéristiques techniques.",
    timeline: [
      { year: "1912-1914", event: "Émergence du Foxtrot à New York, attribué au danseur Harry Fox" },
      { year: "1920s", event: "Popularisation massive du Foxtrot aux États-Unis et en Europe" },
      { year: "1920s-1930s", event: "Codification du Foxtrot pour compétition de ballroom" },
      { year: "1950-présent", event: "Foxtrot demeure danse de compétition ballroom classique" },
    ],
    characteristics: {
      movements: "Démarche glissée (feather step), fluidité naturelle, mouvements horizontaux, rotations douces du couple, pas marchés légers, isolations minimalistes.",
      musicRelationship: "Rythme binaire (2/4 ou 4/4, 28-30 mesures/min pour Slow Foxtrot, 50-52 pour Quickstep). La musique de jazz standards guide la danse.",
      improvisation: "Faible improvisation ; figures standardisées de compétition.",
      formats: ["Bal social", "Compétition de ballroom", "Performance"],
      visualCodes: "Tenue formelle de compétition. Posture droite et élancée, mouvement fluide et naturel.",
    },
    music: {
      genres: ["Jazz standards", "Foxtrot classique"],
      description: "Musique de jazz lisse, souvent avec standards de la Grande Époque. Cordes, pianos, rythme régulier permettant la fluidité de la danse.",
      keyArtists: ["Fred Astaire", "Ginger Rogers"],
    },
    keyFigures: [
      {
        category: "Danseurs pionniers",
        figures: [
          { name: "Fred Astaire", role: "Danseur légendaire de Foxtrot et d'autres danses de ballroom" },
          { name: "Ginger Rogers", role: "Danseuse partenaire d'Astaire, symbole de l'élégance de danse de ballroom" },
        ],
      },
    ],
    franceHistory: "Le Foxtrot s'est implanté en France via l'influence américaine et les compétitions internationales. Aujourd'hui, le Foxtrot est pratiqué dans les écoles de danse de salon français et compétitions.",
    relatedStyles: ["valse", "quickstep", "tango"],
    commonConfusions: [
      {
        styles: "Foxtrot et Quickstep",
        explanation: "Le Foxtrot (Slow Foxtrot) est lent, fluide et élégant. Le Quickstep est rapide, énergique et dynamique. Bien que dérivés du Foxtrot, ce sont deux danses distinctes avec caractéristiques très différentes.",
      },
    ],
    resources: [
      {
        title: "The Astaire Story",
        author: "Various",
        year: "2015",
        format: "Documentaire",
        description: "Documentaire sur Fred Astaire et le Foxtrot",
      },
    ],
    episodeLinks: [],
    autoMatchTerms: ["Fred Astaire", "jazz standards", "danse de ballroom"],
    keywords: ["Foxtrot", "élégance", "danse de couple", "compétition ballroom", "Fred Astaire", "New York"],
    seoTitle: "Foxtrot — Danse élégante de ballroom | Explorer les styles | Dance Lab",
    seoDescription: "Découvrez le Foxtrot : origines new-yorkaises, fluidité élégante, Fred Astaire, et compétition de ballroom.",
  },

  {
    slug: "quickstep",
    name: "Quickstep",
    aliases: ["Quickstep de ballroom"],
    family: "Danses sociales",
    era: "Années 1920-1930",
    originCountry: "Grande-Bretagne",
    originCity: "Londres",
    summary: "Danse de couple rapide et énergique, dérivée du Foxtrot et du Charleston, caractérisée par une vitesse effrénée et des mouvements vifs; danse de compétition spectaculaire.",
    introduction: "Le Quickstep est l'explosion d'énergie du Foxtrot. Née dans les années 1920-1930, cette danse de couple britannique fusionne la fluidité du Foxtrot avec l'énergie du Charleston, créant une danse vertigineuse et exhilarante. Le Quickstep se caractérise par sa rapidité (120+ pas par minute), ses mouvements vifs et sa légèreté apparente malgré l'effort intense.\n\nLe Quickstep incarne la joie de danser, la maîtrise technique et la virtuosité. C'est la danse la plus rapide des danses de compétition ballroom, exigeant une coordination extrême du couple et une musicalité fine.",
    origins: "Le Quickstep émerge en Grande-Bretagne dans les années 1920-1930, résultant de la fusion entre le Foxtrot standard et l'énergie du Charleston. Les danseurs britanniques codifient progressivement le Quickstep pour la compétition de ballroom, le standardisant comme la cinquième danse de compétition majeure (aux côtés du Waltz, Tango, Slowfox, Viennese Waltz).\n\nLe Quickstep n'a pas de véritable homologue dans la danse sociale ; c'est essentiellement une création de compétition britannique, sans racines culturelles profondes comme le Tango ou la Salsa. Cela le rend hautement stylisé et technique.",
    timeline: [
      { year: "1920-1930", event: "Émergence du Quickstep comme fusion du Foxtrot et du Charleston en Grande-Bretagne" },
      { year: "1930s-1950", event: "Codification et standardisation du Quickstep pour compétition de ballroom" },
      { year: "1950-présent", event: "Quickstep demeure l'une des cinq danses compétitives majeures de ballroom" },
    ],
    characteristics: {
      movements: "Mouvements vifs et précis, pasmarché rapide, rotations du couple, pivots rapides, isolations minimalistes, légèreté apparente.",
      musicRelationship: "Rythme binaire très rapide (4/4 ou 2/4, 50-52 mesures/min ou 200+ BPM). Musique rapide et entraînante.",
      improvisation: "Faible improvisation ; figures standardisées de compétition.",
      formats: ["Compétition de ballroom", "Performance"],
      visualCodes: "Tenue formelle de compétition. Posture droite, mouvements vifs et énergiques.",
    },
    music: {
      genres: ["Quickstep", "Jazz rapide"],
      description: "Musique de jazz rapide et entraînante, souvent standards de jazz. Rythme très marqué permettant la vélocité de la danse.",
      keyArtists: ["Compositeurs de Quickstep spécialisés"],
    },
    keyFigures: [
      {
        category: "Standardisateurs de compétition",
        figures: [
          { name: "Danseurs britanniques de ballroom", role: "Créateurs et codificateurs du Quickstep" },
        ],
      },
    ],
    franceHistory: "Le Quickstep s'est implanté en France via les compétitions internationales de danse de ballroom. Aujourd'hui, le Quickstep est pratiqué dans les écoles de danse de salon français et compétitions.",
    relatedStyles: ["foxtrot", "valse viennoise", "charleston"],
    commonConfusions: [
      {
        styles: "Quickstep et Foxtrot",
        explanation: "Le Foxtrot (Slow Foxtrot) est lent, fluide et élégant (28-30 mesures/min). Le Quickstep est extrêmement rapide et énergique (50+ mesures/min). Deux danses très différentes.",
      },
    ],
    resources: [
      {
        title: "Ballroom Dance: A Guide for Dancers and Teachers",
        author: "Alexander Moore",
        year: "2004",
        format: "Livre",
        description: "Guide complet incluant le Quickstep",
      },
    ],
    episodeLinks: [],
    autoMatchTerms: ["danse rapide", "compétition ballroom", "virtuosité"],
    keywords: ["Quickstep", "rapidité", "énergie", "compétition ballroom", "danse de couple", "virtuosité"],
    seoTitle: "Quickstep — Danse rapide de compétition | Explorer les styles | Dance Lab",
    seoDescription: "Découvrez le Quickstep : fusion du Foxtrot et Charleston, danse la plus rapide de compétition ballroom.",
  },

  {
    slug: "west-coast-swing",
    name: "West Coast Swing",
    aliases: ["WCS", "swing de côte ouest", "swing californien"],
    family: "Danses sociales",
    era: "Années 1950-1960",
    originCountry: "États-Unis",
    originCity: "Californie (Los Angeles, Californie du Sud)",
    summary: "Danse de couple linéaire et compacte, caractérisée par une posture side-by-side et des mouvements de corps fluides; variante américaine modernisée du swing.",
    introduction: "Le West Coast Swing incarne l'évolution urbaine du swing. Née en Californie dans les années 1950-1960, cette danse fusionne l'héritage du Lindy Hop avec les rythmes émergents du rock and roll et du rhythm and blues. Contrairement au Lindy Hop explosif et aérien, le West Coast Swing cultive une compacité linéaire, une fluidité corporelle et une improvisation musicale fine.\n\nLe West Coast Swing se danse souvent côte à côte, avec connexion étroite mais compacte. C'est la danse swing de la Californie urbaine, de la modernité, de la sophistication.",
    origins: "Le West Coast Swing émerge en Californie du Sud (notamment Los Angeles) dans les années 1950-1960, en réaction aux styles de swing orientaux (Lindy Hop) considérés comme « trop énergiques » pour les petites pistes de danse des clubs californiens. Les danseurs californiens réadaptent le Lindy Hop, le rendant plus linéaire, plus compact et plus propre aux petits espaces.\n\nLe West Coast Swing fusionne également l'influence du rock and roll émergent et du rhythm and blues, créant une danse hybride qui marque la transition entre le swing pur et la danse rock-influenced. Des figures comme Skippy Blair popularisent et codifient le West Coast Swing.",
    timeline: [
      { year: "1950s-1960s", event: "Émergence du West Coast Swing en Californie comme adaptation urbaine du Lindy Hop" },
      { year: "1960s-1970s", event: "Popularisation et codification du West Coast Swing; développement de compétitions" },
      { year: "1980-présent", event: "Renaissance et normalisation du West Coast Swing; scène compétitive et sociale active" },
    ],
    characteristics: {
      movements: "Mouvements fluides et linéaires, posture côte à côte souvent, fluidité corporelle, isolations du bassin et du haut du corps, mouvements de glisse.",
      musicRelationship: "Dansé sur des rythmes de rock, swing, rhythm and blues (120-160 BPM généralement). Improvisation musicale guidant la danse.",
      improvisation: "Très haute improvisation ; chaque danse répond musicalement.",
      formats: ["Bal social/club", "Compétition", "Performance", "Jam session"],
      visualCodes: "Vêtements décontractés à formels selon contexte. Posture compacte et élancée.",
    },
    music: {
      genres: ["Rock and roll", "Rhythm and blues", "Swing moderne"],
      description: "Musique de rock et R&B, avec rythmes entraînants et énergie urbaine.",
      keyArtists: ["Elvis Presley", "Chuck Berry", "Duke Ellington (indirect)"],
    },
    keyFigures: [
      {
        category: "Pionniers et codificateurs",
        figures: [
          { name: "Skippy Blair", role: "Créatrice et championne du West Coast Swing" },
          { name: "Danseurs de Los Angeles", role: "Pionniers de l'adaptation du Lindy Hop californien" },
        ],
      },
    ],
    franceHistory: "Le West Coast Swing arrive tardivement en France, surtout via la redécouverte internationale du swing. Aujourd'hui, une petite communauté de West Coast Swing existe en France, particulièrement à Paris.",
    relatedStyles: ["lindy-hop", "swing", "rock"],
    commonConfusions: [
      {
        styles: "West Coast Swing et Lindy Hop",
        explanation: "Le Lindy Hop (Harlem, années 1930) est explosif, aérien et centrifuge. Le West Coast Swing (Californie, années 1950+) est compact, linéaire et terrestre. Évolutions distincts du swing.",
      },
    ],
    resources: [
      {
        title: "West Coast Swing: A History",
        author: "Skippy Blair",
        year: "2000",
        format: "Livre",
        description: "Histoire du West Coast Swing par sa créatrice",
      },
    ],
    episodeLinks: [],
    autoMatchTerms: ["swing californien", "rock and roll dance"],
    keywords: ["West Coast Swing", "Californie", "swing moderne", "rock and roll", "improvisation", "compact"],
    seoTitle: "West Coast Swing — Swing compact californien | Explorer les styles | Dance Lab",
    seoDescription: "Découvrez le West Coast Swing : origines californiennes, adaptation urbaine du Lindy Hop, et fusion rock-swing.",
  },

  {
    slug: "boogie-woogie",
    name: "Boogie-woogie",
    aliases: ["lindy hop boogie", "boogie"],
    family: "Danses sociales",
    era: "Années 1940-1950",
    originCountry: "États-Unis / Grande-Bretagne",
    originCity: "Harlem (États-Unis) / Londres (codification)",
    summary: "Danse de couple énergique et ludique, dérivée du Lindy Hop, caractérisée par des mouvements rapides et de l'improvisation; danse de compétition ballroom britannique.",
    introduction: "Le Boogie-woogie incarne la joie brute du swing simplifié. Né de la musique boogie-woogie et du Lindy Hop, le Boogie-woogie dansé est une interprétation allégée et plus ludique du swing, caractérisée par des mouvements rapides et une énergie débridée. Contrairement au Lindy Hop technique, le Boogie-woogie cultive la simplicité et le plaisir pur de danser.\n\nLe Boogie-woogie est danse d'amusement et de légèreté, où chaque mouvement exprime la joie de la musique.",
    origins: "Le Boogie-woogie musical émerge aux États-Unis dans les années 1930-1940, style de piano jazz caracterisé par un rythme rapide et répétitif. La danse Boogie-woogie suit naturellement, comme interprétation corporelle de cette musique énergique. Elle se develop à Harlem et dans les clubs de jazz américains.\n\nLa danse Boogie-woogie est codifiée pour compétition ballroom par les Britanniques dans les années 1950-1960, créant une variante formalisée. Le Boogie-woogie de compétition conserve l'énergie mais ajoute structure et figures définies.",
    timeline: [
      { year: "1930-1940", event: "Émergence de la musique et danse Boogie-woogie aux États-Unis" },
      { year: "1950s", event: "Codification du Boogie-woogie pour compétition ballroom britannique" },
      { year: "1960-présent", event: "Boogie-woogie pratiqué dans compétitions et bals sociaux" },
    ],
    characteristics: {
      movements: "Mouvements rapides et légers, jeu de jambes énergique, rebonds, rotations rapides du couple, mouvements improvisés.",
      musicRelationship: "Dansé sur des rythmes boogie-woogie rapides (120-160+ BPM). Improvisation musicale guidant la danse.",
      improvisation: "Haute improvisation ; moins structuré que Lindy Hop.",
      formats: ["Bal social", "Compétition", "Performance"],
      visualCodes: "Tenue décontractée à semi-formelle. Attitude joyeuse et ludique.",
    },
    music: {
      genres: ["Boogie-woogie", "Swing rapide"],
      description: "Piano boogie-woogie caractéristique avec rythme répétitif, jazz rapide, énergique.",
      keyArtists: ["Albert Ammons", "Pete Johnson", "Meade Lux Lewis"],
    },
    keyFigures: [
      {
        category: "Musiciens pionniers",
        figures: [
          { name: "Albert Ammons", role: "Pianiste de Boogie-woogie légendaire" },
        ],
      },
    ],
    franceHistory: "Le Boogie-woogie arrive en France via l'influence du jazz américain et les compétitions ballroom. Une petite présence existe en France.",
    relatedStyles: ["lindy-hop", "swing", "jive"],
    resources: [
      {
        title: "Boogie-Woogie Piano: The Keyboard Style of the Blues",
        author: "David Reuben",
        year: "2013",
        format: "Livre",
        description: "Histoire du piano et de la danse Boogie-woogie",
      },
    ],
    episodeLinks: [],
    autoMatchTerms: ["swing rapide", "piano boogie", "danse ludique"],
    keywords: ["Boogie-woogie", "swing rapide", "piano", "danse énergique", "improvisation", "compétition ballroom"],
    seoTitle: "Boogie-woogie — Danse énergique du swing | Explorer les styles | Dance Lab",
    seoDescription: "Découvrez le Boogie-woogie : musique piano caractéristique, danse rapide et énergique dérivée du Lindy Hop.",
  },

  {
    slug: "rock",
    name: "Rock'n'roll",
    aliases: ["rock and roll", "rock'n'roll"],
    family: "Danses sociales",
    era: "Années 1950-1960",
    originCountry: "États-Unis",
    originCity: "Memphis, USA / diffusion mondiale via New York",
    summary: "Danse de couple énergique et jeune, caractérisée par des mouvements rapides, des lancers et une attitude rebelle; symbole de la rébellion juvénile des années 1950.",
    introduction: "Le Rock'n'roll dansé incarne la rébellion juvénile des années 1950. Née en parallèle à l'émergence de la musique rock and roll, cette danse fusionne l'énergie du Lindy Hop avec l'attitude rebelle de la nouvelle génération. Le Rock'n'roll se caractérise par des mouvements rapides, des lancers spectaculaires et une énergie irrépressible.\n\nLe Rock'n'roll est danse de jeunesse, de liberté, de transgression des normes parentales. C'est la danse d'Elvis Presley et de la contre-culture des années 1950-1960.",
    origins: "Le Rock'n'roll musical émerge aux États-Unis dans les années 1950, fusion entre le rhythm and blues afro-américain et la country blanche, popularisé par Elvis Presley et Chuck Berry. La danse Rock'n'roll suit naturellement, comme expression corporelle de cette musique révolutionnaire.\n\nLa danse Rock'n'roll se développe rapidement, adapté du Lindy Hop mais simplifié et énergisé par le nouveau beat du rock. Elle devient symbole de la rébellion juvénile et de la contre-culture émergente. Les parents scandalisés par le rock, les danses rock sont interdites dans de nombreux lieux publics, amplifiant leur aura rebelle.",
    timeline: [
      { year: "1952-1955", event: "Émergence de la musique rock and roll aux États-Unis (Elvis, Chuck Berry)" },
      { year: "1955-1960", event: "Explosion du Rock'n'roll musical et dansé; popularité juvénile massive" },
      { year: "1960-1970s", event: "Déclin du Rock'n'roll classiquevers d'autres styles" },
      { year: "1970s-présent", event: "Renaissance du Rock'n'roll vintage; communauté nostalgique active" },
    ],
    characteristics: {
      movements: "Mouvements rapides et énergiques, lancers du partenaire, rotations du couple, jeu de jambes rapide, attitude insouciante.",
      musicRelationship: "Dansé sur la musique rock and roll rapide (120-160+ BPM). Chaque danseur épouse l'énergie brute de la musique.",
      improvisation: "Haute improvisation; chaque danseur ajoute sa personnalité au motif de base.",
      formats: ["Bal social/discothèque", "Performance", "Compétition amateur"],
      visualCodes: "Tenue années 1950 : femmes en robes circulaires courtes ou pantalons serrés, hommes en vestes de cuir et cheveux stylisés. Attitude rebelle et joyeuse.",
    },
    music: {
      genres: ["Rock and roll", "Rhythm and blues"],
      description: "Musique de rock énergique avec guitares électriques, rythme de batterie marqué, voix expressives. Essence même de la rébellion musicale des années 1950.",
      keyArtists: ["Elvis Presley", "Chuck Berry", "Little Richard", "Bill Haley"],
    },
    keyFigures: [
      {
        category: "Musiciens et figures culturelles",
        figures: [
          { name: "Elvis Presley", role: "Roi du rock'n'roll, figure iconique de la culture juvénile rebelle" },
          { name: "Chuck Berry", role: "Guitariste et pionnier du rock'n'roll" },
        ],
      },
    ],
    franceHistory: "Le Rock'n'roll arrive en France via l'influence culturelle américaine, générant également controversy et fascination pour la jeunesse française. Paris et autres grandes villes accueillent la musique et la danse rock. Aujourd'hui, une scène nostalgique de rock'n'roll vintage existe en France.",
    relatedStyles: ["lindy-hop", "jive", "swing"],
    commonConfusions: [
      {
        styles: "Rock'n'roll et Lindy Hop",
        explanation: "Le Lindy Hop (Harlem jazz, années 1930) est sophistiqué avec figures aériennes. Le Rock'n'roll (années 1950) est énergique et rebelle, simplifié adapté au rock. Évolutions différentes du swing.",
      },
    ],
    resources: [
      {
        title: "Rock and Roll: A Social History",
        author: "Paul Friedlander",
        year: "1996",
        format: "Livre",
        description: "Histoire sociale du rock and roll et de sa culture dansante",
      },
    ],
    episodeLinks: [],
    autoMatchTerms: ["Elvis Presley", "années 1950", "rébellion juvénile"],
    keywords: ["Rock'n'roll", "Elvis Presley", "années 1950", "rébellion", "danse énergique", "jeunesse"],
    seoTitle: "Rock'n'roll — Danse rebelle des années 1950 | Explorer les styles | Dance Lab",
    seoDescription: "Découvrez le Rock'n'roll : origines musicales, danse énergique, Elvis Presley, et symbole de rébellion juvénile.",
  },

  {
    slug: "rock-acrobatique",
    name: "Rock acrobatique",
    aliases: ["rock acro", "rock acrobatique français"],
    family: "Danses scéniques",
    era: "Années 1960-1970",
    originCountry: "France",
    originCity: "Paris / France urbaine",
    summary: "Danse de couple spectaculaire et acrobatique, caractérisée par des lancers extrêmes, des contorsions et une performance théâtrale; variante scénique française du rock'n'roll.",
    introduction: "Le Rock Acrobatique est le rock transformé en spectacle aérien. Né en France, cette danse de couple française pousse le rock'n'roll aux extrêmes : lancers vertigineux, contorsions du corps, mouvements acrobatiques impossibles. Le Rock Acrobatique est moins danse sociale qu'exhibition de virtuosité et d'audace.\n\nLe Rock Acrobatique incarne l'évolution spectaculaire des danses sociales vers l'art scénique : chaque lancer, chaque contorsion raconte une histoire de défi physique et de confiance absolue entre partenaires.",
    origins: "Le Rock Acrobatique émerge en France dans les années 1960-1970, s'inspirant du rock'n'roll mais le transformant radicalement. Les danseurs français innovent progressivement, ajoutant des éléments acrobatiques extrêmes au rock. Contrairement aux autres variations régionales du rock, le Rock Acrobatique devient une discipline distincte avec ses propres codes, figures et univers esthétique.\n\nLe Rock Acrobatique demeure essentiellement français, bien que d'autres pays développent des variantes. La discipline se formalise avec des compétitions nationales et internationales à partir des années 1970-1980.",
    timeline: [
      { year: "1960s-1970s", event: "Émergence du Rock Acrobatique en France, innovation progressive acrobatique" },
      { year: "1980s-1990s", event: "Formalisation et codification du Rock Acrobatique; compétitions nationales et internationales" },
      { year: "2000-présent", event: "Rock Acrobatique continue en France et minorité internationale; discipline spécialisée" },
    ],
    characteristics: {
      movements: "Lancers extrêmes du partenaire, contorsions et acrobaties, mouvements aériens, postures impossibles, jeu de confiance absolue entre couple.",
      musicRelationship: "Dansé sur rock'n'roll rapide. Musique guide l'énergie mais la danse prime sur la musicality.",
      improvisation: "Modérée ; figures acrobatiques pré-définies et entrainées.",
      formats: ["Compétition", "Performance", "Spectacle"],
      visualCodes: "Tenue spectaculaire adaptée aux acrobaties. Costumes thématiques. Attitude de virtuosité et défi.",
    },
    music: {
      genres: ["Rock'n'roll", "Rock rapide"],
      description: "Musique rock énergique et rapide guidant les acrobaties.",
      keyArtists: ["Divers rockeurs selon époque"],
    },
    keyFigures: [
      {
        category: "Pionniers français",
        figures: [
          { name: "Danseurs français du rock acrobatique", role: "Innovateurs de la discipline" },
        ],
      },
    ],
    franceHistory: "Le Rock Acrobatique est une invention française, créé et pratiqué essentiellement en France. La discipline se maintient via les compétitions nationales et écoles spécialisées.",
    relatedStyles: ["rock", "lindy-hop", "danse acrobatique"],
    resources: [
      {
        title: "Rock Acrobatique: Technique et Histoire",
        author: "Various French sources",
        year: "2000",
        format: "Article",
        description: "Ressources sur le Rock Acrobatique français",
      },
    ],
    episodeLinks: [],
    autoMatchTerms: ["acrobatie", "rock spectaculaire", "danse française"],
    keywords: ["Rock Acrobatique", "France", "acrobatie", "lancers", "spectaculaire", "compétition"],
    seoTitle: "Rock acrobatique — Danse spectaculaire française | Explorer les styles | Dance Lab",
    seoDescription: "Découvrez le Rock acrobatique : danse acrobatique française spectaculaire, lancers extrêmes, et compétition de virtuosité.",
  },

  {
    slug: "modern-jazz",
    name: "Modern jazz",
    aliases: ["jazz contemporain", "jazz moderne"],
    family: "Danses scéniques",
    era: "Années 1950-1960",
    originCountry: "États-Unis",
    originCity: "New York",
    summary: "Style de danse théâtrale fusionnant danse jazz, mouvements contemporains et technique classique; danse scénique influencée par la musique de jazz.",
    introduction: "Le Modern Jazz est danse de liberté contrôlée. Émergeant de New York dans les années 1950-1960, ce style synthétise la technique classique, l'improvisation du jazz et les mouvements corporels libérés de la danse contemporaine. Le Modern Jazz se caractérise par des mouvements fluides, des isolations corporelles complexes et une expressivité émotionnelle intense.\n\nContrairement au jazz vernaculaire social, le Modern Jazz est forme scénique, enseignée dans les studios et performée sur scène. C'est la danse de la liberté expressive au sein d'une structure technique forte. Le Modern Jazz incarne l'évolution de la danse jazz vers un langage chorégraphique raffiné et sophistiqué.",
    origins: "Le Modern Jazz émerge à New York dans les années 1950-1960, créé progressivement par des danseurs et chorégraphes qui cherchent à élever la danse jazz au niveau d'art scénique. Des figures comme Luigi, Ed Taylor et d'autres développent une technique et une pédagogie spécialisées, transposant l'essence du jazz social en langage scénique.\n\nLe Modern Jazz fusionne plusieurs influences : la technique classique (ballet, danse contemporaine), les rythmes et l'expressivité du jazz, les mouvements corporels libérés, et l'improvisation musicale. Le style cristallise particulièrement à travers les écoles de danse new-yorkaises et hollywoodiennes. Le Modern Jazz devient forme majeure dans la danse de studio et de compétition amateur et s'utilise dans les spectacles, films et musique pop.",
    timeline: [
      { year: "1950s", event: "Émergence du Modern Jazz à New York comme fusion de jazz social et danse contemporaine" },
      { year: "1960s", event: "Formalisation de la technique Modern Jazz; enseignement dans les studios" },
      { year: "1970s-1980s", event: "Popularisation du Modern Jazz aux États-Unis et internationalement" },
      { year: "1990-présent", event: "Modern Jazz établi comme style majeur de danse scénique et studio" },
    ],
    characteristics: {
      movements: "Mouvements fluides et lisses, isolations complexes du bassin et du buste, contractions et extensions, rotations souples, mouvements circulaires, expressivité émotionnelle.",
      musicRelationship: "Dansé sur la musique de jazz ou des arrangements jazz (variés en tempo et style). Musicality et résonance émotionnelle avec la musique guidant la danse.",
      improvisation: "Modérée à haute improvisation dans les variations ; structure pédagogique en pré-chorégraphie.",
      formats: ["Cours de studio", "Performance scénique", "Compétition amateur", "Spectacle de danse"],
      visualCodes: "Vêtements décontractés adaptés aux mouvements fluides. Pas de codes formels stricts.",
    },
    music: {
      genres: ["Jazz", "Jazz contemporain", "R&B"],
      description: "Musique de jazz variée, du classique au contemporain. Accents sur les mouvements individuels du danseur.",
      keyArtists: ["Duke Ellington", "Miles Davis", "Herbie Hancock"],
    },
    keyFigures: [
      {
        category: "Pionniers et pédagogues",
        figures: [
          { name: "Luigi", role: "Pédagogue fondateur du Modern Jazz technique" },
          { name: "Ed Taylor", role: "Innovateur du Modern Jazz style" },
        ],
      },
    ],
    franceHistory: "Le Modern Jazz arrive en France à partir des années 1970-1980 via l'influence américaine et l'enseignement de danse studio. Aujourd'hui, le Modern Jazz est enseigné dans les studios de danse français et pratiqué largement.",
    relatedStyles: ["jazz", "contemporain", "heels", "street-jazz"],
    resources: [
      {
        title: "Jazz Dance: The Story of American Vernacular Dance",
        author: "Marshall Stearns and Jean Stearns",
        year: "1994",
        format: "Livre",
        description: "Histoire des danses jazz incluant Modern Jazz",
      },
    ],
    episodeLinks: [],
    autoMatchTerms: ["jazz contemporain", "technique jazz", "danse de studio"],
    keywords: ["Modern Jazz", "jazz contemporain", "danse scénique", "technique", "expressivité", "New York"],
    seoTitle: "Modern jazz — Danse jazz scénique | Explorer les styles | Dance Lab",
    seoDescription: "Découvrez le Modern jazz : origines new-yorkaises, technique raffinée, fusion de jazz et danse contemporaine.",
  },

  {
    slug: "k-pop-dance",
    name: "K-pop dance",
    aliases: ["K-pop", "danse K-pop"],
    family: "Danses scéniques",
    era: "Années 1990-2000",
    originCountry: "Corée du Sud",
    originCity: "Séoul",
    summary: "Style de danse spectaculaire fusionnant influences hip-hop, popping, locking, contemporain et musique pop; style de performance médiatique et de spectacle de groupe.",
    introduction: "La K-pop dance est moins un style codifié qu'un phénomène culturel et commercial. Émergeant en Corée du Sud dans les années 1990-2000, la danse K-pop fusionne des influences éclectiques : hip-hop, popping, locking, contemporain, ballet, et jazz. Caractérisée par sa précision, sa synchronisation de groupe extrême et son esthétique visuelle spectaculaire, la K-pop dance incarne la performance pop médiatisée du XXIe siècle.\n\nLa K-pop dance est produit de l'industrie musicale sud-coréenne, façonnée par des stratégies de marketing, des coreographies professionnelles et une discipline d'exécution extrême. C'est danse de divertissement de masse, de perfection visuelle, de groupe coordonné.",
    origins: "La K-pop dance n'a pas de véritable origine chorégraphique; elle est plutôt création de l'industrie musicale sud-coréenne émergente. Dans les années 1990-2000, des producteurs et chorégraphes sud-coréens créent progressivement un langage chorégraphique hybride adapté à la pop music médiatisée.\n\nCet style emprunte largement au hip-hop américain (mouvements dynamiques, attitude urbaine), au popping et locking (isolations précises), à la danse contemporaine (fluidité corporelle), et à la danse classique (discipline technique). La K-pop dance se distingue par une synchronisation de groupe obsessionnelle et une perfection technique sans faille. Des groupes comme BTS, Blackpink, EXO révolutionnent la performance de groupe pop, établissant de nouveaux standards de danse spectaculaire.\n\nLa K-pop dance reflète une philosophie de production pop : chaque mouvement calculé, chaque regard chorégraphié, chaque formation du groupe soigneusement orchestrée.",
    timeline: [
      { year: "1990s", event: "Émergence de l'industrie pop coréenne; premiers groupes de K-pop" },
      { year: "2000s", event: "Développement progressif du style de danse K-pop distinctif" },
      { year: "2010s", event: "Explosion mondiale de la K-pop; groupes comme BTS, Blackpink deviennent phénomènes globaux" },
      { year: "2020-présent", event: "K-pop dance reconnu comme style majeur du divertissement pop global" },
    ],
    characteristics: {
      movements: "Mouvements dynamiques empruntant au hip-hop, isolations précises du popping/locking, fluidité contemporaine, formations de groupe synchronisées, transitions rapides entre styles.",
      musicRelationship: "Dansé sur la musique pop K-pop (variée en tempo). Chaque mouvement chorégraphié précisément à la musique.",
      improvisation: "Très faible improvisation ; chaque mouvement reste pré-chorégraphié et répété.",
      formats: ["Performance de spectacle", "Vidéoclip", "Concert", "Compétition", "Studio"],
      visualCodes: "Vêtements stylés et coordonnés du groupe. Coiffures et maquillage coordonnés. Esthétique visuelle cohérent et produit.",
    },
    music: {
      genres: ["K-pop", "Pop coréenne"],
      description: "Musique pop produite professionnellement fusionnant pop international, hip-hop, R&B, électronique. Voix d'artistes coréens, production de qualité haute.",
      keyArtists: ["BTS", "Blackpink", "EXO", "TWICE", "Stray Kids"],
    },
    keyFigures: [
      {
        category: "Producteurs et chorégraphes majeurs",
        figures: [
          { name: "Grands studios sud-coréens", role: "Producteurs et distributeurs de K-pop" },
          { name: "Chorégraphes professionnels K-pop", role: "Créateurs des styles de danse emblématiques" },
        ],
      },
      {
        category: "Artistes représentatifs",
        figures: [
          { name: "BTS", role: "Groupe pionniers de la K-pop mondiale" },
          { name: "Blackpink", role: "Groupe féminin emblématique K-pop" },
        ],
      },
    ],
    franceHistory: "La K-pop arrive en France tardivement (années 2010s onwards) via internet et les réseaux sociaux. Aujourd'hui, la K-pop a une fanbase significative en France, particulièrement chez les jeunes. Des événements et compétitions de danse K-pop sont organisés en France.",
    relatedStyles: ["hip-hop-freestyle", "popping", "locking", "contemporain", "street-jazz"],
    commonConfusions: [
      {
        styles: "K-pop dance et Hip-hop",
        explanation: "Le Hip-hop est fondé sur l'improvisation et la culture urbaine libre. La K-pop dance emprunte au hip-hop mais reste hautement chorégraphiée et contrôlée. Philosophies d'exécution très différentes.",
      },
    ],
    resources: [
      {
        title: "K-pop Confidential: K-pop Uncensored",
        author: "Various journalists",
        year: "2019",
        format: "Article",
        description: "Analyse de la culture K-pop et de ses pratiques de danse",
      },
    ],
    episodeLinks: [],
    autoMatchTerms: ["BTS", "Blackpink", "danse coréenne", "pop mondiale"],
    keywords: ["K-pop dance", "Corée du Sud", "BTS", "Blackpink", "performance pop", "synchronisation", "spectacle"],
    seoTitle: "K-pop dance — Phénomène pop coréen | Explorer les styles | Dance Lab",
    seoDescription: "Découvrez la K-pop dance : origines sud-coréennes, influences hip-hop et contemporain, groupes BTS et Blackpink.",
  },

  {
    slug: "bollywood",
    name: "Danse Bollywood",
    aliases: ["danse de film indien", "Bollywood", "danse indienne de cinéma"],
    family: "Danses scéniques",
    era: "Années 1950-1960",
    originCountry: "Inde",
    originCity: "Mumbai (Bombay)",
    summary: "Style de danse scénique de spectacle, fusionnant danse classique indienne, danse folklorique, et influences occidentales; style caractéristique des films de Bollywood.",
    introduction: "La danse Bollywood n'est pas un style codifié unique mais un amalgame dynamique de traditions indiennes et d'influences occidentales. Émergente du cinéma musical indien à partir des années 1950-1960, la « danse Bollywood » incarne la spectacularité, la couleur, la sensualité et la joie du cinéma de divertissement indien.\n\nLe terme « Bollywood » est pris-au-pied-de-la-lettre : c'est danse de cinéma, danse de spectacle, danse de production massive. Elle mélange des traditions classiques indiennes (Bharatanatyam, Kathak), des dances folkloriques régionales, des influences de ballet occidental, et de la danse contemporaine. C'est un véritable mélange, rendu cohérent par son contexte de divertissement cinématographique.",
    origins: "La danse Bollywood émerge de l'industrie du cinéma musical indien, particulièrement à partir des années 1950-1960, lors de l'émergence des grands cinéastes musicaux indiens (Raj Kapoor, Guru Dutt, Yash Chopra). L'industrie cinématographique de Mumbai (Bombay) crée progressivement un style de danse hybride pour les spectacles musicaux.\n\nCe style emprunte largement aux traditions indiennes classiques mais les reimagine pour le cinéma. Les chorégraphes indiens intègrent également des influences de danse occidentale (ballet, jazz), crée un langage chorégraphique unique au cinéma indien. Avec le temps, les films Bollywood établissent des standards esthétiques de danse spectaculaire qui deviennent reconnaissables mondialement.\n\nIl est important de noter que « Bollywood dance » est un terme marketing plutôt qu'une catégorie pédagogique ; les films Bollywood incluent des danses classiques indiennes, des danses folkloriques régionales, et des créations originales.",
    timeline: [
      { year: "1950s-1960s", event: "Émergence de la danse cinématique indienne; Bollywood musical cristallise" },
      { year: "1970s-1980s", event: "Développement des styles caractéristiques de danse Bollywood" },
      { year: "1990s-2000s", event: "Globalisation de Bollywood; danse Bollywood devient reconnaissable mondialement" },
      { year: "2010-présent", event: "K-pop dance et influence globale; Bollywood dance continue mais évolue" },
    ],
    characteristics: {
      movements: "Mouvements gracieux et fluides empruntant aux traditions indiennes, gesticulation des mains expressive, rotations des hanches, mouvements de tête distinctifs, pas caractéristiques indiens.",
      musicRelationship: "Dansée sur la musique film Bollywood (variée en tempo et style). Chaque séquence correspond au narratif de la chanson.",
      improvisation: "Aucune improvisation ; dances films sont pré-chorégraphiées précisément.",
      formats: ["Film musical", "Spectacle de danse", "Concert", "Studio"],
      visualCodes: "Costumes colorés et élaborés, bijoux, coiffures specta culaires. Esthétique visuelle opulente.",
    },
    music: {
      genres: ["Musique film Bollywood"],
      description: "Musique variée : classique indienne, pop indienne, R&B, influences occidentales. Souvent chansons de film avec paroles narratives.",
      keyArtists: ["Lata Mangeshkar", "Mohammed Rafi", "A.R. Rahman"],
    },
    keyFigures: [
      {
        category: "Chorégraphes de film",
        figures: [
          { name: "Chorégraphes Bollywood historiques", role: "Créateurs des styles de danse cinématiques" },
        ],
      },
      {
        category: "Danseurs d'acteurs de film",
        figures: [
          { name: "Acteurs-danseurs Bollywood", role: "Interprètes des numéros musicaux" },
        ],
      },
    ],
    franceHistory: "La danse Bollywood arrive en France via la popularité des films Bollywood et la diaspora indienne croissante. Aujourd'hui, les films Bollywood sont populaires en France, et une petite communauté de danseurs de Bollywood existe. Des événements Bollywood sont organisés régulièrement.",
    relatedStyles: ["bharatanatyam", "kathak", "danse orientale", "contemporain"],
    commonConfusions: [
      {
        styles: "Danse Bollywood et danse classique indienne",
        explanation: "La danse Bollywood est hybride cinématique empruntant à plusieurs traditions. Les danses classiques indiennes (Bharatanatyam, Kathak) sont des disciplines spécialisées avec règles codifiées rigoureuses. Domaines très différents.",
      },
    ],
    resources: [
      {
        title: "Bollywood: A History",
        author: "Ramachandra Guha",
        year: "2017",
        format: "Livre",
        description: "Histoire du cinéma Bollywood incluant l'évolution de la danse",
      },
    ],
    episodeLinks: [],
    autoMatchTerms: ["cinéma indien", "film musical", "Mumbai"],
    keywords: ["Bollywood", "danse indienne", "film musical", "cinéma indien", "spectaculaire", "Mumbai"],
    seoTitle: "Danse Bollywood — Spectacle cinématique indien | Explorer les styles | Dance Lab",
    seoDescription: "Découvrez la danse Bollywood : origines cinématographiques indiennes, influences multiples, et spectacle musical de cinéma.",
  },

  {
    slug: "cabaret",
    name: "Cabaret",
    aliases: ["danse de cabaret", "cabaret spectacle"],
    family: "Danses scéniques",
    era: "Fin XIXe siècle / début XXe siècle",
    originCountry: "France",
    originCity: "Paris",
    summary: "Style de danse scénique théâtrale, caractérisée par des mouvements séducteurs, des costumes élaborés et une performance d'artiste; danse de spectacle de variétés.",
    introduction: "Le Cabaret incarne le spectacle parisien de séduction théâtrale. Né des cabarets et music-halls parisiens fin XIXe-début XXe siècle, le Cabaret est essentiellement une forme théâtrale performative plutôt qu'un style de danse codifié. Le Cabaret fusionne éléments de danse, chant, acrobatie, comedy et spectacle en une performance d'artiste versatile.\n\nLe Cabaret cultive la séduction, l'humour, la théâtralité et l'exubérance. C'est danse de spectacle, danse de divertissement urbain, danse de liberté artistique et sensuelle.",
    origins: "Le Cabaret émerge à Paris fin XIXe siècle, s'enracinant dans les traditions des cabarets artistiques parisiens (Le Chat Noir, Moulin Rouge, Folies Bergère). Initialement, les cabarets accueillaient des performances variées : musique, danse, poésie, variétés. Progressivement, la danse devient élément majeur du spectacle de cabaret.\n\nLe Cabaret n'est pas tant un style de danse défini qu'une approche théâtrale de la performance. Les danseuses et danseurs de cabaret développent un langage corporel spécifique : séduction, jeu avec le public, liberté de mouvement, exubérance. Les tenues deviennent progressivement plus spectaculaires (plumes, paillettes), les mouvements plus suggestifs.\n\nIl importe de distinguer le Cabaret (forme théâtrale) du lieu où on le pratique (le cabaret comme établissement). Le Cabaret s'inspire des traditions de la danse de salon mais le transforme en spectacle de séduction publique.",
    timeline: [
      { year: "1880s-1890s", event: "Émergence des cabarets artistiques parisiens" },
      { year: "1900-1920", event: "Apogée des cabarets parisiens; danse de cabaret cristallise comme forme" },
      { year: "1920-1945", event: "Cabaret reste phénomène major parisien et européen" },
      { year: "1945-présent", event: "Cabaret persiste comme forme de spectacle traditionnel et nostalgique" },
    ],
    characteristics: {
      movements: "Mouvements gracieux et fluides, gestes expressifs et séducteurs, rotations du corps, jeu avec le public, gestuelle dramatique, mouvements variegated adaptés au narratif du spectacle.",
      musicRelationship: "Dansé sur diverses musiques : standards musicaux, chansons. Chaque numéro raconte une histoire ou incarne un personnage.",
      improvisation: "Modérée ; les numéros sont pré-choreographiés mais les artistes incluent interprétation personnelle.",
      formats: ["Spectacle de cabaret", "Music-hall", "Revue", "Numéro de variétés"],
      visualCodes: "Costumes élaborés, souvent avec plumes, paillettes, voiles. Coiffures spectaculaires. Maquillage théâtral. Bijoux scintillants.",
    },
    music: {
      genres: ["Variété", "Musique de spectacle", "Jazz", "Chansons"],
      description: "Musique variée selon le numéro : standards musicaux, chansons françaises, jazz, musique orchestrale.",
      keyArtists: ["Mistinguett", "Joséphine Baker", "Gréco"],
    },
    keyFigures: [
      {
        category: "Danseuses et artistes légendaires",
        figures: [
          { name: "Joséphine Baker", role: "Danseuse légendaire de cabaret parisien, icon des années folles" },
          { name: "Mistinguett", role: "Artiste de cabaret emblématique du Moulin Rouge" },
        ],
      },
      {
        category: "Lieux historiques",
        figures: [
          { name: "Moulin Rouge", role: "Cabaret iconic parisien, fondé 1889" },
          { name: "Folies Bergère", role: "Cabaret parisien historique" },
        ],
      },
    ],
    franceHistory: "Le Cabaret est création française, né et développé à Paris. Les cabarets parisiens (Moulin Rouge, Folies Bergère) restent institutions culturelles françaises. Aujourd'hui, le Cabaret persiste comme forme spectaculaire traditionnelle et nostalgique, pratiquée pour touristes et publics nostalgiques.",
    relatedStyles: ["contemporain", "danse theatrale", "danse orientale"],
    commonConfusions: [
      {
        styles: "Cabaret et Danse orientale",
        explanation: "Le Cabaret est forme théâtrale parisienne de spectacle variété. La danse orientale est tradition dansante solitaire méditerranéenne. Contextes, origines, philosophies très différentes.",
      },
    ],
    resources: [
      {
        title: "Paris Was a Woman: Gendered Readings",
        author: "Karla Jay (editor)",
        year: "1995",
        format: "Livre",
        description: "Essais sur la culture parisienne incluant cabarets et danse",
      },
    ],
    episodeLinks: [],
    autoMatchTerms: ["Moulin Rouge", "Folies Bergère", "Joséphine Baker"],
    keywords: ["Cabaret", "Paris", "Moulin Rouge", "spectacle", "séduction", "théâtre"],
    seoTitle: "Cabaret — Danse spectaculaire parisienne | Explorer les styles | Dance Lab",
    seoDescription: "Découvrez le Cabaret : origines parisiennes, Moulin Rouge, Joséphine Baker, et spectacle théâtral de séduction.",
  },

  {
    slug: "comedie-musicale",
    name: "Comédie musicale",
    aliases: ["musical", "comédie chantée", "musical théâtral"],
    family: "Danses scéniques",
    era: "Années 1920-1930",
    originCountry: "États-Unis / Grande-Bretagne",
    originCity: "New York / Londres",
    summary: "Forme théâtrale intégrant musique, chant, danse et narrative dramatique; style de performance où la danse est élément intégré du spectacle théâtral.",
    introduction: "La Comédie musicale est forme théâtrale totale. Émergeant aux États-Unis et Grande-Bretagne dans les années 1920-1930, la Comédie musicale fusionne théâtre dramatique, musique, chant et danse en une expérience performative intégrée. Contrairement aux danses « pures » de couple ou solo, la danse en comédie musicale est narratif : elle raconte une histoire, incarne un personnage, pousse l'action dramatique.\n\nLa Comédie musicale incarne le spectacle théâtral du XXe siècle : fusion de tous les arts performatifs. C'est danse théâtrale par excellence, où chaque mouvement raconte une histoire et chaque chorégraphie renforce le narratif dramatique.",
    origins: "La Comédie musicale émerge progressivement aux États-Unis et Grande-Bretagne fin XIXe-début XXe siècle, héritant des traditions de l'opéra, du music-hall et de la revue. Les pièces théâtrales de George M. Cohan (années 1900s) incluaient musique et danse intégrées. Cependant, la Comédie musicale « moderne » cristallise particulièrement avec les spectacles de Broadway des années 1920-1930.\n\nDes figures comme Jerome Kern, George Gershwin et Irving Berlin révolutionnent la musique de théâtre, créant des chansons de comédie musicale intégrées à l'action dramatique. Des chorégraphes comme George Balanchine et autres créent le langage chorégraphique distinctif. La comédie musicale de Broadway des années 1920-1940 établit le modèle qui persiste aujourd'hui.\n\nLa Comédie musicale n'est pas tant un style de danse qu'une forme théâtrale utilisant la danse comme élément narratif et performatif majeur.",
    timeline: [
      { year: "1900s-1920s", event: "Émergence de la comédie musicale moderne à New York et Londres" },
      { year: "1920s-1940s", event: "Apogée de la comédie musicale de Broadway; création de standards musicaux" },
      { year: "1940s-1960s", event: "Âge d'or de la comédie musicale; musicals like \"West Side Story\", \"Singin' in the Rain\"" },
      { year: "1960-présent", event: "Comédie musicale continue comme forme théâtrale majeure" },
    ],
    characteristics: {
      movements: "Mouvements variegated selon le rôle et la narratif : de danse de couple sociale à danse solo expressif, danse de groupe chorégraphié. Intégration du mouvement au narratif dramatique.",
      musicRelationship: "Dansée sur la musique de comédie musicale spécialement composée. Chaque numéro musical avance le narratif dramatique.",
      improvisation: "Aucune improvisation ; chaque mouvement est pré-choreographié précisément et répété.",
      formats: ["Production théâtrale", "Film musical", "Spectacle"],
      visualCodes: "Costumes élaborés adaptés au rôle et époque dramatique. Maquillage et coiffure théâtrales.",
    },
    music: {
      genres: ["Musique de comédie musicale"],
      description: "Musique variée composée spécialement pour la comédie musicale. Chansons solo, duos, ensembles intégrés à l'action dramatique.",
      keyArtists: ["Jerome Kern", "George Gershwin", "Richard Rodgers", "Oscar Hammerstein II"],
    },
    keyFigures: [
      {
        category: "Compositeurs et paroliers",
        figures: [
          { name: "Richard Rodgers & Oscar Hammerstein II", role: "Créateurs de standards de comédie musicale (\"South Pacific\", \"The Sound of Music\")" },
          { name: "George Gershwin", role: "Compositeur révolutionnaire de comédie musicale" },
        ],
      },
      {
        category: "Chorégraphes",
        figures: [
          { name: "Jerome Robbins", role: "Chorégraphe révolutionnaire de comédie musicale (\"West Side Story\")" },
        ],
      },
      {
        category: "Artistes interprètes",
        figures: [
          { name: "Gene Kelly", role: "Danseur-acteur emblématique du musical cinématique" },
          { name: "Fred Astaire", role: "Danseur légendaire des musicals d'époque classique" },
        ],
      },
    ],
    franceHistory: "La Comédie musicale arrive en France via les traductions de Broadway et les adaptations françaises. Des musicals français émergent (\"Le Mystère Buffo\", \"Starmania\"). Aujourd'hui, la Comédie musicale est pratiquée en France via des productions locales et internationales.",
    relatedStyles: ["contemporain", "jazz", "danse théâtrale"],
    commonConfusions: [
      {
        styles: "Comédie musicale et Film musical",
        explanation: "La Comédie musicale est forme théâtrale live performée sur scène. Le Film musical adapte la comédie musicale pour l'écran cinématographique. Formats et expériences très différents, bien que connexes.",
      },
    ],
    resources: [
      {
        title: "The American Musical Theatre",
        author: "John Bush Jones",
        year: "2003",
        format: "Livre",
        description: "Histoire complète de la comédie musicale américaine",
      },
      {
        title: "West Side Story",
        author: "Film/Production",
        year: "1961 (film)",
        format: "Film",
        description: "Comédie musicale légendaire chorégraphiée par Jerome Robbins",
      },
    ],
    episodeLinks: [],
    autoMatchTerms: ["Broadway", "musical théâtral", "film musical"],
    keywords: ["Comédie musicale", "Broadway", "musical", "théâtre", "danse théâtrale", "narratif"],
    seoTitle: "Comédie musicale — Forme théâtrale intégrée | Explorer les styles | Dance Lab",
    seoDescription: "Découvrez la Comédie musicale : origines de Broadway, musique intégrée, danse narrative, et spectacle théâtral.",
  },

  {
    slug: "danse-irlandaise",
    name: "Danse irlandaise",
    aliases: ["Irish dance", "step dancing", "danse celtique"],
    family: "Danses traditionnelles",
    era: "Centuries (formalization: XIXe-XXe)",
    originCountry: "Irlande",
    originCity: "Ensemble du territoire irlandais",
    summary: "Danse traditionnelle caractérisée par des mouvements des pieds complexes et rapides, un buste rigide et des pas codifiés; danse celtique enracinée profondément en Irlande.",
    introduction: "La Danse irlandaise incarne l'âme celtique. Enracinée dans les traditions folkloriques irlandaises, cette danse se caractérise par des pieds en mouvement perpétuel, des pas complexes et rapides, tandis que le buste demeure droit et inexpressif. Formalisée progressivement au XIXe-XXe siècles, la Danse irlandaise devient symbole d'identité irlandaise, de fierté culturelle et de résilience.\n\nContrairement à beaucoup de danses sociales, la Danse irlandaise se danse souvent individuellement ou en lignes synchronisées, plutôt qu'en couples enlacés. C'est danse de communauté, de tradition, de fierté collective.",
    origins: "La Danse irlandaise émerge des traditions folkloriques celtiques pré-historiques, évoluant progressivement à travers les siècles. Les origines exactes se perdent dans l'histoire, mais la tradition celtique et des influences britanniques et européennes enrichissent progressivement le vocabulaire chorégraphique.\n\nLa Danse irlandaise est formalisée progressivement lors du XIXe-XXe siècles. Les compétitions de danse (céilí competitions, des années 1800s onwards) codifient les figures et les styles. L'An Coimisiún le Rincí Gníomhaíochta (Commission for the Dance) établit en 1930 des règles d'exécution et des styles standardisés.\n\nL'internationalisation de la Danse irlandaise accélère via des spectacles comme Riverdance (années 1990s), qui fusiionnent la Danse irlandaise traditionelle avec la musique contemporaine et le spectacle moderne. Cette adaptation modernisée renforce la visibilité internationale de la Danse irlandaise.",
    timeline: [
      { year: "Centuries past", event: "Émergence et développement de la Danse irlandaise dans traditions celtiques" },
      { year: "1800s-1900s", event: "Formalisation et codification de la Danse irlandaise; émergence des compétitions" },
      { year: "1930", event: "Établissement de l'An Coimisiún le Rincí Gníomhaíochta; standardisation officielle des styles" },
      { year: "1990s-présent", event: "Internationalisation via Riverdance et autres spectacles; renaissance globale" },
    ],
    characteristics: {
      movements: "Mouvements des pieds complexes et rapides, taps des chaussures créant rythme percussif, pas codifiés, buste rigide et immobile, bras généralement détendus ou pliés aux coudes.",
      musicRelationship: "Dansée sur des mélodies celtiques traditionnelles (jigs, reels, polkas). Les pieds du danseur créent rythme percussif additionnel.",
      improvisation: "Aucune improvisation en compétition; figures standardisées strictement exécutées.",
      formats: ["Compétition céilí", "Spectacle traditionnel", "Cérémonie communautaire"],
      visualCodes: "Costumes colorés élaborés (robes pour femmes, kilts/costumes pour hommes), broderies celtiques, coiffures traditionnelles.",
    },
    music: {
      genres: ["Musique celtique", "Jigs", "Reels", "Polkas", "Hornpipes"],
      description: "Musique traditionnelle irlandaise avec instruments celtiques (fiddles, tin whistles, bodhráns, accordéons). Mélodies entraînantes et rythmes dansants.",
      keyArtists: ["Cheiftains", "Riverdance (modern adaptation)"],
    },
    keyFigures: [
      {
        category: "Gardiens de tradition",
        figures: [
          { name: "An Coimisiún le Rincí Gníomhaíochta", role: "Commission officielle établissant les standards de Danse irlandaise" },
        ],
      },
      {
        category: "Modernisateurs",
        figures: [
          { name: "Riverdance", role: "Production spectaculaire qui mondialisé la Danse irlandaise (années 1990s)" },
        ],
      },
    ],
    franceHistory: "La Danse irlandaise arrive en France tardivement, surtout via les spectacles comme Riverdance (années 1990s onwards). Aujourd'hui, une petite communauté de danseurs irlandais existe en France, avec des écoles de Danse irlandaise implantées, particulièrement à Paris.",
    relatedStyles: ["danse écossaise", "danses celtiques", "folklorique"],
    resources: [
      {
        title: "Irish Dance: Technique and Tradition",
        author: "Dianne L. Penny",
        year: "2012",
        format: "Livre",
        description: "Guide technique et historique de la Danse irlandaise",
      },
      {
        title: "Riverdance: The Show",
        author: "Film/Production",
        year: "1994 (spectacle original)",
        format: "Film",
        description: "Production spectaculaire modernisant la Danse irlandaise",
      },
    ],
    episodeLinks: [],
    autoMatchTerms: ["Irlande", "celtique", "Riverdance"],
    keywords: ["Danse irlandaise", "Irlande", "step dancing", "celtique", "Riverdance", "reel", "jig"],
    seoTitle: "Danse irlandaise — Tradition celtique | Explorer les styles | Dance Lab",
    seoDescription: "Découvrez la Danse irlandaise : origines celtiques, mouvements des pieds rapides, Riverdance, et traditions folkloriques.",
  },

  {
    slug: "danse-orientale",
    name: "Danse orientale",
    aliases: ["belly dance", "danse du ventre", "raqs al-sharqi"],
    family: "Danses traditionnelles",
    era: "Centuries (formalization: XIXe-XXe)",
    originCountry: "Moyen-Orient / Méditerranée",
    originCity: "Égypte (Cairo) - codification principale",
    summary: "Danse solitaire sensuelle caractérisée par des isolations corporelles complexes, des mouvements de hanches fluides et une expressivité émotionnelle; danse traditionnelle méditerranéenne.",
    introduction: "La Danse orientale incarne la sensualité, le féminisme corporel et l'expression émotionnelle. Enracinée profondément dans les traditions méditerranéennes et moyen-orientales, cette danse solitaire féminine se caractérise par des isolations complexes du bassin, des mouvements de hanches ondulants et une expressivité émotionnelle intense.\n\nContrairement à beaucoup de danses, la Danse orientale privilégie l'improvisation, l'émotion personnelle et la connexion avec la musique. Chaque danseuse interprète la musique à sa manière, créant une danse unique. C'est célébration de la féminité, de la sensualité assumée et de l'expression corporelle libre.",
    origins: "La Danse orientale émerge des traditions folkloriques du Moyen-Orient et de la Méditerranée, s'enracinant dans les danses de célébration, de rituel et de cour. Les origines exactes demeurent débattues, certains historiens suggérant des connexions à l'Afrique du Nord, à la Turquie, à l'Égypte antique.\n\nLa Danse orientale se formalise progressivement au XIXe-XXe siècles. L'Égypte, particulièrement le Caire, devient centre de codification et de développement du style. Des danseuses comme Samia Gamal et Tahia Carioca deviennent figures emblématiques du style égyptien. Le cinéma égyptien popularise la Danse orientale à travers le monde arabe et au-delà.\n\nIl est important de noter que le terme « Belly Dance » (danse du ventre) est terme occidental réducteur. Les praticiens arabes utilisent « Raqs al-Sharqi » (danse de l'Orient) ou autres termes régionaux. Le rétablissement du respectà envers cette tradition passe par l'utilisation de terminologie culturelle appropriée.",
    timeline: [
      { year: "Centuries past", event: "Émergence et développement dans traditions folkloriques méditerranéennes/moyen-orientales" },
      { year: "1800s-1900s", event: "Formalisation progressive; Égypte devient centre de codification" },
      { year: "1920s-1960s", event: "Apogée du cinéma égyptien; popularisation de la Danse orientale à travers le monde arabe" },
      { year: "1970-présent", event: "Internationalisation; redécouverte féministe et affirmation culturelle" },
    ],
    characteristics: {
      movements: "Isolations complexes du bassin et des hanches, mouvements fluides et ondulatoires, mouvements des épaules, isolations du buste, expressivité émotionnelle, improvisation musicale.",
      musicRelationship: "Dansée sur musique arabe traditionnelle (oum, dabke, etc.) ou musique contemporaine arabe. Chaque danseuse improvise sa propre interprétation.",
      improvisation: "Très haute improvisation; chaque danse est unique et répondant à la musique et aux émotions du danseur.",
      formats: ["Performance solo", "Cérémonie communautaire/mariage", "Club/discothèque", "Spectacle"],
      visualCodes: "Costumes colorés avec broderies élaborées, bijoux, foulard de hanche (hip scarf) créant sensation visuelle. Maquillage et coiffure élaborés.",
    },
    music: {
      genres: ["Musique arabe", "Oum", "Dabke", "Raqs al-Sharqi"],
      description: "Musique arabe traditionnelle avec percussions complexes (darbouka, riq), instruments à vent (oud, ney), voix expressives.",
      keyArtists: ["Umm Kulthum", "Samia Gamal", "Tahia Carioca"],
    },
    keyFigures: [
      {
        category: "Danseuses légendaires égyptiennes",
        figures: [
          { name: "Samia Gamal", role: "Danseuse égyptienne légendaire, figure du cinéma égyptien" },
          { name: "Tahia Carioca", role: "Danseuse égyptienne emblématique du style classique" },
        ],
      },
      {
        category: "Musiciens",
        figures: [
          { name: "Umm Kulthum", role: "Chanteuse arabe légendaire dont la musique inspire Danse orientale" },
        ],
      },
    ],
    franceHistory: "La Danse orientale arrive en France progressivement via l'influence du cinéma égyptien et l'immigration maghrébine/moyen-orientale. Aujourd'hui, la Danse orientale est pratiquée en France par des écoles spécialisées et des danseuses professionnelles, particulièrement dans les communautés méditerranéennes et moyen-orientales.",
    relatedStyles: ["danse folklorique", "flamenco", "cabaret"],
    commonConfusions: [
      {
        styles: "Danse orientale et Cabaret",
        explanation: "La Danse orientale est danse traditionnelle/folk intime pratiquée individuellement. Le Cabaret est forme théâtrale spectaculaire occidentale. Traditions, contextes, origines culturelles très différentes.",
      },
    ],
    resources: [
      {
        title: "Belly Dance: A Guide for Teachers and Students",
        author: "Zahra Zuhair",
        year: "2008",
        format: "Livre",
        description: "Guide pédagogique de Danse orientale",
      },
      {
        title: "Egyptian Cinema: A Companion",
        author: "Magda Wassef",
        year: "2005",
        format: "Livre",
        description: "Histoire du cinéma égyptien incluant danse orientale",
      },
    ],
    episodeLinks: [],
    autoMatchTerms: ["Égypte", "raqs al-sharqi", "musique arabe"],
    keywords: ["Danse orientale", "belly dance", "Égypte", "méditerranéenne", "improvisation", "sensuelle"],
    seoTitle: "Danse orientale — Tradition méditerranéenne | Explorer les styles | Dance Lab",
    seoDescription: "Découvrez la Danse orientale : origines égyptiennes, mouvements fluides, improvisation et traditions méditerranéennes.",
  },

  {
    slug: "kathak",
    name: "Kathak",
    aliases: ["danse Kathak", "Kathak indien"],
    family: "Danses classiques indiennes",
    era: "Centuries (formalization: Mughal era onwards)",
    originCountry: "Inde",
    originCity: "Inde du Nord (Uttar Pradesh principalement)",
    summary: "Danse classique indienne du Nord caractérisée par des mouvements des pieds complexes, des gestes codifiés et une narration dramatique; tradition dansante ritualisée.",
    introduction: "Le Kathak est sophistication chorégraphique. L'une des six danses classiques indiennes majeure, le Kathak incarne l'élégance, la virtuosité technique et la narration dramatique. Originaire de l'Inde du Nord, le Kathak se caractérise par des mouvements des pieds étonnamment complexes (jatis), des gestes codifiés des mains (mudras), et une expression faciale subtile.\n\nLe Kathak est danse de cour, danse de poésie, danse de spiritualité. Pratiquée avec discipline rigoureuse et transmission maître-étudiant, le Kathak demeure vivant dans les écoles indiennes de danse classique et les performances traditionnelles.",
    origins: "Le Kathak émerge dans le contexte de la cour moghole en Inde du Nord, évoluant progressivement comme forme d'art distinct du Xe-XIIe siècles onwards. Le nom « Kathak » dérive du mot sanscrit « Katha » (histoire), reflétant la nature narrative de la danse. Le Kathak se développe comme fusion entre la danse rituelle hindoue et les influences de la cour moghole musulmane.\n\nLa danse Kathak cristallise particulièrement durant la période Mughal (XIVe-XVIIIe siècles), s'épanouissant dans les cours royales. Après le déclin des cours aristocratiques, le Kathak est pratiqué dans les communautés marchandes et dans les écoles spécialisées (gurukuls). Actuellement, le Kathak se transmet principalement via les écoles de danse classique indienne et les performances scéniques.",
    timeline: [
      { year: "10e-12e siècles", event: "Émergence du Kathak dans les traditions dansantes du Nord" },
      { year: "14e-18e siècles", event: "Développement et raffinement dans les cours moghole et hindoue" },
      { year: "19e-20e siècles", event: "Déclin avec la chute des cours; survie dans les communautés et écoles" },
      { year: "1960-présent", event: "Renaissance du Kathak; reconnaissance comme danse classique; transmission pédagogique formelle" },
    ],
    characteristics: {
      movements: "Mouvements des pieds extraordinairement complexes (tatkaar, jatis), gestes codifiés des mains (mudras), rotations rapides (chacraris), mouvements de tête rhythmiques, expression faciale subtile (rasa).",
      musicRelationship: "Dansée sur la musique classique indienne (raags, taals). Dialogue complexe entre danseur et musiciens.",
      improvisation: "Modérée improvisation au sein de structures classiques codifiées; variations individuelles du danseur.",
      formats: ["Performance de concert", "Spectacle de danse classique", "Transmission pédagogique"],
      visualCodes: "Costume traditionnel indien (ghagra/churidar pour femmes, dhoti pour hommes), bijoux de chevilles tintinnabulantes, coiffure traditionnelle, maquillage aux yeux soulignés.",
    },
    music: {
      genres: ["Musique classique indienne", "Raag", "Taal"],
      description: "Musique classique indienne du Nord avec instruments (tabla, sarangi, sitar, bansuri). Complexité rhythmique et mélodique élevée.",
      keyArtists: ["Sitara Devi", "Pt. Birju Maharaj"],
    },
    keyFigures: [
      {
        category: "Danseuses et maîtres légendaires",
        figures: [
          { name: "Sitara Devi", role: "Danseuse Kathak légendaire, reine du Kathak du XXe siècle" },
          { name: "Pt. Birju Maharaj", role: "Maître Kathak mondialement reconnu, transmetteur de la tradition" },
        ],
      },
    ],
    franceHistory: "Le Kathak arrive en France via l'influence croissante de la danse classique indienne et la diaspora indienne. Aujourd'hui, le Kathak est enseigné dans quelques écoles spécialisées en France, particulièrement à Paris. Une petite communauté de danseurs de Kathak existe en France.",
    relatedStyles: ["bharatanatyam", "danse classique indienne"],
    commonConfusions: [
      {
        styles: "Kathak et Bharatanatyam",
        explanation: "Le Kathak (Nord) privilégie les mouvements des pieds complexes et la narration. Le Bharatanatyam (Sud) privilégie les gestes des mains (mudras) et les expressions faciales. Origines régionales, traditions, et techniques très différentes.",
      },
    ],
    resources: [
      {
        title: "Kathak Dance: Tradition and Technique",
        author: "Sunil Kothari",
        year: "2003",
        format: "Livre",
        description: "Guide complet du Kathak classique indien",
      },
    ],
    episodeLinks: [],
    autoMatchTerms: ["danse classique indienne", "Inde du Nord", "danse moghole"],
    keywords: ["Kathak", "Inde du Nord", "danse classique", "mouvements pieds", "narration", "Sitara Devi"],
    seoTitle: "Kathak — Danse classique indienne du Nord | Explorer les styles | Dance Lab",
    seoDescription: "Découvrez le Kathak : origines moghole, mouvements de pieds complexes, narration dramatique et danse classique indienne.",
  },

  {
    slug: "bharatanatyam",
    name: "Bharatanatyam",
    aliases: ["danse Bharatanatyam", "Bharata Natyam"],
    family: "Danses classiques indiennes",
    era: "Centuries (formalization: XIXe-XXe)",
    originCountry: "Inde",
    originCity: "Tamil Nadu (Sud de l'Inde)",
    summary: "Danse classique indienne du Sud caractérisée par des gestes codifiés des mains, des expressions faciales subtiles et une base stable; l'une des six danses classiques indiennes majeure.",
    introduction: "Le Bharatanatyam incarne la grâce et l'expressivité gestuelle. L'une des six danses classiques indiennes majeure, le Bharatanatyam émane du Sud de l'Inde, particulièrement du Tamil Nadu. Cette danse se caractérise par des gestes élaborés des mains (mudras), une expression faciale subtile (rasa), une base de jambes stable (aramandi) et une narration lyrique de thèmes religieux et amoureux.\n\nLe Bharatanatyam est danse de temple, danse de dévouement spirituel transformée en art scénique. Pratiquée traditionnellement par les femmes (devadasis), la danse demeure liée aux rituels de temple et à l'expression dévotionnelle.",
    origins: "Le Bharatanatyam émerge dans les temples du Tamil Nadu, évoluant progressivement à partir du Ve siècles onwards. Traditionnellement pratiqué par les devadasis (« servantes du dieu »), le Bharatanatyam se développe comme forme d'expression religieuse et dévotionnelle. La danse Bharatanatyam se distingue par son connexion profonde aux temples et aux rituels hindous.\n\nLe Bharatanatyam se formalise et se codifie particulièrement au XIXe-XXe siècles, perdant progressivement son contexte de temple devadasi pour devenir danse classique de concert scénique. Des figures comme Balasaraswati et d'autres modernisent le Bharatanatyam, le rendant accessible au public de concert. Le Bharatanatyam revient progressivement à ses racines spirituelles tout en s'adaptant aux contextes de performance contemporaines.",
    timeline: [
      { year: "5e-12e siècles", event: "Émergence du Bharatanatyam dans les rituels de temple du Tamil Nadu" },
      { year: "12e-18e siècles", event: "Développement comme danse de temple devadasi; raffinement technique" },
      { year: "19e-20e siècles", event: "Transition de danse de temple à danse classique de concert; modernisation" },
      { year: "1960-présent", event: "Renaissance du Bharatanatyam; reconnaissance comme danse classique majeure" },
    ],
    characteristics: {
      movements: "Position stable de base (aramandi), mouvements économes avec focus sur les gestes des mains (hastas/mudras), expressions faciales subtiles (rasas), mouvements lents et délibérés, isolation du bassin.",
      musicRelationship: "Dansée sur la musique classique indienne du Sud (Carnatic). Dialogue avec les musiciens de percussion et de mélodie.",
      improvisation: "Modérée improvisation au sein de structures classiques codifiées; variations individuelles du danseur.",
      formats: ["Performance de concert", "Spectacle de danse classique", "Transmission pédagogique"],
      visualCodes: "Costume traditionnel du Sud (saree, bijoux ornementaux), bijoux de chevilles tintinnabulantes, maquillage aux yeux soulignés (kohl), coiffure avec fleurs (gajra).",
    },
    music: {
      genres: ["Musique classique indienne du Sud (Carnatic)", "Raag du Sud", "Taal du Sud"],
      description: "Musique classique de l'Inde du Sud avec instruments (mridangam, kanjira, veena, shehnai). Complexité rhythmique et mélodique subtile.",
      keyArtists: ["Balasaraswati", "Padma Subrahmanyam"],
    },
    keyFigures: [
      {
        category: "Danseuses légendaires",
        figures: [
          { name: "Balasaraswati", role: "Danseuse Bharatanatyam légendaire, reine de la danse du Sud" },
          { name: "Padma Subrahmanyam", role: "Danseuse et chercheuse majeure du Bharatanatyam" },
        ],
      },
    ],
    franceHistory: "Le Bharatanatyam arrive en France via l'influence croissante de la culture indienne et la diaspora tamoule. Aujourd'hui, le Bharatanatyam est enseigné dans quelques écoles de danse classique indienne en France, particulièrement à Paris. Une petite communauté de danseurs de Bharatanatyam existe en France.",
    relatedStyles: ["kathak", "danse classique indienne", "odissi"],
    commonConfusions: [
      {
        styles: "Bharatanatyam et Kathak",
        explanation: "Le Bharatanatyam (Sud) privilégie les gestes des mains (mudras) et les expressions faciales subtiles; base stable (aramandi). Le Kathak (Nord) privilégie les mouvements des pieds complexes et la narration; position plus élevée. Traditions régionales, origines, et techniques distinctes.",
      },
    ],
    resources: [
      {
        title: "Bharata Natyam in its Spiritual and Artistic Dimensions",
        author: "Padma Subrahmanyam",
        year: "2005",
        format: "Livre",
        description: "Étude complète du Bharatanatyam classique indien",
      },
    ],
    episodeLinks: [],
    autoMatchTerms: ["danse classique indienne", "Inde du Sud", "Tamil Nadu"],
    keywords: ["Bharatanatyam", "Inde du Sud", "danse classique", "mudras", "temple", "Balasaraswati"],
    seoTitle: "Bharatanatyam — Danse classique indienne du Sud | Explorer les styles | Dance Lab",
    seoDescription: "Découvrez le Bharatanatyam : origines du Tamil Nadu, gestes codifiés, expression faciale et danse classique indienne spirituelle.",
  },
]

// ─────────────────────────────────────────────────────────────────────────────
//  CATALOGUE COMPLET — tous les styles (pilotes + à venir)
//  Utiliser pour la page index avec les styles "coming soon"
// ─────────────────────────────────────────────────────────────────────────────

export const upcomingStyles: UpcomingStyle[] = [
  // Styles pour lesquels une fiche complète est disponible
  { slug: "hip-hop-freestyle", name: "Hip-hop freestyle", family: "Danses urbaines", available: true },
  { slug: "popping", name: "Popping", family: "Danses urbaines", available: true },
  { slug: "locking", name: "Locking", family: "Danses urbaines", available: true },
  { slug: "house-dance", name: "House dance", family: "Danses de club", available: true },
  { slug: "heels", name: "Heels", family: "Danses scéniques", available: true },
  { slug: "street-jazz", name: "Street jazz", family: "Danses scéniques", available: true },
  { slug: "afro-dance", name: "Afro dance", family: "Danses issues des cultures afro-descendantes", available: true },
  { slug: "dancehall", name: "Dancehall", family: "Danses issues des cultures afro-descendantes", available: true },
  { slug: "claquettes", name: "Claquettes", family: "Danses scéniques", available: true },
  { slug: "flamenco", name: "Flamenco", family: "Danses traditionnelles", available: true },
  { slug: "pole-dance", name: "Pole dance", family: "Danses scéniques", available: true },
  { slug: "salsa", name: "Salsa", family: "Danses sociales", available: true },
  { slug: "bachata", name: "Bachata", family: "Danses sociales", available: true },
  { slug: "tango", name: "Tango argentin", family: "Danses sociales", available: true },
  { slug: "valse", name: "Valse", family: "Danses sociales", available: true },
  { slug: "lindy-hop", name: "Lindy Hop", family: "Danses sociales", available: true },
  { slug: "charleston", name: "Charleston", family: "Danses sociales", available: true },
  { slug: "jive", name: "Jive", family: "Danses sociales", available: true },
  { slug: "cha-cha-cha", name: "Cha-cha-cha", family: "Danses sociales", available: true },
  { slug: "rumba", name: "Rumba", family: "Danses sociales", available: true },
  { slug: "samba", name: "Samba", family: "Danses sociales", available: true },
  { slug: "paso-doble", name: "Paso doble", family: "Danses sociales", available: true },
  { slug: "foxtrot", name: "Foxtrot", family: "Danses sociales", available: true },
  { slug: "quickstep", name: "Quickstep", family: "Danses sociales", available: true },
  { slug: "west-coast-swing", name: "West Coast Swing", family: "Danses sociales", available: true },
  { slug: "boogie-woogie", name: "Boogie-woogie", family: "Danses sociales", available: true },
  { slug: "rock", name: "Rock'n'roll", family: "Danses sociales", available: true },
  { slug: "rock-acrobatique", name: "Rock acrobatique", family: "Danses scéniques", available: true },
  { slug: "modern-jazz", name: "Modern jazz", family: "Danses scéniques", available: true },
  { slug: "k-pop-dance", name: "K-pop dance", family: "Danses scéniques", available: true },
  { slug: "bollywood", name: "Danse Bollywood", family: "Danses scéniques", available: true },
  { slug: "cabaret", name: "Cabaret", family: "Danses scéniques", available: true },
  { slug: "comedie-musicale", name: "Comédie musicale", family: "Danses scéniques", available: true },
  { slug: "danse-irlandaise", name: "Danse irlandaise", family: "Danses traditionnelles", available: true },
  { slug: "danse-orientale", name: "Danse orientale", family: "Danses traditionnelles", available: true },
  { slug: "kathak", name: "Kathak", family: "Danses classiques indiennes", available: true },
  { slug: "bharatanatyam", name: "Bharatanatyam", family: "Danses classiques indiennes", available: true },
]

// ─────────────────────────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────────────────────────

export function getDanceStyle(slug: string): DanceStyle | undefined {
  return danceStyles.find((s) => s.slug === slug)
}

export function getDanceStylesByFamily(family: DanceStyleFamily): DanceStyle[] {
  return danceStyles.filter((s) => s.family === family)
}

export function searchDanceStyles(query: string): DanceStyle[] {
  const q = query.toLowerCase()
  return danceStyles.filter(
    (s) =>
      s.name.toLowerCase().includes(q) ||
      s.aliases?.some((a) => a.toLowerCase().includes(q)) ||
      s.keywords.some((k) => k.toLowerCase().includes(q)) ||
      s.originCity.toLowerCase().includes(q) ||
      s.originCountry.toLowerCase().includes(q) ||
      s.family.toLowerCase().includes(q)
  )
}
