# Cadrage des images d'épisodes

## Audit de Wilfried Bernard — épisode 128

Les fichiers ont été inspectés avant de modifier leur présentation. Les trois
PNG sont en RGB, sans rotation EXIF à appliquer. Leurs octets sont inchangés.

| Source existante | Dimensions / ratio | Composition et usage |
| --- | --- | --- |
| `/images/les-invites-header/128wilfriedbernard.png` | 1280 × 720, paysage 16:9 | Portrait décalé à droite, espace bleu-gris à gauche ; hero. |
| `/images/les-invites/128wilfriedbernard.png` | 1080 × 1080, carré | Portrait sans texte, tête légèrement à droite ; cartes. |
| `/episodes/128wilfriedbernard.png` | 1080 × 1080, carré | Logo en haut, nom en bas, cadre ; ne pas rogner le graphisme. |
| Miniature YouTube `GOx8Ku3kiGs/maxresdefault.jpg` | 1280 × 720, paysage 16:9 | Deux visages et titre ; conserver l'ensemble de la composition. |

Le header et les cartes de Wilfried chargeaient auparavant la couverture carrée
Ausha : la détection de fichiers attendait un numéro **en fin de nom** et ne
reconnaissait pas `128wilfriedbernard.png`. La couverture carrée était ensuite
forcée en plein écran avec le cadrage générique `right center` / `70% center`.

La détection reconnaît maintenant les deux conventions, avec un numéro exact
(pas de confusion entre 28 et 128). Aucun autre fichier du catalogue actuel n'a
changé d'affectation. Les sources de Wilfried sont également explicites dans ses
données : `headerImage` pour le paysage et `image` pour le portrait.

La couverture locale n'a pas été ajoutée artificiellement au corps de la page.
Son cadrage est prêt si cette source est utilisée. Les contenus internes des
lecteurs Spotify/Instagram restent contrôlés par ces services ; leur CSS n'est
pas modifié. L'image de partage distante reste inchangée.

## Données par image, pas par composant

Dans `data/episode-extras.ts`, une entrée d'épisode peut définir :

```ts
imagePresentations: {
  '/images/les-invites-header/mon-image.png': {
    width: 1280,
    height: 720,
    desktop: { objectPosition: '100% 35%', objectFit: 'cover' },
    tablet: { objectPosition: '100% 40%' },
    mobile: {
      objectPosition: '100% 20%',
      aspectRatio: '4 / 3',
      fadeBottom: true,
    },
  },
}
```

Cet exemple correspond au paysage de Wilfried, pas à un cadrage à recopier sur
tous les portraits. Les valeurs sont à choisir après examen de chaque fichier.

- Desktop : plus de 1060 px ; tablette : 621–1060 px ; mobile : jusqu'à 620 px.
- Chaque format hérite du précédent pour les propriétés non renseignées.
- Sans `aspectRatio`, le cadre existant de la page est conservé.
- Avec un ratio, la hauteur suit la largeur de l'image, sans étirement.
- `contain` conserve toute la composition, utile pour une couverture avec texte.
- `fadeBottom` est un masque CSS optionnel, jamais une retouche du fichier.
- La clé est l'URL exacte : une image de secours ne récupère pas par erreur le
  cadrage d'une autre photographie.

`EpisodeImage` rend toujours une simple balise `<img>`, avec les dimensions
intrinsèques et des variables CSS par format. Il remplace les balises des héros,
miniatures YouTube et recommandations des deux templates historiques/RSS.
Sans données de cadrage, les anciennes classes et règles restent inchangées.
Il n'y a aucune condition `number === 128` dans le composant ou le CSS.

## Réglages de Wilfried

Le paysage reste plein cadre sur desktop et tablette, ancré à droite pour
conserver la tête et le buste. Sur mobile, son cadre passe en 4:3 en haut du hero
avec une transition vers le fond sombre : la photo n'est plus agrandie à la
hauteur d'un écran vertical. La hauteur et le contenu du hero ne sont pas changés.
Le portrait garde son ratio carré ; couverture et miniature utilisent `contain`.

## Vérifications et limites

- Fichiers originaux examinés visuellement, dimensions et empreintes SHA-256 relevées.
- Miniature YouTube effectivement récupérée et inspectée : réponse HTTP 200, 1280 × 720.
- DOM HTML local : hero de 128 charge bien le paysage local et ses trois cadrages ;
  les cartes de 128 sur la page d'Ilies chargent le portrait carré et son propre cadrage.
- Feuille CSS locale chargée avec les deux media queries et les variables attendues.
- Contrôle de la boîte du visage sur 13 formats de 320 × 568 à 2560 × 1080,
  y compris l'agrandissement initial de l'animation et la zone de fondu mobile.
- Simulations visuelles séparées des cadres desktop, tablette et mobile inspectées.
- Pages d'Ilies et de WaaBee contrôlées : leurs images et cadrages restent inchangés.
- Tests de cadrage et de recommandations : 28 tests passants ; TypeScript passe.

Les simulations de cadrage ne sont **pas des captures du navigateur** et ne
valident pas à elles seules l'absence de chevauchement avec tous les textes et
contrôles. L'inspection automatisée du navigateur est indisponible dans cet
environnement. Une validation visuelle de la page entière reste à effectuer.

```sh
node --require ./tests/register.cjs --test tests/episode-images.test.ts tests/episode-recommendations.test.ts
node node_modules/typescript/bin/tsc --noEmit --incremental false
```
