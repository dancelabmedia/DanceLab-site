import type { Metadata } from "next"
import Link from "next/link"
import { searchIndex } from "../../data/search-index"
import { searchContent } from "../../data/search"

export const metadata: Metadata = {
  title: "Recherche | Dance Lab",
  description: "Recherchez un épisode, un invité, un article, un événement ou une ressource Dance Lab.",
}

export default async function SearchResultsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>
}) {
  const params = await searchParams
  const query = Array.isArray(params.q) ? params.q[0] || "" : params.q || ""
  const results = query.trim() ? searchContent(searchIndex, query, searchIndex.length) : []
  const groupedResults = Array.from(
    results.reduce((groups, item) => {
      const group = groups.get(item.groupLabel) || []
      group.push(item)
      groups.set(item.groupLabel, group)
      return groups
    }, new Map<string, typeof results>())
  )

  return (
    <main className="search-results-page">
      <section className="search-results-hero">
        <div className="container">
          <span className="section-label">Recherche</span>
          <h1>Explorer Dance Lab</h1>
          <form className="search-results-form" action="/recherche" role="search">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Épisode, invité, thème, article…"
              aria-label="Rechercher dans Dance Lab"
            />
            <button type="submit">Rechercher</button>
          </form>
        </div>
      </section>

      <section className="search-results-content">
        <div className="container">
          {query.trim() ? (
            <div className="search-results-heading">
              <p>
                {results.length} résultat{results.length > 1 ? "s" : ""} pour
              </p>
              <h2>« {query.trim()} »</h2>
            </div>
          ) : (
            <p className="search-results-empty">
              Saisissez un mot-clé, un nom, un thème ou un numéro d'épisode.
            </p>
          )}

          {results.length > 0 ? (
            <div className="search-results-groups">
              {groupedResults.map(([groupLabel, groupResults]) => (
                <section key={groupLabel} className="search-results-group">
                  <h3>{groupLabel}</h3>
                  <div className="search-results-grid">
                    {groupResults.map((item) => (
                      <Link key={item.id} className="search-result-card" href={item.href}>
                        {item.image ? (
                          <img src={item.image} alt="" />
                        ) : (
                          <span className="search-result-placeholder" aria-hidden="true">
                            {item.typeLabel.slice(0, 1)}
                          </span>
                        )}
                        <span className="search-result-copy">
                          <small>
                            {item.typeLabel}
                            {item.episodeNumber ? ` ${item.episodeNumber}` : ""}
                          </small>
                          <strong>{item.title}</strong>
                          {item.guest ? <span>Avec {item.guest}</span> : null}
                          <p>{item.summary}</p>
                        </span>
                        <span className="search-result-arrow" aria-hidden="true">→</span>
                      </Link>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : query.trim() ? (
            <p className="search-results-empty">
              Aucun résultat trouvé pour « {query.trim()} ». Essayez un autre mot-clé ou un thème plus large.
            </p>
          ) : null}
        </div>
      </section>
    </main>
  )
}
