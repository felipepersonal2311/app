import React, { useEffect, useState } from "react";
import {
  AbsoluteFill,
  continueRender,
  delayRender,
  interpolate,
  OffthreadVideo,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { fontesProntas } from "../fontes";
import { clamp, theme } from "../theme";

// React: vídeo de outra pessoa em tela cheia + você numa janelinha reagindo.
// Sem tratamento de cor na sua imagem (fica como foi gravada).
export type ReactProps = {
  fundo: string; // vídeo reagido, em public/brutos/
  cam: string; // seu vídeo, em public/brutos/
  duracao: number;
  camVolume: number; // 0 = sem o áudio da sua câmera
  gancho: { texto: string; duracao: number; top: number }; // *asteriscos* = amarelo
  // janela da câmera (px na tela final)
  janela: { x: number; y: number; largura: number; altura: number };
  // recorte do seu vídeo (px no vídeo original da câmera) que aparece na janela
  recorte: { x: number; y: number; largura: number; camLargura: number; camAltura: number };
  // aproximação lenta no vídeo de fundo [inicio, fim] em segundos (momento-chave)
  zoomFundo?: [number, number];
};

const AMARELO = "#FFD400";

const Destacado: React.FC<{ texto: string }> = ({ texto }) => (
  <>
    {texto.split("*").map((t, i) => (
      <span key={i} style={{ color: i % 2 ? AMARELO : "#FFFFFF" }}>
        {t}
      </span>
    ))}
  </>
);

export const ReactVideo: React.FC<ReactProps> = (p) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const [handle] = useState(() => delayRender("carregando fontes"));
  useEffect(() => {
    fontesProntas.then(() => continueRender(handle));
  }, [handle]);

  // Janela entra com "pop" quando o gancho sai (abertura limpa, só com o gancho)
  const pj = spring({ frame: frame - Math.round(p.gancho.duracao * fps) + 6, fps, config: theme.spring.bouncy });
  // Zoom lento no fundo durante o momento-chave
  const z = p.zoomFundo
    ? interpolate(frame, [p.zoomFundo[0] * fps, p.zoomFundo[1] * fps], [1, 1.08], { easing: theme.ease.inOut, ...clamp })
    : 1;
  const ganchoF = Math.round(p.gancho.duracao * fps);
  const pg = spring({ frame, fps, config: theme.spring.smooth });
  const sg = interpolate(frame, [ganchoF - 8, ganchoF], [0, 1], { easing: theme.ease.in, ...clamp });

  const esc = p.janela.largura / p.recorte.largura;

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <AbsoluteFill style={{ transform: `scale(${z})`, transformOrigin: "50% 55%" }}>
        <OffthreadVideo src={staticFile(`brutos/${p.fundo}`)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>

      {/* Você reagindo */}
      <div
        style={{
          position: "absolute",
          left: p.janela.x,
          top: p.janela.y,
          width: p.janela.largura,
          height: p.janela.altura,
          borderRadius: 34,
          overflow: "hidden",
          border: "6px solid #fff",
          boxShadow: "0 18px 40px rgba(0,0,0,0.45)",
          opacity: pj,
          transform: `scale(${interpolate(pj, [0, 1], [0.6, 1])})`,
          transformOrigin: "50% 100%",
        }}
      >
        <OffthreadVideo
          src={staticFile(`brutos/${p.cam}`)}
          volume={p.camVolume}
          style={{
            position: "absolute",
            width: p.recorte.camLargura * esc,
            height: p.recorte.camAltura * esc,
            left: -p.recorte.x * esc,
            top: -p.recorte.y * esc,
            maxWidth: "none",
          }}
        />
      </div>

      {/* Gancho */}
      <Sequence durationInFrames={ganchoF} layout="none">
        <div style={{ position: "absolute", left: 90, right: 90, top: p.gancho.top, display: "flex", justifyContent: "center" }}>
          <div
            style={{
              opacity: pg * (1 - sg),
              transform: `translateY(${interpolate(pg, [0, 1], [24, 0]) - sg * 12}px)`,
              background: "rgba(0,0,0,0.7)",
              borderRadius: 24,
              padding: "24px 34px",
              maxWidth: 900,
              textAlign: "center",
              fontFamily: theme.fonts.apoio,
              fontWeight: 800,
              fontSize: 58,
              lineHeight: 1.15,
              letterSpacing: "-0.01em",
              textWrap: "balance",
            }}
          >
            <Destacado texto={p.gancho.texto} />
          </div>
        </div>
      </Sequence>
    </AbsoluteFill>
  );
};
