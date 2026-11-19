import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { theme } from "../theme";
import { Faixa } from "./Faixa";
import { Simbolo } from "./Simbolo";

// Abertura: símbolo + 1 ou 2 faixas (azul-marinho e vermelha) no terço superior.
export const Gancho: React.FC<{ linhas: string[]; duracaoFrames: number }> = ({
  linhas,
  duracaoFrames,
}) => {
  const { fps } = useVideoConfig();
  const saida = duracaoFrames - Math.round(fps / 3);
  const cores = [theme.colors.marinho, theme.colors.vermelho];
  return (
    <AbsoluteFill
      style={{ alignItems: "center", justifyContent: "flex-start", paddingTop: 290, gap: 44 }}
    >
      <Simbolo tamanho={150} atraso={0} saida={saida} />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 22 }}>
        {linhas.slice(0, 2).map((linha, i) => (
          <Faixa
            key={i}
            texto={linha}
            cor={cores[i]}
            tamanho={150}
            atraso={3 + i * 5}
            saida={saida + i * 2}
            lado={i % 2 === 0 ? -1 : 1}
            brilho={i === 1}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};
