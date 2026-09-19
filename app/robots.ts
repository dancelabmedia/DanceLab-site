import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/data/site'

export default function robots(): MetadataRoute.Robots {
  // Les pages privées restent crawlables pour que Google voie le noindex de la
  // redirection/page d'attente ; l'authentification interdit toujours leur contenu.
  return { rules: { userAgent: '*', allow: '/', disallow: ['/api/', '/admin/'] }, sitemap: `${SITE_URL}/sitemap.xml` }
}
