import { CONFIG } from './config.js';

export class Bullet {
  constructor(x, y, direction) {
    this.speed = CONFIG.BULLET.SPEED;
    this.size = CONFIG.BULLET.SIZE;
    this.x = x;
    this.y = y;
    const diagSpeed = this.speed / Math.sqrt(2);
    switch (direction) {
      case 'up': this.vx = 0; this.vy = -this.speed; break;
      case 'down': this.vx = 0; this.vy = this.speed; break;
      case 'left': this.vx = -this.speed; this.vy = 0; break;
      case 'right': this.vx = this.speed; this.vy = 0; break;
      case 'up-right': this.vx = diagSpeed; this.vy = -diagSpeed; break;
      case 'up-left': this.vx = -diagSpeed; this.vy = -diagSpeed; break;
      case 'down-right': this.vx = diagSpeed; this.vy = diagSpeed; break;
      case 'down-left': this.vx = -diagSpeed; this.vy = diagSpeed; break;
      default: this.vx = 0; this.vy = 0;
    }
  }

  update(deltaTime) {
    this.x += this.vx * deltaTime;
    this.y += this.vy * deltaTime;
  }

  draw(ctx, offsetX, offsetY) {
    ctx.fillStyle = 'yellow';
    ctx.fillRect(
      Math.round(this.x - offsetX),
      Math.round(this.y - offsetY),
      this.size, this.size
    );
  }

  isOffScreen(mapWidth, mapHeight) {
    return (
      this.x < 0 ||
      this.y < 0 ||
      this.x > mapWidth ||
      this.y > mapHeight
    );
  }

  getBoundingBox() {
    return { x: this.x, y: this.y, width: this.size, height: this.size };
  }
}
