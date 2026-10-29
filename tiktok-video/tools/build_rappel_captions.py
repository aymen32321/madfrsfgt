"""Construit src/rappel/captions.json : texte corrigé de la narration, découpé en blocs (marqueurs |),
chaque mot minuté à partir de la transcription (tools/transcribe.py).

Usage : python3 tools/build_rappel_captions.py transcript.json src/rappel/captions.json
"""
import json, re, sys
tr = json.load(open(sys.argv[1]))
FIX = [
 (0.00, 2.10, "Trois nuits de suite, | quelqu'un vient voler."),
 (2.54, 6.52, "Et la troisième nuit… | il enseigne des paroles qui protègent | jusqu'au matin."),
 (7.14, 9.30, "Ces paroles… | tu peux les dire ce soir."),
 (10.00, 15.66, "Le Prophète, | que la paix et le salut soient sur lui, | confie à Abû Hurayra | la garde de l'aumône du Ramadan."),
 (16.28, 19.40, "La nuit, quelqu'un arrive | et prend la nourriture à pleines mains."),
 (19.90, 21.04, "Abû Hurayra l'attrape :"),
 (21.52, 25.72, "« Par Allah, | je t'emmène au Messager d'Allah, | que la paix et le salut soient sur lui ! »"),
 (26.30, 28.34, "« Je suis dans le besoin, | j'ai une famille… »"),
 (28.94, 31.40, "Abû Hurayra a pitié, | et le laisse partir."),
 (32.10, 38.28, "Le matin, | le Prophète, | que la paix et le salut soient sur lui, | lui dit : | « Il t'a menti. | Et il va revenir. »"),
 (38.90, 40.52, "Il revient. | Même histoire."),
 (41.14, 43.82, "La troisième nuit, | Abû Hurayra ne le lâche plus."),
 (44.42, 49.30, "Alors il dit : | « Laisse-moi, et je t'apprends des paroles | par lesquelles Allah te sera utile."),
 (49.80, 52.90, "Quand tu vas au lit, | récite le verset du Trône | jusqu'à la fin."),
 (52.90, 55.26, "Un gardien d'Allah restera sur toi…"),
 (55.56, 57.78, "et aucun diable ne t'approchera | jusqu'au matin. »"),
 (58.36, 63.00, "Le Prophète, | que la paix et le salut soient sur lui, | lui dit : | « Il t'a dit la vérité…"),
 (63.26, 64.78, "alors que c'est un grand menteur. »"),
 (65.26, 68.26, "Tu sais qui c'était | depuis trois nuits ? | « C'était un diable. »"),
 (68.90, 72.60, "Mais attends. | Écoute le début du verset du Trône, | et répète avec moi."),
 (92.98, 94.10, "« Allah ! »"),
 (94.10, 98.12, "Pas de divinité à part Lui, | le Vivant, | Celui qui fait tout tenir."),
 (98.60, 101.02, "Ni somnolence ni sommeil ne Le prennent."),
 (101.54, 102.68, "Toi, tu dors."),
 (103.18, 104.76, "Lui… ne dort jamais."),
 (105.32, 108.04, "Ce soir, dans ton lit, | récite-le en entier."),
 (108.50, 110.24, "Et envoie la vidéo | à quelqu'un que tu aimes…"),
 (110.74, 114.56, "Chaque personne qui le récitera | grâce à toi, | tu auras la même récompense,"),
 (114.68, 115.96, "sans que la sienne diminue."),
]
GOLD = {"Vivant,", "Lui…", "Allah !", "« Allah !"}

def tokens(text):
    raw = [t for t in text.split(" ")]
    out = []
    for t in raw:
        if t in ("»", ":", "?", "!", ";") and out:
            out[-1] += " " + t
        elif out and out[-1] == "«":
            out[-1] += " " + t
        else:
            out.append(t)
    return out

def whisper_words(s, e):
    return [w for seg in tr for w in seg["words"] if w["s"] >= s - 0.3 and w["e"] <= e + 0.3]

chunks = []
for s, e, text in FIX:
    parts = [tokens(p.strip()) for p in text.split("|")]
    toks = [t for p in parts for t in p]
    breaks = set()
    n = 0
    for p in parts[:-1]:
        n += len(p); breaks.add(n)
    ww = whisper_words(s, e)
    if len(ww) == len(toks):
        times = [(w["s"], w["e"]) for w in ww]
    else:
        # répartition proportionnelle à la longueur des mots
        lens = [len(t) + 2 for t in toks]
        tot = sum(lens); acc = 0; times = []
        for l in lens:
            a = s + (e - s) * acc / tot; acc += l
            times.append((a, s + (e - s) * acc / tot))
    # découpe en blocs : ponctuation forte/virgule, max 6 mots
    cur = []
    for k, (tok, (a, b)) in enumerate(zip(toks, times)):
        if k in breaks:
            chunks.append(cur); cur = []
        cur.append({"w": tok, "s": round(a, 2), "e": round(b, 2), "gold": tok in GOLD or tok.replace("\u00a0", " ") == "« Allah !"})
    if cur:
        chunks.append(cur)
# fusionne les blocs d'un seul mot court avec le suivant si collés
json.dump(chunks, open(sys.argv[2], "w"), ensure_ascii=False, indent=0)
print(len(chunks), "blocs")
for c in chunks: print(f"{c[0]['s']:6.2f}", " ".join(w["w"] for w in c))
