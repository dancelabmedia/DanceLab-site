'use client'

import { useRef, useEffect } from 'react'
import Link from 'next/link'
import type { MagazineArticle } from '../decouvrir/articles-data'
import { formatAgendaDate, type AgendaEvent } from '../agenda/agenda-data'

/* ─────────────────────────────────────────────────────────
   Props
───────────────────────────────────────────────────────── */
interface Props {
  article: MagazineArticle
  event:   AgendaEvent | null   // 3e carte — rubrique Sortir
}

/* ─────────────────────────────────────────────────────────
   Math helpers (no import cost)
───────────────────────────────────────────────────────── */
function clamp(v: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, v))
}
/** Smooth easing between two edges — returns 0 → 1 */
function ss(e0: number, e1: number, x: number) {
  const t = clamp((x - e0) / (e1 - e0), 0, 1)
  return t * t * (3 - 2 * t)
}
/** Courbe plus cinématographique : départ et arrivée plus progressifs. */
function ssp(e0: number, e1: number, x: number) {
  const t = clamp((x - e0) / (e1 - e0), 0, 1)
  return t * t * t * (t * (t * 6 - 15) + 10)
}
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

/* ─────────────────────────────────────────────────────────
   Component
───────────────────────────────────────────────────────── */
export default function MediaReveal({ article, event }: Props) {
  const sectionRef = useRef<HTMLElement>(null)
  const card1Ref   = useRef<HTMLDivElement>(null)   // Magazine
  const card2Ref   = useRef<HTMLDivElement>(null)   // Style de danse (2e à apparaître)
  const card4Ref   = useRef<HTMLDivElement>(null)   // Sortir (position et timing conservés)
  const labelRef   = useRef<HTMLDivElement>(null)
  const eventDates = event
    ? event.dates !== 'À compléter'
      ? event.dates
      : event.endDate && event.endDate !== event.startDate
        ? `${formatAgendaDate(event.startDate)} au ${formatAgendaDate(event.endDate)}`
        : formatAgendaDate(event.startDate)
    : ''
  const isParisSummerFestival = event?.slug === 'festival-paris-lete-2026'
  const eventVenue = isParisSummerFestival
    ? 'Paris · Jardin des Tuileries, Monnaie de Paris, Jardin d’Acclimatation et autres lieux'
    : event ? `${event.venue}${event.city ? ` · ${event.city}` : ''}` : ''
  const eventPrice = isParisSummerFestival
    ? 'Propositions gratuites ou très accessibles · certains rendez-vous à 13 €'
    : event?.price !== 'À compléter' ? event?.price : null
  const eventTimes = event?.time ?? (isParisSummerFestival ? '19 h ou 22 h selon les propositions' : null)

  useEffect(() => {
    const section = sectionRef.current
    const c1  = card1Ref.current   // Magazine
    const c2  = card2Ref.current   // Style de danse
    const c4  = card4Ref.current   // Sortir (peut être null si pas d'événement)
    const lbl = labelRef.current
    if (!section || !c1 || !c2 || !lbl) return

    if (window.innerWidth <= 768) return

    /* ── États initiaux invisibles — JS anime vers visible ── */
    c1.style.opacity  = '0'
    c1.style.transform = 'translate(-9vw, 9vh) scale(0.95)'

    // Style de danse (haut-droite) — reprend exactement l'entrée du Podcast
    c2.style.opacity  = '0'
    c2.style.transform = 'translate(9vw, -9vh) scale(0.95)'

    // Sortir (centre) — position et mouvement inchangés
    if (c4) {
      c4.style.opacity  = '0'
      c4.style.transform = 'translate(0, 10vh) scale(0.95)'
    }

    lbl.style.opacity = '0'

    function tick() {
      const rect     = section!.getBoundingClientRect()
      const vh       = window.innerHeight
      const sectionH = section!.offsetHeight
      if (sectionH <= vh) return

      // ── Progression unifiée ──────────────────────────────────────────────
      //   p = 0   → section.bottom entre dans le viewport
      //   p ≈ .56 → section.top touche le bord supérieur (sticky commence)
      //   p = 1   → section entièrement scrollée
      const p = clamp((vh - rect.top) / sectionH, 0, 1)

      /* Lissage temporel limité aux entrées : un geste de scroll rapide ne
         peut plus faire apparaître une carte presque instantanément. */
      c1!.classList.toggle('mfr-card--entry-smoothing', p < 0.52)
      c2!.classList.toggle('mfr-card--entry-smoothing', p < 0.74)
      c4?.classList.toggle('mfr-card--entry-smoothing', p < 0.84)

      /* ── ENTRÉE — ordre : Magazine → Style de danse → Sortir ────────── */
      // Le Magazine conserve un court temps de respiration avant son entrée ;
      // les cartes suivantes restent synchronisées avec ce départ global.
      // Cascade éditoriale lente : 16 % de progression entre chaque départ,
      // avec 6 % de chevauchement pour conserver une continuité parfaite.

      /* ① Magazine — plateau prolongé de 10 % avant sa sortie */
      const c1e  = ssp(0.22, 0.52, p)
      const c1s  = ss(0.76, 0.84, p)
      const c1tx = lerp(-9, 0, c1e) + lerp(0, -2, c1s)
      const c1ty = lerp(9, 0, c1e)

      /* ② Style de danse — entrée retardée, puis court plateau lisible */
      const c2e  = ssp(0.50, 0.74, p)
      const c2tx = lerp(9, 0, c2e)
      const c2ty = lerp(-9, 0, c2e)

      /* ③ Sortir — entre pendant la disparition progressive du Magazine */
      const c4e  = ssp(0.62, 0.84, p)
      const c4ty = lerp(10, 0, c4e)

      /* ── SORTIES INDIVIDUELLES — chaque encart cède progressivement
         la place au suivant après un court temps d'installation. ─────── */
      const c1x = ss(0.76, 0.90, p)
      const c2x = ss(0.76, 0.84, p)
      const c4x = ss(0.84, 0.90, p)

      /* Application : opacité finale = entrée × sortie propre à la carte */
      c1!.style.opacity   = (c1e * (1 - c1x)).toFixed(3)
      c1!.style.transform =
        `translate(${c1tx.toFixed(2)}vw, ${(c1ty + lerp(0, -8, c1x)).toFixed(2)}vh) scale(${lerp(0.95, 1, c1e).toFixed(3)})`

      c2!.style.opacity   = (c2e * (1 - c2x)).toFixed(3)
      c2!.style.transform =
        `translate(${c2tx.toFixed(2)}vw, ${(c2ty + lerp(0, -8, c2x)).toFixed(2)}vh) scale(${lerp(0.95, 1, c2e).toFixed(3)})`

      if (c4) {
        c4.style.opacity   = (c4e * (1 - c4x)).toFixed(3)
        c4.style.transform =
          `translate(0, ${(c4ty + lerp(0, -8, c4x)).toFixed(2)}vh) scale(${lerp(0.95, 1, c4e).toFixed(3)})`
      }

      /* Label — apparaît une fois toutes les cartes en place */
      lbl!.style.opacity = (ss(0.74, 0.82, p) * (1 - c4x)).toFixed(3)
    }

    window.addEventListener('scroll', tick, { passive: true })
    tick()
    return () => window.removeEventListener('scroll', tick)
  }, [])

  return (
    <section
      ref={sectionRef}
      className="mfr-section"
      aria-label="Dance Lab — trois univers"
    >
      <div className="mfr-sticky">
        <div className="mfr-canvas">

          {/* ════════════════════════════════════════
              Carte 1 — Le Magazine (article)
              Apparaît en PREMIER
          ════════════════════════════════════════ */}
          <div ref={card1Ref} className="mfr-card mfr-card--article">
            <Link
              href={`/decouvrir/articles/${article.slug}`}
              className="mfr-card-inner"
              aria-label={article.title}
            >
              <div className="mfr-card-face mfr-card-face--front">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={article.image}
                  alt=""
                  aria-hidden="true"
                  className="mfr-card-img"
                  loading="lazy"
                />
                <div className="mfr-card-gradient" />
                <div className="mfr-card-body">
                  <span className="mfr-badge mfr-badge--mag">Magazine</span>
                  <span className="mfr-card-cat">{article.category}</span>
                  <h2 className="mfr-card-title">{article.title}</h2>
                  <p className="mfr-card-chapo">{article.chapo}</p>
                  <div className="mfr-card-foot">
                    <span className="mfr-card-meta">
                      {article.publishedDate}&thinsp;·&thinsp;{article.readTime} de lecture
                    </span>
                    <span className="mfr-card-cta">Lire l&apos;article →</span>
                  </div>
                </div>
              </div>
              <div className="mfr-card-face mfr-card-face--back mfr-card-back mfr-card-back--mag">
                <div className="mfr-preview-browser" aria-hidden="true">
                  <span /><span /><span />
                </div>
                <div className="mfr-preview-image">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={article.image} alt="" aria-hidden="true" loading="lazy" />
                  {article.imageCredit ? (
                    <span className="mfr-preview-image-credit">{article.imageCredit}</span>
                  ) : null}
                </div>
                <span className="mfr-preview-kicker">Magazine · {article.category}</span>
                <h3 className="mfr-preview-title">{article.title}</h3>
                <p className="mfr-preview-copy">{article.chapo}</p>
                <span className="mfr-preview-cta">Aperçu de l&apos;article →</span>
              </div>
            </Link>
          </div>

          {/* ════════════════════════════════════════
              Carte 2 — Style de danse
              Apparaît en DEUXIÈME
              À la place et au timing de l'ancien Podcast
          ════════════════════════════════════════ */}
          <div ref={card2Ref} className="mfr-card mfr-card--style">
            <Link
              href="/explorer/styles-de-danse"
              className="mfr-card-inner"
              aria-label="Explorer l'encyclopédie des styles de danse"
            >
              <div className="mfr-card-face mfr-card-face--front">
                {/* Image locale imposée : aucun ancien fond ou fallback généré. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/styles-de-danse/jazz.png"
                  alt=""
                  aria-hidden="true"
                  className="mfr-card-img"
                  loading="lazy"
                />
                <div className="mfr-card-gradient" />
                <div className="mfr-card-body mfr-card-body--exp mfr-card-body--lower">
                  <span className="mfr-badge mfr-badge--exp">Explorer</span>
                  <span className="mfr-card-cat">Encyclopédie de la danse</span>
                  <h2 className="mfr-card-title">Styles de danse</h2>
                  <p className="mfr-card-chapo">
                    Hip-hop, contemporain, classique, afro, waacking — chaque style
                    porte une histoire et une manière d&apos;habiter le corps.
                  </p>
                  <span className="mfr-card-cta mfr-card-cta--exp">Découvrir →</span>
                </div>
              </div>
              <div className="mfr-card-face mfr-card-face--back mfr-card-back mfr-card-back--styles">
                <div className="mfr-style-preview-head">
                  <span className="mfr-preview-kicker">Encyclopédie Dance Lab</span>
                  <h3 className="mfr-preview-title">Explorer les styles</h3>
                </div>
                <div className="mfr-style-preview" aria-hidden="true">
                  <div><img src="/images/styles-de-danse/jazz.png" alt="" /><span>Jazz</span></div>
                  <div><img src="/images/styles-de-danse/break.png" alt="" /><span>Break</span></div>
                  <div><img src="/images/styles-de-danse/danseclassique.png" alt="" /><span>Classique</span></div>
                  <div><img src="/images/sofiastanic.jpg" alt="" /><span>Waacking</span></div>
                  <div><img src="/images/les-invites-header/imagetest.png" alt="" /><span>Voguing</span></div>
                  <div><img src="/images/les-invites-header/imagetest.png" alt="" /><span>Krump</span></div>
                  <div><img src="/images/styles-de-danse/claquettes.png" alt="" /><span>Claquettes</span></div>
                  <div><img src="/images/les-invites-header/imagetest.png" alt="" /><span>Street jazz</span></div>
                  <div><img src="/images/les-invites-header/imagetest.png" alt="" /><span>Hip-hop</span></div>
                </div>
                <span className="mfr-preview-cta">Ouvrir l&apos;encyclopédie →</span>
              </div>
            </Link>
          </div>

          {/* ════════════════════════════════════════
              Carte 3 — Sortir (événement agenda)
              Apparaît en DERNIER
              ref={card4Ref} → animation [0.39 → 0.48]
          ════════════════════════════════════════ */}
          {event && (
            <div ref={card4Ref} className="mfr-card mfr-card--sortir">
              <Link
                href={`/sortir/${event.slug}`}
                className="mfr-card-inner"
                aria-label={event.title}
              >
                <div className="mfr-card-face mfr-card-face--front">
                  {/* Image locale imposée : aucun fallback vers event.image ou un visuel généré. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/sorties/parisfestivalete.png"
                    alt=""
                    aria-hidden="true"
                    className="mfr-card-img"
                    loading="lazy"
                  />
                  <div className="mfr-card-gradient" />
                  <div className="mfr-card-body mfr-card-body--lower">
                    <span className="mfr-badge mfr-badge--sort">Sortir</span>
                    <span className="mfr-card-cat">{event.category}&thinsp;·&thinsp;{event.city}</span>
                    <h2 className="mfr-card-title">{event.title}</h2>
                    <p className="mfr-card-chapo">{event.description}</p>
                    <div className="mfr-card-foot">
                      <span className="mfr-card-meta">{event.dates}</span>
                      <span className="mfr-card-cta mfr-card-cta--sort">Voir l&apos;événement →</span>
                    </div>
                  </div>
                </div>
                <div className="mfr-card-face mfr-card-face--back mfr-card-back mfr-card-back--event">
                  <span className="mfr-preview-kicker">Informations pratiques</span>
                  <h3 className="mfr-preview-title">{event.title}</h3>
                  <dl className="mfr-event-facts">
                    <div><dt>Dates</dt><dd>{eventDates}</dd></div>
                    <div><dt>Lieux</dt><dd>{eventVenue}</dd></div>
                    {eventTimes ? <div><dt>Horaires</dt><dd>{eventTimes}</dd></div> : null}
                    {eventPrice ? <div><dt>Tarifs</dt><dd>{eventPrice}</dd></div> : null}
                    {isParisSummerFestival ? (
                      <div><dt>Programme</dt><dd>Danse, performance, cirque, théâtre et propositions en espace public</dd></div>
                    ) : null}
                  </dl>
                  <span className="mfr-preview-cta">Voir l&apos;événement →</span>
                </div>
              </Link>
            </div>
          )}

          {/* ── Label de composition — apparaît en dernier ── */}
          <div ref={labelRef} className="mfr-label" aria-hidden="true">
            <span className="mfr-label-tag mfr-label-tag--mag">Magazine</span>
            <span className="mfr-label-sep">·</span>
            <span className="mfr-label-tag mfr-label-tag--exp">Explorer</span>
            {event && (
              <>
                <span className="mfr-label-sep">·</span>
                <span className="mfr-label-tag mfr-label-tag--sort">Sortir</span>
              </>
            )}
          </div>

        </div>{/* /mfr-canvas */}
      </div>{/* /mfr-sticky */}
    </section>
  )
}
