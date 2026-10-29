# Sous-titres

Les sous-titres portent la vidéo : beaucoup la regardent sans le son.

## Le fichier narration.txt

```
Thomas attend *30 *minutes | son menu au McDo. | Le couple arrivé après lui | est déjà en train | de manger.
```

- Le texte est **exactement** ce qui est dit, corrigé (orthographe, noms propres, accents, ponctuation française avec espaces insécables gérées par le script).
- `|` sépare deux blocs affichés l'un après l'autre. Couper sur les respirations et les groupes de sens, jamais entre un article et son nom (« la | fin »).
- `*mot*` ou `*mot` met le mot en couleur d'accent. 1 à 3 mots clés par phrase au maximum : un chiffre, le problème, la solution.
- Les guillemets « » et les deux-points sont collés automatiquement au mot voisin.

`align_captions.py` apparie ces mots à ceux de la transcription (difflib) : un mot réécrit (« déclé » → « de clés ») reçoit le temps du segment entendu, un mot ajouté est interpolé.

## Taille des blocs selon le style

| Style | Mots par bloc | Rendu |
|---|---|---|
| Histoire rythmée (E) | 2 à 4 | capitales, 58 px weight 900, mots clés rouges, sans ponctuation finale |
| Liste pratique (D) | 3 à 6 | casse normale, 58 px weight 800, encre sur fond clair, mots clés orange |
| Récit lent (C) | 3 à 6 | pastille sombre par mot soulignée d'indigo, 54–57 px |
| Data (A) | une phrase par scène | 50 px weight 500, mots qui montent un à un |

## Comportement

- Un seul bloc à l'écran. Il s'ouvre un peu avant son premier mot (`LEAD` 0,15–0,25 s : l'œil lit plus vite que l'oreille) et reste jusqu'au bloc suivant si l'écart est court (< 0,8 s), sinon il s'efface 0,6–0,9 s après le dernier mot.
- Chaque mot s'allume au moment où il est dit : flou 6 px → 0 et opacité en 0,13 s. Les mots à venir sont soit invisibles (style E), soit pâles et flous (styles C et D).
- Sortie du bloc : 0,12 s de flou + fondu.
- Position : `top` entre 950 et 1330 selon la scène ; jamais plus bas (boutons et légende TikTok). Largeur utile 940 px (padding 70).
- En capitales, retirer la ponctuation finale et les guillemets à l'affichage, **après** avoir normalisé les espaces insécables : `w.replace(/[«»]/g,'').replace(/\s+/g,' ').trim().replace(/[.,:;]+$/,'')`. Garder « ? » et « ! ».

## Pas de voix ?

Garder des sous-titres quand même : ils deviennent le texte de la vidéo. Minuter les blocs à la main sur un rythme de lecture : 0,5 s + 0,3 s par mot, au moins 1,25 s par bloc.
