import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp, theme } from "../theme";

// Balão de fala. Trechos entre *asteriscos* ficam em vermelho.
// A ponta aponta para baixo, na posição `ponta` (0 a 1 da largura).
export const Balao: React.FC<{
  texto: string;
  x: number;
  y: number;
  largura: number;
  ponta: number;
  de: number; // frame de entrada (relativo à Sequence)
  ate?: number; // frame de saída
  cor?: string; // cor da borda (identifica quem fala)
}> = ({ texto, x, y, largura, ponta, de, ate, cor = theme.colors.marinho }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - de, fps, config: theme.spring.snappy });
  const s =
    ate === undefined
      ? 0
      : interpolate(frame, [ate - 8, ate], [0, 1], { easing: theme.ease.in, ...clamp });
  if (frame < de) return null;
  const partes = texto.split("*");
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: largura,
        opacity: p * (1 - s),
        transform: `translateY(${interpolate(p, [0, 1], [30, 0]) + s * 10}px) scale(${
          interpolate(p, [0, 1], [0.7, 1]) * (1 - s * 0.1)
        })`,
        transformOrigin: `${ponta * 100}% 120%`,
      }}
    >
      <div
        style={{
          background: "#fff",
          border: `6px solid ${cor}`,
          borderRadius: 34,
          padding: "26px 32px",
          fontFamily: theme.fonts.apoio,
          fontWeight: 800,
          fontSize: 44,
          lineHeight: 1.18,
          color: theme.colors.marinho,
          textAlign: "center",
          boxShadow: "0 14px 30px rgba(36,48,94,0.18)",
        }}
      >
        {partes.map((t, i) => (
          <span key={i} style={{ color: i % 2 ? theme.colors.vermelho : undefined }}>
            {t}
          </span>
        ))}
      </div>
      <svg
        width={60}
        height={46}
        style={{ position: "absolute", left: `calc(${ponta * 100}% - 30px)`, top: "100%", marginTop: -6 }}
      >
        <path d="M 6 0 L 30 40 L 54 0" fill="#fff" stroke={cor} strokeWidth={6} strokeLinejoin="round" />
        <rect x={0} y={-6} width={60} height={6} fill="#fff" />
      </svg>
    </div>
  );
};
