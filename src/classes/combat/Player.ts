import type { IDamageable } from "@game-types/entities";
import type {
  Position,
  PlayerClass,
  Skill,
  SpecialContext,
  Stats,
} from "@game-types/index";
import { ENTITY_SIZE } from "@utils/constants";
import { Projectile } from "@classes/entities";
import skills from "@utils/skills";

export class Player implements IDamageable {
  public readonly class: PlayerClass;
  public position: Position;
  public width: number = ENTITY_SIZE.player.width;
  public height: number = ENTITY_SIZE.player.height;
  public alive: boolean = true;
  public isStunned: boolean = false;
  public life: number;
  public maxLife: number;
  public stats: Stats;
  public skillCooldowns: Record<string, number> = {};

  private readonly velocity: number;
  private lastShotTime: number = 0;
  private readonly availableSkills: Record<string, Skill> | undefined;
  private readonly image: HTMLImageElement;

  public constructor(
    canvasWidth: number,
    canvasHeight: number,
    playerClass: PlayerClass,
  ) {
    this.class = playerClass;
    this.maxLife = playerClass.life;
    this.life = this.maxLife;
    this.stats = { ...playerClass.stats };
    this.velocity = playerClass.speed;
    this.availableSkills = skills[playerClass.name];
    this.image = this.loadImage(playerClass.image);

    this.position = {
      x: canvasWidth / 2 - this.width / 2,
      y: canvasHeight - this.height - 30,
    };
  }

  // ---------------------------------------------------------------------------
  // Movimento
  // ---------------------------------------------------------------------------

  public moveLeft(): void {
    this.position.x -= this.velocity;
  }

  public moveRight(): void {
    this.position.x += this.velocity;
  }

  // ---------------------------------------------------------------------------
  // Skills
  // ---------------------------------------------------------------------------

  public getSkill(skillName: string): Skill | null {
    return this.availableSkills?.[skillName] ?? null;
  }

  public canUseSkill(skillKey: string, cooldownTime: number): boolean {
    const now = Date.now();
    const lastUsed = this.skillCooldowns[skillKey] ?? 0;

    if (now - lastUsed >= cooldownTime) {
      this.skillCooldowns[skillKey] = now;
      return true;
    }

    return false;
  }

  // ---------------------------------------------------------------------------
  // Combate
  // ---------------------------------------------------------------------------

  public shoot(projectiles: Projectile[]): void {
    const now = Date.now();
    if (now - this.lastShotTime < this.stats.attackSpeed) return;

    const projectile = new Projectile(
      {
        x: this.position.x + this.width / 2 - 2,
        y: this.position.y + 2,
      },
      -10,
      this.stats.attack,
    );

    projectiles.push(projectile);
    this.lastShotTime = now;
  }

  public takeDamage(damage: number): void {
    const reduced =
      damage *
      (1 - this.stats.defense / 100) *
      (1 - this.stats.resistance / 100);

    this.life = Math.max(0, this.life - reduced);

    if (this.life <= 0) {
      this.alive = false;
    }
  }

  public hit(projectile: {
    position: Position;
    width: number;
    height: number;
  }): boolean {
    // Bloco antes de checar colisão
    if (Math.random() * 100 < this.stats.block) return false;

    // Hitbox reduzida — margem intencional para ser mais justo com o player
    return (
      projectile.position.x >= this.position.x + 20 &&
      projectile.position.x <= this.position.x + 20 + this.width - 38 &&
      projectile.position.y + projectile.height >= this.position.y + 22 &&
      projectile.position.y + projectile.height <=
        this.position.y + 22 + this.height - 34
    );
  }

  public useSpecial(context: SpecialContext): void {
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

    const { name } = this.class;
    const damage = skill.dano;

    soundEffects.playLevelUpSound();

    if (name === "Mago") {
      const superTiro = new Projectile(
        { x: this.position.x + this.width / 2 - 20, y: this.position.y },
        -15,
        damage,
      );
      superTiro.width = 40;
      superTiro.height = 80;
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

      boss?.takeDamage(damage);
    }

    if (name === "Paladino") {
      const healAmount =
        skill.efeito?.type === "heal_and_damage" ? skill.efeito.heal : 200;

      this.life = Math.min(this.maxLife, this.life + healAmount);
      createExplosion(this.position, 80, "gold");

      grid.invaders.forEach((invader, i) => {
        invader.takeDamage(damage);
        if (invader.life <= 0) {
          createExplosion(invader.position, 10, "white");
          incrementScore(10);
          grid.invaders.splice(i, 1);
        }
      });

      boss?.takeDamage(damage);
    }

    // Suprime o warning do TS sobre particles não usado
    void particles;
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  public draw(ctx: CanvasRenderingContext2D): void {
    ctx.drawImage(
      this.image,
      this.position.x,
      this.position.y,
      this.width,
      this.height,
    );
  }

  public drawLifeBar(ctx: CanvasRenderingContext2D): void {
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

  public reset(): void {
    this.life = this.maxLife;
    this.alive = true;
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  private loadImage(path: string): HTMLImageElement {
    const image = new Image();
    image.src = path;
    return image;
  }
}

export default Player;
