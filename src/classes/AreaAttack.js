class AreaAttack {
  constructor(position, radius, damage, delay) {
    this.position = position;
    this.radius = radius;
    this.damage = damage;
    this.delay = delay;

    this.startTime = Date.now();
    this.exploded = false;
  }

  update(player) {
    if (this.exploded) return;

    if (Date.now() - this.startTime >= this.delay) {
      const dx = player.position.x - this.position.x;
      const dy = player.position.y - this.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance <= this.radius) {
        player.takeDamage(this.damage);
      }

      this.exploded = true;
    }
  }

  draw(ctx) {
    if (this.exploded) return;

    ctx.strokeStyle = "orange";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    ctx.stroke();
  }
}

export default AreaAttack;
