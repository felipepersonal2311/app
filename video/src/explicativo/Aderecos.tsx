import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp, theme } from "../theme";

const M = theme.colors.marinho;
const V = theme.colors.vermelho;
const A = theme.colors.azul;

// Entrada padrão: opacidade + subida + escala; saída mais rápida.
export const Entra: React.FC<{
  de: number;
  ate?: number;
  x: number;
  y: number;
  children: React.ReactNode;
}> = ({ de, ate, x, y, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - de, fps, config: theme.spring.smooth });
  const s =
    ate === undefined
      ? 0
      : interpolate(frame, [ate - 10, ate], [0, 1], { easing: theme.ease.in, ...clamp });
  const respiro = Math.sin(((frame - de) / fps) * Math.PI * 0.8) * 6;
  if (frame < de || (ate !== undefined && frame > ate)) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        opacity: p * (1 - s),
        transform: `translateY(${interpolate(p, [0, 1], [60, 0]) + respiro - s * 30}px) scale(${interpolate(
          p,
          [0, 1],
          [0.8, 1],
        )})`,
      }}
    >
      {children}
    </div>
  );
};

// Progresso 0→1 de um trecho, com easing (para animações internas dos adereços).
const useTrecho = (de: number, dur: number) => {
  const frame = useCurrentFrame();
  return interpolate(frame, [de, de + dur], [0, 1], { easing: theme.ease.out, ...clamp });
};

export const Espelho: React.FC = () => (
  <svg width={300} height={560} viewBox="0 0 300 560">
    <rect x={10} y={10} width={280} height={540} rx={140} fill="#D9E6F5" stroke={M} strokeWidth={14} />
    <path d="M 70 120 L 120 70" stroke="#fff" strokeWidth={16} strokeLinecap="round" opacity={0.8} />
    <path d="M 70 180 L 170 80" stroke="#fff" strokeWidth={10} strokeLinecap="round" opacity={0.6} />
  </svg>
);

const MiniFoto: React.FC<{ x: number; y: number; check: number }> = ({ x, y, check }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect width={150} height={200} rx={16} fill="#E9EEF6" />
    <circle cx={75} cy={62} r={26} fill="#C8D3E3" />
    <path d="M 35 190 Q 35 110 75 104 Q 115 110 115 190 Z" fill="#C8D3E3" />
    <g transform={`translate(125 25) scale(${check})`}>
      <circle r={24} fill={V} />
      <path d="M -10 0 L -2 9 L 11 -9" fill="none" stroke="#fff" strokeWidth={6} strokeLinecap="round" />
    </g>
  </g>
);

// Celular com fotos sendo avaliadas (checks aparecem em sequência)
export const CelularFotos: React.FC<{ de: number }> = ({ de }) => {
  const c = [useTrecho(de + 15, 12), useTrecho(de + 21, 12), useTrecho(de + 27, 12)];
  return (
    <svg width={560} height={520} viewBox="0 0 560 520">
      <rect x={20} y={10} width={520} height={500} rx={50} fill={M} />
      <rect x={44} y={34} width={472} height={452} rx={32} fill="#fff" />
      <text x={280} y={96} textAnchor="middle" fontFamily={theme.fonts.display} fontSize={52} fill={M}>
        AVALIAÇÃO DAS FOTOS
      </text>
      <MiniFoto x={60} y={140} check={c[0]} />
      <MiniFoto x={205} y={140} check={c[1]} />
      <MiniFoto x={350} y={140} check={c[2]} />
      <rect x={60} y={370} width={440} height={22} rx={11} fill="#E9EEF6" />
      <rect x={60} y={370} width={440 * c[2]} height={22} rx={11} fill={A} />
      <text x={280} y={448} textAnchor="middle" fontFamily={theme.fonts.apoio} fontWeight={800} fontSize={30} fill={M}>
        + ANAMNESE
      </text>
    </svg>
  );
};

