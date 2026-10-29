#!/usr/bin/env bash
# Vérifie une vidéo livrée : format, durée, pistes, loudness, et planche d'une image toutes les N secondes.
# Usage : verify.sh video.mp4 planche.jpg [pas=5]
set -euo pipefail
v="$1"; out="$2"; step="${3:-5}"
ffprobe -v error -show_entries format=duration:stream=codec_type,codec_name,width,height,r_frame_rate -of compact "$v"
if ffprobe -v error -select_streams a -show_entries stream=index -of csv=p=0 "$v" | grep -q .; then
  ffmpeg -hide_banner -i "$v" -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+(I|Peak):" | tail -2
else
  echo "Pas de piste audio"
fi
ffmpeg -v error -y -i "$v" -vf "fps=1/$step,scale=180:-1,tile=8x3" -frames:v 1 "$out"
echo "$out"
