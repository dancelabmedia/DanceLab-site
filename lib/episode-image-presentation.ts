import type { CSSProperties } from 'react'

export type EpisodeImageFrame = {
  objectPosition: string
  objectFit?: 'cover' | 'contain'
  /** Optional image-box ratio; omit to keep the existing layout's dimensions. */
  aspectRatio?: string
  /** Blend a photograph into the existing dark hero without modifying the file. */
  fadeBottom?: boolean
}

export type EpisodeImagePresentation = {
  width: number
  height: number
  desktop: EpisodeImageFrame
  tablet?: Partial<EpisodeImageFrame>
  mobile?: Partial<EpisodeImageFrame>
}

export type ImageBreakpoint = 'desktop' | 'tablet' | 'mobile'

/** A frame belongs to a source image, never to an arbitrary fallback. */
export function findImagePresentation(
  presentations: Record<string, EpisodeImagePresentation> | undefined,
  src: string,
): EpisodeImagePresentation | undefined {
  return presentations?.[src]
}

export function resolveImageFrame(presentation: EpisodeImagePresentation, breakpoint: ImageBreakpoint): EpisodeImageFrame {
  return {
    objectFit: 'cover',
    ...presentation.desktop,
    ...(breakpoint !== 'desktop' ? presentation.tablet : {}),
    ...(breakpoint === 'mobile' ? presentation.mobile : {}),
  }
}

type ImageCSSProperties = CSSProperties & Record<`--epi-${string}`, string>

export function imagePresentationStyle(presentation?: EpisodeImagePresentation): ImageCSSProperties | undefined {
  if (!presentation) return undefined
  const style = {} as ImageCSSProperties
  for (const breakpoint of ['desktop', 'tablet', 'mobile'] as const) {
    const frame = resolveImageFrame(presentation, breakpoint)
    style[`--epi-position-${breakpoint}`] = frame.objectPosition
    style[`--epi-fit-${breakpoint}`] = frame.objectFit
    style[`--epi-ratio-${breakpoint}`] = frame.aspectRatio ?? 'auto'
    style[`--epi-height-${breakpoint}`] = frame.aspectRatio ? 'auto' : '100%'
    style[`--epi-mask-${breakpoint}`] = frame.fadeBottom
      ? 'linear-gradient(to bottom, #000 0%, #000 88%, transparent 100%)'
      : 'none'
  }
  return style
}

/** Accept both guest128.png and 128guest.png, not episode 28 inside 128. */
export function episodeNumberFromImageName(filename: string): number | undefined {
  if (!/\.(png|jpe?g|webp|avif)$/i.test(filename)) return undefined
  const match = filename.match(/(\d+)\.(?:png|jpe?g|webp|avif)$/i)
    ?? filename.match(/^(\d+)(?=[^\d])/)
  return match ? Number(match[1]) : undefined
}
