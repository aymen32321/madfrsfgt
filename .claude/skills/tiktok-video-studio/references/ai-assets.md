# Images générées par IA (personnages et objets 3D)

À utiliser pour le style E, ou dès qu'un personnage expressif ou un objet réaliste est nécessaire. Tout le reste (cartes, textes, graphiques, pictos plats, 3D low-poly) se fait en code et ne coûte rien.

## Coût et accord

- Le connecteur Higgsfield consomme les **crédits payants** de l'utilisateur. Toujours faire un devis (`get_cost: true`) puis annoncer le total estimé avant de générer.
- Coût mesuré : environ **1,6 crédit par image** en `gpt_image_2_5`, qualité `medium`, fond transparent (17 images = 27,75 crédits). Les estimations `get_cost` sans fond transparent ont sous-évalué ce coût : compter 1,6.
- En dessous d'une trentaine de crédits pour une vidéo explicitement demandée, prévenir et continuer ; au-delà, ou si l'utilisateur n'a jamais validé de dépense, demander d'abord.
- Sans connecteur ou sans crédits, se rabattre sur le code : personnages en blocs Three.js (style B), pictos plats (style D), symboles (style C).

## Méthode qui donne des personnages cohérents

1. `get_preferences` (projet ou non), puis générer **le héros seul**, plein pied, pose neutre ou émotion de départ :
   - `model: gpt_image_2_5`, `quality: medium`, `background: transparent`, `aspect_ratio: 2:3`.
2. Regarder l'image. Si elle convient, s'en servir comme **référence** pour toutes ses autres poses : `medias: [{role: "image_references", value: <job_id du héros>}]`, et commencer le prompt par « Same character as the reference (same face, hair, clothes), same Pixar-style 3D render ».
3. Générer le reste en lots (`generate_image_batch`, 12 requêtes maximum par lot), puis `jobs_wait` par groupes de 12.
4. Télécharger chaque `result_url` avec `curl` dans `public/<projet>/<nom>.png` (noms courts et parlants : `thomas_desk`, `frozen_burger`).
5. Faire une planche de contrôle sur fond de la vidéo (PIL : composer chaque PNG sur la couleur de fond) et la regarder : visage identique, pas de texte parasite, pas de logo, détourage propre.
6. Halo semi-transparent autour de la silhouette (fréquent sur la première image) : `python3 scripts/clean_alpha.py image.png`.

## Modèle de prompt

```
Pixar-style 3D animated character render, full body, <cadrage>: <qui : âge, cheveux, vêtements précis>,
<pose et action>, <émotion>. Soft studio lighting. Isolated character on a fully transparent background,
clean cutout edges, no glow, no halo, no floor, no shadow, no text.
```

Objets : « Stylized glossy 3D render of <objet>, <détails>, soft studio light. Isolated on a fully transparent background, clean cutout edges, no shadow, no text. »

Toujours ajouter « no logos, no brand names » pour tout ce qui touche à une marque (restaurant, uniforme, emballage).

## Liste type pour une histoire de 60 s

Héros : 5 à 6 poses (émotion de départ, action clé, au bureau ou au téléphone, joie, conseil index levé). Personnages secondaires : 1 image chacun. Objets symboles : 4 à 8 (l'objet du problème, la récompense, le lieu). Environ 15 à 18 images, soit 25 à 30 crédits.

## Intégration

- `<Img src={staticFile('projet/nom.png')}>` dans un composant `Pic` avec ombre au sol (voir `Story.tsx`).
- Hauteur d'un personnage plein pied : 700–780 px ; pieds vers y 1250 ; objets 200–420 px.
- Animer avec `Enter` (glissé + flou) et un balancement très léger ; pour un saut, translater verticalement avec `|sin(t)|`.
- Les PNG générés appartiennent à l'utilisateur : les versionner avec le projet.
