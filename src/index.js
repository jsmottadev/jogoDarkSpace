import Grid from "./classes/Grid.js";
import Obstacle from "./classes/Obstacle.js";
import Particle from "./classes/Particle.js";
import Player from "./classes/Player.js";
import SoundEffects from "./classes/SoundEffects.js";
import { GameState } from "./utils/constants.js";
import playerClasses from "./utils/playerClasses.js";
import Boss from "./classes/Boss.js";

const soundEffects = new SoundEffects();

const startScreen = document.querySelector(".start-screen");
const gameOverScreen = document.querySelector(".game-over");
const scoreUi = document.querySelector(".score-ui");
const scoreElement = scoreUi.querySelector(".score > span");
const levelElement = scoreUi.querySelector(".level > span");
const highElement = scoreUi.querySelector(".high > span");
const buttonPlay = document.querySelector(".button-play");
const buttonRestart = document.querySelector(".button-restart");
const classSelect = document.querySelector(".class-select");
const classScreen = document.querySelector(".class-select");
import { UIManager } from "./classes/UIManager.js";

document.querySelector(".skill-hud").classList.remove("hidden");

// const GameTheme = {
//   colors: {
//     mago: "#00ffff",
//     guerreiro: "orange",
//     paladino: "gold",
//     invaderExplosion: "#941CFF",
//     obstaclePrimary: "crimson",
//     obstacleSecondary: "orange",
//   },
//   intervals: {
//     invaderShoot: 1000,
//     skillCooldown: 3000,
//     specialCooldown: 10000,
//   },
// };

// comentado para tentar implementar depois

const playerStatsState = {
  availablePoints: 50,
  customStats: {
    attack: 50,
    defense: 50,
    attackSpeed: 100,
    block: 10,
    resistance: 10,
  },
};

UIManager.setup({
  state: playerStatsState,
  playerClasses: playerClasses,
  soundEffects: soundEffects,
});

gameOverScreen.classList.add("hidden");
classSelect.style.display = "none";

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

ctx.imageSmoothingEnabled = false;

let selectedClass = playerClasses.mage;
let invaderShootInterval = null;
let boss = null;

let currentState = GameState.START;

const gameData = {
  score: 0,
  level: 1,
  high: 0,
};

const showGameData = () => {
  scoreElement.textContent = gameData.score;
  levelElement.textContent = gameData.level;
  highElement.textContent = gameData.high;
};

let player = new Player(canvas.width, canvas.height, selectedClass);
const grid = new Grid(1, 1);

const playerProjectiles = [];
const invadersProjectiles = [];
const particles = [];
const obstacles = [];
const bossProjectiles = [];

const initObstacles = () => {
  const x = canvas.width / 2 - 50;
  const y = canvas.height - 250;
  const offset = canvas.width * 0.15;
  const color = "crimson";

  const obstacle1 = new Obstacle({ x: x - offset, y }, 100, 20, color);
  const obstacle2 = new Obstacle({ x: x + offset, y }, 100, 20, "orange");

  obstacles.push(obstacle1);
  obstacles.push(obstacle2);
};

initObstacles();

const keys = {
  left: false,
  right: false,
  shoot: {
    pressed: false,
    released: true,
  },
};

const incrementScore = (value) => {
  gameData.score += value;

  if (gameData.score > gameData.high) {
    gameData.high = gameData.score;
  }
};

const incrementLevel = () => {
  gameData.level += 1;
};

const drawObstacles = () => {
  obstacles.forEach((obstacle) => obstacle.draw(ctx));
};

const drawProjectiles = () => {
  const projectiles = [...playerProjectiles, ...invadersProjectiles];

  projectiles.forEach((projectile) => {
    projectile.draw(ctx);
    projectile.update();
  });
};

const drawParticles = () => {
  particles.forEach((particle) => {
    particle.draw(ctx);
    particle.update();
  });
};

const clearProjectiles = () => {
  playerProjectiles.forEach((projectile, i) => {
    if (projectile.position.y <= 0) {
      playerProjectiles.splice(i, 1);
    }
  });

  invadersProjectiles.forEach((projectile, i) => {
    if (projectile.position.y > canvas.height) {
      invadersProjectiles.splice(i, 1);
    }
  });
};

const clearParticles = () => {
  particles.forEach((particle, index) => {
    if (particle.opacity <= 0) {
      particles.splice(index, 1);
    }
  });
};

const startInvaderShoot = () => {
  if (invaderShootInterval) return;

  invaderShootInterval = setInterval(() => {
    const invader = grid.getRandomInvader();
    if (invader) {
      invader.shoot(invadersProjectiles);
    }
  }, 1000);
};

const createExplosion = (position, size, color) => {
  for (let i = 0; i < size; i += 1) {
    const particle = new Particle(
      {
        x: position.x,
        y: position.y,
      },
      {
        x: (Math.random() - 0.5) * 1.5,
        y: (Math.random() - 0.5) * 1.5,
      },
      2,
      color
    );

    particles.push(particle);
  }
};

