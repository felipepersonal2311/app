// Tema único do molde Felipe Oliveira Personal Trainer.
// Nunca coloque cor, fonte ou easing direto num componente: tudo vem daqui.
import { Easing } from "remotion";

export const theme = {
  colors: {
    vermelho: "#E8343A", // cor principal (destaque): no máximo 1 elemento por quadro
    marinho: "#24305E", // faixas de apoio
    azul: "#155E96",
    branco: "#FFFFFF",
    preto: "#0B0B0F",
    brilho: "rgba(232, 52, 58, 0.55)",
    sombra: "rgba(0, 0, 0, 0.55)",
  },
  fonts: {
    display: "Bebas Neue", // mesma família visual do "FELIPE OLIVEIRA" do logo
    apoio: "Montserrat",
  },
  ease: {
    out: Easing.bezier(0.16, 1, 0.3, 1),
    inOut: Easing.bezier(0.83, 0, 0.17, 1),
    in: Easing.bezier(0.7, 0, 0.84, 0),
  },
  spring: {
    snappy: { damping: 14, stiffness: 160, mass: 0.6 },
    smooth: { damping: 20, stiffness: 90, mass: 1 },
    bouncy: { damping: 11, stiffness: 170, mass: 0.7 },
  },
  // Inclinação das faixas (graus) — o "toque de energia" da opção B
  inclinacao: -3,
} as const;

export const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;
