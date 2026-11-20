import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { clamp, theme } from "../theme";
import { Faixa } from "./Faixa";
import { Simbolo } from "./Simbolo";

// Fechamento: escurece o vídeo, símbolo, "COMENTE", palavra-chave na faixa vermelha
// (único elemento com brilho) e a tag PERSONAL TRAINER.
export const CTA: React.FC<{ chamada: string; palavra: string }> = ({ chamada, palavra }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const escurecer = interpolate(frame, [0, Math.round(fps * 0.5)], [0, 0.55], {
    easing: theme.ease.out,
    ...clamp,
  });
  const pChamada = spring({ frame: frame - 6, fps, config: theme.spring.smooth });
  const pTag = spring({ frame: frame - 18, fps, config: theme.spring.smooth });

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: theme.colors.preto, opacity: escurecer }} />
      <AbsoluteFill
        style={{ alignItems: "center", justifyContent: "center", gap: 34, paddingBottom: 80 }}
      >
        <Simbolo tamanho={210} atraso={0} />
        <div
          style={{
            fontFamily: theme.fonts.display,
            fontSize: 120,
            lineHeight: 1,
            color: theme.colors.branco,
            textShadow: `0 6px 18px ${theme.colors.sombra}`,
            opacity: pChamada,
            transform: `translateY(${interpolate(pChamada, [0, 1], [40, 0])}px) scale(${interpolate(
              pChamada,
              [0, 1],
              [0.92, 1],
            )})`,
          }}
        >
          {chamada.toUpperCase()}
        </div>
        <Faixa
          texto={`"${palavra.toUpperCase()}"`}
          cor={theme.colors.vermelho}
          tamanho={Math.min(190, Math.floor(2100 / (palavra.length + 2)))}
          atraso={11}
          lado={1}
          brilho
          respirar
        />
        <div
          style={{
            marginTop: 10,
            fontFamily: theme.fonts.apoio,
            fontWeight: 800,
            fontSize: 34,
            letterSpacing: "0.22em",
            color: theme.colors.branco,
            background: theme.colors.marinho,
            padding: "12px 26px 12px 34px",
            borderRadius: 10,
            opacity: pTag,
            transform: `translateY(${interpolate(pTag, [0, 1], [24, 0])}px)`,
          }}
        >
          PERSONAL TRAINER
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