const checkShootInvaders = () => {
  grid.invaders.forEach((invader, invaderIndex) => {
    playerProjectiles.some((projectile, projectileIndex) => {
      if (invader.hit(projectile)) {
        if (projectile.effect) {
          invader.applyEffect(projectile.effect);
        }

        const damageToApply = projectile.damage || player.stats.attack;
        invader.takeDamage(damageToApply);

        if (projectile.width < 30) {
          playerProjectiles.splice(projectileIndex, 1);
        }

        if (invader.life <= 0) {
          soundEffects.playHitSound();
          createExplosion(
            {
              x: invader.position.x + invader.width / 2,
              y: invader.position.y + invader.height / 2,
            },
            10,
            "#941CFF"
          );
          incrementScore(10);
          grid.invaders.splice(invaderIndex, 1);
        }
        return true;
      }
    });
  });
};

const checkShootPlayer = () => {
  invadersProjectiles.some((projectile, index) => {
    if (player.hit(projectile)) {
      soundEffects.playExplosionSound();
      invadersProjectiles.splice(index, 1);

      player.takeDamage(projectile.damage);

      if (!player.alive) {
        gameOver();
      }
    }
  });
};

const checkShootObstacles = () => {
  obstacles.forEach((obstacle) => {
    playerProjectiles.some((projectile, i) => {
      if (obstacle.hit(projectile)) {
        playerProjectiles.splice(i, 1);
        return;
      }
    });

    invadersProjectiles.some((projectile, i) => {
      if (obstacle.hit(projectile)) {
        invadersProjectiles.splice(i, 1);
        return;
      }
    });
  });
};

const checkShootBoss = () => {
  if (!boss) return;

  playerProjectiles.some((projectile, index) => {
    if (boss.hit(projectile)) {
      const damageToDo = projectile.damage || player.stats.attack;
      boss.takeDamage(damageToDo);
      if (projectile.effect) {
        boss.applyEffect(projectile.effect);
      }

      playerProjectiles.splice(index, 1);

      if (!boss.alive) {
        createExplosion(boss.position, 50, "crimson");
        boss = null;
        incrementScore(500);
      }
      return true;
    }
  });
};

const bossLevels = [5, 10, 15, 20, 30];

const spawnGrid = () => {
  if (grid.invaders.length === 0 && !boss) {
    soundEffects.playLevelUpSound();

    if (bossLevels.includes(gameData.level)) {
      boss = new Boss(canvas.width, canvas.height, "victor");
    } else {
      grid.rows = Math.round(Math.random() * 2 + 0);
      grid.cols = Math.round(Math.random() * 7 + 1);
      grid.restart();
    }

    incrementLevel();
  }
};

const gameOver = () => {
  createExplosion(
    {
      x: player.position.x + player.width / 2,
      y: player.position.y + player.height / 2,
    },
    10,
    "white"
  );

  createExplosion(
    {
      x: player.position.x + player.width / 2,
      y: player.position.y + player.height / 2,
    },
    5,
    "#4D9BE6"
  );

  createExplosion(
    {
      x: player.position.x + player.width / 2,
      y: player.position.y + player.height / 2,
    },
    5,
    "crimson"
  );

  currentState = GameState.GAME_OVER;
  player.alive = false;
  document.querySelector(".skill-hud").classList.remove("active");
  gameOverScreen.classList.remove("hidden");
  gameOverScreen.classList.add("active");
};

const skillKeysMap = {
  Mago: ["Fogo", "Raio", "Vento", "Agua", "Especial"],
  Guerreiro: ["Corte", "Impacto", "Investida", "Grito", "Especial"],
  Paladino: ["Luz", "Julgamento", "Bencao", "Punicao", "Especial"],
};

const handleSkillUsage = (key) => {
  if (currentState !== GameState.PLAYING) return;

  const className = player.class.name;
  let skillIndex;
  let cooldown = 3000;

  if (key === "e" || key === "5") {
    skillIndex = 4;
    cooldown = 10000;
  } else {
    skillIndex = parseInt(key) - 1;
  }

  const skillName = skillKeysMap[className][skillIndex];
  const skill = player.getSkill(skillName);

  if (skill && player.canUseSkill(key, cooldown)) {
    if (skillName === "Especial") {
      player.useSpecial({
        skill,
        grid,
        projectiles: playerProjectiles,
        particles,
        boss,
        soundEffects,
        createExplosion,
        incrementScore,
      });
    } else {
      player.shoot(playerProjectiles);
      const proj = playerProjectiles[playerProjectiles.length - 1];
      if (proj) {
        proj.damage = skill.dano;
        proj.effect = skill.efeito;
      }
    }
  }
};

