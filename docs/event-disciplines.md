# Audit des disciplines Sortir - 16 octobre 2026

## Corrections éditoriales vérifiées

- MEMENTO de MazelFreten : **Électro et Hip-hop**, sans Breaking. La compagnie décrit la rencontre de trois danseurs électro et de trois danseuses hip-hop : https://www.mazelfreten.com/memento.
- La Swaré House An Nou : **House et Gwoka**, sans Breaking. La présentation fournie par l'organisateur mentionne ce dialogue dansé : https://www.paris.fr/evenements/la-sware-house-an-nou-123979.
- Rave Lucid : règle Électro prête pour les prochaines programmations identifiables de cette pièce, d'après https://www.mazelfreten.com/rave-lucid. Aucun événement supplémentaire n'est inventé pour remplir le catalogue.

Les deux premières corrections ont été enregistrées dans Notion. Sauvegardes : `.local/event-deduplication/disciplines-1792166147850/`. Les copies locales sont corrigées par la même règle à la lecture. Il s'agit de **deux programmations vérifiées**, pas de centaines de spectacles validés individuellement.

## Causes techniques

La source importée regroupait Hip-hop et Breaking dans un seul label. Le lecteur Notion divisait ensuite tous les libellés au caractère `/`, ce qui transformait ce regroupement générique en deux disciplines prétendument confirmées. Les champs génériques Tags/Mots-clés pouvaient aussi être utilisés comme disciplines. Enfin, les listes de styles contenaient des formats de spectacles ou de restauration (Cabaret, Dîner-spectacle, Brunch, etc.).

## Fonctionnement corrigé

`lib/event-disciplines.mjs` fournit un vocabulaire commun, des alias et un audit explicite. Les types ne deviennent plus des disciplines. Le séparateur `/` n'est plus interprété comme la preuve de plusieurs styles. Pour l'ancien label ambigu Hip-hop / Breaking, seuls les styles explicitement présents dans le descriptif sont retenus, avec maintien du statut « à vérifier » : ce traitement lexical n'est pas une validation éditoriale officielle.

Les règles sourcées dans `data/event-discipline-rules.json` sont prioritaires, identifiées et datées. Elles se basent sur une œuvre ET son identité artistique, jamais sur une compagnie seule. Elles sont réappliquées après fusion et après enrichissement, empêchant les données génériques de réintroduire Breaking sur MEMENTO. Les contradictions sont consignées dans le rapport. Les collecteurs et l'import Notion réutilisent cette logique.

Les cartes, les fiches, le filtre Discipline et la recherche reçoivent le même catalogue normalisé. Les termes canoniques sont ajoutés à l'index de recherche. Aucun changement de design.

## Portée et limites de l'audit

Le rapport `data/event-discipline-audit.json` examine l'intégralité des sources disponibles : **821 enregistrements**, dont **549 pages Notion et 272 entrées locales**. Certaines entrées représentent une même programmation dans plusieurs sources.

Une modification de label peut être une simple harmonisation, la suppression d'un type non chorégraphique ou le traitement prudent d'un label ambigu. Elle ne constitue pas une vérification artistique individuelle. Les libellés simples reconnus restent des données déclarées par la source et sont signalés comme non vérifiés tant qu'une règle éditoriale n'a pas été validée.

**Le contrôle manuel de chaque présentation officielle de tout le catalogue n'est pas terminé.** Le rapport distingue précisément les corrections vérifiées et les attributions restant à documenter. Les disciplines inconnues sont signalées plutôt qu'inventées. Le vocabulaire peut évoluer avec de nouvelles règles documentées.

## Vérifications

- 81 tests automatiques réussis, dont cinq tests spécifiques de classification.
- TypeScript validé.
- Navigateur desktop : MEMENTO apparaît dans Électro, avec Électro / Hip-hop sur sa carte. Il n'apparaît pas dans Breaking, où Chill in the City est présent.
- Navigateur mobile : le filtre House retrouve La Swaré House An Nou avec House / Gwoka.
- Fiche MEMENTO contrôlée sur mobile et ordinateur sur un serveur isolé : la rubrique Discipline affiche Électro / Hip-hop. L'ancienne URL redirige vers la fiche consolidée.
- Les scénarios classique, contemporain et multistyles sont couverts par les tests unitaires ; cela ne vaut pas vérification officielle de toutes les œuvres de ces catégories.

## Maintenance

`npm run audit:disciplines` : rapport sans modification de la base.

`npm run audit:disciplines -- --apply-verified` : sauvegarde et écriture des seules règles éditoriales sourcées.

Pour verrouiller une nouvelle correction, ajouter une règle précise dans `data/event-discipline-rules.json` avec l'œuvre, l'identité artistique, les disciplines, l'URL officielle et la date de vérification. Aucun service de classification IA ou abonnement n'a été ajouté.
