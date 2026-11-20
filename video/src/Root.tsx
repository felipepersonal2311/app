import React from "react";
import { CalculateMetadataFunction, Composition } from "remotion";
import exemplo from "../projetos/exemplo.json";
import { Explicativo } from "./explicativo/Explicativo";
import { T } from "./explicativo/roteiro";
import { Molde } from "./Molde";
import { linhaDoTempo, type Projeto } from "./tipos";

// Duração e fps vêm do próprio projeto (preenchidos pelo scripts/preparar.py).
const metadados: CalculateMetadataFunction<Projeto> = ({ props }) => ({
  durationInFrames: Math.max(1, Math.round(linhaDoTempo(props).duracaoFinal * props.fps)),
  fps: props.fps,
});

export const Root: React.FC = () => (
  <>
  <Composition
    id="Reel"
    component={Molde}
    width={1080}
    height={1920}
    fps={30}
    durationInFrames={300}
    defaultProps={exemplo as Projeto}
    calculateMetadata={metadados}
  />
  <Composition
    id="Explicativo"
    component={Explicativo}
    width={1080}
    height={1920}
    fps={30}
    durationInFrames={Math.ceil(T.fim * 30)}
  />
  </>
);
