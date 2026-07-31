"use client"

import { useMemo, useState } from "react"
import type { DanceStyle, DanceStyleFamily } from "./styles-data"
import { STYLE_FAMILIES } from "./styles-data"
import StylesAutocomplete from "./StylesAutocomplete"

type Props = {
  styles: DanceStyle[]
}

const ALL = "Tous les styles"

export default function StylesExplorer({ styles }: Props) {
  const [activeFamily, setActiveFamily] = useState<string>(ALL)

  const families = useMemo(() => {
    const present = Array.from(new Set(styles.map((s) => s.family)))
    return [ALL, ...STYLE_FAMILIES.filter((f) => present.includes(f as DanceStyleFamily))]
  }, [styles])

  return (
    <div className="sty-search-block">
      {/* ── Autocomplétion ─────────────────────────────────────────── */}
      <div className="styles-search-wrap">
        <StylesAutocomplete styles={styles} />
      </div>

      {/* ── Filtres familles ───────────────────────────────────────── */}
      <div className="styles-filters" role="group" aria-label="Filtrer par famille">
        {families.map((family) => (
          <button
            key={family}
            type="button"
            className={`styles-filter-pill${activeFamily === family ? " is-active" : ""}`}
            onClick={() => setActiveFamily(family)}
          >
            {family}
          </button>
        ))}
      </div>
    </div>
  )
}
