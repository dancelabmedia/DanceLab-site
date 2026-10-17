# Déduplication des événements - 15 octobre 2026

## Correction enregistrée

Cinq fiches Notion correspondaient à la même programmation, et non quatre. La fiche `38ac0d76-c249-81de-8323-c5a0b324dc5c` est conservée avec le titre officiel **Les 4 saisons dansées**. Les quatre copies ont été archivées de façon récupérable après sauvegarde et fusion des informations.

URL conservée : `/sortir/les-4-saisons-dansees-merzouki-chauvin-2027-05-10`.

Les cinq variantes d'URL déclarées dans `data/event-canonicalizations.json` renvoient une redirection permanente 308 vers cette fiche.

La fiche contient les séances des **10, 11 et 13 mai 2027 à 19h30**, la photographie officielle, sept crédits de distribution, le programme, les tarifs et la billetterie. Vérification éditoriale : [Théâtre des Champs-Élysées](https://www.theatrechampselysees.fr/saison-2026-27/danse/les-4-saisons-dansees).

La production du Paris Ballet Theatre au Palais des Congrès en novembre 2026 reste indépendante.

## Cause technique

La déduplication précédente reposait sur des titres trop littéraux. Les variations « 4 / Quatre » et les suffixes artistes ou théâtre produisaient des identités différentes. Le lecteur Notion pouvait également retenir une propriété vide avant une autre propriété renseignée, et ne reconnaissait pas le champ « Lien billetterie ».

## Correction durable

- `lib/event-deduplication.mjs` centralise la normalisation, la comparaison prudente, l'enrichissement non mutant et la préparation des mises à jour avant création.
- Les lieux, villes, productions, artistes et périodes contradictoires empêchent les fusions automatiques.
- Les identifiants de sources, anciennes URL, séances et crédits sont persistés dans Notion. Les références originales sont sauvegardées et les associations validées restent prioritaires.
- `lib/event-catalogue.ts` applique la même consolidation aux listes, recherches et fiches.
- `scripts/collect-shows.mjs` consulte le catalogue Notion avant de préparer des créations. Une indisponibilité de Notion produit une demande de vérification, pas une hypothèse de catalogue vide.
- `scripts/sync-agenda-events.ts` relit le catalogue avant les écritures et privilégie la mise à jour. Les candidats ambigus restent en vérification.
- Aucun ordonnanceur externe ni déploiement n'a été modifié : les imports doivent utiliser cette voie commune pour bénéficier du contrôle avant écriture.

## Audit global

Le rapport `data/event-duplicate-audit.json` couvre **819 enregistrements sources** : 553 pages Notion et 266 entrées locales. Il produit 593 événements consolidés, soit 226 références redondantes regroupées en 213 groupes. Ces nombres incluent les correspondances entre sources locales et Notion, pas seulement des doublons physiques dans Notion.

Seules les quatre copies de la programmation explicitement vérifiée ont été archivées dans Notion. Les autres rapprochements fiables sont consolidés à la lecture et à l'import. Les 81 paires non fusionnées sont documentées pour examen : elles incluent des lieux ou productions distincts et ne constituent pas 81 doublons prouvés.

Sauvegarde récupérable : `.local/event-deduplication/2026-10-15T11-51-26-607Z/` (données originales et blocs Notion, non versionnés).

## Vérifications

- 75 tests automatiques réussis, dont 13 tests spécifiques de déduplication.
- Vérification TypeScript et build de production réussis.
- API locale : une seule programmation TCE, avec la production Palais des Congrès conservée séparément.
- Anciennes URL : cinq redirections 308 contrôlées.
- Simulation de réimport des anciennes fiches : une seule fiche résultante, trois séances conservées.
- Fiche ouverte dans le navigateur : titre, photographie, distribution, séances et billetterie présents.

## Commandes

`npm run audit:events` effectue un audit sans écriture.

`npm run sync:events -- --input fichier.json` simule un import. L'option `--apply` effectue les écritures après sauvegarde.

`npm run audit:events -- --apply-verified` applique uniquement les fusions explicitement validées dans les règles canoniques.
