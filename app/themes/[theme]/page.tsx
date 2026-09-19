/**
 * app/themes/[theme]/page.tsx
 * Page de navigation thématique — liste tous les épisodes d'un tag donné.
 *
 * URL : /themes/sante-mentale, /themes/entrepreneuriat, etc.
 * Le slug URL (tirets) est converti en clé interne (underscores) par slugToKey().
 */

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { episodes } from "@/data/episodes";
import { getEpisodes } from "@/lib/episodes";
import {
  TAG_LABEL,
  TAG_TAXONOMY,
  getEpisodeTags,
  keyToSlug,
  slugToKey,
} from "@/lib/episode-themes";
import { SITE_URL } from "@/data/site";
import { requestLocale } from "@/lib/i18n/server";
import { uiText } from "@/data/i18n/messages";

export const revalidate = 3600;
export const dynamicParams = true;

// ─── Params ───────────────────────────────────────────────────────────────────

type PageProps = { params: Promise<{ theme: string }> };

// ─── Génération statique des slugs connus ──────────────────────────────────────

export async function generateStaticParams() {
  return TAG_TAXONOMY.map(({ key }) => ({ theme: keyToSlug(key) }));
}

// ─── Métadonnées ──────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { theme: themeSlug } = await params;
  const key   = slugToKey(themeSlug);
  const label = TAG_LABEL[key];
  if (!label) return {};

  return {
    title: `${label} — Dance Lab Podcast`,
    description: `Tous les épisodes du podcast Dance Lab sur le thème « ${label} ».`,
    alternates: {
      canonical: new URL(`/themes/${themeSlug}`, SITE_URL).toString(),
    },
  };
}

// ─── Helpers image (copié de EcouterClient pour cohérence) ────────────────────

function getGuestCardImage(image: string, guest: string, number: number): string {
  const filename = image.split("/").pop();
  if (filename && filename !== "logo.png" && !filename.match(/^\d+\.(jpg|png)$/i)) {
    return `/images/les-invites/${filename}`;
  }
  return image;
}

// ─── Composant ───────────────────────────────────────────────────────────────

export default async function ThemePage({ params }: PageProps) {
  const { theme: themeSlug } = await params;
  const key   = slugToKey(themeSlug);
  const label = TAG_LABEL[key];
  if (!label) notFound();
  const locale = await requestLocale();
  const t = (text: string) => uiText(locale, text);

  // ── Épisodes statiques (1–121) ─────────────────────────────────────────────
  const matchingStatic = episodes
    .filter((ep) => {
      const text = [ep.title, ep.excerpt, ep.description].join(" ");
      return getEpisodeTags(text, 99).includes(key);
    })
    .map((ep) => ({
      number: ep.number,
      slug:   ep.slug,
      title:  ep.title,
      guest:  ep.guest,
      image:  ep.image,
      excerpt: ep.excerpt,
      fromRSS: false as const,
    }));

  // ── Épisodes RSS (≥ 122) ───────────────────────────────────────────────────
  const allUnified = await getEpisodes();
  const matchingRSS = allUnified
    .filter((ep) => ep.fromRSS) // évite les doublons avec matchingStatic
    .filter((ep) => {
      const text = [ep.title, ep.excerpt, ep.description].join(" ");
      return getEpisodeTags(text, 99).includes(key);
    })
    .map((ep) => ({
      number:  ep.number,
      slug:    ep.slug,
      title:   ep.title,
      guest:   ep.guest,
      image:   ep.image,
      excerpt: ep.excerpt,
      fromRSS: true as const,
    }));

  // Tous les épisodes, du plus récent au plus ancien
  const allMatching = [...matchingRSS, ...matchingStatic].sort(
    (a, b) => b.number - a.number
  );

  // Tous les tags (pour la navigation en bas de page)
  const allTags = TAG_TAXONOMY.map(({ key: k, label: l }) => ({
    key: k,
    label: l,
    slug: keyToSlug(k),
    active: k === key,
  }));

  return (
    <main className="theme-page">

      {/* ── En-tête ── */}
      <header className="theme-header">
        <Link href="/ecouter" className="theme-back">
          {t('← Tous les épisodes')}
        </Link>
        <div className="theme-header-inner">
          <p className="theme-eyebrow">{t('Thème')}</p>
          <h1 className="theme-title">{label}</h1>
          <p className="theme-count">
            {allMatching.length === 0
              ? t('Aucun épisode')
              : allMatching.length === 1
              ? `1 ${t('épisode')}`
              : `${allMatching.length} ${t('épisodes')}`}
          </p>
        </div>
      </header>

      {/* ── Grille d'épisodes ── */}
      <section className="theme-grid-section">
        <div className="container">
          {allMatching.length === 0 ? (
            <p className="theme-empty">
              {t('Aucun épisode trouvé pour ce thème pour le moment.')}
            </p>
          ) : (
            <div className="ep2-grid theme-ep-grid">
              {allMatching.map((ep) => (
                <Link
                  key={ep.number}
                  href={`/episodes/${ep.slug}`}
                  className="ep2-card"
                >
                  <div className="ep2-card-img-wrap">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getGuestCardImage(ep.image, ep.guest, ep.number)}
                      alt={ep.guest}
                      className="ep2-card-img"
                      loading="lazy"
                    />
                  </div>
                  <div className="ep2-card-content">
                    <span className="ep2-card-number">{t('Épisode')} {ep.number}</span>
                    <p className="ep2-card-title">{ep.title}</p>
                    <p className="ep2-card-guest">{t('Avec')} {ep.guest}</p>
                    <span className="ep2-card-btn">
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true" style={{ marginRight: 5 }}>
                        <polygon points="2,1 11,6 2,11" />
                      </svg>
                      {t("Écouter l'épisode")}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Navigation vers les autres thèmes ── */}
      <section className="theme-nav-section">
        <div className="container">
          <p className="theme-nav-label">{t("Explorer d'autres thèmes")}</p>
          <div className="theme-nav-tags">
            {allTags.map((t) => (
              <Link
                key={t.key}
                href={`/themes/${t.slug}`}
                className={`ep-topic-pill theme-nav-tag${t.active ? " ep-topic-pill--active" : ""}`}
                aria-current={t.active ? "page" : undefined}
              >
                {t.label}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
