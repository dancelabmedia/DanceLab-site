export type EpisodeLink = {
  name: string
  slug: string
  number: string
  image: string
}

export type DocLink = {
  title: string       // Titre affiché du documentaire
  platform: string    // "Netflix", "Apple TV", "Prime Video", "ARTE"
  url: string         // Lien de streaming (s'ouvre dans un nouvel onglet)
  thumbnail?: string  // URL de miniature vérifiée (YouTube thumbnail ou autre)
  free?: boolean      // true si gratuit sur la plateforme
}

export type MagazineArticle = {
  slug: string
  // ── Statut éditorial ───────────────────────────────────────────────────
  // draft     → jamais visible sur le site public
  // scheduled → visible seulement quand publishedAt est atteint
  // published → en ligne (publishedAt doit être dans le passé)
  status: "draft" | "scheduled" | "published"
  // Heure de publication en UTC ISO 8601.
  // Été (CEST, UTC+2) : 09h00 Paris = "T07:00:00.000Z"
  // Hiver (CET,  UTC+1) : 09h00 Paris = "T08:00:00.000Z"
  publishedAt: string
  // ──────────────────────────────────────────────────────────────────────
  category: string
  title: string
  chapo: string
  meta: string
  publishedDate: string   // date d'affichage (ex : "13.08.26") — source de vérité : publishedAt
  episodeSlug: string
  episodeNumber: string
  guest: string
  image: string
  imageObjectPosition?: string  // surcharge de object-position pour le hero (défaut : right center)
  heroImageType?: 'portrait' | 'scene'
  // portrait → personne/invité·e au premier plan : active le cadrage optimisé (visage droit + responsive)
  // scene    → photo d'ambiance, lieu, action collective : cadrage standard conservé
  heroAspectRatio?: string      // force aspect-ratio sur le conteneur hero (ex: "16/9" pour une miniature paysage)
  useHeroSlider?: boolean       // si true : le hero affiche un slider des miniatures de chaque section (docLink.thumbnail)
  imageCredit?: string
  readTime: string
  tags: string[]
  metaDescription?: string  // Meta description SEO (générée automatiquement pour les articles podcast)
  quote?: string
  sections: {
    heading: string
    paragraphs: string[]
    items?: string[]         // liste à puces optionnelle après les paragraphes
    itemPrefix?: string      // préfixe visuel (ex: "➔", "•") — défaut : "•" si items présents
    itemConclusion?: string  // phrase de synthèse affichée après la liste
    sectionImage?: string    // image inline dans le corps de la section (avant la DocCard)
    sectionImageAlt?: string // texte alternatif pour l'image inline
    docLink?: DocLink        // Encart documentaire / lien visuel (optionnel)
  }[]
  aside?: {
    title: string
    items: string[]
  }
  episodeLinks?: EpisodeLink[]
  conclusion: string | string[]  // string simple ou tableau pour les conclusions multi-paragraphes
}

