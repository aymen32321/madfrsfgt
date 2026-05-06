"""
TRIBE v2 – Interface Gradio
Prédit les réponses cérébrales (fMRI) à partir de vidéo, audio ou texte.
"""

import logging
import os
import tempfile
from pathlib import Path

import gradio as gr
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ── état global du modèle ────────────────────────────────────────────────────
_model = None
_cache_dir = Path("./cache")
_cache_dir.mkdir(exist_ok=True)


def load_model(hf_token: str | None = None) -> str:
    global _model
    if _model is not None:
        return "Modèle déjà chargé."
    try:
        if hf_token:
            import huggingface_hub
            huggingface_hub.login(token=hf_token, add_to_git_credential=False)

        from tribev2.demo_utils import TribeModel
        logger.info("Chargement du modèle depuis facebook/tribev2 …")
        _model = TribeModel.from_pretrained(
            "facebook/tribev2",
            cache_folder=str(_cache_dir),
        )
        return "Modèle chargé avec succès !"
    except Exception as e:
        logger.error(f"Erreur lors du chargement : {e}")
        return f"Erreur : {e}"


def predict(input_file, input_type: str) -> tuple:
    """Lance la prédiction et retourne une figure matplotlib + stats textuelles."""
    if _model is None:
        return None, "Le modèle n'est pas chargé. Cliquez sur 'Charger le modèle' d'abord."

    if input_file is None:
        return None, "Aucun fichier fourni."

    try:
        file_path = input_file if isinstance(input_file, str) else input_file.name

        if input_type == "Vidéo":
            events = _model.get_events_dataframe(video_path=file_path)
        elif input_type == "Audio":
            events = _model.get_events_dataframe(audio_path=file_path)
        else:
            events = _model.get_events_dataframe(text_path=file_path)

        preds, segments = _model.predict(events, verbose=False)

        fig = _make_figure(preds)
        stats = _format_stats(preds, segments)
        return fig, stats

    except Exception as e:
        logger.error(f"Erreur de prédiction : {e}", exc_info=True)
        return None, f"Erreur : {e}"


def _make_figure(preds: np.ndarray) -> plt.Figure:
    """Crée une figure avec la carte d'activité moyenne et la série temporelle."""
    mean_activity = preds.mean(axis=0)
    n_vertices = mean_activity.shape[0]
    half = n_vertices // 2

    fig, axes = plt.subplots(1, 3, figsize=(16, 4))
    fig.patch.set_facecolor("#1a1a2e")
    for ax in axes:
        ax.set_facecolor("#16213e")

    # Hémisphère gauche
    axes[0].plot(mean_activity[:half], color="#e94560", linewidth=0.5, alpha=0.8)
    axes[0].fill_between(range(half), mean_activity[:half], alpha=0.3, color="#e94560")
    axes[0].set_title("Hémisphère Gauche", color="white", fontsize=11)
    axes[0].set_xlabel("Vertex", color="#aaa")
    axes[0].set_ylabel("Activité", color="#aaa")
    axes[0].tick_params(colors="#aaa")
    for spine in axes[0].spines.values():
        spine.set_edgecolor("#444")

    # Hémisphère droit
    axes[1].plot(mean_activity[half:], color="#0f3460", linewidth=0.5, alpha=0.8)
    axes[1].fill_between(range(half), mean_activity[half:], alpha=0.3, color="#4a90e2")
    axes[1].set_title("Hémisphère Droit", color="white", fontsize=11)
    axes[1].set_xlabel("Vertex", color="#aaa")
    axes[1].tick_params(colors="#aaa")
    for spine in axes[1].spines.values():
        spine.set_edgecolor("#444")

    # Série temporelle (moyenne de tous les vertices)
    time_series = preds.mean(axis=1)
    axes[2].plot(time_series, color="#f5a623", linewidth=1.5)
    axes[2].fill_between(range(len(time_series)), time_series, alpha=0.3, color="#f5a623")
    axes[2].set_title("Activité Moyenne (Série Temporelle)", color="white", fontsize=11)
    axes[2].set_xlabel("TR (temps)", color="#aaa")
    axes[2].tick_params(colors="#aaa")
    for spine in axes[2].spines.values():
        spine.set_edgecolor("#444")

    fig.suptitle("TRIBE v2 – Prédictions d'Activité Cérébrale", color="white", fontsize=13, y=1.02)
    plt.tight_layout()
    return fig


