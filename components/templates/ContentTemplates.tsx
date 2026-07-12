import type { ReactNode } from "react"

export type ContentTemplateKey =
  | "article"
  | "interview"
  | "portrait"
  | "event"
  | "guide"
  | "gallery"
  | "podcast"
  | "selection"

export type ContentBlock = {
  heading?: string
  eyebrow?: string
  text?: string
  quote?: string
  items?: string[]
}

export type ContentItem = {
  title: string
  text?: string
  image?: string
  href?: string
  meta?: string
}

export type ContentTemplateData = {
  template?: string
  category?: string
  title: string
  subtitle?: string
  chapo?: string
  image?: string
  imageAlt?: string
  date?: string
  readTime?: string
  guest?: string
  role?: string
  quote?: string
  description?: string
  venue?: string
  city?: string
  price?: string
  duration?: string
  ctaLabel?: string
  ctaHref?: string
  tags?: string[]
  blocks?: ContentBlock[]
  items?: ContentItem[]
}

const allowedTemplates: ContentTemplateKey[] = [
  "article",
  "interview",
  "portrait",
  "event",
  "guide",
  "gallery",
  "podcast",
  "selection",
]

export function normalizeTemplateKey(value?: string): ContentTemplateKey {
  if (!value) return "article"

  const cleaned = value.trim().toLowerCase()

  if (allowedTemplates.includes(cleaned as ContentTemplateKey)) {
    return cleaned as ContentTemplateKey
  }

  return "article"
}

export function ContentTemplateRenderer({ content }: { content: ContentTemplateData }) {
  const template = normalizeTemplateKey(content.template)

  if (template === "interview") return <InterviewTemplate content={content} />
  if (template === "portrait") return <PortraitTemplate content={content} />
  if (template === "event") return <EventTemplate content={content} />
  if (template === "guide") return <GuideTemplate content={content} />
  if (template === "gallery") return <GalleryTemplate content={content} />
  if (template === "podcast") return <PodcastTemplate content={content} />
  if (template === "selection") return <SelectionTemplate content={content} />

  return <ArticleTemplate content={content} />
}

function TemplateShell({
  content,
  children,
  variant,
}: {
  content: ContentTemplateData
  children: ReactNode
  variant: ContentTemplateKey
}) {
  return (
    <main className={`content-template-page content-template-page--${variant}`}>
      <section className="template-hero">
        <div className="container template-hero-grid">
          <div className="template-hero-copy">
            {content.category ? <span className="section-label">{content.category}</span> : null}
            <h1>{content.title}</h1>
            {content.chapo ? <p className="template-chapo">{content.chapo}</p> : null}

            <div className="template-meta">
              {content.date ? <span>{content.date}</span> : null}
              {content.readTime ? <span>{content.readTime}</span> : null}
              {content.duration ? <span>{content.duration}</span> : null}
              {content.city ? <span>{content.city}</span> : null}
            </div>
          </div>

          {content.image ? (
            <div className="template-hero-image">
              <img src={content.image} alt={content.imageAlt || content.title} />
            </div>
          ) : null}
        </div>
      </section>

      {children}
    </main>
  )
}

function ArticleTemplate({ content }: { content: ContentTemplateData }) {
  return (
    <TemplateShell content={content} variant="article">
      <TemplateArticleBody content={content} />
    </TemplateShell>
  )
}

function InterviewTemplate({ content }: { content: ContentTemplateData }) {
  return (
    <TemplateShell content={content} variant="interview">
      <section className="template-body">
        <div className="container template-body-grid">
          <article className="template-main">
            {content.guest ? (
              <div className="template-guest-line">
                <span>Invité</span>
                <strong>{content.guest}</strong>
                {content.role ? <em>{content.role}</em> : null}
              </div>
            ) : null}

            {content.quote ? <TemplateQuote>{content.quote}</TemplateQuote> : null}
            <TemplateBlocks blocks={content.blocks} />
          </article>
          <TemplateSidebar content={content} />
        </div>
      </section>
    </TemplateShell>
  )
}

function PortraitTemplate({ content }: { content: ContentTemplateData }) {
  return (
    <TemplateShell content={content} variant="portrait">
      <section className="template-body">
        <div className="container template-portrait-layout">
          <article className="template-main">
            {content.quote ? <TemplateQuote>{content.quote}</TemplateQuote> : null}
            <TemplateBlocks blocks={content.blocks} />
          </article>
          <TemplateSidebar content={content} />
        </div>
      </section>
    </TemplateShell>
  )
}

