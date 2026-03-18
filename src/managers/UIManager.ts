// =============================================================================
//  src/managers/UIManager.ts
// =============================================================================

import type { PlayerClasses } from "@game-types/index";
import type { Player } from "@classes/combat/Player";
import { SKILL_COOLDOWN } from "@utils/constants";

interface PlayerStatsState {
  availablePoints: number;
  customStats: {
    attack: number;
    defense: number;
    attackSpeed: number;
    block: number;
    resistance: number;
  };
}

interface UIManagerConfig {
  state: PlayerStatsState;
  playerClasses: PlayerClasses;
}

export class UIManager {
  private readonly state: PlayerStatsState;
  private readonly playerClasses: PlayerClasses;

  public constructor(config: UIManagerConfig) {
    this.state = config.state;
    this.playerClasses = config.playerClasses;

    this.initTooltips();
    this.setupTooltipEvents();
    this.updateStatsPanel();
  }

  public updateStatsPanel(): void {
    const pool = document.getElementById("points-pool");
    if (pool) pool.textContent = String(this.state.availablePoints);
  }

  public changeStat(
    stat: keyof PlayerStatsState["customStats"],
    amount: number,
  ): void {
    const { state } = this;

    if (amount > 0 && state.availablePoints > 0) {
      state.customStats[stat] += amount;
      state.availablePoints--;
    } else if (amount < 0 && state.customStats[stat] > 0) {
      state.customStats[stat] += amount;
      state.availablePoints++;
    }

    this.updateStatsPanel();
  }

  public updateSkillHUD(player: Player): void {
    const now = Date.now();
    const keys = ["1", "2", "3", "4", "e"] as const;

    keys.forEach((key) => {
      const slot = document.querySelector<HTMLElement>(
        `.skill-slot[data-key="${key}"]`,
      );
      if (!slot) return;

      const overlay = slot.querySelector<HTMLElement>(".cooldown-overlay");
      if (!overlay) return;

      const lastUsed = player.skillCooldowns[key] ?? 0;
      const cooldownTime =
        key === "e" ? SKILL_COOLDOWN.special : SKILL_COOLDOWN.normal;
      const timePassed = now - lastUsed;

      if (timePassed < cooldownTime) {
        slot.classList.remove("ready");
        overlay.style.height = `${((cooldownTime - timePassed) / cooldownTime) * 100}%`;
      } else {
        slot.classList.add("ready");
        overlay.style.height = "0%";
      }
    });
  }

  public updateGameData(score: number, level: number, high: number): void {
    const scoreEl = document.querySelector<HTMLElement>(".score > span");
    const levelEl = document.querySelector<HTMLElement>(".level > span");
    const highEl = document.querySelector<HTMLElement>(".high > span");

    if (scoreEl) scoreEl.textContent = String(score);
    if (levelEl) levelEl.textContent = String(level);
    if (highEl) highEl.textContent = String(high);
  }

  private initTooltips(): void {
    document.querySelectorAll<HTMLElement>("[data-tooltip]").forEach((btn) => {
      const classKey = btn.getAttribute("data-class");
      if (!classKey) return;

      const data = this.playerClasses[classKey as keyof PlayerClasses];
      if (!data) return;

      btn.setAttribute(
        "aria-label",
        `${data.name}: Vida ${data.life} | Atk: ${data.stats.attack} | Def: ${data.stats.defense}`,
      );
    });
  }

  private setupTooltipEvents(): void {
    document.querySelectorAll<HTMLElement>("[data-tooltip]").forEach((item) => {
      item.addEventListener("mouseenter", (event: MouseEvent) => {
        const box = this.createTooltipBox(item);
        this.positionTooltip(box, event);

        const onMove = (e: MouseEvent): void => this.positionTooltip(box, e);
        const onLeave = (): void => {
          box.remove();
          item.removeEventListener("mousemove", onMove);
          item.removeEventListener("mouseleave", onLeave);
        };

        item.addEventListener("mousemove", onMove);
        item.addEventListener("mouseleave", onLeave);
      });
    });
  }

  private createTooltipBox(element: HTMLElement): HTMLElement {
    const classKey = element.getAttribute("data-class");
    const data = classKey
      ? this.playerClasses[classKey as keyof PlayerClasses]
      : null;

    const box = document.createElement("div");
    box.classList.add("tooltip");

    if (data) {
      box.innerHTML = `
        <img src="${data.image}" class="tooltip-img" alt="${data.name}">
        <div>
          <strong>${data.name}</strong><br>
          <small>${data.desc}</small><br>
          <span style="color: crimson">Vida: ${data.life} | Atk: ${data.stats.attack}</span>
        </div>
      `;
    }

    document.body.appendChild(box);
    return box;
  }

  private positionTooltip(box: HTMLElement, event: MouseEvent): void {
    box.style.top = `${event.pageY + 10}px`;
    box.style.left = `${event.pageX + 10}px`;
  }
}

export default UIManager;
