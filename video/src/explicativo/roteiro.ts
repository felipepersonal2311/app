// Roteiro "Amigas conversando" com vozes. A linha do tempo é calculada a partir da
// duração real de cada áudio em public/vozes/ (medida por scripts/medir-vozes.py).
import duracoes from "./vozes.json";

export type Quem = "ana" | "bia" | "carol" | "felipe";

export type Fala = {
  id: keyof typeof duracoes;
  quem: Quem;
  texto: string; // texto do balão (*asteriscos* = vermelho)
  inicio: number; // segundos
  fim: number;
};

const GAP = 0.3;
const d = (id: keyof typeof duracoes) => duracoes[id];

// Monta a linha do tempo em sequência
const ana1 = { inicio: 0.4, fim: 0.4 + d("ana_1") };
const biaChega = ana1.fim - 0.5;
const bia1 = { inicio: ana1.fim + GAP, fim: ana1.fim + GAP + d("bia_1") };
const ponto1 = bia1.fim;
const bia2 = { inicio: ponto1 + 0.5, fim: ponto1 + 0.5 + d("bia_2") };
const ponto2 = bia2.fim + 0.1;
const carol1 = { inicio: ponto2 + 0.6, fim: ponto2 + 0.6 + d("carol_1") };
const ponto4e5 = carol1.fim + 0.1;
const bia3 = { inicio: ponto4e5 + 0.5, fim: ponto4e5 + 0.5 + d("bia_3") };
const carol2 = { inicio: bia3.fim + GAP, fim: bia3.fim + GAP + d("carol_2") };
const virada = carol2.fim + 0.2;
const ana2 = { inicio: virada + 0.1, fim: virada + 0.1 + d("ana_2") };
const cta = ana2.fim + 0.4;
const felipe1 = { inicio: cta + 0.7, fim: cta + 0.7 + d("felipe_1") };
const fim = felipe1.fim + 1.0;

export const T = {
  gancho: 0,
  ganchoDuracao: 3,
  biaChega,
  ponto1,
  ponto2,
  ponto4e5,
  virada,
  cta,
  fim,
  // momentos sincronizados com o que é dito
  checksFotos: bia2.inicio + 2.6, // "...e ele avalia as suas fotos"
  riscaCopiaECola: carol1.inicio + 2.4, // "...nada de copia e cola"
  seloAjuste: carol2.inicio + 1.9, // "ele ajusta na hora"
  biaFlexDe: bia1.inicio + 1.2,
};

export const FALAS: Fala[] = [
  { id: "ana_1", quem: "ana", texto: "Ai, gente… treino há meses e nada! O glúteo não cresce… e essa *barriga não sai!*", ...ana1 },
  { id: "bia_1", quem: "bia", texto: "Amiga, eu tava igualzinha! Até entrar na *consultoria do Felipe*.", ...bia1 },
  { id: "bia_2", quem: "bia", texto: "Ele começa te *conhecendo*: tem a anamnese e ele avalia as suas *fotos*.", ...bia2 },
  { id: "carol_1", quem: "carol", texto: "E o melhor: o treino é feito *pra você*. Nada de copia e cola!", ...carol1 },
  { id: "bia_3", quem: "bia", texto: "E todo mês ele te *reavalia* e muda o treino!", ...bia3 },
  { id: "carol_2", quem: "carol", texto: "E se você não se adaptar? Ele *ajusta na hora*!", ...carol2 },
  { id: "ana_2", quem: "ana", texto: "Gente, tô dentro! Me passa o *contato*!", ...ana2 },
  { id: "felipe_1", quem: "felipe", texto: "", ...felipe1 },
];

// Posição do balão de cada personagem (a ponta aponta para quem fala)
export const BALAO: Record<Exclude<Quem, "felipe">, { x: number; y: number; largura: number; ponta: number }> = {
  ana: { x: 40, y: 800, largura: 680, ponta: 0.26 },
  bia: { x: 330, y: 800, largura: 710, ponta: 0.8 },
  carol: { x: 170, y: 800, largura: 740, ponta: 0.48 },
};

export const falandoAgora = (quem: Quem, segundos: number) =>
  FALAS.some((f) => f.quem === quem && segundos >= f.inicio && segundos <= f.fim);
