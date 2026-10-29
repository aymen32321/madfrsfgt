# Pièges déjà rencontrés (et leur solution)

## Rendu

- **WebGL « Error creating WebGL context »** : seul `swangle` fonctionne sans GPU (`Config.setChromiumOpenGlRenderer('swangle')` ou `--gl=swangle`) ; `angle`, `swiftshader` et `vulkan` échouent.
- **Rendus longs** : lancer en arrière-plan et attendre la fin avec une seule boucle `until` ; sur une chaîne `a && b && nohup c &`, le `&` met **toute** la chaîne en arrière-plan (les sorties de `a` et `b` sont perdues) : séparer les commandes.
- **Images fixes lentes** : `npx remotion still` refait un bundle à chaque appel ; faire `npx remotion bundle --out-dir=…` une fois puis passer ce dossier (c'est ce que fait `stills.sh`).
- **Polices absentes au rendu** : importer les CSS `@fontsource` et bloquer avec `delayRender` jusqu'à `document.fonts.load`.
- **Émojis** : la police d'émojis du conteneur peut manquer ; dessiner les pictos en SVG.
- **Transition en cercle (clip-path)** : le rayon doit couvrir les coins depuis le centre choisi (≥ 1650 px depuis le haut du cadre), sinon des coins sombres restent visibles ; retirer le `clip-path` une fois le cercle complet.
- **Composant `Audio`** : utiliser `Html5Audio` de `remotion` (version 4.0.5xx) ; chaque son dans un `<Sequence from=… layout="none">`.
- **TypeScript** : `const X: 'a' | 'b' = 'a'` est réduit à `'a'` et les comparaisons échouent ; écrire `const X = 'a' as 'a' | 'b'`. `findLastIndex` exige `target: ES2023`.

## Transcription et sous-titres

- Whisper invente une phrase sur le silence final (« Sous-titres réalisés par… ») : la supprimer.
- Whisper découpe les élisions (« d » + « 'eau ») : `align_captions.py` les recolle.
- Ponctuation suivie d'un guillemet avec espace insécable : normaliser les espaces avant de retirer la ponctuation.
- Les mots affichés un peu en avance (0,15–0,25 s) paraissent synchrones ; à l'heure exacte, ils paraissent en retard.

## Images IA

- La première image d'un personnage peut avoir un halo lumineux semi-transparent : `clean_alpha.py`.
- Plus de 12 requêtes dans un lot sont refusées : couper en lots de 12.
- Le devis sans fond transparent sous-estime le coût réel (≈ 1,6 crédit par image medium transparente).

## Environnement

- Pas de `rsync` : copier avec `cp -r src/. dst/`.
- `rm -f $VAR/*` est bloqué par la sécurité si la variable peut être vide : utiliser un chemin littéral, `"${VAR:?}"/*`, ou écrire dans un nouveau dossier.
- Exécuter du code tiers téléchargé peut être refusé par la sécurité : lire et analyser sans l'exécuter, ou demander.
- edge-tts derrière un proxy TLS : pointer `certifi.where` vers le bon certificat (fait dans `tts.py`).
- `faster-whisper` avec un fichier : erreur PyAV `metadata_errors` ; lui passer les échantillons décodés (fait dans `transcribe.py`).

## Mise en page

- Personnage et sous-titres : garder les pieds au-dessus de 1260 et les sous-titres à partir de 1290–1300 ; dans les scènes avec une carte en haut, placer le personnage plus bas plutôt que de laisser la carte toucher les sous-titres.
- Une pastille près des sous-titres doit rester au moins 30 px au-dessus.
- Un lasso ou une ellipse qui « tourne » doit garder son axe horizontal : faire tourner le pointillé (`strokeDashoffset`), pas l'ellipse.
