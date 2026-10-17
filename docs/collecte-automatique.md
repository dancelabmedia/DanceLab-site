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
  spectacle (ou de la même production à d'autres dates) déjà illustrée :
  reprise de son visuel.
- Recherche par titre dans tout l'agenda open data de la Ville de Paris
  (même œuvre et artiste, dates proches, même lieu ou titre quasi identique).
- Image nommée d'après l'œuvre sur la page (billetteries sans og:image).
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

## Étape « visuels » autonome

Exécutée à chaque collecte du lundi et chaque jour (`/api/cron/images-danse`,
vers 7 h 30 – 8 h 30 à Paris), par lots compatibles avec la limite de 5 minutes
des fonctions Vercel (plan Hobby).

1. Images publiées revérifiées (liens cassés retirés et recherche relancée,
   images antérieures au score de confiance renotées).
2. File d'attente des fiches à venir sans image (colonne « Prochaine recherche
   image ») : fiche jumelle, open data Ville de Paris, liens de la fiche et site
   du lieu, puis recherche web de la page officielle (API Claude,
   `ANTHROPIC_API_KEY`, 15 recherches par jour par défaut via
   `COLLECTE_RESOLVER_DAILY`). L'adresse proposée doit figurer dans les
   résultats réels de la recherche, puis la page est vérifiée.
3. Score de confiance sur 100 (œuvre 35, artiste 15, lieu 15, date ou édition
   15, provenance 20) : publication à partir de 75 avec des droits établis
   (open data, site officiel, billetterie) ; « À vérifier » (non affichée) entre
   55 et 74 ou pour un média/agrégateur. Détail dans « Droits image ».
4. Délais progressifs : 3, 7, 14 puis 28 jours (2 jours si le site est
   inaccessible) ; disjoncteur par site après 3 échecs ; historique dans
   « Historique image ».
5. Saisons et festivals : visuel ou logo officiel de l'édition (format
   « Logo » affiché en entier) ; une affiche d'une édition passée est refusée.
6. Fiches vagues (« ou similaire », « tournée »…) : titre corrigé seulement si
   la page officielle le confirme (ancien titre dans « Titre d'origine ») ;
   si aucune programmation ne correspond, Publication « Non confirmé » (masquée).
7. Dates de la page comparées à celles de la fiche : si elles ne se recoupent
   pas, l'image n'est pas publiée (−25 points). Quand la page officielle donne
   d'autres dates ou un autre lieu, la fiche est rectifiée (dates, et « Lieu »
   seulement vers un lieu déjà connu de l'agenda), une fois la page vérifiée ;
   l'ancienne valeur est notée dans « Historique image ».
8. Fiche absente de la programmation officielle consultée (adresse notée) :
   masquée tout de suite ; sinon au bout de deux recherches sans résultat.
9. Sites dont le certificat est incomplet (ex. Chaillot) : le certificat
   intermédiaire public manquant est ajouté (`lib/collecte/tls.ts`), la
   vérification TLS reste entière.

Contrôle de la configuration : `GET /api/cron/collecte-sante` avec
`Authorization: Bearer <CRON_SECRET>`.

## Variables Vercel

| Variable | Statut |
| --- | --- |
| `NOTION_TOKEN` | déjà utilisée par l'agenda |
| `CRON_SECRET` | obligatoire pour le cron (déjà utilisée par check-episodes) |
| `ADMIN_PASSWORD` ou `PREVIEW_PASSWORD` | accès à /admin/collecte |
| `NOTION_COLLECTE_LOG_DATABASE_ID` | optionnelle (journal par défaut déjà renseigné) |
| `AI_GATEWAY_API_KEY` (clé `vck_…` Vercel AI Gateway) ou `ANTHROPIC_API_KEY` (`sk-ant-…`, ou `vck_…`) | recherche web des pages officielles et génération des articles |
| `COLLECTE_RESOLVER_DAILY` | optionnelle : recherches web par jour (15) |

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
