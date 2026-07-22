import { agendaEvents } from "../app/agenda/agenda-data"
import { magazineArticles } from "../app/decouvrir/articles-data"
import { discoverSections } from "../app/decouvrir/discover-data"
import { explorerSections } from "../app/explorer/explorer-data"
import { episodes } from "./episodes"
import { normalizeSearchText, type SearchItem } from "./search"

function searchable(parts: Array<string | number | undefined>) {
  return normalizeSearchText(parts.filter((part) => part !== undefined).join(" "))
}

const episodeItems: SearchItem[] = episodes.map((episode) => ({
  id: `episode-${episode.slug}`,
  type: "episode",
  typeLabel: "Épisode",
  groupLabel: "Épisodes",
  title: episode.title,
  href: `/episodes/${episode.slug}`,
  summary: episode.excerpt,
  image: episode.image,
  episodeNumber: episode.number,
  guest: episode.guest,
  searchText: searchable([
    "épisode",
    episode.number,
    episode.title,
    episode.guest,
    episode.role,
    episode.category,
    episode.excerpt,
    episode.description,
    episode.quote,
    ...episode.tags,
    ...episode.chapters.map((chapter) => chapter.title),
  ]),
}))

const articleItems: SearchItem[] = magazineArticles.map((article) => ({
  id: `article-${article.slug}`,
  type: "article",
  typeLabel: article.category,
  groupLabel: "Articles & portraits",
  title: article.title,
  href: `/decouvrir/articles/${article.slug}`,
  summary: article.chapo,
  image: article.image,
  guest: article.guest,
  searchText: searchable([
    article.title,
    article.category,
    article.chapo,
    article.guest,
    ...article.tags,
    ...article.sections.flatMap((section) => [section.heading, ...section.paragraphs]),
    article.conclusion,
  ]),
}))

const eventItems: SearchItem[] = agendaEvents.map((event) => ({
  id: `event-${event.slug}`,
  type: "event",
  typeLabel: "Événement",
  groupLabel: "Événements",
  title: event.title,
  href: `/sortir/${event.slug}`,
  summary: `${event.category} · ${event.city} · ${event.dates}`,
  image: event.image,
  searchText: searchable([
    event.title,
    event.description,
    event.category,
    event.city,
    event.venue,
    event.dates,
    event.status,
  ]),
}))

const discoverItems: SearchItem[] = discoverSections.map((section) => ({
  id: `discover-${section.slug}`,
  type: "section",
  typeLabel: section.label,
  groupLabel: "Rubriques éditoriales",
  title: section.title,
  href: `/decouvrir/${section.slug}`,
  summary: section.description,
  searchText: searchable([section.label, section.title, section.kicker, section.description]),
}))

const explorerItems: SearchItem[] = explorerSections.map((section) => ({
  id: `explorer-${section.slug}`,
  type: "section",
  typeLabel: section.label,
  groupLabel: "Explorer",
  title: section.label,
  href: `/explorer/${section.slug}`,
  summary: section.intro,
  searchText: searchable([
    section.label,
    section.kicker,
    section.title,
    section.intro,
    section.lead.title,
    section.lead.text,
    ...section.cards.flatMap((card) => [card.label, card.title, card.text]),
    ...section.collections.flatMap((collection) => [collection.title, collection.text]),
  ]),
}))

const editorialItems: SearchItem[] = [
  {
    id: "page-ecouter",
    type: "page",
    typeLabel: "Page",
    groupLabel: "Pages",
    title: "Écouter Dance Lab",
    href: "/ecouter",
    summary: "Retrouvez tous les épisodes et conversations de Dance Lab.",
    searchText: searchable(["écouter", "podcast", "épisodes", "interviews", "invités"]),
  },
  {
    id: "format-incontournables",
    type: "format",
    typeLabel: "Format",
    groupLabel: "Formats & ressources",
    title: "Les incontournables",
    href: "/ecouter/incontournables",
    summary: "Une sélection d'épisodes incontournables de Dance Lab.",
    searchText: searchable(["incontournables", "sélection", "épisodes", "podcast"]),
  },
  {
    id: "format-playlists",
    type: "format",
    typeLabel: "Format",
    groupLabel: "Formats & ressources",
    title: "Playlists thématiques",
    href: "/ecouter/playlists-thematiques",
    summary: "Explorez les épisodes par thèmes et sujets.",
    searchText: searchable(["playlists", "thématiques", "thèmes", "épisodes", "podcast"]),
  },
  {
    id: "page-agenda",
    type: "page",
    typeLabel: "Agenda",
    groupLabel: "Pages",
    title: "L'agenda de la danse",
    href: "/agenda",
    summary: "Festivals, spectacles, battles et événements de danse à découvrir.",
    searchText: searchable(["agenda", "sortir", "festival", "spectacle", "battle", "événement"]),
  },
  {
    id: "page-decouvrir",
    type: "page",
    typeLabel: "Page",
    groupLabel: "Pages",
    title: "Découvrir",
    href: "/decouvrir",
    summary: "Articles, décryptages, tendances et histoires autour de la danse.",
    searchText: searchable(["découvrir", "articles", "culture", "décryptages", "tendances", "histoire"]),
  },
  {
    id: "page-explorer",
    type: "page",
    typeLabel: "Page",
    groupLabel: "Pages",
    title: "Explorer",
    href: "/explorer",
    summary: "Styles, chorégraphes, compagnies, artistes et métiers de la danse.",
    searchText: searchable(["explorer", "styles", "chorégraphes", "compagnies", "artistes", "métiers"]),
  },
  {
    id: "page-ressources",
    type: "page",
    typeLabel: "Ressources",
    groupLabel: "Formats & ressources",
    title: "Ressources",
    href: "/#ressources",
    summary: "Guides, conseils et partenaires utiles au monde de la danse.",
    searchText: searchable([
      "ressources",
      "guides",
      "conseils",
      "partenaires",
      "formations",
      "outils",
      "professionnels",
    ]),
  },
  {
    id: "page-a-propos",
    type: "page",
    typeLabel: "Page",
    groupLabel: "Pages",
    title: "À propos de Dance Lab",
    href: "/a-propos",
    summary: "Découvrez la mission et l'identité éditoriale de Dance Lab.",
    searchText: searchable(["à propos", "dance lab", "mission", "média", "équipe"]),
  },
]

export const searchIndex: SearchItem[] = [
  ...episodeItems,
  ...articleItems,
  ...eventItems,
  ...discoverItems,
  ...explorerItems,
  ...editorialItems,
]
