import React from "react";
import { Audio, Sequence, staticFile } from "remotion";

// Trilha de efeitos sonoros do vídeo "Amigas conversando".
// Cada som começa 2–3 frames ANTES do elemento aparecer (soa sincronizado).
type Som = "whoosh" | "pop" | "blip" | "ding1" | "ding2" | "ding3" | "tick" | "rabisco" | "thump" | "brilho";

const VOLUME: Record<Som, number> = {
  whoosh: 0.45,
  pop: 0.5,
  blip: 0.3,
  ding1: 0.35,
  ding2: 0.35,
  ding3: 0.4,
  tick: 0.22,
  rabisco: 0.5,
  thump: 0.6,
  brilho: 0.4,
};

// [frame, som] a 30fps
const EVENTOS: [number, Som][] = [
  // Gancho
  [0, "pop"],
  [1, "whoosh"],
  [6, "whoosh"],
  // Espelho sai, Bia chega
  [87, "whoosh"],
  [94, "blip"],
  [142, "blip"],
  // Celular + checks nas fotos
  [207, "whoosh"],
  [216, "blip"],
  [224, "ding1"],
  [230, "ding2"],
  [236, "ding3"],
  // Carol chega, risca o copia e cola, app aparece
  [357, "whoosh"],
  [368, "blip"],
  [380, "rabisco"],
  [404, "pop"],
  // Calendário contando + seta + selo
  [507, "whoosh"],
  [514, "blip"],
  ...Array.from({ length: 14 }, (_, i) => [520 + i * 3, "tick"] as [number, Som]),
  [548, "whoosh"],
  [598, "thump"],
  // Virada e comemoração
  [688, "blip"],
  [692, "brilho"],
  [694, "pop"],
  // Saída do elenco e CTA
  [808, "whoosh"],
  [810, "pop"],
  [819, "thump"],
  [822, "whoosh"],
];

export const Efeitos: React.FC = () => (
  <>
    {EVENTOS.map(([frame, som], i) => (
      <Sequence key={i} from={frame} durationInFrames={30} layout="none">
        <Audio src={staticFile(`sfx/${som}.wav`)} volume={VOLUME[som]} />
      </Sequence>
    ))}
  </>
);
