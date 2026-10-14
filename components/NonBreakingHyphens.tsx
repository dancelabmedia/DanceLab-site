'use client'

import { useLayoutEffect } from 'react'

const BREAKABLE_COMPOUND_HYPHEN = /(\p{L})-(?=\p{L})/gu
const EXCLUDED_CONTAINERS = 'script, style, code, pre, textarea, [contenteditable="true"]'

function protectTextNode(node: Text) {
  const parent = node.parentElement
  if (!parent || parent.closest(EXCLUDED_CONTAINERS)) return

  const protectedText = node.data.replace(BREAKABLE_COMPOUND_HYPHEN, '$1‑')
  if (protectedText !== node.data) node.data = protectedText
}

function protectSubtree(root: Node) {
  if (root.nodeType === Node.TEXT_NODE) {
    protectTextNode(root as Text)
    return
  }

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  let current = walker.nextNode()

  while (current) {
    protectTextNode(current as Text)
    current = walker.nextNode()
  }
}

/** Empêche les retours à la ligne au milieu des mots composés du site. */
export default function NonBreakingHyphens() {
  useLayoutEffect(() => {
    protectSubtree(document.body)

    const observer = new MutationObserver(mutations => {
      for (const mutation of mutations) {
        if (mutation.type === 'characterData') {
          protectTextNode(mutation.target as Text)
          continue
        }

        mutation.addedNodes.forEach(protectSubtree)
      }
    })

    observer.observe(document.body, {
      childList: true,
      characterData: true,
      subtree: true,
    })

    return () => observer.disconnect()
  }, [])

  return null
}
