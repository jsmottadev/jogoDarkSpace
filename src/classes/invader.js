import { PATH_INVADER_IMAGE } from "../utils/constants.js";
import Projectile from "./Projectile.js";

class Invader {
  constructor(position, velocity) {
    this.position = position;
    this.width = 100 * 0.7;
    this.height = 150 * 0.7;
    this.velocity = velocity;
    this.maxLife = 200; // vida do invasor
    this.life = this.maxLife;

    this.image = this.getImage(PATH_INVADER_IMAGE);
  }

  getImage(path) {
    const image = new Image();
    image.src = path;
    return image;
  }

  moveLeft() {
    this.position.x -= this.velocity;
  }

  moveRight() {
    this.position.x += this.velocity;
  }

  moveDown() {
    this.position.y += this.height;
  }

  incrementVelocity(boost) {
    this.velocity += boost;
  }

  draw(ctx) {
    ctx.drawImage(
      this.image,
      this.position.x,
      this.position.y,
      this.width,
      this.height
    );

    // desenha a barra de vida do invader
    if (this.life < this.maxLife) {
      this.drawLifeBar(ctx);
    }
  }

  takeDamage(damage) {
    this.life -= damage;
  }
  drawLifeBar(ctx) {
    const barWidth = this.width * 0.8;
    const barHeight = 5;
    const x = this.position.x + (this.width - barWidth) / 2;
    const y = this.position.y - 10;

    const lifePercent = Math.max(0, this.life) / this.maxLife;

    // Fundo da barra (cinza)
    ctx.fillStyle = "#333";
    ctx.fillRect(x, y, barWidth, barHeight);

    // Vida atual
    ctx.fillStyle = "crimson";
    ctx.fillRect(x, y, barWidth * lifePercent, barHeight);
  }

  shoot(projectiles) {
    const p = new Projectile(
      {
        x: this.position.x + this.width / 2 - 2,
        y: this.position.y + this.height,
      },
      10,
      90 // dano do invasor
    );

    projectiles.push(p);
  }

  applyEffect(effect) {
    if (!effect) return;

    switch (effect.type) {
      case "target_slow":
        const originalVelocity = this.velocity || 2;
        this.velocity *= 1 - effect.value;

        setTimeout(() => {
          this.velocity = originalVelocity;
        }, 2000);
        break;

      case "stun":
        const currentVel = this.velocity;
        this.velocity = 0;
        setTimeout(() => {
          this.velocity = currentVel;
        }, effect.duration);
        break;

      case "DOT":
        let ticks = 0;
        const dotInterval = setInterval(() => {
          this.takeDamage(effect.value);
          ticks++;

          if (ticks >= 4 || !this.alive) clearInterval(dotInterval);
        }, 500);
        break;

      case "target_defense_down":
        this.stats.defense -= this.stats.defense * effect.value;
        break;
    }
  }

  hit(projectile) {
    return (
      projectile.position.x < this.position.x + this.width &&
      projectile.position.x + projectile.width > this.position.x &&
      projectile.position.y < this.position.y + this.height &&
      projectile.position.y + projectile.height > this.position.y
    );
  }
}

export default Invader;
