import { loadFont } from "@remotion/fonts";
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
import { clamp, theme } from "../theme";

// Promo Black Friday — Ká Fitness (loja parceira). Identidade: bege, marrom e dourado,
// serifada elegante. Movimento 3D com perspectiva CSS (carrossel, cartões virando).
export const C = {
  creme: "#F6E6D6",
  bege: "#E9CDB3",
  marrom: "#4A230F",
  marrom2: "#7A4424",
  ouro: "#C9974F",
  ouroClaro: "#EBC47E",
};
export const SERIF = "Playfair Display";
export const SANS = "Montserrat";

export const fontes = Promise.all([
  loadFont({ family: SERIF, url: staticFile("fonts/Playfair-700.woff"), weight: "700" }),
  loadFont({ family: SERIF, url: staticFile("fonts/Playfair-700i.woff"), weight: "700", style: "italic" }),
  loadFont({ family: SANS, url: staticFile("fonts/Montserrat-800.woff"), weight: "800" }),
  loadFont({ family: SANS, url: staticFile("fonts/Montserrat-400.woff"), weight: "400" }),
]);

export const KA_DURACAO = 540; // 18 s a 30 fps
const CENAS = { abertura: [0, 80], carrossel: [72, 230], descontos: [222, 350], detalhes: [342, 456], fecho: [448, 540] };

// [frame, som, volume] — discretos, para a música do Instagram ficar por cima
const SONS: [number, string, number][] = [
  [0, "pop", 0.3], [16, "whoosh", 0.35], [24, "whoosh", 0.3],
  [70, "whoosh", 0.35], [92, "whoosh", 0.2], [140, "whoosh", 0.2],
  [220, "whoosh", 0.35], [234, "pop", 0.25], [243, "pop", 0.25], [252, "thump", 0.35],
  [340, "whoosh", 0.35], [364, "blip", 0.15], [371, "blip", 0.15], [378, "blip", 0.15],
  [446, "whoosh", 0.35], [456, "thump", 0.4], [466, "brilho", 0.3],
];

export const ouroTexto: React.CSSProperties = {
  background: `linear-gradient(180deg, ${C.ouroClaro} 0%, ${C.ouro} 55%, #9C6B2E 100%)`,
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
};

// Entrada/saída de cada cena (opacidade + leve zoom), saída mais rápida
const useCena = (dur: number) => {
  const frame = useCurrentFrame();
  const ent = interpolate(frame, [0, 10], [0, 1], { easing: theme.ease.out, ...clamp });
  const sai = interpolate(frame, [dur - 8, dur], [0, 1], { easing: theme.ease.in, ...clamp });
  return { opacity: ent * (1 - sai), transform: `scale(${1 + sai * 0.06})` } as React.CSSProperties;
};

