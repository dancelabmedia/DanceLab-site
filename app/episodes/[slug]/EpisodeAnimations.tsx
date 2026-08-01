"use client";

import { useEffect } from "react";

/**
 * EpisodeAnimations
 * 1. Scroll reveal (IntersectionObserver) pour les sections du corps.
 * 2. Révélation progressive de l'encart YouTube synchronisée avec le scroll
 *    à travers la zone sticky du hero.
 * Respecte prefers-reduced-motion.
 */
export default function EpisodeAnimations() {
  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // ── 1. Scroll reveal pour [data-ep-reveal] ──────────────────────────────
    const targets = document.querySelectorAll<HTMLElement>("[data-ep-reveal]");

    if (prefersReduced) {
      // Accessibilité : tout révéler immédiatement, sans animation
      for (const el of targets) el.classList.add("ep-revealed");
      // L'encart YouTube est déjà visible via CSS prefers-reduced-motion
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("ep-revealed");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -32px 0px" }
    );

    for (const el of targets) observer.observe(el);

    // ── 2. Révélation YouTube synchronisée au scroll ────────────────────────
    const hero    = document.querySelector<HTMLElement>(".ep-hero");
    const ytPanel = document.getElementById("ep-hero-youtube");

    let ytCleanup: (() => void) | undefined;

    if (hero && ytPanel) {
      const onScroll = () => {
        // Combien de pixels on a scrollé dans le hero depuis son bord supérieur
        const scrolled = -hero.getBoundingClientRect().top;
        const vh       = window.innerHeight;

        // Début : 45 % — le texte est bien en chemin vers le haut, boutons encore lisibles mais dégagés
        // Fin   : 88 % — entièrement visible avant que le texte ait totalement disparu
        const startAt = vh * 0.52;
        const endAt   = vh * 0.95;

        const progress = Math.max(
          0,
          Math.min(1, (scrolled - startAt) / (endAt - startAt))
        );

        // translateY : part de +60 px (en dessous du centre) → 0 px (centré)
        const offsetY = (1 - progress) * 60;
        ytPanel.style.opacity   = String(progress);
        ytPanel.style.transform = `translateY(calc(-50% + ${offsetY}px))`;

        // Activer les pointer-events seulement quand suffisamment visible
        if (progress > 0.15) {
          ytPanel.classList.add("ep-yt-active");
        } else {
          ytPanel.classList.remove("ep-yt-active");
        }
      };

      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll(); // calcul initial (si la page est déjà scrollée au chargement)

      ytCleanup = () => window.removeEventListener("scroll", onScroll);
    }

    return () => {
      observer.disconnect();
      ytCleanup?.();
    };
  }, []);

  return null;
}
