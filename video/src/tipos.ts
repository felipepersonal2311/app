// Formato do arquivo de cada vídeo (projetos/<nome>.json).
// Todos os tempos em segundos, contados a partir do início do vídeo bruto.

export type Legenda = {
  texto: string; // 1 a 3 palavras por vez, como na referência
  inicio: number;
  fim: number;
};

export type Projeto = {
  video: string; // arquivo dentro de public/brutos/
  duracao: number; // preenchido pelo scripts/preparar.py
  fps: number; // idem
  gancho: {
    linhas: string[]; // 1 ou 2 linhas. A 1ª vai na faixa azul, a 2ª na vermelha.
    duracao: number; // quanto tempo o gancho fica na tela
  };
  legendas: Legenda[];
  destaques: string[]; // palavras que aparecem maiores e em vermelho
  pretoEBranco: [number, number][]; // trechos em P&B [inicio, fim]
  cta: {
    chamada: string; // ex.: "COMENTE"
    palavra: string; // ex.: "TREINO"
    duracao: number; // segundos finais do vídeo ocupados pelo CTA
  };
  efeitosSonoros: boolean;
  // --- Variações de gancho (opcionais) ---
  cortarInicio?: number; // pula os primeiros N segundos do vídeo bruto
  teaser?: [number, number]; // trecho do bruto mostrado ANTES do começo (abertura "a frio")
  zoomGancho?: boolean; // aproxima a imagem devagar durante o gancho
  layout?: "padrao" | "rosto"; // "rosto": vídeo selfie, textos descem para a altura do peito
};

// Duração final e conversão de tempos do bruto para o vídeo editado.
export const linhaDoTempo = (p: Projeto) => {
  const corte = p.cortarInicio ?? 0;
  const teaserDur = p.teaser ? p.teaser[1] - p.teaser[0] : 0;
  const duracaoFinal = teaserDur + (p.duracao - corte);
  // tempo no bruto -> tempo no vídeo final (parte principal)
  const principal = (t: number) => t - corte + teaserDur;
  const legendas: Legenda[] = [];
  if (p.teaser) {
    const [a, b] = p.teaser;
    for (const l of p.legendas)
      if (l.inicio >= a && l.fim <= b) legendas.push({ ...l, inicio: l.inicio - a, fim: l.fim - a });
  }
  for (const l of p.legendas)
    if (l.inicio >= corte) legendas.push({ ...l, inicio: principal(l.inicio), fim: principal(l.fim) });
  const pretoEBranco = p.pretoEBranco
    .filter(([, b]) => b > corte)
    .map(([a, b]) => [principal(Math.max(a, corte)), principal(b)] as [number, number]);
  return { corte, teaserDur, duracaoFinal, legendas, pretoEBranco };
};