export const magazineArticles: MagazineArticle[] = [
  {
    slug: "cv-artistes-auront-disparu",
    status: "published",
    publishedAt: "2026-08-13T08:00:00.000Z", // 10h00 Paris (CEST = UTC+2)
    category: "Décryptage",
    title: "Dans 3-5 ans les CV d'artistes auront disparu.",
    chapo:
      "J'ai eu une vision en décembre 2025 : Dans 3-5 ans les CV d'artistes auront disparu. Et c'est pas si irréaliste que ça, pour tout un tas de raisons que je perçois depuis un moment. Donc, j'ai noté un peu à l'arrache tout ce qui m'était passé par la tête.",
    meta: "13.08.26 · 5 min de lecture",
    publishedDate: "13.08.26",
    episodeSlug: "",
    episodeNumber: "",
    guest: "Maïwenn Bramoulle",
    image: "/images/articles/cv.JPG",
    imageCredit: "© Blandine Abad",
    heroImageType: 'portrait',
    imageObjectPosition: "center 20%",
    readTime: "5 min",
    tags: ["Carrière", "Marque personnelle", "Réseaux sociaux", "Avenir"],
    sections: [
      {
        // Section d'ouverture — liste flash des observations (sans heading)
        heading: "",
        paragraphs: [],
        items: [
          "L'identité personnelle et artistique remplace déjà le CV par ce que tu dégages et ce que tu crées.",
          "Les castings en ligne, accentués par les réseaux sociaux, sont déjà en train de remplacer certains castings physiques.",
          "De nouvelles formes de collaborations naissent de plus en plus grâce aux réseaux sociaux.",
          "On ne voudra plus de feuilles A4, avec tes 150 jobs entassés. On veut du visuel et que tu procures de l'émotion.",
          "La prise de parole en ligne, comme le copywriting ou le storytelling, sans ChatGPT, Gemini ou autres, t'aura déjà fait sortir du lot d'ici là.",
          "La création de nouveaux espaces numériques dédiés aux artistes, avec notamment le développement de nouvelles applications grâce à l'IA (j'ai ma petite idée mais plutôt dans 5-7 ans), verra le jour.",
        ],
        itemPrefix: "➔",
      },
      {
        // Transition — la mise en contexte avant les sections développées
        heading: "",
        paragraphs: [
          "Tout va déjà vite et dans les années à venir, ça ira encore plus vite.",
          "Et je pense à tous ceux qui, aujourd'hui, ne montent pas dans le train parce qu'ils attendent la \"prochaine\" opportunité, en se reposant sur leurs lauriers.",
          "Sauf qu'il n'y aura pas de prochaine opportunité aussi vite que tu ne le penses, vu que le marché est déjà bouché.",
        ],
      },
      {
        heading: "Les directeurs de casting, programmateurs et producteurs regardent aussi :",
        paragraphs: [],
        items: [
          "Une certaine présence en ligne (portfolio, site, page pro, réseaux sociaux),",
          "Des vidéos qui montrent ce que l'artiste sait faire,",
          "Une esthétique identifiable (style, univers, singularité).",
        ],
        itemPrefix: "•",
        itemConclusion: "⮕ La marque personnelle devient plus parlant qu'une liste de lignes de CV.",
      },
      {
        heading: "Les plateformes remplaceront le papier",
        paragraphs: [
          "Des outils comme Instagram, TikTok, YouTube, LinkedIn ou des plateformes spécialisées dans les arts vivants servent déjà de vitrine :",
        ],
        items: [
          "Mises à jour instantanées,",
          "Preuves concrètes de compétences (performances filmées, coulisses de projets),",
          "Réseautage direct avec des décideurs.",
        ],
        itemPrefix: "•",
        itemConclusion: "⮕ Le CV deviendra obsolète face à des profils vivants et interactifs.",
      },
      {
        heading: "La valeur est dans la preuve, pas dans la déclaration",
        paragraphs: [
          "Dans un monde saturé d'informations, les employeurs et collaborateurs veulent voir :",
        ],
        items: [
          "Ce que tu fais, pas ce que tu dis que tu fais.",
          "Des expériences vécues, des collaborations visibles, des extraits de travail.",
        ],
        itemPrefix: "•",
        itemConclusion: "⮕ La crédibilité ne se construit plus sur une feuille A4, mais sur une trace numérique et une réputation.",
      },
      {
        heading: "Les artistes deviennent leurs propres médias",
        paragraphs: [
          "Dans 3 à 5 ans, il est probable que :",
        ],
        items: [
          "Chaque artiste aura son espace numérique centralisé (un \"hub\" ou portfolio interactif),",
          "Les recruteurs utiliseront l'IA pour faire des recherches croisées de profils selon des critères artistiques précis,",
        ],
        itemPrefix: "•",
        itemConclusion: "⮕ Les collaborations naîtront de plus en plus des rencontres plutôt que des candidatures classiques.",
      },
      {
        heading: "Ce que cette vision implique",
        paragraphs: [],
        items: [
          "Les artistes devront soigner leur présence en ligne et utiliser les réseaux sociaux comme un outil stratégique.",
          "Les écoles et formations devront enseigner la communication et le marketing autant que la technique.",
          "Les recruteurs devront adapter leurs méthodes de sélection.",
        ],
        itemPrefix: "•",
      },
    ],
    aside: {
      title: "À retenir",
      items: [
        "La marque personnelle remplace progressivement le CV papier.",
        "Les castings et les collaborations évoluent vers des formats numériques.",
        "Être visible et être bon·ne ne sont pas la même chose — mais les deux comptent.",
        "Montrer ce qu'on fait vaut plus que déclarer ce qu'on a fait.",
      ],
    },
    episodeLinks: [
      {
        // Épisode 1 — Mathilde Champion : ancienne danseuse devenue community manager
        // Elle explique comment les recruteurs cherchent sur Instagram et TikTok,
        // comment se démarquer et pourquoi les réseaux sont devenus une vraie carte de visite.
        name: "Mathilde Champion",
        slug: "1-mathilde-champion",
        number: "1",
        image: "/episodes/mathildechampion1.png",
      },
      {
        // Épisode 42 — Gaël Grzeskowiak : créer du lien et montrer son travail en ligne
        // Il aborde la manière dont les réseaux sociaux permettent de montrer vers où
        // on veut aller artistiquement et de rendre son travail visible.
        name: "Gaël Grzeskowiak",
        slug: "42-gael-grzeskowiak",
        number: "42",
        image: "/episodes/gaelgrzeskowiak42.png",
      },
      {
        // Épisode 62 — Joël Luzolo : gestion de l'image, réseaux et exposition médiatique
        // On y parle de visibilité numérique et de l'impact des réseaux sur une carrière,
        // notamment après son passage dans Danse avec les stars.
        name: "Joël Luzolo",
        slug: "62-joel-luzolo",
        number: "62",
        image: "/episodes/joelluzolo62.png",
      },
    ],
    conclusion:
      "Donc pour te démarquer et ne pas être aux fraises en 2030, montre dès maintenant ce que tu fais, pas seulement ce que tu dis que tu fais.",
  },
  {
    slug: "pourquoi-le-breakdance-est-devenu-olympique",
    status: "published",
    publishedAt: "2026-06-18T07:00:00.000Z", // 09h00 Paris (CEST = UTC+2)
    category: "Décryptage",
    title: "Pourquoi le break est devenu une discipline olympique et ce que ça change pour la culture hip-hop ?",
    chapo:
      "En 2024, pour la première fois de l'histoire, on a vu du break aux Jeux olympiques. Des battles, des B-Girls et des B-Boys, avec un DJ et un cercle. Mais aussi des juges, des règles, des notes et des médailles olympiques. Quand une danse née dans la rue se retrouve sur l'une des scènes sportives les plus regardées au monde, ça pose quelques questions.",
    meta: "18.06.26 · 8 min de lecture",
    publishedDate: "18.06.26",
    episodeSlug: "113-grichka-rootz",
    episodeNumber: "113",
    guest: "Grichka Rootz",
    image: "/images/articles/danydann.jpg",
    imageCredit: "Danseur : Dany Dann · © Valroff Laurene",
    heroImageType: 'portrait',
    readTime: "8 min",
    tags: ["Breaking", "Olympisme", "Culture hip-hop"],
    sections: [
      {
        heading: "Avant d'être un sport olympique, le break est une culture",
        paragraphs: [
          "Le breaking, plus souvent appelé break, naît dans le Bronx, à New York, dans les années 1970 et se développe au sein de la culture hip-hop. Et dès le départ, il ne s'agit pas simplement d'enchaîner des figures impressionnantes. Il y a la musique, le rapport au DJ, les battles, les crews, l'improvisation, la manière de prendre sa place dans le cercle et évidemment toute une culture autour.",
          "C'est important de le rappeler parce qu'on pourrait facilement croire que les Jeux olympiques ont permis au break de devenir une « vraie » discipline. Alors qu'il n'a évidemment pas attendu les JO pour exister. Bien avant Paris 2024, il existait déjà des battles internationaux, des compétitions, des événements et surtout une communauté présente partout dans le monde. Les Jeux ne lui ont donc pas donné sa légitimité. Ils lui ont donné une autre visibilité."
        ],
      },
      {
        heading: "Mais alors, pourquoi le break est arrivé aux JO ?",
        paragraphs: [
          "Ce n'est pas arrivé du jour au lendemain. Le break avait déjà fait une première apparition aux Jeux olympiques de la jeunesse de Buenos Aires en 2018. Pour Paris 2024, l'objectif était aussi d'intégrer au programme des disciplines plus urbaines, plus spectaculaires et capables de toucher un public plus jeune.",
          "À Paris, les compétitions ont pris la forme de battles individuels entre B-Girls puis entre B-Boys. Les juges ne regardaient pas uniquement la difficulté physique ou le nombre de figures réalisées. La technique comptait évidemment, mais aussi la musicalité, l'originalité, le vocabulaire du danseur ou encore sa manière de répondre à son adversaire. L'objectif était donc de transformer le break en discipline olympique sans complètement effacer ce qui en fait un battle. Et c'est probablement là que commence tout le débat."
        ],
      },
      {
        heading: "Est-ce qu'une danse reste la même lorsqu'on la transforme en sport ?",
        paragraphs: [
          "Cette arrivée aux JO a offert au break une exposition assez exceptionnelle. Des millions de personnes qui n'auraient probablement jamais regardé un battle ont découvert cette danse pendant les Jeux. Et surtout, le grand public a pu voir autre chose que l'image du break parfois résumé aux power moves ou à quelques figures spectaculaires.",
          "Mais de l'autre, une partie de la communauté s'est interrogée sur ce que cette institutionnalisation pouvait faire à la culture. Parce qu'il y a quand même quelque chose d'assez paradoxal à voir une danse née dans la rue, avec ses propres codes et ses propres espaces, devoir rentrer dans les cases d'une institution pour être présentée au monde entier."
        ],
      },
      {
        heading: "Est-ce que les JO ont vraiment changé quelque chose ?",
        paragraphs: [
          "Oui, forcément. Ne serait-ce qu'en termes d'image. Pendant quelques jours, le break n'était plus une discipline « underground » ou une culture connue principalement de ceux qui la suivent. C'était une discipline olympique — avec tout ce que ce mot peut apporter : médiatisation, reconnaissance institutionnelle, financements, développement de structures ou simplement envie, pour une nouvelle génération, de commencer à danser.",
          "Mais il faut aussi faire attention à ne pas raconter l'histoire à l'envers. Le break n'est pas devenu important parce qu'il est entré aux Jeux olympiques. S'il a pu entrer aux Jeux, c'est justement parce qu'une culture entière l'avait développé et fait vivre pendant plusieurs décennies avant que l'institution olympique ne s'y intéresse. Et cette nuance change beaucoup de choses."
        ],
      },
      {
        heading: "Et maintenant ?",
        paragraphs: [
          "C'est peut-être le plus surprenant dans toute cette histoire. Après avoir fait son entrée à Paris en 2024, le break ne sera pas au programme des Jeux olympiques de Los Angeles en 2028 — ce qui pourrait sembler assez ironique quand on sait que la Californie a joué un rôle important dans son développement aux États-Unis.",
          "Mais ça montre surtout une chose : l'avenir du break ne dépend pas des Jeux Olympiques. Il continuera d'exister sans eux, comme il existait avant eux. Dans les battles, les crews, les événements, les écoles, les studios, et surtout auprès des danseurs et des communautés qui continuent de transmettre cette culture."
        ],
      },
    ],
    aside: {
      title: "Repères",
      items: [
        "Le break naît dans le Bronx, à New York, dans les années 1970.",
        "Première apparition olympique aux JO de la jeunesse de Buenos Aires en 2018.",
        "Discipline olympique aux Jeux de Paris 2024.",
        "Pas au programme des Jeux de Los Angeles 2028."
      ],
    },
    episodeLinks: [
      {
        name: "Grichka Rootz",
        slug: "113-grichka-rootz",
        number: "113",
        image: "/episodes/grichkarootz113.png",
      },
      {
        name: "Dexter",
        slug: "91-dexter",
        number: "91",
        image: "/episodes/dexter91.png",
      },
      {
        name: "Kanti",
        slug: "100-kanti",
        number: "100",
        image: "/episodes/kanti100.png",
      },
    ],
    conclusion:
      "La vraie question n'est peut-être pas de savoir si le break avait sa place aux Jeux olympiques. Mais plutôt de se demander ce que l'on attend de cette reconnaissance. Parce qu'être vu par des millions de personnes, c'est énorme. Mais pour cette culture, être reconnue ne devrait jamais vouloir dire devoir oublier d'où l'on vient pour rentrer dans les cases de ceux qui nous regardent.",
  },
  {
    slug: "comprendre-le-waacking-histoire-culture-influences",
    status: "published",
    publishedAt: "2026-06-25T07:00:00.000Z", // 09h00 Paris (CEST = UTC+2)
    category: "Culture",
    title: "Comprendre le waacking",
    chapo:
      "Né dans les clubs de Los Angeles dans les années 1970, le waacking est bien plus qu'un vocabulaire de bras. C'est une danse d'expression, de théâtralité, de musique et d'affirmation, traversée par l'histoire des communautés LGBTQ+ et par l'imaginaire du disco.",
    meta: "25.06.26 · 7 min de lecture",
    publishedDate: "25.06.26",
    episodeSlug: "118-yasmine-habib",
    episodeNumber: "118",
    guest: "Yasmine Habib",
    image: "/images/articles/sofiastanic.jpg",
    imageCredit: "Danseuse : Sofia Stanić · © Anna Jot",
    heroImageType: 'portrait',
    imageObjectPosition: "right 12%",  // image quasi-carrée : décale le crop vers le haut pour préserver la tête
    readTime: "7 min",
    tags: ["Waacking", "Disco", "Culture club"],
    sections: [
      {
        heading: "Une danse de club avant d'être un style de cours",
        paragraphs: [
          "Pour comprendre le waacking, il faut repartir du club. Le style apparaît dans le Los Angeles des années 1970, dans des espaces nocturnes où la musique disco, les corps, les regards et les identités minorisées fabriquent une autre manière d'exister. La danse y devient un langage de présence.",
          "Les mouvements de bras, les poses, les accélérations et la relation au regard ne sont pas de simples effets visuels. Ils composent une dramaturgie : celle d'un corps qui raconte, qui affirme, qui joue avec le glamour, le cinéma, la musique et la liberté."
        ],
      },
      {
        heading: "Punking, whacking, waacking : des mots chargés d'histoire",
        paragraphs: [
          "Le waacking est souvent relié au punking, terme historiquement associé aux communautés gays de Los Angeles. Le vocabulaire a évolué avec le temps, mais il rappelle que cette danse est née dans des contextes sociaux précis, où l'expression artistique pouvait devenir une réponse à la marginalisation.",
          "C'est aussi pour cela que réduire le waacking à un style esthétique serait passer à côté de son sens. Sa puissance vient de son rapport à l'identité, à la transformation et à la manière dont le corps peut reprendre la parole."
        ],
      },
      {
        heading: "Musicalité, cinéma et attitude",
        paragraphs: [
          "Le waacking dialogue avec la musique disco, mais aussi avec l'imaginaire des stars de cinéma, les poses dramatiques, les changements d'intention et l'adresse au public. Le danseur ne se contente pas d'exécuter : il incarne.",
          "Cette théâtralité explique pourquoi le style continue de fasciner. Il offre une liberté rare : être précis sans perdre l'excès, être technique sans neutraliser la personnalité, être spectaculaire sans oublier l'histoire."
        ],
      },
      {
        heading: "Pourquoi le waacking revient au premier plan",
        paragraphs: [
          "Aujourd'hui, le waacking circule dans les battles, les cours, les clips, les scènes contemporaines et les réseaux sociaux. Cette visibilité nouvelle peut être une chance, à condition de ne pas effacer les racines de la danse.",
          "Le défi est le même que pour beaucoup de styles issus des cultures club et urbaines : transmettre le vocabulaire, mais aussi le contexte. Apprendre les bras ne suffit pas ; il faut comprendre ce que la danse engage en termes de présence, de culture et de relation à la musique."
        ],
      },
    ],
    aside: {
      title: "À regarder dans une pratique",
      items: [
        "La relation entre mouvements de bras et musicalité.",
        "La place du regard, de la pose et de l'adresse.",
        "Le lien entre technique, attitude et histoire culturelle."
      ],
    },
    episodeLinks: [
      {
        name: "Annabelle Da Fonte",
        slug: "5-annabelle-da-fonte",
        number: "5",
        image: "/episodes/annabelledafonte5.png",
      },
      {
        name: "Sofia",
        slug: "98-sofia",
        number: "98",
        image: "/episodes/sofia98.png",
      },
    ],
    conclusion:
      "Le waacking est une danse de liberté parce qu'il ne sépare pas le style de l'histoire. Il donne au corps une puissance narrative : celle de se montrer, de se transformer et de prendre l'espace avec précision, intensité et panache.",
  },
  {
    slug: "festivals-danse-incontournables-ete",
    status: "published",
    publishedAt: "2026-07-02T07:00:00.000Z", // 09h00 Paris (CEST = UTC+2)
    category: "Agenda",
    title: "Les festivals de danse incontournables de l'été",
    chapo:
      "L'été transforme la carte culturelle française en terrain de circulation : grandes scènes contemporaines, festivals pluridisciplinaires, plein air, créations et rendez-vous professionnels. Voici comment repérer les temps forts sans se perdre dans l'abondance.",
    meta: "02.07.26 · 6 min de lecture",
    publishedDate: "02.07.26",
    episodeSlug: "117-tatiana-seguin",
    episodeNumber: "117",
    guest: "Tatiana Seguin",
    image: "/images/articles/festivalavignon.jpg",
    imageCredit: "Festival d'Avignon · © Christophe Raynaud de Lage",
    heroImageType: 'scene',
    readTime: "6 min",
    tags: ["Festivals", "Agenda", "Spectacle vivant"],
    sections: [
      {
        heading: "Pourquoi l'été compte autant pour la danse",
        paragraphs: [
          "La danse se découvre souvent autrement l'été. Les théâtres changent de rythme, les festivals prennent le relais, les formats se déplacent vers des lieux patrimoniaux, des scènes extérieures, des plateaux temporaires ou des villes entières transformées par le spectacle vivant.",
          "Pour le public, c'est une occasion de voir plus large. Pour les artistes, c'est parfois un espace de visibilité décisif. Pour les professionnels, c'est aussi un moment de repérage, de rencontres et de circulation des œuvres."
        ],
      },
      {
        heading: "Montpellier Danse, le repère chorégraphique",
        paragraphs: [
          "Difficile de parler d'été chorégraphique sans citer Montpellier Danse. Fondé au début des années 1980, le festival s'est imposé comme l'un des rendez-vous majeurs de la danse contemporaine en Europe, avec une programmation qui mêle grandes signatures, créations et dialogues internationaux.",
          "Son intérêt tient à sa densité : on y vient pour voir des pièces, mais aussi pour prendre le pouls d'une scène, sentir les esthétiques qui circulent et comprendre ce qui travaille la danse contemporaine à un moment donné."
        ],
      },
      {
        heading: "Avignon, laboratoire du spectacle vivant",
        paragraphs: [
          "Le Festival d'Avignon n'est pas un festival de danse au sens strict, mais la danse y occupe régulièrement une place essentielle. Le rendez-vous reste l'un des grands laboratoires du spectacle vivant, où théâtre, performance, corps, texte et formes hybrides se croisent.",
          "Pour Dance Lab, Avignon mérite d'être regardé comme un espace d'écosystème : on y observe les œuvres, mais aussi les conditions de production, les dynamiques de diffusion et la manière dont les artistes rencontrent programmateurs, critiques et publics."
        ],
      },
      {
        heading: "Les festivals pluridisciplinaires à surveiller",
        paragraphs: [
          "D'autres rendez-vous, comme Paris l'été, ouvrent des fenêtres précieuses sur les formes transversales : danse, cirque, performance, musique, théâtre, espaces publics. Ces festivals sont souvent intéressants parce qu'ils décloisonnent les publics et permettent à la danse de sortir du cadre strict du plateau.",
          "À compléter : ajouter une sélection annuelle vérifiée avec dates précises, billetteries et spectacles recommandés dès que la programmation définitive de chaque édition est confirmée."
        ],
      },
    ],
    aside: {
      title: "Comment choisir son festival",
      items: [
        "Regarder la cohérence éditoriale plutôt que seulement les noms connus.",
        "Repérer les créations et premières françaises.",
        "Prévoir des formats différents : grande scène, extérieur, performance, rencontre."
      ],
    },
    episodeLinks: [
      {
        name: "Tatiana Seguin",
        slug: "117-tatiana-seguin",
        number: "117",
        image: "/episodes/tatianaseguin117.png",
      },
      {
        name: "Antoine Nya",
        slug: "20-antoine-nya",
        number: "20",
        image: "/episodes/antoinenya20.png",
      },
    ],
    conclusion:
      "Un festival réussi ne se résume pas à une accumulation de spectacles. C'est une manière de traverser la danse dans un temps concentré, de comparer les écritures, de rencontrer une scène et de comprendre ce que le spectacle vivant raconte d'une époque.",
  },
  {
    slug: "prevenir-les-blessures-danseurs",
    status: "published",
    publishedAt: "2026-07-06T07:00:00.000Z", // 09h00 Paris (CEST = UTC+2)
    category: "Santé",
    title: "Prévenir les blessures : pourquoi les danseurs doivent être considérés comme des athlètes",
    chapo:
      "À partir de l'épisode avec Laura Malié-Leclerc, kinésithérapeute du sport spécialisée dans la danse, Dance Lab ouvre un sujet essentiel : apprendre à écouter le corps avant qu'il ne force l'arrêt.",
    meta: "06.07.26 · 7 min de lecture",
    publishedDate: "06.07.26",
    episodeSlug: "115-laura-malie-leclerc",
    episodeNumber: "115",
    guest: "Laura Malié-Leclerc",
    image: "/images/les-invites-header/lauramalieleclerc115.png",  // 1400×787 — image header 16:9 conçue pour ce cadrage
    heroImageType: 'portrait',
    readTime: "7 min",
    tags: ["Santé", "Prévention", "Corps"],
    quote:
      "La douleur c'est le premier signal du corps pour te dire qu'il y a quelque chose qui ne va pas.",
    sections: [
      {
        heading: "La douleur n'est pas un détail",
        paragraphs: [
          "Dans la danse, la douleur est parfois banalisée au nom de l'exigence, du dépassement ou de la scène. L'épisode avec Laura Malié-Leclerc rappelle au contraire qu'elle doit être comprise comme une information précieuse : un signal, pas une fatalité.",
          "Cette approche change le regard porté sur le danseur. Il ne s'agit plus seulement de tenir, répéter et performer, mais d'apprendre à identifier ce que le corps raconte avant que la blessure ne s'installe."
        ],
      },
      {
        heading: "S'échauffer, récupérer, anticiper",
        paragraphs: [
          "La prévention ne commence pas au moment où l'on a mal. Elle se construit dans les routines : échauffement adapté, récupération, progressivité, écoute des sensations et accompagnement professionnel lorsque c'est nécessaire.",
          "Considérer le danseur comme un athlète, c'est reconnaître que sa pratique demande une préparation physique, une stratégie de récupération et une attention continue aux charges de travail."
        ],
      },
      {
        heading: "Une culture du soin à construire",
        paragraphs: [
          "L'enjeu n'est pas uniquement individuel. Il concerne aussi les studios, les formations, les compagnies et les enseignants. Plus le milieu intègre une culture du soin, plus les parcours peuvent devenir durables.",
          "À compléter : ajouter des recommandations précises issues d'une retranscription longue de l'épisode, notamment sur l'échauffement, la reprise après blessure et les signaux d'alerte."
        ],
      },
    ],
    aside: {
      title: "À retenir",
      items: [
        "La douleur doit être prise au sérieux dès les premiers signaux.",
        "La prévention est une pratique quotidienne, pas une réaction d'urgence.",
        "Le danseur gagne à être accompagné comme un athlète."
      ],
    },
    episodeLinks: [
      {
        name: "Laura Malié-Leclerc",
        slug: "115-laura-malie-leclerc",
        number: "115",
        image: "/episodes/lauramalieleclerc115.png",
      },
    ],
    conclusion:
      "Cet épisode rappelle une idée simple mais encore trop peu installée : durer dans la danse demande autant de soin que de talent. Le corps n'est pas un outil à épuiser, c'est le lieu même de la pratique.",
  },
  {
    slug: "sante-mentale-artistes-danse",
    status: "published",
    publishedAt: "2026-07-09T07:00:00.000Z", // 09h00 Paris (CEST = UTC+2)
    category: "Décryptage",
    title: "Santé mentale : penser l'artiste au-delà de la performance",
    chapo:
      "Les épisodes avec Johan Nus et Frédéric Fontan ouvrent une réflexion nécessaire : derrière la présence scénique, il y a des personnes, des doutes, des environnements de travail et des trajectoires à protéger.",
    meta: "09.07.26 · 8 min de lecture",
    publishedDate: "09.07.26",
    episodeSlug: "111-johan-nus",
    episodeNumber: "111",
    guest: "Johan Nus",
    image: "/images/les-invites-header/johannus111.png",  // 1400×787 — image header 16:9 conçue pour ce cadrage
    heroImageType: 'portrait',
    readTime: "8 min",
    tags: ["Santé mentale", "Bienveillance", "Longévité"],
    sections: [
      {
        heading: "L'artiste n'est pas seulement ce qu'il produit",
        paragraphs: [
          "Dans les métiers artistiques, la valeur d'une personne est souvent confondue avec sa capacité à créer, performer, répondre présent ou encaisser. Les épisodes de Dance Lab consacrés à Johan Nus et Frédéric Fontan déplacent ce regard.",
          "Ils rappellent que l'artiste existe aussi en dehors du résultat visible : dans ses choix, sa fatigue, ses fragilités, ses environnements de travail et la manière dont il traverse les périodes de doute."
        ],
      },
      {
        heading: "La bienveillance comme condition de travail",
        paragraphs: [
          "Parler de bienveillance ne signifie pas renoncer à l'exigence. Cela signifie créer des cadres où l'exigence ne détruit pas les individus. Dans la danse, cette nuance est centrale.",
          "Un environnement artistique peut encourager la responsabilité, la précision et l'ambition tout en respectant la santé mentale de celles et ceux qui y participent."
        ],
      },
      {
        heading: "Durer demande une stratégie humaine",
        paragraphs: [
          "Le témoignage de Frédéric Fontan, centré sur la création, la résilience et la longévité, prolonge cette réflexion. Durer dans un métier créatif ne relève pas seulement de la passion : cela demande de savoir se reconstruire, se repositionner et reconnaître ses limites.",
          "À compléter : enrichir cet article avec des passages précis des épisodes sur les moments de bascule, les outils concrets et les ressources mobilisées par les invités."
        ],
      },
    ],
    aside: {
      title: "Angles à approfondir",
      items: [
        "La responsabilité des cadres de création.",
        "La place du doute dans une trajectoire artistique.",
        "Les outils concrets pour durer sans s'épuiser."
      ],
    },
    episodeLinks: [
      {
        name: "Johan Nus",
        slug: "111-johan-nus",
        number: "111",
        image: "/episodes/johannus111.png",
      },
      {
        name: "Frédéric Fontan",
        slug: "110-frederic-fontan",
        number: "110",
        image: "/episodes/fredericfontan110.png",
      },
    ],
    conclusion:
      "Penser l'artiste au-delà de la danse, c'est redonner de l'épaisseur à des parcours souvent résumés à leur visibilité. C'est aussi une manière plus juste, plus adulte et plus durable de parler de performance.",
  },
  {
    slug: "construire-carriere-danseur-durable",
    status: "published",
    publishedAt: "2026-07-11T07:00:00.000Z", // 09h00 Paris (CEST = UTC+2)
    category: "Carrière",
    title: "Construire une carrière durable : compétences, valeurs et choix humains",
    chapo:
      "À travers les épisodes avec Yasmine Habib, Tatiana Seguin, Julien Ramade et Rose Otentick, une même question revient : qu'est-ce qui permet vraiment de tenir dans le métier ?",
    meta: "11.07.26 · 9 min de lecture",
    publishedDate: "11.07.26",
    episodeSlug: "118-yasmine-habib",
    episodeNumber: "118",
    guest: "Yasmine Habib",
    image: "/images/les-invites-header/yasminehabib118.png",  // 1400×787 — image header 16:9 conçue pour ce cadrage
    heroImageType: 'portrait',
    readTime: "9 min",
    tags: ["Carrière", "Formation", "Contrats"],
    quote: "Avant de faire un choix carriériste, je fais un choix humain",
    sections: [
      {
        heading: "La technique ne suffit plus",
        paragraphs: [
          "Les épisodes récents de Dance Lab dessinent un constat clair : être danseur ne se limite plus à bien danser. Il faut comprendre les contrats, traverser les castings, défendre ses valeurs, apprendre à se présenter et construire des relations professionnelles solides.",
          "Rose Otentick aborde cette idée à travers les compétences qui font la différence. Julien Ramade rappelle, lui, l'importance des fondations et de la formation. Ces deux angles ne s'opposent pas : ils se complètent."
        ],
      },
      {
        heading: "Les valeurs comme boussole professionnelle",
        paragraphs: [
          "Dans l'épisode avec Tatiana Seguin, la notion de choix humain prend une place forte. La carrière n'est pas seulement une accumulation d'opportunités : elle se construit aussi par les renoncements, les fidélités et les cadres que l'on accepte ou non.",
          "Cette dimension rejoint l'épisode avec Yasmine Habib, qui aborde les valeurs, les droits des artistes, les contrats et la nécessité de protéger sa place dans un milieu parfois traversé par l'hypocrisie ou la toxicité."
        ],
      },
      {
        heading: "Apprendre à se protéger",
        paragraphs: [
          "Construire une carrière durable, c'est aussi savoir lire ce qui se joue autour de soi : les rapports de pouvoir, les conditions de travail, les promesses floues, les contrats absents ou les attentes implicites.",
          "À compléter : ajouter des conseils juridiques précis ou des ressources professionnelles lorsque Dance Lab disposera de contenus validés sur les contrats, l'intermittence et les droits des artistes."
        ],
      },
    ],
    aside: {
      title: "Les piliers qui émergent des épisodes",
      items: [
        "Une formation solide.",
        "Des valeurs claires.",
        "Une meilleure connaissance des droits et contrats.",
        "Des choix professionnels qui restent humains."
      ],
    },
    episodeLinks: [
      {
        name: "Yasmine Habib",
        slug: "118-yasmine-habib",
        number: "118",
        image: "/episodes/yasminehabib118.png",
      },
      {
        name: "Tatiana Seguin",
        slug: "117-tatiana-seguin",
        number: "117",
        image: "/episodes/tatianaseguin117.png",
      },
      {
        name: "Julien Ramade",
        slug: "116-julien-ramade",
        number: "116",
        image: "/episodes/julienramade116.png",
      },
      {
        name: "Rose Otentick",
        slug: "114-rose-otentick",
        number: "114",
        image: "/episodes/roseotentick114.png",
      },
    ],
    conclusion:
      "La carrière d'un danseur ne se joue pas seulement dans le studio. Elle se construit dans une somme de décisions : comment apprendre, avec qui travailler, quoi accepter, quand dire non et comment rester aligné sans s'isoler.",
  },
  {
    slug: "5-documentaires-danse-a-regarder",
    status: "published",
    publishedAt: "2026-08-11T07:00:00.000Z", // 09h00 Paris (CEST = UTC+2)
    category: "Sélection",
    title: "J'ai arrêté de scroller, voilà les 5 documentaires que j'ai regardés",
    chapo:
      "On passe des heures à scroller en ayant parfois l'impression de n'avoir rien retenu une fois le téléphone posé. Alors récemment, j'ai remplacé une partie de ce temps par des documentaires sur la danse, et je vous les partage pour que vous aussi vous compreniez ce qu'il y a derrière un mouvement, un style de danse ou une culture.",
    meta: "11.08.26 · 8 min de lecture",
    publishedDate: "11.08.26",
    episodeSlug: "",
    episodeNumber: "",
    guest: "Maïwenn Bramoulle",
    image: "https://img.youtube.com/vi/ljP4RU067jY/maxresdefault.jpg",
    heroImageType: 'scene',
    imageObjectPosition: "center center",
    heroAspectRatio: "16 / 9",
    useHeroSlider: true,
    readTime: "8 min",
    tags: ["Documentaires", "Cinéma", "Culture", "Sélection"],
    quote: "Comprendre l'histoire d'une danse change complètement la manière dont on la regarde.",
    sections: [
      {
        heading: "1. Reset – Relève : histoire d'une création",
        paragraphs: [
          "Réalisé par Thierry Demaizière et Alban Teurlai, Reset suit Benjamin Millepied dans les coulisses de la création d'un ballet pour l'Opéra national de Paris, alors qu'il vient d'en prendre la direction de la danse.",
          "On assiste aux répétitions, aux recherches, aux échanges avec les danseurs, aux choix artistiques, mais aussi aux doutes et à la pression qui accompagnent la création. Ce qui m'intéresse le plus dans ce documentaire : on ne voit pas uniquement le résultat final. On voit tout ce qu'on ne montre habituellement pas : les erreurs, les ajustements, les idées qui évoluent. Et surtout tout le travail qu'il y a derrière pour quelques minutes passées sur scène.",
          "Une vraie plongée dans le processus de création chorégraphique."
        ],
        docLink: {
          title: "Relève : histoire d'une création",
          platform: "Netflix",
          url: "https://www.netflix.com/title/80107599",
          thumbnail: "https://img.youtube.com/vi/MOkV27lgjBc/maxresdefault.jpg",
        },
      },
      {
        heading: "2. Rize",
        paragraphs: [
          "Réalisé par David LaChapelle et sorti en 2005, Rize nous emmène dans les quartiers de Los Angeles où se développent le clowning puis le krump. Mais le documentaire ne raconte pas simplement l'apparition d'un nouveau style de danse.",
          "Il montre surtout pourquoi cette danse est apparue ; dans un contexte marqué par les difficultés sociales et la violence, le mouvement devient donc un moyen d'expression, un espace de communauté et une manière de transformer ce qui est vécu en quelque chose d'autre.",
          "C'est aussi ce qui rend le documentaire intéressant quand on ne danse pas : comprendre qu'un style ne naît jamais de nulle part et que derrière des mouvements que l'on peut aujourd'hui retrouver sur scène, dans des clips ou dans des battles, il y a une histoire et toute une culture."
        ],
        docLink: {
          title: "Rize",
          platform: "Apple TV",
          url: "https://tv.apple.com/fr/movie/rize/umc.cmc.7bt61f1l4xaaggyg69l9iit7x",
          thumbnail: "/images/articles/rize.jpeg",
        },
      },
      {
        heading: "3. Paris Is Burning",
        paragraphs: [
          "Réalisé par Jennie Livingston et tourné dans le New York des années 1980, Paris Is Burning nous plonge au cœur de la scène ballroom et de ses balls, de ses catégories et de ses Houses. Aujourd'hui, le voguing et l'esthétique ballroom sont partout — dans la mode, les clips, les défilés, les émissions télévisées ou encore sur les réseaux sociaux. Mais pour comprendre d'où vient cette culture, ce documentaire reste incontournable.",
          "On y découvre une communauté principalement noire et latino LGBTQ+, qui crée ses propres espaces d'expression et de reconnaissance dans une société où elle subit de nombreuses discriminations.",
          "Le documentaire permet aussi de remettre beaucoup de choses dans leur contexte. Parce que derrière des termes, des mouvements ou des références aujourd'hui repris par la pop culture se trouve toute une histoire sociale et culturelle qu'on ne connaît pas forcément. À voir pour découvrir le voguing, évidemment, mais surtout pour comprendre la culture qui l'entoure."
        ],
        docLink: {
          title: "Paris Is Burning",
          platform: "Prime Video",
          url: "https://www.primevideo.com/detail/Paris-Is-Burning/0SLP8LK9UUBFOCA25XROXDP8RN",
          thumbnail: "https://img.youtube.com/vi/o47CwiJLpes/maxresdefault.jpg",
        },
      },
      {
        heading: "4. Rebonds : une épopée de la danse électro",
        paragraphs: [
          "Produite par ARTE, cette série documentaire retrace l'histoire de la danse électro depuis ses origines dans les clubs parisiens. Si, pour vous, danse électro rime uniquement avec Tecktonik et années 2000, Rebonds risque de vous faire revoir pas mal de choses.",
          "La série revient évidemment sur l'explosion du phénomène Tecktonik, qui a propulsé cette danse dans les médias et dans le monde entier, mais aussi sur ce qu'il s'est passé lorsque la tendance est retombée. Car la danse, elle, n'a jamais vraiment disparu.",
          "C'est aussi un documentaire intéressant pour comprendre la différence entre une tendance médiatique et une culture qui, elle, continue d'exister une fois que les projecteurs se sont éteints — jusqu'à trouver une nouvelle reconnaissance autour des Jeux olympiques de Paris 2024."
        ],
        docLink: {
          title: "Rebonds : une épopée de la danse électro",
          platform: "ARTE",
          url: "https://www.youtube.com/watch?v=ljP4RU067jY",
          thumbnail: "https://img.youtube.com/vi/ljP4RU067jY/maxresdefault.jpg",
          free: true,
        },
      },
      {
        heading: "5. Mr. Gaga",
        paragraphs: [
          "Réalisé par Tomer Heymann, Mr. Gaga retrace le parcours du chorégraphe israélien Ohad Naharin, longtemps directeur artistique de la Batsheva Dance Company et créateur du langage de mouvement Gaga. Et non, rien à voir avec Lady Gaga.",
          "À travers des images d'archives, des répétitions et son parcours personnel, le documentaire permet de comprendre progressivement sa manière d'envisager le corps et la danse. Ce qui est intéressant ici, c'est justement de sortir de l'idée qu'il faudrait toujours reproduire une forme parfaitement définie.",
          "Avec le Gaga, la recherche passe beaucoup par les sensations, l'imaginaire et l'exploration du mouvement. Même sans pratiquer la danse contemporaine, Mr. Gaga donne une autre manière de regarder un corps bouger — et de comprendre tout le travail de recherche qui peut se cacher derrière un geste qui paraît instinctif."
        ],
        docLink: {
          title: "Mr. Gaga, sur les pas d'Ohad Naharin",
          platform: "Apple TV",
          url: "https://tv.apple.com/fr/movie/mr-gaga/umc.cmc.4719va9sz7ufv9etdcxvirx89",
          thumbnail: "https://img.youtube.com/vi/F6gd8xpFMsM/maxresdefault.jpg",
        },
      },
    ],
    aside: {
      title: "Les 5 en résumé",
      items: [
        "Reset – Relève · Demaizière & Teurlai · Les coulisses d'une création à l'Opéra de Paris.",
        "Rize · David LaChapelle · L'émergence du krump à Los Angeles.",
        "Paris Is Burning · Jennie Livingston · La culture ballroom et voguing des années 80.",
        "Rebonds · ARTE · L'histoire de la danse électro, de la Tecktonik aux JO 2024.",
        "Mr. Gaga · Tomer Heymann · Ohad Naharin et le langage de mouvement Gaga."
      ],
    },
    episodeLinks: [
      {
        name: "Grichka Rootz",
        slug: "113-grichka-rootz",
        number: "113",
        image: "/episodes/grichkarootz113.png",
      },
      {
        name: "Dexter",
        slug: "91-dexter",
        number: "91",
        image: "/episodes/dexter91.png",
      },
      {
        name: "Taylor Chateau",
        slug: "82-taylor-chateau",
        number: "82",
        image: "/episodes/taylorchateau82.png",
      },
    ],
    conclusion: [
      "Ces 5 documentaires parlent tous de danse, mais surtout de création, de culture, d'identité, de transmission, de communautés et de la société dans laquelle ces mouvements sont apparus. Comprendre l'histoire d'une danse change complètement la manière dont on la regarde.",
      "Et maintenant, j'ai besoin de vous : quel documentaire sur la danse tout le monde devrait avoir vu au moins une fois ? Je prends vos recommandations juste en dessous pour une partie 2.",
    ],
  },
  {
    slug: "reseaux-sociaux-obligatoires-danseur",
    status: "published",
    publishedAt: "2026-08-13T07:00:00.000Z", // 09h00 Paris (CEST = UTC+2)
    category: "Décryptage",
    title: "Les réseaux sociaux sont-ils devenus obligatoires pour un.e danseur.se ?",
    chapo:
      "Il y a encore quelques années, avoir un compte Instagram quand on était danseur.se professionnel.le, c'était un plus. Aujourd'hui, la question que je me pose est la suivante : est-ce qu'un.e danseur.se qui n'est pas présent sur les réseaux sociaux peut encore faire carrière ?",
    meta: "13.08.26 · 9 min de lecture",
    publishedDate: "13.08.26",
    episodeSlug: "",
    episodeNumber: "",
    guest: "Maïwenn Bramoulle",
    image: "/images/maiwenn-2.jpg",
    imageCredit: "© Blandine Abad",
    heroImageType: 'portrait',
    imageObjectPosition: "right 38%",
    readTime: "9 min",
    tags: ["Réseaux sociaux", "Carrière", "Visibilité", "Instagram"],
    quote: "Danser et savoir se rendre visible sont deux compétences différentes.",
    sections: [
      {
        heading: "Instagram est-il devenu notre nouveau CV ?",
        paragraphs: [
          "Quand un chorégraphe, un directeur artistique ou une production découvre le nom d'un danseur, l'un des premiers réflexes c'est : <strong>chercher son profil sur Instagram</strong>. En quelques secondes, on peut voir comment iel danse, son style, les projets sur lesquels il a travaillé, les chorégraphes avec lesquels iel collabore et plus largement son univers artistique.",
          "Finalement, là où un CV permet de raconter son parcours, les réseaux permettent de le montrer immédiatement. Un danseur peut aujourd'hui être découvert grâce à une vidéo, entrer en contact avec des artistes du monde entier, y décrocher des opportunités ou simplement rester dans l'esprit d'un chorégraphe qui pensera peut-être à lui quelques mois plus tard pour un projet.",
          "Le problème commence lorsque cette visibilité n'est plus seulement un avantage, mais devient progressivement <strong>une compétence que l'on attend de nous</strong>.",
          "Hors, <strong>danser et savoir se rendre visible sont deux compétences différentes</strong>, pourtant, elles ont tendance à devenir de plus en plus liées.",
          "Et cela pose une vraie question : à partir de quel moment la capacité à communiquer autour de son travail prend-elle trop de place par rapport au travail lui-même ? [Vous avez 4h ou alors vous pouvez répondre à cette question, spontanément, dans l'espace dédié à la fin de cet article.]",
        ],
      },
      {
        heading: "Être un.e bon.ne danseur.se et savoir créer du contenu, ce n'est pas la même chose",
        paragraphs: [
          "C'est probablement là que le sujet devient beaucoup plus intéressant. Parce qu'<strong>un excellent danseur n'est pas nécessairement un excellent créateur de contenu</strong>.",
          "Notamment à l'ère de la recherche du chiffre en tout genre : like, followers, etc, tout le monde ne s'y retrouve pas",
          "La réalité c'est qu'on peut avoir <strong>une présence incroyable sur scène</strong> et <strong>être extrêmement mal à l'aise devant une caméra</strong>. [Et je peux vous dire qu'on est nombreux.ses]",
          "On peut aussi être capable d'interpréter une chorégraphie devant des milliers de personnes et pourtant détester parler face caméra.",
          "On peut avoir énormément de choses à proposer artistiquement sans avoir envie d'exposer son quotidien, sa vie privée, de vloger, de comprendre les algorithmes ou de réfléchir constamment à ce qu'il faudrait publier.",
        ],
      },
      {
        heading: "Le nombre d'abonnés fait-il vraiment la différence ?",
        paragraphs: [
          "Il faut aussi distinguer ceci : <strong>avoir une présence en ligne et avoir une grosse communauté c'est autre chose</strong>.",
          "On peut très bien avoir 800 abonnés et un compte qui permet immédiatement de comprendre qui l'on est artistiquement. À l'inverse, avoir des dizaines de milliers d'abonnés et ne pas dire nécessairement grand-chose de son travail et de sa capacité à s'intégrer dans une création, à apprendre rapidement une chorégraphie ou à travailler avec une équipe.",
          "[Et autre point, très important pour moi : <strong>tes followers ne disent rien de ton comportement au travail</strong>, ni de ton éthique et de tes vraies valeurs, ou encore si tu respectes tes collègues]",
          "Dans certains projets, notamment lorsqu'une marque est impliquée ou que la visibilité fait partie de la campagne, la communauté d'un artiste peut évidemment représenter un intérêt supplémentaire. Mais par pitié, <strong>ne confondez pas la visibilité et les compétences artistiques</strong> qui n'ont absolument rien à voir. C'est une distinction importante à conserver.",
        ],
      },
      {
        heading: "Peut-on encore faire carrière sans les réseaux sociaux ?",
        paragraphs: [
          "Je dirai que oui, même si je pense que <strong>d'ici 3/5 ans les CV auront disparu</strong>.",
          "En revanches, aujourd'hui, les auditions existent toujours, le bouche-à-oreille aussi.",
          "Les rencontres via les cours, les workshops, les directeurs de casting et surtout le réseau professionnel construit au fil des contrats continuent d'avoir une place essentielle.",
          "Mais <strong>prétendre que les réseaux sociaux n'ont aucune importance aujourd'hui est évidemment faux</strong>. Un.e danseur.se visible dispose d'un outil supplémentaire pour être découvert et pour rester dans les esprits.",
          "Et dans un métier où énormément de personnes sont talentueuses, cette visibilité peut forcément devenir un avantage. <strong>Pas parce que la personne danse mieux, mais simplement parce qu'on pense à elle.</strong> C'est le game, comme on dit dans notre milieu.",
        ],
      },
      {
        heading: "Le vrai enjeu : se construire un portfolio, et ne pas penser qu'aux abonnés",
        paragraphs: [
          "Quand on parle des réseaux sociaux aux artistes, on tombe rapidement dans la même injonction : il faut poster régulièrement, faire des Reels, montrer les coulisses, parler face caméra, comprendre les tendances, etc. Mais je ne pense vraiment pas que tous les danseurs.ses aient besoin de devenir créateurs de contenu.",
          "En revanche, avoir un espace qui représente réellement son travail peut aujourd'hui avoir du sens en partageant quelques vidéos que l'on aime vraiment, des extraits de projets, une bio claire, son univers, les informations permettant de nous contacter.",
          "Il faut penser son compte davantage comme <strong>un portfolio artistique</strong> que comme <strong>une course permanente aux abonnés</strong>.",
          "Parce qu'il y a aussi un piège à vouloir absolument être visible : passer tellement de temps à montrer que l'on travaille que l'on finit par consacrer une énergie considérable à <strong>documenter sa carrière plutôt qu'à la construire</strong>.",
        ],
      },
      {
        heading: "Être visible, oui, mais à quel prix ?",
        paragraphs: [
          "Si être présent sur les réseaux devient <strong>une source permanente de comparaison, de pression ou d'épuisement</strong>, il faut aussi être capable de prendre de la distance.",
          "Le paradoxe est assez fou : les réseaux peuvent nous aider à développer notre carrière tout en nous donnant constamment l'impression que celle des autres avance plus vite.",
          "On ouvre Instagram et quelqu'un vient de décrocher un contrat, une autre personne est en tournée, une autre annonce un nouveau projet, une autre publie une vidéo dans un studio alors qu'on est chez soi depuis trois semaines sans contrat.",
          "On est censé être content pour l'autre, mais si on n'est pas bien dans sa propre tête, on peut se retrouver à se comparer à sa propre situation. Et à force, <strong>notre perception de notre propre carrière peut être complètement faussée</strong>.",
          "<strong>Les réseaux sont des outils</strong> et comme tous les outils, leur utilité dépend entièrement de la manière dont on les utilise et surtout du recul que l'on garde sur eux.",
          "En 2026, choisir de ne pas être présent sur les réseaux, c'est choisir de se passer d'un outil professionnel qui peut être très puissant pour sa propre marque personnelle. Et encore une fois, ce n'est pas obligatoire mais s'il existe et s'il ouvre des portes, il faut savoir s'en servir.",
          "L'objectif n'est donc peut-être pas de devenir visible à tout prix, mais de trouver <strong>la manière d'être visible, celle qui nous ressemble</strong>, sans transformer notre métier de danseur en une obligation permanente de créer du contenu.",
        ],
      },
    ],
    aside: {
      title: "À retenir",
      items: [
        "Les réseaux ne remplacent pas l'audition, la recommandation ou le réseau professionnel.",
        "Être bon danseur et être bon créateur de contenu sont deux compétences distinctes.",
        "Un compte qui montre clairement qui l'on est vaut souvent plus que beaucoup d'abonnés.",
        "Penser « portfolio artistique » plutôt que « course à la visibilité »."
      ],
    },
    episodeLinks: [
      {
        name: "Maxime Rullier",
        slug: "102-maxime-rullier",
        number: "102",
        image: "/episodes/maximerullier102.png",
      },
      {
        name: "Rose Otentick",
        slug: "114-rose-otentick",
        number: "114",
        image: "/episodes/roseotentick114.png",
      },
      {
        name: "Bertrand Exertier",
        slug: "123-bertrand-exertier",
        number: "123",
        image: "/episodes/bertrandexertier123.png",
      },
    ],
    conclusion:
      "Et toi, est-ce que tu as déjà eu l'impression que ta présence ou ton absence sur les réseaux avait eu un impact sur ta carrière ?",
  },
  {
    slug: "5-lieux-freestyler-paris",
    status: "published",
    publishedAt: "2026-08-15T07:00:00.000Z",
    category: "Recommandations",
    title: "5 lieux où freestyler à Paris",
    chapo:
      "On associe encore beaucoup le freestyle au hip-hop, pourtant, \"freestyler\", improviser, ce n'est pas pratiquer un style de danse en particulier.",
    meta: "15.08.26 · 4 min de lecture",
    publishedDate: "15.08.26",
    episodeSlug: "",
    episodeNumber: "",
    guest: "Maïwenn Bramoulle",
    image: "/images/articles/lavillette.jpg",
    imageCredit: "© Joseph Banderet",
    heroImageType: 'scene',
    readTime: "4 min",
    tags: ["Freestyle", "Paris", "Adresses", "Hip-hop", "Spots"],
    quote:
      "Danser avec un DJ, avec les autres et avec ce qui se passe réellement dans la musique, c'est aussi une autre manière d'apprendre.",
    sections: [
      {
        heading: "",
        paragraphs: [
          "On associe encore beaucoup le freestyle au hip-hop, pourtant, \"freestyler\", improviser, ce n'est pas pratiquer un style de danse en particulier.",
          "Que tu pratiques la house, le hip-hop, le waacking, le voguing, le krump, l'électro, le contemporain, peu importe ton style, l'improvisation traverse toutes les danses, avec des histoires, des codes et des cultures qui leur sont propres.",
          "Et oui, pour progresser en freestyle, pour affiner son propre style, les cours ne font pas tout.",
          "Il faut aussi des endroits où chercher, tester, observer, échanger, entrer dans un cercle, écouter de la musique et rencontrer d'autres danseurs.ses.",
          "À Paris, certains lieux permettent justement de vivre la danse autrement qu'en suivant une chorégraphie face à un miroir.",
          "J'en ai donc sélectionné 5 juste pour vous.",
        ],
      },
      {
        heading: "01. Le CENTQUATRE-PARIS",
        paragraphs: [
          "C'est probablement l'un des endroits les plus évidents de Paris lorsqu'on cherche simplement un espace pour danser.",
          "Sous les grandes halles du 104, les <strong>Espaces libres sont accessibles gratuitement et sans réservation</strong> pendant leurs périodes d'ouverture.",
          "Là-bas vous retrouverez du Krump, du break, du contemporain, du classique, du lindy hop, mais aussi cirque, roller, double dutch et même des comédiens qui révisent et jouent leur texte.",
          "C'est évidemment ça qui rend le lieu intéressant : tu peux venir t'entraîner et observer les autres danser, c'est si inspirant",
          "📍 5 rue Curial, Paris 19e",
        ],
      },
      {
        heading: "02. La Place",
        paragraphs: [
          "La Place est davantage ancrée dans les cultures hip-hop, mais reste difficile à enlever de cette sélection tant le freestyle y occupe une place importante.",
          "Chaque jeudi, le Grand Studio Léo Ferré accueille notamment un <strong>training libre de trois heures de 17h à 20h</strong>, ouvert aux danseurs.ses souhaitant venir s'entraîner en autonomie.",
          "Le lieu accueille aussi des battles et événements autour du breaking, du krump, de la house, du hip-hop ou encore du waacking.",
          "Ce n'est donc pas seulement un endroit où regarder de la danse : c'est aussi <strong>un lieu où les communautés se croisent, s'entraînent et se rencontrent</strong>.",
          "📍 10 passage de la Canopée, Paris 1er",
        ],
      },
      {
        heading: "03. La Villette, sous la Grande Halle",
        paragraphs: [
          "Si tu es danseur.se à Paris, tu es probablement déjà passé devant les danseurs qui s'entraînent sous la Grande Halle de La Villette.",
          "Depuis plusieurs années, un grand parquet est installé sous le péristyle de la Grande Halle et permet de venir danser et s'entraîner librement. D'autres espaces de danse ont également été installés dans le parc.",
          "Tu n'as pas besoin d'attendre un événement ou un workshop : tu peux venir avec ta musique, t'entraîner, chercher, freestyler et observer les autres danseurs.",
          "Là-bas tu croises toutes les disciplines et quand tu viens pour travailler ta danse, tu repars souvent inspiré.e par celle des autres.",
          "📍 Sous le péristyle de la Grande Halle de La Villette, Paris 19e",
        ],
      },
      {
        heading: "04. La Mona",
        paragraphs: [
          "Aller, on quitte les studios pour revenir à l'endroit le plus essentiel dans l'histoire de nombreuses danses : le club.",
          "La Mona organise depuis 2008 des soirées autour de la house et du disco avec une particularité : <strong>la danse est réellement placée au centre du dancefloor</strong>.",
          "Les soirées commencent notamment par une Dance Class avant de laisser place au club et à la danse et des contests sont également organisés au cours de l'année.",
          "Et c'est éminemment important pour moi de l'intégrer ici parce que <strong>le freestyle, et ton style de danse ne se travaille pas uniquement dans un studio</strong>.",
          "Danser avec un DJ, avec les autres et avec ce qui se passe réellement dans la musique, c'est aussi une autre manière d'apprendre, peut-être la meilleure, je ne sais pas.",
          "📍 Événements notamment à La Bellevilloise, Paris 20e, et en open air selon la programmation.",
        ],
      },
      {
        heading: "05. Le Carreau du Temple",
        paragraphs: [
          "Le Carreau du Temple est un peu différent des quatre autres.",
          "Ce n'est pas un spot où l'on vient forcément poser son enceinte pour s'entraîner librement, mais c'est plutôt un lieu où tu peux aller chercher de nouvelles influences.",
          "Sa programmation fait se rencontrer pratiques artistiques, sportives, spectacles, festivals et danse contemporaine. La Ville de Paris le présente d'ailleurs comme un lieu associant pratiques sportives et artistiques à une programmation de spectacles et de festivals.",
          "Et pour moi, ça compte aussi dans cet article.",
          "Parce que <strong>la base du développement de soi, de sa danse, c'est d'observer, de regarder d'autres corps, d'autres écritures et d'autres façons de penser le mouvement</strong>.",
          "📍 2 rue Perrée, Paris 3e",
        ],
      },
    ],
    aside: {
      title: "Les 5 spots en résumé",
      items: [
        "Le 104 — Espaces libres gratuits et sans réservation, toutes disciplines.",
        "La Place — Training libre chaque jeudi de 17h à 20h, cultures hip-hop.",
        "La Villette — Parquet sous la Grande Halle, accès libre, toutes disciplines.",
        "La Mona — Soirées house et disco depuis 2008, la danse au cœur du dancefloor.",
        "Le Carreau du Temple — Programmation artistique pour nourrir son regard et ses références.",
      ],
    },
    conclusion: [
      "De manière simple, pour apprendre à freestyler il faut surtout développer son écoute, ses références, sa curiosité et sa manière personnelle de répondre à la musique.",
      "Et si tu as peur du regard des autres, l'endroit le plus safe reste chez toi, alors mets le son à fond et lâche toi, danses matin, midi et soir.",
      "Et toi, c'est où ton spot préféré pour freestyler à Paris ?",
    ],
  },
]

