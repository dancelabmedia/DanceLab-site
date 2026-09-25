"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { safeExplorerReturnTo } from '@/data/section-visibility'
import { localizedHref, type Locale } from '@/lib/i18n/routing'
import { uiText } from '@/data/i18n/messages'
import type { ComingSoonStats } from '@/data/site-stats'

const Arrow = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M5 12h14M14 7l5 5-5 5" />
  </svg>
)

// ── Contenu éditorial par rubrique ────────────────────────────────────────────
type SectionConfig = {
  kicker: string
  titleLine1: string
  titleLine2: string
  intro: string
  image: string
  imageAlt: string
  number: string
}

const SECTION_CONFIGS: Record<string, SectionConfig> = {
  "/sortir": {
    kicker: "Bientôt sur Dance Lab",
    titleLine1: "Cette rubrique",
    titleLine2: "se prépare.",
    intro: "On travaille encore sur cette partie du média. Elle sera bientôt accessible.",
    image: "/images/sorties/imagefond.png",
    imageAlt: "",
    number: "02",
  },
  "/explorer/artistes": {
    kicker: "Bientôt sur Dance Lab",
    titleLine1: "Les portraits qui",
    titleLine2: "font la danse.",
    intro: "Interprètes, pédagogues, créateurs et performeurs : une galerie éditoriale consacrée à celles et ceux qui font vivre la danse.",
    image: "/images/fond3.png",
    imageAlt: "",
    number: "03",
  },
  "/explorer/choregraphes": {
    kicker: "Bientôt sur Dance Lab",
    titleLine1: "Celles et ceux",
    titleLine2: "qui écrivent la danse.",
    intro: "Signatures, processus de création, œuvres clés : un espace éditorial pour lire la danse à travers ses auteurs.",
    image: "/images/fond5.png",
    imageAlt: "",
    number: "04",
  },
  "/explorer/compagnies": {
    kicker: "Bientôt sur Dance Lab",
    titleLine1: "Les collectifs qui",
    titleLine2: "donnent corps à la danse.",
    intro: "Répertoires, esthétiques, structures de production : un annuaire éditorial des compagnies qui font vivre le plateau.",
    image: "/images/fond8.png",
    imageAlt: "",
    number: "05",
  },
}

// Config par défaut (Sortir, Apprendre, et tout autre chemin)
const DEFAULT_CONFIG: SectionConfig = {
  kicker: "Bientôt sur Dance Lab",
  titleLine1: "Cette rubrique",
  titleLine2: "se prépare.",
  intro: "On travaille encore sur cette partie du média. Elle sera bientôt accessible.",
  image: "/images/sorties/imagefond.png",
  imageAlt: "",
  number: "02",
}

