import type { Metadata } from 'next'
import EpisodeSyncAdmin from './EpisodeSyncAdmin'

export const metadata: Metadata = { title: 'Épisodes - Administration Dance Lab', robots: { index: false, follow: false } }
export const dynamic = 'force-dynamic'

export default function AdminEpisodesPage() { return <EpisodeSyncAdmin /> }
