'use client'
import { useState } from 'react'

export default function ReadOriginalLink({ href }: { href: string }) {
  const [error, setError] = useState(false)
  return <>
    <a className="btn btn-primary" href={href} onClick={async event => {
      event.preventDefault(); setError(false)
      try {
        const response = await fetch('/api/language', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ locale: 'fr', href: href + window.location.search + window.location.hash }) })
        if (!response.ok) throw new Error('language')
        window.location.assign((await response.json()).href)
      } catch { setError(true) }
    }}>Read this page in French →</a>
    {error && <p role="alert">Please try again.</p>}
  </>
}
