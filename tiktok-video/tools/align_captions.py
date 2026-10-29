"""Aligne un texte corrigé sur une transcription minutée, et produit les blocs de sous-titres.

Usage :
    python3 tools/align_captions.py transcript.json texte.txt sortie.json [debut_s] [fin_s]

- transcript.json : sortie de tools/transcribe.py (mots minutés par Whisper).
- texte.txt : le texte exact à afficher. « | » sépare les blocs de sous-titres,
  *mot* met un mot en couleur d'accent.
- debut_s / fin_s : ne garder que les mots de la transcription dans cet intervalle.

Les mots corrigés sont appariés aux mots de Whisper par alignement de séquence
(difflib) ; un mot sans correspondance prend un temps interpolé entre ses voisins.
"""
import difflib
import json
import re
import sys
import unicodedata

transcript_path, text_path, out_path = sys.argv[1:4]
t0 = float(sys.argv[4]) if len(sys.argv) > 4 else 0.0
t1 = float(sys.argv[5]) if len(sys.argv) > 5 else 1e9


def norm(w):
    w = unicodedata.normalize("NFD", w.lower())
    w = "".join(c for c in w if unicodedata.category(c) != "Mn")
    return re.sub(r"[^a-z0-9]", "", w)


# Mots Whisper, en recollant les élisions (« d » + « 'eau » -> « d'eau »).
heard = []
for seg in json.load(open(transcript_path)):
    for w in seg["words"]:
        txt = w["w"].strip()
        if not (t0 - 0.05 <= w["s"] <= t1):
            continue
        if heard and (txt.startswith("'") or txt.startswith("-")):
            heard[-1]["w"] += txt
            heard[-1]["e"] = w["e"]
        else:
            heard.append({"w": txt, "s": w["s"], "e": w["e"]})

# Texte corrigé : blocs, mots, accents.
blocks = [b.strip() for b in open(text_path).read().replace("\n", " ").split("|") if b.strip()]
words = []
for bi, block in enumerate(blocks):
    raw = block.split()
    toks = []
    for tok in raw:
        # Ponctuation isolée (« : », « ? », « » ») collée au mot précédent ; « « » au suivant.
        if toks and tok in (":", "?", "!", ";", "»"):
            toks[-1] += " " + tok
        elif toks and toks[-1] == "«":
            toks[-1] += " " + tok
        else:
            toks.append(tok)
    for tok in toks:
        accent = tok.startswith("*") or tok.endswith("*") or "*" in tok
        words.append({"w": tok.replace("*", ""), "block": bi, "accent": accent})

a = [norm(w["w"]) for w in words]
b = [norm(w["w"]) for w in heard]
times = [None] * len(words)
for tag, i1, i2, j1, j2 in difflib.SequenceMatcher(None, a, b, autojunk=False).get_opcodes():
    if tag == "equal":
        for k in range(i2 - i1):
            times[i1 + k] = (heard[j1 + k]["s"], heard[j1 + k]["e"])
    elif tag == "replace":
        # Répartit le segment entendu sur les mots écrits.
        s, e = heard[j1]["s"], heard[j2 - 1]["e"]
        n = i2 - i1
        for k in range(n):
            times[i1 + k] = (s + (e - s) * k / n, s + (e - s) * (k + 1) / n)

# Interpolation des mots restés sans temps.
known = [i for i, tm in enumerate(times) if tm]
for i, tm in enumerate(times):
    if tm:
        continue
    prev = max((k for k in known if k < i), default=None)
    nxt = min((k for k in known if k > i), default=None)
    s = times[prev][1] if prev is not None else (times[nxt][0] if nxt is not None else t0)
    e = times[nxt][0] if nxt is not None else s + 0.3
    times[i] = (s, max(s + 0.05, e))

out = [[] for _ in blocks]
for w, (s, e) in zip(words, times):
    out[w["block"]].append({"w": w["w"], "s": round(s, 2), "e": round(e, 2), "gold": w["accent"]})

json.dump(out, open(out_path, "w"), ensure_ascii=False, indent=0)
missing = sum(1 for i, tm in enumerate(times) if i not in known)
print(f"{len(out)} blocs, {len(words)} mots, {missing} mots interpolés")
for blk in out:
    print(f"{blk[0]['s']:6.2f}  " + " ".join(("*" if w["gold"] else "") + w["w"] for w in blk))
