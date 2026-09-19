"use client"

import { useEffect, useState } from "react"
import css from "./style-editorial.module.css"
import { useLocale } from "@/components/LocaleProvider"
import { uiText } from "@/data/i18n/messages"

export type StyleSection = { id: string; label: string }

/** Seul le sommaire a besoin d'hydratation ; l'article reste rendu côté serveur. */
export default function StylePageClient({ sections }: { sections: StyleSection[] }) {
  const locale = useLocale()
  const t = (text: string) => uiText(locale, text)
  const [activeSection, setActiveSection] = useState(sections[0]?.id)

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      const current = entries.find((entry) => entry.isIntersecting)
      if (current) setActiveSection(current.target.id)
    }, { rootMargin: "-20% 0px -60% 0px" })
    sections.forEach(({ id }) => {
      const section = document.getElementById(id)
      if (section) observer.observe(section)
    })
    return () => observer.disconnect()
  }, [sections])

  return (
    <nav className={css.navigation} aria-label={t("Sommaire du style")}>
      <div className={`container ${css.navigationLinks}`}>
        {sections.map(({ id, label }) => (
          <a
            key={id}
            href={`#${id}`}
            aria-current={activeSection === id ? "location" : undefined}
            onClick={(event) => {
              setActiveSection(id)
              if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                const section = document.getElementById(id)
                if (!section) return
                event.preventDefault()
                history.pushState(null, "", `#${id}`)
                section.scrollIntoView({ behavior: "instant", block: "start" })
              }
            }}
          >
            {label}
          </a>
        ))}
      </div>
    </nav>
  )
}
