# Dance Lab — Audit du cycle de vie des événements

> Rédigé le 2026-10-16 · TypeScript check : ✅ 0 erreur

---

## Ce qui existait

| Mécanisme | État avant |
|---|---|
| `todayIso()` dans `agenda-data.ts` | ❌ Utilisait `new Date().toISOString().slice(0,10)` → date UTC, décalage de 1 à 2 h par rapport à l'heure Paris |
| `todayIso()` dans `app/api/agenda/route.ts` | ❌ Même bug UTC |
| `today` dans `AgendaExperience.tsx` (EventCard + filtre "À venir") | ❌ UTC inline (`new Date().toISOString().slice(0,10)`) |
| `today` dans `app/sortir/[slug]/page.tsx` | ❌ UTC inline |
| `isPastEvent()` | ❌ Ne tenait pas compte de `isRecurring` ni des `tourStops` |
| `isLastChance()` | ❌ Ne tenait pas compte des `tourStops` ; retournait un booléen sans granularité |
| Badge urgence dans les cartes | ❌ Label fixe "DERNIÈRES REPR." sans distinction dernier jour / dernière représentation |
| Cron de vérification agenda | ❌ Inexistant |

---

## Ce qui a été corrigé

### 1. Bug timezone (`todayIso`)

```typescript
// Avant — date UTC, 1 à 2 h d'avance sur Paris
new Date().toISOString().slice(0, 10)

// Après — date Europe/Paris correcte (locale sv-SE = format ISO natif YYYY-MM-DD)
new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Paris" })
```

Corrigé dans : `agenda-data.ts`, `app/api/agenda/route.ts`, `AgendaExperience.tsx` (EventCard + filtre), `app/sortir/[slug]/page.tsx`.

### 2. `isPastEvent()` — isRecurring + tourStops

```typescript
function isPastEvent(event: AgendaEvent): boolean {
  if (event.isRecurring) return false          // cabarets permanents jamais expirés
  const asOf = todayIso()
  const end = effectiveEndDate(event, asOf)    // tient compte des étapes de tournée
  return Boolean(end ? end < asOf : event.startDate < asOf)
}
```

### 3. `effectiveEndDate()` — gestion des tournées

```typescript
function effectiveEndDate(event: AgendaEvent, asOf: string): string | undefined {
  if (event.tourStops?.length) {
    const futureStops = event.tourStops.filter(s => (s.endDate ?? s.startDate) >= asOf)
    if (futureStops.length > 0) {
      const lastStop = futureStops.reduce((latest, s) => {
        const d = s.endDate ?? s.startDate
        return d > (latest.endDate ?? latest.startDate) ? s : latest
      })
      return lastStop.endDate ?? lastStop.startDate
    }
  }
  return event.endDate
}
```

### 4. `getUrgencyBadge()` — 3 niveaux de badge

Remplace le booléen `isLastChance()` dans les composants UI.

| Condition | Niveau | Label affiché | Classe CSS |
|---|---|---|---|
| 1 représentation restante (`performances[]`) | `derniere-repr` | DERNIÈRE REPR. | `.srt-badge--derniere-repr` |
| Fin aujourd'hui (même jour) | `dernier-jour` | DERNIER JOUR | `.srt-badge--dernier-jour` |
| 2 à 7 jours restants | `dernieres-dates` | DERNIÈRES DATES | `.srt-badge--dernieres-dates` |

