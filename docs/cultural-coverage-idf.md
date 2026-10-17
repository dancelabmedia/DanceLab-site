# Couverture culturelle Paris et Île-de-France - 16 octobre 2026

## Suivi du 17 octobre 2026 - remplace les compteurs du relevé initial ci-dessous

- Passage quotidien exécuté avec 12 pages maximum par lieu, puis reprise ciblée des sources corrigées.
- 61 lieux désormais atteints sur 69, contre 56 au relevé initial. Le rapport contient 778 références URL/lieu ; une même URL partagée par plusieurs lieux peut être comptée pour chacun. Cela ne représente pas 778 spectacles ni une couverture exhaustive.
- Sources rétablies après vérification : Grand Palais (`/fr/programme`), Théâtre Public de Montreuil (nouveau domaine), Théâtre Gérard Philipe (sous-domaine TGP) et Mogador (site officiel Stage Entertainment). Les quatre sources ont répondu sans erreur lors du contrôle ciblé.
- 15 observations de programmations restent dans le relevé après exclusion des ateliers de pratique et consolidation des séances vérifiées. Certaines sont toujours à vérifier ; les concerts hybrides ne sont pas importés sur la seule présence d'un mot-clé.
- **Un nouvel ajout vérifié aujourd'hui** : Same Old Songs de Maud Blandel, Salle Maria Casarès du Théâtre Public de Montreuil, du 20 au 25 novembre 2026. Les cinq représentations (20, 21, 23, 24 et 25 novembre), les horaires, le tarif de 9 à 27 €, l'image officielle et les crédits publiés sont enregistrés dans une seule fiche. Source : https://theatrepublicmontreuil.com/same-old-songs.
- Le contrôle live avant import ne trouvait aucune fiche correspondante. Après création, une nouvelle simulation retourne création 0 / mise à jour 1. Le cumul des ajouts de cet audit est donc de deux programmations, dont celle du Junior Ballet ajoutée le 16 octobre.
- L'atelier d'écriture autour de Same Old Songs reste distinct du spectacle. Les ateliers de danse/cabaret sont exclus des candidats Sortir et conservés comme pistes à vérifier pour Explorer / Écoles de danse, sans publication automatique.
- Le collecteur conserve désormais les observations précédentes lors d'un passage partiel. Une programmation vérifiée remplace ses entrées JSON-LD par séance dans le rapport, sans supprimer des étapes publiées dans d'autres villes.
- 86 tests réussis. Aucune collecte nationale supprimée, aucun événement supprimé et aucune annulation déduite d'une absence de collecte. Aucun déploiement n'a été réalisé.

Le détail à jour figure dans `data/cultural-coverage-idf.json`. Aucun lieu n'est certifié entièrement couvert ; huit lieux restent sans page exploitable. Le tableau historique ci-dessous décrit la première passe, pas les derniers compteurs.

## État réel : audit partiel, pas de couverture exhaustive certifiée

- 69 lieux repérés dans un répertoire initial. Ce répertoire comporte des institutions, des salles et des festivals ; ce n'est pas un décompte exhaustif de toutes les salles franciliennes.
- 56 lieux atteints et 265 URL distinctes consultées.
- 13 lieux sans page exploitable lors de ce passage.
- 10 observations de programmations dans le relevé : neuf détections structurées à vérifier et un événement contrôlé éditorialement.
- Un nouvel événement ajouté dans Notion : Junior Ballet de l’Opéra national de Paris au 13e Art, du 4 au 13 juin 2027.
- Un second passage d'import donne création 0 / mise à jour 1 : absence de duplication.
- La fiche ajoutée a été ouverte et vérifiée dans le navigateur, avec l'affiche officielle, les dates, le lieu et le type Ballet après actualisation.
- Aucun lieu déclaré intégralement couvert.

Les nombres de programmations sont des minimums repérés par les mécanismes effectivement appliqués, PAS le nombre réel de spectacles programmés. Les détections automatiques avec ville, lieu, date ou identité incomplets restent à vérifier ; une absence de correspondance automatique ne prouve pas que l'événement manque dans Dance Lab. Les effectifs « catalogue » du tableau sont les événements déjà rattachables au lieu, indépendamment des détections de cette collecte.

## Résultats concrets