/** Une seule composition pour tous les accès privés, deux vérifications serveur. */
export default function PrivateAccessPage({ mode = 'preview', returnTo, localWorkHref, locale = 'fr', stats }: { mode?: 'preview' | 'explorer'; returnTo?: string; localWorkHref?: string; locale?: Locale; stats: ComingSoonStats }) {
  const t = (text: string) => uiText(locale, text)
  const href = (path: string) => localizedHref(path, locale)
  const router = useRouter()
  const searchParams = useSearchParams()
  const isExplorer = mode === 'explorer'
  const redirect = isExplorer ? safeExplorerReturnTo(returnTo) : searchParams.get("redirect") || "/"
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Normalise le chemin redirect pour matcher exactement (sans trailing slash ni query)
  const redirectPath = redirect.split("?")[0].replace(/\/$/, "")
  const section = isExplorer
    ? { ...DEFAULT_CONFIG, intro: 'Son contenu est actuellement en cours de vérification.' }
    : SECTION_CONFIGS[redirectPath] ?? DEFAULT_CONFIG
  const inputId = isExplorer ? 'explorer-access-code' : 'preview-password'

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (loading) return
    setError("")
    setLoading(true)
    try {
      const response = await fetch(isExplorer ? "/api/explorer-access" : "/api/acces-prive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'same-origin',
        body: JSON.stringify(isExplorer ? { code: password, returnTo: redirect } : { password }),
      })
      const data = isExplorer ? await response.json() : null
      if (response.ok) {
        if (isExplorer) {
          // Le rechargement efface les anciennes réponses du cache de navigation.
          window.location.assign(href(data.returnTo))
        } else {
          router.push(href(redirect))
          router.refresh()
        }
      } else {
        setError(t(isExplorer ? data.error || "L’accès n’a pas pu être vérifié." : "Mot de passe incorrect."))
        setPassword("")
      }
    } catch {
      setError(t("Une erreur est survenue. Réessaie."))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="access-page">
      <div className="access-photo" aria-hidden="true">
        <Image src={section.image} alt={section.imageAlt} fill priority sizes="(max-width: 760px) 100vw, 64vw" />
      </div>
      <div className="access-wash" aria-hidden="true" />
      <span className="access-vertical" aria-hidden="true">Dance Lab</span>

      <section className="access-editorial" aria-labelledby="access-title">
        <p className="access-kicker">{t(section.kicker)}</p>
        <span className="access-rule" aria-hidden="true" />
        <h1 id="access-title">{t(section.titleLine1)}<em>{t(section.titleLine2)}</em></h1>
        <span className="access-rule access-rule--light" aria-hidden="true" />
        <p className="access-intro">{t(section.intro)}</p>
        <div className="access-number" aria-hidden="true">{section.number}</div>
        <div className="access-waiting">
          <span>{t(localWorkHref ? 'Édition locale' : 'En attendant')}</span>
          <Link href={href(localWorkHref || '/')}><Arrow />{t(localWorkHref ? 'Ouvrir la page de travail' : 'Retour à l\'accueil')}</Link>
        </div>
        <div className="access-stats" aria-label="Dance Lab en quelques chiffres">
          <div><strong>{stats.conversations}</strong><span>{t('Conversations')}</span></div>
          <div><strong>{stats.cumulativeListens}</strong><span>{t('Écoutes')}<br />{t('cumulées')}</span></div>
          <div><strong>{stats.cumulativeViews}</strong><span>{t('Vues')}<br />{t('cumulées')}</span></div>
        </div>
      </section>

      <div className="access-divider" aria-hidden="true"><span /></div>

      <section className="access-panel" aria-labelledby="private-access-title">
        <div className="access-lock" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="5" y="10" width="14" height="11" rx="1" />
            <path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" />
          </svg>
        </div>
        <p className="access-panel-title" id="private-access-title">{t('Accès privé')}</p>
        <span className="access-panel-rule" aria-hidden="true" />
        <p className="access-question">{locale === 'fr' ? <>Vous avez un accès anticipé&nbsp;?</> : t('Vous avez un accès anticipé ?')}</p>
        <form onSubmit={handleSubmit} className="access-form">
          <label className="sr-only" htmlFor={inputId}>{t(isExplorer ? 'Votre code d’accès' : 'Mot de passe')}</label>
          <div className="access-input-wrap">
            <input
              id={inputId}
              name={isExplorer ? 'code' : 'password'}
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={t(isExplorer ? 'Entrer le code d’accès' : 'Entrer le mot de passe')}
              autoComplete="current-password"
              required
              maxLength={isExplorer ? 512 : undefined}
              disabled={loading}
              aria-describedby={error ? "access-error" : undefined}
              aria-invalid={Boolean(error)}
            />
            <button
              type="button"
              className="access-toggle"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={t(showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe")}
              aria-pressed={showPassword}
            >
              {showPassword ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 4.2A10 10 0 0 1 12 4c7 0 10 8 10 8a15 15 0 0 1-2.1 3.2M6.6 6.6C3.5 8.5 2 12 2 12s3 8 10 8a10 10 0 0 0 5.4-1.6" /></svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M2 12s3-8 10-8 10 8 10 8-3 8-10 8-10-8-10-8Z" /><circle cx="12" cy="12" r="3" /></svg>
              )}
            </button>
          </div>
          {error && <p className="access-error" id="access-error" role="alert">{error}</p>}
          <button type="submit" className="access-submit" disabled={loading || !password}>
            <span>{t(loading ? "Vérification…" : "Accéder")}</span>
            {!loading && <Arrow />}
          </button>
        </form>
        <p className="access-note">{t('Accès réservé aux partenaires et contributeurs.')}</p>
      </section>

      <p className="access-signature">{t('Le média')}<br />{t('référence')}<br />{t('sur la danse')} <span /></p>

      <style>{`
        .access-page {
          --ink: #101719; --mist: #c3d2dc;
          position: relative; min-height: 100svh;
          padding: calc(var(--nav-h) + clamp(56px, 7vh, 90px)) clamp(64px, 7.8vw, 150px) clamp(42px, 5vh, 70px);
          overflow: hidden; display: grid;
          grid-template-columns: minmax(420px, 1.08fr) 1px minmax(340px, .92fr);
          gap: clamp(42px, 5vw, 96px); align-items: center;
          color: var(--ink); background: #6f8792; box-sizing: border-box; isolation: isolate;
        }
        .access-photo { position: absolute; z-index: 0; inset: var(--nav-h) 0 0; }
        .access-photo img { object-fit: cover; object-position: center; filter: saturate(.76) contrast(1.03); }
        .access-wash {
          position: absolute; z-index: 1; inset: var(--nav-h) 0 0;
          background:
            linear-gradient(90deg, rgba(194,210,220,.48) 0%, rgba(162,188,202,.30) 36%, rgba(54,81,94,.08) 62%, rgba(9,22,29,.20) 100%),
            linear-gradient(180deg, rgba(16,35,44,.02) 0%, rgba(9,22,29,.16) 100%);
        }
        .access-editorial { align-self: stretch; display: flex; flex-direction: column; justify-content: center; position: relative; z-index: 2; max-width: 650px; }
        .access-kicker, .access-panel-title { margin: 0; text-transform: uppercase; letter-spacing: .28em; font-size: 12px; font-weight: 700; }
        .access-rule { width: 42px; height: 1px; background: rgba(16,23,25,.58); margin: 24px 0 28px; }
        .access-rule--light { width: 36px; margin: 22px 0; background: rgba(255,255,255,.85); }
        .access-editorial h1 { margin: 0; font-family: var(--font-display, Aileron, sans-serif); font-size: clamp(58px, 5.25vw, 96px); font-weight: 300; line-height: .9; letter-spacing: -.052em; max-width: 700px; }
        .access-editorial h1 em { display: block; font-weight: 300; }
        .access-intro { margin: 0; font-size: clamp(15px, 1.18vw, 20px); line-height: 1.6; }
        .access-number { position: absolute; left: -5vw; bottom: 80px; font-family: var(--font-display, Aileron, sans-serif); font-size: clamp(150px, 18vw, 290px); font-weight: 300; line-height: .7; color: transparent; -webkit-text-stroke: 1px rgba(255,255,255,.27); opacity: .75; z-index: -1; }
        .access-waiting { align-self: flex-end; margin: 14vh 4% 0 0; text-transform: uppercase; font-size: 9px; font-weight: 700; letter-spacing: .24em; }
        .access-waiting > span { display: block; margin-bottom: 11px; }
        .access-waiting a { color: inherit; display: flex; align-items: center; gap: 18px; font-size: 11px; font-weight: 400; letter-spacing: 0; text-transform: none; border-bottom: 1px solid rgba(16,23,25,.5); padding-bottom: 7px; }
        .access-waiting svg { width: 17px; height: 17px; }
        .access-stats { display: flex; margin-top: 7vh; }
        .access-stats div { padding: 0 27px; border-left: 1px solid rgba(16,23,25,.42); }
        .access-stats div:first-child { padding-left: 0; border-left: 0; }
        .access-stats strong { display: block; font-family: var(--font-display, Aileron, sans-serif); font-size: clamp(24px, 2.25vw, 38px); font-weight: 300; line-height: 1; }
        .access-stats span { display: block; margin-top: 8px; text-transform: uppercase; letter-spacing: .17em; font-size: 8px; font-weight: 600; line-height: 1.45; }
        .access-divider { position: relative; z-index: 2; width: 1px; height: 74%; background: rgba(255,255,255,.55); display: flex; align-items: center; }
        .access-divider span { display: block; width: 7px; height: 7px; margin-left: -3px; border-radius: 50%; background: #fff; box-shadow: 0 0 0 8px rgba(255,255,255,.05); }
        .access-panel { position: relative; z-index: 2; width: min(100%, 390px); color: #f5f8fa; justify-self: start; text-shadow: 0 1px 14px rgba(4,14,19,.18); }
        .access-lock { width: 55px; height: 55px; border: 1px solid rgba(255,255,255,.85); border-radius: 50%; display: grid; place-items: center; margin-bottom: 30px; }
        .access-lock svg { width: 23px; height: 23px; }
        .access-panel-title { font-size: 13px; }
        .access-panel-rule { display: block; width: 35px; height: 1px; background: rgba(255,255,255,.8); margin: 18px 0 25px; }
        .access-question { margin: 0 0 22px; font-size: 15px; }
        .access-form { display: flex; flex-direction: column; gap: 14px; }
        .access-input-wrap { position: relative; }
        .access-input-wrap input { width: 100%; height: 58px; border: 1px solid rgba(255,255,255,.76); border-radius: 11px; background: rgba(14,33,43,.38); color: #fff; padding: 0 50px 0 15px; font: inherit; font-size: 14px; outline: none; box-sizing: border-box; backdrop-filter: blur(8px); }
        .access-input-wrap input::placeholder { color: rgba(255,255,255,.8); }
        .access-input-wrap input:focus { border-color: #fff; box-shadow: 0 0 0 3px rgba(195,210,220,.18); background: rgba(14,33,43,.54); }
        .access-toggle { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); width: 34px; height: 34px; display: grid; place-items: center; color: #fff; border: 0; border-radius: 50%; background: transparent; cursor: pointer; }
        .access-toggle:hover { background: rgba(255,255,255,.1); }
        .access-toggle:focus-visible, .access-submit:focus-visible, .access-waiting a:focus-visible { outline: 2px solid #fff; outline-offset: 3px; }
        .access-toggle svg { width: 21px; height: 21px; }
        .access-submit { width: 100%; height: 59px; border: 0; border-radius: 11px; background: var(--mist); color: #111a1e; display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; padding: 0 18px; text-transform: uppercase; letter-spacing: .23em; font: 700 11px var(--font-body, sans-serif); cursor: pointer; transition: background .2s, transform .2s; }
        .access-submit span { grid-column: 2; }
        .access-submit svg { grid-column: 3; justify-self: end; width: 21px; height: 21px; }
        .access-submit:hover:not(:disabled) { background: #d9e4eb; transform: translateY(-1px); }
        .access-submit:disabled { opacity: .58; cursor: not-allowed; }
        .access-error { margin: -2px 0 0; color: #ffe1de; font-size: 12px; }
        .access-note { margin: 24px 0 0; font-size: 11px; color: rgba(255,255,255,.7); }
        .access-vertical { position: absolute; z-index: 2; left: 27px; bottom: 95px; color: rgba(10,19,23,.8); text-transform: uppercase; writing-mode: vertical-rl; transform: rotate(180deg); letter-spacing: .38em; font-size: 8px; font-weight: 700; }
        .access-signature { position: absolute; z-index: 2; right: 42px; bottom: 38px; margin: 0; color: rgba(255,255,255,.9); text-transform: uppercase; letter-spacing: .22em; font-size: 8px; font-weight: 600; line-height: 1.6; display: flex; align-items: center; gap: 22px; }
        .access-signature span { display: block; width: 64px; height: 1px; background: rgba(255,255,255,.6); }
        .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
        /* Desktop uniquement — fond commun à toutes les rubriques privées.
           Remplace automatiquement l'image par section : toute nouvelle rubrique
           ajoutée utilisera fondlaptop.png sans configuration supplémentaire. */
        @media (min-width: 761px) {
          /* Fond commun à toutes les rubriques privées */
          .access-photo {
            background-image: url('/images/fondlaptop.png');
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
          }
          .access-photo img { opacity: 0; }
          /* Épuration desktop : suppression des éléments décoratifs */
          .access-number { display: none; }
          .access-divider span { display: none; }
          .access-rule { display: none; }
          .access-panel-rule { display: none; }
          .access-signature span { display: none; }
        }
        @media (max-width: 1100px) {
          .access-page { padding-left: 7vw; padding-right: 7vw; grid-template-columns: minmax(380px, 1fr) 1px minmax(310px, .8fr); gap: 40px; }
          .access-editorial h1 { font-size: clamp(55px, 6vw, 72px); }
          .access-waiting { margin-top: 10vh; }
          .access-signature { display: none; }
        }
        @media (max-width: 760px) {
          .access-page { min-height: 100svh; display: block; padding: calc(var(--nav-h) + 44px) 22px 46px; overflow: hidden; color: #f6f8f9; background: #263e4b; }
          .access-photo { inset: var(--nav-h) 0 0; height: auto; }
          .access-photo img { object-position: center; filter: saturate(.72) contrast(1.04); }
          .access-wash { background: linear-gradient(180deg, rgba(26,50,63,.24) 0%, rgba(25,47,58,.56) 48%, rgba(24,45,56,.78) 100%); }
          .access-editorial { min-height: 0; display: block; padding-right: 6vw; }
          .access-kicker { font-size: 10px; }
          .access-rule { margin: 18px 0 20px; background: rgba(255,255,255,.65); }
          .access-editorial h1 { font-size: clamp(47px, 14vw, 70px); line-height: .92; max-width: 520px; text-shadow: 0 2px 24px rgba(9,23,30,.25); }
          .access-rule--light { margin: 19px 0; }
          .access-intro { font-size: 14px; line-height: 1.55; }
          .access-number, .access-waiting, .access-stats, .access-divider, .access-vertical, .access-signature { display: none; }
          .access-panel { position: relative; width: 100%; margin: 48px auto 0; padding-top: 18px; border-top: 1px solid rgba(255,255,255,.34); }
          .access-lock { width: 45px; height: 45px; margin-bottom: 20px; }
          .access-lock svg { width: 20px; height: 20px; }
          .access-panel-title { font-size: 11px; }
          .access-panel-rule { margin: 15px 0 20px; }
          .access-question { font-size: 14px; margin-bottom: 17px; }
          .access-input-wrap input, .access-submit { height: 56px; }
          .access-note { line-height: 1.5; }
        }
        @media (max-height: 760px) and (min-width: 761px) {
          .access-page { padding-top: calc(var(--nav-h) + 34px); padding-bottom: 30px; }
          .access-waiting { margin-top: 7vh; }
          .access-stats { margin-top: 5vh; }
          .access-number { bottom: 40px; }
          .access-panel { transform: scale(.94); transform-origin: left center; }
        }
        @media (prefers-reduced-motion: reduce) { .access-submit { transition: none; } }
      `}</style>
    </main>
  )
}
