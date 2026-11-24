#!/usr/bin/env python3
"""Converte as palavras transcritas em legendas do molde (1 a 3 palavras por vez).

Uso:
    python3 scripts/legendas.py <palavras.json> <projetos/nome.json> [correcoes.json]

correcoes.json (opcional) corrige erros da transcrição: {"desponto": "desconto", ...}.
Uma chave pode ter várias palavras ("historiante anterior": "story anterior").
"""
import json
import re
import sys

MAX_PALAVRAS = 3
PAUSA = 0.3


def main() -> None:
    if len(sys.argv) < 3:
        print(__doc__)
        sys.exit(1)
    palavras = json.load(open(sys.argv[1]))
    correcoes = json.load(open(sys.argv[3])) if len(sys.argv) > 3 else {}

    # junta pedaços tipo "quinta" + "-feira"
    unidas = []
    for w in palavras:
        if unidas and w["p"].startswith("-"):
            unidas[-1] = {**unidas[-1], "p": unidas[-1]["p"] + w["p"], "f": w["f"]}
        else:
            unidas.append(dict(w))

    # aplica correções (de várias palavras primeiro)
    for errado, certo in sorted(correcoes.items(), key=lambda kv: -len(kv[0].split())):
        n = len(errado.split())
        alvo = [re.sub(r"[^\wà-ú-]", "", x).lower() for x in errado.split()]
        i = 0
        while i + n <= len(unidas):
            janela = [re.sub(r"[^\wà-ú-]", "", u["p"]).lower() for u in unidas[i : i + n]]
            if janela == alvo:
                pont = re.sub(r"[\wà-ú-]", "", unidas[i + n - 1]["p"])
                ws = certo.split()
                a, b = unidas[i]["i"], unidas[i + n - 1]["f"]
                passo = (b - a) / len(ws)
                novos = [{"p": x, "i": round(a + k * passo, 2), "f": round(a + (k + 1) * passo, 2)} for k, x in enumerate(ws)]
                novos[-1]["p"] += pont
                unidas[i : i + n] = novos
            i += 1

    legendas, atual = [], []
    for w in unidas:
        quebra = atual and (
            len(atual) >= MAX_PALAVRAS or w["i"] - atual[-1]["f"] > PAUSA or re.search(r"[,.?!]$", atual[-1]["p"])
        )
        if quebra:
            legendas.append(atual)
            atual = []
        atual.append(w)
    if atual:
        legendas.append(atual)

    saida = []
    for k, g in enumerate(legendas):
        fim = legendas[k + 1][0]["i"] if k + 1 < len(legendas) else g[-1]["f"] + 0.3
        texto = " ".join(re.sub(r"[,.]$", "", w["p"]) for w in g)
        saida.append({"texto": texto, "inicio": round(g[0]["i"], 2), "fim": round(min(fim, g[-1]["f"] + 0.5), 2)})

    proj = json.load(open(sys.argv[2]))
    proj["legendas"] = saida
    json.dump(proj, open(sys.argv[2], "w"), ensure_ascii=False, indent=2)
    print(f"ok: {len(saida)} legendas")
    print(" | ".join(l["texto"] for l in saida))


if __name__ == "__main__":
    main()
