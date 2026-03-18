// =============================================================================
//  src/managers/GameLoop.ts
// =============================================================================

import { GameState } from "@utils/constants";
import type { GameStateValue, GameData, Position } from "@game-types/index";
import type { IProjectile, IAreaAttack } from "@game-types/entities";
import { Particle, Obstacle, Projectile } from "@classes/entities";
import { Player, Boss, Grid } from "@classes/combat";
import { SoundEffects } from "./SoundEffects";
import { UIManager } from "./UIManager";
import {
  BOSS_LEVELS,
  SCORE_VALUES,
  SKILL_KEY_MAP,
  SKILL_COOLDOWN,
} from "@utils/constants";

type BossProjectileArray = Array<IProjectile | IAreaAttack>;

interface GameLoopConfig {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  player: Player;
  grid: Grid;
  soundEffects: SoundEffects;
  uiManager: UIManager;
  gameData: GameData;
  onGameOver: () => void;
  onLevelUp: () => void;
}

export class GameLoop {
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;

  private player: Player;
  private readonly grid: Grid;
  private boss: Boss | null = null;

  private readonly playerProjectiles: Projectile[] = [];
  private readonly invaderProjectiles: Projectile[] = [];
  private readonly bossProjectiles: BossProjectileArray = [];
  private readonly particles: Particle[] = [];
  private readonly obstacles: Obstacle[] = [];

  private readonly soundEffects: SoundEffects;
  private readonly uiManager: UIManager;

  private currentState: GameStateValue = GameState.START;
  private readonly gameData: GameData;

  private readonly onGameOver: () => void;
  private readonly onLevelUp: () => void;

  private readonly keys = {
    left: false,
    right: false,
    shoot: { pressed: false, released: true },
  };

  private invaderShootInterval: ReturnType<typeof setInterval> | null = null;

  public constructor(config: GameLoopConfig) {
    this.canvas = config.canvas;
    this.ctx = config.ctx;
    this.player = config.player;
    this.grid = config.grid;
    this.soundEffects = config.soundEffects;
    this.uiManager = config.uiManager;
    this.gameData = config.gameData;
    this.onGameOver = config.onGameOver;
    this.onLevelUp = config.onLevelUp;
    this.initObstacles();
    this.bindInput();
  }

  public start(): void {
    this.currentState = GameState.PLAYING;
    this.startInvaderShoot();
    this.tick();
  }

  public restart(newPlayer: Player): void {
    this.player = newPlayer;
    this.currentState = GameState.PLAYING;
    this.boss = null;
    this.playerProjectiles.length = 0;
    this.invaderProjectiles.length = 0;
    this.bossProjectiles.length = 0;
    this.particles.length = 0;
    this.gameData.score = 0;
    this.gameData.level = 1;
    this.grid.rows = 1;
    this.grid.cols = 1;
    this.grid.invadersVelocity = 1;
    this.grid.restart();
  }

  public getState(): GameStateValue {
    return this.currentState;
  }

  private initObstacles(): void {
    const x = this.canvas.width / 2 - 50;
    const y = this.canvas.height - 250;
    const offset = this.canvas.width * 0.15;
    this.obstacles.push(new Obstacle({ x: x - offset, y }, 100, 20, "crimson"));
    this.obstacles.push(new Obstacle({ x: x + offset, y }, 100, 20, "orange"));
  }

  private startInvaderShoot(): void {
    if (this.invaderShootInterval) return;
    this.invaderShootInterval = setInterval(() => {
      this.grid.getRandomInvader()?.shoot(this.invaderProjectiles);
    }, 1_000);
  }

  private tick(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    if (this.currentState === GameState.PLAYING) this.updatePlaying();
    if (this.currentState === GameState.GAME_OVER) this.updateGameOver();
    requestAnimationFrame(() => this.tick());
  }

  private updatePlaying(): void {
    this.uiManager.updateGameData(
      this.gameData.score,
      this.gameData.level,
      this.gameData.high,
    );
    this.uiManager.updateSkillHUD(this.player);
    this.spawnNextWave();
    this.drawAndUpdateProjectiles();
    this.drawAndUpdateParticles();
    this.drawObstacles();
    this.grid.draw(this.ctx);
    this.grid.update(this.player.alive);
    if (this.boss?.alive) this.updateBoss();
    this.checkCollisions();
    this.clearOffscreenProjectiles();
    this.clearFadedParticles();
    this.handlePlayerInput();
    this.player.draw(this.ctx);
    this.player.drawLifeBar(this.ctx);
  }

