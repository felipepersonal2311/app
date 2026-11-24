import React, { useEffect, useState } from "react";
import {
  AbsoluteFill,
  continueRender,
  delayRender,
  OffthreadVideo,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { fontesProntas } from "../fontes";
import { theme } from "../theme";

// Vídeo simples com texto fixo por cima + chamada "LEIA A LEGENDA" embaixo.
// Trechos entre *asteriscos* ficam em amarelo.
export type TextoSobreVideoProps = {
  video: string; // arquivo em public/brutos/
  duracao: number; // segundos do vídeo final
  velocidade: number; // 1 = normal, 0.4 = câmera lenta
  linhas: { texto: string; tamanho: number }[];
  rodape: string;
  topo?: number; // altura (px) onde começa a caixa de texto
  rodapeTopo?: number; // altura (px) da chamada "LEIA A LEGENDA"
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

const Seta: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const y = Math.abs(Math.sin((frame / fps) * Math.PI * 1.6)) * 10;
  return (
    <svg width={46} height={56} viewBox="0 0 46 56" style={{ transform: `translateY(${y}px)` }}>
      <path d="M23 4 V44 M6 30 L23 48 L40 30" fill="none" stroke={AMARELO} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export const TextoSobreVideo: React.FC<TextoSobreVideoProps> = ({
  video,
  velocidade,
  linhas,
  rodape,
  topo = 1010,
  rodapeTopo = 1535,
}) => {
  const [handle] = useState(() => delayRender("carregando fontes"));
  useEffect(() => {
    fontesProntas.then(() => continueRender(handle));
  }, [handle]);

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <OffthreadVideo
        src={staticFile(`brutos/${video}`)}
        playbackRate={velocidade}
        muted
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />

      {/* Texto principal: centralizado na horizontal, na altura do peito para não cobrir rosto/ação.
          Dentro da área segura do Reels (margens laterais de 90px, acima da interface inferior). */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start", padding: `${topo}px 90px 0` }}>
        <div
          style={{
            background: "rgba(0,0,0,0.62)",
            borderRadius: 26,
            padding: "40px 44px",
            maxWidth: 900,
            display: "flex",
            flexDirection: "column",
            gap: 22,
            textAlign: "center",
            fontFamily: theme.fonts.apoio,
            fontWeight: 800,
            letterSpacing: "-0.01em",
          }}
        >
          {linhas.map((l, i) => (
            <div key={i} style={{ fontSize: l.tamanho, lineHeight: 1.18, textWrap: "balance" }}>
              <Destacado texto={l.texto} />
            </div>
          ))}
        </div>
      </AbsoluteFill>

      {/* Rodapé: acima da área coberta pela interface do Instagram */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: rodapeTopo,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            background: "rgba(0,0,0,0.78)",
            borderRadius: 18,
            padding: "18px 32px",
            fontFamily: theme.fonts.apoio,
            fontWeight: 800,
            fontSize: 44,
            letterSpacing: "0.04em",
            color: AMARELO,
          }}
        >
          {rodape}
          <Seta />
        </div>
      </div>
    </AbsoluteFill>
  );
};
