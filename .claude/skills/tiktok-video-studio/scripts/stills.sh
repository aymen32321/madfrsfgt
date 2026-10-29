#!/usr/bin/env bash
# Rend des images fixes d'une composition Remotion aux instants donnés (en secondes), en un seul bundle.
# Usage (depuis le projet Remotion) : stills.sh Composition dossier_sortie fps t1 t2 ...
set -euo pipefail
comp="$1"; dir="$2"; fps="$3"; shift 3
B="${REMOTION_BROWSER:-/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell}"
mkdir -p "$dir"
npx remotion bundle --out-dir="$dir/bundle" >/dev/null 2>&1
i=0
for t in "$@"; do
  i=$((i+1)); f=$(python3 -c "print(round($t*$fps))")
  npx remotion still "$dir/bundle" "$comp" "$dir/s$(printf %02d $i).png" --frame="$f" --scale=0.3 --browser-executable="$B" 2>&1 | grep -iE "error" | head -3 || true
done
ffmpeg -v error -y -i "$dir/s%02d.png" -filter_complex "tile=$(( i < 10 ? i : 10 ))x$(( (i + 9) / 10 ))" -frames:v 1 "$dir/stills.png" 2>/dev/null || \
  ffmpeg -v error -y -i "$dir/s%02d.png" -vf "tile=$(( i < 10 ? i : 10 ))x$(( (i + 9) / 10 ))" -frames:v 1 "$dir/stills.png"
echo "$dir/stills.png"
