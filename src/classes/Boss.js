import bossClassData from "../utils/bossClass.js";
import Projectile from "./Projectile.js";
import BossProjectile from "./BossProjectile.js";
import AreaAttack from "./AreaAttack.js";

class Boss {
  constructor(canvasWidth, canvasHeight, className) {
    const data = bossClassData[className];

    if (!data) {
      console.error(`Boss "${className}" não encontrado`);
      return;
    }

    this.class = className;
    this.alive = true;

    this.maxLife = data.life;
    this.life = this.maxLife;

    this.width = 120;
    this.height = 160;

    this.stats = { ...data.stats };

    this.velocity = data.speed || 2;
    this.direction = 1;

    this.lastShotTime = 0;

    this.position = {
      x: canvasWidth / 2 - this.width / 2,
      y: 40,
    };

    this.image = this.loadImage(data.image);

    this.skills = data.skills.map((skill) => ({
      ...skill,
      lastUsed: 0,
    }));
  }

  loadImage(path) {
    const img = new Image();
    img.src = path;
    return img;
  }

  update(canvasWidth) {
    if (!this.alive) return;

    this.position.x += this.velocity * this.direction;

    if (
      this.position.x <= 20 ||
      this.position.x + this.width >= canvasWidth - 20
    ) {
      this.direction *= -1;
    }
  }

  think(player, projectiles, createExplosion) {
    if (!this.alive) return;

    const now = Date.now();

    this.lastThinkTime = this.lastThinkTime || 0;

    if (now - this.lastThinkTime < 1000) return;

    this.lastThinkTime = now;

    const availableSkills = this.skills.filter(
      (skill) => now - skill.lastUsed >= skill.cooldown
    );

    if (availableSkills.length === 0) return;

    const totalWeight = availableSkills.reduce((sum, s) => sum + s.weight, 0);
    let roll = Math.random() * totalWeight;

    const chosenSkill = availableSkills.find((skill) => {
      roll -= skill.weight;
      return roll <= 0;
    });

    if (!chosenSkill) return;

    chosenSkill.lastUsed = now;
    this.executeSkill(chosenSkill, player, projectiles, createExplosion);
  }

  executeSkill(skill, player, projectiles, createExplosion) {
    const effect = skill.effect;

    switch (effect.type) {
      case "life_damage":
        for (let i = 0; i < 6; i++) {
          projectiles.push(
            new BossProjectile(
              {
                x: this.position.x + this.width / 2,
                y: this.position.y + this.height,
              },
              3 + Math.random() * 2,
              effect.value,
              "#a020f0"
            )
          );
        }
        break;
      case "stun":
        if (Math.random() < effect.chance) {
          player.isStunned = true;
          setTimeout(() => (player.isStunned = false), effect.duration);
        }
        break;

      case "meteor":
        createExplosion(player.position, 40, "orange");
        break;

      case "insta_kill":
        player.alive = false;
        break;
      case "magic_shot":
        projectiles.push(
          new BossProjectile(
            {
              x: this.position.x + this.width / 2,
              y: this.position.y + this.height,
            },
            5,
            effect.damage,
            "#a020f0"
          )
        );
        break;

      case "meteor":
        projectiles.push(
          new AreaAttack(
            {
              x: player.position.x + player.width / 2,
              y: player.position.y + player.height / 2,
            },
            effect.radius,
            effect.damage,
            effect.delay
          )
        );
        break;
    }
  }

  shoot(projectiles) {
    const now = Date.now();
    if (now - this.lastShotTime < this.stats.attackSpeed) return;

    const projectile = new Projectile(
      {
        x: this.position.x + this.width / 2 - 3,
        y: this.position.y + this.height,
      },
      6
    );

    projectile.damage = this.stats.attack;
    projectiles.push(projectile);
    this.lastShotTime = now;
  }

  takeDamage(damage) {
    const reduced =
      damage *
      (1 - this.stats.defense / 100) *
      (1 - this.stats.resistance / 100);

    this.life -= reduced;

    if (this.life <= 0) {
      this.life = 0;
      this.alive = false;
    }
  }

  hit(projectile) {
    const blocked = Math.random() * 100 < this.stats.block;
    if (blocked) return false;

    return (
      projectile.position.x < this.position.x + this.width &&
      projectile.position.x + projectile.width > this.position.x &&
      projectile.position.y < this.position.y + this.height &&
      projectile.position.y + projectile.height > this.position.y
    );
  }

  draw(ctx) {
    if (!this.image.complete) return;
    ctx.drawImage(
      this.image,
      this.position.x,
      this.position.y,
      this.width,
      this.height
    );
  }

  applyEffect(effect) {
    if (!effect || !this.alive) return;

    switch (effect.type) {
      case "DOT":
        let ticks = 0;
        const interval = setInterval(() => {
          if (!this.alive) {
            clearInterval(interval);
            return;
          }

          this.takeDamage(effect.value);
          ticks++;

          if (ticks >= effect.ticks) {
            clearInterval(interval);
          }
        }, effect.interval || 500);
        break;

      case "slow":
        const originalSpeed = this.velocity;
        this.velocity *= 1 - effect.value;

        setTimeout(() => {
          this.velocity = originalSpeed;
        }, effect.duration);
        break;

      case "defense_down":
        this.stats.defense *= 1 - effect.value;
        break;
    }
  }

  drawLifeBar(ctx) {
    const barWidth = 260;
    const barHeight = 14;
    const x = ctx.canvas.width / 2 - barWidth / 2;
    const y = 15;

    ctx.fillStyle = "#111";
    ctx.fillRect(x, y, barWidth, barHeight);

    ctx.fillStyle = "crimson";
    ctx.fillRect(x, y, barWidth * (this.life / this.maxLife), barHeight);

    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, barWidth, barHeight);
  }

  reset() {
    this.life = this.maxLife;
    this.alive = true;
  }
}

export default Boss;
