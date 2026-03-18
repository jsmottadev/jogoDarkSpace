import type { IHittable } from "@game-types/entities";
import type { Position } from "@game-types/index";

export class BossAreaAttack {
  public position: Position;
  public radius: number;
  public damage: number;
  public active: boolean = true;

  private readonly startTime: number;
  private readonly duration: number;

  public constructor(
    position: Position,
    radius: number,
    damage: number,
    duration: number = 800,
  ) {
    this.position = { ...position };
    this.radius = radius;
    this.damage = damage;
    this.duration = duration;
    this.startTime = Date.now();
  }

  public update(): void {
    if (Date.now() - this.startTime > this.duration) {
      this.active = false;
    }
  }

  public draw(ctx: CanvasRenderingContext2D): void {
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    ctx.strokeStyle = "orange";
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  public hit(target: IHittable): boolean {
    const px = target.position.x + target.width / 2;
    const py = target.position.y + target.height / 2;
    const dx = px - this.position.x;
    const dy = py - this.position.y;
    return Math.sqrt(dx * dx + dy * dy) < this.radius;
  }
}

export default BossAreaAttack;
