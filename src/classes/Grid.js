import Invader from "../classes/invader.js";

const INVADER_WIDTH = 40;
const INVADER_HEIGHT = 30;

const gapX = INVADER_WIDTH + 30;
const gapY = INVADER_HEIGHT + 25;

// limite máximo que os invasores podem descer (60% da tela)
const maxDescentY = innerHeight * 0.5;

class Grid {
  constructor(rows, cols) {
    this.rows = rows;
    this.cols = cols;
    this.direction = "right";
    this.moveDown = false;
    this.boost = 0.1;
    this.invadersVelocity = 1;

    this.invaders = this.init();
  }

  init() {
    const array = [];

    for (let row = 0; row < this.rows; row += 1) {
      for (let col = 0; col < this.cols; col += 1) {
        const invader = new Invader(
          {
            x: col * gapX + 20,
            y: row * gapY + 60,
          },
          this.invadersVelocity
        );

        array.push(invader);
      }
    }

    return array;
  }

  draw(ctx) {
    this.invaders.forEach((invader) => invader.draw(ctx));
  }

  update(playerStatus) {
    if (this.reachedRightBoundary()) {
      this.direction = "left";
      this.moveDown = true;
    } else if (this.reachedLeftBoundary()) {
      this.direction = "right";
      this.moveDown = true;
    }

    // se o player morreu, os invasores param de descer
    if (!playerStatus) this.moveDown = false;

    this.invaders.forEach((invader) => {
      if (this.moveDown && this.canMoveDown()) {
        invader.moveDown();
        invader.incrementVelocity(this.boost);
        this.invadersVelocity = invader.velocity;
      }

      if (this.direction === "right") invader.moveRight();
      if (this.direction === "left") invader.moveLeft();
    });

    this.moveDown = false;
  }

  reachedRightBoundary() {
    return this.invaders.some(
      (invader) => invader.position.x + invader.width >= innerWidth
    );
  }

  reachedLeftBoundary() {
    return this.invaders.some((invader) => invader.position.x <= 0);
  }

  canMoveDown() {
    return !this.invaders.some(
      (invader) => invader.position.y + invader.height >= maxDescentY
    );
  }

  getRandomInvader() {
    const index = Math.floor(Math.random() * this.invaders.length);
    return this.invaders[index];
  }

  restart() {
    this.invaders = this.init();
    this.direction = "right";
  }
}

export default Grid;
