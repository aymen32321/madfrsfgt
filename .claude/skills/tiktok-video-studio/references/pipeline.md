# Chaîne de fabrication : commandes

`S` désigne le dossier `scripts/` de ce skill, `TMP` le dossier de travail temporaire (scratchpad), `P` le projet Remotion.

## 0. Projet Remotion

S'il n'existe pas encore :

```bash
cp -r <skill>/assets/templates/project/. P/        # package.json, tsconfig, remotion.config.ts, src/ (avec src/story/Story.tsx et un captions.json vide)
cd P && npm install --no-audit --no-fund          # ≈ 35 s
python3 S/gen_sfx.py P/public/sfx                     # banque de 20 sons libres de droits
```

Navigateur : dans un conteneur cloud, Chromium est déjà dans `/opt/pw-browsers` ; tous les scripts lisent `$REMOTION_BROWSER` sinon utilisent `/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell`. Sur une autre machine, laisser Remotion télécharger le sien (retirer `--browser-executable`).

Polices : Inter et Inter Display sont souvent installées sur le système (`fc-list | grep Inter`) ; sinon `@fontsource/inter`. Pour Poppins et Amiri : `@fontsource/poppins`, `@fontsource/amiri`, importés dans le fichier de la composition, et attendre leur chargement avec `delayRender` + `document.fonts.load` (voir `arabic-rtl.md`).

## 1. Analyser une vidéo de référence

```bash
bash S/contact_sheet.sh ref.mp4 TMP/sheet.jpg 32 8 200     # toute la vidéo en une image
bash S/scene_cuts.sh ref.mp4                                # coupes de plans + silences
bash S/frames_at.sh ref.mp4 TMP/hd 0.5 3.0 6.4 9.0 …        # gros plans horodatés (6 par planche)
ffmpeg -v error -y -i ref.mp4 -ac 1 -ar 16000 TMP/audio16.wav
python3 -I S/transcribe.py TMP/audio16.wav small TMP/transcript.json   # texte + minutage de chaque mot
```

Lire la planche, puis des gros plans toutes les 1 à 3 s sur chaque partie : relever palette, typo des sous-titres (taille, casse, couleur des mots clés, nombre de mots par groupe), position des éléments, entrées, transitions, cartes, symboles. Noter les instants clés en face de la transcription.

Transcription : `small` suffit en français ; corriger à la main les noms propres et les homophones. Supprimer les phrases inventées sur les silences de fin (« Sous-titres réalisés par… »). Ne jamais utiliser un modèle `.en` (il traduit en anglais).

## 2. Écrire la narration et les sous-titres

```bash
# narration.txt : texte exact, « | » entre les blocs, *mot* = mot clé coloré
python3 -I S/align_captions.py TMP/transcript.json P/src/story/narration.txt P/src/story/captions.json [début_s] [fin_s]
```

Le script affiche chaque bloc avec son instant de départ et le nombre de mots interpolés (0 à 2 = bon alignement ; plus = vérifier le texte). Format et choix du découpage : `captions.md`.

Sans voix d'origine : générer la voix d'abord (`sound-voice.md`), puis aligner sur `voice.json`.

## 3. Construire

1. Lister les scènes avec leurs instants (tirés du minutage des mots) : `[a, b]`, ce qui est montré, ce qui entre et quand.
2. Préparer les images : code (SVG, CSS, Three.js) ou IA (`ai-assets.md`).
3. Remplir la composition à partir de `Story.tsx` ; enregistrer la composition dans `src/Root.tsx`.
4. `npx tsc -p .` doit passer.

## 4. Vérifier avant le rendu complet

```bash
cd P && bash S/stills.sh Story TMP/st 30 1.0 3.5 6.2 9.8 …   # 10 à 20 instants : un par scène + transitions
```

Lire `stills.png` (et les `sNN.png` un par un pour les textes fins ; `SCALE=1` pour la pleine résolution) : mise en page, débordements, chevauchements avec les sous-titres, éléments coupés par le cadre, texte illisible. Avec une référence : rendre d'abord une version rapide (`--scale=0.5`) puis `bash S/compare.sh ref.mp4 preview.mp4 TMP/cmp t1 t2 …` et corriger les écarts.

## 5. Rendu complet (en arrière-plan)

```bash
cd P && bash S/render.sh Story out/video.mp4 TMP/render.log      # lancer en tâche de fond
```

Durées observées dans un conteneur à 4 cœurs : 2D simple ≈ 4 min par minute de vidéo ; 2D avec beaucoup de flou ≈ 8 min/min ; 3D WebGL logiciel ≈ 14 min/min. Attendre la fin (boucle `until grep -q "MB" log`), ne pas sonder en boucle courte.

## 6. Régler le volume (si on maîtrise toute la bande son)

Un rendu avec voix générée sort vers −21 LUFS, trop bas pour TikTok :

```bash
bash S/master.sh P/out/video.mp4 P/out/video-final.mp4      # −14 LUFS, crête −1 dBTP, vidéo copiée sans réencodage
```

Ne pas l'appliquer à une voix d'origine qu'on garde telle quelle.

## 7. Vérifier le fichier livré

```bash
bash S/verify.sh P/out/video-final.mp4 TMP/final.jpg      # pas automatique : ~16 images quelle que soit la durée
```

Contrôler : 1080×1920, durée attendue, piste audio présente si prévue, loudness (cible −14 LUFS intégrés, crête ≤ −1 dBTP pour une vidéo dont on maîtrise le son ; une voix d'origine se garde à son niveau), et la planche finale image par image.

## 8. Livrer

Envoyer le MP4 à l'utilisateur, dire en une phrase ce qui a été fait, signaler les points à vérifier (voir SKILL.md, « Livrer »). Versionner le code, les images générées et les sous-titres ; ne pas versionner les médias tiers (voix et hook d'origine) : les ignorer dans `.gitignore` et noter dans le README la commande ffmpeg qui les recrée.
