import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";
import { theme } from "./theme";

// Fontes locais (licença OFL): não dependem de internet na hora de renderizar.
export const fontesProntas = Promise.all([
  loadFont({ family: theme.fonts.display, url: staticFile("fonts/BebasNeue.woff"), weight: "400" }),
  loadFont({ family: theme.fonts.apoio, url: staticFile("fonts/Montserrat-800.woff"), weight: "800" }),
]);
