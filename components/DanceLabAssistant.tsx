'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import AssistantCard from './AssistantCard'
import type { AssistantItem } from '@/data/assistant-index'
import type { AssistantResponse } from '@/data/assistant-retrieval'

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

const FOLLOW_UPS: Record<string, string[]> = {
  styles: ["D'autres styles à explorer ?", 'Les origines de ce style ?', 'Épisodes similaires ?'],
  carriere: ["Statut d'intermittent ?", 'Trouver des contrats ?', 'Se reconvertir dans la danse ?'],
  metier: ["D'autres métiers de la danse ?", 'Formation nécessaire ?', 'Quel salaire dans ce métier ?'],
  sante: ['Blessures fréquentes en danse ?', 'Récupération active ?', 'Ressources bien-être ?'],
  projet: ['Trouver des financements ?', 'Monter une compagnie ?', "Communiquer sur un projet ?"],
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  results?: AssistantItem[]
  followUps?: string[]
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

  useEffect(() => { setMounted(true) }, [])

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
          recentResultIds: messages.flatMap(message => message.results?.map(item => item.id) ?? []).slice(-20),
        }),
      })

      if (!response.ok) throw new Error('API error')

      const data: AssistantResponse = await response.json()

      setMessages(prev => [...prev, {
        id: `msg-${Date.now()}-response`,
        role: 'assistant',
        content: data.message,
        results: data.results,
        followUps: data.followUps,
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
  }, [isLoading, messages])

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

  const handleBack = () => {
    if (conversationStarted) {
      setMessages([])
      setSelectedCategory(null)
      setInput('')
      setIsLoading(false)
      return
    }
    if (selectedCategory) setSelectedCategory(null)
  }

  const canGoBack = conversationStarted || selectedCategory !== null

  const lastAssistantMessage = [...messages].reverse().find(m => m.role === 'assistant')
  const followUps = lastAssistantMessage?.followUps ?? (selectedCategory ? FOLLOW_UPS[selectedCategory] : null)

  const panelContent = (
    <div
      className="ast-panel"
      data-open={isOpen}
      role="dialog"
      aria-modal="true"
      aria-label="Assistant Dance Lab"
    >
      {/* Header */}
      <div className="ast-panel__header">
        <div className="ast-panel__header-left">
          {canGoBack ? (
            <button className="ast-panel__back" onClick={handleBack} aria-label={conversationStarted ? "Retour à l’accueil de l’assistant" : 'Retour aux sujets'}>
              <span aria-hidden="true">←</span>
            </button>
          ) : null}
          <p className="ast-panel__title">Demander à Dance Lab</p>
        </div>
        <button
          className="ast-panel__close"
          onClick={handleClose}
          aria-label="Fermer l'assistant"
        >
          ✕
        </button>
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
                      onClick={() => setSelectedCategory(cat.key)}
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
                <p className="ast-message__text">{msg.content}</p>
                {msg.results && msg.results.length > 0 && (
                  <div className="ast-message__results">
                    {msg.results.slice(0, 5).map(item => (
                      <AssistantCard key={item.id} item={item} />
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="ast-message ast-message--assistant">
                <p className="ast-message__text ast-message__text--loading">…</p>
              </div>
            )}

            {/* Follow-up chips after last assistant reply */}
            {!isLoading && lastAssistantMessage && followUps && (
              <div className="ast-followups">
                {followUps.map((q, i) => (
                  <button key={i} className="ast-followup" onClick={() => sendQuery(q)}>
                    {q}
                  </button>
                ))}
              </div>
            )}
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
      {!isOpen && (
        <button
          className="ast-button"
          onClick={() => setIsOpen(true)}
          aria-label="Ouvrir l'assistant Dance Lab"
        >
          <span className="ast-button__icon" aria-hidden="true">✦</span>
          <span className="ast-button__label">Demander à Dance Lab</span>
        </button>
      )}

      {/* Panel rendered in body portal */}
      {mounted && createPortal(panelContent, document.body)}
    </>
  )
}
