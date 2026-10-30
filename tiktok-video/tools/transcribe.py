"""Transcrit la voix d'une vidéo de référence, avec le minutage de chaque mot.

Usage :
    ffmpeg -i reference.mp4 -ac 1 -ar 16000 audio.wav
    python3 tools/transcribe.py audio.wav small transcript.json

Nécessite : pip install faster-whisper (le modèle est téléchargé au premier lancement).
"""
import json
import sys
import wave

import numpy as np
from faster_whisper import WhisperModel

audio_path, model_name, out_path = sys.argv[1:4]
model = WhisperModel(model_name, device="cpu", compute_type="int8")

# On passe les échantillons décodés : évite une incompatibilité entre faster-whisper et PyAV.
with wave.open(audio_path) as w:
    samples = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768

segments, _ = model.transcribe(samples, language="fr", word_timestamps=True, beam_size=5)
out = []
for s in segments:
    print(f"[{s.start:6.2f}-{s.end:6.2f}] {s.text}", flush=True)
    out.append({"start": s.start, "end": s.end, "text": s.text, "words": [{"w": w.word, "s": w.start, "e": w.end} for w in s.words]})

with open(out_path, "w") as f:
    json.dump(out, f, ensure_ascii=False, indent=1)