  private updateGameOver(): void {
    this.drawAndUpdateProjectiles();
    this.drawAndUpdateParticles();
    this.drawObstacles();
    this.clearOffscreenProjectiles();
    this.clearFadedParticles();
    this.checkShootObstacles();
    this.grid.draw(this.ctx);
    this.grid.update(false);
  }

  private updateBoss(): void {
    if (!this.boss) return;
    this.boss.draw(this.ctx);
    this.boss.drawLifeBar(this.ctx);
    this.boss.think(this.player, this.bossProjectiles, this.createExplosion);
    this.boss.shoot(this.bossProjectiles);
    this.boss.update(this.canvas.width);

    for (let i = this.bossProjectiles.length - 1; i >= 0; i--) {
      const atk = this.bossProjectiles[i]!;
      atk.update?.(this.player);
      atk.draw(this.ctx);

      if (atk.hit?.(this.player)) {
        this.player.takeDamage(atk.damage);
        this.bossProjectiles.splice(i, 1);
        if (!this.player.alive) this.triggerGameOver();
        continue;
      }

      if (atk.exploded) this.bossProjectiles.splice(i, 1);
    }
  }

  private spawnNextWave(): void {
    if (this.grid.invaders.length > 0 || this.boss) return;
    this.soundEffects.playLevelUpSound();
    this.onLevelUp();
    if ((BOSS_LEVELS as readonly number[]).includes(this.gameData.level)) {
      this.boss = new Boss(this.canvas.width, this.canvas.height, "victor");
    } else {
      this.grid.rows = Math.round(Math.random() * 2);
      this.grid.cols = Math.round(Math.random() * 7 + 1);
      this.grid.restart();
    }
  }

  private checkCollisions(): void {
    this.checkShootInvaders();
    this.checkShootPlayer();
    this.checkShootObstacles();
    this.checkShootBoss();
  }

  private checkShootInvaders(): void {
    this.grid.invaders.forEach((invader, invaderIndex) => {
      this.playerProjectiles.some((projectile, projectileIndex) => {
        if (!invader.hit(projectile)) return false;
        if (projectile.effect) invader.applyEffect(projectile.effect);
        invader.takeDamage(projectile.damage);
        if (projectile.width < 30)
          this.playerProjectiles.splice(projectileIndex, 1);
        if (invader.life <= 0) {
          this.soundEffects.playHitSound();
          this.createExplosion(
            {
              x: invader.position.x + invader.width / 2,
              y: invader.position.y + invader.height / 2,
            },
            10,
            "#941CFF",
          );
          this.incrementScore(SCORE_VALUES.invader);
          this.grid.invaders.splice(invaderIndex, 1);
        }
        return true;
      });
    });
  }

  private checkShootPlayer(): void {
    this.invaderProjectiles.some((projectile, index) => {
      if (!this.player.hit(projectile)) return false;
      this.soundEffects.playExplosionSound();
      this.invaderProjectiles.splice(index, 1);
      this.player.takeDamage(projectile.damage);
      if (!this.player.alive) this.triggerGameOver();
      return true;
    });
  }

  private checkShootObstacles(): void {
    this.obstacles.forEach((obstacle) => {
      this.playerProjectiles.some((proj, i) => {
        if (obstacle.hit(proj)) {
          this.playerProjectiles.splice(i, 1);
          return true;
        }
        return false;
      });
      this.invaderProjectiles.some((proj, i) => {
        if (obstacle.hit(proj)) {
          this.invaderProjectiles.splice(i, 1);
          return true;
        }
        return false;
      });
    });
  }

  private checkShootBoss(): void {
    if (!this.boss) return;
    this.playerProjectiles.some((projectile, index) => {
      if (!this.boss!.hit(projectile)) return false;
      this.boss!.takeDamage(projectile.damage);
      if (projectile.effect) this.boss!.applyEffect(projectile.effect);
      this.playerProjectiles.splice(index, 1);
      if (!this.boss!.alive) {
        this.createExplosion(this.boss!.position, 50, "crimson");
        this.boss = null;
        this.incrementScore(SCORE_VALUES.boss);
      }
      return true;
    });
  }

