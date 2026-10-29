# Vidéo TikTok « Ce que ça te coûte »

Vidéo verticale (1080×1920, 30 i/s) en motion design, entièrement codée avec [Remotion](https://www.remotion.dev/) (React).

- Les scènes, les textes et les durées sont dans `src/CeQueCaTeCoute.tsx` (tableau `SCENES` en bas du fichier).
- Aperçu en direct : `npm run studio`
- Rendu MP4 : `npm run render`, qui écrit `out/video.mp4`

Dans le conteneur cloud, ajoutez au rendu :
`--browser-executable=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell`
