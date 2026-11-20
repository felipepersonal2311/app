import React, { useEffect, useState } from "react";
import {
  AbsoluteFill,
  continueRender,
  delayRender,
  interpolate,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Acabamento } from "../components/Acabamento";
import { CTA } from "../components/CTA";
import { Gancho } from "../components/Gancho";
import { fontesProntas } from "../fontes";
import { clamp, theme } from "../theme";
import { Calendario, CelularFotos, CopiaECola, Entra, Espelho } from "./Aderecos";
import { Balao } from "./Balao";
import { ELENCO, Expressao, Personagem, Visual } from "./Personagem";

// Roteiro v1 "Amigas conversando" — 30s a 30fps. Tempos em segundos.
export const CENAS = {
  gancho: 0,
  biaChega: 3,
  ponto1: 7,
  ponto2: 12,
  ponto4e5: 17,
  virada: 23,
  cta: 27,
  fim: 30,
};

const ESCALA = 1.05; // personagens: 315×735
const TOPO = 1050;

// Fundo: gradiente claro + manchas suaves da marca que flutuam + chão
const Fundo: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #EAF1FA 0%, #F7F9FC 60%, #FFFFFF 100%)" }}>
      <div
        style={{
          position: "absolute",
          width: 900,
          height: 900,
          borderRadius: "50%",
          left: -300 + Math.sin(t * 0.4) * 60,
          top: -200 + Math.cos(t * 0.3) * 50,
          background: "radial-gradient(circle, rgba(21,94,150,0.16) 0%, transparent 70%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 800,
          height: 800,
          borderRadius: "50%",
          right: -320 + Math.cos(t * 0.35) * 60,
          top: 500 + Math.sin(t * 0.25) * 60,
          background: "radial-gradient(circle, rgba(232,52,58,0.10) 0%, transparent 70%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: TOPO + 600 * ESCALA,
          bottom: 0,
          background: "linear-gradient(180deg, #DCE6F2 0%, #EEF3F9 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

const Ator: React.FC<{
  v: Visual;
  x: number;
  y?: number;
  expressao: Expressao;
  bracoEsq?: number;
  bracoDir?: number;
  joinhaDir?: boolean;
  fase?: number;
}> = ({ v, x, y = 0, fase = 0, ...resto }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const respiro = Math.sin(((frame + fase) / fps) * Math.PI * 0.9) * 0.012;
  const piscar = (frame + fase * 7) % 96 < 4;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: TOPO + y,
        width: 300 * ESCALA,
        height: 700 * ESCALA,
        transform: `scale(${ESCALA}) scaleY(${1 + respiro})`,
        transformOrigin: "0 0",
      }}
    >
      <div style={{ transformOrigin: "150px 690px" }}>
        <Personagem v={v} piscar={piscar} {...resto} />
      </div>
    </div>
  );
};

