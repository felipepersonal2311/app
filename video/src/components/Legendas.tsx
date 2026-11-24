import React from "react";
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { clamp, theme } from "../theme";
import type { Legenda } from "../tipos";

const normalizar = (p: string) =>
  p
    .toUpperCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Z0-9]/g, "");

// Uma legenda (1 a 3 palavras). Palavras de destaque: maiores, vermelhas, contorno branco.
const Bloco: React.FC<{ texto: string; destaques: Set<string>; duracao: number }> = ({
  texto,
  destaques,
  duracao,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const saidaInicio = Math.max(duracao - 4, 1);
  const s = interpolate(frame, [saidaInicio, duracao], [0, 1], { easing: theme.ease.in, ...clamp });
  const palavras = texto.split(/\s+/).filter(Boolean);
  const temDestaque = palavras.some((p) => destaques.has(normalizar(p)));

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "baseline",
        columnGap: 18,
        maxWidth: 860,
        opacity: 1 - s,
      }}
    >
      {palavras.map((palavra, i) => {
        const destaque = destaques.has(normalizar(palavra));
        const p = spring({ frame: frame - i * 3, fps, config: theme.spring.snappy });
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              fontFamily: theme.fonts.display,
              fontSize: destaque ? 132 : temDestaque ? 92 : 108,
              lineHeight: destaque ? 1 : 1.02,
              color: theme.colors.branco,
              // Destaque: palavra branca numa faixa vermelha inclinada (lê em qualquer fundo)
              background: destaque ? theme.colors.vermelho : undefined,
              padding: destaque ? "14px 26px 4px" : undefined,
              borderRadius: destaque ? 12 : undefined,
              boxShadow: destaque
                ? `0 0 50px ${theme.colors.brilho}, 0 10px 26px ${theme.colors.sombra}`
                : undefined,
              WebkitTextStroke: destaque ? undefined : `7px ${theme.colors.marinho}`,
              paintOrder: "stroke fill",
              textShadow: destaque ? undefined : `0 6px 18px ${theme.colors.sombra}`,
              marginTop: destaque && palavras.length > 1 ? 14 : 0,
              opacity: p,
              transform: `translateY(${interpolate(p, [0, 1], [26, 0])}px) scale(${interpolate(
                p,
                [0, 1],
                [0.82, 1],
              )})${destaque ? ` rotate(${theme.inclinacao}deg)` : ""}`,
              flexBasis: destaque && palavras.length > 1 ? "100%" : undefined,
              textAlign: "center",
            }}
          >
            {palavra.toUpperCase()}
          </span>
        );
      })}
    </div>
  );
};

// Legendas no centro da tela (um pouco abaixo do meio), como na referência.
export const Legendas: React.FC<{ legendas: Legenda[]; destaques: string[]; deslocamento?: number }> = ({
  legendas,
  destaques,
  deslocamento = 260,
}) => {
  const { fps } = useVideoConfig();
  const set = new Set(destaques.map(normalizar));
  return (
    <AbsoluteFill>
      {legendas.map((l, i) => {
        const de = Math.round(l.inicio * fps);
        const dur = Math.max(Math.round((l.fim - l.inicio) * fps), 4);
        return (
          <Sequence key={i} from={de} durationInFrames={dur} layout="none">
            <AbsoluteFill
              style={{ alignItems: "center", justifyContent: "center", paddingTop: deslocamento }}
            >
              <Bloco texto={l.texto} destaques={set} duracao={dur} />
            </AbsoluteFill>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
