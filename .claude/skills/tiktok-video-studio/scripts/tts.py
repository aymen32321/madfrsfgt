"""Voix off française gratuite (voix neuronales Microsoft Edge via edge-tts), avec le minutage de chaque mot.

Usage :
    pip install edge-tts
    python3 tts.py texte.txt voix.mp3 transcript.json [voix] [vitesse]

- texte.txt : le texte à dire (les marqueurs « | » et « * » de narration.txt sont ignorés).
- voix : fr-FR-HenriNeural (défaut, homme), fr-FR-DeniseNeural (femme), fr-FR-RemyMultilingualNeural, fr-FR-VivienneMultilingualNeural.
- vitesse : par exemple "+8%" pour un rythme TikTok plus vif (défaut "+0%").

transcript.json a le même format que transcribe.py, donc align_captions.py peut s'en servir directement.
"""
import asyncio
import json
import sys

import certifi

# Derrière un proxy qui intercepte le TLS, edge-tts (aiohttp + certifi) doit utiliser le bon certificat.
for bundle in ("/root/.ccr/ca-bundle.crt",):
    try:
        open(bundle).close()
        certifi.where = lambda b=bundle: b
    except OSError:
        pass

import edge_tts  # noqa: E402

text_path, mp3_path, json_path = sys.argv[1:4]
voice = sys.argv[4] if len(sys.argv) > 4 else "fr-FR-HenriNeural"
rate = sys.argv[5] if len(sys.argv) > 5 else "+0%"
text = open(text_path).read().replace("|", " ").replace("*", "")
text = " ".join(text.split())


async def main():
    words = []
    com = edge_tts.Communicate(text, voice, rate=rate, boundary="WordBoundary")
    with open(mp3_path, "wb") as f:
        async for chunk in com.stream():
            if chunk["type"] == "audio":
                f.write(chunk["data"])
            elif chunk["type"] == "WordBoundary":
                s = chunk["offset"] / 1e7
                words.append({"w": chunk["text"], "s": round(s, 3), "e": round(s + chunk["duration"] / 1e7, 3)})
    seg = {"start": words[0]["s"] if words else 0, "end": words[-1]["e"] if words else 0, "text": text, "words": words}
    json.dump([seg], open(json_path, "w"), ensure_ascii=False, indent=1)
    print(f"{len(words)} mots, durée ≈ {seg['end']:.1f} s -> {mp3_path}")


asyncio.run(main())
