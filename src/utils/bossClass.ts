import type { BossClasses } from "@game-types/index";
import { IMAGE_PATHS } from "./constants";

const bossClass: BossClasses = {
  victor: {
    name: "Victor, o Arquimago Corrompido",
    life: 3_500,
    speed: 4,
    image: IMAGE_PATHS.boss,

    stats: {
      attack: 120,
      defense: 40,
      attackSpeed: 180,
      block: 40,
      resistance: 60,
    },

    skills: [
      {
        id: "butterflies",
        name: "Borboletas",
        cooldown: 3_000,
        weight: 40,
        effect: {
          type: "life_damage",
          value: 100,
          debuff: { type: "attack_speed", value: 0.98 },
        },
      },
      {
        id: "delayed_show",
        name: "Show Atrasado",
        cooldown: 5_000,
        weight: 30,
        effect: {
          type: "stun",
          chance: 0.5,
          duration: 2_000,
          damage: 20,
        },
      },
      {
        id: "meteor",
        name: "Meteoro da Paixão",
        cooldown: 6_000,
        weight: 20,
        effect: {
          type: "meteor",
          damage: 300,
          radius: 80,
          delay: 1_200,
        },
      },
      {
        id: "duet",
        name: "Dueto com Anita",
        cooldown: 15_000,
        weight: 1,
        effect: {
          type: "insta_kill",
        },
      },
    ],
  },
};

export default bossClass;
