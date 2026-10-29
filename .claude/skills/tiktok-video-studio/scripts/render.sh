#!/usr/bin/env bash
# Rendu complet d'une composition (à lancer en arrière-plan : quelques minutes par minute de vidéo).
# Usage (depuis le projet Remotion) : render.sh Composition out/video.mp4 [journal.log]
set -euo pipefail
comp="$1"; out="$2"; log="${3:-/dev/stdout}"
B="${REMOTION_BROWSER:-/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell}"
npx remotion render "$comp" "$out" --browser-executable="$B" --codec=h264 --crf=18 --audio-codec=aac > "$log" 2>&1
tr '\r' '\n' < "$log" | grep -E "Encoded|rror|MB" | tail -3
