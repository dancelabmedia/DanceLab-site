import Image from "next/image"
import Link from "next/link"
import type { MagazineArticle } from "@/app/decouvrir/articles-data"
import type { DanceStyle } from "../styles-data"
import type { LinkedEpisode } from "./page"
import StylePageClient, { type StyleSection } from "./StylePageClient"
import css from "./style-editorial.module.css"

type Props = {
  style: DanceStyle
  cover?: string
  summaryRest: string
  linkedEpisodes: LinkedEpisode[]
  linkedArticles: MagazineArticle[]
  relatedStylesData: DanceStyle[]
  previousStyle: DanceStyle | null
  nextStyle: DanceStyle | null
}

function Paragraphs({ text }: { text: string }) {
  return <>{text.split("\n\n").filter(Boolean).map((paragraph, i) => <p key={i}>{paragraph}</p>)}</>
}

function Heading({ number, title }: { number: string; title: string }) {
  return <header className={css.chapterHeading}>
    <span className={css.chapterNumber} aria-hidden="true">{number}</span>
    <h2>{title}</h2>
  </header>
}

function EpisodeCard({ item }: { item: LinkedEpisode }) {
  const { episode, relevance } = item
  return (
    <Link className={css.contentCard} href={`/episodes/${episode.slug}`}>
      <div className={css.thumbnail}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={episode.image} alt={episode.guest} loading="lazy" />
        <span className={css.play} aria-hidden="true">▶</span>
      </div>
      <div className={css.contentCardBody}>
        <span className={css.eyebrow}>Épisode podcast · {episode.number}</span>
        <h3>{episode.guest}</h3>
        <p>{episode.title}</p>
        {relevance && <p className={css.relevance}>{relevance}</p>}
        <span className={css.cardLink}>Écouter l&apos;épisode <span aria-hidden="true">→</span></span>
      </div>
    </Link>
  )
}

