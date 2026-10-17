"use client"

import { useState } from "react"
import type { CastMember } from "../../agenda/agenda-data"

/**
 * Section « Distribution » affichée sur la fiche individuelle d'un événement.
 *
 * - Regroupe les membres par catégorie de rôle pour une lecture claire.
 * - Au-delà de PREVIEW_COUNT entrées, affiche un bouton « Voir toute la distribution ».
 * - Entièrement côté client (state toggle), le reste de la page reste Server Component.
 */

const PREVIEW_COUNT = 8

/** Ordre d'affichage des groupes de rôles */
const GROUP_ORDER = [
  "Direction",
  "Mise en scène",
  "Chorégraphie",
  "Création artistique",
  "Distribution artistique",
  "Équipe technique",
  "Production",
]

function categorizeRole(role: string): string {
  const r = role.toLocaleLowerCase("fr")
  if (/mise en sc[eè]ne/.test(r)) return "Mise en scène"
  if (/chor[ée]graph/.test(r)) return "Chorégraphie"
  if (/direction (artistique|musicale|g[eé]n[eé]rale)/.test(r) || /directeur|directrice/.test(r)) return "Direction"
  if (/sc[eé]nograph|lumi[eè]re|son|costume|d[ée]cor|cr[eé]ation/.test(r)) return "Création artistique"
  if (/production|producteur|productr/.test(r)) return "Production"
  if (/interpr[eè]te|danseur|danseuse|com[eé]dien|chanteur|chanteuse|acteur|actrice|artiste/.test(r)) return "Distribution artistique"
  if (/r[eè]ine|drag/.test(r)) return "Distribution artistique"
  return "Équipe technique"
}

function groupCast(cast: CastMember[]): [string, CastMember[]][] {
  const groups = new Map<string, CastMember[]>()
  for (const member of cast) {
    const group = categorizeRole(member.role)
    if (!groups.has(group)) groups.set(group, [])
    groups.get(group)!.push(member)
  }
  // Sort groups by predefined order, then alphabetically for unknown groups
  const sorted = [...groups.entries()].sort(([a], [b]) => {
    const ia = GROUP_ORDER.indexOf(a)
    const ib = GROUP_ORDER.indexOf(b)
    if (ia !== -1 && ib !== -1) return ia - ib
    if (ia !== -1) return -1
    if (ib !== -1) return 1
    return a.localeCompare(b, "fr")
  })
  return sorted
}

type Props = {
  cast: CastMember[]
  labels: {
    distribution: string
    seeAll: string
    collapse: string
    of: string
    artists: string
  }
}

export default function DistributionSection({ cast, labels }: Props) {
  const [expanded, setExpanded] = useState(false)

  if (!cast || cast.length === 0) return null

  const showToggle = cast.length > PREVIEW_COUNT
  const visible = expanded || !showToggle ? cast : cast.slice(0, PREVIEW_COUNT)
  const groups = groupCast(visible)
  const allGroups = groupCast(cast)

  return (
    <section className="sc-fiche-section sc-distribution">
      <h2>{labels.distribution}</h2>
      <div className="sc-distribution-groups">
        {groups.map(([groupName, members]) => (
          <div key={groupName} className="sc-distribution-group">
            <h3 className="sc-distribution-group-title">{groupName}</h3>
            <ul className="sc-distribution-list">
              {members.map((member, i) => (
                <li key={`${member.name}-${i}`} className="sc-distribution-item">
                  <span className="sc-distribution-name">{member.name}</span>
                  <span className="sc-distribution-sep" aria-hidden> — </span>
                  <span className="sc-distribution-role">
                    {member.role}
                    {member.character ? <> <span className="sc-distribution-character">({member.character})</span></> : null}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {showToggle && (
        <button
          type="button"
          className="sc-distribution-toggle"
          onClick={() => setExpanded(prev => !prev)}
          aria-expanded={expanded}
        >
          {expanded
            ? labels.collapse
            : `${labels.seeAll} (${cast.length} ${labels.artists})`}
        </button>
      )}
    </section>
  )
}
