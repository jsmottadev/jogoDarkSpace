class BossProjectile {
  constructor(position, velocity, damage, color = "purple") {
    this.position = { ...position };
    this.velocity = velocity;
    this.damage = damage;

    this.width = 12;
    this.height = 20;
    this.color = color;
    this.active = true;
  }

  update() {
    this.position.y += this.velocity;
  }

  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
  }

  hit(player) {
    return (
      this.position.x < player.position.x + player.width &&
      this.position.x + this.width > player.position.x &&
      this.position.y < player.position.y + player.height &&
      this.position.y + this.height > player.position.y
    );
  }
}

export default BossProjectile;
