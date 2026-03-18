import type { Position, SkillEffect } from "@game-types/index";

export interface IProjectile {
  position: Position;
  width: number;
  height: number;
  velocity: number;
  damage: number;
  effect?: SkillEffect | null;
  color?: string;
  exploded?: boolean;
  update(target?: unknown): void;
  draw(ctx: CanvasRenderingContext2D): void;
  hit(target: IHittable): boolean;
}

export interface IParticle {
  position: Position;
  opacity: number;
  update(): void;
  draw(ctx: CanvasRenderingContext2D): void;
}

export interface IHittable {
  position: Position;
  width: number;
  height: number;
}

export interface IDamageable extends IHittable {
  life: number;
  maxLife: number;
  alive: boolean;
  takeDamage(damage: number): void;
}
