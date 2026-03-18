import type { IProjectile, IHittable } from "@game-types/entities";
import type { Position } from "@game-types/index";

export class BossSkillProjectile implements IProjectile {
  public position: Position;
  public width: number;
  public height: number;
  public velocity: number;
  public damage: number;
  public radius: number;
  public color: string;
  public active: boolean = true;

  public constructor(
    position: Position,
    velocity: number,
    damage: number,
    radius: number = 6,
    color: string = "crimson",
  ) {
    this.position = { ...position };
    this.velocity = velocity;
    this.damage = damage;
    this.radius = radius;
    this.color = color;
    // width/height espelham o diâmetro para compatibilidade com IProjectile
    this.width = radius * 2;
    this.height = radius * 2;
  }

  public update(): void {
    this.position.y += this.velocity;
  }

  public draw(ctx: CanvasRenderingContext2D): void {
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
  }

  public hit(target: IHittable): boolean {
    // FIX: checa se o centro do círculo está dentro do bounding box do alvo
    return (
      this.position.x >= target.position.x &&
      this.position.x <= target.position.x + target.width &&
      this.position.y >= target.position.y &&
      this.position.y <= target.position.y + target.height
    );
  }
}

export default BossSkillProjectile;