`isLastChance()` est conservée (elle pilote encore le filtre "Dernières représentations" dans l'UI).

### 5. Composants UI mis à jour

**`app/agenda/AgendaExperience.tsx`**
- Import : `getUrgencyBadge`, `todayIso` ajoutés
- `EventCard` : `lastChance` remplacé par `urgency = getUrgencyBadge(event)` ; badge dynamique `srt-badge--${urgency.level}`
- `lastChanceEvents` : filtre via `getUrgencyBadge(event) !== null`
- Filtre "À venir" : `todayIso()` au lieu de l'UTC inline

**`app/sortir/[slug]/page.tsx`**
- Import : `getUrgencyBadge`, `todayIso` ; `isLastChance` retiré
- `eventBadgeLabel` calculé depuis `getUrgencyBadge(event)`
- `eventBadgeLevel` exposé pour CSS (`sc-fiche-status--{level}`)
- Fiche hero : badge classe dynamique `sc-fiche-status--${eventBadgeLevel}`

### 6. CSS — nouveaux niveaux d'urgence

Ajouté dans `app/globals.css` :

```css
/* Cartes agenda */
.srt-badge--dernieres-dates { /* orange doux — identique à l'ancien .srt-badge--last */ }
.srt-badge--dernier-jour    { /* orange vif, font-weight 700 */ }
.srt-badge--derniere-repr   { /* rouge intense, font-weight 700, letter-spacing */ }

/* Fiches événement (hero sombre) */
.sc-fiche-status--dernieres-dates { color:#fed7aa; border-color:rgba(251,146,60,.65); background:rgba(120,53,15,.5); }
.sc-fiche-status--dernier-jour    { color:#ffc593; ... font-weight:700; }
.sc-fiche-status--derniere-repr   { color:#ffb3b3; ... font-weight:700; }
```

### 7. Cron quotidien — `app/api/cron/check-agenda/route.ts`

**Planification :** `0 4 * * *` (4 h UTC = 5 h hiver / 6 h été Paris)

Ce que le cron fait :
- Calcule `today` en Europe/Paris (via `todayIso()`)
- Identifie les événements expirés encore présents dans `agendaEvents` (source statique)
- Construit la liste des événements actifs via `getInitialAgendaEvents(today)` (consolidation complète)
- Compte et classifie les événements en dernières dates (3 niveaux)
- Journalise un rapport JSON structuré dans les logs Vercel
- Émet des `console.warn` pour les événements expirés non nettoyés
- Retourne le rapport JSON en réponse (visible dans le dashboard Vercel Crons)

**Protection :** vérification du header `Authorization: Bearer CRON_SECRET` (variable d'env Vercel).

---

## Scénarios de test

| Scénario | Comportement attendu |
|---|---|
| Événement se terminant **aujourd'hui** | Badge `DERNIER JOUR` (niveau `dernier-jour`) |
| Événement se terminant dans 3 jours | Badge `DERNIÈRES DATES` (niveau `dernieres-dates`) |
| Événement avec `performances[]` et 1 seule date future | Badge `DERNIÈRE REPR.` (niveau `derniere-repr`) |
| Tournée multi-ville : seule la dernière étape est future | `effectiveEndDate()` retourne la date de fin de cette étape → badge correct |
| Cabaret avec `isRecurring: true` | Jamais expiré, jamais de badge d'urgence |
| Événement annulé (`status: "Annulé"`) | Filtré par `isPastEvent()` si sa date est passée ; sinon affiché avec son statut |
| Minuit Europe/Paris | `todayIso()` retourne la bonne date même à 23h59 → pas d'expiration prématurée |
| Changement d'heure (DST) | `toLocaleDateString("sv-SE", { timeZone: "Europe/Paris" })` gère DST nativement |
| Événement expiré depuis des semaines | Exclu par `isPastEvent()` → absent de l'API, des filtres, de la map et du chatbot |

---

## Fréquence de vérification automatique

| Mécanisme | Fréquence | Rôle |
|---|---|---|
| `isPastEvent()` dans `upcomingAgendaEvents` | À chaque requête (build-time + runtime) | Filtrage dynamique des événements expirés |
| `force-dynamic` sur `/api/agenda` | À chaque requête | Empêche la mise en cache statique des résultats filtrés |
| Cron `check-agenda` | Quotidien à 4h UTC | Journalisation + alertes sur les événements à nettoyer |
| `validate-event-links.mjs` | Manuel avant publication | Validation des URLs avant ajout au catalogue |
| `audit-links.mjs` | Manuel (ou CI) | Audit complet de tous les liens externes |

---

## Fichiers modifiés

| Fichier | Modification |
|---|---|
| `app/agenda/agenda-data.ts` | `todayIso()` timezone, `effectiveEndDate()`, `isPastEvent()`, `isLastChance()`, `getUrgencyBadge()` (export) |
| `app/api/agenda/route.ts` | `todayIso()` timezone |
| `app/agenda/AgendaExperience.tsx` | Imports, EventCard urgency badge, lastChanceEvents filter, todayIso |
| `app/sortir/[slug]/page.tsx` | Imports, eventBadgeLabel/Level, sc-fiche-status class |
| `app/globals.css` | Styles pour `.srt-badge--dernieres-dates`, `--dernier-jour`, `--derniere-repr` et équivalents `sc-fiche-status--*` |
| `app/api/cron/check-agenda/route.ts` | **Nouveau** — cron quotidien de supervision |
| `vercel.json` | Ajout du cron `check-agenda` à 4h UTC |
