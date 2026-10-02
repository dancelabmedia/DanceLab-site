// ── Types ─────────────────────────────────────────────────────────────────────

export type MetierUniversId =
  | 'interpreter'
  | 'creer'
  | 'transmettre'
  | 'produire'
  | 'accompagner'
  | 'image'

export type NeConfondreAvec = {
  titre: string
  texte: string
  /** id d'un autre métier du site (pour un futur lien interne) */
  lien?: string
}

export type Metier = {
  id:           string
  nom:          string
  /** Texte court affiché dans la liste latérale et les cartes. */
  description:  string
  univers:      MetierUniversId
  featured?:    boolean
  /** Mots-clés éditoriaux affichés uniquement lorsqu'ils sont vérifiés. */
  tags?:         string[]

  // ── Contenu long (optionnel - renseigné progressivement) -----------------
  /** Définition éditoriale longue, affichée en accroche de la fiche métier. */
  definition?:      string
  /** Missions principales (liste). */
  missions?:        string[]
  /** Contexte et lieux d'exercice. */
  environnement?:   string
  /** Compétences clés requises (liste). */
  competences?:     string[]
  /** Formations, diplômes, certifications. */
  formation?:       string
  /** Statut, conditions d'exercice, régimes. */
  statut?:          string
  /** Métiers proches à ne pas confondre. */
  neConfondreAvec?: NeConfondreAvec[]
}

// ── Configuration des univers ─────────────────────────────────────────────────

export const UNIVERS: Record<MetierUniversId, {
  label:       string
  num:         string
  description: string
  slug:        string   // segment d'URL : /explorer/metiers-de-la-danse/[slug]
}> = {
  interpreter: {
    label:       'Interpréter',
    num:         '01',
    description: "Être sur scène. Habiter l'espace, porter une oeuvre, incarner une énergie.",
    slug:        'interpreter',
  },
  creer: {
    label:       'Créer',
    num:         '02',
    description: "Écrire le mouvement. Concevoir ce que les autres feront exister.",
    slug:        'creer',
  },
  transmettre: {
    label:       'Transmettre',
    num:         '03',
    description: "Passer le geste, la technique, le sens. Faire grandir ce qu'on a reçu.",
    slug:        'transmettre',
  },
  produire: {
    label:       'Produire & diffuser',
    num:         '04',
    description: "Rendre les projets possibles. Structurer, financer, mettre en tournée.",
    slug:        'produire-diffuser',
  },
  accompagner: {
    label:       'Accompagner',
    num:         '05',
    description: "Soutenir les corps et les carrières. Être là pour que le reste puisse exister.",
    slug:        'accompagner',
  },
  image: {
    label:       'Image & scène',
    num:         '06',
    description: "Encadrer et magnifier la danse. Ce qui la rend visible, lisible, mémorable.",
    slug:        'image-scene',
  },
}

export const UNIVERS_ORDER: MetierUniversId[] = [
  'interpreter', 'creer', 'transmettre', 'produire', 'accompagner', 'image',
]

// ── Données des métiers ───────────────────────────────────────────────────────

