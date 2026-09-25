"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

type Props = {
  youtubeId: string;
  title: string;
  isShort?: boolean;
  watchLabel: string;
};

type StageStyle = CSSProperties & { "--ep-mobile-video-progress": string };

/** Scroll-linked mobile transition. The iframe is created only after a user click. */
export default function MobileEpisodeYouTube({ youtubeId, title, isShort = false, watchLabel }: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;

    const update = () => {
      frame = 0;
      const rect = stage.getBoundingClientRect();
      const viewport = window.innerHeight;
      const travel = Math.max(1, viewport * 0.68);
      const progress = reducedMotion.matches
        ? 1
        : Math.max(0, Math.min(1, (viewport * 0.9 - rect.top) / travel));
      stage.style.setProperty("--ep-mobile-video-progress", progress.toFixed(3));
    };
    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    reducedMotion.addEventListener("change", requestUpdate);
    update();

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      reducedMotion.removeEventListener("change", requestUpdate);
    };
  }, []);

  const embedUrl = `https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`;
  const thumbnail = `https://img.youtube.com/vi/${youtubeId}/${isShort ? "hqdefault" : "maxresdefault"}.jpg`;

  return (
    <div
      ref={stageRef}
      className="ep-mobile-video-stage"
      style={{ "--ep-mobile-video-progress": "0" } as StageStyle}
      aria-label={watchLabel}
    >
      <div className="ep-mobile-video-sticky">
        <div className="ep-mobile-video-frame">
          {playing ? (
            <iframe
              src={embedUrl}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <button type="button" className="ep-mobile-video-poster" onClick={() => setPlaying(true)} aria-label={watchLabel}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={thumbnail} alt="" loading="lazy" />
              <span className="ep-mobile-video-play" aria-hidden="true">
                <svg viewBox="0 0 68 48"><path d="M66.52 7.74a8.23 8.23 0 0 0-5.8-5.84C55.68 0 34 0 34 0S12.32 0 7.28 1.9a8.23 8.23 0 0 0-5.8 5.84C0 12.8 0 24 0 24s0 11.2 1.48 16.26a8.23 8.23 0 0 0 5.8 5.84C12.32 48 34 48s21.68 0 26.72-1.9a8.23 8.23 0 0 0 5.8-5.84C68 35.2 68 24 68 24s0-11.2-1.48-16.26z" fill="rgba(0,0,0,.78)"/><path d="M27 34 45 24 27 14v20z" fill="#fff"/></svg>
              </span>
              <span className="ep-mobile-video-label">{watchLabel}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
