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
   Explorer features — tournent selon le jour du mois
   Chaque entrée pointe vers une rubrique Explorer distincte.
───────────────────────────────────────────────────────── */
type ExplorerFeature = {
  section: string
  label:   string
  kicker:  string
  title:   string
  chapo:   string
  image:   string
  href:    string
  quote:   string
}

const EXPLORER_FEATURES: ExplorerFeature[] = [
  {
    section: 'styles-de-danse',
    label:   'Styles de danse',
    kicker:  'Langages',
    title:   'Styles de danse',
    chapo:   'Hip-hop, contemporain, classique, afro, waacking — chaque style porte une histoire et une manière d\'habiter le corps.',
    image:   '/images/styles-de-danse/break.png',
    href:    '/explorer/styles-de-danse',
    quote:   'Explorer un style, c\'est entrer dans une histoire, une musicalité et une façon de penser le monde.',
  },
  {
    section: 'choregraphes',
    label:   'Chorégraphes',
    kicker:  'Création',
    title:   'Chorégraphes',
    chapo:   'Ils composent des mondes, inventent des langages et donnent une forme sensible aux idées. Lire la danse à travers celles et ceux qui l\'écrivent.',
    image:   '/images/maiwenn-danse.jpg',
    href:    '/explorer/choregraphes',
    quote:   'Un chorégraphe organise une attention, une écoute et une manière de regarder les corps.',
  },
  {
    section: 'artistes',
    label:   'Artistes',
    kicker:  'Portraits',
    title:   'Artistes',
    chapo:   'Interprètes, enseignants, performeurs, créateurs de contenus : la danse se raconte aussi par les trajectoires individuelles.',
    image:   '/images/sofiastanic.jpg',
    href:    '/explorer/artistes',
    quote:   'Chaque parcours d\'artiste raconte une manière de tenir dans le métier et de transformer une pratique en langage.',
  },
  {
    section: 'compagnies',
    label:   'Compagnies',
    kicker:  'Scènes',
    title:   'Compagnies',
    chapo:   'Répertoires, tournées, esthétiques : chaque compagnie est un écosystème humain qui rend le mouvement possible.',
    image:   '/images/styles-de-danse/danseclassique.png',
    href:    '/explorer/compagnies',
    quote:   'Derrière une compagnie, il y a une vision artistique et une structure humaine qui rend le mouvement possible.',
  },
  {
    section: 'metiers-de-la-danse',
    label:   'Métiers',
    kicker:  'Professionnel',
    title:   'Métiers de la danse',
    chapo:   'Danseur, chorégraphe, répétiteur, régisseur, professeur : la danse est un ensemble de compétences et de responsabilités.',
    image:   '/images/styles-de-danse/claquettes.png',
    href:    '/explorer/metiers-de-la-danse',
    quote:   'Le plateau n\'est que la partie visible d\'un écosystème immense.',
  },
]

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
  const card2Ref   = useRef<HTMLDivElement>(null)   // Explorer (2e à apparaître)
  const card4Ref   = useRef<HTMLDivElement>(null)   // Sortir (position et timing conservés)
  const labelRef   = useRef<HTMLDivElement>(null)

  /* ── Feature Explorer — toujours Styles de danse ─────────────────────── */
  const explorerFeature = EXPLORER_FEATURES[0]

  /* ── Informations pratiques de l'événement Sortir ─────────────────────── */
  const eventDates = event
    ? event.dates !== 'À compléter'
      ? event.dates
      : event.endDate && event.endDate !== event.startDate
        ? `${formatAgendaDate(event.startDate)} au ${formatAgendaDate(event.endDate)}`
        : formatAgendaDate(event.startDate)
    : ''

  const eventVenue = event
    ? [event.venue, event.city]
        .filter((v) => v && v !== 'À compléter')
        .join(' · ')
    : ''

  const eventPrice = event?.price !== 'À compléter' ? event?.price ?? null : null
  const eventTimes = event?.time ?? null

  /* Image de la carte Sortir — utilise event.image si disponible */
  const sortirImage = event?.image ?? '/images/sorties/parisfestivalete.png'

  useEffect(() => {
    const section = sectionRef.current
    const c1  = card1Ref.current   // Magazine
    const c2  = card2Ref.current   // Explorer
    const c4  = card4Ref.current   // Sortir (peut être null si pas d'événement)
    const lbl = labelRef.current
    if (!section || !c1 || !c2 || !lbl) return

    if (window.innerWidth <= 768) return

    /* ── États initiaux invisibles — JS anime vers visible ── */
    c1.style.opacity  = '0'
    c1.style.transform = 'translate(-9vw, 9vh) scale(0.95)'

    // Explorer (haut-droite) — reprend exactement l'entrée du Podcast
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
      c2!.classList.toggle('mfr-card--entry-smoothing', p < 0.60)
      c4?.classList.toggle('mfr-card--entry-smoothing', p < 0.68)

      /* ── ENTRÉE — ordre : Magazine → Explorer → Sortir ────────────────── */
      // Cascade séquencée et premium : ① part en premier, ② et ③ anticipés
      // pour que les trois cartes soient en place ensemble plus tôt.
      // Espacement réduit : ~16 % entre chaque départ au lieu de ~28 %.

      /* ① Magazine — timing inchangé */
      const c1e  = ssp(0.22, 0.52, p)
      const c1s  = ss(0.76, 0.84, p)
      const c1tx = lerp(-9, 0, c1e) + lerp(0, -2, c1s)
      const c1ty = lerp(9, 0, c1e)

      /* ② Explorer — anticipé : démarre à 0.38 au lieu de 0.50 */
      const c2e  = ssp(0.38, 0.60, p)
      const c2tx = lerp(9, 0, c2e)
      const c2ty = lerp(-9, 0, c2e)

      /* ③ Sortir — anticipé : démarre à 0.48 au lieu de 0.62 */
      const c4e  = ssp(0.48, 0.68, p)
      const c4ty = lerp(10, 0, c4e)

      /* ── SORTIES INDIVIDUELLES — inchangées ─────────────────────────── */
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

      /* Label — apparaît une fois toutes les cartes en place (synchronisé avec c4) */
      lbl!.style.opacity = (ss(0.68, 0.76, p) * (1 - c4x)).toFixed(3)
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
                <div className="mfr-card-body mfr-card-body--lower">
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
              Carte 2 — Explorer
              Tourne entre les 5 rubriques de la section.
              Apparaît en DEUXIÈME
          ════════════════════════════════════════ */}
          <div ref={card2Ref} className="mfr-card mfr-card--style">
            <Link
              href={explorerFeature.href}
              className="mfr-card-inner"
              aria-label={`Explorer — ${explorerFeature.title}`}
            >
              <div className="mfr-card-face mfr-card-face--front">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={explorerFeature.image}
                  alt=""
                  aria-hidden="true"
                  className="mfr-card-img"
                  loading="lazy"
                />
                <div className="mfr-card-gradient" />
                <div className="mfr-card-body mfr-card-body--exp mfr-card-body--lower">
                  <span className="mfr-badge mfr-badge--exp">Explorer</span>
                  <span className="mfr-card-cat">{explorerFeature.kicker}</span>
                  <h2 className="mfr-card-title">{explorerFeature.title}</h2>
                  <p className="mfr-card-chapo">{explorerFeature.chapo}</p>
                  <span className="mfr-card-cta mfr-card-cta--exp">Découvrir →</span>
                </div>
              </div>

              {/* Verso — styles : grille d'images ; autres rubriques : citation éditoriale */}
              {explorerFeature.section === 'styles-de-danse' ? (
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
                    <div><img src="/images/styles-de-danse/jazz.png" alt="" /><span>Voguing</span></div>
                    <div><img src="/images/styles-de-danse/break.png" alt="" /><span>Krump</span></div>
                    <div><img src="/images/styles-de-danse/claquettes.png" alt="" /><span>Claquettes</span></div>
                    <div><img src="/images/styles-de-danse/danseclassique.png" alt="" /><span>Street jazz</span></div>
                    <div><img src="/images/sofiastanic.jpg" alt="" /><span>Hip-hop</span></div>
                  </div>
                  <span className="mfr-preview-cta">Ouvrir l&apos;encyclopédie →</span>
                </div>
              ) : (
                <div className="mfr-card-face mfr-card-face--back mfr-card-back mfr-card-back--styles">
                  <div className="mfr-preview-browser" aria-hidden="true">
                    <span /><span /><span />
                  </div>
                  <div className="mfr-preview-image">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={explorerFeature.image} alt="" aria-hidden="true" loading="lazy" />
                  </div>
                  <span className="mfr-preview-kicker">Explorer · {explorerFeature.label}</span>
                  <h3 className="mfr-preview-title">{explorerFeature.title}</h3>
                  <p className="mfr-preview-copy">{explorerFeature.quote}</p>
                  <span className="mfr-preview-cta">Découvrir →</span>
                </div>
              )}
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
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={sortirImage}
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
                      <span className="mfr-card-meta">{eventDates}</span>
                      <span className="mfr-card-cta mfr-card-cta--sort">Voir l&apos;événement →</span>
                    </div>
                  </div>
                </div>
                <div className="mfr-card-face mfr-card-face--back mfr-card-back mfr-card-back--event">
                  <span className="mfr-preview-kicker">Informations pratiques</span>
                  <h3 className="mfr-preview-title">{event.title}</h3>
                  <dl className="mfr-event-facts">
                    <div><dt>Dates</dt><dd>{eventDates}</dd></div>
                    {eventVenue && <div><dt>Lieu</dt><dd>{eventVenue}</dd></div>}
                    {eventTimes ? <div><dt>Horaires</dt><dd>{eventTimes}</dd></div> : null}
                    {eventPrice ? <div><dt>Tarifs</dt><dd>{eventPrice}</dd></div> : null}
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
