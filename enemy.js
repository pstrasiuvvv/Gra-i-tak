import { CONFIG } from './config.js';

export class Enemy {
  constructor(image, x, y) {
    this.spriteImage = image;
    this.width = CONFIG.ENEMY.WIDTH * CONFIG.ENEMY.SCALE;
    this.height = CONFIG.ENEMY.HEIGHT * CONFIG.ENEMY.SCALE;
    this.x = x;
    this.y = y;
    this.speed = CONFIG.ENEMY.SPEED_MIN + Math.random() * (CONFIG.ENEMY.SPEED_MAX - CONFIG.ENEMY.SPEED_MIN);
    this.frameX = 0;
    this.frameTimer = 0;
    this.frameInterval = 400;
    this.alive = true;
  }

  update(deltaTime, mapWidth, mapHeight, playerX, playerY) {
    const dx = playerX - this.x;
    const dy = playerY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 0) {
      const vx = (dx / dist) * this.speed;
      const vy = (dy / dist) * this.speed;
      let newX = this.x + vx * deltaTime;
      let newY = this.y + vy * deltaTime;
      newX = Math.max(0, Math.min(newX, mapWidth - this.width));
      newY = Math.max(0, Math.min(newY, mapHeight - this.height));
      this.x = newX; this.y = newY;
    }
    this.frameTimer += deltaTime * 1000;
    if (this.frameTimer > this.frameInterval) {
      this.frameTimer = 0;
      this.frameX = (this.frameX + 1) % 2;
    }
  }

  draw(ctx, offsetX, offsetY) {
    ctx.drawImage(
      this.spriteImage,
      this.frameX * CONFIG.ENEMY.WIDTH, 0,
      CONFIG.ENEMY.WIDTH, CONFIG.ENEMY.HEIGHT,
      Math.round(this.x - offsetX),
      Math.round(this.y - offsetY),
      this.width, this.height
    );
  }

  getBoundingBox() {
    const hitboxW = this.width * CONFIG.ENEMY.HITBOX;
    const hitboxH = this.height * CONFIG.ENEMY.HITBOX;
    return {
      x: this.x + (this.width - hitboxW) / 2,
      y: this.y + (this.height - hitboxH) / 2,
      width: hitboxW,
      height: hitboxH
    };
  }
}
