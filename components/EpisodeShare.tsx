"use client";

import { useState } from "react";

type EpisodeShareProps = {
  title: string;
  url: string;
};

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20.5 11.7a8.5 8.5 0 0 1-12.6 7.4L3.5 20.5l1.4-4.2a8.5 8.5 0 1 1 15.6-4.6Z" />
      <path d="M8.2 7.7c.2-.4.4-.4.7-.4h.5c.2 0 .4.1.5.4l.8 2c.1.3 0 .5-.1.7l-.6.8c-.2.2-.1.4 0 .6.6 1.1 1.5 2 2.6 2.6.2.1.4.2.6 0l.9-1c.2-.2.4-.3.7-.2l1.9.9c.3.1.4.3.4.5 0 .4-.2 1.3-.7 1.8-.5.6-1.3.9-2.2.7-1-.2-2.9-.9-4.9-2.7-1.6-1.5-2.7-3.3-3-4.4-.2-.9 0-1.7.5-2.3Z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 9.5v9" />
      <path d="M5 5.5v.1" />
      <path d="M9.5 18.5v-9" />
      <path d="M9.5 13.5a4 4 0 0 1 4-4c2.8 0 4.5 1.8 4.5 4.8v4.2" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 4.5 19 19.5M19 4.5 5 19.5" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M14.5 20v-7h2.7l.4-3h-3.1V8.1c0-.9.3-1.6 1.6-1.6H18V3.8c-.6-.1-1.4-.2-2.4-.2-2.4 0-4.1 1.5-4.1 4.2V10H9v3h2.5v7" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export default function EpisodeShare({ title, url }: EpisodeShareProps) {
  const [fallbackOpen, setFallbackOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  async function openMoreOptions() {
    if (navigator.share) {
      try {
        await navigator.share({ title, text: title, url });
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setFallbackOpen(true);
      }
      return;
    }

    setFallbackOpen((isOpen) => !isOpen);
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const input = document.createElement("textarea");
      input.value = url;
      input.style.position = "fixed";
      input.style.opacity = "0";
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      input.remove();
    }

    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="episode-share">
      <a
        className="episode-share-button"
        href={`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Partager sur WhatsApp"
        title="WhatsApp"
      >
        <WhatsAppIcon />
      </a>
      <a
        className="episode-share-button"
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Partager sur LinkedIn"
        title="LinkedIn"
      >
        <LinkedInIcon />
      </a>
      <a
        className="episode-share-button"
        href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Partager sur X"
        title="X"
      >
        <XIcon />
      </a>
      <a
        className="episode-share-button"
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Partager sur Facebook"
        title="Facebook"
      >
        <FacebookIcon />
      </a>
      <button
        className="episode-share-button episode-share-more"
        type="button"
        onClick={openMoreOptions}
        aria-label="Plus d’options de partage"
        aria-expanded={fallbackOpen}
        title="Plus d’options"
      >
        <PlusIcon />
      </button>

      {fallbackOpen ? (
        <div className="episode-share-menu" role="menu">
          <a
            href={`https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`}
            target="_blank"
            rel="noopener noreferrer"
            role="menuitem"
          >
            Telegram
          </a>
          <a
            href={`mailto:?subject=${encodedTitle}&body=${encodedTitle}%0A%0A${encodedUrl}`}
            role="menuitem"
          >
            Email
          </a>
          <button type="button" onClick={copyLink} role="menuitem">
            {copied ? "Lien copié" : "Copier le lien"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
