"""Supprime le halo semi-transparent autour d'un PNG détouré (fréquent avec les images IA « fond transparent »).

Usage : python3 clean_alpha.py image.png [seuil_bas=0.55] [largeur=0.35]
Les pixels dont l'opacité est sous le seuil deviennent transparents ; la transition reste douce sur « largeur ».
"""
import sys

import numpy as np
from PIL import Image

path = sys.argv[1]
lo = float(sys.argv[2]) if len(sys.argv) > 2 else 0.55
width = float(sys.argv[3]) if len(sys.argv) > 3 else 0.35
a = np.array(Image.open(path).convert("RGBA")).astype(np.float32)
alpha = a[..., 3] / 255
before = int(((alpha > 0.02) & (alpha < 0.9)).sum())
a[..., 3] = np.clip((alpha - lo) / width, 0, 1) * 255
Image.fromarray(a.astype(np.uint8)).save(path)
after = int(((a[..., 3] > 5) & (a[..., 3] < 230)).sum())
print(f"{path} : pixels semi-transparents {before} -> {after}")
