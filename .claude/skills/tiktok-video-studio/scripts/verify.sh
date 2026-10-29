#!/usr/bin/env bash
# Vérifie une vidéo livrée : format, durée, pistes, loudness, et planche d'une image toutes les N secondes.
# Usage : verify.sh video.mp4 planche.jpg [pas_en_secondes=auto]
set -euo pipefail
v="$1"; out="$2"
d=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$v")
step="${3:-$(python3 -c "print(max(1, round($d / 16)))")}"
ffprobe -v error -show_entries format=duration:stream=codec_type,codec_name,width,height,r_frame_rate -of compact "$v"
if ffprobe -v error -select_streams a -show_entries stream=index -of csv=p=0 "$v" | grep -q .; then
  ffmpeg -hide_banner -i "$v" -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+(I|Peak):" | tail -2
else
  echo "Pas de piste audio"
fi
n=$(python3 -c "import math; print(max(1, math.ceil($d / $step)))")
cols=$(( n < 8 ? n : 8 )); rows=$(( (n + cols - 1) / cols ))
ffmpeg -v error -y -i "$v" -vf "fps=1/$step,scale=180:-1,tile=${cols}x${rows}" -frames:v 1 "$out"
echo "$out ($n images, une toutes les ${step} s)"
