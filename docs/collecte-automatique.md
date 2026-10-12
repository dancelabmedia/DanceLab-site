# Collecte automatique de l'agenda danse

Chaque lundi à 5 h (heure de Paris), le site récupère les événements danse
des sources autorisées, les compare à l'agenda Notion et publie ce qui est
fiable sur /sortir, sans redéploiement.

```
Sources autorisées → Collecte → Vérification → Dédoublonnage → Notion (agenda) → /sortir
```

## Ce qui est branché

| Élément | Où |
| --- | --- |
| Source « Que faire à Paris » (Ville de Paris, ODbL) | `lib/collecte/sources/que-faire-a-paris.ts` |
| Règles de publication, doublons, calendrier | `lib/collecte/rules.ts` |
| Comparaison avec l'agenda (nouveau / modifié / identique / expiré / disparu) | `lib/collecte/plan.ts` |
| Écriture Notion + journal | `lib/collecte/notion.ts`, `lib/collecte/run.ts` |
| Cron Vercel (lundi 3 h et 4 h UTC, un seul tombe à 5 h à Paris) | `vercel.json`, `app/api/cron/collecte-danse*` |
| Tableau de bord + bouton « Lancer une collecte » | `/admin/collecte` |
| Historique | Notion → Bases de données → « 📋 Journal des collectes Dance Lab » |

## Règles de publication (colonne Notion « Publication »)

- **Publiée (auto)** : classée « danse » par la source, date, adresse,
  coordonnées en Île-de-France et lien source présents.
- **En attente de validation** : tout le reste, avec la raison dans
  « Raison de l'attente ». Non visible sur le site.
- **Validée** : à choisir à la main pour publier une fiche en attente. La
  collecte ne la remet plus en attente.
- **Archivée** : événement terminé. Rien n'est jamais supprimé.
- Fiches saisies à la main (colonne vide) : affichées comme avant, jamais
  modifiées par la collecte.
- **Ne pas mettre à jour** (case à cocher) : la collecte ne touche plus la fiche.
- Disparue de la source : signalée, puis mise en attente au bout de 14 jours.
- Retour arrière : historique des versions de la page dans Notion.

## Variables Vercel

| Variable | Statut |
| --- | --- |
| `NOTION_TOKEN` | déjà utilisée par l'agenda |
| `CRON_SECRET` | obligatoire pour le cron (déjà utilisée par check-episodes) |
| `ADMIN_PASSWORD` ou `PREVIEW_PASSWORD` | accès à /admin/collecte |
| `NOTION_COLLECTE_LOG_DATABASE_ID` | optionnelle (journal par défaut déjà renseigné) |

L'intégration Notion du site doit avoir accès à la base « Journal des
collectes » (Notion → ⋯ → Connexions). Les nouvelles colonnes de l'agenda
sont ajoutées automatiquement au premier passage.

## Ajouter une source

1. Créer `lib/collecte/sources/<source>.ts` qui renvoie des `CollectedEvent`.
2. L'ajouter au tableau `SOURCES` de `lib/collecte/run.ts` avec un préfixe
   d'identifiant unique (ex. `oa:` pour OpenAgenda).

## Vérifier

- `node --require ./tests/register.cjs --test tests/collecte.test.ts`
- `npx tsx scripts/simulate-collecte.ts export.txt` : simulation hors ligne.
- /admin/collecte → « Collecte à blanc » : simulation réelle, rien n'est écrit.
- Vercel → Settings → Cron Jobs : les deux déclenchements du lundi.
