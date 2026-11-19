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
};
