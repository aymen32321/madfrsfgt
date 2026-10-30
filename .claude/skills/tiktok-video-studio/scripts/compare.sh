#!/usr/bin/env bash
# Comparaison côte à côte : vidéo de référence | rendu, aux mêmes instants.
# Usage : compare.sh reference.mp4 rendu.mp4 dossier_sortie t1 t2 ...   (rendu peut être une version basse résolution)
set -euo pipefail
ref="$1"; mine="$2"; dir="$3"; shift 3
mkdir -p "$dir"; i=0
for t in "$@"; do
  i=$((i+1)); n=$(printf %02d $i)
  ffmpeg -v error -y -ss "$t" -i "$ref" -frames:v 1 -vf "scale=270:480" "$dir/r.png"
  ffmpeg -v error -y -ss "$t" -i "$mine" -frames:v 1 -vf "scale=270:480" "$dir/m.png"
  ffmpeg -v error -y -i "$dir/r.png" -i "$dir/m.png" -filter_complex "hstack,drawtext=text='$t':x=8:y=8:fontsize=22:fontcolor=yellow" "$dir/c$n.png"
done
ffmpeg -v error -y -i "$dir/c%02d.png" -vf "tile=4x$(( (i + 3) / 4 ))" -frames:v 1 "$dir/compare.png"
echo "$dir/compare.png"
