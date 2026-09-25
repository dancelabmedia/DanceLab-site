"use client"

import Link from "next/link"
import { useState, useEffect, useRef, useCallback } from "react"
import type { DanceStyleFamily } from "./styles-data"
import { useLocale } from "@/components/LocaleProvider"
import { uiText } from "@/data/i18n/messages"
import { useBackNavigationState } from '@/lib/use-back-navigation-state'
import { isHistoryRestoreTarget } from '@/lib/navigation-memory'

/* ── Constantes ──────────────────────────────────────────────── */
const STEP    = 8   // cartes ajoutées / retirées à chaque clic
const INITIAL = 8   // nombre de cartes affichées au chargement

/* ── Dégradés par famille ─────────────────────────────────────── */
const FAMILY_GRADIENTS: Record<string, string> = {
  "Danses urbaines":
    "linear-gradient(145deg, #050505 0%, #233033 45%, #425659 100%)",
  "Danses académiques":
    "linear-gradient(145deg, #233033 0%, #425659 50%, #5B7377 100%)",
  "Danses contemporaines et expérimentales":
    "linear-gradient(145deg, #425659 0%, #5B7377 50%, #233033 100%)",
  "Danses scéniques":
    "linear-gradient(145deg, #050505 0%, #233033 55%, #5B7377 100%)",
  "Danses sociales":
    "linear-gradient(145deg, #233033 0%, #5B7377 48%, #425659 100%)",
  "Danses traditionnelles":
    "linear-gradient(145deg, #425659 0%, #233033 55%, #050505 100%)",
  "Danses de club":
    "linear-gradient(145deg, #050505 0%, #425659 52%, #233033 100%)",
  "Danses issues des cultures afro-descendantes":
    "linear-gradient(145deg, #233033 0%, #425659 50%, #050505 100%)",
}

/* ── Types ───────────────────────────────────────────────────── */
type GridStyle = {
  slug: string
  name: string
  family: DanceStyleFamily
  aliases?: string[]
  summary?: string
  image?: string
  available?: boolean
}

type Props = {
  /** Styles filtrés (par famille + recherche) */
  styles: GridStyle[]
  /** Nombre total de styles avant tout filtre — pour le compteur */
  totalCount: number
}

