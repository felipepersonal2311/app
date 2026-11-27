import React, { useEffect, useState } from "react";
import {
  AbsoluteFill,
  Audio,
  continueRender,
  delayRender,
  Img,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Balao } from "../explicativo/Balao";
import { Expressao, Personagem, Visual } from "../explicativo/Personagem";
import { clamp, theme } from "../theme";
import { C, fontes, ouroTexto, SANS, SERIF } from "./KaFitness";
import dur from "./vozes.json";

// Diálogo animado Ká Fitness — Black Friday. Camila (dona) e Lari (funcionária) na loja;
// uma cliente entra no final. Linha do tempo calculada a partir da duração das vozes.
type Quem = "lari" | "camila" | "cliente";
const GAP = 0.3;
const seqFalas: { id: keyof typeof dur; quem: Quem; texto: string; antes?: number }[] = [
  { id: "lari_1", quem: "lari", texto: "Camila, o povo tá perguntando se a Ká vai ter *Black Friday*!", antes: 0.5 },
  { id: "camila_1", quem: "camila", texto: "Vai sim! É a nossa *primeira Black Friday*!" },
  { id: "lari_2", quem: "lari", texto: "E qual é o *desconto*?" },
  { id: "camila_2", quem: "camila", texto: "Quanto mais peças, *maior o desconto*!" },
  { id: "lari_3", quem: "lari", texto: "Até nos *conjuntos* e nos *shorts duplos*?" },
  { id: "camila_3", quem: "camila", texto: "*Em tudo!*" },
  { id: "cliente_1", quem: "cliente", texto: "Então eu quero *três*!", antes: 0.4 },
];
let t = 0;
const FALAS = seqFalas.map((f, i) => {
  const inicio = i === 0 ? (f.antes ?? 0) : t + (f.antes ?? GAP);
  const fim = inicio + dur[f.id];
  t = fim;
  return { ...f, inicio, fim };
});
const F = Object.fromEntries(FALAS.map((f) => [f.id, f])) as Record<keyof typeof dur, (typeof FALAS)[number]>;
const T = {
  gancho: 3.2,
  tiers: [F.camila_2.inicio + 2.6, F.camila_2.inicio + 4.8, F.camila_2.inicio + 6.8],
  fotos: F.lari_3.inicio,
  clienteEntra: F.camila_3.inicio + 0.2,
  cta: F.cliente_1.fim + 0.4,
};
export const KA_DIALOGO_DURACAO = Math.ceil((T.cta + 4.2) * 30);

const ELENCO: Record<Quem, Visual> = {
  camila: {
    pele: "#E6B48E",
    cabelo: "#5B3B27",
    mechas: "#B98C5E",
    estiloCabelo: "longo",
    blusa: "#16161B",
    calca: "#16161B",
    shorts: "#F3E6D6",
    tenis: "#FFFFFF",
  },
  lari: {
    pele: "#C98E62",
    cabelo: "#2A1A12",
    estiloCabelo: "rabo",
    blusa: C.marrom2,
    calca: "#EADBC8",
    tenis: "#FFFFFF",
  },
  cliente: {
    pele: "#8D5A3B",
    cabelo: "#20140E",
    estiloCabelo: "coque",
    blusa: "#2B3A7A",
    calca: "#2B3A7A",
    shorts: "#2B3A7A",
    tenis: "#FFFFFF",
  },
};
const COR_BALAO: Record<Quem, string> = { camila: C.marrom, lari: C.marrom2, cliente: "#2B3A7A" };
const BALAO: Record<Quem, { x: number; y: number; largura: number; ponta: number }> = {
  lari: { x: 40, y: 790, largura: 660, ponta: 0.25 },
  camila: { x: 360, y: 790, largura: 680, ponta: 0.8 },
  cliente: { x: 190, y: 790, largura: 700, ponta: 0.5 },
};
const ESC = 1.05;
const TOPO = 1050;