// Folha "COPIA E COLA" riscada e trocada pelo app com treino personalizado
export const CopiaECola: React.FC<{ de: number }> = ({ de }) => {
  const risco = useTrecho(de + 18, 12);
  const troca = useTrecho(de + 42, 18);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: frame - de - 42, fps, config: theme.spring.bouncy });
  return (
    <div style={{ position: "relative", width: 760, height: 520 }}>
      <svg
        width={360}
        height={460}
        viewBox="0 0 360 460"
        style={{
          position: "absolute",
          left: 0,
          top: 30,
          opacity: 1 - troca * 0.55,
          transform: `rotate(${-6 - troca * 6}deg) scale(${1 - troca * 0.12})`,
        }}
      >
        <rect x={10} y={10} width={340} height={440} rx={18} fill="#fff" stroke="#C8D3E3" strokeWidth={6} />
        <text x={180} y={90} textAnchor="middle" fontFamily={theme.fonts.display} fontSize={50} fill="#8892A6">
          COPIA E COLA
        </text>
        {[0, 1, 2, 3, 4].map((i) => (
          <rect key={i} x={50} y={140 + i * 56} width={260 - (i % 2) * 60} height={20} rx={10} fill="#DDE3EC" />
        ))}
        <line x1={40} y1={40} x2={40 + 280 * risco} y2={40 + 380 * risco} stroke={V} strokeWidth={22} strokeLinecap="round" />
        <line x1={320} y1={40} x2={320 - 280 * risco} y2={40 + 380 * risco} stroke={V} strokeWidth={22} strokeLinecap="round" opacity={risco > 0 ? 1 : 0} />
      </svg>
      <svg
        width={380}
        height={520}
        viewBox="0 0 380 520"
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          opacity: pop,
          transform: `translateX(${(1 - pop) * 80}px) scale(${interpolate(pop, [0, 1], [0.7, 1])})`,
        }}
      >
        <rect x={10} y={10} width={360} height={500} rx={46} fill={M} />
        <rect x={32} y={32} width={316} height={456} rx={28} fill="#fff" />
        <rect x={32} y={32} width={316} height={92} rx={28} fill={A} />
        <rect x={32} y={96} width={316} height={28} fill={A} />
        <text x={190} y={92} textAnchor="middle" fontFamily={theme.fonts.display} fontSize={46} fill="#fff">
          TREINO DA ANA
        </text>
        {["GLÚTEO", "POSTERIOR", "QUADRÍCEPS", "CORE"].map((t, i) => (
          <g key={t} transform={`translate(60 ${170 + i * 78})`} opacity={interpolate(troca, [i * 0.15, i * 0.15 + 0.4], [0, 1], clamp)}>
            <circle cx={16} cy={0} r={18} fill={V} />
            <path d="M 8 0 L 14 7 L 25 -7" fill="none" stroke="#fff" strokeWidth={5} strokeLinecap="round" />
            <text x={50} y={12} fontFamily={theme.fonts.apoio} fontWeight={800} fontSize={32} fill={M}>
              {t}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};

// Calendário de 30 dias virando + selo "ajuste na hora"
export const Calendario: React.FC<{ de: number; seloDe: number }> = ({ de, seloDe }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dia = Math.round(interpolate(frame, [de + 10, de + 50], [1, 30], { easing: theme.ease.inOut, ...clamp }));
  const seta = useTrecho(de + 40, 20);
  const selo = spring({ frame: frame - seloDe, fps, config: theme.spring.bouncy });
  return (
    <div style={{ position: "relative", width: 800, height: 520 }}>
      <svg width={360} height={420} viewBox="0 0 360 420" style={{ position: "absolute", left: 30, top: 40 }}>
        <rect x={10} y={30} width={340} height={380} rx={30} fill="#fff" stroke={M} strokeWidth={10} />
        <rect x={10} y={30} width={340} height={100} rx={30} fill={V} />
        <rect x={10} y={100} width={340} height={30} fill={V} />
        <rect x={80} y={8} width={22} height={56} rx={11} fill={M} />
        <rect x={258} y={8} width={22} height={56} rx={11} fill={M} />
        <text x={180} y={104} textAnchor="middle" fontFamily={theme.fonts.display} fontSize={56} fill="#fff">
          DIA
        </text>
        <text x={180} y={330} textAnchor="middle" fontFamily={theme.fonts.display} fontSize={200} fill={M}>
          {dia}
        </text>
      </svg>
      <svg width={360} height={360} viewBox="0 0 360 360" style={{ position: "absolute", right: 20, top: 40 }}>
        <polyline
          points="20,320 110,250 190,270 330,90"
          fill="none"
          stroke={A}
          strokeWidth={22}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={600}
          strokeDashoffset={600 * (1 - seta)}
        />
        <path d="M 290 80 L 340 80 L 336 132" fill="none" stroke={A} strokeWidth={22} strokeLinecap="round" strokeLinejoin="round" opacity={seta > 0.9 ? 1 : 0} />
        <text x={180} y={350} textAnchor="middle" fontFamily={theme.fonts.display} fontSize={48} fill={M}>
          NOVA AVALIAÇÃO
        </text>
      </svg>
      <div
        style={{
          position: "absolute",
          left: 200,
          top: 470,
          opacity: selo,
          transform: `scale(${interpolate(selo, [0, 1], [0.4, 1])}) rotate(${theme.inclinacao}deg)`,
          background: M,
          color: "#fff",
          fontFamily: theme.fonts.display,
          fontSize: 64,
          padding: "10px 30px 2px",
          borderRadius: 14,
          boxShadow: "0 12px 26px rgba(36,48,94,0.3)",
          whiteSpace: "nowrap",
        }}
      >
        NÃO ADAPTOU? <span style={{ color: "#FF8A8D" }}>AJUSTA NA HORA</span>
      </div>
    </div>
  );
};