export default function StyleEditorial({ style, cover, summaryRest, linkedEpisodes, linkedArticles, relatedStylesData, previousStyle, nextStyle }: Props) {
  const introduction = style.introduction.split("\n\n")
  const sections: StyleSection[] = [
    { id: "introduction", label: "Introduction" },
    { id: "origines", label: "Origines" },
    ...(style.timeline.length ? [{ id: "chronologie", label: "Histoire" }] : []),
    { id: "caracteristiques", label: "Caractéristiques" },
    { id: "musiques", label: "Musiques & culture" },
    ...(style.keyFigures.length ? [{ id: "personnalites", label: "Artistes" }] : []),
    { id: "france", label: "En France" },
    ...(style.commonConfusions?.length ? [{ id: "confusions", label: "Confusions" }] : []),
    ...(style.resources.length ? [{ id: "ressources", label: "Ressources" }] : []),
    ...(linkedEpisodes.length || linkedArticles.length ? [{ id: "dancelab", label: "Pour aller plus loin" }] : []),
  ]
  const illustration = linkedArticles.find((article) => article.image.startsWith("/") && article.image !== cover)
  const secondaryImage = illustration?.image ?? (style.image !== cover ? style.image : undefined)
  const secondaryCredit = illustration?.imageCredit ?? (secondaryImage === style.image ? style.imageCredit : undefined)
  const firstEpisodes = linkedEpisodes.slice(0, 3)
  const remainingEpisodes = linkedEpisodes.slice(3)

  return (
    <>
      <StylePageClient sections={sections} />
      <article>
        <section id="introduction" className={`container ${css.chapter} ${css.introduction}`}>
          <div className={css.introLayout}>
            <div className={css.copy}>
              <Heading number="01" title="Introduction" />
              {summaryRest && <p className={css.lead}>{summaryRest}</p>}
              <p>{introduction[0]}</p>
              <Link href="#origines" className={`btn btn-primary ${css.inlineCTA}`}>Explorer les origines</Link>
            </div>
            {cover ? (
              <figure className={css.introFigure}>
                <div className={css.introPhoto}>
                  <Image src={cover} alt={style.name} fill sizes="(max-width: 760px) 100vw, 50vw" />
                </div>
                <figcaption>
                  <span>{style.name} · {style.family}</span>
                  {cover === style.image && style.imageCredit && <span>{style.imageCredit}</span>}
                </figcaption>
              </figure>
            ) : (
              <div className={css.typePoster} aria-hidden="true">
                <span>{style.family}</span>
                <strong>{style.name}</strong>
                <span>{style.era} · {style.originCity}</span>
              </div>
            )}
          </div>
          {introduction.length > 1 && (
            <div className={`${css.readingColumns} ${css.copy}`}>
              {introduction.slice(1).map((paragraph, i) => <p key={i}>{paragraph}</p>)}
            </div>
          )}
        </section>

        <aside className={css.interlude} aria-label="Le style en quelques mots">
          <div className={`container ${css.interludeInner}`}>
            <dl className={css.facts}>
              <div><dt>Époque</dt><dd>{style.era}</dd></div>
              <div><dt>Territoire</dt><dd>{style.originCity}<br />{style.originCountry}</dd></div>
              <div><dt>Famille</dt><dd>{style.family}</dd></div>
            </dl>
            <div className={css.pullout} id="improvisation">
              <span className={css.eyebrow}>Place de l&apos;improvisation</span>
              <p>{style.characteristics.improvisation}</p>
            </div>
            {style.keywords.length > 0 && (
              <div className={css.keywords}>
                <span className={css.eyebrow}>En quelques mots</span>
                <ul>{style.keywords.map((word) => <li key={word}>{word}</li>)}</ul>
              </div>
            )}
          </div>
        </aside>

        <section id="origines" className={`container ${css.chapter}`}>
          <div className={css.sectionLayout}>
            <Heading number="02" title="Origines & contextes" />
            <div className={css.copy}><Paragraphs text={style.origins} /></div>
          </div>
          {secondaryImage && (
            <figure className={css.editorialFigure}>
              <div className={css.editorialPhoto}>
                <Image src={secondaryImage} alt={illustration?.title ?? style.name} fill sizes="(max-width: 1200px) 100vw, 1120px" />
              </div>
              {secondaryCredit && <figcaption>{secondaryCredit}</figcaption>}
            </figure>
          )}
        </section>

        {style.timeline.length > 0 && (
          <section id="chronologie" className={`container ${css.chapter} ${css.ruled}`}>
            <div className={css.sectionLayout}>
              <Heading number="03" title="L’histoire en mouvement" />
              <ol className={css.timeline}>
                {style.timeline.map((event, i) => (
                  <li key={i}><span>{event.year}</span><p>{event.event}</p></li>
                ))}
              </ol>
            </div>
          </section>
        )}

        <section id="caracteristiques" className={`container ${css.chapter} ${css.ruled}`}>
          <Heading number="04" title="Caractéristiques du style" />
          <div className={css.movementLayout}>
            <div className={css.copy} id="vocabulaire">
              <h3>Vocabulaire du mouvement</h3>
              <p className={css.movementText}>{style.characteristics.movements}</p>
            </div>
            <div className={css.copy}>
              <h3>Rapport à la musique</h3>
              <p>{style.characteristics.musicRelationship}</p>
              {style.characteristics.visualCodes && <>
                <h3>Codes visuels</h3>
                <p>{style.characteristics.visualCodes}</p>
              </>}
              <h3>Formats de pratique</h3>
              <ul className={css.inlineList}>{style.characteristics.formats.map((format) => <li key={format}>{format}</li>)}</ul>
            </div>
          </div>
        </section>

        <section id="musiques" className={css.musicBand}>
          <div className={`container ${css.sectionLayout}`}>
            <div>
              <Heading number="05" title="Musiques associées" />
              <ul className={css.genres}>{style.music.genres.map((genre) => <li key={genre}>{genre}</li>)}</ul>
            </div>
            <div className={css.copy}>
              <p className={css.lead}>{style.music.description}</p>
              {style.music.keyArtists?.length > 0 && <>
                <h3>Artistes de référence</h3>
                <ul className={css.inlineList}>{style.music.keyArtists.map((artist) => <li key={artist}>{artist}</li>)}</ul>
              </>}
            </div>
          </div>
        </section>

        {style.keyFigures.length > 0 && (
          <section id="personnalites" className={`container ${css.chapter}`}>
            <Heading number="06" title="Personnalités et collectifs importants" />
            <div className={css.figures}>
              {style.keyFigures.map((group) => (
                <div key={group.category}>
                  <h3 className={css.figureCategory}>{group.category}</h3>
                  <ul>{group.figures.map((figure) => (
                    <li key={figure.name}>
                      <h4>{figure.name}</h4><p>{figure.role}</p>
                      {figure.note && <p className={css.figureNote}>{figure.note}</p>}
                    </li>
                  ))}</ul>
                </div>
              ))}
            </div>
          </section>
        )}

        <section id="france" className={`container ${css.chapter} ${css.ruled}`}>
          <div className={css.sectionLayout}>
            <Heading number="07" title="Développement en France" />
            <div className={css.copy}><Paragraphs text={style.franceHistory} /></div>
          </div>
        </section>

        {style.commonConfusions?.length > 0 && (
          <section id="confusions" className={`container ${css.chapter} ${css.ruled}`}>
            <div className={css.sectionLayout}>
              <Heading number="08" title="Confusions fréquentes" />
              <div className={css.copy}>{style.commonConfusions.map((item, i) => (
                <div className={css.distinction} key={i}><h3>{item.styles}</h3><p>{item.explanation}</p></div>
              ))}</div>
            </div>
          </section>
        )}

        {style.resources.length > 0 && (
          <section id="ressources" className={`container ${css.chapter} ${css.ruled}`}>
            <Heading number="09" title="Pour aller plus loin" />
            <p className={css.sectionNote}>Ressources vérifiées — livres, documentaires, archives et sites institutionnels.</p>
            <ul className={css.resources}>{style.resources.map((resource, i) => (
              <li key={i}>
                <div>
                  <span className={css.eyebrow}>{resource.format} · {resource.year}</span>
                  <h3>{resource.title}</h3>
                  <p>{resource.author}</p>
                </div>
                <div className={css.copy}>
                  <p>{resource.description}</p>
                  {resource.url && <a className={css.textLink} href={resource.url} target="_blank" rel="noopener noreferrer">Accéder à la ressource <span aria-hidden="true">↗</span></a>}
                </div>
              </li>
            ))}</ul>
          </section>
        )}
      </article>

      {(linkedEpisodes.length > 0 || linkedArticles.length > 0) && (
        <section id="dancelab" className={css.further}>
          <div className="container">
            <div className={css.furtherHeading}>
              <span className={css.eyebrow}>Prolonger la découverte</span>
              <h2>Pour aller plus loin avec Dance Lab</h2>
              <p>Des épisodes et des articles pour continuer l&apos;exploration.</p>
            </div>
            {linkedArticles.length > 0 && <div className={css.contentGroup} id="magazine">
              <div className={css.groupHeading}><h3>Dans le Magazine</h3><Link href="/decouvrir" className={css.textLink}>Tout le Magazine <span aria-hidden="true">→</span></Link></div>
              <div className={css.contentGrid}>{linkedArticles.map((article) => (
                <Link key={article.slug} className={css.contentCard} href={`/decouvrir/articles/${article.slug}`}>
                  <div className={css.thumbnail}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={article.image} alt="" loading="lazy" style={{ objectPosition: article.imageObjectPosition }} />
                  </div>
                  <div className={css.contentCardBody}>
                    <span className={css.eyebrow}>Article Magazine · {article.readTime}</span>
                    <h3>{article.title}</h3>
                    <p>{article.chapo}</p>
                    <span className={css.cardLink}>Lire l&apos;article <span aria-hidden="true">→</span></span>
                  </div>
                </Link>
              ))}</div>
            </div>}
            {linkedEpisodes.length > 0 && <div className={css.contentGroup} id="ecouter">
              <div className={css.groupHeading}><h3>À écouter sur Dance Lab</h3><Link href="/ecouter" className={css.textLink}>Tous les épisodes <span aria-hidden="true">→</span></Link></div>
              <div className={css.contentGrid}>{firstEpisodes.map((item) => <EpisodeCard key={item.episode.slug} item={item} />)}</div>
              {remainingEpisodes.length > 0 && <details className={css.moreEpisodes}>
                <summary>Les {remainingEpisodes.length} autres épisodes liés <span aria-hidden="true">+</span></summary>
                <div className={css.contentGrid}>{remainingEpisodes.map((item) => <EpisodeCard key={item.episode.slug} item={item} />)}</div>
              </details>}
            </div>}
          </div>
        </section>
      )}

      {relatedStylesData.length > 0 && <aside className={`container ${css.related}`} aria-label="Styles associés">
        <span className={css.eyebrow}>Styles associés</span>
        <div>{relatedStylesData.map((item) => <Link key={item.slug} href={`/explorer/styles-de-danse/${item.slug}`}>
          <span>{item.family}</span><strong>{item.name}</strong><p>{item.summary.slice(0, 90)}…</p><span aria-hidden="true">↗</span>
        </Link>)}</div>
      </aside>}

      <nav className={`container ${css.pagination}`} aria-label="Navigation entre les styles de danse">
        {previousStyle ? <Link className={css.previous} rel="prev" href={`/explorer/styles-de-danse/${previousStyle.slug}`}>
          <span className={css.navArrow} aria-hidden="true">←</span><span><small>Style précédent</small><strong>{previousStyle.name}</strong></span>
        </Link> : <span />}
        <Link className={css.backToStyles} href="/explorer/styles-de-danse">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
            <rect x="2" y="2" width="8" height="8" rx="1" /><rect x="14" y="2" width="8" height="8" rx="1" />
            <rect x="2" y="14" width="8" height="8" rx="1" /><rect x="14" y="14" width="8" height="8" rx="1" />
          </svg>
          Tous les styles de danse
        </Link>
        {nextStyle ? <Link className={css.next} rel="next" href={`/explorer/styles-de-danse/${nextStyle.slug}`}>
          <span><small>Style suivant</small><strong>{nextStyle.name}</strong></span><span className={css.navArrow} aria-hidden="true">→</span>
        </Link> : <span />}
      </nav>
    </>
  )
}
