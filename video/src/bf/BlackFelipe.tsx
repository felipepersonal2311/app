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
import { CTA } from "../components/CTA";
import { Gancho } from "../components/Gancho";
import { Balao } from "../explicativo/Balao";
import { ELENCO, Expressao, Personagem, Visual } from "../explicativo/Personagem";
import { fontesProntas } from "../fontes";
import { clamp, theme } from "../theme";
import dur from "./vozes.json";

// Black Friday da Consultoria Felipe Oliveira — diálogo animado com vozes.
type Quem = "ana" | "bia" | "carol" | "felipe";
const GAP = 0.3;
const roteiro: { id: keyof typeof dur; quem: Quem; texto: string; antes?: number }[] = [
  { id: "ana_1", quem: "ana", texto: "Já tentei de tudo! *Passo horas na academia*, treino, treino… e *não evoluo*.", antes: 0.5 },
  { id: "bia_1", quem: "bia", texto: "Amiga, experimenta a *consultoria do Felipe*! Começou a Black: 1º mês por *R$ 100*!", antes: 0.4 },
  { id: "carol_0", quem: "carol", texto: "E sabia que lá o treino *não passa de 40 a 50 minutos*?", antes: 0.6 },
  { id: "carol_1", quem: "carol", texto: "E não é só treino: é uma *comunidade* de gente que *alcança o objetivo*." },
  { id: "bia_2", quem: "bia", texto: "Ele se *preocupa de verdade* com você. É a *melhor consultoria da região*!" },
  { id: "ana_2", quem: "ana", texto: "E se eu quiser *ficar mais tempo*?" },
  { id: "carol_2", quem: "carol", texto: "No semestral você ganha *1 mês*… e no anual, *2 meses* de bônus!" },
  { id: "ana_3", quem: "ana", texto: "*Tô dentro!*" },
  { id: "felipe_1", quem: "felipe", texto: "", antes: 1.0 },
];
let cur = 0;
const FALAS = roteiro.map((r, i) => {
  const inicio = i === 0 ? (r.antes ?? 0) : cur + (r.antes ?? GAP);
  const fim = inicio + dur[r.id];
  cur = fim;
  return { ...r, inicio, fim };
});
const F = Object.fromEntries(FALAS.map((f) => [f.id, f])) as Record<keyof typeof dur, (typeof FALAS)[number]>;
const T = {
  gancho: 3.0,
  biaEntra: F.bia_1.inicio - 0.5,
  carolEntra: F.carol_0.inicio - 0.5,
  tempo: F.carol_0.inicio + 0.2,
  oferta: F.bia_1.inicio + 3.0,
  comunidade: F.carol_1.inicio + 0.3,
  cuidado: F.bia_2.inicio,
  semestral: F.carol_2.inicio + 0.9,
  anual: F.carol_2.inicio + 3.0,
  cta: F.felipe_1.inicio - 0.6,
};
export const BF_DURACAO = Math.ceil((F.felipe_1.fim + 1.4) * 30);

const VERM = theme.colors.vermelho;
const MAR = theme.colors.marinho;
const ESC = 1.05;
const TOPO = 1050;

const BALAO: Record<Exclude<Quem, "felipe">, { x: number; y: number; largura: number; ponta: number; cor: string }> = {
  ana: { x: 40, y: 790, largura: 660, ponta: 0.26, cor: MAR },
  bia: { x: 340, y: 790, largura: 700, ponta: 0.82, cor: VERM },
  carol: { x: 170, y: 790, largura: 740, ponta: 0.5, cor: theme.colors.azul },
};

const falando = (q: Quem, s: number) => FALAS.some((f) => f.quem === q && s >= f.inicio && s <= f.fim);
const boca = (base: Expressao, fala: boolean, frame: number): Expressao => {
  if (!fala) return base;
  const aberta = (frame % 7 < 3) !== (frame % 23 < 2);
  if (base === "triste") return aberta ? "surpresa" : "triste";
  if (base === "confiante") return aberta ? "feliz" : "confiante";
  return aberta ? "feliz" : "neutra";
};