export function getMagazineArticleBySlug(slug: string) {
  return magazineArticles.find((article) => article.slug === slug)
}

// ─────────────────────────────────────────────────────────────────────────────
// ── Logique de publication — SOURCE DE VÉRITÉ UNIQUE ─────────────────────────
//
// Toutes les parties du site (Magazine, Tous les articles, article individuel,
// HomeClient, slider…) DOIVENT utiliser ces deux fonctions.
// Ne jamais filtrer magazineArticles directement ailleurs dans le code.
//
// Format de publishedAt : ISO 8601 UTC
//   Été  (CEST, UTC+2) → 09h00 Paris = "T07:00:00.000Z"
//   Hiver (CET, UTC+1) → 09h00 Paris = "T08:00:00.000Z"
//
// Pour programmer 6 articles toutes les 3 jours à partir du 15 août :
//   Article 1 → publishedAt: "2026-08-15T07:00:00.000Z"  status: "scheduled"
//   Article 2 → publishedAt: "2026-08-18T07:00:00.000Z"  status: "scheduled"
//   Article 3 → publishedAt: "2026-08-21T07:00:00.000Z"  status: "scheduled"
//   …
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Retourne true si l'article est actuellement visible sur le site public.
 *
 * - "draft"     → jamais visible
 * - "scheduled" → visible seulement si publishedAt ≤ maintenant (UTC)
 * - "published" → visible (publishedAt doit être dans le passé)
 */
