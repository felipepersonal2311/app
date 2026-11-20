import React from "react";
import { theme } from "../theme";

// Bonequinho flat 2D desenhado em SVG (caixa 300×700).
// Braços giram a partir do ombro: 0° = pendurado. Positivo gira o braço esquerdo para fora
// (e o direito para dentro); use negativo no direito para "para fora".

export type Cabelo = "rabo" | "longo" | "coque" | "curto" | "topete";
export type Expressao = "triste" | "neutra" | "feliz" | "surpresa" | "confiante";

export type Visual = {
  pele: string;
  cabelo: string;
  estiloCabelo: Cabelo;
  blusa: string;
  calca: string;
  tenis: string;
  barba?: boolean;
  logoNaBlusa?: boolean;
  forte?: boolean; // ombros largos e braços grossos
  tatuagem?: "esq" | "dir"; // antebraço fechado
  brinco?: boolean;
  corrente?: boolean;
  relogio?: string; // cor do relógio (pulso direito)
  sobrancelhaGrossa?: boolean;
};

const Braco: React.FC<{
  x: number;
  y: number;
  angulo: number;
  cor: string;
  pele: string;
  joinha?: boolean;
  forte?: boolean;
  tatuagem?: boolean;
  relogio?: string;
}> = ({ x, y, angulo, cor, pele, joinha, forte, tatuagem, relogio }) => {
  const manga = forte ? 46 : 36;
  const braco = forte ? 36 : 28;
  return (
    <g transform={`translate(${x} ${y}) rotate(${angulo})`}>
      <line x1={0} y1={60} x2={0} y2={150} stroke={pele} strokeWidth={braco} strokeLinecap="round" />
      {forte ? <ellipse cx={0} cy={86} rx={braco / 2 + 4} ry={26} fill={pele} /> : null}
      {tatuagem ? (
        <g stroke="#2A2A33" strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.75}>
          <path d="M -12 104 Q 0 96 12 106" />
          <path d="M -14 118 L -4 112 L 6 124 L 14 116" />
          <path d="M -12 134 Q 0 126 12 136" />
          <circle cx={0} cy={146} r={5} />
        </g>
      ) : null}
      {relogio ? <rect x={-braco / 2 - 2} y={142} width={braco + 4} height={12} rx={5} fill={relogio} stroke="#9AA3B5" strokeWidth={2} /> : null}
      <line x1={0} y1={0} x2={0} y2={64} stroke={cor} strokeWidth={manga} strokeLinecap="round" />
      <circle cx={0} cy={164} r={forte ? 23 : 20} fill={pele} />
      {joinha ? <rect x={-8} y={178} width={16} height={32} rx={8} fill={pele} /> : null}
    </g>
  );
};

