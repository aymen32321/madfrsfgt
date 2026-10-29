---
name: tiktok-video-studio
description: Fabrique des vidéos TikTok / Reels / Shorts verticales (1080×1920) entièrement en code avec Remotion, du script au MP4 livré, dans cinq styles éprouvés — data nuit (chiffres, compteurs), duel 3D low-poly (face-à-face façon jeu télé), récit nuit et or (récits spirituels, versets en arabe), objets qui remplissent un contenant (listes, guides pratiques), histoire avec personnages 3D générés par IA et cartes d'interface. Couvre l'analyse d'une vidéo de référence (planches d'images, transcription mot par mot), les sous-titres karaoké synchronisés, la voix off (originale, générée gratuitement ou aucune), les effets sonores, les images IA cohérentes et la vérification avant livraison. Utilise ce skill dès que l'utilisateur veut créer, refaire, reproduire, imiter ou remonter une vidéo TikTok, un Reel, un Short, une vidéo « faite avec Claude », une vidéo explicative animée, une histoire illustrée, un motion design vertical, ou envoie une vidéo en disant « fais pareil », « refais-la », « garde le hook », « même style », même sans prononcer le mot Remotion.
---

# TikTok Video Studio

Ce skill transforme une idée, un texte ou une vidéo de référence en vidéo verticale finie, rendue en MP4. Tout est du code : chaque image est une fonction du temps, donc la vidéo est reproductible, modifiable au mot près, et ne coûte rien à part d'éventuelles images IA.

Il a été construit à partir de cinq vidéos réellement livrées ; leurs recettes sont dans `references/styles.md`. Les règles de mouvement viennent des skills `motion-design`, `animation-principles`, `remotion-video` et `shot-composition` : s'ils sont installés, les consulter pour aller plus loin.

## 1. Comprendre la demande

Trois cas, à reconnaître tout de suite :

| Cas | Signal | Ce qu'on garde | Ce qu'on fabrique |
|---|---|---|---|
| **Reproduire** | « refais cette vidéo », « fais la même » + une vidéo | le script, le rythme, la mise en scène | toutes les images, les sous-titres, les sons |
| **Remonter** | « garde le hook / l'audio, refais le reste », « carte blanche » | les secondes et/ou l'audio demandés | tout le reste, avec une direction artistique propre |
| **Créer** | un sujet, un texte, une idée | rien | script, voix, images, sons |

Décider seul tout ce qui est créatif (style, couleurs, découpage, transitions) et le dire à la fin. Ne demander que ce qui ne peut pas se deviner : un sujet absent, une dépense importante (voir images IA), ou un choix de voix quand rien ne l'indique (par défaut : voix d'origine si on remonte ; sinon voix générée gratuite, ou pas de voix si l'utilisateur a demandé « sans audio »).

## 2. Analyser (si une vidéo est fournie)

Lire `references/pipeline.md` § 1. En bref :
1. Planche de toute la vidéo, coupes de plans, silences.
2. Transcription mot par mot (`scripts/transcribe.py`), relue et corrigée.
3. Gros plans horodatés toutes les 1 à 3 s : relever palette, typo et casse des sous-titres, nombre de mots par bloc, position des éléments, entrées, transitions, cartes et symboles, en face des mots prononcés.

Regarder les images plutôt que supposer : c'est ce qui rend la reproduction fidèle.

## 3. Choisir le style et écrire le plan

- Choisir le style dans `references/styles.md` (tableau « Choisir un style ») ; une référence impose le sien.
- Écrire la narration exacte dans `narration.txt` (format dans `references/captions.md`), puis l'aligner sur la voix avec `scripts/align_captions.py`.
- Découper en scènes à partir du minutage des mots : pour chaque scène, ses instants `[a, b]`, ce qui est montré, ce qui entre et quand (un événement visuel par idée prononcée, toutes les 2 à 4 s). Une scène commence là où commence la phrase qui l'introduit.

## 4. Préparer images, voix et sons

- **Images en code** (gratuit) : SVG, CSS, Three.js. Pictos plats à contour pour une liste, symboles pour un récit, blocs 3D pour un duel.
- **Images IA** (payant, style E) : lire `references/ai-assets.md`. Devis d'abord ; générer le héros seul, puis toutes ses poses avec son image comme référence pour garder le même visage.
- **Voix** : `references/sound-voice.md` — voix d'origine, voix générée gratuite (`scripts/tts.py`, minutage des mots inclus) ou aucune.
- **Effets sonores** : `scripts/gen_sfx.py public/sfx`, puis la liste `SOUNDS`.
- **Arabe** : `references/arabic-rtl.md`.

