import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp, theme } from "../theme";

// Faixa colorida inclinada com texto branco (gancho e CTA).
// Entra deslizando + escala + opacidade; sai mais rápido do que entra.
export const Faixa: React.FC<{
  texto: string;
  cor: string;
  tamanho: number;
  atraso: number; // frames
  saida?: number; // frame em que começa a sair (relativo à Sequence)
  lado?: 1 | -1; // de onde entra: 1 = direita, -1 = esquerda
  brilho?: boolean;
  respirar?: boolean;
}> = ({ texto, cor, tamanho, atraso, saida, lado = -1, brilho, respirar }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - atraso, fps, config: theme.spring.snappy });
  const s =
    saida === undefined
      ? 0
      : interpolate(frame, [saida, saida + Math.round(fps / 3)], [0, 1], {
          easing: theme.ease.in,
          ...clamp,
        });
  const respiro = respirar ? 1 + Math.sin((frame / fps) * Math.PI * 1.2) * 0.015 : 1;
  const x = interpolate(p, [0, 1], [lado * 120, 0]) + s * -lado * 160;
  const escala = interpolate(p, [0, 1], [0.85, 1]) * respiro;

  return (
    <div
      style={{
        display: "inline-block",
        opacity: p * (1 - s),
        transform: `translateX(${x}px) rotate(${theme.inclinacao}deg) scale(${escala})`,
        background: cor,
        color: theme.colors.branco,
        fontFamily: theme.fonts.display,
        fontSize: tamanho,
        lineHeight: 1,
        padding: `${Math.round(tamanho * 0.12)}px ${Math.round(tamanho * 0.22)}px ${Math.round(
          tamanho * 0.05,
        )}px`,
        borderRadius: 14,
        letterSpacing: "0.01em",
        whiteSpace: "nowrap",
        boxShadow: brilho
          ? `0 0 60px ${theme.colors.brilho}, 0 12px 30px ${theme.colors.sombra}`
          : `0 12px 30px ${theme.colors.sombra}`,
      }}
    >
      {texto}
    </div>
  );
};
