import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { episodeExtras } from '../data/episode-extras'
import { episodeNumberFromImageName, findImagePresentation, imagePresentationStyle, resolveImageFrame } from '../lib/episode-image-presentation'

const profiles = episodeExtras[128].imagePresentations!
const header = profiles[episodeExtras[128].headerImage!]

test('both episode image naming conventions are supported, without partial IDs', () => {
  assert.equal(episodeNumberFromImageName('128wilfriedbernard.png'), 128)
  assert.equal(episodeNumberFromImageName('wilfriedbernard128.png'), 128)
  assert.equal(episodeNumberFromImageName('128.png'), 128)
  assert.equal(episodeNumberFromImageName('128-wilfried.PNG'), 128)
  assert.equal(episodeNumberFromImageName('wilfried1128.png'), 1128)
  assert.equal(episodeNumberFromImageName('wilfried.png'), undefined)
  assert.equal(episodeNumberFromImageName('128-not-an-image.ts'), undefined)
})

test('historical suffix naming continues to resolve to the same episode number', () => {
  for (const name of readdirSync('public/images/les-invites')) {
    const oldMatch = name.match(/(\d+)\.(png|jpg|jpeg|webp|avif)$/i)
    if (oldMatch) assert.equal(episodeNumberFromImageName(name), Number(oldMatch[1]))
  }
})

test('each image has its own frame; a fallback never inherits another image’s crop', () => {
  assert.equal(findImagePresentation(profiles, episodeExtras[128].headerImage!), header)
  assert.equal(findImagePresentation(profiles, '/unrelated.png'), undefined)
  assert.equal(findImagePresentation(undefined, '/unrelated.png'), undefined)
  assert.equal(imagePresentationStyle(undefined), undefined)
  assert.notEqual(header.desktop.objectPosition, profiles[episodeExtras[128].image!].desktop.objectPosition)
})

test('responsive values inherit only within one source image', () => {
  assert.equal(resolveImageFrame(header, 'desktop').objectPosition, '100% 35%')
  assert.equal(resolveImageFrame(header, 'tablet').objectPosition, '100% 40%')
  assert.equal(resolveImageFrame(header, 'mobile').objectPosition, '100% 20%')
  assert.equal(resolveImageFrame(header, 'mobile').objectFit, 'cover')
  assert.equal(resolveImageFrame(header, 'mobile').aspectRatio, '4 / 3')
  assert.equal(resolveImageFrame(header, 'desktop').aspectRatio, undefined)
  const css = imagePresentationStyle(header)!
  assert.equal(css['--epi-height-desktop'], '100%')
  assert.equal(css['--epi-height-mobile'], 'auto')
  assert.equal(css['--epi-ratio-mobile'], '4 / 3')
})

test('original image bytes, PNG dimensions and orientation have not been changed', () => {
  const hashes: Record<string, string> = {
    '/images/les-invites-header/128wilfriedbernard.png': '20c6f84c9ffe78ccbc5478262599906c9ea7ac4fe68e83a05bb5871522904eb0',
    '/images/les-invites/128wilfriedbernard.png': 'fee93b44e5b71b4453b5dbd204c1a1c90a11a9a150dec2fee048df1511161c81',
    '/episodes/128wilfriedbernard.png': '5b905323dec2a515920ec5bcfe62186a6d8e98f65cd7af6d4b33733e16830cc9',
  }
  for (const [src, hash] of Object.entries(hashes)) {
    const bytes = readFileSync(`public${src}`)
    assert.equal(createHash('sha256').update(bytes).digest('hex'), hash)
    assert.equal(bytes.readUInt32BE(16), profiles[src].width)
    assert.equal(bytes.readUInt32BE(20), profiles[src].height)
  }
})

test('face bounding box stays inside the hero at desktop, tablet and mobile sizes', () => {
  // Head/face bounds inspected in the original 1280×720 photo, with a margin.
  const face = { left: 950, top: 110, right: 1200, bottom: 455 }
  for (const [width, height] of [[2560,1080],[1920,1080],[1440,900],[1280,800],[1060,800],[1024,768],[834,1112],[768,1024],[620,900],[430,932],[390,844],[375,667],[320,568]]) {
    const breakpoint = width <= 620 ? 'mobile' : width <= 1060 ? 'tablet' : 'desktop'
    const frame = resolveImageFrame(header, breakpoint)
    const ratio = frame.aspectRatio?.split('/').map(Number)
    const boxHeight = ratio ? width / (ratio[0] / ratio[1]) : height
    const scale = Math.max(width / header.width, boxHeight / header.height)
    const [px, py] = frame.objectPosition.split(' ').map(v => parseFloat(v) / 100)
    const offsetX = (width - header.width * scale) * px
    const offsetY = (boxHeight - header.height * scale) * py
    for (const animationScale of [1, 1.04]) {
      const left = (face.left * scale + offsetX - width / 2) * animationScale + width / 2
      const right = (face.right * scale + offsetX - width / 2) * animationScale + width / 2
      const top = (face.top * scale + offsetY - boxHeight / 2) * animationScale + boxHeight / 2
      const bottom = (face.bottom * scale + offsetY - boxHeight / 2) * animationScale + boxHeight / 2
      assert.ok(left >= 0 && right <= width && top >= 0 && bottom <= boxHeight, `${width}×${height}, scale ${animationScale}`)
      if (frame.fadeBottom) assert.ok(bottom < boxHeight * .88, 'face stays above the fade')
    }
  }
})

test('the cover and YouTube thumbnail preserve the whole composition on every breakpoint', () => {
  for (const src of ['/episodes/128wilfriedbernard.png', 'https://img.youtube.com/vi/GOx8Ku3kiGs/maxresdefault.jpg']) {
    for (const breakpoint of ['desktop', 'tablet', 'mobile'] as const) {
      const frame = resolveImageFrame(profiles[src], breakpoint)
      assert.equal(frame.objectFit, 'contain')
      assert.equal(frame.objectPosition, '50% 50%')
      const [w, h] = frame.aspectRatio!.split('/').map(Number)
      assert.equal(w / h, profiles[src].width / profiles[src].height)
    }
  }
})

test('the square portrait retains its original ratio in small recommendation cards', () => {
  const portrait = profiles[episodeExtras[128].image!]
  for (const breakpoint of ['desktop', 'tablet', 'mobile'] as const) {
    assert.equal(resolveImageFrame(portrait, breakpoint).aspectRatio, '1 / 1')
  }
  assert.equal(portrait.width, portrait.height)
  assert.equal(episodeExtras[127].headerImage, '/images/les-invites-header/waabee127.png')
})
