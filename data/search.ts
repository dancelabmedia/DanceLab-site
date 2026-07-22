export type SearchItem = {
  id: string
  type: "episode" | "article" | "event" | "section" | "format" | "page"
  typeLabel: string
  groupLabel: string
  title: string
  href: string
  summary: string
  searchText: string
  image?: string
  episodeNumber?: number
  guest?: string
}

export function normalizeSearchText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[’']/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
}

function scoreSearchItem(item: SearchItem, normalizedQuery: string) {
  const title = normalizeSearchText(item.title)
  const guest = normalizeSearchText(item.guest || "")
  const searchable = item.searchText
  const tokens = normalizedQuery.split(" ").filter(Boolean)
  const episodeMatch = normalizedQuery.match(/^(?:episode )?(\d{1,3})$/)
  let score = 0

  if (item.episodeNumber && episodeMatch?.[1] === String(item.episodeNumber)) {
    score += 240
  }

  if (title === normalizedQuery) score += 150
  else if (title.startsWith(normalizedQuery)) score += 110
  else if (title.includes(normalizedQuery)) score += 75

  if (guest) {
    if (guest === normalizedQuery) score += 140
    else if (guest.startsWith(normalizedQuery)) score += 100
    else if (guest.includes(normalizedQuery)) score += 70
  }

  if (searchable.includes(normalizedQuery)) score += 45

  let matchedTokens = 0
  for (const token of tokens) {
    if (title.split(" ").some((word) => word.startsWith(token))) {
      score += 24
      matchedTokens += 1
    } else if (guest.split(" ").some((word) => word.startsWith(token))) {
      score += 22
      matchedTokens += 1
    } else if (searchable.split(" ").some((word) => word.startsWith(token))) {
      score += 10
      matchedTokens += 1
    } else if (searchable.includes(token)) {
      score += 4
      matchedTokens += 1
    }
  }

  if (matchedTokens === tokens.length && tokens.length > 1) score += 35
  if (matchedTokens === 0) return 0

  return score
}

export function searchContent(items: SearchItem[], query: string, limit = 8) {
  const normalizedQuery = normalizeSearchText(query)
  if (!normalizedQuery) return []

  const exactEpisodeQuery = normalizedQuery.match(/^(?:episode )?(\d{1,3})$/)
  if (exactEpisodeQuery) {
    const exactEpisode = items.filter(
      (item) => item.episodeNumber === Number(exactEpisodeQuery[1])
    )

    if (exactEpisode.length > 0) return exactEpisode.slice(0, limit)
  }

  return items
    .map((item) => ({ item, score: scoreSearchItem(item, normalizedQuery) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title, "fr"))
    .slice(0, limit)
    .map((entry) => entry.item)
}
