'use client'

import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from 'react'

type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
  fallbackHref: string
  children: ReactNode
}

export default function HistoryBackLink({ fallbackHref, children, onClick, ...props }: Props) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event)
    if (event.defaultPrevented) return

    event.preventDefault()

    if (window.history.length > 1) {
      window.history.back()
      return
    }

    window.location.assign(fallbackHref)
  }

  return (
    <a href={fallbackHref} onClick={handleClick} {...props}>
      {children}
    </a>
  )
}
