'use client'

import { FormEvent, useEffect, useState } from 'react'
import styles from './episodes.module.css'

type EpisodeRow = { number: number; title: string; guest: string; aushaGuid: string; image: string; override: { youtubeId?: string; instagramReelUrl?: string } | null }
type SyncReport = { generatedAt: string | null; totalEpisodes: number; latestEpisode: number | null; issues: Array<{ episodeNumber: number; missing: string[]; warnings: string[] }> }

export default function EpisodeSyncAdmin() {
  const [episodes, setEpisodes] = useState<EpisodeRow[]>([])
  const [report, setReport] = useState<SyncReport | null>(null)
  const [number, setNumber] = useState('')
  const [youtube, setYoutube] = useState('')
  const [instagram, setInstagram] = useState('')
  const [isShort, setIsShort] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/episode-media', { cache: 'no-store' })
      .then((response) => response.json())
      .then((data) => { setEpisodes(data.episodes ?? []); setReport(data.report ?? null) })
      .catch(() => setMessage('Impossible de charger le suivi.'))
      .finally(() => setLoading(false))
  }, [])

  const selected = episodes.find((episode) => episode.number === Number(number))
  function selectEpisode(value: string) {
    setNumber(value)
    const episode = episodes.find((item) => item.number === Number(value))
    setYoutube(episode?.override?.youtubeId ?? '')
    setInstagram(episode?.override?.instagramReelUrl ?? '')
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    setMessage('Enregistrement…')
    const response = await fetch('/api/admin/episode-media', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ episodeNumber: Number(number), youtube, instagram, isYoutubeShort: isShort }),
    })
    const data = await response.json()
    setMessage(response.ok ? 'Association validée et enregistrée. Le déploiement Git la rendra active.' : data.error ?? 'Erreur.')
  }

  return <main className={styles.page}>
    <div className={styles.shell}>
      <header><span>Administration · Dance Lab</span><h1>Synchronisation des épisodes</h1><p>Ausha reste la source éditoriale. Cette page suit les éléments manquants et permet de valider un lien social lorsque l’association automatique n’est pas certaine.</p></header>
      <section className={styles.stats}>
        <div><strong>{report?.totalEpisodes ?? '...'}</strong><span>épisodes Ausha</span></div>
        <div><strong>{report?.latestEpisode ? `EP ${report.latestEpisode}` : '...'}</strong><span>dernier épisode</span></div>
        <div><strong>{report?.issues.length ?? '...'}</strong><span>à vérifier</span></div>
      </section>
      <div className={styles.grid}>
        <form onSubmit={submit} className={styles.panel}>
          <h2>Valider une association</h2>
          <label>Épisode<select required value={number} onChange={(event) => selectEpisode(event.target.value)}><option value="">Choisir…</option>{episodes.map((episode) => <option key={episode.aushaGuid} value={episode.number}>EP {episode.number} - {episode.guest}</option>)}</select></label>
          {selected ? <p className={styles.selected}>{selected.title}<small>GUID {selected.aushaGuid}</small></p> : null}
          <label>YouTube<input value={youtube} onChange={(event) => setYoutube(event.target.value)} placeholder="URL ou ID de la vidéo" /></label>
          <label className={styles.check}><input type="checkbox" checked={isShort} onChange={(event) => setIsShort(event.target.checked)} /> Il s’agit d’un Short</label>
          <label>Instagram<input value={instagram} onChange={(event) => setInstagram(event.target.value)} placeholder="https://www.instagram.com/reel/..." /></label>
          <button disabled={!number || loading}>Enregistrer</button>
          {message ? <p className={styles.message}>{message}</p> : null}
        </form>
        <section className={styles.panel}>
          <h2>Éléments à vérifier</h2>
          <div className={styles.issues}>{report?.issues.length ? report.issues.map((issue) => <button type="button" key={issue.episodeNumber} onClick={() => selectEpisode(String(issue.episodeNumber))}><strong>EP {issue.episodeNumber}</strong><span>{[...issue.missing, ...issue.warnings].join(' · ')}</span></button>) : <p>Aucune anomalie enregistrée.</p>}</div>
        </section>
      </div>
    </div>
  </main>
}