const Ator: React.FC<{ v: Visual; q: Quem; x: number; y?: number; expr: Expressao; bE?: number; bD?: number; fase: number }> = ({
  v,
  q,
  x,
  y = 0,
  expr,
  bE = 12,
  bD = -12,
  fase,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const respiro = Math.sin(((frame + fase) / fps) * Math.PI * 0.9) * 0.012;
  return (
    <div style={{ position: "absolute", left: x, top: TOPO + y, transform: `scale(${ESC}) scaleY(${1 + respiro})`, transformOrigin: "0 0" }}>
      <Personagem v={v} expressao={boca(expr, falando(q, frame / fps), frame)} piscar={(frame + fase * 7) % 96 < 4} bracoEsq={bE} bracoDir={bD} />
    </div>
  );
};

const Fundo: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #EAF1FA 0%, #F7F9FC 60%, #FFFFFF 100%)" }}>
      <div style={{ position: "absolute", width: 900, height: 900, borderRadius: "50%", left: -300 + Math.sin(t * 0.4) * 60, top: -200 + Math.cos(t * 0.3) * 50, background: "radial-gradient(circle, rgba(21,94,150,0.16) 0%, transparent 70%)" }} />
      <div style={{ position: "absolute", width: 800, height: 800, borderRadius: "50%", right: -320 + Math.cos(t * 0.35) * 60, top: 500 + Math.sin(t * 0.25) * 60, background: "radial-gradient(circle, rgba(232,52,58,0.12) 0%, transparent 70%)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: TOPO + 630 * ESC, bottom: 0, background: "linear-gradient(180deg, #DCE6F2 0%, #EEF3F9 100%)" }} />
    </AbsoluteFill>
  );
};

// Entrada/saída padrão para os cartões de cima
const useBloco = (dur: number) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame, fps, config: theme.spring.bouncy });
  const s = interpolate(frame, [dur - 8, dur], [0, 1], { easing: theme.ease.in, ...clamp });
  return { p, style: { opacity: p * (1 - s), transform: `translateY(${(1 - p) * 60 - s * 20}px) scale(${interpolate(p, [0, 1], [0.8, 1])})` } };
};

const cartao: React.CSSProperties = {
  background: "#fff",
  borderRadius: 32,
  boxShadow: "0 20px 44px rgba(36,48,94,0.2)",
  border: `5px solid ${MAR}`,
};

const Oferta: React.FC<{ dur: number }> = ({ dur }) => {
  const { style } = useBloco(dur);
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: 190, top: 250, width: 700, ...style }}>
      <div style={{ ...cartao, padding: "26px 30px 30px", textAlign: "center" }}>
        <div style={{ display: "inline-block", background: VERM, color: "#fff", fontFamily: theme.fonts.display, fontSize: 56, padding: "6px 26px 0", borderRadius: 12, transform: `rotate(${theme.inclinacao}deg)` }}>
          BLACK FRIDAY
        </div>
        <div style={{ fontFamily: theme.fonts.apoio, fontWeight: 800, fontSize: 44, color: MAR, marginTop: 16 }}>1º MÊS POR</div>
        <div style={{ fontFamily: theme.fonts.display, fontSize: 210, lineHeight: 0.95, color: VERM, transform: `scale(${1 + Math.sin(frame / 9) * 0.015})` }}>R$ 100</div>
        <div style={{ display: "inline-block", marginTop: 8, background: MAR, color: "#fff", fontFamily: theme.fonts.apoio, fontWeight: 800, fontSize: 36, padding: "10px 26px", borderRadius: 40 }}>
          SÓ 10 VAGAS
        </div>
      </div>
    </div>
  );
};