export function isArticlePublished(article: MagazineArticle): boolean {
  if (article.status === "draft") return false
  return new Date(article.publishedAt).getTime() <= Date.now()
}

/**
 * Retourne UNIQUEMENT les articles actuellement publiés,
 * triés du plus récent au plus ancien (par publishedAt).
 *
 * À utiliser partout sur le site à la place de `magazineArticles` directement.
 */
export function getPublishedArticles(): MagazineArticle[] {
  return magazineArticles
    .filter(isArticlePublished)
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    )
}

// ─── File éditoriale (lecture seule — pour visualiser l'état du Magazine) ────
//
// PUBLIÉS     → status: "published"  + publishedAt dans le passé
// PROGRAMMÉS  → status: "scheduled"  + publishedAt dans le futur
// BROUILLONS  → status: "draft"
//
// Exemple d'affichage dans un éditeur / dashboard futur :
//   getEditorialQueue() → { published, scheduled, drafts }
//
export function getEditorialQueue() {
  const now = Date.now()
  const published  = magazineArticles.filter(
    a => a.status !== "draft" && new Date(a.publishedAt).getTime() <= now
  ).sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())

  const scheduled = magazineArticles.filter(
    a => a.status === "scheduled" && new Date(a.publishedAt).getTime() > now
  ).sort((a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime())

  const drafts = magazineArticles.filter(a => a.status === "draft")

  return { published, scheduled, drafts }
}
