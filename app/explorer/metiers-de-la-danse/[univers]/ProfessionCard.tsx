import Link from 'next/link'
import type { Metier } from '../metiers-data'
import styles from './ProfessionCard.module.css'

export default function ProfessionCard({ metier, universeSlug }: { metier: Metier; universeSlug: string }) {
  return (
    <Link href={`/explorer/metiers-de-la-danse/${universeSlug}/${metier.id}`} className={styles.card}>
      <h2 className={styles.title}>{metier.nom}</h2>
      <p className={styles.description}>{metier.description}</p>
      <span className={styles.cta}>
        Découvrir le métier
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14m-6-6 6 6-6 6" />
        </svg>
      </span>
    </Link>
  )
}
