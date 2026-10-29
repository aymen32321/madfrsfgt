# TikTok Video Studio

Un skill pour Claude qui fabrique des vidéos TikTok, Reels et Shorts verticales (1080×1920), entièrement en code avec [Remotion](https://www.remotion.dev/), de l'idée au MP4 prêt à publier.

Il a été construit à partir de cinq vidéos réellement réalisées et validées, et testé par un agent indépendant qui a produit une vidéo complète en suivant seulement ses instructions.

## Ce qu'il sait faire

- **Créer** une vidéo à partir d'un sujet ou d'un texte : script, voix off, images, sous-titres, sons.
- **Reproduire** une vidéo TikTok que vous lui envoyez : il l'analyse image par image, transcrit la voix mot par mot, puis refait toute la mise en scène.
- **Remonter** une vidéo : garder le hook et/ou l'audio d'origine, et refaire tout le reste avec une direction artistique nouvelle.

### Les 5 styles

| Style | Pour quoi | Exemple réalisé |
|---|---|---|
| **A. Data nuit** | chiffres, coûts, astuces d'argent | « Ce que ça te coûte » : un abonnement à 9,99 € sur 10 ans |
| **B. Duel 3D** | comparaisons, face-à-face | « Le Duel » : Claude contre ChatGPT dans un jeu télévisé en 3D |
| **C. Récit nuit et or** | récits spirituels ou historiques, versets en arabe | « Rappel » : l'histoire d'Abû Hurayra et Âyat al-Kursî |
| **D. Objets dans un contenant** | listes, guides pratiques | « Kit d'urgence » : 16 objets qui tombent dans un sac |
| **E. Personnages 3D + cartes** | histoires, faits divers, astuces racontées | « Ticket McDo » : Thomas, son burger froid et sa réclamation |

## Comment l'utiliser

Une fois le skill installé, il suffit de parler normalement à Claude :

- « Fais-moi une vidéo TikTok de 20 secondes : combien coûte un café par jour sur un an ? »
- « Refais cette vidéo » (avec la vidéo en pièce jointe)
- « Garde le hook et l'audio de cette vidéo, et refais tout le reste, carte blanche »
- « Fais une vidéo style duel : iPhone contre Android, 3 manches »
- « Raconte cette histoire avec des personnages 3D : … »

Claude choisit le style, écrit le plan, fabrique la vidéo, vérifie des images avant le rendu, puis livre le MP4. Il signale à chaque fois les points à vérifier : droits d'auteur, coût, textes à relire.

## Installation

- **Dans Claude (profil)** : ouvrir le fichier `tiktok-video-studio.skill` et cliquer sur « Save skill ».
- **Dans Claude Code** : copier le dossier `tiktok-video-studio/` dans `.claude/skills/` de votre projet, ou dans `~/.claude/skills/` pour tous vos projets.

## Prérequis

L'environnement où Claude travaille doit avoir :

- **Node.js 20 ou plus**, pour Remotion. Le projet type s'installe avec `npm install`, en 35 secondes environ.
- **ffmpeg**, pour les analyses, le volume et les vérifications.
- **Python 3** avec `numpy` et `Pillow`.
- **Optionnel** : `faster-whisper` pour transcrire une vidéo de référence, `edge-tts` pour la voix off gratuite.
- **Optionnel** : un connecteur d'images IA (Higgsfield) pour les personnages 3D du style E.

Les environnements cloud de Claude Code ont déjà Chromium ; ailleurs, Remotion télécharge le sien.

## Ce que ça coûte

| Élément | Coût |
|---|---|
| Remotion, animations, cartes, pictos, 3D en code | gratuit (Remotion est gratuit pour un particulier ou une entreprise de 3 personnes maximum) |
| Voix off générée (edge-tts), effets sonores, transcription | gratuit |
| Images 3D générées par IA (style E seulement) | environ 1,6 crédit Higgsfield par image ; une histoire de 60 s demande 15 à 18 images, soit 25 à 30 crédits. Claude annonce le coût avant de générer |
| Votre utilisation de Claude | comprise dans votre abonnement |

## Contenu du dossier

```
tiktok-video-studio/
├── SKILL.md                 la marche à suivre que Claude applique
├── README.md                ce fichier
├── references/
│   ├── styles.md            les 5 styles en détail et les règles communes
│   ├── pipeline.md          les commandes de chaque étape
│   ├── captions.md          sous-titres synchronisés
│   ├── ai-assets.md         images IA cohérentes (même personnage dans toutes les scènes)
│   ├── sound-voice.md       voix off, effets sonores, volume
│   ├── arabic-rtl.md        arabe et textes religieux
│   └── pitfalls.md          erreurs déjà rencontrées et leurs solutions
├── scripts/
│   ├── transcribe.py        transcription mot par mot d'une vidéo
│   ├── align_captions.py    cale un texte corrigé sur la voix
│   ├── tts.py               voix off française gratuite, avec minutage des mots
│   ├── gen_sfx.py           20 effets sonores libres de droits
│   ├── master.sh            règle le volume pour TikTok (−14 LUFS)
│   ├── clean_alpha.py       nettoie le halo des images détourées
│   ├── contact_sheet.sh     planche d'images d'une vidéo
│   ├── frames_at.sh         images à des instants précis
│   ├── scene_cuts.sh        changements de plan et silences
│   ├── stills.sh            images de contrôle avant le rendu
│   ├── compare.sh           comparaison côte à côte avec une vidéo de référence
│   ├── render.sh            rendu complet
│   └── verify.sh            contrôle du MP4 final
└── assets/
    ├── templates/project/   projet Remotion prêt à installer, avec la composition type
    └── examples/            le code complet des 5 vidéos réalisées, une par style
```

## Bon à savoir avant de publier

- **Une voix, une musique ou un hook repris d'une vidéo tierce appartiennent à son auteur.** Les publier sans accord expose à un signalement. Le skill propose de les remplacer par une voix générée et une accroche animée.
- **Les textes sacrés et les citations doivent être relus par une personne qui les maîtrise.**
- **Aucun vrai logo de marque n'est dessiné.** Le nom apparaît en texte stylisé, et les décors et uniformes sont génériques.
- **Ajoutez la musique directement dans TikTok** au moment de publier. Le skill n'inclut pas de musique sous droits.
