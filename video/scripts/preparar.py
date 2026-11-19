#!/usr/bin/env python3
"""Prepara um vídeo bruto para o molde.

Uso:
    python3 scripts/preparar.py <caminho-do-video.mp4> <nome-do-projeto>

O que faz:
  1. Copia o vídeo para public/brutos/<nome>.mp4
  2. Lê duração e fps com ffprobe
  3. Cria projetos/<nome>.json a partir do modelo (ou só atualiza duração/fps se já existir)

Depois é só preencher gancho, legendas, destaques e CTA no JSON e renderizar:
    npx remotion render src/index.ts Reel out/<nome>.mp4 --props=projetos/<nome>.json
"""
import json
import shutil
import subprocess
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent


def sondar(video: Path) -> tuple[float, int]:
    saida = subprocess.run(
        [
            "ffprobe", "-v", "error", "-select_streams", "v:0",
            "-show_entries", "stream=r_frame_rate:format=duration",
            "-of", "json", str(video),
        ],
        check=True, capture_output=True, text=True,
    ).stdout
    info = json.loads(saida)
    duracao = float(info["format"]["duration"])
    num, den = info["streams"][0]["r_frame_rate"].split("/")
    fps = round(int(num) / int(den))
    return duracao, fps


def main() -> None:
    if len(sys.argv) != 3:
        print(__doc__)
        sys.exit(1)
    origem = Path(sys.argv[1]).expanduser().resolve()
    nome = sys.argv[2]
    destino = RAIZ / "public" / "brutos" / f"{nome}.mp4"
    destino.parent.mkdir(parents=True, exist_ok=True)
    if origem != destino:
        shutil.copyfile(origem, destino)

    duracao, fps = sondar(destino)
    projeto_path = RAIZ / "projetos" / f"{nome}.json"
    if projeto_path.exists():
        projeto = json.loads(projeto_path.read_text())
    else:
        projeto = json.loads((RAIZ / "projetos" / "modelo.json").read_text())
    projeto.update({"video": destino.name, "duracao": round(duracao, 3), "fps": fps})
    projeto_path.write_text(json.dumps(projeto, ensure_ascii=False, indent=2) + "\n")
    print(f"ok: {projeto_path.relative_to(RAIZ)}  ({duracao:.1f}s, {fps}fps)")


if __name__ == "__main__":
    main()
