import React, { useEffect, useState } from "react";
import {
  AbsoluteFill,
  continueRender,
  delayRender,
  Img,
  interpolate,
  OffthreadVideo,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { fontesProntas } from "../fontes";
import { theme } from "../theme";

// React em tela dividida: vídeo reagido em cima, sua foto embaixo, gancho na divisão.
// Foto sem tratamento de cor; só um zoom bem lento para não ficar parada.
export type ReactFotoProps = {
  fundo: string; // vídeo em public/brutos/ (1080x1920)
  foto: string; // foto em public/brutos/
  duracao: number;
  divisao: number; // y (px) onde termina o vídeo e começa a foto
  videoY: number; // quanto subir o vídeo (px) para centralizar a ação na metade de cima
  foto_: { largura: number; altura: number; y: number }; // tamanho da foto e linha (px da foto) que fica no topo da metade de baixo
  gancho: string; // *asteriscos* = amarelo
};

const AMARELO = "#FFD400";

export const ReactFoto: React.FC<ReactFotoProps> = (p) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const [handle] = useState(() => delayRender("carregando fontes"));
  useEffect(() => {
    fontesProntas.then(() => continueRender(handle));
  }, [handle]);

  const esc = 1080 / p.foto_.largura;
  const kb = interpolate(frame, [0, durationInFrames], [1, 1.04], { easing: theme.ease.inOut });
  const pg = spring({ frame: frame - 3, fps, config: theme.spring.smooth });

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {/* Metade de cima: vídeo */}
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: p.divisao, overflow: "hidden" }}>
        <OffthreadVideo
          src={staticFile(`brutos/${p.fundo}`)}
          style={{ position: "absolute", left: 0, top: -p.videoY, width: 1080, height: 1920 }}
        />
      </div>

      {/* Metade de baixo: foto */}
      <div style={{ position: "absolute", left: 0, top: p.divisao, width: 1080, height: 1920 - p.divisao, overflow: "hidden" }}>
        <Img
          src={staticFile(`brutos/${p.foto}`)}
          style={{
            position: "absolute",
            left: 0,
            top: -p.foto_.y * esc,
            width: 1080,
            height: p.foto_.altura * esc,
            transform: `scale(${kb})`,
            transformOrigin: "50% 15%",
          }}
        />
      </div>

      {/* Linha da divisão */}
      <div style={{ position: "absolute", left: 0, right: 0, top: p.divisao - 3, height: 6, background: AMARELO }} />

      {/* Gancho na divisão */}
      <div
        style={{
          position: "absolute",
          left: 70,
          right: 70,
          top: p.divisao,
          display: "flex",
          justifyContent: "center",
          transform: "translateY(-50%)",
        }}
      >
        <div
          style={{
            opacity: pg,
            transform: `scale(${interpolate(pg, [0, 1], [0.9, 1])})`,
            background: "rgba(0,0,0,0.88)",
            borderRadius: 24,
            border: `4px solid ${AMARELO}`,
            padding: "22px 32px",
            maxWidth: 940,
            textAlign: "center",
            fontFamily: theme.fonts.apoio,
            fontWeight: 800,
            fontSize: 54,
            lineHeight: 1.15,
            letterSpacing: "-0.01em",
            color: "#fff",
            textWrap: "balance",
          }}
        >
          {p.gancho.split("*").map((t, i) => (
            <span key={i} style={{ color: i % 2 ? AMARELO : "#fff" }}>
              {t}
            </span>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