const Fundo: React.FC = () => {
  const frame = useCurrentFrame();
  const x = interpolate(frame, [0, KA_DURACAO], [-60, 160]);
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 35%, ${C.creme} 0%, ${C.bege} 75%, #DDB999 100%)` }}>
      {/* brilho de cetim passando */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(115deg, transparent ${x - 30}%, rgba(255,255,255,0.35) ${x}%, transparent ${x + 25}%)`,
        }}
      />
      {/* fios dourados */}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: 0.55 }}>
        <path d={`M -50 ${520 + Math.sin(frame / 40) * 20} Q 400 300 1130 ${120 + Math.cos(frame / 50) * 20}`} stroke={C.ouro} strokeWidth={2.5} fill="none" />
        <path d={`M -50 ${1780 + Math.cos(frame / 45) * 20} Q 640 1560 1130 ${1420 + Math.sin(frame / 38) * 20}`} stroke={C.ouro} strokeWidth={2.5} fill="none" />
      </svg>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 60%, rgba(74,35,15,0.18) 100%)" }} />
    </AbsoluteFill>
  );
};

const Marca: React.FC<{ escala?: number }> = ({ escala = 1 }) => (
  <div style={{ textAlign: "center", color: C.marrom }}>
    <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 170 * escala, lineHeight: 1, letterSpacing: "0.04em" }}>KÁ</div>
    <div style={{ fontFamily: SANS, fontWeight: 400, fontSize: 34 * escala, letterSpacing: "0.55em", marginTop: 6 * escala, paddingLeft: "0.55em" }}>
      FITNESS
    </div>
  </div>
);

// 1) Abertura: marca + BLACK FRIDAY virando em 3D
const Abertura: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const m = spring({ frame, fps, config: theme.spring.smooth });
  const b = spring({ frame: frame - 18, fps, config: { damping: 15, stiffness: 120, mass: 0.9 } });
  const f = spring({ frame: frame - 26, fps, config: { damping: 15, stiffness: 120, mass: 0.9 } });
  const giro = Math.sin(frame / 22) * 4;
  return (
    <AbsoluteFill style={{ ...useCena(dur), alignItems: "center", justifyContent: "center", perspective: 1400 }}>
      <div style={{ opacity: m, transform: `translateY(${interpolate(m, [0, 1], [40, 0])}px)`, marginBottom: 60 }}>
        <Marca />
      </div>
      <div style={{ transformStyle: "preserve-3d", transform: `rotateY(${giro}deg)` }}>
        <div
          style={{
            fontFamily: SERIF,
            fontWeight: 700,
            fontSize: 210,
            lineHeight: 0.95,
            color: C.marrom,
            textAlign: "center",
            opacity: b,
            transform: `rotateX(${interpolate(b, [0, 1], [-95, 0])}deg) translateZ(40px)`,
            textShadow: "0 18px 30px rgba(74,35,15,0.25)",
          }}
        >
          BLACK
        </div>
        <div
          style={{
            fontFamily: SERIF,
            fontWeight: 700,
            fontSize: 210,
            lineHeight: 0.95,
            textAlign: "center",
            opacity: f,
            transform: `rotateX(${interpolate(f, [0, 1], [95, 0])}deg) translateZ(40px)`,
            ...ouroTexto,
            filter: "drop-shadow(0 14px 22px rgba(74,35,15,0.3))",
          }}
        >
          FRIDAY
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Cartao: React.FC<{ src: string; w: number; h: number; style?: React.CSSProperties; zoom?: number }> = ({ src, w, h, style, zoom = 1 }) => (
  <div
    style={{
      width: w,
      height: h,
      borderRadius: 30,
      overflow: "hidden",
      border: `8px solid ${C.creme}`,
      boxShadow: "0 30px 60px rgba(74,35,15,0.35)",
      background: C.bege,
      ...style,
    }}
  >
    <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${zoom})` }} />
  </div>
);

