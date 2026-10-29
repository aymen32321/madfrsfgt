#!/usr/bin/env bash
# Mastering du son d'une vidéo rendue : loudness -14 LUFS intégrés, crête vraie -1 dBTP (deux passes loudnorm).
# La vidéo est copiée telle quelle, seul l'audio est réencodé.
# Usage : master.sh entree.mp4 sortie.mp4 [cible_LUFS=-14] [crete_dBTP=-1]
# Ne pas l'utiliser sur une voix d'origine qu'on garde à son niveau (refonte d'une vidéo tierce).
set -euo pipefail
in="$1"; out="$2"; I="${3:--14}"; TP="${4:--1}"
stats=$(ffmpeg -hide_banner -i "$in" -af "loudnorm=I=$I:TP=$TP:LRA=11:print_format=json" -f null - 2>&1 | sed -n '/^{/,/^}/p')
get() { echo "$stats" | python3 -c "import json,sys; print(json.load(sys.stdin)['$1'])"; }
ffmpeg -v error -y -i "$in" -c:v copy -af "loudnorm=I=$I:TP=$TP:LRA=11:measured_I=$(get input_i):measured_TP=$(get input_tp):measured_LRA=$(get input_lra):measured_thresh=$(get input_thresh):offset=$(get target_offset):linear=true" -ar 48000 -c:a aac -b:a 192k -movflags +faststart "$out"
ffmpeg -hide_banner -i "$out" -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+(I|Peak):" | tail -2