## 5. Construire la composition

Partir de `assets/templates/Story.tsx` (et de `assets/templates/project/` si le projet Remotion n'existe pas). Il contient les briques réutilisées par toutes les vidéos : `prog`, `win`, `settle`, `typed`, `rand`, `Enter` (entrée glissée et floutée, sortie plus courte), `Pic` (PNG détouré avec ombre), `Glass` et `Card`, trois styles de sous-titres (`caps`, `karaoke`, `pills`), l'audio et les sons.

Principes qui font la différence :
- **Continuité** : un personnage ou un objet qui reste d'une scène à l'autre ne doit pas ré-entrer ; une transition a une cause à l'écran (l'objet du hook qui s'ouvre en cercle, le sac qui se ferme et devient la jauge).
- **Hiérarchie** : un héros visuel par scène ; le héros à gauche, la preuve (carte, chiffre, objet) à droite ou en haut ; sous-titres en bas de la zone sûre.
- **Mouvement** : entrées 0,35–0,5 s en décélération avec flou, sorties plus courtes ; rien ne flotte en boucle ; un rebond léger seulement sur les objets.
- **Exactitude** : uniquement des chiffres vérifiables ou clairement fictifs ; aucune marque réelle dessinée (nom en texte stylisé, décor générique).

`npx tsc -p .` doit passer avant tout rendu.

## 6. Vérifier, rendre, vérifier encore

1. Images fixes à 10–20 instants (`scripts/stills.sh`) : les regarder vraiment (débordements, chevauchements avec les sous-titres, éléments coupés, texte trop petit) et corriger.
2. Avec une référence : aperçu rapide puis comparaison côte à côte aux mêmes instants (`scripts/compare.sh`), corriger les écarts (lunes trop petites, sous-titres en retard, etc.).
3. Rendu complet en arrière-plan (`scripts/render.sh`) ; attendre la fin sans sonder en boucle.
4. `scripts/verify.sh` : format, durée, audio, loudness, planche finale.

Les erreurs déjà rencontrées et leurs solutions sont dans `references/pitfalls.md` : le lire avant un premier rendu dans un nouvel environnement.

## 7. Livrer

- Envoyer le MP4, puis expliquer en quelques lignes ce qui a été fait (style, ce qui vient de l'original, ce qui est nouveau) et les choix pris seul.
- Toujours signaler quand c'est le cas :
  - **Droits** : voix, musique, hook ou personnes réelles d'une vidéo tierce → publier sans accord expose à un signalement ; proposer la voix générée et un hook animé.
  - **Coût** : crédits IA réellement dépensés (solde avant/après), le reste est gratuit (Remotion est gratuit pour un particulier ou une entreprise de 3 personnes maximum).
  - **Textes sacrés ou citations** : à faire relire avant publication.
  - **Ce qui n'a pas été vérifié** (par exemple le son, mesuré mais pas écouté).
- Versionner le code, les sous-titres et les images générées ; ignorer les médias tiers et noter dans le README comment les recréer.

## Fichiers du skill

| Fichier | Quand le lire |
|---|---|
| `references/styles.md` | toujours, pour choisir et appliquer un style |
| `references/pipeline.md` | commandes exactes de chaque étape |
| `references/captions.md` | écrire `narration.txt`, régler les sous-titres |
| `references/ai-assets.md` | avant toute image générée par IA |
| `references/sound-voice.md` | voix off, effets sonores, loudness |
| `references/arabic-rtl.md` | arabe, versets, textes religieux |
| `references/pitfalls.md` | avant le premier rendu, ou quand quelque chose casse |
| `scripts/` | `transcribe.py`, `align_captions.py`, `tts.py`, `gen_sfx.py`, `clean_alpha.py`, `contact_sheet.sh`, `frames_at.sh`, `scene_cuts.sh`, `stills.sh`, `compare.sh`, `render.sh`, `verify.sh` |
| `assets/templates/` | `Story.tsx` (composition type) et `project/` (projet Remotion prêt à installer) |
