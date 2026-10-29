# Son et voix

## Trois options de voix

1. **Voix d'origine** (refonte d'une vidéo existante) : `ffmpeg -i source.mp4 -t <fin> -vn -af "afade=t=out:st=<fin-0.6>:d=0.6" -c:a pcm_s16le -ar 48000 public/<projet>/audio.wav`, puis `<Html5Audio src={staticFile('<projet>/audio.wav')} />`. La garder à son niveau d'origine. Elle appartient à son auteur : prévenir l'utilisateur et ne pas la versionner.
2. **Voix générée gratuite** : `python3 scripts/tts.py narration.txt public/<projet>/voice.mp3 voice.json fr-FR-HenriNeural "+8%"` (edge-tts ; `pip install edge-tts`). Elle produit aussi le minutage de chaque mot, au format de `transcribe.py` : enchaîner directement avec `align_captions.py`. Voix : Henri (homme), Denise (femme), Remy et Vivienne (multilingues). `+5 %` à `+10 %` donne le rythme TikTok.
3. **Sans voix** : sous-titres minutés à la main (voir `captions.md`) et effets sonores un peu plus présents.

Une voix de meilleure qualité (ElevenLabs, voix Higgsfield) est possible si l'utilisateur a le service ; c'est payant : demander d'abord.

## Effets sonores

`python3 scripts/gen_sfx.py public/sfx` synthétise une banque libre de droits : `whoosh`, `swipe`, `pop`, `click`, `notif`, `kaching`, `impact`, `riser`, `tick0` à `tick11` (gamme montante).

Placement (liste `SOUNDS` dans la composition) :

| Événement à l'écran | Son | Volume avec voix | sans voix |
|---|---|---|---|
| Changement de scène | `whoosh` 2–3 images avant la coupe | 0,2 | 0,5 |
| Apparition d'un objet ou d'une carte | `pop` | 0,2 | 0,8 |
| Éléments qui s'allument ou tombent en série | `tick0`, `tick1`… (montent à chaque élément) | 0,3 | 0,6 |
| Interrupteur, bouton, validation | `click` | 0,3 | 0,9 |
| Frappe au clavier | `tick*` toutes les 0,15 s | 0,08 | 0,2 |
| Montée avant un chiffre | `riser` qui se termine sur le chiffre | 0,22 | 0,8 |
| Gain d'argent | `kaching` | 0,3 | 0,8 |
| Révélation finale, verdict | `impact` (un seul par vidéo) | 0,4 | 1 |
| Message, fin | `notif` | 0,3 | 0,8 |

Règles : un son par événement ; ce qui bouge en continu reste silencieux ; un silence de 0,5 à 1 s avant le moment fort le rend plus fort ; le pic du son tombe sur l'image de l'événement.

## Musique

Ne pas inclure de musique sous droits. Conseiller d'ajouter un son tendance directement dans TikTok à la publication (il se mixe avec la voix et les effets).

## Mastering et contrôle

Mesurer sur le MP4 livré : `ffmpeg -i out.mp4 -af ebur128=peak=true -f null -` (ou `scripts/verify.sh`). Cible −14 LUFS intégrés, crête ≤ −1 dBTP quand on maîtrise toute la bande son ; une voix d'origine se laisse telle quelle. Ne jamais affirmer qu'un son « sonne bien » sans l'avoir écouté : dire ce qui a été mesuré.
