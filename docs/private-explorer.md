# Rubriques Explorer en vérification

## Périmètre

- `danceStyles` : `/explorer/styles-de-danse` et toutes ses sous-routes, dont les 46 fiches actuelles.
- `jobs` : `/explorer/metiers-de-la-danse` et toute future sous-route. Aujourd'hui les métiers sont regroupés sur cette page.
- `schools` : `/explorer/ecoles-de-danse` et toute future sous-route. Aujourd'hui les fiches sont intégrées à l'annuaire.

Le middleware couvre les chemins et descendants, y compris les requêtes RSC/préchargements. Les pages contrôlent aussi la session avant de lire/rendre leurs données ; les layouts couvrent les descendants. Toute future API retournant ces données doit avoir le même contrôle serveur. Ne pas exporter ces données dans un JSON public ou un composant client.

Toutes les sous-catégories protégées portent « Bientôt » dans les menus desktop et mobile : les six entrées Explorer, les quatre entrées Apprendre, ainsi que Sortir. La mention reste affichée pendant le travail privé. Chaque lien reste cliquable et ouvre la page d'accès correspondant à sa rubrique, y compris en local et après connexion. Les cartes Explorer suivent la même règle. Les anciens accès utilisent `PREVIEW_PASSWORD`, les trois nouvelles rubriques utilisent `EXPLORER_ACCESS_CODE` ; aucune session n'ouvre l'autre périmètre sur Vercel. L'ancien cookie local dure huit heures, et non plus trente secondes.

`GET /api/explorer-access` renvoie uniquement trois booléens non mis en cache : autorisation Explorer, autorisation des anciennes rubriques et mode d'édition locale. Jamais le code ni le cookie. La page d'attente utilise le même composant `components/PrivateAccessPage.tsx`, les mêmes photographies et le même CSS que les autres pages d'accès privé.

## Continuer à travailler en local

`DANCELAB_LOCAL_EDITOR=1` dans `.env.local` (ignoré par Git) active l'accès direct uniquement avec **`next dev`**, sur un hôte **localhost / 127.0.0.1 / [::1]**, et **hors Vercel**. Le serveur de développement doit rester lié à `127.0.0.1` (actuellement port 3010), pas exposé au réseau. Cela ne déverrouille pas l'administration.

Ce réglage est ignoré dans tout build de production (`next start`), même si la variable y était copiée par erreur et même avec un Host localhost. Les cookies sécurisés et les codes restent nécessaires sur Vercel. Pour désactiver l'accès direct local, passer la variable à `0` puis recharger/redémarrer le serveur.

Les pages d'attente restent affichées normalement, sans redirection automatique ni paramètre spécial. En édition locale uniquement, leur lien secondaire devient « Ouvrir la page de travail » et pointe vers le contenu demandé. Il réutilise l'emplacement et le design du lien « En attendant », sans modifier la composition, les photographies ou le formulaire. Sa présence et sa destination sont déterminées côté serveur ; il n'est jamais affiché en production. Les URL directes des contenus restent accessibles pour travailler en local.

## Renseigner le code, sans le partager dans le code source

Dans le **projet Vercel existant** : **Settings → Environment Variables**, ajouter **`EXPLORER_ACCESS_CODE`**. Saisir soi-même une phrase secrète longue et non réutilisée (au moins 16 caractères conseillé), sélectionner **Production** et **Preview** si ces prévisualisations doivent aussi permettre l'accès, puis redéployer la version validée.

Aucun code n'est fourni ou généré par le projet. Ne pas préfixer la variable par `NEXT_PUBLIC_`. Ne pas la mettre dans GitHub, une capture d'écran ou un message. Pour tester personnellement en local, utiliser `.env.local` (ignoré par Git) et redémarrer le serveur. Les tests automatiques créent seulement une valeur aléatoire en mémoire pour leur serveur temporaire : ce n'est pas un code de production.

**Sur Vercel et dans les builds de production, sans variable les trois rubriques restent fermées.** L'accès privé indique qu'il n'est pas configuré. Les anciennes rubriques restent elles aussi fermées si `PREVIEW_PASSWORD` manque. `EXPLORER_ACCESS_CODE` ne modifie pas l'ancien accès Sortir/Apprendre ni l'administration.

## Session et limites

- Signature HMAC-SHA-256, expiration serveur et cookie à huit heures. Le code n'est jamais dans le cookie.
- Cookie `HttpOnly`, `SameSite=Lax`, `Secure` en production, partagé entre les trois rubriques.
- Changer le code invalide les anciennes sessions. « Fermer l'accès privé » efface le cookie.
- Contrôle d'origine sur connexion/déconnexion, taille des requêtes limitée, redirections limitées aux trois rubriques.
- Maximum cinq tentatives par IP sur quinze minutes et cent tentatives par instance sur cette période, réponse `429` et `Retry-After`. Sur Vercel, l'IP vient de l'en-tête réécrit par la plateforme ; hors Vercel le quota est partagé par instance.
- **Limite explicite : le compteur mémoire est local à chaque instance et disparaît à son redémarrage.** Pour une limitation persistante à l'échelle de tout le déploiement, activer dans le **WAF du projet Vercel existant** une règle de limitation par IP sur `POST /api/explorer-access` (5 requêtes / 15 min, blocage temporaire ; vérifier les options et coûts du forfait). Ne pas présenter la protection mémoire comme un quota distribué. Aucune configuration Vercel n'a été modifiée automatiquement.
- Les pages privées ne sont ni pré-générées ni mises en cache publiquement. Elles et leurs redirections portent `noindex, nofollow, noarchive` ; le sitemap et la recherche publique omettent les rubriques. La page d'accès porte également `noindex`.
- Cette protection empêche les visiteurs d'accéder aux **pages**. Elle ne rend pas confidentiels un dépôt GitHub public, des images dans `public/`, ni des contenus déjà publiés/indexés auparavant. Ne pas y stocker de données sensibles.

## Ouvrir une rubrique

Modifier uniquement `data/section-visibility.ts` : passer la clé souhaitée de `'private'` à `'public'`, puis construire et déployer. Les liens publics, la recherche, le sitemap et l'indexation suivent cette configuration. Les autres clés restent protégées. Aucune suppression des mécanismes de sécurité n'est nécessaire.

## Tests

`node --require ./tests/register.cjs --test tests/explorer-access.test.ts`

Après un build, `DANCELAB_TEST_BUILD_DIR=/chemin/du/build node --require ./tests/register.cjs tests/explorer-access.integration.cjs` démarre des serveurs temporaires sans secret puis avec un secret de test en mémoire et vérifie les vraies réponses HTTP. Aucun code ni cookie n'est écrit dans des fichiers ou affiché dans les logs. Ne pas lancer un second build dans `.next` pendant que le serveur local utilise ce dossier ; préférer une copie temporaire isolée.

À vérifier aussi dans un navigateur desktop/mobile avant mise en production : saisie/masquage, erreur, accès correct, navigation entre rubriques, déconnexion et absence de débordement. Un test HTTP ou CSS seul ne constitue pas une validation visuelle.

Références : [authentification Next.js](https://nextjs.org/docs/app/guides/authentication), [cookies Next.js](https://nextjs.org/docs/app/api-reference/functions/cookies), [en-têtes Vercel](https://vercel.com/docs/headers/request-headers), [limitation Vercel](https://vercel.com/kb/guide/add-rate-limiting-vercel).
