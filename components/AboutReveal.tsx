'use client'

import ScrollReveal from './ScrollReveal'

/**
 * AboutReveal — conservé tel quel pour la page À propos.
 * Délègue à ScrollReveal avec le sélecteur original.
 */
export default function AboutReveal() {
  return <ScrollReveal selector=".about-page img, .about-page p" />
}