export const metiers: Metier[] = [

  // ── 01 · Interpréter ─────────────────────────────────────────────────────

  {
    id:          'danseur',
    nom:         'Danseur.se',
    description: "Au coeur de la danse. Interprète d'oeuvres chorégraphiques, dans des esthétiques allant du classique aux danses urbaines, du contemporain à la danse de salon.",
    univers:     'interpreter',
    featured:    true,

    definition: "Quand on pense aux métiers de la danse, c'est lui, ou elle, qui vient en tête en premier. Mais être danseur.se professionnel.le, c'est bien plus complexe qu'apprendre des chorégraphies et monter sur scène. Le quotidien peut être radicalement différent d'un contrat à l'autre : une semaine en résidence de création avec une compagnie contemporaine, la suivante en tournée dans un théâtre national, et quelques jours plus tard sur le plateau d'une émission télévisée. La discipline pratiquée, le réseau constitué et le moment de la carrière déterminent énormément. Ce qui ne change pas : un corps qu'on entretient chaque jour comme un instrument, une présence scénique qu'on travaille en permanence, et une capacité à recevoir des directions artistiques très différentes selon les projets.",

    missions: [
      "Apprendre et mémoriser des pièces chorégraphiques, parfois dans des esthétiques très différentes d'un projet à l'autre.",
      "Participer aux répétitions, souvent longues et intenses, sous la direction d'un.e chorégraphe ou d'un.e répétiteur.rice.",
      "Assurer les représentations avec le même niveau d'engagement à chaque plateau, quelle que soit la fatigue.",
      "Entretenir sa technique et son physique de façon quotidienne, y compris entre les contrats.",
      "Contribuer parfois à la création elle-même : improvisations, propositions de mouvement, co-écriture.",
    ],

    environnement: "Les contextes de travail sont très variés. Compagnies contemporaines, ballets, compagnies hip-hop, productions de comédies musicales, opéras, grandes cérémonies, clips, publicités... Un.e même danseur.se peut naviguer entre plusieurs de ces univers au cours d'une carrière, ou même d'une seule saison. Les répétitions se font en studio, souvent en ville, et les représentations peuvent emmener partout en France et à l'étranger.",

    formation: "Il n'existe pas de diplôme légalement obligatoire pour se produire en tant qu'interprète. Dans les faits, la plupart des danseurs.euses professionnel.les ont suivi une formation longue : une grande école nationale (CNSMD de Paris ou Lyon, CNDC d'Angers), une école privée agréée, ou un parcours construit autrement. Dans les danses urbaines, l'autodidaxie et la scène ont souvent remplacé les cursus académiques.",

    statut: "La majorité des interprètes travaillent sous le régime de l'intermittence du spectacle, annexe 8. Les conditions d'accès, en nombre d'heures, évoluent régulièrement, il vaut mieux vérifier les seuils actuels directement auprès de Pôle Emploi Spectacles ou d'un syndicat comme le SFA.",

    competences: [
      "Technique solide dans une ou plusieurs disciplines, avec souvent une vraie polyvalence.",
      "Mémoire corporelle et sens du rythme.",
      "Capacité à recevoir des directions artistiques et à les intégrer vite.",
      "Endurance physique et régularité dans l'entraînement.",
      "Présence scénique et écoute des partenaires et de l'espace.",
    ],

    neConfondreAvec: [
      {
        titre: "Performeur.se",
        texte: "La performance implique souvent un dispositif singulier, un cadre conceptuel ou une présence hors du cadre scénique traditionnel. Le danseur ou la danseuse interprète en général une chorégraphie dans un espace et un temps définis.",
        lien:  'performeur',
      },
    ],
  },

  {
    id:          'performeur',
    nom:         'Performeur.se',
    description: "À la frontière de la danse et des arts vivants. Présence physique, corps en jeu, dispositifs singuliers.",
    univers:     'interpreter',

    definition: "La performance est l'un des territoires les plus difficiles à définir dans le monde de la danse, et c'est peut-être ce qui le rend aussi intéressant. Un.e performeur.se peut passer une heure immobile dans une galerie d'art, traverser un espace public avec un geste répété à l'infini, ou construire un solo dans lequel le corps pose des questions plus qu'il ne répond. Ce n'est pas forcément un spectacle. Parfois pas même un plateau. Le corps est le médium, le sujet et le lieu de la réflexion en même temps.",

    missions: [
      "Concevoir et/ou interpréter des performances, souvent en tant qu'auteur.e autant qu'interprète.",
      "S'adapter à des contextes très différents : galerie, espace public, espace industriel, dispositif relationnel.",
      "Travailler en dialogue avec d'autres disciplines : arts visuels, musique, théâtre, vidéo.",
      "Nourrir la pratique d'un vrai travail de recherche en amont de chaque projet.",
      "Participer à des résidences, festivals pluridisciplinaires et biennales d'art contemporain.",
    ],

    environnement: "Lieux d'art contemporain, théâtres, galeries, espaces publics, festivals pluridisciplinaires. Les commandes viennent souvent du monde des arts visuels autant que du spectacle vivant. Les conditions de production sont très variables, et c'est souvent à l'artiste de les construire.",

    formation: "Pas de formation standardisée. Certains.es performeurs.euses viennent de la danse contemporaine, d'autres des beaux-arts, du théâtre, de la musique. Le DNSEP option art et les formations supérieures de danse contemporaine sont des chemins fréquents.",

    statut: "Selon le contexte, le ou la performeur.se peut relever du régime intermittent du spectacle ou du régime artiste-auteur.e (Maison des artistes / AGESSA). La frontière est souvent floue. Se rapprocher d'un syndicat ou d'une organisation professionnelle pour clarifier sa situation.",

    competences: [
      "Conscience corporelle et physicalité travaillée dans la durée.",
      "Capacité à construire et à porter un univers singulier.",
      "Résistance mentale et présence dans des situations non-scéniques.",
      "Sens des enjeux conceptuels et contextuels d'une oeuvre.",
      "Ouverture aux pratiques interdisciplinaires.",
    ],

    neConfondreAvec: [
      {
        titre: "Danseur.se",
        texte: "Le danseur ou la danseuse interprète en général une chorégraphie dans un cadre scénique défini, avec une partition donnée. La performance revendique davantage l'indéfinition du cadre comme outil artistique.",
        lien:  'danseur',
      },
    ],
  },

  {
    id:          'acrobate',
    nom:         'Acrobate',
    description: "Croise la technique circassienne et le langage chorégraphique. Acrobatie, portés, aérien.",
    univers:     'interpreter',

    definition: "L'acrobate qui travaille dans le champ de la danse se trouve à l'intersection de deux langages très distincts : la virtuosité circassienne (portés, aérien, équilibre) et la composition chorégraphique. Ce croisement, quand il est réussi, produit des oeuvres qui ne ressemblent à rien d'autre. Mais il demande une double exigence physique et artistique qui laisse peu de place à l'approximation.",

    missions: [
      "Maîtriser une ou plusieurs techniques de cirque (aérien, acrobatie au sol, portés, équilibre) en dialogue avec la danse.",
      "Travailler en duo ou en groupe sur des compositions à la fois chorégraphiques et circassiennes.",
      "Participer à des créations d'artistes de cirque contemporain ou de danse.",
      "Maintenir un entraînement physique rigoureux et gérer intelligemment l'usure du corps.",
    ],

    environnement: "Compagnies de cirque contemporain, chapiteau, théâtres, festivals spécialisés comme Circa ou le Carré Magique. Les Pôles nationaux des arts du cirque jouent un rôle structurant dans la diffusion de ces oeuvres.",

    formation: "Écoles nationales de cirque : le CNAC à Châlons-en-Champagne, l'ENACR à Rosny-sous-Bois. Des formations en danse contemporaine viennent souvent en complément. Certains artistes construisent un double parcours, d'autres arrivent par l'une ou l'autre porte.",

    statut: "Régime intermittent du spectacle pour la grande majorité. Le cirque est reconnu comme spectacle vivant, dans le même cadre réglementaire que la danse.",

    competences: [
      "Double technique : langage dansé + une ou plusieurs disciplines circassiennes.",
      "Conscience aiguë du risque et maîtrise des protocoles de sécurité.",
      "Force, souplesse, coordination et sens du rythme.",
      "Capacité à créer du sens dans le dialogue entre deux langages artistiques.",
      "Régularité dans l'entraînement sur le long terme.",
    ],

    neConfondreAvec: [
      {
        titre: "Danseur.se",
        texte: "L'acrobate intègre des techniques circassiennes (aérien, acrobatie, portés) qui sont absentes du travail du danseur ou de la danseuse classique ou contemporain.e.",
        lien:  'danseur',
      },
    ],
  },

  {
    id:          'figurant',
    nom:         'Figurant.e',
    description: "Présence au plateau dans les opéras, comédies musicales, films et grandes cérémonies. Capacité à s'adapter à des directions très diverses.",
    univers:     'interpreter',

    definition: "Le mot « figurant » peut donner l'impression d'un rôle secondaire. C'est plus compliqué que ça. Dans un opéra, une comédie musicale ou une grande cérémonie, la qualité du travail de figuration peut faire ou défaire l'atmosphère d'une scène entière. Il s'agit d'être vraiment présent.e sur scène, tout en servant une vision qui n'est pas la sienne. Un exercice qui demande autant de professionnalisme que n'importe quel autre rôle.",

    missions: [
      "Exécuter des mouvements chorégraphiés ou des présences définies dans des productions de grande échelle.",
      "S'adapter rapidement à des directions très diverses : chorégraphe, metteur.se en scène, réalisateur.rice.",
      "Maintenir une disponibilité et une réactivité face aux changements de distribution de dernière minute.",
      "S'effacer artistiquement tout en restant pleinement présent.e et professionnel.le.",
    ],

    environnement: "Opéras (l'Opéra de Paris et les opéras régionaux sont de gros employeurs), comédies musicales, émissions de variétés, films, clips, cérémonies officielles, parcs à thème. Les contrats sont souvent très courts, à la journée ou à la semaine.",

    formation: "Aucune formation spécifique n'est requise. Une solide pratique de la danse est attendue. La polyvalence (danse, chant, jeu) est un atout majeur, surtout pour les comédies musicales.",

    statut: "Régime intermittent du spectacle. Quand les contrats sont très courts et fragmentés sur l'année, les conditions d'éligibilité peuvent être difficiles à atteindre. Mieux vaut se renseigner auprès de Pôle Emploi Spectacles.",

    competences: [
      "Polyvalence artistique : danse, présence scénique, parfois chant ou jeu.",
      "Capacité d'adaptation rapide à des environnements très différents.",
      "Discipline et ponctualité dans des productions de grande échelle.",
      "Capacité à mettre son ego de côté au service du collectif.",
    ],
  },

  {
    id:          'swing',
    nom:         'Swing / Cover',
    description: "Remplaçant.e polyvalent.e capable de couvrir plusieurs rôles dans une production. Mémoire hors pair, disponibilité totale.",
    univers:     'interpreter',

    definition: "Le swing est une figure centrale des productions de grande envergure — comédies musicales, opéras, grandes tournées — mais souvent invisible pour le public. Sa mission : connaître tous les rôles qu'on lui demande de couvrir, sur le bout des doigts, et être prêt.e à monter en quelques heures si quelqu'un.e tombe. C'est un rôle exigeant une mémoire corporelle exceptionnelle et une sérénité à toute épreuve.",

    missions: [
      "Apprendre et maintenir en mémoire plusieurs rôles chorégraphiés dans une même production.",
      "Remplacer les artistes absent.es, parfois avec très peu de préavis.",
      "Participer aux répétitions de tous les rôles qu'on couvre, même sans entrer en scène.",
      "S'adapter immédiatement aux partenaires, aux formations et aux espaces scéniques.",
      "Rester disponible et concentré.e pendant toute la durée d'une production.",
    ],

    environnement: "Comédies musicales, opéras, grandes tournées, productions de spectacles vivants à fort effectif. Le swing fait partie de l'équipe artistique de la production sur toute sa durée.",

    formation: "Aucune formation spécifique. La polyvalence technique (danse, chant, jeu selon la production) et la mémoire corporelle sont décisives. La plupart des swings ont une longue expérience d'interprète avant d'occuper ce rôle.",

    statut: "Contrat de salarié.e du spectacle vivant (CDDU ou CDD) pour la durée de la production. Régime intermittent du spectacle.",

    competences: [
      "Mémoire corporelle exceptionnelle, capacité à mémoriser plusieurs partitions simultanément.",
      "Polyvalence technique : danse, parfois chant et jeu selon la production.",
      "Calme et fiabilité dans les situations de remplacement de dernière minute.",
      "Rigueur et présence soutenue même en dehors des représentations.",
      "Sens du collectif et discrétion dans une grande équipe.",
    ],

    neConfondreAvec: [
      {
        titre: "Doublure",
        texte: "La doublure couvre un rôle spécifique, généralement celui d'une vedette, et entre en scène en cas d'empêchement. Le swing couvre plusieurs rôles dans une production à grand effectif, souvent sans personnage vedette désigné.",
        lien:  'doublure-danse',
      },
    ],
  },

  {
    id:          'doublure-danse',
    nom:         'Doublure',
    description: "Couvre un rôle spécifique dans une production. Prête à entrer en scène à tout moment si le ou la titulaire est empêché.e.",
    univers:     'interpreter',

    definition: "La doublure apprend un rôle précis — souvent celui d'un.e interprète principal.e — et se tient prête à le remplacer si nécessaire. Contrairement au swing, qui couvre plusieurs rôles dans un ensemble, la doublure est dédiée à un seul rôle. Son travail exige la même préparation que le ou la titulaire, sans la visibilité.",

    missions: [
      "Apprendre et maintenir le rôle d'un.e interprète titulaire dans tous ses détails.",
      "Assister aux répétitions pour rester synchronisé.e avec les évolutions du spectacle.",
      "Entrer en scène en remplacement, parfois sans répétition préalable avec le reste de la distribution.",
      "Maintenir une préparation physique et mentale constante tout au long de la production.",
    ],

    environnement: "Productions de longue durée, tournées, ballets avec répertoire. Opéras, grandes compagnies chorégraphiques, comédies musicales à succès.",

    formation: "Expérience solide d'interprète. Certaines écoles supérieures préparent à ces configurations dans leurs cursus de formation professionnelle.",

    statut: "Salarié.e du spectacle vivant (CDDU) pour la durée de la production, souvent avec une clause de remplacement dans le contrat.",

    competences: [
      "Mémoire corporelle précise et capacité à intégrer une partition complexe.",
      "Disponibilité et fiabilité sur toute la durée d'une production.",
      "Capacité à s'adapter rapidement à une entrée en scène non anticipée.",
      "Discrétion et sens du collectif.",
    ],

    neConfondreAvec: [
      {
        titre: "Swing / Cover",
        texte: "Le swing couvre plusieurs rôles dans une production à grand effectif. La doublure est dédiée à un rôle unique, généralement celui d'un.e interprète principal.e.",
        lien:  'swing',
      },
    ],
  },

  {
    id:          'artiste-pluridisciplinaire',
    nom:         'Artiste pluridisciplinaire',
    description: "Combine danse, théâtre, chant ou musique dans une pratique artistique transversale. Profil recherché dans les productions hybrides et les projets contemporains.",
    univers:     'interpreter',

    definition: "L'artiste pluridisciplinaire ne se cantonne pas à une seule discipline. Il ou elle combine danse, jeu théâtral, chant, parfois musique ou performance, dans des productions qui cherchent précisément ce croisement. Ce profil est de plus en plus recherché dans les comédies musicales, le cirque contemporain, le théâtre physique et certaines créations contemporaines. Ce n'est pas une question de médiocrité dans chaque discipline : c'est une vraie compétence de synthèse.",

    missions: [
      "Interprèter des rôles ou des partitions qui mobilisent plusieurs disciplines simultanément.",
      "S'adapter à des directions artistiques venant d'univers différents : danse, théâtre, musique.",
      "Entretenir chaque discipline de façon régulière pour maintenir un niveau professionnel dans chacune.",
      "Collaborer avec des équipes pluridisciplinaires dans des projets hybrides.",
    ],

    environnement: "Comédies musicales, cirque contemporain, théâtre musical, créations chorégraphiques contemporaines, productions audiovisuelles. Le profil pluridisciplinaire s'adapte à des contextes très variés.",

    formation: "Cursus multiples ou formation dans une école préparant à plusieurs disciplines (ESMD, certaines écoles supérieures privées). Certains artistes construisent leur pluridisciplinarité par accumulation de formations et d'expériences professionnelles.",

    statut: "Régime intermittent du spectacle. La multiplicité des disciplines peut ouvrir un plus large spectre d'employeurs, à condition de maintenir chaque pratique à un niveau professionnel.",

    competences: [
      "Niveau professionnel dans au moins deux disciplines artistiques.",
      "Capacité d'intégration rapide dans des équipes aux esthétiques variées.",
      "Sens de la cohérence artistique dans le croisement des disciplines.",
      "Endurance physique et mentale dans des productions exigeantes sur plusieurs fronts.",
    ],
  },

  // ── 02 · Créer ───────────────────────────────────────────────────────────

  {
    id:          'choregraphe',
    nom:         'Chorégraphe',
    description: "Signe les oeuvres, compose les mouvements, dirige les corps dans l'espace. Artiste auteur au sens plein du terme.",
    univers:     'creer',
    featured:    true,

    definition: "Signer une oeuvre chorégraphique, c'est à la fois composer le mouvement, diriger des corps, définir un espace, choisir une durée, une lumière, une adresse au public. Le ou la chorégraphe est l'auteur.e de tout ça, même quand le travail est profondément collaboratif. C'est souvent aussi la personne qui porte la compagnie, cherche les financements, défend les projets auprès des institutions. En France, la plupart des chorégraphes sont à la fois artistes et directeurs.rices de structure. C'est beaucoup.",

    missions: [
      "Concevoir et écrire les oeuvres chorégraphiques, de l'intention initiale à la pièce finie.",
      "Diriger les répétitions avec les interprètes : transmettre une vision, accompagner des présences.",
      "Définir les intentions artistiques en dialogue avec les collaborateurs.rices : espace, musique, lumière, costume.",
      "Développer un univers cohérent sur la durée, une signature reconnaissable.",
      "Porter les projets sur le plan artistique lors des négociations de diffusion et des résidences.",
    ],

    environnement: "Studio de création, plateaux de répétition, théâtres, festivals, résidences artistiques. La compagnie indépendante est le cadre de travail le plus fréquent. Certains chorégraphes sont affilié.es à des institutions (CCN, Ballet national d'opéra), mais c'est minoritaire.",

    formation: "Aucun diplôme n'est légalement requis pour signer des oeuvres. Beaucoup de chorégraphes ont d'abord été interprètes. Des formations spécialisées existent : EX.E.R.CE à Montpellier, master chorégraphie à Paris VIII. Le Diplôme d'État de chorégraphie (DEC) est reconnu mais non obligatoire.",

    statut: "La plupart relèvent du régime artiste-auteur.e (Maison des artistes ou AGESSA) pour les droits sur leurs oeuvres. Lorsqu'ils ou elles sont aussi salarié.es de la compagnie qu'ils ou elles ont fondée, la situation se complique. Se rapprocher de la CIPAC ou d'un.e conseiller.e juridique spécialisé.e.",

    competences: [
      "Maîtrise d'un ou plusieurs vocabulaires chorégraphiques.",
      "Vision spatiale et dramaturgique de l'oeuvre.",
      "Direction d'artistes et leadership artistique.",
      "Capacité à formaliser un propos et à le transmettre.",
      "Sens du projet : financement, partenariats, tournée.",
    ],

    neConfondreAvec: [
      {
        titre: "Metteur.se en scène",
        texte: "Le metteur ou la metteuse en scène organise l'espace théâtral, la narration et la direction des comédiens.nes. Même si les frontières sont de plus en plus poreuses, le chorégraphe compose spécifiquement le mouvement comme matière première.",
        lien:  'metteur-en-scene',
      },
    ],
  },

  {
    id:          'metteur-en-scene',
    nom:         'Metteur.se en scène',
    description: "Orchestre l'espace, le temps, la dramaturgie. Travaille souvent en dialogue avec un chorégraphe ou endosse les deux rôles.",
    univers:     'creer',

    definition: "Dans le secteur de la danse, le titre de « metteur.se en scène » désigne souvent des artistes qui travaillent à la frontière du théâtre et du mouvement. Parfois c'est un.e chorégraphe qui endosse les deux rôles. Parfois c'est un.e metteur.se en scène issu.e du théâtre qui intègre la danse dans son langage. Dans tous les cas, son travail consiste à orchestrer l'espace dramaturgique global d'un spectacle : les corps, les voix, la lumière, le texte, le temps.",

    missions: [
      "Conduire artistiquement la création d'un spectacle de sa conception aux représentations.",
      "Définir les axes dramaturgiques et visuels en lien avec les collaborateurs.rices.",
      "Diriger les artistes sur le plateau : interprètes, danseurs.euses, comédiens.nes.",
      "Coordonner les équipes artistiques et techniques à chaque étape de la création.",
      "Assurer la cohérence artistique du spectacle lors des tournées.",
    ],

    environnement: "Théâtres, compagnies mixtes danse/théâtre, opéras, festivals pluridisciplinaires. Les mises en scène d'opéra ou de spectacles musicaux font régulièrement appel à des chorégraphes ou des metteurs.ses en scène venu.es de la danse.",

    formation: "Pas de diplôme obligatoire. Formation théâtrale (ENSATT, CNSAD, Conservatoires nationaux), masters en arts de la scène, ou apprentissage par compagnonnage au sein d'équipes artistiques.",

    statut: "Artiste-auteur.e (Maison des artistes / AGESSA) pour les droits sur la mise en scène, parfois salarié.e en CDDU lors des périodes de répétition.",

    competences: [
      "Vision globale de l'espace scénique et du temps dramaturgique.",
      "Sens de la narration et de l'adresse au public.",
      "Leadership artistique dans des contextes pluridisciplinaires.",
      "Capacité à travailler en collaboration avec de nombreux interlocuteurs.",
      "Culture chorégraphique et théâtrale large.",
    ],

    neConfondreAvec: [
      {
        titre: "Chorégraphe",
        texte: "Le chorégraphe ou la chorégraphe compose spécifiquement le mouvement comme matière première artistique. Le metteur ou la metteuse en scène pilote l'ensemble du dispositif scénique, sans que le mouvement soit nécessairement au centre.",
        lien:  'choregraphe',
      },
    ],
  },

  {
    id:          'scenographe',
    nom:         'Scénographe',
    description: "Conçoit l'espace dans lequel la danse advient. Architecture du plateau, rapport à la salle, circulation des corps.",
    univers:     'creer',

    definition: "Ce n'est pas « le décorateur » ou « la décoratrice ». La scénographie, c'est l'espace dans sa totalité : comment la scène se rapporte à la salle, comment les corps s'y déplacent, ce que les matières et les volumes disent de l'oeuvre. Un bon travail scénographique ne se voit pas forcément, mais on le ressent immédiatement. En danse, où l'espace est rarement neutre, c'est un partenaire de création à part entière.",

    missions: [
      "Concevoir l'espace scénique en dialogue avec le ou la chorégraphe ou metteur.se en scène.",
      "Réaliser maquettes, plans techniques et notes d'intention.",
      "Coordonner la construction des éléments scénographiques avec les ateliers.",
      "Assurer le suivi sur le plateau lors des installations et des montages.",
      "Penser la tournabilité et la durabilité de la scénographie, une contrainte réelle pour les petites compagnies.",
    ],

    environnement: "Ateliers de construction, studios de répétition, théâtres. Le ou la scénographe travaille souvent sur plusieurs projets en parallèle, pour des compagnies de danse, des théâtres ou des maisons d'opéra.",

    formation: "École nationale supérieure des arts décoratifs (ENSAD), École Boulle, HEAR, HEAD, ou formations spécifiques en scénographie à l'ENSATT. Certains scénographes viennent de l'architecture ou des beaux-arts.",

    statut: "Artiste-auteur.e ou salarié.e selon les configurations. Les droits sur une scénographie font l'objet d'un contrat spécifique. Se rapprocher du SYNDEAC ou d'un.e conseiller.e juridique spécialisé.e.",

    competences: [
      "Maîtrise des outils de dessin technique et de modélisation 3D.",
      "Connaissance approfondie des contraintes scéniques et techniques.",
      "Sens du volume, de la matière et de l'espace en mouvement.",
      "Capacité à dialoguer avec un.e artiste dans le processus de création.",
      "Gestion de budget et coordination de production scénographique.",
    ],
  },

  {
    id:          'compositeur',
    nom:         'Compositeur.rice / Créateur.rice son',
    description: "Crée la musique ou le paysage sonore qui accompagne et structure l'oeuvre chorégraphique.",
    univers:     'creer',

    definition: "La musique et le son ne sont pas que l'habillage d'une pièce chorégraphique : ils en structurent le temps. Un paysage sonore peut rendre un geste inquiétant, léger, urgent ou suspendu. Le ou la compositeur.rice travaille au plus près du mouvement, souvent dès les premières répétitions, pour que les deux langages se construisent ensemble plutôt que l'un sur l'autre.",

    missions: [
      "Composer ou assembler la bande sonore d'un spectacle en accord avec le projet artistique.",
      "Travailler en étroite relation avec le ou la chorégraphe pour aligner son et mouvement.",
      "Être présent.e en répétition pour ajuster et faire évoluer la composition.",
      "Jouer parfois en live lors des représentations.",
      "Assurer la régie son ou en déléguer la gestion à un.e régisseur.se.",
    ],

    environnement: "Studio d'enregistrement, plateau de répétition. Souvent en contrat de cession de droits ou de commande. Les compositeurs.rices travaillent pour des compagnies indépendantes, des maisons d'opéra, des festivals.",

    formation: "Conservatoires nationaux (CNSMD de Paris ou Lyon), masters en composition musicale ou électroacoustique, formation à l'IRCAM ou à l'INA-GRM. Certains artistes sont autodidactes, en particulier dans la musique électronique.",

    statut: "Artiste-auteur.e inscrit.e à la SACEM pour les droits d'auteur. Parfois salarié.e en CDDU lors des périodes de répétition si présence plateau requise.",

    competences: [
      "Composition musicale ou sound design.",
      "Maîtrise d'un logiciel de création audio (Logic, Ableton, Max/MSP, etc.).",
      "Sens du temps dramaturgique et de l'espace sonore.",
      "Capacité à collaborer dans une équipe de création pluridisciplinaire.",
      "Notions de régie son et de formats de diffusion scénique.",
    ],
  },

  {
    id:          'dramaturge',
    nom:         'Dramaturge',
    description: "Partenaire de la création : aide à construire le sens, la structure dramaturgique, le rapport au texte et à l'histoire.",
    univers:     'creer',

    definition: "Le ou la dramaturge est une présence rare et précieuse dans les équipes de création chorégraphique. Son rôle : être un regard extérieur de confiance, quelqu'un qui lit l'oeuvre en train de se faire et aide à construire le sens, la structure, l'adresse au public. Ce n'est pas un.e assistant.e, pas un.e critique, pas un.e directeur.rice artistique. C'est un partenaire de pensée, et ça demande autant de discrétion que d'engagement.",

    missions: [
      "Accompagner le processus de création comme regard extérieur et ressource intellectuelle.",
      "Mener des recherches (textes, archives, références historiques ou théoriques) pour nourrir le projet.",
      "Contribuer à la construction dramaturgique : structure, durée, adresse au public.",
      "Rédiger notes d'intention, dossiers artistiques, textes de salle.",
      "Participer aux répétitions et aux temps de discussion avec l'équipe.",
    ],

    environnement: "Studio, plateau. Souvent dans une relation de confiance durable avec un.e chorégraphe ou une compagnie, sur plusieurs projets. Certains dramaturges travaillent en freelance pour différentes équipes artistiques.",

    formation: "Formation théâtrale ou universitaire : lettres, philosophie, arts du spectacle. Pas de diplôme spécifique : le métier s'apprend souvent par compagnonnage ou dans des masters en dramaturgie au sein d'écoles supérieures d'art.",

    statut: "Artiste-auteur.e ou salarié.e selon les configurations. Le statut du dramaturge dans la création chorégraphique est peu codifié en France, souvent en contrat de service ou en CDDU selon les projets.",

    competences: [
      "Culture chorégraphique et théâtrale étendue.",
      "Capacité analytique et réflexive appliquée à une oeuvre en cours.",
      "Maîtrise de l'écrit : notes, dossiers, textes de salle.",
      "Sens de l'écoute, du dialogue artistique et de la juste distance.",
      "Discrétion et disponibilité à l'égard du processus créatif.",
    ],
  },

  {
    id:          'assistant-choregraphe',
    nom:         'Assistant.e chorégraphe',
    description: "Bras droit du ou de la chorégraphe en répétition. Transmet les matériaux de mouvement, structure les sessions, assure la continuité créative.",
    univers:     'creer',

    definition: "L'assistant.e chorégraphe est la personne qui permet à un projet de création de tenir dans la durée. Pendant que le ou la chorégraphe prend du recul, regarde, réfléchit, l'assistant.e est sur le plateau : il ou elle transmet les matériaux de mouvement aux interprètes, structure les sessions, maintient la cohérence de ce qui a été travaillé. C'est un rôle qui exige une compréhension intime de la vision artistique du ou de la chorégraphe, et la capacité de la relayer sans la dénaturer.",

    missions: [
      "Apprendre et transmettre les matériaux chorégraphiques aux interprètes.",
      "Organiser et animer les sessions de répétition en l'absence ou en complément du ou de la chorégraphe.",
      "Prendre des notes et documenter le travail en cours pour en assurer la continuité.",
      "Proposer des retours et des observations au ou à la chorégraphe sur l'état du travail.",
      "Assurer le lien entre le ou la chorégraphe et le reste de l'équipe de création.",
    ],

    environnement: "Studio de répétition, plateau. Souvent dans le cadre d'une relation de confiance avec un.e chorégraphe sur la durée d'un projet ou de plusieurs projets.",

    formation: "Expérience d'interprète dans le répertoire concerné. Certaines formations supérieures en danse intègrent des modules de pédagogie et de direction d'acteurs qui préparent à ce rôle.",

    statut: "Salarié.e en CDDU pour la durée du projet, parfois en CDI dans les grandes compagnies. Régime intermittent du spectacle.",

    competences: [
      "Connaissance approfondie du vocabulaire et de l'esthétique du ou de la chorégraphe.",
      "Capacité à transmettre et à enseigner un mouvement avec précision.",
      "Organisation et rigueur dans la gestion des répétitions.",
      "Sens de la communication et de la diplomatie au sein de l'équipe.",
      "Discrétion et loyauté dans une relation de confiance artistique.",
    ],

    neConfondreAvec: [
      {
        titre: "Répétiteur.rice",
        texte: "Le répétiteur ou la répétitrice transmet et maintient un répertoire existant, souvent d'un.e chorégraphe disparu.e ou absent.e. L'assistant.e chorégraphe travaille au présent de la création, aux côtés du ou de la chorégraphe.",
        lien:  'repetiteur',
      },
    ],
  },

  {
    id:          'notateur-mouvement',
    nom:         'Notateur.rice de mouvement',
    description: "Transcrit les oeuvres chorégraphiques en partition écrite. Conserve et transmet le répertoire grâce à des systèmes de notation comme le Laban ou le Benesh.",
    univers:     'creer',

    definition: "La notation du mouvement, c'est l'idée qu'on peut écrire la danse comme on écrit la musique. Deux systèmes principaux existent : la notation Laban (Labanotation) et la notation Benesh. Un.e notateur.rice de mouvement maîtrise l'un ou l'autre, et parfois les deux, pour transcrire des oeuvres chorégraphiques sous forme de partition. Ces partitions permettent de reconstruire une oeuvre des années plus tard, sans avoir besoin d'une captation vidéo ou d'un.e répétiteur.rice.",

    missions: [
      "Observer et transcrire des oeuvres chorégraphiques en notation Laban ou Benesh.",
      "Collaborer avec les chorégraphes pour garantir la fidélité de la transcription.",
      "Utiliser les partitions pour aider à reconstruire le répertoire avec de nouveaux interprètes.",
      "Conserver et archiver les partitions dans des fonds spécialisés.",
      "Former d'autres praticien.nes à la lecture et à l'écriture du mouvement.",
    ],

    environnement: "Compagnies, institutions culturelles, médiathèques spécialisées comme la médiathèque du Centre National de la Danse (CN D). Les missions de notation sont souvent ponctuelles, liées à des projets de conservation de répertoire.",

    formation: "Formations spécifiques à la notation Laban (Institut Laban de Paris) ou Benesh (Royal Academy of Dance pour le Benesh). Peu de centres de formation en France, la plupart des notateurs.rices se forment à l'étranger.",

    statut: "Freelance dans la majorité des cas, en contrat de service ou de mission. La profession est très peu nombreuse en France.",

    competences: [
      "Maîtrise d'un système de notation chorégraphique (Laban ou Benesh).",
      "Connaissance approfondie de l'anatomie et du mouvement humain.",
      "Capacité d'observation fine et de transcription précise.",
      "Patience et attention au détail dans un travail de longue haleine.",
      "Culture chorégraphique et connaissance du répertoire.",
    ],
  },

  {
    id:          'dance-captain',
    nom:         'Dance captain',
    description: "Maintient la qualité chorégraphique d'une production dans la durée. Supervise l'intégration des swings, veille à la cohérence de chaque représentation.",
    univers:     'creer',

    definition: "Le dance captain est une figure centrale dans les grandes productions de comédie musicale ou de spectacle à fort contenu chorégraphique. Son rôle : maintenir la qualité et la cohérence de la chorégraphie sur toute la durée d'exploitation du spectacle. Il ou elle n'est pas le ou la chorégraphe, mais c'est la personne qui veille à ce que la chorégraphie reste fidèle à l'intention originale, soir après soir, et parfois sur plusieurs années.",

    missions: [
      "Surveiller la qualité chorégraphique à chaque représentation et signaler les écarts.",
      "Intégrer les nouveaux.elles artistes et les swings dans la production.",
      "Organiser les répétitions de maintien pour corriger les dérives au fil des semaines.",
      "Être le lien entre le ou la chorégraphe original.e et la production en cours d'exploitation.",
      "Prendre des décisions artistiques mineures en l'absence du ou de la chorégraphe.",
    ],

    environnement: "Productions de comédie musicale longue durée, grandes tournées, productions internationales. Le dance captain est souvent aussi interprète dans le spectacle.",

    formation: "Expérience de longue durée comme interprète dans des productions de grande envergure, et une connaissance intime de la production concernée. Pas de formation spécifique.",

    statut: "Salarié.e du spectacle vivant, souvent avec une responsabilité artistique supplémentaire intégrée dans le contrat d'interprète.",

    competences: [
      "Connaissance complète et mémorisée de toute la chorégraphie de la production.",
      "Autorité artistique naturelle et capacité à diriger des pairs.",
      "Sens de l'observation et du détail dans l'évaluation de la qualité.",
      "Communication claire avec le ou la chorégraphe et la direction de production.",
      "Gestion de groupe et leadership dans un collectif d'artistes.",
    ],

    neConfondreAvec: [
      {
        titre: "Assistant.e chorégraphe",
        texte: "L'assistant.e chorégraphe travaille pendant la phase de création, aux côtés du ou de la chorégraphe. Le dance captain prend le relais lors de l'exploitation pour maintenir la qualité dans la durée.",
        lien:  'assistant-choregraphe',
      },
    ],
  },

  // ── 03 · Transmettre ─────────────────────────────────────────────────────

  {
    id:          'professeur',
    nom:         'Professeur.e de danse',
    description: "Enseigne la technique, transmet les codes, accompagne la progression. Diplôme d'État ou CQP selon le contexte d'exercice.",
    univers:     'transmettre',
    featured:    true,

    definition: "C'est souvent le premier métier auquel on pense quand on envisage de travailler dans la danse sans monter sur scène. Et c'est un métier à part entière, pas une reconversion par défaut. Enseigner la danse, c'est transmettre une technique, une culture, un rapport au corps. C'est aussi accompagner des parcours très différents : les enfants qui débutent, les adolescent.es qui progressent, les adultes qui pratiquent par plaisir, et parfois les futur.es professionnel.les.",

    missions: [
      "Préparer et dispenser des cours adaptés au niveau et à l'âge des élèves.",
      "Évaluer la progression des élèves et adapter l'enseignement en conséquence.",
      "Participer à la vie pédagogique de la structure : projets, spectacles, examens.",
      "Garantir la sécurité physique des pratiquant.es et prévenir les blessures.",
      "Se former en continu pour maintenir une pratique artistique vivante.",
    ],

    environnement: "Écoles de danse municipales ou privées, conservatoires (CRC, CRD, CRR), studios indépendants, associations culturelles. Certains professeurs exercent à leur compte ou en portage salarial.",

    formation: "Le Diplôme d'État (DE) de professeur de danse est obligatoire pour enseigner contre rémunération dans les disciplines classiques, contemporaines et jazz. Il est délivré par les CEFEDEM régionaux ou l'ESMD. Le Certificat d'Aptitude (CA) est requis dans les CRR. Pour d'autres disciplines (hip-hop, danses de rue, etc.), le CQP Danseur.se Animateur.rice peut être suffisant selon les contextes. Mieux vaut vérifier auprès du Ministère de la Culture selon la discipline.",

    statut: "Salarié.e dans la majorité des cas : école, conservatoire, association. Certains exercent en auto-entrepreneur ou en CDDU. L'enseignement sans DE peut être sanctionnable selon la discipline et le contexte. Se renseigner auprès du Ministère de la Culture.",

    competences: [
      "Maîtrise technique dans la discipline enseignée.",
      "Pédagogie et capacité d'adaptation aux différents publics.",
      "Notions d'anatomie et de kinésiologie appliquées à la danse.",
      "Créativité dans la construction de cours et de progressions pédagogiques.",
      "Sens de l'écoute et du collectif dans la salle de danse.",
    ],

    neConfondreAvec: [
      {
        titre: "Formateur.rice professionnel.le",
        texte: "Le formateur ou la formatrice professionnel.le forme des adultes en situation de formation initiale ou continue dans des établissements supérieurs ou des centres agréés. Le professeur.e de danse peut enseigner à tous les niveaux, mais pas nécessairement dans un cadre de formation professionnelle.",
        lien:  'formateur',
      },
    ],
  },

  {
    id:          'repetiteur',
    nom:         'Répétiteur.rice',
    description: "Garant.e de l'oeuvre. Transmet et maintient le répertoire d'un chorégraphe auprès des interprètes, souvent au sein d'une compagnie.",
    univers:     'transmettre',

    definition: "Le ou la répétiteur.rice est la mémoire vivante d'une oeuvre. C'est la personne qui sait, dans les moindres détails, comment cette pièce est censée fonctionner, et qui fait en sorte que cette intention reste intacte au fil des reprises, des nouvelles distributions, des tournées à l'autre bout du monde. Un travail qui exige une connaissance intime du répertoire et une vraie autorité artistique.",

    missions: [
      "Apprendre et mémoriser un répertoire chorégraphique dans ses moindres détails : gestes, intentions, dynamiques.",
      "Travailler avec les interprètes pour transmettre fidèlement l'oeuvre.",
      "Assurer le suivi artistique des reprises et des nouvelles distributions.",
      "Communiquer avec le ou la chorégraphe pour toute question d'interprétation.",
      "Réaliser parfois des captations vidéo de référence pour archive.",
    ],

    environnement: "Studio de répétition, plateau, en tournée. Souvent au sein d'une compagnie en résidence ou itinérante. Certains répétiteurs.rices travaillent pour plusieurs compagnies, ou sont chargé.es du répertoire d'un.e chorégraphe disparu.e.",

    formation: "Il n'existe pas de formation spécifique au métier. La voie d'accès classique est une longue carrière d'interprète dans le répertoire concerné, associée à une confiance accordée par le ou la chorégraphe.",

    statut: "Salarié.e en CDDU ou CDI selon la structure, parfois prestataire indépendant.e. Le régime intermittent est courant.",

    competences: [
      "Mémoire corporelle et visuelle exceptionnelle.",
      "Autorité naturelle et sens pédagogique dans la direction des interprètes.",
      "Connaissance approfondie de l'oeuvre et de l'esthétique du chorégraphe.",
      "Diplomatie dans la relation aux artistes sur le plateau.",
      "Capacité à maintenir la vision artistique sur le long terme.",
    ],

    neConfondreAvec: [
      {
        titre: "Professeur.e de danse",
        texte: "Le professeur ou la professeure enseigne une technique ou une discipline à des élèves en progression. Le répétiteur ou la répétitrice travaille spécifiquement sur la transmission d'un répertoire préexistant auprès d'interprètes professionnel.les.",
        lien:  'professeur',
      },
    ],
  },

  {
    id:          'pedagogue-scolaire',
    nom:         'Artiste intervenant.e',
    description: "Intervient en milieu scolaire, en milieu social ou hospitalier. À la croisée de la transmission artistique et de l'éducation.",
    univers:     'transmettre',

    definition: "L'artiste intervenant.e amène la danse là où elle n'est pas attendue : dans une classe de primaire, un hôpital, une maison de retraite, un centre social. L'objectif n'est pas de former des danseurs.euses. C'est de créer une expérience artistique partagée, accessible à tous.tes, qui change quelque chose dans la façon de se percevoir et de percevoir les autres. C'est exigeant d'une manière très différente de l'enseignement technique.",

    missions: [
      "Concevoir et animer des ateliers de pratique artistique en milieu scolaire ou social.",
      "Travailler en co-intervention avec des enseignant.es ou des équipes éducatives.",
      "Construire des projets sur la durée : résidences, créations partagées, restitutions.",
      "S'adapter à des publics très différents : enfants, personnes âgées, publics en situation de handicap.",
      "Documenter et valoriser les projets : restitutions, publications, présentations.",
    ],

    environnement: "Écoles, collèges, lycées dans le cadre des dispositifs EAC (Éducation Artistique et Culturelle), hôpitaux, EHPAD, structures sociales, milieu carcéral. Les missions sont souvent financées par les DRAC, les Conseils Régionaux et les Villes.",

    formation: "Les formations de professeur.e de danse (DE) et d'artiste intervenant.e (CLEA, DU spécialisés, formations associatives) ouvrent des portes. Certains artistes exercent sans diplôme spécifique dans le cadre de projets ponctuels. Les conditions varient selon la structure partenaire.",

    statut: "CDDU intermittent pour la plupart. Certains projets sont rémunérés en droits d'auteur si la création est au coeur de la mission.",

    competences: [
      "Capacité à créer un espace de pratique sécurisant et inclusif.",
      "Pédagogie adaptée à des publics non-danseurs.euses.",
      "Patience, créativité et sens du collectif.",
      "Connaissance des partenaires institutionnels : DRAC, structures éducatives.",
      "Capacité à documenter et valoriser le travail réalisé.",
    ],

    neConfondreAvec: [
      {
        titre: "Professeur.e de danse",
        texte: "Le professeur ou la professeure de danse enseigne dans un cadre technique spécialisé visant la progression dans une discipline. L'artiste intervenant.e travaille dans des contextes non spécialisés, avec des publics qui ne se destinent pas à la pratique professionnelle.",
        lien:  'professeur',
      },
    ],
  },

  {
    id:          'formateur',
    nom:         'Formateur.rice professionnel.le',
    description: "Forme les futurs interprètes et enseignants dans les écoles supérieures, CRR et centres de formation professionnelle.",
    univers:     'transmettre',

    definition: "Former des professionnel.les de la danse, c'est une responsabilité particulière. Il s'agit d'accompagner des artistes dans leur dernière ligne droite avant le secteur, dans des structures qui s'y consacrent : écoles supérieures, conservatoires à rayonnement régional, centres de formation spécialisés. Le ou la formateur.rice doit être crédible artistiquement, rigoureux.se pédagogiquement, et connaître le secteur de l'intérieur.",

    missions: [
      "Concevoir des cursus et des modules de formation professionnelle adaptés aux objectifs des étudiant.es.",
      "Dispenser des enseignements techniques, artistiques ou théoriques.",
      "Évaluer les étudiant.es et accompagner leur parcours d'insertion professionnelle.",
      "Participer à la vie institutionnelle de l'établissement.",
      "Se maintenir au niveau artistique pour rester crédible et inspirant pédagogiquement.",
    ],

    environnement: "Écoles supérieures (CNSMD, ESMD, CNDC), CRR (Conservatoires à Rayonnement Régional), centres de formation (CFPTS, CFMI), universités avec département arts. Souvent un poste en CDI, parfois en vacation.",

    formation: "Diplôme d'État ou Certificat d'Aptitude (CA) en danse. Expérience professionnelle significative comme artiste ou pédagogue. Certains postes requièrent un master ou une expérience de recherche.",

    statut: "Salarié.e CDI dans les structures publiques, CDDU ou vacation pour les interventions ponctuelles. Le CA de professeur de danse est souvent requis dans les établissements d'enseignement spécialisé.",

    competences: [
      "Expertise artistique et technique dans la discipline enseignée.",
      "Ingénierie pédagogique et conception de cursus.",
      "Maîtrise des outils d'évaluation en formation professionnelle.",
      "Connaissance du secteur et de ses débouchés.",
      "Capacité à accompagner des profils d'étudiant.es très divers.",
    ],

    neConfondreAvec: [
      {
        titre: "Professeur.e de danse",
        texte: "Le professeur ou la professeure de danse enseigne dans des contextes allant des loisirs au pré-professionnel. Le formateur ou la formatrice professionnel.le s'adresse à des adultes en formation initiale ou continue vers des métiers de la danse, dans des structures habilitées.",
        lien:  'professeur',
      },
    ],
  },

  {
    id:          'maitre-ballet',
    nom:         'Maître.sse de ballet',
    description: "Dirige les classes quotidiennes, encadre les répétitions et supervise le niveau technique des danseurs.euses dans une compagnie.",
    univers:     'transmettre',

    definition: "Le maître ou la maîtresse de ballet est une figure historique de la grande compagnie de danse. Contrairement au répétiteur.rice qui transmet une oeuvre précise, le maître ou la maîtresse de ballet a une autorité technique et pédagogique plus large : il ou elle dirige les classes quotidiennes, maintient le niveau technique des danseurs.euses, supervise les répétitions et veille à la cohésion artistique de la troupe. C'est un rôle central dans les ballets et les grandes compagnies contemporaines.",

    missions: [
      "Diriger et animer les classes techniques quotidiennes (barre, travail au centre).",
      "Superviser les répétitions des oeuvres du répertoire et des créations.",
      "Évaluer le niveau et la progression des interprètes de la compagnie.",
      "Maintenir et transmettre les standards techniques et stylistiques de la compagnie.",
      "Collaborer avec le ou la directeur.rice artistique sur la distribution des rôles.",
    ],

    environnement: "Grandes compagnies chorégraphiques, ballets nationaux ou régionaux, opéras avec troupe de danse. C'est un poste de confiance, souvent en CDI.",

    formation: "Longue carrière d'interprète, généralement au sein de compagnies classiques ou néoclassiques. Le Certificat d'Aptitude (CA) de professeur de danse est fréquemment requis.",

    statut: "Salarié.e en CDI dans la majorité des grandes structures. Parfois en CDDU pour des missions ponctuelles dans des compagnies de taille plus modeste.",

    competences: [
      "Expertise technique approfondie dans la discipline enseignée.",
      "Autorité pédagogique et leadership dans un collectif d'artistes professionnel.les.",
      "Connaissance du répertoire et des esthétiques chorégraphiques.",
      "Sens de l'observation et du détail technique.",
      "Capacité à maintenir une exigence artistique sur le long terme.",
    ],

    neConfondreAvec: [
      {
        titre: "Répétiteur.rice",
        texte: "Le répétiteur ou la répétitrice est spécialisé.e dans la transmission d'une oeuvre précise. Le maître ou la maîtresse de ballet exerce une autorité pédagogique plus large sur le développement technique et artistique de la troupe.",
        lien:  'repetiteur',
      },
    ],
  },

  {
    id:          'coach-choregraphique',
    nom:         'Coach chorégraphique',
    description: "Accompagne les interprètes dans la qualité d'interprétation d'une oeuvre spécifique. Travail sur le détail, la présence, le sens.",
    univers:     'transmettre',

    definition: "Le coach chorégraphique intervient en amont des représentations pour affiner l'interprétation : pas pour enseigner la technique, mais pour travailler sur ce que la partition dit en profondeur. Il ou elle aide les interprètes à habiter l'oeuvre, à en comprendre l'intention, à trouver la présence juste. C'est un rôle de facilitateur.rice artistique, différent du répétiteur.rice qui se concentre sur la fidélité à la forme.",

    missions: [
      "Travailler avec les interprètes sur la qualité d'interprétation d'une oeuvre donnée.",
      "Identifier les zones de mécanisation ou de manque d'investissement dans la partition.",
      "Proposer des outils pour approfondir la présence scénique et l'engagement artistique.",
      "Collaborer avec le ou la chorégraphe pour rester aligné.e sur les intentions originales.",
      "Intervenir lors des reprises, des nouvelles distributions ou des tournées longues.",
    ],

    environnement: "Studio, plateau. Missions ponctuelles ou sur la durée d'une production. Le coaching chorégraphique est plus répandu dans le monde des grandes compagnies et des productions internationales.",

    formation: "Expérience significative comme interprète de haut niveau, parfois comme chorégraphe. Certains coachs viennent de la direction artistique ou de la pédagogie de haut niveau.",

    statut: "Freelance ou contrat de mission selon les projets. Régime intermittent ou prestation de service.",

    competences: [
      "Connaissance fine des esthétiques chorégraphiques contemporaines et classiques.",
      "Capacité à lire une interprétation et à identifier ce qui lui manque.",
      "Sens de la communication et de l'écoute artistique.",
      "Tact et diplomatie dans la relation aux artistes professionnel.les.",
      "Discrétion et alignement avec la vision du ou de la chorégraphe.",
    ],
  },

  {
    id:          'mediateur-culturel',
    nom:         'Médiateur.rice culturel.le',
    description: "Construit les liens entre une oeuvre, un artiste ou une structure culturelle et ses publics. Actions pédagogiques, ateliers, rencontres.",
    univers:     'transmettre',

    definition: "La médiation culturelle, c'est le travail de rendre la danse accessible, désirable et compréhensible à des publics qui ne la fréquentent pas forcément. Un.e médiateur.rice culturel.le conçoit et anime des actions qui créent des ponts entre une oeuvre et les gens : avant, pendant, après une saison. C'est un travail de traduction autant que de transmission, qui exige une vraie connaissance artistique et une sensibilité aux publics.",

    missions: [
      "Concevoir et animer des actions de médiation autour des spectacles et des artistes.",
      "Organiser des rencontres entre artistes et publics : scolaires, associations, groupes.",
      "Coordonner les parcours d'éducation artistique et culturelle (EAC) avec les établissements.",
      "Produire des outils pédagogiques : dossiers, vidéos, ressources en ligne.",
      "Évaluer l'impact des actions et en rendre compte aux partenaires institutionnels.",
    ],

    environnement: "Théâtres, scènes nationales, festivals, CCN, musées, centres culturels. En lien régulier avec les DRAC, les collectivités et les structures éducatives.",

    formation: "Master en médiation culturelle, en administration culturelle, ou en arts avec spécialisation pédagogique. Certaines formations de professeur.e de danse ou d'artiste intervenant.e préparent aussi à ces fonctions.",

    statut: "Salarié.e CDI ou CDD dans une structure culturelle. Parfois en mission pour plusieurs structures. Le poste peut être combiné avec d'autres missions administratives ou artistiques.",

    competences: [
      "Connaissance artistique solide en danse et dans le secteur du spectacle vivant.",
      "Pédagogie et sens de l'adaptation à des publics très divers.",
      "Capacité à concevoir et à animer des ateliers participatifs.",
      "Qualités rédactionnelles et de communication.",
      "Connaissance des dispositifs institutionnels : EAC, DRAC, collectivités.",
    ],

    neConfondreAvec: [
      {
        titre: "Artiste intervenant.e",
        texte: "L'artiste intervenant.e mène des projets de pratique artistique sur le terrain, souvent en milieu scolaire ou social. Le médiateur ou la médiatrice culturel.le travaille à l'échelle d'une programmation ou d'une institution pour créer des liens entre les oeuvres et les publics.",
        lien:  'pedagogue-scolaire',
      },
    ],
  },

  // ── 04 · Produire & diffuser ─────────────────────────────────────────────

  {
    id:          'directeur-compagnie-ecole',
    nom:         'Directeur.rice de compagnie / école',
    description: "Pilote artistique, pédagogique et administratif. Porte la vision, gère les ressources et incarne la compagnie ou l'école auprès de ses partenaires et de ses publics.",
    univers:     'produire',
    featured:    true,

    definition: "Diriger une compagnie ou une école de danse, c'est cumuler des responsabilités qui n'ont souvent rien à voir entre elles : la vision artistique, la gestion administrative, les relations avec les institutions, le management d'une équipe, et parfois la création elle-même. La plupart des directeurs.rices de compagnie en France sont les chorégraphes fondateur.rices. Ce qui veut dire qu'on leur demande d'être à la fois artiste, patron.ne, représentant.e institutionnel.le et stratège. C'est un métier en soi.",

    missions: [
      "Définir et porter le projet artistique ou pédagogique de la structure.",
      "Superviser l'équipe permanente et les collaborateurs.rices.",
      "Représenter la structure auprès des institutions, partenaires et du public.",
      "Piloter la stratégie de développement : diffusion, financements, co-productions.",
      "Assumer la responsabilité légale et financière de la structure.",
    ],

    environnement: "Bureau de compagnie ou d'école, salles de répétition, tournées, réunions institutionnelles (DRAC, collectivités, Fondations). Le travail est itinérant par nature et implique une forte disponibilité.",

    formation: "Pas de formation unique. Certains ont suivi des cursus en administration culturelle : DESS culture, Sciences Po, master gestion des organisations culturelles. La pratique artistique préalable est souvent ce qui légitime le poste.",

    statut: "Souvent cumulatif : artiste-auteur.e pour la création + salarié.e directeur.rice de la structure. La gouvernance et le statut du fondateur.rice au sein de sa propre structure sont complexes. Se rapprocher de la CIPAC ou d'un.e conseiller.e juridique spécialisé.e.",

    competences: [
      "Leadership artistique et managérial.",
      "Connaissance du droit des associations, de la comptabilité et du droit du travail.",
      "Réseau dans le secteur chorégraphique et les institutions culturelles.",
      "Capacité de représentation, de négociation et de conviction.",
      "Vision stratégique à long terme.",
    ],

    neConfondreAvec: [
      {
        titre: "Chargé.e de production",
        texte: "Le chargé ou la chargée de production monte les budgets et les dossiers de financement sans nécessairement porter la responsabilité artistique ou légale de la structure.",
        lien:  'charge-production',
      },
    ],
  },

  {
    id:          'charge-production',
    nom:         'Chargé.e de production',
    description: "Assure le montage financier des projets : dossiers de subvention, budgets, relations avec les institutions culturelles.",
    univers:     'produire',

    definition: "Sans les chargé.es de production, beaucoup de spectacles n'existeraient tout simplement pas. Ce sont eux et elles qui transforment une intention artistique en projet viable : ils.elles trouvent les financements, construisent les budgets, négocient les coproductions, rédigent les dossiers de demande de subvention. Un travail souvent invisible pour le public, mais absolument central dans l'économie du secteur chorégraphique.",

    missions: [
      "Élaborer les budgets prévisionnels et réels des projets.",
      "Rédiger et déposer les dossiers de demande de subvention : DRAC, collectivités, Fondations.",
      "Prospecter les coproducteurs.rices et les lieux de résidence.",
      "Établir les contrats avec les partenaires et les artistes.",
      "Assurer le suivi de trésorerie et le reporting financier.",
    ],

    environnement: "Bureau de compagnie, structures de mutualisation (administrateurs.rices partagé.es), scènes nationales, CCN. Travail régulier avec les DRAC et les collectivités territoriales.",

    formation: "Master en administration culturelle (Paris I, Paris VIII, UVSQ, Sciences Po), DESS culture, ou BTS gestion avec spécialisation culturelle. Des formations continues existent via l'AFDAS ou le Centre National de la Danse.",

    statut: "Salarié.e CDI ou CDD, rarement intermittent.e. Parfois en portage salarial ou en freelance pour des missions ponctuelles auprès de plusieurs compagnies.",

    competences: [
      "Maîtrise des dispositifs de financement public de la culture.",
      "Rigueur budgétaire et notions de comptabilité.",
      "Connaissance du droit du travail dans le spectacle vivant.",
      "Capacité rédactionnelle pour les dossiers et rapports.",
      "Réseau auprès des institutions culturelles.",
    ],

    neConfondreAvec: [
      {
        titre: "Directeur.rice de compagnie / école",
        texte: "Le directeur ou la directrice de compagnie porte la vision artistique globale et la responsabilité légale de la structure. Le chargé ou la chargée de production opère sur le montage financier et administratif des projets.",
        lien:  'directeur-compagnie-ecole',
      },
    ],
  },

  {
    id:          'diffuseur',
    nom:         'Diffuseur.se / Programmateur.rice',
    description: "Sélectionne et programme les oeuvres dans les salles, festivals et structures culturelles. Garant.e de la rencontre entre une oeuvre et son public.",
    univers:     'produire',

    definition: "Le ou la diffuseur.se est la personne qui décide que tel spectacle sera programmé dans telle salle, devant tel public. C'est un rôle éditorial à part entière. Voir des spectacles, rencontrer des artistes, construire une programmation cohérente qui reflète une vision artistique et s'adresse à un public : tout ça demande du temps, un réseau solide et une vraie culture chorégraphique.",

    missions: [
      "Voir des spectacles, rencontrer des artistes, constituer une programmation cohérente et singulière.",
      "Négocier les conditions d'accueil : cachets, coproductions, résidences.",
      "Organiser les séjours et la logistique des représentations.",
      "Communiquer la programmation auprès du public de la structure.",
      "Contribuer à la politique culturelle et à l'identité éditoriale du lieu.",
    ],

    environnement: "Théâtres nationaux, scènes nationales, scènes conventionnées, centres culturels, festivals. Relations constantes avec les artistes, les agents et les DRAC.",

    formation: "Master en administration culturelle, en arts du spectacle ou en management culturel. L'expérience sur le terrain (stage, assistanat de programmation) est souvent décisive.",

    statut: "Salarié.e en CDI dans la plupart des structures culturelles.",

    competences: [
      "Culture chorégraphique large et curiosité artistique.",
      "Réseau dans le secteur chorégraphique.",
      "Sens de l'écoute et du dialogue avec les artistes.",
      "Capacité de négociation et gestion des relations contractuelles.",
      "Vision éditoriale et sens du public.",
    ],

    neConfondreAvec: [
      {
        titre: "Agent.e artistique",
        texte: "L'agent.e artistique défend les intérêts d'un.e artiste et cherche à développer sa carrière. Le diffuseur ou la diffuseuse programme pour l'intérêt d'une structure et de son public, sans mandat de représentation d'un.e artiste.",
        lien:  'agent-artistique',
      },
    ],
  },

  {
    id:          'agent-artistique',
    nom:         'Agent.e artistique',
    description: "Représente les artistes, négocie les contrats, développe leur carrière et leur visibilité sur les marchés nationaux et internationaux.",
    univers:     'produire',

    definition: "L'agent.e artistique est encore peu répandu.e dans le monde de la danse en France, c'est un modèle qui vient plutôt de la musique ou du cinéma. Mais le métier se structure progressivement dans le secteur chorégraphique. Concrètement : l'agent.e représente un.e artiste, négocie en son nom, cherche à développer sa visibilité et à ouvrir des marchés, souvent à l'international. C'est une relation de confiance sur le long terme.",

    missions: [
      "Représenter les artistes auprès des diffuseurs.euses, producteurs.rices et institutions.",
      "Négocier les conditions financières et les contrats.",
      "Développer la visibilité des artistes représenté.es à l'échelon national et international.",
      "Conseiller sur la stratégie de carrière et les choix artistiques stratégiques.",
      "Assurer une veille continue du marché chorégraphique.",
    ],

    environnement: "Bureau, salons professionnels (TANDEM, Biennale de Lyon, Rencontres chorégraphiques internationales), festivals. L'agent.e artistique travaille souvent pour une agence ou à son compte.",

    formation: "Pas de formation spécifique. Expérience en production, diffusion ou administration culturelle. Certains viennent du droit ou du commerce international.",

    statut: "Travailleur.se indépendant.e (SARL, EURL) ou salarié.e d'une agence. Le statut d'agent artistique est encadré. Vérifier les conditions auprès du Ministère du Travail ou d'un syndicat professionnel.",

    competences: [
      "Réseau étendu dans le secteur chorégraphique français et international.",
      "Maîtrise de la négociation contractuelle.",
      "Sens commercial et stratégique appliqué à la danse.",
      "Connaissance du marché international des arts de la scène.",
      "Anglais indispensable, espagnol ou allemand appréciés.",
    ],

    neConfondreAvec: [
      {
        titre: "Diffuseur.se / Programmateur.rice",
        texte: "Le diffuseur ou la diffuseuse programme des oeuvres pour une structure et dans l'intérêt de son public. L'agent.e artistique agit avec un mandat de représentation d'un.e artiste et dans son intérêt exclusif.",
        lien:  'diffuseur',
      },
    ],
  },

  {
    id:          'charge-communication',
    nom:         'Chargé.e de communication',
    description: "Construit l'image d'une compagnie ou d'une salle. Relations presse, réseaux sociaux, identité visuelle, dossiers artistiques.",
    univers:     'produire',

    definition: "Dans un secteur aussi concurrentiel que le spectacle vivant, bien communiquer peut faire une vraie différence. Le ou la chargé.e de communication construit l'image d'une compagnie, d'un théâtre ou d'un festival et fait exister la danse dans l'espace public : via la presse, les réseaux, les visuels, les dossiers artistiques. Un métier qui demande autant de sensibilité artistique que de maîtrise des outils numériques.",

    missions: [
      "Élaborer et mettre en oeuvre la stratégie de communication de la structure.",
      "Gérer les relations avec la presse et rédiger les communiqués.",
      "Animer les réseaux sociaux et mettre à jour le site web.",
      "Concevoir les supports de communication : dossiers artistiques, affiches, newsletters.",
      "Documenter les créations : coordination des prises de vue, vidéos, revues de presse.",
    ],

    environnement: "Bureau en compagnie, théâtre ou festival. Collaboration étroite avec les équipes artistiques et administratives, et avec les photographes, vidéastes et graphistes.",

    formation: "Master en communication, journalisme, sciences de l'information, ou en administration culturelle avec spécialisation communication. Des formations courtes existent via l'AFDAS ou le Centre National de la Danse.",

    statut: "Salarié.e CDI ou CDD dans la plupart des structures. En freelance ou portage salarial pour les petites compagnies.",

    competences: [
      "Maîtrise des outils de communication numérique : réseaux sociaux, PAO, emailing.",
      "Qualités rédactionnelles et sens de la narration.",
      "Sensibilité artistique et connaissance du secteur chorégraphique.",
      "Gestion de projet et respect des délais.",
      "Réseau dans la presse culturelle.",
    ],
  },

  {
    id:          'administrateur-compagnie',
    nom:         'Administrateur.rice de compagnie',
    description: "Gère l'ensemble des aspects administratifs, juridiques et financiers d'une compagnie. Colonne vertébrale invisible de la structure.",
    univers:     'produire',

    definition: "Sans administrateur.rice, une compagnie ne peut pas fonctionner durablement. Ce métier couvre l'ensemble des obligations administratives et légales d'une structure : comptabilité, droit du travail, déclarations sociales, conventions collectives, suivi des contrats, relations avec les institutions. L'administrateur.rice n'est pas le ou la chargé.e de production (qui monte les projets) ni le ou la directeur.rice (qui en porte la vision) : il ou elle est la personne qui s'assure que tout est en règle et que la structure est solide.",

    missions: [
      "Tenir la comptabilité générale et préparer les clôtures annuelles avec le ou la commissaire aux comptes.",
      "Gérer les contrats de travail et les déclarations sociales (URSSAF, congés spectacles).",
      "Superviser les obligations légales de l'association ou de la SARL.",
      "Assurer le suivi des conventions avec les institutions publiques.",
      "Contribuer à la consolidation budgétaire annuelle avec le ou la directeur.rice.",
    ],

    environnement: "Bureau de compagnie, parfois partagé entre plusieurs structures. Travail régulier avec les institutions, les organismes sociaux et les partenaires financiers.",

    formation: "BTS comptabilité ou gestion, master en administration culturelle ou en gestion des organisations. La connaissance de la convention collective nationale du spectacle vivant (CCNSVS) est indispensable.",

    statut: "Salarié.e CDI dans la plupart des cas, parfois en poste partagé entre plusieurs structures dans le cadre d'administrateurs.rices mutualisé.es.",

    competences: [
      "Comptabilité et gestion financière.",
      "Connaissance du droit du travail et de la convention collective nationale du spectacle vivant.",
      "Rigueur administrative et sens de l'organisation.",
      "Discrétion et sens des responsabilités.",
      "Capacité à travailler en lien étroit avec le ou la directeur.rice artistique.",
    ],

    neConfondreAvec: [
      {
        titre: "Chargé.e de production",
        texte: "Le chargé ou la chargée de production monte les dossiers de financement et les budgets de projets. L'administrateur.rice gère les obligations comptables, légales et sociales permanentes de la structure.",
        lien:  'charge-production',
      },
    ],
  },

  {
    id:          'directeur-production',
    nom:         'Directeur.rice de production',
    description: "Pilote la production d'un spectacle de la conception à la livraison. Coordonne les équipes techniques, artistiques et logistiques.",
    univers:     'produire',

    definition: "Le directeur ou la directrice de production occupe une place centrale dans les productions de grande envergure. À la différence du chargé.e de production qui monte les budgets et les dossiers, le directeur ou la directrice de production pilote l'ensemble du processus de fabrication : il ou elle coordonne les équipes techniques, artistiques et logistiques, gère le calendrier, suit les dépenses en temps réel et s'assure que le spectacle arrive à terme dans les conditions prévues.",

    missions: [
      "Planifier et coordonner les différentes phases de production : création, montage, représentations.",
      "Superviser les budgets et suivre les dépenses au jour le jour.",
      "Gérer les relations avec les prestataires techniques et les fournisseurs.",
      "Assurer la communication entre les équipes artistiques, techniques et administratives.",
      "Anticiper et résoudre les problèmes de production en temps réel.",
    ],

    environnement: "Grandes compagnies, productions internationales, spectacles de grande envergure (opéras, festivals, tournées mondiales). Les productions audiovisuelles de danse font également appel à ce profil.",

    formation: "Master en management de projet culturel, en administration culturelle ou en production événementielle. Une expérience terrain en régie ou en production est souvent décisive.",

    statut: "Salarié.e CDI ou CDD selon la taille de la structure. En freelance pour les grandes productions ponctuelles.",

    competences: [
      "Gestion de projet et coordination de multiples équipes simultanément.",
      "Maîtrise des outils de planification et de suivi budgétaire.",
      "Connaissance du secteur technique du spectacle vivant.",
      "Capacité de décision rapide et gestion des imprévus.",
      "Leadership et communication transversale.",
    ],
  },

  {
    id:          'charge-diffusion',
    nom:         'Chargé.e de diffusion',
    description: "Prospecte les lieux, négocie les accueils, construit les tournées. Interface entre la compagnie et les programmateurs.",
    univers:     'produire',

    definition: "La diffusion, c'est ce qui fait qu'un spectacle existe au-delà de sa première. Le ou la chargé.e de diffusion construit la vie d'une oeuvre après sa création : il ou elle prospecte les lieux, prend contact avec les programmateurs.rices, présente le spectacle, négocie les conditions d'accueil et monte les tournées. Un travail de conviction et de relation humaine, qui demande de connaître le secteur et ses acteurs.rices en profondeur.",

    missions: [
      "Prospecter et contacter les lieux de diffusion : salles, festivals, structures culturelles.",
      "Présenter les spectacles aux programmateurs.rices : dossiers artistiques, extraits, rendez-vous professionnels.",
      "Négocier les conditions d'accueil : cachets, frais, coopérations.",
      "Constituer et optimiser les tournées pour maximiser les représentations.",
      "Assurer le suivi administratif des accords et la coordination logistique.",
    ],

    environnement: "Bureau de compagnie, salons professionnels (Biennale de la danse, TANDEM, Rencontres chorégraphiques de Bagnolet, marchés internationaux). Relations constantes avec les programmateurs.rices et les DRAC.",

    formation: "Master en administration culturelle, en arts du spectacle ou en management culturel. La connaissance du réseau de diffusion et une première expérience en production sont essentielles.",

    statut: "Salarié.e CDI ou CDD dans les compagnies de taille suffisante. Parfois en poste mutualisé ou en freelance pour plusieurs structures.",

    competences: [
      "Connaissance du réseau de diffusion chorégraphique français et international.",
      "Sens de la négociation et des relations humaines.",
      "Qualités rédactionnelles pour les dossiers et les correspondances.",
      "Maîtrise de l'anglais pour la diffusion à l'international.",
      "Rigueur dans le suivi administratif des accords.",
    ],

    neConfondreAvec: [
      {
        titre: "Agent.e artistique",
        texte: "L'agent.e artistique représente un.e artiste avec un mandat de représentation et dans son intérêt exclusif. Le chargé ou la chargée de diffusion est salarié.e de la compagnie et travaille dans l'intérêt de la structure.",
        lien:  'agent-artistique',
      },
    ],
  },

  {
    id:          'charge-relations-publics',
    nom:         'Chargé.e des relations publics',
    description: "Développe et fidélise les publics d'une structure culturelle. Actions de sensibilisation, partenariats, groupes et abonnés.",
    univers:     'produire',

    definition: "Le ou la chargé.e des relations publics travaille sur l'un des enjeux les plus concrets du secteur : remplir les salles. Mais pas n'importe comment — il s'agit de développer des publics fidèles, diversifiés, qui s'approprient la programmation. Pour ça, il faut construire des relations durables avec des communautés, des partenaires et des prescripteurs, proposer des parcours de découverte et convertir les curieux.ses en spectateurs.rices régulier.es.",

    missions: [
      "Développer les relations avec les publics individuels et les groupes.",
      "Construire et animer un réseau de partenaires (associations, entreprises, établissements scolaires).",
      "Coordonner les abonnements, les offres tarifaires et les programmes de fidélisation.",
      "Travailler en lien avec la médiation culturelle et la communication.",
      "Analyser les données de fréquentation et ajuster les stratégies en conséquence.",
    ],

    environnement: "Théâtres, scènes nationales, festivals, opéras. En lien permanent avec les équipes de communication, de médiation et de programmation.",

    formation: "Formation en marketing culturel, en communication, en sciences de l'information ou en administration culturelle. Expérience en relation client ou en développement de publics appréciée.",

    statut: "Salarié.e CDI dans la plupart des structures de taille suffisante.",

    competences: [
      "Sens de la relation humaine et capacité à fidéliser des publics.",
      "Connaissance des outils de CRM et de billetterie.",
      "Aptitude à construire et à animer des partenariats.",
      "Culture artistique permettant de parler des spectacles avec conviction.",
      "Rigueur dans le suivi et l'analyse des données de fréquentation.",
    ],
  },

  {
    id:          'booker',
    nom:         'Booker',
    description: "Planifie et confirme les engagements des artistes. Gère les agendas, les disponibilités et les conditions d'engagement dans un secteur où tout va vite.",
    univers:     'produire',

    definition: "Le booker est la personne qui confirme que l'artiste sera là, à telle date, dans telle configuration. C'est un métier de logistique et de relation humaine : gérer les agendas, vérifier les disponibilités, confirmer les conditions de prestation, assurer le suivi des engagements. Dans le secteur de la danse, cette fonction existe surtout dans les agences artistiques, les producteurs de spectacles et les grandes structures culturelles.",

    missions: [
      "Gérer les agendas et les disponibilités des artistes représenté.es ou programmé.es.",
      "Négocier et confirmer les conditions d'engagement avec les organisateurs.",
      "Assurer le suivi administratif des contrats et des riders.",
      "Coordonner la logistique des déplacements et des hébergements.",
      "Maintenir une relation de confiance avec les artistes et les structures partenaires.",
    ],

    environnement: "Agences artistiques, producteurs de spectacles, grandes tournées, structures de diffusion. Le rythme est souvent soutenu, avec des enjeux de planning serrés.",

    formation: "Formation en commerce, en management ou en administration culturelle. L'expérience en production ou en diffusion est souvent plus décisive que le diplôme.",

    statut: "Salarié.e dans une agence ou une structure, parfois en freelance. La dénomination est plus courante dans les musiques actuelles mais se développe dans la danse.",

    competences: [
      "Sens de l'organisation et gestion simultanée de multiples agendas.",
      "Qualités relationnelles et aisance dans la négociation.",
      "Connaissance du cadre contractuel des spectacles vivants.",
      "Réactivité et gestion du stress dans un environnement à enjeux immédiats.",
      "Anglais courant pour les engagements internationaux.",
    ],
  },

  // ── 05 · Accompagner ─────────────────────────────────────────────────────

  {
    id:          'kine',
    nom:         'Kinésithérapeute spécialisé.e',
    description: "Prévention et traitement des blessures spécifiques aux danseurs. Connaissance des contraintes physiques propres à chaque discipline.",
    univers:     'accompagner',
    featured:    true,

    definition: "Le corps d'un.e danseur.se professionnel.le est soumis à des contraintes très spécifiques, pas les mêmes que celles d'un.e sportif.ve, pas les mêmes que celles d'un.e sédentaire. Un.e kinésithérapeute qui travaille auprès de danseurs.euses doit comprendre ces contraintes de l'intérieur : l'hypermobilité souvent recherchée, les compensations que le corps développe, les cultures de la douleur propres à certaines disciplines. C'est une spécialisation qui s'acquiert sur le terrain.",

    missions: [
      "Traiter les blessures spécifiques aux danseurs.euses : tendons, articulations, rachis, pieds.",
      "Proposer des bilans fonctionnels et des programmes de prévention adaptés.",
      "Accompagner les reprises d'entraînement après blessure.",
      "Intervenir directement au sein des compagnies ou des écoles de danse.",
      "Collaborer avec les médecins du sport, les préparateurs.rices physiques et les coachs.",
    ],

    environnement: "Cabinet libéral, structures médicales, compagnies en résidence, écoles de danse professionnelles. Certains kinésithérapeutes accompagnent les compagnies en tournée.",

    formation: "Diplôme d'État de Masseur-Kinésithérapeute (DEMK, Bac+4). La spécialisation en danse s'acquiert par la pratique, des formations complémentaires (pilates, méthode Mézières, Feldenkrais) et l'expérience au contact de danseurs.euses.",

    statut: "Libéral.e, salarié.e, ou les deux. Conventionné.e Sécurité Sociale dans la plupart des cas.",

    competences: [
      "Connaissance approfondie de la biomécanique spécifique à la danse.",
      "Techniques de rééducation et de massage thérapeutique.",
      "Empathie et sens de l'accompagnement dans la durée.",
      "Capacité à travailler en équipe pluridisciplinaire.",
      "Pratique ou intérêt pour la danse : un vrai atout.",
    ],

    neConfondreAvec: [
      {
        titre: "Coach de scène / Préparateur.rice mental.e",
        texte: "Le coaching de scène et la préparation mentale travaillent sur la performance globale, la confiance et la gestion du trac. La kinésithérapie intervient sur le corps physique, les blessures et la rééducation.",
        lien:  'coach',
      },
    ],
  },

  {
    id:          'coach',
    nom:         'Coach de scène / Préparateur.rice mental.e',
    description: "Accompagne la posture, la confiance, la gestion du trac et la performance en situation d'audition ou de représentation.",
    univers:     'accompagner',

    definition: "Monter sur scène régulièrement, passer des auditions, performer sous pression : tout ça a un coût mental. Le ou la coach de scène ou préparateur.rice mental.e travaille sur cette dimension que la technique seule ne couvre pas : la gestion du trac, la confiance en soi, la présence dans les moments qui comptent. C'est un accompagnement qui complète les autres, il n'est pas là pour remplacer un suivi psychologique.",

    missions: [
      "Accompagner les artistes dans leur préparation mentale et scénique.",
      "Animer des ateliers sur la confiance, le trac et la gestion du stress.",
      "Travailler sur la présence scénique et la qualité de l'interprétation.",
      "Proposer des outils personnalisés de gestion de la pression.",
      "Intervenir en complémentarité des équipes médicales et artistiques.",
    ],

    environnement: "Studio, cabinet, en compagnie, en école supérieure. Souvent en freelance. Le cadre varie beaucoup selon les approches : coaching sportif adapté, sophrologie, thérapies corps-esprit, travail vocal, etc.",

    formation: "Il n'existe pas de formation standardisée spécifique aux arts vivants. Certains coachs viennent de la préparation mentale sportive (INSEP, formations fédérales), d'autres de la psychologie, du théâtre ou de la danse elle-même.",

    statut: "Indépendant.e dans la grande majorité des cas. La dénomination « coach » n'est pas protégée, ce qui implique une certaine vigilance sur la diversité des pratiques qui s'en revendiquent.",

    competences: [
      "Connaissance des mécanismes du stress et de la performance sous pression.",
      "Sens de l'écoute et de la relation d'accompagnement.",
      "Outils adaptés à un public d'artistes de haut niveau.",
      "Discrétion et éthique professionnelle irréprochables.",
      "Expérience du milieu artistique et connaissance de ses contraintes.",
    ],

    neConfondreAvec: [
      {
        titre: "Kinésithérapeute spécialisé.e",
        texte: "La kinésithérapie intervient sur le corps physique, les blessures et la rééducation. Le coaching de scène et la préparation mentale travaillent sur la dimension psychologique et la performance artistique globale.",
        lien:  'kine',
      },
    ],
  },

  {
    id:          'photographe',
    nom:         'Photographe de danse',
    description: "Capture le mouvement, les répétitions, les portraits d'artistes. Images qui documentent et donnent à voir la danse en dehors de la scène.",
    univers:     'accompagner',

    definition: "La photographie de danse a une particularité : elle doit montrer ce qui disparaît. Un geste dure une fraction de seconde. Une répétition ne se répète pas. Un moment de présence scénique ne se reproduit jamais à l'identique. Le ou la photographe de danse est là pour capturer ça, et le rendre visible à un public qui n'était pas dans la salle. C'est à la fois une archive et une oeuvre.",

    missions: [
      "Réaliser des reportages en répétition et des captations de plateau.",
      "Photographier les portraits d'artistes pour les dossiers et la presse.",
      "Produire les visuels de communication : affiches, programmes, newsletters.",
      "Livrer et éditer les images dans les délais convenus.",
      "Gérer les droits d'auteur et négocier les contrats d'usage des images.",
    ],

    environnement: "Studio photo, répétitions en studio, plateau (souvent en conditions de lumière difficiles, sans droit au flash), événements, festivals. En freelance pour la plupart, avec des relations régulières avec certaines compagnies ou salles.",

    formation: "Diplôme de photographie (ENSBA, Gobelins, ENSP d'Arles) ou parcours autodidacte. Certains photographes de danse ont d'abord été danseurs.euses : la connaissance du mouvement fait une vraie différence.",

    statut: "Artiste-auteur.e inscrit.e à la Maison des artistes. Les droits d'auteur sur les images sont protégés : les contrats de cession de droits doivent préciser les usages autorisés.",

    competences: [
      "Maîtrise technique de la photographie dans des conditions scéniques difficiles.",
      "Connaissance du mouvement de danse et anticipation du geste.",
      "Capacité à être discret.e et non-intrusif.ve en répétition.",
      "Post-traitement : Lightroom, Photoshop.",
      "Sens de la relation et de la confiance avec les artistes photographié.es.",
    ],
  },

  {
    id:          'journaliste',
    nom:         'Journaliste / Critique',
    description: "Documente, analyse et met en mots la danse. Presse, web, radio, podcast : autant de formats pour faire exister la danse dans le débat culturel.",
    univers:     'accompagner',

    definition: "La critique de danse est un métier qui souffre. Les espaces se réduisent dans la presse généraliste, les médias spécialisés sont fragiles, et pourtant l'enjeu reste entier : mettre en mots ce que les corps font sur scène, donner des repères à un public, faire exister la danse dans le débat culturel. Ceux et celles qui exercent ce métier le font souvent par conviction, en jonglant avec plusieurs missions en parallèle.",

    missions: [
      "Voir des spectacles régulièrement et rédiger comptes rendus, critiques ou analyses.",
      "Mener des entretiens avec des artistes, chorégraphes et acteurs du secteur.",
      "Produire des formats variés : articles, podcasts, vidéos, posts éditoriaux.",
      "Contribuer à des médias spécialisés ou généralistes.",
      "Animer des temps de médiation : rencontres avec le public, conférences, masterclasses.",
    ],

    environnement: "Presse spécialisée (Mouvement, Danser Canal Historique), presse généraliste, web, radio, podcast. Souvent en freelance pour plusieurs médias simultanément.",

    formation: "Formation en journalisme (IEJ, CUEJ, CFJ), en lettres, en arts du spectacle. Pas de formation spécifique à la critique de danse : la culture et la régularité de présence aux spectacles s'acquièrent par l'expérience.",

    statut: "Pigiste indépendant.e pour la plupart, avec parfois un statut de salarié.e dans un média. La carte de presse est accessible sous conditions d'activité journalistique principale.",

    competences: [
      "Qualités rédactionnelles et capacité d'analyse artistique.",
      "Culture chorégraphique large, historique et contemporaine.",
      "Sens de l'entretien et de la relation aux artistes.",
      "Capacité à produire sous contrainte de temps.",
      "Ouverture aux nouveaux formats : podcast, vidéo, réseaux sociaux.",
    ],
  },

  {
    id:          'medecin-sport',
    nom:         'Médecin du sport',
    description: "Prévient, diagnostique et prend en charge les problématiques de santé liées à la pratique intensive et à la performance.",
    univers:     'accompagner',

    definition: "Le corps d'un.e danseur.se professionnel.le est soumis à une intensité d'utilisation comparable à celle des sportifs de haut niveau, mais dans un cadre qui n'a pas toujours les mêmes ressources médicales. Le ou la médecin du sport spécialisé.e dans les arts de la scène connaît ces spécificités. Il ou elle ne soigne pas que des blessures : il ou elle accompagne la santé globale d'artistes dont le corps est l'outil de travail.",

    missions: [
      "Réaliser les bilans médicaux d'aptitude à la pratique professionnelle.",
      "Diagnostiquer et prendre en charge les blessures aiguës et chroniques.",
      "Travailler en réseau avec les kinésithérapeutes, ostéopathes et chirurgiens.",
      "Conseiller sur la prévention : nutrition, sommeil, gestion de l'effort.",
      "Accompagner les reprises après blessure grave.",
    ],

    environnement: "Cabinet libéral, centres médicaux spécialisés dans les arts du spectacle, compagnies ou institutions (en tant que médecin référent). Certains participent aux tournées ou aux périodes de création intensive.",

    formation: "Diplôme d'État de Médecin + Diplôme d'Études Spécialisées Complémentaires (DESC) ou Capacité en Médecine du Sport. La connaissance spécifique de la danse s'acquiert par la pratique.",

    statut: "Libéral.e ou salarié.e selon le cadre d'exercice. Conventionné.e Sécurité Sociale.",

    competences: [
      "Connaissance des pathologies spécifiques aux pratiques corporelles intensives.",
      "Sens de l'écoute et approche globale du patient-artiste.",
      "Capacité à travailler en équipe pluridisciplinaire.",
      "Connaissance du secteur chorégraphique et de ses contraintes.",
      "Disponibilité et adaptabilité aux rythmes de la vie artistique.",
    ],

    neConfondreAvec: [
      {
        titre: "Kinésithérapeute spécialisé.e",
        texte: "Le ou la kinésithérapeute traite et rééduque sur prescription médicale. Le médecin du sport diagnostique, prescrit et coordonne le parcours de soin dans sa globalité.",
        lien:  'kine',
      },
    ],
  },

  {
    id:          'osteopathe',
    nom:         'Ostéopathe',
    description: "Accompagne la mobilité, les équilibres du corps et la récupération, en tenant compte des contraintes propres à la danse.",
    univers:     'accompagner',

    definition: "Beaucoup de danseurs.euses consultent un.e ostéopathe régulièrement, pas forcément parce qu'ils.elles sont blessé.es, mais pour maintenir un équilibre global du corps, repérer les tensions avant qu'elles deviennent des blessures, et récupérer plus vite entre les projets. L'approche globale de l'ostéopathie s'accorde assez bien avec la façon dont les danseurs.euses habitent leur corps.",

    missions: [
      "Évaluer et traiter les tensions musculo-squelettiques, articulaires et viscérales.",
      "Accompagner la récupération après des périodes de travail intense.",
      "Intervenir en prévention, en amont des blessures.",
      "Conseiller sur l'hygiène corporelle et les habitudes posturales.",
      "Collaborer avec les kinésithérapeutes et médecins du sport.",
    ],

    environnement: "Cabinet libéral, structures de santé, compagnies à la demande. Certains ostéopathes se déplacent en studio ou accompagnent les compagnies lors des créations.",

    formation: "Diplôme d'État d'Ostéopathe (Bac+5, DO), délivré par les écoles agréées par le Ministère de la Santé. La spécialisation en danse s'acquiert par la pratique et les formations continues.",

    statut: "Libéral.e pour la majorité. L'ostéopathie n'est pas remboursée par la Sécurité Sociale mais prise en charge par de nombreuses mutuelles : à vérifier selon les conventions.",

    competences: [
      "Connaissance approfondie de l'anatomie et de la biomécanique.",
      "Techniques ostéopathiques adaptées aux corps très sollicités.",
      "Sens de l'écoute et approche globale du patient.",
      "Connaissance des contraintes spécifiques de la pratique chorégraphique.",
      "Discrétion et respect de la relation thérapeutique.",
    ],

    neConfondreAvec: [
      {
        titre: "Kinésithérapeute spécialisé.e",
        texte: "La kinésithérapie travaille sur prescription médicale pour la rééducation de pathologies précises. L'ostéopathie adopte une approche globale, préventive et non prescrite, orientée vers les équilibres du corps.",
        lien:  'kine',
      },
    ],
  },

  {
    id:          'magnetiseur',
    nom:         'Magnétiseur.se',
    description: "Propose une pratique complémentaire de bien-être et d'accompagnement, parfois sollicitée par les artistes dans leur parcours corporel.",
    univers:     'accompagner',

    definition: "Le magnétisme ne fait pas partie des pratiques médicales reconnues en France. Pourtant, certains artistes y ont recours dans le cadre d'une démarche personnelle de bien-être, en complément de leur suivi conventionnel. Si cette pratique vous intéresse ou vous est suggérée, il est important de comprendre son cadre exact : il ne s'agit pas d'un traitement médical, et elle ne doit pas se substituer à un suivi de santé adapté.",

    missions: [
      "Accueillir et accompagner les personnes dans un cadre de bien-être.",
      "Proposer des séances d'accompagnement énergétique.",
      "Écouter et orienter si nécessaire vers des professionnels de santé.",
      "Maintenir une pratique éthique et une communication claire sur le cadre de l'accompagnement.",
    ],

    environnement: "Cabinet privé, studios, à domicile. L'exercice est non réglementé en France : il relève des pratiques de bien-être et non de la médecine.",

    formation: "Il n'existe pas de formation officielle ou reconnue par l'État. Des formations privées existent. Le cadre déontologique est à construire individuellement.",

    statut: "Travailleur.se indépendant.e dans la plupart des cas, souvent en auto-entrepreneur. Attention : présenter le magnétisme comme un traitement médical constituerait un exercice illégal de la médecine.",

    competences: [
      "Sens de l'écoute et de la relation d'aide.",
      "Éthique et transparence dans la communication sur la nature de la pratique.",
      "Capacité à orienter vers des professionnels de santé si nécessaire.",
      "Discrétion et respect de la confidentialité.",
    ],
  },

  {
    id:          'preparateur-physique',
    nom:         'Préparateur.rice physique',
    description: "Optimise les capacités physiques des danseurs.euses : force, endurance, mobilité, prévention des blessures. Travail en complément de l'entraînement artistique.",
    univers:     'accompagner',

    definition: "Un.e danseur.se professionnel.le est aussi un.e athlète. La préparation physique spécifique à la danse prend cela au sérieux : travailler la force, l'endurance, la proprioception, la stabilité articulaire, en tenant compte des contraintes propres à chaque discipline et à chaque corps. Le ou la préparateur.rice physique n'est pas là pour remplacer le cours de danse, mais pour en optimiser les bases physiologiques.",

    missions: [
      "Évaluer les capacités physiques et les faiblesses de chaque artiste.",
      "Concevoir des programmes de préparation physique individualisés ou collectifs.",
      "Animer des séances de renforcement musculaire, de mobilité et de proprioception.",
      "Accompagner les reprises d'activité après blessure en lien avec le kinésithérapeute.",
      "Adapter les protocoles selon les périodes de création, de tournée ou de récupération.",
    ],

    environnement: "Studio de préparation physique, plateau, compagnies en résidence, centres médicaux spécialisés dans les arts du spectacle. Missions régulières ou ponctuelles selon les structures.",

    formation: "Licence ou Master STAPS (Sciences et Techniques des Activités Physiques et Sportives), avec spécialisation en préparation physique. Une connaissance approfondie de la danse s'acquiert par la pratique ou une formation complémentaire.",

    statut: "Salarié.e ou freelance selon les structures. Certains préparateurs.rices physiques travaillent en libéral auprès de plusieurs compagnies simultanément.",

    competences: [
      "Connaissance approfondie de la physiologie du mouvement et des contraintes spécifiques à la danse.",
      "Maîtrise des techniques de renforcement musculaire et de mobilité.",
      "Capacité à individualiser les protocoles selon les profils.",
      "Collaboration étroite avec les kinésithérapeutes et médecins du sport.",
      "Sens de la communication et de la pédagogie corporelle.",
    ],

    neConfondreAvec: [
      {
        titre: "Kinésithérapeute spécialisé.e",
        texte: "Le kinésithérapeute intervient en rééducation sur prescription médicale. Le préparateur ou la préparatrice physique travaille en amont, sur l'optimisation des capacités et la prévention des blessures.",
        lien:  'kine',
      },
    ],
  },

  {
    id:          'nutritionniste',
    nom:         'Nutritionniste / Diététicien.ne',
    description: "Accompagne les danseurs.euses dans leur alimentation pour optimiser les performances, soutenir l'entraînement et préserver la santé sur le long terme.",
    univers:     'accompagner',

    definition: "L'alimentation d'un.e danseur.se professionnel.le n'est pas celle d'un.e sportif.ve ordinaire. Les contraintes esthétiques propres à certaines disciplines, les rythmes irréguliers des tournées, la pression des milieux professionnels sur le corps : tout cela en fait un domaine à part. Un.e nutritionniste ou diététicien.ne spécialisé.e accompagne les artistes dans un rapport à l'alimentation à la fois performant et sain, loin des dérives que le secteur peut générer.",

    missions: [
      "Évaluer les besoins nutritionnels en fonction de l'intensité de la pratique.",
      "Construire des plans alimentaires adaptés aux contraintes de vie des artistes.",
      "Accompagner les artistes dans un rapport sain et durable à la nourriture.",
      "Intervenir en prévention ou en soutien dans les situations de troubles du comportement alimentaire.",
      "Travailler en réseau avec les médecins du sport et les préparateurs.rices physiques.",
    ],

    environnement: "Cabinet libéral, structures médicales spécialisées, compagnies ou écoles de danse. Certains nutritionnistes proposent des consultations à distance pour les artistes en tournée.",

    formation: "BTS Diététique ou Diplôme d'État de Diététicien.ne, complété par une formation continue spécialisée dans les arts du spectacle ou le sport de haut niveau.",

    statut: "Libéral.e dans la majorité des cas. La profession est réglementée : l'exercice sans diplôme reconnu constitue une pratique illégale de la diététique.",

    competences: [
      "Connaissance des besoins nutritionnels spécifiques aux arts du corps.",
      "Capacité à adapter les recommandations aux contraintes pratiques des artistes.",
      "Sensibilité aux enjeux psychologiques liés à l'alimentation dans le milieu de la danse.",
      "Éthique et discrétion dans la relation d'accompagnement.",
      "Connaissance des troubles du comportement alimentaire et des ressources disponibles.",
    ],
  },

  {
    id:          'manager-artiste',
    nom:         "Manager d'artiste",
    description: "Gère la carrière globale d'un.e artiste : stratégie, développement, relations avec les partenaires, image. Vision à long terme.",
    univers:     'accompagner',

    definition: "Le ou la manager d'artiste est distinct.e de l'agent.e : là où l'agent.e négocie les contrats et les engagements, le ou la manager s'occupe de la vision globale d'une carrière. Il ou elle travaille sur le positionnement artistique, les partenariats stratégiques, l'image, les décisions de long terme. C'est une relation de confiance profonde, souvent exclusive, qui engage les deux parties sur plusieurs années.",

    missions: [
      "Définir et mettre en oeuvre la stratégie de développement de carrière de l'artiste.",
      "Gérer les relations avec les partenaires stratégiques : labels, institutions, marques.",
      "Conseiller l'artiste dans ses choix artistiques et professionnels.",
      "Superviser l'image et la communication de l'artiste.",
      "Coordonner les différents intervenants autour de l'artiste : agent, attaché.e de presse, équipe technique.",
    ],

    environnement: "En freelance ou au sein d'une structure de management. Travail transversal, souvent entre Paris et les marchés internationaux.",

    formation: "Pas de formation spécifique. Expérience en production, en diffusion, en communication ou en droit du spectacle. La relation de confiance avec l'artiste prime sur les diplômes.",

    statut: "Travailleur.se indépendant.e ou salarié.e d'une société de management. La rémunération est souvent en pourcentage des revenus de l'artiste.",

    competences: [
      "Vision stratégique et capacité à penser une carrière sur le long terme.",
      "Réseau dense dans le secteur chorégraphique et culturel.",
      "Sens de la négociation et des relations partenariales.",
      "Capacité à gérer simultanément plusieurs dimensions d'une carrière.",
      "Confiance et loyauté dans une relation exclusive avec l'artiste.",
    ],

    neConfondreAvec: [
      {
        titre: "Agent.e artistique",
        texte: "L'agent.e artistique négocie les engagements et les contrats de prestation. Le manager ou la manager d'artiste pilote la stratégie globale de carrière sur le long terme.",
        lien:  'agent-artistique',
      },
    ],
  },

  {
    id:          'directeur-casting',
    nom:         'Directeur.rice de casting',
    description: "Recherche et sélectionne les interprètes pour les productions chorégraphiques, audiovisuelles ou commerciales. Interface entre les artistes et les équipes de production.",
    univers:     'accompagner',

    definition: "Le ou la directeur.rice de casting est la personne qui trouve les artistes qu'un projet cherche. Pour la danse, ce rôle est surtout présent dans les productions audiovisuelles (clips, films, publicités), les comédies musicales et les grandes productions commerciales. Il ou elle construit et entretient une base de données de talents, organise les auditions, et fait le lien entre les artistes et les équipes de production.",

    missions: [
      "Comprendre les besoins artistiques d'un projet et définir les profils recherchés.",
      "Identifier et contacter les interprètes potentiels dans son réseau.",
      "Organiser et superviser les sessions d'audition.",
      "Proposer des sélections argumentées à la direction artistique.",
      "Maintenir une base de données de talents actualisée et diversifiée.",
    ],

    environnement: "Agences de casting, sociétés de production audiovisuelle, productions de comédies musicales, événementiel. Travail en lien étroit avec les chorégraphes et les directeurs.rices artistiques.",

    formation: "Pas de formation spécifique. Expérience dans le secteur de la danse, du spectacle ou de la production. Une pratique de la danse ou une connaissance approfondie du milieu est un atout majeur.",

    statut: "Salarié.e ou freelance selon les structures. En freelance, travail souvent en mission pour plusieurs productions simultanément.",

    competences: [
      "Réseau étendu parmi les interprètes et les agences de représentation.",
      "Oeil artistique et capacité à évaluer un profil rapidement.",
      "Organisation logistique des sessions d'audition.",
      "Discrétion et éthique dans la relation avec les artistes.",
      "Connaissance des esthétiques et des disciplines chorégraphiques.",
    ],
  },

  {
    id:          'conseiller-insertion',
    nom:         'Conseiller.ère en insertion professionnelle',
    description: "Accompagne les artistes dans leur parcours : reconversion, transition, nouvelles activités. Connaissance des dispositifs d'aide et des réseaux du secteur.",
    univers:     'accompagner',

    definition: "La carrière d'interprète est l'une des plus courtes qui soit. La transition vers d'autres activités, qu'elle soit choisie ou subie, est une réalité pour la grande majorité des danseurs.euses professionnel.les. Le ou la conseiller.ère en insertion accompagne ces transitions : identifier les compétences transférables, construire un nouveau projet professionnel, connaître les dispositifs disponibles. C'est un accompagnement humain autant que technique.",

    missions: [
      "Accompagner les artistes dans l'identification de leurs compétences et de leurs aspirations.",
      "Informer sur les dispositifs de reconversion : formation, financement, aide au projet.",
      "Orienter vers les structures ressources du secteur : AFDAS, Audiens, Centre National de la Danse.",
      "Soutenir la construction d'un nouveau projet professionnel, dans ou hors du spectacle.",
      "Suivre les artistes dans le temps et adapter l'accompagnement à l'évolution de leur situation.",
    ],

    environnement: "Structures de soutien aux artistes (Audiens, AFDAS, Transitions Pro), centres chorégraphiques, syndicats professionnels, structures de formation. Parfois intégré.e à une compagnie ou une école supérieure.",

    formation: "Master en ressources humaines, en psychologie du travail ou en ingénierie de la formation. Une expérience dans le secteur du spectacle vivant est souvent indispensable pour la crédibilité auprès des artistes.",

    statut: "Salarié.e des structures d'accompagnement ou indépendant.e. Certains postes relèvent de la fonction publique ou des organismes paritaires.",

    competences: [
      "Connaissance des dispositifs d'accompagnement et de formation dans le spectacle vivant.",
      "Sens de l'écoute et de l'accompagnement individualisé.",
      "Capacité à aborder des situations de vie professionnelle complexes avec bienveillance.",
      "Réseau dans le secteur pour orienter efficacement.",
      "Connaissance de la réglementation sociale et des droits des artistes.",
    ],
  },

  {
    id:          'avocat-spectacle',
    nom:         'Avocat.e spécialisé.e spectacle vivant',
    description: "Conseille et représente les artistes, compagnies et structures culturelles en droit du travail, droit d'auteur, contrats et litiges.",
    univers:     'accompagner',

    definition: "Le droit du spectacle vivant est un domaine très spécialisé : intermittence, droits d'auteur, conventions collectives, droit des associations, droit de la propriété intellectuelle appliqué aux oeuvres chorégraphiques... Un.e avocat.e spécialisé.e dans ce secteur connaît ces spécificités de l'intérieur et peut accompagner aussi bien un.e danseur.se indépendant.e qu'une grande structure dans ses besoins juridiques.",

    missions: [
      "Conseiller sur les contrats : cession de droits, coproduction, résidence, engagement d'artiste.",
      "Accompagner les structures dans leur gouvernance juridique.",
      "Défendre les artistes ou les structures dans les litiges (droit du travail, propriété intellectuelle).",
      "Informer sur les évolutions réglementaires du secteur du spectacle vivant.",
      "Intervenir en prévention pour éviter les situations conflictuelles.",
    ],

    environnement: "Cabinet d'avocats spécialisé, parfois en lien avec des syndicats ou des organisations professionnelles du secteur (SFA, SYNDEAC, SMA).",

    formation: "Master en droit privé ou en droit public avec spécialisation en propriété intellectuelle ou en droit du travail. Barreau. La spécialisation spectacle vivant s'acquiert par l'expérience et les dossiers traités.",

    statut: "Profession libérale réglementée. L'exercice du droit est strictement encadré par le Barreau.",

    competences: [
      "Maîtrise du droit du travail dans le spectacle vivant et de la convention collective nationale.",
      "Connaissance du droit d'auteur appliqué aux oeuvres chorégraphiques.",
      "Rigueur analytique et qualités rédactionnelles.",
      "Sens de la communication avec des artistes peu familiers du droit.",
      "Connaissance du tissu institutionnel du secteur culturel français.",
    ],
  },

  {
    id:          'comptable-artistes',
    nom:         'Expert.e-comptable spécialisé.e',
    description: "Gère la comptabilité des artistes, des associations et des compagnies de danse. Connaissance des spécificités fiscales et sociales du secteur.",
    univers:     'accompagner',

    definition: "La comptabilité d'un.e artiste intermittent.e ou d'une petite compagnie obéit à des règles spécifiques que tous les experts-comptables ne maîtrisent pas. Un.e expert.e-comptable spécialisé.e dans le spectacle vivant connaît les particularités fiscales (TVA sur les spectacles, régime des artistes-auteurs.rices) et sociales (intermittence, AUDIENS, Maison des artistes) qui s'appliquent au secteur. C'est un partenaire de confiance, souvent consulté ponctuellement ou en mission annuelle.",

    missions: [
      "Tenir ou superviser la comptabilité d'une compagnie ou d'une structure culturelle.",
      "Établir les bilans et les comptes de résultat annuels.",
      "Conseiller sur les choix fiscaux et les optimisations légales dans le secteur.",
      "Accompagner les artistes indépendants dans leurs déclarations et leur gestion financière.",
      "Alerter sur les risques et les obligations spécifiques au secteur du spectacle.",
    ],

    environnement: "Cabinet d'expertise comptable spécialisé dans le secteur culturel, parfois en mission directe auprès de compagnies ou d'artistes. Travail régulier avec les commissaires aux comptes et les avocats spécialisés.",

    formation: "DEC (Diplôme d'Expert-Comptable). La spécialisation spectacle vivant s'acquiert par l'expérience et la formation continue.",

    statut: "Profession libérale réglementée par l'Ordre des experts-comptables.",

    competences: [
      "Maîtrise de la comptabilité des associations et des structures du spectacle vivant.",
      "Connaissance de la fiscalité applicable aux artistes et aux structures culturelles.",
      "Rigueur, discrétion et sens des responsabilités.",
      "Capacité à vulgariser les obligations comptables auprès des artistes.",
      "Suivi des évolutions réglementaires propres au secteur culturel.",
    ],
  },

  // ── 06 · Image & scène ───────────────────────────────────────────────────

  {
    id:          'regisseur',
    nom:         'Régisseur.euse',
    description: "Coordonne les aspects techniques d'un spectacle : son, lumière, décors, plateau. Clé de voûte de chaque représentation.",
    univers:     'image',
    featured:    true,

    definition: "Le ou la régisseur.euse est la personne sans qui rien ne se passe. Pendant la représentation, c'est lui ou elle qui coordonne le son, la lumière, les décors, le plateau, et qui s'assure que tout tient ensemble, soir après soir, dans des salles différentes avec des équipes différentes. Un travail très technique, qui demande aussi une capacité à gérer l'imprévu sans que ça se voie.",

    missions: [
      "Coordonner l'ensemble des éléments techniques du spectacle : son, lumière, décors, costumes.",
      "Préparer les fiches techniques et les riders pour les salles d'accueil.",
      "Assurer le montage, les balances, les filages et les représentations.",
      "Former et encadrer les équipes techniques locales lors des tournées.",
      "Anticiper les problèmes et gérer les imprévus en direct.",
    ],

    environnement: "Théâtres, festivals, tournées nationales et internationales. Certains régisseurs.euses sont salarié.es d'une compagnie itinérante, d'autres travaillent pour des salles accueillant les spectacles.",

    formation: "Diplôme de régie du spectacle (CFPTS, formations professionnalisantes), ou formation technique en son ou lumière complétée par l'expérience. L'habilitation électrique est souvent requise.",

    statut: "Salarié.e CDI dans les salles, CDDU intermittent en tournée. La régie est l'un des métiers techniques du spectacle les mieux structurés sur le plan de la formation et des conventions collectives.",

    competences: [
      "Maîtrise des équipements son et lumière et de leur régie.",
      "Lecture et rédaction de plans techniques et de fiches de plateau.",
      "Gestion du stress et des imprévus en situation de représentation.",
      "Leadership dans les équipes techniques.",
      "Communication claire avec les équipes artistiques.",
    ],

    neConfondreAvec: [
      {
        titre: "Créateur.rice lumière",
        texte: "Le créateur ou la créatrice lumière conçoit l'éclairage comme un acte artistique. Le régisseur ou la régisseuse coordonne l'ensemble des techniques du spectacle et en assure l'exécution lors de chaque représentation.",
        lien:  'createur-lumiere',
      },
    ],
  },

  {
    id:          'createur-lumiere',
    nom:         'Créateur.rice lumière',
    description: "Conçoit l'éclairage d'un spectacle comme un langage à part entière. La lumière sculpte l'espace, guide le regard, crée l'atmosphère.",
    univers:     'image',

    definition: "Il y a des spectacles où on sort en se souvenant de la lumière autant que des corps. La lumière sculpte l'espace, guide le regard, crée ou détruit une atmosphère en quelques secondes. Ce n'est pas un habillage : c'est un langage. Le ou la créateur.rice lumière le conçoit comme tel, en dialogue étroit avec le ou la chorégraphe, souvent dès les premières répétitions.",

    missions: [
      "Concevoir le projet lumière en dialogue avec le ou la chorégraphe.",
      "Élaborer les plans de feux et les fiches techniques pour chaque salle.",
      "Programmer les gradateurs et les équipements de régie : GrandMA, EOS, etc.",
      "Assurer les balances et les mises en lumière sur le plateau.",
      "Adapter le spectacle aux différentes scènes et configurations lors des tournées.",
    ],

    environnement: "Plateau de théâtre, régie lumière. Travail en collaboration étroite avec le ou la chorégraphe, le ou la régisseur.euse et les équipes techniques de chaque salle.",

    formation: "Formations à l'École Nationale des Techniciens du Spectacle (ENTS), BTS Métiers des Arts du Spectacle option régie lumière, formations privées. Habilitation électrique requise.",

    statut: "Artiste-auteur.e pour la conception lumière (droits sur la création), CDDU pour les périodes de montage, de répétition et de représentation. La double casquette conception/régie est fréquente.",

    competences: [
      "Maîtrise des équipements et logiciels de régie lumière.",
      "Sens artistique du volume, de la couleur et de la temporalité.",
      "Connaissance spécifique des contraintes de la danse : corps en mouvement, vitesse, espace.",
      "Capacité à dialoguer avec un.e artiste dans le processus de création.",
      "Lecture et production de plans de scène.",
    ],

    neConfondreAvec: [
      {
        titre: "Régisseur.euse",
        texte: "Le régisseur ou la régisseuse coordonne l'ensemble des techniques du spectacle. Le créateur ou la créatrice lumière conçoit spécifiquement l'éclairage comme un geste artistique, avec une responsabilité d'auteur.e sur cette dimension.",
        lien:  'regisseur',
      },
    ],
  },

  {
    id:          'costumier',
    nom:         'Costumier.ère',
    description: "Habille les corps, amplifie le propos chorégraphique, travaille avec les contraintes du mouvement et du plateau.",
    univers:     'image',

    definition: "En danse, le costume ne peut pas se permettre d'être beau sans être fonctionnel. Il doit se déplacer avec le corps, résister à la sueur et aux frottements, ne pas gêner l'amplitude, et parfois être portable pendant une heure sans broncher. Le ou la costumier.ère part de ces contraintes et les transforme en langage artistique, au service du propos chorégraphique.",

    missions: [
      "Concevoir les costumes en dialogue avec le ou la chorégraphe et la scénographie.",
      "Réaliser ou superviser la confection des pièces.",
      "Gérer les essayages et les ajustements avec les interprètes.",
      "Assurer l'entretien des costumes au fil des répétitions et des tournées.",
      "Respecter les contraintes budgétaires et les exigences du mouvement.",
    ],

    environnement: "Atelier de couture, plateau de répétition, théâtres, tournées. Les costumiers.ères travaillent pour des compagnies indépendantes, des opéras et des théâtres.",

    formation: "École Nationale Supérieure des Arts Décoratifs (ENSAD), École de la Chambre Syndicale de la Couture Parisienne, écoles de mode ou d'arts appliqués. Des spécialisations en costumes de scène existent dans certains établissements.",

    statut: "Artiste-auteur.e pour la conception, salarié.e ou CDDU pour la réalisation et le suivi en tournée.",

    competences: [
      "Maîtrise de la couture, de la patronnerie et des techniques de confection.",
      "Connaissance des contraintes spécifiques du mouvement dansé.",
      "Sens artistique et créativité au service d'un propos chorégraphique.",
      "Gestion d'un atelier et d'un budget de production.",
      "Capacité à collaborer dans une équipe artistique de création.",
    ],

    neConfondreAvec: [
      {
        titre: "Styliste",
        texte: "Le styliste ou la styliste travaille sur l'image publique d'un artiste, pour des contextes de communication ou de scène. Le costumier ou la costumière conçoit à partir des exigences dramaturgiques et chorégraphiques d'une oeuvre.",
        lien:  'styliste',
      },
    ],
  },

  {
    id:          'styliste',
    nom:         'Styliste',
    description: "Imagine les silhouettes et l'identité vestimentaire des artistes, en dialogue avec leur univers et les exigences du mouvement.",
    univers:     'image',
    tags:        ['Image', 'Costume', 'Scène', 'Clip', 'Tournée', 'Création artistique'],

    definition: "Le ou la styliste construit l'identité visuelle et vestimentaire d'un artiste ou d'une production. Ce n'est pas tout à fait la même chose que créer des costumes de scène. Le travail porte ici sur l'image : pour un clip, une séance photo, une tournée, une présence publique. Et en danse, la question du mouvement revient toujours : une tenue peut être magnifique et complètement inadaptée dès qu'on danse dedans.",

    missions: [
      "Définir l'identité visuelle d'un artiste ou d'une production.",
      "Sélectionner, assembler ou créer les tenues pour les séances photo, clips et scènes.",
      "Travailler en dialogue avec les photographes, vidéastes et équipes artistiques.",
      "Tenir compte des contraintes du mouvement lorsque la tenue sera portée en scène.",
      "Gérer les emprunts, les commandes et les retours auprès des marques et ateliers.",
    ],

    environnement: "Studio photo, plateau de tournage, scène. En freelance pour la plupart, avec des missions ponctuelles pour des artistes, des labels ou des compagnies.",

    formation: "École de mode (ESMOD, Studio Berçot, IFM), écoles d'arts appliqués, ou parcours autodidacte renforcé par l'expérience. La connaissance des contraintes scéniques s'acquiert sur le terrain.",

    statut: "Indépendant.e dans la plupart des cas, parfois salarié.e dans une agence ou un label.",

    competences: [
      "Sens aigu de l'image et de l'identité visuelle.",
      "Connaissance des matières, des coupes et des tendances.",
      "Compréhension des exigences du mouvement dansé.",
      "Sens du dialogue avec les artistes et les équipes créatives.",
      "Réseau auprès des marques, créateurs et ateliers.",
    ],

    neConfondreAvec: [
      {
        titre: "Costumier.ère",
        texte: "Le costumier ou la costumière conçoit à partir des exigences dramaturgiques et chorégraphiques d'un spectacle. Le ou la styliste travaille davantage sur l'image publique et l'identité visuelle d'un artiste.",
        lien:  'costumier',
      },
    ],
  },

  {
    id:          'videaste',
    nom:         'Vidéaste / Réalisateur.rice',
    description: "Crée les captations, les dispositifs vidéo scéniques, les films de danse. Document d'archive et oeuvre à part entière.",
    univers:     'image',

    definition: "Filmer la danse, c'est plus difficile qu'il n'y paraît. Le mouvement vit dans l'espace et dans le temps, deux dimensions que la caméra traduit imparfaitement si on ne fait pas les bons choix. Un.e vidéaste de danse peut intervenir de trois façons : en tant qu'archiviste (capte les spectacles), en tant que réalisateur.rice (crée des films de danse autonomes), ou en tant que co-créateur.rice (intègre la vidéo dans le spectacle lui-même). Souvent les trois à la fois, selon les projets.",

    missions: [
      "Réaliser des captations de spectacles, mono ou multicaméra, pour archive.",
      "Produire des films de danse : clips, courts-métrages, documentaires.",
      "Concevoir et intégrer des dispositifs vidéo dans les spectacles.",
      "Monter et livrer les rushes dans les délais.",
      "Gérer les droits d'auteur sur les oeuvres réalisées.",
    ],

    environnement: "Plateau de théâtre, studio de montage, tournées. En freelance pour la plupart, avec des relations régulières avec certaines compagnies ou institutions comme le Centre National de la Danse.",

    formation: "Écoles de cinéma (La Fémis, CLCF, ESEC), BTS audiovisuel, ou parcours autodidacte. La connaissance de la danse est un atout majeur, rarement transmis dans les écoles de cinéma : il s'acquiert souvent sur le terrain, au contact des compagnies.",

    statut: "Artiste-auteur.e pour les oeuvres réalisées, CDDU pour les missions de captation. Les droits sur une captation doivent faire l'objet d'un contrat explicite avec la compagnie : à vérifier avec la SACD.",

    competences: [
      "Maîtrise de la caméra et des techniques de prise de vue en conditions scéniques.",
      "Montage vidéo et sens du timing dans le mouvement dansé.",
      "Connaissance des formats de diffusion : streaming, broadcast, web.",
      "Gestion de projet audiovisuel.",
      "Relation de confiance avec les artistes filmé.es.",
    ],
  },

  {
    id:          'createur-contenu-danse',
    nom:         'Créateur.rice de contenu danse',
    description: "Imagine, produit et publie des contenus autour de la danse pour les réseaux sociaux, les médias, les artistes, les événements ou les marques.",
    univers:     'image',

    definition: "La danse a toujours existé avant que les réseaux apparaissent, mais les réseaux ont profondément changé la manière dont elle circule et dont les artistes se font connaître. Le créateur ou la créatrice de contenu danse conçoit des formats adaptés à chaque plateforme, avec un oeil artistique et une compréhension fine des codes numériques. Ce n'est pas simplement filmer une classe ou coller un hashtag : c'est raconter la danse d'une façon qui capte l'attention et donne envie de s'y intéresser. Le métier peut s'exercer en tant que prestataire pour d'autres artistes ou institutions, ou en construisant sa propre ligne éditoriale.",

    missions: [
      "Concevoir une ligne éditoriale cohérente autour de la danse : formats, ton, fréquence.",
      "Produire des contenus visuels et audiovisuels adaptés aux plateformes : Reels, TikTok, YouTube Shorts, posts.",
      "Collaborer avec des artistes, compagnies ou événements pour créer des contenus sur mesure.",
      "Gérer la publication, le calendrier éditorial et les interactions avec la communauté.",
      "Analyser les performances des contenus et ajuster la stratégie en conséquence.",
    ],

    environnement: "Travail en freelance ou au sein d'équipes de communication d'une compagnie, d'un festival ou d'une institution culturelle. Les projets peuvent être ponctuels (résidence, événement) ou s'inscrire dans un partenariat durable.",

    formation: "Aucun diplôme spécifique. Des formations en communication numérique, vidéo, photographie ou journalisme constituent de bonnes bases. La maîtrise des outils de montage (CapCut, Premiere, DaVinci), la connaissance de la danse et une présence active sur les plateformes sont souvent plus déterminantes que le parcours académique.",

    statut: "Freelance (auto-entrepreneur.e ou portage salarial), parfois salarié.e dans une structure culturelle. Les contrats varient selon les missions : forfait par projet, abonnement mensuel ou collaboration régulière. La rémunération est encore peu codifiée dans le secteur culturel.",

    competences: [
      "Maîtrise des plateformes sociales et de leurs algorithmes : TikTok, Instagram, YouTube.",
      "Capacités de tournage et de montage vidéo sur mobile et sur ordinateur.",
      "Sensibilité artistique et connaissance du milieu de la danse.",
      "Sens éditorial : savoir choisir un angle, écrire une légende, construire une narration.",
      "Autonomie et régularité dans la production de contenus.",
    ],

    neConfondreAvec: [
      {
        titre: "Influenceur.se danse",
        texte: "Le créateur ou la créatrice de contenu peut travailler pour le compte d'autres artistes ou organisations, sans nécessairement avoir une large audience personnelle. L'influenceur.se danse développe, lui ou elle, sa propre communauté et sa capacité de prescription.",
        lien:  'influenceur-danse',
      },
      {
        titre: "Créateur.rice UGC",
        texte: "Le créateur ou la créatrice UGC produit des contenus destinés à être publiés sur les comptes d'une marque ou d'une organisation, sans les diffuser sur ses propres réseaux.",
        lien:  'createur-ugc',
      },
    ],
  },

  {
    id:          'influenceur-danse',
    nom:         'Influenceur.se danse',
    description: "Développe une audience autour de son univers et de son expertise dans la danse, et peut collaborer avec des marques, institutions ou événements.",
    univers:     'image',

    definition: "Dans la danse comme ailleurs, certaines personnes ont construit une communauté qui leur fait confiance. L'influenceur.se danse ne se contente pas de publier des vidéos : il ou elle incarne un univers, un rapport à la danse, un point de vue. Cette position permet des collaborations avec des marques de vêtements, des événements, des écoles ou des institutions culturelles qui cherchent à toucher un public engagé. Ce n'est pas un métier réservé aux danseur.ses confirmé.es, mais il suppose d'avoir quelque chose à dire et la régularité de le dire.",

    missions: [
      "Développer et animer une communauté autour de son univers danse sur une ou plusieurs plateformes.",
      "Négocier et réaliser des collaborations avec des marques, des écoles ou des événements.",
      "Créer des contenus authentiques qui reflètent son positionnement et fidélisent son audience.",
      "Gérer les partenariats commerciaux dans le respect des obligations légales de transparence.",
      "Suivre les statistiques de son audience et adapter sa stratégie éditoriale.",
    ],

    environnement: "Activité principalement indépendante, à domicile et en déplacement selon les collaborations. Certains influenceur.ses travaillent avec des agences de talent qui gèrent leurs partenariats. D'autres cumulent avec une carrière artistique ou pédagogique.",

    formation: "Pas de formation dédiée. Une pratique sérieuse de la danse et une maîtrise des codes des réseaux sociaux constituent les deux piliers. Des notions de marketing, de communication et de droit (contrats, droit à l'image) sont utiles pour professionnaliser la démarche.",

    statut: "Indépendant.e, le plus souvent auto-entrepreneur.e. Les revenus proviennent des placements de produits, des partenariats, des contenus sponsorisés, mais aussi parfois des abonnements (Patreon, OnlyFans danse) ou des ateliers en ligne. La loi impose de mentionner explicitement le caractère commercial des contenus sponsorisés.",

    competences: [
      "Production de contenus vidéo engageants adaptés aux codes de chaque plateforme.",
      "Sens de la communauté : capacité à répondre, fédérer, animer.",
      "Maîtrise des fondamentaux du personal branding et du marketing d'influence.",
      "Connaissance des obligations légales liées à la publicité sur les réseaux sociaux.",
      "Authenticité et cohérence éditoriale sur la durée.",
    ],

    neConfondreAvec: [
      {
        titre: "Créateur.rice de contenu danse",
        texte: "Le créateur ou la créatrice de contenu peut produire pour d'autres, sans nécessairement avoir construit une audience personnelle. L'influenceur.se danse s'appuie précisément sur sa communauté et sa capacité de prescription.",
        lien:  'createur-contenu-danse',
      },
      {
        titre: "Créateur.rice UGC",
        texte: "Le créateur ou la créatrice UGC fournit des contenus à une marque sans les publier sur ses propres réseaux, indépendamment de la taille de son audience.",
        lien:  'createur-ugc',
      },
    ],
  },

  {
    id:          'createur-ugc',
    nom:         'Créateur.rice UGC',
    description: "Produit des contenus vidéo ou photo destinés aux réseaux sociaux d'une marque ou d'une organisation, sans nécessairement les publier auprès de sa propre communauté.",
    univers:     'image',

    definition: "L'UGC (User Generated Content) désigne des contenus produits par des personnes extérieures à une marque, dans un style authentique et non institutionnel, pour être publiés sur ses propres comptes. Dans la danse, ce modèle se développe : des marques de vêtements, des salles de cours, des événements ou des institutions cherchent des danseur.ses ou des créateurs.rices capables de produire des vidéos crédibles, naturelles, qui sonnent vrai. Le ou la créateur.rice UGC n'a pas besoin d'une grande audience, il ou elle a besoin d'un bon oeil et de savoir tourner.",

    missions: [
      "Produire des vidéos ou photos au format réseaux sociaux pour le compte d'une marque ou d'une organisation.",
      "S'approprier le brief créatif tout en apportant une touche authentique et personnelle.",
      "Livrer des contenus dans les formats et délais demandés.",
      "Signer un contrat de cession de droits pour les contenus produits.",
      "Construire un portfolio de références pour démarcher de nouveaux clients.",
    ],

    environnement: "Travail à distance ou en déplacement selon les briefs. Les clients sont variés : marques de sportswear, applications de cours en ligne, festivals, écoles de danse, institutions culturelles. Les missions peuvent être ponctuelles ou récurrentes.",

    formation: "Aucune formation spécifique. Une bonne maîtrise du tournage sur smartphone, du montage vertical et des codes visuels des réseaux sociaux suffit pour démarrer. Savoir danser est un atout évident dans ce secteur, mais pas toujours requis selon le type de contenu demandé.",

    statut: "Freelance ou auto-entrepreneur.e. La rémunération se fait au contenu livré, avec cession des droits d'usage incluse. Il est important de bien cadrer les droits dans chaque contrat : durée d'utilisation, plateformes autorisées, exclusivité éventuelle.",

    competences: [
      "Tournage et montage vidéo vertical, maîtrise des formats courts.",
      "Capacité à interpréter un brief et à produire un rendu authentique.",
      "Connaissance des codes visuels et sonores des réseaux sociaux.",
      "Notions de droit à l'image et de cession de droits.",
      "Autonomie, réactivité et sens du rendu client.",
    ],

    neConfondreAvec: [
      {
        titre: "Créateur.rice de contenu danse",
        texte: "Le créateur ou la créatrice de contenu développe souvent sa propre ligne éditoriale et peut travailler pour plusieurs types de clients. Le créateur ou la créatrice UGC produit spécifiquement pour les comptes d'une marque, sans diffusion sur ses propres réseaux.",
        lien:  'createur-contenu-danse',
      },
      {
        titre: "Influenceur.se danse",
        texte: "L'influenceur.se monétise son audience et sa capacité de prescription. Le créateur ou la créatrice UGC fournit des contenus à une marque indépendamment de sa propre visibilité en ligne.",
        lien:  'influenceur-danse',
      },
    ],
  },

  // ── Audiovisuel / tournage ────────────────────────────────────────────────

  {
    id:          'realisateur',
    nom:         'Réalisateur.rice',
    description: "Conçoit et dirige la vision artistique d'un film, d'un clip ou d'une captation de danse, de la préproduction au montage final.",
    univers:     'image',

    definition: "Réaliser un film de danse, c'est résoudre un problème fondamental : comment traduire un art du corps, du temps et de l'espace en images fixes sur un écran ? Il n'y a pas de réponse unique. Certain.es réalisateur.rices travaillent en immersion totale avec les compagnies, d'autres apportent une vision cinématographique extérieure. Les meilleur.es font les deux à la fois. Le secteur de la danse a besoin de réalisateur.rices dans de nombreux contextes : clips de danse, documentaires, captations scéniques, publicités impliquant des danseur.ses, films institutionnels pour les compagnies et les festivals.",

    missions: [
      "Développer un concept visuel en dialogue avec le ou la chorégraphe ou le commanditaire.",
      "Diriger l'équipe technique et artistique sur le plateau ou en studio.",
      "Superviser le tournage : cadrage, lumière, son, direction des interprètes.",
      "Conduire la postproduction : montage, étalonnage, mixage.",
      "Livrer une oeuvre cohérente avec le brief tout en imposant un regard personnel.",
    ],

    environnement: "Plateaux de tournage, studios, théâtres, extérieurs. Les missions varient selon les projets : clips musicaux, documentaires diffusés sur Arte ou France 2, captations pour la BNF ou le Centre National de la Danse, films de marque pour des équipementiers sportifs.",

    formation: "École de cinéma (La Fémis, CLCF, ESEC, Louis-Lumière) ou parcours autodidacte. Certains réalisateur.rices de danse ont d'abord travaillé comme assistant.es ou cadreur.ses. La connaissance du mouvement de danse, même partielle, est un atout déterminant.",

    statut: "Artiste-auteur.e pour les oeuvres originales (SACD), CDDU pour les missions de commande. Les contrats doivent préciser les droits d'auteur sur le film, en particulier quand il s'agit d'une captation d'un spectacle lui-même protégé.",

    competences: [
      "Vision artistique et narration visuelle dans un contexte de mouvement.",
      "Direction d'acteur.rices et d'interprètes danseur.ses.",
      "Maîtrise des codes du langage cinématographique.",
      "Gestion de plateau et coordination des équipes techniques.",
      "Connaissance des étapes de postproduction.",
    ],

    neConfondreAvec: [
      {
        titre: "Vidéaste / Réalisateur.rice",
        texte: "Le ou la vidéaste de danse intervient souvent seul.e, en mode captation ou réalisation légère. Le ou la réalisateur.rice au sens strict dirige une équipe structurée — chef.fe opérateur.rice, cadreur.ses, ingénieur.e du son — dans une production plus encadrée.",
        lien:  'videaste',
      },
    ],
  },

  {
    id:          'assistant-realisateur',
    nom:         'Assistant.e réalisateur.rice',
    description: "Coordonne le plateau pour que le ou la réalisateur.rice puisse se concentrer sur la mise en scène. Bras droit opérationnel de toute production.",
    univers:     'image',

    definition: "Sur un plateau, l'assistant.e réalisateur.rice est la personne qui fait exister le plan de travail. Il ou elle traduit la vision du ou de la réalisateur.rice en organisation concrète : qui est là, où, à quelle heure, avec quoi. Sans ce rôle, les journées de tournage dérapent, les scènes s'accumulent, les équipes tournent en rond. Dans le secteur de la danse, ce métier intervient sur les clips, les films institutionnels, les captations multicaméras structurées et les documentaires.",

    missions: [
      "Préparer et distribuer le plan de travail journalier à toute l'équipe.",
      "Gérer le plateau pendant le tournage : appels des acteur.rices, silences, reprises.",
      "Assurer la communication entre le ou la réalisateur.rice et les différents départements.",
      "Anticiper les besoins des scènes suivantes pour limiter les temps morts.",
      "Veiller au respect du planning et des conditions de travail sur le plateau.",
    ],

    environnement: "Plateaux de tournage, extérieurs, studios. Présent.e dès la préproduction et tout au long du tournage. Travaille en lien direct avec le ou la réalisateur.rice, le ou la directeur.rice de production et le ou la chef.fe opérateur.rice.",

    formation: "Formations professionnelles (ESRA, ENS Louis-Lumière, CLCF) ou entrée par le bas du plateau. Beaucoup d'assistant.es réalisateur.rices ont commencé comme stagiaires ou deuxièmes assistant.es. Une résistance physique et un sens de l'organisation hors pair sont indispensables.",

    statut: "CDDU intermittent du spectacle. La Convention collective de la production cinématographique régit les conditions de travail et les minima salariaux selon le budget du film.",

    competences: [
      "Organisation et gestion du temps en conditions de pression.",
      "Communication claire et ferme avec des équipes nombreuses.",
      "Connaissance du cadre réglementaire du tournage (sécurité, droit du travail).",
      "Capacité à anticiper et à résoudre les problèmes en temps réel.",
      "Sang-froid et capacité à prendre des décisions rapides.",
    ],
  },

  {
    id:          'cadreur',
    nom:         'Cadreur.se / Opérateur.rice caméra',
    description: "Opère la caméra sur le plateau, traduit les intentions du ou de la chef.fe opérateur.rice en images concrètes. Regard technique au coeur de chaque prise.",
    univers:     'image',

    definition: "Le ou la cadreur.se est celui ou celle dont l'oeil est collé à la caméra. Il ou elle opère selon les indications du ou de la directeur.rice de la photographie — mais c'est lui ou elle qui ressent le mouvement, qui anticipe le geste, qui choisit l'instant précis du raccord. Filmer la danse est une spécialité en soi : il faut comprendre la chorégraphie, sentir le rythme, savoir quand garder un plan large et quand serrer sur les pieds ou les mains. Un ou une bon.ne cadreur.se de danse est rare.",

    missions: [
      "Opérer la caméra selon les instructions du ou de la directeur.rice de la photographie.",
      "Cadrer les plans en tenant compte du mouvement chorégraphique.",
      "Régler les paramètres de prise de vue : focale, ouverture, sensibilité.",
      "Travailler en coordination avec les autres cadreur.ses en configuration multicaméra.",
      "Assurer la maintenance et la vérification du matériel caméra.",
    ],

    environnement: "Plateaux de tournage, théâtres, extérieurs. Les configurations multicaméras sont fréquentes dans les captations de spectacle. Travaille sous la supervision du ou de la directeur.rice de la photographie.",

    formation: "BTS audiovisuel, formations aux écoles de cinéma, ou montée en compétence sur le terrain. La maîtrise des caméras professionnelles (Sony Venice, RED, ARRI) et la connaissance de la danse sont les deux piliers du métier dans ce secteur.",

    statut: "CDDU intermittent du spectacle ou du cinéma selon le contexte. Les tarifs sont régis par les conventions collectives de la production audiovisuelle ou cinématographique.",

    competences: [
      "Maîtrise technique des caméras professionnelles et de leurs accessoires.",
      "Sens du cadre, de la composition et du mouvement dans l'espace.",
      "Réactivité et anticipation dans les contextes de danse en direct.",
      "Coordination avec les autres postes techniques du plateau.",
      "Résistance physique lors des longues journées de tournage.",
    ],

    neConfondreAvec: [
      {
        titre: "Directeur.rice de la photographie",
        texte: "Le ou la directeur.rice de la photographie conçoit le projet visuel et lumière d'un film. Le ou la cadreur.se opère la caméra pour mettre en oeuvre cette vision, souvent sous sa supervision directe.",
        lien:  'directeur-photo',
      },
    ],
  },

  {
    id:          'directeur-photo',
    nom:         'Directeur.rice de la photographie',
    description: "Conçoit l'image d'un film ou d'un clip : lumière, cadrage, palette visuelle. Traduit la vision du ou de la réalisateur.rice en choix techniques et esthétiques.",
    univers:     'image',

    definition: "La photographie d'un film, c'est l'ensemble des décisions visuelles qui font que l'image ressemble à quelque chose et pas à autre chose. Le ou la directeur.rice de la photographie — aussi appelé.e chef.fe opérateur.rice — est responsable de cet univers visuel de bout en bout. Dans le contexte de la danse, cela implique de comprendre les contraintes du mouvement : la lumière doit sublimer les corps sans les trahir, les cadres doivent respirer avec la chorégraphie, la palette doit s'accorder avec l'intention artistique.",

    missions: [
      "Définir le concept visuel d'un film en collaboration avec le ou la réalisateur.rice.",
      "Concevoir et superviser l'éclairage de chaque séquence.",
      "Diriger les cadreur.ses et les technicien.nes lumière sur le plateau.",
      "Choisir les caméras, optiques et accessoires adaptés au projet.",
      "Suivre l'étalonnage pour garantir la cohérence visuelle du film.",
    ],

    environnement: "Plateaux de tournage, extérieurs, studios. Les projets dans le secteur de la danse incluent les clips, les documentaires, les captations artistiques et les films de marque pour des équipementiers ou des institutions culturelles.",

    formation: "Écoles de cinéma (La Fémis, CLCF, Louis-Lumière, ESEC) ou parcours terrain. La progression classique passe par assistant.e caméra, cadreur.se puis chef.fe opérateur.rice. L'AFSI (Association Française des directeurs de la photographie Cinématographique) accompagne les professionnel.les du secteur.",

    statut: "CDDU intermittent du cinéma ou de l'audiovisuel. Artiste-auteur.e pour les projets à dimension artistique. Les minima sont définis par la convention collective de la production cinématographique.",

    competences: [
      "Maîtrise de la lumière en intérieur et en extérieur : sources, températures, diffusion.",
      "Vision artistique et sens de la composition photographique.",
      "Connaissance approfondie des caméras, optiques et supports de prise de vue.",
      "Leadership et communication avec les équipes techniques.",
      "Connaissance du mouvement dansé pour anticiper les besoins de cadrage.",
    ],

    neConfondreAvec: [
      {
        titre: "Cadreur.se / Opérateur.rice caméra",
        texte: "Le ou la cadreur.se opère la caméra selon les indications du ou de la directeur.rice de la photographie, qui conçoit et supervise l'ensemble de la vision visuelle du film.",
        lien:  'cadreur',
      },
    ],
  },

  {
    id:          'assistant-camera',
    nom:         'Assistant.e caméra',
    description: "Gère le matériel caméra sur le plateau, assure la mise au point et le clap. Poste technique indispensable à toute production structurée.",
    univers:     'image',

    definition: "Sur un plateau de tournage, l'assistant.e caméra est souvent le ou la premier.ère arrivé.e et le ou la dernier.ère parti.e. C'est lui ou elle qui prépare et range le matériel, qui fait la mise au point lors du tournage, qui gère les claps et les rapports de tournage. Un rôle discret mais fondamental : sans une mise au point précise sur des danseur.ses en mouvement rapide, les plans sont inutilisables. La précision est la valeur cardinale de ce poste.",

    missions: [
      "Préparer, entretenir et ranger le matériel caméra avant et après chaque journée de tournage.",
      "Réaliser la mise au point lors des prises, en particulier sur les sujets en mouvement.",
      "Gérer les claps et les rapports de tournage pour faciliter le montage.",
      "Télécharger et sauvegarder les rushes en coordination avec la postproduction.",
      "Assister le ou la cadreur.se et le ou la directeur.rice de la photographie dans leurs besoins.",
    ],

    environnement: "Plateaux de tournage, extérieurs, studios. Poste physiquement exigeant, avec de longues heures debout. Travaille sous la supervision directe du ou de la cadreur.se ou du ou de la directeur.rice de la photographie.",

    formation: "BTS audiovisuel, formations techniques aux écoles de cinéma, ou entrée par le terrain comme stagiaire plateau. La maîtrise des caméras professionnelles, de la mise au point manuelle et des outils de gestion des données (DIT) est essentielle.",

    statut: "CDDU intermittent de l'audiovisuel ou du cinéma. Souvent un poste d'entrée dans le secteur, qui permet d'évoluer vers cadreur.se puis directeur.rice de la photographie.",

    competences: [
      "Précision technique de la mise au point sur des sujets en mouvement.",
      "Connaissance approfondie du matériel caméra et optique.",
      "Rigueur dans la gestion des rapports de tournage et des données.",
      "Réactivité et discrétion sur le plateau.",
      "Sens de l'organisation et anticipation des besoins.",
    ],
  },

  {
    id:          'monteur-video',
    nom:         'Monteur.se vidéo',
    description: "Assemble les rushes pour construire le film final. Le montage est le dernier acte de réécriture : le rythme, le sens et l'émotion se jouent ici.",
    univers:     'image',

    definition: "Le montage n'est pas un collage de rushes dans l'ordre du plan de travail. C'est une réécriture. Le ou la monteur.se décide de l'ordre des plans, de leur durée, de ce qu'on voit et de ce qu'on ne verra jamais. Dans le contexte de la danse, le montage a une contrainte supplémentaire : il doit respecter — ou choisir d'ignorer consciemment — la logique du mouvement chorégraphique. Couper dans un mouvement sans en perdre l'élan, c'est un art.",

    missions: [
      "Visionner et sélectionner les rushes en collaboration avec le ou la réalisateur.rice.",
      "Construire un premier montage (rough cut), puis affiner jusqu'à la version finale.",
      "Travailler le rythme des plans en cohérence avec la musique ou la chorégraphie.",
      "Intégrer les effets, les transitions, les incrustations de texte selon les besoins.",
      "Exporter les fichiers dans les formats adaptés aux différentes plateformes de diffusion.",
    ],

    environnement: "Studio de montage ou domicile. Travail souvent solitaire, en dialogue étroit avec le ou la réalisateur.rice. Les outils standard sont Premiere Pro, Final Cut Pro ou DaVinci Resolve.",

    formation: "BTS audiovisuel, licences professionnelles montage, formations continues. Ou autodidacte avec un solide portfolio. La connaissance de la danse permet de monter avec intelligence, sans casser les lignes de force d'une séquence.",

    statut: "Freelance ou salarié.e en postproduction. La rémunération varie selon la durée du projet, le type de production (clip, documentaire, film) et le niveau de responsabilité.",

    competences: [
      "Maîtrise des logiciels de montage : Premiere Pro, Final Cut Pro, DaVinci Resolve.",
      "Sens du rythme et de la narration visuelle.",
      "Capacité à travailler de longues heures sur écran avec une concentration soutenue.",
      "Dialogue créatif avec le ou la réalisateur.rice.",
      "Connaissance des formats et codecs pour l'export et la diffusion.",
    ],

    neConfondreAvec: [
      {
        titre: "Étalonneur.se",
        texte: "Le ou la monteur.se construit la structure et le rythme du film. L'étalonneur.se intervient ensuite pour corriger et créer l'univers colorimétrique de chaque séquence.",
        lien:  'etalonneur',
      },
    ],
  },

  {
    id:          'etalonneur',
    nom:         'Étalonneur.se',
    description: "Façonne la couleur et la lumière de chaque plan pour créer un univers visuel cohérent. Dernière main avant la diffusion.",
    univers:     'image',

    definition: "L'étalonnage est souvent invisible — et c'est exactement ce qu'il doit être. L'étalonneur.se travaille plan par plan pour corriger les différences d'exposition, unifier les sources de lumière, créer une atmosphère colorimétrique. Dans les films de danse, l'étalonnage peut jouer un rôle dramaturgique fort : réchauffer une scène intime, refroidir un solo contemporain, accentuer le contraste d'un battle urbain. C'est un métier de précision autant que de sensibilité artistique.",

    missions: [
      "Corriger les défauts d'exposition, de balance des blancs et de contraste plan par plan.",
      "Créer une identité colorimétrique cohérente sur l'ensemble du film.",
      "Travailler en dialogue avec le ou la directeur.rice de la photographie et le ou la réalisateur.rice.",
      "Maîtriser les outils d'étalonnage professionnels et les formats de fichiers associés.",
      "Exporter les masters finaux dans les formats requis selon les plateformes.",
    ],

    environnement: "Suite d'étalonnage calibrée (moniteur de référence, environnement contrôlé). Travail en studio de postproduction ou à domicile avec un équipement professionnel. DaVinci Resolve est l'outil dominant du secteur.",

    formation: "Formations spécialisées en postproduction ou étalonnage (CLCF, ENS Louis-Lumière, ESEC). Beaucoup d'étalonneur.ses sont autodidactes ou issus du montage. La maîtrise de DaVinci Resolve est quasi-universelle dans le métier.",

    statut: "Freelance ou salarié.e en postproduction. Les tarifs varient selon la durée et le type de projet. L'étalonnage est souvent la dernière étape facturée d'une chaîne de postproduction.",

    competences: [
      "Maîtrise de DaVinci Resolve ou d'outils équivalents.",
      "Perception fine des nuances colorimétriques et compréhension de la lumière.",
      "Connaissance des formats de fichier et des workflows de postproduction.",
      "Dialogue créatif avec le ou la réalisateur.rice et le ou la directeur.rice de la photographie.",
      "Rigueur et précision dans un travail de longue durée.",
    ],

    neConfondreAvec: [
      {
        titre: "Monteur.se vidéo",
        texte: "Le ou la monteur.se structure le film et en construit le rythme. L'étalonneur.se intervient après le montage pour finaliser l'univers visuel et préparer la diffusion.",
        lien:  'monteur-video',
      },
    ],
  },

  {
    id:          'motion-designer',
    nom:         'Motion designer',
    description: "Crée des animations graphiques pour les films, les clips, les plateaux et les supports de communication. Là où le graphisme se met en mouvement.",
    univers:     'image',

    definition: "Le motion design est devenu omniprésent dans les productions visuelles liées à la danse : génériques de clips, habillages de captations télévisées, affiches animées pour les réseaux sociaux, incrustations dans les spectacles. Le ou la motion designer transforme des éléments graphiques statiques en animations fluides, rythmées, expressives. Dans le secteur de la danse, il ou elle travaille souvent en lien avec des directeur.rices artistiques ou des réalisateur.rices pour créer des univers visuels cohérents.",

    missions: [
      "Concevoir et animer des éléments graphiques pour des films, clips et supports numériques.",
      "Créer des habillages visuels pour les captations ou les diffusions.",
      "Collaborer avec les directeur.rices artistiques pour intégrer les animations dans une charte graphique.",
      "Produire des contenus pour les réseaux sociaux : stories animées, teasers, génériques.",
      "Livrer les fichiers dans les formats adaptés à chaque contexte de diffusion.",
    ],

    environnement: "Studio, agence de communication, ou travail en freelance depuis son domicile. Les projets varient : production audiovisuelle, communication culturelle, événementiel, plateformes numériques.",

    formation: "Écoles de design ou de communication visuelle (ESAG Penninghen, Gobelins, ENSCI). Maîtrise indispensable d'After Effects, souvent couplée à Cinema 4D ou Blender pour les éléments 3D.",

    statut: "Freelance (très répandu) ou salarié.e en agence ou en production. La rémunération dépend de la complexité des animations, du nombre de secondes à produire et des délais imposés.",

    competences: [
      "Maîtrise d'After Effects et des logiciels de motion design associés.",
      "Sens du rythme et de l'animation en lien avec la musique.",
      "Compétences en graphisme et en typographie.",
      "Connaissance des formats de livraison pour la diffusion et le web.",
      "Capacité à travailler sur des projets artistiques avec des contraintes fortes de délai.",
    ],
  },

  {
    id:          'operateur-steadicam',
    nom:         'Opérateur.rice steadicam',
    description: "Opère un système de stabilisation caméra pour produire des plans fluides et dynamiques sans trépied ni rail. Technicité et sens du mouvement réunis.",
    univers:     'image',

    definition: "Le steadicam est un harnais qui stabilise la caméra malgré le mouvement de son opérateur.rice. La résultante est une image qui accompagne le mouvement dansé avec une fluidité impossible autrement : on peut suivre un.e danseur.se à 30 cm, tourner autour d'elle ou de lui, traverser tout un plateau en une seule prise. C'est un outil qui colle physiquement à l'énergie de la danse. Les opérateur.rices steadicam spécialisé.es en danse sont très recherché.es pour les clips, les émissions télévisées et les captations scéniques.",

    missions: [
      "Opérer le steadicam lors des tournages pour produire des plans d'accompagnement fluides.",
      "Préparer et régler l'équipement selon la caméra et les contraintes du plan.",
      "Travailler en coordination étroite avec le ou la cadreur.se et le ou la directeur.rice de la photographie.",
      "Anticiper les déplacements des danseur.ses pour ne jamais perdre le mouvement.",
      "Assurer la sécurité des équipes et des interprètes lors des déplacements complexes.",
    ],

    environnement: "Plateaux de tournage, scènes de théâtre, extérieurs. La danse offre l'un des contextes les plus exigeants pour le steadicam : les mouvements sont imprévisibles, l'espace peut être réduit et la précision est absolue.",

    formation: "Pas de formation initiale spécifique. La plupart des opérateur.rices steadicam sont issu.es du cadrage et se sont spécialisé.es par la pratique. La certification Steadicam est proposée par plusieurs organismes professionnels en Europe.",

    statut: "CDDU intermittent de l'audiovisuel. Souvent en freelance, avec un matériel personnel qui représente un investissement conséquent. Les tarifs incluent généralement la location du steadicam.",

    competences: [
      "Maîtrise technique du steadicam et de ses réglages selon la caméra.",
      "Endurance physique et sens de l'équilibre pour les longues prises.",
      "Anticipation du mouvement chorégraphique.",
      "Coordination avec l'équipe caméra et les équipes de plateau.",
      "Sécurité : conscience permanente de l'espace et des autres lors des déplacements.",
    ],
  },

  {
    id:          'pilote-drone',
    nom:         'Pilote de drone / Télépilote',
    description: "Opère un drone pour capturer des images aériennes et dynamiques de spectacles, tournages ou événements de danse en extérieur.",
    univers:     'image',

    definition: "Le drone a ouvert des points de vue sur la danse qui n'existaient pas avant : vue en plongée sur un flash mob, survol d'un plateau de tournage en extérieur, plan aérien d'une formation de danseur.ses sur une plage ou dans une forêt. Le ou la pilote de drone — ou télépilote — est un.e spécialiste de la prise de vue aérienne, soumis.e à une réglementation stricte. Dans le secteur culturel, les demandes sont en hausse pour les clips, les captations événementielles et les films de compagnie.",

    missions: [
      "Planifier et réaliser les prises de vue aériennes dans le cadre des autorisations réglementaires.",
      "Adapter les trajectoires du drone à la chorégraphie ou aux contraintes du tournage.",
      "Coordonner avec le ou la réalisateur.rice et le ou la directeur.rice de la photographie.",
      "Assurer la sécurité des équipes, des interprètes et du public lors des vols.",
      "Livrer les rushes en qualité adaptée aux besoins de la postproduction.",
    ],

    environnement: "Principalement en extérieur, avec des contraintes réglementaires liées aux espaces aériens, aux zones habitées et aux autorisations préfectorales. Certaines prises en intérieur sont possibles avec des drones de petite taille en conditions contrôlées.",

    formation: "Attestation de formation télépilote (ENAC) et certification selon la catégorie de vol (A1/A3, A2, STS). Des modules pratiques de cadrage et de prise de vue complètent la formation réglementaire.",

    statut: "Freelance en grande majorité. La possession d'un drone professionnel représente un investissement significatif. Les tarifs incluent généralement la location du matériel et la gestion administrative des autorisations de vol.",

    competences: [
      "Maîtrise du pilotage de drone et connaissance approfondie de la réglementation DGAC.",
      "Sens du cadrage aérien et anticipation des mouvements au sol.",
      "Gestion des conditions météorologiques et des risques en vol.",
      "Coordination avec l'équipe de tournage et les services de sécurité.",
      "Post-traitement des images aériennes pour la livraison en postproduction.",
    ],
  },

  // ── Photographie / image fixe ─────────────────────────────────────────────

  {
    id:          'photographe-spectacle',
    nom:         'Photographe de spectacle',
    description: "Documente les représentations scéniques pour les théâtres, festivals et compagnies. Images destinées à la presse, aux dossiers et aux archives.",
    univers:     'image',

    definition: "La photographie de spectacle est une discipline à part : les conditions sont souvent difficiles (lumière de scène faible et contrastée, impossibilité d'utiliser le flash, mouvement constant), et les images doivent fonctionner à deux niveaux — comme document fidèle du spectacle, et comme image forte qui donne envie d'y aller. Les théâtres, festivals et compagnies font appel à des photographes de spectacle pour leurs dossiers de presse, leurs programmes, leurs archives et leur communication.",

    missions: [
      "Photographier les répétitions en costume (filage) ou les représentations sans flash.",
      "Livrer des images dans les délais convenus, retouchées et prêtes à l'emploi.",
      "Adapter son travail aux contraintes de chaque salle : accessibilité, lumière, régie.",
      "Gérer les droits d'auteur sur les images et les contrats de cession d'usage.",
      "Constituer et entretenir une archive photographique par spectacle.",
    ],

    environnement: "Théâtres, opéras, festivals, salles de danse. Travail essentiellement en soirée ou lors des filages en journée. La relation avec les équipes artistiques et les directeur.rices de production est centrale.",

    formation: "Diplôme de photographie (Gobelins, ENSBA, ENSP) ou parcours autodidacte reconnu par le portfolio. Certains photographes de spectacle ont d'abord été techniciens.nes de scène ou assistant.es photographes.",

    statut: "Artiste-auteur.e inscrit.e à la Maison des artistes. Les contrats doivent préciser les conditions d'usage des images : presse, communication, réseaux sociaux, droits d'archives.",

    competences: [
      "Maîtrise de la photographie en basse lumière sans flash.",
      "Réactivité et sens du timing dans un contexte de mouvement constant.",
      "Connaissance des esthétiques scéniques et de la lumière de spectacle.",
      "Post-traitement : Lightroom, Photoshop.",
      "Gestion des droits d'auteur et des contrats de cession.",
    ],

    neConfondreAvec: [
      {
        titre: "Photographe de danse",
        texte: "Le ou la photographe de danse (dans la section Accompagner) travaille davantage sur les portraits, les reportages de répétition et les productions pour les dossiers de compagnie. Le ou la photographe de spectacle est mandaté.e spécifiquement pour couvrir les représentations scéniques.",
        lien:  'photographe',
      },
    ],
  },

  {
    id:          'retoucheur-photo',
    nom:         'Retoucheur.se photo',
    description: "Corrige, améliore et retravaille les images photographiques après la prise de vue. Maillon essentiel entre le shooting et la diffusion.",
    univers:     'image',

    definition: "La retouche photo va bien au-delà du simple « effacement des imperfections ». Un.e bon.ne retoucheur.se travaille l'image dans sa globalité : équilibre des couleurs, qualité de la lumière sur les corps, rendu des textures des costumes, cohérence entre plusieurs photos d'une même série. Dans le secteur de la danse, la retouche intervient sur les shootings de compagnie, les portraits d'artistes, les visuels de campagne publicitaire et les images éditoriales pour la presse ou les réseaux sociaux.",

    missions: [
      "Corriger l'exposition, le contraste et la balance des couleurs sur les images livrées.",
      "Réaliser les retouches de peau et de corps en restant fidèle à l'identité des artistes.",
      "Assurer la cohérence colorimétrique sur l'ensemble d'une série d'images.",
      "Optimiser les images pour les différents formats de diffusion : print, web, réseaux sociaux.",
      "Respecter les délais de livraison et les chartes graphiques des commanditaires.",
    ],

    environnement: "Travail principalement en studio ou à domicile, sur ordinateur calibré. Outils dominants : Photoshop pour la retouche fine, Lightroom pour le traitement de séries.",

    formation: "Formation en photographie, arts graphiques ou autodidacte. La maîtrise de Photoshop et Lightroom est indispensable. L'expérience du shooting et la connaissance du corps en mouvement constituent de vrais atouts.",

    statut: "Freelance ou salarié.e dans une agence de production, un studio photo ou une agence de communication. Les tarifs sont souvent définis à l'image ou à l'heure selon la complexité du travail.",

    competences: [
      "Maîtrise de Photoshop, Lightroom et des outils de retouche professionnels.",
      "Oeil colorimétrique précis et sensibilité artistique.",
      "Rigueur et rapidité pour traiter des séries importantes.",
      "Respect de l'identité des artistes et des directives créatives.",
      "Connaissance des formats et résolutions pour les différents supports.",
    ],
  },

  {
    id:          'directeur-artistique',
    nom:         'Directeur.rice artistique',
    description: "Définit et supervise l'identité visuelle d'un projet, d'une campagne ou d'une organisation. Garant.e de la cohérence esthétique de bout en bout.",
    univers:     'image',

    definition: "Le ou la directeur.rice artistique — souvent appelé.e DA — est la personne qui décide de ce à quoi quelque chose doit ressembler, et qui s'assure que tout le monde travaille dans ce sens. Dans le secteur de la danse, ce rôle apparaît à plusieurs niveaux : direction artistique d'un clip ou d'une campagne de communication, identité visuelle d'un festival ou d'une compagnie, habillage d'une émission télévisée dédiée à la danse. C'est un rôle de vision autant que d'organisation.",

    missions: [
      "Définir le concept visuel d'un projet : moodboard, charte graphique, références esthétiques.",
      "Diriger et coordonner les équipes créatives : photographes, vidéastes, graphistes, stylistes.",
      "Superviser la production des visuels pour garantir la cohérence avec le brief.",
      "Arbitrer les choix créatifs en phase de production et de postproduction.",
      "Présenter les choix artistiques aux commanditaires et défendre les orientations retenues.",
    ],

    environnement: "Agences de communication, studios de production, institutions culturelles, compagnies de danse, festivals. Travail en mode projet avec des équipes créatives pluridisciplinaires.",

    formation: "Écoles d'art et de design (ESAG Penninghen, ENSAD, ESAD), formations en communication visuelle ou graphisme. L'expérience de terrain en tant que graphiste, photographe ou concepteur.rice est souvent le meilleur tremplin.",

    statut: "Salarié.e en agence ou en institution, ou freelance sur des projets. Les responsabilités sont importantes et la rémunération reflète le niveau de coordination et de décision attendu.",

    competences: [
      "Vision artistique claire et capacité à la transmettre à des équipes techniques.",
      "Culture visuelle étendue : photographie, cinéma, graphisme, mode, art contemporain.",
      "Maîtrise des outils de création (Suite Adobe) et connaissance des contraintes de production.",
      "Leadership et aptitude à arbitrer dans des contextes créatifs tendus.",
      "Connaissance du secteur culturel et de ses contraintes budgétaires spécifiques.",
    ],
  },

  // ── Beauté / apparence ────────────────────────────────────────────────────

  {
    id:          'maquilleur',
    nom:         'Maquilleur.se',
    description: "Crée et applique le maquillage des artistes pour la scène, les tournages et les shootings. Transforme les visages en accord avec la vision artistique.",
    univers:     'image',

    definition: "Le maquillage pour la danse a ses propres contraintes. Les corps bougent, transpirent, sont vus de loin sur scène et de très près sur les écrans. Il faut des techniques qui tiennent, des produits adaptés à l'effort physique, et une compréhension de la manière dont la lumière de scène ou la caméra transforme un teint. Le ou la maquilleur.se intervient sur des contextes très variés dans l'écosystème de la danse : spectacles scéniques, clips musicaux, shootings de presse, émissions télévisées et publicités.",

    missions: [
      "Réaliser les maquillages des artistes selon les indications du ou de la réalisateur.rice ou du ou de la chorégraphe.",
      "Adapter les techniques selon le contexte : scène, caméra HD, extérieur, conditions climatiques.",
      "Assurer les retouches entre les prises ou entre les tableaux d'un spectacle.",
      "Travailler avec les maquillages de transformation pour les spectacles à fort contenu visuel.",
      "Gérer son matériel, son stock et son hygiène avec rigueur.",
    ],

    environnement: "Loges de théâtre, plateaux de tournage, studios photo. Le travail s'effectue souvent sous contrainte de temps, en loge partagée avec d'autres artistes. Relation de proximité physique et de confiance avec les interprètes.",

    formation: "CAP Esthétique, BP Arts du maquillage, ou formations professionnelles en maquillage artistique (École de Camondo, Studio Make-Up Designory). L'expérience de plateau est déterminante.",

    statut: "CDDU intermittent du spectacle ou freelance pour les tournages audiovisuels. Les tarifs varient selon le type de prestation : spectacle (à la date), tournage (à la journée), shooting (à la demi-journée).",

    competences: [
      "Maîtrise des techniques de maquillage scénique et pour la caméra.",
      "Connaissance des produits adaptés à l'effort physique et à la transpiration.",
      "Rapidité d'exécution et capacité à gérer plusieurs artistes simultanément.",
      "Hygiène irréprochable et rigueur dans l'entretien du matériel.",
      "Sens de la relation et discrétion en loge.",
    ],

    neConfondreAvec: [
      {
        titre: "Coiffeur.se / Hair stylist",
        texte: "Le ou la maquilleur.se travaille sur le visage. Le ou la coiffeur.se ou hair stylist intervient sur la chevelure. Dans les petites productions, ces deux rôles sont souvent assurés par la même personne.",
        lien:  'coiffeur',
      },
    ],
  },

  {
    id:          'coiffeur',
    nom:         'Coiffeur.se / Hair stylist',
    description: "Réalise et entretient les coiffures des artistes pour la scène et les tournages. L'apparence de la chevelure est partie intégrante de l'identité visuelle d'un spectacle.",
    univers:     'image',

    definition: "Dans les spectacles de danse, les coiffures ne doivent pas seulement être belles : elles doivent tenir. À travers les sauts, les tours, les portés, le contact avec le sol, les coiffures sont soumises à des contraintes que la plupart des coiffeur.ses ne rencontrent pas en salon. Le ou la coiffeur.se ou hair stylist sur plateau ou en loge connaît ces contraintes et sait y répondre. Sur les tournages de clips et les shootings, le rôle est davantage artistique : créer une identité visuelle forte en accord avec la direction artistique.",

    missions: [
      "Réaliser et fixer les coiffures des artistes pour la scène ou le tournage.",
      "Adapter les coiffures aux contraintes physiques de la danse : fixation, tenue à l'effort.",
      "Assurer les retouches entre les prises ou entre les représentations.",
      "Travailler avec des extensions, postiches ou accessoires capillaires selon les besoins artistiques.",
      "Entretenir et gérer son matériel avec rigueur.",
    ],

    environnement: "Loges de théâtre, plateaux de tournage, studios photo. Souvent en lien avec le ou la maquilleur.se et le ou la styliste pour créer un univers visuel cohérent.",

    formation: "CAP Coiffure, BP Coiffure, ou formations spécialisées en coiffure artistique et spectacle. L'expérience de plateau — souvent acquise en assistant.at — est décisive.",

    statut: "CDDU intermittent du spectacle ou freelance. Peut exercer en parallèle en salon. La tarification suit les mêmes logiques que le maquillage : à la date pour le spectacle, à la journée pour les tournages.",

    competences: [
      "Maîtrise des techniques de coiffure de scène : chignons, tresses, bouclages, lissages durables.",
      "Connaissance des produits de fixation adaptés à l'effort physique intense.",
      "Rapidité et précision lors des préparations collectives en loge.",
      "Sens artistique pour les coiffures de création en accord avec la direction artistique.",
      "Aptitude à travailler en équipe avec le ou la maquilleur.se et le ou la styliste.",
    ],

    neConfondreAvec: [
      {
        titre: "Maquilleur.se",
        texte: "Le ou la maquilleur.se se concentre sur le visage. Le ou la coiffeur.se travaille la chevelure. Ces deux rôles sont complémentaires et souvent exercés par des professionnel.les différent.es sauf dans les petites productions.",
        lien:  'maquilleur',
      },
    ],
  },

  {
    id:          'habilleur',
    nom:         'Habilleur.se',
    description: "Aide les artistes à s'habiller et à changer de costume en coulisses pendant les spectacles. Poste discret et indispensable à la fluidité des représentations.",
    univers:     'image',

    definition: "Entre deux tableaux, le changement de costume peut durer trente secondes. L'habilleur.se est là pour que ça ne se voie pas : il ou elle connaît chaque costume, chaque fermeture, chaque accessoire. Il ou elle prépare tout avant le spectacle, suit le conducteur technique, est à la bonne place au bon moment. C'est un métier de coulisses, mais sans lui ou elle, les spectacles qui impliquent plusieurs tenues seraient impossibles à tenir sur la durée d'une tournée.",

    missions: [
      "Préparer les costumes et les accessoires avant chaque représentation.",
      "Aider les artistes à s'habiller et à changer de tenue dans les délais impartis.",
      "Entretenir les costumes : réparations d'urgence, nettoyage, stockage.",
      "Travailler en lien avec le ou la costumier.ère pour signaler les besoins d'ajustement.",
      "Assurer la traçabilité et le rangement du vestiaire lors des tournées.",
    ],

    environnement: "Coulisses des théâtres, loges, camions de tournée. Travail en soirée et le week-end, en déplacement lors des tournées. Relation de confiance avec les artistes, qui partagent avec l'habilleur.se des moments de vulnérabilité entre les tableaux.",

    formation: "Pas de formation académique spécifique. Beaucoup d'habilleur.ses viennent du textile, de la couture ou du costume. L'entrée dans le métier se fait souvent par les compagnies en tant que stagiaire ou assistant.e costumier.ère.",

    statut: "CDDU intermittent du spectacle. Souvent attaché.e à une compagnie pour une tournée ou une résidence. Les conditions de travail sont régies par la convention collective des entreprises du spectacle vivant.",

    competences: [
      "Connaissance des costumes et de leur entretien : textiles, lavage, réparations simples.",
      "Rapidité et calme sous pression lors des changements éclair.",
      "Discrétion absolue en coulisses.",
      "Sens de l'organisation et rigueur dans la gestion du vestiaire.",
      "Relation bienveillante et discrète avec les artistes.",
    ],

    neConfondreAvec: [
      {
        titre: "Costumier.ère",
        texte: "Le ou la costumier.ère conçoit, fabrique et gère les costumes du spectacle. L'habilleur.se assiste les artistes lors des représentations pour les changements de tenue en coulisses.",
        lien:  'costumier',
      },
    ],
  },

  // ── Scène / lumière / technique ───────────────────────────────────────────

  {
    id:          'regisseur-lumiere',
    nom:         'Régisseur.se lumière',
    description: "Opère la console lumière lors des représentations et s'assure que le projet lumineux du créateur.rice est reproduit fidèlement soir après soir.",
    univers:     'image',

    definition: "Il y a une différence fondamentale entre concevoir une lumière et l'opérer. Le ou la créateur.rice lumière invente. Le ou la régisseur.se lumière reproduit — avec fidélité, dans des salles différentes, avec des équipes différentes, parfois en improvisant sur des imprévus techniques. Ce n'est pas un rôle d'exécution passive : c'est un rôle de mémoire vivante du spectacle, avec une responsabilité artistique réelle à chaque représentation.",

    missions: [
      "Programmer et opérer la console lumière lors des représentations.",
      "Assurer l'implantation lumière dans chaque salle d'accueil selon la fiche technique.",
      "Coordonner avec le ou la régisseur.se son et le ou la régisseur.se plateau.",
      "Effectuer les corrections et les adaptations nécessaires à chaque salle.",
      "Former les technicien.nes lumière locaux.ales lors des tournées.",
    ],

    environnement: "Théâtres, festivals, tournées. En régie lumière pendant les représentations, sur le plateau pendant les montages. Travail en lien étroit avec le ou la créateur.rice lumière qui délègue la conduite du spectacle.",

    formation: "DUT techniques de scène, BTS, formations professionnelles (CFPTS, Afdas). L'habilitation électrique est souvent obligatoire. L'expérience sur console (GrandMA, ETC EOS) est acquise progressivement.",

    statut: "CDDU intermittent du spectacle ou salarié.e d'une salle. Les conventions collectives des entreprises du spectacle régissent les conditions d'emploi et les minima salariaux.",

    competences: [
      "Maîtrise des consoles lumière professionnelles : GrandMA, ETC EOS, Hog.",
      "Lecture et application des plans de feux.",
      "Connaissance des sources lumineuses et des réglages d'éclairage scénique.",
      "Capacité à adapter rapidement le projet lumière à une nouvelle salle.",
      "Coordination et communication avec les équipes techniques.",
    ],

    neConfondreAvec: [
      {
        titre: "Créateur.rice lumière",
        texte: "Le ou la créateur.rice lumière conçoit le projet lumière comme un acte artistique. Le ou la régisseur.se lumière l'opère et le reproduit fidèlement lors de chaque représentation.",
        lien:  'createur-lumiere',
      },
      {
        titre: "Technicien.ne lumière",
        texte: "Le ou la technicien.ne lumière installe les équipements et suit les indications du ou de la régisseur.se. Le ou la régisseur.se lumière conduit le spectacle depuis la régie.",
        lien:  'technicien-lumiere',
      },
    ],
  },

  {
    id:          'regisseur-plateau',
    nom:         'Régisseur.se plateau',
    description: "Gère le plateau pendant les représentations : décors, accessoires, déplacements des artistes en coulisses. Organisation invisible qui rend le spectacle possible.",
    univers:     'image',

    definition: "Ce que voit le public est le résultat de ce que le ou la régisseur.se plateau a organisé dans l'ombre. Les décors sont en place, les accessoires sont là où les artistes les attendent, les entrées et sorties de scène se passent sans accroc. Ce rôle implique une connaissance parfaite du spectacle scène par scène, une capacité à anticiper les imprévus et un calme à toute épreuve. Dans la danse, il ou elle doit aussi comprendre la chorégraphie pour ne jamais être dans le mauvais endroit au mauvais moment.",

    missions: [
      "Préparer le plateau avant chaque représentation : décors, accessoires, marquages au sol.",
      "Coordonner les entrées et sorties de scène des artistes depuis les coulisses.",
      "Déplacer et repositionner les éléments de décor entre les tableaux.",
      "Assurer la communication entre les coulisses et la régie.",
      "Signaler et gérer les incidents techniques sur le plateau en temps réel.",
    ],

    environnement: "Théâtres, salles de spectacle, scènes de festival. Travail principalement en soirée. Le ou la régisseur.se plateau travaille sous l'autorité du ou de la régisseur.se général.e.",

    formation: "Formations techniques du spectacle (CFPTS, Ensatt, Afdas). L'entrée par le plateau — machiniste, cintrier — est une voie fréquente. Les habilitations électriques et en sécurité scénique sont souvent requises.",

    statut: "CDDU intermittent du spectacle ou salarié.e d'une salle. Travail en équipe avec les autres régisseur.ses, sous la coordination du ou de la régisseur.se général.e.",

    competences: [
      "Connaissance du spectacle dans ses détails techniques et artistiques.",
      "Sens de l'anticipation et réactivité lors des imprévus scéniques.",
      "Force physique pour les manipulations de décors.",
      "Communication claire et efficace avec les équipes et les artistes.",
      "Capacité à travailler dans l'obscurité et le silence absolus.",
    ],

    neConfondreAvec: [
      {
        titre: "Régisseur.euse",
        texte: "Le ou la régisseur.se général.e coordonne l'ensemble des aspects techniques du spectacle. Le ou la régisseur.se plateau se concentre spécifiquement sur la gestion du plateau et des coulisses pendant les représentations.",
        lien:  'regisseur',
      },
    ],
  },

  {
    id:          'regisseur-son',
    nom:         'Régisseur.se son',
    description: "Opère le système sonore lors des représentations : diffusion de la musique, micros des artistes, équilibre général. Le son est une partition à tenir en direct.",
    univers:     'image',

    definition: "Dans la danse, le son n'est pas un simple accompagnement. Il est souvent la structure sur laquelle repose toute la chorégraphie. Le ou la régisseur.se son doit garantir que cette structure est impeccable à chaque représentation : niveau juste, placement des sources adapté à la salle, synchronisation parfaite avec les effets lumière. C'est un travail de rigueur technique et d'oreille fine, exercé depuis la régie son tout au long de la représentation.",

    missions: [
      "Préparer et vérifier le système sonore avant chaque représentation : enceintes, amplification, sources.",
      "Opérer la console son pendant la représentation : niveaux, équilibre, effets.",
      "Configurer et gérer les retours de scène pour les artistes.",
      "Adapter le système à chaque salle d'accueil lors des tournées.",
      "Assurer la maintenance de base du matériel et signaler les pannes.",
    ],

    environnement: "Régie son des théâtres, scènes de festival, tournées. Travail en lien étroit avec le ou la régisseur.se lumière et le ou la régisseur.se plateau pour la coordination des représentations.",

    formation: "BTS son, formations professionnelles (CFPTS, Afdas), ou apprentissage sur le terrain. La maîtrise des consoles son (Yamaha CL/QL, DiGiCo) et des systèmes de diffusion est indispensable.",

    statut: "CDDU intermittent du spectacle ou salarié.e d'une salle. Les profils polyvalents capables de gérer également la diffusion musicale enregistrée sont très recherchés dans les compagnies indépendantes.",

    competences: [
      "Maîtrise des consoles son numériques et des systèmes de diffusion.",
      "Oreille musicale et connaissance des spécificités sonores des salles de spectacle.",
      "Capacité à adapter le son en temps réel lors des représentations.",
      "Connaissance des formats audio et des logiciels de lecture (QLab, Ableton).",
      "Rigueur et sang-froid lors des imprévus techniques en direct.",
    ],

    neConfondreAvec: [
      {
        titre: "Technicien.ne son",
        texte: "Le ou la technicien.ne son installe les équipements selon les indications du ou de la régisseur.se. Le ou la régisseur.se son conduit le spectacle depuis la régie et est responsable du rendu final pendant les représentations.",
        lien:  'technicien-son',
      },
    ],
  },

  {
    id:          'technicien-lumiere',
    nom:         'Technicien.ne lumière',
    description: "Installe, câble et rige les équipements d'éclairage scénique selon les plans de feux. Poste technique de terrain sans qui aucun spectacle ne peut éclairer.",
    univers:     'image',

    definition: "Monter une lumière, c'est un travail physique, précis et souvent aérien. Le ou la technicien.ne lumière accroche les projecteurs en hauteur, tire les câbles, configure les gradateurs, teste chaque source. Tout ça avant que les artistes arrivent sur le plateau. C'est un métier exigeant, avec des habilitations de sécurité spécifiques, qui demande autant de rigueur technique que de résistance physique.",

    missions: [
      "Installer et câbler les équipements d'éclairage selon les plans de feux fournis.",
      "Rig et pointage des projecteurs, mise en lumière des zones de scène.",
      "Configurer les gradateurs et les systèmes de contrôle.",
      "Effectuer les vérifications de sécurité électrique avant chaque mise en service.",
      "Assurer la maintenance de base du matériel lumière.",
    ],

    environnement: "Théâtres, salles de spectacle, plateaux de tournage, festivals. Travail en hauteur (gril, pendrillons), en équipe, sous la supervision du ou de la régisseur.se lumière.",

    formation: "Formations techniques du spectacle (CFPTS, ESNAM, Afdas). Habilitation électrique obligatoire (B1V, B2V selon les niveaux). CACES nacelle pour certains postes. L'apprentissage sur le terrain reste une voie courante.",

    statut: "CDDU intermittent du spectacle ou salarié.e d'une salle permanente. C'est l'un des postes techniques les plus recrutés dans les théâtres nationaux et les festivals.",

    competences: [
      "Habilitation électrique et maîtrise des normes de sécurité en hauteur.",
      "Connaissance des équipements d'éclairage scénique : conventionnels, LEDs, automatiques.",
      "Lecture de plans de feux et de schémas électriques.",
      "Résistance physique et capacité à travailler en hauteur.",
      "Travail en équipe et communication claire avec la régie lumière.",
    ],

    neConfondreAvec: [
      {
        titre: "Régisseur.se lumière",
        texte: "Le ou la régisseur.se lumière conduit le spectacle depuis la régie et est responsable du rendu artistique. Le ou la technicien.ne lumière réalise l'installation et la maintenance des équipements sur le terrain.",
        lien:  'regisseur-lumiere',
      },
    ],
  },

  {
    id:          'technicien-son',
    nom:         'Technicien.ne son',
    description: "Installe et câble les équipements sonores pour les spectacles et les tournages. Garantit que le système est opérationnel avant que les artistes prennent le plateau.",
    univers:     'image',

    definition: "Sans le travail silencieux du ou de la technicien.ne son en amont, la balance ne peut pas commencer. Il ou elle installe les enceintes, tire les câbles, vérifie les connexions, monte les micros et s'assure que chaque source sonore arrive à la console sans parasite. Dans les tournées de danse, ce rôle est crucial car le matériel change de salle en salle et les configurations ne sont jamais identiques.",

    missions: [
      "Installer et câbler les équipements sonores selon le rider technique du spectacle.",
      "Vérifier l'ensemble des connexions et effectuer les tests de signal.",
      "Monter et positionner les micros selon les besoins scéniques.",
      "Assurer la maintenance de premier niveau du matériel son.",
      "Coordonner avec le ou la régisseur.se son pour préparer la balance.",
    ],

    environnement: "Théâtres, salles de concert, festivals, tournées. Travail physique avec manutention du matériel, souvent dans des délais courts entre deux spectacles.",

    formation: "BTS son, formations professionnelles (Afdas, CFPTS) ou apprentissage sur le terrain. La connaissance des câblages XLR, des tables de mixage et des systèmes de diffusion est indispensable pour entrer dans le métier.",

    statut: "CDDU intermittent du spectacle ou salarié.e d'une salle. Poste d'entrée fréquent pour une évolution vers régisseur.se son.",

    competences: [
      "Connaissance des équipements son scéniques : enceintes, amplificateurs, consoles, micros.",
      "Maîtrise du câblage et des normes de connexion audio.",
      "Rigueur dans les tests de signal et la vérification des installations.",
      "Réactivité lors des imprévus techniques pendant les montages.",
      "Aptitude physique pour la manutention du matériel.",
    ],

    neConfondreAvec: [
      {
        titre: "Régisseur.se son",
        texte: "Le ou la régisseur.se son conduit le spectacle depuis la régie et est responsable du rendu final. Le ou la technicien.ne son prépare l'installation technique en amont et peut assister pendant les représentations.",
        lien:  'regisseur-son',
      },
    ],
  },

  {
    id:          'accessoiriste',
    nom:         'Accessoiriste',
    description: "Recherche, fabrique et gère tous les accessoires d'un spectacle ou d'un tournage. Des objets en apparence anodins qui portent souvent une charge dramaturgique forte.",
    univers:     'image',

    definition: "Dans la danse, tout ce qui est sur scène et n'est pas un corps ou une lumière a été pensé par quelqu'un. L'accessoiriste est cette personne. Elle ou il cherche, fabrique, adapte, répare et range les objets qui peuplent le plateau : un chapeau, une chaise, un tissu, une boîte. Ces accessoires ne sont jamais anodins : ils participent à la narration, à l'identité visuelle, à l'atmosphère du spectacle. Dans les tournages, l'accessoiriste est responsable de tout ce qui n'est pas du décor fixe ni du costume.",

    missions: [
      "Dresser la liste des accessoires nécessaires en lisant le dossier artistique ou le scénario.",
      "Rechercher, acheter, louer ou fabriquer les accessoires selon le budget disponible.",
      "Coordonner avec le ou la scénographe et le ou la costumier.ère pour la cohérence visuelle.",
      "Gérer le placement des accessoires avant et pendant les représentations.",
      "Réparer, entretenir et stocker les accessoires sur la durée d'une tournée.",
    ],

    environnement: "Ateliers, théâtres, plateaux de tournage. Les accessoiristes disposent souvent d'un atelier propre pour les fabrications. En tournée, ils et elles gèrent un stock qui voyage avec la compagnie.",

    formation: "Formations en arts appliqués, design d'objet, ou métiers du spectacle. Beaucoup d'accessoiristes ont une formation en couture, menuiserie ou arts plastiques, complétée par une expérience en compagnie ou en production télévisuelle.",

    statut: "CDDU intermittent du spectacle ou du cinéma. Peut travailler pour des compagnies, des théâtres, des productions télévisuelles ou cinématographiques selon les projets.",

    competences: [
      "Connaissance des matériaux et des techniques de fabrication d'objets.",
      "Sens de l'observation et compréhension dramaturgique du spectacle.",
      "Débrouillardise et capacité à trouver des solutions dans des délais courts.",
      "Gestion et organisation d'un stock d'accessoires en tournée.",
      "Coordination avec les autres corps de métier de la création : scénographe, costumier.ère, régisseur.se.",
    ],

    neConfondreAvec: [
      {
        titre: "Scénographe",
        texte: "Le ou la scénographe conçoit l'espace scénique dans sa globalité. L'accessoiriste gère les objets qui l'habitent, en cohérence avec cette conception mais à un niveau de détail différent.",
        lien:  'scenographe',
      },
    ],
  },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

export function getMetiersByUnivers(id: MetierUniversId): Metier[] {
  return metiers.filter(m => m.univers === id)
}

/** Retrouve un Metier par son id (= segment d'URL). */
export function getMetierById(id: string): Metier | null {
  return metiers.find(m => m.id === id) ?? null
}

/** Retrouve un MetierUniversId à partir de son slug d'URL. */
export function getUniversIdBySlug(slug: string): MetierUniversId | null {
  const entry = (Object.entries(UNIVERS) as [MetierUniversId, typeof UNIVERS[MetierUniversId]][])
    .find(([, u]) => u.slug === slug)
  return entry ? entry[0] : null
}

export const TOTAL_METIERS = metiers.length
export const TOTAL_UNIVERS = UNIVERS_ORDER.length