function EventTemplate({ content }: { content: ContentTemplateData }) {
  return (
    <TemplateShell content={content} variant="event">
      <section className="template-body">
        <div className="container template-body-grid">
          <article className="template-main">
            <div className="template-info-grid">
              <TemplateInfo label="Lieu" value={content.venue} />
              <TemplateInfo label="Ville" value={content.city} />
              <TemplateInfo label="Prix" value={content.price} />
              <TemplateInfo label="Date" value={content.date} />
            </div>
            <TemplateBlocks blocks={content.blocks} />
          </article>
          <TemplateSidebar content={content} />
        </div>
      </section>
    </TemplateShell>
  )
}

function GuideTemplate({ content }: { content: ContentTemplateData }) {
  return (
    <TemplateShell content={content} variant="guide">
      <section className="template-body">
        <div className="container template-guide-layout">
          <article className="template-main">
            <TemplateBlocks blocks={content.blocks} />
          </article>
          <TemplateSidebar content={content} />
        </div>
      </section>
    </TemplateShell>
  )
}

function GalleryTemplate({ content }: { content: ContentTemplateData }) {
  return (
    <TemplateShell content={content} variant="gallery">
      <section className="template-body">
        <div className="container">
          <TemplateCards items={content.items} />
          <TemplateBlocks blocks={content.blocks} />
        </div>
      </section>
    </TemplateShell>
  )
}

function PodcastTemplate({ content }: { content: ContentTemplateData }) {
  return (
    <TemplateShell content={content} variant="podcast">
      <section className="template-body">
        <div className="container template-body-grid">
          <article className="template-main">
            {content.quote ? <TemplateQuote>{content.quote}</TemplateQuote> : null}
            <TemplateBlocks blocks={content.blocks} />
          </article>
          <TemplateSidebar content={content} />
        </div>
      </section>
    </TemplateShell>
  )
}

function SelectionTemplate({ content }: { content: ContentTemplateData }) {
  return (
    <TemplateShell content={content} variant="selection">
      <section className="template-body">
        <div className="container">
          <TemplateCards items={content.items} />
          <TemplateBlocks blocks={content.blocks} />
        </div>
      </section>
    </TemplateShell>
  )
}

function TemplateArticleBody({ content }: { content: ContentTemplateData }) {
  return (
    <section className="template-body">
      <div className="container template-body-grid">
        <article className="template-main">
          {content.quote ? <TemplateQuote>{content.quote}</TemplateQuote> : null}
          <TemplateBlocks blocks={content.blocks} />
        </article>
        <TemplateSidebar content={content} />
      </div>
    </section>
  )
}

function TemplateBlocks({ blocks }: { blocks?: ContentBlock[] }) {
  if (!blocks?.length) return null

  return (
    <>
      {blocks.map((block, index) => (
        <section className="template-block" key={`${block.heading || block.eyebrow || "block"}-${index}`}>
          {block.eyebrow ? <span>{block.eyebrow}</span> : null}
          {block.heading ? <h2>{block.heading}</h2> : null}
          {block.text ? <p>{block.text}</p> : null}
          {block.quote ? <TemplateQuote>{block.quote}</TemplateQuote> : null}
          {block.items?.length ? (
            <ul>
              {block.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : null}
        </section>
      ))}
    </>
  )
}

function TemplateSidebar({ content }: { content: ContentTemplateData }) {
  return (
    <aside className="template-sidebar">
      {content.description ? (
        <div className="template-panel">
          <span>Résumé</span>
          <p>{content.description}</p>
        </div>
      ) : null}

      {content.tags?.length ? (
        <div className="template-panel">
          <span>Tags</span>
          <div className="template-tags">
            {content.tags.map((tag) => (
              <small key={tag}>{tag}</small>
            ))}
          </div>
        </div>
      ) : null}

      {content.ctaHref ? (
        <div className="template-panel">
          <a href={content.ctaHref}>{content.ctaLabel || "Découvrir"}</a>
        </div>
      ) : null}
    </aside>
  )
}

function TemplateCards({ items }: { items?: ContentItem[] }) {
  if (!items?.length) return null

  return (
    <div className="template-card-grid">
      {items.map((item) => {
        const card = (
          <>
            {item.image ? <img src={item.image} alt={item.title} /> : null}
            <span>{item.meta}</span>
            <h2>{item.title}</h2>
            {item.text ? <p>{item.text}</p> : null}
          </>
        )

        return item.href ? (
          <a className="template-card" href={item.href} key={item.title}>
            {card}
          </a>
        ) : (
          <article className="template-card" key={item.title}>
            {card}
          </article>
        )
      })}
    </div>
  )
}

function TemplateInfo({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value || "À compléter"}</strong>
    </div>
  )
}

function TemplateQuote({ children }: { children: ReactNode }) {
  return (
    <blockquote className="template-quote">
      <p>{children}</p>
    </blockquote>
  )
}
