export const UIManager = {
  setup(config) {
    this.state = config.state;
    this.playerClasses = config.playerClasses;
    this.soundEffects = config.soundEffects;

    this.initTooltipsInfo();
    this.setupTooltipEvents();
    this.updateStatsUI();
  },

  updateStatsUI() {
    const pool = document.getElementById("points-pool");
    if (pool) pool.textContent = this.state.availablePoints;
  },

  changeStat(stat, amount) {
    const { state } = this;
    if (amount > 0 && state.availablePoints > 0) {
      state.customStats[stat] += amount;
      state.availablePoints--;
    } else if (amount < 0 && state.customStats[stat] > 0) {
      state.customStats[stat] += amount;
      state.availablePoints++;
    }
    this.updateStatsUI();
  },

  initTooltipsInfo() {
    const buttons = document.querySelectorAll("[data-tooltip]");
    buttons.forEach((btn) => {
      const classKey = btn.getAttribute("data-class");
      const data = this.playerClasses[classKey];
      if (data) {
        const infoText = `${data.name}: Vida ${data.life} | Atk: ${data.stats.attack} | Def: ${data.stats.defense}`;
        btn.setAttribute("aria-label", infoText);
      }
    });
  },

  createTooltipBox(element) {
    const tooltipBox = document.createElement("div");
    tooltipBox.classList.add("tooltip");
    const classKey = element.getAttribute("data-class");
    const data = this.playerClasses[classKey];

    if (data) {
      tooltipBox.innerHTML = `
        <img src="${data.image}" class="tooltip-img">
        <div>
          <strong>${data.name}</strong><br>
          <small>${data.desc}</small><br>
          <span style="color: crimson">Vida: ${data.life} | Atk: ${data.stats.attack}</span>
        </div>
      `;
    }
    document.body.appendChild(tooltipBox);
    return tooltipBox;
  },

  setupTooltipEvents() {
    const tooltips = document.querySelectorAll("[data-tooltip]");
    tooltips.forEach((item) => {
      item.addEventListener("mouseenter", (event) => {
        const box = this.createTooltipBox(item);
        box.style.top = event.pageY + 10 + "px";
        box.style.left = event.pageX + 10 + "px";

        const move = (e) => {
          box.style.top = e.pageY + 10 + "px";
          box.style.left = e.pageX + 10 + "px";
        };

        const leave = () => {
          box.remove();
          item.removeEventListener("mousemove", move);
          item.removeEventListener("mouseleave", leave);
        };

        item.addEventListener("mousemove", move);
        item.addEventListener("mouseleave", leave);
      });
    });
  },
};