const Boca: React.FC<{ e: Expressao; clara?: boolean }> = ({ e, clara }) => {
  const c = clara ? "#F6E3D3" : theme.colors.marinho;
  if (e === "feliz")
    return <path d="M 125 132 Q 150 160 175 132 Z" fill="#fff" stroke={c} strokeWidth={5} strokeLinejoin="round" />;
  if (e === "confiante")
    return <path d="M 130 142 Q 152 154 172 138" fill="none" stroke={c} strokeWidth={7} strokeLinecap="round" />;
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
  if (v.estiloCabelo === "topete")
    return (
      <g>
        {/* laterais baixas (degradê) */}
        <path d="M 82 110 Q 84 80 100 62 L 106 96 Q 94 100 88 116 Z" fill={v.cabelo} opacity={0.45} />
        <path d="M 218 110 Q 216 80 200 62 L 194 96 Q 206 100 212 116 Z" fill={v.cabelo} opacity={0.45} />
        {/* topete texturizado */}
        <path
          d="M 92 70 Q 96 20 150 14 Q 196 6 214 40 Q 222 58 208 76 Q 196 50 168 52 Q 186 40 176 30 Q 160 52 126 50 Q 140 40 128 34 Q 110 52 92 70 Z"
          fill={v.cabelo}
        />
      </g>
    );
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
  apontaEsq?: boolean;
  piscar?: boolean;
}> = ({ v, expressao, bracoEsq = 12, bracoDir = -12, joinhaDir, apontaEsq, piscar }) => {
  const c = theme.colors.marinho;
  const olhoRy = piscar ? 1.5 : 9;
  const ombro = v.forte ? 18 : 0; // quanto os ombros se abrem
  return (
    <svg width={300} height={700} viewBox="0 0 300 700" style={{ overflow: "visible" }}>
      {/* sombra no chão */}
      <ellipse cx={150} cy={688} rx={110 + ombro} ry={14} fill="rgba(36,48,94,0.18)" />
      <CabeloAtras v={v} />
      {/* pernas */}
      <rect x={100} y={420} width={46} height={240} rx={22} fill={v.calca} />
      <rect x={154} y={420} width={46} height={240} rx={22} fill={v.calca} />
      <rect x={88} y={648} width={64} height={30} rx={14} fill={v.tenis} />
      <rect x={148} y={648} width={64} height={30} rx={14} fill={v.tenis} />
      {/* braços atrás do tronco */}
      <Braco
        x={84 - ombro}
        y={222}
        angulo={bracoEsq}
        cor={v.blusa}
        pele={v.pele}
        forte={v.forte}
        tatuagem={v.tatuagem === "esq"}
        joinha={apontaEsq}
      />
      <Braco
        x={216 + ombro}
        y={222}
        angulo={bracoDir}
        cor={v.blusa}
        pele={v.pele}
        joinha={joinhaDir}
        forte={v.forte}
        tatuagem={v.tatuagem === "dir"}
        relogio={v.relogio}
      />
      {/* tronco (em V quando forte) */}
      <rect x={140} y={170} width={20} height={36} fill={v.pele} />
      <path
        d={`M ${82 - ombro} 220 Q ${82 - ombro} 194 ${112 - ombro / 2} 194 L ${188 + ombro / 2} 194 Q ${218 + ombro} 194 ${
          218 + ombro
        } 220 L ${v.forte ? 202 : 210} 440 L ${v.forte ? 98 : 90} 440 Z`}
        fill={v.blusa}
      />
      <path d="M 128 194 Q 150 214 172 194" fill="none" stroke={v.pele} strokeWidth={10} />
      {v.corrente ? (
        <g>
          <path d="M 126 196 Q 150 236 174 196" fill="none" stroke="#E2B13C" strokeWidth={3} />
          <rect x={144} y={214} width={12} height={16} rx={2} fill="#E2B13C" />
        </g>
      ) : null}
      {v.logoNaBlusa ? (
        <g transform="translate(182 250)">
          <circle r={17} fill={theme.colors.azul} stroke="#fff" strokeWidth={3} />
          <path d="M -7 -2 L -1 6 L 9 -8" fill="none" stroke={theme.colors.vermelho} strokeWidth={4} strokeLinecap="round" />
        </g>
      ) : null}
      {/* orelhas */}
      {v.brinco !== undefined ? (
        <>
          <ellipse cx={80} cy={116} rx={12} ry={18} fill={v.pele} />
          <ellipse cx={220} cy={116} rx={12} ry={18} fill={v.pele} />
          {v.brinco ? <circle cx={78} cy={128} r={4.5} fill="#D7DCE4" stroke="#8892A6" strokeWidth={1.5} /> : null}
        </>
      ) : null}
      {/* cabeça */}
      <circle cx={150} cy={110} r={72} fill={v.pele} />
      {v.barba ? (
        <>
          <path
            d="M 82 100 Q 84 172 150 180 Q 216 172 218 100 Q 212 118 204 126 Q 196 150 176 154 Q 150 146 124 154 Q 104 150 96 126 Q 88 118 82 100 Z"
            fill={v.cabelo}
            opacity={0.92}
          />
          {/* bigode */}
          <path d="M 124 130 Q 150 120 176 130 Q 164 127 150 130 Q 136 127 124 130 Z" fill={v.cabelo} />
        </>
      ) : null}
      <CabeloFrente v={v} />
      {/* rosto */}
      <ellipse cx={124} cy={106} rx={8} ry={olhoRy} fill={c} />
      <ellipse cx={176} cy={106} rx={8} ry={olhoRy} fill={c} />
      {v.sobrancelhaGrossa ? (
        <>
          <path d="M 108 88 Q 122 80 138 88" stroke={v.cabelo} strokeWidth={9} strokeLinecap="round" fill="none" />
          <path d="M 162 88 Q 178 80 192 88" stroke={v.cabelo} strokeWidth={9} strokeLinecap="round" fill="none" />
        </>
      ) : null}
      {expressao === "triste" ? (
        <>
          <path d="M 110 84 L 136 90" stroke={c} strokeWidth={5} strokeLinecap="round" />
          <path d="M 190 84 L 164 90" stroke={c} strokeWidth={5} strokeLinecap="round" />
        </>
      ) : null}
      {v.barba ? null : (
        <>
          <circle cx={108} cy={130} r={10} fill="#E8343A" opacity={0.18} />
          <circle cx={192} cy={130} r={10} fill="#E8343A" opacity={0.18} />
        </>
      )}
      <Boca e={expressao} clara={v.barba} />
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
  // Felipe: topete com laterais baixas, barba cheia, camiseta preta, braços fortes,
  // tatuagem no antebraço, brinco prata, corrente dourada e relógio branco.
  felipe: {
    pele: "#D49A6E",
    cabelo: "#2B1D15",
    estiloCabelo: "topete",
    blusa: "#17171C",
    calca: "#17171C",
    tenis: "#FFFFFF",
    barba: true,
    logoNaBlusa: true,
    forte: true,
    tatuagem: "esq",
    brinco: true,
    corrente: true,
    relogio: "#FFFFFF",
    sobrancelhaGrossa: true,
  },
} satisfies Record<string, Visual>;
