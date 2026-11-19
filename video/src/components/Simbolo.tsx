import React from "react";
import { Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp, theme } from "../theme";

// Símbolo do logo (círculo com o braço/check). Entra com "pop" e respira.
export const Simbolo: React.FC<{ tamanho: number; atraso: number; saida?: number }> = ({
  tamanho,
  atraso,
  saida,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - atraso, fps, config: theme.spring.bouncy });
  const s =
    saida === undefined
      ? 0
      : interpolate(frame, [saida, saida + Math.round(fps / 3)], [0, 1], {
          easing: theme.ease.in,
          ...clamp,
        });
  const respiro = 1 + Math.sin((frame / fps) * Math.PI) * 0.02;
  return (
    <Img
      src={staticFile("marca/simbolo.png")}
      style={{
        width: tamanho,
        height: tamanho,
        opacity: p * (1 - s),
        transform: `translateY(${interpolate(p, [0, 1], [-30, 0]) - s * 40}px) scale(${
          interpolate(p, [0, 1], [0.4, 1]) * respiro
        }) rotate(${interpolate(p, [0, 1], [-25, 0])}deg)`,
        filter: `drop-shadow(0 10px 24px ${theme.colors.sombra})`,
      }}
    />
  );
};
