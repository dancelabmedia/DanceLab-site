"use client"

/**
 * app/admin/collecte/page.tsx
 * Tableau de bord « Collecte automatique » de l'agenda danse.
 * Route : /admin/collecte (protégée comme les autres pages /admin).
 */

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

type RunSummary = {
  id: string
  url: string
  title: string
  startedAt: string
  finishedAt: string
  trigger: string
  mode: string
  status: string
  counters: Record<string, number>
  errors: string
}

type Dashboard = {
  nextRun: string
  sources: string[]
  configuration: { notion: boolean; journal: boolean; cronSecret: boolean; rechercheWeb: boolean }
  runs: RunSummary[]
  pending: Array<{ title: string; url: string; startDate: string | null }>
  totals: Record<string, number> | null
  problems?: string[]
}

type RunReport = {
  status: string
  dryRun: boolean
  counters: Record<string, number>
  errors: string[]
  actions: string[]
}

const STATUS_COLORS: Record<string, string> = {
  Réussie: "#16a34a",
  Partielle: "#d97706",
  Échec: "#dc2626",
  Ignorée: "#8a9ba8",
  "En cours": "#2563eb",
}

const ink = "#101719"
const muted = "#5b6b73"
const line = "#dde4e8"

function formatDateTime(iso?: string) {
  if (!iso) return "—"
  return new Date(iso).toLocaleString("fr-FR", {
    timeZone: "Europe/Paris",
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function formatDay(iso?: string | null) {
  if (!iso) return "Date à confirmer"
  return new Date(iso.length === 10 ? `${iso}T12:00:00` : iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function Stat({ label, value, tone }: { label: string; value: number | string; tone?: string }) {
  return (
    <div style={{ background: "#fff", border: `1px solid ${line}`, borderRadius: 12, padding: "14px 16px" }}>
      <div style={{ fontSize: 26, fontWeight: 700, color: tone ?? ink, lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: 12, color: muted, marginTop: 4 }}>{label}</div>
    </div>
  )
}

function Badge({ status }: { status: string }) {
  const color = STATUS_COLORS[status] ?? "#8a9ba8"
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 10px",
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: ".04em",
        textTransform: "uppercase",
        color,
        background: `${color}18`,
        border: `1px solid ${color}30`,
      }}
    >
      {status || "—"}
    </span>
  )
}

const card: React.CSSProperties = {
  background: "#fff",
  border: `1px solid ${line}`,
  borderRadius: 14,
  padding: "20px 22px",
}

export default function AdminCollectePage() {
  const router = useRouter()
  const [data, setData] = useState<Dashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState<"real" | "dry" | null>(null)
  const [lastReport, setLastReport] = useState<RunReport | null>(null)
  const [error, setError] = useState("")

  const load = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/admin/collecte", { cache: "no-store" })
      if (res.status === 401) {
        router.push("/acces-prive?redirect=/admin/collecte")
        return
      }
      setData((await res.json()) as Dashboard)
    } catch {
      setError("Impossible de charger le tableau de bord.")
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    load()
  }, [load])

  const launch = async (dryRun: boolean) => {
    if (!dryRun && !confirm("Lancer une collecte réelle maintenant ? Les fiches fiables seront publiées sur /sortir.")) return
    setRunning(dryRun ? "dry" : "real")
    setLastReport(null)
    setError("")
    try {
      const res = await fetch("/api/admin/collecte", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dryRun }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setLastReport((await res.json()) as RunReport)
      await load()
    } catch {
      setError("La collecte n'a pas pu aboutir. Consultez les journaux Vercel.")
    } finally {
      setRunning(null)
    }
  }

  const last = data?.runs.find((r) => r.mode !== "À blanc")
  const cfg = data?.configuration
  const buttonBase: React.CSSProperties = {
    padding: "8px 16px",
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: ".04em",
    cursor: running ? "wait" : "pointer",
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f4f6f8", fontFamily: "var(--font-body, system-ui, sans-serif)", color: ink }}>
      <header
        style={{
          background: ink,
          color: "#e8edf0",
          padding: "0 clamp(16px, 4vw, 60px)",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 16,
          minHeight: 64,
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <Link href="/" style={{ color: "#c3d2dc", textDecoration: "none", fontSize: 13, fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase" }}>
          ← Dance Lab
        </Link>
        <span style={{ fontSize: 13, fontWeight: 500 }}>Collecte automatique — Agenda danse</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8, padding: "10px 0" }}>
          <button
            onClick={() => launch(true)}
            disabled={Boolean(running)}
            style={{ ...buttonBase, border: "1px solid rgba(195,210,220,.3)", background: "rgba(195,210,220,.08)", color: "#c3d2dc" }}
          >
            {running === "dry" ? "Simulation…" : "Collecte à blanc"}
          </button>
          <button
            onClick={() => launch(false)}
            disabled={Boolean(running)}
            style={{ ...buttonBase, border: "none", background: "#c3d2dc", color: ink }}
          >
            {running === "real" ? "Collecte en cours…" : "Lancer une collecte"}
          </button>
        </div>
      </header>

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "28px clamp(16px, 4vw, 40px) 60px", display: "grid", gap: 20 }}>
        {error ? <div style={{ ...card, borderColor: "#fecaca", color: "#b91c1c" }}>{error}</div> : null}
        {running ? (
          <div style={{ ...card, color: muted }}>
            Collecte en cours, cela peut prendre jusqu'à 4 minutes. Vous pouvez laisser cette page ouverte.
          </div>
        ) : null}

        {cfg && (!cfg.notion || !cfg.journal || !cfg.cronSecret || !cfg.rechercheWeb) ? (
          <div style={{ ...card, borderColor: "#fde68a", background: "#fffbeb" }}>
            <strong>Configuration incomplète sur Vercel</strong>
            <ul style={{ margin: "8px 0 0", paddingLeft: 18, color: muted, fontSize: 14 }}>
              {!cfg.notion && <li>NOTION_TOKEN manquant : la collecte ne peut pas écrire dans l'agenda.</li>}
              {!cfg.journal && <li>NOTION_COLLECTE_LOG_DATABASE_ID manquant : l'historique n'est pas enregistré.</li>}
              {!cfg.cronSecret && <li>CRON_SECRET manquant : la collecte du lundi ne se déclenchera pas.</li>}
              {!cfg.rechercheWeb && <li>ANTHROPIC_API_KEY manquante : la recherche web des pages officielles est désactivée.</li>}
            </ul>
          </div>
        ) : null}

        {data?.problems?.length ? (
          <div style={{ ...card, borderColor: "#fecaca" }}>
            {data.problems.map((p) => (
              <p key={p} style={{ margin: 0, color: "#b91c1c", fontSize: 14 }}>{p}</p>
            ))}
          </div>
        ) : null}

        {lastReport ? (
          <section style={card}>
            <h2 style={{ fontSize: 16, margin: "0 0 10px" }}>
              Résultat {lastReport.dryRun ? "de la simulation (rien n'a été publié)" : "de la collecte"} <Badge status={lastReport.status} />
            </h2>
            <p style={{ fontSize: 14, color: muted, margin: "0 0 10px" }}>
              {lastReport.counters.created} à publier · {lastReport.counters.createdPending} en attente ·{" "}
              {lastReport.counters.updated} mises à jour · {lastReport.counters.duplicates} doublons ·{" "}
              {lastReport.counters.archived} archivées
            </p>
            {lastReport.errors.length ? (
              <ul style={{ fontSize: 13, color: "#b45309", paddingLeft: 18 }}>
                {lastReport.errors.map((e) => <li key={e}>{e}</li>)}
              </ul>
            ) : null}
            <details>
              <summary style={{ cursor: "pointer", fontSize: 13 }}>Détail ({lastReport.actions.length} actions)</summary>
              <ul style={{ fontSize: 13, color: muted, paddingLeft: 18, maxHeight: 320, overflow: "auto" }}>
                {lastReport.actions.map((a, i) => <li key={i}>{a}</li>)}
              </ul>
            </details>
          </section>
        ) : null}

        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
          <div style={card}>
            <div style={{ fontSize: 12, color: muted, textTransform: "uppercase", letterSpacing: ".06em" }}>Dernière collecte</div>
            <div style={{ fontSize: 18, fontWeight: 600, margin: "6px 0" }}>{loading ? "…" : formatDateTime(last?.startedAt)}</div>
            {last ? <Badge status={last.status} /> : <span style={{ color: muted, fontSize: 14 }}>Aucune collecte enregistrée</span>}
          </div>
          <div style={card}>
            <div style={{ fontSize: 12, color: muted, textTransform: "uppercase", letterSpacing: ".06em" }}>Prochaine collecte</div>
            <div style={{ fontSize: 18, fontWeight: 600, margin: "6px 0" }}>{loading ? "…" : formatDateTime(data?.nextRun)}</div>
            <span style={{ color: muted, fontSize: 14 }}>Chaque lundi à 5 h (heure de Paris)</span>
          </div>
          <div style={card}>
            <div style={{ fontSize: 12, color: muted, textTransform: "uppercase", letterSpacing: ".06em" }}>Sources connectées</div>
            <ul style={{ margin: "8px 0 0", paddingLeft: 18, fontSize: 14 }}>
              {(data?.sources ?? []).map((s) => <li key={s}>{s}</li>)}
            </ul>
          </div>
        </section>

        {last ? (
          <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
            <Stat label="Sources consultées" value={last.counters.sources} />
            <Stat label="Nouvelles publiées" value={last.counters.created} tone="#16a34a" />
            <Stat label="Nouvelles en attente" value={last.counters.createdPending} tone="#d97706" />
            <Stat label="Mises à jour" value={last.counters.updated} />
            <Stat label="Doublons détectés" value={last.counters.duplicates} />
            <Stat label="Archivées" value={last.counters.archived} />
            <Stat label="Disparues de la source" value={last.counters.missing} />
            <Stat label="En attente (total)" value={last.counters.pendingTotal} tone="#d97706" />
          </section>
        ) : null}

        {last?.errors ? (
          <section style={{ ...card, borderColor: "#fde68a" }}>
            <h2 style={{ fontSize: 15, margin: "0 0 6px" }}>Erreurs et sources indisponibles</h2>
            <p style={{ fontSize: 14, color: "#92400e", margin: 0 }}>{last.errors}</p>
          </section>
        ) : null}

        <section style={card}>
          <h2 style={{ fontSize: 16, margin: "0 0 4px" }}>En attente de validation ({data?.pending.length ?? 0})</h2>
          <p style={{ fontSize: 13, color: muted, margin: "0 0 12px" }}>
            Pour publier une fiche, ouvrez-la dans Notion et passez « Publication » sur « Validée ». La raison de l'attente y est indiquée.
          </p>
          {data?.pending.length ? (
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 6 }}>
              {data.pending.slice(0, 60).map((p) => (
                <li key={p.url} style={{ display: "flex", gap: 12, fontSize: 14, borderTop: `1px solid ${line}`, paddingTop: 6 }}>
                  <span style={{ color: muted, minWidth: 110 }}>{formatDay(p.startDate)}</span>
                  <a href={p.url} target="_blank" rel="noopener noreferrer" style={{ color: ink }}>{p.title}</a>
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ fontSize: 14, color: muted, margin: 0 }}>{loading ? "Chargement…" : "Rien en attente."}</p>
          )}
        </section>

        {data?.totals ? (
          <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
            <Stat label="Fiches dans l'agenda" value={data.totals.fiches} />
            <Stat label="Issues de la collecte" value={data.totals.collectees} />
            <Stat label="Publiées automatiquement" value={data.totals.publieesAuto} />
            <Stat label="Validées à la main" value={data.totals.validees} />
            <Stat label="Archivées" value={data.totals.archivees} />
            <Stat label="Non confirmées (masquées)" value={data.totals.nonConfirmees ?? 0} />
            <Stat label="À l'affiche avec image" value={`${data.totals.avecImage ?? 0} / ${data.totals.visibles ?? 0}`} tone="#16a34a" />
            <Stat label="Images à vérifier (masquées)" value={data.totals.imagesAVerifier ?? 0} />
            <Stat label="Recherche d'image en cours" value={data.totals.fileImages ?? 0} tone="#d97706" />
          </section>
        ) : null}

        <section style={card}>
          <h2 style={{ fontSize: 16, margin: "0 0 12px" }}>Historique des collectes</h2>
          {data?.runs.length ? (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ textAlign: "left", color: muted }}>
                    <th style={{ padding: "6px 8px" }}>Date</th>
                    <th style={{ padding: "6px 8px" }}>Statut</th>
                    <th style={{ padding: "6px 8px" }}>Déclenchement</th>
                    <th style={{ padding: "6px 8px" }}>Nouvelles</th>
                    <th style={{ padding: "6px 8px" }}>Mises à jour</th>
                    <th style={{ padding: "6px 8px" }}>Archivées</th>
                    <th style={{ padding: "6px 8px" }}>Rapport</th>
                  </tr>
                </thead>
                <tbody>
                  {data.runs.map((r) => (
                    <tr key={r.id} style={{ borderTop: `1px solid ${line}` }}>
                      <td style={{ padding: "8px" }}>{formatDateTime(r.startedAt)}</td>
                      <td style={{ padding: "8px" }}><Badge status={r.status} /></td>
                      <td style={{ padding: "8px" }}>{r.trigger}{r.mode === "À blanc" ? " · à blanc" : ""}</td>
                      <td style={{ padding: "8px" }}>{r.counters.created + r.counters.createdPending}</td>
                      <td style={{ padding: "8px" }}>{r.counters.updated}</td>
                      <td style={{ padding: "8px" }}>{r.counters.archived}</td>
                      <td style={{ padding: "8px" }}>
                        <a href={r.url} target="_blank" rel="noopener noreferrer" style={{ color: ink }}>Ouvrir</a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ fontSize: 14, color: muted, margin: 0 }}>{loading ? "Chargement…" : "Aucune collecte enregistrée pour l'instant."}</p>
          )}
        </section>
      </main>
    </div>
  )
}
