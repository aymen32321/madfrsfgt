# Vidéos TikTok codées avec Remotion

Vidéos verticales (1080×1920, 30 i/s) entièrement codées avec [Remotion](https://www.remotion.dev/) (React).

| Composition | Style | Fichiers |
| --- | --- | --- |
| `CeQueCaTeCoute` | Motion design 2D « Ce que ça te coûte » | `src/CeQueCaTeCoute.tsx` |
| `LeDuel` | Jeu télévisé en 3D low-poly (Claude contre Chat) | `src/duel/` |
| `Rappel` | Récit illustré nuit et or (Âyat al-Kursî, al-Bukhârî 2311) | `src/rappel/` |

## « Rappel » (récit illustré)

- `src/rappel/captions.json` : sous-titres karaoké, minutés mot par mot. Générés par `tools/build_rappel_captions.py` à partir de la transcription de la vidéo de référence (`tools/transcribe.py`, faster-whisper), avec le texte corrigé à la main.
- `src/rappel/art.tsx` : les dessins SVG (lunes, tonneaux de dattes, fumée, lasso, dôme, lit, fenêtre, réseau).
- `src/rappel/Rappel.tsx` : la chronologie des scènes, les cartes et l'arabe (police Amiri, `dir="rtl"`, animé mot par mot).
## « Kit d'urgence » (hook + audio d'origine, reste refait)

Composition `KitUrgence` (`src/kit/`) : le hook de la vidéo d'origine (0 à 6,27 s) est gardé tel quel, l'audio (voix et musique) court sur toute la vidéo, et tout le reste est une animation originale (« le sac se remplit » : 16 objets qui tombent dans un sac, puis une scène par partie de la narration).

- `src/kit/narration.txt` : texte exact de la voix, découpé en blocs de sous-titres (`|`), mots en couleur entre `*`.
- `src/kit/captions.json` : généré par `python3 tools/align_captions.py transcript.json src/kit/narration.txt src/kit/captions.json 6.3 81`.
- `src/kit/icons.tsx` : les pictogrammes ; `src/kit/Kit.tsx` : les scènes, le minutage et les sons.
- Les médias d'origine ne sont pas versionnés (`public/kit/` est ignoré). Pour les recréer à partir de la vidéo source :

```bash
ffmpeg -i source.mp4 -t 6.28 -an -vf "scale=1080:1920:flags=lanczos,fps=30" -c:v libx264 -crf 16 -pix_fmt yuv420p public/kit/hook.mp4
ffmpeg -i source.mp4 -t 83.2 -vn -af "afade=t=out:st=82.6:d=0.6" -c:a pcm_s16le -ar 48000 public/kit/audio.wav
```

## « Ticket McDo » (personnages 3D générés)

Composition `TicketMcDo` (`src/ticket/`) : reproduction d'une histoire illustrée (Thomas, son burger froid et sa réclamation), calée sur la voix de la vidéo de référence.

- Personnages et objets : 17 images 3D façon Pixar sur fond transparent, générées avec Higgsfield (modèle GPT Image 2.5, qualité medium), dans `public/ticket/`. Thomas est généré une fois puis réutilisé comme image de référence pour toutes ses poses, ce qui garde le même visage d'une scène à l'autre.
- Les cartes (ticket de caisse, formulaire, notes, e-mail, partage), la balance, l'horloge et les sous-titres sont en code.
- `src/ticket/narration.txt` et `captions.json` : même méthode que « Kit d'urgence » (`tools/align_captions.py`).
- La voix d'origine n'est pas versionnée : `ffmpeg -i source.mp4 -t 61.8 -vn -af "afade=t=out:st=61.2:d=0.6" -c:a pcm_s16le -ar 48000 public/ticket/audio.wav`.

## Skills de motion design

Les 8 outils de la vidéo « 8 outils motion design » sont installés dans `.claude/skills/` à la racine du dépôt (32 skills). Le catalogue, les cas d'usage et les règles communes sont dans [`SKILLS.md`](SKILLS.md).

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
