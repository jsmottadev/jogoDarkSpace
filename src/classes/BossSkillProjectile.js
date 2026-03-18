class BossSkillProjectile {
  constructor(position, velocity, damage, radius = 6, color = "crimson") {
    this.position = { ...position };
    this.velocity = velocity;
    this.damage = damage;
    this.radius = radius;
    this.color = color;
    this.active = true;
  }

  update() {
    this.position.y += this.velocity;
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
  }

  hit(player) {
    return (
      this.position.x > player.position.x &&
      this.position.x < player.position.x + player.width &&
      this.position.y > player.position.y &&
      this.position.y < player.position.y + player.height
    );
  }
}

export default BossSkillProjectile;