const Tempo: React.FC<{ dur: number }> = ({ dur }) => {
  const { style } = useBloco(dur);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // ponteiro gira até "50 min"
  const ang = interpolate(frame, [6, 6 + fps * 1.2], [0, 300], { easing: theme.ease.out, ...clamp });
  return (
    <div style={{ position: "absolute", left: 140, top: 280, width: 800, ...style }}>
      <div style={{ ...cartao, padding: "34px 40px", display: "flex", alignItems: "center", gap: 40 }}>
        <svg width={220} height={220} viewBox="0 0 220 220" style={{ flexShrink: 0 }}>
          <circle cx={110} cy={110} r={96} fill="#fff" stroke={MAR} strokeWidth={12} />
          <path d={`M 110 110 L 110 26 A 84 84 0 ${ang > 180 ? 1 : 0} 1 ${110 + 84 * Math.sin((ang * Math.PI) / 180)} ${110 - 84 * Math.cos((ang * Math.PI) / 180)} Z`} fill={VERM} opacity={0.85} />
          <line x1={110} y1={110} x2={110 + 70 * Math.sin((ang * Math.PI) / 180)} y2={110 - 70 * Math.cos((ang * Math.PI) / 180)} stroke={MAR} strokeWidth={10} strokeLinecap="round" />
          <circle cx={110} cy={110} r={12} fill={MAR} />
        </svg>
        <div>
          <div style={{ fontFamily: theme.fonts.display, fontSize: 130, lineHeight: 0.95, color: VERM }}>40 A 50</div>
          <div style={{ fontFamily: theme.fonts.display, fontSize: 84, lineHeight: 1, color: MAR }}>MINUTOS</div>
          <div style={{ fontFamily: theme.fonts.apoio, fontWeight: 800, fontSize: 34, color: MAR, marginTop: 6 }}>por treino</div>
        </div>
      </div>
    </div>
  );
};

const Comunidade: React.FC<{ dur: number }> = ({ dur }) => {
  const { style } = useBloco(dur);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const peles = ["#F2C6A0", "#8D5A3B", "#C98E62", "#E8B48A", "#A86F48", "#F0C9A8"];
  return (
    <div style={{ position: "absolute", left: 140, top: 300, width: 800, ...style }}>
      <div style={{ ...cartao, padding: "34px 30px", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 18 }}>
          {peles.map((p, i) => {
            const s = spring({ frame: frame - 6 - i * 4, fps, config: theme.spring.bouncy });
            return (
              <div key={i} style={{ position: "relative", transform: `scale(${s})` }}>
                <div style={{ width: 90, height: 90, borderRadius: "50%", background: p, border: `5px solid ${i % 2 ? MAR : VERM}` }} />
                <div style={{ position: "absolute", right: -6, bottom: -6, width: 38, height: 38, borderRadius: "50%", background: VERM, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width={22} height={22} viewBox="0 0 22 22">
                    <path d="M4 11 L9 16 L18 6" stroke="#fff" strokeWidth={4} fill="none" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ fontFamily: theme.fonts.display, fontSize: 74, color: MAR, marginTop: 26, lineHeight: 1 }}>
          UMA <span style={{ color: VERM }}>COMUNIDADE</span>
        </div>
        <div style={{ fontFamily: theme.fonts.apoio, fontWeight: 800, fontSize: 36, color: MAR, marginTop: 8 }}>de quem alcança o objetivo</div>
      </div>
    </div>
  );
};

const Cuidado: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = interpolate(frame, [dur - 8, dur], [0, 1], clamp);
  const itens = ["Anamnese de entrada", "Avaliação por fotos", "Check-in toda sexta", "Treino novo a cada 30 dias"];
  return (
    <div style={{ position: "absolute", left: 120, top: 260, display: "flex", flexDirection: "column", gap: 18, opacity: 1 - s }}>
      {itens.map((t, i) => {
        const p = spring({ frame: frame - i * 9, fps, config: theme.spring.snappy });
        return (
          <div key={t} style={{ ...cartao, border: `4px solid ${MAR}`, display: "flex", alignItems: "center", gap: 22, padding: "18px 30px", width: 840, opacity: p, transform: `translateX(${(1 - p) * -120}px)` }}>
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: VERM, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width={28} height={28} viewBox="0 0 22 22">
                <path d="M4 11 L9 16 L18 6" stroke="#fff" strokeWidth={4} fill="none" strokeLinecap="round" />
              </svg>
            </div>
            <div style={{ fontFamily: theme.fonts.apoio, fontWeight: 800, fontSize: 42, color: MAR, whiteSpace: "nowrap" }}>{t}</div>
          </div>
        );
      })}
    </div>
  );
};

const Planos: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = interpolate(frame, [dur - 8, dur], [0, 1], clamp);
  const planos = [
    { nome: "SEMESTRAL", bonus: "+1 MÊS", de: 0 },
    { nome: "ANUAL", bonus: "+2 MESES", de: (T.anual - T.semestral) * fps, destaque: true },
  ];
  return (
    <div style={{ position: "absolute", left: 90, top: 300, display: "flex", gap: 40, opacity: 1 - s, perspective: 1400 }}>
      {planos.map((pl) => {
        const p = spring({ frame: frame - pl.de, fps, config: { damping: 14, stiffness: 110, mass: 0.9 } });
        return (
          <div
            key={pl.nome}
            style={{
              ...cartao,
              width: 430,
              padding: "30px 20px",
              textAlign: "center",
              background: pl.destaque ? VERM : "#fff",
              border: `5px solid ${pl.destaque ? VERM : MAR}`,
              opacity: p,
              transform: `rotateY(${interpolate(p, [0, 1], [-90, 0])}deg)`,
            }}
          >
            <div style={{ fontFamily: theme.fonts.apoio, fontWeight: 800, fontSize: 40, color: pl.destaque ? "#fff" : MAR, letterSpacing: "0.08em" }}>{pl.nome}</div>
            <div style={{ fontFamily: theme.fonts.display, fontSize: 130, lineHeight: 1, color: pl.destaque ? "#fff" : VERM, marginTop: 10 }}>{pl.bonus}</div>
            <div style={{ fontFamily: theme.fonts.apoio, fontWeight: 800, fontSize: 32, color: pl.destaque ? "#fff" : MAR, marginTop: 4 }}>de bônus</div>
          </div>
        );
      })}
    </div>
  );
};

const Confete: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const cores = [VERM, theme.colors.azul, MAR, "#FFC857"];
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {Array.from({ length: 36 }).map((_, i) => {
        const y = -60 + t * (520 + ((i * 53) % 300)) - ((i * 71) % 400);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: ((i * 137) % 1000) + 40 + Math.sin(t * 3 + i) * 30,
              top: y,
              width: 18,
              height: 30,
              borderRadius: 4,
              background: cores[i % 4],
              transform: `rotate(${t * (200 + i * 13)}deg)`,
              opacity: y > 1500 ? 0 : 0.9,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

const Mascote: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - 14, fps, config: theme.spring.bouncy });
  const fala = falando("felipe", frame / fps + T.cta);
  return (
    <div style={{ position: "absolute", left: 770, top: 1320, opacity: p, transform: `translateY(${interpolate(p, [0, 1], [300, 0])}px) scale(0.84)`, transformOrigin: "0 0" }}>
      <Personagem v={ELENCO.felipe} expressao={boca("confiante", fala, frame)} bracoEsq={128} bracoDir={-14} apontaEsq />
    </div>
  );
};

const Validade: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - 22, fps, config: theme.spring.smooth });
  return (
    <div style={{ position: "absolute", left: 70, top: 1390, width: 660, display: "flex", justifyContent: "center", opacity: p, transform: `translateY(${(1 - p) * 20}px)` }}>
      <div style={{ background: "#fff", color: MAR, fontFamily: theme.fonts.apoio, fontWeight: 800, fontSize: 36, padding: "14px 28px", borderRadius: 40, border: `4px solid ${VERM}` }}>
        Até 30/11 · só 10 vagas
      </div>
    </div>
  );
};

