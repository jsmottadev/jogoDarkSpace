import Projectile from "./Projectile.js";
import skills from "./skill.js";

class Player {
  constructor(canvasWidth, canvasHeight, playerClass) {
    this.class = playerClass;
    this.alive = true;

    this.maxLife = playerClass.life;
    this.life = this.maxLife;

    this.width = 100 * 0.8;
    this.height = 150 * 0.8;

    this.stats = { ...playerClass.stats };

    this.velocity = playerClass.speed || 3;

    this.lastShotTime = 0;

    this.skillCooldowns = {};

    this.availableSkills = skills[this.class.name];

    this.position = {
      x: canvasWidth / 2 - this.width / 2,
      y: canvasHeight - this.height - 30,
    };

    this.image = this.getImage(playerClass.image);
  }

  getSkill(skillName) {
    if (this.availableSkills && this.availableSkills[skillName]) {
      return this.availableSkills[skillName];
    }
    return null;
  }

  canUseSkill(skillKey, cooldownTime) {
    const now = Date.now();

    if (!this.skillCooldowns[skillKey]) {
      this.skillCooldowns[skillKey] = 0;
    }

    if (now - this.skillCooldowns[skillKey] >= cooldownTime) {
      this.skillCooldowns[skillKey] = now;
      return true;
    }

    return false;
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

  draw(ctx) {
    ctx.drawImage(
      this.image,
      this.position.x,
      this.position.y,
      this.width,
      this.height
    );
  }

  shoot(projectiles) {
    const now = Date.now();
    if (now - this.lastShotTime < this.stats.attackSpeed) return;

    const projectile = new Projectile(
      {
        x: this.position.x + this.width / 2 - 2,
        y: this.position.y + 2,
      },
      -10
    );

    projectile.damage = this.stats.attack;
    projectiles.push(projectile);
    this.lastShotTime = now;
  }

  takeDamage(damage) {
    const reducedDamage =
      damage *
      (1 - this.stats.defense / 100) *
      (1 - this.stats.resistance / 100);

    this.life -= reducedDamage;

    if (this.life <= 0) {
      this.life = 0;
      this.alive = false;
    }
  }

  drawLifeBar(ctx) {
    const barWidth = 80;
    const barHeight = 8;
    const x = this.position.x + this.width / 2 - barWidth / 2;
    const y = this.position.y - 15;
    const lifePercent = this.life / this.maxLife;

    ctx.fillStyle = "#222";
    ctx.fillRect(x, y, barWidth, barHeight);
    ctx.fillStyle = "crimson";
    ctx.fillRect(x, y, barWidth * lifePercent, barHeight);
    ctx.strokeStyle = "white";
    ctx.strokeRect(x, y, barWidth, barHeight);
  }

  reset() {
    this.life = this.maxLife;
    this.alive = true;
  }

  hit(projectile) {
    const blocked = Math.random() * 100 < this.stats.block;
    if (blocked) return false;

    return (
      projectile.position.x >= this.position.x + 20 &&
      projectile.position.x <= this.position.x + 20 + this.width - 38 &&
      projectile.position.y + projectile.height >= this.position.y + 22 &&
      projectile.position.y + projectile.height <=
        this.position.y + 22 + this.height - 34
    );
  }

  useSpecial(context) {
    const {
      skill,
      grid,
      projectiles,
      particles,
      boss,
      soundEffects,
      createExplosion,
      incrementScore,
    } = context;
    const name = this.class.name;

    const damage = skill.dano;

    soundEffects.playLevelUpSound();

    if (name === "Mago") {
      const superTiro = new Projectile(
        { x: this.position.x + this.width / 2 - 20, y: this.position.y },
        -15
      );
      superTiro.width = 40;
      superTiro.height = 80;
      superTiro.damage = damage;
      superTiro.color = "#00ffff";
      projectiles.push(superTiro);
      createExplosion(this.position, 30, "#00ffff");
    }

    if (name === "Guerreiro") {
      createExplosion(this.position, 100, "orange");
      grid.invaders.forEach((invader, i) => {
        invader.takeDamage(damage);
        if (invader.life <= 0) {
          createExplosion(invader.position, 10, "#941CFF");
          incrementScore(10);
          grid.invaders.splice(i, 1);
        }
      });
      if (boss) boss.takeDamage(damage);
    }

    if (name === "Paladino") {
      this.life = Math.min(
        this.maxLife,
        this.life + (skill.efeito?.heal || 200)
      );
      createExplosion(this.position, 80, "gold");

      grid.invaders.forEach((invader, i) => {
        invader.takeDamage(damage);
        if (invader.life <= 0) {
          createExplosion(invader.position, 10, "white");
          incrementScore(10);
          grid.invaders.splice(i, 1);
        }
      });
      if (boss) boss.takeDamage(damage);
    }
  }
}

export default Player;
