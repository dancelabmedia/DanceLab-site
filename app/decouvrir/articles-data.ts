export type MagazineArticle = {
  slug: string
  category: string
  title: string
  chapo: string
  meta: string
  publishedDate: string
  episodeSlug: string
  episodeNumber: string
  guest: string
  image: string
  readTime: string
  tags: string[]
  quote?: string
  sections: {
    heading: string
    paragraphs: string[]
  }[]
  aside?: {
    title: string
    items: string[]
  }
  conclusion: string
}

export const magazineArticles: MagazineArticle[] = [
  {
    slug: "pourquoi-le-breakdance-est-devenu-olympique",
    category: "Décryptage",
    title: "Pourquoi le breakdance est devenu une discipline olympique",
    chapo:
      "Entré au programme des Jeux de Paris 2024, le breaking a déplacé une culture née dans la rue vers l'une des scènes sportives les plus regardées au monde. Une consécration, mais aussi un débat sur ce que l'institution fait aux danses issues des cultures populaires.",
    meta: "18.06.26 · 8 min de lecture",
    publishedDate: "18.06.26",
    episodeSlug: "113-grichka-rootz",
    episodeNumber: "113",
    guest: "Grichka Rootz",
    image: "/images/breakdance.jpg",
    readTime: "8 min",
    tags: ["Breaking", "Olympisme", "Culture hip-hop"],
    sections: [
      {
        heading: "Une culture née loin des stades",
        paragraphs: [
          "Avant d'être nommé dans un programme olympique, le breaking est d'abord une pratique culturelle. Il naît dans le Bronx dans les années 1970, au croisement de la musique, du DJing, de la fête, de l'affirmation de soi et de la rivalité créative. On n'y entre pas seulement par la performance physique : on y entre par une histoire, un rapport au son, une attitude, une manière de prendre sa place dans le cercle.",
          "C'est ce qui rend son arrivée aux Jeux à la fois spectaculaire et délicate. Le breaking possède déjà ses codes, ses compétitions, ses figures, ses mythologies et ses scènes internationales. L'institution olympique ne lui donne donc pas une existence : elle lui donne une visibilité différente."
        ],
      },
      {
        heading: "Pourquoi Paris 2024 a changé la donne",
        paragraphs: [
          "Le breaking a été intégré aux Jeux de Paris 2024 dans une volonté plus large de rapprocher l'événement olympique de pratiques urbaines, jeunes et spectaculaires. Après son apparition aux Jeux olympiques de la jeunesse de Buenos Aires en 2018, la discipline a trouvé à Paris une vitrine mondiale.",
          "Les épreuves ont eu lieu sous forme de battles individuels, avec des B-Girls et des B-Boys évalués sur leur musicalité, leur technique, leur originalité, leur vocabulaire et leur capacité à répondre à l'adversaire. Autrement dit : l'enjeu n'était pas seulement d'exécuter des figures, mais de garder l'esprit du duel, de l'improvisation et de la présence."
        ],
      },
      {
        heading: "La reconnaissance et ses tensions",
        paragraphs: [
          "Pour une partie du public, l'entrée du breaking aux Jeux a permis de révéler la complexité d'une danse souvent réduite à quelques images acrobatiques. Pour une partie de la communauté, elle a aussi soulevé une question : que devient une culture de battle lorsqu'elle est traduite dans un cadre réglementé, chronométré, noté, diffusé et commenté comme un sport ?",
          "Cette tension n'est pas une faiblesse. Elle dit quelque chose de la richesse du breaking : une danse capable d'entrer dans les institutions sans cesser de défendre son ancrage culturel."
        ],
      },
      {
        heading: "Et après les Jeux ?",
        paragraphs: [
          "Le paradoxe est là : le breaking a marqué les Jeux de Paris, mais il ne figure pas au programme de Los Angeles 2028. Ce retrait rappelle que l'olympisme fonctionne par cycles, choix stratégiques et arbitrages locaux. Une discipline peut être visible un été sans être durablement installée dans le programme.",
          "Pour le breaking, l'essentiel se jouera donc ailleurs aussi : dans les battles, les écoles, les crews, les événements indépendants et les communautés qui continuent de transmettre la culture au-delà du calendrier olympique."
        ],
      },
    ],
    aside: {
      title: "Repères",
      items: [
        "Le breaking s'est développé dans le Bronx dans les années 1970.",
        "La discipline a fait ses débuts olympiques à Paris 2024.",
        "Elle n'est pas inscrite au programme des Jeux de Los Angeles 2028."
      ],
    },
    conclusion:
      "Le passage du breaking par les Jeux olympiques n'épuise pas son histoire. Il en ouvre plutôt un chapitre : celui d'une culture populaire devenue visible à l'échelle mondiale, tout en continuant de vivre dans les cercles, les studios, les battles et les corps de celles et ceux qui la portent.",
  },
  {
    slug: "comprendre-le-waacking-histoire-culture-influences",
    category: "Culture",
    title: "Comprendre le Waacking : histoire, culture et influences",
    chapo:
      "Né dans les clubs de Los Angeles dans les années 1970, le waacking est bien plus qu'un vocabulaire de bras. C'est une danse d'expression, de théâtralité, de musique et d'affirmation, traversée par l'histoire des communautés LGBTQ+ et par l'imaginaire du disco.",
    meta: "25.06.26 · 7 min de lecture",
    publishedDate: "25.06.26",
    episodeSlug: "118-yasmine-habib",
    episodeNumber: "118",
    guest: "Yasmine Habib",
    image: "https://picsum.photos/seed/dancelab-waacking/1200/1500",
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
    conclusion:
      "Le waacking est une danse de liberté parce qu'il ne sépare pas le style de l'histoire. Il donne au corps une puissance narrative : celle de se montrer, de se transformer et de prendre l'espace avec précision, intensité et panache.",
  },
  {
    slug: "festivals-danse-incontournables-ete",
    category: "Agenda",
    title: "Les festivals de danse incontournables de l'été",
    chapo:
      "L'été transforme la carte culturelle française en terrain de circulation : grandes scènes contemporaines, festivals pluridisciplinaires, plein air, créations et rendez-vous professionnels. Voici comment repérer les temps forts sans se perdre dans l'abondance.",
    meta: "02.07.26 · 6 min de lecture",
    publishedDate: "02.07.26",
    episodeSlug: "117-tatiana-seguin",
    episodeNumber: "117",
    guest: "Tatiana Seguin",
    image: "https://picsum.photos/seed/dancelab-festival/1200/1500",
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
    conclusion:
      "Un festival réussi ne se résume pas à une accumulation de spectacles. C'est une manière de traverser la danse dans un temps concentré, de comparer les écritures, de rencontrer une scène et de comprendre ce que le spectacle vivant raconte d'une époque.",
  },
  {
    slug: "prevenir-les-blessures-danseurs",
    category: "Santé",
    title: "Prévenir les blessures : pourquoi les danseurs doivent être considérés comme des athlètes",
    chapo:
      "À partir de l'épisode avec Laura Malié-Leclerc, kinésithérapeute du sport spécialisée dans la danse, Dance Lab ouvre un sujet essentiel : apprendre à écouter le corps avant qu'il ne force l'arrêt.",
    meta: "06.07.26 · 7 min de lecture",
    publishedDate: "06.07.26",
    episodeSlug: "115-laura-malie-leclerc",
    episodeNumber: "115",
    guest: "Laura Malié-Leclerc",
    image: "/images/les-invites/lauramalieleclerc115.png",
    readTime: "7 min",
    tags: ["Santé", "Prévention", "Corps"],
    quote:
      "La douleur c’est le premier signal du corps pour te dire qu’il y a quelque chose qui ne va pas.",
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
    conclusion:
      "Cet épisode rappelle une idée simple mais encore trop peu installée : durer dans la danse demande autant de soin que de talent. Le corps n'est pas un outil à épuiser, c'est le lieu même de la pratique.",
  },
  {
    slug: "sante-mentale-artistes-danse",
    category: "Décryptage",
    title: "Santé mentale : penser l'artiste au-delà de la performance",
    chapo:
      "Les épisodes avec Johan Nus et Frédéric Fontan ouvrent une réflexion nécessaire : derrière la présence scénique, il y a des personnes, des doutes, des environnements de travail et des trajectoires à protéger.",
    meta: "09.07.26 · 8 min de lecture",
    publishedDate: "09.07.26",
    episodeSlug: "111-johan-nus",
    episodeNumber: "111",
    guest: "Johan Nus",
    image: "/images/les-invites/johannus111.png",
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
    conclusion:
      "Penser l'artiste au-delà de la danse, c'est redonner de l'épaisseur à des parcours souvent résumés à leur visibilité. C'est aussi une manière plus juste, plus adulte et plus durable de parler de performance.",
  },
  {
    slug: "construire-carriere-danseur-durable",
    category: "Carrière",
    title: "Construire une carrière durable : compétences, valeurs et choix humains",
    chapo:
      "À travers les épisodes avec Yasmine Habib, Tatiana Seguin, Julien Ramade et Rose Otentick, une même question revient : qu'est-ce qui permet vraiment de tenir dans le métier ?",
    meta: "11.07.26 · 9 min de lecture",
    publishedDate: "11.07.26",
    episodeSlug: "118-yasmine-habib",
    episodeNumber: "118",
    guest: "Yasmine Habib",
    image: "/images/les-invites/yasminehabib118.png",
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
    conclusion:
      "La carrière d'un danseur ne se joue pas seulement dans le studio. Elle se construit dans une somme de décisions : comment apprendre, avec qui travailler, quoi accepter, quand dire non et comment rester aligné sans s'isoler.",
  },
]

export function getMagazineArticleBySlug(slug: string) {
  return magazineArticles.find((article) => article.slug === slug)
}