const falando = (q: Quem, s: number) => FALAS.some((f) => f.quem === q && s >= f.inicio && s <= f.fim);
const boca = (base: Expressao, fala: boolean, frame: number): Expressao => {
  if (!fala) return base;
  return (frame % 7 < 3) !== (frame % 23 < 2) ? "feliz" : "neutra";
};

const Ator: React.FC<{ q: Quem; x: number; y?: number; bE?: number; bD?: number; fase: number }> = ({ q, x, y = 0, bE = 12, bD = -12, fase }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const respiro = Math.sin(((frame + fase) / fps) * Math.PI * 0.9) * 0.012;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: TOPO + y,
        transform: `scale(${ESC}) scaleY(${1 + respiro})`,
        transformOrigin: "0 0",
      }}
    >
      <Personagem
        v={ELENCO[q]}
        expressao={boca("feliz", falando(q, frame / fps), frame)}
        piscar={(frame + fase * 7) % 96 < 4}
        bracoEsq={bE}
        bracoDir={bD}
      />
    </div>
  );
};

// Loja ao fundo: parede bege, letreiro, arara com peças e chão
const Loja: React.FC = () => {
  const frame = useCurrentFrame();
  const x = interpolate(frame, [0, KA_DIALOGO_DURACAO], [-40, 140]);
  const pecas = ["#16161B", "#F1E6C8", "#2B3A7A", C.marrom2];
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${C.creme} 0%, ${C.bege} 70%)` }}>
      <AbsoluteFill style={{ background: `linear-gradient(115deg, transparent ${x - 30}%, rgba(255,255,255,0.3) ${x}%, transparent ${x + 25}%)` }} />
      {/* arara */}
      <div style={{ position: "absolute", left: 390, top: 960, width: 300, height: 8, background: C.ouro, borderRadius: 4 }} />
      <div style={{ position: "absolute", left: 398, top: 960, width: 8, height: 760, background: C.ouro }} />
      <div style={{ position: "absolute", left: 674, top: 960, width: 8, height: 760, background: C.ouro }} />
      {pecas.map((cor, i) => {
        const bal = Math.sin(frame / 20 + i) * 1.5;
        return (
          <div key={i} style={{ position: "absolute", left: 412 + i * 66, top: 960, transform: `rotate(${bal}deg)`, transformOrigin: "30px 0" }}>
            <div style={{ width: 4, height: 26, background: "#8A6A44", marginLeft: 28 }} />
            <div style={{ width: 62, height: 150 + (i % 3) * 30, background: cor, borderRadius: "14px 14px 8px 8px", boxShadow: "0 8px 14px rgba(74,35,15,0.18)" }} />
          </div>
        );
      })}
      {/* chão */}
      <div style={{ position: "absolute", left: 0, right: 0, top: TOPO + 615 * ESC, bottom: 0, background: "linear-gradient(180deg, #D9BC9F 0%, #E8D2BC 100%)" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 62%, rgba(74,35,15,0.16) 100%)" }} />
    </AbsoluteFill>
  );
};

const Gancho: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = spring({ frame, fps, config: { damping: 15, stiffness: 120, mass: 0.9 } });
  const b = spring({ frame: frame - 8, fps, config: { damping: 15, stiffness: 120, mass: 0.9 } });
  const sai = interpolate(frame, [T.gancho * fps - 8, T.gancho * fps], [0, 1], { easing: theme.ease.in, ...clamp });
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 300, textAlign: "center", perspective: 1200, opacity: 1 - sai }}>
      <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 44, letterSpacing: "0.3em", color: C.marrom2, opacity: a, transform: `rotateX(${(1 - a) * -90}deg)` }}>
        A KÁ FITNESS
      </div>
      <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 132, lineHeight: 1.05, marginTop: 10, opacity: b, transform: `rotateX(${(1 - b) * 90}deg)`, filter: "drop-shadow(0 12px 18px rgba(74,35,15,0.3))", ...ouroTexto }}>
        entrou na Black!
      </div>
    </div>
  );
};

const Tiers: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sai = interpolate(frame, [(T.fotos - T.tiers[0] + 0.3) * fps - 8, (T.fotos - T.tiers[0] + 0.3) * fps], [0, 1], clamp);
  const niveis = [
    { pct: "5%", qtd: "1 PEÇA" },
    { pct: "10%", qtd: "2 PEÇAS" },
    { pct: "15%", qtd: "3 OU MAIS", destaque: true },
  ];
  return (
    <div style={{ position: "absolute", left: 140, top: 250, display: "flex", flexDirection: "column", gap: 20, perspective: 1400, opacity: 1 - sai }}>
      {niveis.map((n, i) => {
        const de = (T.tiers[i] - T.tiers[0]) * fps;
        const p = spring({ frame: frame - de, fps, config: { damping: 14, stiffness: 110, mass: 0.9 } });
        return (
          <div
            key={n.pct}
            style={{
              width: 800,
              height: 150,
              borderRadius: 30,
              display: "flex",
              alignItems: "center",
              padding: "0 44px",
              gap: 30,
              background: n.destaque ? `linear-gradient(135deg, ${C.marrom2}, ${C.marrom})` : "rgba(255,248,241,0.9)",
              border: n.destaque ? `3px solid ${C.ouro}` : "2px solid rgba(201,151,79,0.5)",
              boxShadow: "0 18px 36px rgba(74,35,15,0.25)",
              opacity: p,
              transform: `rotateY(${interpolate(p, [0, 1], [-90, 0])}deg)`,
            }}
          >
            <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 96, lineHeight: 1, width: 300, ...(n.destaque ? ouroTexto : { color: C.marrom }) }}>
              {n.pct}
              <span style={{ fontSize: 44, marginLeft: 6 }}>OFF</span>
            </div>
            <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 42, color: n.destaque ? C.creme : C.marrom }}>{n.qtd}</div>
          </div>
        );
      })}
    </div>
  );
};

const Fotos: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sai = interpolate(frame, [(T.cta - T.fotos) * fps - 8, (T.cta - T.fotos) * fps], [0, 1], clamp);
  const cards = [
    { src: "ka/modelo-preto.jpg", x: 150, y: 240, rot: -6, ry: 16, w: 360, h: 500 },
    { src: "ka/shorts-flat.jpg", x: 560, y: 280, rot: 5, ry: -16, w: 380, h: 420 },
  ];
  return (
    <div style={{ position: "absolute", inset: 0, perspective: 1500, opacity: 1 - sai }}>
      {cards.map((c, i) => {
        const p = spring({ frame: frame - i * 6, fps, config: theme.spring.bouncy });
        return (
          <div
            key={c.src}
            style={{
              position: "absolute",
              left: c.x,
              top: c.y,
              width: c.w,
              height: c.h,
              borderRadius: 26,
              overflow: "hidden",
              border: `8px solid ${C.creme}`,
              boxShadow: "0 26px 50px rgba(74,35,15,0.35)",
              opacity: p,
              transform: `rotateY(${c.ry}deg) rotateZ(${c.rot}deg) translateY(${(1 - p) * 80}px) scale(${interpolate(p, [0, 1], [0.7, 1])})`,
            }}
          >
            <Img src={staticFile(c.src)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        );
      })}
    </div>
  );
};

const CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = (d: number) => spring({ frame: frame - d, fps, config: theme.spring.smooth });
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 260, display: "flex", flexDirection: "column", alignItems: "center", perspective: 1400 }}>
      <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 48, letterSpacing: "0.16em", color: C.marrom2, opacity: p(0) }}>SÓ HOJE E AMANHÃ</div>
      <div
        style={{
          marginTop: 18,
          padding: "14px 56px 22px",
          borderRadius: 120,
          background: `linear-gradient(135deg, ${C.marrom2}, ${C.marrom})`,
          border: `3px solid ${C.ouro}`,
          boxShadow: "0 24px 46px rgba(74,35,15,0.4)",
          opacity: p(5),
          transform: `rotateX(${interpolate(p(5), [0, 1], [80, 0])}deg) scale(${1 + Math.sin(frame / 10) * 0.012})`,
        }}
      >
        <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 140, lineHeight: 1, ...ouroTexto }}>27 e 28</span>
      </div>
      <div style={{ marginTop: 34, fontFamily: SANS, fontWeight: 800, fontSize: 58, color: C.marrom, opacity: p(12), transform: `translateY(${(1 - p(12)) * 20}px)` }}>
        @kafitness.br
      </div>
    </div>
  );
};

export const KaDialogo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const [handle] = useState(() => delayRender("fontes"));
  useEffect(() => {
    fontes.then(() => continueRender(handle));
  }, [handle]);
  const f = (s: number) => Math.round(s * fps);
  const mola = (s: number) => spring({ frame: frame - f(s), fps, config: theme.spring.smooth });
  const clienteX = interpolate(mola(T.clienteEntra), [0, 1], [1200, 380]);
  const comemora = frame >= f(F.cliente_1.inicio);
  const pulo = (fase: number) => (comemora ? -Math.abs(Math.sin(((frame - f(F.cliente_1.inicio)) / fps) * Math.PI * 2 + fase)) * 50 : 0);
  // Camila aponta para os descontos/fotos quando fala deles
  const camilaAponta = frame >= f(F.camila_2.inicio) && frame < f(F.lari_3.inicio);

  return (
    <AbsoluteFill style={{ fontVariantNumeric: "lining-nums", fontFeatureSettings: '"lnum" 1' }}>
      <Loja />

      <Ator q="lari" x={40} y={pulo(0)} fase={0} bE={comemora ? 160 : 12} bD={comemora ? -160 : -30} />
      <Ator q="camila" x={720} y={pulo(1.1)} fase={13} bE={comemora ? 160 : camilaAponta ? 150 : 14} bD={comemora ? -160 : -14} />
      {frame >= f(T.clienteEntra) - 2 ? <Ator q="cliente" x={clienteX} y={pulo(2.2)} fase={27} bE={comemora ? 155 : 14} bD={comemora ? -155 : -14} /> : null}

      <Sequence durationInFrames={f(T.gancho)} layout="none">
        <Gancho />
      </Sequence>
      <Sequence from={f(T.tiers[0])} durationInFrames={f(T.fotos + 0.3 - T.tiers[0])} layout="none">
        <Tiers />
      </Sequence>
      <Sequence from={f(T.fotos)} durationInFrames={f(T.cta - T.fotos)} layout="none">
        <Fotos />
      </Sequence>
      <Sequence from={f(T.cta)} layout="none">
        <CTA />
      </Sequence>

      {FALAS.map((fl) => (
        <React.Fragment key={fl.id}>
          <Balao
            texto={fl.texto}
            {...BALAO[fl.quem]}
            de={Math.max(f(fl.inicio) - 3, fl.id === "lari_1" ? f(T.gancho) : 0)}
            ate={f(fl.fim) + 8}
            cor={COR_BALAO[fl.quem]}
            corDestaque="#A8722F"
          />
          <Sequence from={f(fl.inicio)} layout="none">
            <Audio src={staticFile(`vozes-ka/${fl.id}.mp3`)} />
          </Sequence>
        </React.Fragment>
      ))}

      {(
        [
          [0, "whoosh", 0.3],
          [8, "whoosh", 0.3],
          [f(T.tiers[0]) - 2, "pop", 0.3],
          [f(T.tiers[1]) - 2, "pop", 0.3],
          [f(T.tiers[2]) - 2, "thump", 0.35],
          [f(T.fotos) - 3, "whoosh", 0.3],
          [f(T.clienteEntra) - 3, "whoosh", 0.3],
          [f(F.cliente_1.inicio) + 2, "brilho", 0.3],
          [f(T.cta) - 2, "whoosh", 0.3],
          [f(T.cta) + 5, "thump", 0.35],
        ] as [number, string, number][]
      ).map(([fr, som, vol], i) => (
        <Sequence key={i} from={fr} durationInFrames={30} layout="none">
          <Audio src={staticFile(`sfx/${som}.wav`)} volume={vol} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
