'use client'

import { FormEvent, useCallback, useEffect, useState } from 'react'
import QRCode from 'qrcode'
import styles from './qr-code.module.css'

const PRESETS = [
  { label: 'Accueil', path: '/' },
  { label: 'Écouter', path: '/ecouter' },
  { label: 'Magazine', path: '/decouvrir' },
  { label: 'Explorer', path: '/explorer' },
]

function safeDanceLabUrl(value: string, allowedOrigins: string[]): string | null {
  try {
    const defaultOrigin = new URL(allowedOrigins[0]).origin
    const candidate = new URL(value.trim() || '/', `${defaultOrigin}/`)
    const allowed = allowedOrigins.map((url) => new URL(url).origin)
    if (!allowed.includes(candidate.origin)) return null
    candidate.hash = ''
    return candidate.toString()
  } catch {
    return null
  }
}

function downloadFile(contents: string, filename: string, type: string) {
  const link = document.createElement('a')
  link.download = filename
  link.href = type === 'image/png' ? contents : URL.createObjectURL(new Blob([contents], { type }))
  document.body.appendChild(link)
  link.click()
  link.remove()
  if (type !== 'image/png') URL.revokeObjectURL(link.href)
}

export default function QRCodeAdmin({ productionSiteUrl, initialUrl }: { productionSiteUrl: string; initialUrl: string }) {
  const [input, setInput] = useState(initialUrl)
  const [targetUrl, setTargetUrl] = useState(initialUrl)
  const [png, setPng] = useState('')
  const [svg, setSvg] = useState('')
  const [error, setError] = useState('')

  const generate = useCallback(async (rawUrl: string) => {
    const normalized = safeDanceLabUrl(rawUrl, [initialUrl, productionSiteUrl])
    if (!normalized) {
      setError('Utilisez uniquement l’adresse locale affichée ou l’URL officielle de Dance Lab.')
      return
    }

    const options = {
      errorCorrectionLevel: 'H' as const,
      margin: 4,
      width: 2048,
      color: { dark: '#0b171b', light: '#ffffff' },
    }

    const [pngData, svgData] = await Promise.all([
      QRCode.toDataURL(normalized, { ...options, type: 'image/png' }),
      QRCode.toString(normalized, { ...options, type: 'svg' }),
    ])

    setInput(normalized)
    setTargetUrl(normalized)
    setPng(pngData)
    setSvg(svgData)
    setError('')
  }, [initialUrl, productionSiteUrl])

  useEffect(() => {
    void generate(initialUrl)
  }, [generate, initialUrl])

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void generate(input)
  }

  const filename = `dance-lab-${new URL(targetUrl).pathname.split('/').filter(Boolean).join('-') || 'accueil'}`

  return (
    <main className={styles.page}>
      <section className={styles.shell}>
        <header className={styles.header}>
          <span>Administration · Dance Lab</span>
          <h1>Générateur de QR codes</h1>
          <p>Créez un QR code permanent vers une page officielle de Dance Lab, prêt pour le web et l’impression.</p>
        </header>

        <div className={styles.layout}>
          <div className={styles.controls}>
            <div>
              <span className={styles.label}>Accès rapides</span>
              <div className={styles.presets}>
                {PRESETS.map((preset) => (
                  <button key={preset.path} type="button" onClick={() => void generate(new URL(preset.path, initialUrl).toString())}>
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={submit} className={styles.form}>
              <label htmlFor="qr-url">URL Dance Lab</label>
              <div className={styles.fieldRow}>
                <input id="qr-url" type="url" value={input} onChange={(event) => setInput(event.target.value)} placeholder={`${initialUrl}/episodes/...`} spellCheck={false} />
                <button type="submit">Générer</button>
              </div>
              <small>Pour tester sur téléphone, utilisez l’adresse réseau locale affichée et connectez les deux appareils au même Wi-Fi.</small>
              {error ? <p className={styles.error} role="alert">{error}</p> : null}
            </form>

            <div className={styles.details}>
              <span>Destination actuelle</span>
              <strong>{targetUrl}</strong>
              <p>Correction d’erreur élevée · marge blanche de 4 modules · PNG 2048 px · SVG vectoriel</p>
            </div>
          </div>

          <div className={styles.preview}>
            <div className={styles.qrFrame}>
              {png ? <img src={png} alt={`QR code vers ${targetUrl}`} /> : <span>Génération…</span>}
            </div>
            <div className={styles.actions}>
              <button type="button" disabled={!png} onClick={() => downloadFile(png, `${filename}.png`, 'image/png')}>Télécharger PNG</button>
              <button type="button" disabled={!svg} onClick={() => downloadFile(svg, `${filename}.svg`, 'image/svg+xml;charset=utf-8')}>Télécharger SVG</button>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