La Villette et le 13e Art ont chacun été approfondis sur 27 pages lors du second passage ; le 13e Art a ensuite été poursuivi. Les pages restantes sont conservées dans une file pour les passages suivants. Leurs pages de saison contiennent davantage d'informations que leurs seuls blocs JSON-LD : le parseur générique ne suffit donc pas à certifier leur couverture.

Le 13e Art dispose déjà de Carmen, Bonnie & Clyde, Casse-Noisette, DISCO, Let's Go et Haute Couture. Le Junior Ballet était absent et a été ajouté après comparaison live. Le site publie une affiche officielle, un tarif à partir de 45 €, la période du 4 au 13 juin, et une séance du 6 juin à 17h. Le programme précis et les noms des interprètes ne sont pas encore annoncés : aucune distribution fictive ni discipline fine n'a été inventée. Source : https://le13emeart.com/les-evenements/junior-ballet-de-lopera-national-de-paris-2/

Le Lido utilise désormais https://theatredulido.com/ ; l'ancienne URL lido2paris.com échouait. Son site annonce Singin' in the Rain jusqu'au 10 janvier 2027. Cette production est une comédie musicale, pas une ancienne revue permanente à reconduire sans contrôle. La fiche n'a pas été créée automatiquement sans vérification complète des données et de l'image.

« Théâtre Saint-Antoine » reste d'identité incertaine. Il n'est pas automatiquement remplacé par le Théâtre Antoine.

Une erreur de typage a aussi été identifiée : le test de sous-chaîne « bal » capturait « ballet ». L'ordre de classification a été corrigé pour ne plus afficher un ballet comme un bal.

## Tableau de suivi

Toutes les lignes restent partielles ou non explorées. « Pages » signifie URL effectivement récupérées, pas spectacles. « Détectés » signifie candidats structurés ou relevés éditoriaux, sans garantie d'exhaustivité.

