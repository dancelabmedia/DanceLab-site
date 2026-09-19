import type { Locale } from '@/lib/i18n/routing'

export function aboutContent(locale: Locale) {
  const en = locale === 'en'
  return {
    seoTitle: en ? 'About Dance Lab - The dance media platform' : 'À propos de Dance Lab - Le média de référence de la danse',
    seoDescription: en
      ? 'Discover Dance Lab, the media platform dedicated to those who make, think and transform dance through podcasts, articles, interviews and resources.'
      : 'Découvre Dance Lab, le média consacré à celles et ceux qui font, pensent et transforment la danse à travers podcasts, articles, interviews et ressources.',
    heroLabel: en ? 'About' : 'À propos',
    heroTitle: en ? 'The media platform that tells the story of dance differently.' : 'Le média qui raconte la danse autrement.',
    introTitle: 'Maïwenn Bramoullé',
    introP1: en
      ? 'Dancer, choreographer, producer and content creator, I created Dance Lab with a simple conviction: dance deserves to be told differently.'
      : "Danseuse, chorégraphe, productrice et créatrice de contenus, j'ai créé Dance Lab avec une conviction simple : la danse mérite d'être racontée autrement.",
    introP2: en
      ? 'Behind every person, every path and every career, there is a story. Encounters, doubts, choices, sacrifices, learnings, successes, but also often invisible realities.'
      : "Derrière chaque personne, chaque parcours et chaque carrière, il existe une histoire. Des rencontres, des doutes, des choix, des sacrifices, des apprentissages, des réussites, mais aussi des réalités souvent invisibles.",
    introP3: en
      ? 'Through Dance Lab, I meet the people who bring dance to life to shed light on their experiences, visions and stories.'
      : "À travers Dance Lab, je pars à la rencontre de celles et ceux qui font vivre la danse pour mettre en lumière leurs expériences, leurs visions et leurs histoires.",
    introP3Bold: en ? 'bring dance to life' : 'font vivre la danse',
    introP4: en
      ? 'The project was born from a desire: to create a space where dance is not limited to what we see on stage, but where we also understand everything around it:'
      : "Le projet est né d'une envie : créer un espace où la danse ne se limite pas à ce que l'on voit sur scène, mais où l'on comprend aussi tout ce qui l'entoure :",
    introP5: en
      ? 'the realities of the profession, the professional challenges, the taboos, the violence and behaviours that can exist in the field, the misconceptions, but also the richness, creativity and passion that drive this universe.'
      : "les réalités du métier, les enjeux professionnels, les tabous, les violences et comportements qui peuvent exister dans le milieu, les idées reçues, mais aussi la richesse, la créativité et la passion qui animent cet univers.",
    introP5Bold: en ? 'the realities of the profession' : 'les réalités du métier',
    mediaTitle: en ? 'A platform to discover, understand and experience dance' : 'Un média pour découvrir, comprendre et vivre la danse',
    mediaP1: en
      ? 'Dance Lab explores dance in all its dimensions: creation, transmission, artistic careers, entrepreneurship, culture, professional and legal issues, mental health, violence prevention and passion.'
      : "Dance Lab explore la danse sous toutes ses dimensions : création, transmission, carrière artistique, entrepreneuriat, culture, enjeux professionnels et juridiques, santé mentale, prévention des violences et passion.",
    mediaP2Part1: en
      ? 'Through podcasts, portraits, articles, cultural recommendations and resources,'
      : "À travers des podcasts, des portraits, des articles, des recommandations culturelles et des ressources,",
    mediaP2Bold: en
      ? 'Dance Lab gives voice and offers a deeper look'
      : "Dance Lab donne la parole et propose un regard",
    mediaP2Part2: en
      ? 'at those who are building the dance of today and tomorrow.'
      : "plus profond sur celles et ceux qui construisent la danse d'aujourd'hui et de demain.",
    mediaP3Part1: en
      ? 'The goal: create a bridge between'
      : "L'objectif : créer un pont entre les",
    mediaP3Bold: en
      ? 'artists, professionals and the public'
      : "artistes, les professionnels et le public",
    mediaP3Part2: en
      ? ', making this universe more accessible, transparent and human.'
      : ", afin de rendre cet univers plus accessible, plus transparent et plus humain.",
    parcoursTitle: en ? "Maïwenn's story" : 'Le parcours de Maïwenn',
    parcoursP1: en
      ? 'A dancer since the age of 7, I trained in classical ballet, pointe work, modern jazz and contemporary dance.'
      : "Danseuse depuis l'âge de 7 ans, je me forme en danse classique, pointes, modern-jazz et danse contemporaine.",
    parcoursP2: en
      ? 'In 2014 I obtained the EAT Jazz diploma, followed by the Diplôme d\'Artiste Interprète.'
      : "J'obtiens en 2014 l'EAT Jazz, suivi du Diplôme d'Artiste Interprète.",
    parcoursP3: en
      ? 'Keen to enrich my artistic vocabulary and develop a more complete approach to movement, I also trained in street jazz, electro, voguing, tutting and heels, as well as singing, acting and video editing.'
      : "Soucieuse d'enrichir mon vocabulaire artistique et de développer une approche plus complète du mouvement, je me forme également en street jazz, électro, voguing, tutting et heels, ainsi qu'en chant, comédie et montage vidéo.",
    parcoursP4: en
      ? 'Over the years, I have had the opportunity to evolve in different artistic worlds: stage, audiovisual, events, choreographic creation and production.'
      : "Au fil des années, j'ai eu l'opportunité d'évoluer dans différents univers artistiques : scène, audiovisuel, événements, création chorégraphique et production.",
    parcoursP5: en
      ? 'I collaborated as a dancer with Ubisoft for Just Dance 2024 and Just Dance 2025, Disneyland Paris, Universal Music Group and Netflix.'
      : "Je collabore notamment en tant que danseuse avec Ubisoft pour Just Dance 2024 et Just Dance 2025, Disneyland Paris, Universal Music Group et Netflix.",
    parcoursP6: en
      ? 'I also took part in various music videos, films, cabarets and shows, including Les Chatouilles, Starmusical and the Relais de la Flamme Olympique de Paris 2024.'
      : "Je participe également à différents clips, films, cabarets et spectacles, parmi lesquels Les Chatouilles, Starmusical ou encore Relais de la Flamme Olympique de Paris 2024.",
    parcoursP7: en
      ? 'I performed at numerous events, notably Euro 2016, Bal de la Rose and YouTube Festival, as well as internationally with Balich Wonder Studio.'
      : "Je performe pour de nombreux événements, notamment Euro 2016, Bal de la Rose et YouTube Festival, ainsi qu'à l'international avec Balich Wonder Studio.",
    parcoursP8: en
      ? 'More recently, I joined the ensemble of La Légende de Monte-Cristo as a dancer and also took on the role of Dance Captain.'
      : "Plus récemment, je rejoins l'ensemble de La Légende de Monte-Cristo en tant que danseuse et j'assure également le rôle de Dance Captain.",
    creationTitle: en ? 'From performance to creation' : "De l'interprétation à la création",
    creationP1Part1: en
      ? 'Beyond my career as a performer, I also developed an activity as a'
      : "Au-delà de mon parcours d'interprète, je développe également une activité de",
    creationP1Bold: en
      ? 'choreographer, assistant choreographer and artistic coordinator'
      : "chorégraphe, assistante chorégraphe et coordinatrice artistique",
    creationP2: en
      ? 'I support artistic, event and audiovisual projects for various clients including BMW, Dassault Systèmes, Icade, DTR Fight and Spoade.'
      : "J'accompagne des projets artistiques, événementiels et audiovisuels pour différents acteurs comme BMW, Dassault Systèmes, Icade, DTR Fight ou encore Spoade.",
    creationP3: en
      ? 'I also work on television projects, notably for Soprano: Le Concert des 1000 Choristes broadcast on TF1.'
      : "Je travaille également sur des projets télévisés, notamment pour Soprano : Le Concert des 1000 Choristes diffusé sur TF1.",
    creationP4Part1: en
      ? "These experiences allowed me to understand the"
      : "Ces expériences m'ont permis de comprendre",
    creationP4Bold: en
      ? "many realities of an artist's career"
      : "les multiples réalités du métier d'artiste",
    creationP4Part2: en
      ? ': the invisible work behind each creation, moments of self-doubt, encounters that change a trajectory, but also the issues that run through the artistic world.'
      : ': le travail invisible derrière chaque création, les moments de remise en question, les rencontres qui changent une trajectoire, mais aussi les problématiques qui traversent le milieu artistique.',
    entrepreneurTitle: en ? 'Creating spaces to tell stories and share knowledge' : 'Créer des espaces pour raconter et transmettre',
    entrepreneurP1Part1: en
      ? 'Long drawn to'
      : "Attirée depuis longtemps par l'",
    entrepreneurP1Bold: en
      ? 'entrepreneurship and project creation'
      : "entrepreneuriat et la création de projets",
    entrepreneurP1Part2: en
      ? ', I founded Dance Lab in 2024 with the desire to create a media platform that brings artists, professionals and the general public closer together.'
      : ", je fonde Dance Lab en 2024 avec l'envie de créer un média qui rapproche les artistes, les professionnels et le grand public.",
    entrepreneurP2Part1: en
      ? 'This approach is part of a broader ecosystem around creation with'
      : "Cette démarche s'inscrit dans un écosystème plus large autour de la création avec",
    entrepreneurP2Bold: en
      ? '2.6 Productions'
      : "2.6 Productions",
    entrepreneurP2Part2: en
      ? ', a structure dedicated to audiovisual and artistic production.'
      : ", une structure dédiée à la production audiovisuelle et artistique.",
    entrepreneurP3: en
      ? 'Through these various projects, my goal remains the same: to create spaces that allow us to tell stories, pass on knowledge and foster new connections.'
      : "À travers ces différents projets, mon objectif reste le même : créer des espaces qui permettent de raconter, transmettre et faire émerger de nouvelles connexions.",
    missionTitle: en ? 'The mission of Dance Lab' : 'La mission de Dance Lab',
    missionSubtitle: en ? 'To help people discover, understand and experience dance.' : 'Faire découvrir, comprendre et vivre la danse.',
    mission1Title: en ? 'Giving voice' : 'Donner la parole',
    mission1Text: en
      ? 'Giving voice to those who have a connection with dance. Artists, professionals, experts, enthusiasts, amateurs or players who contribute to the evolution of this universe: each perspective helps us better understand the richness and complexity of dance.'
      : "Donner la parole à celles et ceux qui ont un lien avec la danse. Artistes, professionnels, experts, passionnés, amateurs ou acteurs qui contribuent à faire évoluer cet univers : chaque regard permet de mieux comprendre la richesse et la complexité de la danse.",
    mission2Title: en ? 'Shining a light and sharing knowledge' : 'Mettre en lumière et transmettre',
    mission2Text: en
      ? "Shedding light on paths, sharing knowledge, questioning the realities of the field and sharing stories that inspire those who dance, as well as those who simply wish to discover and better understand this universe."
      : "Mettre en lumière les parcours, transmettre des connaissances, questionner les réalités du milieu et partager des histoires qui inspirent celles et ceux qui dansent, mais aussi celles et ceux qui souhaitent simplement découvrir et mieux comprendre cet univers.",
    mission3Title: en ? 'Making dance accessible to all' : 'Rendre la danse accessible à tous',
    mission3Text: en
      ? 'Dance Lab is a media platform designed for all people who love dance: from professionals to enthusiasts, from the curious to future dancers.'
      : "Dance Lab est un média pensé pour toutes les personnes qui aiment la danse : des professionnels aux passionnés, des curieux aux futurs danseurs.",
    interviewsKicker: en ? 'Go further' : 'Pour aller plus loin',
    interviewsTitle: en ? 'Want to know more?' : "Envie d'en savoir plus\u00a0?",
    interviewsIntro: en
      ? "Interviews to discover my vision of dance, entrepreneurship and the creation of Dance Lab."
      : "Des interviews pour découvrir ma vision de la danse, de l'entrepreneuriat et de la création de Dance Lab.",
  }
}
