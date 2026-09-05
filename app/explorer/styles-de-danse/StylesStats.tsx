"use client"

import { useEffect, useRef, useState } from "react"

/* ── Hook compteur ─────────────────────────────────────────────── */
function useCounter(
  target: number,
  duration: number,
  delayMs: number,
  active: boolean
): { value: number; done: boolean } {
  const [value, setValue] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!active) return

    // prefers-reduced-motion : affichage instantané de la valeur finale
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValue(target)
      setDone(true)
      return
    }

    let rafId: number
    const startAt = performance.now() + delayMs

    const tick = (now: number) => {
      if (now < startAt) {
        rafId = requestAnimationFrame(tick)
        return
      }
      const elapsed = now - startAt
      const t = Math.min(elapsed / duration, 1)
      // cubic ease-out : rapide au début, ralentit à l'approche de la valeur finale
      const eased = 1 - Math.pow(1 - t, 3)
      setValue(Math.round(eased * target))
      if (t < 1) {
        rafId = requestAnimationFrame(tick)
      } else {
        setValue(target)
        setDone(true)
      }
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [active, target, duration, delayMs])

  return { value, done }
}

/* ── Chiffre individuel ────────────────────────────────────────── */
function StatCounter({
  target,
  suffix,
  label,
  delayMs,
  active,
}: {
  target: number
  suffix?: string
  label: string
  delayMs: number
  active: boolean
}) {
  const { value, done } = useCounter(target, 1500, delayMs, active)

  return (
    <div className="sty-stat">
      <strong>
        {value}
        {/* Le suffixe + n'apparaît qu'une fois le compteur arrivé à destination */}
        {suffix && done ? suffix : ""}
      </strong>
      <span>{label}</span>
    </div>
  )
}

/* ── Composant principal ───────────────────────────────────────── */
type Props = {
  stylesCount: number
  episodesCount: number
}

type AnimatedStat = {
  target: number
  label: string
  suffix?: string
}

export function AnimatedStats({ items }: { items: AnimatedStat[] }) {
  const [active, setActive] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true)
          observer.disconnect()
        }
      },
      { threshold: 0.5 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="sty-stats" ref={ref}>
      {items.map((item, index) => (
        <div key={item.label} style={{ display: "contents" }}>
          {index > 0 && <div className="sty-stat-sep" aria-hidden="true" />}
          <StatCounter
            target={item.target}
            suffix={item.suffix}
            label={item.label}
            delayMs={index * 200}
            active={active}
          />
        </div>
      ))}
    </div>
  )
}

export default function StylesStats({ stylesCount, episodesCount }: Props) {
  return (
    <AnimatedStats items={[
      { target: stylesCount, label: "Styles documentés" },
      { target: 27, suffix: "+", label: "Styles à venir" },
      { target: episodesCount, label: "Épisodes reliés" },
    ]} />
  )
}
