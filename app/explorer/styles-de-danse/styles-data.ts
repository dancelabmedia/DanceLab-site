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
  keywords: string[]
  image?: string
  imageCredit?: string
  seoTitle: string
  seoDescription: string
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
]

// ─────────────────────────────────────────────────────────────────────────────
//  CATALOGUE COMPLET — tous les styles (pilotes + à venir)
//  Utiliser pour la page index avec les styles "coming soon"
// ─────────────────────────────────────────────────────────────────────────────

export const upcomingStyles = [
  { slug: "hip-hop-freestyle", name: "Hip-hop freestyle", family: "Danses urbaines" as DanceStyleFamily, available: false },
  { slug: "popping", name: "Popping", family: "Danses urbaines" as DanceStyleFamily, available: false },
  { slug: "locking", name: "Locking", family: "Danses urbaines" as DanceStyleFamily, available: false },
  { slug: "house-dance", name: "House dance", family: "Danses de club" as DanceStyleFamily, available: false },
  { slug: "ballroom", name: "Ballroom", family: "Danses urbaines" as DanceStyleFamily, available: false },
  { slug: "afro", name: "Afro", family: "Danses issues des cultures afro-descendantes" as DanceStyleFamily, available: false },
  { slug: "dancehall", name: "Dancehall", family: "Danses issues des cultures afro-descendantes" as DanceStyleFamily, available: false },
  { slug: "heels", name: "Heels", family: "Danses scéniques" as DanceStyleFamily, available: false },
  { slug: "street-jazz", name: "Street jazz", family: "Danses scéniques" as DanceStyleFamily, available: false },
  { slug: "modern-jazz", name: "Modern jazz", family: "Danses scéniques" as DanceStyleFamily, available: false },
  { slug: "claquettes", name: "Claquettes", family: "Danses scéniques" as DanceStyleFamily, available: false },
  { slug: "salsa", name: "Salsa", family: "Danses sociales" as DanceStyleFamily, available: false },
  { slug: "bachata", name: "Bachata", family: "Danses sociales" as DanceStyleFamily, available: false },
  { slug: "tango", name: "Tango", family: "Danses sociales" as DanceStyleFamily, available: false },
  { slug: "flamenco", name: "Flamenco", family: "Danses traditionnelles" as DanceStyleFamily, available: false },
  { slug: "danses-traditionnelles", name: "Danses traditionnelles", family: "Danses traditionnelles" as DanceStyleFamily, available: false },
  { slug: "danses-de-salon", name: "Danses de salon", family: "Danses sociales" as DanceStyleFamily, available: false },
  { slug: "krump", name: "Krump", family: "Danses urbaines" as DanceStyleFamily, available: true },
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
