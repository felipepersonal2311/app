import React, { useEffect, useState } from "react";
import {
  AbsoluteFill,
  Audio,
  continueRender,
  delayRender,
  interpolate,
  Sequence,
  spring,
  staticFile,
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
import { Efeitos } from "./Efeitos";
import { ELENCO, Expressao, Personagem, Visual } from "./Personagem";
import { BALAO, FALAS, falandoAgora, Quem, T } from "./roteiro";

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
  falando?: boolean;
}> = ({ v, x, y = 0, fase = 0, falando, expressao, ...resto }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const boca = bocaFalando(expressao, falando, frame);
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
        <Personagem v={v} piscar={piscar} expressao={boca} {...resto} />
      </div>
    </div>
  );
};

// Enquanto fala, a boca abre e fecha (ritmo irregular para parecer fala)
const bocaFalando = (base: Expressao, falando: boolean | undefined, frame: number): Expressao => {
  if (!falando) return base;
  const aberta = (frame % 7 < 3) !== (frame % 23 < 2);
  if (base === "triste") return aberta ? "surpresa" : "triste";
  if (base === "confiante") return aberta ? "feliz" : "confiante";
  return aberta ? "feliz" : "neutra";
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
  const agora = frame / fps;
  const fala = (q: Quem) => falandoAgora(q, agora);
  const mola = (s: number, cfg: { damping: number; stiffness: number; mass: number } = theme.spring.smooth) =>
    spring({ frame: frame - f(s), fps, config: cfg });

  // Posições
  const anaX = interpolate(mola(T.biaChega), [0, 1], [200, 20]);
  const biaX = interpolate(mola(T.biaChega + 0.1), [0, 1], [1200, 730]) + interpolate(mola(T.ponto2), [0, 1], [0, 20]);
  const carolX = interpolate(mola(T.ponto2), [0, 1], [1250, 370]);
  const saida = interpolate(frame, [f(T.cta), f(T.cta) + 12], [0, 1150], { easing: theme.ease.in, ...clamp });
  // Pulos na comemoração
  const comecaPulo = f(T.virada) + 6;
  const pulo = (fase: number) =>
    frame >= comecaPulo ? -Math.abs(Math.sin(((frame - comecaPulo) / fps) * Math.PI * 2.2 + fase)) * 70 : 0;
  const comemora = frame >= comecaPulo;

  const anaExpr: Expressao = frame < f(T.ponto1) ? "triste" : frame < f(T.virada) ? "surpresa" : "feliz";
  const biaFlex = frame >= f(T.biaFlexDe) && frame < f(T.ponto1);
  const espelho = interpolate(mola(T.biaChega, theme.spring.snappy), [0, 1], [0, 1]);

  return (
    <AbsoluteFill>
      <Fundo />

      {/* Cena 1: espelho */}
      {frame < f(T.biaChega) + 20 ? (
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
              <Personagem
                v={ELENCO.ana}
                expressao={bocaFalando("triste", fala("ana"), frame)}
                bracoEsq={30}
                bracoDir={-30}
              />
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
          falando={fala("ana")}
          bracoEsq={comemora ? 160 : frame < f(T.biaChega) ? 30 : 12}
          bracoDir={comemora ? -160 : frame < f(T.biaChega) ? -30 : -12}
          fase={0}
        />
        {frame >= f(T.ponto2) - 2 ? (
          <Ator
            v={ELENCO.carol}
            x={carolX}
            y={pulo(1.2)}
            expressao="feliz"
            falando={fala("carol")}
            bracoEsq={comemora ? 150 : 14}
            bracoDir={comemora ? -150 : -40}
            fase={11}
          />
        ) : null}
        {frame >= f(T.biaChega) - 2 ? (
          <Ator
            v={ELENCO.bia}
            x={biaX}
            y={pulo(2.1)}
            expressao="feliz"
            falando={fala("bia")}
            bracoEsq={comemora ? 160 : 14}
            bracoDir={comemora ? -160 : biaFlex ? -150 : -14}
            fase={23}
          />
        ) : null}
      </div>

      {/* Adereços (animações internas sincronizadas com a fala) */}
      <Entra de={f(T.ponto1)} ate={f(T.ponto2)} x={260} y={270}>
        <CelularFotos de={f(T.checksFotos) - 15} />
      </Entra>
      <Entra de={f(T.ponto2) + 4} ate={f(T.ponto4e5)} x={160} y={260}>
        <CopiaECola de={f(T.riscaCopiaECola) - 18} />
      </Entra>
      <Entra de={f(T.ponto4e5)} ate={f(T.virada)} x={140} y={220}>
        <Calendario de={f(T.ponto4e5)} seloDe={f(T.seloAjuste)} />
      </Entra>

      {/* Falas: balão + voz */}
      {FALAS.map((fl) => (
        <React.Fragment key={fl.id}>
          {fl.quem !== "felipe" ? (
            <Balao
              texto={fl.texto}
              {...BALAO[fl.quem]}
              de={fl.id === "ana_1" ? f(T.ganchoDuracao) : f(fl.inicio) - 3}
              ate={f(fl.fim) + 8}
              cor={
                fl.quem === "bia" ? theme.colors.vermelho : fl.quem === "carol" ? theme.colors.azul : theme.colors.marinho
              }
            />
          ) : null}
          <Sequence from={f(fl.inicio)} layout="none">
            <Audio src={staticFile(`vozes/${fl.id}.mp3`)} volume={1} />
          </Sequence>
        </React.Fragment>
      ))}

      <Confete de={f(T.virada) + 6} />

      {/* Gancho */}
      <Sequence durationInFrames={f(T.ganchoDuracao)} layout="none">
        <Gancho linhas={["TREINA E NÃO VÊ", "RESULTADO?"]} duracaoFrames={f(T.ganchoDuracao)} />
      </Sequence>

      {/* CTA com o mascote */}
      <Sequence from={f(T.cta)} layout="none">
        <CTA chamada="COMENTE" palavra="CONSULTORIA" />
        <Mascote />
      </Sequence>

      <Efeitos />
      <Acabamento />
    </AbsoluteFill>
  );
};

const Mascote: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - 14, fps, config: theme.spring.bouncy });
  const falando = falandoAgora("felipe", frame / fps + T.cta);
  return (
    <div
      style={{
        position: "absolute",
        left: 770,
        top: 1320,
        opacity: p,
        transform: `translateY(${interpolate(p, [0, 1], [300, 0])}px) scale(0.84)`,
        transformOrigin: "0 0",
      }}
    >
      <Personagem
        v={ELENCO.felipe}
        expressao={bocaFalando("confiante", falando, frame)}
        bracoEsq={128}
        bracoDir={-14}
        apontaEsq
      />
    </div>
  );
};