const Confete: React.FC<{ de: number }> = ({ de }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < de) return null;
  const t = (frame - de) / fps;
  const cores = [theme.colors.vermelho, theme.colors.azul, theme.colors.marinho, "#FFC857"];
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {Array.from({ length: 36 }).map((_, i) => {
        const x = ((i * 137) % 1000) + 40;
        const vel = 520 + ((i * 53) % 300);
        const y = -60 + t * vel - ((i * 71) % 400);
        const giro = t * (200 + i * 13);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x + Math.sin(t * 3 + i) * 30,
              top: y,
              width: 18,
              height: 30,
              borderRadius: 4,
              background: cores[i % 4],
              transform: `rotate(${giro}deg)`,
              opacity: y > 1500 ? 0 : 0.9,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

export const Explicativo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const [handle] = useState(() => delayRender("carregando fontes"));
  useEffect(() => {
    fontesProntas.then(() => continueRender(handle));
  }, [handle]);

  const f = (s: number) => Math.round(s * fps);
  const mola = (s: number, cfg: { damping: number; stiffness: number; mass: number } = theme.spring.smooth) =>
    spring({ frame: frame - f(s), fps, config: cfg });

  // Posições
  const anaX = interpolate(mola(CENAS.biaChega), [0, 1], [200, 20]);
  const biaX = interpolate(mola(CENAS.biaChega + 0.1), [0, 1], [1200, 730]) +
    interpolate(mola(CENAS.ponto2), [0, 1], [0, 20]);
  const carolX = interpolate(mola(CENAS.ponto2), [0, 1], [1250, 370]);
  const saida = interpolate(frame, [f(CENAS.cta), f(CENAS.cta) + 12], [0, 1150], {
    easing: theme.ease.in,
    ...clamp,
  });
  // Pulos na comemoração
  const pulo = (fase: number) =>
    frame >= f(CENAS.virada) + 6
      ? -Math.abs(Math.sin(((frame - f(CENAS.virada) - 6) / fps) * Math.PI * 2.2 + fase)) * 70
      : 0;
  const comemora = frame >= f(CENAS.virada) + 6;

  const anaExpr: Expressao =
    frame < f(CENAS.ponto1) ? "triste" : frame < f(CENAS.virada) ? "surpresa" : "feliz";
  const biaFlex = frame >= f(CENAS.biaChega + 1.6) && frame < f(CENAS.ponto1);

  const espelho = interpolate(mola(CENAS.biaChega, theme.spring.snappy), [0, 1], [0, 1]);

  return (
    <AbsoluteFill>
      <Fundo />

      {/* Cena 1: espelho */}
      {frame < f(CENAS.biaChega) + 20 ? (
        <div
          style={{
            position: "absolute",
            left: 660,
            top: TOPO + 120,
            opacity: 1 - espelho,
            transform: `translateX(${espelho * 300}px)`,
          }}
        >
          <Espelho />
          <div
            style={{
              position: "absolute",
              left: 24,
              top: 24,
              width: 252,
              height: 512,
              borderRadius: 126,
              overflow: "hidden",
              opacity: 0.45,
            }}
          >
            <div style={{ position: "absolute", left: -10, top: 70, transform: "scale(0.6) scaleX(-1)", transformOrigin: "150px 0" }}>
              <Personagem v={ELENCO.ana} expressao="triste" bracoEsq={30} bracoDir={-30} />
            </div>
          </div>
        </div>
      ) : null}

      {/* Elenco */}
      <div style={{ position: "absolute", inset: 0, transform: `translateY(${saida}px)` }}>
        <Ator
          v={ELENCO.ana}
          x={anaX}
          y={pulo(0)}
          expressao={anaExpr}
          bracoEsq={comemora ? 160 : frame < f(CENAS.biaChega) ? 30 : 12}
          bracoDir={comemora ? -160 : frame < f(CENAS.biaChega) ? -30 : -12}
          fase={0}
        />
        {frame >= f(CENAS.ponto2) - 2 ? (
          <Ator
            v={ELENCO.carol}
            x={carolX}
            y={pulo(1.2)}
            expressao="feliz"
            bracoEsq={comemora ? 150 : 14}
            bracoDir={comemora ? -150 : -40}
            fase={11}
          />
        ) : null}
        {frame >= f(CENAS.biaChega) - 2 ? (
          <Ator
            v={ELENCO.bia}
            x={biaX}
            y={pulo(2.1)}
            expressao="feliz"
            bracoEsq={comemora ? 160 : 14}
            bracoDir={comemora ? -160 : biaFlex ? -150 : -14}
            fase={23}
          />
        ) : null}
      </div>

      {/* Adereços */}
      <Entra de={f(CENAS.ponto1)} ate={f(CENAS.ponto2)} x={260} y={290}>
        <CelularFotos de={f(CENAS.ponto1)} />
      </Entra>
      <Entra de={f(CENAS.ponto2) + 4} ate={f(CENAS.ponto4e5)} x={160} y={280}>
        <CopiaECola de={f(CENAS.ponto2) + 4} />
      </Entra>
      <Entra de={f(CENAS.ponto4e5)} ate={f(CENAS.virada)} x={140} y={240}>
        <Calendario de={f(CENAS.ponto4e5)} seloDe={f(CENAS.ponto4e5 + 3)} />
      </Entra>

      {/* Falas */}
      <Balao
        texto="Treino há meses… glúteo não cresce e a *barriga não sai!*"
        x={40}
        y={820}
        largura={640}
        ponta={0.28}
        de={f(CENAS.biaChega) + 6}
        ate={f(CENAS.biaChega + 1.9)}
      />
      <Balao
        texto="Eu tava assim! Até entrar na *consultoria do Felipe*."
        x={380}
        y={820}
        largura={660}
        ponta={0.78}
        de={f(CENAS.biaChega + 1.8)}
        ate={f(CENAS.ponto1)}
        cor={theme.colors.vermelho}
      />
      <Balao
        texto="Ele começa te *conhecendo*: anamnese e avaliação pelas suas *fotos*."
        x={300}
        y={830}
        largura={740}
        ponta={0.8}
        de={f(CENAS.ponto1) + 8}
        ate={f(CENAS.ponto2)}
        cor={theme.colors.vermelho}
      />
      <Balao
        texto="E o treino é feito *pra você*. Nada de copia e cola!"
        x={170}
        y={830}
        largura={740}
        ponta={0.48}
        de={f(CENAS.ponto2) + 10}
        ate={f(CENAS.ponto4e5)}
        cor={theme.colors.azul}
      />
      <Balao
        texto="Todo mês ele *reavalia* e muda o treino."
        x={380}
        y={850}
        largura={660}
        ponta={0.82}
        de={f(CENAS.ponto4e5) + 6}
        ate={f(CENAS.ponto4e5 + 3)}
        cor={theme.colors.vermelho}
      />
      <Balao
        texto="E se não se adaptar, *ajusta na hora!*"
        x={190}
        y={850}
        largura={680}
        ponta={0.5}
        de={f(CENAS.ponto4e5 + 3)}
        ate={f(CENAS.virada)}
        cor={theme.colors.azul}
      />
      <Balao
        texto="Tô dentro! Me passa o *contato*!"
        x={40}
        y={830}
        largura={620}
        ponta={0.26}
        de={f(CENAS.virada)}
        ate={f(CENAS.cta)}
      />

      <Confete de={f(CENAS.virada) + 6} />

      {/* Gancho */}
      <Sequence durationInFrames={f(CENAS.biaChega)} layout="none">
        <Gancho linhas={["TREINA E NÃO VÊ", "RESULTADO?"]} duracaoFrames={f(CENAS.biaChega)} />
      </Sequence>

      {/* CTA com o mascote */}
      <Sequence from={f(CENAS.cta)} layout="none">
        <CTA chamada="COMENTE" palavra="CONSULTORIA" />
        <Mascote />
      </Sequence>

      <Acabamento />
    </AbsoluteFill>
  );
};

const Mascote: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - 14, fps, config: theme.spring.bouncy });
  return (
    <div
      style={{
        position: "absolute",
        left: 740,
        top: 1250,
        opacity: p,
        transform: `translateY(${interpolate(p, [0, 1], [300, 0])}px) scale(0.8)`,
        transformOrigin: "0 0",
      }}
    >
      <Personagem v={ELENCO.felipe} expressao="feliz" bracoEsq={10} bracoDir={-130} joinhaDir />
    </div>
  );
};
