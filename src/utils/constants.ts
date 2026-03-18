// =============================================================================

export const IMAGE_PATHS = {
  mago: "src/assets/images/mago.png",
  guerreiro: "src/assets/images/guerreiro1.png",
  paladino: "src/assets/images/paladino1.png",
  boss: "src/assets/images/boss1.png",
  invader: "src/assets/images/invader.png",
} as const;

export const AUDIO_PATHS = {
  shoot: "src/assets/audios/shoot.wav",
  hit: "src/assets/audios/hit.mp3",
  explosion: "src/assets/audios/explosion.wav",
  levelUp: "src/assets/audios/levelUp.mp3",
} as const;

export { GameState } from "@game-types/index";

export const ENTITY_SIZE = {
  player: { width: 100 * 0.8, height: 150 * 0.8 },
  invader: { width: 100 * 0.7, height: 150 * 0.7 },
  boss: { width: 120, height: 160 },
} as const;

export const GRID_CONFIG = {
  invaderWidth: 40,
  invaderHeight: 30,
  gapX: 40 + 30, // invaderWidth + espaçamento
  gapY: 30 + 25, // invaderHeight + espaçamento
  maxDescentRatio: 0.5,
  velocityBoost: 0.1,
} as const;

export const BOSS_LEVELS = [5, 10, 15, 20, 30] as const;

export const SKILL_COOLDOWN = {
  normal: 3_000,
  special: 10_000,
} as const;

export const SKILL_KEY_MAP: Record<string, string[]> = {
  Mago: ["Fogo", "Raio", "Vento", "Agua", "Especial"],
  Guerreiro: ["Corte", "Impacto", "Investida", "Grito", "Especial"],
  Paladino: ["Luz", "Julgamento", "Bencao", "Punicao", "Especial"],
} as const;

export const SCORE_VALUES = {
  invader: 10,
  boss: 500,
} as const;

export const AUDIO_POOL_SIZE = 5 as const;