def _format_stats(preds: np.ndarray, segments: list) -> str:
    mean_act = preds.mean(axis=0)
    return (
        f"**Résultats de la prédiction**\n\n"
        f"- Segments prédits : **{preds.shape[0]}**\n"
        f"- Vertices corticaux : **{preds.shape[1]:,}**\n"
        f"- Activité moyenne : **{mean_act.mean():.4f}**\n"
        f"- Activité max : **{mean_act.max():.4f}**\n"
        f"- Activité min : **{mean_act.min():.4f}**\n"
        f"- Écart-type : **{mean_act.std():.4f}**\n"
    )


# ── Construction de l'interface ───────────────────────────────────────────────
CSS = """
.gradio-container { background: #1a1a2e; color: #eee; }
.gr-button-primary { background: #e94560 !important; border: none !important; }
.gr-button { border-radius: 8px !important; }
h1, h2, h3 { color: #e94560; }
.gr-box { background: #16213e !important; border: 1px solid #0f3460 !important; }
footer { display: none !important; }
"""

with gr.Blocks(title="TRIBE v2 – Prédiction d'Activité Cérébrale") as demo:

    gr.Markdown(
        """
        # TRIBE v2 – Interface de Prédiction Cérébrale
        **Foundation model** pour la neuroscience *in silico* — prédit les réponses fMRI
        à des stimuli naturels (vidéo, audio, texte).

        > Modèle : [`facebook/tribev2`](https://huggingface.co/facebook/tribev2) · Licence : CC-BY-NC 4.0
        """
    )

    with gr.Row():
        with gr.Column(scale=1):
            gr.Markdown("### Configuration")

            hf_token = gr.Textbox(
                label="HuggingFace Token (requis pour LLaMA 3.2)",
                placeholder="hf_...",
                type="password",
                info="Obtenez votre token sur huggingface.co/settings/tokens",
            )
            load_btn = gr.Button("Charger le modèle", variant="primary")
            load_status = gr.Textbox(label="Statut", interactive=False, lines=2)

            gr.Markdown("---")
            gr.Markdown("### Entrée")

            input_type = gr.Radio(
                choices=["Vidéo", "Audio", "Texte"],
                value="Vidéo",
                label="Type d'entrée",
            )
            input_file = gr.File(
                label="Fichier (vidéo .mp4, audio .wav/.mp3, texte .txt)",
                file_types=[".mp4", ".avi", ".mkv", ".mov", ".webm",
                            ".wav", ".mp3", ".flac", ".ogg", ".txt"],
            )
            predict_btn = gr.Button("Prédire l'Activité Cérébrale", variant="primary")

        with gr.Column(scale=2):
            gr.Markdown("### Résultats")
            output_plot = gr.Plot(label="Carte d'activité cérébrale")
            output_stats = gr.Markdown(label="Statistiques")

    gr.Markdown(
        """
        ---
        ### Guide d'utilisation
        1. **Token HuggingFace** : nécessaire pour télécharger LLaMA 3.2-3B (modèle restreint).
           Demandez l'accès sur [meta-llama/Llama-3.2-3B](https://huggingface.co/meta-llama/Llama-3.2-3B).
        2. **Charger le modèle** : télécharge les poids depuis HuggingFace (~quelques Go, une seule fois).
        3. **Fournir un fichier** : vidéo, audio ou fichier texte.
        4. **Lancer la prédiction** : obtient les réponses fMRI sur ~20 000 vertices corticaux.

        ### Composants du modèle
        | Modalité | Extracteur |
        |----------|-----------|
        | Texte | LLaMA 3.2-3B |
        | Vidéo | V-JEPA2 |
        | Audio | Wav2Vec-BERT |
        """
    )

    # Liens
    load_btn.click(fn=load_model, inputs=[hf_token], outputs=[load_status])
    predict_btn.click(fn=predict, inputs=[input_file, input_type], outputs=[output_plot, output_stats])


if __name__ == "__main__":
    demo.launch(
        server_name="0.0.0.0",
        server_port=7860,
        share=False,
        show_error=True,
        css=CSS,
        theme=gr.themes.Base(primary_hue="red"),
    )
