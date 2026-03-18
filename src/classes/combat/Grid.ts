import { Invader } from "./Invader";
import { GRID_CONFIG } from "@utils/constants";

export class Grid {
  public rows: number;
  public cols: number;
  public invaders: Invader[];
  public invadersVelocity: number = 1;

  private direction: "left" | "right" = "right";
  private moveDown: boolean = false;
  private readonly boost: number = GRID_CONFIG.velocityBoost;
  private readonly maxDescentY: number;

  public constructor(rows: number, cols: number) {
    this.rows = rows;
    this.cols = cols;
    this.maxDescentY = window.innerHeight * GRID_CONFIG.maxDescentRatio;
    this.invaders = this.createInvaders();
  }

  private createInvaders(): Invader[] {
    const invaders: Invader[] = [];

    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        invaders.push(
          new Invader(
            {
              x: col * GRID_CONFIG.gapX + 20,
              y: row * GRID_CONFIG.gapY + 60,
            },
            this.invadersVelocity,
          ),
        );
      }
    }

    return invaders;
  }

  public draw(ctx: CanvasRenderingContext2D): void {
    this.invaders.forEach((invader) => invader.draw(ctx));
  }

  public update(playerAlive: boolean): void {
    if (this.reachedRightBoundary()) {
      this.direction = "left";
      this.moveDown = true;
    } else if (this.reachedLeftBoundary()) {
      this.direction = "right";
      this.moveDown = true;
    }

    if (!playerAlive) this.moveDown = false;

    this.invaders.forEach((invader) => {
      if (this.moveDown && this.canMoveDown()) {
        invader.moveDown();
        invader.incrementVelocity(this.boost);
        this.invadersVelocity = invader.velocity;
      }

      if (this.direction === "right") invader.moveRight();
      else invader.moveLeft();
    });

    this.moveDown = false;
  }

  public getRandomInvader(): Invader | undefined {
    if (this.invaders.length === 0) return undefined;
    const index = Math.floor(Math.random() * this.invaders.length);
    return this.invaders[index];
  }

  public restart(): void {
    this.invaders = this.createInvaders();
    this.direction = "right";
    this.moveDown = false;
  }

  private reachedRightBoundary(): boolean {
    return this.invaders.some(
      (inv) => inv.position.x + inv.width >= window.innerWidth,
    );
  }

  private reachedLeftBoundary(): boolean {
    return this.invaders.some((inv) => inv.position.x <= 0);
  }

  private canMoveDown(): boolean {
    return !this.invaders.some(
      (inv) => inv.position.y + inv.height >= this.maxDescentY,
    );
  }
}

export default Grid;
