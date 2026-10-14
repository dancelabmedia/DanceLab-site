'use client'

import { useState, useRef, useEffect, useCallback, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react'
import { createPortal } from 'react-dom'
import AssistantCard from './AssistantCard'
import type { AssistantItem } from '@/data/assistant-index'
import type { AssistantEditorialPresentation, AssistantResponse } from '@/data/assistant-retrieval'

const CATEGORIES = [
  {
    key: 'styles',
    label: 'Découvrir un style de danse',
    questions: [
      "Quelle est l'histoire du break ?",
      'Comment débuter en waacking ?',
      'Quelle différence entre danse contemporaine et néo-classique ?',
      'Quels épisodes parlent du voguing ?',
    ],
  },
  {
    key: 'carriere',
    label: 'Développer ma carrière',
    questions: [
      'Comment vivre de la danse ?',
      "Qu'est-ce que le statut d'intermittent ?",
      'Comment trouver des contrats en tant que danseur ?',
      'Comment se reconvertir dans la danse ?',
    ],
  },
  {
    key: 'metier',
    label: 'Comprendre un métier',
    questions: [
      "Quel est le rôle d'un régisseur ?",
      "C'est quoi le rôle d'un directeur de production ?",
      "Quel est le quotidien d'un chorégraphe ?",
      'Comment devenir professeur de danse ?',
    ],
  },
  {
    key: 'sante',
    label: 'Santé & corps',
    questions: [
      'Comment prévenir les blessures en danse ?',
      'Comment gérer la fatigue et le burn-out ?',
      'Alimentation et performance : les conseils',
      'Santé mentale et vie de danseur',
    ],
  },
  {
    key: 'projet',
    label: 'Développer mon projet',
    questions: [
      'Comment créer sa compagnie de danse ?',
      'Comment financer un spectacle ?',
      'Comment communiquer sur ses créations ?',
      'Comment trouver des subventions pour un projet danse ?',
    ],
  },
]

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  results?: AssistantItem[]
  followUps?: string[]
  editorial?: AssistantEditorialPresentation
}

type FloatingPosition = { x: number; y: number }
type OrbLabelSide = 'left' | 'right'

const ORB_POSITION_KEY = 'dance-lab-assistant-orb-position'
const PANEL_POSITION_KEY = 'dance-lab-assistant-panel-position'
const VIEWPORT_GUTTER = 12
const HEADER_SAFE_ZONE = 76
const ORB_LABEL_GAP = 10

function readStoredPosition(key: string): FloatingPosition | null {
  try {
    const value = window.localStorage.getItem(key)
    if (!value) return null
    const parsed = JSON.parse(value) as FloatingPosition
    return Number.isFinite(parsed.x) && Number.isFinite(parsed.y) ? parsed : null
  } catch {
    return null
  }
}

function clampPosition(
  position: FloatingPosition,
  width: number,
  height: number,
  topSafeZone = VIEWPORT_GUTTER,
): FloatingPosition {
  return {
    x: Math.min(Math.max(VIEWPORT_GUTTER, position.x), Math.max(VIEWPORT_GUTTER, window.innerWidth - width - VIEWPORT_GUTTER)),
    y: Math.min(Math.max(topSafeZone, position.y), Math.max(topSafeZone, window.innerHeight - height - VIEWPORT_GUTTER)),
  }
}

function AssistantText({ children }: { children: string }) {
  return (
    <div className="ast-message__text">
      {children.split(/\n{2,}/).map((paragraph, paragraphIndex) => (
        <p key={`${paragraphIndex}-${paragraph.slice(0, 18)}`}>
          {paragraph.split(/(\*\*[^*]+\*\*)/g).filter(Boolean).map((part, partIndex) =>
            part.startsWith('**') && part.endsWith('**')
              ? <strong key={partIndex}>{part.slice(2, -2)}</strong>
              : <span key={partIndex}>{part}</span>
          )}
        </p>
      ))}
    </div>
  )
}

