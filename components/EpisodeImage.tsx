import type { ImgHTMLAttributes } from 'react'
import { episodeExtras } from '../data/episode-extras'
import { findImagePresentation, imagePresentationStyle } from '../lib/episode-image-presentation'
import styles from './episode-image.module.css'

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
  episodeNumber: number
  src: string
}

/** Same <img>, same source: only opt-in presentation data varies per photograph. */
export default function EpisodeImage({ episodeNumber, src, className = '', style, width, height, ...props }: Props) {
  const presentation = findImagePresentation(episodeExtras[episodeNumber]?.imagePresentations, src)
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      {...props}
      src={src}
      width={width ?? presentation?.width}
      height={height ?? presentation?.height}
      className={`${className}${presentation ? ` ${styles.image}` : ''}`}
      style={{ ...style, ...imagePresentationStyle(presentation) }}
      data-episode-image={presentation ? 'framed' : undefined}
    />
  )
}
