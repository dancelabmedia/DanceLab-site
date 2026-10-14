# Synchronisation des épisodes Dance Lab

## Flux automatique

- Ausha RSS est la source de vérité pour le numéro, le titre, l'invité.e, la description, la date, la durée, l'audio, la pochette, les chapitres et la smartlink.
- `/api/cron/sync-episodes` invalide le cache Ausha chaque heure et met à jour `data/episode-sync-report.json` lorsqu'un changement ou un manque est détecté.
- `/api/cron/match-teasers` recherche YouTube et Instagram toutes les six heures. Une association partielle reste surveillée : trouver YouTube ne bloque plus la recherche d'un Reel publié plus tard.
- `/api/webhooks/ausha` peut invalider immédiatement le cache si Ausha ou un automatisme autorisé appelle ce point d'entrée.

Les pages d'épisodes sont dynamiques : un épisode publié dans le flux Ausha est disponible sans créer de fichier de page.

## Variables de production

- `CRON_SECRET` : protège les crons Vercel.
- `GITHUB_TOKEN`, `GITHUB_OWNER`, `GITHUB_REPO` : permettent aux crons et à l'administration de persister rapports et associations dans Git.
- `INSTAGRAM_ACCESS_TOKEN` : accès autorisé à l'API Instagram Graph.
- `AUSHA_WEBHOOK_SECRET` : secret partagé optionnel pour `POST /api/webhooks/ausha` via l'en-tête `x-dancelab-webhook-secret`.
- `ADMIN_PASSWORD` ou `PREVIEW_PASSWORD` : protège `/admin/episodes`.

## Association fiable

- L'identité durable est le GUID Ausha, jamais le titre.
- Instagram exige le numéro plus le nom de l'invité.e ou la marque Dance Lab.
- YouTube exige le numéro plus le nom de l'invité.e ou au moins deux termes significatifs du titre Ausha.
- En cas de doute, aucun média n'est associé.

## Intervention éditoriale

La page `/admin/episodes` affiche le rapport de synchronisation et permet de valider une URL YouTube ou Instagram. Ces associations sont enregistrées dans `data/episode-media-overrides.json`, indexées par GUID Ausha et conservées lors des synchronisations suivantes.
