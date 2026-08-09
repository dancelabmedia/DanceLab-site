/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Format de sortie préféré (WebP servi automatiquement aux navigateurs compatibles)
    formats: ['image/webp', 'image/avif'],
    // Tailles d'écran pour lesquelles Next.js génère des variantes redimensionnées
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [64, 128, 256, 384, 512],
    // CDN Ausha — images de couverture des épisodes (fallback si visuel local absent)
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.ausha.co',
        pathname: '/**',
      },
    ],
  },
  // Suppression des logs inutiles en production
  logging: {
    fetches: { fullUrl: false },
  },
}

export default nextConfig
