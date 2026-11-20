import React from "react";
import { Audio, Sequence, staticFile, useVideoConfig } from "remotion";
import { T } from "./roteiro";

// Trilha de efeitos sonoros do vídeo "Amigas conversando".
// Os tempos acompanham a linha do tempo das vozes (roteiro.ts).
// Cada som começa ~2–3 frames ANTES do elemento aparecer (soa sincronizado).
// Volumes mais baixos que a voz, para não atrapalhar a fala.
type Som = "whoosh" | "pop" | "blip" | "ding1" | "ding2" | "ding3" | "tick" | "rabisco" | "thump" | "brilho";

const VOLUME: Record<Som, number> = {
  whoosh: 0.3,
  pop: 0.35,
  blip: 0.15,
  ding1: 0.25,
  ding2: 0.25,
  ding3: 0.3,
  tick: 0.15,
  rabisco: 0.35,
  thump: 0.45,
  brilho: 0.3,
};

const eventos = (): [number, Som][] => [
  // Gancho
  [0, "pop"],
  [0.03, "whoosh"],
  [0.2, "whoosh"],
  // Espelho sai, Bia chega
  [T.biaChega - 0.1, "whoosh"],
  // Celular + checks nas fotos
  [T.ponto1 - 0.1, "whoosh"],
  [T.checksFotos - 0.03, "ding1"],
  [T.checksFotos + 0.17, "ding2"],
  [T.checksFotos + 0.37, "ding3"],
  // Carol chega, risca o copia e cola, app aparece
  [T.ponto2 - 0.1, "whoosh"],
  [T.riscaCopiaECola - 0.07, "rabisco"],
  [T.riscaCopiaECola + 0.73, "pop"],
  // Calendário contando + seta + selo
  [T.ponto4e5 - 0.1, "whoosh"],
  ...Array.from({ length: 14 }, (_, i) => [T.ponto4e5 + 0.33 + i * 0.1, "tick"] as [number, Som]),
  [T.ponto4e5 + 1.27, "whoosh"],
  [T.seloAjuste - 0.07, "thump"],
  // Virada e comemoração
  [T.virada + 0.07, "brilho"],
  [T.virada + 0.13, "pop"],
  // Saída do elenco e CTA
  [T.cta - 0.07, "whoosh"],
  [T.cta, "pop"],
  [T.cta + 0.3, "thump"],
  [T.cta + 0.4, "whoosh"],
];

export const Efeitos: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <>
      {eventos().map(([s, som], i) => (
        <Sequence key={i} from={Math.max(0, Math.round(s * fps))} durationInFrames={Math.round(fps)} layout="none">
          <Audio src={staticFile(`sfx/${som}.wav`)} volume={VOLUME[som]} />
        </Sequence>
      ))}
    </>
  );
};
