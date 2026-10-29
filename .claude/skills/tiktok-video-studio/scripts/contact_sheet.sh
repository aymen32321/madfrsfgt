#!/usr/bin/env bash
# Planche d'images régulières d'une vidéo, pour la « lire » d'un coup d'œil.
# Usage : contact_sheet.sh video.mp4 sortie.jpg [nombre=24] [colonnes=8] [largeur=240]
set -euo pipefail
v="$1"; out="$2"; n="${3:-24}"; cols="${4:-8}"; w="${5:-240}"
d=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$v")
rows=$(( (n + cols - 1) / cols ))
ffmpeg -v error -y -i "$v" -vf "fps=$n/$d,scale=$w:-1,tile=${cols}x${rows}" -frames:v 1 "$out"
echo "$out ($n images sur ${d}s)"
