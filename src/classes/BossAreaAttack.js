class BossAreaAttack {
  constructor(position, radius, damage, duration = 800) {
    this.position = position;
    this.radius = radius;
    this.damage = damage;
    this.startTime = Date.now();
    this.duration = duration;
    this.active = true;
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    ctx.strokeStyle = "orange";
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  hit(player) {
    const px = player.position.x + player.width / 2;
    const py = player.position.y + player.height / 2;

    const dx = px - this.position.x;
    const dy = py - this.position.y;

    return Math.sqrt(dx * dx + dy * dy) < this.radius;
  }

  update() {
    if (Date.now() - this.startTime > this.duration) {
      this.active = false;
    }
  }
}

export default BossAreaAttack;
