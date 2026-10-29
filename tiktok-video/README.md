# Vidéos TikTok codées avec Remotion

Vidéos verticales (1080×1920, 30 i/s) entièrement codées avec [Remotion](https://www.remotion.dev/) (React).

| Composition | Style | Fichiers |
| --- | --- | --- |
| `CeQueCaTeCoute` | Motion design 2D « Ce que ça te coûte » | `src/CeQueCaTeCoute.tsx` |
| `LeDuel` | Jeu télévisé en 3D low-poly (Claude contre Chat) | `src/duel/` |

## « Ce que ça te coûte »

Les scènes, les textes et les durées sont dans le tableau `SCENES`, en bas du fichier. Le placement des sons est dans le tableau `SOUNDS`.

## « Le Duel » (3D)

- `src/duel/script.ts` : le scénario. Chaque beat définit le plan de caméra, qui parle, la réplique, la carte affichée, le score et les gestes.
- `src/duel/Stage3D.tsx` : le plateau et les personnages en 3D (Three.js). Les personnages sont faits de blocs ; leur bouche, leurs sauts et leurs gestes sont animés à chaque image.
- `src/duel/Overlay.tsx` : l'habillage par-dessus la 3D (tableau des scores, sous-titres, annonces « MANCHE », cartes, confettis).
- `src/duel/LeDuel.tsx` : les plans de caméra, l'assemblage et les effets sonores.

## Commandes

- Effets sonores : `python3 sfx/generate.py` les synthétise dans `public/sfx/`. Ils sont libres de droits.
- Aperçu en direct : `npm run studio`
- Rendu : `npx remotion render CeQueCaTeCoute out/video.mp4` ou `npx remotion render LeDuel out/le-duel.mp4`

Dans le conteneur cloud, ajoutez au rendu :
`--browser-executable=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell`

La 3D utilise le WebGL logiciel (`swangle`, réglé dans `remotion.config.ts`), car il n'y a pas de carte graphique dans le conteneur.
