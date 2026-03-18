import type { IDamageable, IHittable } from "@game-types/entities";
import type { Position, SkillEffect } from "@game-types/index";
import { IMAGE_PATHS, ENTITY_SIZE } from "@utils/constants";
import { Projectile } from "@classes/entities";

const INVADER_DAMAGE = 90;
const INVADER_MAX_LIFE = 200;
const DOT_TICKS = 4;
const DOT_INTERVAL_MS = 500;
const STUN_DEFAULT_DURATION = 2_000;

export class Invader implements IDamageable {
  public position: Position;
  public width: number = ENTITY_SIZE.invader.width;
  public height: number = ENTITY_SIZE.invader.height;
  public velocity: number;
  public life: number;
  public maxLife: number = INVADER_MAX_LIFE;
  public alive: boolean = true;

  private stats: { defense: number } = { defense: 0 };
  private readonly image: HTMLImageElement;

  public constructor(position: Position, velocity: number) {
    this.position = { ...position };
    this.velocity = velocity;
    this.life = this.maxLife;
    this.image = this.loadImage(IMAGE_PATHS.invader);
  }

  // ---------------------------------------------------------------------------
  // Movimento
  // ---------------------------------------------------------------------------

  public moveLeft(): void {
    this.position.x -= this.velocity;
  }

  public moveRight(): void {
    this.position.x += this.velocity;
  }

  public moveDown(): void {
    this.position.y += this.height;
  }

  public incrementVelocity(boost: number): void {
    this.velocity += boost;
  }

  // ---------------------------------------------------------------------------
  // Combate
  // ---------------------------------------------------------------------------

  public takeDamage(damage: number): void {
    const reduced = damage * (1 - this.stats.defense / 100);
    this.life -= reduced;

    if (this.life <= 0) {
      this.life = 0;
      this.alive = false;
    }
  }

  public shoot(projectiles: Projectile[]): void {
    const projectile = new Projectile(
      {
        x: this.position.x + this.width / 2 - 2,
        y: this.position.y + this.height,
      },
      10,
      INVADER_DAMAGE,
    );
    projectiles.push(projectile);
  }

  public hit(projectile: IHittable): boolean {
    return (
      projectile.position.x < this.position.x + this.width &&
      projectile.position.x + projectile.width > this.position.x &&
      projectile.position.y < this.position.y + this.height &&
      projectile.position.y + projectile.height > this.position.y
    );
  }

  public applyEffect(effect: SkillEffect): void {
    switch (effect.type) {
      case "target_slow": {
        const originalVelocity = this.velocity;
        this.velocity *= 1 - effect.value;
        setTimeout(() => {
          this.velocity = originalVelocity;
        }, STUN_DEFAULT_DURATION);
        break;
      }

      case "stun": {
        const currentVelocity = this.velocity;
        this.velocity = 0;
        setTimeout(() => {
          this.velocity = currentVelocity;
        }, effect.duration);
        break;
      }

      case "DOT": {
        let ticks = 0;
        const interval = setInterval(() => {
          this.takeDamage(effect.value);
          ticks++;
          // FIX: usa this.alive em vez de !this.alive (lógica estava invertida)
          if (ticks >= DOT_TICKS || !this.alive) {
            clearInterval(interval);
          }
        }, DOT_INTERVAL_MS);
        break;
      }

      case "target_defense_down": {
        // FIX: no original acessava this.stats.defense sem this.stats existir
        this.stats.defense = Math.max(
          0,
          this.stats.defense - this.stats.defense * effect.value,
        );
        break;
      }

      default:
        // Efeitos de player (heal, self_speed, etc.) não se aplicam a invasores
        break;
    }
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  public draw(ctx: CanvasRenderingContext2D): void {
    ctx.drawImage(
      this.image,
      this.position.x,
      this.position.y,
      this.width,
      this.height,
    );

    if (this.life < this.maxLife) {
      this.drawLifeBar(ctx);
    }
  }

  private drawLifeBar(ctx: CanvasRenderingContext2D): void {
    const barWidth = this.width * 0.8;
    const barHeight = 5;
    const x = this.position.x + (this.width - barWidth) / 2;
    const y = this.position.y - 10;
    const lifePercent = Math.max(0, this.life) / this.maxLife;

    ctx.fillStyle = "#333";
    ctx.fillRect(x, y, barWidth, barHeight);
    ctx.fillStyle = "crimson";
    ctx.fillRect(x, y, barWidth * lifePercent, barHeight);
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  private loadImage(path: string): HTMLImageElement {
    const image = new Image();
    image.src = path;
    return image;
  }
}

export default Invader;
