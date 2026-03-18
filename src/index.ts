import { SoundEffects, UIManager, GameLoop } from "@managers";
import { Player, Grid } from "@classes/combat";
import playerClasses from "@utils/playerClasses";
import type { PlayerClass, GameData } from "@game-types/index";

const canvas = document.querySelector<HTMLCanvasElement>("canvas")!;
const ctx = canvas.getContext("2d")!;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
ctx.imageSmoothingEnabled = false;

const startScreen = document.querySelector<HTMLElement>(".start-screen")!;
const gameOverScreen = document.querySelector<HTMLElement>(".game-over")!;
const scoreUi = document.querySelector<HTMLElement>(".score-ui")!;
const classSelectScreen = document.querySelector<HTMLElement>(".class-select")!;
const buttonPlay = document.querySelector<HTMLButtonElement>(".button-play")!;
const buttonRestart =
  document.querySelector<HTMLButtonElement>(".button-restart")!;
const skillHud = document.querySelector<HTMLElement>(".skill-hud")!;

let selectedClass: PlayerClass = playerClasses.mage;

const gameData: GameData = { score: 0, level: 1, high: 0 };

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

const soundEffects = new SoundEffects();

const uiManager = new UIManager({
  state: playerStatsState,
  playerClasses,
  soundEffects,
});

const grid = new Grid(1, 1);
let player = new Player(canvas.width, canvas.height, selectedClass);

const gameLoop = new GameLoop({
  canvas,
  ctx,
  player,
  grid,
  soundEffects,
  uiManager,
  gameData,
  onGameOver: () => {
    skillHud.classList.remove("active");
    gameOverScreen.classList.remove("hidden");
    gameOverScreen.classList.add("active");
  },
  onLevelUp: () => {
    gameData.level += 1;
  },
});

gameLoop.start();

buttonPlay.addEventListener("click", () => {
  startScreen.classList.remove("active");
  startScreen.classList.add("hidden");

  setTimeout(() => {
    classSelectScreen.classList.remove("hidden");
    classSelectScreen.classList.add("active");
    classSelectScreen.style.display = "flex";
  }, 600);
});

document
  .querySelectorAll<HTMLButtonElement>(".class-select button")
  .forEach((btn) => {
    btn.addEventListener("click", () => {
      const classKey = btn.dataset["class"] as
        | keyof typeof playerClasses
        | undefined;
      if (!classKey || !playerClasses[classKey]) return;

      selectedClass = playerClasses[classKey];
      player = new Player(canvas.width, canvas.height, selectedClass);

      gameLoop.restart(player);

      classSelectScreen.classList.remove("active");
      classSelectScreen.classList.add("hidden");

      setTimeout(() => {
        scoreUi.style.display = "block";
        skillHud.classList.add("active");
      }, 600);
    });
  });

buttonRestart.addEventListener("click", () => {
  gameOverScreen.classList.remove("active");
  gameOverScreen.classList.add("hidden");

  player = new Player(canvas.width, canvas.height, selectedClass);
  player.position.x = canvas.width / 2 - player.width / 2;

  gameLoop.restart(player);

  skillHud.classList.remove("active");
});

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

document
  .querySelectorAll<HTMLButtonElement>("[data-stat][data-amount]")
  .forEach((btn) => {
    btn.addEventListener("click", () => {
      const stat = btn.dataset[
        "stat"
      ] as keyof typeof playerStatsState.customStats;
      const amount = parseInt(btn.dataset["amount"] ?? "0");
      if (!stat || isNaN(amount)) return;
      uiManager.changeStat(stat, amount);
    });
  });
