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
import { linhaDoTempo, type Projeto } from "./tipos";

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

  const frame = useCurrentFrame();
  const lt = linhaDoTempo(p);
  const cinza = usePretoEBranco(lt.pretoEBranco);
  const teaserFrames = Math.round(lt.teaserDur * fps);
  const ganchoFrames = Math.round(p.gancho.duracao * fps);
  const ctaFrames = Math.round(p.cta.duracao * fps);
  const ctaInicio = durationInFrames - ctaFrames;
  // Legendas param quando o CTA entra, para não brigar com ele.
  const legendas = lt.legendas.filter((l) => l.inicio * fps < ctaInicio - 2);

  return (
    <AbsoluteFill style={{ background: theme.colors.preto }}>
      <AbsoluteFill
        style={{
          transform: p.zoomGancho
            ? `scale(${interpolate(frame, [0, ganchoFrames], [1.0, 1.14], { easing: theme.ease.inOut, ...clamp })})`
            : undefined,
          filter: `grayscale(${cinza}) contrast(${1 + cinza * 0.12})`,
        }}
      >
        {p.teaser ? (
          <Sequence durationInFrames={teaserFrames} layout="none">
            <OffthreadVideo
              src={staticFile(`brutos/${p.video}`)}
              trimBefore={Math.round(p.teaser[0] * fps)}
              trimAfter={Math.round(p.teaser[1] * fps)}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </Sequence>
        ) : null}
        <Sequence from={teaserFrames} layout="none">
          <OffthreadVideo
            src={staticFile(`brutos/${p.video}`)}
            trimBefore={Math.round(lt.corte * fps) || undefined}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </Sequence>
      </AbsoluteFill>

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
