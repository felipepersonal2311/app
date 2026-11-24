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

// Vídeo com texto fixo por cima, em dois blocos (topo e peito) deixando o rosto livre,
// comparação em dois cartões e chamada "LEIA A LEGENDA" embaixo.
// Trechos entre *asteriscos* ficam em amarelo.
type Linha = { texto: string; estilo: "pequena" | "grande" };

export type TextoSobreVideoProps = {
  video: string; // arquivo em public/brutos/
  duracao: number; // segundos do vídeo final
  velocidade: number; // 1 = normal, 0.4 = câmera lenta
  topo: Linha[]; // bloco do alto (área do teto)
  peito: Linha[]; // bloco na altura do peito
  comparacao?: { valor: string; rotulo: string }[]; // 2 cartões lado a lado
  rodape: string;
  posTopo?: number; // px
  posPeito?: number; // px
  posRodape?: number; // px
};

const AMARELO = "#FFD400";
const CAIXA = "rgba(0,0,0,0.72)";

const Destacado: React.FC<{ texto: string }> = ({ texto }) => (
  <>
    {texto.split("*").map((t, i) => (
      <span key={i} style={{ color: i % 2 ? AMARELO : "#FFFFFF" }}>
        {t}
      </span>
    ))}
  </>
);

// Cada linha tem sua própria caixa justa ao texto (visual de Reels moderno)
const Bloco: React.FC<{ linhas: Linha[] }> = ({ linhas }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
    {linhas.map((l, i) => {
      const grande = l.estilo === "grande";
      return (
        <div
          key={i}
          style={{
            background: CAIXA,
            borderRadius: 14,
            padding: grande ? "10px 26px 2px" : "10px 22px",
            fontFamily: grande ? theme.fonts.display : theme.fonts.apoio,
            fontWeight: grande ? 400 : 800,
            fontSize: grande ? 112 : 46,
            lineHeight: 1,
            letterSpacing: grande ? "0.01em" : "-0.01em",
            whiteSpace: "nowrap",
          }}
        >
          <Destacado texto={l.texto} />
        </div>
      );
    })}
  </div>
);

const Seta: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const y = Math.abs(Math.sin((frame / fps) * Math.PI * 1.6)) * 10;
  return (
    <svg width={44} height={54} viewBox="0 0 46 56" style={{ transform: `translateY(${y}px)` }}>
      <path d="M23 4 V44 M6 30 L23 48 L40 30" fill="none" stroke={AMARELO} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export const TextoSobreVideo: React.FC<TextoSobreVideoProps> = ({
  video,
  velocidade,
  topo,
  peito,
  comparacao,
  rodape,
  posTopo = 260,
  posPeito = 1010,
  posRodape = 1520,
}) => {
  const [handle] = useState(() => delayRender("carregando fontes"));
  useEffect(() => {
    fontesProntas.then(() => continueRender(handle));
  }, [handle]);

  const absoluto = (top: number): React.CSSProperties => ({
    position: "absolute",
    left: 90,
    right: 90,
    top,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 18,
  });

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <OffthreadVideo
        src={staticFile(`brutos/${video}`)}
        playbackRate={velocidade}
        muted
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />

      <div style={absoluto(posTopo)}>
        <Bloco linhas={topo} />
      </div>

      <div style={absoluto(posPeito)}>
        <Bloco linhas={peito} />
        {comparacao ? (
          <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 6 }}>
            {comparacao.map((c, i) => (
              <React.Fragment key={i}>
                {i > 0 ? (
                  <div
                    style={{
                      fontFamily: theme.fonts.apoio,
                      fontWeight: 800,
                      fontSize: 36,
                      color: "#fff",
                      background: CAIXA,
                      borderRadius: 40,
                      padding: "10px 16px",
                    }}
                  >
                    vs
                  </div>
                ) : null}
                <div style={{ background: CAIXA, borderRadius: 18, padding: "16px 20px 16px", textAlign: "center", width: 330 }}>
                  <div style={{ fontFamily: theme.fonts.apoio, fontWeight: 800, fontSize: 64, lineHeight: 1.05, letterSpacing: "-0.02em", color: AMARELO }}>
                    {c.valor}
                  </div>
                  <div style={{ fontFamily: theme.fonts.apoio, fontWeight: 800, fontSize: 28, color: "#fff", marginTop: 6 }}>
                    {c.rotulo}
                  </div>
                </div>
              </React.Fragment>
            ))}
          </div>
        ) : null}
      </div>

      {/* Rodapé: acima da área coberta pela interface do Instagram */}
      <div style={{ ...absoluto(posRodape), gap: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            background: CAIXA,
            borderRadius: 16,
            padding: "16px 30px",
            fontFamily: theme.fonts.apoio,
            fontWeight: 800,
            fontSize: 40,
            letterSpacing: "0.05em",
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
