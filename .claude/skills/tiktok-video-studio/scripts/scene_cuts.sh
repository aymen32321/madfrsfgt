#!/usr/bin/env bash
# Instants des changements de plan (seuil 0.25 par défaut) et des silences de la bande son.
# Usage : scene_cuts.sh video.mp4 [seuil]
set -euo pipefail
v="$1"; th="${2:-0.25}"
echo "Coupes :"; ffmpeg -hide_banner -i "$v" -vf "select='gt(scene,$th)',showinfo" -an -f null - 2>&1 | grep -o "pts_time:[0-9.]*" | sed 's/pts_time://' | tr '\n' ' '; echo
echo "Silences (-40 dB, 0,4 s) :"; ffmpeg -hide_banner -i "$v" -af "silencedetect=noise=-40dB:d=0.4" -vn -f null - 2>&1 | grep -oE "silence_(start|end): [0-9.]+" | tr '\n' ' '; echo
