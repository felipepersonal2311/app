#!/usr/bin/env python3
"""Transcreve a fala de um vídeo com tempo de cada palavra (faster-whisper, roda local).

Uso:
    python3 scripts/transcrever.py <video> <saida.json>

Requer: pip install faster-whisper. O modelo é baixado do huggingface.co na 1ª vez
(no ambiente de nuvem, rode com HF_HUB_DISABLE_XET=1).
Saída: lista de {"p": palavra, "i": inicio, "f": fim} em segundos.
"""
import json
import subprocess
import sys
import tempfile
import wave

import numpy as np
from faster_whisper import WhisperModel


def main() -> None:
    if len(sys.argv) != 3:
        print(__doc__)
        sys.exit(1)
    video, saida = sys.argv[1], sys.argv[2]
    with tempfile.NamedTemporaryFile(suffix=".wav") as tmp:
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", video, "-vn", "-ac", "1", "-ar", "16000", tmp.name], check=True)
        with wave.open(tmp.name) as w:
            audio = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
    modelo = WhisperModel("small", device="cpu", compute_type="int8")
    segs, _ = modelo.transcribe(audio, language="pt", word_timestamps=True, vad_filter=True)
    palavras = [{"p": w.word.strip(), "i": round(w.start, 2), "f": round(w.end, 2)} for s in segs for w in s.words]
    with open(saida, "w") as fh:
        json.dump(palavras, fh, ensure_ascii=False, indent=0)
    print(" ".join(w["p"] for w in palavras))


if __name__ == "__main__":
    main()
