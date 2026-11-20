import React from "react";
import { theme } from "../theme";

// Bonequinho flat 2D desenhado em SVG (caixa 300×700).
// Braços giram a partir do ombro: 0° = pendurado. Positivo gira o braço esquerdo para fora
// (e o direito para dentro); use negativo no direito para "para fora".

export type Cabelo = "rabo" | "longo" | "coque" | "curto";
export type Expressao = "triste" | "neutra" | "feliz" | "surpresa";

export type Visual = {
  pele: string;
  cabelo: string;
  estiloCabelo: Cabelo;
  blusa: string;
  calca: string;
  tenis: string;
  barba?: boolean;
  logoNaBlusa?: boolean;
};

const Braco: React.FC<{
  x: number;
  y: number;
  angulo: number;
  cor: string;
  pele: string;
  joinha?: boolean;
}> = ({ x, y, angulo, cor, pele, joinha }) => (
  <g transform={`translate(${x} ${y}) rotate(${angulo})`}>
    <line x1={0} y1={0} x2={0} y2={70} stroke={cor} strokeWidth={36} strokeLinecap="round" />
    <line x1={0} y1={60} x2={0} y2={150} stroke={pele} strokeWidth={28} strokeLinecap="round" />
    <circle cx={0} cy={162} r={20} fill={pele} />
    {joinha ? <rect x={-7} y={176} width={14} height={30} rx={7} fill={pele} /> : null}
  </g>
);

const Boca: React.FC<{ e: Expressao }> = ({ e }) => {
  const c = theme.colors.marinho;
  if (e === "feliz")
    return <path d="M 125 132 Q 150 160 175 132 Z" fill="#fff" stroke={c} strokeWidth={5} strokeLinejoin="round" />;
  if (e === "triste")
    return <path d="M 128 145 Q 150 128 172 145" fill="none" stroke={c} strokeWidth={6} strokeLinecap="round" />;
  if (e === "surpresa") return <ellipse cx={150} cy={140} rx={11} ry={14} fill={c} />;
  return <path d="M 132 138 Q 150 146 168 138" fill="none" stroke={c} strokeWidth={6} strokeLinecap="round" />;
};

const CabeloAtras: React.FC<{ v: Visual }> = ({ v }) => {
  if (v.estiloCabelo === "longo")
    return <path d="M 78 100 Q 70 260 92 300 L 208 300 Q 230 260 222 100 Z" fill={v.cabelo} />;
  if (v.estiloCabelo === "rabo")
    return <ellipse cx={232} cy={140} rx={30} ry={70} fill={v.cabelo} transform="rotate(18 232 140)" />;
  if (v.estiloCabelo === "coque") return <circle cx={150} cy={22} r={36} fill={v.cabelo} />;
  return null;
};

const CabeloFrente: React.FC<{ v: Visual }> = ({ v }) => {
  if (v.estiloCabelo === "curto")
    return <path d="M 82 100 Q 84 30 150 28 Q 216 30 218 100 Q 196 64 150 66 Q 104 64 82 100 Z" fill={v.cabelo} />;
  return <path d="M 78 112 Q 76 28 150 26 Q 224 28 222 112 Q 200 58 140 62 Q 100 70 78 112 Z" fill={v.cabelo} />;
};

export const Personagem: React.FC<{
  v: Visual;
  expressao: Expressao;
  bracoEsq?: number;
  bracoDir?: number;
  joinhaDir?: boolean;
  piscar?: boolean;
}> = ({ v, expressao, bracoEsq = 12, bracoDir = -12, joinhaDir, piscar }) => {
  const c = theme.colors.marinho;
  const olhoRy = piscar ? 1.5 : 9;
  return (
    <svg width={300} height={700} viewBox="0 0 300 700" style={{ overflow: "visible" }}>
      {/* sombra no chão */}
      <ellipse cx={150} cy={688} rx={110} ry={14} fill="rgba(36,48,94,0.18)" />
      <CabeloAtras v={v} />
      {/* pernas */}
      <rect x={100} y={420} width={46} height={240} rx={22} fill={v.calca} />
      <rect x={154} y={420} width={46} height={240} rx={22} fill={v.calca} />
      <rect x={88} y={648} width={64} height={30} rx={14} fill={v.tenis} />
      <rect x={148} y={648} width={64} height={30} rx={14} fill={v.tenis} />
      {/* braços atrás do tronco */}
      <Braco x={84} y={222} angulo={bracoEsq} cor={v.blusa} pele={v.pele} />
      <Braco x={216} y={222} angulo={bracoDir} cor={v.blusa} pele={v.pele} joinha={joinhaDir} />
      {/* tronco */}
      <rect x={146} y={176} width={8} height={30} fill={v.pele} />
      <path d="M 82 220 Q 82 196 112 196 L 188 196 Q 218 196 218 220 L 210 440 L 90 440 Z" fill={v.blusa} />
      {v.logoNaBlusa ? (
        <g transform="translate(176 236)">
          <circle r={16} fill={theme.colors.azul} stroke="#fff" strokeWidth={3} />
          <path d="M -7 -2 L -1 6 L 9 -8" fill="none" stroke={theme.colors.vermelho} strokeWidth={4} strokeLinecap="round" />
        </g>
      ) : null}
      {/* cabeça */}
      <circle cx={150} cy={110} r={72} fill={v.pele} />
      {v.barba ? <path d="M 92 118 Q 98 186 150 188 Q 202 186 208 118 Q 196 160 150 162 Q 104 160 92 118 Z" fill={v.cabelo} opacity={0.85} /> : null}
      <CabeloFrente v={v} />
      {/* rosto */}
      <ellipse cx={124} cy={106} rx={8} ry={olhoRy} fill={c} />
      <ellipse cx={176} cy={106} rx={8} ry={olhoRy} fill={c} />
      {expressao === "triste" ? (
        <>
          <path d="M 110 84 L 136 90" stroke={c} strokeWidth={5} strokeLinecap="round" />
          <path d="M 190 84 L 164 90" stroke={c} strokeWidth={5} strokeLinecap="round" />
        </>
      ) : null}
      <circle cx={108} cy={130} r={10} fill="#E8343A" opacity={0.18} />
      <circle cx={192} cy={130} r={10} fill="#E8343A" opacity={0.18} />
      <Boca e={expressao} />
    </svg>
  );
};

// Elenco
export const ELENCO = {
  ana: {
    pele: "#F2C6A0",
    cabelo: "#5A3A26",
    estiloCabelo: "rabo",
    blusa: "#A3ABBD",
    calca: "#5C6478",
    tenis: "#FFFFFF",
  },
  bia: {
    pele: "#C98E62",
    cabelo: "#1E1410",
    estiloCabelo: "longo",
    blusa: theme.colors.vermelho,
    calca: theme.colors.marinho,
    tenis: "#FFFFFF",
  },
  carol: {
    pele: "#8D5A3B",
    cabelo: "#20140E",
    estiloCabelo: "coque",
    blusa: theme.colors.azul,
    calca: theme.colors.marinho,
    tenis: "#FFFFFF",
  },
  felipe: {
    pele: "#E8B48A",
    cabelo: "#2A1C14",
    estiloCabelo: "curto",
    blusa: theme.colors.marinho,
    calca: "#1B2238",
    tenis: "#FFFFFF",
    barba: true,
    logoNaBlusa: true,
  },
} satisfies Record<string, Visual>;
