"use client"

import { useEffect } from "react"

/**
 * StylesReveal
 * Gère les animations d'entrée au scroll pour la page Styles de danse.
 * — Sections [data-reveal] : opacity + translateY via transition CSS
 * — Cartes .sty-fcard    : même animation mais avec délai individuel (--card-delay)
 * — Cartes .sty-mag-card : idem (--i * 100ms)
 * Respecte prefers-reduced-motion.
 */
export default function StylesReveal() {
  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches

    const EASING = "cubic-bezier(.25,.46,.45,.94)"

    /* ── Éléments à révéler ──────────────────────────────────────── */
    const targets = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]")
    )

    if (prefersReduced) {
      targets.forEach((el) => el.classList.add("sty-revealed"))
      return
    }

    /* ── Fonction de révélation individuelle ─────────────────────── */
    const reveal = (el: HTMLElement) => {
      // Lire le délai depuis la custom property CSS inline (--card-delay ou --i)
      const rawDelay =
        el.style.getPropertyValue("--card-delay").trim() ||
        el.style.getPropertyValue("--i").trim()

      let delayMs = 0
      if (rawDelay) {
        // "--card-delay" → "200ms" | "--i" → "2" (index, à multiplier)
        if (rawDelay.endsWith("ms")) {
          delayMs = parseInt(rawDelay)
        } else {
          // "--i" est un index pur → 100ms par index
          delayMs = parseInt(rawDelay) * 100
        }
      }

      setTimeout(() => {
        // Déclenchement de la transition (transition déjà définie en CSS)
        el.classList.add("sty-revealed")

        // Après la transition de révélation, on passe à une transition rapide
        // pour que le hover / unhover soit instantané et non ralenti.
        const onEnd = (e: TransitionEvent) => {
          if (e.propertyName !== "transform") return
          el.style.transition =
            `transform 300ms ${EASING}, box-shadow 300ms ${EASING}, opacity 300ms ${EASING}`
          el.removeEventListener("transitionend", onEnd)
        }
        el.addEventListener("transitionend", onEnd)
      }, delayMs)
    }

    /* ── IntersectionObserver ────────────────────────────────────── */
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            reveal(entry.target as HTMLElement)
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    )

    targets.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  return null
}
