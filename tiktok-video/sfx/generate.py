"""Synthétise les effets sonores de la vidéo dans public/sfx/ (libres de droits, 100 % générés)."""
import wave
from pathlib import Path

import numpy as np

SR = 44100
OUT = Path(__file__).resolve().parent.parent / "public" / "sfx"
rng = np.random.default_rng(7)


def t(dur):
    return np.arange(int(SR * dur)) / SR


def env(dur, attack, decay):
    x = t(dur)
    return np.minimum(x / attack, 1.0) * np.exp(-x / decay)


def lowpass(x, cutoff):
    """Filtre passe-bas à un pôle ; cutoff peut varier dans le temps (tableau)."""
    cutoff = np.broadcast_to(cutoff, x.shape)
    a = 1 - np.exp(-2 * np.pi * cutoff / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i in range(len(x)):
        acc += a[i] * (x[i] - acc)
        y[i] = acc
    return y


def bell(freq, dur, decay):
    x = t(dur)
    partials = [(1, 1.0), (2.76, 0.35), (5.4, 0.15), (8.9, 0.06)]
    s = sum(a * np.sin(2 * np.pi * freq * r * x) * np.exp(-x * r / decay) for r, a in partials)
    return s * np.minimum(x / 0.003, 1)


def place(dur, *parts):
    """Mixe des (décalage_s, signal) dans un buffer de durée dur."""
    out = np.zeros(int(SR * dur))
    for offset, sig in parts:
        i = int(offset * SR)
        n = min(len(sig), len(out) - i)
        out[i : i + n] += sig[:n]
    return out


def save(name, sig, peak_db=-3.0):
    sig = sig / (np.max(np.abs(sig)) + 1e-9) * 10 ** (peak_db / 20)
    fade = min(len(sig), int(0.005 * SR))
    sig[-fade:] *= np.linspace(1, 0, fade)
    OUT.mkdir(parents=True, exist_ok=True)
    with wave.open(str(OUT / f"{name}.wav"), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((sig * 32767).astype("<i2").tobytes())


def whoosh():
    dur = 0.5
    x = t(dur)
    shape = np.sin(np.pi * np.clip(x / dur, 0, 1)) ** 2
    noise = rng.standard_normal(len(x))
    swept = lowpass(noise, 300 + 4500 * shape)
    return (swept - lowpass(swept, 150)) * shape


def swipe():
    dur = 0.22
    x = t(dur)
    noise = rng.standard_normal(len(x))
    sig = lowpass(noise, np.linspace(1500, 9000, len(x)))
    return (sig - lowpass(sig, 1200)) * env(dur, 0.02, 0.07)


def pop():
    dur = 0.12
    x = t(dur)
    freq = 320 + 700 * np.exp(-x / 0.018)
    return np.sin(2 * np.pi * np.cumsum(freq) / SR) * env(dur, 0.002, 0.03)


def tick(freq):
    dur = 0.09
    x = t(dur)
    tone = np.sin(2 * np.pi * freq * x) + 0.3 * np.sin(2 * np.pi * freq * 2 * x)
    click = rng.standard_normal(len(x)) * np.exp(-x / 0.002) * 0.4
    return tone * env(dur, 0.001, 0.022) + click


def click():
    dur = 0.1
    x = t(dur)
    snap = rng.standard_normal(len(x)) * np.exp(-x / 0.0025)
    thump = np.sin(2 * np.pi * 140 * x) * np.exp(-x / 0.02)
    return snap * 0.7 + thump


def notif():
    return place(0.9, (0, bell(1318.5, 0.9, 0.25)), (0.12, bell(1760, 0.78, 0.3)))


def kaching():
    chk = click() * 0.6
    return place(1.1, (0, chk), (0.06, bell(1975.5, 1.0, 0.35)), (0.13, bell(2637, 0.95, 0.4)))


def impact():
    dur = 1.4
    x = t(dur)
    boom = np.sin(2 * np.pi * (45 + 60 * np.exp(-x / 0.06)) * x) * np.exp(-x / 0.35)
    hit = lowpass(rng.standard_normal(len(x)), 2500) * np.exp(-x / 0.05) * 0.8
    shimmer = place(dur, (0.02, bell(1046.5, 1.3, 0.5) * 0.25), (0.02, bell(1568, 1.3, 0.5) * 0.2))
    return boom + hit + shimmer


def riser():
    dur = 1.7
    x = t(dur)
    freq = 220 * 2 ** (1.6 * x / dur)
    tone = np.sin(2 * np.pi * np.cumsum(freq) / SR)
    noise = lowpass(rng.standard_normal(len(x)), 800 + 3000 * x / dur) * 0.5
    vol = (x / dur) ** 2 * np.minimum((dur - x) / 0.05, 1)
    return (tone * 0.5 + noise) * vol


if __name__ == "__main__":
    save("whoosh", whoosh(), -6)
    save("swipe", swipe(), -6)
    save("pop", pop(), -4)
    save("click", click(), -4)
    save("notif", notif(), -5)
    save("kaching", kaching(), -4)
    save("impact", impact(), -2)
    save("riser", riser(), -9)
    # Gamme pentatonique montante pour les compteurs et les mois qui s'allument.
    scale = [523.25, 587.33, 659.25, 783.99, 880.0]
    for i in range(12):
        save(f"tick{i}", tick(scale[i % 5] * 2 ** (i // 5)), -10)
    print("Effets générés dans", OUT)