const gameLoop = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const skillHud = document.querySelector(".skill-hud");

  if (currentState === GameState.PLAYING) {
    skillHud.classList.add("active");
    showGameData();
    spawnGrid();
    updateSkillHUD();

    drawProjectiles();
    drawParticles();
    drawObstacles();

    clearProjectiles();
    clearParticles();

    checkShootInvaders();
    checkShootPlayer();
    checkShootObstacles();
    checkShootBoss();

    grid.draw(ctx);
    grid.update(player.alive);

    grid.draw(ctx);
    grid.update(player.alive);

    if (boss && boss.alive) {
      boss.draw(ctx);
      boss.think(player, invadersProjectiles, createExplosion);
      boss.drawLifeBar(ctx);
      boss.shoot(invadersProjectiles);
      boss.think(player, bossProjectiles, createExplosion);

      bossProjectiles.forEach((atk, index) => {
        atk.update?.(player);
        atk.draw(ctx);

        if (atk.hit && atk.hit(player)) {
          player.takeDamage(atk.damage);
          bossProjectiles.splice(index, 1);
        }

        if (atk.exploded) {
          bossProjectiles.splice(index, 1);
        }
      });

      if (
        boss.position.x + boss.width >= canvas.width ||
        boss.position.x <= 0
      ) {
        boss.velocity = -boss.velocity;
      }
      boss.position.x += boss.velocity;
    }
    if (keys.shoot.pressed && keys.shoot.released) {
      soundEffects.playShootSound();
      player.shoot(playerProjectiles);
      keys.shoot.released = false;
    }

    if (keys.left && player.position.x >= 0) {
      player.moveLeft();
    }

    if (keys.right && player.position.x <= canvas.width - player.width) {
      player.moveRight();
    }

    player.draw(ctx);
    player.drawLifeBar(ctx);
  }

  bossProjectiles.forEach((proj, i) => {
    proj.update();
    proj.draw(ctx);

    if (proj.hit(player)) {
      player.takeDamage(proj.damage);
      bossProjectiles.splice(i, 1);
    }
  });

  if (currentState === GameState.GAME_OVER) {
    checkShootObstacles();

    drawProjectiles();
    drawParticles();
    drawObstacles();

    clearProjectiles();
    clearParticles();

    grid.draw(ctx);
    grid.update(player.alive);
  }

  requestAnimationFrame(gameLoop);
};

const restartGame = () => {
  gameOverScreen.classList.remove("active");
  gameOverScreen.classList.add("hidden");

  currentState = GameState.PLAYING;

  player = new Player(canvas.width, canvas.height, selectedClass);
  player.position.x = canvas.width / 2 - player.width / 2;

  grid.rows = 1;
  grid.cols = 1;
  grid.invadersVelocity = 1;
  grid.restart();

  boss = null;

  playerProjectiles.length = 0;
  invadersProjectiles.length = 0;
  bossProjectiles.length = 0;
  particles.length = 0;

  gameData.score = 0;
  gameData.level = 1;

  document.querySelector(".skill-hud").classList.remove("active");
};

window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();

  if (key === " " || key === "spacebar") {
    event.preventDefault();
    return;
  }

  if (key === "a") keys.left = true;
  if (key === "d") keys.right = true;
  if (key === "w") keys.shoot.pressed = true;
});

window.addEventListener("keyup", (event) => {
  const key = event.key.toLowerCase();

  if (key === "a") keys.left = false;
  if (key === "d") keys.right = false;
  if (key === "w") {
    keys.shoot.pressed = false;
    keys.shoot.released = true;
  }
  if (["1", "2", "3", "4", "5", "e"].includes(key)) {
    handleSkillUsage(key);
  }
});

buttonPlay.addEventListener("click", () => {
  startScreen.style.display = "none";
  classSelect.style.display = "flex";
  startScreen.classList.remove("active");
  startScreen.classList.add("hidden");

  setTimeout(() => {
    classScreen.classList.remove("hidden");
    classScreen.classList.add("active");
  }, 600);

  document.querySelector(".class-select").style.display = "flex";
});

document.querySelectorAll(".class-select button").forEach((btn) => {
  btn.addEventListener("click", () => {
    const classKey = btn.dataset.class;
    selectedClass = playerClasses[classKey];

    player = new Player(canvas.width, canvas.height, selectedClass);

    classScreen.classList.remove("active");
    classScreen.classList.add("hidden");

    setTimeout(() => {
      scoreUi.style.display = "block";
      currentState = GameState.PLAYING;
      startInvaderShoot();
    }, 600);
  });
});

buttonRestart.addEventListener("click", restartGame);

const updateSkillHUD = () => {
  if (currentState !== GameState.PLAYING) return;

  const now = Date.now();
  const keys = ["1", "2", "3", "4", "e"];

  keys.forEach((key) => {
    const slot = document.querySelector(`.skill-slot[data-key="${key}"]`);
    if (!slot) return;

    const overlay = slot.querySelector(".cooldown-overlay");
    const lastUsed = player.skillCooldowns[key] || 0;
    const cooldownTime = key === "e" || key === "5" ? 10000 : 3000;
    const timePassed = now - lastUsed;

    if (timePassed < cooldownTime) {
      //  INDISPONÍVEL (Recarregando)
      slot.classList.remove("ready");

      const percentage = ((cooldownTime - timePassed) / cooldownTime) * 100;
      overlay.style.height = `${percentage}%`;
    } else {
      //  DISPONÍVEL (Pronta para uso)
      slot.classList.add("ready");
      overlay.style.height = "0%";
    }
  });
};

gameLoop();