| Lieu | Ville | Pages | Catalogue | Détectés | Ajoutés | Pages en attente |
|---|---|---:|---:|---:|---:|---:|
| Atelier de Paris / CDCN | Paris | 4 | 7 | 0 | 0 | 19 |
| Carreau du Temple | Paris | 4 | 14 | 0 | 0 | 21 |
| Casino de Paris | Paris | 4 | 4 | 0 | 0 | 69 |
| CENTQUATRE-PARIS | Paris | 4 | 2 | 1 | 0 | 28 |
| Centre national de la danse | Pantin | 4 | 0 | 0 | 0 | 33 |
| Chaillot | Paris | 0 | 34 | 0 | 0 | 0 |
| Château de Versailles Spectacles | Versailles | 4 | 0 | 0 | 0 | 13 |
| Crazy Horse | Paris | 4 | 0 | 0 | 0 | 21 |
| Dôme de Paris | Paris | 0 | 4 | 0 | 0 | 0 |
| Espace 1789 | Saint-Ouen | 4 | 1 | 0 | 0 | 21 |
| Festival d’Automne | Paris | 4 | 0 | 0 | 0 | 18 |
| Grand Palais | Paris | 0 | 0 | 0 | 0 | 0 |
| L’Azimut | Châtenay-Malabry | 4 | 0 | 0 | 0 | 8 |
| L’Étoile du Nord | Paris | 4 | 4 | 0 | 0 | 4 |
| L’Onde | Vélizy-Villacoublay | 3 | 0 | 0 | 0 | 0 |
| La Briqueterie / CDCN | Vitry-sur-Seine | 4 | 0 | 0 | 0 | 26 |
| La Ferme du Buisson | Noisiel | 4 | 0 | 0 | 0 | 14 |
| La Nouvelle Ève | Paris | 3 | 1 | 0 | 0 | 0 |
| La Place | Paris | 4 | 1 | 0 | 0 | 32 |
| La Scala Paris | Paris | 4 | 2 | 0 | 0 | 3 |
| La Seine Musicale | Boulogne-Billancourt | 4 | 0 | 1 | 0 | 67 |
| La Villette | Paris | 27 | 2 | 0 | 0 | 12 |
| Le 13e Art | Paris | 38 | 7 | 1 | 1 | 2 |
| Le Générateur | Gentilly | 4 | 0 | 0 | 0 | 31 |
| Le Regard du Cygne | Paris | 4 | 6 | 0 | 0 | 4 |
| Le Sample | Bagnolet | 0 | 0 | 0 | 0 | 0 |
| Les Gémeaux | Sceaux | 4 | 0 | 0 | 0 | 39 |
| Lido 2 Paris | Paris | 2 | 0 | 0 | 0 | 0 |
| Maison des Arts de Créteil | Créteil | 4 | 0 | 0 | 0 | 3 |
| MC93 | Bobigny | 4 | 0 | 0 | 0 | 64 |
| Moulin Rouge | Paris | 4 | 1 | 0 | 0 | 5 |
| Musée d’Orsay | Paris | 0 | 1 | 0 | 0 | 0 |
| Musée du quai Branly | Paris | 1 | 0 | 0 | 0 | 6 |
| Nouveau Théâtre de Montreuil | Montreuil | 0 | 0 | 0 | 0 | 0 |
| Oh! César Paris | Paris | 3 | 1 | 0 | 0 | 7 |
| Opéra Bastille | Paris | 4 | 1 | 0 | 0 | 28 |
| Opéra de Massy | Massy | 4 | 0 | 0 | 0 | 37 |
| Palais de Tokyo | Paris | 4 | 0 | 0 | 0 | 2 |
| Palais des Congrès de Paris | Paris | 0 | 0 | 0 | 0 | 0 |
| Palais Garnier | Paris | 4 | 1 | 0 | 0 | 28 |
| Paradis Latin | Paris | 4 | 0 | 0 | 0 | 11 |
| Philharmonie de Paris | Paris | 4 | 2 | 0 | 0 | 36 |
| Point Éphémère | Paris | 4 | 0 | 0 | 0 | 19 |
| Points communs | Cergy | 4 | 0 | 0 | 0 | 72 |
| Rencontres chorégraphiques internationales de Seine-Saint-Denis | Seine-Saint-Denis | 3 | 0 | 0 | 0 | 45 |
| Théâtre de Brétigny | Brétigny-sur-Orge | 4 | 0 | 0 | 0 | 67 |
| Théâtre de Châtillon | Châtillon | 2 | 0 | 0 | 0 | 0 |
| Théâtre de la Bastille | Paris | 4 | 2 | 0 | 0 | 56 |
| Théâtre de la Porte Saint-Martin | Paris | 2 | 0 | 0 | 0 | 0 |
| Théâtre de la Ville | Paris | 4 | 11 | 7 | 0 | 48 |
| Théâtre de Paris | Paris | 4 | 0 | 0 | 0 | 1 |
| Théâtre de Saint-Quentin-en-Yvelines | Montigny-le-Bretonneux | 4 | 0 | 0 | 0 | 10 |
| Théâtre de Suresnes Jean Vilar | Suresnes | 4 | 1 | 0 | 0 | 56 |
| Théâtre de Vanves | Vanves | 4 | 0 | 0 | 0 | 74 |
| Théâtre des Bouffes du Nord | Paris | 4 | 0 | 0 | 0 | 9 |
| Théâtre des Champs-Élysées | Paris | 4 | 1 | 0 | 0 | 20 |
| Théâtre des Gémeaux Parisiens | Paris | 0 | 0 | 0 | 0 | 0 |
| Théâtre du Châtelet | Paris | 4 | 2 | 0 | 0 | 27 |
| Théâtre du Rond-Point | Paris | 4 | 1 | 0 | 0 | 6 |
| Théâtre Gérard Philipe | Saint-Denis | 0 | 0 | 0 | 0 | 0 |
| Théâtre Jean Vilar | Vitry-sur-Seine | 4 | 0 | 0 | 0 | 15 |
| Théâtre Louis Aragon | Tremblay-en-France | 0 | 0 | 0 | 0 | 0 |
| Théâtre Mogador | Paris | 0 | 0 | 0 | 0 | 0 |
| Théâtre Montansier | Versailles | 4 | 0 | 0 | 0 | 3 |
| Théâtre Nanterre-Amandiers | Nanterre | 1 | 0 | 0 | 0 | 0 |
| Théâtre Paul Éluard | Bezons | 4 | 0 | 0 | 0 | 24 |
| Théâtre Saint-Antoine | Paris | 0 | 0 | 0 | 0 | 0 |
| Théâtre Sénart | Lieusaint | 0 | 0 | 0 | 0 | 0 |
| Théâtre Victor Hugo | Bagneux | 4 | 0 | 0 | 0 | 10 |

## Sources non explorées ou en échec