/* ── Composant ───────────────────────────────────────────────── */
export default function StylesGrid({ styles, totalCount }: Props) {
  const locale = useLocale()
  const t = (text: string) => uiText(locale, text)
  const [visibleCount, setVisibleCount] = useState(INITIAL)
  useBackNavigationState('dance-styles-grid', { visibleCount }, saved => setVisibleCount(saved.visibleCount))
  const controlsRef = useRef<HTMLDivElement>(null)

  /* Réinitialise à 8 dès que la liste filtrée change (recherche ou filtre famille) */
  useEffect(() => {
    if (isHistoryRestoreTarget()) return
    setVisibleCount(INITIAL)
  }, [styles])

  /* Tranches visibles */
  const visibleStyles = styles.slice(0, visibleCount)
  const canShowMore   = visibleCount < styles.length
  const canShowLess   = visibleCount > INITIAL && styles.length > INITIAL
  const showControls  = canShowMore || canShowLess
  const isFiltered    = styles.length !== totalCount

  /* Compteur affiché dans l'en-tête */
  const countLabel = isFiltered
    ? `${styles.length} ${t(styles.length > 1 ? "résultats" : "résultat")} ${t("sur")} ${totalCount}`
    : `${totalCount}`

  /* ── Handlers ────────────────────────────────────────────── */
  const handleMore = useCallback(() => {
    setVisibleCount(c => Math.min(c + STEP, styles.length))
  }, [styles.length])

  const handleLess = useCallback(() => {
    setVisibleCount(c => Math.max(INITIAL, c - STEP))
    /*
     * Après la réduction, on s'assure que les boutons restent visibles —
     * évite que l'utilisateur se retrouve brutalement en haut de page.
     * Double rAF : laisse React un cycle pour mettre à jour le DOM.
     */
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        controlsRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        })
      })
    })
  }, [])

  /* ── Render ──────────────────────────────────────────────── */
  return (
    <section className="stg-section" id="stg-grid" aria-label="Tous les styles de danse">

      {/* En-tête */}
      <div className="stg-header container">
        <h2 className="stg-title">{t("Tous les styles")}</h2>
        <span className="stg-count" aria-live="polite">{countLabel}</span>
      </div>

      {/* Grille */}
      <div className="stg-grid container">
        {styles.length === 0 ? (
          <div className="stg-empty">
            <p>{t("Aucun style ne correspond à cette recherche.")}</p>
          </div>
        ) : (
          visibleStyles.map((style, i) => {
            const isAvailable = style.available !== false
            /*
             * Stagger : les cartes nouvellement montées animent en décalé.
             * On calcule le délai relatif à la position dans le groupe de STEP
             * courant pour que "Voir plus" donne un stagger propre sur les 8 nouveaux.
             */
            const posInBatch = i % STEP
            const delay      = `${posInBatch * 45}ms`

            const inner = (
              <>
                {/* Fond — photo ou dégradé famille */}
                {style.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={style.image}
                    alt={style.name}
                    className="stg-card-bg"
                    draggable={false}
                    loading="lazy"
                  />
                ) : (
                  <div
                    className="stg-card-bg stg-card-bg--gradient"
                    style={{
                      background:
                        FAMILY_GRADIENTS[style.family] ??
                        FAMILY_GRADIENTS["Danses urbaines"],
                    }}
                  />
                )}
                <div className="stg-card-shade" />

                {/* Texte */}
                <div className="stg-card-body">
                  <div className="stg-card-top">
                    <span className="stg-card-family">{style.family}</span>
                    <h3 className="stg-card-name">{style.name}</h3>
                    {style.aliases && style.aliases.length > 0 && (
                      <p className="stg-card-aliases">
                        {style.aliases.slice(0, 2).join(" · ")}
                      </p>
                    )}
                    {style.summary && (
                      <p className="stg-card-desc">{style.summary}</p>
                    )}
                  </div>
                  <div className="stg-card-bottom">
                    {isAvailable ? (
                      <span className="stg-card-arrow" aria-hidden="true">
                        <svg
                          width="14" height="14" viewBox="0 0 16 16"
                          fill="none" stroke="currentColor"
                          strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"
                        >
                          <path d="M3 8h10M9 4l4 4-4 4" />
                        </svg>
                      </span>
                    ) : (
                      <span className="stg-card-coming">{t("À venir")}</span>
                    )}
                  </div>
                </div>
              </>
            )

            return isAvailable ? (
              <Link
                key={style.slug}
                href={`/explorer/styles-de-danse/${style.slug}`}
                className="stg-card"
                style={{ "--card-delay": delay } as React.CSSProperties}
              >
                {inner}
              </Link>
            ) : (
              <div
                key={style.slug}
                className="stg-card stg-card--upcoming"
                style={{ "--card-delay": delay } as React.CSSProperties}
                aria-label={locale === 'en' ? `${style.name} — content coming soon` : `${style.name} — contenu à venir`}
              >
                {inner}
              </div>
            )
          })
        )}
      </div>

      {/* Boutons Voir plus / Voir moins */}
      {showControls && (
        <div className="stg-controls container" ref={controlsRef}>
          {canShowLess && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleLess}
              aria-label={locale === 'en' ? 'Show fewer styles' : 'Afficher moins de styles'}
            >
              {t("Voir moins")}
            </button>
          )}
          {canShowMore && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleMore}
              aria-label={locale === 'en' ? `Show ${Math.min(STEP, styles.length - visibleCount)} more styles` : `Afficher ${Math.min(STEP, styles.length - visibleCount)} styles supplémentaires`}
            >
              {t("Voir plus")}
            </button>
          )}
        </div>
      )}

    </section>
  )
}
