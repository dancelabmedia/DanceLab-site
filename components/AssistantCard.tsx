import Link from 'next/link'
import type { AssistantItem } from '@/data/assistant-index'

interface AssistantCardProps {
  item: AssistantItem
}

export default function AssistantCard({ item }: AssistantCardProps) {
  const isEpisode = item.type === 'episode'
  const typeLabel = item.type === 'article'
    ? 'Article'
    : item.type === 'style'
      ? 'Style de danse'
      : item.type === 'metier'
        ? 'Métier'
        : 'Épisode'

  return (
    <Link href={item.href} className="ast-card">
      {item.image && (
        <div className="ast-card__image">
          <img src={item.image} alt={item.title} />
        </div>
      )}
      <div className="ast-card__content">
        <div className="ast-card__meta">
          {isEpisode ? (
            <>
              <span className="ast-card__type">Épisode</span>
              <span className="ast-card__number">{item.episodeNumber}</span>
            </>
          ) : (
            <>
              <span className="ast-card__type">{typeLabel}</span>
              {item.category && <span className="ast-card__category">{item.category}</span>}
            </>
          )}
        </div>
        <h3 className="ast-card__title">{item.title}</h3>
        {item.guest && <p className="ast-card__guest">avec {item.guest}</p>}
        <p className="ast-card__excerpt">{item.excerpt}</p>
      </div>
      <span className="ast-card__arrow" aria-hidden="true">→</span>
    </Link>
  )
}
