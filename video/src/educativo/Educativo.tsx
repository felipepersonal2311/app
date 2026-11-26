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

// Formato "Educativo": você falando + legendas dinâmicas.
// Padrão visual: texto branco, destaques em amarelo, caixa preta discreta,
// tudo abaixo do rosto e acima da interface do Instagram.
export type EducativoProps = {
  video: string; // arquivo em public/brutos/
  duracao: number; // segundos
  fps: number;
  gancho: { texto: string; duracao: number }; // *asteriscos* = amarelo
  legendas: { texto: string; inicio: number; fim: number }[];
  destaques: string[]; // palavras que ficam amarelas nas legendas
  cta: { linha1: string; linha2: string; duracao: number }; // *asteriscos* = amarelo, | quebra a linha
  posGancho?: number; // px (topo da caixa do gancho)
  posLegenda?: number; // px (centro vertical da legenda)
  posCta?: number; // px
};

const AMARELO = "#FFD400";
const CAIXA = "rgba(0,0,0,0.62)";

const norm = (p: string) =>
  p
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9-]/g, "");

const Destacado: React.FC<{ texto: string }> = ({ texto }) => (
  <>
    {texto.split("*").map((t, i) => (
      <span key={i} style={{ color: i % 2 ? AMARELO : "#FFFFFF" }}>
        {t}
      </span>
    ))}
  </>
);

const Gancho: React.FC<{ texto: string; dur: number; top: number }> = ({ texto, dur, top }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame, fps, config: theme.spring.smooth });
  const s = interpolate(frame, [dur - 8, dur], [0, 1], { easing: theme.ease.in, ...clamp });
  return (
    <div style={{ position: "absolute", left: 90, right: 90, top, display: "flex", justifyContent: "center" }}>
      <div
        style={{
          opacity: p * (1 - s),
          transform: `translateY(${interpolate(p, [0, 1], [24, 0]) - s * 12}px)`,
          background: CAIXA,
          borderRadius: 24,
          padding: "26px 36px",
          maxWidth: 900,
          textAlign: "center",
          fontFamily: theme.fonts.apoio,
          fontWeight: 800,
          fontSize: 64,
          lineHeight: 1.15,
          letterSpacing: "-0.01em",
          textWrap: "balance",
        }}
      >
        <Destacado texto={texto} />
      </div>
    </div>
  );
};

const Legenda: React.FC<{ texto: string; destaques: Set<string>; dur: number; centro: number }> = ({
  texto,
  destaques,
  dur,
  centro,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame, fps, config: theme.spring.snappy });
  const s = interpolate(frame, [dur - 3, dur], [0, 1], { ...clamp });
  const palavras = texto.split(/\s+/).filter(Boolean);
  return (
    <div
      style={{
        position: "absolute",
        left: 90,
        right: 90,
        top: centro - 50,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          opacity: p * (1 - s),
          transform: `scale(${interpolate(p, [0, 1], [0.88, 1])})`,
          background: CAIXA,
          borderRadius: 18,
          padding: "14px 26px",
          fontFamily: theme.fonts.apoio,
          fontWeight: 800,
          fontSize: 62,
          lineHeight: 1.12,
          textAlign: "center",
          maxWidth: 900,
          color: "#fff",
        }}
      >
        {palavras.map((w, i) => (
          <span key={i} style={{ color: destaques.has(norm(w)) ? AMARELO : "#fff" }}>
            {i > 0 ? " " : ""}
            {w}
          </span>
        ))}
      </div>
    </div>
  );
};

const CTA: React.FC<{ linha1: string; linha2: string; top: number }> = ({ linha1, linha2, top }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame, fps, config: theme.spring.smooth });
  const p2 = spring({ frame: frame - 6, fps, config: theme.spring.smooth });
  return (
    <div style={{ position: "absolute", left: 90, right: 90, top, display: "flex", justifyContent: "center" }}>
      <div
        style={{
          opacity: p,
          transform: `translateY(${interpolate(p, [0, 1], [30, 0])}px) scale(${interpolate(p, [0, 1], [0.94, 1])})`,
          background: "rgba(0,0,0,0.88)",
          borderRadius: 22,
          borderLeft: `12px solid ${AMARELO}`,
          padding: "26px 34px 26px 30px",
          maxWidth: 900,
          fontFamily: theme.fonts.apoio,
          fontWeight: 800,
          color: "#fff",
        }}
      >
        {linha1.split("|").map((l, i) => (
          <div key={i} style={{ fontSize: 60, lineHeight: 1.12 }}>
            <Destacado texto={l.trim()} />
          </div>
        ))}
        <div
          style={{
            marginTop: 14,
            fontSize: 40,
            color: AMARELO,
            opacity: p2,
            transform: `translateY(${interpolate(p2, [0, 1], [12, 0])}px)`,
          }}
        >
          {linha2}
        </div>
      </div>
    </div>
  );
};

export const Educativo: React.FC<EducativoProps> = (p) => {
  const { fps, durationInFrames } = useVideoConfig();
  const [handle] = useState(() => delayRender("carregando fontes"));
  useEffect(() => {
    fontesProntas.then(() => continueRender(handle));
  }, [handle]);

  const ganchoF = Math.round(p.gancho.duracao * fps);
  const ctaF = Math.round(p.cta.duracao * fps);
  const ctaIni = durationInFrames - ctaF;
  const destaques = new Set(p.destaques.map(norm));
  const posGancho = p.posGancho ?? 1170;
  const posLegenda = p.posLegenda ?? 1270;

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <OffthreadVideo src={staticFile(`brutos/${p.video}`)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />

      {/* Legendas: some durante o CTA; durante o gancho descem para baixo dele */}
      {p.legendas.map((l, i) => {
        const de = Math.round(l.inicio * fps);
        const dur = Math.max(Math.round((l.fim - l.inicio) * fps), 6);
        if (de >= ctaIni - 2) return null;
        const centro = de < ganchoF ? posGancho + 330 : posLegenda;
        return (
          <Sequence key={i} from={de} durationInFrames={Math.min(dur, ctaIni - de)} layout="none">
            <Legenda texto={l.texto} destaques={destaques} dur={Math.min(dur, ctaIni - de)} centro={centro} />
          </Sequence>
        );
      })}

      <Sequence durationInFrames={ganchoF} layout="none">
        <Gancho texto={p.gancho.texto} dur={ganchoF} top={posGancho} />
      </Sequence>

      <Sequence from={ctaIni} layout="none">
        <CTA linha1={p.cta.linha1} linha2={p.cta.linha2} top={p.posCta ?? 1200} />
      </Sequence>
    </AbsoluteFill>
  );
};
