import type { IProjectile, IHittable } from "@game-types/entities";
import type { Position } from "@game-types/index";

export class BossProjectile implements IProjectile {
  public position: Position;
  public width: number = 12;
  public height: number = 20;
  public velocity: number;
  public damage: number;
  public color: string;
  public active: boolean = true;

  public constructor(
    position: Position,
    velocity: number,
    damage: number,
    color: string = "purple",
  ) {
    this.position = { ...position };
    this.velocity = velocity;
    this.damage = damage;
    this.color = color;
  }

  public update(): void {
    this.position.y += this.velocity;
  }

  public draw(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
  }

  public hit(target: IHittable): boolean {
    return (
      this.position.x < target.position.x + target.width &&
      this.position.x + this.width > target.position.x &&
      this.position.y < target.position.y + target.height &&
      this.position.y + this.height > target.position.y
    );
  }
}

export default BossProjectile;
