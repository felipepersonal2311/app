import React, { useEffect, useState } from "react";
import {
  AbsoluteFill,
  Audio,
  continueRender,
  delayRender,
  interpolate,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Acabamento } from "./components/Acabamento";
import { CTA } from "./components/CTA";
import { Gancho } from "./components/Gancho";
import { Legendas } from "./components/Legendas";
import { fontesProntas } from "./fontes";
import { clamp, theme } from "./theme";
import type { Projeto } from "./tipos";

// Quanto de P&B aplicar neste frame (transição suave de ~6 frames nas bordas).
const usePretoEBranco = (trechos: [number, number][]) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = 6;
  let g = 0;
  for (const [a, b] of trechos) {
    const fa = a * fps;
    const fb = b * fps;
    const v = Math.min(
      interpolate(frame, [fa, fa + t], [0, 1], { easing: theme.ease.out, ...clamp }),
      interpolate(frame, [fb - t, fb], [1, 0], { easing: theme.ease.in, ...clamp }),
    );
    g = Math.max(g, v);
  }
  return g;
};

export const Molde: React.FC<Projeto> = (p) => {
  const { fps, durationInFrames } = useVideoConfig();
  const [handle] = useState(() => delayRender("carregando fontes"));
  useEffect(() => {
    fontesProntas.then(() => continueRender(handle));
  }, [handle]);

  const cinza = usePretoEBranco(p.pretoEBranco);
  const ganchoFrames = Math.round(p.gancho.duracao * fps);
  const ctaFrames = Math.round(p.cta.duracao * fps);
  const ctaInicio = durationInFrames - ctaFrames;
  // Legendas param quando o CTA entra, para não brigar com ele.
  const legendas = p.legendas.filter((l) => l.inicio * fps < ctaInicio - 2);

  return (
    <AbsoluteFill style={{ background: theme.colors.preto }}>
      <OffthreadVideo
        src={staticFile(`brutos/${p.video}`)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          filter: `grayscale(${cinza}) contrast(${1 + cinza * 0.12})`,
        }}
      />

      <Sequence durationInFrames={ganchoFrames} layout="none">
        <Gancho linhas={p.gancho.linhas} duracaoFrames={ganchoFrames} />
      </Sequence>

      <Legendas legendas={legendas} destaques={p.destaques} />

      <Sequence from={ctaInicio} layout="none">
        <CTA chamada={p.cta.chamada} palavra={p.cta.palavra} />
      </Sequence>

      {p.efeitosSonoros ? (
        <>
          <Audio src={staticFile("sfx/whoosh.wav")} volume={0.5} />
          <Sequence from={Math.max(ctaInicio + 11 - 3, 0)} layout="none">
            <Audio src={staticFile("sfx/pop.wav")} volume={0.6} />
          </Sequence>
          <Sequence from={Math.max(ctaInicio - 3, 0)} layout="none">
            <Audio src={staticFile("sfx/whoosh.wav")} volume={0.4} />
          </Sequence>
        </>
      ) : null}

      <Acabamento />
    </AbsoluteFill>
  );
};