  private triggerGameOver(): void {
    const center: Position = {
      x: this.player.position.x + this.player.width / 2,
      y: this.player.position.y + this.player.height / 2,
    };
    this.createExplosion(center, 10, "white");
    this.createExplosion(center, 5, "#4D9BE6");
    this.createExplosion(center, 5, "crimson");
    this.currentState = GameState.GAME_OVER;
    this.player.alive = false;
    this.onGameOver();
  }

  public handleSkillKey(key: string): void {
    if (this.currentState !== GameState.PLAYING) return;
    if (this.player.isStunned) return;

    const skillKeys = SKILL_KEY_MAP[this.player.class.name];
    if (!skillKeys) return;

    const isSpecial = key === "e" || key === "5";
    const skillIndex = isSpecial ? 4 : parseInt(key) - 1;
    const cooldown = isSpecial ? SKILL_COOLDOWN.special : SKILL_COOLDOWN.normal;
    const skillName = skillKeys[skillIndex];
    if (!skillName) return;

    const skill = this.player.getSkill(skillName);
    if (!skill || !this.player.canUseSkill(key, cooldown)) return;

    if (skillName === "Especial") {
      this.player.useSpecial({
        skill,
        grid: this.grid,
        projectiles: this.playerProjectiles,
        particles: this.particles,
        boss: this.boss,
        soundEffects: this.soundEffects,
        createExplosion: this.createExplosion,
        incrementScore: this.incrementScore,
      });
    } else {
      this.player.shoot(this.playerProjectiles);
      const proj = this.playerProjectiles.at(-1);
      if (proj) {
        proj.damage = skill.dano;
        proj.effect = skill.efeito ?? null;
      }
    }
  }

  private handlePlayerInput(): void {
    if (this.player.isStunned) return;
    if (this.keys.shoot.pressed && this.keys.shoot.released) {
      this.soundEffects.playShootSound();
      this.player.shoot(this.playerProjectiles);
      this.keys.shoot.released = false;
    }
    if (this.keys.left && this.player.position.x >= 0) this.player.moveLeft();
    if (
      this.keys.right &&
      this.player.position.x <= this.canvas.width - this.player.width
    )
      this.player.moveRight();
  }

  private bindInput(): void {
    window.addEventListener("keydown", (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (key === " " || key === "spacebar") {
        event.preventDefault();
        return;
      }
      if (key === "a") this.keys.left = true;
      if (key === "d") this.keys.right = true;
      if (key === "w") this.keys.shoot.pressed = true;
    });

    window.addEventListener("keyup", (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (key === "a") this.keys.left = false;
      if (key === "d") this.keys.right = false;
      if (key === "w") {
        this.keys.shoot.pressed = false;
        this.keys.shoot.released = true;
      }
      if (["1", "2", "3", "4", "5", "e"].includes(key))
        this.handleSkillKey(key);
    });
  }

  private drawAndUpdateProjectiles(): void {
    [...this.playerProjectiles, ...this.invaderProjectiles].forEach((p) => {
      p.draw(this.ctx);
      p.update();
    });
  }

  private drawAndUpdateParticles(): void {
    this.particles.forEach((p) => {
      p.draw(this.ctx);
      p.update();
    });
  }

  private drawObstacles(): void {
    this.obstacles.forEach((o) => o.draw(this.ctx));
  }

  private clearOffscreenProjectiles(): void {
    for (let i = this.playerProjectiles.length - 1; i >= 0; i--) {
      if (this.playerProjectiles[i]!.position.y <= 0)
        this.playerProjectiles.splice(i, 1);
    }
    for (let i = this.invaderProjectiles.length - 1; i >= 0; i--) {
      if (this.invaderProjectiles[i]!.position.y > this.canvas.height)
        this.invaderProjectiles.splice(i, 1);
    }
  }

  private clearFadedParticles(): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      if (this.particles[i]!.opacity <= 0) this.particles.splice(i, 1);
    }
  }

  public readonly createExplosion = (
    position: Position,
    size: number,
    color: string,
  ): void => {
    for (let i = 0; i < size; i++) {
      this.particles.push(
        new Particle(
          { x: position.x, y: position.y },
          { x: (Math.random() - 0.5) * 1.5, y: (Math.random() - 0.5) * 1.5 },
          2,
          color,
        ),
      );
    }
  };

  public readonly incrementScore = (value: number): void => {
    this.gameData.score += value;
    if (this.gameData.score > this.gameData.high)
      this.gameData.high = this.gameData.score;
  };
}

export default GameLoop;
