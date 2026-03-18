// =============================================================================
//  src/classes/combat/Boss.ts
// =============================================================================

import type {
  IDamageable,
  IHittable,
  IProjectile,
  IAreaAttack,
} from "@game-types/entities";
import type {
  Position,
  BossSkill,
  Stats,
  SkillEffect,
} from "@game-types/index";
import { ENTITY_SIZE } from "@utils/constants";
import bossClassData from "@utils/bossClass";
import { Projectile, BossProjectile, AreaAttack } from "@classes/entities";
import type { Player } from "./Player";

type CreateExplosionFn = (
  position: Position,
  size: number,
  color: string,
) => void;
type BossProjectileArray = Array<IProjectile | IAreaAttack>;

export class Boss implements IDamageable {
  public readonly className: string;
  public position: Position;
  public width: number = ENTITY_SIZE.boss.width;
  public height: number = ENTITY_SIZE.boss.height;
  public alive: boolean = true;
  public life: number;
  public maxLife: number;
  public stats: Stats;
  public velocity: number;

  private readonly image: HTMLImageElement;
  private readonly skills: BossSkill[];
  private lastShotTime: number = 0;
  private lastThinkTime: number = 0;
  private direction: number = 1;

  public constructor(
    canvasWidth: number,
    _canvasHeight: number,
    className: string,
  ) {
    const data = bossClassData[className as keyof typeof bossClassData];
    if (!data)
      throw new Error(`Boss "${className}" não encontrado em bossClass.ts`);

    this.className = className;
    this.maxLife = data.life;
    this.life = this.maxLife;
    this.stats = { ...data.stats };
    this.velocity = data.speed;
    this.skills = data.skills.map((skill) => ({ ...skill, lastUsed: 0 }));
    this.image = this.loadImage(data.image);
    this.position = { x: canvasWidth / 2 - this.width / 2, y: 40 };
  }

  public update(canvasWidth: number): void {
    if (!this.alive) return;
    this.position.x += this.velocity * this.direction;
    if (
      this.position.x <= 20 ||
      this.position.x + this.width >= canvasWidth - 20
    ) {
      this.direction *= -1;
    }
  }

  public think(
    player: Player,
    projectiles: BossProjectileArray,
    _createExplosion: CreateExplosionFn,
  ): void {
    if (!this.alive) return;
    const now = Date.now();
    if (now - this.lastThinkTime < 1_000) return;
    this.lastThinkTime = now;

    const available = this.skills.filter((s) => now - s.lastUsed >= s.cooldown);
    if (available.length === 0) return;

    const totalWeight = available.reduce((sum, s) => sum + s.weight, 0);
    let roll = Math.random() * totalWeight;
    const chosen = available.find((s) => {
      roll -= s.weight;
      return roll <= 0;
    });
    if (!chosen) return;

    chosen.lastUsed = now;
    this.executeSkill(chosen, player, projectiles);
  }

  private executeSkill(
    skill: BossSkill,
    player: Player,
    projectiles: BossProjectileArray,
  ): void {
    const { effect } = skill;
    const origin: Position = {
      x: this.position.x + this.width / 2,
      y: this.position.y + this.height,
    };

    switch (effect.type) {
      case "life_damage":
        for (let i = 0; i < 6; i++) {
          projectiles.push(
            new BossProjectile(
              origin,
              3 + Math.random() * 2,
              effect.value,
              "#a020f0",
            ),
          );
        }
        break;
      case "stun":
        if (Math.random() < effect.chance) {
          player.isStunned = true;
          setTimeout(() => {
            player.isStunned = false;
          }, effect.duration);
        }
        break;
      case "meteor":
        projectiles.push(
          new AreaAttack(
            {
              x: player.position.x + player.width / 2,
              y: player.position.y + player.height / 2,
            },
            effect.radius ?? 80,
            effect.damage,
            effect.delay ?? 1_200,
          ),
        );
        break;
      case "magic_shot":
        projectiles.push(
          new BossProjectile(origin, 5, effect.damage, "#a020f0"),
        );
        break;
      case "insta_kill":
        player.alive = false;
        break;
    }
  }

  public shoot(projectiles: BossProjectileArray): void {
    const now = Date.now();
    if (now - this.lastShotTime < this.stats.attackSpeed) return;
    projectiles.push(
      new Projectile(
        {
          x: this.position.x + this.width / 2 - 3,
          y: this.position.y + this.height,
        },
        6,
        this.stats.attack,
      ),
    );
    this.lastShotTime = now;
  }

  public takeDamage(damage: number): void {
    const reduced =
      damage *
      (1 - this.stats.defense / 100) *
      (1 - this.stats.resistance / 100);
    this.life = Math.max(0, this.life - reduced);
    if (this.life <= 0) this.alive = false;
  }

  public hit(projectile: IHittable): boolean {
    if (Math.random() * 100 < this.stats.block) return false;
    return (
      projectile.position.x < this.position.x + this.width &&
      projectile.position.x + projectile.width > this.position.x &&
      projectile.position.y < this.position.y + this.height &&
      projectile.position.y + projectile.height > this.position.y
    );
  }

  public applyEffect(effect: SkillEffect): void {
    if (!this.alive) return;
    switch (effect.type) {
      case "DOT": {
        let ticks = 0;
        const interval = setInterval(() => {
          if (!this.alive) {
            clearInterval(interval);
            return;
          }
          this.takeDamage(effect.value);
          if (++ticks >= (effect.ticks ?? 4)) clearInterval(interval);
        }, effect.interval ?? 500);
        break;
      }
      case "target_slow": {
        const orig = this.velocity;
        this.velocity *= 1 - effect.value;
        setTimeout(() => {
          this.velocity = orig;
        }, 2_000);
        break;
      }
      case "target_defense_down":
        this.stats.defense = Math.max(
          0,
          this.stats.defense * (1 - effect.value),
        );
        break;
      default:
        break;
    }
  }

  public draw(ctx: CanvasRenderingContext2D): void {
    if (!this.image.complete) return;
    ctx.drawImage(
      this.image,
      this.position.x,
      this.position.y,
      this.width,
      this.height,
    );
  }

  public drawLifeBar(ctx: CanvasRenderingContext2D): void {
    const barWidth = 260,
      barHeight = 14;
    const x = ctx.canvas.width / 2 - barWidth / 2,
      y = 15;
    ctx.fillStyle = "#111";
    ctx.fillRect(x, y, barWidth, barHeight);
    ctx.fillStyle = "crimson";
    ctx.fillRect(x, y, barWidth * (this.life / this.maxLife), barHeight);
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, barWidth, barHeight);
  }

  public reset(): void {
    this.life = this.maxLife;
    this.alive = true;
  }

  private loadImage(path: string): HTMLImageElement {
    const img = new Image();
    img.src = path;
    return img;
  }
}

export default Boss;
