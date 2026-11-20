#!/usr/bin/env python3
"""Gera várias versões do mesmo vídeo, cada uma com um gancho diferente, para testar.

Uso:
    python3 scripts/variacoes.py projetos/<base>.json variacoes/<arquivo>.json [--renderizar]

O arquivo de variações tem este formato (veja variacoes/exemplo.json):
    {
      "variacoes": [
        {"nome": "pergunta", "gancho": ["TREINA E NÃO VÊ", "RESULTADO?"]},
        {"nome": "teaser", "gancho": ["OLHA ESSA", "ÚLTIMA REP"], "teaser": [11.2, 13.4], "zoomGancho": true},
        {"nome": "direto", "gancho": ["PARE DE", "TREINAR ERRADO"], "cortarInicio": 1.5}
      ]
    }

Campos de cada variação (todos opcionais, exceto nome):
    gancho        1 ou 2 linhas das faixas do gancho
    ganchoDuracao segundos do gancho na tela
    teaser        [inicio, fim] de um trecho forte do vídeo mostrado ANTES do começo
    cortarInicio  pula os primeiros N segundos do bruto (começa mais "na ação")
    zoomGancho    true/false: aproximação lenta durante o gancho
    cta           {"chamada": "...", "palavra": "..."} para testar CTAs diferentes

Saída: projetos/<base>__<nome>.json  (e, com --renderizar, out/variacoes/<base>/<nome>.mp4)
"""
import glob
import json
import subprocess
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent


def navegador() -> list[str]:
    achados = glob.glob("/opt/pw-browsers/chromium_headless_shell-*/*/chrome-headless-shell")
    return [f"--browser-executable={achados[0]}"] if achados else []


def main() -> None:
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    renderizar = "--renderizar" in sys.argv
    if len(args) != 2:
        print(__doc__)
        sys.exit(1)
    base_path = (RAIZ / args[0]) if not Path(args[0]).is_absolute() else Path(args[0])
    base = json.loads(base_path.read_text())
    spec = json.loads(Path(args[1]).read_text())
    nome_base = base_path.stem

    gerados = []
    for v in spec["variacoes"]:
        proj = json.loads(json.dumps(base))
        if "gancho" in v:
            proj["gancho"]["linhas"] = v["gancho"]
        if "ganchoDuracao" in v:
            proj["gancho"]["duracao"] = v["ganchoDuracao"]
        for campo in ("teaser", "cortarInicio", "zoomGancho"):
            if campo in v:
                proj[campo] = v[campo]
        if "cta" in v:
            proj["cta"].update(v["cta"])
        destino = RAIZ / "projetos" / f"{nome_base}__{v['nome']}.json"
        destino.write_text(json.dumps(proj, ensure_ascii=False, indent=2) + "\n")
        gerados.append((v["nome"], destino))
        print(f"ok: {destino.relative_to(RAIZ)}")

    if renderizar:
        pasta = RAIZ / "out" / "variacoes" / nome_base
        pasta.mkdir(parents=True, exist_ok=True)
        for nome, proj in gerados:
            saida = pasta / f"{nome}.mp4"
            print(f"renderizando {saida.relative_to(RAIZ)} ...", flush=True)
            subprocess.run(
                ["npx", "remotion", "render", "src/index.ts", "Reel", str(saida),
                 f"--props={proj}", "--codec", "h264", "--crf", "18", "--log=error", *navegador()],
                cwd=RAIZ, check=True,
            )
        print(f"pronto: {len(gerados)} versões em {pasta.relative_to(RAIZ)}")


if __name__ == "__main__":
    main()