export const BlackFelipe: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const [handle] = useState(() => delayRender("fontes"));
  useEffect(() => {
    fontesProntas.then(() => continueRender(handle));
  }, [handle]);
  const f = (s: number) => Math.round(s * fps);
  const mola = (s: number) => spring({ frame: frame - f(s), fps, config: theme.spring.smooth });
  const anaX = interpolate(mola(T.biaEntra), [0, 1], [200, 20]);
  const biaX = interpolate(mola(T.biaEntra), [0, 1], [1200, 730]);
  const carolX = interpolate(mola(T.carolEntra), [0, 1], [1250, 375]);
  const comemora = frame >= f(F.ana_3.inicio);
  const pulo = (fase: number) => (comemora ? -Math.abs(Math.sin(((frame - f(F.ana_3.inicio)) / fps) * Math.PI * 2.2 + fase)) * 60 : 0);
  const saida = interpolate(frame, [f(T.cta), f(T.cta) + 12], [0, 1150], { easing: theme.ease.in, ...clamp });
  const anaExpr: Expressao = frame < f(F.bia_1.inicio) ? "triste" : frame < f(F.ana_3.inicio) ? "surpresa" : "feliz";
  const bloco = (de: number, ate: number, El: React.FC<{ dur: number }>) => (
    <Sequence from={f(de)} durationInFrames={f(ate) - f(de)} layout="none">
      <El dur={f(ate) - f(de)} />
    </Sequence>
  );

  return (
    <AbsoluteFill>
      <Fundo />
      <div style={{ position: "absolute", inset: 0, transform: `translateY(${saida}px)` }}>
        <Ator v={ELENCO.ana} q="ana" x={anaX} y={pulo(0)} expr={anaExpr} bE={comemora ? 160 : 12} bD={comemora ? -160 : -12} fase={0} />
        {frame >= f(T.carolEntra) - 2 ? <Ator v={ELENCO.carol} q="carol" x={carolX} y={pulo(1.2)} expr="feliz" bE={comemora ? 150 : 14} bD={comemora ? -150 : -40} fase={11} /> : null}
        {frame >= f(T.biaEntra) - 2 ? (
          <Ator v={ELENCO.bia} q="bia" x={biaX} y={pulo(2.1)} expr="feliz" bE={comemora ? 160 : 14} bD={comemora ? -160 : frame >= f(F.bia_1.inicio) && frame < f(F.bia_1.fim) ? -150 : -14} fase={23} />
        ) : null}
      </div>

      {bloco(T.oferta, F.carol_0.inicio, Oferta)}
      {bloco(T.tempo, F.carol_1.inicio, Tempo)}
      {bloco(T.comunidade, F.bia_2.inicio, Comunidade)}
      {bloco(T.cuidado, F.ana_2.fim, Cuidado)}
      {bloco(T.semestral, T.cta, Planos)}

      {FALAS.filter((fl) => fl.quem !== "felipe").map((fl) => {
        const b = BALAO[fl.quem as Exclude<Quem, "felipe">];
        return (
          <Balao
            key={fl.id}
            texto={fl.texto}
            x={b.x}
            y={b.y}
            largura={b.largura}
            ponta={b.ponta}
            cor={b.cor}
            de={fl.id === "ana_1" ? f(T.gancho) : f(fl.inicio) - 3}
            ate={f(fl.fim) + 8}
          />
        );
      })}
      {FALAS.map((fl) => (
        <Sequence key={"a" + fl.id} from={f(fl.inicio)} layout="none">
          <Audio src={staticFile(`vozes-bf/${fl.id}.mp3`)} />
        </Sequence>
      ))}

      <Sequence from={f(F.ana_3.inicio)} durationInFrames={f(T.cta) - f(F.ana_3.inicio) + 10} layout="none">
        <Confete />
      </Sequence>

      <Sequence durationInFrames={f(T.gancho)} layout="none">
        <Gancho linhas={["BLACK FRIDAY", "COMEÇOU!"]} duracaoFrames={f(T.gancho)} />
      </Sequence>

      <Sequence from={f(T.cta)} layout="none">
        <CTA chamada="ME CHAMA NO DIRECT" palavra="BLACK" />
        <Validade />
        <Mascote />
      </Sequence>

      {(
        [
          [0, "pop", 0.3],
          [1, "whoosh", 0.3],
          [6, "whoosh", 0.3],
          [f(T.biaEntra) - 3, "whoosh", 0.3],
          [f(T.oferta) - 3, "thump", 0.4],
          [f(T.carolEntra) - 3, "whoosh", 0.3],
          [f(T.tempo) - 2, "pop", 0.3],
          [f(T.comunidade) - 2, "pop", 0.3],
          [f(T.cuidado), "blip", 0.15],
          [f(T.cuidado) + 9, "blip", 0.15],
          [f(T.cuidado) + 18, "blip", 0.15],
          [f(T.cuidado) + 27, "blip", 0.15],
          [f(T.semestral) - 2, "pop", 0.3],
          [f(T.anual) - 2, "thump", 0.4],
          [f(F.ana_3.inicio), "brilho", 0.3],
          [f(T.cta) - 2, "whoosh", 0.3],
          [f(T.cta) + 9, "thump", 0.4],
        ] as [number, string, number][]
      ).map(([fr, som, vol], i) => (
        <Sequence key={"s" + i} from={Math.max(0, fr)} durationInFrames={30} layout="none">
          <Audio src={staticFile(`sfx/${som}.wav`)} volume={vol} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
