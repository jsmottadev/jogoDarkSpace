import type { IDamageable } from "@game-types/entities";
import type { Position } from "@game-types/index";

export class AreaAttack {
  public position: Position;
  public radius: number;
  public damage: number;
  public delay: number;
  public exploded: boolean = false;

  private readonly startTime: number;

  public constructor(
    position: Position,
    radius: number,
    damage: number,
    delay: number,
  ) {
    this.position = { ...position };
    this.radius = radius;
    this.damage = damage;
    this.delay = delay;
    this.startTime = Date.now();
  }

  public update(target: IDamageable): void {
    if (this.exploded) return;

    if (Date.now() - this.startTime >= this.delay) {
      const dx = target.position.x - this.position.x;
      const dy = target.position.y - this.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance <= this.radius) {
        target.takeDamage(this.damage);
      }

      this.exploded = true;
    }
  }

  public draw(ctx: CanvasRenderingContext2D): void {
    if (this.exploded) return;

    const elapsed = Date.now() - this.startTime;
    const progress = Math.min(elapsed / this.delay, 1);
    const pulseRadius = this.radius * (0.4 + 0.6 * progress);

    ctx.strokeStyle = `rgba(255, 140, 0, ${1 - progress * 0.4})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, pulseRadius, 0, Math.PI * 2);
    ctx.stroke();
  }
}

export default AreaAttack;
