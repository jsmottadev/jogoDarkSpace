export interface Position {
  x: number;
  y: number;
}

export interface Velocity {
  x: number;
  y: number;
}

export interface Dimensions {
  width: number;
  height: number;
}

export const GameState = {
  START: "start",
  PLAYING: "playing",
  GAME_OVER: "gameOver",
} as const;

export type GameStateValue = (typeof GameState)[keyof typeof GameState];

export interface GameData {
  score: number;
  level: number;
  high: number;
}

export interface Stats {
  attack: number;
  defense: number;
  attackSpeed: number;
  block: number;
  resistance: number;
}

export interface EffectDOT {
  type: "DOT";
  value: number;
  duration: number;
  ticks?: number;
  interval?: number;
}

export interface EffectSelfSpeed {
  type: "self_speed";
  value: number;
}

export interface EffectSelfDefense {
  type: "self_defense";
  value: number;
}

export interface EffectTargetSlow {
  type: "target_slow";
  value: number;
}

export interface EffectTargetDefenseDown {
  type: "target_defense_down";
  value: number;
}

export interface EffectStun {
  type: "stun";
  duration: number;
}

export interface EffectHealSelf {
  type: "heal_self";
  value: number;
}

export interface EffectAreaDamage {
  type: "area_damage";
  radius: number;
}

export interface EffectSlowAndSpeed {
  type: "slow_and_speed";
  slow: number;
  speed: number;
}

export interface EffectHealAndDamage {
  type: "heal_and_damage";
  heal: number;
  radius: number;
}

export type SkillEffect =
  | EffectDOT
  | EffectSelfSpeed
  | EffectSelfDefense
  | EffectTargetSlow
  | EffectTargetDefenseDown
  | EffectStun
  | EffectHealSelf
  | EffectAreaDamage
  | EffectSlowAndSpeed
  | EffectHealAndDamage;

export interface BossEffectLifeDamage {
  type: "life_damage";
  value: number;
  debuff?: { type: string; value: number };
}

export interface BossEffectStun {
  type: "stun";
  chance: number;
  duration: number;
  damage?: number;
}

export interface BossEffectMeteor {
  type: "meteor";
  damage: number;
  radius?: number;
  delay?: number;
}

export interface BossEffectInstaKill {
  type: "insta_kill";
}

export interface BossEffectMagicShot {
  type: "magic_shot";
  damage: number;
}

export type BossSkillEffect =
  | BossEffectLifeDamage
  | BossEffectStun
  | BossEffectMeteor
  | BossEffectInstaKill
  | BossEffectMagicShot;

export interface Skill {
  dano: number;
  efeito: SkillEffect | null;
}

export type SkillMap = Record<string, Skill>;
export type ClassSkills = Record<string, SkillMap>;

export interface BossSkill {
  id: string;
  name: string;
  cooldown: number;
  weight: number;
  effect: BossSkillEffect;
  lastUsed: number;
}

export interface PlayerClass {
  name: string;
  desc: string;
  life: number;
  speed: number;
  image: string;
  stats: Stats;
}

export type PlayerClassKey = "mage" | "warrior" | "paladin";
export type PlayerClasses = Record<PlayerClassKey, PlayerClass>;

export interface BossClassData {
  name: string;
  life: number;
  speed: number;
  image: string;
  stats: Stats;
  skills: Omit<BossSkill, "lastUsed">[];
}

export type BossClassKey = "victor";
export type BossClasses = Record<BossClassKey, BossClassData>;

export interface ShootState {
  pressed: boolean;
  released: boolean;
}

export interface InputKeys {
  left: boolean;
  right: boolean;
  shoot: ShootState;
}

import type { Grid } from "@classes/combat/Grid";
import type { Boss } from "@classes/combat/Boss";
import type { SoundEffects } from "@managers/SoundEffects";
import type { IProjectile } from "../classes/entities/entities";
import type { IParticle } from "../classes/entities/entities";

export interface SpecialContext {
  skill: Skill;
  grid: Grid;
  projectiles: IProjectile[];
  particles: IParticle[];
  boss: Boss | null;
  soundEffects: SoundEffects;
  createExplosion: (position: Position, size: number, color: string) => void;
  incrementScore: (value: number) => void;
}
