import type { PlayerClasses } from "@game-types/index";
import { IMAGE_PATHS } from "./constants";

const playerClasses: PlayerClasses = {
  mage: {
    name: "Mago",
    desc: "Mestre das artes arcanas. Frágil, mas devastador.",
    life: 200,
    speed: 3,
    image: IMAGE_PATHS.mago,
    stats: {
      attack: 165,
      defense: 20,
      attackSpeed: 150,
      block: 5,
      resistance: 30,
    },
  },

  warrior: {
    name: "Guerreiro",
    desc: "Especialista em combate corpo a corpo e resistência.",
    life: 250,
    speed: 2,
    image: IMAGE_PATHS.guerreiro,
    stats: {
      attack: 160,
      defense: 60,
      attackSpeed: 150,
      block: 20,
      resistance: 40,
    },
  },

  paladin: {
    name: "Paladino",
    desc: "Guerreiro sagrado. O equilíbrio entre ataque e defesa.",
    life: 350,
    speed: 1.5,
    image: IMAGE_PATHS.paladino,
    stats: {
      attack: 50,
      defense: 80,
      attackSpeed: 300,
      block: 80,
      resistance: 45,
    },
  },
};

export default playerClasses;
