import React from "react";
import { CalculateMetadataFunction, Composition } from "remotion";
import exemplo from "../projetos/exemplo.json";
import { Explicativo } from "./explicativo/Explicativo";
import { T } from "./explicativo/roteiro";
import cafe from "../projetos/cafe-energetico.json";
import treinoMes from "../projetos/treino-todo-mes.json";
import reactFalha from "../projetos/react-falha.json";
import { ReactVideo, type ReactProps } from "./react/React";
import reactFoto from "../projetos/react-falha-foto.json";
import { ReactFoto, type ReactFotoProps } from "./react/ReactFoto";
import { Educativo, type EducativoProps } from "./educativo/Educativo";
import { TextoSobreVideo, type TextoSobreVideoProps } from "./texto/TextoSobreVideo";
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
  <Composition
    id="TextoSobreVideo"
    component={TextoSobreVideo}
    width={1080}
    height={1920}
    fps={30}
    durationInFrames={150}
    defaultProps={cafe as TextoSobreVideoProps}
    calculateMetadata={({ props }) => ({ durationInFrames: Math.round(props.duracao * 30) })}
  />
  <Composition
    id="Educativo"
    component={Educativo}
    width={1080}
    height={1920}
    fps={30}
    durationInFrames={300}
    defaultProps={treinoMes as EducativoProps}
    calculateMetadata={({ props }) => ({ durationInFrames: Math.round(props.duracao * props.fps), fps: props.fps })}
  />
  <Composition
    id="React"
    component={ReactVideo}
    width={1080}
    height={1920}
    fps={30}
    durationInFrames={300}
    defaultProps={reactFalha as ReactProps}
    calculateMetadata={({ props }) => ({ durationInFrames: Math.round(props.duracao * 30) })}
  />
  <Composition
    id="ReactFoto"
    component={ReactFoto}
    width={1080}
    height={1920}
    fps={30}
    durationInFrames={300}
    defaultProps={reactFoto as ReactFotoProps}
    calculateMetadata={({ props }) => ({ durationInFrames: Math.round(props.duracao * 30) })}
  />
  </>
);
