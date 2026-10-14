import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { SITE_URL } from '@/data/site'
import QRCodeAdmin from './QRCodeAdmin'

export const metadata: Metadata = {
  title: 'QR codes Dance Lab — Administration',
  robots: { index: false, follow: false },
}

export default async function QRCodeAdminPage() {
  const requestHeaders = await headers()
  const host = requestHeaders.get('x-forwarded-host') ?? requestHeaders.get('host') ?? ''
  const isLocal = /^(?:localhost|127\.0\.0\.1|192\.168\.|10\.|172\.(?:1[6-9]|2\d|3[01])\.)/.test(host)
  const port = host.includes(':') ? `:${host.split(':').pop()}` : ''
  const localHost = process.env.LOCAL_NETWORK_HOST ?? '192.168.1.146'
  const localSiteUrl = isLocal ? `http://${localHost}${port}` : SITE_URL

  return <QRCodeAdmin productionSiteUrl={SITE_URL} initialUrl={localSiteUrl} />
}
