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

## Visuels des événements

Chaque fiche porte les colonnes Notion « Image URL », « Source image »,
« Crédit image », « Texte alternatif image », « Statut image », « Droits image »
et « Image vérifiée le ».

- Fiches de la Ville de Paris : visuel fourni par l'open data (crédit affiché).
- Fiches saisies à la main : visuel officiel (`og:image`) de la page de
  l'événement donnée dans « Lien billetterie » ou « Lien officiel ». Si le lien
  mène à une page générale, la collecte y cherche le lien de l'événement.
- Doublon d'un événement de la Ville de Paris, ou autre fiche du même
  spectacle déjà illustrée : reprise de son visuel.
- Lien imprécis (accueil, saison) ou absent : recherche dans le plan du site
  (sitemap) du lien ou du lieu (`lib/collecte/venues.ts`), puis adresses
  probables sur le modèle des pages connues du site (ex. Opéra
  `/saison-26-27/ballet/<œuvre>`). Fiches « saison » ou « festival » : visuel du
  site lui-même.
- Page sans balise `og:image` : image déclarée en données structurées, puis
  bannière principale de la page (jamais un logo).
- Page inaccessible : nouvel essai la semaine suivante (28 jours sinon).
- Relance immédiate : `NOTION_TOKEN=… npx tsx scripts/backfill-images.ts --write`.
- Contrôles avant d'accepter une image : page propre à l'événement, titre de
  l'œuvre et artiste présents sur la page, rubrique danse (pas opéra ni
  concert), pas de logo ni de visuel par défaut du site, pas de bannière
  partagée par plusieurs événements, image qui se charge.
- Statut « Refusée » : l'image n'est plus affichée ni remplacée.
  Statut « Ajoutée à la main » ou image déposée dans Notion (fichier ou
  couverture) : jamais remplacée.
- « Aucune trouvée » : nouvelle tentative au bout de 28 jours.
- Sur le site : photo en plein cadre, affiche verticale affichée en entier sur
  fond flouté, retour au fond coloré si l'image ne se charge pas.

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
