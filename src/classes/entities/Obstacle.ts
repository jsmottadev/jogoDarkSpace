import type { IHittable } from "@game-types/entities";
import type { Position } from "@game-types/index";

export class Obstacle implements IHittable {
  public position: Position;
  public width: number;
  public height: number;

  private readonly color: string;

  public constructor(
    position: Position,
    width: number,
    height: number,
    color: string,
  ) {
    this.position = { ...position };
    this.width = width;
    this.height = height;
    this.color = color;
  }

  public draw(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
  }

  /**
   * Detecta colisão considerando a direção do projétil:
   * - Projéteis subindo (velocity < 0) usam a borda superior
   * - Projéteis descendo (velocity > 0) usam a borda inferior
   */
  public hit(projectile: IHittable & { velocity: number }): boolean {
    const projectileEdgeY =
      projectile.velocity < 0
        ? projectile.position.y
        : projectile.position.y + projectile.height;

    return (
      projectile.position.x >= this.position.x &&
      projectile.position.x <= this.position.x + this.width &&
      projectileEdgeY >= this.position.y &&
      projectileEdgeY <= this.position.y + this.height
    );
  }
}

export default Obstacle;
