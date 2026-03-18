const skills = {
  Mago: {
    Fogo: { dano: 350, efeito: { type: "DOT", value: 2, duration: 2000 } },
    Raio: { dano: 300, efeito: null },
    Vento: { dano: 250, efeito: { type: "self_speed", value: 0.05 } },
    Agua: { dano: 200, efeito: { type: "target_slow", value: 0.05 } },
    Especial: {
      dano: 1500,
      efeito: { type: "slow_and_speed", slow: 0.2, speed: 0.2 },
    },
  },

  Guerreiro: {
    Corte: { dano: 400, efeito: null },
    Impacto: { dano: 300, efeito: { type: "stun", duration: 1000 } },
    Investida: { dano: 200, efeito: { type: "self_speed", value: 0.05 } },
    Grito: { dano: 300, efeito: { type: "target_defense_down", value: 0.05 } },
    Especial: { dano: 2000, efeito: { type: "area_damage", radius: 3 } },
  },

  Paladino: {
    Luz: { dano: 150, efeito: { type: "heal_self", value: 50 } },
    Julgamento: { dano: 200, efeito: null },
    Bencao: { dano: 0, efeito: { type: "self_defense", value: 0.05 } },
    Punicao: { dano: 120, efeito: { type: "target_slow", value: 0.05 } },
    Especial: {
      dano: 650,
      efeito: { type: "heal_and_damage", heal: 200, radius: 3 },
    },
  },
};

export default skills;
