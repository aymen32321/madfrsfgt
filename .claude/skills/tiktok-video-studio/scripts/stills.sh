#!/usr/bin/env bash
# Rend des images fixes d'une composition Remotion aux instants donnés (en secondes), en un seul bundle.
# Usage (depuis le projet Remotion) : stills.sh Composition dossier_sortie fps t1 t2 ...
# Variable SCALE (défaut 0.5) : taille des images ; 0.5 = 540×960, assez pour lire les textes.
set -euo pipefail
comp="$1"; dir="$2"; fps="$3"; shift 3
B="${REMOTION_BROWSER:-/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell}"
scale="${SCALE:-0.5}"
mkdir -p "$dir"
if ! npx remotion bundle --out-dir="$dir/bundle" > "$dir/bundle.log" 2>&1; then
  echo "Échec du bundle :"; tail -30 "$dir/bundle.log"; exit 1
fi
i=0
for t in "$@"; do
  i=$((i+1)); f=$(python3 -c "print(round($t*$fps))")
  npx remotion still "$dir/bundle" "$comp" "$dir/s$(printf %02d $i).png" --frame="$f" --scale="$scale" --browser-executable="$B" 2>&1 | grep -iE "error" | head -3 || true
done
cols=$(( i < 6 ? i : 6 ))
ffmpeg -v error -y -i "$dir/s%02d.png" -vf "tile=${cols}x$(( (i + cols - 1) / cols ))" -frames:v 1 "$dir/stills.png"
echo "$dir/stills.png ($i images ; les fichiers s01.png… restent disponibles un par un)"
