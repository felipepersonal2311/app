#!/usr/bin/env python3
"""Mede a duração de cada áudio em public/vozes/ e grava src/explicativo/vozes.json.

Rode depois de gerar ou trocar qualquer voz:
    python3 scripts/medir-vozes.py
"""
import json
import subprocess
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
pasta = RAIZ / "public" / "vozes"
duracoes = {}
for arq in sorted(pasta.glob("*.mp3")):
    saida = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(arq)],
        check=True, capture_output=True, text=True,
    ).stdout.strip()
    duracoes[arq.stem] = round(float(saida), 3)

destino = RAIZ / "src" / "explicativo" / "vozes.json"
destino.write_text(json.dumps(duracoes, indent=2) + "\n")
print(f"ok: {destino.relative_to(RAIZ)}")
for k, v in duracoes.items():
    print(f"  {k}: {v}s")
