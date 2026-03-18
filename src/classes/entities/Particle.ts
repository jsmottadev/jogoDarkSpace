import type { IParticle } from "@game-types/entities";
import type { Position, Velocity } from "@game-types/index";

const FADE_SPEED = 0.008;

export class Particle implements IParticle {
  public position: Position;
  public opacity: number = 1;

  private readonly velocity: Velocity;
  private readonly radius: number;
  private readonly color: string;

  public constructor(
    position: Position,
    velocity: Velocity,
    radius: number,
    color: string,
  ) {
    this.position = { ...position };
    this.velocity = { ...velocity };
    this.radius = radius;
    this.color = color;
  }

  public update(): void {
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    this.opacity = Math.max(0, this.opacity - FADE_SPEED);
  }

  public draw(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.closePath();
    ctx.restore();
  }
}

export default Particle;
