# Skills de motion design : catalogue et mode d'emploi

Les 8 outils présentés dans la vidéo « 8 outils motion design » (compte TikTok saas_builders), téléchargés, analysés et installés dans `.claude/skills/` à la racine du dépôt. Tous sont sous licence MIT (Apache 2.0 pour HyperFrames). Ce sont des instructions pour Claude ; les scripts qu'ils contiennent n'ont pas été exécutés.

**Règle de base : les vidéos se fabriquent dans le projet Remotion `tiktok-video/`.** Les skills apportent la méthode (direction, rythme, son, sous-titres), pas un autre outil de rendu, sauf mention contraire.

## Le skill maison : `tiktok-video-studio`

À utiliser en premier pour toute vidéo. Il regroupe la méthode des 5 vidéos réalisées dans ce dépôt (styles, analyse d'une référence, sous-titres synchronisés, voix générée gratuite, sons, images IA cohérentes, vérifications) avec ses scripts et un modèle de composition. Les skills ci-dessous restent utiles pour approfondir un point.

## Les 8 outils

| # | Outil dans la vidéo | Source | Skills installés | Quand s'en servir |
|---|---|---|---|---|
| 1 | Product Launch Motion | AbubakrChan/product-launch-motion | `product-launch-motion` | Film de lancement produit, démo d'interface, logo animé : une forme qui se transforme sans coupe, curseur, ressorts, musique d'abord |
| 2 | Motion Graphics Skills | charlie947/motion-graphics-skills | `brand-intake`, `motion-brief-writer`, `motion-prompt-writer`, `reference-to-motion`, `launch-video`, `apple-launch-film`, `vox-explainer`, `animated-chart`, `milestone-reveal`, `motion-effects`, `title-sequence-3d`, `model-showdown`, `newsletter-promo`, `loop-cover`, `reel-export` | Formats précis : graphique animé, palier d'abonnés, explication façon Vox, comparaison d'IA, export en Reel, boucle GIF |
| 3 | Hyperframes | heygen-com/hyperframes | **non installé** (voir plus bas) | Ses règles de rythme et de sous-titres sont reprises dans les « Règles communes » |
| 4 | Motion Graphics | Barty-Bart/motion-graphics | `motion-broll`, `sound-effects`, `object-separation` | Plans d'illustration calés sur la voix d'une vidéo face caméra, habillage sonore d'une vidéo finie, détourage d'une personne |
| 5 | Animate | cth9191/animate | `animate` | Vidéo explicative dessinée dans 7 styles (papier découpé, hachures, riso, carnet de croquis, maths, pixel, isométrique), avec storyboard validé avant d'animer |
| 6 | Claude Motion | whaleyxbt/claude-motion | `sound-design` (+ moteur `engine/sfx`) | Sound design entièrement synthétisé : feuille de cues, niveaux, tonalité, mastering à −14 LUFS |
| 7 | Motion | motion.dev (paquet `motion-ai`) | `motion` | Animer un **site web** (boutons, cartes, transitions de page). Pas pour la vidéo |
| 8 | Motion Design Skills | iart-ai/motion-design-skills | `animation-principles`, `remotion-video`, `beat-sync-editing`, `shot-composition`, `motion-art-direction`, `color-motion`, `logo-animation`, `motion-background`, `after-effects` | Les 12 principes de Disney chiffrés, Remotion, montage sur le rythme, cadrage 9:16 |

Déjà présent avant : `motion-design` (LottieFiles), très proche de `animation-principles`. En cas de doute, `motion-design` pour les principes, `remotion-video` pour le code.

## Ce qui n'est pas installé, et pourquoi

- **HyperFrames** : ses skills poussent vers son propre outil (`npx hyperframes`) pour toute vidéo, envoient des statistiques d'usage à PostHog par défaut, demandent d'envoyer des retours automatiques à HeyGen et s'installent aussi dans les dossiers globaux. Le code est sain, mais il ferait concurrence à Remotion. Si besoin de son découpeur de silences (`media-use/scripts/transcript-cut.mjs`), le lancer à part avec `DO_NOT_TRACK=1`.
- **Barty-Bart `explainer-*`** (3 skills) : doublons de ce qui se fait déjà dans Remotion, avec leur propre moteur HTML.
- **whaleyxbt `motion-design`, `review-loop`, `web-sims`** : liés aux fichiers de leur projet d'origine ; le premier porterait le même nom que le skill LottieFiles.
- **Serveurs MCP de motion.dev** : non configurés (requêtes envoyées à motion.dev, fonctions payantes).

## Adaptations faites

Une note « Adaptation locale » a été ajoutée en tête de : `product-launch-motion` (pas de base de données, pas de tailnet), `sound-design` (chemin du moteur), `motion` (pas de MCP), `motion-broll` (Playwright 1.63 épinglé, aussi dans `scripts/setup.sh`), `object-separation` (CPU lent), `brand-intake` (demander avant de modifier `CLAUDE.md`), `apple-launch-film` (pas d'installation de skill tiers sans accord).

## Règles communes retenues (format TikTok 1080×1920)

**Cadre et lisibilité**
- Zone sûre : texte entre y = 170 et y = 1330 environ ; rien d'important dans les 120 px de droite (boutons TikTok) ni dans le bas de l'écran.
- L'image 0 sert de miniature et d'accroche : jamais noire, jamais un logo seul.
- Rien à lire sous 28 px ; sous-titres d'au moins 50 px ; 3 à 5 mots par groupe, un seul groupe à l'écran.
- Quelque chose de nouveau toutes les 2 à 4 secondes.

**Mouvement**
- Entrée : longue décélération (`cubic-bezier(0.16,1,0.3,1)` ou `(0.05,0.7,0.1,1)`), 300–500 ms. Sortie : accélération (`(0.7,0,0.84,0)`), 40–50 % plus courte que l'entrée.
- Décalage entre mots : 60–120 ms ; entre éléments d'une liste : 40–80 ms, 700 ms au total maximum.
- Un titre arrivé reste immobile ; durée de lecture : 0,5 s + 0,3 s par mot.
- À éviter : flottement ou pulsation permanente des titres, zoom lent qui rampe, rebond sur l'interface, tout entrer par un fondu montant.
- Changement de contenu sur une même scène : l'ancien sort vite en se floutant (≈ 0,12 s), le nouveau arrive flou puis net. Jamais de fondu enchaîné entre deux textes.
- Remotion : toujours limiter (`clamp`) les `interpolate`, hasard par graine (`random(seed)`), polices chargées avant le rendu, vérifier des images fixes avant le rendu complet.

**Son**
- Un son par événement ; le woosh commence 2 images avant, le pop ou le clic tombe sur l'image, une montée se termine sur l'impact, un seul gros impact par vidéo.
- Caler le **pic** du son sur le moment, pas son début.
- Hiérarchie : voix > effets > musique (musique ≈ −12 dB sous les effets, baissée de 8 à 12 dB sous la voix).
- Cible pour TikTok : **−14 LUFS intégrés, crête vraie ≤ −1 dBTP**, mesurés sur le fichier MP4 livré (`ffmpeg -i out.mp4 -af ebur128=peak=true -f null -`).
- Silence de 0,5 à 4 s avant le moment fort, puis le son le plus fort.

**Sous-titres et voix**
- Transcription : `tools/transcribe.py` (faster-whisper, modèle `small`, langue `fr`). Supprimer les mots inventés sur les silences. Les modèles `.en` traduisent en anglais.
- Avec une voix off, la voix donne le rythme : chaque nouveau plan démarre environ 0,3 s après la fin d'une phrase.

## Outils pratiques copiés dans `tools/`

- `transcribe.py` : transcription mot par mot d'une vidéo de référence.
- `probe-mp4.sh` : vérifie résolution, images par seconde et codec d'un MP4.
- `contact-sheet.sh` : planche d'images d'une vidéo pour la relire d'un coup d'œil.
