#!/usr/bin/env bash
# Images d'une vidéo aux instants donnés, horodatées, assemblées par 6.
# Usage : frames_at.sh video.mp4 dossier_sortie t1 t2 t3 ...
set -euo pipefail
v="$1"; dir="$2"; shift 2
mkdir -p "$dir"; i=0
for t in "$@"; do
  i=$((i+1)); n=$(printf %02d $i)
  ffmpeg -v error -y -ss "$t" -i "$v" -frames:v 1 -vf "scale=360:-1,drawtext=text='$t':x=10:y=10:fontsize=24:fontcolor=red" "$dir/f$n.png"
done
ffmpeg -v error -y -i "$dir/f%02d.png" -vf "tile=6x$(( (i + 5) / 6 ))" -frames:v 1 "$dir/frames.jpg"
echo "$dir/frames.jpg"
