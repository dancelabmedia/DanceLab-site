# Dance Lab — audit et première étape FR / EN

État au 17 septembre 2026. **Ce document décrit un socle et une première tranche, pas une traduction intégrale déjà terminée. Aucun fournisseur de traduction n’est connecté.**

## Recommandation et migration

Le site utilise Next.js 15 App Router. Pour deux langues, les dictionnaires natifs et les Server Components suffisent : pas de widget tiers, de traduction du DOM, ni de dépendance supplémentaire. Les pages traduites réutilisent leurs composants existants, avec un contenu choisi côté serveur.

- Conserver **toutes les URL françaises existantes**, sans imposer `/fr` ni lancer une migration de slugs.
- Ajouter `/en` : `/explorer` ↔ `/en/explorer`, `/episodes/127-waabee` ↔ `/en/episodes/127-waabee`, etc. Les slugs restent stables dans les deux langues. Des slugs anglais pourraient être ajoutés ensuite avec une table de correspondance et des redirections ; ils ne sont pas nécessaires pour obtenir un vrai référencement anglais.
- L’URL explicite détermine toujours la langue. Une préférence enregistrée redirige seulement l’entrée `/` vers `/en` lors d’une nouvelle visite. Les URL profondes partagées restent prévisibles et accessibles aux moteurs.
- Le changement de langue conserve le chemin, la recherche et le fragment. Il recharge le document afin de mettre à jour `<html lang>`, les layouts et les métadonnées côté serveur.
- Le middleware normalise le chemin **avant** les vérifications des rubriques privées. Les routes anglaises ne contournent pas les protections existantes. Aucun accès à `/en/admin` ou `/en/api` n’est créé.

## Sources actuelles

| Zone | Source / construction | Travail nécessaire |
| --- | --- | --- |
| Navigation, footer, newsletter, accès privé | `components/Header.tsx`, `Footer.tsx`, `NewsletterModal.tsx`, `PrivateAccessPage.tsx` : libellés français dans le JSX | Dictionnaires d’interface, liens localisés. Première tranche réalisée. |
| Accueil | `app/HomeClient.tsx` : textes éditoriaux en dur, dernier épisode et article reçus du serveur | Extraire les textes ; localiser les données avant de les transmettre au client. À poursuivre. |
| À propos / pages légales | `app/a-propos/page.tsx`, pages légales : textes majoritairement en dur | Extraction et traduction éditoriale, sans modifier la mise en page. À poursuivre. |
| Explorer | `app/explorer/page.tsx` + `explorer-data.ts` | Modèle unique FR/EN réalisé pour la page d’index. |
| Styles | `styles-data.ts` + composants de grille/fiche | 46 fiches ; champs descriptifs identifiés, noms/références préservés. Templates non encore migrés. |
| Métiers | `metiers-data.ts` + page/composants | 26 métiers ; champs de nom générique/description identifiés. Templates non encore migrés. |
| Écoles | `ecoles-data.ts` + `formations-data.ts` | 89 établissements ; descriptions identifiées. Noms, adresses, programmes officiels, coordonnées et liens exclus. Templates/filtres non encore migrés. |
| Épisodes | `lib/episodes.ts` fusionne les 121 historiques et le RSS Ausha ; extras dans `episode-extras.ts` | 128 épisodes repérés avec le RSS au moment de l’audit. Résumés, descriptions, citations et chapitres identifiés. Les titres officiels et noms d’invités restent intacts. Template non encore migré. |
| Magazine | `lib/all-articles.ts` fusionne `articles-data.ts` et `data/podcast-articles/*.json` | 10 articles publiés lors de l’audit. Brouillons/futures publications exclus de la file publique. Titres éditoriaux, chapôs, sections, conclusions identifiés. Titres de documentaires/œuvres et noms exclus. Template non encore migré. |
| Sortir / Apprendre / thèmes / recherche | Composants en français + données agenda, rubriques et taxonomie | Migration des templates, filtres et index de recherche à poursuivre. Les médias audio/vidéo eux-mêmes ne sont pas traduits par ce socle. |

Les adaptateurs recensent 300 documents avec le RSS ; 28 champs Explorer disposent d’une traduction éditoriale, 1 665 champs de données restent en attente. **Ce n’est pas un inventaire exhaustif des textes encore en dur dans les templates.** Aucun compteur n’est codé dans l’application.

## Ce qui fonctionne dans cette première tranche

- Petit sélecteur FR/EN sur le côté, sans drapeau ni emoji, réutilisant `btn btn-primary` comme Newsletter. Menu au clavier, Échap, clic extérieur, état occupé et erreur réseau.
- Position mobile au-dessus du bouton de retour en haut, prise en compte des safe areas ; le sélecteur reste sous les overlays et modales.
- Préférence serveur par cookie fonctionnel `dancelab_locale`, `HttpOnly`, `SameSite=Lax`, un an, `Secure` en production. Aucune géolocalisation ni détection automatique par langue du navigateur.
- Navigation, footer, newsletter et pages d’accès privé en anglais ; contenus et photographies des écrans d’accès conservés.
- `/en/explorer` réellement rendu en anglais côté serveur, avec le **même template** que `/explorer` et un document de traduction persistant.
- Métadonnées, canonical, `hreflang` réciproques FR/EN/x-default et entrées de sitemap pour les pages anglaises complètes uniquement.
- Pour une page non encore migrée : URL anglaise conservée, message explicite de traduction en préparation, lien vers **la même page française**, `noindex`, absence du sitemap anglais et de `hreflang en`. Une URL inconnue renvoie 404. La recherche anglaise est indiquée comme non disponible, elle ne présente pas les résultats français comme traduits.

