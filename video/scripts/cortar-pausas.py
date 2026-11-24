#!/usr/bin/env python3
"""Remove as pausas da fala ("jump cuts") e alterna zoom entre os trechos para disfarçar os cortes.

Uso:
    python3 scripts/cortar-pausas.py <video> <palavras.json> <saida.mp4> [--pausa 0.35] [--sem-zoom]

- Detecta silêncios no áudio (ffmpeg silencedetect, tolerante a ruído de carro/rua)
  e corta pausas maiores que --pausa (segundos).
- Trechos alternam entre enquadramento normal e aproximado (zoom 1.15).
- Grava também <saida>.palavras.json com os tempos já ajustados ao vídeo cortado.
"""
import json
import re
import subprocess
import sys

FOLGA = 0.08  # respiro antes/depois de cada trecho
ZOOM = 1.15


def main() -> None:
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    if len(args) < 3:
        print(__doc__)
        sys.exit(1)
    video, pal_path, saida = args[0], args[1], args[2]
    pausa = float(sys.argv[sys.argv.index("--pausa") + 1]) if "--pausa" in sys.argv else 0.25
    limiar = sys.argv[sys.argv.index("--limiar") + 1] if "--limiar" in sys.argv else "-22"
    zoom = "--sem-zoom" not in sys.argv
    palavras = json.load(open(pal_path))

    # Silêncios do áudio -> trechos com fala
    log = subprocess.run(
        ["ffmpeg", "-hide_banner", "-i", video, "-vn", "-af", f"highpass=f=120,silencedetect=n={limiar}dB:d={pausa}",
         "-f", "null", "-"], capture_output=True, text=True,
    ).stderr
    ini = [float(x) for x in re.findall(r"silence_start: ([0-9.]+)", log)]
    fim = [float(x) for x in re.findall(r"silence_end: ([0-9.]+)", log)]
    duracao = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", video],
                                   capture_output=True, text=True).stdout)
    fala_ini = max(0.0, palavras[0]["i"] - FOLGA)
    fala_fim = min(duracao, palavras[-1]["f"] + 0.25)
    trechos, cursor_t = [], fala_ini
    for a, b in zip(ini, fim + [duracao] * (len(ini) - len(fim))):
        a2, b2 = a + FOLGA, b - FOLGA
        if a2 > cursor_t and b2 > a2 and a2 < fala_fim:
            trechos.append({"i": cursor_t, "f": min(a2, fala_fim)})
            cursor_t = b2
    if cursor_t < fala_fim:
        trechos.append({"i": cursor_t, "f": fala_fim})
    trechos = [t for t in trechos if t["f"] - t["i"] > 0.15]
    for t in trechos:
        t["palavras"] = []
    for w in palavras:  # cada palavra vai para o trecho que contém (ou está mais perto de) seu meio
        meio = (w["i"] + w["f"]) / 2
        dist = lambda t: 0 if t["i"] <= meio < t["f"] else min(abs(meio - t["i"]), abs(meio - t["f"]))
        min(trechos, key=dist)["palavras"].append(w)

    # Monta o filtro do ffmpeg (corta, aplica zoom alternado e concatena)
    partes, novas, cursor = [], [], 0.0
    for k, t in enumerate(trechos):
        v = f"[0:v]trim={t['i']}:{t['f']},setpts=PTS-STARTPTS"
        if zoom and k % 2 == 1:
            v += f",crop=iw/{ZOOM}:ih/{ZOOM}:(iw-iw/{ZOOM})/2:(ih-ih/{ZOOM})*0.35,scale=iw*{ZOOM}:ih*{ZOOM}"
        v += ",scale=720:1280,setsar=1"
        partes.append(f"{v}[v{k}];[0:a]atrim={t['i']}:{t['f']},asetpts=PTS-STARTPTS[a{k}]")
        for w in t["palavras"]:
            a = min(max(w["i"], t["i"]), t["f"] - 0.05)
            b = max(min(w["f"], t["f"]), a + 0.05)
            novas.append({"p": w["p"], "i": round(a - t["i"] + cursor, 2), "f": round(b - t["i"] + cursor, 2)})
        cursor += t["f"] - t["i"]
    junta = "".join(f"[v{k}][a{k}]" for k in range(len(trechos)))
    filtro = ";".join(partes) + f";{junta}concat=n={len(trechos)}:v=1:a=1[v][a]"
    subprocess.run(
        ["ffmpeg", "-v", "error", "-y", "-i", video, "-filter_complex", filtro, "-map", "[v]", "-map", "[a]",
         "-c:v", "libx264", "-crf", "16", "-preset", "medium", "-r", "30", "-c:a", "aac", "-b:a", "192k", saida],
        check=True,
    )
    json.dump(novas, open(saida.rsplit(".", 1)[0] + ".palavras.json", "w"), ensure_ascii=False, indent=0)
    print(f"ok: {len(trechos)} trechos, {cursor:.1f}s (original {duracao:.1f}s)")


if __name__ == "__main__":
    main()
