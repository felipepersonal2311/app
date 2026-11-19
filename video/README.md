# Molde de Reels — Felipe Oliveira Personal Trainer

Edição padronizada em [Remotion](https://remotion.dev): você grava, o molde aplica sempre o mesmo pacote.

- **Gancho** (primeiros segundos): símbolo do logo + duas faixas inclinadas (azul-marinho e vermelha).
- **Legendas** no centro da tela, 1 a 3 palavras por vez. Palavras de destaque entram numa faixa vermelha.
- **Trechos em P&B** para dar ênfase.
- **CTA final**: escurece o vídeo, símbolo, "COMENTE", palavra-chave na faixa vermelha e "PERSONAL TRAINER".
- Efeitos sonoros (whoosh/pop) e acabamento leve (vinheta e granulação sutis).

Saída: 1080×1920 (9:16), H.264.

## Como usar

```bash
cd video
npm install                       # só na primeira vez
node scripts/gerar-sfx.mjs        # só se public/sfx/ não existir

# 1. Prepara o vídeo bruto (copia para public/brutos/ e cria projetos/<nome>.json)
python3 scripts/preparar.py ~/caminho/video-bruto.mp4 dica-falha

# 2. Preenche projetos/dica-falha.json: gancho, legendas, destaques, P&B e CTA

# 3. Renderiza
npx remotion render src/index.ts Reel out/dica-falha.mp4 --props=projetos/dica-falha.json --codec h264 --crf 18
```

No ambiente de nuvem do Claude Code, adicione
`--browser-executable=$(ls -d /opt/pw-browsers/chromium_headless_shell-*/*/chrome-headless-shell | head -1)`.

Para ajustar visualmente: `npx remotion studio src/index.ts` (o projeto `exemplo` precisa de `public/brutos/exemplo.mp4`).

## O arquivo do projeto (`projetos/<nome>.json`)

| Campo | O que é |
|---|---|
| `gancho.linhas` | 1 ou 2 linhas. A 1ª vai na faixa azul, a 2ª na vermelha. |
| `gancho.duracao` | Segundos que o gancho fica na tela. |
| `legendas` | Lista de `{ "texto", "inicio", "fim" }` em segundos. 1 a 3 palavras cada. |
| `destaques` | Palavras que sempre aparecem na faixa vermelha (sem diferenciar acento/maiúscula). |
| `pretoEBranco` | Trechos `[inicio, fim]` em P&B. |
| `cta` | `chamada` (ex. COMENTE), `palavra` (ex. TREINO) e `duracao` (segundos finais). |
| `efeitosSonoros` | `true`/`false`. |

`duracao` e `fps` são preenchidos pelo `preparar.py`.

## Onde mexer no visual

Tudo está em `src/theme.ts`: cores, fontes, inclinação das faixas e animações.
Fontes (Bebas Neue e Montserrat, licença OFL) e logo ficam em `public/`, sem depender de internet.

Vídeos brutos (`public/brutos/`) e renderizados (`out/`) não vão para o git.
