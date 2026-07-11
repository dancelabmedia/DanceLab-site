"use client"

import { useEffect } from "react"

const PROTECTED_SELECTOR = [
  "img",
  "picture",
  "svg",
  ".hero-signature",
  ".ep-img-wrap",
  ".guest-card",
  ".art-card",
  ".agenda-card-media",
  ".article-hero-image",
  ".episode-hero-image",
  ".episode-hero",
  ".about-image",
  ".about-visual",
  ".footer-logo",
  "[data-protected-content]",
].join(",")

const EDITABLE_SELECTOR = [
  "input",
  "textarea",
  "select",
  "button",
  "[contenteditable='true']",
].join(",")

function isEditableTarget(target: EventTarget | null) {
  return target instanceof Element && Boolean(target.closest(EDITABLE_SELECTOR))
}

function isProtectedTarget(target: EventTarget | null) {
  return target instanceof Element && Boolean(target.closest(PROTECTED_SELECTOR))
}

function selectionTouchesProtectedContent() {
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return false

  const anchor =
    selection.anchorNode instanceof Element
      ? selection.anchorNode
      : selection.anchorNode?.parentElement
  const focus =
    selection.focusNode instanceof Element
      ? selection.focusNode
      : selection.focusNode?.parentElement

  return Boolean(anchor?.closest(PROTECTED_SELECTOR) || focus?.closest(PROTECTED_SELECTOR))
}

export default function ContentProtection() {
  useEffect(() => {
    const setImageAttributes = () => {
      document.querySelectorAll("img").forEach((image) => {
        image.setAttribute("draggable", "false")
        image.setAttribute("loading", image.getAttribute("loading") || "lazy")
      })
    }

    const preventProtectedContextMenu = (event: MouseEvent) => {
      if (isEditableTarget(event.target)) return
      if (!isProtectedTarget(event.target)) return

      event.preventDefault()
    }

    const preventProtectedDrag = (event: DragEvent) => {
      if (!isProtectedTarget(event.target)) return

      event.preventDefault()
    }

    const preventProtectedCopyShortcuts = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) return

      const key = event.key.toLowerCase()
      const isSystemShortcut = event.metaKey || event.ctrlKey

      if (!isSystemShortcut) return

      if ((key === "c" || key === "x") && selectionTouchesProtectedContent()) {
        event.preventDefault()
      }
    }

    setImageAttributes()

    const observer = new MutationObserver(setImageAttributes)
    observer.observe(document.body, { childList: true, subtree: true })

    document.addEventListener("contextmenu", preventProtectedContextMenu)
    document.addEventListener("dragstart", preventProtectedDrag)
    document.addEventListener("keydown", preventProtectedCopyShortcuts)

    return () => {
      observer.disconnect()
      document.removeEventListener("contextmenu", preventProtectedContextMenu)
      document.removeEventListener("dragstart", preventProtectedDrag)
      document.removeEventListener("keydown", preventProtectedCopyShortcuts)
    }
  }, [])

  return null
}