- Chaillot : robots.txt inaccessible : collecte différée par prudence
- Dôme de Paris : robots.txt inaccessible : collecte différée par prudence
- Grand Palais : HTTP 404
- Le Sample : robots.txt inaccessible : collecte différée par prudence
- Musée d’Orsay : HTTP 403
- Nouveau Théâtre de Montreuil : Redirection vers un autre domaine : identité à vérifier
- Palais des Congrès de Paris : robots.txt inaccessible : collecte différée par prudence
- Théâtre des Gémeaux Parisiens : Redirection vers un autre domaine : identité à vérifier
- Théâtre Gérard Philipe : Redirection vers un autre domaine : identité à vérifier
- Théâtre Louis Aragon : robots.txt inaccessible : collecte différée par prudence
- Théâtre Mogador : Redirection vers un autre domaine : identité à vérifier
- Théâtre Saint-Antoine : Nom et site officiel à confirmer, aucune assimilation automatique à un théâtre homonyme.
- Théâtre Sénart : HTTP 403

Les adresses du répertoire sont des points d'entrée à vérifier, pas une garantie préalable d'identité officielle ou de disponibilité. Les redirections inter-domaines, les robots.txt bloquants, les PDF non analysés, les erreurs HTTP et les délais dépassés sont consignés. Les PDF ne sont pas présentés comme lus lorsque seul leur lien a été trouvé.

## Collecte et découverte

- `data/cultural-venues-idf.ts` : répertoire initial et alias de lieux.
- `scripts/audit-cultural-coverage.ts` : parcours borné des saisons et fiches internes, respect des exclusions robots détectées, journal des pages, comparaison au catalogue live.
- `data/cultural-coverage-idf.json` : rapport détaillé, erreurs, exclusions, pages en attente et modifications de contenu.
- `data/cultural-coverage-observations.json` : observations, sans publication automatique.
- `data/cultural-venue-discovery.json` : 33 pistes externes découvertes, d'identité et de région encore à vérifier. Elles ne comptent pas comme 33 salles franciliennes vérifiées.
- `data/cultural-discovery-sources.json` : annuaires officiels des Scènes nationales et du ministère de la Culture.
- `data/cultural-coverage-verified.json` : données vérifiées autorisées à l'import.
- `data/cultural-coverage-imports.json` : journal des ajouts réalisés.

Une candidature automatique reste marquée `needsReview`. Aucun style n'est déduit d'une photographie ou d'un nom de compagnie. Le rapprochement réutilise le moteur commun de déduplication et bloque les fusions de lieux ou productions différents. La disparition d'une page dans une collecte partielle n'est jamais assimilée à une annulation. Les changements de contenu sont signalés pour vérification ; ils ne signifient pas nécessairement changement de dates.

Les candidats découverts dans un annuaire national ne sont pas attribués à Paris sans contrôle de leur adresse. Les collecteurs nationaux et Marseille n'ont pas été restreints par cet audit.

## Suivi régulier

Un suivi quotidien à 9h a été créé dans cette conversation Codex : **Couverture culturelle Dance Lab**. Il doit reprendre les pages en attente, vérifier les sources défaillantes et enrichir uniquement les informations contrôlées. Il dépend de l'environnement local Codex et de ses autorisations ; ce n'est pas une promesse de service serveur permanent.

Le cron Vercel existant `check-agenda` surveille le cycle de vie du catalogue mais ne collecte pas les saisons des théâtres. Il n'a pas été présenté comme une synchronisation de couverture, ni modifié. Aucun déploiement Vercel ou GitHub n'a été effectué.

## Commandes et contrôles

- `npm run audit:coverage -- --pages=12` : lecture des sources et rapport, sans publication.
- `npm run audit:coverage -- --venue='La Villette' --pages=25` : approfondissement ciblé.
- `npm run sync:events -- --input data/cultural-coverage-verified.json` : simulation.
- Ajouter `--apply` uniquement après validation des sources et du plan. Une sauvegarde des pages Notion est créée avant écriture.
- 85 tests réussis, dont quatre tests sur la couverture et le typage Ballet/Bal ; TypeScript validé.

## Travail restant

L'audit exhaustif demandé n'est pas terminé. Restent notamment la qualification des 33 pistes, les 13 lieux non explorés, le traitement des calendriers JavaScript, des brochures et PDF, la lecture éditoriale des fiches sans données structurées, la distribution complète lorsqu'elle est publiée et l'intégration vérifiée du reste des spectacles. Aucun ratio de couverture complète ne peut encore être annoncé.
