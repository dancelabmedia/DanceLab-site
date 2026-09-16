# Épisodes similaires : règles éditoriales

Les deux rendus (`EpisodePage` historique et `RssEpisodePage`) utilisent désormais
`getRecommendedEpisodes` dans `lib/episode-recommendations.server.ts`.
Le catalogue et son analyse sont partagés avec les métadonnées et la page courante
au cours du rendu serveur. Aucun changement de composant visuel, d'image ou de lien
n'est requis pour ajouter un nouvel épisode.

## Causes corrigées

- Les pages historiques ne comparaient que les épisodes 1–121 et ne pouvaient
  pas recommander les nouveaux épisodes RSS.
- Les pages RSS comparaient les historiques sans leur description complète.
- Même série (+10), même invité (+7) et clusters de styles (+5) pouvaient dominer
  un véritable sujet de fond (+3 ou +1).
- L'accumulation de tags et le départage par numéro favorisaient certains épisodes.
- Handicap et accessibilité n'étaient pas des entrées du référentiel.

## Analyse des sources

`buildRecommendationInputs` réunit le titre, le résumé, la description complète,
la citation, les chapitres historiques ou timecodes présents dans la description,
et les articles **publiés** associés comme article principal à cet épisode.
Les brouillons, publications futures et simples liens vers d'autres épisodes sont
exclus. Les données historiques complètes sont réhydratées depuis `data/episodes.ts`.

Le moteur est déterministe : il examine des formulations contextualisées dans le
référentiel unique `lib/episode-themes.ts`. Il ne prétend pas écouter l'audio ni
comprendre exhaustivement une transcription. Aucun appel à un modèle payant.
`editorialKeywords` enrichit les formulations reconnues sans modifier les règles
du détecteur historique de tags. Les nouveaux sujets ont une seule clé canonique.
`EPISODE_THEME_REFERENCE` contient le référentiel complet ; `TAG_TAXONOMY` en
expose le sous-ensemble public historique. Les nouvelles entrées réservées aux
recommandations ne retaguent donc pas les épisodes ni les pages thématiques.

Un titre ou chapitre explicitement consacré au sujet, un résumé annonçant le sujet,
une question éditoriale ou plusieurs passages indépendants constituent des indices.
Les sources copiées/collées, signatures promotionnelles, intros parlant d'autres
épisodes, sous-chaînes trompeuses et termes ambigus sont écartés.
Un article associé ne suffit pas, à lui seul, à attribuer son sujet à l'interview.
Les anciens tags sont disponibles à l'entrée mais volontairement non probants,
car ils ont pu être attribués d'après le profil de l'invité.

Chaque profil contient au maximum **5 sujets principaux**, avec les passages
justificatifs, et au maximum **2 styles secondaires**. La cible est 3–5 sujets,
mais il n'y a pas de remplissage artificiel si seulement 1–2 sont documentés.
Dans ce cas, `needsEditorialReview` signale un profil à enrichir si des sources
plus précises deviennent disponibles, pas une autorisation d'inventer des thèmes.

Le moteur pur accepte également un champ `transcript` : plusieurs passages
indépendants sont nécessaires. Aucune transcription n'est actuellement raccordée
aux données du site ; aucun enregistrement n'a été retranscrit pour cet audit.

## Classement

1. Rapprochements manuels validés, dans l'ordre défini.
2. Sujet spécifique partagé, suffisamment étayé dans les deux interviews.
3. Problématique commune ou sujet moins fortement documenté.
4. Métier/parcours similaire, s'il est explicitement renseigné (pas « danseur »).
5. Style réellement abordé dans les deux interviews.
6. Proximité générale, série ou invité récurrent.

Les catégories de score sont disjointes : plusieurs indices faibles ne peuvent
dépasser un sujet fort. Dans une catégorie, le score combine le recouvrement
normalisé, la spécificité du sujet dans le catalogue et la force des preuves.
Il ne dépend ni des écoutes, ni de la popularité, ni de la récence, ni du nombre
brut de tags. Les ex æquo utilisent un départage stable propre à chaque paire.
Pas de doublon, pas d'auto-recommandation, pas de remplissage sans lien identifié.

Un sujet spécifique brièvement annoncé ne prend pas automatiquement le pas sur
le sujet central : par exemple, la maternité mentionnée en secondaire dans 122
ne doit pas effacer son axe santé mentale.

## Rapprochements manuels

Modifier `EDITORIAL_RECOMMENDATIONS` dans `data/episode-relations.ts`.
La clé est le **numéro d'épisode**, indépendant du slug RSS. Chaque cible possède
un numéro, un motif éditorial et des clés de thèmes. Les liens sont directionnels.

L'épisode 128 (Wilfried Bernard / The Pack) place obligatoirement en tête :

- 22 — Ilies Pidzy : handicap, inclusion, accès au métier ;
- 25 — Angelina Bruno : handicap, inclusion, normalisation des corps différents.

Le troisième épisode est calculé automatiquement. Les pages 22 et 25 peuvent
à leur tour recommander 128 grâce à l'analyse commune, sans ajout manuel inverse.
Une cible absente du catalogue, dupliquée ou égale à la source est ignorée.
Les anciens `EPISODE_CLUSTERS` sont conservés comme repères, mais ne donnent plus
aucun bonus de recommandation.

## Anciens et nouveaux épisodes

Tous les épisodes renvoyés par `getEpisodes()` passent dans le même index.
Un nouvel épisode publié dans le RSS est donc analysé sans ajout de code ou de
relation manuelle obligatoire, au prochain rafraîchissement du flux/de la page
(ISR existante : une heure). Aucun total d'épisodes n'est codé en dur.
Un sujet inédit nécessitera une formulation ou une nouvelle entrée canonique :
le moteur préfère manquer un rapprochement plutôt qu'en inventer un.

## Audit et vérifications

`docs/episode-recommendation-audit.json` est un instantané des **128 épisodes**
disponibles au 15 septembre 2026 : thèmes, extraits justificatifs, disponibilité
des sources, scores, motifs de rapprochement et recommandations manuelles.
Ce fichier est un rapport, jamais la source utilisée en production.

Les 128 descriptions, résumés et citations ont été analysés ; 5 épisodes ont
également du contenu éditorial publié associé. Aucun chapitrage ni transcription
n'était disponible dans ce catalogue au moment du contrôle. Pour 60 interviews,
moins de trois sujets étaient suffisamment documentés : voir les entrées
`fewerThanThreeMainTopics`. Aucun profil n'est artificiellement complété.
L'épisode le plus recommandé apparaît sur 8 pages sur 128 (pas de hub omniprésent).

Tests reproductibles, sans ajouter de dépendance :

```sh
node --require ./tests/register.cjs --test tests/episode-recommendations.test.ts
node node_modules/typescript/bin/tsc --noEmit --incremental false
```

La suite couvre les priorités, la curation, les données manquantes, les doublons,
les mentions isolées, les biographies, les mots ambigus, les transcriptions,
les brouillons, le RSS, les recommandations bidirectionnelles et les régressions
éditoriales identifiées pendant l'audit.
