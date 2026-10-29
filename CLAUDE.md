# Vidéos TikTok

- Les vidéos se fabriquent avec Remotion dans `tiktok-video/` (voir `tiktok-video/README.md`). Rendu dans le conteneur : `--browser-executable=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell`, WebGL en `swangle`.
- Avant une nouvelle vidéo, lire `tiktok-video/SKILLS.md` : catalogue des skills de motion design installés dans `.claude/skills/`, quand utiliser chacun, et les règles communes (zones sûres 9:16, courbes, sous-titres, son à −14 LUFS).
- Pour reproduire une vidéo de référence : planches d'images à intervalles réguliers, transcription mot par mot avec `tiktok-video/tools/transcribe.py`, puis comparaison côte à côte avec l'original aux mêmes instants.
- Vérifier des images fixes avant chaque rendu complet ; mettre les fichiers temporaires dans le dossier scratchpad, les vidéos finales dans `tiktok-video/out/`.