function AssistantEditorialArticle({ message }: { message: Message }) {
  return (
    <article className="ast-editorial">
      {message.editorial?.heading && <h2>{message.editorial.heading}</h2>}
      <AssistantText>{message.content}</AssistantText>
      {message.editorial?.highlights?.length ? (
        <section className="ast-editorial__takeaway" aria-label="À retenir">
          <h3>À retenir</h3>
          <div className="ast-editorial__highlight-grid">
            {message.editorial.highlights.map(highlight => (
              <div className="ast-editorial__highlight" key={highlight.title}>
                <h4>{highlight.title}</h4>
                <ul>
                  {highlight.items.map(item => <li key={item}>{item}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </section>
      ) : null}
      {message.results?.length ? (
        <section className="ast-editorial__resources">
          <h3>Pour aller plus loin</h3>
          <div className="ast-message__results">
            {message.results.slice(0, 3).map(item => (
              <AssistantCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      ) : null}
    </article>
  )
}

export default function DanceLabAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  // Ref pointing to the last user message sent — used to scroll to it
  const scrollTargetRef = useRef<HTMLDivElement>(null)
  const [scrollTargetId, setScrollTargetId] = useState<string | null>(null)
  const [orbPosition, setOrbPosition] = useState<FloatingPosition | null>(null)
  const [orbLabelSide, setOrbLabelSide] = useState<OrbLabelSide>('left')
  const [panelPosition, setPanelPosition] = useState<FloatingPosition | null>(null)
  const [dragTarget, setDragTarget] = useState<'orb' | 'panel' | null>(null)
  const orbRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{
    target: 'orb' | 'panel'
    pointerId: number
    startX: number
    startY: number
    originX: number
    originY: number
    moved: boolean
  } | null>(null)
  const suppressOrbClickRef = useRef(false)
  // Toute question effectivement affichée est conservée pour la durée de la
  // conversation, même si elle n'est jamais cliquée. Réduire le panneau ne
  // démonte pas ce composant et ne réinitialise donc pas cette mémoire.
  const shownQuestionsRef = useRef<Set<string>>(new Set())

  const rememberShownQuestions = useCallback((questions: string[]) => {
    questions.forEach(question => shownQuestionsRef.current.add(question))
  }, [])

  const fitOrbPosition = useCallback((position: FloatingPosition): { position: FloatingPosition; side: OrbLabelSide } => {
    const orb = orbRef.current
    const orbWidth = orb?.offsetWidth ?? 56
    const orbHeight = orb?.offsetHeight ?? 56
    const labelWidth = orb?.querySelector<HTMLElement>('.ast-button__label')?.offsetWidth ?? 150
    const viewportWidth = window.innerWidth
    const orbCenter = position.x + orbWidth / 2
    const preferredSide: OrbLabelSide = orbCenter <= viewportWidth / 2 ? 'right' : 'left'
    const requiredSpace = labelWidth + ORB_LABEL_GAP
    const spaceLeft = position.x - VIEWPORT_GUTTER
    const spaceRight = viewportWidth - (position.x + orbWidth) - VIEWPORT_GUTTER
    const side: OrbLabelSide =
      preferredSide === 'right'
        ? (spaceRight >= requiredSpace || spaceRight >= spaceLeft ? 'right' : 'left')
        : (spaceLeft >= requiredSpace || spaceLeft >= spaceRight ? 'left' : 'right')

    const minX = side === 'left' ? VIEWPORT_GUTTER + requiredSpace : VIEWPORT_GUTTER
    const maxX = side === 'right'
      ? viewportWidth - VIEWPORT_GUTTER - orbWidth - requiredSpace
      : viewportWidth - VIEWPORT_GUTTER - orbWidth
    const safeMinX = Math.min(minX, maxX)
    const safeMaxX = Math.max(minX, maxX)

    return {
      position: {
        x: Math.min(Math.max(safeMinX, position.x), safeMaxX),
        y: clampPosition(position, orbWidth, orbHeight, HEADER_SAFE_ZONE).y,
      },
      side,
    }
  }, [])

  const fitFloatingElementsToViewport = useCallback(() => {
    const orb = orbRef.current
    const panel = panelRef.current

    setOrbPosition(current => {
      const size = orb
        ? { width: orb.offsetWidth, height: orb.offsetHeight }
        : { width: 56, height: 56 }
      const fallback = { x: window.innerWidth - size.width - 28, y: window.innerHeight - size.height - 104 }
      return fitOrbPosition(current ?? readStoredPosition(ORB_POSITION_KEY) ?? fallback).position
    })

    if (panel) {
      const size = { width: panel.offsetWidth, height: panel.offsetHeight }
      setPanelPosition(current => {
        const fallback = { x: window.innerWidth - size.width - 28, y: Math.max(HEADER_SAFE_ZONE, 88) }
        return clampPosition(current ?? readStoredPosition(PANEL_POSITION_KEY) ?? fallback, size.width, size.height, HEADER_SAFE_ZONE)
      })
    }
  }, [fitOrbPosition])

  useEffect(() => {
    setMounted(true)
    const onResize = () => fitFloatingElementsToViewport()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [fitFloatingElementsToViewport])

  useEffect(() => {
    if (!mounted) return
    const frame = window.requestAnimationFrame(fitFloatingElementsToViewport)
    return () => window.cancelAnimationFrame(frame)
  }, [mounted, isOpen, fitFloatingElementsToViewport])

  useEffect(() => {
    if (orbPosition) window.localStorage.setItem(ORB_POSITION_KEY, JSON.stringify(orbPosition))
  }, [orbPosition])

  useEffect(() => {
    if (!orbPosition) return
    const fitted = fitOrbPosition(orbPosition)
    setOrbLabelSide(fitted.side)
    if (fitted.position.x !== orbPosition.x || fitted.position.y !== orbPosition.y) {
      setOrbPosition(fitted.position)
    }
  }, [orbPosition, fitOrbPosition])

  useEffect(() => {
    if (panelPosition) window.localStorage.setItem(PANEL_POSITION_KEY, JSON.stringify(panelPosition))
  }, [panelPosition])

  // Scroll to the user's question (top of the new exchange), not to the bottom
  useEffect(() => {
    if (!scrollTargetId) return
    const timer = setTimeout(() => {
      scrollTargetRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 40)
    return () => clearTimeout(timer)
  }, [scrollTargetId])

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 150)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  const conversationStarted = messages.length > 0

  const sendQuery = useCallback(async (query: string) => {
    const trimmed = query.trim()
    if (!trimmed || isLoading) return

    const msgId = `msg-${Date.now()}`
    const userMessage: Message = {
      id: msgId,
      role: 'user',
      content: trimmed,
    }

    setMessages(prev => [...prev, userMessage])
    setScrollTargetId(msgId)
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: trimmed,
          history: messages.slice(-8).map(message => ({
            role: message.role,
            content: message.content,
            resultIds: message.results?.map(item => item.id),
          })),
          recentResultIds: messages.flatMap(message => message.results?.map(item => item.id) ?? []).slice(-100),
          suggestedQuestions: [...shownQuestionsRef.current],
        }),
      })

      if (!response.ok) throw new Error('API error')

      const data: AssistantResponse = await response.json()
      rememberShownQuestions(data.followUps)

      setMessages(prev => [...prev, {
        id: `msg-${Date.now()}-response`,
        role: 'assistant',
        content: data.message,
        results: data.results,
        followUps: data.followUps,
        editorial: data.editorial,
      }])
    } catch {
      setMessages(prev => [...prev, {
        id: `msg-${Date.now()}-error`,
        role: 'assistant',
        content: 'Désolé, une erreur est survenue. Essaie encore une fois.',
      }])
    } finally {
      setIsLoading(false)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isLoading, messages, rememberShownQuestions])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendQuery(input)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendQuery(input)
    }
  }

  const handleClose = () => {
    setIsOpen(false)
  }

  /**
   * Toutes les ressources éditoriales du chatbot sont des liens. La capture
   * intervient avant le gestionnaire de navigation Next.js, ce qui réduit le
   * panneau sans démonter la conversation ni remettre son scroll à zéro.
   * Cette délégation couvre aussi les futurs liens ajoutés dans les réponses.
   */
  const handleResourceNavigation = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target
    if (!(target instanceof Element) || !target.closest('a[href]')) return
    setIsOpen(false)
  }, [])

  const beginDrag = (target: 'orb' | 'panel', event: ReactPointerEvent<HTMLElement>) => {
    if (event.button !== 0 || (event.target as HTMLElement).closest('button, a, input')) {
      if (target === 'panel') return
    }
    const element = target === 'orb' ? orbRef.current : panelRef.current
    if (!element) return
    const rect = element.getBoundingClientRect()
    dragRef.current = {
      target,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: rect.left,
      originY: rect.top,
      moved: false,
    }
    ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
    setDragTarget(target)
  }

  const moveDrag = (event: ReactPointerEvent<HTMLElement>) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    const element = drag.target === 'orb' ? orbRef.current : panelRef.current
    if (!element) return
    const dx = event.clientX - drag.startX
    const dy = event.clientY - drag.startY
    if (Math.hypot(dx, dy) > 6) drag.moved = true
    if (!drag.moved) return
    event.preventDefault()
    const rect = element.getBoundingClientRect()
    const desired = { x: drag.originX + dx, y: drag.originY + dy }
    if (drag.target === 'orb') {
      const fitted = fitOrbPosition(desired)
      setOrbLabelSide(fitted.side)
      setOrbPosition(fitted.position)
    } else setPanelPosition(clampPosition(desired, rect.width, rect.height, HEADER_SAFE_ZONE))
  }

  const endDrag = (event: ReactPointerEvent<HTMLElement>) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    if (drag.target === 'orb' && drag.moved) suppressOrbClickRef.current = true
    dragRef.current = null
    setDragTarget(null)
  }

  const moveWithKeyboard = (
    target: 'orb' | 'panel',
    event: React.KeyboardEvent<HTMLElement>,
  ) => {
    const directions: Record<string, FloatingPosition> = {
      ArrowLeft: { x: -16, y: 0 },
      ArrowRight: { x: 16, y: 0 },
      ArrowUp: { x: 0, y: -16 },
      ArrowDown: { x: 0, y: 16 },
    }
    const delta = directions[event.key]
    if (!delta || (!event.altKey && target === 'panel')) return
    event.preventDefault()
    const element = target === 'orb' ? orbRef.current : panelRef.current
    if (!element) return
    const rect = element.getBoundingClientRect()
    const desired = { x: rect.left + delta.x, y: rect.top + delta.y }
    if (target === 'orb') {
      const fitted = fitOrbPosition(desired)
      setOrbLabelSide(fitted.side)
      setOrbPosition(fitted.position)
    } else setPanelPosition(clampPosition(desired, rect.width, rect.height, HEADER_SAFE_ZONE))
  }

  const handleBack = () => {
    if (conversationStarted) {
      setMessages([])
      setSelectedCategory(null)
      setInput('')
      setIsLoading(false)
      shownQuestionsRef.current.clear()
      return
    }
    if (selectedCategory) setSelectedCategory(null)
  }

  const canGoBack = conversationStarted || selectedCategory !== null

  const lastAssistantMessage = [...messages].reverse().find(m => m.role === 'assistant')
  const followUps = lastAssistantMessage?.followUps ?? null

  const panelContent = (
    <div
      ref={panelRef}
      className="ast-panel"
      data-open={isOpen}
      data-dragging={dragTarget === 'panel'}
      style={panelPosition ? ({ '--ast-panel-x': `${panelPosition.x}px`, '--ast-panel-y': `${panelPosition.y}px` } as CSSProperties) : undefined}
      role="dialog"
      aria-modal="true"
      aria-hidden={!isOpen}
      aria-label="Assistant Dance Lab"
      onClickCapture={handleResourceNavigation}
    >
      {/* Header */}
      <div
        className="ast-panel__header"
        onPointerDown={event => beginDrag('panel', event)}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={event => moveWithKeyboard('panel', event)}
        tabIndex={0}
        aria-label="Déplacer la fenêtre de l'assistant. Utiliser Alt et les flèches au clavier."
      >
        <div className="ast-panel__header-left">
          {canGoBack ? (
            <button className="ast-panel__back" onClick={handleBack} aria-label={conversationStarted ? "Retour à l’accueil de l’assistant" : 'Retour aux sujets'}>
              <span aria-hidden="true">←</span>
            </button>
          ) : null}
          <span className="ast-panel__brand-icon" aria-hidden="true">✦</span>
          <p className="ast-panel__title">Demander à Dance Lab</p>
        </div>
        <div className="ast-panel__actions">
          <button className="ast-panel__minimize" onClick={handleClose} aria-label="Réduire l'assistant">−</button>
          <button className="ast-panel__close" onClick={handleClose} aria-label="Fermer l'assistant">✕</button>
        </div>
      </div>

      {/* Content / messages area */}
      <div className="ast-panel__messages">
        {!conversationStarted ? (
          <div className="ast-panel__welcome">
            {!selectedCategory ? (
              /* Level 1 — 5 categories */
              <>
                <p className="ast-panel__welcome-subtitle">Que voulez-vous découvrir ?</p>
                <div className="ast-categories">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.key}
                      className="ast-category"
                      onClick={() => {
                        setSelectedCategory(cat.key)
                        rememberShownQuestions(cat.questions)
                      }}
                    >
                      <span className="ast-category__label">{cat.label}</span>
                      <span className="ast-category__arrow" aria-hidden="true">→</span>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              /* Level 2 — questions for selected category */
              <>
                <p className="ast-panel__welcome-subtitle">Choisissez une question ou posez la vôtre</p>
                <div className="ast-questions">
                  {CATEGORIES.find(c => c.key === selectedCategory)?.questions.map((q, i) => (
                    <button
                      key={i}
                      className="ast-question"
                      onClick={() => sendQuery(q)}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          /* Conversation mode */
          <>
            {messages.map(msg => (
              <div
                key={msg.id}
                ref={msg.id === scrollTargetId ? scrollTargetRef : undefined}
                className={`ast-message ast-message--${msg.role}`}
              >
                {msg.role === 'assistant'
                  ? <AssistantEditorialArticle message={msg} />
                  : <p className="ast-message__text">{msg.content}</p>}
              </div>
            ))}

            {isLoading && (
              <div className="ast-message ast-message--assistant">
                <p className="ast-message__text ast-message__text--loading">…</p>
              </div>
            )}

            {/* Follow-up chips after last assistant reply */}
            {!isLoading && lastAssistantMessage && followUps?.length ? (
              <div className="ast-followups">
                {followUps.map((q, i) => (
                  <button key={i} className="ast-followup" onClick={() => sendQuery(q)}>
                    {q}
                  </button>
                ))}
              </div>
            ) : null}
          </>
        )}
      </div>

      {/* Input form — always visible at bottom */}
      <form className="ast-panel__form" onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          type="text"
          className="ast-panel__input"
          placeholder={conversationStarted ? 'Continuer la conversation…' : 'Pose une question…'}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
        />
        <button
          type="submit"
          className="ast-panel__submit"
          disabled={isLoading || !input.trim()}
          aria-label="Envoyer"
        >
          {isLoading ? '…' : '→'}
        </button>
      </form>
    </div>
  )

  return (
    <>
      {/* Floating trigger button — hidden when panel is open to avoid overlap */}
      {mounted && !isOpen && (
        <button
          ref={orbRef}
          className="ast-button"
          data-dragging={dragTarget === 'orb'}
          data-label-side={orbLabelSide}
          style={orbPosition ? ({ '--ast-orb-x': `${orbPosition.x}px`, '--ast-orb-y': `${orbPosition.y}px` } as CSSProperties) : undefined}
          onPointerDown={event => beginDrag('orb', event)}
          onPointerMove={moveDrag}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onKeyDown={event => moveWithKeyboard('orb', event)}
          onClick={() => {
            if (suppressOrbClickRef.current) {
              suppressOrbClickRef.current = false
              return
            }
            setIsOpen(true)
          }}
          aria-label="Ouvrir l'assistant Dance Lab. Utiliser les flèches pour déplacer l'orbe."
        >
          <span className="ast-button__orb" aria-hidden="true"><i /><i /><i /></span>
          <span className="ast-button__label">Demander à Dance Lab</span>
        </button>
      )}

      {/* Panel rendered in body portal */}
      {mounted && createPortal(panelContent, document.body)}
    </>
  )
}
