import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";

// Acabamento leve por cima de tudo: correção quente sutil, granulação e vinheta.
// Bem mais discreto que o padrão da skill, para não "sujar" o vídeo do aluno/academia.
export const Acabamento: React.FC = () => {
  const frame = useCurrentFrame();
  const seed = frame % 8;
  const ruido = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' seed='${seed}'/%3E%3C/filter%3E%3Crect width='220' height='220' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill
        style={{ background: "rgba(255, 170, 110, 0.05)", mixBlendMode: "soft-light" }}
      />
      <AbsoluteFill style={{ backgroundImage: ruido, opacity: 0.06, mixBlendMode: "overlay" }} />
      <AbsoluteFill
        style={{
          background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.38) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};
