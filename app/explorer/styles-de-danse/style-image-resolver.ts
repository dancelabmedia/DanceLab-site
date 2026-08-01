import "server-only"

import { readdirSync } from "node:fs"
import { extname, join } from "node:path"

const PUBLIC_DIRECTORY = "/images/styles-de-danse"
const FILESYSTEM_DIRECTORY = join(
  process.cwd(),
  "public",
  "images",
  "styles-de-danse"
)
const SUPPORTED_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".avif"])

function normalizeStyleName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
}

function getDedicatedStyleImages(): Map<string, string> {
  try {
    return new Map(
      readdirSync(FILESYSTEM_DIRECTORY, { withFileTypes: true })
        .filter((entry) => entry.isFile())
        .filter((entry) => SUPPORTED_EXTENSIONS.has(extname(entry.name).toLowerCase()))
        .map((entry) => {
          const basename = entry.name.slice(0, -extname(entry.name).length)
          return [normalizeStyleName(basename), `${PUBLIC_DIRECTORY}/${entry.name}`]
        })
    )
  } catch {
    return new Map()
  }
}

const dedicatedStyleImages = getDedicatedStyleImages()

type StyleWithImage = {
  slug: string
  name: string
  image?: string
}

export function withDedicatedStyleImage<T extends StyleWithImage>(style: T): T {
  const normalizedSlug = normalizeStyleName(style.slug)
  const normalizedName = normalizeStyleName(style.name)
  const candidates = [
    normalizedSlug,
    normalizedName,
    normalizedSlug.replace(/^danses?/, ""),
    normalizedName.replace(/^danses?/, ""),
  ]

  const dedicatedImage = candidates
    .map((candidate) => dedicatedStyleImages.get(candidate))
    .find(Boolean)

  return dedicatedImage ? { ...style, image: dedicatedImage } : style
}

export function withDedicatedStyleImages<T extends StyleWithImage>(styles: T[]): T[] {
  return styles.map(withDedicatedStyleImage)
}