Le français reste complet et utilisable. Le site **ne peut pas encore être annoncé comme intégralement bilingue**.

## Traductions automatiques + corrections durables

`lib/i18n/translations.ts` définit un contrat indépendant d’un fournisseur :

1. Le français reste l’unique source (`lib/i18n/catalog.ts`, adaptateurs à liste de champs autorisés).
2. Chaque champ porte une empreinte SHA-256 de sa source. Une génération inchangée n’est pas redemandée.
3. Le résultat est conservé dans `data/translations/en/<id>.json`, hors de `public/` et inclus dans le bundle serveur Vercel.
4. Les résultats machine sont des brouillons (`approved: false`) ; ils ne deviennent pas automatiquement du contenu publié.
5. Une correction éditoriale est approuvée et verrouillée. Aucune future importation machine ne peut l’écraser.
6. Si la source française change, un champ corrigé reste conservé et passe à l’état `stale` dans le rapport. Il doit être revu éditorialement, jamais remplacé silencieusement. Les clés de paragraphes indexés devront notamment être revues en cas de réorganisation du texte.
7. Les identifiants, liens et données non linguistiques ne sont pas envoyés au traducteur. Les appellations connues présentes dans les textes doivent être conservées ; une importation qui les modifie est refusée. Ce garde-fou ne remplace pas une relecture humaine des noms non recensés.

Le dictionnaire d’interface `data/i18n/messages.ts` est indépendant des importations machine : ses corrections ne sont pas écrasées non plus.

### Commandes hors ligne

```sh
npm run translations:status
npm run translations:status -- --live
npm run translations:queue -- /private/tmp/dancelab-translation-queue.json --live
npm run translations:import -- /chemin/traduction-machine.json
npm run translations:edit -- /chemin/correction-editoriale.json
```

`--live` lit le flux d’épisodes **déjà utilisé par le site**, pas un service de traduction. `queue` exporte les seuls champs manquants/périmés non verrouillés. Ne pas mettre cette file dans un dossier public : elle peut contenir des fiches de rubriques privées. L’outil refuse le dossier `public/`.

Format d’un document importé (reprendre l’empreinte depuis la file, ne pas l’inventer) :

```json
{
  "sourceId": "page-explorer",
  "fields": {
    "leadTitle": { "text": "Your revised English text.", "sourceHash": "empreinte-issue-de-la-file" }
  }
}
```

`translations:edit` applique explicitement la correction et la verrouille. `translations:import` prépare un brouillon sans modifier les corrections verrouillées. Les modifications persistantes sont ensuite sauvegardées et déployées avec le projet habituel ; aucun fichier n’est écrit dans le système éphémère de Vercel lors d’une visite.

### Suite proposée, après accord

- Choisir le fournisseur de traduction ou un processus hors ligne, son budget et les données autorisées à lui être transmises. **Aucun service ni clé existante n’est utilisé automatiquement.**
- Brancher un worker de publication/CI sur `prepareAutomaticTranslation`, avec quotas, lots, reprise et journalisation sans secret. Le lancer à la publication/mise à jour et à la détection des nouveaux épisodes RSS ; ne jamais le déclencher depuis le rendu d’une page.
- Conserver les résultats dans ce dépôt via le workflow de publication existant, ou choisir un stockage éditorial persistant avant d’ajouter une correction depuis une interface admin Vercel.
- Migrer les templates restants, puis l’index de recherche et les filtres. Publier une page anglaise uniquement quand son template et les champs requis sont prêts ; élargir alors `publishedEnglishPaths`.

## Performance et vérification

La lecture de la langue dans le layout racine utilise les en-têtes serveur. **Cela rend dynamiques des pages françaises auparavant statiques** ; les caches des données RSS restent indépendants. C’est une limite connue de cette première migration conservatrice, qui évite de déplacer brutalement l’arborescence existante. Avant une ouverture bilingue complète, privilégier des layouts racine par langue / route groups si la conservation d’un HTML pré-généré pour les pages publiques est nécessaire.

Vérifications automatisées : URLs et fragments, cookie, erreurs d’origine/URL externe, noms préservés, invalidation du cache, verrouillage éditorial, absence de fournisseur implicite, HTML français/anglais, métadonnées et sitemap, inclusion des traductions dans le build, maintien des protections privées et fiches individuelles. Les tests DOM simulés et HTTP ne constituent pas une inspection visuelle dans un vrai navigateur. Prévoir cette dernière sur desktop et mobile avant déploiement.

## Références utilisées

- [Next.js — internationalisation](https://nextjs.org/docs/app/guides/internationalization)
- [Next.js — métadonnées](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
- [Google — versions localisées et hreflang](https://developers.google.com/search/docs/specialty/international/localized-versions)
- [Google — sites multilingues et URL explicites](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites)
