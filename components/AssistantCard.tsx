import Link from 'next/link'
import type { AssistantItem } from '@/data/assistant-index'
import { GENERIC_TAGS } from '@/data/assistant-retrieval'

interface AssistantCardProps {
  item: AssistantItem
}

export default function AssistantCard({ item }: AssistantCardProps) {
  const isEpisode = item.type === 'episode'

  // Filter out generic tags that appear on every episode
  const filteredTags = item.tags.filter(tag => !GENERIC_TAGS.has(tag))

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
              <span className="ast-card__type">Article</span>
              {item.category && <span className="ast-card__category">{item.category}</span>}
            </>
          )}
        </div>
        <h3 className="ast-card__title">{item.title}</h3>
        {item.guest && <p className="ast-card__guest">avec {item.guest}</p>}
        <p className="ast-card__excerpt">{item.excerpt}</p>
        {filteredTags.length > 0 && (
          <div className="ast-card__tags">
            {filteredTags.slice(0, 3).map(tag => (
              <span key={tag} className="ast-card__tag">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}