// 2) Carrossel 3D com as fotos da modelo
const Carrossel: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const fotos = ["ka/modelo-preto.jpg", "ka/modelo-creme.jpg", "ka/modelo-marinho.jpg"];
  const ang = interpolate(frame, [0, 22, 48, 70, 96, 118, 144], [-60, 0, 0, -120, -120, -240, -240], {
    easing: theme.ease.inOut,
    ...clamp,
  });
  const t = interpolate(frame, [6, 24], [0, 1], { easing: theme.ease.out, ...clamp });
  return (
    <AbsoluteFill style={{ ...useCena(dur), alignItems: "center" }}>
      <div style={{ marginTop: 250, opacity: t, transform: `translateY(${(1 - t) * 30}px)`, textAlign: "center" }}>
        <div style={{ fontFamily: SANS, fontWeight: 400, fontSize: 34, letterSpacing: "0.4em", color: C.marrom2 }}>NOSSA PRIMEIRA</div>
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 700, fontSize: 86, color: C.marrom, marginTop: 6 }}>
          Black Friday
        </div>
      </div>
      <div style={{ position: "absolute", top: 560, left: 0, right: 0, height: 900, perspective: 1700 }}>
        <div style={{ position: "absolute", left: 540, top: 450, transformStyle: "preserve-3d", transform: `rotateY(${ang}deg)` }}>
          {fotos.map((src, i) => {
            const rel = (((i * 120 + ang) % 360) + 360) % 360; // 0 = de frente
            const frente = Math.cos((rel * Math.PI) / 180);
            return (
              <div
                key={src}
                style={{
                  position: "absolute",
                  left: -240,
                  top: -390,
                  transform: `rotateY(${i * 120}deg) translateZ(330px)`,
                  opacity: 0.45 + 0.55 * Math.max(0, frente),
                  filter: `brightness(${0.75 + 0.25 * Math.max(0, frente)})`,
                }}
              >
                <Cartao src={src} w={480} h={780} />
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// 3) Descontos: cartões virando
const Descontos: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = spring({ frame, fps, config: theme.spring.smooth });
  const niveis = [
    { pct: "5%", desc: "na compra de", qtd: "1 PEÇA" },
    { pct: "10%", desc: "na compra de", qtd: "2 PEÇAS" },
    { pct: "15%", desc: "na compra de", qtd: "3 PEÇAS OU MAIS", destaque: true },
  ];
  return (
    <AbsoluteFill style={{ ...useCena(dur), alignItems: "center", justifyContent: "center", perspective: 1500, paddingBottom: 80 }}>
      <div style={{ textAlign: "center", opacity: t, transform: `translateY(${(1 - t) * 30}px)` }}>
        <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 74, lineHeight: 1.1, color: C.marrom }}>
          Quanto mais peças,
        </div>
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 700, fontSize: 74, lineHeight: 1.1, ...ouroTexto }}>
          maior o desconto
        </div>
      </div>
      <div style={{ marginTop: 70, display: "flex", flexDirection: "column", gap: 34, transformStyle: "preserve-3d" }}>
        {niveis.map((n, i) => {
          const p = spring({ frame: frame - 14 - i * 9, fps, config: { damping: 14, stiffness: 110, mass: 0.9 } });
          const brilho = n.destaque ? 1 + Math.sin(frame / 8) * 0.015 : 1;
          return (
            <div
              key={n.pct}
              style={{
                width: 860,
                height: 210,
                borderRadius: 34,
                display: "flex",
                alignItems: "center",
                padding: "0 50px",
                gap: 36,
                background: n.destaque ? `linear-gradient(135deg, ${C.marrom2}, ${C.marrom})` : "rgba(255,248,241,0.75)",
                border: n.destaque ? `3px solid ${C.ouro}` : "2px solid rgba(201,151,79,0.45)",
                boxShadow: n.destaque ? "0 26px 50px rgba(74,35,15,0.45)" : "0 16px 34px rgba(74,35,15,0.16)",
                opacity: p,
                transform: `rotateY(${interpolate(p, [0, 1], [-90, 0])}deg) translateZ(${interpolate(p, [0, 1], [-200, 0])}px) scale(${brilho})`,
              }}
            >
              <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 118, lineHeight: 1, width: 300, ...(n.destaque ? ouroTexto : { color: C.marrom }) }}>
                {n.pct}
                <span style={{ fontSize: 52, marginLeft: 8 }}>OFF</span>
              </div>
              <div style={{ width: 3, height: 110, background: n.destaque ? C.ouro : "rgba(122,68,36,0.35)" }} />
              <div style={{ color: n.destaque ? C.creme : C.marrom }}>
                <div style={{ fontFamily: SANS, fontWeight: 400, fontSize: 32 }}>{n.desc}</div>
                <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 44, lineHeight: 1.1 }}>{n.qtd}</div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// 4) Detalhes: fotos de produto inclinadas em 3D com paralaxe
const Detalhes: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = spring({ frame: frame - 2, fps, config: theme.spring.smooth });
  const b = spring({ frame: frame - 10, fps, config: theme.spring.smooth });
  const c = spring({ frame: frame - 18, fps, config: theme.spring.smooth });
  const deriva = interpolate(frame, [0, dur], [0, 1]);
  const palavras = ["Conforto", "Qualidade", "Estilo"];
  return (
    <AbsoluteFill style={{ ...useCena(dur), perspective: 1600 }}>
      <div style={{ position: "absolute", left: 70, top: 260, opacity: a, transform: `rotateY(${18 - deriva * 6}deg) rotateZ(-4deg) translateY(${(1 - a) * 80 - deriva * 30}px)` }}>
        <Cartao src="ka/shorts-flat.jpg" w={560} h={600} zoom={1.05 + deriva * 0.06} />
      </div>
      <div style={{ position: "absolute", right: 70, top: 600, opacity: b, transform: `rotateY(${-18 + deriva * 6}deg) rotateZ(4deg) translateY(${(1 - b) * 80 + deriva * 20}px)` }}>
        <Cartao src="ka/detalhe-creme.jpg" w={520} h={480} zoom={1.05 + deriva * 0.05} />
      </div>
      <div style={{ position: "absolute", left: 110, top: 960, opacity: c, transform: `rotateY(${14 - deriva * 5}deg) rotateZ(-3deg) translateY(${(1 - c) * 80 - deriva * 15}px)` }}>
        <Cartao src="ka/regatas-flat.jpg" w={540} h={520} zoom={1.05 + deriva * 0.06} />
      </div>
      <div style={{ position: "absolute", right: 90, top: 1170, textAlign: "right" }}>
        {palavras.map((w, i) => {
          const p = spring({ frame: frame - 24 - i * 7, fps, config: theme.spring.snappy });
          return (
            <div
              key={w}
              style={{
                fontFamily: SERIF,
                fontStyle: "italic",
                fontWeight: 700,
                fontSize: 70,
                lineHeight: 1.18,
                opacity: p,
                transform: `translateX(${(1 - p) * 60}px)`,
                ...(i === 2 ? ouroTexto : { color: C.marrom }),
              }}
            >
              {w}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// 5) Fechamento
const Fecho: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = (d: number) => spring({ frame: frame - d, fps, config: theme.spring.smooth });
  const cena = useCena(dur + 20); // última cena não sai
  const respira = 1 + Math.sin(frame / 10) * 0.012;
  return (
    <AbsoluteFill style={{ ...cena, alignItems: "center", justifyContent: "center", perspective: 1400 }}>
      <div style={{ opacity: p(0), transform: `translateY(${(1 - p(0)) * 30}px)` }}>
        <Marca escala={1} />
      </div>
      <div style={{ marginTop: 70, fontFamily: SANS, fontWeight: 800, fontSize: 54, letterSpacing: "0.16em", color: C.marrom2, opacity: p(6) }}>
        SÓ HOJE E AMANHÃ
      </div>
      <div
        style={{
          marginTop: 22,
          padding: "18px 60px 26px",
          borderRadius: 120,
          background: `linear-gradient(135deg, ${C.marrom2}, ${C.marrom})`,
          border: `3px solid ${C.ouro}`,
          boxShadow: "0 26px 50px rgba(74,35,15,0.4)",
          opacity: p(10),
          transform: `rotateX(${interpolate(p(10), [0, 1], [80, 0])}deg) scale(${respira})`,
        }}
      >
        <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 160, lineHeight: 1, ...ouroTexto }}>27 e 28</span>
      </div>
      <div style={{ marginTop: 70, textAlign: "center", opacity: p(18), transform: `translateY(${(1 - p(18)) * 24}px)` }}>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 62, color: C.marrom }}>@kafitness.br</div>
        <div style={{ fontFamily: SANS, fontWeight: 400, fontSize: 40, color: C.marrom2, marginTop: 12, letterSpacing: "0.06em" }}>
          Cristalina · GO · Chama no direct
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const KaFitness: React.FC = () => {
  const [handle] = useState(() => delayRender("fontes"));
  useEffect(() => {
    fontes.then(() => continueRender(handle));
  }, [handle]);
  const seq = (k: keyof typeof CENAS, El: React.FC<{ dur: number }>) => {
    const [a, b] = CENAS[k];
    return (
      <Sequence from={a} durationInFrames={b - a} layout="none">
        <El dur={b - a} />
      </Sequence>
    );
  };
  return (
    <AbsoluteFill style={{ fontVariantNumeric: "lining-nums", fontFeatureSettings: '"lnum" 1' }}>
      <Fundo />
      {seq("abertura", Abertura)}
      {seq("carrossel", Carrossel)}
      {seq("descontos", Descontos)}
      {seq("detalhes", Detalhes)}
      {seq("fecho", Fecho)}
      {SONS.map(([f, som, vol], i) => (
        <Sequence key={i} from={f} durationInFrames={30} layout="none">
          <Audio src={staticFile(`sfx/${som}.wav`)} volume={vol} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
