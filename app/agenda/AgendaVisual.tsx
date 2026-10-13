"use client"

/**
 * app/agenda/AgendaVisual.tsx
 * Visuel d'un événement (cartes /sortir et fiche détaillée).
 *
 * - Visuel horizontal : rempli le cadre (comme avant).
 * - Affiche verticale : affichée en entier (titre et dates préservés), sur un
 *   fond flouté du même visuel pour garder la forme de la carte.
 * - Image introuvable ou expirée : retour au visuel de remplacement.
 *
 * Balise <img> native (chargement différé) plutôt que next/image : les visuels
 * viennent de dizaines de sites différents et l'optimisation Vercel du plan
 * Hobby est plafonnée chaque mois.
 */

import { useEffect, useRef, useState, type ReactNode } from "react"

type Props = {
  src?: string
  alt: string
  credit?: string
  /** Contenu affiché si aucune image n'est utilisable. */
  fallback: ReactNode
  variant: "card" | "hero"
  priority?: boolean
}

export default function AgendaVisual({ src, alt, credit, fallback, variant, priority = false }: Props) {
  const [failed, setFailed] = useState(false)
  const [poster, setPoster] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  const measure = (img: HTMLImageElement) => {
    if (!img.naturalWidth || !img.naturalHeight) return
    // Plus haute que large (ou presque carrée en carte 16:9) : traitée comme une affiche.
    setPoster(img.naturalHeight / img.naturalWidth > (variant === "card" ? 0.8 : 1))
  }

  // Image déjà en cache : onLoad a pu se déclencher avant l'hydratation.
  useEffect(() => {
    const img = imgRef.current
    if (img?.complete) {
      if (img.naturalWidth) measure(img)
      else setFailed(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src])

  if (!src || failed) return <>{fallback}</>

  // Crédits vides de sens fournis par certaines sources.
  const shownCredit = credit && !/^(inconnu|unknown|n\/?a|-+|\.)$/i.test(credit.trim()) ? credit.trim() : ""

  const base = variant === "card" ? "srt-visual" : "agenda-visual"
  return (
    <div className={`${base}${poster ? ` ${base}--poster` : ""}`}>
      {poster ? <img key="backdrop" src={src} alt="" aria-hidden="true" className={`${base}-backdrop`} referrerPolicy="no-referrer" /> : null}
      <img
        key="main"
        ref={imgRef}
        src={src}
        alt={alt}
        className={`${base}-img`}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        referrerPolicy="no-referrer"
        onLoad={(e) => measure(e.currentTarget)}
        onError={() => setFailed(true)}
      />
      {shownCredit ? (
        <span key="credit" className={`${base}-credit`}>{shownCredit.startsWith("©") ? shownCredit : `© ${shownCredit}`}</span>
      ) : null}
    </div>
  )
}
